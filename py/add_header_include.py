import os
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import shutil

def download_image(url, path):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            response.raw.decode_content = True
            with open(path, 'wb') as out_file:
                shutil.copyfileobj(response.raw, out_file)
            return path
        else:
            print(f"Failed to download image from {url}: Status code {response.status_code}")
    except Exception as e:
        print(f"Failed to download image from {url}: {e}")
    return None

def resize_image(path, sizes):
    try:
        img = Image.open(path)
        for size in sizes:
            img.thumbnail(size, Image.ANTIALIAS)
            img.save(f"{os.path.splitext(path)[0]}_{size[0]}x{size[1]}.png")
    except Exception as e:
        print(f"Failed to resize image {path}: {e}")

def process_images(soup, base_directory):
    for img_tag in soup.find_all('img'):
        img_src = img_tag.get('src')
        if img_src:
            img_name = os.path.basename(img_src)
            img_path = os.path.join(base_directory, 'assets', 'downloaded', img_name)
            if not os.path.exists(img_path):
                img_path = download_image(img_src, img_path)
                if img_path and not img_path.endswith('.svg'):  # Only resize if not an SVG
                    resize_image(img_path, [(16, 16), (32, 32), (128, 128)])
            if img_path:
                img_tag['src'] = os.path.relpath(img_path, base_directory)
            else:
                print(f"Image {img_src} could not be processed. Please check the URL or provide a valid image.")

def update_html_files_with_header(header_file, base_directory):
    with open(header_file, 'r', encoding='utf-8') as file:
        header_content = file.read()

    for root, dirs, files in os.walk(base_directory):
        for filename in files:
            if filename.endswith('.html') and filename != 'header.html':
                filepath = os.path.join(root, filename)

                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()

                soup = BeautifulSoup(content, 'html.parser')
                process_images(soup, base_directory)

                new_header = BeautifulSoup(header_content, 'html.parser')
                old_header = soup.find('header')
                if old_header:
                    old_header.replace_with(new_header)
                else:
                    body = soup.find('body')
                    if body:
                        body.insert(0, new_header)

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(str(soup))

                print(f'Updated {filepath}')

def remove_include_directives(base_directory):
    for root, dirs, files in os.walk(base_directory):
        for filename in files:
            if filename.endswith('.html'):
                filepath = os.path.join(root, filename)

                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.readlines()

                new_content = []
                for line in content:
                    if "@@include('partials/header.html')" not in line:
                        new_content.append(line)

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.writelines(new_content)

                print(f'Removed include directive from {filepath}')

def add_assets_to_html_files(base_directory, css_files, js_files):
    for root, dirs, files in os.walk(base_directory):
        for filename in files:
            if filename.endswith('.html'):
                filepath = os.path.join(root, filename)

                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()

                soup = BeautifulSoup(content, 'html.parser')

                # Add CSS links
                head = soup.find('head')
                if head:
                    for css_file in css_files:
                        link_tag = soup.new_tag('link', rel='stylesheet', href=css_file)
                        head.append(link_tag)

                # Add JS scripts
                body = soup.find('body')
                if body:
                    for js_file in js_files:
                        script_tag = soup.new_tag('script', src=js_file)
                        body.append(script_tag)

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(str(soup))

                print(f'Added assets to {filepath}')

# Update the base_directory with the path to your project's root directory
base_directory = './'
header_file = os.path.join(base_directory, 'partials', 'header.html')
css_files = ['./css/main.css', './css/header.css', './css/footer.css', './css/sidebar.css', './css/forms.css']
js_files = ['./js/include-header.js', './js/partnerSearchFilter.js', './js/partnerFilter.js', './js/mobileDropdown.js', './js/main.js', './js/formHandler.js', './js/combinedPartnerFilter.js']

# Remove include directives
remove_include_directives(base_directory)

# Update HTML files with the header
update_html_files_with_header(header_file, base_directory)

# Add CSS and JS assets to HTML files
add_assets_to_html_files(base_directory, css_files, js_files)

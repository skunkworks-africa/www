import os
import subprocess
from bs4 import BeautifulSoup

# Step 1: Clone the GitHub repository
repo_url = "https://github.com/skunkworksza/web.git"
local_dir = "web_repo"

if os.path.exists(local_dir):
    print(f"Directory '{local_dir}' already exists. Pulling latest changes...")
    subprocess.run(["git", "-C", local_dir, "pull"], check=True)
else:
    print(f"Cloning repository '{repo_url}' into '{local_dir}'...")
    subprocess.run(["git", "clone", repo_url, local_dir], check=True)

# Step 2: Analyze the repository
def analyze_repository(local_dir):
    html_files = []
    css_files = []
    js_files = []
    
    for root, dirs, files in os.walk(local_dir):
        for file in files:
            if file.endswith(".html"):
                html_files.append(os.path.join(root, file))
            elif file.endswith(".css"):
                css_files.append(os.path.join(root, file))
            elif file.endswith(".js"):
                js_files.append(os.path.join(root, file))
    
    return html_files, css_files, js_files

html_files, css_files, js_files = analyze_repository(local_dir)

# Step 3: Extract common components from HTML files
def extract_common_components(html_files):
    common_header = ""
    common_footer = ""
    common_nav = ""
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as file:
            soup = BeautifulSoup(file, 'html.parser')
            if not common_header:
                header = soup.find('header')
                if header:
                    common_header = str(header)
            if not common_footer:
                footer = soup.find('footer')
                if footer:
                    common_footer = str(footer)
            if not common_nav:
                nav = soup.find('nav')
                if nav:
                    common_nav = str(nav)
    
    return common_header, common_footer, common_nav

common_header, common_footer, common_nav = extract_common_components(html_files)

# Step 4: Generate HTML Page Template
def generate_html_template(output_file, header, footer, nav, css_files, js_files):
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write('<!DOCTYPE html>\n')
        file.write('<html lang="en">\n')
        file.write('<head>\n')
        file.write('    <meta charset="UTF-8">\n')
        file.write('    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
        for css_file in css_files:
            rel_path = os.path.relpath(css_file, local_dir)
            file.write(f'    <link rel="stylesheet" href="{rel_path}">\n')
        file.write('    <title>New Page</title>\n')
        file.write('</head>\n')
        file.write('<body>\n')
        file.write(header)
        file.write(nav)
        file.write('<main>\n')
        file.write('    <!-- Main content goes here -->\n')
        file.write('</main>\n')
        file.write(footer)
        for js_file in js_files:
            rel_path = os.path.relpath(js_file, local_dir)
            file.write(f'    <script src="{rel_path}"></script>\n')
        file.write('</body>\n')
        file.write('</html>\n')

output_file = "new_page_template.html"
generate_html_template(output_file, common_header, common_footer, common_nav, css_files, js_files)

print(f"HTML template generated: {output_file}")

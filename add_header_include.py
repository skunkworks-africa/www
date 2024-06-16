import os
import shutil

def update_html_files_with_header(header_file, base_directory):
    # Read the content of the header file
    with open(header_file, 'r', encoding='utf-8') as file:
        header_content = file.read()

    # Loop through all directories and files in the base directory
    for root, dirs, files in os.walk(base_directory):
        for filename in files:
            if filename.endswith('.html') and filename != 'header.html':
                filepath = os.path.join(root, filename)

                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.readlines()

                # Remove the @@include directive and find the location to insert the header
                new_content = []
                include_found = False
                for line in content:
                    if '@@include(\'partials/header.html\')' in line:
                        include_found = True
                        new_content.append(header_content + '\n')
                    else:
                        new_content.append(line)

                # Write the updated content back to the file
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.writelines(new_content)

                print(f'Updated {filepath}')

def check_partner_logos(base_directory, partners_dir):
    # List of required logo dimensions
    dimensions = {
        'favicon': (16, 16),
        'logo': (100, 100),
        'badge': (200, 200)
    }

    # Loop through all partners in the partners directory
    for partner in os.listdir(partners_dir):
        partner_path = os.path.join(partners_dir, partner)
        if os.path.isdir(partner_path):
            for size_name, size in dimensions.items():
                logo_path = os.path.join(partner_path, f'{partner}_{size_name}.png')
                if not os.path.exists(logo_path):
                    print(f'Logo {logo_path} is missing, generating placeholder...')
                    # Generate a placeholder image if the logo is missing
                    from PIL import Image, ImageDraw
                    img = Image.new('RGB', size, color='grey')
                    draw = ImageDraw.Draw(img)
                    draw.text((10, 10), f'{partner} {size_name}', fill='white')
                    img.save(logo_path)

# Update the base_directory with the path to your project's root directory
base_directory = './'
header_file = os.path.join(base_directory, 'partials/header.html')
partners_dir = os.path.join(base_directory, 'partners')

update_html_files_with_header(header_file, base_directory)
check_partner_logos(base_directory, partners_dir)

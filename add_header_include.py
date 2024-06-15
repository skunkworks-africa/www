import os

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

                # Find the location to insert the header
                new_content = []
                inside_header = False
                for line in content:
                    if '<header>' in line:
                        inside_header = True
                        new_content.append(header_content + '\n')
                    elif '</header>' in line:
                        inside_header = False
                        continue
                    elif not inside_header:
                        new_content.append(line)

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.writelines(new_content)

                print(f'Updated {filepath}')

# Update the base_directory with the path to your project's root directory
base_directory = './'
header_file = os.path.join(base_directory, 'partials/header.html')

update_html_files_with_header(header_file, base_directory)

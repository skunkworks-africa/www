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
                    content = file.read()

                # Remove existing header and @@include('partials/header.html')
                content = content.replace(header_content, '')
                content = content.replace("@@include('partials/header.html')", '')

                # Find the location to insert the new header
                header_start = content.find('<header>')
                header_end = content.find('</header>') + len('</header>')

                if header_start != -1 and header_end != -1:
                    # Remove the existing header
                    content = content[:header_start] + content[header_end:]

                # Insert the new header at the top of the body
                body_start = content.find('<body>') + len('<body>')
                new_content = content[:body_start] + '\n' + header_content + '\n' + content[body_start:]

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)

                print(f'Updated {filepath}')

# Update the base_directory with the path to your project's root directory
base_directory = './'
header_file = os.path.join(base_directory, 'partials/header.html')

update_html_files_with_header(header_file, base_directory)

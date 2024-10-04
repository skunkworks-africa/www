import os
import re

# Define the input and output file paths
consolidated_file = r'C:\www\js\consolidated.js'
directory = r'C:\www\js'

# Function to write content to a file
def write_to_file(filename, content):
    file_path = os.path.join(directory, filename)
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

# Initialize dictionaries to hold the separated content
categories = {
    'sidebar.js': '',
    'global-nav-menu-bar.js': '',
    'partnersearch.js': '',
    'main.js': '',
    'forms.js': '',
    'containers.js': '',
    'sections.js': '',
    'body.js': '',
    'header.js': '',
    'head.js': '',
    'footer.js': '',
    'call-to-action.js': ''
}

# Read the consolidated JavaScript file
with open(consolidated_file, 'r', encoding='utf-8') as file:
    content = file.read()

    # Logic to separate the content based on certain keywords or sections
    # Assuming that sections are marked with comments like `// sidebar.js`, `// global-nav-menu-bar.js`, etc.
    current_category = None
    for line in content.split('\n'):
        match = re.match(r'//\s*(.*\.js)', line)
        if match:
            current_category = match.group(1).strip()
        if current_category in categories:
            categories[current_category] += line + '\n'

# Write the separated content to their respective files
for filename, content in categories.items():
    write_to_file(filename, content)

# Remove the old consolidated.js file
os.remove(consolidated_file)

print(f"All .js sections have been separated into their respective files and {consolidated_file} has been removed.")

import os

def add_header_include(directory, header_file):
    # Traverse the directory tree
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".html"):
                filepath = os.path.join(root, filename)
                
                # Skip the header.html file
                if filepath == header_file:
                    continue
                
                # Read the content of the HTML file
                with open(filepath, 'r', encoding='utf-8') as file:
                    lines = file.readlines()
                
                # Check if the header include line is already present
                include_line = "@@include('partials/header.html')"
                if any(include_line in line for line in lines):
                    print(f"'header.html' include already present in {filepath}")
                    continue
                
                # Find the index of the <body> tag
                body_index = -1
                for i, line in enumerate(lines):
                    if "<body>" in line:
                        body_index = i
                        break
                
                # If <body> tag is found, insert the include line
                if body_index != -1:
                    lines.insert(body_index + 1, f"    {include_line}\n")
                    # Write the modified content back to the HTML file
                    with open(filepath, 'w', encoding='utf-8') as file:
                        file.writelines(lines)
                    print(f"Added 'header.html' include to {filepath}")
                else:
                    print(f"<body> tag not found in {filepath}")

# Set the directory where your HTML files are located
html_directory = "./"
header_filepath = os.path.join(html_directory, "partials/header.html")

add_header_include(html_directory, header_filepath)

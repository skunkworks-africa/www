import os

def add_assets_to_html(directory, css_directory, js_directory):
    css_files = [f for f in os.listdir(css_directory) if f.endswith('.css')]
    js_files = [f for f in os.listdir(js_directory) if f.endswith('.js')]
    
    css_links = [f'<link rel="stylesheet" href="./css/{css_file}">\n' for css_file in css_files]
    js_scripts = [f'<script src="./js/{js_file}"></script>\n' for js_file in js_files]

    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".html"):
                filepath = os.path.join(root, filename)

                with open(filepath, 'r', encoding='utf-8') as file:
                    lines = file.readlines()
                
                # Add CSS links before the closing </head> tag if not already present
                head_index = next((i for i, line in enumerate(lines) if '</head>' in line.lower()), None)
                if head_index is not None:
                    for css_link in css_links:
                        if css_link not in lines:
                            lines.insert(head_index, css_link)
                    head_index += len(css_links)  # Update head_index after insertion
                
                # Add JS scripts before the closing </body> tag if not already present
                body_index = next((i for i, line in enumerate(lines) if '</body>' in line.lower()), None)
                if body_index is not None:
                    for js_script in js_scripts:
                        if js_script not in lines:
                            lines.insert(body_index, js_script)
                
                # Write the modified content back to the HTML file
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.writelines(lines)
                
                print(f"Updated assets in {filepath}")

# Set the directories where your HTML, CSS, and JS files are located
html_directory = "./"
css_directory = os.path.join(html_directory, "css")
js_directory = os.path.join(html_directory, "js")

add_assets_to_html(html_directory, css_directory, js_directory)

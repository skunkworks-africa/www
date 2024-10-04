import os

# Define the directory containing the .js files
directory = "C:\\www\\js"

# Define the output file path
output_file = os.path.join(directory, "consolidated.js")

# Open the output file in write mode
with open(output_file, 'w', encoding='utf-8') as outfile:
    # Loop through all files in the directory
    for filename in os.listdir(directory):
        # Check if the file has a .js extension and is not the consolidated file
        if filename.endswith(".js") and filename != "consolidated.js":
            file_path = os.path.join(directory, filename)
            # Open each .js file in read mode with a more forgiving encoding
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    # Write the contents of the .js file to the output file
                    outfile.write(f"// {filename}\n")
                    outfile.write(infile.read())
                    outfile.write("\n\n")
            except UnicodeDecodeError:
                with open(file_path, 'r', encoding='latin-1') as infile:
                    # Write the contents of the .js file to the output file
                    outfile.write(f"// {filename}\n")
                    outfile.write(infile.read())
                    outfile.write("\n\n")
            # Remove the file after it has been consolidated
            os.remove(file_path)

print(f"All .js files have been consolidated into {output_file}")

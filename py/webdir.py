import os
import shutil

# Define the root directory
root_dir = os.path.abspath("C:\\web\\web_repo")  # Adjust this path if needed

# Function to create index.html if it doesn't exist
def create_index_file(directory):
    index_file = os.path.join(directory, 'index.html')
    if not os.path.exists(index_file):
        with open(index_file, 'w') as file:
            file.write("<html>\n<head>\n<title>Index</title>\n</head>\n<body>\n<h1>Index of " + directory + "</h1>\n</body>\n</html>")

# Function to move files to appropriate folders
def move_files():
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip the .git directory
        if '.git' in dirnames:
            dirnames.remove('.git')
        
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            file_extension = os.path.splitext(file)[1].lower()
            new_dir = os.path.join(root_dir, file_extension[1:])  # Create directory based on file extension
            
            if not os.path.exists(new_dir):
                os.makedirs(new_dir)
            
            new_file_path = os.path.join(new_dir, file.lower())  # Rename file to lowercase
            
            if os.path.exists(new_file_path):
                print(f"File {new_file_path} already exists. Skipping move.")
                continue
            
            try:
                print(f"Moving {file_path} to {new_file_path}")
                shutil.move(file_path, new_file_path)
            except Exception as e:
                print(f"Error moving {file_path} to {new_file_path}: {e}")

# Function to update file contents with new paths
def update_file_contents():
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip the .git directory
        if '.git' in dirnames:
            dirnames.remove('.git')
        
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace(dirpath, os.path.join(root_dir, os.path.splitext(file)[1][1:]))
                
                if new_content != content:
                    print(f"Changes detected in {file_path}. New content will be:\n{new_content[:500]}...")
                    confirm = input("Do you want to apply these changes? (y/n): ")
                    if confirm.lower() == 'y':
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
            except Exception as e:
                print(f"Error updating contents of {file_path}: {e}")

# Function to rename directories and files to lowercase
def rename_to_lowercase():
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
        for name in filenames:
            old_path = os.path.join(dirpath, name)
            new_path = os.path.join(dirpath, name.lower())
            if old_path != new_path:
                if os.path.exists(new_path):
                    print(f"File {new_path} already exists. Skipping rename.")
                    continue
                print(f"Renaming {old_path} to {new_path}")
                os.rename(old_path, new_path)
        
        for name in dirnames:
            old_path = os.path.join(dirpath, name)
            new_path = os.path.join(dirpath, name.lower())
            if old_path != new_path:
                if os.path.exists(new_path):
                    print(f"Directory {new_path} already exists. Skipping rename.")
                    continue
                print(f"Renaming {old_path} to {new_path}")
                os.rename(old_path, new_path)

# Main function to reorganize the directory
def reorganize_directory():
    rename_to_lowercase()
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip the .git directory
        if '.git' in dirnames:
            dirnames.remove('.git')
        
        for dirname in dirnames:
            dir_path = os.path.join(dirpath, dirname)
            create_index_file(dir_path)
    
    move_files()
    update_file_contents()

# Run the script
if __name__ == "__main__":
    reorganize_directory()
    print("Directory reorganization complete.")

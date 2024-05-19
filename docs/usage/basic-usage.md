
4. **`docs/usage/basic-usage.md`** - Instructions for basic usage.

```markdown
# Basic Usage

This section explains how to perform basic operations with Skunkworks Academy.

## Creating a New Page

To create a new page, add an HTML file in the `pages/` directory. For example, to create an "About Us" page:

1. Create a file named `about-us.html` in the `pages/` directory.
2. Add the following content:

    ```html
    ---
    layout: default
    title: About Us
    ---

    <h1>About Us</h1>
    <p>Welcome to Skunkworks Academy!</p>
    ```

3. Save the file and rebuild the site:

    ```sh
    bundle exec jekyll build
    ```

## Adding a New Course

To add a new course, create a new HTML file in the `pages/courses/` directory and follow the same steps as creating a new page.

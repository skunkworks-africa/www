# Advanced Usage

This section covers more advanced features and customizations.

## Customizing the Theme

You can customize the theme by modifying the CSS files located in the `css/` directory.

### Changing Colors

To change the primary color:

1. Open `css/main.css`.
2. Modify the `--primary-color` variable:

    ```css
    :root {
        --primary-color: #0043ce; /* Change to your desired color */
    }
    ```

### Adding Custom JavaScript

To add custom JavaScript:

1. Open `js/script.js`.
2. Add your custom JavaScript code.

    ```javascript
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Custom JavaScript loaded!');
    });
    ```

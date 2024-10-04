document.addEventListener('DOMContentLoaded', function () {
    // Define the base URL for fetching the icons
    const baseURL = 'https://raw.githubusercontent.com/skunkworksza/www/dc3276070f277756eceb712d3027dd8ba85ecccb/assets/icons/';

    // Define the icons to be used and their corresponding classes or ids
    const icons = {
        'accelerated-computing.svg': 'icon-computing',
        'ai--transparency.svg': 'icon-ai',
        'analyze.svg': 'icon-analyze',
        'blockchain.svg': 'icon-blockchain',
        // Add more mappings here as needed
    };

    // Function to add icons to the page
    function addIcons() {
        for (const [filename, className] of Object.entries(icons)) {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(element => {
                const img = document.createElement('img');
                img.src = `${baseURL}${filename}`;
                img.alt = className;
                img.classList.add('icon');
                element.appendChild(img);
            });
        }
    }

    // Call the function to add icons
    addIcons();
});

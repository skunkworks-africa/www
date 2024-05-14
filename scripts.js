document.addEventListener('DOMContentLoaded', () => {
    const progress = document.querySelector('.progress');
    const progressText = document.querySelector('#progress h2');
    
    // Update progress dynamically
    function updateProgress(percent) {
        progress.style.width = `${percent}%`;
        progressText.textContent = `Current Progress: ${percent}%`;
    }

    // Example: Update progress to 20%
    updateProgress(20);
});

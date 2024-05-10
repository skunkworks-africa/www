// Add this to your script.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#registration-form');
    
    registerForm.addEventListener('submit', (event) => {
        // Prevent default form submission
        event.preventDefault();
        
        // Perform client-side validation
        if (validateForm()) {
            // If validation passes, proceed with form submission
            registerForm.submit();
        } else {
            // Show an error message or highlight invalid fields
            alert('Please fill out all fields correctly.');
        }
    });

    function validateForm() {
        // Example validation logic
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirm-password').value;
        const terms = document.querySelector('#terms').checked;

        // Simple validation checks
        const isEmailValid = email.includes('@');
        const isPasswordValid = password.length >= 8;
        const isPasswordConfirmed = password === confirmPassword;
        const isTermsChecked = terms;

        return isEmailValid && isPasswordValid && isPasswordConfirmed && isTermsChecked;
    }
});
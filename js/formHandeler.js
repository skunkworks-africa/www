document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect the form data
        const formData = new FormData(form);

        // Convert the form data to a JSON object
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Send the form data to the backend endpoint
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Your message has been sent successfully!');
            form.reset(); // Reset the form after successful submission
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was an error sending your message. Please try again.');
        });
    });
});

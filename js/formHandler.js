document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        number: formData.get('number'),
        message: formData.get('message')
    };

    fetch('https://github.skunkworks.africa/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Your message has been sent successfully!');
    })
    .catch(error => {
        alert('There was an error sending your message.');
    });
});

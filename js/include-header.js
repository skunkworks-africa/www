function includeHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => console.error('Error fetching header:', error));
}

document.addEventListener('DOMContentLoaded', includeHeader);

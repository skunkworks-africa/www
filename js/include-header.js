function includeHeader() {
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-container').innerHTML = data;

      // Add burger menu functionality
      const burgerMenu = document.querySelector('.burger-menu');
      const header = document.querySelector('.header');

      burgerMenu.addEventListener('click', function () {
        header.classList.toggle('open');
      });
    })
    .catch(error => console.error('Error fetching header:', error));
}

document.addEventListener('DOMContentLoaded', includeHeader);

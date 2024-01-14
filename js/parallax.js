/* parallax.js */

// Add the parallax effect to elements with class 'parallax'
window.addEventListener('scroll', function () {
    let elements = document.querySelectorAll('.parallax');
    elements.forEach(function (element) {
        let parallaxValue = window.scrollY * 0.5; // Adjust the parallax effect speed
        element.style.transform = 'translateY(' + parallaxValue + 'px)';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var dropdowns = document.querySelectorAll('nav ul li');
    dropdowns.forEach(function(dropdown) {
        dropdown.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                var submenu = this.querySelector('ul');
                if (submenu) {
                    event.preventDefault();
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                }
            }
        });
    });
});

function filterPartners() {
    var input = document.getElementById('partnerSearch');
    var filter = input.value.toLowerCase();
    var nodes = document.getElementsByClassName('partner-item');

    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].innerText.toLowerCase().includes(filter)) {
            nodes[i].style.display = "block";
        } else {
            nodes[i].style.display = "none";
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('partnerSearch');
    if (input) {
        input.addEventListener('keyup', filterPartners);
    }
});

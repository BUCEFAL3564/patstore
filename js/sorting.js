// ========== SORTING LOGIC ==========
let currentSort = 'name-asc';

document.addEventListener('DOMContentLoaded', () => {
    const sortButton = document.getElementById('sortButton');
    const sortMenu = document.getElementById('sortMenu');
    const sortButtonText = document.getElementById('sortButtonText');
    const dropdown = document.querySelector('.sort-dropdown');


    sortButton.addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });


    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });


    sortMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('sort-option')) {
            const value = e.target.dataset.sort;
            const text = e.target.textContent;

            currentSort = value;
            sortButtonText.textContent = text;


            sortMenu.querySelectorAll('.sort-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');

            dropdown.classList.remove('open');


            sortProducts(value);
        }
    });
});

// ========== SORT PRODUCTS ==========
function sortProducts(sortType) {
    switch (sortType) {
        case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
    }
    renderProducts();
}
// ========== SORTING (sort_by + order → параметры запроса к API) ==========
const SORT_OPTIONS = {
    'name-asc': { sort_by: 'title', order: 'asc' },
    'name-desc': { sort_by: 'title', order: 'desc' },
    'price-asc': { sort_by: 'price', order: 'asc' },
    'price-desc': { sort_by: 'price', order: 'desc' },
};

document.addEventListener('DOMContentLoaded', () => {
    const sortButton = document.getElementById('sortButton');
    const sortMenu = document.getElementById('sortMenu');
    const sortButtonText = document.getElementById('sortButtonText');
    const dropdown = document.querySelector('.sort-dropdown');
    if (!sortButton || !sortMenu || !dropdown) return;

    const markActive = (option) => {
        sortMenu.querySelectorAll('.sort-option').forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
        sortButtonText.textContent = option.textContent;
    };

    // Выбранная сортировка из адресной строки
    const currentKey = Object.keys(SORT_OPTIONS).find((key) =>
        SORT_OPTIONS[key].sort_by === catalogState.sort_by && SORT_OPTIONS[key].order === catalogState.order);
    const currentOption = sortMenu.querySelector(`[data-sort="${currentKey}"]`);
    if (currentOption) markActive(currentOption);

    sortButton.addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    sortMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.sort-option');
        if (!option) return;

        markActive(option);
        dropdown.classList.remove('open');
        updateCatalog(SORT_OPTIONS[option.dataset.sort]);
    });
});

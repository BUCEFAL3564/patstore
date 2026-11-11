document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('productGrid')) return;

    // ===== RATING CHECKBOXES =====
    const ratingCheckboxes = document.querySelectorAll('.checkbox-input');

    ratingCheckboxes.forEach((checkbox) => {
        checkbox.checked = catalogState.min_rating !== undefined && Number(checkbox.value) === catalogState.min_rating;

        checkbox.addEventListener('change', () => {
            const checked = [...ratingCheckboxes].filter((cb) => cb.checked).map((cb) => Number(cb.value));
            updateCatalog({ min_rating: checked.length ? Math.min(...checked) : undefined });
        });
    });

    // ===== PRICE INPUTS =====
    const minInput = document.querySelector('.price-field:first-of-type .price-input');
    const maxInput = document.querySelector('.price-field:last-of-type .price-input');
    if (!minInput || !maxInput) return;

    if (catalogState.min_price !== undefined) minInput.value = catalogState.min_price;
    if (catalogState.max_price !== undefined) maxInput.value = catalogState.max_price;

    const readPrice = (input) => (input.value.trim() === '' ? undefined : Number(input.value));

    let timer;
    const onPriceInput = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const min = readPrice(minInput);
            const max = readPrice(maxInput);
            const invalid = (v) => v !== undefined && (Number.isNaN(v) || v < 0);
            const reversed = min !== undefined && max !== undefined && min > max;

            minInput.classList.toggle('is-invalid', invalid(min) || reversed);
            maxInput.classList.toggle('is-invalid', invalid(max) || reversed);
            if (invalid(min) || invalid(max) || reversed) return;

            if (min !== catalogState.min_price || max !== catalogState.max_price) {
                updateCatalog({ min_price: min, max_price: max });
            }
        }, 400);
    };

    minInput.addEventListener('input', onPriceInput);
    maxInput.addEventListener('input', onPriceInput);
});

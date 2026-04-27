// ========== FILTERS LOGIC ==========
let activeRatingFilters = [];
let priceMin = 0;
let priceMax = 100;

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== RATING CHECKBOXES =====
    const ratingCheckboxes = document.querySelectorAll('.checkbox-input');
    
    ratingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            activeRatingFilters = [];
            ratingCheckboxes.forEach(cb => {
                if (cb.checked) {
                    activeRatingFilters.push(parseInt(cb.value));
                }
            });
            applyFilters();
        });
    });
    
    // ===== PRICE INPUTS =====
    const minInput = document.querySelector('.price-field:first-child .price-input');
    const maxInput = document.querySelector('.price-field:last-child .price-input');
    
    if (minInput) {
        minInput.addEventListener('input', () => {
            priceMin = parseFloat(minInput.value) || 0;
            applyFilters();
        });
    }
    
    if (maxInput) {
        maxInput.addEventListener('input', () => {
            priceMax = parseFloat(maxInput.value) || 100;
            applyFilters();
        });
    }
});

// ========== APPLY FILTERS ==========
function applyFilters() {
    let filteredProducts = [...products];
    
    // Фильтр по рейтингу
    if (activeRatingFilters.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            return activeRatingFilters.some(rating => product.rating >= rating);
        });
    }
    
    // Фильтр по цене
    filteredProducts = filteredProducts.filter(product => {
        return product.price >= priceMin && product.price <= priceMax;
    });
    
    // Обновить счётчик
    const countEl = document.querySelector('.product-count');
    if (countEl) {
        countEl.textContent = `${filteredProducts.length} products`;
    }
    
    // Отрисовать отфильтрованные товары
    renderFilteredProducts(filteredProducts);
}

// ========== RENDER FILTERED PRODUCTS ==========
function renderFilteredProducts(filteredProducts) {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = filteredProducts.map(product => `
        <a href="product.html?id=${product.id}" class="product-card">
            <div class="product-overlay">
                <div class="product-overlay-inner">
                    <span class="overlay-name">${product.name}</span>
                    <div class="overlay-rating-row">
                        <div class="overlay-stars">
                            ${renderStars(product.rating)}
                        </div>
                        <span class="overlay-rating-number">${product.rating}</span>
                    </div>
                    <div class="overlay-bottom">
                        <span class="overlay-price">$${product.price.toFixed(2)}</span>
                        <button class="overlay-cart-btn" aria-label="Add to cart" onclick="event.preventDefault(); addToCart(products.find(p => p.id === ${product.id}))">
                            <span class="cart-icon-overlay">
                                <span class="cart-body-overlay"></span>
                                <span class="cart-wheel-overlay cart-wheel-1-overlay"></span>
                                <span class="cart-wheel-overlay cart-wheel-2-overlay"></span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="product-image-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <span class="product-price-badge">$${product.price.toFixed(2)}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating-row">
                    <div class="product-stars">
                        ${renderStars(product.rating)}
                    </div>
                    <span class="product-rating-number">${product.rating}</span>
                </div>
            </div>
        </a>
    `).join('');
}
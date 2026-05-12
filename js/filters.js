// ========== FILTERS LOGIC ==========
let activeRatingFilters = [];
let activePlatformFilters = [];
let priceMin = 0;
let priceMax = 100;

document.addEventListener('DOMContentLoaded', async () => {
    
    // ===== ЗАГРУЖАЕМ ПЛАТФОРМЫ =====
    try {
        const res = await fetch('api/getPlatforms.php');
        const platforms = await res.json();
        
        const container = document.getElementById('platformFilters');
        if (container) {
            container.innerHTML = platforms.map(p => `
                <label class="checkbox-row">
                    <input type="checkbox" class="platform-input" value="${p.id}">
                    <span class="checkbox-box"></span>
                    <span class="checkbox-text">${p.name}</span>
                </label>
            `).join('');
        }
    } catch (err) {}
    
    // ===== RATING CHECKBOXES =====
    const ratingCheckboxes = document.querySelectorAll('.checkbox-input');
    
    ratingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            activeRatingFilters = [];
            ratingCheckboxes.forEach(cb => {
                if (cb.checked) activeRatingFilters.push(parseInt(cb.value));
            });
            applyFiltersSQL();
        });
    });
    
    // ===== PLATFORM CHECKBOXES =====
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('platform-input')) {
            activePlatformFilters = [];
            document.querySelectorAll('.platform-input:checked').forEach(cb => {
                activePlatformFilters.push(cb.value);
            });
            applyFiltersSQL();
        }
    });
    
    // ===== PRICE INPUTS =====
    const minInput = document.querySelector('.price-field:first-child .price-input');
    const maxInput = document.querySelector('.price-field:last-child .price-input');
    
    if (minInput) {
        minInput.addEventListener('input', () => {
            priceMin = parseFloat(minInput.value) || 0;
            applyFiltersSQL();
        });
    }
    
    if (maxInput) {
        maxInput.addEventListener('input', () => {
            priceMax = parseFloat(maxInput.value) || 100;
            applyFiltersSQL();
        });
    }
});

// ========== ПРИМЕНИТЬ ФИЛЬТРЫ ЧЕРЕЗ SQL ==========
async function applyFiltersSQL() {
    const params = new URLSearchParams();
    
    if (activeRatingFilters.length > 0) {
        params.set('rating', activeRatingFilters.join(','));
    }
    if (activePlatformFilters.length > 0) {
        params.set('platforms', activePlatformFilters.join(','));
    }
    params.set('min_price', priceMin);
    params.set('max_price', priceMax);
    
    try {
        const res = await fetch(`api/getGames.php?${params.toString()}`);
        const games = await res.json();
        
        // Преобразуем в формат products
        products = games.map(g => ({
            id: g.id,
            name: g.title,
            price: g.discount_price || g.price,
            rating: g.rating,
            category: g.platform || g.category || 'Игры',
            image: g.image,
            highlights: [],
            description: g.description || '',
            specs: []
        }));
        
        const countEl = document.querySelector('.product-count');
        if (countEl) countEl.textContent = `${products.length} игр`;
        
        renderProducts();
    } catch (err) {
        console.error('Ошибка фильтрации:', err);
    }
}

// Старая функция applyFilters оставлена для совместимости
function applyFilters() {
    applyFiltersSQL();
}

function renderFilteredProducts(filteredProducts) {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = filteredProducts.map(product => `
        <a href="product.html?id=${product.id}" class="product-card">
            <div class="product-overlay">
                <div class="product-overlay-inner">
                    <span class="overlay-name">${product.name}</span>
                    <div class="overlay-rating-row">
                        <div class="overlay-stars">${renderStars(product.rating)}</div>
                        <span class="overlay-rating-number">${product.rating}</span>
                    </div>
                    <div class="overlay-bottom">
                        <span class="overlay-price">$${product.price.toFixed(2)}</span>
                        <button class="overlay-cart-btn" onclick="event.preventDefault(); addToCart(products.find(p => p.id === ${product.id}))">
                            <img src="assets/icons/basket.svg" alt="Корзина" class="overlay-cart-icon">
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
                    <div class="product-stars">${renderStars(product.rating)}</div>
                    <span class="product-rating-number">${product.rating}</span>
                </div>
            </div>
        </a>
    `).join('');
}
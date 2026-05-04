// ========== ЗАГРУЗКА ИГР С СЕРВЕРА ==========
let products = [];

async function loadProducts() {
    try {
        const response = await fetch('api/getGames.php');
        const data = await response.json();
        
        products = data.map(game => ({
            id: game.id,
            name: game.title,
            price: game.discount_price || game.price,
            rating: game.rating,
            category: game.categories ? game.categories.split(', ')[0] : 'Игры',
            highlights: [],
            description: game.description || '',
            specs: [],
            image: game.image || `https://placehold.co/300x370/1E293B/F59E0B?text=Game`
        }));
        
        renderProducts();
        updateProductCount();
    } catch (error) {
        console.error('Ошибка загрузки игр:', error);
    }
}

// ========== RENDER STARS ==========
function renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;
        
        let fillColor = '#FFFFFF';
        let strokeColor = '#D1D5DC';
        
        if (filled) {
            fillColor = '#FDC700';
            strokeColor = '#FDC700';
        } else if (half) {
            fillColor = `url(#halfGrad${i})`;
            strokeColor = '#FDC700';
        }
        
        starsHTML += `
            <span class="star-icon">
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${half ? `
                    <defs>
                        <linearGradient id="halfGrad${i}">
                            <stop offset="50%" stop-color="#FDC700"/>
                            <stop offset="50%" stop-color="#FFFFFF"/>
                        </linearGradient>
                    </defs>
                    ` : ''}
                    <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.5L6 8.84L2.91 10.5L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                          fill="${fillColor}" 
                          stroke="${strokeColor}" 
                          stroke-width="1.17"
                          stroke-linejoin="round"/>
                </svg>
            </span>
        `;
    }
    return starsHTML;
}

// ========== RENDER PRODUCTS ==========
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
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
                            <img src="assets/icons/basket.svg" alt="Cart" class="overlay-cart-icon">
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

// ========== UPDATE PRODUCT COUNT ==========
function updateProductCount() {
    const countEl = document.querySelector('.product-count');
    if (countEl) {
        countEl.textContent = `${products.length} games`;
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', loadProducts);
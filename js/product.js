const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

const product = products.find(p => p.id === productId);

document.addEventListener('DOMContentLoaded', () => {
    
    if (product) {
     
        document.getElementById('breadcrumbProduct').textContent = product.name;
        document.getElementById('breadcrumbCategory').textContent = product.category;
        
        // Блок 1
        document.getElementById('productInfo').innerHTML = `
            <span class="product-category">${product.category}</span>
            <h1 class="product-title">${product.name}</h1>
            <div class="product-rating-block">
                <div class="product-stars-large">
                    ${renderLargeStars(product.rating)}
                </div>
                <span class="product-rating-text">${product.rating} out of 5 stars</span>
            </div>
            <p class="product-price-large">$${product.price.toFixed(2)}</p>
        `;
                // Блок 2
        if (product.highlights) {
            const highlightsHTML = product.highlights.map(h => `<li class="highlights-item">• ${h}</li>`).join('');
            document.getElementById('productHighlights').innerHTML = `
                <h3 class="highlights-heading">Key Highlights</h3>
                <ul class="highlights-list">
                    ${highlightsHTML}
                </ul>
            `;

        }
                // Блок 3
        if (product.description) {
            document.getElementById('productDescription').innerHTML = `
                <h3 class="description-heading">Description</h3>
                <p class="description-text">${product.description}</p>
            `;
        }
                // Блок 4 — Quantity
        let quantity = 1;
        const qtyValue = document.getElementById('qtyValue');
        
        document.getElementById('qtyMinus').addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                qtyValue.textContent = quantity;
            }
        });
        
        document.getElementById('qtyPlus').addEventListener('click', () => {
            if (quantity < 99) {
                quantity++;
                qtyValue.textContent = quantity;
            }
        });

                // Блок 5 — Add to Cart
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
        });
        // Блок 6 — Technical Specifications
        if (product.specs) {
            const specsHTML = product.specs.map(spec => `
                <div class="spec-card">
                    <div class="spec-card-icon">
                        <img src="assets/icons/exclamation-mark.svg" alt="">
                    </div>
                    <div class="spec-card-text">
                        <span class="spec-card-label">${spec.label}</span>
                        <span class="spec-card-value">${spec.value}</span>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('specsGrid').innerHTML = specsHTML;
        }
    }
});

function renderLargeStars(rating) {
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
            fillColor = `url(#halfGradLarge${i})`;
            strokeColor = '#FDC700';
        }
        
        starsHTML += `
            <span class="star-large">
                <svg viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${half ? `
                    <defs>
                        <linearGradient id="halfGradLarge${i}">
                            <stop offset="50%" stop-color="#FDC700"/>
                            <stop offset="50%" stop-color="#FFFFFF"/>
                        </linearGradient>
                    </defs>
                    ` : ''}
                    <path d="M8.5 1L10.245 5.13L14.5 5.635L11.5 8.07L12.09 11.5L8.5 9.84L4.91 11.5L5.5 8.07L2.5 5.635L6.755 5.13L8.5 1Z"
                          fill="${fillColor}" 
                          stroke="${strokeColor}" 
                          stroke-width="1.67"
                          stroke-linejoin="round"/>
                </svg>
            </span>
        `;
    }
    return starsHTML;
}
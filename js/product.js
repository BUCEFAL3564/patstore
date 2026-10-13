// ========== PRODUCT PAGE (GET /api/products/:id) ==========
const productId = Number(new URLSearchParams(window.location.search).get('id'));

async function loadProduct() {
    if (!Number.isInteger(productId) || productId < 1) {
        showProductMessage('Game not found');
        return;
    }

    try {
        const product = await api(`/products/${productId}`);
        renderProductPage(product);
        loadRelatedProducts(product);
    } catch (err) {
        showProductMessage(err.status === 404 ? 'Game not found' : `Could not load the game: ${err.userMessage}`);
    }
}

function showProductMessage(text) {
    document.querySelector('.product-container').innerHTML =
        `<p class="product-message">${escapeHtml(text)}</p><p class="product-message"><a href="index.html" class="product-back-link">← Back to catalog</a></p>`;
}

function renderProductPage(product) {
    const name = escapeHtml(product.title);
    const category = escapeHtml(product.category || 'Games');
    document.title = `KeyHub — ${product.title}`;
    document.getElementById('breadcrumbProduct').textContent = product.title;
    document.getElementById('breadcrumbCategory').textContent = product.category || 'Games';

    // Блок 1: название, рейтинг, цена
    document.getElementById('productInfo').innerHTML = `
        <span class="product-category">${escapeHtml(product.platform || product.category || 'Games')}</span>
        <h1 class="product-title">${name}</h1>
        <div class="product-rating-block">
            <div class="product-stars-large">${renderLargeStars(product.rating)}</div>
            <span class="product-rating-text">${product.rating} out of 5 stars</span>
        </div>
        <p class="product-price-large">${formatPrice(product.price)}</p>
    `;

    // Блок 3: описание
    if (product.description) {
        document.getElementById('productDescription').innerHTML = `
            <h3 class="description-heading">Description</h3>
            <p class="description-text">${escapeHtml(product.description)}</p>
        `;
    }

    // Блок 4: количество — не больше, чем на складе (и не больше 99 за раз)
    const maxQuantity = Math.min(99, product.stock_quantity);
    let quantity = 1;
    const qtyValue = document.getElementById('qtyValue');
    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (quantity > 1) { quantity--; qtyValue.textContent = quantity; }
    });
    document.getElementById('qtyPlus').addEventListener('click', () => {
        if (quantity < maxQuantity) { quantity++; qtyValue.textContent = quantity; }
    });

    // Блок 5: в корзину — один запрос с нужным количеством
    const addButton = document.getElementById('addToCartBtn');
    if (product.stock_quantity < 1) {
        addButton.disabled = true;
        addButton.querySelector('.add-to-cart-text').textContent = 'Out of Stock';
    } else {
        addButton.addEventListener('click', async () => {
            addButton.disabled = true;
            await addToCart(product.id, quantity, product.title);
            addButton.disabled = false;
        });
    }

    // Блок 6: характеристики из данных API
    const specs = [
        { label: 'Platform', value: product.platform || '—' },
        { label: 'Category', value: category },
        { label: 'Rating', value: `${product.rating} / 5` },
        { label: 'In Stock', value: product.stock_quantity > 0 ? `${product.stock_quantity} keys` : 'Out of stock' },
    ];
    document.getElementById('specsGrid').innerHTML = specs.map((spec) => `
        <div class="spec-card">
            <div class="spec-card-icon"><img src="assets/icons/exclamation-mark.svg" alt=""></div>
            <div class="spec-card-text">
                <span class="spec-card-label">${spec.label}</span>
                <span class="spec-card-value">${escapeHtml(spec.value)}</span>
            </div>
        </div>
    `).join('');

    renderSlider(product);
}

// ========== SLIDER (все картинки из images[], по ТЗ — минимум 3) ==========
function renderSlider(product) {
    const images = product.images.length ? product.images : ['https://placehold.co/600x600/1E293B/F59E0B?text=Game'];
    const totalSlides = images.length;
    let currentSlide = 0;
    const track = document.getElementById('sliderTrack');
    const dots = document.getElementById('sliderDots');

    track.innerHTML = images.map((src, i) =>
        `<div class="slider-slide"><img src="${escapeHtml(src)}" alt="${escapeHtml(product.title)} — image ${i + 1}"></div>`
    ).join('');
    dots.innerHTML = images.map((_, i) =>
        `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>`
    ).join('');

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        const slideWidth = track.querySelector('.slider-slide').offsetWidth;
        track.style.transform = `translateX(-${index * slideWidth}px)`;
        dots.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    document.getElementById('sliderPrev').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('sliderNext').addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.addEventListener('click', (e) => {
        if (e.target.classList.contains('slider-dot')) goToSlide(Number(e.target.dataset.index));
    });
    // После изменения ширины окна слайд должен остаться на месте
    window.addEventListener('resize', () => goToSlide(currentSlide));
}

// ========== RELATED PRODUCTS (та же категория, фильтр в БД) ==========
async function loadRelatedProducts(product) {
    if (!product.category) return;

    try {
        const data = await api(`/products?category=${encodeURIComponent(product.category)}&limit=5`);
        const related = data.items.filter((p) => p.id !== product.id).slice(0, 4);
        if (related.length === 0) return;

        document.getElementById('relatedProducts').innerHTML = `
            <h3 class="related-heading">Related Products</h3>
            <div class="related-grid">
                ${related.map((rp) => `
                    <a href="product.html?id=${rp.id}" class="related-card">
                        <div class="related-card-img">
                            <img src="${escapeHtml(rp.images[0] || '')}" alt="${escapeHtml(rp.title)}" loading="lazy">
                        </div>
                        <div class="related-card-info">
                            <span class="related-card-name">${escapeHtml(rp.title)}</span>
                            <div class="related-card-rating">
                                <div class="related-card-stars">${renderStars(rp.rating)}</div>
                                <span class="related-card-rating-num">${rp.rating}</span>
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    } catch {
        // Похожие товары — необязательный блок: если не загрузились, страница работает без них
    }
}

function renderLargeStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;
        let fillColor = '#FFFFFF', strokeColor = '#D1D5DC';
        if (filled) { fillColor = '#FDC700'; strokeColor = '#FDC700'; }
        else if (half) { fillColor = `url(#halfGradLarge${i})`; strokeColor = '#FDC700'; }
        starsHTML += `
            <span class="star-large">
                <svg viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${half ? `<defs><linearGradient id="halfGradLarge${i}"><stop offset="50%" stop-color="#FDC700"/><stop offset="50%" stop-color="#FFFFFF"/></linearGradient></defs>` : ''}
                    <path d="M8.5 1L10.245 5.13L14.5 5.635L11.5 8.07L12.09 11.5L8.5 9.84L4.91 11.5L5.5 8.07L2.5 5.635L6.755 5.13L8.5 1Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.67" stroke-linejoin="round"/>
                </svg>
            </span>`;
    }
    return starsHTML;
}

document.addEventListener('DOMContentLoaded', loadProduct);

const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

document.addEventListener('DOMContentLoaded', async () => {
    let product = null;
    
    if (typeof products !== 'undefined' && products.length > 0) {
        product = products.find(p => p.id === productId);
    }
    
    if (!product) {
        try {
            const res = await fetch(`api/getGame.php?id=${productId}`);
            const data = await res.json();
            
            if (data.error) {
                document.getElementById('productInfo').innerHTML = '<p style="color:white;padding:40px">Игра не найдена</p>';
                return;
            }
            
           product = {
                id: data.id,
                name: data.title,
                price: data.discount_price || data.price,
                rating: data.rating,
                category: data.platform || (data.categories ? data.categories[0] : 'Игры'),
                highlights: data.highlights || [],
                description: data.description || '',
                specs: data.specs || [],
                image: data.image || `https://placehold.co/600x600/1E293B/F59E0B?text=Game`,
                images: data.images || [data.image]
            };
        } catch (err) {
            console.error(err);
            document.getElementById('productInfo').innerHTML = '<p style="color:white;padding:40px">Ошибка загрузки</p>';
            return;
        }
    }
    
    renderProduct(product);
});

function renderProduct(product) {
    document.getElementById('breadcrumbProduct').textContent = product.name;
    document.getElementById('breadcrumbCategory').textContent = product.category;
    
    document.getElementById('productInfo').innerHTML = `
        <span class="product-category">${product.category}</span>
        <h1 class="product-title">${product.name}</h1>
        <div class="product-rating-block">
            <div class="product-stars-large">${renderLargeStars(product.rating)}</div>
            <span class="product-rating-text">${product.rating} out of 5 stars</span>
        </div>
        <p class="product-price-large">$${product.price.toFixed(2)}</p>
    `;
    
    if (product.highlights && product.highlights.length > 0) {
        document.getElementById('productHighlights').innerHTML = `
            <h3 class="highlights-heading">Key Highlights</h3>
            <ul class="highlights-list">
                ${product.highlights.map(h => `<li class="highlights-item">• ${h}</li>`).join('')}
            </ul>
        `;
    }
    
    if (product.description) {
        document.getElementById('productDescription').innerHTML = `
            <h3 class="description-heading">Description</h3>
            <p class="description-text">${product.description}</p>
        `;
    }
    
    let quantity = 1;
    const qtyValue = document.getElementById('qtyValue');
    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (quantity > 1) { quantity--; qtyValue.textContent = quantity; }
    });
    document.getElementById('qtyPlus').addEventListener('click', () => {
        if (quantity < 99) { quantity++; qtyValue.textContent = quantity; }
    });

    document.getElementById('addToCartBtn').addEventListener('click', () => {
        for (let i = 0; i < quantity; i++) addToCart(product);
    });
    
    if (product.specs && product.specs.length > 0) {
        document.getElementById('specsGrid').innerHTML = product.specs.map(spec => `
            <div class="spec-card">
                <div class="spec-card-icon"><img src="assets/icons/exclamation-mark.svg" alt=""></div>
                <div class="spec-card-text">
                    <span class="spec-card-label">${spec.label}</span>
                    <span class="spec-card-value">${spec.value}</span>
                </div>
            </div>
        `).join('');
    }
    
       const images = product.images || [product.image];
    const totalSlides = images.length;
    let currentSlide = 0;
    const track = document.getElementById('sliderTrack');
    const dots = document.getElementById('sliderDots');

    track.innerHTML = images.map(img => 
        `<div class="slider-slide"><img src="${img}" alt="${product.name}"></div>`
    ).join('');

    dots.innerHTML = images.map((_, i) => 
        `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
    ).join('');
    
    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        const slideWidth = track.querySelector('.slider-slide').offsetWidth;
        track.style.transform = `translateX(-${index * slideWidth}px)`;
        document.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    document.getElementById('sliderPrev').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('sliderNext').addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.addEventListener('click', (e) => {
        if (e.target.classList.contains('slider-dot')) goToSlide(parseInt(e.target.dataset.index));
    });
    
    if (typeof products !== 'undefined' && products.length > 0) {
        const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id);
        if (relatedProducts.length > 0) {
            document.getElementById('relatedProducts').innerHTML = `
                <h3 class="related-heading">Related Products</h3>
                <div class="related-grid">
                    ${relatedProducts.slice(0, 4).map(rp => `
                        <a href="product.html?id=${rp.id}" class="related-card">
                            <div class="related-card-img">
                                <img src="${rp.image}" alt="${rp.name}" loading="lazy">
                            </div>
                            <div class="related-card-info">
                                <span class="related-card-name">${rp.name}</span>
                                <div class="related-card-rating">
                                    <div class="related-card-stars">${renderStars(rp.rating)}</div>
                                    <span class="related-card-rating-num">${rp.rating}</span>
                                </div>
                            </div>
                        </a>
                    `).join('')}
                </div>
            `;
        }
    }
}

function renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;
        let fillColor = '#FFFFFF', strokeColor = '#D1D5DC';
        if (filled) { fillColor = '#FDC700'; strokeColor = '#FDC700'; }
        else if (half) { fillColor = `url(#halfGrad${i})`; strokeColor = '#FDC700'; }
        starsHTML += `
            <span class="star-icon">
                <svg viewBox="0 0 12 12" fill="none">
                    ${half ? `<defs><linearGradient id="halfGrad${i}"><stop offset="50%" stop-color="#FDC700"/><stop offset="50%" stop-color="#FFFFFF"/></linearGradient></defs>` : ''}
                    <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.5L6 8.84L2.91 10.5L3.5 7.07L1 4.635L4.455 4.13L6 1Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.17" stroke-linejoin="round"/>
                </svg>
            </span>`;
    }
    return starsHTML;
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
                <svg viewBox="0 0 17 16" fill="none">
                    ${half ? `<defs><linearGradient id="halfGradLarge${i}"><stop offset="50%" stop-color="#FDC700"/><stop offset="50%" stop-color="#FFFFFF"/></linearGradient></defs>` : ''}
                    <path d="M8.5 1L10.245 5.13L14.5 5.635L11.5 8.07L12.09 11.5L8.5 9.84L4.91 11.5L5.5 8.07L2.5 5.635L6.755 5.13L8.5 1Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.67" stroke-linejoin="round"/>
                </svg>
            </span>`;
    }
    return starsHTML;
}
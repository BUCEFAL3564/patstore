document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartContent = document.getElementById('cartContent');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cart || cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <p class="cart-empty-text">Your cart is empty.</p>
                <a href="index.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        document.getElementById('cartItemCount').textContent = '0 items';
        document.getElementById('shippingQualified').style.display = 'none';
        return;
    }
    
    cartSummary.style.display = 'block';
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartItemCount').textContent = 
        `${totalItems} ${totalItems === 1 ? 'item' : 'items'} ready for checkout`;
    document.getElementById('summaryItemCount').textContent = 
        `${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your bag`;
    
    // Товары
    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <a href="product.html?id=${item.id}" class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </a>
            <div class="cart-item-details">
                <div class="cart-item-info">
                    <a href="product.html?id=${item.id}" class="cart-item-name">${item.name}</a>
                    <p class="cart-item-category">${item.category || 'Pet Supplies'}</p>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
                    </button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                </div>
                <div class="cart-item-price-wrap">
                    <p class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</p>
                    <p class="cart-item-each">$${item.price.toFixed(2)} each</p>
                </div>
                <button class="cart-item-remove" onclick="removeItem(${item.id})" aria-label="Remove item">
                    <img src="assets/icons/trash-basket.svg" alt="Remove" class="remove-icon">
                </button>
            </div>
        </div>
    `).join('');
    
    // Суммы
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal >= 50 ? 0 : 5.99;
    
    document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${(subtotal + tax + shipping).toFixed(2)}`;
    
    // Qualified
    const qualifiedEl = document.getElementById('shippingQualified');
    if (subtotal >= 50) {
        qualifiedEl.textContent = '✓ Qualified!';
        qualifiedEl.style.color = '#00A63E';
    } else {
        const remaining = (50 - subtotal).toFixed(2);
        qualifiedEl.textContent = `$${remaining} away`;
        qualifiedEl.style.color = '#FF6900';
    }
}

function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartBadge();
        renderCart();
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartBadge();
    renderCart();
}

// ========== PROMO CODE ==========
document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.querySelector('.promo-apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyPromo);
    }
});

function applyPromo() {
    const input = document.querySelector('.promo-input');
    const code = input.value.trim().toUpperCase();
    const promoWrap = document.querySelector('.promo-input-wrap');
    
    if (code === 'SAVE10') {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = subtotal * 0.10;
        const tax = (subtotal - discount) * 0.08;
        const shipping = (subtotal - discount) >= 50 ? 0 : 5.99;
        const total = subtotal - discount + tax + shipping;
        
        document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
        
        // Показать скидку в summary-rows
        const rows = document.querySelector('.summary-rows');
        const existingDiscount = document.getElementById('discountRow');
        if (!existingDiscount) {
            const discountRow = document.createElement('div');
            discountRow.id = 'discountRow';
            discountRow.className = 'summary-row';
            discountRow.style.color = '#00A63E';
            discountRow.innerHTML = `
                <span>Discount (10%)</span>
                <span>-$${discount.toFixed(2)}</span>
            `;
            rows.insertBefore(discountRow, rows.lastElementChild);
        }
        
        // Заменить блок ввода на подтверждение
        promoWrap.innerHTML = `
            <div class="promo-applied">
                <div class="promo-applied-left">
                    <div class="promo-check-icon">
                        <span>✓</span>
                    </div>
                    <div>
                        <p class="promo-applied-code">SAVE10</p>
                        <p class="promo-applied-text">10% discount applied</p>
                    </div>
                </div>
                <button class="promo-remove-btn" onclick="removePromo()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>
        `;
    } else {
        input.style.borderColor = '#EF4444';
        setTimeout(() => input.style.borderColor = '#E5E7EB', 1500);
    }
}

function removePromo() {
    // Вернуть поле ввода
    const promoWrap = document.querySelector('.promo-input-wrap');
    promoWrap.innerHTML = `
        <input type="text" placeholder="Enter code" class="promo-input">
        <button class="promo-apply-btn" onclick="applyPromo()">Apply</button>
    `;
    
    // Убрать скидку
    const discountRow = document.getElementById('discountRow');
    if (discountRow) discountRow.remove();
    
    // Пересчитать суммы
    renderCart();
}
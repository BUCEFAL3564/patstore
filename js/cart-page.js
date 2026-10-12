// ========== CART PAGE (GET/PATCH/DELETE /api/cart…, промокод) ==========
// Суммы, скидка и итог считает сервер; страница их только показывает
const FREE_SHIPPING_FROM = 50;

document.addEventListener('DOMContentLoaded', () => {
    // Enter в поле промокода = «Apply». Один обработчик на контейнер: поле пересоздаётся
    // при перерисовке, а обработчик на самом поле навешивался бы заново каждый раз
    document.querySelector('.promo-input-wrap')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('promo-input')) applyPromo();
    });

    if (!session.isLoggedIn()) {
        renderCartMessage('Sign in to see your cart', 'Your cart is saved in your account.', loginUrl(), 'Sign In');
        return;
    }
    loadCart();
});

async function loadCart() {
    try {
        renderCart(await api('/cart', { auth: true }));
    } catch (err) {
        if (err.status === 401) {
            renderCartMessage('Your session has expired', 'Please sign in again.', loginUrl(), 'Sign In');
        } else {
            renderCartMessage('Could not load the cart', err.userMessage, 'cart.html', 'Try Again');
        }
    }
}

// Все изменения корзины возвращают корзину целиком — просто перерисовываем
async function cartRequest(path, options) {
    try {
        const cart = await api(path, { ...options, auth: true });
        renderCart(cart);
        return cart;
    } catch (err) {
        if (err.status === 401) {
            window.location.href = loginUrl();
            return null;
        }
        showToast(err.userMessage, 'error');
        return null;
    }
}

const emptyIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`;

// Сообщение («корзина пуста», «войдите») показывается отдельным блоком: позиции и итоги
// только скрываются, чтобы их можно было снова показать без перезагрузки страницы
function renderCartMessage(title, text, href, buttonText) {
    const headerBar = document.querySelector('.cart-header-bar');
    if (headerBar) headerBar.style.display = 'none';
    document.getElementById('cartItems').style.display = 'none';
    document.getElementById('cartSummary').style.display = 'none';
    document.getElementById('cartItemCount').textContent = '';
    document.getElementById('shippingQualified').style.display = 'none';
    setCartBadge(0);

    let message = document.getElementById('cartMessage');
    if (!message) {
        message = document.createElement('div');
        message.id = 'cartMessage';
        document.getElementById('cartContent').prepend(message);
    }
    message.innerHTML = `
        <div class="cart-empty">
            <div class="cart-empty-icon">${emptyIcon}</div>
            <h2 class="cart-empty-title">${escapeHtml(title)}</h2>
            <p class="cart-empty-desc">${escapeHtml(text)}</p>
            <a href="${escapeHtml(href)}" class="cart-empty-btn">
                ${escapeHtml(buttonText)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                </svg>
            </a>
        </div>
    `;
}

function renderCart(cart) {
    setCartBadge(cart.total_quantity);

    if (cart.items.length === 0) {
        renderCartMessage('Your cart is empty', 'Discover amazing games and add them to your cart!', 'index.html', 'Start Shopping');
        return;
    }

    document.getElementById('cartMessage')?.remove();
    const headerBar = document.querySelector('.cart-header-bar');
    if (headerBar) headerBar.style.display = 'block';
    document.getElementById('cartItems').style.display = '';
    document.getElementById('cartSummary').style.display = 'block';

    const totalItems = cart.total_quantity;
    const itemsWord = totalItems === 1 ? 'item' : 'items';
    document.getElementById('cartItemCount').textContent = `${totalItems} ${itemsWord} ready for checkout`;
    document.getElementById('summaryItemCount').textContent = `${totalItems} ${itemsWord} in your bag`;

    document.getElementById('cartItems').innerHTML = cart.items.map((item) => {
        const p = item.product;
        const name = escapeHtml(p.title);
        const maxQuantity = Math.min(99, p.stock_quantity);
        return `
        <div class="cart-item ${item.is_available ? '' : 'is-unavailable'}">
            <a href="product.html?id=${p.id}" class="cart-item-img">
                <img src="${escapeHtml(p.images[0] || '')}" alt="${name}">
            </a>
            <div class="cart-item-details">
                <div class="cart-item-info">
                    <a href="product.html?id=${p.id}" class="cart-item-name">${name}</a>
                    <p class="cart-item-category">${item.is_available
                        ? escapeHtml(p.platform || p.category || 'Games')
                        : '<span class="cart-item-unavailable">No longer available</span>'}</p>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity - 1})" ${!item.is_available || item.quantity <= 1 ? 'disabled' : ''} aria-label="Decrease quantity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
                    </button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity + 1})" ${!item.is_available || item.quantity >= maxQuantity ? 'disabled' : ''} aria-label="Increase quantity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                </div>
                <div class="cart-item-price-wrap">
                    <p class="cart-item-total">${formatPrice(item.line_total)}</p>
                    <p class="cart-item-each">${formatPrice(p.price)} each</p>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeItem(${item.id})" aria-label="Remove item">
                <img src="assets/icons/trash-basket.svg" alt="Remove" class="remove-icon">
            </button>
        </div>
    `;
    }).join('');

    // Итоги — значения из API
    document.getElementById('summarySubtotal').textContent = formatPrice(cart.subtotal);
    const discountRow = document.getElementById('discountRow');
    if (cart.promo) {
        document.getElementById('discountLabel').textContent = `Discount (${cart.promo.discount_percentage}%)`;
        document.getElementById('summaryDiscount').textContent = `-${formatPrice(cart.discount)}`;
        discountRow.hidden = false;
    } else {
        discountRow.hidden = true;
    }
    document.getElementById('summaryTotal').textContent = formatPrice(cart.total);

    renderPromo(cart.promo);

    const qualifiedEl = document.getElementById('shippingQualified');
    qualifiedEl.style.display = '';
    if (cart.subtotal >= FREE_SHIPPING_FROM) {
        qualifiedEl.textContent = '✓ Qualified!';
        qualifiedEl.style.color = '#00A63E';
    } else {
        qualifiedEl.textContent = `${formatPrice(FREE_SHIPPING_FROM - cart.subtotal)} away`;
        qualifiedEl.style.color = '#FF6900';
    }
}

function renderPromo(promo) {
    const promoWrap = document.querySelector('.promo-input-wrap');
    if (promo) {
        promoWrap.innerHTML = `
            <div class="promo-applied">
                <div class="promo-applied-left">
                    <div class="promo-check-icon"><span>✓</span></div>
                    <div>
                        <p class="promo-applied-code">${escapeHtml(promo.code)}</p>
                        <p class="promo-applied-text">${promo.discount_percentage}% discount applied</p>
                    </div>
                </div>
                <button class="promo-remove-btn" onclick="removePromo()" aria-label="Remove promo code">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>
        `;
    } else if (!promoWrap.querySelector('.promo-input')) {
        promoWrap.innerHTML = `
            <input type="text" placeholder="Enter code" class="promo-input">
            <button class="promo-apply-btn" onclick="applyPromo()">Apply</button>
        `;
    }
}

function changeQty(itemId, quantity) {
    if (quantity < 1) return;
    cartRequest(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } });
}

async function removeItem(itemId) {
    const nameEl = document.querySelector(`.cart-item-remove[onclick="removeItem(${itemId})"]`)
        ?.closest('.cart-item')?.querySelector('.cart-item-name');
    const cart = await cartRequest(`/cart/items/${itemId}`, { method: 'DELETE' });
    if (cart) showToast(`${shortName(nameEl ? nameEl.textContent : 'Item')} was removed from cart`);
}

async function applyPromo() {
    const input = document.querySelector('.promo-input');
    const code = input.value.trim();
    if (!code) {
        markPromoInvalid(input);
        return;
    }

    try {
        const cart = await api('/cart/apply-promo', { method: 'POST', body: { code }, auth: true });
        renderCart(cart);
        showToast(`Promo code ${cart.promo.code} applied`);
    } catch (err) {
        if (err.status === 401) {
            window.location.href = loginUrl();
            return;
        }
        markPromoInvalid(input);
        showToast(err.status === 404 ? 'Promo code not found' : err.userMessage, 'error');
    }
}

function markPromoInvalid(input) {
    input.style.borderColor = '#EF4444';
    setTimeout(() => (input.style.borderColor = ''), 1500);
}

function removePromo() {
    cartRequest('/cart/promo', { method: 'DELETE' });
}

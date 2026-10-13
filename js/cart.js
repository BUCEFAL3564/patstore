// ========== CART (через API /api/cart) ==========
// Корзина хранится на сервере и привязана к пользователю, поэтому нужна авторизация

function setCartBadge(total) {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;

    if (total > 0) {
        badge.textContent = total > 99 ? '99+' : total;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

async function refreshCartBadge() {
    if (!session.isLoggedIn()) {
        setCartBadge(0);
        return;
    }
    try {
        const cart = await api('/cart', { auth: true });
        setCartBadge(cart.total_quantity);
    } catch {
        setCartBadge(0);
    }
}

async function addToCart(productId, quantity = 1, productName = 'item') {
    if (!session.isLoggedIn()) {
        window.location.href = loginUrl();
        return;
    }

    try {
        const cart = await api('/cart/items', {
            method: 'POST',
            body: { product_id: productId, quantity },
            auth: true,
        });
        setCartBadge(cart.total_quantity);
        showToast(`Added ${quantity} ${shortName(productName)} to cart`);
    } catch (err) {
        if (err.status === 401) {
            window.location.href = loginUrl();
            return;
        }
        showToast(err.userMessage, 'error');
    }
}

// ========== TOAST ==========
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = type === 'error' ? 'toast toast-error' : 'toast';

    const icon = document.createElement('div');
    icon.className = 'toast-icon-wrap';
    icon.innerHTML = type === 'error'
        ? '<span class="toast-error-icon">!</span>'
        : '<img src="assets/icons/checkmark.svg" alt="" class="toast-checkmark">';

    const content = document.createElement('div');
    content.className = 'toast-content';

    const text = document.createElement('p');
    text.className = 'toast-text';
    text.textContent = message;

    content.appendChild(text);
    toast.appendChild(icon);
    toast.appendChild(content);
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', refreshCartBadge);

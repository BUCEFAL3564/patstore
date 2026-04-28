// ========== CART LOGIC ==========
let cart = [];

function loadCart() {
    const saved = localStorage.getItem('pawsstore_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
    updateCartBadge();
}

function saveCart() {
    localStorage.setItem('pawsstore_cart', JSON.stringify(cart));
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            rating: product.rating,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    
    // Toast
    const itemName = product.name.length > 40 ? product.name.substring(0, 40) + '...' : product.name;
    showToast(`Added 1 ${itemName} to cart`);
}

function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const total = getTotalItems();
    
    if (badge) {
        if (total > 0) {
            badge.textContent = total > 99 ? '99+' : total;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ========== TOAST ==========
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = document.createElement('div');
    icon.className = 'toast-icon-wrap';
    icon.innerHTML = '<img src="assets/icons/checkmark.svg" alt="" class="toast-checkmark">';
    
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

document.addEventListener('DOMContentLoaded', loadCart);
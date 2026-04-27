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
            rating: product.rating,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
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

document.addEventListener('DOMContentLoaded', loadCart);
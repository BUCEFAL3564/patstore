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

// ========== ЗАГРУЗКА КОРЗИНЫ ИЗ БД ==========
async function loadCartFromDB() {
    try {
        const res = await fetch('api/cart.php');
        const data = await res.json();
        cart = data.map(item => ({
            cart_id: item.cart_id,
            id: item.id,
            name: item.title,
            price: item.discount_price || item.price,
            image: item.image,
            category: item.platform || item.category || 'Игры',
            quantity: item.quantity
        }));
        updateCartBadge();
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

// ========== ДОБАВЛЕНИЕ В БД ==========
async function addToCartDB(product) {
    try {
        await fetch('api/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: product.id, quantity: 1 })
        });
        await loadCartFromDB();
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
    }
}

// ========== ЗАМЕНА СТАРОЙ ФУНКЦИИ ==========
const originalAddToCart = addToCart;
addToCart = async function(product) {
    await addToCartDB(product);
    const itemName = product.name.length > 40 ? product.name.substring(0, 40) + '...' : product.name;
    showToast(`Добавлено: ${itemName}`);
};


async function checkAuth() {
    const cookies = document.cookie.split('; ').find(row => row.startsWith('user_id='));
    
    const accountBtn = document.getElementById('accountBtn');
    if (!accountBtn) return;
    
    if (cookies) {
        accountBtn.innerHTML = '<img src="assets/icons/exit.svg" alt="Выход" class="icon-svg">';
        accountBtn.href = '#';
        accountBtn.onclick = (e) => {
            e.preventDefault();
            document.cookie = 'user_id=; path=/; max-age=0';
            document.cookie = 'username=; path=/; max-age=0';
            window.location.reload();
        };
    } else {
        accountBtn.innerHTML = '<img src="assets/icons/account.svg" alt="Аккаунт" class="icon-svg">';
        accountBtn.href = 'enter.html';
        accountBtn.onclick = null;
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromDB();
    checkAuth();
});
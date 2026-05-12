document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('api/profile.php');
        const data = await res.json();
        
        if (data.error) {
            window.location.href = 'enter.html';
            return;
        }
        
        document.getElementById('profileUsername').textContent = data.username;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profilePhone').textContent = data.phone || '—';
        document.getElementById('profileDate').textContent = new Date(data.created_at).toLocaleDateString('ru-RU');
        
        if (data.orders && data.orders.length > 0) {
            document.getElementById('ordersList').innerHTML = data.orders.map(o => `
                <div class="order-item" onclick="showKeys(${o.id})">
                    <div>
                        <p class="order-number">#${o.order_number}</p>
                        <p class="order-date">${new Date(o.created_at).toLocaleDateString('ru-RU')} • ${o.items_count} товаров</p>
                    </div>
                    <div style="text-align:right">
                        <p class="order-total">$${o.total}</p>
                        <span class="order-status ${o.status === 'completed' ? 'status-completed' : 'status-pending'}">${o.status === 'completed' ? 'Выполнен' : 'В обработке'}</span>
                    </div>
                </div>
            `).join('');
        } else {
            document.getElementById('ordersList').innerHTML = '<div class="no-orders">Пока нет заказов</div>';
        }
    } catch (err) {}
});

async function showKeys(orderId) {
    const res = await fetch(`api/orderDetail.php?order_id=${orderId}`);
    const items = await res.json();
    
    document.getElementById('keysList').innerHTML = items.map(i => `
        <div class="key-row">
            <span style="color:#94A3B8">${i.title}</span>
            <span class="key-code">${i.game_key}</span>
        </div>
    `).join('');
    
    document.getElementById('keysModal').classList.add('open');
}

function logout() {
    document.cookie = 'user_id=; path=/; max-age=0';
    document.cookie = 'username=; path=/; max-age=0';
    window.location.href = 'index.html';
}
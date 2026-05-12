document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.querySelector('#registerForm [placeholder="Придумайте имя пользователя"]').value.trim(),
            email: document.querySelector('#registerForm [placeholder="Введите вашу почту"]').value.trim(),
            phone: document.querySelector('#registerForm [placeholder="Введите номер телефона"]').value.trim(),
            password: document.querySelector('#registerForm [placeholder="Придумайте пароль"]').value,
            confirm: document.querySelector('#registerForm [placeholder="Повторите пароль"]').value
        };
        
        // Простые проверки
        if (!formData.username || !formData.email || !formData.password || !formData.confirm) {
            showMessage('Все поля обязательны', 'error');
            return;
        }
        
        if (formData.password !== formData.confirm) {
            showMessage('Пароли не совпадают', 'error');
            return;
        }
        
        if (formData.password.length < 6) {
            showMessage('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        try {
            const res = await fetch('api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => window.location.href = 'enter.html', 1500);
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            showMessage('Ошибка соединения с сервером', 'error');
        }
    });
});

function showMessage(text, type) {
    const existing = document.querySelector('.auth-message');
    if (existing) existing.remove();
    
    const msg = document.createElement('div');
    msg.className = `auth-message auth-message-${type}`;
    msg.textContent = text;
    
    const form = document.getElementById('registerForm') || document.getElementById('loginForm');
    form.parentNode.insertBefore(msg, form);
    
    setTimeout(() => msg.remove(), 4000);
}
async function doLogin() {
    const login = document.querySelector('#loginForm [placeholder="Введите имя или почту"]').value.trim();
    const password = document.querySelector('#loginForm [placeholder="Введите пароль"]').value;
    
    if (!login || !password) {
        alert('Введите логин и пароль');
        return;
    }
    
    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            document.cookie = `user_id=${data.user_id};path=/`;
            document.cookie = `username=${data.username};path=/`;
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = 'index.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Ошибка соединения');
    }
}
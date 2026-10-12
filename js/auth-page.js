// ========== SIGN IN / CREATE ACCOUNT (POST /api/auth/login, /api/auth/register) ==========

// Куда вернуться после входа: только на страницы этого сайта (например, cart.html),
// чтобы ссылкой вида ?redirect=https://… нельзя было увести пользователя на чужой сайт
function redirectTarget() {
    const target = new URLSearchParams(window.location.search).get('redirect');
    return target && /^[\w-]+\.html(\?[^#]*)?$/.test(target) ? target : 'index.html';
}

function showAuthError(message) {
    const box = document.getElementById('authError');
    box.textContent = message;
    box.hidden = false;
}

function hideAuthError() {
    document.getElementById('authError').hidden = true;
}

// Отправка формы: кнопка блокируется, ошибки API показываются над кнопкой
async function submitAuth(form, path, body, errorMessages) {
    const button = form.querySelector('.auth-btn');
    const buttonText = button.textContent;
    button.disabled = true;
    button.textContent = 'Please wait...';
    hideAuthError();

    try {
        const data = await api(path, { method: 'POST', body });
        session.save(data);
        window.location.href = redirectTarget();
    } catch (err) {
        showAuthError(errorMessages[err.status] || err.userMessage);
        button.disabled = false;
        button.textContent = buttonText;
    }
}

// Уже вошли — вместо формы входа показываем аккаунт и кнопку выхода
function renderSignedIn(card, user) {
    card.innerHTML = `
        <div class="auth-header">
            <h1 class="auth-title">You're signed in</h1>
            <p class="auth-subtitle">${escapeHtml(user.email)}${user.role === 'admin' ? ' · administrator' : ''}</p>
        </div>
        <div class="auth-form">
            <a href="index.html" class="auth-btn auth-btn-link">Continue Shopping</a>
            <a href="cart.html" class="auth-btn auth-btn-secondary auth-btn-link">Go to Cart</a>
            <button type="button" class="auth-btn auth-btn-secondary" id="signOutBtn">Sign Out</button>
        </div>
    `;
    document.getElementById('signOutBtn').addEventListener('click', () => {
        session.clear();
        window.location.href = 'enter.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (session.isLoggedIn() && session.user) {
        renderSignedIn(document.querySelector('.auth-card'), session.user);
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value.trim();
            const password = loginForm.password.value;
            if (!email || !password) {
                showAuthError('Enter your email and password');
                return;
            }
            submitAuth(loginForm, '/auth/login', { email, password }, {
                401: 'Invalid email or password',
            });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = registerForm.email.value.trim();
            const password = registerForm.password.value;
            const confirm = registerForm.confirm.value;

            if (!email || !password) {
                showAuthError('Enter your email and password');
                return;
            }
            if (password.length < 8) {
                showAuthError('Password must be at least 8 characters');
                return;
            }
            if (password !== confirm) {
                showAuthError('Passwords do not match');
                return;
            }
            submitAuth(registerForm, '/auth/register', { email, password }, {
                409: 'This email is already registered',
            });
        });
    }
});

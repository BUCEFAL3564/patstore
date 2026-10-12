// ========== HEADER: SEARCH BUTTON & ACCOUNT ==========
document.addEventListener('DOMContentLoaded', () => {
    // Лупа в шапке: на главной — к строке поиска, на других страницах — на главную с поиском
    document.querySelectorAll('.icon-btn[aria-label="Search"]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById('searchInput');
            if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus({ preventScroll: true });
            } else {
                window.location.href = 'index.html?focus=search';
            }
        });
    });

    // Иконка аккаунта: если вошли — подсказка с email и отметка на иконке
    const user = session.user;
    if (session.isLoggedIn() && user) {
        document.querySelectorAll('a[aria-label="Account"]').forEach((link) => {
            link.classList.add('is-logged-in');
            link.title = `Signed in as ${user.email}`;
        });
    }
});

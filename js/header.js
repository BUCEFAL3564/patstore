document.addEventListener('DOMContentLoaded', () => {
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

    const user = session.user;
    if (session.isLoggedIn() && user) {
        document.querySelectorAll('a[aria-label="Account"]').forEach((link) => {
            link.classList.add('is-logged-in');
            link.title = `Signed in as ${user.email}`;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Бургер
    const burger = document.querySelector('.burger-btn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (burger && mobileNav) {
        burger.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
            } else {
                mobileNav.classList.add('open');
            }
        });
    }
    
    // Фильтры
    const filterBtn = document.getElementById('filterToggleBtn');
    const closeBtn = document.getElementById('closeFiltersBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (filterBtn && sidebar) {
        filterBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }
    
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }
    
    // Перемещение sidebar
    moveSidebar();
});

function moveSidebar() {
    const sidebar = document.getElementById('sidebar');
    const topBar = document.querySelector('.top-bar');
    const contentContainer = document.querySelector('.content-container');
    const mainContent = document.querySelector('.main-content');
    
    if (!sidebar || !topBar || !contentContainer || !mainContent) return;
    
    if (window.innerWidth <= 1023) {
        topBar.after(sidebar);
    } else {
        contentContainer.insertBefore(sidebar, mainContent);
    }
}

window.addEventListener('resize', moveSidebar);
// ========== CATALOG (GET /api/products) ==========
// Поиск, фильтры, сортировка и пагинация выполняются на сервере (в БД);
// страница только передаёт параметры и показывает результат
const PAGE_SIZE = 12;

const catalogState = {
    page: 1,
    search: '',
    min_price: undefined,
    max_price: undefined,
    min_rating: undefined,
    sort_by: 'title',
    order: 'asc',
};

let products = []; // товары текущей страницы
let latestRequest = 0;

// ========== URL <-> STATE ==========
// Параметры каталога дублируются в адресной строке: страницу можно обновить
// или отправить ссылку, и фильтры сохранятся
function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const number = (name) => {
        const value = params.get(name);
        return value === null || value === '' || Number.isNaN(Number(value)) ? undefined : Number(value);
    };

    catalogState.page = Math.max(1, number('page') || 1);
    catalogState.search = params.get('search') || '';
    catalogState.min_price = number('min_price');
    catalogState.max_price = number('max_price');
    catalogState.min_rating = number('min_rating');
    if (['price', 'title'].includes(params.get('sort_by'))) catalogState.sort_by = params.get('sort_by');
    if (['asc', 'desc'].includes(params.get('order'))) catalogState.order = params.get('order');
}

function buildQuery() {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(catalogState)) {
        if (value !== undefined && value !== '') params.set(key, value);
    }
    params.set('limit', PAGE_SIZE);
    return params;
}

function writeStateToUrl() {
    const params = buildQuery();
    params.delete('limit');
    if (catalogState.page === 1) params.delete('page');
    if (catalogState.sort_by === 'title' && catalogState.order === 'asc') {
        params.delete('sort_by');
        params.delete('order');
    }
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

// changes — новые значения параметров; любой фильтр, кроме смены страницы, возвращает на 1-ю страницу
function updateCatalog(changes) {
    Object.assign(catalogState, { page: 1 }, changes);
    loadProducts();
}

// ========== LOAD ==========
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Если пользователь быстро меняет фильтры, ответы могут прийти не по порядку — показываем только последний
    const requestId = ++latestRequest;
    grid.classList.add('is-loading');

    try {
        const data = await api(`/products?${buildQuery()}`);
        if (requestId !== latestRequest) return;

        products = data.items;
        renderProducts();
        renderPagination(data.meta);
        updateProductCount(data.meta.total_items);
        writeStateToUrl();
    } catch (err) {
        if (requestId !== latestRequest) return;
        products = [];
        grid.innerHTML = `<p class="catalog-message">Could not load games: ${escapeHtml(err.userMessage)}</p>`;
        renderPagination(null);
        updateProductCount(null);
    } finally {
        if (requestId === latestRequest) grid.classList.remove('is-loading');
    }
}

// ========== RENDER STARS ==========
function renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;

        let fillColor = '#FFFFFF';
        let strokeColor = '#D1D5DC';

        if (filled) {
            fillColor = '#FDC700';
            strokeColor = '#FDC700';
        } else if (half) {
            fillColor = `url(#halfGrad${i})`;
            strokeColor = '#FDC700';
        }

        starsHTML += `
            <span class="star-icon">
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${half ? `
                    <defs>
                        <linearGradient id="halfGrad${i}">
                            <stop offset="50%" stop-color="#FDC700"/>
                            <stop offset="50%" stop-color="#FFFFFF"/>
                        </linearGradient>
                    </defs>
                    ` : ''}
                    <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.5L6 8.84L2.91 10.5L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                          fill="${fillColor}"
                          stroke="${strokeColor}"
                          stroke-width="1.17"
                          stroke-linejoin="round"/>
                </svg>
            </span>
        `;
    }
    return starsHTML;
}

// ========== RENDER PRODUCTS ==========
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<p class="catalog-message">No games found. Try changing the search or filters.</p>';
        return;
    }

    grid.innerHTML = products.map((product) => {
        const name = escapeHtml(product.title);
        const image = escapeHtml(product.images[0] || 'https://placehold.co/300x370/1E293B/F59E0B?text=Game');
        return `
        <a href="product.html?id=${product.id}" class="product-card">

            <div class="product-overlay">
                <div class="product-overlay-inner">
                    <span class="overlay-name">${name}</span>
                    <div class="overlay-rating-row">
                        <div class="overlay-stars">
                            ${renderStars(product.rating)}
                        </div>
                        <span class="overlay-rating-number">${product.rating}</span>
                    </div>
                    <div class="overlay-bottom">
                        <span class="overlay-price">${formatPrice(product.price)}</span>
                        <button class="overlay-cart-btn" aria-label="Add to cart" data-add-to-cart="${product.id}">
                            <img src="assets/icons/basket.svg" alt="Cart" class="overlay-cart-icon">
                        </button>
                    </div>
                </div>
            </div>

            <div class="product-image-wrap">
                <img src="${image}" alt="${name}" loading="lazy">
                <span class="product-price-badge">${formatPrice(product.price)}</span>
            </div>

            <div class="product-info">
                <h3 class="product-name">${name}</h3>
                <div class="product-rating-row">
                    <div class="product-stars">
                        ${renderStars(product.rating)}
                    </div>
                    <span class="product-rating-number">${product.rating}</span>
                </div>
            </div>

        </a>
    `;
    }).join('');
}

// ========== PAGINATION ==========
function renderPagination(meta) {
    const nav = document.getElementById('pagination');
    if (!nav) return;

    if (!meta || meta.total_pages <= 1) {
        nav.innerHTML = '';
        return;
    }

    const current = meta.current_page;
    const total = meta.total_pages;

    // Номера рядом с текущей страницей, первая и последняя; остальное — многоточием
    const pages = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - current) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== '…') pages.push('…');
    }

    nav.innerHTML = `
        <button class="page-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>
        ${pages.map((p) => p === '…'
            ? '<span class="page-ellipsis">…</span>'
            : `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}" ${p === current ? 'aria-current="page"' : ''}>${p}</button>`
        ).join('')}
        <button class="page-btn" data-page="${current + 1}" ${current >= total ? 'disabled' : ''} aria-label="Next page">›</button>
    `;
}

// ========== UPDATE PRODUCT COUNT ==========
function updateProductCount(total) {
    const countEl = document.querySelector('.product-count');
    if (countEl) {
        countEl.textContent = total === null ? '' : `${total} ${total === 1 ? 'game' : 'games'}`;
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('productGrid');
    if (!grid) return; // products.js подключён на странице без каталога

    readStateFromUrl();

    // Кнопка «в корзину» на карточке: карточка — ссылка, поэтому отменяем переход
    grid.addEventListener('click', (e) => {
        const button = e.target.closest('[data-add-to-cart]');
        if (!button) return;
        e.preventDefault();
        const id = Number(button.dataset.addToCart);
        const product = products.find((p) => p.id === id);
        addToCart(id, 1, product ? product.title : 'item');
    });

    // Пагинация
    document.getElementById('pagination')?.addEventListener('click', (e) => {
        const button = e.target.closest('.page-btn');
        if (!button || button.disabled || button.classList.contains('active')) return;
        catalogState.page = Number(button.dataset.page);
        loadProducts();
        document.querySelector('.top-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Поиск
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    if (searchForm && searchInput) {
        searchInput.value = catalogState.search;
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateCatalog({ search: searchInput.value.trim() });
        });
        // Крестик в поле поиска (type="search") очищает его — сразу показываем весь каталог
        searchInput.addEventListener('search', () => {
            if (searchInput.value === '' && catalogState.search !== '') updateCatalog({ search: '' });
        });
        if (new URLSearchParams(window.location.search).get('focus') === 'search') {
            searchInput.focus();
        }
    }

    loadProducts();
});

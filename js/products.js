const products = [
    {
        id: 1, name: "Airline-Approved Pet Carrier", price: 54.99, rating: 4.8,
        category: "Travel & Carriers",
        highlights: ["Dimensions: 18 x 11 x 11 inches", "Material: Polyester with Mesh Panels", "Weight Limit: Up to 15 lbs"],
        description: "Soft-sided pet carrier approved for airline cabin use. Features mesh panels for ventilation, padded shoulder strap, and collapsible design for easy storage. Interior fleece pad provides comfort. Meets TSA requirements for in-cabin pet travel.",
        specs: [
            { label: "Dimensions", value: "18 x 11 x 11 in" },
            { label: "Item Weight", value: "3.2 lbs" },
            { label: "Material", value: "Polyester" },
            { label: "Color", value: "Navy Blue" },
            { label: "Max Load", value: "15 lbs" },
            { label: "Ventilation", value: "Mesh Panels" }
        ],
        image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300&h=370&fit=crop"
    },
    {
        id: 2, name: "Multi-Level Cat Scratching Post", price: 89.99, rating: 4.9,
        category: "Toys & Scratchers",
        highlights: ["Height: 54 inches (4 levels)", "Material: Premium Sisal Rope", "Weight Limit: Up to 20 lbs"],
        description: "Tall 4-level cat scratching post with thick sisal rope wrapping. Each level features a cozy platform perch for lounging.",
        specs: [
            { label: "Height", value: "54 inches" },
            { label: "Item Weight", value: "18.5 lbs" },
            { label: "Material", value: "Sisal & Wood" },
            { label: "Color", value: "Beige/Brown" },
            { label: "Max Load", value: "20 lbs" },
            { label: "Levels", value: "4 Platforms" }
        ],
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=370&fit=crop"
    },
    {
        id: 3, name: "Orthopedic Dog Bed Large", price: 79.99, rating: 4.7,
        category: "Beds & Furniture",
        highlights: ["Dimensions: 36 x 27 x 6 inches", "Material: Memory Foam Core", "Weight Limit: Up to 100 lbs"],
        description: "Premium orthopedic dog bed with 4-inch memory foam core. Removable, machine-washable cover.",
        specs: [
            { label: "Dimensions", value: "36 x 27 x 6 in" },
            { label: "Item Weight", value: "8.4 lbs" },
            { label: "Filling", value: "Memory Foam" },
            { label: "Cover Color", value: "Light Gray" },
            { label: "Max Load", value: "100 lbs" },
            { label: "Care", value: "Machine Washable" }
        ],
        image: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=300&h=370&fit=crop"
    },
    {
        id: 4, name: "Automatic Pet Feeder", price: 64.99, rating: 4.5,
        category: "Bowls & Feeders",
        highlights: ["Capacity: 6 liters (25 cups)", "Programmable: 4 meals/day", "Battery Backup: 3 D batteries"],
        description: "Programmable automatic pet feeder with large 6L capacity. Battery backup maintains schedule.",
        specs: [
            { label: "Dimensions", value: "14 x 9 x 15 in" },
            { label: "Capacity", value: "6 Liters" },
            { label: "Material", value: "ABS Plastic" },
            { label: "Power", value: "AC + Battery" },
            { label: "Meals/Day", value: "Up to 4" },
            { label: "Cleaning", value: "Dishwasher Safe" }
        ],
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=370&fit=crop"
    },
    {
        id: 5, name: "Interactive Dog Puzzle Toy", price: 29.99, rating: 4.6,
        category: "Toys & Scratchers",
        highlights: ["Diameter: 10 inches", "Material: BPA-Free Plastic", "Difficulty Level: Intermediate"],
        description: "Interactive puzzle toy that challenges your dog mentally and physically. Dishwasher safe.",
        specs: [
            { label: "Diameter", value: "10 inches" },
            { label: "Item Weight", value: "1.2 lbs" },
            { label: "Material", value: "BPA-Free ABS" },
            { label: "Color", value: "Multi-Color" },
            { label: "Difficulty", value: "Intermediate" },
            { label: "Cleaning", value: "Dishwasher Safe" }
        ],
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=370&fit=crop"
    },
    {
        id: 6, name: "Cozy Cat Window Seat", price: 44.99, rating: 4.4,
        category: "Beds & Furniture",
        highlights: ["Dimensions: 23 x 12 inches", "Material: Soft Fleece Fabric", "Weight Limit: Up to 30 lbs"],
        description: "Window-mounted cat hammock with sturdy suction cups. Perfect for sunbathing and bird watching.",
        specs: [
            { label: "Dimensions", value: "23 x 12 in" },
            { label: "Item Weight", value: "1.8 lbs" },
            { label: "Fabric", value: "Fleece" },
            { label: "Max Load", value: "30 lbs" },
            { label: "Mount Type", value: "Suction Cups" },
            { label: "Care", value: "Machine Washable" }
        ],
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=370&fit=crop"
    },
    {
        id: 7, name: "Premium Leather Dog Leash Set", price: 39.99, rating: 4.7,
        category: "Leashes & Collars",
        highlights: ["Length: 6 feet (standard)", "Material: Full-Grain Leather", "Weight Limit: Up to 150 lbs"],
        description: "Handcrafted full-grain leather leash with matching padded collar. Solid brass hardware.",
        specs: [
            { label: "Leash Length", value: "6 feet" },
            { label: "Item Weight", value: "0.8 lbs" },
            { label: "Material", value: "Full-Grain Leather" },
            { label: "Color", value: "Brown/Tan" },
            { label: "Max Load", value: "150 lbs" },
            { label: "Hardware", value: "Solid Brass" }
        ],
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=370&fit=crop"
    },
    {
        id: 8, name: "Plush Donut Pet Bed", price: 49.99, rating: 4.8,
        category: "Beds & Furniture",
        highlights: ["Diameter: 23 inches (round)", "Material: Plush Faux Fur", "Weight Limit: Up to 45 lbs"],
        description: "Round donut-shaped pet bed with raised rim. Non-skid bottom. Machine-washable.",
        specs: [
            { label: "Diameter", value: "23 inches" },
            { label: "Item Weight", value: "3.5 lbs" },
            { label: "Fabric", value: "Faux Fur" },
            { label: "Color", value: "Cream White" },
            { label: "Max Load", value: "45 lbs" },
            { label: "Care", value: "Machine Washable" }
        ],
        image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=370&fit=crop"
    },
    {
        id: 9, name: "Ceramic Pet Food Bowl Set", price: 24.99, rating: 4.3,
        category: "Bowls & Feeders",
        highlights: ["Capacity: 2 cups each bowl", "Material: Lead-Free Ceramic", "Dishwasher & Microwave Safe"],
        description: "Set of two ceramic pet bowls with a non-slip silicone base. Lead-free and cadmium-free glaze.",
        specs: [
            { label: "Bowl Size", value: "6.5 x 2.5 in" },
            { label: "Capacity", value: "2 cups each" },
            { label: "Material", value: "Ceramic" },
            { label: "Color", value: "White/Gray" },
            { label: "Cleaning", value: "Dishwasher Safe" },
            { label: "Base", value: "Non-Slip Silicone" }
        ],
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=370&fit=crop"
    }
];

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
    
    grid.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id}" class="product-card">
            
            <!-- Оверлей (выезжает при наведении) -->
            <div class="product-overlay">
                <div class="product-overlay-inner">
                    <span class="overlay-name">${product.name}</span>
                    <div class="overlay-rating-row">
                        <div class="overlay-stars">
                            ${renderStars(product.rating)}
                        </div>
                        <span class="overlay-rating-number">${product.rating}</span>
                    </div>
                    <div class="overlay-bottom">
                        <span class="overlay-price">$${product.price.toFixed(2)}</span>
                            <button class="overlay-cart-btn" aria-label="Add to cart" onclick="event.preventDefault(); addToCart(products.find(p => p.id === ${product.id}))">
                            <img src="assets/icons/basket.svg" alt="Cart" class="overlay-cart-icon">
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Картинка -->
            <div class="product-image-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <span class="product-price-badge">$${product.price.toFixed(2)}</span>
            </div>
            
            <!-- Нижний блок -->
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating-row">
                    <div class="product-stars">
                        ${renderStars(product.rating)}
                    </div>
                    <span class="product-rating-number">${product.rating}</span>
                </div>
            </div>
            
        </a>
    `).join('');
}

// ========== UPDATE PRODUCT COUNT ==========
function updateProductCount() {
    const countEl = document.querySelector('.product-count');
    if (countEl) {
        countEl.textContent = `${products.length} products`;
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateProductCount();
});
// Array to store cart items
let cart = [];
let productsCatalog = [];

// DOM elements
const productsContainer = document.getElementById('products-container');
const cartCount = document.getElementById('cart-count');
const cartLink = document.getElementById('cart-link');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Fetch products from JSON file
async function fetchProducts() {
    try {
        const response = await fetch('products/catalog.json');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        productsCatalog = await response.json();
        return productsCatalog;
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data if fetch fails
        productsCatalog = getMockProducts();
        return productsCatalog;
    }
}

// Mock products data as fallback
function getMockProducts() {
    return [
        {
            id: 1,
            name: "Camiseta Básica",
            description: "Camiseta de algodão premium, disponível em várias cores",
            price: 29.90,
            image: "https://via.placeholder.com/300x200?text=Camiseta+B%C3%A1sica"
        },
        {
            id: 2,
            name: "Jeans Slim Fit",
            description: "Jeans confortável com modelagem slim fit",
            price: 89.90,
            image: "https://via.placeholder.com/300x200?text=Jeans+Slim+Fit"
        },
        {
            id: 3,
            name: "Tênis Casual",
            description: "Tênis versátil para uso diário",
            price: 129.90,
            image: "https://via.placeholder.com/300x200?text=T%C3%AAnis+Casual"
        },
        {
            id: 4,
            name: "Relógio Analógico",
            description: "Relógio clássico com pulseira de couro",
            price: 159.90,
            image: "https://via.placeholder.com/300x200?text=Rel%C3%B3gio+Anal%C3%B3gico"
        },
        {
            id: 5,
            name: "Mochila Executiva",
            description: "Mochila resistente para laptop e acessórios",
            price: 199.90,
            image: "https://via.placeholder.com/300x200?text=Mochila+Executiva"
        },
        {
            id: 6,
            name: "Jaqueta Corta-Vento",
            description: "Jaqueta leve e impermeável para dias chuvosos",
            price: 119.90,
            image: "https://via.placeholder.com/300x200?text=Jaqueta+Corta-Vento"
        }
    ];
}

// Find product by ID
function getProductById(id) {
    return productsCatalog.find(product => product.id === id) || null;
}

// Local product art (no external images)
function productArt(product) {
    const icons = { 'Roupas': '👕', 'Calçados': '👟', 'Acessórios': '⌚', 'Mochilas': '🎒' };
    const icon = icons[product.category] || ['👕','👖','👟','⌚','🎒','🧥'][(product.id - 1) % 6];
    const hues = ['#ffe600', '#ff5ca8', '#5ce1ff', '#9dff6b', '#ff9a3c', '#c29bff'];
    const bg = hues[(product.id - 1) % hues.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="${bg}"/><circle cx="240" cy="40" r="60" fill="#000" opacity=".08"/><text x="150" y="125" font-size="90" text-anchor="middle">${icon}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Render products to the page
function renderProducts(products) {
    productsContainer.innerHTML = ''; // Clear previous content

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${productArt(product)}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Adicionar ao Carrinho</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add item to cart
function addToCart(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const product = getProductById(productId);

    if (!product) {
        alert('Produto não encontrado!');
        return;
    }

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        // If product already in cart, increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // If product not in cart, add it with quantity 1
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Update cart count and save to localStorage
    updateCartCount();
    saveCartToLocalStorage();
    showNotification(`${product.name} adicionado ao carrinho!`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCartToLocalStorage();
    renderCart(); // Re-render cart if modal is open
}

// Update item quantity in cart
function updateQuantity(productId, quantity) {
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        updateCartCount();
        saveCartToLocalStorage();
        renderCart(); // Re-render cart if modal is open
    }
}

// Update cart count display
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Calculate cart total
function calculateCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            cart = [];
        }
    }
}

// Render cart items in modal
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Carrinho vazio</p>';
        cartTotal.textContent = 'R$ 0,00';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                <button class="remove-btn" data-id="${item.id}">&times;</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to cart item buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(button.getAttribute('data-id'));
            const action = button.getAttribute('data-action');

            if (action === 'increase') {
                updateQuantity(productId, 1); // This will increase by 1
            } else if (action === 'decrease') {
                updateQuantity(productId, -1); // This will decrease by 1
            }
        });
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(button.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });

    // Update total
    const total = calculateCartTotal();
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// Show notification
function showNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Open cart modal
function openCart() {
    cartModal.style.display = 'block';
    renderCart();
}

// Close cart modal
function closeCart() {
    cartModal.style.display = 'none';
}

// Initialize the application
async function init() {
    // Load cart from localStorage
    loadCartFromLocalStorage();

    // Fetch and render products
    const products = await fetchProducts();
    renderProducts(products);

    // Set up event listeners
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    closeCartBtn.addEventListener('click', closeCart);

    // Close modal when clicking outside content
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            closeCart();
        }
    });

    // Initialize cart count
    updateCartCount();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out forwards;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .quantity-btn {
        background-color: #ecf0f1;
        border: none;
        width: 30px;
        height: 30px;
        cursor: pointer;
        border-radius: 4px;
        font-weight: bold;
        color: #2c3e50;
    }

    .quantity-btn:hover {
        background-color: #bdc3c7;
    }

    .quantity-display {
        margin: 0 10px;
        min-width: 20px;
        text-align: center;
        display: inline-block;
    }

    .remove-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        cursor: pointer;
        border-radius: 4px;
        font-weight: bold;
    }

    .remove-btn:hover {
        background-color: #c0392b;
    }

    .cart-item-actions {
        display: flex;
        align-items: center;
        gap: 5px;
    }
`;
document.head.appendChild(style);
// Wingman Labs - Header & Cart Functionality

// ============================================
// CART MANAGEMENT
// ============================================

let cartId = localStorage.getItem('wingman_cart_id');

// Open cart drawer
async function openCart() {
  const drawer = document.getElementById('cartDrawer');
  drawer.classList.add('active');
  await refreshCart();
}

// Close cart drawer
function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  drawer.classList.remove('active');
}

// Refresh cart contents
async function refreshCart() {
  try {
    // Get or create cart
    if (!cartId) {
      const cart = await createCart();
      cartId = cart.id;
      localStorage.setItem('wingman_cart_id', cartId);
    }

    // Fetch cart data
    const cart = await getCart(cartId);
    
    // Update cart count
    const totalItems = cart.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0);
    updateCartCount(totalItems);
    
    // Render cart items
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.lines.edges.length === 0) {
      cartBody.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      cartFooter.style.display = 'none';
      return;
    }
    
    // Build cart HTML
    let html = '';
    cart.lines.edges.forEach(edge => {
      const line = edge.node;
      const variant = line.merchandise;
      const product = variant.product;
      const price = parseFloat(variant.priceV2.amount);
      
      html += `
        <div class="cart-item" data-line-id="${line.id}">
          <div class="cart-item-image">
            <img src="${variant.image?.url || ''}" alt="${product.title}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${product.title}</div>
            <div class="cart-item-variant">${variant.title !== 'Default Title' ? variant.title : ''}</div>
            <div class="cart-item-price">$${price.toFixed(2)}</div>
            <div class="cart-item-qty">
              <button class="cart-qty-btn" onclick="updateQuantity('${line.id}', ${line.quantity - 1})" ${line.quantity <= 1 ? 'disabled' : ''}>−</button>
              <span class="cart-qty-value">${line.quantity}</span>
              <button class="cart-qty-btn" onclick="updateQuantity('${line.id}', ${line.quantity + 1})">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${line.id}')">Remove</button>
          </div>
        </div>
      `;
    });
    
    cartBody.innerHTML = html;
    
    // Update footer
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    const total = parseFloat(cart.cost.totalAmount.amount);
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    
    cartFooter.style.display = 'block';
    
    // Update checkout button
    document.getElementById('cartCheckoutBtn').onclick = () => {
      window.location.href = cart.checkoutUrl;
    };
    
  } catch (error) {
    console.error('Failed to refresh cart:', error);
  }
}

// Update cart count badge
function updateCartCount(count = 0) {
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Update item quantity
async function updateQuantity(lineId, newQuantity) {
  if (newQuantity < 1) return;
  
  try {
    await updateCartLine(cartId, lineId, newQuantity);
    await refreshCart();
  } catch (error) {
    console.error('Failed to update quantity:', error);
    alert('Error updating quantity');
  }
}

// Remove item from cart
async function removeFromCart(lineId) {
  try {
    await removeCartLine(cartId, lineId);
    await refreshCart();
  } catch (error) {
    console.error('Failed to remove item:', error);
    alert('Error removing item');
  }
}

// Add item to cart (for product pages)
async function addItemToCart(variantId, quantity = 1) {
  try {
    // Get or create cart
    if (!cartId) {
      const cart = await createCart();
      cartId = cart.id;
      localStorage.setItem('wingman_cart_id', cartId);
    }
    
    // Add item
    const result = await addToCart(cartId, variantId, quantity);
    
    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message);
    }
    
    // Open cart drawer
    await openCart();
    
  } catch (error) {
    console.error('Failed to add to cart:', error);
    alert('Error adding to cart: ' + error.message);
  }
}

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

function isLoggedIn() {
  return !!localStorage.getItem('wingman_customer_token');
}

function showAccountModal() {
  // Simple login modal (expand as needed)
  const html = `
    <div style="
      position: fixed; 
      top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.9); 
      z-index: 10000; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 20px;
    " id="accountModal">
      <div style="
        background: var(--dark); 
        border: 1px solid var(--dark-border); 
        padding: 40px; 
        max-width: 400px; 
        width: 100%;
      ">
        <h2 style="margin-bottom: 24px; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase;">Account</h2>
        ${isLoggedIn() ? `
          <p style="margin-bottom: 16px;">You are logged in.</p>
          <button onclick="logout()" style="width: 100%; padding: 12px; background: transparent; border: 1px solid white; color: white; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em;">Logout</button>
        ` : `
          <p style="margin-bottom: 16px; color: var(--gray);">Login to save your wishlist and view orders.</p>
          <input type="email" id="loginEmail" placeholder="Email" style="width: 100%; padding: 12px; margin-bottom: 12px; background: var(--black); border: 1px solid var(--dark-border); color: white;">
          <input type="password" id="loginPassword" placeholder="Password" style="width: 100%; padding: 12px; margin-bottom: 16px; background: var(--black); border: 1px solid var(--dark-border); color: white;">
          <button onclick="handleLogin()" style="width: 100%; padding: 12px; background: #E63946; border: none; color: white; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Login</button>
        `}
        <button onclick="closeAccountModal()" style="width: 100%; padding: 12px; background: transparent; border: 1px solid var(--dark-border); color: white; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em;">Close</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeAccountModal() {
  const modal = document.getElementById('accountModal');
  if (modal) modal.remove();
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    const query = `
      mutation {
        customerAccessTokenCreate(input: {
          email: "${email}"
          password: "${password}"
        }) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            message
          }
        }
      }
    `;
    
    const data = await shopifyFetch(query);
    
    if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
      throw new Error(data.customerAccessTokenCreate.customerUserErrors[0].message);
    }
    
    const token = data.customerAccessTokenCreate.customerAccessToken.accessToken;
    localStorage.setItem('wingman_customer_token', token);
    
    closeAccountModal();
    alert('Login successful!');
    
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
}

function logout() {
  localStorage.removeItem('wingman_customer_token');
  closeAccountModal();
  location.reload();
}

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  // Determine if we're on homepage
  const isHomepage = document.body.classList.contains('homepage');
  
  if (isHomepage) {
    // Start transparent
    header.classList.add('transparent');
    
    // Change to solid on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.remove('transparent');
        header.classList.add('solid');
      } else {
        header.classList.add('transparent');
        header.classList.remove('solid');
      }
      
      lastScroll = currentScroll;
    });
  } else {
    // Always solid on other pages
    header.classList.add('solid');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize header scroll behavior
  initHeaderScroll();
  
  // Cart button
  const cartBtn = document.getElementById('headerCartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }
  
  // Close cart button
  const closeCartBtn = document.getElementById('closeCart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCart);
  }
  
  // Close cart on overlay click
  const cartDrawer = document.getElementById('cartDrawer');
  if (cartDrawer) {
    cartDrawer.addEventListener('click', (e) => {
      if (e.target === cartDrawer) {
        closeCart();
      }
    });
  }
  
  // Account button
  const accountBtn = document.getElementById('headerAccountBtn');
  if (accountBtn) {
    accountBtn.addEventListener('click', showAccountModal);
  }
  
  // Dropdown menu toggle
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest('.nav-dropdown');
      dropdown.classList.toggle('active');
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  });
  
  // Initialize cart count on load
  if (cartId) {
    refreshCart();
  } else {
    updateCartCount(0);
  }
});

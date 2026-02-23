// Wingman Labs - Header & Cart Functionality

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  
  const isHomepage = document.body.classList.contains('homepage') || 
                     window.location.pathname === '/' || 
                     window.location.pathname === '/index.html';
  
  function updateHeaderState() {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('header--solid');
      header.classList.remove('header--transparent');
    } else if (isHomepage) {
      header.classList.remove('header--solid');
      header.classList.add('header--transparent');
    }
  }
  
  if (isHomepage) {
    header.classList.add('header--transparent');
  } else {
    header.classList.add('header--solid');
  }
  
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  if (!menuToggle || !mobileMenu) return;

  function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    menuToggle.classList.add('active');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
    menuToggle.classList.remove('active');
  }

  menuToggle.addEventListener('click', function() {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }
  
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Mobile accordion
  const accordionToggles = document.querySelectorAll('.mobile-accordion-toggle');
  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      this.parentElement.classList.toggle('open');
    });
  });
}

// ============================================
// DESKTOP DROPDOWN
// ============================================

function initDesktopDropdown() {
  const moreDropdown = document.getElementById('moreDropdown');
  if (!moreDropdown) return;
  
  const dropdownToggle = moreDropdown.querySelector('.nav-dropdown-toggle');
  
  moreDropdown.addEventListener('mouseenter', function() {
    this.classList.add('active');
    if (dropdownToggle) {
      dropdownToggle.setAttribute('aria-expanded', 'true');
    }
  });
  
  moreDropdown.addEventListener('mouseleave', function() {
    this.classList.remove('active');
    if (dropdownToggle) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Also handle click for touch devices
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isActive = moreDropdown.classList.contains('active');
      moreDropdown.classList.toggle('active');
      this.setAttribute('aria-expanded', !isActive);
    });
  }
  
  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!moreDropdown.contains(e.target)) {
      moreDropdown.classList.remove('active');
      if (dropdownToggle) {
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// ============================================
// CART MANAGEMENT
// ============================================

let cartId = localStorage.getItem('wingman_cart_id');

function openCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartDrawer) {
    cartDrawer.classList.add('active');
  }
  if (cartOverlay) {
    cartOverlay.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
  
  refreshCart();
}

function closeCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartDrawer) {
    cartDrawer.classList.remove('active');
  }
  if (cartOverlay) {
    cartOverlay.classList.remove('active');
  }
  document.body.style.overflow = '';
}

function initCartDrawer() {
  const cartBtn = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }
  
  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }
  
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }
  
  // Initialize cart count on load
  if (cartId) {
    refreshCart();
  } else {
    updateCartCount(0);
  }
}

// Refresh cart contents
async function refreshCart() {
  try {
    if (!cartId) {
      const cart = await createCart();
      cartId = cart.id;
      localStorage.setItem('wingman_cart_id', cartId);
    }

    const cart = await getCart(cartId);
    
    const totalItems = cart.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0);
    updateCartCount(totalItems);
    
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;
    
    if (cart.lines.edges.length === 0) {
      cartContent.innerHTML = `
        <div class="cart-empty">
          <h3 class="cart-empty-title">Your cart is empty</h3>
          <p>Have an account? <a href="#">Log in</a> to check out faster.</p>
          <a href="/pages/quickbuy.html" class="cart-continue-btn">Continue shopping</a>
        </div>
      `;
      return;
    }
    
    let html = '<div class="cart-items">';
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
    html += '</div>';
    
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    const total = parseFloat(cart.cost.totalAmount.amount);
    
    html += `
      <div class="cart-footer">
        <div class="cart-totals">
          <div class="cart-subtotal"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="cart-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        </div>
        <a href="${cart.checkoutUrl}" class="cart-checkout-btn">Checkout</a>
      </div>
    `;
    
    cartContent.innerHTML = html;
    
  } catch (error) {
    console.error('Failed to refresh cart:', error);
  }
}

function updateCartCount(count = 0) {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }
}

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

async function removeFromCart(lineId) {
  try {
    await removeCartLine(cartId, lineId);
    await refreshCart();
  } catch (error) {
    console.error('Failed to remove item:', error);
    alert('Error removing item');
  }
}

async function addItemToCart(variantId, quantity = 1) {
  try {
    if (!cartId) {
      const cart = await createCart();
      cartId = cart.id;
      localStorage.setItem('wingman_cart_id', cartId);
    }
    
    const result = await addToCart(cartId, variantId, quantity);
    
    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message);
    }
    
    await openCart();
    
  } catch (error) {
    console.error('Failed to add to cart:', error);
    alert('Error adding to cart: ' + error.message);
  }
}

// ============================================
// ACCOUNT
// ============================================

function initAccount() {
  const accountBtn = document.getElementById('accountBtn');
  if (accountBtn) {
    accountBtn.addEventListener('click', showAccountModal);
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('wingman_customer_token');
}

function showAccountModal() {
  const html = `
    <div class="account-modal-overlay" id="accountModal" onclick="if(event.target === this) closeAccountModal()">
      <div class="account-modal">
        <button class="account-modal-close" onclick="closeAccountModal()" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="account-modal-content">
          <h2 class="account-modal-title">Account</h2>
          
          ${isLoggedIn() ? `
            <p class="account-modal-text">You are logged in.</p>
            <button onclick="logout()" class="account-btn account-btn-outline">Log Out</button>
          ` : `
            <p class="account-modal-text">Sign in to track orders and save your preferences.</p>
            
            <!-- Sign in with Shop Button -->
            <button onclick="signInWithShop()" class="shop-pay-btn">
              <svg class="shop-logo" viewBox="0 0 24 24" fill="none">
                <path d="M15.5 8.5c0-1.5-1-3-3.5-3s-3.5 1.5-3.5 3c0 2.5 3.5 2.5 3.5 5 0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 3v18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="0 6"/>
              </svg>
              Sign in with Shop
            </button>
            
            <div class="account-divider">
              <span>or</span>
            </div>
            
            <input type="email" id="loginEmail" placeholder="Email" class="account-input">
            <input type="password" id="loginPassword" placeholder="Password" class="account-input">
            <button onclick="handleLogin()" class="account-btn account-btn-primary">Sign In</button>
            
            <p class="account-modal-footer">
              Don't have an account? <a href="/account/register">Create one</a>
            </p>
          `}
        </div>
      </div>
    </div>
    
    <style>
      .account-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .account-modal {
        background: rgba(26, 29, 35, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 32px;
        max-width: 400px;
        width: 100%;
        position: relative;
      }
      
      .account-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;
      }
      
      .account-modal-close:hover {
        color: #fff;
      }
      
      .account-modal-content {
        text-align: center;
      }
      
      .account-modal-title {
        font-family: 'boucherie-block', sans-serif;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin: 0 0 8px;
        color: #fff;
      }
      
      .account-modal-text {
        color: #888;
        font-size: 14px;
        margin: 0 0 24px;
        line-height: 1.5;
      }
      
      .shop-pay-btn {
        width: 100%;
        padding: 14px 20px;
        background: #5A31F4;
        border: none;
        border-radius: 8px;
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background 0.2s;
      }
      
      .shop-pay-btn:hover {
        background: #4925d1;
      }
      
      .shop-pay-btn .shop-logo {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }
      
      .account-divider {
        display: flex;
        align-items: center;
        margin: 20px 0;
        color: #555;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      
      .account-divider::before,
      .account-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #333;
      }
      
      .account-divider span {
        padding: 0 16px;
      }
      
      .account-input {
        width: 100%;
        padding: 14px 16px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        border-radius: 6px;
        color: #fff;
        font-size: 14px;
        margin-bottom: 12px;
        transition: border-color 0.2s;
      }
      
      .account-input:focus {
        outline: none;
        border-color: #5A31F4;
      }
      
      .account-input::placeholder {
        color: #666;
      }
      
      .account-btn {
        width: 100%;
        padding: 14px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 4px;
      }
      
      .account-btn-primary {
        background: #fff;
        border: none;
        color: #0a0a0a;
      }
      
      .account-btn-primary:hover {
        background: #eee;
      }
      
      .account-btn-outline {
        background: transparent;
        border: 1px solid #fff;
        color: #fff;
      }
      
      .account-btn-outline:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .account-modal-footer {
        margin-top: 20px;
        font-size: 13px;
        color: #666;
      }
      
      .account-modal-footer a {
        color: #fff;
        text-decoration: underline;
      }
    </style>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function signInWithShop() {
  // Redirect to Shopify login
  window.location.href = 'https://thewingmanlabs.com/account/login';
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
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initDesktopDropdown();
  initCartDrawer();
  initAccount();
});

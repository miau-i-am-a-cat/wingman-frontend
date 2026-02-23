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
              <svg width="60" height="24" viewBox="0 0 341 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M227.297 0C220.448 0 214.896 5.47681 214.896 12.2347V69.7653C214.896 76.5261 220.448 82 227.297 82H328.601C335.453 82 341 76.5765 341 69.7653V12.2347C341 5.47681 335.449 0 328.601 0H227.297ZM244.261 55.5765V25.4719H251.497V29.2468C253.087 27.2122 255.333 24.8598 260.122 24.8598C267.755 24.8598 272.345 30.5765 272.345 38.9232V55.5765H264.911V40.466C264.911 35.6SEE13 262.17 32.0832 257.679 32.0832C253.188 32.0832 251.3 35.9632 251.3 40.7617V55.5765H244.261Z" fill="white"/>
                <path d="M281.906 55.5765V25.4719H289.143V29.2468C290.733 27.2122 292.979 24.8598 297.768 24.8598C305.401 24.8598 309.991 30.5765 309.991 38.9232V55.5765H302.557V40.466C302.557 35.6513 299.816 32.0832 295.325 32.0832C290.834 32.0832 288.946 35.9632 288.946 40.7617V55.5765H281.906Z" fill="white"/>
                <path d="M227.396 31.5408C229.834 31.5408 231.81 29.5765 231.81 27.1537C231.81 24.7309 229.834 22.7665 227.396 22.7665C224.958 22.7665 222.982 24.7309 222.982 27.1537C222.982 29.5765 224.958 31.5408 227.396 31.5408Z" fill="white"/>
                <path d="M224.065 55.5765V35.6004H230.906V55.5765H224.065Z" fill="white"/>
                <path d="M78.7048 32.6666C75.6044 31.2921 73.9054 30.2598 73.9054 28.6397C73.9054 26.7054 75.7532 25.4245 78.6063 25.4245C81.7565 25.4245 84.5105 26.8511 84.5105 26.8511L87.1654 19.7568C87.1654 19.7568 83.9158 17.9219 78.6063 17.9219C69.5126 17.9219 63.6079 23.1451 63.6079 30.0912C63.6079 34.3069 66.2628 37.5421 70.7538 39.7967C74.0536 41.4689 75.4048 42.7001 75.4048 44.6667C75.4048 46.6332 73.7555 48.0104 70.9025 48.0104C66.4612 48.0104 62.2171 45.4969 62.2171 45.4969L59.3643 52.6393C59.3643 52.6393 63.3117 55.5 70.5557 55.5C79.9959 55.5 85.998 50.3731 85.998 42.9463C85.998 38.3388 83.0953 35.0049 78.7048 32.6666Z" fill="#95BF47"/>
                <path d="M118.706 17.9701C112.157 17.9701 107.122 20.3827 103.141 24.1723L107.98 30.6258C110.636 28.2132 113.737 26.8361 117.115 26.8361C121.508 26.8361 123.753 28.9957 123.753 32.3296V33.2149H117.363C107.08 33.2149 102.044 37.7298 102.044 44.5285C102.044 50.9332 106.783 55.5486 113.836 55.5486C118.308 55.5486 122.004 53.6308 124.254 50.1495H124.451V54.5176H134.05V33.0672C134.05 23.1932 128.394 17.9701 118.706 17.9701ZM116.859 48.2039C113.489 48.2039 111.69 46.4829 111.69 44.0282C111.69 41.1289 113.934 39.5009 118.126 39.5009H123.753V43.1876C123.753 46.2339 120.554 48.2039 116.859 48.2039Z" fill="#95BF47"/>
                <path d="M158.838 17.9701C147.739 17.9701 140.138 26.1949 140.138 36.7099C140.138 47.6184 148.087 55.5486 159.434 55.5486C165.785 55.5486 171.044 53.3837 174.967 49.0559L168.873 43.2876C166.53 45.8011 163.627 47.2253 159.83 47.2253C154.696 47.2253 150.998 44.3739 150.206 39.8011H176.213C176.311 38.9158 176.361 38.0305 176.361 37.0972C176.361 25.9492 169.305 17.9701 158.838 17.9701ZM150.256 33.0672C151.099 28.8891 154.151 25.8428 158.69 25.8428C163.031 25.8428 165.933 28.7422 166.527 33.0672H150.256Z" fill="#95BF47"/>
                <path d="M199.852 17.9701C194.619 17.9701 190.626 20.4358 188.085 24.0276H187.888V0.982422H177.547V54.5176H187.888V50.1495H188.085C190.626 53.7414 194.619 55.5486 199.852 55.5486C210.457 55.5486 217.809 46.8796 217.809 36.7099C217.809 26.5881 210.457 17.9701 199.852 17.9701ZM197.111 46.8317C191.629 46.8317 187.69 42.3647 187.69 36.7099C187.69 31.0551 191.629 26.6361 197.111 26.6361C202.592 26.6361 206.531 31.0551 206.531 36.7099C206.531 42.3647 202.592 46.8317 197.111 46.8317Z" fill="#95BF47"/>
                <path d="M29.5086 12.5671C28.1326 12.2701 26.7072 12.1226 25.3046 12.1226C17.0554 12.1226 11.6545 17.0929 11.6545 25.7625V27.2379H5.11719V35.4148H11.6545V54.5176H21.9949V35.4148H29.4118L30.6143 27.2379H21.9949V26.1556C21.9949 23.0614 23.6189 21.2435 26.7093 21.2435C27.6885 21.2435 28.7898 21.3907 29.5095 21.5379V12.5671H29.5086Z" fill="#95BF47"/>
              </svg>
              <span>Sign in with Shop</span>
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
        gap: 10px;
        transition: background 0.2s;
      }
      
      .shop-pay-btn:hover {
        background: #4925d1;
      }
      
      .shop-pay-btn svg {
        height: 20px;
        width: auto;
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

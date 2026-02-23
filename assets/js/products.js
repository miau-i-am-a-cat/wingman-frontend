// Wingman Labs - Product Page JavaScript
// Handles gallery, tabs, pack selection, quantity, and cart integration

(function() {
  'use strict';

  // ============================================
  // Product Configuration
  // ============================================
  
  const VARIANT_IDS = {
    energy: {
      onetime: 'gid://shopify/ProductVariant/41598607786078',
      subscribe: 'gid://shopify/ProductVariant/41598607786078'
    },
    sleep: {
      onetime: 'gid://shopify/ProductVariant/41598597627998',
      subscribe: 'gid://shopify/ProductVariant/41598597627998'
    },
    bundle: 'gid://shopify/ProductVariant/41598613291102'
  };

  // Detect which product page we're on
  const productPage = document.querySelector('[data-product]');
  const productType = productPage ? productPage.dataset.product : 'energy';
  const isEnergy = productType === 'energy';
  const isSleep = productType === 'sleep';

  // ============================================
  // State
  // ============================================
  
  let state = {
    currentImageIndex: 0,
    totalImages: 5,
    currentTab: 'subscribe',
    subscribeQuantity: 1,
    touchStartX: 0,
    touchEndX: 0,
    selections: {
      onetime: { packs: 1, price: 22.99, quantity: 1, isBundle: false },
      subscribe: { quantity: 1, price: 19.99 },
      bundle: { price: 29.99 }
    }
  };

  // ============================================
  // DOM Elements
  // ============================================
  
  const elements = {
    galleryMain: document.getElementById('galleryMain'),
    gallerySlider: document.getElementById('gallerySlider'),
    galleryThumbs: document.getElementById('galleryThumbs'),
    galleryNav: document.getElementById('galleryNav'),
    imageCounter: document.getElementById('imageCounter'),
    zoomOverlay: document.getElementById('zoomOverlay'),
    zoomImage: document.getElementById('zoomImage'),
    zoomClose: document.getElementById('zoomClose'),
    tabNav: document.getElementById('tabNav'),
    packOptions: document.getElementById('packOptions'),
    qtySelector: document.getElementById('qtySelector'),
    detailsSection: document.getElementById('detailsSection')
  };

  // ============================================
  // Gallery Functions
  // ============================================
  
  function setImage(index) {
    state.currentImageIndex = index;
    updateGallery();
  }

  function navigateImage(direction) {
    state.currentImageIndex += direction;
    if (state.currentImageIndex < 0) state.currentImageIndex = state.totalImages - 1;
    if (state.currentImageIndex >= state.totalImages) state.currentImageIndex = 0;
    updateGallery();
  }

  function updateGallery() {
    // Update counter
    if (elements.imageCounter) {
      elements.imageCounter.textContent = `${state.currentImageIndex + 1}/${state.totalImages}`;
    }

    // Update thumbnails
    const thumbs = document.querySelectorAll('.gallery-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === state.currentImageIndex);
    });

    // Update slider position
    if (elements.gallerySlider) {
      elements.gallerySlider.style.transform = `translateX(-${state.currentImageIndex * 100}%)`;
    }
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = state.touchStartX - state.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        navigateImage(1);
      } else {
        navigateImage(-1);
      }
    }
  }

  function openZoom() {
    const slides = document.querySelectorAll('.gallery-slide img');
    const currentImage = slides[state.currentImageIndex];
    if (!currentImage) return;

    // Load high-res version
    const src = currentImage.src.replace(/&width=\d+/, '&width=1200');
    elements.zoomImage.src = src;
    elements.zoomOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeZoom() {
    elements.zoomOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============================================
  // Tab Functions
  // ============================================
  
  function switchTab(tab, button) {
    state.currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const tabContent = document.getElementById(`${tab}-tab`);
    if (tabContent) tabContent.classList.add('active');
  }

  // ============================================
  // Pack Selection Functions
  // ============================================
  
  function selectPack(packs, button) {
    // Update button states
    const buttons = document.querySelectorAll('.pack-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    let price, perStrip, desc, comparePrice, quantity, isBundle;
    const badgesEl = document.getElementById('onetime-badges');
    const compareEl = document.getElementById('onetime-compare');
    const descEl = document.getElementById('onetime-desc');

    switch(packs) {
      case 1:
        price = 22.99;
        perStrip = 0.77;
        desc = '30 strips • + $5.99 SHIPPING';
        comparePrice = '$32';
        quantity = 1;
        isBundle = false;
        if (badgesEl) badgesEl.innerHTML = `<span class="price-per-strip">$${perStrip.toFixed(2)} PER STRIP</span>`;
        if (descEl) descEl.className = 'price-desc shipping-emphasis';
        break;
      case 2:
        price = 39.08;
        perStrip = 0.65;
        desc = '60 strips • Free shipping';
        comparePrice = '$64';
        quantity = 2;
        isBundle = false;
        if (badgesEl) badgesEl.innerHTML = `<span class="price-per-strip">$${perStrip.toFixed(2)} PER STRIP</span><span class="free-shipping-badge inline">FREE SHIPPING</span>`;
        if (descEl) descEl.className = 'price-desc';
        break;
      case 3:
        price = 39.08;
        perStrip = 0.65;
        desc = isEnergy 
          ? '60 strips • Free shipping • 1 pack <span class="underline-energy">Energy</span> + 1 pack <span class="underline-sleep">Sleep</span>'
          : '60 strips • Free shipping • 1 pack <span class="underline-sleep">Sleep</span> + 1 pack <span class="underline-energy">Energy</span>';
        comparePrice = '$64';
        quantity = 2;
        isBundle = true;
        if (badgesEl) badgesEl.innerHTML = `<span class="price-per-strip">$${perStrip.toFixed(2)} PER STRIP</span><span class="free-shipping-badge inline">FREE SHIPPING</span>`;
        if (descEl) descEl.className = 'price-desc';
        break;
    }

    state.selections.onetime = { packs, price, quantity, isBundle };

    // Update display
    const priceEl = document.getElementById('onetime-price');
    const ctaEl = document.getElementById('onetime-cta');

    if (priceEl) priceEl.textContent = `$${price.toFixed(2)}`;
    if (compareEl) compareEl.textContent = comparePrice;
    if (descEl) descEl.innerHTML = desc;
    if (ctaEl) ctaEl.textContent = `BUY NOW — $${price.toFixed(2)}`;
  }

  // ============================================
  // Subscribe Quantity Functions
  // ============================================
  
  function updateSubscribeQuantity(change) {
    const newQty = Math.max(1, Math.min(10, state.subscribeQuantity + change));
    if (newQty === state.subscribeQuantity) return;

    state.subscribeQuantity = newQty;
    state.selections.subscribe.quantity = newQty;

    // Update display
    const qtyDisplay = document.getElementById('qty-display');
    if (qtyDisplay) qtyDisplay.textContent = newQty;

    // Update prices
    const totalPrice = (19.99 * newQty).toFixed(2);
    const comparePrice = 32 * newQty;
    const totalStrips = 30 * newQty;

    const priceEl = document.getElementById('subscribe-price');
    const compareEl = document.getElementById('subscribe-compare');
    const descEl = document.getElementById('subscribe-desc');
    const ctaEl = document.getElementById('subscribe-cta');

    if (priceEl) priceEl.textContent = `$${totalPrice}`;
    if (compareEl) compareEl.textContent = `$${comparePrice}`;
    if (descEl) descEl.textContent = `${totalStrips} strips • Deliver every 30 days • Cancel anytime`;
    if (ctaEl) ctaEl.textContent = `SUBSCRIBE — $${totalPrice}/mo`;

    // Update button states
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');

    if (minusBtn) minusBtn.disabled = newQty <= 1;
    if (plusBtn) plusBtn.disabled = newQty >= 10;
  }

  // ============================================
  // Details Accordion
  // ============================================
  
  function toggleDetail(row) {
    // Close other open details
    document.querySelectorAll('.detail-row').forEach(r => {
      if (r !== row) r.classList.remove('open');
    });
    row.classList.toggle('open');
  }

  // ============================================
  // Cart Functions
  // ============================================
  
  async function handleAddToCart(action, buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    // Set loading state
    button.disabled = true;
    button.classList.add('cart-loading');
    const originalText = button.textContent;
    button.textContent = 'Adding...';

    try {
      let variantId, quantity;

      switch(action) {
        case 'add-onetime':
          if (state.selections.onetime.isBundle) {
            // Add both products
            const energyId = VARIANT_IDS.energy.onetime;
            const sleepId = VARIANT_IDS.sleep.onetime;
            await addItemToCart(energyId, 1);
            await addItemToCart(sleepId, 1);
          } else {
            variantId = VARIANT_IDS[productType].onetime;
            quantity = state.selections.onetime.quantity;
            await addItemToCart(variantId, quantity);
          }
          break;

        case 'add-subscribe':
          variantId = VARIANT_IDS[productType].subscribe;
          quantity = state.selections.subscribe.quantity;
          await addItemToCart(variantId, quantity);
          break;

        case 'add-bundle':
          variantId = VARIANT_IDS.bundle;
          await addItemToCart(variantId, 1);
          break;
      }

      // Success state
      button.classList.remove('cart-loading');
      button.classList.add('cart-success');
      button.textContent = '✓ Added to Cart!';

      setTimeout(() => {
        button.classList.remove('cart-success');
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Error adding to cart:', error);
      button.classList.remove('cart-loading');
      button.textContent = 'Error - Try Again';
      button.disabled = false;
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  }

  async function handleQuickBuy(action) {
    try {
      let variantId, quantity;

      switch(action) {
        case 'quickbuy-onetime':
          if (state.selections.onetime.isBundle) {
            const energyId = VARIANT_IDS.energy.onetime;
            const sleepId = VARIANT_IDS.sleep.onetime;
            await addItemToCart(energyId, 1);
            await addItemToCart(sleepId, 1);
          } else {
            variantId = VARIANT_IDS[productType].onetime;
            quantity = state.selections.onetime.quantity;
            await addItemToCart(variantId, quantity);
          }
          break;

        case 'subscribe':
          variantId = VARIANT_IDS[productType].subscribe;
          quantity = state.selections.subscribe.quantity;
          await addItemToCart(variantId, quantity);
          break;

        case 'bundle':
          variantId = VARIANT_IDS.bundle;
          await addItemToCart(variantId, 1);
          break;
      }

      // Redirect to checkout (openCart is called by addItemToCart)
    } catch (error) {
      console.error('Quick buy error:', error);
      alert('Error processing your order. Please try again.');
    }
  }

  // ============================================
  // Event Binding
  // ============================================
  
  function bindEvents() {
    // Gallery thumbnail clicks
    if (elements.galleryThumbs) {
      elements.galleryThumbs.addEventListener('click', (e) => {
        const thumb = e.target.closest('.gallery-thumb');
        if (thumb && thumb.dataset.index !== undefined) {
          setImage(parseInt(thumb.dataset.index, 10));
        }
      });
    }

    // Gallery navigation
    if (elements.galleryNav) {
      elements.galleryNav.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-nav]');
        if (btn) {
          navigateImage(parseInt(btn.dataset.nav, 10));
        }
      });
    }

    // Touch/swipe support
    if (elements.galleryMain) {
      elements.galleryMain.addEventListener('touchstart', (e) => {
        state.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      elements.galleryMain.addEventListener('touchend', (e) => {
        state.touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      // Click to zoom on mobile
      elements.galleryMain.addEventListener('click', () => {
        if (window.innerWidth <= 767) {
          openZoom();
        }
      });
    }

    // Zoom close
    if (elements.zoomClose) {
      elements.zoomClose.addEventListener('click', closeZoom);
    }

    if (elements.zoomOverlay) {
      elements.zoomOverlay.addEventListener('click', (e) => {
        if (e.target === elements.zoomOverlay) {
          closeZoom();
        }
      });
    }

    // Tab switching
    if (elements.tabNav) {
      elements.tabNav.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tab]');
        if (btn) {
          switchTab(btn.dataset.tab, btn);
        }
      });
    }

    // Pack selection
    if (elements.packOptions) {
      elements.packOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pack]');
        if (btn) {
          selectPack(parseInt(btn.dataset.pack, 10), btn);
        }
      });
    }

    // Quantity controls
    if (elements.qtySelector) {
      elements.qtySelector.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-qty-action]');
        if (btn) {
          const action = btn.dataset.qtyAction;
          updateSubscribeQuantity(action === 'plus' ? 1 : -1);
        }
      });
    }

    // Details accordion
    if (elements.detailsSection) {
      elements.detailsSection.addEventListener('click', (e) => {
        const row = e.target.closest('.detail-row');
        if (row) {
          toggleDetail(row);
        }
      });
    }

    // Action buttons (add to cart, buy now, etc.)
    document.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;

        switch(action) {
          case 'add-onetime':
            handleAddToCart(action, 'onetime-add-cart');
            break;
          case 'add-subscribe':
            handleAddToCart(action, 'subscribe-add-cart');
            break;
          case 'add-bundle':
            handleAddToCart(action, 'bundle-add-cart');
            break;
          case 'quickbuy-onetime':
          case 'subscribe':
          case 'bundle':
            handleQuickBuy(action);
            break;
          case 'promo':
            const code = prompt('Enter promo code:');
            if (code) {
              alert('Promo code will be applied at checkout.');
            }
            break;
        }
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (elements.zoomOverlay && elements.zoomOverlay.classList.contains('active')) {
        if (e.key === 'Escape') {
          closeZoom();
        }
      }

      // Arrow keys for gallery when focused
      if (document.activeElement === elements.galleryMain || 
          document.activeElement.closest('.gallery-thumbs')) {
        if (e.key === 'ArrowLeft') {
          navigateImage(-1);
        } else if (e.key === 'ArrowRight') {
          navigateImage(1);
        }
      }
    });
  }

  // ============================================
  // Initialize
  // ============================================
  
  function init() {
    bindEvents();
    updateGallery();

    // Set initial quantity button state
    const minusBtn = document.getElementById('qty-minus');
    if (minusBtn) minusBtn.disabled = true;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

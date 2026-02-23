/**
 * Wingman Labs - Energy Product Page JavaScript
 * All page-specific functionality extracted from original
 */

(function() {
    'use strict';

    // ===========================================
    // SECTION 1: MAIN PRODUCT SECTION
    // WingmanEnergyStrips - Gallery, tabs, cart
    // ===========================================

    var WingmanEnergyStrips = {
        // Product Configuration
        ENERGY_VARIANT_ID: 41598607786078,
        ENERGY_SELLING_PLAN_ID: 6146981982,
        WINGMAN_BUNDLE_VARIANT_ID: 41598613291102,
        WINGMAN_BUNDLE_SELLING_PLAN_ID: 6147047518,
        SLEEP_VARIANT_ID: 41598597627998,
        
        // State
        currentImageIndex: 0,
        touchStartX: 0,
        touchEndX: 0,
        currentTab: 'subscribe',
        subscribeQuantity: 1,
        selections: {
            onetime: { packs: 1, price: 22.99, quantity: 1, isBundle: false },
            subscribe: { quantity: 1, price: 19.99 },
            exclusive: { packs: 2, price: 29.99, quantity: 1 }
        },
        
        // Initialize
        init: function() {
            this.bindEvents();
        },
        
        // Bind all events using event delegation
        bindEvents: function() {
            var self = this;
            var container = document.querySelector('.wingman-energy-container');
            if (!container) return;
            
            // Event delegation for thumbnail clicks
            var thumbStrip = document.getElementById('energyThumbStrip');
            if (thumbStrip) {
                thumbStrip.addEventListener('click', function(e) {
                    var thumb = e.target.closest('.wm-thumb-box');
                    if (thumb && thumb.dataset.energyIndex !== undefined) {
                        self.setImage(parseInt(thumb.dataset.energyIndex, 10));
                    }
                });
            }
            
            // Event delegation for navigation buttons
            var galleryNav = document.getElementById('energyGalleryNav');
            if (galleryNav) {
                galleryNav.addEventListener('click', function(e) {
                    var btn = e.target.closest('[data-energy-nav]');
                    if (btn) {
                        self.navigateImage(parseInt(btn.dataset.energyNav, 10));
                    }
                });
            }
            
            // Touch/Swipe support with passive listeners
            var galleryMain = document.getElementById('energyGalleryMain');
            if (galleryMain) {
                galleryMain.addEventListener('touchstart', function(e) {
                    self.touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });
                
                galleryMain.addEventListener('touchend', function(e) {
                    self.touchEndX = e.changedTouches[0].screenX;
                    self.handleSwipe();
                }, { passive: true });
                
                // Click to zoom on mobile
                galleryMain.addEventListener('click', function() {
                    if (window.innerWidth <= 500) {
                        self.openZoom();
                    }
                });
            }
            
            // Zoom controls
            var zoomClose = document.getElementById('energyZoomClose');
            if (zoomClose) {
                zoomClose.addEventListener('click', function() { self.closeZoom(); });
            }
            
            var zoomOverlay = document.getElementById('energyZoomOverlay');
            if (zoomOverlay) {
                zoomOverlay.addEventListener('click', function(e) {
                    if (e.target === zoomOverlay) {
                        self.closeZoom();
                    }
                });
            }
            
            // Event delegation for tab switching
            var tabNav = document.getElementById('energyTabNav');
            if (tabNav) {
                tabNav.addEventListener('click', function(e) {
                    var btn = e.target.closest('[data-energy-tab]');
                    if (btn) {
                        self.switchTab(btn.dataset.energyTab, btn);
                    }
                });
            }
            
            // Event delegation for pack selection
            var packOptions = document.getElementById('energyPackOptions');
            if (packOptions) {
                packOptions.addEventListener('click', function(e) {
                    var btn = e.target.closest('[data-energy-pack]');
                    if (btn) {
                        self.selectPack('onetime', parseInt(btn.dataset.energyPack, 10), btn);
                    }
                });
            }
            
            // Event delegation for quantity controls
            var qtySelector = document.getElementById('energyQtySelector');
            if (qtySelector) {
                qtySelector.addEventListener('click', function(e) {
                    var btn = e.target.closest('[data-energy-qty-action]');
                    if (btn) {
                        var action = btn.dataset.energyQtyAction;
                        self.updateSubscribeQuantity(action === 'plus' ? 1 : -1);
                    }
                });
            }
            
            // Event delegation for detail toggles
            var detailsSection = document.getElementById('energyDetailsSection');
            if (detailsSection) {
                detailsSection.addEventListener('click', function(e) {
                    var row = e.target.closest('[data-energy-detail]');
                    if (row) {
                        self.toggleDetail(row);
                    }
                });
            }
            
            // Event delegation for action buttons (container-wide)
            container.addEventListener('click', function(e) {
                var actionBtn = e.target.closest('[data-energy-action]');
                if (actionBtn) {
                    self.handleAction(actionBtn.dataset.energyAction);
                }
            });
        },
        
        // Zoom functions
        openZoom: function() {
            var slides = document.querySelectorAll('.wm-gallery-slide');
            var currentSlide = slides[this.currentImageIndex];
            var currentImage = currentSlide.querySelector('img');
            if (!currentImage) return;
            
            var zoomOverlay = document.getElementById('energyZoomOverlay');
            var zoomImage = document.getElementById('energyZoomImage');
            
            if (zoomOverlay && zoomImage) {
                // Load high-res version for zoom
                var src = currentImage.src.replace(/&width=\d+/, '&width=1200');
                zoomImage.src = src;
                zoomOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        closeZoom: function() {
            var zoomOverlay = document.getElementById('energyZoomOverlay');
            if (zoomOverlay) {
                zoomOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        },
        
        // Gallery functions
        setImage: function(index) {
            this.currentImageIndex = index;
            this.updateGallery();
        },
        
        navigateImage: function(direction) {
            this.currentImageIndex += direction;
            if (this.currentImageIndex < 0) this.currentImageIndex = 4;
            if (this.currentImageIndex > 4) this.currentImageIndex = 0;
            this.updateGallery();
        },
        
        updateGallery: function() {
            var container = document.querySelector('.wingman-energy-container');
            
            // Update counter
            var counter = container.querySelector('.wm-image-counter');
            if (counter) {
                counter.textContent = (this.currentImageIndex + 1) + '/5';
            }
            
            // Update thumbnails
            var self = this;
            container.querySelectorAll('.wm-thumb-box').forEach(function(thumb, i) {
                thumb.classList.toggle('active', i === self.currentImageIndex);
            });
            
            // Update slider position
            var slider = document.getElementById('energyGallerySlider');
            if (slider) {
                slider.style.transform = 'translateX(-' + (this.currentImageIndex * 100) + '%)';
            }
        },
        
        handleSwipe: function() {
            var swipeThreshold = 50;
            var diff = this.touchStartX - this.touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.navigateImage(1);
                } else {
                    this.navigateImage(-1);
                }
            }
        },
        
        // Tab switching
        switchTab: function(tab, button) {
            var container = document.querySelector('.wingman-energy-container');
            this.currentTab = tab;
            
            // Update tab buttons
            container.querySelectorAll('.wm-tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
            button.classList.add('active');
            
            // Update tab content
            container.querySelectorAll('.wm-tab-content').forEach(function(content) { content.classList.remove('active'); });
            var tabContent = container.querySelector('#energy-' + tab + '-tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }
        },
        
        // Subscribe quantity update
        updateSubscribeQuantity: function(change) {
            var newQty = Math.max(1, Math.min(10, this.subscribeQuantity + change));
            
            if (newQty === this.subscribeQuantity) return;
            
            this.subscribeQuantity = newQty;
            this.selections.subscribe.quantity = newQty;
            
            // Update display
            var qtyDisplay = document.getElementById('energy-qty-display');
            if (qtyDisplay) {
                qtyDisplay.textContent = newQty;
            }
            
            // Update prices
            var totalPrice = (19.99 * newQty).toFixed(2);
            var comparePrice = 32 * newQty;
            var totalStrips = 30 * newQty;
            
            var priceEl = document.getElementById('energy-subscribe-price');
            var compareEl = document.getElementById('energy-subscribe-compare');
            var descEl = document.getElementById('energy-subscribe-desc');
            var ctaEl = document.getElementById('energy-subscribe-cta');
            
            if (priceEl) priceEl.textContent = '$' + totalPrice;
            if (compareEl) compareEl.textContent = '$' + comparePrice;
            if (descEl) descEl.textContent = totalStrips + ' strips • Deliver every 30 days • Cancel anytime';
            if (ctaEl) ctaEl.textContent = 'SUBSCRIBE — $' + totalPrice + '/mo';
            
            // Update button states
            var minusBtn = document.getElementById('energy-qty-minus');
            var plusBtn = document.getElementById('energy-qty-plus');
            
            if (minusBtn) minusBtn.disabled = newQty <= 1;
            if (plusBtn) plusBtn.disabled = newQty >= 10;
        },
        
        // Pack selection
        selectPack: function(tab, packs, button) {
            var container = document.querySelector('.wingman-energy-container');
            var buttons = button.parentElement.querySelectorAll('.wm-pack-btn');
            buttons.forEach(function(btn) { btn.classList.remove('active'); });
            button.classList.add('active');
            
            if (tab === 'onetime') {
                var price, perStrip, desc, comparePrice, quantity, isBundle;
                var badgesRow = container.querySelector('#energy-onetime-badges');
                var compareEl = container.querySelector('#energy-onetime-compare');
                
                switch(packs) {
                    case 1:
                        price = 22.99;
                        perStrip = 0.77;
                        desc = '30 strips • + $5.99 SHIPPING';
                        comparePrice = '$32';
                        quantity = 1;
                        isBundle = false;
                        badgesRow.innerHTML = '<span class="wm-price-per-strip">$' + perStrip.toFixed(2) + ' PER STRIP</span>';
                        compareEl.textContent = comparePrice;
                        compareEl.style.display = 'inline';
                        container.querySelector('#energy-onetime-desc').className = 'wm-price-desc wm-shipping-emphasis';
                        break;
                    case 2:
                        price = 39.08;
                        perStrip = 0.65;
                        desc = '60 strips • Free shipping';
                        comparePrice = '$64';
                        quantity = 2;
                        isBundle = false;
                        badgesRow.innerHTML = '<span class="wm-price-per-strip">$' + perStrip.toFixed(2) + ' PER STRIP</span><span class="wm-free-shipping-badge inline">FREE SHIPPING</span>';
                        compareEl.textContent = comparePrice;
                        compareEl.style.display = 'inline';
                        container.querySelector('#energy-onetime-desc').className = 'wm-price-desc';
                        break;
                    case 3:
                        price = 39.08;
                        perStrip = 0.65;
                        desc = '60 strips • Free shipping • 1 pack <span class="wm-underline-orange">Energy</span> + 1 pack <span class="wm-underline-purple">Sleep</span>';
                        comparePrice = '$64';
                        quantity = 2;
                        isBundle = true;
                        badgesRow.innerHTML = '<span class="wm-price-per-strip">$' + perStrip.toFixed(2) + ' PER STRIP</span><span class="wm-free-shipping-badge inline">FREE SHIPPING</span>';
                        compareEl.textContent = comparePrice;
                        compareEl.style.display = 'inline';
                        container.querySelector('#energy-onetime-desc').className = 'wm-price-desc';
                        break;
                }
                
                this.selections.onetime = { packs: packs, price: price, quantity: quantity, isBundle: isBundle };
                container.querySelector('#energy-onetime-price').textContent = '$' + price.toFixed(2);
                container.querySelector('#energy-onetime-desc').innerHTML = desc;
                container.querySelector('#energy-onetime-cta').textContent = 'BUY NOW — $' + price.toFixed(2);
            }
        },
        
        // Detail toggle
        toggleDetail: function(element) {
            var container = document.querySelector('.wingman-energy-container');
            var allRows = container.querySelectorAll('.wm-detail-row');
            allRows.forEach(function(row) {
                if (row !== element) row.classList.remove('open');
            });
            element.classList.toggle('open');
        },
        
        // Handle actions
        handleAction: function(action) {
            switch(action) {
                case 'quickbuy-onetime':
                    this.quickBuyOneTime();
                    break;
                case 'add-onetime':
                    this.cartManager.addOneTimeToCart();
                    break;
                case 'subscribe':
                    this.subscribeToProduct();
                    break;
                case 'add-subscribe':
                    this.cartManager.addSubscriptionToCart();
                    break;
                case 'bundle':
                    this.joinWingmanBundle();
                    break;
                case 'add-bundle':
                    this.cartManager.addBundleToCart();
                    break;
                case 'promo':
                    this.showPromoCode();
                    break;
            }
        },
        
        // Cart Manager
        cartManager: {
            isUpdating: false,
            
            getSectionIds: function() {
                var components = document.querySelectorAll('cart-items-component');
                return Array.from(components).map(function(c) { return c.dataset.sectionId; }).filter(Boolean);
            },
            
            updateCartCount: function() {
                return fetch('/cart.js')
                    .then(function(response) { return response.json(); })
                    .then(function(cart) {
                        document.querySelectorAll('.cart-count, .cart-count-bubble, [data-cart-count]').forEach(function(el) {
                            el.textContent = cart.item_count;
                        });
                    })
                    .catch(function(error) {
                        console.error('Error updating cart count:', error);
                    });
            },
            
            dispatchCartUpdate: function(data) {
                var event = new CustomEvent('cart:update', {
                    detail: {
                        resource: data.items ? data.items[0] : {},
                        sourceId: 'add-to-cart',
                        data: {
                            source: 'product-form',
                            itemCount: data.item_count || 1,
                            productId: data.product_id,
                            sections: data.sections
                        }
                    }
                });
                document.dispatchEvent(event);
            },
            
            openCartDrawer: function() {
                var triggers = [
                    '[data-cart-drawer-trigger]',
                    '.js-drawer-open-cart',
                    '.cart-drawer-toggle',
                    '.cart-icon',
                    '[href="/cart"]'
                ];

                for (var i = 0; i < triggers.length; i++) {
                    var trigger = document.querySelector(triggers[i]);
                    if (trigger) {
                        trigger.click();
                        break;
                    }
                }

                var drawer = document.querySelector('#CartDrawer, .cart-drawer, [data-cart-drawer]');
                if (drawer) {
                    drawer.classList.add('active', 'is-open');
                }
            },
            
            addToCart: function(variantId, quantity, sellingPlan, buttonId) {
                var self = this;
                if (this.isUpdating) return;
                this.isUpdating = true;
                
                var container = document.querySelector('.wingman-energy-container');
                var button = buttonId ? container.querySelector('#' + buttonId) : null;
                if (button) {
                    button.classList.add('wm-cart-loading');
                    button.disabled = true;
                }
                
                var sectionIds = this.getSectionIds();
                var formData = new FormData();
                
                formData.append('id', variantId);
                formData.append('quantity', quantity);
                
                if (sellingPlan) {
                    formData.append('selling_plan', sellingPlan);
                }
                
                if (sectionIds.length > 0) {
                    formData.append('sections', sectionIds.join(','));
                }
                
                fetch('/cart/add.js', {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) {
                    if (!response.ok) throw new Error('Failed to add to cart');
                    return response.json();
                })
                .then(function(data) {
                    return self.updateCartCount().then(function() { return data; });
                })
                .then(function(data) {
                    if (data.sections) {
                        self.dispatchCartUpdate(data);
                    }
                    
                    if (button) {
                        button.classList.remove('wm-cart-loading');
                        button.classList.add('wm-cart-success');
                        button.textContent = '✓ Added to Cart!';
                        
                        setTimeout(function() {
                            button.classList.remove('wm-cart-success');
                            button.textContent = 'Add to Cart';
                            button.disabled = false;
                        }, 2000);
                    }
                    
                    self.openCartDrawer();
                })
                .catch(function(error) {
                    console.error('Error adding to cart:', error);
                    if (button) {
                        button.classList.remove('wm-cart-loading');
                        button.textContent = 'Error - Try Again';
                        button.disabled = false;
                        setTimeout(function() {
                            button.textContent = 'Add to Cart';
                        }, 2000);
                    }
                })
                .finally(function() {
                    self.isUpdating = false;
                });
            },
            
            addBundleProducts: function(buttonId) {
                var self = this;
                if (this.isUpdating) return;
                this.isUpdating = true;
                
                var container = document.querySelector('.wingman-energy-container');
                var button = buttonId ? container.querySelector('#' + buttonId) : null;
                if (button) {
                    button.classList.add('wm-cart-loading');
                    button.disabled = true;
                }
                
                var sectionIds = this.getSectionIds();
                var formData = new FormData();
                
                if (sectionIds.length > 0) {
                    formData.append('sections', sectionIds.join(','));
                }
                
                formData.append('items[0][id]', WingmanEnergyStrips.ENERGY_VARIANT_ID);
                formData.append('items[0][quantity]', '1');
                formData.append('items[1][id]', WingmanEnergyStrips.SLEEP_VARIANT_ID);
                formData.append('items[1][quantity]', '1');
                
                fetch('/cart/add.js', {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) {
                    if (!response.ok) throw new Error('Failed to add bundle');
                    return response.json();
                })
                .then(function(data) {
                    return self.updateCartCount().then(function() { return data; });
                })
                .then(function(data) {
                    if (data.sections) {
                        self.dispatchCartUpdate(data);
                    }
                    
                    if (button) {
                        button.classList.remove('wm-cart-loading');
                        button.classList.add('wm-cart-success');
                        button.textContent = '✓ Added to Cart!';
                        
                        setTimeout(function() {
                            button.classList.remove('wm-cart-success');
                            button.textContent = 'Add to Cart';
                            button.disabled = false;
                        }, 2000);
                    }
                    
                    self.openCartDrawer();
                })
                .catch(function(error) {
                    console.error('Error adding bundle:', error);
                    if (button) {
                        button.classList.remove('wm-cart-loading');
                        button.textContent = 'Error - Try Again';
                        button.disabled = false;
                        setTimeout(function() {
                            button.textContent = 'Add to Cart';
                        }, 2000);
                    }
                })
                .finally(function() {
                    self.isUpdating = false;
                });
            },
            
            addOneTimeToCart: function() {
                var isBundle = WingmanEnergyStrips.selections.onetime.isBundle;
                
                if (isBundle) {
                    this.addBundleProducts('energy-onetime-add-cart');
                } else {
                    this.addToCart(WingmanEnergyStrips.ENERGY_VARIANT_ID, WingmanEnergyStrips.selections.onetime.quantity, null, 'energy-onetime-add-cart');
                }
            },
            
            addSubscriptionToCart: function() {
                this.addToCart(
                    WingmanEnergyStrips.ENERGY_VARIANT_ID, 
                    WingmanEnergyStrips.selections.subscribe.quantity, 
                    WingmanEnergyStrips.ENERGY_SELLING_PLAN_ID, 
                    'energy-subscribe-add-cart'
                );
            },
            
            addBundleToCart: function() {
                this.addToCart(WingmanEnergyStrips.WINGMAN_BUNDLE_VARIANT_ID, 1, WingmanEnergyStrips.WINGMAN_BUNDLE_SELLING_PLAN_ID, 'energy-bundle-add-cart');
            }
        },
        
        // Quick buy functions
        quickBuyOneTime: function() {
            var isBundle = this.selections.onetime.isBundle;
            var self = this;
            
            if (isBundle) {
                fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [
                            { id: this.ENERGY_VARIANT_ID, quantity: 1 },
                            { id: this.SLEEP_VARIANT_ID, quantity: 1 }
                        ]
                    })
                })
                .then(function() { window.location.href = '/checkout'; })
                .catch(function(error) { console.error('Error:', error); });
            } else {
                fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [{
                            id: this.ENERGY_VARIANT_ID,
                            quantity: this.selections.onetime.quantity
                        }]
                    })
                })
                .then(function() { window.location.href = '/checkout'; })
                .catch(function(error) { console.error('Error:', error); });
            }
        },
        
        subscribeToProduct: function() {
            fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{
                        id: this.ENERGY_VARIANT_ID,
                        quantity: this.selections.subscribe.quantity,
                        selling_plan: this.ENERGY_SELLING_PLAN_ID
                    }]
                })
            })
            .then(function() { window.location.href = '/checkout'; })
            .catch(function(error) { console.error('Error:', error); });
        },
        
        joinWingmanBundle: function() {
            fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{
                        id: this.WINGMAN_BUNDLE_VARIANT_ID,
                        quantity: 1,
                        selling_plan: this.WINGMAN_BUNDLE_SELLING_PLAN_ID
                    }]
                })
            })
            .then(function() { window.location.href = '/checkout'; })
            .catch(function(error) { console.error('Error:', error); });
        },
        
        showPromoCode: function() {
            var code = prompt('Enter promo code:');
            if (code && this.currentTab === 'onetime') {
                fetch('/discount/' + code)
                    .then(function() { alert('Promo code applied!'); })
                    .catch(function() { alert('Invalid promo code'); });
            }
        }
    };


    // ===========================================
    // SECTION 2: CAFFEINE BANNER SECTION
    // Rotating value props with progress dots
    // ===========================================

    var CaffeineBanner = {
        props: null,
        dots: null,
        currentIndex: 0,
        interval: 4000,
        timer: null,

        init: function() {
            this.props = document.querySelectorAll('.caffeine-banner-section .value-prop');
            this.dots = document.querySelectorAll('.caffeine-banner-section .progress-dot');
            
            if (this.props.length === 0) return;
            
            var self = this;
            
            // Event delegation for dots
            var progressTrack = document.querySelector('.caffeine-banner-section .progress-track');
            if (progressTrack) {
                progressTrack.addEventListener('click', function(e) {
                    var dot = e.target.closest('.progress-dot');
                    if (dot) {
                        var index = Array.from(self.dots).indexOf(dot);
                        if (index !== -1) {
                            self.showProp(index);
                            self.startTimer();
                        }
                    }
                });
            }
            
            this.startTimer();
        },

        showProp: function(index) {
            var self = this;
            this.props.forEach(function(prop, i) {
                prop.classList.remove('active');
                if (i === index) prop.classList.add('active');
            });

            this.dots.forEach(function(dot, i) {
                dot.classList.remove('active', 'complete');
                if (i < index) dot.classList.add('complete');
                else if (i === index) dot.classList.add('active');
            });

            this.currentIndex = index;
        },

        nextProp: function() {
            this.showProp((this.currentIndex + 1) % this.props.length);
        },

        startTimer: function() {
            var self = this;
            clearInterval(this.timer);
            this.timer = setInterval(function() {
                self.nextProp();
            }, this.interval);
        }
    };


    // ===========================================
    // SECTION 3: ENERGY STATS SECTION
    // Animated bar charts and hero stat cards
    // ===========================================

    var EnergyStats = {
        init: function() {
            this.setupIntersectionObserver();
            this.setupMobileScrollListeners();
            this.setupResizeHandler();
        },

        // Throttle utility
        throttle: function(func, limit) {
            var inThrottle;
            return function() {
                var args = arguments;
                var context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() { inThrottle = false; }, limit);
                }
            };
        },

        // Lazy load background images
        loadBackgroundImage: function(element) {
            var isMobile = window.innerWidth <= 768;
            var url = isMobile ? element.dataset.bgMobile : element.dataset.bgDesktop;
            
            if (url && !element.classList.contains('loaded')) {
                var img = new Image();
                img.onload = function() {
                    element.style.backgroundImage = 'url(' + url + ')';
                    element.classList.add('loaded');
                };
                img.src = url;
            }
        },

        // Animate bars when visible
        animateBars: function(chartSection) {
            var bars = chartSection.querySelectorAll('.bar-fill');
            bars.forEach(function(bar) {
                if (!bar.classList.contains('animate')) {
                    bar.classList.add('animate');
                    var width = bar.dataset.width;
                    requestAnimationFrame(function() {
                        bar.style.width = width + '%';
                    });
                }
            });
        },

        setupIntersectionObserver: function() {
            var self = this;
            var observerOptions = {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            };
            
            var animationObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var element = entry.target;
                        
                        // Handle stat cards
                        if (element.classList.contains('stat-card')) {
                            element.classList.add('animate-in');
                            var bg = element.querySelector('.stat-card-bg');
                            if (bg) {
                                self.loadBackgroundImage(bg);
                            }
                            element.classList.add('has-noise');
                        }
                        
                        // Handle chart sections
                        if (element.classList.contains('chart-section')) {
                            element.classList.add('animate-in');
                            element.classList.add('has-noise');
                            setTimeout(function() {
                                self.animateBars(element);
                            }, 300);
                        }
                        
                        animationObserver.unobserve(element);
                    }
                });
            }, observerOptions);
            
            document.querySelectorAll('.energy-stats-section .stat-card, .energy-stats-section .chart-section').forEach(function(el) {
                animationObserver.observe(el);
            });
        },

        updatePaginationDots: function(container, dotsContainer) {
            var dots = dotsContainer.querySelectorAll('.pagination-dot');
            var scrollLeft = container.scrollLeft;
            var firstCard = container.querySelector('.stat-card, .chart-section');
            if (!firstCard) return;
            
            var cardWidth = firstCard.offsetWidth;
            var gap = 16;
            var activeIndex = Math.round(scrollLeft / (cardWidth + gap));
            
            dots.forEach(function(dot, index) {
                dot.classList.toggle('active', index === activeIndex);
            });
        },

        setupMobileScrollListeners: function() {
            if (window.innerWidth > 768) return;
            
            var self = this;
            var topStats = document.querySelector('.energy-stats-section .top-stats');
            var topStatsDots = document.getElementById('topStatsDots');
            var bottomSection = document.querySelector('.energy-stats-section .bottom-section');
            var bottomChartsDots = document.getElementById('bottomChartsDots');
            
            if (topStats && topStatsDots) {
                topStats.addEventListener('scroll', this.throttle(function() {
                    self.updatePaginationDots(topStats, topStatsDots);
                }, 50), { passive: true });
            }
            
            if (bottomSection && bottomChartsDots) {
                bottomSection.addEventListener('scroll', this.throttle(function() {
                    self.updatePaginationDots(bottomSection, bottomChartsDots);
                }, 50), { passive: true });
            }
        },

        setupResizeHandler: function() {
            var self = this;
            var resizeTimeout;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    document.querySelectorAll('.energy-stats-section .stat-card-bg.loaded').forEach(function(bg) {
                        var isMobile = window.innerWidth <= 768;
                        var currentUrl = bg.style.backgroundImage;
                        var newUrl = isMobile ? bg.dataset.bgMobile : bg.dataset.bgDesktop;
                        
                        if (currentUrl.indexOf(newUrl) === -1) {
                            bg.classList.remove('loaded');
                            self.loadBackgroundImage(bg);
                        }
                    });
                }, 250);
            }, { passive: true });
        }
    };


    // ===========================================
    // SECTION 4: INGREDIENT SHOWCASE SECTION
    // Carousel with modals
    // ===========================================

    var IngredientShowcase = {
        carousel: null,
        totalCards: 3,
        currentIndex: 0,
        touchStartX: 0,
        touchStartY: 0,

        init: function() {
            this.carousel = document.getElementById('carousel');
            if (!this.carousel) return;
            
            this.bindEvents();
            this.updateDisplay();
            this.moveToCard(0);
        },

        bindEvents: function() {
            var self = this;
            
            // Touch gestures for carousel
            this.carousel.addEventListener('touchstart', function(e) {
                self.touchStartX = e.touches[0].clientX;
                self.touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            this.carousel.addEventListener('touchend', function(e) {
                var touchEndX = e.changedTouches[0].clientX;
                var touchEndY = e.changedTouches[0].clientY;
                
                var diffX = self.touchStartX - touchEndX;
                var diffY = self.touchStartY - touchEndY;
                
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        self.moveToCard(self.currentIndex + 1);
                    } else {
                        self.moveToCard(self.currentIndex - 1);
                    }
                }
            }, { passive: true });
            
            // Event delegation for indicators
            var progressIndicators = document.getElementById('progressIndicators');
            if (progressIndicators) {
                progressIndicators.addEventListener('click', function(e) {
                    var indicator = e.target.closest('.indicator');
                    if (indicator && indicator.dataset.index !== undefined) {
                        self.moveToCard(parseInt(indicator.dataset.index, 10));
                    }
                });
            }
            
            // Keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (document.body.classList.contains('modal-open')) {
                    if (e.key === 'Escape') {
                        var activeModal = document.querySelector('.ingredient-modal.active, .modal.active');
                        if (activeModal) {
                            self.closeModal(activeModal.dataset.modalName);
                        }
                    }
                    return;
                }
                
                if (e.key === 'ArrowLeft') self.moveToCard(self.currentIndex - 1);
                if (e.key === 'ArrowRight') self.moveToCard(self.currentIndex + 1);
            });
            
            // Event delegation for modals
            document.addEventListener('click', function(e) {
                // Open modal button
                var openBtn = e.target.closest('[data-modal]');
                if (openBtn && !openBtn.closest('.wng-tab')) {
                    self.openModal(openBtn.dataset.modal);
                    return;
                }
                
                // Close modal button
                var closeBtn = e.target.closest('[data-close-modal]');
                if (closeBtn) {
                    self.closeModal(closeBtn.dataset.closeModal);
                    return;
                }
                
                // Click on modal backdrop
                var modal = e.target.closest('.ingredient-modal, .modal');
                if (modal && e.target === modal) {
                    self.closeModal(modal.dataset.modalName);
                }
            });
        },

        updateDisplay: function() {
            var currentPage = document.getElementById('currentPage');
            var totalPages = document.getElementById('totalPages');
            if (currentPage) currentPage.textContent = String(this.currentIndex + 1).padStart(2, '0');
            if (totalPages) totalPages.textContent = String(this.totalCards).padStart(2, '0');
            
            var self = this;
            document.querySelectorAll('.ingredient-section .indicator').forEach(function(indicator, index) {
                indicator.classList.toggle('active', index === self.currentIndex);
            });
        },

        moveToCard: function(index) {
            index = Math.max(0, Math.min(this.totalCards - 1, index));
            this.currentIndex = index;
            
            if (window.innerWidth <= 767) {
                var cardWidth = 272;
                var gap = 16;
                var offset = index * (cardWidth + gap);
                var viewportWidth = window.innerWidth;
                var centerPosition = (viewportWidth - cardWidth) / 2;
                this.carousel.style.transform = 'translateX(' + (centerPosition - offset) + 'px)';
            } else {
                this.carousel.style.transform = 'translateX(0)';
            }
            
            this.updateDisplay();
        },

        openModal: function(ingredient) {
            var modal = document.getElementById(ingredient + 'Modal');
            var ingredientSection = document.querySelector('.ingredient-section');
            
            if (modal && ingredientSection) {
                var sectionRect = ingredientSection.getBoundingClientRect();
                var sectionTop = window.pageYOffset + sectionRect.top;
                var sectionHeight = ingredientSection.offsetHeight;
                var windowHeight = window.innerHeight;
                
                var targetScroll = sectionTop + (sectionHeight / 2) - (windowHeight / 2);
                
                window.scrollTo({
                    top: Math.max(0, targetScroll),
                    left: 0,
                    behavior: 'instant'
                });
                
                requestAnimationFrame(function() {
                    document.body.classList.add('modal-open');
                    modal.classList.add('active');
                    
                    var modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.scrollTop = 0;
                    }
                });
            }
        },

        closeModal: function(ingredient) {
            var modal = document.getElementById(ingredient + 'Modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    };


    // ===========================================
    // SECTION 5: USAGE CASES SECTION
    // Accordion functionality
    // ===========================================

    var UsageCases = {
        init: function() {
            var usageGrid = document.getElementById('usageGrid');
            var ctaButton = document.querySelector('.usage-section .cta-button');
            
            if (usageGrid) {
                usageGrid.addEventListener('click', function(e) {
                    var header = e.target.closest('.item-header');
                    if (!header) return;
                    
                    var item = header.closest('.usage-item');
                    if (!item) return;
                    
                    e.preventDefault();
                    
                    var allItems = usageGrid.querySelectorAll('.usage-item');
                    
                    for (var i = 0; i < allItems.length; i++) {
                        if (allItems[i] !== item) {
                            allItems[i].classList.remove('active');
                        }
                    }
                    
                    item.classList.toggle('active');
                });
            }
            
            if (ctaButton) {
                ctaButton.addEventListener('click', function() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        }
    };


    // ===========================================
    // SECTION 6: MONEY BACK GUARANTEE
    // Lazy load GIF
    // ===========================================

    var MoneyBackGuarantee = {
        init: function() {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '200px 0px',
                threshold: 0
            });

            document.querySelectorAll('.mbg-inline__gif[data-src]').forEach(function(img) {
                observer.observe(img);
            });
        }
    };


    // ===========================================
    // SECTION 7: FULL COMPARISON TABLE
    // Mobile tabs and desktop slider
    // ===========================================

    var ComparisonTable = {
        // Product data
        products: [
            {
                name: 'Wingman Energy',
                tagline: 'Clean, instant, portable perfection',
                image: 'https://cdn.shopify.com/s/files/1/0606/2433/9038/files/front.png?v=1758853033',
                isWinner: true,
                isCurrent: true,
                content: {
                    overview: 'Thinner than a credit card. 30-second activation. Zero sugar, zero calories. Natural caffeine + L-Theanine for smooth, jitter-free energy.',
                    nutrition: { calories: '0', sugarFat: '0g/0g', good: true },
                    effects: [
                        { text: 'Clean, jitter-free energy with smooth focus', positive: true },
                        { text: 'Easy to dose and avoid over-caffeination', positive: true },
                        { text: 'Fast-acting, long-lasting support', positive: true }
                    ],
                    performance: { time: '30s', detail: 'Instant', good: true },
                    price: { amount: '$0.47', note: 'Per strip', best: true }
                }
            },
            {
                name: 'Frappucino 16oz',
                tagline: '420 calories of sugar-loaded regret',
                image: 'https://cdn.shopify.com/s/files/1/0606/2433/9038/files/CoffeeCupEnergyComparison.png?v=1758143867',
                isWinner: false,
                isCurrent: false,
                content: {
                    overview: 'Overpriced sugar milk. 420 calories. Queue simulator at coffee shop. Highway to jitters and afternoon crash.',
                    nutrition: { calories: '420', sugarFat: '66g/15g', good: false },
                    effects: [
                        { text: 'Sugar rush then crash, heavy feeling', positive: false },
                        { text: 'Acidic jolt can irritate stomach', positive: false },
                        { text: 'Stains teeth & causes coffee breath', positive: false }
                    ],
                    performance: { time: '20+ min', detail: 'Wait', good: false },
                    price: { amount: '$6.25', note: 'Per drink', best: false }
                }
            },
            {
                name: 'Energy Drink',
                tagline: 'Synthetic chemical cocktail',
                image: 'https://cdn.shopify.com/s/files/1/0606/2433/9038/files/EnergyDrinkComparison.png?v=1758079577',
                isWinner: false,
                isCurrent: false,
                content: {
                    overview: 'Synthetic caffeine bomb. Artificial ingredients. Bulky can. Heart palpitations included.',
                    nutrition: { calories: '210', sugarFat: '54g/0g', good: false },
                    effects: [
                        { text: 'Can cause restless anxiety with racing heartbeat', positive: false },
                        { text: 'Over-amped then sudden crash', positive: false },
                        { text: 'Linked to poor sleep and sleep cycle imbalance', positive: false }
                    ],
                    performance: { time: '20+ min', detail: 'Chug', good: false },
                    price: { amount: '$3.99', note: 'Per can', best: false }
                }
            }
        ],
        
        categories: ['Overview', 'Nutrition', 'Effects', 'Performance', 'Price'],
        descriptions: [
            'The complete picture',
            'What goes in your body',
            'How it makes you feel',
            'Time to energy',
            'Cost comparison'
        ],
        
        mobileCurrentCategory: 0,
        desktopCurrentCategory: 0,

        init: function() {
            this.bindMobileEvents();
            this.bindDesktopEvents();
            
            // Initialize mobile content
            if (window.innerWidth < 1024) {
                this.renderMobileContent(0);
            }
        },

        getOptimizedImageHTML: function(product, index) {
            var loadingAttr = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
            return '<img src="' + product.image + '&width=112" ' +
                   'srcset="' + product.image + '&width=56 56w, ' + product.image + '&width=112 112w" ' +
                   'sizes="56px" ' +
                   'alt="' + product.name + '" ' +
                   'width="56" height="56" ' +
                   loadingAttr + ' decoding="async">';
        },

        renderMobileContent: function(categoryIndex) {
            var container = document.getElementById('wngProducts');
            if (!container) return;
            container.innerHTML = '';
            
            var categoryKey = ['overview', 'nutrition', 'effects', 'performance', 'price'][categoryIndex];
            var self = this;
            
            this.products.forEach(function(product, productIndex) {
                var card = document.createElement('div');
                card.className = 'wng-card ' + (product.isWinner ? 'winner' : '');
                card.style.opacity = '0';
                
                var contentHTML = '';
                
                switch(categoryKey) {
                    case 'overview':
                        contentHTML = '<div class="wng-overview-text">' + product.content.overview + '</div>';
                        break;
                    case 'nutrition':
                        contentHTML = '<div class="wng-stats">' +
                            '<div class="wng-stat">' +
                                '<div class="wng-stat-value ' + (product.content.nutrition.good ? 'good' : 'bad') + '">' + product.content.nutrition.calories + '</div>' +
                                '<div class="wng-stat-label">Calories</div>' +
                            '</div>' +
                            '<div class="wng-stat">' +
                                '<div class="wng-stat-value ' + (product.content.nutrition.good ? 'good' : 'bad') + '">' + product.content.nutrition.sugarFat + '</div>' +
                                '<div class="wng-stat-label">Sugar/Fat</div>' +
                            '</div>' +
                        '</div>';
                        break;
                    case 'effects':
                        contentHTML = '<div class="wng-features">';
                        product.content.effects.forEach(function(effect) {
                            contentHTML += '<div class="wng-feature">' +
                                '<div class="wng-feature-icon ' + (effect.positive ? 'positive' : 'negative') + '">' + (effect.positive ? '✓' : '×') + '</div>' +
                                '<span class="wng-feature-text">' + effect.text + '</span>' +
                            '</div>';
                        });
                        contentHTML += '</div>';
                        break;
                    case 'performance':
                        contentHTML = '<div class="wng-stats">' +
                            '<div class="wng-stat">' +
                                '<div class="wng-stat-value ' + (product.content.performance.good ? 'good' : 'bad') + '">' + product.content.performance.time + '</div>' +
                                '<div class="wng-stat-label">Time</div>' +
                            '</div>' +
                            '<div class="wng-stat">' +
                                '<div class="wng-stat-value ' + (product.content.performance.good ? 'good' : 'bad') + '">' + product.content.performance.detail + '</div>' +
                                '<div class="wng-stat-label">Method</div>' +
                            '</div>' +
                        '</div>';
                        break;
                    case 'price':
                        contentHTML = '<div class="wng-price-box">' +
                            '<div class="wng-price ' + (product.content.price.best ? 'best' : '') + '">' + product.content.price.amount + '</div>' +
                            '<div class="wng-price-note">' + product.content.price.note + '</div>' +
                        '</div>';
                        break;
                }
                
                card.innerHTML = '<div class="wng-card-header">' +
                    '<div class="wng-card-image">' + self.getOptimizedImageHTML(product, productIndex) + '</div>' +
                    '<div class="wng-card-info">' +
                        '<div class="wng-card-badge ' + (product.isCurrent ? 'current' : '') + '">' + (product.isCurrent ? 'Your Choice' : 'Alternative') + '</div>' +
                        '<h3 class="wng-card-name">' + product.name + '</h3>' +
                        '<p class="wng-card-tagline">' + product.tagline + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="wng-card-content">' + contentHTML + '</div>';
                
                container.appendChild(card);
                
                setTimeout(function() {
                    card.style.opacity = '1';
                }, productIndex * 100);
            });
        },

        switchMobileCategory: function(index) {
            this.mobileCurrentCategory = index;
            
            var tabs = document.querySelectorAll('.wng-tab');
            tabs.forEach(function(tab) { tab.classList.remove('active'); });
            if (tabs[index]) tabs[index].classList.add('active');
            
            var titleEl = document.getElementById('wngCategoryTitle');
            var descEl = document.getElementById('wngCategoryDesc');
            if (titleEl) titleEl.textContent = this.categories[index];
            if (descEl) descEl.textContent = this.descriptions[index];
            
            this.renderMobileContent(index);
            
            if (tabs[index]) {
                tabs[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        },

        switchDesktopCategory: function(index) {
            this.desktopCurrentCategory = index;
            
            var slider = document.getElementById('contentSlider');
            if (slider) {
                slider.style.transform = 'translateX(-' + (index * 20) + '%)';
            }
            
            var buttons = document.querySelectorAll('.nav-btn');
            buttons.forEach(function(btn) { btn.classList.remove('active'); });
            if (buttons[index]) buttons[index].classList.add('active');
            
            var titles = document.querySelectorAll('.category-title-wrapper');
            titles.forEach(function(title) { title.classList.remove('active'); });
            var catTitle = document.querySelector('[data-cat-title="' + index + '"]');
            if (catTitle) catTitle.classList.add('active');
        },

        bindMobileEvents: function() {
            var self = this;
            var wngTabs = document.getElementById('wngTabs');
            if (wngTabs) {
                wngTabs.addEventListener('click', function(e) {
                    var tab = e.target.closest('.wng-tab');
                    if (tab && tab.dataset.category !== undefined) {
                        self.switchMobileCategory(parseInt(tab.dataset.category, 10));
                    }
                });
            }
            
            // Touch gestures for mobile category switching
            var wngStartX = 0;
            var wngStartY = 0;
            var wngIsSwiping = false;
            
            var wngContent = document.getElementById('wngContent');
            
            if (wngContent) {
                wngContent.addEventListener('touchstart', function(e) {
                    wngStartX = e.touches[0].clientX;
                    wngStartY = e.touches[0].clientY;
                    wngIsSwiping = true;
                }, { passive: true });
                
                wngContent.addEventListener('touchmove', function(e) {
                    if (!wngIsSwiping) return;
                    
                    var diffX = e.touches[0].clientX - wngStartX;
                    var diffY = e.touches[0].clientY - wngStartY;
                    
                    if (Math.abs(diffY) > Math.abs(diffX)) {
                        wngIsSwiping = false;
                    }
                }, { passive: true });
                
                wngContent.addEventListener('touchend', function(e) {
                    if (!wngIsSwiping) return;
                    
                    var diffX = e.changedTouches[0].clientX - wngStartX;
                    
                    if (Math.abs(diffX) > 80) {
                        if (diffX > 0 && self.mobileCurrentCategory > 0) {
                            self.switchMobileCategory(self.mobileCurrentCategory - 1);
                        } else if (diffX < 0 && self.mobileCurrentCategory < 4) {
                            self.switchMobileCategory(self.mobileCurrentCategory + 1);
                        }
                    }
                    
                    wngIsSwiping = false;
                }, { passive: true });
            }
        },

        bindDesktopEvents: function() {
            var self = this;
            var navButtons = document.getElementById('navButtons');
            if (navButtons) {
                navButtons.addEventListener('click', function(e) {
                    var btn = e.target.closest('.nav-btn');
                    if (btn && btn.dataset.nav !== undefined) {
                        self.switchDesktopCategory(parseInt(btn.dataset.nav, 10));
                    }
                });
            }
            
            // Keyboard navigation for desktop
            document.addEventListener('keydown', function(e) {
                if (window.innerWidth >= 1024) {
                    if (e.key === 'ArrowLeft' && self.desktopCurrentCategory > 0) {
                        self.switchDesktopCategory(self.desktopCurrentCategory - 1);
                    } else if (e.key === 'ArrowRight' && self.desktopCurrentCategory < 4) {
                        self.switchDesktopCategory(self.desktopCurrentCategory + 1);
                    }
                }
            });
        }
    };


    // ===========================================
    // SECTION 8: FAQ SECTION
    // Accordion functionality
    // ===========================================

    var FAQ = {
        init: function() {
            var faqItems = document.querySelectorAll('.home-faq-item');
            
            faqItems.forEach(function(item) {
                var question = item.querySelector('.home-faq-question');
                
                if (question) {
                    question.addEventListener('click', function() {
                        var isActive = item.classList.contains('active');
                        
                        // Close all other items
                        faqItems.forEach(function(otherItem) {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                            }
                        });
                        
                        // Toggle current item
                        item.classList.toggle('active');
                    });
                }
            });
        }
    };


    // ===========================================
    // INITIALIZE ALL MODULES
    // ===========================================

    function initAllModules() {
        // Initialize each section's JavaScript
        WingmanEnergyStrips.init();
        CaffeineBanner.init();
        EnergyStats.init();
        IngredientShowcase.init();
        UsageCases.init();
        MoneyBackGuarantee.init();
        ComparisonTable.init();
        FAQ.init();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllModules);
    } else {
        initAllModules();
    }

    // Handle resize for ingredient carousel
    var ingredientResizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(ingredientResizeTimer);
        ingredientResizeTimer = setTimeout(function() {
            if (IngredientShowcase.carousel) {
                IngredientShowcase.moveToCard(IngredientShowcase.currentIndex);
            }
        }, 100);
    }, { passive: true });

})();

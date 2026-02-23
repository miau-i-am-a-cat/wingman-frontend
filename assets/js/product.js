// Product Page Logic
(function() {
  const purchaseOptions = document.querySelectorAll('.purchase-option');
  const priceEl = document.getElementById('product-price');
  const compareEl = document.getElementById('compare-price');
  const qtyValue = document.getElementById('qty-value');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const addToCartBtn = document.getElementById('add-to-cart');
  
  const prices = {
    onetime: 22.99,
    subscribe: 19.99
  };
  
  let selectedOption = 'subscribe';
  let quantity = 1;
  
  function updatePrice() {
    const price = prices[selectedOption];
    priceEl.textContent = '$' + price.toFixed(2);
    compareEl.style.display = selectedOption === 'subscribe' ? 'inline' : 'none';
  }
  
  purchaseOptions.forEach(option => {
    option.addEventListener('click', () => {
      purchaseOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedOption = option.dataset.option;
      updatePrice();
    });
  });
  
  qtyMinus.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      qtyValue.value = quantity;
    }
  });
  
  qtyPlus.addEventListener('click', () => {
    if (quantity < 10) {
      quantity++;
      qtyValue.value = quantity;
    }
  });
  
  // Thumbnail gallery
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  const mainImage = document.querySelector('.product-main-image');
  
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.querySelector('img').src;
      mainImage.src = newSrc;
    });
  });
  
  // Add to cart
  addToCartBtn.addEventListener('click', async () => {
    const isEnergy = document.querySelector('.product-badge.energy') !== null;
    const productType = isEnergy ? 'energy' : 'sleep';
    
    const variantIds = {
      energy: {
        onetime: 'gid://shopify/ProductVariant/41598613258334',
        subscribe: 'gid://shopify/ProductVariant/41598613291102'
      },
      sleep: {
        onetime: 'gid://shopify/ProductVariant/41598613323870',
        subscribe: 'gid://shopify/ProductVariant/41598613356638'
      }
    };
    
    const variantId = variantIds[productType][selectedOption];
    
    addToCartBtn.disabled = true;
    addToCartBtn.querySelector('span').textContent = 'Adding...';
    
    try {
      await addItemToCart(variantId, quantity);
      addToCartBtn.querySelector('span').textContent = 'Added!';
      setTimeout(() => {
        addToCartBtn.querySelector('span').textContent = 'Add to Cart';
        addToCartBtn.disabled = false;
      }, 1500);
    } catch (e) {
      console.error('Error adding to cart:', e);
      addToCartBtn.querySelector('span').textContent = 'Error - Try Again';
      addToCartBtn.disabled = false;
    }
  });
  
  updatePrice();
})();

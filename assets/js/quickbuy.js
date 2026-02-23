// Quickbuy Page Logic
(function() {
  const products = document.querySelectorAll('.qb-product');
  const options = document.querySelectorAll('.qb-option');
  const checkoutPriceEl = document.getElementById('checkout-price');
  
  const prices = {
    energy: { onetime: 22.99, subscribe: 19.99, wingman: 29.99 },
    sleep: { onetime: 22.99, subscribe: 19.99, wingman: 29.99 },
    bundle: { onetime: 39.99, subscribe: 29.99, wingman: 29.99 }
  };
  
  let selectedProduct = 'energy';
  let selectedOption = 'subscribe';
  
  function updatePrices() {
    const onetimePrice = prices[selectedProduct].onetime;
    const subscribePrice = prices[selectedProduct].subscribe;
    
    document.getElementById('onetime-price').textContent = '$' + onetimePrice.toFixed(2);
    document.getElementById('subscribe-price').textContent = '$' + subscribePrice.toFixed(2);
    
    const currentPrice = prices[selectedProduct][selectedOption];
    checkoutPriceEl.textContent = '$' + currentPrice.toFixed(2);
  }
  
  products.forEach(product => {
    product.addEventListener('click', () => {
      products.forEach(p => p.classList.remove('selected'));
      product.classList.add('selected');
      selectedProduct = product.dataset.product;
      updatePrices();
    });
  });
  
  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedOption = option.dataset.option;
      updatePrices();
    });
  });
  
  document.getElementById('qbCheckout').addEventListener('click', async () => {
    // Add to cart and redirect to checkout
    const variantIds = {
      energy: { onetime: 'gid://shopify/ProductVariant/41598613258334', subscribe: 'gid://shopify/ProductVariant/41598613291102' },
      sleep: { onetime: 'gid://shopify/ProductVariant/41598613323870', subscribe: 'gid://shopify/ProductVariant/41598613356638' },
      bundle: { onetime: 'gid://shopify/ProductVariant/41598613389406', subscribe: 'gid://shopify/ProductVariant/41598613422174', wingman: 'gid://shopify/ProductVariant/41598613454942' }
    };
    
    const variantId = variantIds[selectedProduct][selectedOption] || variantIds[selectedProduct].onetime;
    
    try {
      await addItemToCart(variantId, 1);
    } catch (e) {
      console.error('Error adding to cart:', e);
      alert('There was an error. Please try again.');
    }
  });
  
  updatePrices();
})();

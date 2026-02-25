// Wingman Labs - Shopify Storefront API Configuration
const SHOPIFY_CONFIG = {
  domain: 'thewingmanlabs.myshopify.com',
  storefrontAccessToken: '6d2b1b56f5d725e6d618494391f6dc9b',
  customerAccountAccessToken: 'bc5bc84f-fbb7-4f3f-aace-97cc2c1282e7',
  apiVersion: '2024-01'
};

async function shopifyFetch(query) {
  const response = await fetch(
    `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken
      },
      body: JSON.stringify({ query })
    }
  );
  
  const json = await response.json();
  if (json.errors) {
    console.error('Shopify API Error:', json.errors);
    throw new Error(json.errors[0].message);
  }
  
  return json.data;
}

// Get products
async function getProducts(limit = 10) {
  const query = `{
    products(first: ${limit}) {
      edges {
        node {
          id
          handle
          title
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                priceV2 {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  return data.products.edges.map(e => e.node);
}

// Get single product by handle
async function getProductByHandle(handle) {
  const query = `{
    product(handle: "${handle}") {
      id
      handle
      title
      description
      productType
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            priceV2 {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
            }
          }
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  return data.product;
}

// Create cart
async function createCart() {
  const query = `
    mutation {
      cartCreate {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;
  
  const data = await shopifyFetch(query);
  return data.cartCreate.cart;
}

// Add item to cart
async function addToCart(cartId, variantId, quantity = 1) {
  const query = `
    mutation {
      cartLinesAdd(
        cartId: "${cartId}"
        lines: [
          {
            merchandiseId: "${variantId}"
            quantity: ${quantity}
          }
        ]
      ) {
        cart {
          id
          checkoutUrl
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    product {
                      title
                    }
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const data = await shopifyFetch(query);
  return data.cartLinesAdd;
}

// Get cart
async function getCart(cartId) {
  const query = `{
    cart(id: "${cartId}") {
      id
      checkoutUrl
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
                product {
                  title
                }
                image {
                  url
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  return data.cart;
}

// Update cart line quantity
async function updateCartLine(cartId, lineId, quantity) {
  const query = `
    mutation {
      cartLinesUpdate(
        cartId: "${cartId}"
        lines: [
          {
            id: "${lineId}"
            quantity: ${quantity}
          }
        ]
      ) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
              }
            }
          }
          cost {
            subtotalAmount {
              amount
            }
            totalAmount {
              amount
            }
          }
        }
      }
    }
  `;
  
  const data = await shopifyFetch(query);
  return data.cartLinesUpdate.cart;
}

// Remove cart line
async function removeCartLine(cartId, lineId) {
  const query = `
    mutation {
      cartLinesRemove(
        cartId: "${cartId}"
        lineIds: ["${lineId}"]
      ) {
        cart {
          id
          lines(first: 50) {
            edges {
              node {
                id
                quantity
              }
            }
          }
          cost {
            subtotalAmount {
              amount
            }
            totalAmount {
              amount
            }
          }
        }
      }
    }
  `;
  
  const data = await shopifyFetch(query);
  return data.cartLinesRemove.cart;
}

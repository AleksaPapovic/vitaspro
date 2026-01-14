// Product storage utilities - reads from JSON file and syncs with API

const JSONBIN_API_URL = import.meta.env.VITE_JSONBIN_BIN_ID 
  ? `https://api.jsonbin.io/v3/b/${import.meta.env.VITE_JSONBIN_BIN_ID}`
  : null;
const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || '';

// Fallback: Read from public/products.json file
export const getProducts = async () => {
  try {
    // First, try to get from JSONBin API if configured
    if (JSONBIN_API_URL && JSONBIN_API_KEY) {
      try {
        const response = await fetch(JSONBIN_API_URL + '/latest', {
          headers: {
            'X-Master-Key': JSONBIN_API_KEY,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.record && Array.isArray(data.record)) {
            return data.record;
          }
        }
      } catch (error) {
        console.log('JSONBin API not available, using local file');
      }
    }
    
    // Fallback to local JSON file
    const response = await fetch('/products.json');
    if (response.ok) {
      const products = await response.json();
      return Array.isArray(products) ? products : [];
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
  
  // Final fallback to localStorage (for backward compatibility)
  const localProducts = localStorage.getItem('vitaspro_products');
  return localProducts ? JSON.parse(localProducts) : [];
};

// Save products to JSONBin API (for admin updates)
export const saveProducts = async (products) => {
  try {
    // Try to save to JSONBin API if configured
    if (JSONBIN_API_URL && JSONBIN_API_KEY) {
      const response = await fetch(JSONBIN_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
        },
        body: JSON.stringify(products),
      });
      
      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('vitaspro_products', JSON.stringify(products));
        return true;
      }
    }
    
    // Fallback: save to localStorage and show download option
    localStorage.setItem('vitaspro_products', JSON.stringify(products));
    
    // Download JSON file for manual upload
    downloadProductsJSON(products);
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    // Still save to localStorage as backup
    localStorage.setItem('vitaspro_products', JSON.stringify(products));
    downloadProductsJSON(products);
    return false;
  }
};

// Download products as JSON file
const downloadProductsJSON = (products) => {
  const dataStr = JSON.stringify(products, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const saveProduct = async (product) => {
  const products = await getProducts();
  const newProduct = {
    id: Date.now().toString(),
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description || '',
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
};

export const deleteProduct = async (id) => {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  await saveProducts(filtered);
};

export const updateProduct = async (id, updates) => {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    await saveProducts(products);
    return products[index];
  }
  return null;
};

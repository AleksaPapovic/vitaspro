import { useState, useEffect } from 'react'
import { getProducts, saveProduct, deleteProduct } from '../utils/storage'
import { getGoogleDriveImageUrl } from '../utils/imageHelper'
import './Admin.css'

function Admin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    images: '', // Comma-separated Google Drive URLs
    description: ''
  })
  const [message, setMessage] = useState('')
  const [driveConfig, setDriveConfig] = useState(() => {
    const stored = localStorage.getItem('vitaspro_drive_config')
    if (stored) {
      return JSON.parse(stored)
    }
    // Default configuration with user's Google Drive file
    return { 
      fileUrl: 'https://drive.google.com/file/d/1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv/view?usp=sharing',
      appsScriptUrl: '' 
    }
  })
  const [showDriveConfig, setShowDriveConfig] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async (forceRefresh = false) => {
    setLoading(true)
    try {
      console.log('Loading products from Google Drive...', forceRefresh ? '(force refresh)' : '')
      const loadedProducts = await getProducts(forceRefresh)
      console.log('Loaded products:', loadedProducts.length)
      console.log('Product IDs:', loadedProducts.map(p => p.id))
      setProducts(loadedProducts)
      console.log('Products state updated')
      return loadedProducts
    } catch (error) {
      console.error('Error loading products:', error)
      setMessage('Error loading products')
      setTimeout(() => setMessage(''), 3000)
      return []
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.image) {
      setMessage('Please fill in all required fields')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      setMessage('Saving product...')
      await saveProduct(formData)
      await loadProducts()
      setFormData({ name: '', price: '', image: '', images: '', description: '' })
      setMessage('Product added successfully! Google Drive file updated.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Save error:', error)
      const errorMsg = error.message || 'Error saving product'
      setMessage(`${errorMsg}. Please check Google Apps Script configuration in settings.`)
      setTimeout(() => setMessage(''), 8000)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setMessage('Deleting product...')
        console.log('=== DELETE START ===')
        console.log('Product ID to delete:', id)
        console.log('Current products before delete:', products.length)
        console.log('Product IDs:', products.map(p => p.id))
        
        // Optimistically update the UI first (use string comparison to match deleteProduct logic)
        const productToDelete = products.find(p => String(p.id) === String(id))
        if (!productToDelete) {
          console.error('Product not found in current list!')
          console.error('Looking for ID:', id, 'Type:', typeof id)
          console.error('Available IDs:', products.map(p => ({ id: p.id, type: typeof p.id, name: p.name })))
          throw new Error(`Product with id "${id}" not found in current list`)
        }
        
        // Update UI immediately
        const filteredProducts = products.filter(p => String(p.id) !== String(id))
        setProducts(filteredProducts)
        console.log('UI updated immediately, products count:', filteredProducts.length)
        
        // Delete the product (this will update Google Drive)
        console.log('Calling deleteProduct...')
        const result = await deleteProduct(id)
        console.log('deleteProduct completed, result:', result)
        console.log('Expected product count after delete:', result.length)
        
        // Wait longer for Google Drive to update (same as add)
        console.log('Waiting for Google Drive to process update...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Reload products with force refresh to bypass any cache
        console.log('Reloading products from Google Drive (force refresh)...')
        const reloadedProducts = await loadProducts(true)
        console.log('Products reloaded, count:', reloadedProducts.length)
        console.log('Reloaded product IDs:', reloadedProducts.map(p => p.id))
        
        // Verify the delete worked
        const deletedProductStillExists = reloadedProducts.some(p => String(p.id) === String(id))
        if (deletedProductStillExists) {
          console.error('⚠️ WARNING: Deleted product still exists in Google Drive!')
          console.error('This means the Google Drive update may not have completed yet.')
          console.error('Please wait a few seconds and refresh manually, or check your Google Apps Script.')
          setMessage('Product deleted from UI, but Google Drive update may still be processing. Please refresh in a few seconds.')
        } else {
          console.log('✅ Verified: Deleted product is no longer in Google Drive')
          setMessage('Product deleted successfully! Google Drive file updated.')
        }
        
        console.log('=== DELETE END ===')
        
        setMessage('Product deleted successfully! Google Drive file updated.')
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error('=== DELETE ERROR ===', error)
        // Reload products to get the correct state
        await loadProducts()
        const errorMsg = error.message || 'Error deleting product'
        setMessage(`Error: ${errorMsg}. Please check Google Apps Script configuration in settings.`)
        setTimeout(() => setMessage(''), 8000)
      }
    }
  }

  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url)
  }

  const handleDriveConfigSave = (e) => {
    e.preventDefault()
    localStorage.setItem('vitaspro_drive_config', JSON.stringify(driveConfig))
    setMessage('Google Drive configuration saved! Reloading products...')
    setTimeout(() => {
      loadProducts()
      setMessage('')
    }, 2000)
  }

  const testAppsScript = async () => {
    if (!driveConfig.appsScriptUrl || driveConfig.appsScriptUrl.trim() === '') {
      setMessage('Please enter a Google Apps Script URL first')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      setMessage('Testing Google Apps Script connection...')
      const testData = [{ id: 'test', name: 'Test Product', price: '0', image: '', description: '' }]
      
      const response = await fetch(driveConfig.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          data: testData
        }),
        mode: 'no-cors'
      })
      
      setMessage('Test request sent! Check your Google Drive file to verify it works. If the file updates, your Apps Script is working correctly.')
      setTimeout(() => setMessage(''), 8000)
    } catch (error) {
      setMessage(`Test failed: ${error.message}. Please check your Apps Script URL and deployment settings.`)
      setTimeout(() => setMessage(''), 8000)
    }
  }

  return (
    <div className="admin">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Vitas Pro Admin</h1>
          <p>Manage your products</p>
          <button 
            onClick={() => setShowDriveConfig(!showDriveConfig)}
            className="drive-config-toggle"
          >
            {showDriveConfig ? 'Hide' : 'Show'} Google Drive Settings
          </button>
        </header>

        {showDriveConfig && (
          <section className="drive-config-section">
            <h2>Google Drive Configuration</h2>
            <p className="config-instructions">
              <strong>Step 1:</strong> Set up Google Apps Script (see instructions below)<br />
              <strong>Step 2:</strong> Paste your Google Drive file URL and Apps Script URL below
            </p>
            <form onSubmit={handleDriveConfigSave} className="drive-config-form">
              <div className="form-group">
                <label htmlFor="driveUrl">Google Drive File URL</label>
                <input
                  type="url"
                  id="driveUrl"
                  value={driveConfig.fileUrl || ''}
                  onChange={(e) => setDriveConfig({ ...driveConfig, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv/view"
                />
                <small className="help-text">
                  Your Google Drive products.json file share link
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="appsScriptUrl">Google Apps Script Web App URL</label>
                <input
                  type="url"
                  id="appsScriptUrl"
                  value={driveConfig.appsScriptUrl || ''}
                  onChange={(e) => setDriveConfig({ ...driveConfig, appsScriptUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                />
                <small className="help-text">
                  Paste your Google Apps Script web app URL (see setup instructions)
                </small>
              </div>
              <div className="config-buttons">
                <button type="submit" className="submit-button">Save Configuration</button>
                <button 
                  type="button"
                  onClick={testAppsScript}
                  className="test-button"
                >
                  Test Apps Script Connection
                </button>
              </div>
            </form>
            <div className="apps-script-instructions">
              <h3>Google Apps Script Setup:</h3>
              <ol>
                <li>Go to <a href="https://script.google.com" target="_blank" rel="noopener noreferrer">script.google.com</a></li>
                <li>Create a new project</li>
                <li>Paste the code from <code>google-apps-script.js</code> (see project files)</li>
                <li>Replace <code>FILE_ID</code> with: <strong>1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv</strong></li>
                <li>Click "Deploy" → "New deployment" → "Web app"</li>
                <li>Set "Execute as" to "Me" and "Who has access" to "Anyone"</li>
                <li>Copy the Web app URL and paste it above</li>
              </ol>
            </div>
          </section>
        )}

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="admin-content">
          <section className="admin-form-section">
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Lipstick - Rose Gold"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="29.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Main Image URL (Google Drive) *</label>
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                  required
                />
                <small className="help-text">
                  Main product image (used in product grid)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="images">Additional Images (Optional)</label>
                <textarea
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="Paste multiple Google Drive URLs, one per line or separated by commas"
                  rows="4"
                />
                <small className="help-text">
                  Add more product images for the detail page. Paste Google Drive URLs, one per line or separated by commas.
                  <br />
                  <strong>Example:</strong><br />
                  https://drive.google.com/file/d/IMAGE1_ID/view<br />
                  https://drive.google.com/file/d/IMAGE2_ID/view
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-button">Add Product</button>
            </form>
          </section>

          <section className="admin-products-section">
            <h2>Current Products ({products.length})</h2>
            {loading ? (
              <div className="empty-products">
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-products">
                <p>No products yet. Add your first product above!</p>
              </div>
            ) : (
              <div className="admin-products-grid">
                {products.map((product) => (
                  <div key={product.id} className="admin-product-card">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      className="admin-product-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg'
                      }}
                    />
                    <div className="admin-product-info">
                      <h3>{product.name}</h3>
                      <p className="admin-product-price">${product.price}</p>
                      {product.description && (
                        <p className="admin-product-desc">{product.description}</p>
                      )}
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="admin-footer">
          <a href="/" className="back-link">← Back to Store</a>
        </div>
      </div>
    </div>
  )
}

export default Admin


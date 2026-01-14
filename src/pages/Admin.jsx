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
    description: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const loadedProducts = await getProducts()
      setProducts(loadedProducts)
    } catch (error) {
      console.error('Error loading products:', error)
      setMessage('Error loading products')
      setTimeout(() => setMessage(''), 3000)
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
      setFormData({ name: '', price: '', image: '', description: '' })
      setMessage('Product added successfully! A JSON file will be downloaded. Upload it to your repository or Netlify to update the site.')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      setMessage('Error saving product. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setMessage('Deleting product...')
        await deleteProduct(id)
        await loadProducts()
        setMessage('Product deleted successfully! A JSON file will be downloaded. Upload it to your repository or Netlify to update the site.')
        setTimeout(() => setMessage(''), 5000)
      } catch (error) {
        setMessage('Error deleting product. Please try again.')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url)
  }

  return (
    <div className="admin">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Vitas Pro Admin</h1>
          <p>Manage your products</p>
        </header>

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
                <label htmlFor="image">Google Drive Image URL *</label>
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                  required
                />
                <small className="help-text">
                  <strong>Important:</strong> Paste your Google Drive share link here (e.g., https://drive.google.com/file/d/1-ZWT4D_5bxCT4Rr0FUeei_lZCVWyaDib/view). 
                  <br />
                  The file MUST be set to "Anyone with the link can view" in Google Drive sharing settings for images to display correctly.
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


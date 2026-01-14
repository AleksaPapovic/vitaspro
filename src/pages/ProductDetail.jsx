import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducts } from '../utils/storage'
import { getGoogleDriveImageUrl } from '../utils/imageHelper'
import './ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const allProducts = await getProducts()
        setProducts(allProducts)
        const foundProduct = allProducts.find(p => p.id === id)
        setProduct(foundProduct)
        if (foundProduct && foundProduct.images && foundProduct.images.length > 0) {
          setSelectedImageIndex(0)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url)
  }

  const getProductImages = () => {
    if (!product) return []
    // If product has images array, use it; otherwise use single image
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }
    // Fallback to single image
    return product.image ? [product.image] : []
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('vitaspro_cart') || '[]')
    cart.push(product)
    localStorage.setItem('vitaspro_cart', JSON.stringify(cart))
    alert(`${product.name} added to cart!`)
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loader-container">
          <div className="maui-loader">
            <div className="maui-loader-ring"></div>
            <div className="maui-loader-ring"></div>
            <div className="maui-loader-ring"></div>
            <div className="maui-loader-ring"></div>
          </div>
          <p className="loader-text">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-not-found">
            <h2>Product not found</h2>
            <button onClick={() => navigate('/')} className="back-button">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const images = getProductImages()
  const mainImage = images[selectedImageIndex] || images[0]

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="product-detail-content">
          <div className="product-detail-images">
            <div className="main-image-container">
              <img
                src={getImageUrl(mainImage)}
                alt={product.name}
                className="main-product-image"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg'
                }}
              />
            </div>
            
            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} - View ${index + 1}`}
                      className="thumbnail-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <h1 className="product-detail-name">{product.name}</h1>
            
            {product.description && (
              <div className="product-detail-description">
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-detail-price">
              <span className="price-label">Price:</span>
              <span className="price-value">${product.price}</span>
            </div>

            <div className="product-detail-actions">
              <button onClick={addToCart} className="add-to-cart-button-large">
                Add to Cart
              </button>
              <button onClick={() => navigate('/')} className="continue-shopping-button">
                Continue Shopping
              </button>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="product-images-count">
                {product.images.length} images available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

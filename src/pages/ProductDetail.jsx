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
        // Always reset to first image when product loads
        setSelectedImageIndex(0)
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
    
    let imagesArray = []
    
    // If product has images array, use it
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imagesArray = [...product.images]
    }
    
    // Always include the main image if it exists and is not already in the array
    if (product.image) {
      const mainImageIncluded = imagesArray.some(img => img === product.image || img.trim() === product.image.trim())
      if (!mainImageIncluded) {
        // Add main image at the beginning
        imagesArray = [product.image, ...imagesArray]
      }
    }
    
    // Filter out any empty strings
    imagesArray = imagesArray.filter(img => img && img.trim().length > 0)
    
    // If no images at all, return empty array
    return imagesArray
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('vitaspro_cart') || '[]')
    cart.push(product)
    localStorage.setItem('vitaspro_cart', JSON.stringify(cart))
    alert(`${product.name} je dodato u korpu!`)
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
          <p className="loader-text">Učitavanje proizvoda...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-not-found">
            <h2>Proizvod nije pronađen</h2>
            <button onClick={() => navigate('/')} className="back-button">
              Nazad na početnu
            </button>
          </div>
        </div>
      </div>
    )
  }

  const images = getProductImages()
  const mainImage = images.length > 0 ? (images[selectedImageIndex] || images[0]) : null

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Nazad
        </button>

        <div className="product-detail-content">
          <div className="product-detail-images">
            <div className="main-image-container">
              {mainImage ? (
                <img
                  src={getImageUrl(mainImage)}
                  alt={product.name}
                  className="main-product-image"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg'
                  }}
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>Slika nije dostupna</span>
                </div>
              )}
            </div>
            
            {images.length > 0 && (
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
              <span className="price-label">Cena:</span>
              <span className="price-value">${product.price}</span>
            </div>

            <div className="product-detail-actions">
              <button onClick={addToCart} className="add-to-cart-button-large">
                Dodaj u korpu
              </button>
              <button onClick={() => navigate('/')} className="continue-shopping-button">
                Nastavi kupovinu
              </button>
            </div>

            {images.length > 0 && (
              <div className="product-images-count">
                {images.length} {images.length === 1 ? 'slika' : images.length < 5 ? 'slike' : 'slika'} dostupno
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

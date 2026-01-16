import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducts } from '../utils/storage'
import { getGoogleDriveImageUrl } from '../utils/imageHelper'
import Navbar from '../components/Navbar'
import ToastContainer from '../components/ToastContainer'
import { useToast } from '../hooks/useToast'
import './ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, showToast, removeToast } = useToast()
  const [product, setProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    return cart.length;
  });

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

  // Check if product was added in the last 24 hours
  const isNewProduct = (product) => {
    if (!product || !product.createdAt) return false;
    
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const diffInHours = (now - createdAt) / (1000 * 60 * 60);
    
    return diffInHours <= 24;
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
    setCartCount(cart.length)
    showToast(`${product.name} je dodato u korpu!`, 'success')
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
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
        <Navbar />
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
      <Navbar cartCount={cartCount} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
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
                    e.target.src = '/vitaspro.jpg'
                  }}
                />
              ) : (
                <div className="no-image-placeholder">
                  <img src="/vitaspro.jpg" alt="Vitas Pro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        e.target.src = '/vitaspro.jpg'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h1 className="product-detail-name">{product.name}</h1>
              {isNewProduct(product) && (
                <span className="product-detail-badge">Novo</span>
              )}
            </div>
            
            {product.description && (
              <div className="product-detail-description">
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-detail-price">
              <span className="price-label">Cena:</span>
              <span className="price-value">{product.price} RSD</span>
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

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Vitas Pro</h3>
              <p>Premium kozmetika za modernu ženu</p>
            </div>
            <div className="footer-section">
              <h4>Brzi linkovi</h4>
              <ul>
                <li>
                  <a href="/">Početna</a>
                </li>
                <li>
                  <a href="/#products">Proizvodi</a>
                </li>
                <li>
                  <a href="/#about">O nama</a>
                </li>
                <li>
                  <a href="/partnership">Partnerstvo</a>
                </li>
                <li>
                  <a href="/admin">Admin</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Kontakt</h4>
              <p>Email: vitascosmetics@gmail.com</p>
              <p>Phone Serbia: +381 63 755-42-88</p>
              <p>Phone Montenegro: +382 68 904 560</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Vitas Pro. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ProductDetail

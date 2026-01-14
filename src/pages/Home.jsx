import { useState, useEffect } from "react";
import { getProducts } from "../utils/storage";
import { getGoogleDriveImageUrl } from "../utils/imageHelper";
import "./Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    return cart.length;
  });

  useEffect(() => {
    // Load products from JSON file
    const loadProducts = async () => {
      setLoading(true);
      try {
        const loadedProducts = await getProducts();
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Refresh products every 30 seconds to get updates
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Convert Google Drive share link to direct image link
  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    cart.push(product);
    localStorage.setItem("vitaspro_cart", JSON.stringify(cart));
    setCartCount(cart.length);
    // Show notification
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="home">
      <header className="header">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <h1 className="logo">Vitas Pro</h1>
              <div className="nav-links">
                <a href="#home">Home</a>
                <a href="#products">Products</a>
                <a href="#about">About</a>
                <a href="/admin" className="admin-link">
                  Admin
                </a>
                <div className="cart-icon">
                  <span className="cart-count">{cartCount}</span>
                  🛒
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="main-content">
        {/* Hero Banner */}
        <section id="home" className="hero-banner">
          <div className="hero-content">
            <h1 className="hero-title">Discover Your Beauty</h1>
            <p className="hero-subtitle">
              Premium Cosmetics for the Modern Woman
            </p>
            <a href="#products" className="shop-now-btn">
              Shop Now
            </a>
          </div>
        </section>

        {/* Products Section */}
        {loading ? (
          <section id="products" className="products-section">
            <div className="container">
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <h3>Loading products...</h3>
              </div>
            </div>
          </section>
        ) : products.length === 0 ? (
          <section id="products" className="products-section">
            <div className="container">
              <div className="empty-state">
                <div className="empty-icon">💄</div>
                <h3>No products yet</h3>
                <p>Products will appear here once they're added</p>
                <a href="/admin" className="admin-link-button">
                  Go to Admin Page
                </a>
              </div>
            </div>
          </section>
        ) : (
          <section id="products" className="products-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Our Products</h2>
                <p className="section-subtitle">
                  Discover our premium collection
                </p>
              </div>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                      <div className="product-badge">New</div>
                      <div className="product-overlay">
                        <button
                          className="quick-view-btn"
                          onClick={() => alert(`Viewing ${product.name}`)}
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}
                      <div className="product-footer">
                        <span className="product-price">${product.price}</span>
                        <button
                          className="add-to-cart-btn"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>About Vitas Pro</h2>
                <p>
                  At Vitas Pro, we believe that makeup is an art form and beauty
                  comes from within. Our premium cosmetics are carefully crafted
                  to enhance your natural beauty and help you express your
                  unique style. We offer high-quality products that are
                  cruelty-free and made with the finest ingredients.
                </p>
                <a href="#products" className="learn-more-btn">
                  Explore Products
                </a>
              </div>
              <div className="about-image">
                <div className="about-placeholder">✨</div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <div className="container">
            <h2>Subscribe to Our Newsletter</h2>
            <p>Get the latest updates on new products and exclusive offers</p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Vitas Pro</h3>
              <p>Premium cosmetics for the modern woman</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#products">Products</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="/admin">Admin</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: info@vitaspro.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Vitas Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

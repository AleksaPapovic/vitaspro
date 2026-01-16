import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../utils/storage";
import { getGoogleDriveImageUrl } from "../utils/imageHelper";
import Navbar from "../components/Navbar";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import "./Home.css";

const PRODUCTS_PER_PAGE = 6;

function Home() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    return cart.length;
  });

  useEffect(() => {
    // Load products from Google Drive JSON file
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Loading products from Google Drive...");
        const loadedProducts = await getProducts();
        console.log("Products loaded:", loadedProducts.length);

        if (loadedProducts && loadedProducts.length > 0) {
          setProducts(loadedProducts);
          setError(null);
        } else {
          // Check if there's a drive config to determine if it's a real error
          const driveConfig = localStorage.getItem("vitaspro_drive_config");
          if (driveConfig) {
            setError("Nema proizvoda u JSON fajlu ili fajl je prazan.");
          } else {
            setError(
              "Google Drive konfiguracija nije podešena. Molimo konfigurišite u Admin podešavanjima."
            );
          }
          setProducts([]);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        let errorMessage =
          error.message || "Greška pri učitavanju proizvoda sa Google Drive-a";

        // Check for timeout errors
        if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("408") ||
          errorMessage.includes("Request Timeout") ||
          errorMessage.includes("504")
        ) {
          errorMessage =
            "Zahtev je istekao (timeout). Proverite internet konekciju i pokušajte ponovo.";
        }

        setError(errorMessage);
        showToast(`Greška: ${errorMessage}`, "error");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Refresh products every 30 seconds to get updates from Google Drive
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, [showToast]);

  // Convert Google Drive share link to direct image link
  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url);
  };

  // Check if product was added in the last 24 hours
  const isNewProduct = (product) => {
    if (!product.createdAt) return false;

    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const diffInHours = (now - createdAt) / (1000 * 60 * 60);

    return diffInHours <= 24;
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    cart.push(product);
    localStorage.setItem("vitaspro_cart", JSON.stringify(cart));
    setCartCount(cart.length);
    // Show toast notification
    showToast(`${product.name} je dodato u korpu!`, "success");
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to products section when page changes
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home">
      <Navbar cartCount={cartCount} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="main-content">
        {/* Hero Banner */}
        <section id="home" className="hero-banner">
          <div className="hero-content">
            <h1 className="hero-title">
              Vaš pouzdan partner u profesionalnoj kozmetici
            </h1>
            <p className="hero-subtitle">Premium proizvodi</p>
            <a href="#products" className="shop-now-btn">
              Kupite sada
            </a>
          </div>
        </section>

        {/* Products Section */}
        {loading ? (
          <section id="products" className="products-section">
            <div className="container">
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
          </section>
        ) : error ? (
          <section id="products" className="products-section">
            <div className="container">
              <div className="empty-state">
                <div className="empty-icon">
                  <img
                    src="/vitaspro.jpg"
                    alt="Vitas Pro"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <h3>Greška pri učitavanju proizvoda</h3>
                <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>
                  {error}
                </p>
                <p style={{ color: "#ccc", marginBottom: "1.5rem" }}>
                  Proverite konzolu za više detalja ili konfigurišite Google
                  Drive u Admin podešavanjima.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <a href="/admin" className="admin-link-button">
                    Idi na Admin stranicu
                  </a>
                  <button
                    className="admin-link-button"
                    onClick={() => window.location.reload()}
                    style={{
                      background: "rgba(212, 175, 55, 0.2)",
                      border: "2px solid #d4af37",
                    }}
                  >
                    Pokušaj ponovo
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : products.length === 0 ? (
          <section id="products" className="products-section">
            <div className="container">
              <div className="empty-state">
                <div className="empty-icon">
                  <img
                    src="/vitaspro.jpg"
                    alt="Vitas Pro"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <h3>Još nema proizvoda</h3>
                <p>Proizvodi će se pojaviti ovde kada budu dodati</p>
                <a href="/admin" className="admin-link-button">
                  Idi na Admin stranicu
                </a>
              </div>
            </div>
          </section>
        ) : (
          <section id="products" className="products-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">Naši proizvodi</h2>
                <p className="section-subtitle">Otkrijte premium kolekciju</p>
              </div>
              <div className="products-grid">
                {currentProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <div
                      className="product-image-wrapper"
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/vitaspro.jpg";
                        }}
                      />
                      {isNewProduct(product) && (
                        <div className="product-badge">Novo</div>
                      )}
                      <div className="product-overlay">
                        <button
                          className="quick-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          Brzi pregled
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
                        <span className="product-price">
                          {product.price} RSD
                        </span>
                        <button
                          className="add-to-cart-btn"
                          onClick={() => addToCart(product)}
                        >
                          Dodaj u korpu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {products.length > PRODUCTS_PER_PAGE && (
                <div className="pagination-container">
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`pagination-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>O Vitas Pro</h2>
                <p>
                  Vitas Pro je ekskluzivni salonski partner specijalizovan za
                  distribuciju profesionalnih kozmetičkih proizvoda najvišeg
                  kvaliteta. Naš cilj je da salonima obezbedimo kompletna i
                  pouzdana rešenja koja podižu standard usluge i unapređuju
                  rezultate u svakodnevnom radu. Pažljivo biramo brendove i
                  linije proizvoda koje odgovaraju savremenim zahtevima
                  profesionalne nege, sa fokusom na zdravlje, efikasnost i
                  dugoročno očuvanje kvaliteta. Naš asortiman obuhvata sve
                  segmente jednog modernog salona – negu kose, noktiju, lica i
                  tela, kao i programe za masažu i depilaciju, omogućavajući
                  celovitu i ujednačenu ponudu na jednom mestu.
                </p>
                <a href="#products" className="learn-more-btn">
                  Istražite proizvode
                </a>
              </div>
              <div className="about-image">
                <img
                  src="/vitaspro.jpg"
                  alt="Vitas Pro"
                  className="about-image-content"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <div className="container">
            <h2>Prijavite se na naš newsletter</h2>
            <p>
              Dobijte najnovije informacije o novim proizvodima i ekskluzivnim
              ponudama
            </p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Hvala vam što ste se prijavili!");
              }}
            >
              <input
                type="email"
                placeholder="Unesite vašu email adresu"
                required
              />
              <button type="submit">Prijavite se</button>
            </form>
          </div>
        </section>
      </main>

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
                  <a href="#home">Početna</a>
                </li>
                <li>
                  <a href="#products">Proizvodi</a>
                </li>
                <li>
                  <a href="#about">O nama</a>
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
  );
}

export default Home;

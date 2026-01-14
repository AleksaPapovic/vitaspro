import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../utils/storage";
import { getGoogleDriveImageUrl } from "../utils/imageHelper";
import { getCategoriesList, getSubcategories } from "../utils/categories";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    return cart.length;
  });
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Load products from Google Drive JSON file
    const loadProducts = async () => {
      setLoading(true);
      try {
        console.log("Loading products from Google Drive...");
        const loadedProducts = await getProducts();
        setProducts(loadedProducts);
        console.log("Products loaded:", loadedProducts.length);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Refresh products every 30 seconds to get updates from Google Drive
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
    alert(`${product.name} je dodato u korpu!`);
  };

  return (
    <div className="home">
      <header className="header">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="logo-container">
                <img
                  src="/vitasprologo.jpg"
                  alt="Vitas Pro Logo"
                  className="logo-image"
                />
                <h1 className="logo">VITAS PRO</h1>
              </div>
              <div className="nav-links">
                <a href="#home">Početna</a>
                <div
                  className="categories-menu-wrapper"
                  onMouseEnter={() => setShowCategoriesMenu(true)}
                  onMouseLeave={(e) => {
                    const relatedTarget = e.relatedTarget;
                    const currentTarget = e.currentTarget;

                    // Ako relatedTarget ne postoji ili nije deo wrapper-a
                    if (
                      !relatedTarget ||
                      !currentTarget.contains(relatedTarget)
                    ) {
                      // Dodaj mali delay da omogući prelazak sa linka na dropdown
                      setTimeout(() => {
                        const dropdown = document.querySelector(
                          ".categories-dropdown"
                        );
                        const isHoveringWrapper =
                          currentTarget.matches(":hover");
                        const isHoveringDropdown = dropdown?.matches(":hover");

                        if (!isHoveringWrapper && !isHoveringDropdown) {
                          setShowCategoriesMenu(false);
                          setSelectedCategory(null);
                        }
                      }, 200);
                    }
                  }}
                >
                  <a
                    href="#products"
                    className="categories-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCategoriesMenu(!showCategoriesMenu);
                    }}
                  >
                    Kategorije ▼
                  </a>
                  {showCategoriesMenu && (
                    <div
                      className="categories-dropdown"
                      onMouseEnter={() => setShowCategoriesMenu(true)}
                      onMouseLeave={(e) => {
                        // Proveri da li miš napušta dropdown
                        const relatedTarget = e.relatedTarget;
                        const wrapper = e.currentTarget.closest(
                          ".categories-menu-wrapper"
                        );

                        // Ako miš napušta dropdown i wrapper, zatvori meni
                        if (
                          !relatedTarget ||
                          !wrapper?.contains(relatedTarget)
                        ) {
                          setTimeout(() => {
                            if (
                              !wrapper?.matches(":hover") &&
                              !e.currentTarget.matches(":hover")
                            ) {
                              setShowCategoriesMenu(false);
                              setSelectedCategory(null);
                            }
                          }, 150);
                        }
                      }}
                    >
                      <div className="categories-panel">
                        <div className="categories-sidebar">
                          {getCategoriesList()
                            .slice(0, 5)
                            .map((category, index) => (
                              <div
                                key={category.id}
                                className={`category-sidebar-item ${
                                  selectedCategory === category.id ||
                                  (!selectedCategory && index === 0)
                                    ? "active"
                                    : ""
                                }`}
                                onMouseEnter={() =>
                                  setSelectedCategory(category.id)
                                }
                              >
                                <span className="category-sidebar-name">
                                  {category.name}
                                </span>
                                <span className="category-arrow">→</span>
                              </div>
                            ))}
                        </div>
                        <div className="subcategories-panel">
                          {(() => {
                            const activeCategoryId =
                              selectedCategory ||
                              getCategoriesList().slice(0, 5)[0]?.id;
                            if (!activeCategoryId) {
                              return (
                                <div className="subcategories-placeholder">
                                  <p>Izaberite kategoriju sa leve strane</p>
                                </div>
                              );
                            }
                            const category = getCategoriesList().find(
                              (c) => c.id === activeCategoryId
                            );
                            if (!category) return null;

                            const subcats = getSubcategories(category.name);

                            // Ako ima podgrupe (kao PREPARATI ZA LICE I TELO ili OPREMA ZA SALONE)
                            if (
                              category.hasSubgroups &&
                              typeof subcats === "object" &&
                              !Array.isArray(subcats)
                            ) {
                              return (
                                <div className="subcategories-content">
                                  {Object.values(subcats).map((subgroup) => (
                                    <div
                                      key={subgroup.name}
                                      className="subgroup-section"
                                    >
                                      <h3 className="subgroup-title">
                                        {subgroup.name}
                                      </h3>
                                      {subgroup.items &&
                                      subgroup.items.length > 0 ? (
                                        <div className="subgroup-items-grid">
                                          {subgroup.items.map((item) => (
                                            <a
                                              key={item}
                                              href="#products"
                                              className="subcategory-item"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setShowCategoriesMenu(false);
                                              }}
                                            >
                                              {item}
                                            </a>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="subgroup-empty">
                                          Proizvodi uskoro...
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            }

                            // Ako su podkategorije običan niz
                            if (Array.isArray(subcats) && subcats.length > 0) {
                              return (
                                <div className="subcategories-content">
                                  <div className="subcategories-grid">
                                    {subcats.map((subcat) => (
                                      <a
                                        key={subcat}
                                        href="#products"
                                        className="subcategory-item"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setShowCategoriesMenu(false);
                                        }}
                                      >
                                        {subcat}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="subcategories-content">
                                <p className="subcategories-empty">
                                  Proizvodi uskoro...
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <a href="#about">O nama</a>
                <a href="/partnership">Partnerstvo</a>
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
            <h1 className="hero-title">
              Vaš pouzdan partner u profesionalnoj kozmetici
            </h1>
            <p className="hero-subtitle">Premium kozmetika za modernu ženu</p>
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
                <p className="section-subtitle">
                  Otkrijte našu premium kolekciju
                </p>
              </div>
              <div className="products-grid">
                {products.map((product) => (
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
                      <div className="product-badge">Novo</div>
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
                        <span className="product-price">${product.price}</span>
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
                  U Vitas Pro verujemo da je šminka umetnost i da lepota dolazi
                  iznutra. Naša premium kozmetika je pažljivo kreirana da
                  naglasi vašu prirodnu lepotu i pomogne vam da izrazite svoj
                  jedinstveni stil. Nudimo visokokvalitetne proizvode koji su
                  bez okrutnosti i napravljeni od najfinijih sastojaka.
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
              <p>Email: info@vitaspro.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Vitas Pro. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

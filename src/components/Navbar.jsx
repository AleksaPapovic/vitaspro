import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCategoriesList, getSubcategories } from "../utils/categories";
import "../pages/Home.css";

function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isHomePage = location.pathname === "/";

  const handleNavClick = (e, path) => {
    if (path.startsWith("#")) {
      // Anchor link - only navigate if not on home page
      if (!isHomePage) {
        e.preventDefault();
        navigate("/" + path);
      }
    } else {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo-container">
              <img
                src="/vitasprologo.jpg"
                alt="Vitas Pro Logo"
                className="logo-image"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
              />
              <h1
                className="logo"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
              >
                VITAS PRO
              </h1>
            </div>
            <div className="nav-links">
              <a
                href={isHomePage ? "#home" : "/"}
                onClick={(e) => handleNavClick(e, isHomePage ? "#home" : "/")}
              >
                Početna
              </a>
              <div
                className="categories-menu-wrapper"
                onMouseEnter={() => setShowCategoriesMenu(true)}
                onMouseLeave={(e) => {
                  const relatedTarget = e.relatedTarget;
                  const currentTarget = e.currentTarget;

                  if (
                    !relatedTarget ||
                    !currentTarget.contains(relatedTarget)
                  ) {
                    setTimeout(() => {
                      const dropdown = document.querySelector(
                        ".categories-dropdown"
                      );
                      const isHoveringWrapper = currentTarget.matches(":hover");
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
                  href={isHomePage ? "#products" : "/#products"}
                  className="categories-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isHomePage) {
                      navigate("/#products");
                    }
                    setShowCategoriesMenu(!showCategoriesMenu);
                  }}
                >
                  Kategorije
                </a>
                {showCategoriesMenu && (
                  <div
                    className="categories-dropdown"
                    onMouseEnter={() => setShowCategoriesMenu(true)}
                    onMouseLeave={(e) => {
                      const relatedTarget = e.relatedTarget;
                      const wrapper = e.currentTarget.closest(
                        ".categories-menu-wrapper"
                      );

                      if (!relatedTarget || !wrapper?.contains(relatedTarget)) {
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
                        {getCategoriesList().map((category, index) => (
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
                          const categoryName =
                            selectedCategory || getCategoriesList()[0]?.id;
                          const subcats = getSubcategories(categoryName);

                          if (
                            !subcats ||
                            (Array.isArray(subcats) && subcats.length === 0)
                          ) {
                            return (
                              <div className="subcategories-content">
                                <div className="subcategories-placeholder">
                                  Proizvodi uskoro...
                                </div>
                              </div>
                            );
                          }

                          // Ako ima podgrupe (kao PREPARATI ZA LICE I TELO, OPREMA ZA SALONE ili MASAŽA)
                          if (
                            subcats.NEGA_LICA ||
                            subcats.ZA_FRIZERE ||
                            subcats.ZA_MASAZU
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
                                    Array.isArray(subgroup.items) &&
                                    subgroup.items.length > 0 ? (
                                      <div className="subgroup-items-grid">
                                        {subgroup.items.map((item) => (
                                          <a
                                            key={item}
                                            href={
                                              isHomePage
                                                ? "#products"
                                                : "/#products"
                                            }
                                            className="subcategory-item"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              if (!isHomePage) {
                                                navigate("/#products");
                                              }
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
                                      href={
                                        isHomePage ? "#products" : "/#products"
                                      }
                                      className="subcategory-item"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (!isHomePage) {
                                          navigate("/#products");
                                        }
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
                              <div className="subcategories-placeholder">
                                Proizvodi uskoro...
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <a
                href={isHomePage ? "#about" : "/#about"}
                onClick={(e) =>
                  handleNavClick(e, isHomePage ? "#about" : "/#about")
                }
              >
                O nama
              </a>
              <a href="/obuke" onClick={(e) => handleNavClick(e, "/obuke")}>
                Obuke
              </a>
              <a
                href="/edukacije"
                onClick={(e) => handleNavClick(e, "/edukacije")}
              >
                Edukacije
              </a>
              <a
                href="/partnership"
                onClick={(e) => handleNavClick(e, "/partnership")}
              >
                Partnerstvo
              </a>
              <a
                href="/admin"
                className="admin-link"
                onClick={(e) => handleNavClick(e, "/admin")}
              >
                Admin
              </a>
              {isHomePage && (
                <div className="cart-icon">
                  <span className="cart-count">{cartCount}</span>
                  🛒
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

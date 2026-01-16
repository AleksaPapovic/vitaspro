import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCategoriesList, getSubcategories } from "../utils/categories";
import "../pages/Home.css";

function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

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
              <button
                className="hamburger-menu"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle menu"
              >
                <span
                  className={`hamburger-line ${showMobileMenu ? "active" : ""}`}
                ></span>
                <span
                  className={`hamburger-line ${showMobileMenu ? "active" : ""}`}
                ></span>
                <span
                  className={`hamburger-line ${showMobileMenu ? "active" : ""}`}
                ></span>
              </button>
              <div
                className={`nav-links-desktop ${
                  showMobileMenu ? "mobile-open" : ""
                }`}
              >
                <div
                  className="categories-menu-wrapper"
                  onMouseEnter={() => {
                    // Only enable hover on desktop
                    if (window.innerWidth > 768) {
                      setShowCategoriesMenu(true);
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Only enable hover on desktop
                    if (window.innerWidth > 768) {
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
                          const isHoveringWrapper =
                            currentTarget.matches(":hover");
                          const isHoveringDropdown =
                            dropdown?.matches(":hover");

                          if (!isHoveringWrapper && !isHoveringDropdown) {
                            setShowCategoriesMenu(false);
                          }
                        }, 200);
                      }
                    }
                  }}
                >
                  <a
                    href={isHomePage ? "#products" : "/#products"}
                    className="categories-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCategoriesMenu(!showCategoriesMenu);
                      // Don't close mobile menu on mobile devices
                      if (window.innerWidth > 768) {
                        if (!isHomePage) {
                          navigate("/#products");
                        }
                      }
                    }}
                  >
                    Proizvodi {showCategoriesMenu ? "▲" : "▼"}
                  </a>
                  {showCategoriesMenu && (
                    <div
                      className="categories-dropdown"
                      onMouseEnter={() => {
                        // Only enable hover on desktop
                        if (window.innerWidth > 768) {
                          setShowCategoriesMenu(true);
                        }
                      }}
                      onMouseLeave={(e) => {
                        // Only enable hover on desktop
                        if (window.innerWidth > 768) {
                          const relatedTarget = e.relatedTarget;
                          const wrapper = e.currentTarget.closest(
                            ".categories-menu-wrapper"
                          );

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
                              }
                            }, 150);
                          }
                        }
                      }}
                    >
                      <div className="categories-panel">
                        {getCategoriesList().map((category) => {
                          const subcats = getSubcategories(category.id);
                          const isExpanded =
                            expandedCategories[category.id] || false;

                          return (
                            <div key={category.id} className="category-item">
                              <div
                                className="category-header"
                                onClick={() => {
                                  setExpandedCategories((prev) => ({
                                    ...prev,
                                    [category.id]: !prev[category.id],
                                  }));
                                }}
                              >
                                <span className="category-name">
                                  {category.name}
                                </span>
                                <span className="category-arrow">
                                  {isExpanded ? "▲" : "▼"}
                                </span>
                              </div>
                              {isExpanded && (
                                <div className="subcategories-container">
                                  {(() => {
                                    if (
                                      !subcats ||
                                      (Array.isArray(subcats) &&
                                        subcats.length === 0)
                                    ) {
                                      return (
                                        <div className="subcategories-empty">
                                          Proizvodi uskoro...
                                        </div>
                                      );
                                    }

                                    // Ako ima podgrupe
                                    if (
                                      subcats.NEGA_LICA ||
                                      subcats.ZA_FRIZERE ||
                                      subcats.ZA_MASAZU
                                    ) {
                                      return (
                                        <div className="subcategories-content">
                                          {Object.values(subcats).map(
                                            (subgroup) => (
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
                                                    {subgroup.items.map(
                                                      (item) => (
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
                                                              navigate(
                                                                "/#products"
                                                              );
                                                            }
                                                            setShowCategoriesMenu(
                                                              false
                                                            );
                                                            setShowMobileMenu(
                                                              false
                                                            );
                                                          }}
                                                        >
                                                          {item}
                                                        </a>
                                                      )
                                                    )}
                                                  </div>
                                                ) : (
                                                  <p className="subgroup-empty">
                                                    Proizvodi uskoro...
                                                  </p>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      );
                                    }

                                    // Ako su podkategorije običan niz
                                    if (
                                      Array.isArray(subcats) &&
                                      subcats.length > 0
                                    ) {
                                      return (
                                        <div className="subcategories-grid">
                                          {subcats.map((subcat) => (
                                            <a
                                              key={subcat}
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
                                                setShowMobileMenu(false);
                                              }}
                                            >
                                              {subcat}
                                            </a>
                                          ))}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="subcategories-empty">
                                        Proizvodi uskoro...
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <a
                  href="/obuke"
                  onClick={(e) => {
                    handleNavClick(e, "/obuke");
                    setShowMobileMenu(false);
                  }}
                >
                  Obuke
                </a>
                <a
                  href="/partnership"
                  className="admin-link"
                  onClick={(e) => {
                    handleNavClick(e, "/partnership");
                    setShowMobileMenu(false);
                  }}
                >
                  Partnerstvo
                </a>
                <a
                  href="/crnagora"
                  onClick={(e) => {
                    handleNavClick(e, "/crnagora");
                    setShowMobileMenu(false);
                  }}
                >
                  Crna Gora
                </a>
                {/* <a
                  href="/admin"
                  className="admin-link"
                  onClick={(e) => {
                    handleNavClick(e, "/admin");
                    setShowMobileMenu(false);
                  }}
                >
                  Admin
                </a> */}
                {/* <a
                  href="/adminnew"
                  className="admin-link"
                  onClick={(e) => {
                    handleNavClick(e, "/adminnew");
                    setShowMobileMenu(false);
                  }}
                >
                  Admin New
                </a> */}
                <a
                  href={isHomePage ? "#about" : "/#about"}
                  onClick={(e) => {
                    handleNavClick(e, isHomePage ? "#about" : "/#about");
                    setShowMobileMenu(false);
                  }}
                >
                  O nama
                </a>
              </div>
              <a
                href="/cart"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/cart");
                  setShowMobileMenu(false);
                }}
                className="cart-icon-link"
                title="Korpa"
              >
                <div className="cart-icon">
                  <span className="cart-count">{cartCount}</span>
                  🛒
                </div>
              </a>
            </div>
            {showMobileMenu && (
              <div
                className="mobile-menu-overlay"
                onClick={() => setShowMobileMenu(false)}
              ></div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

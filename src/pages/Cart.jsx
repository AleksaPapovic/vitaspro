import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGoogleDriveImageUrl } from "../utils/imageHelper";
import Navbar from "../components/Navbar";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    setCartItems(cart);
    setCartCount(cart.length);
  };

  const removeFromCart = (index) => {
    const cart = JSON.parse(localStorage.getItem("vitaspro_cart") || "[]");
    const removedItem = cart[index];
    cart.splice(index, 1);
    localStorage.setItem("vitaspro_cart", JSON.stringify(cart));
    loadCart();
    showToast(`${removedItem.name} je uklonjen iz korpe`, "success");
  };

  const clearCart = () => {
    if (window.confirm("Da li ste sigurni da želite da ispraznite korpu?")) {
      localStorage.setItem("vitaspro_cart", JSON.stringify([]));
      loadCart();
      showToast("Korpa je ispražnjena", "success");
    }
  };

  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0);
  };

  return (
    <div className="cart-page">
      <Navbar cartCount={cartCount} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <main className="cart-main">
        <div className="container">
          <div className="cart-header">
            <h1 className="cart-title">Korpa</h1>
            <button onClick={() => navigate("/")} className="continue-shopping-btn">
              ← Nastavi kupovinu
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-cart-icon">🛒</div>
              <h2>Vaša korpa je prazna</h2>
              <p>Dodajte proizvode u korpu da nastavite sa kupovinom</p>
              <button
                onClick={() => navigate("/")}
                className="shop-now-button"
              >
                Istražite proizvode
              </button>
            </div>
          ) : (
            <>
              <div className="cart-content">
                <div className="cart-items">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="cart-item">
                      <div className="cart-item-image">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "/vitaspro.jpg";
                          }}
                        />
                      </div>
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        {item.description && (
                          <p className="cart-item-description">
                            {item.description}
                          </p>
                        )}
                        <div className="cart-item-price">
                          {item.price} RSD
                        </div>
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={() => removeFromCart(index)}
                        title="Ukloni iz korpe"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-header">
                    <h2>Sažetak</h2>
                  </div>
                  <div className="summary-content">
                    <div className="summary-row">
                      <span>Ukupno proizvoda:</span>
                      <span>{cartItems.length}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Ukupna cena:</span>
                      <span>{calculateTotal().toLocaleString()} RSD</span>
                    </div>
                  </div>
                  <div className="summary-actions">
                    <button
                      className="clear-cart-btn"
                      onClick={clearCart}
                    >
                      Isprazni korpu
                    </button>
                    <button
                      className="checkout-btn"
                      onClick={() => {
                        showToast(
                          "Funkcionalnost naručivanja će biti dostupna uskoro",
                          "info",
                          5000
                        );
                      }}
                    >
                      Nastavi na plaćanje
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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

export default Cart;

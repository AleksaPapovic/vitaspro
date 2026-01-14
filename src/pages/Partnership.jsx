import { useState } from "react";
import "./Partnership.css";

function Partnership() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add logic to send the form data
    console.log("Partnership form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ email: "", phone: "", message: "" });
    }, 3000);
    alert("Hvala vam! Vaša poruka je poslata. Kontaktiraćemo vas uskoro.");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="partnership-page">
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
                <a href="/">Početna</a>
                <a href="/#products">Proizvodi</a>
                <a href="/#about">O nama</a>
                <a href="/admin" className="admin-link">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="partnership-main">
        <section className="partnership-hero">
          <div className="container">
            <h1 className="partnership-title">Partnerstvo</h1>
            <p className="partnership-subtitle">
              Postanite naš partner i proširite svoj posao
            </p>
          </div>
        </section>

        <section className="partnership-offer">
          <div className="container">
            <div className="offer-content">
              <h2 className="offer-title">
                Posebna ponuda za kozmetičke i frizerske salone
              </h2>
              <div className="offer-description">
                <p>
                  U Vitas Pro verujemo u snagu partnerstva. Ako vodiте kozmetički
                  ili frizerski salon, nudimo vam posebne uslove saradnje koje
                  će pomoći vašem poslu da raste i napreduje.
                </p>
                <p>
                  Naša ponuda uključuje povoljne cene, stručnu podršku,
                  obuke za vaš tim, i pristup najnovijim proizvodima na tržištu.
                  Zajedno možemo stvoriti uspešnu i dugotrajnu saradnju.
                </p>
                <p>
                  Kontaktirajte nas danas i saznajte više o našim uslovima
                  partnerstva. Naš tim će vam pomoći da pronađete najbolje
                  rešenje za vaš salon.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="partnership-form-section">
          <div className="container">
            <div className="form-container">
              <h2 className="form-title">Kontaktirajte nas</h2>
              <p className="form-subtitle">
                Popunite formu ispod i naš tim će vas kontaktirati u najkraćem
                roku
              </p>

              {submitted && (
                <div className="success-message">
                  Hvala vam! Vaša poruka je poslata. Kontaktiraćemo vas uskoro.
                </div>
              )}

              <form onSubmit={handleSubmit} className="partnership-form">
                <div className="form-group">
                  <label htmlFor="email">Email adresa *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vas.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Broj telefona *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+381 60 123 4567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Poruka *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Opišite vaš salon i vaše potrebe..."
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Pošaljite poruku
                </button>
              </form>
            </div>
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

export default Partnership;

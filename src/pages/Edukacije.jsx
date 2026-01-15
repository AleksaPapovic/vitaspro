import { useState } from "react";
import Navbar from "../components/Navbar";
import "./Edukacije.css";

function Edukacije() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Edukacije form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
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
    <div className="edukacije-page">
      <Navbar />

      <main className="edukacije-main">
        <section className="edukacije-hero">
          <div className="container">
            <h1 className="edukacije-title">Edukacije</h1>
            <p className="edukacije-subtitle">
              Napredni edukativni programi
            </p>
          </div>
        </section>

        <section className="edukacije-offer">
          <div className="container">
            <div className="offer-content">
              <h2 className="offer-title">
                Edukativni programi za profesionalce
              </h2>
              <div className="offer-description">
                <p>
                  U Vitas Pro verujemo u kontinuirano obrazovanje. Naši
                  edukativni programi su dizajnirani za profesionalce koji žele
                  da prošire svoje znanje i veštine u oblasti kozmetike i
                  frizerstva.
                </p>
                <p>
                  Naši edukativni programi uključuju teorijsku i praktičnu
                  nastavu, rad sa najnovijim tehnologijama i proizvodima, i
                  pristup ekspertima iz industrije. Pomažemo vam da ostanete u
                  koraku sa najnovijim trendovima i tehnikama.
                </p>
                <p>
                  Kontaktirajte nas danas i saznajte više o našim edukativnim
                  programima. Naš tim će vam pomoći da pronađete program koji
                  najbolje odgovara vašim potrebama.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="edukacije-form-section">
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

              <form onSubmit={handleSubmit} className="edukacije-form">
                <div className="form-group">
                  <label htmlFor="name">Ime i prezime *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vaše ime i prezime"
                    required
                  />
                </div>

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
                    placeholder="Opišite vaše potrebe za edukacijom..."
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
                  <a href="/obuke">Obuke</a>
                </li>
                <li>
                  <a href="/edukacije">Edukacije</a>
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

export default Edukacije;

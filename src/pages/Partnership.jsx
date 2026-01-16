import { useState } from "react";
import Navbar from "../components/Navbar";
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
      <Navbar />

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
                <p>Vitas Pro misli na svoje salone.</p>
                <p>
                  Kroz kontinuiranu saradnju nudimo posebne pogodnosti i uslove
                  koji unapređuju znanje i kvalitet rada u vašem salonu. Pored
                  obuka, seminara i edukacija, pružamo start-up pakete i
                  specijalizovane asortimane za salone sa dugogodišnjim
                  iskustvom, kao i one koji žele da napreduju.
                </p>
                <p>
                  Za svakog klijenta obezbeđujemo ne samo proizvode, već i
                  stručnu podršku. Uz pravi izbor i stečeno znanje, zajedno
                  rastemo.
                </p>
                <p>Kontaktirajte nas – Vaš Vitas Pro.</p>
                <p>
                  <strong>Kontakt: 063/755-42-88</strong>
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

export default Partnership;

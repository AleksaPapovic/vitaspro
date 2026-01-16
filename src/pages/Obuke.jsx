import { useState } from "react";
import Navbar from "../components/Navbar";
import "./Obuke.css";

function Obuke() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Obuke form submitted:", formData);
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
    <div className="obuke-page">
      <Navbar />

      <main className="obuke-main">
        <section className="obuke-hero">
          <div className="container">
            <h1 className="obuke-title">Obuke i Edukacije</h1>
            <p className="obuke-subtitle">
              Profesionalne obuke i edukativni programi za vaš tim
            </p>
          </div>
        </section>

        <section className="obuke-offer">
          <div className="container">
            <div className="offer-content">
              <h2 className="offer-title">
                Stručne obuke za kozmetičke i frizerske salone
              </h2>
              <div className="offer-description">
                <p>
                  U Vitas Pro nudimo profesionalne obuke za vaš tim. Naše obuke
                  su dizajnirane da pruže praktično znanje i veštine potrebne za
                  uspešan rad u kozmetičkim i frizerskim salonima.
                </p>
                <p>
                  Naše obuke uključuju rad sa najnovijim proizvodima, tehnike
                  primene, i najbolje prakse u industriji. Obučavamo vaš tim da
                  koristi naše proizvode na najbolji mogući način, što će
                  poboljšati kvalitet usluga vašeg salona.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="obuke-offer" style={{ background: "black", color: "white", padding: "5rem 0" }}>
          <div className="container">
            <div className="offer-content">
              <h2 className="offer-title" style={{ color: "#d4af37", borderBottomColor: "#d4af37" }}>
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
                  Kontaktirajte nas danas i saznajte više o našim programima
                  obuke i edukacije. Naš tim će vam pomoći da pronađete najbolje
                  rešenje za vaš salon.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="obuke-form-section">
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

              <form onSubmit={handleSubmit} className="obuke-form">
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
                    placeholder="Opišite vaše potrebe za obukom i edukacijom..."
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

export default Obuke;

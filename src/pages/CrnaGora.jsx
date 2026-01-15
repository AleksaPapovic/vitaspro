import { useState } from "react";
import Navbar from "../components/Navbar";
import "./CrnaGora.css";

function CrnaGora() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Crna Gora form submitted:", formData);
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
    <div className="crnagora-page">
      <Navbar />

      <main className="crnagora-main">
        <section className="crnagora-hero">
          <div className="container">
            <h1 className="crnagora-title">Crna Gora</h1>
            <p className="crnagora-subtitle">
              Vitas Pro na tržištu Crne Gore
            </p>
          </div>
        </section>

        <section className="crnagora-offer">
          <div className="container">
            <div className="offer-content">
              <h2 className="offer-title">
                Naše prisustvo na tržištu Crne Gore
              </h2>
              <div className="offer-description">
                <p>
                  Vitas Pro je ponosno prisutan na tržištu Crne Gore, pružajući
                  profesionalne kozmetičke proizvode najvišeg kvaliteta salonima
                  širom zemlje. Naša misija je da kroz direktnu saradnju sa
                  lokalnim salonima i profesionalcima, unapredimo standarde
                  kozmetičkih usluga i pružimo pristup najboljim proizvodima na
                  tržištu.
                </p>
                <p>
                  Kroz strateško partnerstvo sa salonima u Crnoj Gori, Vitas Pro
                  nudi kompletan asortiman proizvoda koji pokrivaju sve segmente
                  moderne kozmetičke industrije – od nege kose i noktiju, do
                  preparata za lice i telo, opreme za salone i programa za
                  masažu i depilaciju.
                </p>
                <p>
                  Naš tim je posvećen pružanju stručne podrške, obuka i edukacija
                  za naše partnere u Crnoj Gori, osiguravajući da svaki salon
                  koji saradjuje sa nama ima pristup najnovijim tehnologijama,
                  trendovima i najboljim praksama u industriji.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="crnagora-brand">
          <div className="container">
            <div className="offer-content">
              <h2 className="offer-title">O brendu Vitas Pro</h2>
              <div className="offer-description">
                <p>
                  Vitas Pro je ekskluzivni salonski partner specijalizovan za
                  distribuciju profesionalnih kozmetičkih proizvoda najvišeg
                  kvaliteta. Naš cilj je da salonima obezbedimo kompletna i
                  pouzdana rešenja koja podižu standard usluge i unapređuju
                  rezultate u svakodnevnom radu.
                </p>
                <p>
                  Pažljivo biramo brendove i linije proizvoda koje odgovaraju
                  savremenim zahtevima profesionalne nege, sa fokusom na zdravlje,
                  efikasnost i dugoročno očuvanje kvaliteta. Naš asortiman
                  obuhvata sve segmente jednog modernog salona – negu kose, noktiju,
                  lica i tela, kao i programe za masažu i depilaciju, omogućavajući
                  celovitu i ujednačenu ponudu na jednom mestu.
                </p>
                <p>
                  Verujemo u kontinuiranu saradnju sa našim partnerima, pružajući
                  ne samo proizvode, već i stručnu podršku, obuke i edukacije koje
                  pomažu salonima da rastu i napreduju. Zajedno gradimo uspešnu
                  budućnost kozmetičke industrije.
                </p>
                <p>
                  <strong>Kontakt: 063/755-42-88</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="crnagora-form-section">
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

              <form onSubmit={handleSubmit} className="crnagora-form">
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
                    placeholder="+382 60 123 456"
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
                    placeholder="Opišite vaše potrebe i interesovanje..."
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
                  <a href="/crnagora">Crna Gora</a>
                </li>
                <li>
                  <a href="/partnership">Partnerstvo</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Kontakt</h4>
              <p>Email: info@vitaspro.com</p>
              <p>Phone: 063/755-42-88</p>
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

export default CrnaGora;

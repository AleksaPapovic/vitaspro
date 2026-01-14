import { useState, useEffect } from "react";
import { getProducts, saveProduct, deleteProduct } from "../utils/storage";
import { getGoogleDriveImageUrl } from "../utils/imageHelper";
import "./Admin.css";

function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    images: [], // Array of Google Drive URLs
    description: "",
  });
  const [message, setMessage] = useState("");
  const [driveConfig, setDriveConfig] = useState(() => {
    const stored = localStorage.getItem("vitaspro_drive_config");
    if (stored) {
      return JSON.parse(stored);
    }
    // Default configuration with user's Google Drive file
    return {
      fileUrl:
        "https://drive.google.com/file/d/1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv/view?usp=sharing",
      appsScriptUrl: "",
    };
  });
  const [showDriveConfig, setShowDriveConfig] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (forceRefresh = false) => {
    setLoading(true);
    try {
      console.log(
        "Loading products from Google Drive...",
        forceRefresh ? "(force refresh)" : ""
      );
      const loadedProducts = await getProducts(forceRefresh);
      console.log("Loaded products:", loadedProducts.length);
      console.log(
        "Product IDs:",
        loadedProducts.map((p) => p.id)
      );
      setProducts(loadedProducts);
      console.log("Products state updated");
      return loadedProducts;
    } catch (error) {
      console.error("Error loading products:", error);
      setMessage("Greška pri učitavanju proizvoda");
      setTimeout(() => setMessage(""), 3000);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.image) {
      setMessage("Molimo popunite sva obavezna polja");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setMessage("Čuvanje proizvoda...");
      await saveProduct(formData);
      await loadProducts();
      setFormData({
        name: "",
        price: "",
        image: "",
        images: [],
        description: "",
      });
      setMessage("Proizvod je uspešno dodat! Google Drive fajl je ažuriran.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg = error.message || "Error saving product";
      setMessage(
        `${errorMsg}. Please check Google Apps Script configuration in settings.`
      );
      setTimeout(() => setMessage(""), 8000);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")
    ) {
      try {
        setMessage("Brisanje proizvoda...");
        console.log("=== DELETE START ===");
        console.log("Product ID to delete:", id);
        console.log("Current products before delete:", products.length);
        console.log(
          "Product IDs:",
          products.map((p) => p.id)
        );

        // Optimistically update the UI first (use string comparison to match deleteProduct logic)
        const productToDelete = products.find(
          (p) => String(p.id) === String(id)
        );
        if (!productToDelete) {
          console.error("Product not found in current list!");
          console.error("Looking for ID:", id, "Type:", typeof id);
          console.error(
            "Available IDs:",
            products.map((p) => ({ id: p.id, type: typeof p.id, name: p.name }))
          );
          throw new Error(
            `Proizvod sa ID "${id}" nije pronađen u trenutnoj listi`
          );
        }

        // Update UI immediately
        const filteredProducts = products.filter(
          (p) => String(p.id) !== String(id)
        );
        setProducts(filteredProducts);
        console.log(
          "UI updated immediately, products count:",
          filteredProducts.length
        );

        // Delete the product (this will update Google Drive)
        console.log("Calling deleteProduct...");
        const result = await deleteProduct(id);
        console.log("deleteProduct completed, result:", result);
        console.log("Expected product count after delete:", result.length);

        // Wait longer for Google Drive to update (same as add)
        console.log("Waiting for Google Drive to process update...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Reload products with force refresh to bypass any cache
        console.log("Reloading products from Google Drive (force refresh)...");
        const reloadedProducts = await loadProducts(true);
        console.log("Products reloaded, count:", reloadedProducts.length);
        console.log(
          "Reloaded product IDs:",
          reloadedProducts.map((p) => p.id)
        );

        // Verify the delete worked
        const deletedProductStillExists = reloadedProducts.some(
          (p) => String(p.id) === String(id)
        );
        if (deletedProductStillExists) {
          console.error(
            "⚠️ WARNING: Deleted product still exists in Google Drive!"
          );
          console.error(
            "This means the Google Drive update may not have completed yet."
          );
          console.error(
            "Please wait a few seconds and refresh manually, or check your Google Apps Script."
          );
          setMessage(
            "Proizvod je obrisan iz interfejsa, ali Google Drive ažuriranje možda još uvek obrađuje. Molimo osvežite za nekoliko sekundi."
          );
        } else {
          console.log(
            "✅ Verified: Deleted product is no longer in Google Drive"
          );
          setMessage(
            "Proizvod je uspešno obrisan! Google Drive fajl je ažuriran."
          );
        }

        console.log("=== DELETE END ===");

        setMessage("Product deleted successfully! Google Drive file updated.");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error("=== DELETE ERROR ===", error);
        // Reload products to get the correct state
        await loadProducts();
        const errorMsg = error.message || "Error deleting product";
        setMessage(
          `Error: ${errorMsg}. Please check Google Apps Script configuration in settings.`
        );
        setTimeout(() => setMessage(""), 8000);
      }
    }
  };

  const getImageUrl = (url) => {
    return getGoogleDriveImageUrl(url);
  };

  const handleDriveConfigSave = (e) => {
    e.preventDefault();
    localStorage.setItem("vitaspro_drive_config", JSON.stringify(driveConfig));
    setMessage(
      "Google Drive konfiguracija je sačuvana! Ponovno učitavanje proizvoda..."
    );
    setTimeout(() => {
      loadProducts();
      setMessage("");
    }, 2000);
  };

  const testAppsScript = async () => {
    if (!driveConfig.appsScriptUrl || driveConfig.appsScriptUrl.trim() === "") {
      setMessage("Molimo unesite Google Apps Script URL prvo");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setMessage("Testiranje Google Apps Script konekcije...");
      const testData = [
        {
          id: "test",
          name: "Test Product",
          price: "0",
          image: "",
          description: "",
        },
      ];

      await fetch(driveConfig.appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          data: testData,
        }),
        mode: "no-cors",
      });

      setMessage(
        "Test zahtev je poslat! Proverite vaš Google Drive fajl da potvrdite da radi. Ako se fajl ažurira, vaš Apps Script radi ispravno."
      );
      setTimeout(() => setMessage(""), 8000);
    } catch (error) {
      setMessage(
        `Test failed: ${error.message}. Please check your Apps Script URL and deployment settings.`
      );
      setTimeout(() => setMessage(""), 8000);
    }
  };

  return (
    <div className="admin">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Vitas Pro Admin</h1>
          <p>Upravljajte svojim proizvodima</p>
          <button
            onClick={() => setShowDriveConfig(!showDriveConfig)}
            className="drive-config-toggle"
          >
            {showDriveConfig ? "Sakrij" : "Prikaži"} Google Drive podešavanja
          </button>
        </header>

        {showDriveConfig && (
          <section className="drive-config-section">
            <h2>Google Drive konfiguracija</h2>
            <p className="config-instructions">
              <strong>Korak 1:</strong> Podesite Google Apps Script (pogledajte
              uputstva ispod)
              <br />
              <strong>Korak 2:</strong> Nalepite vaš Google Drive fajl URL i
              Apps Script URL ispod
            </p>
            <form
              onSubmit={handleDriveConfigSave}
              className="drive-config-form"
            >
              <div className="form-group">
                <label htmlFor="driveUrl">Google Drive fajl URL</label>
                <input
                  type="url"
                  id="driveUrl"
                  value={driveConfig.fileUrl || ""}
                  onChange={(e) =>
                    setDriveConfig({ ...driveConfig, fileUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/file/d/1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv/view"
                />
                <small className="help-text">
                  Link za deljenje vašeg Google Drive products.json fajla
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="appsScriptUrl">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  id="appsScriptUrl"
                  value={driveConfig.appsScriptUrl || ""}
                  onChange={(e) =>
                    setDriveConfig({
                      ...driveConfig,
                      appsScriptUrl: e.target.value,
                    })
                  }
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                />
                <small className="help-text">
                  Nalepite vaš Google Apps Script web app URL (pogledajte
                  uputstva za podešavanje)
                </small>
              </div>
              <div className="config-buttons">
                <button type="submit" className="submit-button">
                  Sačuvaj konfiguraciju
                </button>
                <button
                  type="button"
                  onClick={testAppsScript}
                  className="test-button"
                >
                  Testiraj Apps Script konekciju
                </button>
              </div>
            </form>
            <div className="apps-script-instructions">
              <h3>Google Apps Script podešavanje:</h3>
              <ol>
                <li>
                  Idite na{" "}
                  <a
                    href="https://script.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    script.google.com
                  </a>
                </li>
                <li>Kreirajte novi projekat</li>
                <li>
                  Nalepite kod iz <code>google-apps-script.js</code> (pogledajte
                  fajlove projekta)
                </li>
                <li>
                  Zamenite <code>FILE_ID</code> sa:{" "}
                  <strong>1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv</strong>
                </li>
                <li>Kliknite "Deploy" → "New deployment" → "Web app"</li>
                <li>
                  Postavite "Execute as" na "Me" i "Who has access" na "Anyone"
                </li>
                <li>Kopirajte Web app URL i nalepite ga iznad</li>
              </ol>
            </div>
          </section>
        )}

        {message && (
          <div
            className={`message ${
              message.includes("success") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="admin-content">
          <section className="admin-form-section">
            <h2>Dodaj novi proizvod</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Naziv proizvoda *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="npr. Premium ruž - Rose Gold"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Cena ($) *</label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="29.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Glavna slika URL (Google Drive) *</label>
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                  required
                />
                <small className="help-text">
                  Glavna slika proizvoda (koristi se u mreži proizvoda)
                </small>
              </div>

              <div className="form-group">
                <label>Dodatne slike (opciono)</label>
                <div className="images-input-container">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="image-input-row">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                        className="image-url-input"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter(
                            (_, i) => i !== index
                          );
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        images: [...formData.images, ""],
                      });
                    }}
                    className="add-image-btn"
                  >
                    + Dodaj sliku
                  </button>
                </div>
                <small className="help-text">
                  Dodajte više slika proizvoda za stranicu detalja. Kliknite
                  "Dodaj sliku" da dodate više polja za unos.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Opis (opciono)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Opis proizvoda..."
                  rows="3"
                />
              </div>

              <button type="submit" className="submit-button">
                Dodaj proizvod
              </button>
            </form>
          </section>

          <section className="admin-products-section">
            <h2>Trenutni proizvodi ({products.length})</h2>
            {loading ? (
              <div className="empty-products">
                <p>Učitavanje proizvoda...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-products">
                <p>Još nema proizvoda. Dodajte vaš prvi proizvod iznad!</p>
              </div>
            ) : (
              <div className="admin-products-grid">
                {products.map((product) => (
                  <div key={product.id} className="admin-product-card">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="admin-product-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                    <div className="admin-product-info">
                      <h3>{product.name}</h3>
                      <p className="admin-product-price">${product.price}</p>
                      {product.description && (
                        <p className="admin-product-desc">
                          {product.description}
                        </p>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="delete-button"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="admin-footer">
          <a href="/" className="back-link">
            ← Nazad u prodavnicu
          </a>
        </div>
      </div>
    </div>
  );
}

export default Admin;

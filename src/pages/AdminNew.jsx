import { useState, useEffect } from "react";
import { getProducts } from "../utils/storage";
import { getGoogleDriveImageUrl } from "../utils/imageHelper";
import { getCategoriesList } from "../utils/categories";
import Navbar from "../components/Navbar";
import "./AdminNew.css";

function AdminNew() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null, // File object for main image
    images: [], // Array of File objects for additional images
    description: "",
    category: "", // Category ID
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imagesPreview, setImagesPreview] = useState([]);
  const [message, setMessage] = useState("");
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingAdditional, setIsDraggingAdditional] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [driveConfig, setDriveConfig] = useState(() => {
    const stored = localStorage.getItem("vitaspro_drive_config");
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      fileUrl:
        "https://drive.google.com/file/d/1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv/view?usp=sharing",
      appsScriptUrl: "", // For image upload
      productsJsonUpdateUrl: "", // For products.json update
    };
  });
  const [showDriveConfig, setShowDriveConfig] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const loadedProducts = await getProducts(forceRefresh);
      setProducts(loadedProducts);
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

  // Convert file to base64 data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // Extract fileId from fileUrl
  const getFileId = () => {
    let fileId = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv"; // Default
    if (driveConfig.fileUrl) {
      const match = driveConfig.fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    return fileId;
  };

  // Update products.json on Google Drive
  const updateProductsJson = async (appsScriptUrl, products) => {
    const fileId = getFileId();

    // Ensure URL ends with /exec
    let url = appsScriptUrl.trim();
    if (!url.endsWith("/exec") && !url.endsWith("/exec/")) {
      url = url.replace(/\/$/, "") + "/exec";
    }

    const requestBody = {
      action: "update",
      data: products,
      fileId: fileId,
    };

    // Try multiple methods
    const methods = [
      // Method 1: JSON POST
      async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Update failed");
        }
        return result;
      },
      // Method 2: URL-encoded
      async () => {
        const params = new URLSearchParams();
        params.append("action", "update");
        params.append("data", JSON.stringify(products));
        params.append("fileId", fileId);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Update failed");
        }
        return result;
      },
    ];

    // Try each method
    for (let i = 0; i < methods.length; i++) {
      try {
        const result = await methods[i]();
        console.log(
          `✅ Products.json updated successfully (method ${i + 1}):`,
          result
        );
        return result;
      } catch (error) {
        console.warn(`⚠️ Method ${i + 1} failed:`, error.message);
        if (i === methods.length - 1) {
          throw error;
        }
      }
    }
  };

  // Upload image to Google Drive via Apps Script
  const uploadImageToDrive = async (file, fileName) => {
    if (!driveConfig.appsScriptUrl || driveConfig.appsScriptUrl.trim() === "") {
      throw new Error(
        "Google Apps Script URL nije konfigurisan. Molimo unesite URL u podešavanjima."
      );
    }

    try {
      console.log("Converting file to base64...");
      // Convert file to base64
      const base64Data = await fileToDataURL(file);
      console.log("File converted, size:", base64Data.length);

      const fileId = getFileId();
      console.log("File ID:", fileId);
      console.log("Apps Script URL:", driveConfig.appsScriptUrl);

      // Ensure URL ends with /exec
      let url = driveConfig.appsScriptUrl.trim();
      if (!url.endsWith("/exec") && !url.endsWith("/exec/")) {
        url = url.replace(/\/$/, "") + "/exec";
      }

      // Try multiple methods to send the request
      let response;
      let lastError;

      try {
        // Method 1: JSON POST
        console.log("Trying JSON POST method...");
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "uploadImage",
            imageBlob: base64Data,
            fileName:
              fileName || `image_${Date.now()}.${file.name.split(".").pop()}`,
            fileId: fileId,
          }),
        });
        console.log("JSON POST response status:", response.status);
      } catch (jsonError) {
        console.warn("JSON POST failed, trying URL-encoded:", jsonError);
        lastError = jsonError;

        // Method 2: URL-encoded
        const urlEncoded = new URLSearchParams();
        urlEncoded.append("action", "uploadImage");
        urlEncoded.append("imageBlob", base64Data);
        urlEncoded.append(
          "fileName",
          fileName || `image_${Date.now()}.${file.name.split(".").pop()}`
        );
        urlEncoded.append("fileId", fileId);

        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlEncoded.toString(),
        });
        console.log("URL-encoded response status:", response.status);
      }

      if (!response || !response.ok) {
        const errorText = response
          ? await response.text()
          : lastError?.message || "No response";
        console.error("Upload failed:", errorText);
        throw new Error(`HTTP ${response?.status || "N/A"}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Upload result:", result);

      if (result.success) {
        return result.url; // Return Google Drive share URL
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image to Google Drive:", error);
      throw error;
    }
  };

  // Upload multiple images to Google Drive
  const uploadImagesToDrive = async (files) => {
    if (!driveConfig.appsScriptUrl || driveConfig.appsScriptUrl.trim() === "") {
      throw new Error(
        "Google Apps Script URL nije konfigurisan. Molimo unesite URL u podešavanjima."
      );
    }

    try {
      // Convert all files to base64
      const imagesData = await Promise.all(
        files.map(async (file, index) => {
          const base64 = await fileToDataURL(file);
          return {
            base64: base64,
            fileName: file.name || `image_${Date.now()}_${index}.jpg`,
          };
        })
      );

      const fileId = getFileId();

      // Try multiple methods
      let response;
      try {
        // Method 1: JSON POST
        response = await fetch(driveConfig.appsScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "uploadImages",
            imagesData: imagesData,
            fileId: fileId,
          }),
        });
      } catch {
        // Method 2: URL-encoded
        const urlEncoded = new URLSearchParams();
        urlEncoded.append("action", "uploadImages");
        urlEncoded.append("imagesData", JSON.stringify(imagesData));
        urlEncoded.append("fileId", fileId);

        response = await fetch(driveConfig.appsScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlEncoded.toString(),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.results) {
        // Return array of URLs
        return result.results
          .map((r) => (r.success ? r.url : null))
          .filter(Boolean);
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading images to Google Drive:", error);
      throw error;
    }
  };

  // Handle main image upload
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, image: file });
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional images upload
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      const newImages = [...formData.images, ...files];
      setFormData({ ...formData, images: newImages });

      // Create previews for new images
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagesPreview((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Drag and drop handlers for main image
  const handleMainDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(true);
  };

  const handleMainDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      const file = files[0]; // Take first file for main image
      setFormData({ ...formData, image: file });
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers for additional images
  const handleAdditionalDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAdditional(true);
  };

  const handleAdditionalDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAdditional(false);
  };

  const handleAdditionalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAdditional(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      const newImages = [...formData.images, ...files];
      setFormData({ ...formData, images: newImages });

      // Create previews for new images
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagesPreview((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagesPreview.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagesPreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.image ||
      !formData.category
    ) {
      setMessage("Molimo popunite sva obavezna polja");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!driveConfig.appsScriptUrl || driveConfig.appsScriptUrl.trim() === "") {
      setMessage(
        "Molimo unesite Google Apps Script URL za upload slika u podešavanjima."
      );
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    if (
      !driveConfig.productsJsonUpdateUrl ||
      driveConfig.productsJsonUpdateUrl.trim() === ""
    ) {
      setMessage(
        "Molimo unesite Google Apps Script URL za update products.json u podešavanjima."
      );
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    try {
      console.log("Starting product submission...");
      console.log("Form data:", {
        name: formData.name,
        price: formData.price,
        hasImage: !!formData.image,
        imagesCount: formData.images.length,
        category: formData.category,
      });

      // Show modal immediately
      setShowModal(true);
      setIsLoading(true);
      setModalMessage("Priprema glavne slike za upload...");
      console.log("Modal should be visible now, showModal:", true);

      // Small delay to ensure modal is rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Upload main image to Google Drive
      const mainImageFileName = formData.image.name || `main_${Date.now()}.jpg`;
      setModalMessage("Upload glavne slike na Google Drive...");
      console.log("Starting main image upload...");
      const mainImageUrl = await uploadImageToDrive(
        formData.image,
        mainImageFileName
      );
      console.log("Main image uploaded:", mainImageUrl);

      // Upload additional images to Google Drive
      let additionalImagesUrls = [];
      if (formData.images.length > 0) {
        setModalMessage(
          `Upload ${formData.images.length} dodatnih slika na Google Drive...`
        );
        console.log("Starting additional images upload...");
        additionalImagesUrls = await uploadImagesToDrive(formData.images);
        console.log("Additional images uploaded:", additionalImagesUrls);
      }

      setModalMessage("Učitavanje trenutne liste proizvoda...");

      // Get current products
      const currentProducts = await getProducts();

      // Create new product data with Google Drive URLs
      const newProduct = {
        id: Date.now().toString(),
        name: formData.name,
        price: formData.price,
        image: mainImageUrl, // Google Drive share URL
        images:
          additionalImagesUrls.length > 0 ? additionalImagesUrls : undefined, // Array of Google Drive URLs
        description: formData.description || "",
        category: formData.category,
        createdAt: new Date().toISOString(),
      };

      // Add new product to array
      const updatedProducts = [...currentProducts, newProduct];

      setModalMessage("Ažuriranje products.json na Google Drive...");

      // Update products.json via Apps Script
      await updateProductsJson(
        driveConfig.productsJsonUpdateUrl,
        updatedProducts
      );

      setModalMessage("Osvežavanje liste proizvoda...");
      await loadProducts(true); // Force refresh

      // Reset form
      setFormData({
        name: "",
        price: "",
        image: null,
        images: [],
        description: "",
        category: "",
      });
      setImagePreview("");
      setImagesPreview([]);

      // Reset file inputs
      const mainImageInput = document.getElementById("image-upload");
      const additionalImagesInput = document.getElementById("images-upload");
      if (mainImageInput) mainImageInput.value = "";
      if (additionalImagesInput) additionalImagesInput.value = "";

      setIsLoading(false);
      setModalMessage(
        "✅ Proizvod je uspešno dodat! Slike su upload-ovane na Google Drive i products.json je ažuriran."
      );
      setTimeout(() => {
        setShowModal(false);
        setModalMessage("");
        setMessage(
          "Proizvod je uspešno dodat! Slike su upload-ovane na Google Drive i products.json je ažuriran."
        );
        setTimeout(() => setMessage(""), 5000);
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg = error.message || "Error saving product";

      // Ensure modal is shown even on error
      if (!showModal) {
        setShowModal(true);
      }
      setIsLoading(false);
      setModalMessage(`❌ Greška: ${errorMsg}`);
      console.error("Error details:", error);

      setTimeout(() => {
        setShowModal(false);
        setModalMessage("");
        setMessage(
          `Greška: ${errorMsg}. Proverite Google Apps Script konfiguraciju u podešavanjima.`
        );
        setTimeout(() => setMessage(""), 8000);
      }, 3000);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")
    ) {
      try {
        if (
          !driveConfig.productsJsonUpdateUrl ||
          driveConfig.productsJsonUpdateUrl.trim() === ""
        ) {
          setMessage(
            "Molimo unesite Google Apps Script URL za update products.json u podešavanjima."
          );
          setTimeout(() => setMessage(""), 5000);
          return;
        }

        setShowModal(true);
        setIsLoading(true);
        setModalMessage("Brisanje proizvoda...");

        const filteredProducts = products.filter(
          (p) => String(p.id) !== String(id)
        );
        setProducts(filteredProducts);

        setModalMessage("Ažuriranje products.json na Google Drive...");
        // Update products.json via Apps Script
        await updateProductsJson(
          driveConfig.productsJsonUpdateUrl,
          filteredProducts
        );

        setModalMessage("Osvežavanje liste proizvoda...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await loadProducts(true);

        setIsLoading(false);
        setModalMessage(
          "✅ Proizvod je uspešno obrisan! Google Drive fajl je ažuriran."
        );
        setTimeout(() => {
          setShowModal(false);
          setModalMessage("");
          setMessage(
            "Proizvod je uspešno obrisan! Google Drive fajl je ažuriran."
          );
          setTimeout(() => setMessage(""), 5000);
        }, 2000);
      } catch (error) {
        console.error("Delete error:", error);
        await loadProducts();
        const errorMsg = error.message || "Error deleting product";
        setIsLoading(false);
        setModalMessage(`❌ Greška: ${errorMsg}`);
        setTimeout(() => {
          setShowModal(false);
          setModalMessage("");
          setMessage(
            `Greška: ${errorMsg}. Proverite Google Apps Script konfiguraciju u podešavanjima.`
          );
          setTimeout(() => setMessage(""), 8000);
        }, 3000);
      }
    }
  };

  const getImageUrl = (url) => {
    // If it's a data URL, return it directly
    if (url && url.startsWith("data:")) {
      return url;
    }
    // Otherwise, use the Google Drive helper
    return getGoogleDriveImageUrl(url);
  };

  const handleDriveConfigSave = async (e) => {
    e.preventDefault();

    try {
      setShowModal(true);
      setIsLoading(true);
      setModalMessage("Čuvanje Google Drive konfiguracije...");

      // Save to localStorage
      localStorage.setItem(
        "vitaspro_drive_config",
        JSON.stringify(driveConfig)
      );

      setModalMessage(
        "Google Drive konfiguracija je sačuvana! Ponovno učitavanje proizvoda..."
      );

      // Reload products
      await loadProducts();

      setIsLoading(false);
      setModalMessage("✅ Google Drive konfiguracija je uspešno sačuvana!");

      setTimeout(() => {
        setShowModal(false);
        setModalMessage("");
        setMessage("Google Drive konfiguracija je uspešno sačuvana!");
        setTimeout(() => setMessage(""), 3000);
      }, 2000);
    } catch (error) {
      console.error("Error saving drive config:", error);
      setIsLoading(false);
      setModalMessage(`❌ Greška pri čuvanju konfiguracije: ${error.message}`);
      setTimeout(() => {
        setShowModal(false);
        setModalMessage("");
        setMessage(`Greška pri čuvanju konfiguracije: ${error.message}`);
        setTimeout(() => setMessage(""), 5000);
      }, 3000);
    }
  };

  return (
    <div className="admin-new">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header">
          <h1>Vitas Pro Admin - File Upload</h1>
          <p>Upravljajte svojim proizvodima sa file upload funkcionalnostima</p>
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
              </div>
              <div className="form-group">
                <label htmlFor="appsScriptUrl">
                  Google Apps Script URL za Upload Slika *
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
                  URL za upload slika na Google Drive
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="productsJsonUpdateUrl">
                  Google Apps Script URL za Update products.json *
                </label>
                <input
                  type="url"
                  id="productsJsonUpdateUrl"
                  value={driveConfig.productsJsonUpdateUrl || ""}
                  onChange={(e) =>
                    setDriveConfig({
                      ...driveConfig,
                      productsJsonUpdateUrl: e.target.value,
                    })
                  }
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                />
                <small className="help-text">
                  URL za ažuriranje products.json fajla na Google Drive
                </small>
              </div>
              <button type="submit" className="submit-button">
                Sačuvaj konfiguraciju
              </button>
            </form>
          </section>
        )}

        {message && (
          <div
            className={`message ${
              message.includes("uspešno") ? "success" : "error"
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
                <label htmlFor="price">Cena (RSD) *</label>
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
                <label htmlFor="category">Kategorija *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Izaberite kategoriju</option>
                  {getCategoriesList().map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <small className="help-text">
                  Kategorija proizvoda za organizaciju
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="image-upload">Glavna slika *</label>
                <div
                  className={`drag-drop-zone ${
                    isDraggingMain ? "dragging" : ""
                  } ${imagePreview ? "has-preview" : ""}`}
                  onDragOver={handleMainDragOver}
                  onDragLeave={handleMainDragLeave}
                  onDrop={handleMainDrop}
                  onClick={() => {
                    const input = document.getElementById("image-upload");
                    if (input) input.click();
                  }}
                >
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    required
                    style={{ display: "none" }}
                  />
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, image: null });
                          setImagePreview("");
                          const input = document.getElementById("image-upload");
                          if (input) input.value = "";
                        }}
                        className="remove-preview-btn"
                      >
                        Ukloni
                      </button>
                    </div>
                  ) : (
                    <div className="drag-drop-content">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="drag-drop-text">
                        Prevucite sliku ovde ili kliknite da odaberete
                      </p>
                      <p className="drag-drop-hint">
                        Podržani formati: JPG, PNG, GIF
                      </p>
                    </div>
                  )}
                </div>
                <small className="help-text">
                  Glavna slika proizvoda (koristi se u mreži proizvoda)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="images-upload">Dodatne slike (opciono)</label>
                <div
                  className={`drag-drop-zone ${
                    isDraggingAdditional ? "dragging" : ""
                  } ${imagesPreview.length > 0 ? "has-preview" : ""}`}
                  onDragOver={handleAdditionalDragOver}
                  onDragLeave={handleAdditionalDragLeave}
                  onDrop={handleAdditionalDrop}
                  onClick={() => {
                    const input = document.getElementById("images-upload");
                    if (input) input.click();
                  }}
                >
                  <input
                    type="file"
                    id="images-upload"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    style={{ display: "none" }}
                  />
                  {imagesPreview.length > 0 ? (
                    <div className="images-preview-container">
                      {imagesPreview.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="image-preview"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAdditionalImage(index);
                            }}
                            className="remove-preview-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div className="add-more-images">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Dodaj još</span>
                      </div>
                    </div>
                  ) : (
                    <div className="drag-drop-content">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="drag-drop-text">
                        Prevucite slike ovde ili kliknite da odaberete
                      </p>
                      <p className="drag-drop-hint">
                        Možete odabrati više slika odjednom
                      </p>
                    </div>
                  )}
                </div>
                <small className="help-text">
                  Dodajte više slika proizvoda za stranicu detalja. Možete
                  odabrati više slika odjednom.
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
                        e.target.src = "/vitaspro.jpg";
                      }}
                    />
                    <div className="admin-product-info">
                      <h3>{product.name}</h3>
                      <p className="admin-product-price">{product.price} RSD</p>
                      {product.category && (
                        <p className="admin-product-category">
                          Kategorija: {product.category}
                        </p>
                      )}
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

      {/* Loading Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              setShowModal(false);
            }
          }}
        >
          <div className="modal-content">
            {isLoading && (
              <div className="modal-loader">
                <div className="spinner"></div>
              </div>
            )}
            <div className="modal-message">{modalMessage}</div>
            {!isLoading && (
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                Zatvori
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNew;

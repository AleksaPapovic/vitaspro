// Product storage utilities - reads from Google Drive JSON file directly

// Direct Google Drive file URL
const GOOGLE_DRIVE_FILE_URL =
  "https://drive.google.com/uc?export=download&id=1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";

// Read products directly from Google Drive - no cache, always fresh
export const getProducts = async () => {
  const fileId = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";

  // Try multiple download URL formats with CORS proxy
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

  // CORS proxy services (try multiple in case one is down)
  const corsProxies = [
    "", // Try direct first (might work in some cases)
    "https://api.allorigins.win/raw?url=",
  ];

  const urls = [];
  for (const proxy of corsProxies) {
    if (proxy) {
      urls.push(proxy + encodeURIComponent(driveUrl));
    } else {
      // Direct URL (might fail due to CORS but worth trying)
      urls.push(driveUrl);
    }
  }

  // Also try alternative download URL
  urls.push(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://drive.google.com/uc?export=download&id=${fileId}`
    )}`
  );

  for (let i = 0; i < urls.length; i++) {
    try {
      console.log(`Trying method ${i + 1}:`, urls[i]);
      let response;
      try {
        response = await fetch(urls[i], {
          mode: "cors",
          credentials: "omit",
        });
      } catch (corsError) {
        if (
          corsError.message.includes("CORS") ||
          corsError.message.includes("Access-Control")
        ) {
          console.warn(
            `Method ${i + 1} blocked by CORS, trying next method...`
          );
          continue;
        }
        throw corsError;
      }

      if (!response.ok) {
        console.warn(
          `Method ${i + 1} failed:`,
          response.status,
          response.statusText
        );
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      console.log(
        `Method ${i + 1} - Status: ${
          response.status
        }, Content-Type: ${contentType}`
      );
      console.log(`Method ${i + 1} - Response length: ${text.length} chars`);
      console.log(`Method ${i + 1} - First 300 chars:`, text.substring(0, 300));

      // Check if response is HTML (virus scan warning or Google Drive page)
      if (
        text.includes("virus scan warning") ||
        text.includes("<html") ||
        text.includes("Google Drive") ||
        text.trim().startsWith("<!DOCTYPE") ||
        contentType.includes("text/html")
      ) {
        console.warn(
          `Method ${i + 1} returned HTML page (not JSON), trying next method...`
        );
        // If it's HTML, try to extract download link from virus scan page
        const downloadLinkMatch = text.match(
          /href="([^"]*uc\?export=download[^"]*)"/
        );
        if (downloadLinkMatch && i === 0) {
          console.log(
            `Found download link in HTML, trying: ${downloadLinkMatch[1]}`
          );
          try {
            const directResponse = await fetch(downloadLinkMatch[1]);
            const directText = await directResponse.text();
            if (
              directText.trim().startsWith("[") ||
              directText.trim().startsWith("{")
            ) {
              const products = JSON.parse(directText);
              if (Array.isArray(products)) {
                console.log(
                  `✅ Success! Products loaded (extracted from HTML):`,
                  products.length
                );
                return products;
              }
            }
          } catch (e) {
            console.warn("Failed to use extracted download link:", e);
          }
        }
        continue;
      }

      // Try to parse as JSON
      let products;
      try {
        const trimmed = text.trim();
        // Check if it starts with JSON
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          products = JSON.parse(text);
        } else {
          // Try to extract JSON from text (in case there's extra whitespace)
          const jsonMatch = text.match(/(\[[\s\S]*\]|{[\s\S]*})/);
          if (jsonMatch) {
            products = JSON.parse(jsonMatch[1]);
          } else {
            console.warn(`Method ${i + 1}: No JSON found in response`);
            continue;
          }
        }
      } catch (parseError) {
        console.warn(`Method ${i + 1} JSON parse error:`, parseError.message);
        continue;
      }

      if (Array.isArray(products)) {
        console.log(
          `✅ Success! Products loaded from Google Drive (method ${i + 1}):`,
          products.length
        );
        return products;
      } else {
        console.warn(
          `Method ${i + 1}: Response is not an array:`,
          typeof products
        );
        continue;
      }
    } catch (error) {
      console.warn(`Method ${i + 1} error:`, error.message);
      continue;
    }
  }

  // All methods failed
  console.error("❌ All methods failed to load products from Google Drive");
  console.error("Please check:");
  console.error("1. File is set to 'Anyone with the link can view'");
  console.error("2. File ID is correct: 1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv");
  console.error("3. File contains valid JSON array");
  return [];
};

// Save products - updates Google Drive file via Apps Script (no localStorage cache)
export const saveProducts = async (products) => {
  try {
    // Get Google Apps Script URL from config
    const driveConfig = localStorage.getItem("vitaspro_drive_config");
    if (driveConfig) {
      try {
        const config = JSON.parse(driveConfig);
        if (config.appsScriptUrl && config.appsScriptUrl.trim() !== "") {
          console.log("Attempting to update Google Drive via Apps Script...");
          // Update Google Drive file via Apps Script
          const result = await updateGoogleDriveFile(
            config.appsScriptUrl,
            products
          );
          console.log("Google Drive update result:", result);
          return products;
        } else {
          console.warn(
            "No Apps Script URL configured. File will not be updated on Google Drive."
          );
          throw new Error(
            "Google Apps Script URL not configured. Please set it up in admin settings."
          );
        }
      } catch (e) {
        console.error("Error updating Google Drive:", e);
        throw e; // Re-throw to show error to user
      }
    } else {
      throw new Error(
        "Google Drive configuration not found. Please configure in admin settings."
      );
    }
  } catch (error) {
    console.error("Error saving products:", error);
    throw error;
  }
};

// Update Google Drive file via Google Apps Script
const updateGoogleDriveFile = async (appsScriptUrl, products) => {
  try {
    console.log("Updating Google Drive file via Apps Script:", appsScriptUrl);

    await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update",
        data: products,
      }),
      mode: "no-cors", // Google Apps Script requires no-cors for web apps
    });

    // With no-cors, we can't read the response, but the request was sent
    console.log("Update request sent to Google Apps Script");
    return { success: true, message: "Update request sent" };
  } catch (error) {
    console.error("Error updating Google Drive file:", error);
    // Try with CORS enabled as fallback
    try {
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          data: products,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (fallbackError) {
      console.error("Fallback update also failed:", fallbackError);
      throw new Error(
        "Failed to update Google Drive file. Please check Apps Script URL and permissions."
      );
    }
  }
};

// Get products as formatted JSON string (for admin editor)
export const getProductsJSON = async () => {
  const products = await getProducts();
  return JSON.stringify(products, null, 2);
};

export const saveProduct = async (product) => {
  const products = await getProducts();
  const newProduct = {
    id: Date.now().toString(),
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description || "",
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
};

export const deleteProduct = async (id) => {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  await saveProducts(filtered);
};

export const updateProduct = async (id, updates) => {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    await saveProducts(products);
    return products[index];
  }
  return null;
};

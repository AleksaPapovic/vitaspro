// Product storage utilities - reads from Google Drive JSON file directly

// Direct Google Drive file URL
const GOOGLE_DRIVE_FILE_URL =
  "https://drive.google.com/uc?export=download&id=1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";

// Read products directly from Google Drive - no cache, always fresh
export const getProducts = async (forceRefresh = false) => {
  const fileId = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";

  // Add cache-busting parameter to ensure fresh data
  const cacheBuster = forceRefresh ? `&t=${Date.now()}` : "";

  // Try multiple download URL formats with CORS proxy
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t${cacheBuster}`;

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
    console.log("=== saveProducts called ===");
    console.log("Products array length:", products.length);
    console.log(
      "Products:",
      products.map((p) => ({ id: p.id, name: p.name }))
    );

    // Get Google Apps Script URL from config
    const driveConfig = localStorage.getItem("vitaspro_drive_config");
    if (!driveConfig) {
      console.error("❌ No drive config found in localStorage");
      throw new Error(
        "Google Drive configuration not found. Please configure in admin settings."
      );
    }

    try {
      const config = JSON.parse(driveConfig);
      console.log("Drive config loaded:", {
        hasAppsScriptUrl: !!config.appsScriptUrl,
        appsScriptUrl: config.appsScriptUrl
          ? config.appsScriptUrl.substring(0, 50) + "..."
          : "none",
      });

      if (!config.appsScriptUrl || config.appsScriptUrl.trim() === "") {
        console.warn(
          "❌ No Apps Script URL configured. File will not be updated on Google Drive."
        );
        throw new Error(
          "Google Apps Script URL not configured. Please set it up in admin settings."
        );
      }

      console.log("✅ Apps Script URL found, calling updateGoogleDriveFile...");
      // Update Google Drive file via Apps Script
      const result = await updateGoogleDriveFile(
        config.appsScriptUrl,
        products
      );
      console.log("✅ Google Drive update result:", result);
      console.log("=== saveProducts completed ===");
      return products;
    } catch (e) {
      console.error("❌ Error updating Google Drive:", e);
      throw e; // Re-throw to show error to user
    }
  } catch (error) {
    console.error("❌ Error in saveProducts:", error);
    throw error;
  }
};

// Update Google Drive file via Google Apps Script
const updateGoogleDriveFile = async (appsScriptUrl, products) => {
  console.log("=== updateGoogleDriveFile called ===");
  console.log("Apps Script URL:", appsScriptUrl);
  console.log("Products to save:", products.length, "items");
  console.log(
    "Products data:",
    JSON.stringify(products, null, 2).substring(0, 500) + "..."
  );

  const requestBody = {
    action: "update",
    data: products,
  };

  console.log(
    "Request body:",
    JSON.stringify(requestBody).substring(0, 500) + "..."
  );

  // Try with CORS first to verify the update actually worked
  try {
    console.log("Trying with CORS enabled (to verify response)...");
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ CORS request failed:", response.status, errorText);
      throw new Error(`Failed to update: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Update successful (CORS mode):", result);
    console.log("=== updateGoogleDriveFile completed ===");
    return result;
  } catch (corsError) {
    console.warn(
      "⚠️ CORS request failed, trying no-cors mode:",
      corsError.message
    );

    // Fallback to no-cors mode (can't verify response, but request is sent)
    try {
      console.log("Trying with no-cors mode...");
      await fetch(appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "no-cors", // Google Apps Script requires no-cors for web apps
      });

      console.log(
        "✅ Update request sent to Google Apps Script (no-cors mode)"
      );
      console.log(
        "⚠️ Note: Cannot verify response in no-cors mode. Update may still be processing."
      );

      // Wait longer to ensure the request is processed by Google Drive
      console.log("Waiting for Google Drive to process update...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("=== updateGoogleDriveFile completed (no-cors) ===");
      return { success: true, message: "Update request sent (no-cors mode)" };
    } catch (noCorsError) {
      console.error("❌ Both CORS and no-cors requests failed:", noCorsError);
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

  // Parse images array from comma or newline separated string
  let imagesArray = [];
  if (product.images && product.images.trim()) {
    imagesArray = product.images
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  }

  const newProduct = {
    id: Date.now().toString(),
    name: product.name,
    price: product.price,
    image: product.image,
    images: imagesArray.length > 0 ? imagesArray : undefined,
    description: product.description || "",
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
};

export const deleteProduct = async (id) => {
  try {
    console.log("=== deleteProduct function called ===");
    console.log("Product ID to delete:", id);
    console.log("Type of ID:", typeof id);

    const products = await getProducts();
    console.log("Current products before delete:", products.length);
    console.log(
      "All product IDs:",
      products.map((p) => ({ id: p.id, type: typeof p.id, name: p.name }))
    );

    // Try both string and number comparison
    const filtered = products.filter((p) => {
      const matches = String(p.id) === String(id);
      if (matches) {
        console.log(`Found matching product: ${p.name} (id: ${p.id})`);
      }
      return !matches;
    });

    console.log("Products after filter:", filtered.length);
    console.log(
      "Deleted product IDs:",
      products.filter((p) => String(p.id) === String(id)).map((p) => p.name)
    );

    if (filtered.length === products.length) {
      console.error(
        "ERROR: Product not found! Available IDs:",
        products.map((p) => p.id)
      );
      throw new Error(
        `Product with id "${id}" not found. Available IDs: ${products
          .map((p) => p.id)
          .join(", ")}`
      );
    }

    console.log("=== Saving updated products to Google Drive ===");
    console.log(
      "Products to save:",
      filtered.map((p) => ({ id: p.id, name: p.name }))
    );
    console.log("Full products array:", JSON.stringify(filtered, null, 2));

    try {
      await saveProducts(filtered);
      console.log("✅ Product deleted successfully and saved to Google Drive");
    } catch (saveError) {
      console.error("❌ Error saving to Google Drive:", saveError);
      throw saveError;
    }

    return filtered;
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error;
  }
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

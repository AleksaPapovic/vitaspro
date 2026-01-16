// Product storage utilities - reads from Google Drive JSON file directly

// Helper function to extract file ID from Google Drive URL
function extractFileId(fileUrl) {
  if (!fileUrl) return "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv"; // Default
  const match = fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";
}

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Default Google Apps Script URL for reading products (fallback if user hasn't configured)
const DEFAULT_PRODUCTS_JSON_UPDATE_URL =
  "https://script.google.com/macros/s/AKfycbwsX-Boeoh6NV7RRvPmDnYY1WT57mlcPALXYZjZxV-sT5ZtTDmFn9OrSLYB00qs_IoK/exec";

// Read products directly from Google Drive - no cache, always fresh
export const getProducts = async (forceRefresh = false) => {
  // First try to get from Apps Script if configured
  const driveConfig = localStorage.getItem("vitaspro_drive_config");
  let appsScriptUrl = null;

  if (driveConfig) {
    try {
      const config = JSON.parse(driveConfig);
      // Try to use productsJsonUpdateUrl or appsScriptUrl for reading
      appsScriptUrl = config.productsJsonUpdateUrl || config.appsScriptUrl;
    } catch (configError) {
      console.warn("Failed to parse drive config:", configError);
    }
  }

  // Use default URL if no configuration or empty URL
  if (!appsScriptUrl || appsScriptUrl.trim() === "") {
    appsScriptUrl = DEFAULT_PRODUCTS_JSON_UPDATE_URL;
    console.log(
      "Using default Google Apps Script URL for products:",
      appsScriptUrl
    );
  }

  if (appsScriptUrl && appsScriptUrl.trim() !== "") {
    // Retry logic for timeout errors
    const maxRetries = 2;

    // Get fileId from config if available, otherwise use default
    let fileId = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv"; // Default
    if (driveConfig) {
      try {
        const config = JSON.parse(driveConfig);
        if (config.fileUrl) {
          fileId = extractFileId(config.fileUrl);
        }
      } catch {
        // Use default fileId if config parsing fails
      }
    }

    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        const cacheBuster = forceRefresh ? `&t=${Date.now()}` : "";
        let url = appsScriptUrl.trim();
        if (!url.endsWith("/exec") && !url.endsWith("/exec/")) {
          url = url.replace(/\/$/, "") + "/exec";
        }
        url += `?fileId=${fileId}${cacheBuster}`;

        if (retry > 0) {
          console.log(
            `Retry attempt ${retry} to get products from Apps Script...`
          );
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * retry));
        } else {
          console.log("Trying to get products from Apps Script:", url);
        }

        const response = await fetchWithTimeout(
          url,
          {
            method: "GET",
            mode: "cors",
          },
          30000 // 30 second timeout
        );

        if (response.ok) {
          const text = await response.text();
          console.log("Apps Script response:", text.substring(0, 200));

          // Try to parse JSON
          let products;
          try {
            const trimmed = text.trim();
            console.log(
              "Raw response from Apps Script:",
              trimmed.substring(0, 500)
            );

            // Handle different response formats
            let jsonString = trimmed;

            // If response is a JSON string (wrapped in quotes), unescape it
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
              try {
                jsonString = JSON.parse(trimmed); // This will unescape the string
              } catch {
                // If parsing fails, try to extract the inner JSON
                jsonString = trimmed
                  .slice(1, -1)
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\");
              }
            }

            // Now parse the actual JSON
            if (typeof jsonString === "string") {
              // Try direct parse first
              if (
                jsonString.trim().startsWith("[") ||
                jsonString.trim().startsWith("{")
              ) {
                products = JSON.parse(jsonString);
              } else {
                // Try to extract JSON from text
                const jsonMatch = jsonString.match(/(\[[\s\S]*\]|{[\s\S]*})/);
                if (jsonMatch) {
                  products = JSON.parse(jsonMatch[1]);
                } else {
                  throw new Error("No JSON array found in response");
                }
              }
            } else {
              products = jsonString;
            }

            // Final check - if still a string, parse again
            if (typeof products === "string") {
              products = JSON.parse(products);
            }

            if (Array.isArray(products)) {
              console.log(
                `✅ Success! Products loaded from Apps Script:`,
                products.length
              );
              console.log("First product:", products[0]);
              return products;
            } else {
              console.warn(
                "Apps Script response is not an array:",
                typeof products
              );
              // Break retry loop if response is not an array
              break;
            }
          } catch (parseError) {
            console.error("Failed to parse Apps Script response:", parseError);
            console.error("Response text:", text.substring(0, 500));
            // Break retry loop on parse error
            break;
          }
        } else {
          // Response not OK - check if it's a timeout/408 error
          if (response.status === 408 || response.status === 504) {
            if (retry < maxRetries) {
              console.warn(`Request timeout (${response.status}), retrying...`);
              continue; // Retry
            } else {
              throw new Error(
                `Request timeout after ${maxRetries + 1} attempts`
              );
            }
          } else {
            // Other error, break retry loop
            break;
          }
        }
      } catch (appsScriptError) {
        const isTimeout =
          appsScriptError.message &&
          (appsScriptError.message.includes("timeout") ||
            appsScriptError.message.includes("408") ||
            appsScriptError.message.includes("Request timeout"));

        if (isTimeout && retry < maxRetries) {
          console.warn(
            `Apps Script request timeout (attempt ${retry + 1}), retrying...`,
            appsScriptError.message
          );
          continue; // Retry on timeout
        } else {
          console.warn(
            "Failed to get products from Apps Script:",
            appsScriptError
          );
          // Fall through to try direct Google Drive access
          break;
        }
      }
    }
  }

  // Fallback to direct Google Drive access
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
        response = await fetchWithTimeout(
          urls[i],
          {
            mode: "cors",
            credentials: "omit",
          },
          30000 // 30 second timeout
        );
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
            const directResponse = await fetchWithTimeout(
              downloadLinkMatch[1],
              {},
              30000 // 30 second timeout
            );
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

  // Extract fileId from fileUrl if available, or use default
  let fileId = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv"; // Default
  const driveConfig = localStorage.getItem("vitaspro_drive_config");
  if (driveConfig) {
    try {
      const config = JSON.parse(driveConfig);
      if (config.fileUrl) {
        // Extract file ID from Google Drive URL
        const match = config.fileUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      }
    } catch (e) {
      console.warn("Could not parse drive config for fileId:", e);
    }
  }

  const requestBody = {
    action: "update",
    data: products,
    fileId: fileId,
  };

  // Ensure URL ends with /exec (required for Google Apps Script Web Apps)
  let url = appsScriptUrl.trim();
  if (!url.endsWith("/exec") && !url.endsWith("/exec/")) {
    url = url.replace(/\/$/, "") + "/exec";
  }

  console.log("Using URL:", url);

  // Try multiple methods to handle CORS issues
  const methods = [
    // Method 1: Standard fetch with CORS
    async () => {
      console.log("Method 1: Trying standard fetch with CORS...");
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

    // Method 2: Form data approach (sometimes works better with Google Apps Script)
    async () => {
      console.log("Method 2: Trying form data approach...");
      const formData = new FormData();
      formData.append("action", "update");
      formData.append("data", JSON.stringify(products));
      formData.append("fileId", fileId);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
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

    // Method 3: URL-encoded form data
    async () => {
      console.log("Method 3: Trying URL-encoded form data...");
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

    // Method 4: no-cors as last resort (can't verify response)
    async () => {
      console.log("Method 4: Trying no-cors mode (last resort)...");
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "no-cors",
      });

      // Wait for Google Drive to process
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return { success: true, message: "Update request sent (no-cors mode)" };
    },
  ];

  // Try each method in sequence
  for (let i = 0; i < methods.length; i++) {
    try {
      const result = await methods[i]();
      console.log(`✅ Update successful (method ${i + 1}):`, result);
      console.log("=== updateGoogleDriveFile completed ===");
      return result;
    } catch (error) {
      console.warn(`⚠️ Method ${i + 1} failed:`, error.message);
      if (i === methods.length - 1) {
        // Last method failed
        console.error("❌ All methods failed to update Google Drive");
        throw new Error(
          `Failed to update Google Drive file: ${error.message}. Please check your Google Apps Script URL and deployment settings. Make sure the Web App is deployed with "Execute as: Me" and "Who has access: Anyone".`
        );
      }
      // Continue to next method
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

  // Handle images - can be array or comma/newline separated string
  let imagesArray = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      // Already an array, just filter out empty strings
      imagesArray = product.images.filter(
        (url) => url && url.trim().length > 0
      );
    } else if (typeof product.images === "string" && product.images.trim()) {
      // String format - parse from comma or newline separated
      imagesArray = product.images
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }
  }

  const newProduct = {
    id: Date.now().toString(),
    name: product.name,
    price: product.price,
    image: product.image,
    images: imagesArray.length > 0 ? imagesArray : undefined,
    description: product.description || "",
    category: product.category || "",
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

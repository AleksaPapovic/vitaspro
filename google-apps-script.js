// Google Apps Script to update Google Drive JSON file and upload images
// FILE_ID is now dynamic and can be passed in the request or stored in PropertiesService

const DEFAULT_FILE_ID = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv"; // Default fallback
const IMAGES_FOLDER_NAME = "VitasPro_Images"; // Folder where images will be stored

// Helper function to get FILE_ID from request or PropertiesService
function getFileId(data) {
  // First try to get from request data
  if (data && data.fileId) {
    return data.fileId;
  }

  // Try to get from PropertiesService (stored configuration)
  const properties = PropertiesService.getScriptProperties();
  const storedFileId = properties.getProperty("FILE_ID");
  if (storedFileId) {
    return storedFileId;
  }

  // Fallback to default
  return DEFAULT_FILE_ID;
}

// Helper function to create CORS-enabled response
function createCorsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Helper function to get or create images folder
function getOrCreateImagesFolder() {
  const folders = DriveApp.getFoldersByName(IMAGES_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(IMAGES_FOLDER_NAME);
  }
}

// Helper function to upload image to Google Drive
function uploadImageToDrive(imageBlob, fileName) {
  try {
    const folder = getOrCreateImagesFolder();
    const file = folder.createFile(imageBlob);
    file.setName(fileName);

    // Make file publicly viewable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Return shareable link
    const fileId = file.getId();
    const shareUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    return {
      success: true,
      fileId: fileId,
      url: shareUrl,
      directUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}

function doPost(e) {
  try {
    // Parse incoming data
    let data;
    let action;

    try {
      // Try to parse as JSON first (for JSON POST requests)
      if (e.postData && e.postData.contents) {
        try {
          data = JSON.parse(e.postData.contents);
          action = data.action;
        } catch (jsonError) {
          // If JSON parse fails, try as form data
          data = e.parameter || {};
          action = data.action;
        }
      } else if (e.parameter) {
        // Form data or URL-encoded
        data = e.parameter;
        action = data.action;

        // Try to parse JSON strings if they exist
        if (data.imagesData && typeof data.imagesData === "string") {
          try {
            data.imagesData = JSON.parse(data.imagesData);
          } catch (e) {
            // Keep as string if parse fails
          }
        }
      } else {
        throw new Error("No data received");
      }
    } catch (parseError) {
      return createCorsResponse({
        success: false,
        message: "Failed to parse request: " + parseError.toString(),
      });
    }

    // Handle image upload
    if (action === "uploadImage") {
      const imageBlob = data.imageBlob;
      const fileName = data.fileName || `image_${Date.now()}.jpg`;

      if (!imageBlob) {
        return createCorsResponse({
          success: false,
          message: "No image data provided",
        });
      }

      // Convert base64 to blob
      let blob;
      try {
        if (typeof imageBlob === "string" && imageBlob.startsWith("data:")) {
          // Base64 data URL
          const base64Data = imageBlob.split(",")[1];
          const mimeMatch = imageBlob.match(/data:([^;]+);/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          const bytes = Utilities.base64Decode(base64Data);
          blob = Utilities.newBlob(bytes, mimeType, fileName);
        } else {
          return createCorsResponse({
            success: false,
            message: "Unsupported image format. Please use base64 data URL.",
          });
        }
      } catch (blobError) {
        return createCorsResponse({
          success: false,
          message: "Error processing image: " + blobError.toString(),
        });
      }

      const result = uploadImageToDrive(blob, fileName);
      return createCorsResponse(result);
    }

    // Handle multiple image upload
    if (action === "uploadImages") {
      let imagesData = [];

      if (Array.isArray(data.imagesData)) {
        imagesData = data.imagesData;
      } else if (typeof data.imagesData === "string") {
        try {
          imagesData = JSON.parse(data.imagesData);
        } catch (e) {
          return createCorsResponse({
            success: false,
            message: "Invalid imagesData format",
          });
        }
      }

      const results = [];

      for (let i = 0; i < imagesData.length; i++) {
        const imageData = imagesData[i];
        const fileName = imageData.fileName || `image_${Date.now()}_${i}.jpg`;

        if (imageData.base64 && imageData.base64.startsWith("data:")) {
          try {
            const base64Data = imageData.base64.split(",")[1];
            const mimeMatch = imageData.base64.match(/data:([^;]+);/);
            const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
            const bytes = Utilities.base64Decode(base64Data);
            const blob = Utilities.newBlob(bytes, mimeType, fileName);

            const result = uploadImageToDrive(blob, fileName);
            results.push(result);
          } catch (error) {
            results.push({
              success: false,
              error: error.toString(),
            });
          }
        } else {
          results.push({
            success: false,
            error: "Invalid base64 format",
          });
        }
      }

      return createCorsResponse({
        success: true,
        results: results,
      });
    }

    // Handle JSON file update (existing functionality)
    if (action === "update" && data.data) {
      try {
        // Get dynamic FILE_ID
        const fileId = getFileId(data);

        // Get the file
        const file = DriveApp.getFileById(fileId);

        // Convert products array to JSON string
        const jsonContent = JSON.stringify(data.data, null, 2);

        // Update the file content
        file.setContent(jsonContent);

        // Return success response
        return createCorsResponse({
          success: true,
          message: "File updated successfully",
          timestamp: new Date().toISOString(),
          itemsCount: data.data.length,
          fileId: fileId,
        });
      } catch (fileError) {
        return createCorsResponse({
          success: false,
          message: "Error accessing file: " + fileError.toString(),
        });
      }
    } else {
      return createCorsResponse({
        success: false,
        message: "Invalid request - missing action or data",
      });
    }
  } catch (error) {
    return createCorsResponse({
      success: false,
      message: error.toString(),
      stack: error.stack ? error.stack.toString() : "No stack trace",
    });
  }
}

function doGet(e) {
  // Optional: Allow reading the file via GET request
  try {
    // Get FILE_ID from query parameter or use default
    const fileId =
      e.parameter && e.parameter.fileId
        ? e.parameter.fileId
        : getFileId(e.parameter || {});

    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    return ContentService.createTextOutput(content).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Function to set FILE_ID in PropertiesService
function setFileId(fileId) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty("FILE_ID", fileId);
  return {
    success: true,
    message: "FILE_ID saved successfully",
    fileId: fileId,
  };
}

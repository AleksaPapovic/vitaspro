// Google Apps Script to update Google Drive JSON file
// Replace FILE_ID with your Google Drive file ID: 1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv

const FILE_ID = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";

// Helper function to create CORS-enabled response
function createCorsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Parse the incoming data
    let data;
    try {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else if (e.parameter) {
        data = e.parameter;
      } else {
        throw new Error("No data received");
      }
    } catch (parseError) {
      return createCorsResponse({
        success: false,
        message: "Failed to parse request: " + parseError.toString(),
      });
    }

    if (data.action === "update" && data.data) {
      // Get the file
      const file = DriveApp.getFileById(FILE_ID);

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
      });
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
    const file = DriveApp.getFileById(FILE_ID);
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

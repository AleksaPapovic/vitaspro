// Google Apps Script to update Google Drive JSON file
// Replace FILE_ID with your Google Drive file ID: 1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv

const FILE_ID = "1nuTKttBMej3SuIMtO3rJplsCDcJ_chnv";

function doPost(e) {
  try {
    // Handle CORS preflight
    if (e.parameter && e.parameter.method === "OPTIONS") {
      return ContentService.createTextOutput("").setMimeType(
        ContentService.MimeType.TEXT
      );
    }

    // Parse the incoming data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      // Try alternative parsing method
      data = e.parameter || JSON.parse(e.postData.getDataAsString());
    }

    if (data.action === "update" && data.data) {
      // Get the file
      const file = DriveApp.getFileById(FILE_ID);

      // Convert products array to JSON string
      const jsonContent = JSON.stringify(data.data, null, 2);

      // Update the file content
      file.setContent(jsonContent);

      // Return success response with CORS headers
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "File updated successfully",
          timestamp: new Date().toISOString(),
        })
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          message: "Invalid request - missing action or data",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: error.toString(),
        stack: error.stack,
      })
    ).setMimeType(ContentService.MimeType.JSON);
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

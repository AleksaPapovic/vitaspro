// Google Drive file helper - for loading JSON files

// Extract file ID from Google Drive URL
export const extractFileId = (url) => {
  if (!url) return null;
  
  // If already a direct link with id parameter
  if (url.includes('id=')) {
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  
  return null;
};

// Get direct download URL for Google Drive file (for JSON/text files)
export const getGoogleDriveFileUrl = (fileId) => {
  if (!fileId) return null;
  // Use uc?export=download for direct file download
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

// Load JSON file from Google Drive
export const loadJSONFromDrive = async (fileIdOrUrl) => {
  try {
    let fileId = fileIdOrUrl;
    
    // If it's a URL, extract the file ID
    if (fileIdOrUrl.includes('http')) {
      fileId = extractFileId(fileIdOrUrl);
    }
    
    if (!fileId) {
      throw new Error('Invalid Google Drive file ID or URL');
    }
    
    // Method 1: Try direct download with confirm parameter (bypasses virus scan)
    try {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      const response = await fetch(downloadUrl);
      
      if (response.ok) {
        const text = await response.text();
        // Check if it's HTML (virus scan warning) or actual JSON
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      console.log('Method 1 failed, trying alternative...');
    }
    
    // Method 2: Try view URL (for smaller files)
    try {
      const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      const viewResponse = await fetch(viewUrl);
      
      if (viewResponse.ok) {
        const text = await viewResponse.text();
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      console.log('Method 2 failed, trying alternative...');
    }
    
    // Method 3: Try raw file access (if file is small enough)
    try {
      const rawUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const rawResponse = await fetch(rawUrl);
      const text = await rawResponse.text();
      
      // Extract JSON from HTML if it's wrapped in virus scan warning
      const jsonMatch = text.match(/(\[[\s\S]*\]|{[\s\S]*})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // If it's already JSON
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.log('Method 3 failed');
    }
    
    throw new Error('Failed to load JSON from Google Drive. Make sure the file is set to "Anyone with the link can view"');
  } catch (error) {
    console.error('Error loading JSON from Google Drive:', error);
    throw error;
  }
};


// Google Drive image URL conversion utility with multiple fallback methods

export const getGoogleDriveImageUrl = (url) => {
  if (!url) return '/vitaspro.jpg'
  
  // If already a direct link, return it
  if (url.includes('drive.google.com/uc?export=view') || url.includes('drive.google.com/thumbnail')) {
    return url
  }
  
  let fileId = null
  
  // Extract file ID from various Google Drive URL formats
  if (url.includes('drive.google.com/file/d/')) {
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]
  } else if (url.includes('drive.google.com/open?id=')) {
    // Format: https://drive.google.com/open?id=FILE_ID
    fileId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]
  } else if (url.includes('id=')) {
    // Format: ...?id=FILE_ID or &id=FILE_ID
    fileId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]
  }
  
  if (fileId) {
    // Method 1: Use thumbnail API (most reliable for images)
    // sz parameter options: w1000 = width 1000px, w1920 = width 1920px, etc.
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
  }
  
  // If no file ID found, return original URL
  return url
}

// Alternative method using uc?export=view (less reliable but sometimes needed)
export const getGoogleDriveImageUrlAlternative = (url) => {
  if (!url) return '/vitaspro.jpg'
  
  let fileId = null
  
  if (url.includes('drive.google.com/file/d/')) {
    fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]
  } else if (url.includes('id=')) {
    fileId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  
  return url
}


/**
 * Utility functions for handling image URLs in the application
 */

// Backend base URL for API calls
const backendBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type ImageFileType = 'signatures' | 'sketches' | 'motorcycles' | 'motorcycle_images' | 'specification_images';

/**
 * Clean and normalize a path by removing leading/trailing slashes and converting backslashes
 */
const normalizePath = (path: string): string => {
  return path
    .replace(/\\/g, '/') // Convert Windows backslashes to forward slashes
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/+/g, '/'); // Replace multiple slashes with single slash
};

/**
 * Extract the relative path from a full URL or path string
 */
const extractRelativePath = (url: string): string => {
  // If it's a full URL, extract the path portion
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      url = urlObj.pathname;
    } catch (e) {
      console.error('Failed to parse URL:', e);
    }
  }

  // Remove any leading /storage/ or storage/
  url = url.replace(/^\/?(storage\/)?/, '');
  
  // Clean and normalize the path
  return normalizePath(url);
};

/**
 * Get a direct storage URL
 */
const getStorageUrl = (path: string | null, fileType: ImageFileType): string | null => {
  if (!path) return null;
  
  // Extract the relative path
  let cleanPath = extractRelativePath(path);

  // If the path doesn't include the directory, add it based on fileType
  if (!cleanPath.includes('/')) {
    const storageDir = fileType === 'motorcycles' ? 'motorcycle_images' : fileType;
    cleanPath = `${storageDir}/${cleanPath}`;
  }

  return `${backendBaseUrl}/storage/${cleanPath}`;
};

/**
 * Get a URL that uses serve-image.php to serve the image
 */
const getServeImageUrl = (path: string | null, fileType: ImageFileType): string | null => {
  if (!path) return null;
  
  // Extract the relative path
  let cleanPath = extractRelativePath(path);

  // If the path doesn't include the directory, add it based on fileType
  if (!cleanPath.includes('/')) {
    const storageDir = fileType === 'motorcycles' ? 'motorcycle_images' : fileType;
    cleanPath = `${storageDir}/${cleanPath}`;
  }
  
  return `${backendBaseUrl}/serve-image.php?path=${encodeURIComponent(cleanPath)}`;
};

/**
 * Fallback URL generator that tries multiple URL formats
 */
export const getFallbackUrls = (
  urlField: string | null,
  pathField: string | null,
  fileType: ImageFileType
): string[] => {
  const urls: string[] = [];
  
  // First try: direct storage URL (now that symlink is fixed)
  const storageUrl = getStorageUrl(pathField || urlField, fileType);
  if (storageUrl) urls.push(storageUrl);

  // Second try: serve-image.php as fallback
  const serveUrl = getServeImageUrl(pathField || urlField, fileType);
  if (serveUrl) urls.push(serveUrl);

  // If urlField is an absolute URL and different from what we generated, add it
  if (urlField && urlField.startsWith('http') && !urls.includes(urlField)) {
    urls.push(urlField);
  }

  // Remove duplicates and empty values
  return urls
    .filter(Boolean)
    .filter((url, index, self) => self.indexOf(url) === index);
};
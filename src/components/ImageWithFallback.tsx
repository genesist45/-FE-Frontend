import React, { useState, useEffect } from 'react';
import { getFallbackUrls } from '../utils/imageUtils';

interface ImageWithFallbackProps {
  urlField: string | null;
  pathField?: string | null;
  fileType: 'signatures' | 'sketches' | 'motorcycles' | 'motorcycle_images' | 'specification_images';
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  urlField,
  pathField = null,
  fileType,
  alt,
  className = '',
  style = {},
}) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attemptingFallback, setAttemptingFallback] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Initialize the list of URLs to try
  useEffect(() => {
    const urls = getFallbackUrls(urlField, pathField, fileType);
    console.log(`[ImageWithFallback] Generated URLs for ${alt}:`, urls);
    setFallbackUrls(urls);
    
    // Reset state when inputs change
    setLoaded(false);
    setError(false);
    setAttemptingFallback(false);
    setFallbackIndex(0);
    setErrorDetails('');
    
    // Set the first URL to try
    if (urls.length > 0) {
      setCurrentUrl(urls[0]);
    } else {
      const msg = `No valid URLs generated for ${alt}`;
      console.error(`[ImageWithFallback] ${msg}`);
      setCurrentUrl(null);
      setError(true);
      setErrorDetails(msg);
    }
  }, [urlField, pathField, fileType, alt]);

  // Update current URL when fallbackIndex changes
  useEffect(() => {
    if (fallbackIndex < fallbackUrls.length) {
      const nextUrl = fallbackUrls[fallbackIndex];
      console.log(`[ImageWithFallback] Trying URL ${fallbackIndex + 1}/${fallbackUrls.length} for ${alt}:`, nextUrl);
      setCurrentUrl(nextUrl);
      setAttemptingFallback(fallbackIndex > 0);
    } else {
      const msg = `Exhausted all fallback URLs for ${alt}`;
      console.error(`[ImageWithFallback] ${msg}`);
      setCurrentUrl(null);
      setError(true);
      setAttemptingFallback(false);
      setErrorDetails(msg);
    }
  }, [fallbackIndex, fallbackUrls, alt]);

  // Handle image load error
  const handleError = () => {
    const failedUrl = currentUrl;
    console.error(`[ImageWithFallback] Failed to load image for ${alt}:`, failedUrl);
    
    // Try the next fallback URL
    if (fallbackIndex < fallbackUrls.length - 1) {
      console.log(`[ImageWithFallback] Attempting fallback URL for ${alt}`);
      setFallbackIndex(prevIndex => prevIndex + 1);
      setAttemptingFallback(true);
      setErrorDetails(`Failed to load image, trying alternative source (${fallbackIndex + 2}/${fallbackUrls.length})`);
    } else {
      const msg = `Failed to load image after trying all sources`;
      console.error(`[ImageWithFallback] ${msg}`);
      setError(true);
      setAttemptingFallback(false);
      setErrorDetails(msg);
    }
  };

  // Handle successful load
  const handleLoad = () => {
    setLoaded(true);
    setError(false);
    setErrorDetails('');
    console.log(`[ImageWithFallback] Successfully loaded image for ${alt}:`, currentUrl);
  };

  // Default style for the container
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style,
  };

  // Default style for the image
  const imageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
    border: loaded ? '1px solid #ddd' : error ? '1px solid #f56565' : '1px solid #ddd',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {currentUrl ? (
        <>
          <img
            src={currentUrl}
            alt={alt}
            onError={handleError}
            onLoad={handleLoad}
            style={imageStyle}
            crossOrigin="anonymous"
          />
          {(error || attemptingFallback) && errorDetails && (
            <div style={{ 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: error ? 'rgba(229, 62, 62, 0.9)' : 'rgba(66, 153, 225, 0.9)',
              color: 'white',
              padding: '0.5rem',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}>
              {errorDetails}
            </div>
          )}
        </>
      ) : (
        <div style={{ 
          color: '#718096', 
          padding: '1rem', 
          textAlign: 'center',
          border: '1px dashed #cbd5e0',
          borderRadius: '0.25rem',
          backgroundColor: '#f7fafc',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {error && !attemptingFallback ? errorDetails || 'Failed to load image' : 'Loading...'}
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback; 
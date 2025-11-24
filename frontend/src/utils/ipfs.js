/**
 * IPFS Integration Utility
 * 
 * Handles content upload and retrieval using Pinata (IPFS pinning service)
 * Supports images, videos, PDFs, and text content with metadata
 */

import { PinataSDK } from "pinata";

// Initialize Pinata client
let pinata = null;

const initPinata = () => {
  if (!pinata) {
    const jwt = import.meta.env.VITE_PINATA_JWT;
    
    if (!jwt) {
      console.warn('Pinata JWT not configured. IPFS features will be disabled.');
      return null;
    }
    
    try {
      pinata = new PinataSDK({
        pinataJwt: jwt,
      });
      console.log('Pinata initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pinata:', error);
      return null;
    }
  }
  
  return pinata;
};

/**
 * Content metadata structure
 * @typedef {Object} ContentMetadata
 * @property {string} title - Post title
 * @property {string} description - Post description
 * @property {string} contentType - Type: text|image|video|pdf
 * @property {string} requiredTier - Required tier ID to access
 * @property {string} creator - Creator wallet address
 * @property {number} timestamp - Unix timestamp
 * @property {string} [thumbnail] - Optional thumbnail IPFS hash
 * @property {number} [fileSize] - File size in bytes
 * @property {string} [fileName] - Original filename
 */

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - File object to upload
 * @param {ContentMetadata} metadata - Content metadata
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export const uploadFileToIPFS = async (file, metadata) => {
  const client = initPinata();
  if (!client) {
    throw new Error('Pinata client not initialized. Check VITE_PINATA_JWT configuration.');
  }

  try {
    console.log('Uploading file to IPFS:', file.name);
    
    // Upload the file
    const upload = await client.upload.file(file, {
      metadata: {
        name: metadata.title || file.name,
        keyvalues: {
          contentType: metadata.contentType,
          creator: metadata.creator,
          requiredTier: metadata.requiredTier.toString(),
          timestamp: metadata.timestamp.toString(),
        }
      }
    });

    console.log('File uploaded successfully:', upload.IpfsHash);

    return {
      ipfsHash: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Upload JSON metadata to IPFS
 * @param {Object} data - JSON data to upload
 * @param {string} name - Name for the metadata
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export const uploadJSONToIPFS = async (data, name = 'metadata.json') => {
  const client = initPinata();
  if (!client) {
    throw new Error('Pinata client not initialized. Check VITE_PINATA_JWT configuration.');
  }

  try {
    console.log('Uploading JSON to IPFS:', name);
    
    const upload = await client.upload.json(data, {
      metadata: {
        name: name,
      }
    });

    console.log('JSON uploaded successfully:', upload.IpfsHash);

    return {
      ipfsHash: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`Failed to upload JSON: ${error.message}`);
  }
};

/**
 * Upload text content to IPFS
 * @param {string} text - Text content
 * @param {ContentMetadata} metadata - Content metadata
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export const uploadTextToIPFS = async (text, metadata) => {
  const client = initPinata();
  if (!client) {
    throw new Error('Pinata client not initialized. Check VITE_PINATA_JWT configuration.');
  }

  try {
    console.log('Uploading text content to IPFS');
    
    // Create a Blob from text
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], 'content.txt', { type: 'text/plain' });
    
    return await uploadFileToIPFS(file, metadata);
  } catch (error) {
    console.error('Error uploading text to IPFS:', error);
    throw new Error(`Failed to upload text: ${error.message}`);
  }
};

/**
 * Retrieve content from IPFS
 * @param {string} ipfsHash - IPFS hash (CID)
 * @returns {Promise<string>} - Gateway URL
 */
export const getIPFSUrl = (ipfsHash) => {
  if (!ipfsHash) {
    throw new Error('IPFS hash is required');
  }
  
  // Use Pinata gateway for better performance
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

/**
 * Fetch JSON data from IPFS
 * @param {string} ipfsHash - IPFS hash (CID)
 * @returns {Promise<Object>}
 */
export const fetchJSONFromIPFS = async (ipfsHash) => {
  try {
    const url = getIPFSUrl(ipfsHash);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error);
    throw new Error(`Failed to fetch JSON: ${error.message}`);
  }
};

/**
 * Fetch text content from IPFS
 * @param {string} ipfsHash - IPFS hash (CID)
 * @returns {Promise<string>}
 */
export const fetchTextFromIPFS = async (ipfsHash) => {
  try {
    const url = getIPFSUrl(ipfsHash);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching text from IPFS:', error);
    throw new Error(`Failed to fetch text: ${error.message}`);
  }
};

/**
 * Validate content type
 * @param {File} file - File to validate
 * @returns {string} - Content type (text|image|video|pdf)
 */
export const validateContentType = (file) => {
  const mimeType = file.type;
  
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else if (mimeType.startsWith('text/')) {
    return 'text';
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

/**
 * Validate file size (max 100MB)
 * @param {File} file - File to validate
 * @returns {boolean}
 */
export const validateFileSize = (file, maxSizeMB = 100) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  return true;
};

/**
 * Create complete content post structure
 * @param {Object} params
 * @param {string} params.title - Post title
 * @param {string} params.description - Post description
 * @param {File|string} params.content - File object or text content
 * @param {string} params.contentType - Content type
 * @param {string} params.requiredTier - Required tier ID
 * @param {string} params.creator - Creator address
 * @param {File} [params.thumbnail] - Optional thumbnail file
 * @returns {Promise<Object>} - Complete post data with IPFS hashes
 */
export const createContentPost = async ({
  title,
  description,
  content,
  contentType,
  requiredTier,
  creator,
  thumbnail
}) => {
  const timestamp = Date.now();
  
  const metadata = {
    title,
    description,
    contentType,
    requiredTier,
    creator,
    timestamp,
  };

  try {
    let contentHash;
    let thumbnailHash;

    // Upload main content
    if (typeof content === 'string') {
      // Text content
      const result = await uploadTextToIPFS(content, metadata);
      contentHash = result.ipfsHash;
    } else if (content instanceof File) {
      // File content
      validateFileSize(content);
      const detectedType = validateContentType(content);
      
      if (detectedType !== contentType) {
        console.warn(`Content type mismatch: expected ${contentType}, got ${detectedType}`);
      }
      
      const result = await uploadFileToIPFS(content, {
        ...metadata,
        fileName: content.name,
        fileSize: content.size,
      });
      contentHash = result.ipfsHash;
    } else {
      throw new Error('Invalid content type. Must be File or string.');
    }

    // Upload thumbnail if provided
    if (thumbnail) {
      validateFileSize(thumbnail, 10); // Max 10MB for thumbnails
      const thumbnailResult = await uploadFileToIPFS(thumbnail, {
        ...metadata,
        contentType: 'image',
      });
      thumbnailHash = thumbnailResult.ipfsHash;
    }

    // Create final post metadata
    const postData = {
      title,
      description,
      contentHash,
      thumbnailHash,
      contentType,
      requiredTier,
      creator,
      timestamp,
      contentUrl: getIPFSUrl(contentHash),
      thumbnailUrl: thumbnailHash ? getIPFSUrl(thumbnailHash) : null,
    };

    // Upload post metadata to IPFS
    const metadataResult = await uploadJSONToIPFS(postData, `post-${timestamp}.json`);
    
    return {
      ...postData,
      metadataHash: metadataResult.ipfsHash,
      metadataUrl: metadataResult.url,
    };
  } catch (error) {
    console.error('Error creating content post:', error);
    throw error;
  }
};

/**
 * Check if Pinata is configured
 * @returns {boolean}
 */
export const isPinataConfigured = () => {
  return !!import.meta.env.VITE_PINATA_JWT;
};

export default {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  uploadTextToIPFS,
  getIPFSUrl,
  fetchJSONFromIPFS,
  fetchTextFromIPFS,
  validateContentType,
  validateFileSize,
  createContentPost,
  isPinataConfigured,
};

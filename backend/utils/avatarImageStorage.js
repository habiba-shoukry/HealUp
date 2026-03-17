/**
 * Avatar Image Storage Utility
 * Handles storing and retrieving avatar PNG files using GridFS
 */

const fs = require('fs');
const path = require('path');
const { getUserGridFSBucket } = require('../config/database');

/**
 * Upload avatar image to GridFS
 * @param {Buffer|Stream} imageBuffer - Image file buffer or stream
 * @param {string} filename - Name of the file (e.g., 'skin-peach.png')
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<{fileId, filename, size, mimeType, uploadedAt}>}
 */
exports.uploadAvatarImage = async (imageBuffer, filename, metadata = {}) => {
  try {
    const bucket = getUserGridFSBucket();
    if (!bucket) {
      throw new Error('GridFS bucket not initialized. Ensure database is connected.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          uploadedAt: new Date(),
          mimeType: 'image/png',
        },
      });

      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          filename: filename,
          size: imageBuffer.length,
          mimeType: 'image/png',
          uploadedAt: new Date(),
        });
      });

      uploadStream.on('error', (error) => {
        reject(new Error(`Failed to upload image: ${error.message}`));
      });

      uploadStream.write(imageBuffer);
      uploadStream.end();
    });
  } catch (error) {
    console.error('Error uploading avatar image:', error);
    throw error;
  }
};

/**
 * Download avatar image from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<Buffer>}
 */
exports.getAvatarImage = async (fileId) => {
  try {
    const bucket = getUserGridFSBucket();
    if (!bucket) {
      throw new Error('GridFS bucket not initialized');
    }

    return new Promise((resolve, reject) => {
      const chunks = [];
      const downloadStream = bucket.openDownloadStream(fileId);

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      downloadStream.on('error', (error) => {
        reject(new Error(`Failed to download image: ${error.message}`));
      });
    });
  } catch (error) {
    console.error('Error downloading avatar image:', error);
    throw error;
  }
};

/**
 * Delete avatar image from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<void>}
 */
exports.deleteAvatarImage = async (fileId) => {
  try {
    const bucket = getUserGridFSBucket();
    if (!bucket) {
      throw new Error('GridFS bucket not initialized');
    }

    return new Promise((resolve, reject) => {
      bucket.delete(fileId, (error) => {
        if (error) {
          reject(new Error(`Failed to delete image: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error deleting avatar image:', error);
    throw error;
  }
};

/**
 * Upload image from file path
 * @param {string} filePath - Path to image file
 * @param {string} filename - Name to store as in GridFS
 * @returns {Promise<{fileId, filename, size, mimeType, uploadedAt}>}
 */
exports.uploadAvatarImageFromFile = async (filePath, filename) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return await exports.uploadAvatarImage(imageBuffer, filename || path.basename(filePath));
  } catch (error) {
    console.error('Error uploading avatar image from file:', error);
    throw error;
  }
};

/**
 * Upload image from URL
 * @param {string} imageUrl - URL of the image to download
 * @param {string} filename - Name to store as in GridFS
 * @returns {Promise<{fileId, filename, size, mimeType, uploadedAt}>}
 */
exports.uploadAvatarImageFromUrl = async (imageUrl, filename) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.buffer();
    return await exports.uploadAvatarImage(imageBuffer, filename);
  } catch (error) {
    console.error('Error uploading avatar image from URL:', error);
    throw error;
  }
};

/**
 * Save image and convert to Base64 (for small images)
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {string} Base64 encoded image
 */
exports.convertToBase64 = (imageBuffer) => {
  return imageBuffer.toString('base64');
};

/**
 * Create data URL from Base64
 * @param {string} base64String - Base64 encoded image
 * @param {string} mimeType - MIME type (default: 'image/png')
 * @returns {string} Data URL
 */
exports.createDataUrl = (base64String, mimeType = 'image/png') => {
  return `data:${mimeType};base64,${base64String}`;
};

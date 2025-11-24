/**
 * IPFS Upload Test Component
 * 
 * Simple test interface for verifying IPFS/Pinata integration
 * Upload files and text, view IPFS URLs
 */

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  uploadFileToIPFS,
  uploadTextToIPFS,
  createContentPost,
  isPinataConfigured,
} from '../utils/ipfs';
import { CONTENT_TYPES, formatFileSize } from '../utils/contentTypes';

const IPFSTest = () => {
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);

  // Check if Pinata is configured
  const isConfigured = isPinataConfigured();

  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (!isConfigured) {
        toast.error('Pinata JWT not configured. Add VITE_PINATA_JWT to .env');
        return;
      }

      setUploading(true);
      
      for (const file of acceptedFiles) {
        try {
          const metadata = {
            title: file.name,
            description: `Test upload: ${file.name}`,
            contentType: file.type.startsWith('image/') ? CONTENT_TYPES.IMAGE : 
                        file.type.startsWith('video/') ? CONTENT_TYPES.VIDEO :
                        file.type === 'application/pdf' ? CONTENT_TYPES.PDF : 
                        CONTENT_TYPES.TEXT,
            requiredTier: '1',
            creator: 'test-creator',
            timestamp: Date.now(),
          };

          const result = await uploadFileToIPFS(file, metadata);
          
          setResults(prev => [...prev, {
            type: 'file',
            name: file.name,
            size: formatFileSize(file.size),
            ipfsHash: result.ipfsHash,
            url: result.url,
            timestamp: new Date().toLocaleTimeString(),
          }]);

          toast.success(`Uploaded ${file.name} to IPFS!`);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
      
      setUploading(false);
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // Upload text
  const handleTextUpload = async () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text');
      return;
    }

    if (!isConfigured) {
      toast.error('Pinata JWT not configured. Add VITE_PINATA_JWT to .env');
      return;
    }

    setUploading(true);

    try {
      const metadata = {
        title: 'Text Content',
        description: 'Test text upload',
        contentType: CONTENT_TYPES.TEXT,
        requiredTier: '1',
        creator: 'test-creator',
        timestamp: Date.now(),
      };

      const result = await uploadTextToIPFS(textContent, metadata);
      
      setResults(prev => [...prev, {
        type: 'text',
        name: 'Text Content',
        preview: textContent.substring(0, 50) + '...',
        ipfsHash: result.ipfsHash,
        url: result.url,
        timestamp: new Date().toLocaleTimeString(),
      }]);

      toast.success('Text uploaded to IPFS!');
      setTextContent('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload text: ${error.message}`);
    }

    setUploading(false);
  };

  // Test complete post creation
  const handleCompletePostTest = async () => {
    if (!isConfigured) {
      toast.error('Pinata JWT not configured');
      return;
    }

    setUploading(true);

    try {
      const testPost = await createContentPost({
        title: 'Test Post',
        description: 'This is a complete test post with metadata',
        content: 'This is the content of the test post. It demonstrates the complete post creation flow with IPFS metadata storage.',
        contentType: CONTENT_TYPES.TEXT,
        requiredTier: '2',
        creator: '5TestCreatorAddress123',
      });

      setResults(prev => [...prev, {
        type: 'complete-post',
        name: testPost.title,
        contentHash: testPost.contentHash,
        metadataHash: testPost.metadataHash,
        contentUrl: testPost.contentUrl,
        metadataUrl: testPost.metadataUrl,
        timestamp: new Date().toLocaleTimeString(),
      }]);

      toast.success('Complete post created with metadata!');
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error(`Failed to create post: ${error.message}`);
    }

    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          IPFS Upload Test
        </h1>

        {/* Configuration Status */}
        <div className={`mb-6 p-4 rounded-lg ${isConfigured ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <p className={`font-semibold ${isConfigured ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
            {isConfigured ? '✓ Pinata Configured' : '✗ Pinata Not Configured'}
          </p>
          {!isConfigured && (
            <p className="text-sm text-red-700 dark:text-red-300 mt-2">
              Add VITE_PINATA_JWT to your .env file to enable uploads
            </p>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            File Upload
          </h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
            `}
          >
            <input {...getInputProps()} disabled={uploading || !isConfigured} />
            <p className="text-gray-600 dark:text-gray-300">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Supports images, videos, PDFs (max 100MB)
            </p>
          </div>
        </div>

        {/* Text Upload */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Text Upload
          </h2>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter text content to upload to IPFS..."
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading || !isConfigured}
          />
          <button
            onClick={handleTextUpload}
            disabled={uploading || !isConfigured || !textContent.trim()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Text'}
          </button>
        </div>

        {/* Complete Post Test */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Complete Post Creation Test
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Test the full post creation flow with content + metadata upload
          </p>
          <button
            onClick={handleCompletePostTest}
            disabled={uploading || !isConfigured}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Creating...' : 'Create Test Post'}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Upload Results ({results.length})
            </h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {result.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.timestamp} • {result.type}
                      </p>
                    </div>
                    {result.size && (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {result.size}
                      </span>
                    )}
                  </div>
                  
                  {result.type === 'complete-post' ? (
                    <>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Content Hash:</span>
                          <a href={result.contentUrl} target="_blank" rel="noopener noreferrer" 
                             className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                            {result.contentHash}
                          </a>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Metadata Hash:</span>
                          <a href={result.metadataUrl} target="_blank" rel="noopener noreferrer"
                             className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                            {result.metadataHash}
                          </a>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-medium">IPFS Hash:</span> {result.ipfsHash}
                      </p>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {result.url}
                      </a>
                    </>
                  )}
                  
                  {result.preview && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                      {result.preview}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setResults([])}
              className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPFSTest;

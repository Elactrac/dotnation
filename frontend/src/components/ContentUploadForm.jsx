/**
 * Content Upload Form Component
 * 
 * Rich form for creators to upload tier-gated content
 * Supports text, images, videos, PDFs with thumbnails
 */

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { 
  FiUpload, 
  FiX, 
  FiImage, 
  FiFileText, 
  FiFile,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  createContentPost, 
  isPinataConfigured 
} from '../utils/ipfs';
import { 
  CONTENT_TYPES, 
  CONTENT_TYPE_LABELS,
  FILE_SIZE_LIMITS,
  formatFileSize,
  getContentTypeIcon,
  POST_STATUS
} from '../utils/contentTypes';

const ContentUploadForm = ({ 
  onSuccess, 
  onCancel, 
  tiers = [],
  creatorAddress 
}) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Content, 3: Preview
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState(CONTENT_TYPES.TEXT);
  const [requiredTier, setRequiredTier] = useState('');
  const [status, setStatus] = useState(POST_STATUS.DRAFT);

  // Content data
  const [textContent, setTextContent] = useState('');
  const [contentFile, setContentFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Preview URLs
  const [contentPreviewUrl, setContentPreviewUrl] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  const isPinataReady = isPinataConfigured();

  // Main content dropzone
  const onDropContent = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size
      const maxSize = FILE_SIZE_LIMITS[contentType] * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File size exceeds ${FILE_SIZE_LIMITS[contentType]}MB limit`);
        return;
      }

      setContentFile(file);
      
      // Create preview URL
      if (contentType === CONTENT_TYPES.IMAGE || contentType === CONTENT_TYPES.VIDEO) {
        const url = URL.createObjectURL(file);
        setContentPreviewUrl(url);
      }
      
      setErrors(prev => ({ ...prev, content: null }));
    }
  }, [contentType]);

  const { 
    getRootProps: getContentRootProps, 
    getInputProps: getContentInputProps,
    isDragActive: isContentDragActive 
  } = useDropzone({
    onDrop: onDropContent,
    accept: getAcceptType(contentType),
    maxFiles: 1,
    disabled: uploading
  });

  // Thumbnail dropzone
  const onDropThumbnail = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate thumbnail size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Thumbnail size exceeds 10MB limit');
        return;
      }

      setThumbnailFile(file);
      
      const url = URL.createObjectURL(file);
      setThumbnailPreviewUrl(url);
    }
  }, []);

  const { 
    getRootProps: getThumbnailRootProps, 
    getInputProps: getThumbnailInputProps,
    isDragActive: isThumbnailDragActive 
  } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: uploading
  });

  // Get accept types for dropzone
  function getAcceptType(type) {
    switch (type) {
      case CONTENT_TYPES.IMAGE:
        return { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] };
      case CONTENT_TYPES.VIDEO:
        return { 'video/*': ['.mp4', '.webm', '.ogg'] };
      case CONTENT_TYPES.PDF:
        return { 'application/pdf': ['.pdf'] };
      case CONTENT_TYPES.TEXT:
        return { 'text/*': ['.txt', '.md'] };
      default:
        return {};
    }
  }

  // Validate step
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!title.trim()) newErrors.title = 'Title is required';
      if (!description.trim()) newErrors.description = 'Description is required';
      if (!requiredTier) newErrors.requiredTier = 'Please select a tier';
    }

    if (stepNumber === 2) {
      if (contentType === CONTENT_TYPES.TEXT && !textContent.trim()) {
        newErrors.content = 'Content is required';
      }
      if (contentType !== CONTENT_TYPES.TEXT && !contentFile) {
        newErrors.content = 'Please upload a file';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Handle content type change
  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    setContentFile(null);
    setContentPreviewUrl(null);
    setTextContent('');
    setErrors(prev => ({ ...prev, content: null }));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    if (!isPinataReady) {
      toast.error('IPFS not configured. Contact administrator.');
      return;
    }

    if (!creatorAddress) {
      toast.error('Creator address not available. Please connect wallet.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Determine content to upload
      const content = contentType === CONTENT_TYPES.TEXT ? textContent : contentFile;

      setUploadProgress(30);

      // Create complete post with IPFS upload
      const postResult = await createContentPost({
        title: title.trim(),
        description: description.trim(),
        content,
        contentType,
        requiredTier,
        creator: creatorAddress,
        thumbnail: thumbnailFile
      });

      setUploadProgress(80);

      // Add status to result
      const completePost = {
        ...postResult,
        status,
        id: postResult.metadataHash, // Use metadata hash as post ID
      };

      setUploadProgress(100);

      toast.success('Content uploaded successfully!');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(completePost);
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload content: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setContentType(CONTENT_TYPES.TEXT);
    setRequiredTier('');
    setStatus(POST_STATUS.DRAFT);
    setTextContent('');
    setContentFile(null);
    setThumbnailFile(null);
    setContentPreviewUrl(null);
    setThumbnailPreviewUrl(null);
    setErrors({});
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
            step >= stepNum 
              ? 'bg-black text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step > stepNum ? 'bg-black' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  // Render step 1: Details
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${
            errors.title ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholder="Enter a compelling title..."
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FiAlertCircle className="w-4 h-4" />
            {errors.title}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${
            errors.description ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholder="Describe your content..."
          maxLength={500}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FiAlertCircle className="w-4 h-4" />
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(CONTENT_TYPES).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleContentTypeChange(type)}
              className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
                contentType === type
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{getContentTypeIcon(type)}</span>
              <span className="font-medium">{CONTENT_TYPE_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Tier *
        </label>
        <select
          value={requiredTier}
          onChange={(e) => setRequiredTier(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${
            errors.requiredTier ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="">Select a tier...</option>
          {tiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name} ({tier.price ? `${(tier.price / Math.pow(10, 10)).toFixed(2)} DOT` : 'Free'})
            </option>
          ))}
        </select>
        {errors.requiredTier && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FiAlertCircle className="w-4 h-4" />
            {errors.requiredTier}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Only subscribers of this tier or higher can access this content
        </p>
      </div>
    </div>
  );

  // Render step 2: Content
  const renderStep2 = () => (
    <div className="space-y-6">
      {contentType === CONTENT_TYPES.TEXT ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={12}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm ${
              errors.content ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Write your content here..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4" />
              {errors.content}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload {CONTENT_TYPE_LABELS[contentType]} *
          </label>
          {contentFile ? (
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {getContentTypeIcon(contentType)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{contentFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(contentFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setContentFile(null);
                    setContentPreviewUrl(null);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Preview */}
              {contentPreviewUrl && contentType === CONTENT_TYPES.IMAGE && (
                <img 
                  src={contentPreviewUrl} 
                  alt="Preview" 
                  className="w-full rounded-lg object-cover max-h-64"
                />
              )}
              {contentPreviewUrl && contentType === CONTENT_TYPES.VIDEO && (
                <video 
                  src={contentPreviewUrl} 
                  controls 
                  className="w-full rounded-lg max-h-64"
                />
              )}
            </div>
          ) : (
            <div
              {...getContentRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isContentDragActive 
                  ? 'border-black bg-gray-50' 
                  : errors.content
                  ? 'border-red-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getContentInputProps()} />
              <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                {isContentDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-gray-500">
                Max size: {FILE_SIZE_LIMITS[contentType]}MB
              </p>
            </div>
          )}
          {errors.content && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4" />
              {errors.content}
            </p>
          )}
        </div>
      )}

      {/* Thumbnail upload (optional, for video/PDF) */}
      {(contentType === CONTENT_TYPES.VIDEO || contentType === CONTENT_TYPES.PDF) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail (Optional)
          </label>
          {thumbnailFile ? (
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <img 
                    src={thumbnailPreviewUrl} 
                    alt="Thumbnail" 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{thumbnailFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(thumbnailFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreviewUrl(null);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              {...getThumbnailRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isThumbnailDragActive 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getThumbnailInputProps()} />
              <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload thumbnail image</p>
              <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render step 3: Preview
  const renderStep3 = () => {
    const selectedTierObj = tiers.find(t => t.id === requiredTier);

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
            <span className="px-3 py-1 bg-black text-white text-sm font-medium rounded-full">
              {CONTENT_TYPE_LABELS[contentType]}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FiFileText className="w-4 h-4" />
              Required Tier: {selectedTierObj?.name || 'Unknown'}
            </span>
            {contentFile && (
              <span className="flex items-center gap-1">
                <FiFile className="w-4 h-4" />
                {formatFileSize(contentFile.size)}
              </span>
            )}
          </div>

          {/* Content preview */}
          {contentType === CONTENT_TYPES.TEXT && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-gray-700 whitespace-pre-wrap">{textContent.substring(0, 200)}...</p>
            </div>
          )}

          {contentPreviewUrl && contentType === CONTENT_TYPES.IMAGE && (
            <img 
              src={contentPreviewUrl} 
              alt="Preview" 
              className="w-full rounded-lg object-cover max-h-80 mt-4"
            />
          )}

          {contentFile && contentType === CONTENT_TYPES.PDF && (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mt-4">
              <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">{contentFile.name}</p>
            </div>
          )}

          {thumbnailPreviewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Thumbnail:</p>
              <img 
                src={thumbnailPreviewUrl} 
                alt="Thumbnail" 
                className="w-48 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Ready to publish?</p>
              <p>Your content will be uploaded to IPFS and accessible to subscribers of <strong>{selectedTierObj?.name}</strong> tier and above.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Status
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStatus(POST_STATUS.DRAFT)}
              className={`flex-1 px-4 py-3 border-2 rounded-xl transition-all ${
                status === POST_STATUS.DRAFT
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">Save as Draft</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus(POST_STATUS.PUBLISHED)}
              className={`flex-1 px-4 py-3 border-2 rounded-xl transition-all ${
                status === POST_STATUS.PUBLISHED
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">Publish Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Configuration warning */}
      {!isPinataReady && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">IPFS Not Configured</p>
              <p>Content upload requires IPFS configuration. Contact your administrator.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Step content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading to IPFS...</span>
            <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black rounded-full h-2 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={step === 1 ? onCancel : handlePrevious}
          disabled={uploading}
          className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 1 ? 'Cancel' : 'Previous'}
        </button>

        <div className="flex items-center gap-3">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={uploading}
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || !isPinataReady}
              className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheck className="w-5 h-5" />
              {uploading ? 'Uploading...' : status === POST_STATUS.PUBLISHED ? 'Publish' : 'Save Draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ContentUploadForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  tiers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
  })).isRequired,
  creatorAddress: PropTypes.string.isRequired,
};

export default ContentUploadForm;

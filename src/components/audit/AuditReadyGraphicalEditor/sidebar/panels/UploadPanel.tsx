import React, { useRef, useState } from 'react';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { addImageToCanvas, AUDIT_COLORS } from '../../core/fabric-utils';
import { Upload, Image, Link, AlertCircle } from 'lucide-react';

const UploadPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create a URL for the file
      const imageUrl = URL.createObjectURL(file);
      
      console.log('Adding uploaded image to canvas');
      const imageObj = await addImageToCanvas(canvas, imageUrl);
      
      if (imageObj) {
        console.log('Image added successfully');
      } else {
        setError('Failed to add image to canvas');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim() || !canvas) return;

    setIsUploading(true);
    setError('');

    try {
      console.log('Adding image from URL to canvas');
      const imageObj = await addImageToCanvas(canvas, urlInput.trim());
      
      if (imageObj) {
        console.log('Image from URL added successfully');
        setUrlInput('');
      } else {
        setError('Failed to load image from URL');
      }
    } catch (error) {
      console.error('Error loading image from URL:', error);
      setError('Failed to load image from URL. Please check the URL and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile && canvas) {
      setIsUploading(true);
      setError('');

      try {
        const imageUrl = URL.createObjectURL(imageFile);
        console.log('Adding dropped image to canvas');
        const imageObj = await addImageToCanvas(canvas, imageUrl);
        
        if (imageObj) {
          console.log('Dropped image added successfully');
        } else {
          setError('Failed to add dropped image to canvas');
        }
      } catch (error) {
        console.error('Error with dropped image:', error);
        setError('Failed to process dropped image');
      } finally {
        setIsUploading(false);
      }
    } else {
      setError('Please drop an image file');
    }
  };

  // Sample images for quick testing
  const sampleImages = [
    'https://via.placeholder.com/300x200/1e40af/ffffff?text=Sample+Image+1',
    'https://via.placeholder.com/300x200/059669/ffffff?text=Sample+Image+2',
    'https://via.placeholder.com/300x200/d97706/ffffff?text=Sample+Image+3',
    'https://via.placeholder.com/300x200/dc2626/ffffff?text=Sample+Image+4'
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="font-semibold text-lg mb-2" style={{ color: AUDIT_COLORS.primary }}>
          Upload Images
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Add images to your audit design from your device or the web
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="p-3 rounded-lg flex items-center gap-2"
          style={{ backgroundColor: `${AUDIT_COLORS.danger}10` }}
        >
          <AlertCircle className="w-4 h-4" style={{ color: AUDIT_COLORS.danger }} />
          <span className="text-sm" style={{ color: AUDIT_COLORS.danger }}>
            {error}
          </span>
        </div>
      )}

      {/* File Upload */}
      <div>
        <h5 className="font-medium text-sm text-gray-700 mb-3">Upload from Device</h5>
        
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:bg-gray-50"
          style={{ borderColor: AUDIT_COLORS.border }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: `${AUDIT_COLORS.primary}10` }}
            >
              <Upload className="w-6 h-6" style={{ color: AUDIT_COLORS.primary }} />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                {isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* URL Upload */}
      <div>
        <h5 className="font-medium text-sm text-gray-700 mb-3">Add from URL</h5>
        
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ 
              borderColor: AUDIT_COLORS.border
            }}
            disabled={isUploading}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlUpload()}
          />
          <button
            onClick={handleUrlUpload}
            disabled={!urlInput.trim() || isUploading}
            className="px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: AUDIT_COLORS.primary }}
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sample Images */}
      <div>
        <h5 className="font-medium text-sm text-gray-700 mb-3">Sample Images</h5>
        <p className="text-xs text-gray-500 mb-3">
          Click any sample image to add it to your canvas
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {sampleImages.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => addImageToCanvas(canvas, imageUrl)}
              className="relative aspect-video rounded-lg overflow-hidden border-2 hover:shadow-md transition-all group"
              style={{ borderColor: AUDIT_COLORS.border }}
              disabled={isUploading}
            >
              <img
                src={imageUrl}
                alt={`Sample ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div 
        className="p-3 rounded-lg text-sm"
        style={{ backgroundColor: `${AUDIT_COLORS.secondary}10` }}
      >
        <p className="text-gray-600">
          <strong>Tips:</strong>
        </p>
        <ul className="text-gray-600 text-xs mt-1 space-y-1">
          <li>• Use high-resolution images for better quality</li>
          <li>• Images are automatically resized to fit the canvas</li>
          <li>• Drag and drop images directly onto the upload area</li>
          <li>• Use the Properties panel to adjust image settings</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPanel; 
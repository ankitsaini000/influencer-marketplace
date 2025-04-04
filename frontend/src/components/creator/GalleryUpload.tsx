import React, { useState, useEffect } from 'react';
import FileUpload from '../FileUpload';
import axios from 'axios';
import { toast } from 'react-toastify';

interface GalleryUploadProps {
  onSave: (galleryData: any) => void;
  initialData?: {
    images?: string[];
    videos?: string[];
    portfolioLinks?: { title: string; url: string }[];
  };
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ onSave, initialData }) => {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [portfolioLinks, setPortfolioLinks] = useState<{ title: string; url: string }[]>(
    initialData?.portfolioLinks || []
  );
  
  const [portfolioTitle, setPortfolioTitle] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle image upload success
  const handleImageUploadSuccess = (fileUrls: string[]) => {
    setImages([...images, ...fileUrls]);
    toast.success('Images uploaded successfully');
  };

  // Handle video upload success
  const handleVideoUploadSuccess = (fileUrls: string[]) => {
    setVideos([...videos, ...fileUrls]);
    toast.success('Videos uploaded successfully');
  };

  // Handle upload errors
  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  // Add portfolio link
  const addPortfolioLink = () => {
    if (!portfolioTitle.trim() || !portfolioUrl.trim()) {
      toast.error('Please enter both title and URL for portfolio link');
      return;
    }

    // Validate URL
    try {
      new URL(portfolioUrl);
    } catch (e) {
      toast.error('Please enter a valid URL');
      return;
    }

    setPortfolioLinks([
      ...portfolioLinks,
      { title: portfolioTitle, url: portfolioUrl }
    ]);

    // Clear inputs
    setPortfolioTitle('');
    setPortfolioUrl('');
  };

  // Remove portfolio link
  const removePortfolioLink = (index: number) => {
    const updatedLinks = [...portfolioLinks];
    updatedLinks.splice(index, 1);
    setPortfolioLinks(updatedLinks);
  };

  // Remove image
  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // Remove video
  const removeVideo = (index: number) => {
    const updatedVideos = [...videos];
    updatedVideos.splice(index, 1);
    setVideos(updatedVideos);
  };

  // Save gallery data
  const saveGallery = async () => {
    setIsLoading(true);
    
    try {
      const galleryData = {
        images,
        videos,
        portfolioLinks
      };
      
      onSave(galleryData);
      toast.success('Gallery saved successfully');
    } catch (error) {
      console.error('Error saving gallery:', error);
      toast.error('Failed to save gallery');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gallery-upload-container">
      <h2>Gallery</h2>
      <p className="description">
        Add images, videos, and portfolio links to showcase your work
      </p>

      <div className="images-section">
        <h3>Images (Max 10)</h3>
        <FileUpload
          endpoint="/api/upload/gallery"
          fieldName="images"
          multiple={true}
          maxFiles={10}
          acceptedFileTypes="image/*"
          maxFileSize={5}
          onUploadSuccess={handleImageUploadSuccess}
          onUploadError={handleUploadError}
        />

        {images.length > 0 && (
          <div className="gallery-images">
            {images.map((image, index) => (
              <div key={index} className="gallery-image-container">
                <img src={image} alt={`Gallery item ${index}`} className="gallery-image" />
                <button 
                  className="remove-button"
                  onClick={() => removeImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="videos-section">
        <h3>Videos (Max 3)</h3>
        <FileUpload
          endpoint="/api/upload/gallery"
          fieldName="videos"
          multiple={true}
          maxFiles={3}
          acceptedFileTypes="video/*"
          maxFileSize={100}
          onUploadSuccess={handleVideoUploadSuccess}
          onUploadError={handleUploadError}
        />

        {videos.length > 0 && (
          <div className="gallery-videos">
            {videos.map((video, index) => (
              <div key={index} className="gallery-video-container">
                <video 
                  src={video} 
                  controls 
                  className="gallery-video"
                  preload="metadata"
                />
                <button 
                  className="remove-button"
                  onClick={() => removeVideo(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="portfolio-links-section">
        <h3>Portfolio Links</h3>
        <div className="add-portfolio-link">
          <input
            type="text"
            value={portfolioTitle}
            onChange={(e) => setPortfolioTitle(e.target.value)}
            placeholder="Title (e.g., My Portfolio, Dribbble)"
            className="portfolio-title-input"
          />
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="URL (https://example.com)"
            className="portfolio-url-input"
          />
          <button onClick={addPortfolioLink} className="add-button">
            Add Link
          </button>
        </div>

        {portfolioLinks.length > 0 && (
          <div className="portfolio-links-list">
            {portfolioLinks.map((link, index) => (
              <div key={index} className="portfolio-link-item">
                <span className="portfolio-link-title">{link.title}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-link-url"
                >
                  {link.url}
                </a>
                <button
                  className="remove-button"
                  onClick={() => removePortfolioLink(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          onClick={saveGallery}
          disabled={isLoading}
          className="save-button"
        >
          {isLoading ? 'Saving...' : 'Save Gallery'}
        </button>
      </div>

      <style jsx>{`
        .gallery-upload-container {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        h2 {
          margin-top: 0;
          color: #333;
        }
        
        .description {
          color: #666;
          margin-bottom: 20px;
        }
        
        .images-section, .videos-section, .portfolio-links-section {
          margin-bottom: 30px;
        }
        
        h3 {
          color: #444;
          margin-bottom: 15px;
        }
        
        .gallery-images, .gallery-videos {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .gallery-image-container, .gallery-video-container {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .gallery-image, .gallery-video {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }
        
        .remove-button {
          position: absolute;
          top: 5px;
          right: 5px;
          background-color: rgba(255,0,0,0.7);
          color: white;
          border: none;
          border-radius: 3px;
          padding: 3px 8px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .add-portfolio-link {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .portfolio-title-input, .portfolio-url-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex: 1;
        }
        
        .add-button {
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
        }
        
        .portfolio-links-list {
          margin-top: 15px;
        }
        
        .portfolio-link-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          margin-bottom: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .portfolio-link-title {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .portfolio-link-url {
          color: #4a6cf7;
          flex: 1;
          margin-right: 10px;
          word-break: break-all;
        }
        
        .action-buttons {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        
        .save-button {
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .save-button:disabled {
          background-color: #94d3a2;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default GalleryUpload; 
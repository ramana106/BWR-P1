import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // To preview selected image
  const [outputImage, setOutputImage] = useState(null); // To store the base64 output image from API
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // To store other API response data

  // Handle image change and set preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file)); // Preview the image before sending
  };

  // Handle form submission to upload image and process it
  const handleSubmit = async () => {
    if (!image) return;
    
    const formData = new FormData();
    formData.append('file', image); // assuming API expects a file

    setLoading(true);
    try {
      // Send the image to Flask server
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { annotated_image, ...rest } = response.data;

      // Save the base64 output image and other response data
      setOutputImage(`data:image/jpeg;base64,${annotated_image}`);
      setApiResponse(rest);

    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload an Image</h1>
      <input type="file" onChange={handleImageChange} />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Image'}
      </button>

      {/* Preview the image before submission */}
      {previewUrl && (
        <div>
          <h2>Image Preview:</h2>
          <img src={previewUrl} alt="Selected" style={{ width: '300px' }} />
        </div>
      )}

      {/* Display the annotated image returned by the API */}
      {outputImage && (
        <div>
          <h2>Processed Image:</h2>
          <img src={outputImage} alt="Processed" style={{ width: '300px', marginTop: '20px' }} />
        </div>
      )}

      {/* Display API response data */}
      {apiResponse && (
        <div>
          <h2>API Response:</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

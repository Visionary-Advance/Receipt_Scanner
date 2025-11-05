'use client';

import { useState, useRef } from 'react';

export default function CameraCapture({ onImageCapture }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start the camera
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions or use file upload.');
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();

        // Pass the blob to parent component
        if (onImageCapture) {
          onImageCapture(blob);
        }
      }
    }, 'image/jpeg', 0.95);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      stopCamera();

      // Pass the file to parent component
      if (onImageCapture) {
        onImageCapture(file);
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Camera preview or captured image */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] mb-4">
        {!capturedImage && isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured receipt"
            className="w-full h-full object-contain"
          />
        )}

        {!capturedImage && !isCameraActive && (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-gray-300">No image captured</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Control buttons */}
      <div className="flex flex-col gap-3">
        {!capturedImage && !isCameraActive && (
          <>
            <button
              onClick={startCamera}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-6 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Upload from Gallery
            </button>
          </>
        )}

        {isCameraActive && !capturedImage && (
          <>
            <button
              onClick={capturePhoto}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="w-full py-3 px-6 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </>
        )}

        {capturedImage && (
          <button
            onClick={retakePhoto}
            className="w-full py-3 px-6 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retake Photo
          </button>
        )}
      </div>
    </div>
  );
}

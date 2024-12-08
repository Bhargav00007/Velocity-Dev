"use client";

import React, { useState } from "react";

const UploadButtons: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setAudioFiles(files);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setVideoFiles(files);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!audioFiles.length || !videoFiles.length) {
      setError("Please upload both audio and video files.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare FormData to send files to the backend
      const formData = new FormData();
      formData.append("video", videoFiles[0]); // Assuming you want to upload the first video file
      formData.append("audio", audioFiles[0]); // Assuming you want to upload the first audio file

      // Send the request to the backend
      const response = await fetch("http://localhost:5000/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error processing the video.");
      }

      // Handle the response (assuming it contains the merged video)
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setMergedVideoUrl(url); // Set the video URL to display the merged video
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Audio Upload */}
      <div className="mb-4">
        <label
          htmlFor="audio-upload"
          className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Upload Audio
        </label>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          multiple
          onChange={handleAudioUpload}
          className="hidden"
        />
      </div>
      {audioFiles.length > 0 && (
        <div className="mt-2">
          <h3 className="text-lg font-bold">Selected Audio Files:</h3>
          <ul className="list-disc pl-5">
            {audioFiles.map((file, index) => (
              <li key={index} className="text-sm">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video Upload */}
      <div className="mb-4">
        <label
          htmlFor="video-upload"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload Video
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoUpload}
          className="hidden"
        />
      </div>
      {videoFiles.length > 0 && (
        <div className="mt-2">
          <h3 className="text-lg font-bold">Selected Video Files:</h3>
          <ul className="list-disc pl-5">
            {videoFiles.map((file, index) => (
              <li key={index} className="text-sm">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Handling */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Submit Button */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Processing..." : "Merge and Download"}
        </button>
      </div>

      {/* Display Merged Video */}
      {mergedVideoUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Your Merged Video</h2>
          <video controls width="100%" src={mergedVideoUrl}></video>
        </div>
      )}
    </div>
  );
};

export default UploadButtons;

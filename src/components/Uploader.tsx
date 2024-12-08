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
      formData.append("video", videoFiles[0]);
      formData.append("audio", audioFiles[0]);

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
    <div className="flex flex-col items-center justify-center mt-20 ">
      <h1 className="lg:text-4xl text-2xl font-bold underline decoration-sky-500 mb-8">
        Merge Audio and Video:
      </h1>
      <div className="p-10 bg-gray-100 rounded shadow-lg">
        {/* Upload Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          {/* Audio Upload */}
          <div>
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

          {/* Video Upload */}
          <div>
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
        </div>

        {/* Display Selected Files */}
        {audioFiles.length > 0 && (
          <div className="mt-2 text-center">
            <h3 className="text-lg font-bold">Selected Audio Files:</h3>
            <ul className="list-disc pl-5 inline-block text-left">
              {audioFiles.map((file, index) => (
                <li key={index} className="text-sm">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {videoFiles.length > 0 && (
          <div className="mt-2 text-center">
            <h3 className="text-lg font-bold">Selected Video Files:</h3>
            <ul className="list-disc pl-5 inline-block text-left">
              {videoFiles.map((file, index) => (
                <li key={index} className="text-sm">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Handling */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Submit Button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 mt-10 rounded-3xl hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Processing..." : "Merge and Download"}
          </button>
        </div>

        {/* Display Merged Video */}
        {mergedVideoUrl && (
          <div className="mt-10 text-center">
            <h2 className="text-lg font-bold">Your Merged Video</h2>
            <div className="flex justify-center">
              <video
                controls
                className="w-full xl:w-2/3 rounded-lg"
                src={mergedVideoUrl}
              ></video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadButtons;

import React from 'react';

const DisplayVideo = ({ selectedVideo }) => {
  const getVideoUrl = (videoPath) => {
    if (!videoPath) return null;
    if (videoPath.startsWith('http')) {
      return videoPath;
    }
    // If path starts with /api/, use it directly (relative URL works)
    if (videoPath.startsWith('/api/')) {
      return videoPath;
    }
    // Otherwise prepend /api/video/
    return `/api/video/${videoPath}`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {selectedVideo ? (
        <video
          controls
          src={getVideoUrl(selectedVideo)}
          className="max-w-full max-h-full object-contain"
          style={{ width: 'auto', height: 'auto' }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <p className="text-gray-500">No video selected</p>
      )}
    </div>
  );
};

export default DisplayVideo;

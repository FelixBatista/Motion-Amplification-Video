import React from 'react';

const OpVid = ({ videoPath }) => {
  // Get video URL - handle both file paths and API paths
  const getVideoUrl = (path) => {
    if (!path) return null;
    // If it's already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    // If path starts with /api/, use it directly (relative URL works)
    if (path.startsWith('/api/')) {
      return path;
    }
    // Otherwise prepend /api/video/
    return `/api/video/${path}`;
  };

  const videoUrl = getVideoUrl(videoPath);

  return (
    <div className="w-full h-full bg-light flex flex-col justify-center items-center">
      {!videoUrl ? (
        <div className="text-gray-500">
          <p>No video available</p>
          <p className="text-sm mt-2">Process a video to see the output here</p>
        </div>
      ) : (
        <div className="w-full h-full p-4 flex items-center justify-center">
          <video 
            controls 
            loop
            autoPlay
            muted
            className="w-full h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default OpVid;

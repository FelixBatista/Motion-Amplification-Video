import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

const VideoPreview = ({ selectedVideo, setSelectedVideo, refreshKey }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/videos`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [refreshKey]);

  const handleVideoClick = (videoPath) => {
    setSelectedVideo(videoPath);
  };

  const getVideoUrl = (videoPath) => {
    if (videoPath.startsWith('http')) {
      return videoPath;
    }
    return `${API_BASE}${videoPath}`;
  };

  if (loading) {
    return (
      <div className="h-4/6 mt-4 rounded-md bg-gray-200 overflow-y-auto flex items-center justify-center">
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 mt-4 rounded-md bg-gray-200 overflow-y-auto min-h-0">
      <div className="grid gap-2 grid-cols-2 p-2">
        {videos.length > 0 ? (
          videos.map((video, index) => (
          <div
            key={index}
              className={`relative bg-white rounded-md shadow-sm transition-all transform hover:scale-105 hover:shadow-md cursor-pointer overflow-hidden ${
                selectedVideo === video.path ? 'ring-2 ring-blue-500 ring-offset-1' : 'border border-gray-300'
            }`}
              onClick={() => handleVideoClick(video.path)}
          >
              <div className="aspect-video w-full bg-black relative">
                <video
                  src={getVideoUrl(video.path)}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                  onMouseEnter={(e) => {
                    // Play on hover for preview
                    e.target.currentTime = 0;
                    e.target.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    // Pause when not hovering
                    e.target.pause();
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <svg className="w-8 h-8 text-white opacity-75" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-600 p-1.5 truncate" title={video.name}>{video.name}</p>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-4 text-center text-gray-500">
            No videos uploaded yet. Drag and drop a video to upload.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;

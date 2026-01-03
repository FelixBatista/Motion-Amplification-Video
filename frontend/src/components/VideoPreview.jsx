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
      <div className="grid gap-4 grid-cols-1 p-4">
        {videos.length > 0 ? (
          videos.map((video, index) => (
          <div
            key={index}
              className={`p-2 bg-white rounded-md shadow-md transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer ${
                selectedVideo === video.path ? 'border-2 border-blue-500' : ''
            }`}
              onClick={() => handleVideoClick(video.path)}
          >
              <video
                controls
                src={getVideoUrl(video.path)}
                className="max-w-full h-auto"
                style={{ outline: 'none' }}
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-sm text-gray-600 mt-2 truncate">{video.name}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No videos uploaded yet. Drag and drop a video to upload.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;

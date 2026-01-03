import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropzone from '../components/Dropzone';
import VideoPreview from '../components/VideoPreview';
import DisplayVideo from '../components/DisplayVideo';
import Navbar from '../components/Navbar';

const API_BASE = process.env.REACT_APP_API_URL || '';

function Upload() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreviewKey, setVideoPreviewKey] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const acceptedVideos = acceptedFiles.filter((file) =>
      file.name.match(/\.(mp4|avi|mov|mkv|flv|wmv|webm)$/i)
    );

    if (acceptedVideos.length > 0) {
      const videoFile = acceptedVideos[0];
      await uploadVideo(videoFile);
    }
  }, []);

  const uploadVideo = async (videoFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Refresh video list
      setVideoPreviewKey((prevKey) => prevKey + 1);
      setSelectedVideo(data.path);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video: ' + error.message);
      setLoading(false);
    }
  };

  const handleUpload = () => {
    if (selectedVideo) {
      navigate("/input", {
        state: {
          selectedVideo: selectedVideo
        }
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 p-4 flex flex-col overflow-hidden">
          <Dropzone onDrop={onDrop} loading={loading} />
          <div className="flex-1 overflow-hidden">
          <VideoPreview
            selectedVideo={selectedVideo}
            setSelectedVideo={setSelectedVideo}
            refreshKey={videoPreviewKey}
          />
          </div>
          {selectedVideo && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4 w-full"
              onClick={handleUpload}
            >
              Process Video
            </button>
          )}
        </div>
        <div className="w-3/4 p-4 flex items-center justify-center overflow-hidden">
          <DisplayVideo selectedVideo={selectedVideo} />
        </div>
      </div>
    </div>
  );
}

export default Upload;

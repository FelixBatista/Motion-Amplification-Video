import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import OpVid from '../components/OpVid';
import OpPara from '../components/OpPara';
import { useLocation } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

function Output() {
  const location = useLocation();
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState(null);

  // Check if we have a video from navigation state
  const data = location.state?.data;
  const params = location.state?.data?.inputParameters;
  const link = location.state?.data?.link || location.state?.data?.outputPath;

  useEffect(() => {
    // If there's a link from navigation, set it as selected
    if (link) {
      setSelectedOutput({
        path: link,
        parameters: params
      });
    }
    fetchOutputs();
  }, [link, params]);

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/outputs`);
      if (!response.ok) {
        throw new Error('Failed to fetch outputs');
      }
      const data = await response.json();
      setOutputs(data.outputs || []);
    } catch (error) {
      console.error('Error fetching outputs:', error);
      setOutputs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOutputClick = (output) => {
    setSelectedOutput({
      path: output.path,
      parameters: output.parameters || {}
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown date';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // If a video is selected, show the video player
  if (selectedOutput) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 min-h-0">
          <div className="relative bg-light w-3/4 h-full">
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => setSelectedOutput(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                ← Back to List
              </button>
            </div>
            <OpVid videoPath={selectedOutput.path} />
          </div>
          <OpPara parameters={selectedOutput.parameters || params || {}} />
        </div>
      </div>
    );
  }

  // Otherwise, show the list of outputs
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b bg-white">
            <h1 className="text-2xl font-bold text-gray-800">Processed Videos</h1>
            <p className="text-gray-600 mt-1">Select a video to view</p>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Loading outputs...</p>
            </div>
          ) : outputs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No processed videos found</p>
                <p className="text-gray-400 text-sm mt-2">Process a video to see it here</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    onClick={() => handleOutputClick(output)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-400 overflow-hidden"
                  >
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-48 h-32 bg-black flex-shrink-0 relative">
                        <video
                          src={`${API_BASE}${output.path}`}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          onMouseEnter={(e) => {
                            e.target.currentTime = 0;
                            e.target.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
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
                      
                      {/* Info */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {output.title || output.folder}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>
                              <span className="font-medium">Created:</span> {formatDate(output.created)}
                            </span>
                            <span>
                              <span className="font-medium">Size:</span> {formatFileSize(output.size)}
                            </span>
                            {output.parameters && Object.keys(output.parameters).length > 0 && (
                              <span>
                                <span className="font-medium">Parameters:</span>{' '}
                                {Object.entries(output.parameters).map(([key, value]) => `${key}=${value}`).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 font-mono">
                          {output.folder}
                        </div>
                      </div>
                      
                      {/* Arrow icon */}
                      <div className="flex items-center px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Output;

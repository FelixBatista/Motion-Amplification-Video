import React, { useState, useEffect } from 'react';

const ImportData = ({ selectedVideo, onDataChange }) => {
  const [filePath, setFilePath] = useState('');
  const [samplingRate, setSamplingRate] = useState('30');
  const [unitChecked, setUnitChecked] = useState(false);

  // Auto-populate when video is selected
  useEffect(() => {
    if (selectedVideo) {
      // Extract video path from selectedVideo (e.g., "/api/video/filename.mp4")
      const videoName = selectedVideo.split('/').pop() || '';
      // Auto-populate with default path (can be customized)
      setFilePath(videoName);
      setSamplingRate('30'); // Default frame rate
      
      // Notify parent component
      if (onDataChange) {
        onDataChange({ filePath: videoName, samplingRate: '30' });
      }
    }
  }, [selectedVideo, onDataChange]);

  const handleImportClick = () => {
    // Manual import (backup) - could trigger file picker or API call
    if (onDataChange) {
      onDataChange({ filePath, samplingRate });
    }
  };

  const handleDoneClick = () => {
    // Done button - fields are already populated
    if (onDataChange) {
      onDataChange({ filePath, samplingRate });
    }
  };

  return (
    <div className="font-sans rounded-lg bg-light p-4 shadow-md mb-4">
      <h2 className="text-lg font-bold mb-3">Import Data</h2>
      <div className="text-sm mt-2">
        <label className="block mb-1">Video File</label>
        <input
          type="text"
          placeholder="Path to file or folder"
          value={filePath}
          readOnly
          className="block w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>
      <div className="text-sm mt-3">
        <label className="block mb-1">Sampling Rate (Hz)</label>
        <input
          type="number"
          placeholder="Sampling rate (Hz)"
          value={samplingRate}
          className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          onChange={(e) => {
            setSamplingRate(e.target.value);
            if (onDataChange) onDataChange({ filePath, samplingRate: e.target.value });
          }}
        />
      </div>
      {filePath && (
        <div className="text-xs mt-3 text-gray-600 italic">
          ✓ Auto-populated from selected video. Use Import button to override.
        </div>
      )}
      <div className="text-sm mt-3 flex gap-2">
        <button
          className="bg-darker text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          onClick={handleImportClick}
        >
          Import (Manual)
        </button>
      </div>

      {/* Image Enhancement Options */}
      <div className="mt-4">
        <h2 className="text-lg font-bold">Image Enhancement Options</h2>
      </div>

      {/* Denoising Options */}
      <div className="mt-4">
        <h3 className="font-semibold">Denoising Options</h3>
        <div className="mt-2">
          <label htmlFor="denoisingOptions" className="text-sm">Denoising Method</label>
          <select
            id="denoisingOptions"
            className="block text-sm w-2/3 mt-1 border-gray-300 rounded-md focus:ring focus:ring-default"
          >
            <option value="median">Median</option>
            <option value="mean">Mean</option>
            {/* Add more denoising options as needed */}
          </select>
        </div>
        <div className="mt-4 mb-2 flex space-x-4">
          <div>
            <label htmlFor="area" className="text-sm">Area</label>
            <input
              type="text"
              id="area"
              className="block w-full mt-1 text-sm border-gray-300 rounded-md focus:ring focus:ring-default"
            />
          </div>
          <div>
            <label htmlFor="x" className="text-sm">X</label>
            <input
              type="text"
              id="x"
              className="block w-full text-sm mt-1 border-gray-300 rounded-md focus:ring focus:ring-default"
            />
          </div>
        </div>
        <div className="text-sm mt-3">
          <button className="bg-darker text-white px-4 py-1 rounded-2xl">Apply</button>
          <button className="bg-red-700 text-white px-4 py-1 rounded-2xl ml-2">Cancel</button>
        </div>
      </div>

      {/* Color Intensity Bars */}
      <div className="mt-5">
        <h3 className="font-semibold">Color Intensity Bars</h3>
        <div className="mt-2 flex space-x-4">
          <div>
            <label htmlFor="cellIntensity" className="text-sm">Cell Intensity</label>
            <input
              type="range"
              id="cellIntensity"
              min="1"
              max="2"
              step="0.02"
              className="bg-darker block w-full mt-1 border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="matrixIntensity" className="text-sm">Matrix Intensity</label>
            <input
              type="range"
              id="matrixIntensity"
              min="1"
              max="2"
              step="0.02"
              className="block w-full mt-1 border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>

      {/* Blind Convolution */}
      <div className="mt-4">
        <h3 className="font-semibold">Blind Convolution</h3>
        <div className="mt-2 text-sm ">
          <button className="bg-darker text-sm text-white px-4 py-1 rounded-2xl">Apply</button>
          <button className="bg-red-700 text-white px-4 py-1 rounded-2xl ml-2 mb-1">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImportData;
import React, { useState, useEffect } from 'react';
import DisplayVideo from './DisplayVideo';
import AdvancedSettings from './AdvancedSettings';

const API_BASE = process.env.REACT_APP_API_URL || '';

const PresetWizard = ({ selectedVideo, onProcess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preset, setPreset] = useState('general_auto');
  const [strength, setStrength] = useState('auto');
  const [strengthValue, setStrengthValue] = useState(50);
  const [roi, setRoi] = useState('auto');
  const [roiCoords, setRoiCoords] = useState(null);
  const [temporalMode, setTemporalMode] = useState('auto');
  const [manualBand, setManualBand] = useState(false);
  const [fl, setFl] = useState(0.04);
  const [fh, setFh] = useState(0.4);
  const [fps, setFps] = useState(30);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState(null);

  // Load presets on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then(res => res.json())
      .then(data => {
        // Presets loaded
      })
      .catch(err => console.error('Failed to load presets:', err));
  }, []);

  // Analyze video when selected
  useEffect(() => {
    if (selectedVideo && currentStep >= 2) {
      analyzeVideo();
    }
  }, [selectedVideo, currentStep]);

  const analyzeVideo = async () => {
    if (!selectedVideo) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoPath: selectedVideo })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
        setFps(data.fps || 30);
        setVideoMetadata(data);
        
        // Auto-set ROI if detected
        if (data.roi && data.roi.w > 0) {
          setRoiCoords(data.roi);
        }
        
        // Auto-suggest temporal mode
        if (data.suggested_mode === 'temporal') {
          setTemporalMode('on');
        }
        
        // Auto-set frequency band if detected
        if (data.frequencies && data.frequencies.length > 0) {
          const topFreq = data.frequencies[0].freq;
          setFl(Math.max(0.01, topFreq * 0.7));
          setFh(Math.min(fps / 2, topFreq * 1.3));
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePresetChange = (presetName) => {
    setPreset(presetName);
    if (presetName === 'advanced') {
      setShowAdvanced(true);
    } else {
      setShowAdvanced(false);
    }
  };

  const handleProcess = () => {
    if (!selectedVideo) {
      alert('Please select a video first');
      return;
    }

    const overrides = {};
    
    // Map strength
    if (strength !== 'auto') {
      overrides.strength = strengthValue;
    }
    
    // Map ROI
    if (roi !== 'auto' && roiCoords) {
      overrides.roi = `${roiCoords.x},${roiCoords.y},${roiCoords.w},${roiCoords.h}`;
    }
    
    // Map temporal band if manual
    if (manualBand) {
      overrides.fl = fl;
      overrides.fh = fh;
    }
    
    const requestData = {
      videoPath: selectedVideo,
      preset: preset,
      overrides: Object.keys(overrides).length > 0 ? overrides : undefined
    };

    if (onProcess) {
      onProcess(requestData);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 1: Load Video</h2>
      <div className="bg-light p-4 rounded-lg">
        {selectedVideo ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Video loaded: {selectedVideo.split('/').pop()}</p>
            <DisplayVideo selectedVideo={selectedVideo} />
            {analyzing ? (
              <p className="mt-2 text-sm text-blue-600">Analyzing video...</p>
            ) : analysisResults ? (
              <div className="mt-2 text-sm">
                <p>FPS: {fps} Hz</p>
                {analysisResults.frequencies && analysisResults.frequencies.length > 0 && (
                  <p>Detected frequencies: {analysisResults.frequencies.map(f => `${f.freq.toFixed(2)} Hz`).join(', ')}</p>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-gray-500">Please select a video from the upload page</p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!selectedVideo}
          className="bg-darker text-white px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          Next: Select Region
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 2: Select Region (Optional)</h2>
      <div className="bg-light p-4 rounded-lg">
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={roi === 'auto'}
              onChange={(e) => setRoi(e.target.checked ? 'auto' : 'manual')}
              className="mr-2"
            />
            <span>Auto-detect region (recommended)</span>
          </label>
        </div>
        {selectedVideo && (
          <div className="relative">
            <DisplayVideo selectedVideo={selectedVideo} />
            {roi === 'manual' && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Click and drag on the video to select region (coming soon)</p>
                {roiCoords && (
                  <p>ROI: x={roiCoords.x}, y={roiCoords.y}, w={roiCoords.w}, h={roiCoords.h}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="bg-darker text-white px-6 py-2 rounded-md hover:bg-opacity-90"
        >
          Next: Choose Goal
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 3: Choose Goal</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'general_auto', name: 'General Motion', desc: 'Make motion visible (default)' },
          { id: 'vibration_auto', name: 'Vibration / NVH', desc: 'Machinery and automotive analysis' },
          { id: 'heartbeat_auto', name: 'Heartbeat / Breathing', desc: 'Medical and physiological' },
          { id: 'structural_auto', name: 'Structural Motion', desc: 'Buildings, bridges, sway' },
          { id: 'handheld_auto', name: 'Handheld / Shaky', desc: 'Camera stabilization' },
          { id: 'advanced', name: 'Advanced', desc: 'Manual parameter control' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => handlePresetChange(p.id)}
            className={`p-4 rounded-lg border-2 text-left ${
              preset === p.id ? 'border-darker bg-darker bg-opacity-10' : 'border-gray-300'
            }`}
          >
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.desc}</p>
          </button>
        ))}
      </div>
      {showAdvanced && (
        <div className="mt-4">
          <AdvancedSettings
            temporalMode={temporalMode}
            setTemporalMode={setTemporalMode}
            manualBand={manualBand}
            setManualBand={setManualBand}
            fl={fl}
            setFl={setFl}
            fh={fh}
            setFh={setFh}
          />
        </div>
      )}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="bg-darker text-white px-6 py-2 rounded-md hover:bg-opacity-90"
        >
          Next: Preview & Export
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 4: Preview & Export</h2>
      <div className="bg-light p-4 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Amplification Strength
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={strength === 'auto'}
              onChange={(e) => setStrength(e.target.checked ? 'auto' : 'manual')}
              className="mr-2"
            />
            <span className="text-sm">Auto (recommended)</span>
          </div>
          {strength === 'manual' && (
            <div className="mt-2">
              <input
                type="range"
                min="1"
                max="100"
                value={strengthValue}
                onChange={(e) => setStrengthValue(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600">Strength: {strengthValue}</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Isolate Frequency
          </label>
          <select
            value={temporalMode}
            onChange={(e) => setTemporalMode(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="auto">Auto</option>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
          {temporalMode === 'on' && (
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={manualBand}
                  onChange={(e) => setManualBand(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Manual frequency band</span>
              </label>
              {manualBand && (
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-sm">Low cutoff (Hz):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fl}
                      onChange={(e) => setFl(parseFloat(e.target.value))}
                      className="block w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm">High cutoff (Hz):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={fh}
                      onChange={(e) => setFh(parseFloat(e.target.value))}
                      className="block w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(3)}
          className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={handleProcess}
          className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 text-lg font-semibold"
        >
          Export & Process
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-darker text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-darker' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Load</span>
          <span>Region</span>
          <span>Goal</span>
          <span>Export</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default PresetWizard;


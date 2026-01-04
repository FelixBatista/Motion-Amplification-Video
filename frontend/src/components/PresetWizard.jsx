import React, { useState, useEffect, useRef } from 'react';
import DisplayVideo from './DisplayVideo';
import AdvancedSettings from './AdvancedSettings';
import ROISelector from './ROISelector';

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [enableTrim, setEnableTrim] = useState(false);
  const [presetList, setPresetList] = useState([]);
  const [velocityMag, setVelocityMag] = useState(false);
  const [filterType, setFilterType] = useState('differenceOfIIR');
  const [nFilterTap, setNFilterTap] = useState(2);
  const [manualFps, setManualFps] = useState(null);
  const [processingMode, setProcessingMode] = useState('standard');
  const videoRef = useRef(null);

  // Load presets on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then(res => res.json())
      .then(data => {
        setPresetList(data.presets || []);
      })
      .catch(err => console.error('Failed to load presets:', err));
  }, []);

  // Get video duration when video loads
  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      const video = videoRef.current.querySelector('video');
      if (video) {
        const handleLoadedMetadata = () => {
          setVideoDuration(video.duration || 0);
          setTrimEnd(video.duration || 0);
        };
        if (video.readyState >= 1) {
          handleLoadedMetadata();
        } else {
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      }
    }
  }, [selectedVideo]);

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
        
        // Auto-set ROI if detected (already in video coordinates from backend)
        if (data.roi && data.roi.w > 0) {
          setRoiCoords(data.roi);
          // Note: Auto-detected ROI is already in video pixel coordinates
        }
        
        // Set heatmap URL if available
        if (data.motionHeatmapUrl) {
          setHeatmapUrl(data.motionHeatmapUrl);
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

        // In advanced mode, don't override manual FPS
        if (preset !== 'advanced' || manualFps === null) {
          setManualFps(null); // Reset manual FPS when auto-detected
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
      // In advanced mode, enable manual control
      setTemporalMode('on');
      setManualBand(true);
      setProcessingMode('temporal');
    } else {
      setShowAdvanced(false);
      // Reset to defaults when switching away from advanced
      setVelocityMag(false);
      setFilterType('differenceOfIIR');
      setNFilterTap(2);
      setManualFps(null);
      setProcessingMode('standard');
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    setSavingPreset(true);
    try {
      // Build preset configuration from current settings
      const presetConfig = {
        run: {
          mode: preset === 'advanced' ? (temporalMode === 'on' ? 'temporal' : 'standard') : 'auto',
          roi: roi === 'auto' ? 'auto' : 'manual',
          strength: strength === 'auto' ? 'auto' : strengthValue.toString(),
          stabilization: 'auto',
          output: 'auto'
        },
        temporal: {
          enabled: temporalMode === 'auto' ? 'auto' : (temporalMode === 'on' ? 'on' : 'off'),
          band: manualBand ? `${fl},${fh}` : 'auto',
          filter: 'differenceOfIIR'
        }
      };

      const response = await fetch(`${API_BASE}/api/presets/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName.trim(),
          preset: presetConfig
        })
      });

      if (response.ok) {
        alert(`Preset "${presetName}" saved successfully!`);
        setShowSavePreset(false);
        setPresetName('');
        // Optionally reload presets list
      } else {
        const error = await response.json();
        alert('Failed to save preset: ' + (error.detail || error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save preset error:', error);
      alert('Failed to save preset: ' + error.message);
    } finally {
      setSavingPreset(false);
    }
  };

  const handleROIChange = (newROI) => {
    // newROI is already in video coordinates (converted by ROISelector)
    setRoiCoords(newROI);
    if (newROI) {
      setRoi('manual');
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedVideo) {
      alert('Please select a video first');
      return;
    }

    setGeneratingPreview(true);
    try {
      const overrides = {};
      
      // Map strength
      if (strength !== 'auto') {
        overrides.strength = strengthValue;
      } else {
        overrides.strength = analysisResults?.suggested_amplification ? 
          Math.min(100, Math.max(1, analysisResults.suggested_amplification * 2)) : 30;
      }
      
      // Map ROI
      if (roi !== 'auto' && roiCoords) {
        overrides.roi = `${roiCoords.x},${roiCoords.y},${roiCoords.w},${roiCoords.h}`;
      }
      
      // Map temporal band if manual
      if (manualBand || temporalMode === 'on' || preset === 'advanced') {
        overrides.fl = fl;
        overrides.fh = fh;
      }

      // Map advanced parameters if in advanced mode
      if (preset === 'advanced') {
        overrides.velocity_mag = velocityMag;
        overrides.filter_type = filterType;
        overrides.n_filter_tap = nFilterTap;
        overrides.mode = processingMode;
        if (manualFps !== null) {
          overrides.fs = manualFps;
        }
      }

      const response = await fetch(`${API_BASE}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: selectedVideo,
          preset: preset,
          overrides: Object.keys(overrides).length > 0 ? overrides : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(data.previewUrl);
      } else {
        const error = await response.json();
        alert('Preview generation failed: ' + (error.detail || error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      alert('Failed to generate preview: ' + error.message);
    } finally {
      setGeneratingPreview(false);
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
    if (manualBand || preset === 'advanced') {
      overrides.fl = fl;
      overrides.fh = fh;
    }

    // Map advanced parameters if in advanced mode
    if (preset === 'advanced') {
      overrides.velocity_mag = velocityMag;
      overrides.filter_type = filterType;
      overrides.n_filter_tap = nFilterTap;
      overrides.mode = processingMode;
      if (manualFps !== null) {
        overrides.fs = manualFps;
      }
    }

    // Map trim parameters
    if (enableTrim && (trimStart > 0 || trimEnd < videoDuration)) {
      overrides.trimStart = trimStart;
      overrides.trimEnd = trimEnd;
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 1: Load Video</h2>
      <div className="bg-light p-4 rounded-lg">
        {selectedVideo ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Video loaded: {selectedVideo.split('/').pop()}</p>
            <div className="relative" ref={videoRef}>
              <DisplayVideo selectedVideo={selectedVideo} />
            </div>
            
            {/* Trim Controls */}
            {videoDuration > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="enableTrim"
                    checked={enableTrim}
                    onChange={(e) => setEnableTrim(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="enableTrim" className="text-sm font-medium">
                    Trim video (optional)
                  </label>
                </div>
                {enableTrim && (
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start time</label>
                        <input
                          type="number"
                          min="0"
                          max={videoDuration}
                          step="0.1"
                          value={trimStart}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(parseFloat(e.target.value) || 0, trimEnd));
                            setTrimStart(val);
                          }}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-xs text-gray-500">{formatTime(trimStart)}</span>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End time</label>
                        <input
                          type="number"
                          min={trimStart}
                          max={videoDuration}
                          step="0.1"
                          value={trimEnd}
                          onChange={(e) => {
                            const val = Math.max(trimStart, Math.min(parseFloat(e.target.value) || videoDuration, videoDuration));
                            setTrimEnd(val);
                          }}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-xs text-gray-500">{formatTime(trimEnd)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Duration: {formatTime(trimEnd - trimStart)} (of {formatTime(videoDuration)} total)
                    </div>
                  </div>
                )}
              </div>
            )}

            {analyzing ? (
              <p className="mt-2 text-sm text-blue-600">Analyzing video...</p>
            ) : analysisResults ? (
              <div className="mt-2 text-sm space-y-1">
                <p>FPS: {fps} Hz</p>
                {analysisResults.frequencies && analysisResults.frequencies.length > 0 && (
                  <p>Detected frequencies: {analysisResults.frequencies.map(f => `${f.freq.toFixed(2)} Hz`).join(', ')}</p>
                )}
                {analysisResults.suggested_amplification && (
                  <p>Suggested amplification: {analysisResults.suggested_amplification}x</p>
                )}
                {heatmapUrl && (
                  <p className="text-blue-600">✓ Motion heatmap generated</p>
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
        <div className="mb-4 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={roi === 'auto'}
              onChange={(e) => setRoi(e.target.checked ? 'auto' : 'manual')}
              className="mr-2"
            />
            <span>Auto-detect region (recommended)</span>
          </label>
          {roi === 'auto' && heatmapUrl && (
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="mr-2"
              />
              <span>Show motion energy heatmap</span>
            </label>
          )}
        </div>
        {selectedVideo && (
          <div className="relative">
            <div className="relative w-full bg-gray-200 rounded overflow-hidden" style={{ maxHeight: '500px', minHeight: '300px' }} ref={videoRef}>
              <div className="relative w-full h-full flex items-center justify-center" style={{ maxHeight: '500px' }}>
                <DisplayVideo selectedVideo={selectedVideo} />
                {roi === 'auto' && showHeatmap && heatmapUrl && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      backgroundImage: `url(${API_BASE}${heatmapUrl})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      opacity: 0.6,
                      mixBlendMode: 'screen'
                    }}
                    title="Motion Energy Heatmap - Red/Yellow areas show high motion"
                  />
                )}
                {roi === 'manual' && (
                  <ROISelector
                    videoElement={videoRef.current?.querySelector('video')}
                    onROIChange={handleROIChange}
                    initialROI={roiCoords}
                    videoPath={selectedVideo}
                  />
                )}
              </div>
            </div>
            {roi === 'manual' && roiCoords && (
              <div className="mt-2 text-sm text-gray-600">
                <p>ROI: x={Math.round(roiCoords.x)}, y={Math.round(roiCoords.y)}, 
                   w={Math.round(roiCoords.w)}, h={Math.round(roiCoords.h)}</p>
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

  const renderStep3 = () => {
    const presetMap = {
      'general_auto': { id: 'general_auto', name: 'General Motion', desc: 'Make motion visible (default)' },
      'vibration_auto': { id: 'vibration_auto', name: 'Vibration / NVH', desc: 'Machinery and automotive analysis' },
      'heartbeat_auto': { id: 'heartbeat_auto', name: 'Heartbeat / Breathing', desc: 'Medical and physiological' },
      'structural_auto': { id: 'structural_auto', name: 'Structural Motion', desc: 'Buildings, bridges, sway' },
      'handheld_auto': { id: 'handheld_auto', name: 'Handheld / Shaky', desc: 'Camera stabilization' },
      'advanced': { id: 'advanced', name: 'Advanced', desc: 'Manual parameter control' }
    };

    // Merge with API descriptions if available
    const presetsToShow = presetList.length > 0 
      ? presetList.map(p => {
          const defaultPreset = presetMap[p.name] || { id: p.name, name: p.name, desc: p.description || 'Custom preset' };
          return { ...defaultPreset, description: p.description || defaultPreset.desc };
        })
      : Object.values(presetMap).map(p => ({ ...p, description: p.desc }));

    // Add advanced if not in list
    if (!presetsToShow.find(p => p.id === 'advanced')) {
      presetsToShow.push({ ...presetMap['advanced'], description: presetMap['advanced'].desc });
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Step 3: Choose Goal</h2>
        <div className="grid grid-cols-2 gap-4">
          {presetsToShow.map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p.id)}
              className={`p-4 rounded-lg border-2 text-left relative group ${
                preset === p.id ? 'border-darker bg-darker bg-opacity-10' : 'border-gray-300 hover:border-gray-400'
              }`}
              title={p.description || p.desc}
            >
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.description || p.desc}</p>
              {p.description && p.description !== (p.desc || '') && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg max-w-xs z-10">
                    {p.description}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      {showAdvanced && (
        <div className="mt-4 space-y-4">
          <AdvancedSettings
            temporalMode={temporalMode}
            setTemporalMode={setTemporalMode}
            manualBand={manualBand}
            setManualBand={setManualBand}
            fl={fl}
            setFl={setFl}
            fh={fh}
            setFh={setFh}
            velocityMag={velocityMag}
            setVelocityMag={setVelocityMag}
            filterType={filterType}
            setFilterType={setFilterType}
            nFilterTap={nFilterTap}
            setNFilterTap={setNFilterTap}
            fps={fps}
            manualFps={manualFps}
            setManualFps={setManualFps}
            processingMode={processingMode}
            setProcessingMode={setProcessingMode}
          />
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <h3 className="font-bold mb-3">Save Custom Preset</h3>
            {!showSavePreset ? (
              <button
                onClick={() => setShowSavePreset(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
              >
                Save Current Settings as Preset
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Preset name (e.g., my_custom_preset)"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePreset}
                    disabled={savingPreset || !presetName.trim()}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    {savingPreset ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSavePreset(false);
                      setPresetName('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
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
  };

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

        {/* Preview Section */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <button
            onClick={handleGeneratePreview}
            disabled={generatingPreview}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {generatingPreview ? 'Generating Preview...' : 'Generate Preview (2-3 seconds)'}
          </button>
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <video
                src={previewUrl}
                controls
                className="w-full max-w-md rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
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
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-darker text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className="mt-2 text-xs text-gray-600">
                  {step === 1 ? 'Load' : step === 2 ? 'Region' : step === 3 ? 'Goal' : 'Export'}
                </span>
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-darker' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
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


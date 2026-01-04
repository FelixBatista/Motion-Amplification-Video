import React from 'react';

const AdvancedSettings = ({
  temporalMode,
  setTemporalMode,
  manualBand,
  setManualBand,
  fl,
  setFl,
  fh,
  setFh,
  velocityMag = false,
  setVelocityMag = null,
  filterType = 'differenceOfIIR',
  setFilterType = null,
  nFilterTap = 2,
  setNFilterTap = null,
  fps = 30,
  manualFps = null,
  setManualFps = null,
  processingMode = 'standard',
  setProcessingMode = null
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
      <h3 className="font-bold mb-3">Advanced Settings - Manual Parameter Control</h3>
      <p className="text-xs text-gray-600 mb-4">All parameters are available for manual control in advanced mode.</p>
      
      <div className="space-y-4">
        {/* Processing Mode */}
        <div>
          <label className="block text-sm font-medium mb-1">Processing Mode</label>
          <select
            value={processingMode}
            onChange={(e) => {
              if (setProcessingMode) {
                setProcessingMode(e.target.value);
                // Sync temporal mode with processing mode
                if (setTemporalMode) {
                  setTemporalMode(e.target.value === 'temporal' ? 'on' : 'off');
                }
              }
            }}
            className="block w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={!setProcessingMode}
          >
            <option value="standard">Standard (frame-to-frame amplification)</option>
            <option value="temporal">Temporal (frequency-domain filtering)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Standard: Amplifies all motion. Temporal: Isolates specific frequency bands.
          </p>
        </div>

        {/* Manual FPS Override */}
        {setManualFps && (
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={manualFps !== null}
                onChange={(e) => {
                  if (e.target.checked) {
                    setManualFps(fps);
                  } else {
                    setManualFps(null);
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">Override FPS (sampling rate)</span>
            </label>
            {manualFps !== null && (
              <div className="ml-6">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="120"
                  value={manualFps}
                  onChange={(e) => setManualFps(parseFloat(e.target.value) || fps)}
                  className="block w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-detected: {fps} Hz. Override if video metadata is incorrect.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Frequency Band Settings */}
        {(temporalMode === 'on' || processingMode === 'temporal') && (
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={manualBand}
                onChange={(e) => setManualBand(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Manual frequency band</span>
            </label>
            {manualBand && (
              <div className="ml-6 space-y-2">
                <div>
                  <label className="text-sm">Low cutoff frequency (Hz):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fl}
                    onChange={(e) => setFl(parseFloat(e.target.value) || 0.04)}
                    className="block w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm">High cutoff frequency (Hz):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fh}
                    onChange={(e) => setFh(parseFloat(e.target.value) || 0.4)}
                    className="block w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Frequency range to isolate. Must be less than Nyquist frequency (FPS/2).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filter Type */}
        {setFilterType && (
          <div>
            <label className="block text-sm font-medium mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="differenceOfIIR">Difference of IIR (recommended, smoother)</option>
              <option value="butter">Butterworth (classic filter)</option>
              <option value="fir">FIR (finite impulse response)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Filter algorithm for temporal mode. Difference of IIR is recommended for most cases.
            </p>
          </div>
        )}

        {/* Number of Filter Taps */}
        {setNFilterTap && filterType === 'fir' && (
          <div>
            <label className="block text-sm font-medium mb-1">Number of Filter Taps (FIR only)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={nFilterTap}
              onChange={(e) => setNFilterTap(parseInt(e.target.value) || 2)}
              className="block w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of filter taps for FIR filter. Higher values = sharper frequency response.
            </p>
          </div>
        )}

        {/* Velocity Magnification */}
        {setVelocityMag && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={velocityMag}
                onChange={(e) => setVelocityMag(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Velocity magnification</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Better for high-frequency vibration. Amplifies motion velocity instead of displacement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSettings;


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
  setFilterType = null
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
      <h3 className="font-bold mb-3">Advanced Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={velocityMag}
              onChange={(e) => setVelocityMag && setVelocityMag(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Velocity magnification (better for high-frequency vibration)</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Filter Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType && setFilterType(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={!setFilterType}
          >
            <option value="differenceOfIIR">Difference of IIR (recommended)</option>
            <option value="butter">Butterworth</option>
            <option value="fir">FIR</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Usually hidden from users</p>
        </div>
        
        {temporalMode === 'on' && (
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
                    value={fh}
                    onChange={(e) => setFh(parseFloat(e.target.value) || 0.4)}
                    className="block w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSettings;


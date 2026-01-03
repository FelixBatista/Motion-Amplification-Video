import React, { useState } from 'react';

function UserInput({ onSubmit }) {
  const [formData, setFormData] = useState({
    phase: 'run',
    config_file: 'o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3.conf',
    config_spec: 'configs/configspec.conf',
    vid_dir: 'data/vids',
    frame_ext: 'png',
    out_dir: 'data/output',
    amplification_factor: 30,
    velocity_mag: false,
    fl: 0.04,
    fh: 0.4,
    fs: 30,
    n_filter_tap: 2,
    filter_type: 'differenceOfIIR',
    Temporal: true, // Initialize Temporal as true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onSubmit prop with the form data
    onSubmit(formData);
    // Provide visual feedback
    alert('Parameters updated successfully! Click "Process Video (MAV)" to start processing.');
  };

  return (
      <div className="bg-light p-4 rounded-lg shadow-md w-full">
        <h2 className="text-lg font-semibold">Parameters:</h2>
        <div className="max-h-full overflow-y-auto">
          <form onSubmit={handleSubmit}>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Phase:</label>
          <select
            name="phase"
            value={formData.phase}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          >
            <option value="train">Train</option>
            <option value="test">Test</option>
            <option value="run">Run</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Config File:</label>
          <input
            type="text"
            name="config_file"
            value={formData.config_file}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Config Spec:</label>
          <input
            type="text"
            name="config_spec"
            value={formData.config_spec}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Video Folder:</label>
          <input
            type="text"
            name="vid_dir"
            value={formData.vid_dir}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Frame Extension:</label>
          <input
            type="text"
            name="frame_ext"
            value={formData.frame_ext}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Output Folder:</label>
          <input
            type="text"
            name="out_dir"
            value={formData.out_dir}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Amplification Factor:</label>
          <input
            type="number"
            step="0.1"
            name="amplification_factor"
            value={formData.amplification_factor}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>


        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Enable Velocity Magnification:
          </label>
          <input
            type="checkbox"
            name="velocity_mag"
            checked={formData.velocity_mag}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Temporal
          </label>
          <input
            type="checkbox"
            name="Temporal"
            checked={formData.Temporal}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Low Cutoff Frequency:</label>
          <input
            type="number"
            step="0.01"
            name="fl"
            value={formData.fl}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">High Cutoff Frequency:</label>
          <input
            type="number"
            step="0.01"
            name="fh"
            value={formData.fh}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Sampling Rate:</label>
          <input
            type="number"
            step="0.1"
            name="fs"
            value={formData.fs}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Number of Filter Taps:</label>
          <input
            type="number"
            name="n_filter_tap"
            value={formData.n_filter_tap}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Filter Type:</label>
          <select
            name="filter_type"
            value={formData.filter_type}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          >
            <option value="butter">Butter</option>
            <option value="fir">fir</option>
            <option value="differenceOfIIR">differenceOfIIR</option>
          </select>
        </div>

        <div className="mt-4 text-sm py-6">
            <button
              type="submit"
              className="bg-darker text-white px-4 py-2 rounded-full hover:d"
            >
              Submit
            </button>
            <div>
              <br />
              <br />
              <br />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserInput;


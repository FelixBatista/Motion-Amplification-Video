// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import ImportData from '../components/ImportData';
// import VideoAmp from '../components/VideoAmp';
// import FreqSpect from '../components/FreqSpect';
// import UserInput from '../components/UserInput';

// const InputPage = () => {
//   const [dialogVisible, setDialogVisible] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleCloseDialog = () => {
//     setDialogVisible(false);
//     navigate('/');
//   };

//   const selectedVideo = location.state?.selectedVideo;

//   // Define state for input parameters
//   const [inputParameters, setInputParameters] = useState({
//     phase: 'train',
//     config_file: '',
//     config_spec: 'configs/configspec.conf',
//     vid_dir: '',
//     frame_ext: 'png',
//     out_dir: '',
//     amplification_factor: 5,
//     velocity_mag: false,
//     fl: '',
//     fh: '',
//     fs: '',
//     n_filter_tap: '',
//     filter_type: 'Butter',
//     Temporal: Boolean,
//   });

//   // Handle changes in input fields and update the state
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const newValue = type === 'checkbox' ? checked : value;

//     setInputParameters({
//       ...inputParameters,
//       [name]: newValue,
//     });
//   };

//   // Handle the JSON creation and logging
//   const handleJSONCreation = () => {
//     // Combine selected video with input parameters
//     const inputData = {
//       selectedVideo: selectedVideo,
//       inputParameters: inputParameters,
//     };

//     // Log the JSON object
//     console.log('Input Data:', inputData);

//     fetch('http://0.0.0.0:8000/send/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(inputData), // Send the form data as JSON
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log('Response from server:', data);
//         // You can handle the server response here
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//         // Handle errors here
//       });
//   };

//   const handleFormSubmit = (formData) => {
//     // You can access the form data here
//     setInputParameters(formData)
//   }


//   useEffect(() => {
//     if (selectedVideo) {
//       console.log('selectedVideo', selectedVideo);
//     }}, [selectedVideo]);

//   return (
//     <div className={`bg-default flex w-full h-screen ${dialogVisible ? '' : 'hidden'}`}>
//       <div className="flex">
//         <div className="w-1/2 bg-gray-200">
//           <ImportData selectedVideo={selectedVideo} />
//           <VideoAmp />
//         </div>
//         <div className="w-1/2 bg-gray-300">
//           {/* Close Button */}
//           <div className="absolute top-4 right-4">
//             <button
//               onClick={handleCloseDialog}
//               className="text-red-500 hover:text-red-900 px-3 py-0.5 rounded-full shadow-lg max-h-screen overflow-y-auto"
//             >
//               x
//             </button>
//           </div>
//           <FreqSpect />
//           <UserInput onSubmit={handleFormSubmit} /> {/* Pass the onSubmit prop */}
//           {/* Rest of the content */}
          
          

//           {/* Button to create and log JSON */}
//           <div className="mt-4">
//             <button
//               onClick={handleJSONCreation}
//               className="bg-darker text-white px-4 py-2 rounded-md hover:bg-dark"
//             >
//               Create JSON
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InputPage;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PresetWizard from '../components/PresetWizard';

const InputPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedVideo = location.state?.selectedVideo;

  const [processProgress, setProcessProgress] = useState(null);
  const [processJobId, setProcessJobId] = useState(null);

  const pollProcessProgress = async (jobId) => {
    let pollCount = 0;
    const maxPolls = 3600; // 1 hour max
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(pollInterval);
        setLoading(false);
        alert('Processing timed out');
        return;
      }
      
      try {
        const API_BASE = process.env.REACT_APP_API_URL || '';
        const response = await fetch(`${API_BASE}/api/progress/${jobId}`);
        if (response.ok) {
          const progress = await response.json();
          setProcessProgress(progress);
          
          if (progress.status === 'completed') {
            clearInterval(pollInterval);
            setLoading(false);
            navigate('/output', { state: { outputVideo: progress.outputPath || '/api/video/processed.mp4' } });
          } else if (progress.status === 'error') {
            clearInterval(pollInterval);
            setLoading(false);
            alert('Processing failed: ' + progress.message);
          }
        }
      } catch (error) {
        console.error('Failed to poll progress:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    return () => clearInterval(pollInterval);
  };

  const handleProcess = async (requestData) => {
    if (!selectedVideo) {
      alert('Please select a video first');
      return;
    }

    const API_BASE = process.env.REACT_APP_API_URL || '';
    console.log('Sending request:', requestData);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response from server:', data);
      
      if (!response.ok) {
        const errorMsg = data.detail || data.error || `Server error: ${response.status}`;
        alert('Error: ' + errorMsg);
        setLoading(false);
        return;
      }
      
      if (data.error) {
        alert('Error: ' + data.error);
        setLoading(false);
        return;
      }
      
      // If jobId is provided, start polling for progress
      if (data.jobId) {
        setProcessJobId(data.jobId);
        pollProcessProgress(data.jobId);
      } else {
        // Fallback: navigate immediately if no jobId
        navigate('/output', {
          state: {
            data: data
          }
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!loading ? (
        <div className="flex flex-col h-full min-h-0">
          <Navbar />
          <div className="flex-1 overflow-y-auto bg-default">
            <div className="py-4">
              <PresetWizard 
                selectedVideo={selectedVideo} 
                onProcess={handleProcess}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center h-screen w-screen'>
          <div className="text-center max-w-md px-4">
            <div className="flex justify-center">
              <svg className="animate-spin h-16 w-16 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-lg font-semibold">Processing video...</p>
            {processProgress && (
              <div className="mt-6 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${processProgress.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {processProgress.current_step || processProgress.message || 'Processing...'} ({processProgress.progress}%)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPage;

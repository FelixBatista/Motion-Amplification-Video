import React, { useState, useRef, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

const ROISelector = ({ videoElement, onROIChange, initialROI = null, videoPath = null }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentROI, setCurrentROI] = useState(initialROI || null);
  const [videoDimensions, setVideoDimensions] = useState(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (initialROI) {
      setCurrentROI(initialROI);
    }
  }, [initialROI]);

  // Get video dimensions when video loads
  useEffect(() => {
    if (videoElement && videoPath) {
      const handleLoadedMetadata = async () => {
        if (videoElement.videoWidth && videoElement.videoHeight) {
          // Get actual video dimensions from backend
          try {
            const response = await fetch(`${API_BASE}/api/analyze-video`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoPath })
            });
            if (response.ok) {
              const data = await response.json();
              if (data.videoDimensions) {
                setVideoDimensions(data.videoDimensions);
              }
            }
          } catch (error) {
            console.error('Failed to get video dimensions:', error);
            // Fallback to video element dimensions
            setVideoDimensions({
              width: videoElement.videoWidth,
              height: videoElement.videoHeight
            });
          }
        }
      };
      
      if (videoElement.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    }
  }, [videoElement, videoPath]);

  const getRelativeCoordinates = (e) => {
    if (!containerRef.current) {
      // Fallback: try to get from video element's parent
      if (videoElement && videoElement.parentElement) {
        const rect = videoElement.parentElement.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
      return { x: 0, y: 0 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (!videoElement || !containerRef.current) return;
    const pos = getRelativeCoordinates(e);
    setIsDrawing(true);
    setStartPos(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getRelativeCoordinates(e);
    const container = containerRef.current || (videoElement?.parentElement);
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Calculate ROI bounds - ensure they stay within container
    const x = Math.max(0, Math.min(startPos.x, pos.x));
    const y = Math.max(0, Math.min(startPos.y, pos.y));
    const w = Math.min(rect.width - x, Math.abs(pos.x - startPos.x));
    const h = Math.min(rect.height - y, Math.abs(pos.y - startPos.y));
    
    setCurrentROI({ x, y, w, h });
  };

  const handleMouseUp = async (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentROI && currentROI.w > 10 && currentROI.h > 10) {
      // Convert to video coordinates if we have video dimensions
      if (videoPath && videoDimensions && containerRef.current) {
        try {
          const displayDims = {
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight
          };
          
          const response = await fetch(`${API_BASE}/api/convert-roi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoPath,
              uiROI: currentROI,
              displayDimensions: displayDims
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (onROIChange) {
              onROIChange(data.videoROI);
            }
          } else {
            // Fallback: use UI coordinates directly
            if (onROIChange) {
              onROIChange(currentROI);
            }
          }
        } catch (error) {
          console.error('Failed to convert ROI:', error);
          // Fallback: use UI coordinates directly
          if (onROIChange) {
            onROIChange(currentROI);
          }
        }
      } else {
        // No conversion needed or dimensions not available
        if (onROIChange) {
          onROIChange(currentROI);
        }
      }
    } else {
      setCurrentROI(null);
    }
  };

  const handleClear = () => {
    setCurrentROI(null);
    if (onROIChange) {
      onROIChange(null);
    }
  };

  // Set containerRef when the overlay div mounts
  useEffect(() => {
    if (videoElement && videoElement.parentElement) {
      // Find the relative container that wraps the video
      let parent = videoElement.parentElement;
      while (parent && !parent.classList.contains('relative')) {
        parent = parent.parentElement;
        if (!parent || parent === document.body) break;
      }
      if (parent && !containerRef.current) {
        containerRef.current = parent;
      }
    }
  }, [videoElement]);

  if (!videoElement) {
    return null;
  }

  return (
    <>
      {currentROI && (
        <>
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none z-30"
            style={{
              left: `${currentROI.x}px`,
              top: `${currentROI.y}px`,
              width: `${currentROI.w}px`,
              height: `${currentROI.h}px`
            }}
          />
          <div
            className="absolute text-xs bg-blue-500 text-white px-2 py-1 rounded pointer-events-none z-30"
            style={{
              left: `${currentROI.x}px`,
              top: `${Math.max(0, currentROI.y - 25)}px`
            }}
          >
            {Math.round(currentROI.w)} × {Math.round(currentROI.h)}
          </div>
        </>
      )}
      <div
        className="absolute inset-0 cursor-crosshair z-20"
        ref={(el) => {
          // Use this div as container if we can't find the parent
          if (el) {
            if (!containerRef.current) {
              containerRef.current = el.parentElement || el;
            }
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ pointerEvents: 'auto' }}
      />
      {currentROI && (
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm z-40 hover:bg-red-600 shadow-lg"
          style={{ pointerEvents: 'auto' }}
        >
          Clear Selection
        </button>
      )}
    </>
  );
};

export default ROISelector;


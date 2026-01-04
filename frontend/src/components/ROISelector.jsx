import React, { useState, useRef, useEffect } from 'react';

const ROISelector = ({ videoElement, onROIChange, initialROI = null }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentROI, setCurrentROI] = useState(initialROI || null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (initialROI) {
      setCurrentROI(initialROI);
    }
  }, [initialROI]);

  const getRelativeCoordinates = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
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
    if (!isDrawing || !videoElement || !containerRef.current) return;
    const pos = getRelativeCoordinates(e);
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate ROI bounds
    const x = Math.max(0, Math.min(startPos.x, pos.x));
    const y = Math.max(0, Math.min(startPos.y, pos.y));
    const w = Math.min(rect.width - x, Math.abs(pos.x - startPos.x));
    const h = Math.min(rect.height - y, Math.abs(pos.y - startPos.y));
    
    setCurrentROI({ x, y, w, h });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentROI && currentROI.w > 10 && currentROI.h > 10) {
      // Convert to video coordinates (account for video aspect ratio)
      if (onROIChange) {
        onROIChange(currentROI);
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

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {currentROI && (
        <>
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none z-10"
            style={{
              left: `${currentROI.x}px`,
              top: `${currentROI.y}px`,
              width: `${currentROI.w}px`,
              height: `${currentROI.h}px`
            }}
          />
          <div
            className="absolute text-xs bg-blue-500 text-white px-2 py-1 pointer-events-none z-10"
            style={{
              left: `${currentROI.x}px`,
              top: `${currentROI.y - 25}px`
            }}
          >
            {Math.round(currentROI.w)} × {Math.round(currentROI.h)}
          </div>
        </>
      )}
      <div
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {currentROI && (
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm z-20 hover:bg-red-600"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
};

export default ROISelector;


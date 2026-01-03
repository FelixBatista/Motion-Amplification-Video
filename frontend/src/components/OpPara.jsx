import React from 'react';

const OpPara = ({ parameters }) => {
  const params = parameters || {};
  var result = Object.keys(params).map((key) => [key, params[key]]);

  console.log(result);
  return (
    <div className="w-1/4 h-screen bg-dark p-4 text-white">
      <h2 className="text-xl font-sans text-center font-semibold mb-4">Output Parameters</h2>
      <ul>
        {result.length > 0 ? (
          result.map((param, index) => (
            <div key={index} className="mb-2">
              <p>{param[0]} : {param[1]}</p>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm">No parameters available</div>
        )}
      </ul>
    </div>
  );
};

export default OpPara;

import React from 'react';
import { BrowserRouter, Route, Routes  } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Upload from './pages/Upload';
import Output from './pages/Output';
import InputPage from './pages/InputPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/upload" element={<Upload/>} />
          <Route path="/output" element={<Output/>} />
          <Route path="/input" element={<InputPage/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

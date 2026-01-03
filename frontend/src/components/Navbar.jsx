import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle window resize
  const handleResize = () => {
    if (window.innerWidth >= 640) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-darker p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-lg">
        Logo
        </Link>
        <div className="lg:hidden">
          {/* Mobile Menu Button */}
          <button
            className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
            onClick={toggleMobileMenu}
          >
            ☰
          </button>
        </div>
        <div className="hidden lg:block space-x-4">
          <Link to="/" className="text-white font-sans hover:text-red-500">
            Home
            <span className="text-white font-sans text-lg ml-4">|</span>
          </Link>
          <Link to="/upload" className="text-white font-sans hover:text-red-500">
            Upload
            <span className="text-white text-lg font-sans ml-4">|</span>
          </Link>
          <Link to="/input" className="text-white font-sans hover:text-red-500">
            Input
            <span className="text-white text-lg font-sans ml-4">|</span>
          </Link>
          <Link to="/output" className="text-white font-sans hover:text-red-500">
            Output
            <span className="text-white text-lg font-sans ml-4">|</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 space-y-2">
          <Link to="/" className="block text-white hover:text-red-500">
            Home
          </Link>
          <Link to="/upload" className="block text-white hover:text-red-500">
            Upload
          </Link>
          <Link to="/input" className="block text-white hover:text-red-500">
            Input
          </Link>
          <Link to="/output" className="block text-white hover:text-red-500">
            Output
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

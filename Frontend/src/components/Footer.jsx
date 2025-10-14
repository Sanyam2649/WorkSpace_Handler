import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (section) => {
    // Implement navigation or external linking logic
    console.log(`Navigate to: ${section}`);
  };

  const handlePolicyClick = (policy) => {
    // Implement policy page navigation logic
    console.log(`Open policy: ${policy}`);
  };

  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          &copy; {currentYear} Your Company. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <button onClick={() => handleLinkClick('about')} className="hover:text-white">
            About
          </button>
          <button onClick={() => handleLinkClick('contact')} className="hover:text-white">
            Contact
          </button>
          <button onClick={() => handlePolicyClick('privacy')} className="hover:text-white">
            Privacy Policy
          </button>
          <button onClick={() => handlePolicyClick('terms')} className="hover:text-white">
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

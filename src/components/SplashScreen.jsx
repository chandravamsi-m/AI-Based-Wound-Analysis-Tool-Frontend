import React from 'react';
import './SplashScreen.css';
import logo from '../assets/logo.svg';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={logo} alt="Logo" className="splash-logo" />

        <div className="splash-text-group">
          <h1 className="splash-title">Wound Assessment Tool</h1>
          <p className="splash-subtitle">Hospital - Grade Diagnostics</p>
        </div>

        <div className="splash-loader"></div>
      </div>
    </div>
  );
};

export default SplashScreen;

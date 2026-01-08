import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import './IntroScreens.css';
import logo from '../assets/logo.svg';
import onboarding1 from '../assets/onboarding 1.png';
import onboarding2 from '../assets/onboarding 2.png';
import onboarding3 from '../assets/onboarding 3.png';

const IntroScreens = ({ onFinished }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Automated Wound Measurement",
      description: "Our AI algorithms automatically measure surface area and depth, reducing documentation time by 40%. Eliminate manual ruler errors and get precise clinical data instantly.",
      features: ["Instant contour detection", "Tissue type segmentation"],
      image: onboarding1
    },
    {
      title: "AI-Driven Measurement",
      description: "Our AI algorithms automatically calculates surface area and depth with 98% accuracy, removing subjectivity from your documentation and ensuring consistent longitudinal tracking.",
      features: ["Instant contour detection", "Tissue type segmentation"],
      image: onboarding2
    },
    {
      title: "Start Your First Assessment",
      description: "The AI is calibrated and ready. You can now upload wound imagery for instant analysis and documentation. Click below to begin.",
      features: ["System is secured and HIPAA compliant."],
      image: onboarding3
    }
  ];

  const currentStepData = steps[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onFinished();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="intro-screen">
      {/* Header */}
      <header className="intro-header">
        <div className="intro-header-logo-group">
          <img src={logo} alt="Logo" className="intro-header-logo" />
          <div className="intro-header-text">
            <h2 className="intro-header-title">Wound Assessment Tool</h2>
            <p className="intro-header-subtitle">Hospital - Grade Diagnostics</p>
          </div>
        </div>
        <div className="intro-skip" onClick={onFinished}>Skip Intro</div>
      </header>

      {/* Main Content */}
      <main className="intro-body">
        <div className="intro-card">
          <div className="intro-card-left">
            <img
              src={currentStepData.image}
              alt={currentStepData.title}
              className="intro-card-img"
            />
          </div>

          <div className="intro-card-right">
            <div className="intro-step-label">Step {step} of 3</div>
            <h1 className="intro-title">{currentStepData.title}</h1>
            <p className="intro-desc">{currentStepData.description}</p>

            <div className="intro-checklist">
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="intro-check-item">
                  <CheckCircle2 size={24} className="intro-check-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="intro-progress-container">
              <div className="intro-progress-track">
                <div
                  className="intro-progress-bar"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>

              <div className="intro-actions">
                <button
                  className="intro-btn-prev"
                  onClick={handlePrev}
                  style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                >
                  Previous
                </button>
                <button className="intro-btn-next" onClick={handleNext}>
                  {step === 3 ? "Get Started" : (
                    <>
                      Next Step <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntroScreens;

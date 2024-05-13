// src/components/Progress.js
import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const Progress = ({ progress }) => {
  return (
    <div className="progress-section text-center my-4">
      <h2>Current Progress: {progress}%</h2>
      <ProgressBar now={progress} label={`${progress}%`} />
    </div>
  );
};

export default Progress;

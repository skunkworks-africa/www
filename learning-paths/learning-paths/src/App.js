// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import Progress from './components/Progress';
import MainContent from './components/MainContent';
import './App.css';

function App() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="App">
      <Header />
      <Progress progress={progress} />
      <MainContent />
    </div>
  );
}

export default App;

// src/components/MainContent.js
import React from 'react';
import Module from './Module';

const modules = [
  { title: 'Introduction and PoX Best Practices', description: 'Description of the module...' },
  { title: 'Product Education', description: 'Description of the module...' },
  // Add more modules as needed
];

const MainContent = () => {
  return (
    <div className="main-content container">
      <section id="overview">
        <h2>Overview</h2>
        <p>This QRadar SIEM course helps you deliver Proof of Experience (PoX) engagements to clients.</p>
        <p>Total assets: 7 courses</p>
        <p>Total time to complete required training: 35.0 hours</p>
      </section>

      <section id="modules">
        <h2>Modules</h2>
        {modules.map((module, index) => (
          <Module key={index} title={module.title} description={module.description} />
        ))}
      </section>
    </div>
  );
};

export default MainContent;

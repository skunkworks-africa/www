import React from 'react';
import { Resources, GlobalPartner, Badge } from '@carbon/pictograms-react';
import './Achievements.css'; // Ensure this path is correct

function Achievements() {
  return (
    <section className="section" id="statistics">
      <h1>Our Achievements</h1>
      <div className="grid-container">
        <a href="./instructors.html" className="achievement-item">
          <div>
            <Resources aria-label="Instructors" className="achievement-icon" />
            <h3>+100 Instructors & Experts</h3>
          </div>
        </a>
        <a href="./partnerships.html" className="achievement-item">
          <div>
            <GlobalPartner aria-label="Partnerships" className="achievement-icon" />
            <h3>+40 Strategic Partnerships</h3>
          </div>
        </a>
        <a href="./courses.html" className="achievement-item">
          <div>
            <Badge aria-label="Courses" className="achievement-icon" />
            <h3>+1000 Courses Offered</h3>
          </div>
        </a>
      </div>
    </section>
  );
}

export default Achievements;

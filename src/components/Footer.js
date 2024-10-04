// src/components/Footer.js
import React from 'react';
import { Grid, Column } from '@carbon/react';

const Footer = () => (
  <footer className="bg-gray-100 py-8">
    <Grid>
      <Column lg={4} md={4} sm={4}>
        <p>&copy; 2024 Skunkworks. All rights reserved.</p>
      </Column>
      <Column lg={4} md={4} sm={4}>
        <p>26 Second Avenue, Germiston, Gauteng. South Africa 1401</p>
      </Column>
      <Column lg={4} md={4} sm={4}>
        <a
          href="https://blog.skunkworks.africa/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-60"
        >
          Visit our blog
        </a>
      </Column>
    </Grid>
  </footer>
);

export default Footer;
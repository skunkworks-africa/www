// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react';
import { UserAvatar } from '@carbon/icons-react';

const Header = () => (
  <CarbonHeader aria-label="Skunkworks">
    <SkipToContent />
    <HeaderName element={Link} to="/" prefix="">
      Skunkworks
    </HeaderName>
    <HeaderNavigation aria-label="Skunkworks">
      <HeaderMenuItem element={Link} to="/training">Training</HeaderMenuItem>
      <HeaderMenuItem element={Link} to="/services">Services</HeaderMenuItem>
      <HeaderMenuItem element={Link} to="/careers">Careers</HeaderMenuItem>
      <HeaderMenuItem element={Link} to="/contact">Contact</HeaderMenuItem>
    </HeaderNavigation>
    <HeaderGlobalBar>
      <HeaderGlobalAction aria-label="User Avatar" tooltipAlignment="center">
        <UserAvatar size={20} />
      </HeaderGlobalAction>
    </HeaderGlobalBar>
  </CarbonHeader>
);

export default Header;
import React from 'react';
import GoogleMapReact from 'google-map-react';

const MapMarker = ({ text }) => <div className="map-marker">{text}</div>;

const GoogleMap = () => {
  const defaultProps = {
    center: {
      lat: -26.230694, // Replace with Skunkworks' actual coordinates
      lng: 28.185194
    },
    zoom: 11
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        <MapMarker
          lat={defaultProps.center.lat}
          lng={defaultProps.center.lng}
          text="Skunkworks"
        />
      </GoogleMapReact>
    </div>
  );
};

export default GoogleMap;
import React from 'react';
import '../styles/Loader.css';

export default function Loader() {
  return (
    <div className="Loader">
      <div className="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    </div>
  );
}
import React from 'react';
import '../styles/ProfileImage.css';

export default function ProfileImage({ src }) {
  return (
    <div className="ProfileImage">
      <img src={src} className="img-responsive" />
    </div>
  );
}
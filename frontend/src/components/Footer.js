/**
 * Simple bootstrap footer to fill the space
 */
import React from 'react';
import {CREATOR_PROFILE_LINK} from '../constants';

const footerStyles = {
  padding: '20px',
  marginTop: '0px',
};

const Footer = () => {
  return (
    <footer style={footerStyles}>
      <hr/>
      <div className="container">
        <p>
           Thank you to everyone who made it possible. I hope it's useful to someone.
           Code contributed by <a href={CREATOR_PROFILE_LINK}>computistic</a>
        </p>
        <p> 
          If you find a bug feel free to open an issue on Github. Additional contributions are welcomed.
        </p>
        <small>Code is licensed under good ol' <strong>MIT LICENSE.</strong></small>
      </div>
    </footer>
  );
};

export default Footer;
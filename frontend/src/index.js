import React from 'react';
import ReactDOM from 'react-dom';

import firebase from './lib/firebaseInit';
import App from './components/App';

import 'bootstrap/dist/css/bootstrap.min.css';

const { NODE_ENV } = process.env;

if (NODE_ENV === 'development') {
  window.firebase = firebase;
} else if (NODE_ENV === 'production') {
  console.log('PRODUCTION MODE!!!!');
}

ReactDOM.render(
  <App />,
  root
);

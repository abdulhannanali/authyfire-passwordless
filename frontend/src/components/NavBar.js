/**
 * NavBar.js
 * 
 * Simplistic NavBar as a starting point for the user
 * Also allows us to show some information regarding the project to the user
 */
import React, { Component } from 'react';
import { GITHUB_REPO_LINK, FIREBASE_LINK, AUTHY_LINK } from '../constants';

export default class NavBar extends Component {

  render() {
    return (
      <nav className="navbar navbar-default">
        <div className="container">
          <div className="navbar-header">
            <a href="/" className="navbar-brand">AuthyFire</a>
          </div>
          <ul className="nav navbar-nav navbar-right">
            <li className="bg-success">
              <a href={GITHUB_REPO_LINK}>Fork this repo on Github</a>
            </li>
            <li className="bg-warning">
              <a href={FIREBASE_LINK}>Firebase</a>
            </li>
            <li className="bg-danger">
              <a href={AUTHY_LINK}>Authy</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}
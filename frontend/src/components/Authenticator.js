/**
 * Authenticator.js
 * Authenticator is the Component that deals with displaying Authentication related UI
 */
import React, { Component } from 'react';

import Loader from './Loader';
import PhoneControl from './PhoneControl';
import VerifyControl from './VerifyControl';

import { GITHUB_REPO_LINK } from '../constants';

import '../styles/Authenticator.css';

export default class Authenticator extends Component {
  constructor() {
    super();
    this.state = { token: '', showError: false };
  }

  render() {
    let loader, inputControl, errorAlert, authenticatorHeading;

    loader =
    inputControl =
    errorAlert =
    authenticatorHeading = null;

    const { 
      phoneId, loading, tokenSent, 
      verified, 
      countryCode, 
      phoneNumber, 
      setPhone,
      setToken,
      error,
      authOperations,
      token,
      resetLoginState,
      resendToken,
    } = this.props;

    if (loading) {
      authenticatorHeading = 'Loading...';
      loader = <Loader />;
    } else if (!tokenSent) {
      authenticatorHeading = 'Send Authy Token';
      inputControl = (
        <PhoneControl requestToken={authOperations.requestToken} 
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          setPhone={setPhone}
          error={error}
        />
      );
    } else if (!verified) {
      authenticatorHeading = 'Verify the token';
      inputControl = (
        <VerifyControl
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          phoneId={phoneId}
          requestToken={authOperations.requestToken}
          verifyToken={authOperations.verifyToken}
          setToken={setToken}
          token={token}
          resetLoginState={resetLoginState}
          error={error}
          tokenSent={tokenSent}
          resendToken={resendToken}
      />
      );
    }

    // Simple Error Alert to display Errors
    // This can be replaced with a more descriptive Error handling mechanism in the future
    // Eventually, separating this into it's component
    // Not satisfied with this method of displaying errors
    if (error) {
      errorAlert = (
        <div className="alert alert-danger">
          { error && error.message }
        </div>
      );
    }
    
    return (
      <div className="Authenticator">
          <div className="row">
            <div className="col-sm-12">
              <div className="text-center">
                <div className="page-header">
                  <h1>
                    <span>Go Passwordless with </span>
                    <span className="firebase">Firebase Functions</span>
                    <span> and </span> 
                    <span className="authy">Authy</span>
                  </h1>
                  <h3>
                    <a target="blank" href={GITHUB_REPO_LINK}>Learn more and checkout the code on Github</a>
                  </h3>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-offset-3 col-md-6 col-sm-12">
              <div className="container-fluid">
                <div className="panel panel-default">
                  <div className="panel-body">
                    <div className="page-header AuthHeading">
                      <h1>{authenticatorHeading}</h1>
                    </div>
                    { errorAlert }
                    { loader }
                    { inputControl }
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}
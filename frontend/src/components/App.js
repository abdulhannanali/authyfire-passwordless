import React, { Component } from 'react';
import firebase from 'firebase';

import '../styles/App.css';
import { requestAuthyToken, verifyAuthyToken } from '../lib/authyRequests'; 

import NavBar from './NavBar';
import Authenticator from './Authenticator';
import ProfileView from './ProfileView';
import Loader from './Loader';
import Footer from './Footer';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.unsubscribeAuthListener = () => {};
    
    this.state = {
      // Determines if the Firebase app has loaded completely or not
      appLoad: false,

      phoneNumber: '',
      countryCode: '',
      token: '',
      
      // ID of the Phone to be used for verifying the token after getting it
      phoneId: '',

      // Needed to show a generic loading bar between transition through each state
      loading: false,

      // Fields applicable for sending the first token to the user
      tokenSent: false,
      tokenFailed: false,

      // `true` if the token was sent again
      resendToken: false,
      verified: false,

      loggedIn: false,

      // error message to be displayed to the user
      error: undefined,
    };

    this.setPhoneNumber = this.setPhoneNumber.bind(this);
    this.setToken = this.setToken.bind(this);
    this.requestToken = this.requestToken.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.resetLoginState = this.resetLoginState.bind(this);
  }

  /**
   * ComponentDidMount
   * Listen to all the firebase events we need to 
   * make changes to the state on Root Component
   */
  componentDidMount() {
    this.unsubscribeAuthListener = firebase.auth().onAuthStateChanged(user => {
      if (!user || user === null) {
        this.setState({ loggedIn: false, appLoad: true });
      } else {
        this.setState({ loggedIn: true, appLoad: true });
      }
    });
  }

  /**
   * componentWillMount hook is used to unlisten to all
   * the events in the application we don't need
   */
  componentWillUnmount() {
    // Unsubscribing to Auth Listener here in this application
    this.unsubscribeAuthListener();
  }

  /**
   * Resets the login state to start from the beginning
   * Useful to restart the login process, if we need to do it
   * 
   * Optionally, resets the state of the following fields too
   * - countryCode
   * - phoneNumber
   * - phoneId
   */
  resetLoginState(resetPhone) {
    const newState = {
      tokenSent: false,
      resendToken: false,
      verified: false,
      error: undefined,
      token: '',
    };

    if (resetPhone) {
      newState.countryCode =
      newState.phoneNumber =
      newState.phoneId = '';
    }

    this.setState(newState);
  }
 
  /**
   * Sets the Phone Number in the state
   * In case of `undefined` parameters the state remains unchanged
   * 
   * @param {String} countryCode Country Code of Number
   * @param {String} phoneNumber Part that comes after the country code :smile: 
   */
  setPhoneNumber(countryCode, phoneNumber) {
    const newState = {};
    
    if (countryCode) {
      newState.countryCode = countryCode;
    }

    if (phoneNumber) {
      newState.phoneNumber = phoneNumber;
    }

    return this.setState(newState);
  }

  /**
   * Sets the token in the state.
   * @param {String} token Verification token user has entered
   */
  setToken(token) {
    this.setState({ token });
  }

  /**
   * Requests the token from the Cloud function
   * @return {Promise<Object>} Axios promise for the request sent
   */
  requestToken() {
    const { countryCode, phoneNumber } = this.state;
    this.setState({ loading: true, tokenSent: false, error: undefined, tokenIgnored: false, tokenFailed: false });
    return requestAuthyToken(countryCode, phoneNumber)
      .then(({ data }) => {
        const { success, ignored, message, phoneId } = data;
        if (success) {
          this.setState({ tokenSent: true, loading: false, ignored, phoneId });
        } else {
          this.setState({ loading: false, error: { message }, tokenFailed: true });
        }
      })
      .catch(error => {
        this.setState({ tokenSent: false, loading: false, tokenFailed: true, error });
      });
  }

  /**
   * Verifies the token sent to the user
   * @return {Promise<Object>} Axios promise resolves with response data in case of succeess
   */
  verifyToken() {
    const { token, phoneId } = this.state;
    this.setState({ loading: true, error: undefined });
    return verifyAuthyToken(phoneId, token)
      .then(({ data }) => {
        const { success, customToken, message } = data;
        if (success) {
          this.loginUser(customToken, true, false);
        } else {
          this.setState({ error: { message }, loading: false, verificationFailed: true });
        }
      })
      .catch((error) => {
        const { response, message } = error;
        let errorObj;

        if (!response) {
          errorObj = { message };
        } else {
          let message;

          if (response.data.code === 'unexpected-error') {
            message = 'Something bad happened on our side :\'( , Please try again!';
          } else {
            message = response.data.message;
          }

          errorObj = { message };
        }

        this.setState({ error: errorObj, verificationFailed: true, loading: false });
      });
  }

  /**
   * Logs in the user using custom token 
   */
  loginUser(customToken, verified, loading) {
    return (
      firebase.auth().signInWithCustomToken(customToken).then(user => {
        console.log('So, we are finally in!!!! <3 <3 <3 ');
        this.setState({ verified, loading, customToken });
        this.resetLoginState();
      }).catch(error => {
        console.error('Error occured while logging in');
        const errorObj = { message: 'Unexpected error occured while logging you in!!!' };
        this.setState({
          loading: false,
          tokenSent: false,
          resendToken: false,
          error: errorObj,
        });
      })
    );
  }

  render() {
    const { loggedIn, appLoad, customToken, ...authState } = this.state;
    const { setPhoneNumber: setPhone, requestToken, verifyToken, setToken, resetLoginState } = this;
    const authOperations = { requestToken, verifyToken };

    let loggedOutView = null;
    let loggedInView = null;
    let appLoadView = null;

    if (!appLoad) {
      appLoadView = (
        <div className="row">
          <div className="col-sm-12">
            <Loader />
          </div>
        </div>
      );
    } else if (!loggedIn) {
      loggedOutView = (
        <Authenticator 
          { ...authState }
          authOperations={authOperations}
          setToken={setToken}
          setPhone={setPhone}
          resetLoginState={resetLoginState}
        />
      );
    } else if (loggedIn) {
      loggedInView = <ProfileView customToken={customToken} />;
    }

    return (
      <div className="App">
        <NavBar />
        <div className="container-fluid">
          { appLoadView }
          { loggedOutView }
          { loggedInView }
        </div>
        <Footer />
      </div>
    );
  }
}
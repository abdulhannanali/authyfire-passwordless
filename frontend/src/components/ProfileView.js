import React, { Component } from 'react';
import firebase from 'firebase';

import '../styles/ProfileView.css';

export default class ProfileView extends Component {
  constructor(props) {
    super(props);
    this.placeholderValue = 'This value is not available';
  }

  /**
   * Event handler evoked when clicking LogoutButton
   */
  onLogoutClick(event) {
    event.preventDefault();
    firebase.auth().signOut();
  }

  /**
   * Deletes the account in order for people to protect their information
   */
  onDeleteClick(event) {
    event.preventDefault();
    firebase.auth().currentUser.delete()
      .catch(error => {
        console.error(error);
        if (error.code === 'auth/requires-recent-login') {
          alert('You need to logout and login again, in order to delete your account');
        } else {
          alert('Unable to delete your account, check out logs for more details');
        }
      });
  }
  
  render() {
    const { onLogoutClick, placeholderValue, onDeleteClick } = this;
    const { customToken } = this.props;
    const { uid, email, emailVerified, displayName, photoURL } = firebase.auth().currentUser;

    const successPanel = (
      <div className="alert alert-success">
        Yayyyy! You have successfully <strong>logged in</strong>!
      </div>
    );

    return (
      <div className="row">
        <div className="col-sm-12">
          <div className="ProfileView-panel">
            <div className="container">
              { successPanel } 
              <div className="page-header">
                <h1>User Dashboard </h1>
                <h3>Here you can checkout the details about the user</h3>
                <LogoutButton onClick={onLogoutClick} />
                <button className="btn btn-primary" onClick={onDeleteClick}>Delete Account</button>
              </div>
              <div className="UserInfo">
                <div className="row">
                  <div className="col-sm-12">
                    <h3>User ID</h3>
                    <p>{uid}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <h3>Custom token</h3>
                    <p>Custom token used to login within the application</p>
                    <div className="well well-lg TokenBox">
                      { customToken || placeholderValue }
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <h3>Other information from user <strong>{uid}</strong></h3>
                    <p>This information is not set, right now, as we logged in with number</p>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th scope="row">Email</th>
                          <td>{ email || placeholderValue }</td>
                        </tr>
                        <tr>
                          <th scope="row">Email Verified</th>
                          <td>{ emailVerified || 'Not available'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Display name</th>
                          <td>{ displayName || placeholderValue }</td>
                        </tr>
                        <tr>
                          <th scope="row">Photo URL</th>
                          <td>{ photoURL || placeholderValue }</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * LogoutButton
 * Button Specifically designed to handle the logout functioanlity
 */
const LogoutButton = (props) => (
  <a href="#" className="btn btn-danger" {...props}>Logout</a>
);
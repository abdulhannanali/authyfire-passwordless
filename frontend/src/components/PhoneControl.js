/**
 * PhoneControl.js
 * Phone Control is the Input Component used to enter the Country Code and Phone Number 
 * in order to request Authy Component
 *
 */

import React, { Component } from 'react';
import '../styles/PhoneControl.css';

export default class PhoneControl extends Component {
  setCountryCode(event) {
    this.props.setPhone(event.target.value);
  }

  setPhoneNumber(event) {
    this.props.setPhone(undefined, event.target.value);
  }

  render() {
    const {
      countryCode = '', phoneNumber = '', requestToken, error,
    } = this.props;
    let formGroupClasses = 'form-group';

    if (error) {
      formGroupClasses += ' has-error';
    }

    return (
      <div className="PhoneControl">
        <div className={formGroupClasses} style={{ marginTop: '20px'}}>
          <div className="row">
            <div className="col-md-3 col-sm-4">
              <div className="form-group">
                <label className="control-label" htmlFor="countryCode">Country Code</label>
                <div className="input-group">
                  <div className="input-group-addon">+</div>
                  <input type="text"
                        className="form-control"
                        id="countryCode"
                        value={countryCode}
                        placeholder="1"
                        onChange={this.setCountryCode.bind(this)}/>
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <div className="form-group">
                <label className="control-label" htmlFor="phoneNumber">Phone number</label>
                <input type="text" 
                      required
                      className="form-control" 
                      id="phoneNumber" 
                      value={phoneNumber} 
                      onChange={this.setPhoneNumber.bind(this)}
                      placeholder="301-254-8888"/>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 send-button">
              <button
                className="btn btn-defualt btn-primary btn-block btn-success btn-lg" 
                type="button"
                onClick={requestToken}>
                  Send Token
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
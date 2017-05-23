import React, { Component } from 'react';
import '../styles/VerifyControl.css';

export default class VerifyControl extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.tokenChange = this.tokenChange.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
  }

  verifyToken(event) {
    console.log('Token verification initiaited');
    this.props.verifyToken();
  }

  tokenChange(event) {
    this.props.setToken(event.target.value);
  }

  /**
   * Resets the login form onclicked
   */
  onResetClick(event) {
    event.preventDefault();
    const { resetLoginState } = this.props;
    resetLoginState(false);
  }
  
  render() {
    const { countryCode, phoneNumber, token, tokenSent, resendToken, error } = this.props;
    const { verifyToken, tokenChange, onResetClick } = this;
    let successPanel = null;

    if (!error) {
      successPanel = (
      <TokenSuccessPanel
        resendToken={resendToken} 
        tokenSent={tokenSent}
        countryCode={countryCode}
        phoneNumber={phoneNumber} />);
    }

    return (
      <div className="VerifyControl">
        { successPanel }
        <div className="row">
          <div className="col-sm-12">
            <h3 className="PhoneInfo">+{countryCode}-{phoneNumber}</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="form-inline VerificationInput">
              <label htmlFor="verificationToken">Verification Token</label><br/>
              <div className="form-group">
                <input 
                  id="verificationToken" 
                  type="text"
                  className="form-control" 
                  maxLength="7"
                  placeholder="123456"
                  value={token}
                  onChange={tokenChange}
                />
              </div>
              <button 
                className="btn btn-primary"
                type="button" 
                style={{ marginLeft: '10px'}}
                onClick={verifyToken}>
                  Login!
              </button>
            </div>
            <hr/>
            <div className="row Reenter">
              <div className="col-sm-12">
                <a className="btn btn-info" onClick={onResetClick}>Enter the number again!</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const TokenSuccessPanel = ({ tokenSent, resendToken, countryCode, phoneNumber }) => {
  let tokenHeading;
  const phone = <strong>+{countryCode}-{phoneNumber}</strong>;

  if (resendToken) {
    tokenHeading = <p>A token has been resent to {phone}</p>;
  } else {
    tokenHeading = <p>A token has been sent to {phone}</p>;
  }

  return (
    <div className="alert alert-success">
      {tokenHeading}
    </div>
  );
};
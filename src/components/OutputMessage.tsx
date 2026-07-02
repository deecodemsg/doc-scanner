import React, { Component } from 'react';

export default class OutputMessage extends Component {
  render() {
    return (
      <div id="DWTdivMsg" className="clearfix">
        <span className="lblMessage">Message:</span>
        <br />
        <div
          id="DWTemessage"
          className="message"
          onDoubleClick={(evt) => {
            const el = evt.target as HTMLDivElement;
            el.innerHTML = '';
          }}
        />
      </div>
    );
  }
}

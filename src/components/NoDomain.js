import React, { PureComponent } from "react";

import "../assets/CloneFormPopup.css";

export default class NoDomain extends PureComponent {
  constructor(props) {
    super();
    this.state = {};
  }

  componentWillReceiveProps(newProps) {}

  componentDidMount() {
    // console.log(this.state.coinList)
  }

  toggle = (index) => {
    let collapse = "isOpen" + index;

    this.setState((prevState) => ({ [collapse]: !prevState[collapse] }));
  };

  render() {
    return (
      <div className="main-Popup wallet-Popup" id="NoDomain">
        <div className="container-Grid">
          <div className="LiProTitle01">{`There is no SubDomain '${this.props.subDomainName}' please check spelling`}</div>
          <div className="ppAboutText01">
            Tempor duis consectetur ex dolore velit irure elit eiusmod
            consectetur dolor laboris. Consequat deserunt occaecat non deserunt
            magna exercitation Lorem nulla irure id anim proident ex culpa.
          </div>
        </div>
        {/* 
        <a
          href="javascript:void(0);"
          onClick={() => {
            this.props.closePopup("NoDomain");
            this.clearPreview();
          }}
          className="close-Icon"
        ></a> */}
      </div>
    );
  }
}

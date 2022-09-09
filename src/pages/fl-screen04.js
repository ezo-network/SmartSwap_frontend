import React, { PureComponent, lazy, Suspense } from "react";
import _ from "lodash";
import notificationConfig from "../config/notificationConfig";
import styled from 'styled-components';
import Lineimg from "../assets/freelisting-images/line01.png";
import BridgeApiHelper from "../helper/bridgeApiHelper";
const $ = window.$;

export default class Screen4 extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      selectedNetworks: [],
      filteredNetwork: "",
      bridges: []
    };
  }

  async componentDidMount() {
    await this.getBridges();
  }
  
  filterNetworks = (network) => {
    this.setState({ filteredNetwork: network });
  };

  selectNetwork = (networkId) => {
    if(this.state.selectedNetworks.includes(networkId)){
      this.setState({selectedNetworks: this.state.selectedNetworks.filter(function(network) { 
        return network !== networkId
      })});
    } else {
      this.setState(prevState => ({
        selectedNetworks: [...prevState.selectedNetworks, Number(networkId)]
      }));
    }
  }


  setDestinationNetworks(){
    if(this.state.selectedNetworks.length === 0){
      notificationConfig.error('Please select a network.');
      return;
    }
    this.props.onDestinationNetworksSelected(this.state.selectedNetworks);
  }

  async getBridges(){
    try {
      const {
        response, 
        error,
        code
      } = await BridgeApiHelper.getBridges();
  
      if(code === 200){
        this.setState({
          bridges: response
        });
      } else {
        console.error(error)
      }
    } catch (error){
      console.error(error)
    }
  }

  render() {
    let finalFilteredNetworks = [];
    const filteredNetworks = this.props.networks.filter(network => {
      if(network.name.match(new RegExp(this.state.filteredNetwork, "i"))){
        return network;
      }
    });

    filteredNetworks.forEach(network => {
      if(Number(network.chainId) !== Number(this.props.selectedSourceTokenChainId)){
        const bridge = _.find(this.state.bridges, { chainId: network.chainId });
        if(bridge !== undefined){
          if(this.state.selectedNetworks.includes(network.chainId)){
            network['selectedNetwork'] = true;
          } else {
            network['selectedNetwork'] = false;
          }
          finalFilteredNetworks.push(network);
        }
      }
    });

    return (
      <>
        <main id="main" className="smartSwap">
          <div className="main">
            <MContainer>
              <CMbx>

                <ProgressBar> 
                  <span style={{ width: '75%' }}></span> 
                </ProgressBar>
                
                <ProGTitle01> 
                  <i>3</i> Select the EVM destination chains
                </ProGTitle01>
                
                <ProInputbx> 
                  <input onChange={e => this.filterNetworks(e.target.value)} type="text" placeholder="Search chain" value={this.state.filteredNetwork}/>
                </ProInputbx>

                <ProICOMbx01>
                  <ProICOMbx02>
                    {finalFilteredNetworks.length > 0 && finalFilteredNetworks.map(function(network, i){
                      return <ProICOSbx01 className={"md-checkbox"} key={i}>
                        <input
                          type="checkbox"
                          id={'list-item-' + i}
                          name={network.name}
                          checked={network.selectedNetwork}
                          onChange={e => this.selectNetwork(network.chainId)}
                        />
                        <label htmlFor={'list-item-' + i}>
                          <img src={window.location.href + '/images/free-listing/chains/' + ((network.icon).toString()).toLowerCase()} /> {network.name}
                        </label>
                      </ProICOSbx01>
                    }.bind(this) )}
                  </ProICOMbx02>

                  { finalFilteredNetworks.length == 0 && (
                    <p>NO BRIDGE FOUND ON ANY DESTINATION CHAIN</p>
                  )}

                </ProICOMbx01>
                
                <BtnMbox>
                  <button onClick={() => this.props.onBackButtonClicked(2)} className="Btn02"> <i className="fas fa-chevron-left"></i> Back</button>
                  <button onClick={() => this.setDestinationNetworks()} className="Btn01"> NEXT STEP</button>
                </BtnMbox>

              </CMbx>
            </MContainer>

          </div>
        </main>
      </>
    );
  }
}

const FlexDiv = styled.div`
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
`;

const MContainer = styled(FlexDiv)` 
  width:100%; max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  margin-top:90px;
`
const ProgressBar = styled.div`
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:55px;

    span{ display:inline-block; height:4px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5);  background-color:#91dc27; border-radius:0 2px 2px 0;}
`

const ProGTitle01 = styled(FlexDiv)` 
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; 
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px;  } 
`
const ProInputbx = styled(FlexDiv)`
    width:100%;

    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400; }
`
const ProICOMbx01 = styled.div` width:100%; `
const ProICOMbx02 = styled(FlexDiv)`
    align-items:flex-start; justify-content: flex-start; margin:30px -18px 0 -18px;
`
const ProICOSbx01 = styled.div`
  width:calc(25% - 36px); margin:0 18px 30px 18px; background-color:#21232b; height:60px; border:0px; outline:none; padding:0;
  display: flex; align-items: center; justify-content: flex-start;
  /* :hover{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  } 
  &.selected{  -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  } */

  input[type="checkbox"]:checked+label{ -webkit-box-shadow: 0 0 10px 1px rgba(145,220,39,0.5); box-shadow: 0 0 10px 1px rgba(145,220,39,0.5);  }
  label{ width:100%; display:block; line-height:60px; margin-left:0px; padding-left:52px; display: flex;  align-items: center;  justify-content: flex-start; font-size:14px; color:#ffffff;   img{margin:-3px 12px 0 0; }


}

  label:before{ background: transparent;  border: 2px solid #aaaaaa; left: 13px;  top: 18px;}
  input[type="checkbox"]:checked+label:after{  top: 18px; width: 18px; height: 10px; left: 19px;}
  input[type="checkbox"]:checked+label:before{ border:2px solid #aaaaaa}



`
const ProICOSbx02 = styled(FlexDiv)`
  width:50%; padding:0 18px; justify-content:flex-start; font-size:14px; font-weight:400; color:#fff;
  img{ margin-right:15px;}
  &:nth-child(01){ background-image:url(${Lineimg}); background-repeat:no-repeat; background-position:right 50%;} 
`
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px;

  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}

  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}

`







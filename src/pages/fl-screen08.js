import React, { PureComponent, lazy, Suspense } from "react";
import styled from 'styled-components';
import BridgeApiHelper from "../helper/bridgeApiHelper";
import notificationConfig from "../config/notificationConfig";
const $ = window.$;

export default class Screen8 extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      emailAddress: null,
      emailAdded: false
    };
  }

  componentDidMount() {
    this.getEmailStatus(true);
  }

  setEmailAddressHandler(event){
    this.setState({
      emailAddress: event.target.value
    })
  }

  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  getEmailStatus = async(init = false) => {
    try {
      const {response, error, code} = await BridgeApiHelper.getEmailStatus(this.props.accountAddress);

      if(code === 200){
        this.setState({
          emailAdded: true,
          emailAddress: response.emailAddress
        });

        if(init === false){

          if(response.instructionSent === true){
            notificationConfig.info(`Instructions sent on ${response.emailAddress} email address`);
          } else {
            notificationConfig.info(`Instructions will be send on ${response.emailAddress} email address shortly`);
          }
          
          this.props.onEmailAddressExist();
        }


      } else if(code === 404){
        if(init === false){
          if(this.state.emailAddress !== null){
            if(this.isValidEmail(this.state.emailAddress)){
              await this.addEmailAddress();
              await this.getEmailStatus();
            } else {
              notificationConfig.error(`Invalid email address provided.`);
            }
          } else {
            notificationConfig.error(`Please provide an email address.`);          
          }
        }
      } else {
        notificationConfig.error(error);        
      }

    } catch(err){
      console.error(err)
    }
  }

  addEmailAddress = async() => {
    try {
      await BridgeApiHelper.addEmailAddress(this.props.accountAddress, this.state.emailAddress);
    } catch(err){
      console.error(err)
    }
  }

  render() {
    return (
      <>
        <main id="main" className="smartSwap">
          <div className="main">
            <MContainer>
              <CMbx>
                <ProgressBar> <span style={{ width: '33.33%' }}></span> </ProgressBar>
                <ProGTitle01>Gain access to serve-side code and instructions</ProGTitle01>
                <ProInputbx>
                  <label htmlFor="input01">Email</label>
                  <input readOnly={this.state.emailAdded} onChange={e => this.setEmailAddressHandler(e)} defaultValue={this.state.emailAddress} type="text" id="input01" />
                </ProInputbx>
                <BtnMbox>
                  <span></span>
                  <button onClick={() => this.getEmailStatus()} className="Btn01"> NEXT STEP</button>
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
  width: calc(100% - 40px); max-width:1360px; margin:0 auto;
`
const CMbx = styled(FlexDiv)`
  width:100%;  margin-top:90px; margin-bottom: 40px;
  @media (max-width: 991px){
		margin-top: 60px;
	}
`
const ProgressBar = styled.div`
width:100%; height:4px; background-color: #303030; display:flex ; margin-bottom:55px;
    span{ display:inline-block; height:4px; -webkit-box-shadow: 0 0 15px 5px rgba(145,220,39,0.5); box-shadow: 0 0 15px 5px rgba(145,220,39,0.5);  background-color:#91dc27; border-radius:0 2px 2px 0;}
    @media screen and (max-width: 640px) {
      margin-bottom: 40px;
    }
`

const ProGTitle01 = styled(FlexDiv)` 
    font-size:24px; color:#ffffff; font-weight:700; justify-content:flex-start; width:100%; margin-bottom:50px; 
    i{ display:flex; font-style:normal; width:41px; height:41px; border:2px solid #fff; align-items:center; justify-content:center; margin-right:28px;  } 
`
const ProInputbx = styled(FlexDiv)`
    width:100%;
    label{width:100%; font-size:18px; font-weight:700; margin-bottom:18px;}
    input{ width:100%; display:block; border:2px solid #000; border-radius:0; background-color:#21232b; padding:20px; font-size:16px; color:#ffffff; font-weight:400; }
` 
const BtnMbox = styled(FlexDiv)`
  border-top:1px solid #303030;  width:100%; margin-top:30px; justify-content: space-between; padding-top:48px;
  .Btn01{ color:#fff; background-color:#0d0e13; width:100%; max-width:430px; text-align:center; padding:18px 15px; border:2px solid #91dc27; font-size:18px; font-weight:700; margin-bottom:20px; -webkit-box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); box-shadow: 0 0 12px 5px rgba(145,220,39,0.5); :hover{ background-color:#91dc27;}}
  .Btn02{ background-color:transparent; color:#a6a2b0; border:0; font-size:14px; font-weight:400; :hover{ color:#91dc27;}}
`
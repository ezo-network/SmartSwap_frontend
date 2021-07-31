import React, { PureComponent, lazy, Suspense } from "react";
import { Link, Redirect } from "react-router-dom";
import web3Js from 'web3';
import web3Config from "../config/web3Config";
import Validation from "../helper/validation";
import FrozenContract from "../helper/frozenContract";
import notificationConfig from "../config/notificationConfig";
import { LoopCircleLoading } from 'react-loadingg';
import Backdrop from '@material-ui/core/Backdrop';

export default class Freeze extends PureComponent {

    constructor(props){
        super();
        this.state = {
            web3:null,
            web3Check:false,
            address:'0x0000000000000000000000000000000000000000',
            nativeBalance:0,
            currency:'ETH',
            btnClick:false,
            nativeValue:0,
            nativePrice:0,
            vsCurrency:'',
            sendCurrency:"",
            recivedValue:0,
            frozenToken:null,
            freezeLoading:false,
            vsPrice:0,
            selectImg:'',
            recivedImg:'',
        }
    }

    async init(){
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        this.setState({web3Check:true,web3:web3,address:web3Config.getAddress(),
            selectImg:(networkId === 97 || networkId === 56) ? "imgs/pureBnb.png" :"imgs/pureEth.png",
            recivedImg:(networkId === 97 || networkId === 56) ? "imgs/frozeBnb.png" :"imgs/frozeEth.png"});

        if(web3 === null) 
            return 0 

        let balance = await web3.getSigner(0).getBalance();
        balance = web3Js.utils.fromWei(balance._hex)-0.1;

        let frozenToken = new FrozenContract(web3Config.getWeb3(),networkId);
        let nativePrice = await frozenToken.getPrice();
        let nativeValue =  balance * nativePrice;
        
        this.setState({
            nativeBalance:balance.toFixed(4),
            nativeValue:nativeValue,
            nativePrice:nativePrice,
            currency: (networkId === 97 || networkId === 56) ? "BNB" :"ETH",
            frozenToken:frozenToken,
            vsPrice:100
        })
    }

    async componentDidMount(){
        this.init();       
    }

    async recivedToken(e){
        if((Number(e.target.value)) <= Number(this.state.nativeBalance))
            this.setState({ sendCurrency: e.target.value },()=>{
                let {nativePrice, sendCurrency ,vsPrice} = this.state;
                let recivedValue = (sendCurrency * nativePrice)/vsPrice;
                this.setState({recivedValue:recivedValue});
            })
        else
            notificationConfig.error("Enter below your max value")
    }

    async freezeToken(){
        
        let {sendCurrency,frozenToken} = this.state;
        if(sendCurrency === "" || sendCurrency === 0){
            notificationConfig.error("Enter value to freeze")
            return;
        }

        frozenToken.getFrozenToken(web3Js.utils.toWei(sendCurrency),()=>{
            this.setState({freezeLoading:true});
        },()=>{
            this.init();
            this.setState({freezeLoading:false});
            notificationConfig.success("Freeze Token Success");
        })
    }


    render() {

        if(this.state.web3 === null && this.state.web3Check)
            return <Redirect to="/"></Redirect>
        
        let address = this.state.address;
            
        return (
            
            <div>
                {this.state.freezeLoading&&
                <Backdrop style={{zIndex:'15',opacity:'1',visibility:'visible'}}>
                    <LoopCircleLoading/>
                    <p className="loadingText">Transaction Pending ..</p>
                </Backdrop>
                }

                <div className="firstpage show">
                <header>
                    <div className="logo">
                        <img src="imgs/logo.png" alt="" />
                    </div>
                    <div className="menubar">
                        <a href="#">
                            <img src="imgs/ellipse.png" alt="" />
                            <span>{address.substring(0,4)+" ... "+address.substring(38,42)}</span>
                        </a>
                    </div>
                </header>
                <div className="form-content" >
                    <div className="content">
                        <h1>FREEZE CRYPTO VOLATILITY WITH ONE CLICK</h1>
                        <p>
                            Send cryptocurrency to the freeze crypto smart contract to receive frozen tokens such as f/ETH and f/BNB. When frozen are returned to the smart contract, you receive back the exact same USD value
                        </p>
                    </div>
                    <div className="form-freeze">
                        <form onSubmit={(e)=>{e.preventDefault()}} className="">
                            <div className="input-group">
                                <input type="text" placeholder="send" value={this.state.sendCurrency} onKeyDown={(e)=> Validation.floatOnly(e)} onChange={this.recivedToken.bind(this)}  />
                                <div className="cta show">
                                    <img src={this.state.selectImg} alt="" />
                                    {/* <span className="icon-caret-down dropIcon"></span> */}
                                </div>
                                <span class="youhave" onClick={()=>this.setState({sendCurrency:Number(this.state.nativeBalance).toFixed(4)}) }> You have Max : <b > {Number(this.state.nativeBalance).toFixed(4)}</b> {this.state.currency}</span>
                                <span class="txtrightsend show">Send <b>${(this.state.sendCurrency * this.state.nativePrice).toFixed(2)}</b></span>
                            </div>

                            <div className="bthinput">
                                <button className="btnwallet freeze" onClick={()=>this.freezeToken()}>freeze</button>

                                <Link to="/unfreeze" >switch to UNFREEZE</Link>
                            </div>

                        </form>

                    </div>
                </div>

        
            </div>
                {/* <div class={`freezepopup ${this.state.freezeLoading ? 'show':''}`} >  
                    <div class="content">
                        <img src="imgs/letter-x.svg" alt="" class="closeicon" /> 
                        <p>Freezing Process is running </p>
                        <div id="loading"></div>
                    </div> 
                </div> */}

            {/* <div class="popupsuccess">
                <h2> You froze sucessfully <span>7.4523</span> ETH into <span>106</span> f/ETH</h2>
                <p class="howtoadd">How to add f/ETH to your wallet <img src="imgs/questionblue.png" alt="" /></p>
                <div class="closepopup">
                    <img src="imgs/close.png" alt="" />
                </div>
            </div> */}
            </div>
        )

    }

}
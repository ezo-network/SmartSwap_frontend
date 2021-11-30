import React, { PureComponent, lazy, Suspense } from "react";
import { Link, Redirect } from "react-router-dom";
import web3Js from 'web3';
import web3Config from "../config/web3Config";
import Validation from "../helper/validation";
import FrozenContract from "../helper/frozenContract";
import notificationConfig from "../config/notificationConfig";
import constantConfig from "../config/constantConfig";
import { LoopCircleLoading } from 'react-loadingg';
import Backdrop from '@material-ui/core/Backdrop';

export default class UnFreeze extends PureComponent {

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
            recivedValue:"",
            frozenToken:null,
            freezeLoading:false,
            vsPrice:0,
            selectImg:'',
            recivedImg:'',
            withdrawFee:0.3,
            isOpen:false,
            isGateWay:false,
            approval:false,
            crossToken:''
        }
    }

    async init(){
        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();

        this.setState({web3Check:true,
                    web3:web3,address:address,
            selectImg:(networkId === 97 || networkId === 56) ? "imgs/frozeBnb.png" :"imgs/frozeEth.png",
            recivedImg:(networkId === 97 || networkId === 56) ? "imgs/pureBnb.png" :"imgs/pureEth.png"
        });
        if(web3 === null) 
            return 0 
        
        let frozenToken = new FrozenContract(web3Config.getWeb3(),networkId);
        let vsPrice = await frozenToken.getPrice();

        let balance = await frozenToken.getBalance(address);
        let nativePrice = 100;
        let nativeValue =  balance * nativePrice;
        this.setState({
            nativeBalance:balance,
            nativeValue:nativeValue,
            nativePrice:nativePrice,
            currency: (networkId === 97 || networkId === 56) ? "f/BNB" :"f/ETH",
            frozenToken:frozenToken,
            vsPrice:vsPrice,
            
        })
    }

    async componentDidMount(){
        this.init();       
    }

    async recivedToken(e){
        
        if((Number(e.target.value)) <= Number(this.state.nativeBalance))
            this.setState({ sendCurrency: e.target.value },()=>this.calculateToken())
        else    
            notificationConfig.error("Enter below your max value")
            

    }

    async calculateToken(){
        let {nativePrice, sendCurrency ,vsPrice  } = this.state;
        let recivedValue = (sendCurrency * nativePrice)/vsPrice;
        this.setState({recivedValue:recivedValue});
    }

    maxToken(){
        this.setState({ sendCurrency: this.state.nativeBalance },()=>this.calculateToken())  
    }

    async unfreezeToken(){
        let {sendCurrency,frozenToken,isGateWay,crossToken,crossNetworkId} = this.state;
        
        if(sendCurrency === "" || sendCurrency === 0){
            notificationConfig.error("Enter value to unfreeze")
            return;
        }
        if(!isGateWay){
            frozenToken.unFreezeToken(web3Js.utils.toWei(sendCurrency),()=>{
                this.setState({freezeLoading:true});
            },()=>{
                this.init()
                this.setState({freezeLoading:false});
                notificationConfig.success("UnFreeze Token Success");
            })
        }else{
            frozenToken.ConvertToken(crossToken,crossNetworkId,web3Js.utils.toWei(sendCurrency),()=>{
                this.setState({freezeLoading:true});
            },()=>{
                this.init()
                this.setState({freezeLoading:false});
                notificationConfig.success("UnFreeze Token Success");
            })


        }

    }

    async setReciveToken(token){
        let {frozenToken,nativeBalance,address} = this.state;
        if(web3Config.getNetworkId() === token.networkId){
            let vsPrice = await frozenToken.getPrice();
            this.setState({recivedImg:token.image,vsPrice:vsPrice,isGateWay:false,approval:false},()=>this.calculateToken());
        }else{
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token.id}&vs_currencies=usd`);
            const json = await response.json();
            let vsPrice = json[token.id]["usd"];
            let approval = await frozenToken.getApprovedTokenForGateWay(address);
            this.setState({
                isGateWay:true,
                recivedImg:token.image,
                vsPrice:vsPrice,
                approval:nativeBalance>=approval?true:false,
                crossNetworkId:token.networkId,
                crossToken:token.frozenToken
            },()=>this.calculateToken())
        }
    }

    async approveToken(){
        let {frozenToken} = this.state;
        frozenToken.approveTokenForGateWay(()=>{
            this.setState({freezeLoading:true})
        },()=>{
            this.setState({freezeLoading:false,approval:false});
        })
    }


    render() {

        if(this.state.web3 === null && this.state.web3Check)
            return <Redirect to="/"></Redirect>
        
        let address = this.state.address;

        const tokens = constantConfig.pureToken.map((token) =>{

            if(constantConfig.allowedNetwork.includes(token.networkId))
                return  <a onClick={()=>this.setReciveToken(token)} href="javascript:void(0);" style={{margin:"0",textAlign:"center"}}><img src={token.image} alt="" /></a>
        });
            
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
                <div className="form-content unfreeze-formcontent" >
                    <div className="content">
                        <h1>FREEZE CRYPTO VOLATILITY WITH ONE CLICK</h1>
                        <p>
                            Send cryptocurrency to the freeze crypto smart contract to receive frozen tokens such as f/ETH and f/BNB. When frozen are returned to the smart contract, you receive back the exact same USD value
                        </p>
                    </div>
                    <div className="form-freeze">
                        <form onSubmit={(e)=>{e.preventDefault()}} className="plusWidth">
                            <div className="input-group">
                                <input type="text" placeholder="send" value={this.state.sendCurrency} onKeyDown={(e)=> Validation.floatOnly(e)} onChange={this.recivedToken.bind(this)}  />
                                
                                <div className="cta show">
                                    <img src={this.state.selectImg} alt="" />
                                    {/* <span className="icon-caret-down dropIcon"></span> */}
                                </div>
                                {/* <div className="bnb">
                                    <img src="imgs/frozeBnb.png" alt="" />

                                </div> */}

                                <span  class="youhave" onClick={()=>this.maxToken()} >You have Max : <b>{Number(this.state.nativeBalance).toFixed(4)}</b> {this.state.currency}</span>
                                <span class="txtrightsend show">Send <b>${(this.state.sendCurrency*100).toFixed(2)}</b></span>
                            </div>

                            <div className="input-group recieve show">
                                <input type="text" placeholder="Receive" value={this.state.recivedValue} readOnly />

                                <div className="cta" onClick={()=>{this.setState({isOpen:!this.state.isOpen})}}>
                                    <img src={this.state.recivedImg} alt="" />
                                    <span className="icon-caret-down dropIcon"></span>

                                    <div class="jwb-ddBox" style={{display:this.state.isOpen?"block":"none"}} >
                                        <div class="jwb-ddContainer autoClose  n-collapse" id="ddC-01" >
                                            
                                            {tokens}

                                            {/* <a onClick={()=>{yes}} href="javascript:void(0);" style={{margin:"0",textAlign:"center"}}><img src="imgs/pureBnb.png" alt="" /></a> */}
                                        </div>
                                    </div>
                                </div>
{/* 
                                <select id="selectcoins">
                                    <option value="0" selected data-imagesrc={this.state.recivedImg} data-description=""></option>
                                </select> */}

                                <span class="txtrightsendreceive show" >Receive  <b>$ {(Number(this.state.recivedValue)*Number(this.state.vsPrice)).toFixed(2)}</b></span>
                            </div>

                            <div className="bthinput">
                                {this.state.approval ?
                                    <button className="btnwallet freeze chStyle" onClick={()=>this.approveToken()}>
                                        Approve
                                    </button>
                                    :
                                    <button className="btnwallet freeze chStyle" onClick={()=>this.unfreezeToken()}>
                                        unFreeze
                                    </button>
                                }
                                <Link to="/freeze" style={{color:"#4fa8eb"}} >switch to FREEZE</Link>
                                <span class="txtunfreeze show">Unfreeze fee <b>0.30%</b> <img src="imgs/freequersion.png" alt=""/> </span>
                            </div>

                        </form>

                    </div>
                </div>
                </div>
            </div>

        )

    }

}
import React, { PureComponent } from "react";
import data, { tokenDetails } from "../config/constantConfig";
import web3Config from "../config/web3Config";
import { PrePath } from "../constants";
import Collapse from "@kunukn/react-collapse";
import constantConfig from "../config/constantConfig";
import notificationConfig from "../config/notificationConfig";
import ReimbursementContract from "../helper/reimbursementContract";
import Loader from "react-loader-spinner";

const $ = window.$;

export default class DepositToken extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            web3: props.web3,
            web3Config: props.web3Config,
            coinList: tokenDetails,
            isOpen1: false,
            isOpen2: false,
            depositTokenAmt: 0,
            withdrawTokenAmt: 0,
            network: null,
            vaultAddress: null,
            depositLoading: false
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            web3: newProps.web3,
            web3Config: newProps.web3Config,
            network: newProps.network,
            vaultAddress: newProps.vaultAddress,
            tokenAddress: newProps.tokenAddress
        })
    }

    componentDidMount() {
        $("#DepositToken .tab-Link").hover(function () {
            $(".tab-Link").removeClass("active")
            $(this).addClass("active")
            $(".tab-Content").hide();
            $("#" + $(this).attr("data-id")).show();
        });

    }

    async handleInputChange(event) {
        const { name, value } = event.target;
        if (Number(value) >= 0 && value.length <= 5) {
            this.setState({
                [name]: value
            })
        } else {
            return
        }

    };

    toggle = index => {
        let collapse = "isOpen" + index;

        this.setState(prevState => ({ [collapse]: !prevState[collapse] }));
    };

    async depositTokens() {
        this.setState({ depositLoading: true })
        let { network, vaultAddress, tokenAddress } = this.props;
        let { depositTokenAmt } = this.state;
        await web3Config.connectWallet(0);
        let newNetworkId = web3Config.getNetworkId()

        if (!constantConfig.allowedNetwork.includes(newNetworkId)) {
            notificationConfig.error("Please Select Ethereum or BSC Main Network");
            this.setState({ depositLoading: false })
            return;
        }
        if (
            network === "Ethereum" &&
            (newNetworkId === 97 || newNetworkId === 56)
        ) {
            notificationConfig.warning("Change metamask network to Ethereum!");
            this.setState({ depositLoading: false })
            return;
        } else if (
            network === "BSC" &&
            (newNetworkId === 42 || newNetworkId === 1)
        ) {
            notificationConfig.warning("Change metamask network to Binance!");
            this.setState({ depositLoading: false })
            return;
        }

        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();

        let reimbursementContract = new ReimbursementContract(web3, networkId);

        let setDepositTokensData = {};

        setDepositTokensData["to"] = vaultAddress;
        setDepositTokensData["amount"] = depositTokenAmt;
        setDepositTokensData["tokenAddress"] = tokenAddress;

        reimbursementContract.depositTokens(
            setDepositTokensData,
            (hash) => {
                this.setState({
                    // swapLoading: true,
                    // txIdSent: hash,
                    // txLinkSend: data[networkId].explorer + '/tx/' + hash,
                });
            },
            async (receipt) => {
                notificationConfig.success('Deposit Tokens Successfully!');
                this.setState({ depositLoading: false })
            },
            async (error) => {
                if (error.code === 4001) {
                    notificationConfig.error("Transaction rejected!")
                }
                this.setState({ depositLoading: false })
            }
        );

    }

    async withdrawTokens() {
        this.setState({ withdrawLoading: true })
        let { network, vaultAddress } = this.props;
        let { withdrawTokenAmt } = this.state;
        await web3Config.connectWallet(0);
        let newNetworkId = web3Config.getNetworkId()

        if (!constantConfig.allowedNetwork.includes(newNetworkId)) {
            notificationConfig.error("Please Select Ethereum or BSC Main Network");
            this.setState({ withdrawLoading: false })
            return;
        }
        if (
            network === "Ethereum" &&
            (newNetworkId === 97 || newNetworkId === 56)
        ) {
            notificationConfig.warning("Change metamask network to Ethereum!");
            this.setState({ withdrawLoading: false })
            return;
        } else if (
            network === "BSC" &&
            (newNetworkId === 42 || newNetworkId === 1)
        ) {
            notificationConfig.warning("Change metamask network to Binance!");
            this.setState({ withdrawLoading: false })
            return;
        }

        let web3 = web3Config.getWeb3();
        let networkId = web3Config.getNetworkId();
        let address = web3Config.getAddress();

        let reimbursementContract = new ReimbursementContract(web3, networkId);

        let setWithdrawTokensData = {};

        setWithdrawTokensData["vault"] = vaultAddress;
        setWithdrawTokensData["amount"] = withdrawTokenAmt;
        setWithdrawTokensData["reimbursementAddress"] = constantConfig[networkId].reimbursementContract
        // setWithdrawTokensData["tokenAddress"] = tokenAddress;

        reimbursementContract.withdrawTokens(
            setWithdrawTokensData,
            (hash) => {
                this.setState({
                    // swapLoading: true,
                    // txIdSent: hash,
                    // txLinkSend: data[networkId].explorer + '/tx/' + hash,
                });
            },
            async (receipt) => {
                notificationConfig.success('Withdraw Tokens Successfully!');
                this.setState({ withdrawLoading: false })
            },
            async (error) => {
                if (error.code === 4001) {
                    notificationConfig.error("Transaction rejected!")
                }
                this.setState({ withdrawLoading: false })
            }
        );

    }


    render() {

        return (
            <div className="main-Popup wallet-Popup" id="DepositToken">
                <div className="container-Grid">
                    <div className="MainTabBox" style={{ paddingTop: '80px' }}>
                        <div className="tab-Nav">
                            <a href="javascript:void(0)" className="tab-Link" onClick={ev => { ev.preventDefault(); }} data-id="tab-A1">Deposit</a>
                            <a href="javascript:void(0)" className="tab-Link hideMobile" onClick={ev => { ev.preventDefault(); }} data-id="tab-A2">Withdrawal</a>
                        </div>


                        <div className={"tab-Content " + this.props.popId} id="tab-A1">

                            <div className="wtMBX" style={{ marginTop: '130px' }}>
                                <div class="gwFormSbox01">
                                    <div class="gwFormTitle01">Amount</div>
                                    <input name="depositTokenAmt" id="fontStyle" class="subdomain" style={{ padding: '20px 15px', width: '100%', backgroundColor: 'rgb(39, 30, 58)', color: 'rgb(255, 255, 255)', border: '0px' }} onChange={this.handleInputChange.bind(this)} >
                                    </input>
                                    <div class="smlInfotxt01" style={{ textAlign: 'left' }}>Max available to deposit 1,000,000 [TOKEN]</div>
                                </div>
                                <div class="gwFormSFormbox03">
                                    {this.state.depositLoading ?
                                        <button class="gwFormBTN01 greenBack">
                                            <Loader type="ThreeDots" color="#fff" height={15} width={80} />
                                        </button>
                                        :
                                        <button class="gwFormBTN01 greenBack" onClick={() => { this.depositTokens() }}>
                                            DEPOSIT
                                        </button>
                                    }
                                </div>
                            </div>

                        </div>

                        <div className="tab-Nav showMobile " style={{ width: '100%' }}>
                            <a href="javascript:void(0)" className="tab-Link " onClick={ev => { ev.preventDefault(); }} data-id="tab-A2">SmartSwap vs Atomic Swap & Other Swaps</a>
                        </div>
                        <div className={"tab-Content " + this.props.popId} id="tab-A2">
                            <div className="wtMBX" style={{ marginTop: '130px' }}>
                                <div class="gwFormSbox01">
                                    <div class="gwFormTitle01">Amount</div>
                                    <input name="withdrawTokenAmt" id="fontStyle" class="subdomain" style={{ padding: '20px 15px', width: '100%', backgroundColor: 'rgb(39, 30, 58)', color: 'rgb(255, 255, 255)', border: '0px' }} onChange={this.handleInputChange.bind(this)} >
                                    </input>
                                    <div class="smlInfotxt01" style={{ textAlign: 'left' }}>Max available to withdraw 1,000,000 [TOKEN]</div>
                                </div>
                                <div class="gwFormSFormbox03">

                                    {this.state.withdrawLoading ?
                                        <button class="gwFormBTN01 blackBack">
                                            <Loader type="ThreeDots" color="#fff" height={15} width={80} />
                                        </button>
                                        :
                                        <button class="gwFormBTN01 blackBack" onClick={() => { this.withdrawTokens() }}>
                                            WITHDRAW
                                        </button>
                                    }
                                </div>
                            </div>



                        </div>
                    </div>

                </div>

                <a href="javascript:void(0);" onClick={() => { this.props.closePopup("DepositToken") }} className="close-Icon"></a>
            </div>
        )

    }

}
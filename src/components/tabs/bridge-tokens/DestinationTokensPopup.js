import {WalletContext, EthereumEvents} from '../../../context/WalletProvider';
import _ from "lodash";
import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import close from "../../../assets/images/close.png";
import pinAct from "../../../assets/images/pin.png";
import pin from "../../../assets/images/pin-u.png";
import pinDeact from "../../../assets/images/pind-d.png";
import {textMasking, goToExplorer} from "../../../helper/utils";
const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;

export default class DestinationTokensPopup extends PureComponent {
    _componentMounted = false;
    constructor(props) {
        super();
        this.state = {
            currentPageNumber: 1,
            filteredChain: "",
            chainSortOrder: 'asc',
            pinnedNetworks: []
        };
    }

    componentDidMount() {
        console.log('DestinationTokensPopup mounted');
        this._componentMounted = true;
		if(this._componentMounted === true){
            
        }
    }

    componentWillUnmount() {
        console.log('DestinationTokensPopup unmounted');
        this._componentMounted = false;
    }

    changeCurrentPage = (page) => {
        if(this._componentMounted === true){
            this.setState({
                currentPageNumber: Number(page)
            })
        }
    }

    filteredChain = (chain) => {
        if(this._componentMounted === true){
            this.setState({
                filteredChain: (chain).toUpperCase(),
                currentPageNumber: 1
            });
        }
    };

    sortTokenByChain = (order) => {
        if(this._componentMounted === true){
            order = order === 'asc' ? 'desc' : 'asc';
            this.setState({
                chainSortOrder: order
            });
        }
    }

    setDestinationToken = (tokenSymbol, chainId, chain, address) => {
        if(this._componentMounted === true){
            this.props.destinationTokenSelectedCallback(tokenSymbol, chainId, chain, address, true);
            this.props.closePopupCallback();
        }
    }

    goToContractOnExplorer(chainId, tokenAddress) {
        const networkConfig = _.find(this.props.networks, {chainId: Number(chainId)});
        if(networkConfig !== undefined){
            goToExplorer(networkConfig.explorerUrl, tokenAddress)
        }
    }

    addToPinnedNetwork = (chainId) => {
        const pinnedNetworks = [...this.state.pinnedNetworks];
        if(!pinnedNetworks.includes(Number(chainId))){
            pinnedNetworks.push(Number(chainId));
            if(this._componentMounted === true){
                this.setState({
                    pinnedNetworks: pinnedNetworks
                });
            }
        }
    }

    removePinnedNetwork = (chainId) => {
        const pinnedNetworks = [...this.state.pinnedNetworks];
        if(pinnedNetworks.includes(Number(chainId))){
            var index = pinnedNetworks.indexOf(Number(chainId));
            if (index > -1) {
                pinnedNetworks.splice(index, 1);
                if(this._componentMounted === true){
                    this.setState({
                        pinnedNetworks: pinnedNetworks
                    });
                }
            }
        }
    }

    render() {
        const pageSize = 10;
        let currentPageNumber = this.state.currentPageNumber;
        let pageIndex = currentPageNumber - 1;
        let finalFilteredNetworks = [];
        const filteredNetworks = this.props.networks.filter(network => {
            if (network.chain.match(new RegExp(this.state.filteredChain, "i"))) {
                return network;
            }
        });

        filteredNetworks.forEach(network => {
            if (Number(network.chainId) !== Number(this.props.selectedSourceToken.chainId)) {

                const project = _.find(this.props.projects, {
                    tokenAddress: this.props.selectedSourceToken.address
                });

                const wrappedToken = _.find(this.props.wrappedTokens, {
                    projectId: project?._id,
                    fromChainId: Number(this.props.selectedSourceToken.chainId),
                    toChainId: Number(network.chainId)
                });

                //network['selectedNetwork'] = this.state.selectedNetworks.includes(network.chainId) ? true : false;
                network['isBridgeExistOnChain'] = wrappedToken === undefined ? false : true;
                network['wrappedTokenAddress'] = wrappedToken !== undefined ? wrappedToken.address : undefined;
                network['wrappedTokenSymbol'] = wrappedToken !== undefined ? wrappedToken.tokenSymbol : undefined;
                network['isSmartContractOwner'] = wrappedToken !== undefined ? (wrappedToken.creatorAddress === (this.context.account).toLowerCase() ? true : false) : false;
                finalFilteredNetworks.push(network);
            }
        });

        
        finalFilteredNetworks = _.orderBy(finalFilteredNetworks, ['chain'], [this.state.chainSortOrder]);

        this.state.pinnedNetworks.forEach(function(networkId){
            finalFilteredNetworks = _.sortBy(finalFilteredNetworks, ({chainId}) => Number(chainId) === Number(networkId) ? 0 : 1);
        });

        const totalNetworks = finalFilteredNetworks.length;
        const networkGroupList = _.chunk(finalFilteredNetworks, pageSize);
        const networks = networkGroupList[pageIndex <= 0 ? 0 : pageIndex];

        return (
            <>
                {this.props.show &&
                    <PopupMain>
                        <CloseBtn onClick={() => this.props.closePopupCallback()}><img alt="close-btn" src={close}></img></CloseBtn>
                        <ContainerPop>
                            <PopTitle>
                                <h1>Select any EVM destination chain</h1>
                                <p>If your destination chain is not exist, create a bridge in a few seconds and gain dVoucher rewards<i className="help-circle">
                                    <i
                                        className="fas fa-question-circle protip"
                                        data-pt-position="top"
                                        data-pt-title="Claim dVouchers after creating a new bridge. dVoucher tokens are NFT reward tokens that can be exchanged for any Qonetum Foundation project tokens with the same $:$ face value through a router."
                                    ></i>
                                </i></p>
                            </PopTitle>
                            <PopRow>
                                <Popcol>
                                    <Search>
                                        <input
                                            onChange={e => this.filteredChain(e.target.value)}
                                            placeholder="Search chains"
                                            type="search"
                                            value={this.state.filteredChain}
                                        ></input>
                                        <i className="fa fa-search" aria-hidden="true"></i>
                                    </Search>
                                    <SelectList>
                                    {this.state.pinnedNetworks.map(function(chainId, i) {
                                    const network = _.find(this.props.networks, {chainId: Number(chainId) })
                                    return <Selected 
                                        key={chainId}
                                        onClick={(e) => this.removePinnedNetwork(chainId)}
                                    >
                                        <Token>
                                            <img 
                                                src={`/images/free-listing/chains/${(network.chain).toLowerCase()}.png`}
                                                alt={`pinned-network-${chainId}`}
                                                onError={(e) => (e.currentTarget.src = '/images/free-listing/chains/default.png')} // fallback image
                                            ></img> {network.name}
                                        </Token>
                                        <i className="fa fa-times" aria-hidden="true"></i>
                                    </Selected>
                                    }.bind(this))}
                                    </SelectList>     
                                </Popcol>
                                {/* <Popcol>
                                <Search><input placeholder="Search tokens" type="search" value=""></input><i className="fa fa-search" aria-hidden="true"></i></Search>
                                <SelectList>
                                    <Selected><Token><img src={IconPop03} alt=""></img> BNB</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop02} alt=""></img> WBNB</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop04} alt=""></img> BAI</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop05} alt=""></img> USDT</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop06} alt=""></img> BUSD</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                </SelectList>
                            </Popcol> */}
                            </PopRow>
                            <Table>
                                <thead>
                                    <tr>
                                        <Thd onClick={() => this.sortTokenByChain(this.state.chainSortOrder)}>
                                            Blockchains &nbsp;
                                            <i className={`fa fa-caret-${this.state.chainSortOrder === 'asc' ? 'down' : 'up'}`} aria-hidden="true"></i>
                                        </Thd>
                                        <Thd>Smart contract</Thd>
                                        <Thd className="text-center">Bridge status</Thd>
                                        <Thd className="text-center">Reward &nbsp;
                                            <i
                                                className="fas fa-question-circle protip"
                                                data-pt-position="top"
                                                data-pt-title="dVoucher tokens are NFT reward tokens that can be exchanged for any Qonetum Foundation project tokens with the same $:$ face value through a router. The dVoucher reward NFT tokens can be traded on NFT marketplaces. Once dVoucher rewards are exchanged for project tokens, the newly received tokens are placed behind the Dumper Shield in a second position behind original project investors. The value of dVoucher is fixed at $0.01."
                                            ></i>
                                        </Thd>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr key="orignal-chain" className="disabled">
                                        <Tcell>
                                            <Token>
                                                <img
                                                    src={'/images/free-listing/chains/' + (this.props.selectedSourceToken.chain).toLowerCase() + '.png'}
                                                    onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                                    alt="source-chain-icon"
                                                ></img> {this.props.selectedSourceToken.name}
                                            </Token>
                                            <Pin className="disabled"></Pin>
                                        </Tcell>
                                        <Tcell 
                                            className="cursor"
                                            onClick={
                                                (e) => this.goToContractOnExplorer(this.props.selectedSourceToken.chainId, this.props.selectedSourceToken.address)
                                            }
                                        >
                                            <TDLink>{textMasking(this.props.selectedSourceToken.address, '.', 3, 5, 5)}</TDLink>
                                        </Tcell>
                                        <Tcell>
                                            <ButtonDone>ORIGNAL CHAIN</ButtonDone>
                                        </Tcell>
                                        <Tcell className="text-center">
                                            -
                                        </Tcell>
                                    </tr>
                                    {
                                        networks !== undefined && networks.length > 0 && networks.map(function (network, i) {
                                            return (
                                                <tr key={network._id}>
                                                    <Tcell>
                                                        <Token>
                                                            <img
                                                                className="cursor"
                                                                src={'/images/free-listing/chains/' + (network.chain).toLowerCase() + '.png'}
                                                                onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                                                alt="destination-chain-icon"
                                                                onClick={(e) => network['isBridgeExistOnChain'] === true ? this.setDestinationToken(
                                                                    network['wrappedTokenSymbol'],
                                                                    network.chainId,
                                                                    network.chain,
                                                                    network['wrappedTokenAddress']
                                                                ) : e.preventDefault()}
                                                            ></img>
                                                            <span
                                                                className="cursor"                                                                
                                                                onClick={(e) => network['isBridgeExistOnChain'] === true ? this.setDestinationToken(
                                                                    network['wrappedTokenSymbol'],
                                                                    network.chainId,
                                                                    network.chain,
                                                                    network['wrappedTokenAddress']
                                                                ) : e.preventDefault()}                                                            
                                                            >
                                                            {network.name}
                                                            </span>
                                                        </Token>
                                                        <Pin
                                                            onClick={(e) => this.addToPinnedNetwork(network.chainId)}
                                                            className={this.state.pinnedNetworks.includes(Number(network.chainId)) ? 'cursor selected' : 'cursor'}
                                                        ></Pin>
                                                    </Tcell>
                                                    <Tcell 
                                                        className="cursor"
                                                        onClick={
                                                            (e) => network['wrappedTokenAddress'] !== undefined 
                                                            ? goToExplorer(network.explorerUrl, network['wrappedTokenAddress'])
                                                            : e.preventDefault()
                                                        }
                                                    >
                                                        {network['wrappedTokenAddress'] === undefined ? '-' : <TDLink>{textMasking(network['wrappedTokenAddress'], '.', 3, 5, 5)}</TDLink>}
                                                    </Tcell>
                                                    <Tcell>
                                                        {network['isBridgeExistOnChain'] === true &&
                                                            <ButtonDark>
                                                                <i className="fa fa-check" aria-hidden="true"></i> Bridge Exists
                                                            </ButtonDark>
                                                        }

                                                        {network['isBridgeExistOnChain'] === false &&

                                                            <Link to={{ 
                                                                pathname: "/freelisting", 
                                                                state: {
                                                                    sourceTokenData: this.props.selectedSourceToken,
                                                                    destinationNetworkData: network,
                                                                    actionAfterBridgeCreated: "bridge-tokens"
                                                                }
                                                            }}>
                                                                <ButtonPrimary>CREATE NEW BRIDGE</ButtonPrimary>
                                                            </Link>
                                                        }
                                                    </Tcell>
                                                    <Tcell className="text-center">
                                                        {network['isSmartContractOwner'] === true && 
                                                            <Link to={{
                                                                pathname: "/freelisting",
                                                                state: {
                                                                    claimDeployerOwnerShip: true
                                                                }
                                                            }}>
                                                                <ButtonPrimary className='claim-depolyment-ownership'>Claim Ownership</ButtonPrimary>
                                                            </Link>
                                                        }
                                                        {network['isSmartContractOwner'] === false && 
                                                            <>-</>
                                                        }
                                                    </Tcell>
                                                </tr>
                                            )
                                        }.bind(this))
                                    }
                                </tbody>
                            </Table>
                            <Tfooter>
                                <Tnav>Page
                                    <SelectCustom>
                                        <select onChange={(e) => networkGroupList.length > 0 ? this.changeCurrentPage(e.target.value) : this.changeCurrentPage(this.state.currentPageNumber)}>
                                            {networkGroupList.map(function (tokenPage, i) {
                                                let page = ++i;
                                                return <option value={page} key={page}>{page}</option>
                                            }.bind(this))}
                                        </select>
                                    </SelectCustom>
                                    result {totalNetworks > 0 ? (pageSize * this.state.currentPageNumber) - (pageSize - 1) : 0} - {this.state.currentPageNumber * pageSize > totalNetworks ? totalNetworks : this.state.currentPageNumber * pageSize} of {totalNetworks}
                                </Tnav>
                                {/* <p><a href="#">Read more about dVocher <i className="fas fa-external-link-alt"></i></a></p> */}
                            </Tfooter>
                        </ContainerPop>
                    </PopupMain>
                }
            </>
        )
    }
}

DestinationTokensPopup.contextType = WalletContext;

const PopupMain = styled.div`
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(13, 14, 19, 0.95); overflow: auto; padding: 0 0 90px;
`
const ContainerPop = styled.div`
    width: 1360px; margin: 0 auto;
`
const CloseBtn = styled.a`
    position: absolute; top: 30px; right: 30px; cursor: pointer;
`
const PopTitle = styled.div`
    text-align: center; padding: 90px 0 50px;
    h1 {font-size: 36px; color: #fff; font-weight: bold; margin: 0 0 0;}
    p {font-size: 18px; margin: 25px 0 0;}
`
const PopRow = styled.div`
    display: flex; align-items: flex-start; margin: 0 -17px 48px;
`
const Popcol = styled.div`
    width: 100%; padding: 0 17px;
`
const Search = styled.div`
    position: relative; 
    input {
        background: #21232b; border: 2px solid #000; width: 100%; height: 67px; box-sizing: border-box; color: #a6a2b0; font-size: 16px; padding: 10px 18px;
    }
    .fa  {font-size: 18px; position: absolute; top: 25px; right: 20px; color: #aaa;}
`
const SelectList = styled.div`
    display: flex; flex-flow: wrap; margin-top: 20px;
`
const Selected = styled.div`
    min-width: 78px; min-height: 32px; background: #3b3e4b; margin-right: 7px; text-align: center; padding: 4px 7px; position: relative; cursor: pointer; transition: all 0.3s ease-in-out;
    &:hover {background: #91dc27; .fa-times {visibility: visible;}}
    div { 
        img { margin-right: 10px;}
    }
    .fa-times { position: absolute; top: 0; right: 0; color: #fff; background: #000; transform: translate(50%, -50%); font-size: 9px; height: 15px; width: 15px; line-height: 15px; text-align: center; border-radius: 15px; visibility: hidden;}
`
const Table = styled.table`
    width: 100%;
    tr:hover { background: #191a22;}
    tr.disabled {background: #2e2f3a; color: #aaa}
    tr.disabled > td > div {color: #aaa}
`
const Thd = styled.th`
    font-size: 14px; color: #fff; padding: 15px 18px; border-top: 2px solid #3b3e4b; border-bottom: 2px solid #3b3e4b; text-align: left; font-weight: normal; width: 20%;
    &.text-center {text-align: center;}
    & + th {
        border-left: 1px solid #3b3e4b
    }
`
const Tcell = styled.td`
    font-size: 14px; color: #fff; padding: 12px 18px; border-bottom: 1px solid #3b3e4b; position: relative;
    img {
        width: 25px;
    }   
    & + td {
        border-left: 1px solid #3b3e4b
    }
`
const Tfooter = styled.div`
    display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #aaaaaa; padding: 16px 0 0;
    
    p {color: #3b3e4b;}
    a {color: #aaa; margin: 0 10px; 
        i {margin-left: 4px;}
        &:last-child {margin-right: 0;}
    }
    a:hover {color: #91dc27;}
`
const SelectCustom = styled.div`
    display: inline-block; position: relative; margin: 0 10px;
    select {background: #3b3e4b; min-width: 65px; color: #fff; font-size: 14px; border: 0; height: 30px;  border-radius: 4px; padding: 0 10px;   appearance: none;}
    &:after {
        content: "\f0d7"; font-family: "Font Awesome 5 Free"; color: #aaa; font-weight: 900; position: absolute; right: 5px; top: 8px;
    }
`
const Tnav = styled.div`

`
const TDLink = styled.a`
    color: #2d52f3;
`
const BridgeGrp = styled.div`
    display: flex; align-items: center;
    b {img {margin-right: -3px;}}
    span {color: #91dc27; margin-left: 14px;}
`

const Token = styled.div`
    display: flex; align-items: center; color: #fff; height: 24px; line-height: 24px;
    img {margin-right: 16px; display: inline-block; vertical-align: top;}
`
const Pin = styled.div`
    width: 16px; height: 16px; position: absolute; right: 17px; top: calc(50% - 8px); background: url(${pin}); background-size: 100%;
    &.selected {background: url(${pinAct}); background-size: 100%;}
    &.disabled {background: url(${pinDeact}); background-size: 100%;}
`
const ButtonPrimary = styled.button`
    display: block; background-color: inherit; border: 2px solid #91dc27; box-shadow: 0px 0px 10px #91dc27; color: #fff; width:100%; font-weight: bold; padding: 7px 10px; 
    &:hover {background: #91dc27;}
`
const ButtonDone = styled.a`
    color: #91dc27; text-align: center; display: block; font-weight: bold;
    i {margin-right: 6px;}
`
const ButtonDark = styled.a`
    color: #9e9e9e; text-align: center; display: block; font-weight: bold;
    i {margin-right: 6px;}
`
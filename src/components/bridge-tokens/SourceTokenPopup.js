import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import _ from "lodash";
import pinAct from "../../assets/images/pin.png";
import pin from "../../assets/images/pin-u.png";
import close from "../../assets/images/close.png";
import Web3 from 'web3';
import BridgeApiHelper from "../../helper/bridgeApiHelper";
import notificationConfig from "../../config/notificationConfig";
import errors from "../../helper/errorConstantsHelper";

const visibleBridgesNumber = process.env.REACT_APP_VISIBLE_BRIDGES_NUMBER;
const wrapTokenSymbolPrefix = process.env.REACT_APP_WRAP_TOKEN_SYMBOL_PREFIX;

const textMasking = (text, maskingChar = '.', noOfMaskingChar = 3, startingLettersLength = 5, endingLettersLength = 5) => {
    return text.substring(0, startingLettersLength) + maskingChar.repeat(noOfMaskingChar) + text.slice(-endingLettersLength)
}

const goToContractOnExplorer = (explorerUrl, tokenAddress) => {
    if(explorerUrl !== undefined){
        window.open(explorerUrl + '/address/' + tokenAddress, "_blank");
    }
}

export default class SourceTokenPopup extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            currentPageNumber: 1,
            filteredToken: "",
            symbolSortOrder: 'asc',
            pinnedTokens: []
        };
    }

    changeCurrentPage = (page) => {
        this.setState({
            currentPageNumber: Number(page)
        })            
    }

    filterTokens = (token) => {
        this.setState({ 
            filteredToken: (token).toUpperCase(),
            currentPageNumber: 1
        });
    };

    sortTokenBySymbol = (order) => {
        order = order === 'asc' ? 'desc' : 'asc';
        this.setState({
            symbolSortOrder: order
        });
    }

    setSourceToken = (tokenSymbol, chainId, chain, address, decimals) => {
        this.props.sourceTokenSelectedCallback(tokenSymbol, chainId, chain, address, decimals);
        this.props.closePopupCallback();
    }

    addToPinnedToken = (tokenAddress) => {
        const pinnedTokens = [...this.state.pinnedTokens];
        if(!pinnedTokens.includes((tokenAddress).toUpperCase())){
            pinnedTokens.push((tokenAddress).toUpperCase());
            this.setState({
                pinnedTokens: pinnedTokens
            });
        }
    }

    removePinnedToken = (tokenAddress) => {
        const pinnedTokens = [...this.state.pinnedTokens];
        if(pinnedTokens.includes((tokenAddress).toUpperCase())){
            var index = pinnedTokens.indexOf((tokenAddress).toUpperCase());
            if (index > -1) {
                pinnedTokens.splice(index, 1);
                this.setState({
                    pinnedTokens: pinnedTokens
                });
            }
        }
    }

    searchAndAddToken = async() => {
        // check balance first
        const {response, code, error} = await BridgeApiHelper.addErc20Token(this.props.chainId, this.state.filteredToken);
        console.log(response, code, error);
        if(code === 201){
            await this.props.onTokenAddedCallback().then(async() => {
                notificationConfig.success(errors.tokenImported);
                await this.props.onCustomTokenBalanceCheck(this.state.filteredToken).then(async() => {
                    if(this.props.customTokenBalance == 0 || this.props.customTokenBalance === null){
                        notificationConfig.error(errors.tokenCouldNotList);
                    }
                });
            });
        }
        
        if(error === 'A TOKEN ALREADY EXIST'){
            await this.props.onCustomTokenBalanceCheck(this.state.filteredToken).then(async() => {
                if(this.props.customTokenBalance == 0 || this.props.customTokenBalance === null){
                    notificationConfig.error(errors.tokenCouldNotList);
                }
            });                    
        }
    }

    render() {
        const pageSize = 10;
        let currentPageNumber = this.state.currentPageNumber;
        let pageIndex = currentPageNumber - 1;
        
        let filteredTokens = this.props.tokens.filter(token => {
            if(
              token.symbol.match(new RegExp(this.state.filteredToken, "i"))
              ||
              token.address.match(new RegExp(this.state.filteredToken, "i"))
            ){
              return token;
            }
        });

        filteredTokens = _.orderBy(filteredTokens, ['symbol'],[this.state.symbolSortOrder]);
        this.state.pinnedTokens.forEach(function(pinnedTokenAddress){
            filteredTokens = _.sortBy(filteredTokens, ({address}) => address === (pinnedTokenAddress).toLowerCase() ? 0 : 1);
        });
        
        const totalTokens = filteredTokens.length;
        const tokensGroupList = _.chunk(filteredTokens, pageSize);
        let tokens = tokensGroupList[pageIndex <= 0 ? 0 : pageIndex];

        return (
            <>
                {this.props.show &&
                <PopupMain>
                    <CloseBtn onClick={() => this.props.closePopupCallback()}><img src={close}></img></CloseBtn>
                    <ContainerPop>
                        <PopTitle>
                            <h1>Select a token to bridge</h1> 
                        </PopTitle>
                        <PopRow>
                            {/* <Popcol>
                                <Search><input placeholder="Search chains" type="search" value=""></input><i className="fa fa-search" aria-hidden="true"></i></Search>
                                <SelectList>
                                    <Selected>
                                        <Token>
                                            <img 
                                                src="" 
                                                alt=""
                                                onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                            ></img> WBNB
                                        </Token> 
                                        <i className="fa fa-times" aria-hidden="true"></i>
                                    </Selected>
                                    <Selected>
                                        <Token>
                                            <img 
                                                src="" 
                                                alt=""
                                                onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                            ></img> WBNB
                                        </Token> 
                                        <i className="fa fa-times" aria-hidden="true"></i>
                                    </Selected>
                                </SelectList>
                            </Popcol> */}
                            <Popcol>
                                <Search>
                                    <input 
                                        onChange={e => this.filterTokens(e.target.value)}
                                        placeholder="Search token or paste address" 
                                        type="search"
                                        value={this.state.filteredToken}>
                                    </input>
                                    {this.state.filteredToken.length === 0 && 
                                        <i className="fa fa-search" aria-hidden="true"></i>                                
                                    }
                                    {this.state.filteredToken.length > 0 && 
                                        <i className="fa fa-remove" aria-hidden="true"></i>                                
                                    }                                    
                                </Search>
                                {totalTokens === 0 && Web3.utils.isAddress(this.state.filteredToken) && 
                                <SelectList>
                                        <Selected>
                                            <Token
                                                onClick={(e) => this.searchAndAddToken()}
                                            >
                                                Import Token
                                            </Token>
                                        </Selected>
                                </SelectList>                                                            
                                }
                                <SelectList>
                                    {this.state.pinnedTokens.map(function(pinnedToken, i) {
                                        const token = _.find(this.props.tokens, {address: (pinnedToken).toLowerCase() })
                                        if(token !== undefined){
                                            return <Selected 
                                                key={pinnedToken}
                                                onClick={(e) => this.removePinnedToken(pinnedToken)}
                                            >
                                                <Token>
                                                    <img 
                                                        src={`/images/free-listing/tokens/${(token.symbol).toLowerCase()}.png`}
                                                        alt={`pinned-token-${pinnedToken}`}
                                                        onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                                    ></img> {token.symbol}
                                                </Token>
                                                <i className="fa fa-times" aria-hidden="true"></i>
                                            </Selected>
                                        }
                                    }.bind(this))}
                                </SelectList>                                
                            </Popcol>
                        </PopRow>
                        <Table>
                            <thead>
                                <tr>
                                    <Thd onClick={() => this.sortTokenBySymbol(this.state.symbolSortOrder)}>
                                        Tokens &nbsp;
                                        <i className={`fa fa-caret-${this.state.symbolSortOrder === 'asc' ? 'down' : 'up'}`} aria-hidden="true"></i>
                                    </Thd>
                                    <Thd>Smart contract</Thd>
                                    <Thd>Original chain</Thd>
                                    <Thd>Existing bridges</Thd>
                                </tr>
                            </thead>

                            <tbody>
                                {tokens !== undefined && tokens.length > 0 && tokens.map(function (token, i) {
                                    
                                    const networkConfig = _.find(this.props.networks, {
                                        chainId: Number(token.chainId)
                                    });

                                    const wrappedTokens = _.filter(this.props.wrappedTokens, {
                                        fromChainId: Number(token.chainId),
                                        tokenSymbol: wrapTokenSymbolPrefix + (token.symbol).toUpperCase()
                                    });

                                    const totalWrappedTokens = wrappedTokens.length;

                                    return <tr 
                                            key={token._id}
                                        >
                                            <Tcell>
                                                <Token>
                                                    <img 
                                                        src={'/images/free-listing/tokens/' + (token.symbol).toLowerCase() + '.png'}
                                                        onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                                        alt="to-token-input-icon"
                                                        onClick={(e) => this.setSourceToken(
                                                            token.symbol,
                                                            Number(token.chainId),
                                                            networkConfig.chain,
                                                            token.address,
                                                            token.decimals
                                                        )}                                                        
                                                    ></img> 
                                                    <span
                                                        onClick={(e) => this.setSourceToken(
                                                            token.symbol,
                                                            Number(token.chainId),
                                                            networkConfig.chain,
                                                            token.address,
                                                            token.decimals
                                                        )}
                                                    >{token.symbol}</span>
                                                </Token>
                                                <Pin 
                                                    onClick={(e) => this.addToPinnedToken(token.address)}
                                                    className={this.state.pinnedTokens.includes((token.address).toUpperCase()) ? 'selected' : ''}
                                                ></Pin>
                                            </Tcell>
                                            <Tcell 
                                                onClick={(e) => goToContractOnExplorer(networkConfig.explorerUrl, token.address)}
                                            >
                                                <TDLink>{textMasking(token.address)}</TDLink>
                                            </Tcell>
                                            <Tcell>
                                                <Token>
                                                    <img 
                                                        src={'/images/free-listing/chains/' + (networkConfig.chain).toLowerCase() + '.png'}
                                                        onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                                        alt="to-token-input-icon"
                                                    >
                                                    </img> {networkConfig.chain}
                                                </Token>
                                                {/* <Pin className="selected"></Pin> */}
                                            </Tcell>                                            
                                            <Tcell>
                                                <BridgeGrp>
                                                    <b>
                                                        {
                                                            wrappedTokens !== undefined && wrappedTokens.map(function(wrappedToken, i){
                                                                if(visibleBridgesNumber > (i++)){
                                                                    const destinationNetworkConfig = _.find(this.props.networks, {
                                                                        chainId: Number(wrappedToken.toChainId)
                                                                    });
                                                                    
                                                                    return <img 
                                                                        key={wrappedToken._id} 
                                                                        src={'/images/free-listing/chains/' + (destinationNetworkConfig.chain).toLowerCase() + '.png'}
                                                                        onError={(e) => (e.currentTarget.src = '/images/free-listing/tokens/default.png')} // fallback image
                                                                        alt={destinationNetworkConfig.chain}>
                                                                    </img>
                                                                }
                                                            }.bind(this))
                                                        }
                                                    </b>
                                                    <span>{totalWrappedTokens > visibleBridgesNumber ? '+ ' + (totalWrappedTokens - visibleBridgesNumber) : ''}</span>
                                                </BridgeGrp>
                                            </Tcell>
                                    </tr>
                                
                                }.bind(this))}
                            </tbody>
                        </Table>
                        <Tfooter>
                            <Tnav>Page 
                                <SelectCustom>
                                    <select 
                                        onChange={(e) => tokensGroupList.length > 0 ? this.changeCurrentPage(e.target.value) : this.changeCurrentPage(this.state.currentPageNumber)}
                                        //value={this.state.currentPageNumber}
                                    >
                                        { tokensGroupList.map(function(tokenPage, i){
                                            let page = ++i;
                                            return <option value={page} key={page}>{page}</option>
                                        }.bind(this) )}
                                    </select>
                                </SelectCustom>
                                result { totalTokens > 0 ? (pageSize * this.state.currentPageNumber) - (pageSize - 1) : 0} - {this.state.currentPageNumber * pageSize > totalTokens ? totalTokens : this.state.currentPageNumber * pageSize} of {totalTokens}
                            </Tnav>   
                            <p>
                                <Link to="/freelisting">
                                    <b>
                                        If you can't find your destination chain under existing bridges, you can create one in a few second
                                    </b>
                                </Link>
                            </p> 
                        </Tfooter>
                    </ContainerPop>
                </PopupMain>
                }
            </>
        )
    }
}
const PopupMain = styled.div `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(13, 14, 19, 0.95); overflow: auto; padding: 0 0 90px;
`
const ContainerPop = styled.div `
    width: 1360px; margin: 0 auto;
`

const CloseBtn = styled.a `
    position: absolute; top: 30px; right: 30px; cursor: pointer;
`

const PopTitle = styled.div `
    text-align: center; padding: 90px 0 50px;
    h1 {font-size: 36px; color: #fff; font-weight: bold; margin: 0 0 0;}
`
const PopRow = styled.div `
    display: flex; align-items: flex-start; margin: 0 -17px 48px;
`
const Popcol = styled.div `
    width: 100%; padding: 0 17px;
`
const Search = styled.div `
    position: relative; 
    input {
        background: #21232b; border: 2px solid #000; width: 100%; height: 67px; box-sizing: border-box; color: #a6a2b0; font-size: 16px; padding: 10px 18px;
    }
    ::-webkit-input-placeholder { /* Edge */
        color: inherit; opacity: 1;
    }
    :-ms-input-placeholder { /* Internet Explorer 10-11 */
        color: inherit; opacity: 1;
    }
    ::placeholder {
        color: inherit; opacity: 1;
    }
    .fa  {font-size: 18px; position: absolute; top: 25px; right: 20px; color: #aaa;}
`
const SelectList = styled.div `
    display: flex; flex-flow: wrap; margin-top: 20px; gap: 10px;
`
const Selected = styled.div `
    min-width: 78px; min-height: 32px; background: #3b3e4b; text-align: center; padding: 4px 7px; position: relative; cursor: pointer; transition: all 0.3s ease-in-out;
    &:hover {background: #91dc27; .fa-times {visibility: visible;}}
    div { 
        img { margin-right: 10px; width: 25px; border-radius: 50%}
    }
    .fa-times { position: absolute; top: 0; right: 0; color: #fff; background: #000; transform: translate(50%, -50%); font-size: 9px; height: 15px; width: 15px; line-height: 15px; text-align: center; border-radius: 15px; visibility: hidden;}
`
const Table = styled.table `
    width: 100%;
    tr:hover { background: #191a22;}
`
const Thd = styled.th `
    font-size: 14px; color: #fff; padding: 15px 18px; border-top: 2px solid #3b3e4b; border-bottom: 2px solid #3b3e4b; text-align: left; font-weight: normal; width: 25%;
    & + th {
        border-left: 1px solid #3b3e4b
    }
`
const Tcell = styled.td `
    font-size: 14px; color: #fff; padding: 12px 18px; border-bottom: 1px solid #3b3e4b; position: relative;
    img {
        width: 25px;
        border-radius: 50%;
    }
    & + td {
        border-left: 1px solid #3b3e4b
    }
`
const Tfooter = styled.div `
    display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #aaaaaa; padding: 16px 0 0;
    
    p {color: #3b3e4b;}
    a {color: #aaa; margin: 0 10px;}
    a:hover {color: #91dc27;}
`
const SelectCustom = styled.div `
    display: inline-block; position: relative; margin: 0 10px;
    select {background: #3b3e4b; min-width: 65px; color: #fff; font-size: 14px; border: 0; height: 30px;  border-radius: 4px; padding: 0 10px;   appearance: none;}
    &:after {
        content: "\f0d7"; font-family: "Font Awesome 5 Free"; color: #aaa; font-weight: 900; position: absolute; right: 5px; top: 8px;
    }
`
const Tnav = styled.div `

`
const TDLink = styled.a `
    color: #2d52f3;
`
const BridgeGrp = styled.div `
    display: flex; align-items: center;
    b {img {margin-right: -3px;}}
    span {color: #91dc27; margin-left: 14px;}
`

const Token = styled.div `
    display: flex; align-items: center; color: #fff; height: 24px; line-height: 24px;
    img {margin-right: 16px; display: inline-block; vertical-align: top;}
`
const Pin = styled.div `
    width: 16px; height: 16px; position: absolute; right: 17px; top: calc(50% - 8px); background: url(${pin}); background-size: 100%;
    &.selected {background: url(${pinAct}); background-size: 100%;}
`

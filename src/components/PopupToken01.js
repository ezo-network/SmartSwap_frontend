import { Container } from "@material-ui/core";
import React, { PureComponent } from "react";
import styled from 'styled-components';

import IconPop01 from "../assets/images/icop-1.png";
import IconPop02 from "../assets/images/icop-2.png";
import IconPop03 from "../assets/images/icop-3.png";
import IconPop04 from "../assets/images/icop-4.png";
import IconPop05 from "../assets/images/icop-5.png";
import IconPop06 from "../assets/images/icop-6.png";
import IconPop07 from "../assets/images/icop-7.png";
import IconPop08 from "../assets/images/icop-8.png";
import IconPop09 from "../assets/images/icop-9.png";
import IconPop10 from "../assets/images/icop-10.png";
import IconPop11 from "../assets/images/icop-11.png";
import IconPop12 from "../assets/images/icop-12.png";
import IconPop13 from "../assets/images/icop-13.png";
import IconPop14 from "../assets/images/icop-14.png";
import IconPop15 from "../assets/images/icop-15.png";
import pinAct from "../assets/images/pin.png";
import pin from "../assets/images/pin-u.png";

export default class PopupToken01 extends PureComponent {
    render() {
        return (
            <>
                <PopupMain>
                    <ContainerPop>
                        <PopTitle>
                            <h1>Select any chain that tokens currently exist</h1> 
                        </PopTitle>
                        <PopRow>
                            <Popcol>
                                <Search><input placeholder="Search chains" type="search" value=""></input><i className="fa fa-search" aria-hidden="true"></i></Search>
                                <SelectList>
                                    <Selected><Token><img src={IconPop01} alt=""></img> WBNB</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop02} alt=""></img> BNB</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                </SelectList>
                            </Popcol>
                            <Popcol>
                                <Search><input placeholder="Search tokens" type="search" value=""></input><i className="fa fa-search" aria-hidden="true"></i></Search>
                                <SelectList>
                                    <Selected><Token><img src={IconPop03} alt=""></img> BNB</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop02} alt=""></img> WBNB</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop04} alt=""></img> BAI</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop05} alt=""></img> USDT</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                    <Selected><Token><img src={IconPop06} alt=""></img> BUSD</Token> <i className="fa fa-times" aria-hidden="true"></i></Selected>
                                </SelectList>
                            </Popcol>
                        </PopRow>
                        <Table>
                            <thead>
                                <tr>
                                    <Thd>Token</Thd>
                                    <Thd>Selected chain</Thd>
                                    <Thd>Smart contract</Thd>
                                    <Thd>Bridge status</Thd>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop03} alt=""></img> WBNB</Token>
                                        <Pin className="selected"></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop02} alt=""></img> BSC</Token>
                                        <Pin className="selected"></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                                <img src={IconPop07} alt=""></img>
                                                <img src={IconPop08} alt=""></img>
                                                <img src={IconPop09} alt=""></img>
                                                <img src={IconPop10} alt=""></img>
                                            </b>
                                            <span>+ 121</span>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop03} alt=""></img> BNB</Token>
                                        <Pin className=""></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop02} alt=""></img> BSC</Token>
                                        <Pin className=""></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                                <img src={IconPop07} alt=""></img>
                                                <img src={IconPop10} alt=""></img>
                                            </b>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop15} alt=""></img> 7UP</Token>
                                        <Pin className="selected"></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop02} alt=""></img> BSC</Token>
                                        <Pin className="selected"></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                            </b>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop12} alt=""></img> ADA</Token>
                                        <Pin className="selected"></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop02} alt=""></img> BSC</Token>
                                        <Pin className="selected"></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                                <img src={IconPop07} alt=""></img>
                                                <img src={IconPop08} alt=""></img>
                                                <img src={IconPop09} alt=""></img>
                                            </b>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop11} alt=""></img> ANKR</Token>
                                        <Pin className="selected"></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop01} alt=""></img> Ethereum</Token>
                                        <Pin className="selected"></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                                <img src={IconPop08} alt=""></img>
                                                <img src={IconPop09} alt=""></img>
                                            </b>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop13} alt=""></img> ANY</Token>
                                        <Pin className="selected"></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop01} alt=""></img> Ethereum</Token>
                                        <Pin className="selected"></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                            </b>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                <tr>
                                    <Tcell>
                                        <Token><img src={IconPop14} alt=""></img> anyUNI</Token>
                                        <Pin className="selected"></Pin>
                                    </Tcell>
                                    <Tcell><Token><img src={IconPop01} alt=""></img> Ethereum</Token>
                                        <Pin className="selected"></Pin></Tcell>
                                    <Tcell><TDLink>0x291...912Af</TDLink></Tcell>
                                    <Tcell>
                                        <BridgeGrp>
                                            <b>
                                                <img src={IconPop01} alt=""></img>
                                                <img src={IconPop02} alt=""></img>
                                                <img src={IconPop07} alt=""></img>
                                            </b>
                                        </BridgeGrp>
                                    </Tcell>
                                </tr>
                                
                            </tbody>
                        </Table>
                        <Tfooter>
                            <Tnav>Page 
                                <SelectCustom>
                                    <select>
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                    </select>
                                </SelectCustom>
                                result 1-10 of 300</Tnav>   
                            <p><a href="#">Create new bridge to any token by few seconds</a>   |   <a href="#">You can create to any token new bridges on any EVM chains by a few seconds</a></p> 
                        </Tfooter>
                    </ContainerPop>
                </PopupMain>
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

const PopTitle = styled.div `
    text-align: center; padding: 90px 0 50px;
    h1 {font-size: 36px; color: #fff; font-weight: bold; margin: 0 0 0;}
`
const PopRow = styled.div `
    display: flex; align-items: flex-start; margin: 0 -17px 48px;
`
const Popcol = styled.div `
    width: 50%; padding: 0 17px;
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
    display: flex; flex-flow: wrap; margin-top: 20px;
`
const Selected = styled.div `
    min-width: 78px; min-height: 32px; background: #3b3e4b; margin-right: 7px; text-align: center; padding: 4px 7px; position: relative; cursor: pointer; transition: all 0.3s ease-in-out;
    &:hover {background: #91dc27; .fa-times {visibility: visible;}}
    div { 
        img { margin-right: 10px;}
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

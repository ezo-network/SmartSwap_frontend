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
import swap from "../assets/images/swap.png";
import close from "../assets/images/close.png";

export default class PopupToken03 extends PureComponent {
    render() {
        return (
            <>
                <PopupMain>
                    <CloseBtn><img src={close}></img></CloseBtn>
                    <ContainerXl>
                        <PopTitle>
                            <h1>Checking authenticity </h1> 
                        </PopTitle>
                        <PopRow>
                            <Popcol className="w-40">
                                <PopPera className="Title">Collateral token</PopPera>
                                <PopPera>Blockchain</PopPera> 
                                <Token><img src={IconPop01} alt=""></img> Ethereum</Token>
                                <PopPera>Smart contract token address</PopPera>
                                <PopLink>0x084374b068Eb3db504178b4909eDC26D01226a80 <sup className="fas fa-external-link-alt"></sup></PopLink>
                            </Popcol>
                            <Popcol className="Nowidth"><a><img src={swap}></img></a></Popcol>
                            <Popcol className="w-40">
                                <PopPera className="Title">New wrap token</PopPera>
                                <PopPera>Blockchain </PopPera>
                                <Token><img src={IconPop02} alt=""></img> BSC</Token>
                                <PopPera>Smart contract token address</PopPera>
                                <PopLink>0x084374b068Eb3db504178b4909eDC26D01226a80 <sup className="fas fa-external-link-alt"></sup></PopLink>
                            </Popcol>
                        </PopRow>
                    </ContainerXl>
                </PopupMain>
            </>
        )
    }
}
const PopupMain = styled.div `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(13, 14, 19, 0.95); overflow: auto; padding: 0 0 90px; display: flex; flex-direction: column; justify-content: center;
`
const CloseBtn = styled.a `
    position: absolute; top: 30px; right: 30px; cursor: pointer;
`
const ContainerXl = styled.div `
    width: 1360px; margin: 0 auto;
`
const PopTitle = styled.div `
    text-align: center; padding: 90px 0 50px;
    h1 {font-size: 36px; color: #fff; font-weight: bold; margin: 0 0 0;}
    p {font-size: 18px; margin: 25px 0 0;}
`
const PopRow = styled.div `
    display: flex; align-items: flex-start; margin: 0 -17px 48px;
`
const Popcol = styled.div `
    width: 50%; padding: 0 17px;
    &.Nowidth {width: auto; flex-grow: 1; align-self: center; padding:0; text-align: center;}
    &.w-40 {width: 20%; flex-grow: 1;  padding: 0;}
`
const Search = styled.div `
    position: relative; 
    input {
        background: #21232b; border: 2px solid #000; width: 100%; height: 67px; box-sizing: border-box; color: #a6a2b0; font-size: 16px; padding: 10px 18px;
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
const Token = styled.div `
    display: flex; align-items: center; font-size: 18px; text-transform: uppercase; color: #fff; height: 24px; line-height: 24px;
    img {margin-right: 16px; display: inline-block; vertical-align: top; height: 30px; width: 30px;}
`
const PopPera = styled.p `
    font-size: 18px; color: #fff; margin: 18px 0; 
    &.Title {border-bottom: 1px solid; display: table; line-height: 1;}
`
const PopLink = styled.div `
    color: #2d52f3; font-size: 18px;
`
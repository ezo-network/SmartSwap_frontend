import React, { PureComponent, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import web3Config from "../config/web3Config";
import constantConfig, { getTokenList, tokenDetails } from "../config/constantConfig";
import notificationConfig from "../config/notificationConfig";
import SwapFactoryContract from "../helper/swapFactoryContract";
import CONSTANT from "../constants";
import Header from "../components/Header";
import RightSideMenu from "../components/RightSideMenu";
import axios from "axios";
import { isValidAddress } from 'ethereumjs-util';
import styled from 'styled-components';
import HeadFreeListing from "../components/Header02";

import ImgIco01 from "../assets/freelisting-images/s2ICO-01.png";
import ImgIco02 from "../assets/freelisting-images/s2ICO-02.png";
import ImgIco03 from "../assets/freelisting-images/s2ICO-03.png";
import ImgIco04 from "../assets/freelisting-images/s2ICO-04.png";
import ImgIco05 from "../assets/freelisting-images/s2ICO-05.png";
import ImgIco06 from "../assets/freelisting-images/s2ICO-06.png";
import Lineimg from "../assets/freelisting-images/line01.png";
import addImg from "../assets/images/add-chain.png";




const $ = window.$;
export default class Screen5 extends PureComponent {
  constructor(props) {
    super();
    this.state = {

    };

    this.state = {
      web3: null,
      web3Check: false,
    };
  }


  render() {
    return (
      <>
        <main id="main" className="smartSwap">

          <div className="main">
            <MContainer>
              <CMbx>
				
				<SuccessBox>
					<i class="fa fa-check" aria-hidden="true"></i>
					<SuccessTitle><span>All done!</span> You successfully set up a new bridge</SuccessTitle>
				</SuccessBox>
                
				<Ulist>
					<List>
						<ListTxt className="title">New bridge</ListTxt>
						<ListTxt className="title">Wrap token smart contract</ListTxt>
					</List>
					<List>
						<ListTxt><span>sbSMART</span><span>POLYGON</span></ListTxt>
						<ListTxt><ListLink>0xfdsf542df5q4235fca43</ListLink></ListTxt>
					</List>
					<List>
						<ListTxt><span>sbSMART</span><span>POLYGON</span></ListTxt>
						<ListTxt><ListLink>0xfdsf542df5q4235fca43</ListLink></ListTxt>
					</List>
					<ListFooter>
						<LinkGreen>+ Add more bridges </LinkGreen>
						<LinkFt>Projects, claim the bridge deployer to become the master validator   <i class="fas fa-external-link-alt"></i></LinkFt>
					</ListFooter>
				</Ulist>
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

const SuccessBox = styled.div `
	text-align: center;
	width:100%;
	margin-bottom: 56px;
	i {
		font-size: 56px;
		width: 114px;
		height: 114px;
		line-height: 114px;
		border-radius: 114px;
		&.fa-check {
			border: 3px solid #91dc27;
			color: #91dc27;
		}
	}
	`
const SuccessTitle = styled.div `
	font-size: 24px;
	color: #fff;
	font-weight: bold;
	margin-top: 30px;
	span {
		color: #91dc27;
		
	}
`
const Ulist = styled.ul `
	padding: 0;
	margin: 0;
	display: table;
	width: 900px;
	border-top: 2px solid #3b3e4b;
`
const List = styled.li `
	padding: 0;
	margin: 0;
	list-style: none;
	display: flex;
	border-bottom: 1px solid #3b3e4b;
	&:hover {
		background: #191a22;
	}
	&:first-child {
		border-bottom: 2px solid #3b3e4b;
		
	}
	`
const ListTxt = styled.div `
	padding: 17px 22px;
	margin: 0;
	list-style: none;
	width: 50%;
	&:last-child {
		border-left: 1px solid #3b3e4b;
	}
	span {
		&:last-child {
			&:before {
				content: ' ';
				height: 25px;
				border-left: 1px solid #3b3e4b;
				margin: 0 8px 0 11px;
			}
		}
	}
	
`
const ListLink = styled.a `
	padding: 0;
	margin: 0;
	list-style: none;
	color: #2d52f3;
`
const ListFooter = styled.li `
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	justify-content: space-between;
	padding: 17px 0;
`
const LinkGreen = styled.a `
	padding: 0;
	margin: 0;
	list-style: none;
	color: #91dc27;
	font-weight: bold;
`
const LinkFt = styled.a `
	padding: 0;
	margin: 0;
	list-style: none;
	color: #aaaaaa;
	i {
		margin-left: 5px;
	}
`




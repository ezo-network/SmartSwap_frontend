import React, { PureComponent, lazy, Suspense } from "react";
import styled from 'styled-components';
import logoImg01 from "../../assets/images/smart-bridge.png";
import logoImg02 from "../../assets/images/derex.png";
import logoImg03 from "../../assets/images/pdo.png";

const $ = window.$;
export default class SetupSuccessfully extends PureComponent {
  constructor(props) {
    super();
  }

  render() {
    return (
      <>
        <main id="main" className="smartSwap">

          <div className="main">
            <MContainer>
              <CMbx>
				
				<SuccessBox>
					<i className="fa fa-check" aria-hidden="true"></i>
					<SuccessTitle><span>Successfully transferred ownership and now the master validator</span></SuccessTitle>
				</SuccessBox>
                
				<DetailsRow>
                    <DetailsBox>
                        <DetailsLogo><img src={logoImg01}></img></DetailsLogo>
                        <p>Create more bridges on <br></br>
                        any EVM chain</p>
                        <DetailsLink>
                            <a href="#">Create a Bridge</a> | <a href="#">Learn more <i className="fas fa-external-link-alt"></i></a>
                        </DetailsLink>
                    </DetailsBox>
                    <DetailsBox>
                        <DetailsLogo><img src={logoImg02}></img></DetailsLogo>
                        <p>Claim a $10,000 credit for launching an initial bond offering on DEREX exchange</p>
                        <DetailsLink>
                            <a href="#">Claim Now</a> | <a href="#">Learn more <i className="fas fa-external-link-alt"></i></a>
                        </DetailsLink>
                    </DetailsBox>
                    <DetailsBox>
                        <DetailsLogo><img src={logoImg03}></img></DetailsLogo>
                        <p>Claim a $10,000 credit for launching a post-DEX offering on PDO Finance</p>
                        <DetailsLink>
                            <a href="#">Claim Now</a> | <a href="#">Learn more <i className="fas fa-external-link-alt"></i></a>
                        </DetailsLink>
                    </DetailsBox>
                </DetailsRow>
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
	width: calc(100% - 40px) ; max-width:1360px; margin:0 auto;
`;
const CMbx = styled(FlexDiv)`
	width:100%;  margin-top:90px;
	@media (max-width: 991px){
		margin-top: 60px;
	}
`;

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
const DetailsRow = styled.div `
    display: flex;
    width: 1365px;
    border-top: 1px solid #303030;
    padding-top: 40px;
	@media screen and (max-width: 991px) {
		flex-flow: wrap;
	}
`
const DetailsBox = styled.div `
    width: 33.33%; padding-right: 36px; padding-bottom: 40px;
    p {
        font-size: 18px; font-weight: bold;
        line-height: 30px; margin: 20px 0;
    }
	@media screen and (max-width: 991px) {
		width: 50%;
	}
	@media screen and (max-width: 640px) {
		width: 100%;
		text-align: center; align-items: center;  padding-right: 0; padding-bottom: 60px;
		p {margin: 10px 0 20px}
	}
`
const DetailsLogo = styled.div `
    min-height: 60px;
    display: flex; align-items: center; 
	@media screen and (max-width: 640px) {
		display: inline-flex;
	}
`
const DetailsLink = styled.div `
    display: flex; align-items: center;  color: #303030; white-space: nowrap;
    a { color: #91dc27; margin-right: 14px; font-weight: bold; font-size: 18px;
        i { font-size: 12px; display: inline-block; vertical-align: top;}
        &:last-child { margin-left: 14px; }
        &:hover {color: #fff;}
    }
	@media screen and (max-width: 640px) {
		display: inline-flex; padding-left: 14px;
	}
`
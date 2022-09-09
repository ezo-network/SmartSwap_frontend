import React, { PureComponent, lazy, Suspense } from "react";
import notificationConfig from "../config/notificationConfig";
import CONSTANT from "../constants";
import styled from 'styled-components';
import _ from "lodash";
import BridgeApiHelper from "../helper/bridgeApiHelper";
const $ = window.$;


export default class Screen6 extends PureComponent {
	
	mounted = false;

	constructor(props) {
		super();
		this.state = {
			wrappedTokens: [],
			fetch: true
		};
	}

	async componentDidMount() {
		this.mounted = true;
		if(this.mounted === true){
			this.setState({
				wrappedTokens: this.props.wrappedTokens
			});
	
			this.props.wrappedTokens.forEach(async(token) => {
				if(token.address === null){
					await this.reFetchWrappedTokens();
				}
			});
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	reFetchWrappedTokens = async() => {
		try {
			if(this.mounted === true){
				var networkPromise = await BridgeApiHelper.getWrappedTokens(this.props.projectId, this.props.accountAddress);
				var timeOutPromise = new Promise(function (resolve, reject) {
					setTimeout(resolve, 5000, 'Timeout Done');
				});
		
				Promise.all([networkPromise, timeOutPromise]).then(async (responses) => {
					let pendingAddresses = 0;
					if (responses[0].code === 200) {
						let tokens = responses[0].response;
						if(tokens.length > 0){
							tokens.forEach(token => {
								if(token.address === null){
									pendingAddresses = pendingAddresses + 1;
								}
							})
						}
						
						if(this.mounted === true){
							this.setState({
								wrappedTokens: tokens
							});
						}
					}
		
					if(pendingAddresses === 0){
		
					} else {
						await this.reFetchWrappedTokens();
					}
				});
			}
		} catch (err){
			console.error(err.message);
			notificationConfig.error('Something went wrong');
		}
    }

	render() {

		let wrappedTokens = [];
		this.state.wrappedTokens.forEach(token => {
			const networkConfig = _.find(this.props.networks, { chainId: token.chainId });
			token['chain'] = networkConfig['name'];
			wrappedTokens.push(token);
		});

		return (
			<>
				<main id="main" className="smartSwap">

					<div className="main">
						<MContainer>
							<CMbx>
								{wrappedTokens.length > 0 && (
								<SuccessBox>
									<i className="fa fa-check" aria-hidden="true"></i>
									<SuccessTitle><span>All done!</span> You successfully set up a new bridge</SuccessTitle>
								</SuccessBox>
								)}

								{wrappedTokens.length  === 0 && (
								<SuccessBox>
									<i className="fa fa-exclamation" aria-hidden="true"></i>
									<SuccessTitle>You've not wrapped any token yet</SuccessTitle>
								</SuccessBox>
								)}

								<Ulist>
									{wrappedTokens.length > 0 &&
									<List>
										<ListTxt className="title">New bridge</ListTxt>
										<ListTxt className="title">Wrap token smart contract</ListTxt>
									</List>
									}
									{wrappedTokens.length > 0 && wrappedTokens.map(function (wrappedToken, i) {
										return (
											<List key={i}>
												<ListTxt><span>sb{wrappedToken.tokenSymbol}</span><span>{wrappedToken.chain}</span></ListTxt>
												<ListTxt><ListLink>{wrappedToken.address === null ? 'FETHING...' : wrappedToken.address}</ListLink></ListTxt>
											</List>
										)
									})}
									<ListFooter>
										<LinkGreen onClick={e => this.props.onAddMoreBridgeButtonClicked()}>+ Add more bridges </LinkGreen>
										<LinkFt>Projects, claim the bridge deployer to become the master validator   <i className="fas fa-external-link-alt"></i></LinkFt>
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

const SuccessBox = styled.div`
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
		&.fa-exclamation {
			border: 3px solid #ffc107;
			color: #ffc107;
		}
	}
	`
const SuccessTitle = styled.div`
	font-size: 24px;
	color: #fff;
	font-weight: bold;
	margin-top: 30px;
	span {
		color: #91dc27;
		
	}
`
const Ulist = styled.ul`
	padding: 0;
	margin: 0;
	display: table;
	width: 900px;
	border-top: 2px solid #3b3e4b;
`
const List = styled.li`
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
const ListTxt = styled.div`
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
const ListLink = styled.a`
	padding: 0;
	margin: 0;
	list-style: none;
	color: #2d52f3;
`
const ListFooter = styled.li`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	justify-content: space-between;
	padding: 17px 0;
`
const LinkGreen = styled.a`
	padding: 0;
	margin: 0;
	list-style: none;
	color: #91dc27;
	font-weight: bold;
`
const LinkFt = styled.a`
	padding: 0;
	margin: 0;
	list-style: none;
	color: #aaaaaa;
	i {
		margin-left: 5px;
	}
`




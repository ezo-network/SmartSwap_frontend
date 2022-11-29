import { PureComponent } from "react";
import { Link } from "react-router-dom";
import AnimatedNumber from "react-animated-numbers";
import axios from "axios";

export default class TokenTokenomicsStats extends PureComponent {
    constructor(props) {
        super();
        this.state = {
            amounts: {
                totalAmountSwapped: 0,
                feesGenerated: 0,
                smartBoughtBurned: 0,
                totalFeesReimbursed: 0,
                totalReimbursementStaking: 0
            },
        }
    }

    componentDidMount = async () => {
        this._componentMounted = true;
        if (this._componentMounted === true) {
            await this.updateTotalAmounts();
        }
    }

    async updateTotalAmounts() {
        let ttAm = 0;
        await axios
            .get(`https://api.smartswap.exchange/summaries`)
            .then((res) => {
                console.log(res.data.data)
                if (res.data.data.totalUsd) {
                    ttAm = (Number(res.data.data.totalUsd) + 1170526).toFixed(0)
                }
            })
            .catch((err) => {
                console.log('error', err);
            });
        console.log(ttAm)
        setTimeout(() => {
            this.setState({
                amounts: {
                    totalAmountSwapped: ttAm,
                    feesGenerated: 0,
                    smartBoughtBurned: 0,
                    totalFeesReimbursed: 0,
                    totalReimbursementStaking: 0
                }
            })
        }, 500)
    }

    render() {
        return (
            <>
                <div className="ssTitle01 wow fadeInLeft mb-25" data-wow-delay="0.2s">
                    SMART Tokenomics in Action
                </div>
                <div className="ssText01 wow fadeInLeft" data-wow-delay="0.4s" style={{ marginTop: "0px" }}>
                    SmartSwap does not utilize LPs or pools therefore fees
                    are used to support SMART through automatic buybacks.{" "}
                </div>

                <div className="stActMBX">
                    <div className="stActSbx01 wow zoomIn" data-wow-delay="0.1s">
                        {" "}
                        <span>
                            Total Amount Swapped
                        </span>
                        <div className="container">
                            $<AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.totalAmountSwapped}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber>
                        </div>{" "}
                    </div>
                    <div className="stActSbx01 wow zoomIn" data-wow-delay="0.2s">
                        {" "}
                        <span>Fees Generated</span>
                        <div className="container">
                            $<AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.feesGenerated}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber>
                        </div>{" "}
                    </div>
                    <div className="stActSbx01 wow zoomIn" data-wow-delay="0.3s">
                        {" "}
                        <span>
                            Smart Bought and Burned
                        </span>
                        <div className="container">
                            <AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.smartBoughtBurned}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber>
                        </div>{" "}
                    </div>
                    <div className="stActSbx01 wow zoomIn" data-wow-delay="0.4s">
                        {" "}
                        <span>Total Fees Reimbursed</span>
                        <div className="container">
                            $<AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.totalFeesReimbursed}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber> </div>{" "}
                    </div>
                    <div className="stActSbx01 wow zoomIn" data-wow-delay="0.5s">
                        {" "}
                        <span>
                            Total reimbursement staking
                        </span>
                        <div className="container">
                            <AnimatedNumber
                                includeComma
                                animateToNumber={this.state.amounts.totalReimbursementStaking}
                                fontStyle={{ fontSize: 25 }}
                                configs={[{ "mass": 1, "tension": 140, "friction": 126 }, { "mass": 1, "tension": 130, "friction": 114 }, { "mass": 1, "tension": 150, "friction": 112 }, { "mass": 1, "tension": 130, "friction": 120 }]}
                            ></AnimatedNumber>
                        </div>{" "}
                    </div>
                </div>
            </>
        )
    }
}
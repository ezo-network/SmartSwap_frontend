import { PureComponent } from "react";
import {Link} from "react-router-dom";

export default class CTAButtons extends PureComponent {
    render() {
        return (
            <>
                <div
                    className="ssBTNbar01 wow fadeInUp mt-145 mb-135" data-wow-delay="0.2s"
                    style={{ justifyContent: "center" }}
                >
                    <Link to="/ownLicence" className="ssBtn01">
                        FREE SMARTSWAP LICENSE
                    </Link>
                    <Link
                        to="/"
                        className="ssBtn02"
                        onClick={() => {
                            //this.openPopup("LiquidityProvider");
                        }}
                    >
                        <span>BECOME A SWAP PROVIDER</span>{" "}
                    </Link>
                </div>
            </>
        )
    }
}
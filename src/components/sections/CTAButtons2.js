import { PureComponent } from "react";
import {Link} from "react-router-dom";

export default class CTAButtons2 extends PureComponent {
    render() {
        return (
            <>
                <div className="btn-grp btn-grp-cm">
                    {/* <a className="btn btn-primary" href onClick={(e) => e.preventDefault()}>FREE SMARTSWAP LICENSE</a> */}
                    <a className="btn btn-primary" href onClick={(e) => e.preventDefault()}>APPLY FOR LICENSING</a>
                    <a className="btn btn-secondary" href onClick={(e) => e.preventDefault()}>BECOME A SWAP PROVIDER</a>
                    <Link className="btn btn-secondary" to='/freelisting'>FREE LISTING</Link>
                </div>
            </>
        )
    }
}
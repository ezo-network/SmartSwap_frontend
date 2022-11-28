import { PureComponent } from "react";

export default class LicensePartners extends PureComponent {
    render() {
        return (
            <>
                <div className="ssTitle01 wow fadeInUp mb-10" data-wow-delay="0.2s">License Partners</div>
                <div
                    className="VPMainBX wow fadeInUp" data-wow-delay="0.4s"
                    style={{
                        justifyContent: "center",
                        marginBottom: "80px",
                    }}
                >
                    <div className="VPSubBX01">
                        {" "}
                        <img src="images/lp-logo01.png" alt="" />{" "}
                    </div>
                    <div className="VPSubBX01">
                        {" "}
                        <img src="images/lp-logo02.png" alt="" />{" "}
                    </div>
                </div>
            </>
        )
    }

}
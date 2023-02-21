import { PureComponent } from "react";
import CONSTANT from "../../constants";

export default class HeroSectionVideoOverlay extends PureComponent {
    render() {
        return (
            <>
                <div className="fullscreen-bg">
                    <div className="fsbg_sad01"></div>
                    <div className="fsbg_container">
                        <video loop autoPlay muted className="fullscreen-bg__video">
                            {/* <source src={CONSTANT.PrePath + "/video/14559736-hd.mp4?v=1.18"} type="video/mp4" />
                            <source src={CONSTANT.PrePath + "/video/14559736-hd.ogv?v=1.18"} type="video/ogg" /> */}
                            <source src={"./video/14559736-hd.mp4?v=1.18"} type="video/mp4" />
                            <source src={"./video/14559736-hd.ogg?v=1.18"} type="video/ogg" />
                        </video>
                    </div>
                </div>
            </>
        )
    }
}
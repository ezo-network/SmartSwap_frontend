import { PureComponent } from "react";
import { Link } from "react-router-dom";

export default class AskMeAnythingVideo extends PureComponent {
    render() {
        return (
            <>
                <div className="ssTitle01 wow fadeInLeft" data-wow-delay="0.2s">
                    SmartSwap AMA Series:
                    <span>
                        Alon Goren (Draper-Goren-Holm) and Yoda (Jude) Regev
                    </span>
                </div>
                <div className="videoMcontent wow fadeInLeft" data-wow-delay="0.4s">
                    <div className="video-responsive">
                        <iframe
                            width="560"
                            height="315"
                            src={this.props.amaLink}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </>
        )
    }
}
import { PureComponent } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Carousel from "react-multi-carousel";
import SBLogo01 from "../../assets/images/sb-ICO-01.webp";
import SBLogo02 from "../../assets/images/sb-ICO-02.webp";
import SBLogo03 from "../../assets/images/sb-ICO-03.webp";
import SBLogo04 from "../../assets/images/sb-ICO-04.webp";
import SBLogo05 from "../../assets/images/sb-ICO-05.webp";
import SBLogo06 from "../../assets/images/sb-ICO-06.webp";
import SBLogo07 from "../../assets/images/sb-ICO-07.webp";
import SBLogo08 from "../../assets/images/sb-ICO-08.webp";
import SBLogo09 from "../../assets/images/sb-ICO-09.webp";
import SBLogo010 from "../../assets/images/sb-ICO-010.webp";
import SBLogo011 from "../../assets/images/sb-ICO-011.webp";

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1600 },
        items: 10,
        slidesToSlide: 1, // optional, default to 1.
    },
    desktop2: {
        breakpoint: { max: 1600, min: 1250 },
        items: 9,
        slidesToSlide: 1, // optional, default to 1.
    },
    desktop3: {
        breakpoint: { max: 1250, min: 1024 },
        items: 8,
        slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 4,
        slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 2,
        slidesToSlide: 1, // optional, default to 1.
    },
};

export default class SupportedBlockchainsCarousel extends PureComponent {
    constructor(props) {
        super();
        this.state = {}
    }

    componentDidMount = async () => {
        this._componentMounted = true;
        if (this._componentMounted === true) {
        }
    }

    render() {
        return (
            <>
                <div className="ssTitle01 wow fadeInRight" data-wow-delay="0.2s">Supporting blockchains</div>
                <Carousel className="wow fadeInRight caro-1" data-wow-delay="0.3s"
                    swipeable={false}
                    draggable={false}
                    showDots={false}
                    responsive={responsive}
                    ssr={true} // means to render carousel on server-side.
                    infinite={true}
                    autoPlay={false}
                    autoPlaySpeed={5000}
                    keyBoardControl={true}
                    customTransition="all 1sec"
                    transitionDuration={900}
                    containerclassName="carousel-container ani-1"
                    // removeArrowOnDeviceType={["tablet", "mobile"]}
                    deviceType={this.props.deviceType}
                    dotListclassName="custom-dot-list-style"
                    itemclassName="carousel-item-padding-40-px"
                >
                    <div className="sbSlide">
                        {" "}
                        <LazyLoadImage src={SBLogo01} alt="" />{" "}
                    </div>
                    <div className="sbSlide">
                        {" "}
                        <LazyLoadImage src={SBLogo02} alt="" />{" "}
                    </div>
                    <div className="sbSlide">
                        {" "}
                        <LazyLoadImage src={SBLogo03} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo04} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo05} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo06} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo07} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo08} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo09} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo010} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo011} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo03} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo04} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo05} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo06} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo07} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo08} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo09} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo010} alt="" />{" "}
                    </div>
                    <div className="sbSlide disable">
                        {" "}
                        <LazyLoadImage src={SBLogo011} alt="" />{" "}
                    </div>
                </Carousel>
            </>
        )
    }
}
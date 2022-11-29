import React from 'react';
import HeadFreeListing from "../components/Header/HeadFreeListing";

const DefaultLayout = ({ children }) => {
    return (
    <>
        <div id="main" className="smartSwap">
            <HeadFreeListing />
            <main>{children}</main>
        </div>
    </>
    );
};
export default DefaultLayout;
import React, { Component, useState } from 'react';
import { Link, Redirect } from "react-router-dom";
import Collapse from '@kunukn/react-collapse';
import { Scrollbars } from 'react-custom-scrollbars';

function SelectToken() {
    
    const [isOpen, setIsOpen] = useState(false);
    const onInit = ({ state, style, node }) => {
      setIsOpen(false);
    };

    const [showActive, setShowActive] = useState(false);
    const onToggleClick = () => setShowActive(!showActive);
  
    return (
      <>
        <div className="modal-outer">
               <div className="modal-content">
                    <div className="modal-header">
                        <div className="close-icon1">
                           <img src="images/close-icon.png" alt="" />
                        </div>
                        <div className='modal-top'>
                            <div className="modal-title">Select token 
                                <i className="help-circle">
                                    <i
                                        className="fas fa-question-circle protip"
                                        data-pt-position="top"
                                        data-pt-title="Help Text"
                                        aria-hidden="true"
                                    ></i>
                                </i>
                            </div>
                            <div className='custom-dropdown'>
                                <button onClick={() => { setIsOpen(state => !state); onToggleClick(); }} className={showActive ? 'active' : ''}>BNB <i class="fa fa-caret-down"></i></button>
                                <Collapse onInit={onInit} isOpen={isOpen}>
                                <div className='nn-list'>
                                    <p>ETH</p>
                                </div>
                                </Collapse>
                            </div>
                        </div>
                    </div>
                    <input type='text' placeholder='Search name or paste address' />
                    <div className='basetab-list'>
                        <div className='base-tab'>
                            <div className='img-outer'>
                                <img src="images/bnb1.png" alt='' />
                            </div>
                            <p>BNB</p>
                        </div>
                        <div className='base-tab'>
                            <div className='img-outer'>
                                <img src="images/ddBNB-icon.png" alt='' />
                            </div>
                            <p>WBNB</p>
                        </div>
                        <div className='base-tab'>
                            <div className='img-outer'>
                                <img src="images/bai.png" alt='' />
                            </div>
                            <p>BAI</p>
                        </div>
                        <div className='base-tab active'>
                            <div className='img-outer'>
                                <img src="images/tether.png" alt='' />
                            </div>
                            <p>USDT</p>
                            <div className='small-close'>
                                <img src="images/close-icon.png" alt="" />
                            </div>
                        </div>
                        <div className='base-tab'>
                            <div className='img-outer'>
                                <img src="images/busd-logo.png" alt='' />
                            </div>
                            <p>BUSD</p>
                        </div>
                    </div>
                    <div className='t-row'>
                        <div className='common-title'>Token name</div>
                        <i class="fa fa-arrow-down"></i>
                    </div>
                    <div className='grey-line'></div>
                    <Scrollbars style={{ height: 340 }}
                        renderTrackVertical={props => <div {...props} className="track-vertical" />}
                        renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
                        renderView={props => <div {...props} className="view" />}>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/ddBNB-icon.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>BNB</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/bnb1.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>WBNB</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/7up.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>7UP</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/ada.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ADA</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button><img src="images/empty-pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/ankr.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ANKR</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/any.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ANY</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/any-uni.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>anyUNI</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/ankr.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ANKR</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/any.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ANY</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/any-uni.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>anyUNI</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/ankr.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ANKR</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/any.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>ANY</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                        <div className='d-row'>
                            <div className='d-left'>
                                <div className='img-outer'>
                                    <img src="images/any-uni.png" alt='' />
                                </div>
                                <div className='d-detail'>
                                    <div className='d-title'><Link to='#'>anyUNI</Link></div>
                                </div>
                            </div>
                            <div className='d-right'>
                                <div className='d-title'>-</div>
                                <button className='active'><img src="images/pin.png" alt="" /></button>
                            </div>
                        </div>
                    </Scrollbars>
                    <div className='grey-line'></div>
                    <div className='m-link'>Having trouble finding a token?</div>
                </div>
           </div>
      </>
    );
  };

  export default SelectToken;
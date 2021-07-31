import React, { PureComponent } from "react";

export default function LedgerHistory(props) {

    return (

        <div className="transaction-histroryWrap">
            <div className="transaction-histroryBox">
                <div className="Title02 orange-Color">Send</div>
                <div className="trasaction-Amt"> {props.sentAmount} {props.sentCurrency} <span>({(Number(props.sentAmount) * Number(props.recivedAPrice)).toFixed(2)})</span> </div>
                <div className="trasaction-Date">{props.sentTxTime}</div>
                <div className="trasaction-Box">
                    <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Transaction Submitted</div>
                    <div className="trans-Id">{props.sentTx}</div>
                    <a href={props.sentTxLink} className="view-Trans ani-1" target="_blank">View transaction</a>
                </div>
            </div>
            <div className="arrow-Box"></div>
            <div className="transaction-histroryBox">
                {props.oracleTx !== undefined ? (
                    <div>
                        <div className="Title02 green-Color">Received <span></span></div>
                        <div className="trasaction-Amt"> {props.recivedAmount} {props.recivedCurrency} <span>({(Number(props.recivedAmount) * Number(props.recivedBPrice)).toFixed(2)})</span> </div>
                        <div className="trasaction-Date">{props.recivedTxTime}</div>
                        <div className="trasaction-Box">
                            <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
                            <div className="trans-Id">{props.oracleTx}</div>
                            <div className="tsb-LinkBox">
                                <a href={props.recivedTxLink} className="view-Trans ani-1" target="_blank">View transaction</a>
                                {/* <a href="javascript:void(0);" className="view-Trans02 ani-1 active" data-toggle="n-collapse" data-target="#trsBox01" aria-expanded="true" aria-controls="trsBox01">Break down fees <i className="fas fa-sort-down"></i></a> */}
                            </div>
                        </div>
                    </div>) : (
                    <div>
                        <div className="Title02 pending">
                            Pending <span></span>
                        </div>
                        <div className="trasaction-Amt">
                            ... {props.recivedCurrency}{' '}
                        </div>
                        <div className="trasaction-Box pendingColor">
                            <div className="trasaction-Status pending-Text">
                                Pending{' '}
                                <span className="pending-loader">
                                    <img src="images/loader2.gif" />
                                </span>
                            </div>
                        </div>
                        <p>
                            {/* <span>
                        <a href="javascript:void(0);"><i className="fas fa-cog"></i></a>
                    </span> */}
                            <a
                                href="javascript:void(0);"
                                className="ani-1"
                            >
                                Wait until few blocks confirmation
</a>
                        </p>
                    </div>
                )}


                {/* <div className="Title02 pending">Pending <span>(73.69%)</span></div>
                <div className="trasaction-Amt">10 ETH  <span>($2,500)</span></div>
                <div className="trasaction-Box pendingColor">
                    <div className="trasaction-Status pending-Text">Pending <span className="pending-loader"><img src="images/loader2.gif" /></span></div>
                </div>
                <p><span><a href="javascript:void(0);"><i className="fas fa-cog"></i></a></span><a href="javascript:void(0);" className="ani-1">Wait until a match will be found or cancel and redeem the 10 ETH pending to your wallet</a></p> */}
            </div>
        </div>

        // test

        // <div className="transaction-histroryWrap">
        //     <div className="transaction-histroryBox">
        //         <div className="Title02 orange-Color">Send</div>
        //         <div className="trasaction-Amt"> 50 ETH <span>($10,000)</span> </div>
        //         <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
        //         <div className="trasaction-Box">
        //             <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Transaction Submitted</div>
        //             <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
        //             <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
        //         </div>
        //     </div>
        //     <div className="arrow-Box"></div>
        //     <div className="transaction-histroryBox">
        //         <div className="Title02 green-Color">Received <span>(73.69%)</span></div>
        //         <div className="trasaction-Amt"> 0.25 BTC <span>($2,500)</span> </div>
        //         <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
        //         <div className="trasaction-Box">
        //             <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
        //             <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
        //             <div className="tsb-LinkBox">
        //                 <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
        //                 <a href="javascript:void(0);" className="view-Trans02 ani-1 active" data-toggle="n-collapse" data-target="#trsBox01" aria-expanded="true" aria-controls="trsBox01">Break down fees <i className="fas fa-sort-down"></i></a>
        //             </div>
        //             <div className="clearfix n-collapse in" id="trsBox01" aria-expanded="true" >
        //                 <div className="tsb-transHistoryBox">
        //                     <span>Network gas:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>3rd part validators fees:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>Transfer tokens:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>SmartSwap fee:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>SMART/2 Rebate:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="trasaction-Amt"> 0.25 BTC <span>($2,500)</span> </div>
        //         <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
        //         <div className="trasaction-Box">
        //             <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
        //             <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
        //             <div className="tsb-LinkBox">
        //                 <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
        //                 <a href="javascript:void(0);" className="view-Trans02 ani-1" data-toggle="n-collapse" data-target="#trsBox02" aria-expanded="false" aria-controls="trsBox02">Break down fees <i className="fas fa-sort-down"></i></a>
        //             </div>
        //             <div className="n-collapse clearfix" id="trsBox02">
        //                 <div className="tsb-transHistoryBox">
        //                     <span>Network gas:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>3rd part validators fees:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>Transfer tokens:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>SmartSwap fee:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>SMART/2 Rebate:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="trasaction-Amt"> 0.25 BTC <span>($2,500)</span> </div>
        //         <div className="trasaction-Date">Feb 2. 2019, 9:21am PST</div>
        //         <div className="trasaction-Box">
        //             <div className="trasaction-Status"><span className="icon-Box"><i className="fas fa-check-circle"></i></span>Funds wired to your wallet </div>
        //             <div className="trans-Id">X0456c19d5A61AeA886E6D657EsEF8849565</div>
        //             <div className="tsb-LinkBox">
        //                 <a href="javascript:void(0);" className="view-Trans ani-1">View transaction</a>
        //                 <a href="javascript:void(0);" className="view-Trans02 ani-1" data-toggle="n-collapse" data-target="#trsBox03" aria-expanded="false" aria-controls="trsBox03">Break down fees <i className="fas fa-sort-down"></i></a>
        //             </div>
        //             <div className="n-collapse clearfix" id="trsBox03">
        //                 <div className="tsb-transHistoryBox">
        //                     <span>Network gas:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>3rd part validators fees:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>Transfer tokens:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>SmartSwap fee:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //                 <div className="tsb-transHistoryBox">
        //                     <span>SMART/2 Rebate:<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-position="top" data-pt-title="Help Text here" aria-hidden="true"></i></i></span>
        //                     <span>0.00910955 Ether ($3.43)</span>
        //                     <span><a href="javascript:void(0);">View transaction</a></span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="Title02 pending">Pending <span>(73.69%)</span></div>
        //         <div className="trasaction-Amt">10 ETH  <span>($2,500)</span></div>
        //         <div className="trasaction-Box pendingColor">
        //             <div className="trasaction-Status pending-Text">Pending <span className="pending-loader"><img src="images/loader2.gif" /></span></div>
        //         </div>
        //         <p><span><a href="javascript:void(0);"><i className="fas fa-cog"></i></a></span><a href="javascript:void(0);" className="ani-1">Wait until a match will be found or cancel and redeem the 10 ETH pending to your wallet</a></p>
        //     </div>
        // </div>
    )
}
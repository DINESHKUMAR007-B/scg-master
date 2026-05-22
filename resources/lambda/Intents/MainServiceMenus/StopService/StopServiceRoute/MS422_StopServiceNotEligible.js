const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const getDateFormat = require("../../../../Helpers/Common/getDate");
//const initialConfirmation = require("../../../Initial/MS200_InitialConfirmation");

const StopServiceNotEligible = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let dateFormat;
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_StopServiceNotEligible";
        cxiSession.exitPoint = appSession.stateName;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_CutomerType";
        appSession.bargeIn = process.const.STR_False;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------

        let accountNumber = appSession.appSessionObj.contractAccount;

        const getBillAcctInfoObj = {};
        // getBillAcctInfoObj.action = "4";
        getBillAcctInfoObj.contractAccount = accountNumber;


        let MS_WS04_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_03_003_GET, getBillAcctInfoObj, intentRequest, intentName, callback);
        //logger.debug(MS_WS04_ReqObj);
        let MS_WS04_ResObj = await apiHelper.getResponseObject(MS_WS04_ReqObj, intentRequest, intentName, callback);
        //logger.debug(MS_WS04_ResObj);


        if (MS_WS04_ReqObj == null || MS_WS04_ResObj == undefined || MS_WS04_ResObj.status != 201 || MS_WS04_ResObj.status != "201") {

            //-------------CXI_apidetails-----------------------------------//
            let WS04Details = {};
            WS04Details.apiId = process.const.I_DG_03_003_GET;
            WS04Details.apiname = process.const.I_DG_03_003_GET_APIName;
            WS04Details.statusCode = MS_WS04_ReqObj == null || MS_WS04_ReqObj == undefined ? "500" : MS_WS04_ReqObj.status;
            WS04Details.apiStateResult = process.const.STR_Failure;
            WS04Details.errorMessage = process.const.STR_APIFail;
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS04Details);
            cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
            appSession.appSessionObj.dbFail = process.const.STR_true;
            //-------------CXI_apidetails-----------------------------------//

            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "close Order Process failure – customer Data.");
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }

        appSession.appSessionObj.GetChargesAndPaymentsMessageType = MS_WS04_ResObj?.data?.ZGMessage?.results?.[0]?.Type;
        appSession.appSessionObj.GetChargesAndPaymentsTypeMessage = MS_WS04_ResObj?.data?.ZGMessage?.results?.[0]?.Message;


        if (!appSession.appSessionObj.GetChargesAndPaymentsMessageType || appSession.appSessionObj.GetChargesAndPaymentsMessageType == "E") {
            //------------PUT CXI Keys----------------------------//
            let WS04Details = {};
            WS04Details.apiId = process.const.I_DG_03_003_GET;
            WS04Details.apiname = process.const.I_DG_03_003_GET_APIName;
            WS04Details.statusCode = MS_WS04_ReqObj.status;
            WS04Details.apiStateResult = process.const.STR_Failure;
            WS04Details.errorMessage = appSession.appSessionObj.GetChargesAndPaymentsTypeMessage;
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS04Details);
            cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
            appSession.appSessionObj.dbFail = process.const.STR_true;
            //-----------------------------------------------------//

            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "close Order Process failure – customer Data.");
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }

        //-------------------CXI_apidetails----------------------------------//
        let WS04Details = {};
        WS04Details.apiId = process.const.I_DG_03_003_GET;
        WS04Details.apiname = process.const.I_DG_03_003_GET_APIName;
        WS04Details.statusCode = MS_WS04_ReqObj.status;
        WS04Details.apiStateResult = process.const.STR_Success;
        WS04Details.errorMessage = appSession.appSessionObj.GetChargesAndPaymentsTypeMessage; //NTC
        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS04Details);
        cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
        //-----------------------------------------------------------------//

        appSession.appSessionObj.GetChargesAndPaymentsCurrentBillAmt = MS_WS04_ResObj.data?.ZGGetBalAcc?.results?.[0]?.CurrentBillAmt;
        appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate = MS_WS04_ResObj.data?.ZGGetBalAcc?.results?.[0]?.CurrentDueDate;
        appSession.appSessionObj.GetChargesAndPaymentsFinalBilledInd = MS_WS04_ResObj.data?.ZGGetBalAcc?.results?.[0]?.FinalBilledInd;
        appSession.appSessionObj.GetChargesAndPaymentsTotalBalance = MS_WS04_ResObj.data?.ZGGetBalAcc?.results?.[0]?.TotalBalance;
        if (!appSession.appSessionObj.GetChargesAndPaymentsTotalBalance) {
            appSession.appSessionObj.GetChargesAndPaymentsTotalBalance = 0;
        }

        if (appSession.appSessionObj.accountCloseDate && appSession.appSessionObj.accountCloseDate !== "") {
            dateFormat = getDateFormat.getDateName(appSession.appSessionObj.accountCloseDate, intentRequest);
        } else {
            dateFormat = "";
        }

        if (appSession.appSessionObj.GetChargesAndPaymentsFinalBilledInd == "Y") {
            logger.info("FinalBilledInd == Y true in MS422");
            appSession.appSessionObj.callerGoal = process.const.CG_close_order;
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1024Y);

            if (appSession.appSessionObj.GetPremiseContractStartDate) {
                logger.info("HasPendingOrder == true true in MS422");
                //currentAmtDue->value coming from get account info
                if (appSession.appSessionObj.GetChargesAndPaymentsTotalBalance == 0) {
                    logger.info("TotalBalance == 0 true in MS422");
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                    appSession.nextStateName = process.const.NS_StopServNotAnythingElse;
                    appSession.nextIntent = process.const.MS200;
                    promptOut = process.promptSession.scg_ccc_prmt_2333_main_01_AccClosStartNewServ;
                    appSession.fallBackState = process.const.STR_True;
                    callback(
                        util.DialogAction(
                            process.const.DA_Close,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_Fulfilled
                        )
                    );
                    return;
                }
                else {
                    //currentAmtDue->value coming from get account info
                    if (appSession.appSessionObj.GetChargesAndPaymentsTotalBalance < 0) {
                        logger.info("TotalBalance < 0 true in MS422");
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233310);
                        appSession.nextStateName = process.const.NS_StopServNotAnythingElse;
                        appSession.nextIntent = process.const.MS200;
                        promptOut = process.promptSession.scg_ccc_prmt_2333_main_02_AccClosNewServ;
                        appSession.fallBackState = process.const.STR_True;
                        callback(
                            util.DialogAction(
                                process.const.DA_Close,
                                intentRequest,
                                intentName,
                                util.BuildSSMLMessage(promptOut),
                                process.const.STR_Fulfilled
                            )
                        );
                        return;

                    }
                    else {
                        logger.info("TotalBalance < 0 false in MS422");
                        promptOut = process.promptSession.scg_ccc_prmt_2333_main_03_AccClosCurBal;
                        promptOut += '<say-as interpret-as="currency">' + "$" + appSession.appSessionObj.GetChargesAndPaymentsTotalBalance + '</say-as>';
                        if (appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate && appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate != "") {
                            dateFormat = getDateFormat.getDateName(appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate, intentRequest);
                            promptOut += process.promptSession.scg_ccc_prmt_2333_main_04_BillDueDt;
                            promptOut += dateFormat[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="mdy">' + dateFormat[0] + '</say-as>';
                        }
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233305);
                        callPath.SelfServiceDescription(process.const.CP_CloseOrderNotEligCloseBillOrPaidBalProvided, appSession);
                        appSession.nextStateName = process.const.NS_StopServBilledBalaAnythingElse;
                        appSession.nextIntent = process.const.MS200;
                        appSession.fallBackState = process.const.STR_True;
                        callback(
                            util.DialogAction(
                                process.const.DA_Close,
                                intentRequest,
                                intentName,
                                util.BuildSSMLMessage(promptOut),
                                process.const.STR_Fulfilled
                            )
                        );
                        return;
                    }
                }

            }
            else {
                logger.info("HasPendingOrder == true false in MS422");
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligible);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233310);
                if (appSession.appSessionObj.GetChargesAndPaymentsTotalBalance == 0) {
                    logger.info("TotalBalance == 0 true in MS422");
                    appSession.nextStateName = process.const.NS_StopServNotAnythingElse;
                    appSession.nextIntent = process.const.MS200;
                    promptOut = process.promptSession.scg_ccc_prmt_2333_main_08_AccClose;
                    appSession.fallBackState = process.const.STR_True;
                    callback(
                        util.DialogAction(
                            process.const.DA_Close,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_Fulfilled
                        )
                    );
                    return;
                }
                else {

                    if (appSession.appSessionObj.GetChargesAndPaymentsTotalBalance < 0) {
                        logger.info("TotalBalance < 0 true in MS422");
                        appSession.nextStateName = process.const.NS_StopServNotAnythingElse;
                        appSession.nextIntent = process.const.MS200;
                        promptOut = process.promptSession.scg_ccc_prmt_2333_main_07_AccNowClos;
                        appSession.fallBackState = process.const.STR_True;
                        callback(
                            util.DialogAction(
                                process.const.DA_Close,
                                intentRequest,
                                intentName,
                                util.BuildSSMLMessage(promptOut),
                                process.const.STR_Fulfilled
                            )
                        );
                        return;
                    }
                    else {
                        logger.info("TotalBalance < 0 false in MS422");
                        promptOut = process.promptSession.scg_ccc_prmt_2333_main_05_AccClosNowBal;
                        promptOut += '<say-as interpret-as="currency">' + "$" + appSession.appSessionObj.GetChargesAndPaymentsTotalBalance + '</say-as>';
                        if (appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate && appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate != "") {
                            dateFormat = getDateFormat.getDateName(appSession.appSessionObj.GetChargesAndPaymentsCurrentDueDate, intentRequest);
                            promptOut += process.promptSession.scg_ccc_prmt_2333_main_06_BilldueDt;
                            promptOut += dateFormat[1] + '<say-as interpret-as="date" format="mdy">' + dateFormat[0] + '</say-as>';
                        }
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligCloseBillOrPaidBalProvided);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233305);
                        callPath.SelfServiceDescription(process.const.CP_CloseOrderNotEligCloseBillOrPaidBalProvided, appSession);

                        appSession.nextStateName = process.const.NS_StopServBilledBalaAnythingElse;
                        appSession.nextIntent = process.const.MS200;
                        appSession.fallBackState = process.const.STR_True;
                        callback(
                            util.DialogAction(
                                process.const.DA_Close,
                                intentRequest,
                                intentName,
                                util.BuildSSMLMessage(promptOut),
                                process.const.STR_Fulfilled
                            )
                        );
                        return;
                    }
                }
            }
        }
        else {

            logger.info("FinalBilledInd == Y false in MS422");
            appSession.callerGoal = process.const.CG_close_order;
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ExistingClose1024);

            if (appSession.appSessionObj.GetPremiseContractStartDate) {// present
                logger.info("HasPendingOrder == true true in MS422");
                promptOut = (appSession.appSessionObj.accountCloseDate && appSession.appSessionObj.accountCloseDate !== "") ? process.promptSession.scg_ccc_prmt_2331_main_03_AcctCloseDt + '<break time="0.1s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + '</say-as>' : process.promptSession.scg_ccc_prmt_2331_main_02_AcctClose;
                promptOut += process.promptSession.scg_ccc_prmt_2331_main_04_StartServAddr;
            } else {
                logger.info("HasPendingOrder == true false in MS422");
                promptOut = (appSession.appSessionObj.accountCloseDate && appSession.appSessionObj.accountCloseDate !== "") ? process.promptSession.scg_ccc_prmt_2331_main_05_AcctCloseDt + '<break time="0.1s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + '</say-as>' : process.promptSession.scg_ccc_prmt_2331_main_06_AcctClose;
                promptOut += process.promptSession.scg_ccc_prmt_2331_main_07_CloseBillProcessTime;
            }

            //---------------anythingelse -------------------------------------
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNotEligCloseBillPending);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233110);
            callPath.SelfServiceDescription(process.const.CP_CloseOrderNotEligCloseBillPending, appSession);
            appSession.nextStateName = process.const.NS_AnythingElse;
            appSession.nextIntent = process.const.MS200;

            // return initialConfirmation.InitialConfirmation(intentRequest, callback);
            appSession.fallBackState = process.const.STR_True;
            callback(
                util.DialogAction(
                    process.const.DA_Close,
                    intentRequest,
                    intentName,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_Fulfilled
                )
            );
            return;
        }

    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    StopServiceNotEligible
};
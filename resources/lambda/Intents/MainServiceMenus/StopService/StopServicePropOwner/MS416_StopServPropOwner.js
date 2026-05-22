const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const stopService = require("../StopServiceRoute/MS426_StopServEvalDate_Pg3");

const StopServPropOwner = async function (intentRequest, callback) {
    // try {
    //     // console.log("require :: ", require("../StopServiceRoute/MS426_StopServEvalDate_Pg3"));
    //     // console.log("require :: ", require("../StopServiceRoute/MS426_StopServEvalDate_Pg3").greeting);
    //     logger.info("require :: " + require("../StopServiceRoute/MS426_StopServEvalDate_Pg3"));
    //     logger.info("require :: " + require("../StopServiceRoute/MS426_StopServEvalDate_Pg3").greeting);
    // } catch (error) {
    //     //console.log(error)
    //     logger.debug(error)
    // }
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let finalCloseDate;
    try {
        appSession.preStateName = appSession.stateName;
        appSession.baseLine = "MainServices";
        appSession.stateName = appSession.baseLine + "_StopServPropOwner";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------

        let WS01Details = {};
        if (appSession.appSessionObj.fromStopServEvalDatePg3 == "N" || appSession.appSessionObj.fromStopServEvalDatePg3 == "null" || appSession.appSessionObj.fromStopServEvalDatePg3 == undefined || appSession.appSessionObj.fromStopServEvalDatePg3 == null || appSession.appSessionObj.fromStopServEvalDatePg3 == "") {

            let accountNumber = appSession.appSessionObj.contractAccount;

            if (appSession.appSessionObj.closeDate) {
                finalCloseDate = appSession.appSessionObj.closeDate;
            } else {
                finalCloseDate = appSession.appSessionObj.userDate;
            }

            appSession.appSessionObj.finalCloseDate = finalCloseDate;

            logger.info("FinalCloseDate : " + appSession.appSessionObj.finalCloseDate);

            const SchedulingOperation2_WSObj = {};
            //SchedulingOperation2_WSObj.action = process.const.MatCode_GetActionCode;
            SchedulingOperation2_WSObj.contractAccount = accountNumber;
            SchedulingOperation2_WSObj.wantedDate = finalCloseDate;


            let MS_WS01_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_015_GET, SchedulingOperation2_WSObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ReqObj);
            let MS_WS01_ResObj = await apiHelper.getResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ResObj);

            if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || MS_WS01_ResObj.status != 201 || MS_WS01_ResObj.status != "201") {
                logger.info("GetMATCodeDetermination API Failure not equal to 200");
                //------------PUT CXI Keys----------------------------
                let WS01Details = {};
                WS01Details.apiId = process.const.I_DG_02_015_GET;
                WS01Details.apiname = process.const.I_DG_02_015_GET_APIName;
                WS01Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.status;
                WS01Details.apiStateResult = "Failure";
                WS01Details.errorMessage = "API Failure";;
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
                appSession.appSessionObj.dbFail = process.const.STR_true;
                //-----------------------------------------------------
                cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(
                    cxiSession.cxiSessionObj.exitReason,
                    (appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_moving_need_owner_and_ma) ?
                        process.const.ER_SchedulingOperation2_WS_Failure_moving :
                        process.const.ER_SchedulingOperation2_WS_Failure_close
                );
                appSession.appSessionObj.dbFail = process.const.STR_True;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            //logger.debug(MS_WS01_ResObj.data);
            appSession.appSessionObj.GetMatCodeMessageType = MS_WS01_ResObj?.data?.ZGMessage?.results?.[0]?.Type;
            appSession.appSessionObj.GetMatCodeTypeMessage = MS_WS01_ResObj?.data?.ZGMessage?.results?.[0]?.Message;

            if (!appSession.appSessionObj.GetMatCodeMessageType || appSession.appSessionObj.GetMatCodeMessageType == "E") {
                logger.info("GetMatCodeMessageType==E true");
                //------------PUT CXI Keys----------------------------//
                let WS01Details = {};
                WS01Details.apiId = process.const.I_DG_02_015_GET;
                WS01Details.apiname = process.const.I_DG_02_015_GET_APIName;
                WS01Details.statusCode = MS_WS01_ResObj.status;
                WS01Details.apiStateResult = process.const.STR_Failure;
                WS01Details.errorMessage = appSession.appSessionObj.GetMatCodeTypeMessage;
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
                appSession.appSessionObj.dbFail = process.const.STR_true;
                //-----------------------------------------------------//

                cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(
                    cxiSession.cxiSessionObj.exitReason,
                    (appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_moving_need_owner_and_ma) ?
                        process.const.ER_SchedulingOperation2_WS_Failure_moving :
                        process.const.ER_SchedulingOperation2_WS_Failure_close
                );
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }

            logger.info("GetMatCodeMessageType==S true");
            //-------------------CXI_apidetails----------------------------------//
            let WS01Details = {};
            WS01Details.apiId = process.const.I_DG_02_015_GET;
            WS01Details.apiname = process.const.I_DG_02_015_GET_APIName;
            WS01Details.statusCode = MS_WS01_ResObj.status;
            WS01Details.apiStateResult = process.const.STR_Success;
            WS01Details.errorMessage = appSession.appSessionObj.GetMatCodeTypeMessage;
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
            cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
            //-----------------------------------------------------------------//

            appSession.appSessionObj.GetMatCodeIsSoNeeded = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.IsSoNeeded;
            appSession.appSessionObj.GetMatCodeInstallation = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.Installation || "";
            appSession.appSessionObj.GetMatCodeMeterNumber = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.MeterNumber || "";
            appSession.appSessionObj.GetMatCodeSerialNumber = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.SerialNumber || "";
            appSession.appSessionObj.GetMatCodeMatCode = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.MatCode || "";
            appSession.appSessionObj.GetMatCodeOrderType = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.OrderType || "";
            appSession.appSessionObj.GetMatCodeAppStartDate = MS_WS01_ResObj?.data?.ZGMatApptInstln?.results?.[0]?.ZGMatApptList?.results?.[0]?.StartDate || "";

            // console.log("Installation", appSession.appSessionObj.GetMatCodeInstallation);

            if (appSession.appSessionObj.GetMatCodeIsSoNeeded == true) {
                logger.info("GetMatCodeIsSoNeeded == true true");
                if (!appSession.appSessionObj.GetMatCodeAppStartDate) {
                    logger.info("GetMatCodeAppStartDate is null");

                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StopServPropOwnerScheduleClosed);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230810);
                    cxiSession.cxiSessionObj.exitReason = (appSession.callerGoal == process.const.CG_moving || appSession.callerGoal == process.const.CG_moving_need_owner_and_ma) ? callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_MovingNoOCSSchedule) : callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_CloseNoOCSSchedule);
                    appSession.transfer = true;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
                else {
                    logger.info("GetMatCodeAppStartDate is not null");
                }
            }
            else {
                logger.info("GetMatCodeIsSoNeeded == true false");
            }
            logger.info("amPendingTON is True");
            appSession.nextStateName = process.const.NS_StopServEvalDate_Pg3;

            appSession.appSessionObj.fromStopServEvalDatePg3 = "Y";
            return require("../StopServiceRoute/MS426_StopServEvalDate_Pg3").StopServicePg3(intentRequest, callback);

        }
        logger.info("fromStopServEvalDatePg3  true in MS416");
        //appSession.nextIntent = process.const.MS200;
        appSession.nextStateName = process.const.NS_StopServPropOwner;
        return require("../../../Initial/MS200_InitialConfirmation").InitialConfirmation(intentRequest, callback);
        // callback(
        //     util.DialogAction(
        //         process.const.DA_Delegate,
        //         intentRequest,
        //         appSession.nextIntent,
        //         util.BuildSSMLMessage(""),
        //         process.const.STR_Fulfilled,
        //         activeContexts,
        //         process.const.STR_Default,
        //         intentRequest.sessionState.intent.slots,
        //     )
        // );
        // return;

    }

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    StopServPropOwner
};

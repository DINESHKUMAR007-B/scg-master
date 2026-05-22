const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const GetDate = require("../../../../Helpers/Common/getDate");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const stopServPropOwner = require("../../../../Intents/MainServiceMenus/StopService/StopServicePropOwner/MS416_StopServPropOwner");

const StopServicePg3 = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info(" Entered StopServicePg3");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_" + process.const.SN_StopServiceRoute;
        let currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];

        if (appSession.nextStateName == process.const.NS_StopServEvalDate_Pg3) {
            logger.info("MAIN_2303_StopServEvalDate_Pg3 Module Started");
            logger.info(" closeDate in NS_StopServEvalDate_Pg3 :" + appSession.appSessionObj.closeDate);
            logger.info(" userDate  in NS_StopServEvalDate_Pg3 :" + appSession.appSessionObj.userDate);

            appSession.appSessionObj.closeDate = appSession.appSessionObj.userDate;
            // ExitReason Close Date format
            appSession.appSessionObj.closeDate = appSession.appSessionObj.closeDate == null || appSession.appSessionObj.closeDate == undefined || appSession.appSessionObj.closeDate == "null" ? "" : appSession.appSessionObj.closeDate;
            const closeFormattedDate = appSession.appSessionObj.closeDate == "" ? "" : GetDate.convertDateFormat(appSession.appSessionObj.closeDate);
            //---------------------------------------
            //if (appSession.appSessionObj.from2306 == "Y" || appSession.appSessionObj.from2307 == "Y" && (appSession.callerGoal != process.const.CG_close_order_need_owner_and_ma || appSession.callerGoal != process.const.CG_moving_need_owner_and_ma)) {
            if (appSession.appSessionObj.from2306 == "Y") {

                logger.info("from2306 is true in MS426");
                //appSession.appSessionObj.fromMain2306 = process.const.STR_Y;
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_UserCloseDateConfirmed);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230305);
                //appSession.appSessionObj.closeDate = appSession.appSessionObj.userDate;
                appSession.appSessionObj.stopServiceAccepted = appSession.appSessionObj.stopServiceAccepted == undefined || appSession.appSessionObj.stopServiceAccepted == "undefined" || appSession.appSessionObj.stopServiceAccepted == null || appSession.appSessionObj.stopServiceAccepted == "null" || appSession.appSessionObj.stopServiceAccepted == "" ? "" : appSession.appSessionObj.stopServiceAccepted;
                //appSession.callerGoal = appSession.callerGoal == process.const.CG_close_order || appSession.callerGoal == process.const.CG_close_order_need_owner_and_ma ? process.const.CG_close_order_need_owner_and_ma : process.const.CG_moving_need_owner_and_ma;

                if (appSession.callerGoal === process.const.CG_close_order || appSession.callerGoal === process.const.CG_close_order_need_owner_and_ma) {
                    appSession.callerGoal = process.const.CG_close_order_need_owner_and_ma;
                } else {
                    appSession.callerGoal = process.const.CG_moving_need_owner_and_ma;
                }
                appSession.nextIntent = process.const.MS210;
                callback(
                    util.DialogAction(
                        process.const.DA_Delegate,
                        intentRequest,
                        appSession.nextIntent,
                        util.BuildSSMLMessage(""),
                        process.const.STR_Fulfilled,
                        activeContexts,
                        process.const.STR_Default,
                        intentRequest.sessionState.intent.slots,
                    )
                );
                return;

            }
            else {
                logger.info("from2306 is false in MS426");
                appSession.nextIntent = process.const.MS416;
                callback(
                    util.DialogAction(
                        process.const.DA_Delegate,
                        intentRequest,
                        appSession.nextIntent,
                        util.BuildSSMLMessage(""),
                        process.const.STR_Fulfilled,
                        activeContexts,
                        process.const.STR_Default,
                        intentRequest.sessionState.intent.slots,
                    )
                );
                return;
            }
            // }
        }

    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    StopServicePg3
};

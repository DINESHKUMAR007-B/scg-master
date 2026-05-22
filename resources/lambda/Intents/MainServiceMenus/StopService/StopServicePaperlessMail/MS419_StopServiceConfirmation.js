const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
//const configEmail = require("../../../../Helpers/Common/configEmail");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const StopServiceConfirmation = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let accountNumber;
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.SN_StopServiceConfirmation;
        cxiSession.exitPoint = appSession.stateName;
        // appSession.selfService = process.const.STR_Y;
        appSession.fallBackState = process.const.STR_False;
        //-----CXI----------------------------------//
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        //-----------------------------------------//
        //if (appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True) {
        //appSession.appSessionObj.stopServiceConfirmation = process.const.STR_False;
        //appSession.appSessionObj.hearDetails = appSession.appSessionObj.hearDetails == undefined || appSession.appSessionObj.hearDetails == "undefined" ? "N" : appSession.appSessionObj.hearDetails;
        // if (appSession.appSessionObj.isOnPaperless == process.const.STR_True && appSession.appSessionObj.hearDetails == process.const.STR_N) {
        //     appSession.callingMod = process.const.CM_StopServiceConfirmation;
        //     let accountNumber = appSession.appSessionObj.contractAccount;

        //     appSession.appSessionObj.accountNumberEmail = accountNumber;
        //     appSession.appSessionObj.notificationCode = process.const.STR_StopServiceNotificationCode;
        //     await configEmail.ConfigEmail(intentRequest, callback);
        // }
        // else {
            appSession.nextIntent = process.const.MS100;
            appSession.nextStateName = process.const.NS_AnythingElseBill;
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
        //}
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    StopServiceConfirmation
};

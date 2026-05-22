const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const StopServiceFinalBillAddress = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        //-----CXI----------------------------------//
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        //-----------------------------------------//
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.SN_StopServiceFinalBillAddress;
        cxiSession.exitPoint = appSession.stateName;
        appSession.nextIntent = process.const.MS100;
        appSession.nextStateName = process.const.NS_StopServiceFinalBillAddress;
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    StopServiceFinalBillAddress
};

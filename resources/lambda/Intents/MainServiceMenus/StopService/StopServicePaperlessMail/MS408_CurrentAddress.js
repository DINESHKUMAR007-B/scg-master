const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const CurrentAddress = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.SN_CurrentAddress;
        //-----CXI----------------------------------//
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        //-----------------------------------------//

        appSession.nextIntent = process.const.MS210;
        appSession.nextStateName = process.const.NS_BillSentMailConfirmation;

        logger.info("current address in MS408");
        appSession.appSessionObj.closeAddress = process.const.STR_ServiceAddress;
        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CurrentAddress);
        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232306);

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
    CurrentAddress
};

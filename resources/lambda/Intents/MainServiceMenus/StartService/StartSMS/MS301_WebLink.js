const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");

const WebLink = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {

        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.stateName + "_WebLink";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        appSession.nextStateName = process.const.NS_DiffNumberMenu;
        appSession.nextIntent = process.const.MS100;
        appSession.appSessionObj.smsType = "addressOnly";
        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_ReceiveTextMessageWithWebLink);
        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210135);
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
    WebLink
};

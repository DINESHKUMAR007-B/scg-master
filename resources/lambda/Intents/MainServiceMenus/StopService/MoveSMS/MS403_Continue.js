const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");

const Continue = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    let activeContexts = [];
    try {
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "Menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "Continue through Phone system");
        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220125);
        if (appSession.appSessionObj.movingSMSSw == "true") {
            logger.info("NO SMS");
            appSession.nextIntent = "MS414_StopServiceRoute";
            appSession.nextStateName = process.const.NS_StopServiceMoveSms;
            appSession.appSessionObj.movingSMSSw = process.const.STR_False;
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

            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_NotinterestedinMoveServiceDD);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220120);
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );

        }

    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    Continue
};

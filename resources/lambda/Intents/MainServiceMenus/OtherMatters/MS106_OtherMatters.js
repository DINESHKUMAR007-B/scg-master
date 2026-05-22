const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../Helpers/Common/agentHelper");
const callPath = require("../../../Helpers/Common/callPathHelper");
const OtherMatters = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());

    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_OtherMatters";
        cxiSession.exitPoint = appSession.stateName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        appSession.callerGoal = appSession.nextStateName == "MoveStopMenu" ?
            "move_other" : appSession.nextStateName == "FumigationReconnect_Menu" ?
                "reconnect_other" : appSession.nextStateName == "PostFNPMenu" ? "fnp_other" : appSession.nextStateName == "MainServices_Menu" || appSession.nextStateName == process.const.NS_MoreOptions ? "start_other" : appSession.callerGoal;
        //Keys used for caller history
        appSession.appSessionObj.lastCallerGoal = appSession.nextStateName == "FumigationReconnect_Menu" ?
            "reconnect_other" : "";
        appSession.appSessionObj.lastIntent = process.const.MS100;
        if (appSession.nextStateName == process.const.NS_PostFNPMenu) {
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Other Matters");
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250310);
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2503_PostFNPMenu- other matters");
        }
        if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
            appSession.authenticated == null || appSession.authenticated.length <= 0) {
            appSession.nextIntent = "AU100_InitialIdentification";
            appSession.nextBot = "Authentication_Bot";
            appSession.appSessionObj.fallBackState = process.const.STR_True;
            promptOut = " ";
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
        else if (appSession.authenticated == process.const.STR_True) {
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
    OtherMatters
};

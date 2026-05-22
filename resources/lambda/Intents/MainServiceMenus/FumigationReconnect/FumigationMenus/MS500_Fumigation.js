const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");

const Fumigation = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Fumigation";
        cxiSession.exitPoint = appSession.stateName;
        appSession.callerGoal = process.const.CG_fumigation;
        // appSession.appSessionObj.lastCallerGoal =  appSession.callerGoal;
        // appSession.appSessionObj.lastIntent = intentRequest.inputMode == "Text" ? process.const.MS500 : intentName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
            appSession.authenticated == null || appSession.authenticated.length <= 0) {
            appSession.nextIntent = "AU100_InitialIdentification";
            appSession.nextBot = "Authentication_Bot";
            appSession.appSessionObj.fallBackState = process.const.STR_True;
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
            appSession.nextIntent = process.const.MS300;
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
    }

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Fumigation
};

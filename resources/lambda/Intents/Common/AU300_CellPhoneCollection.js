const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const validateAddress = require("../../Helpers/Common/validateDate");
const bargeInNotAllowed = require("../../Intents/Common/AU109_BargeInNotAllowed");
const CellPhoneCollection = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {
        appSession.baseLine = appSession.baseLine == undefined ? process.const.Initial : appSession.baseLine;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_CellPhoneCollection;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------  
        appSession.callerGoal = process.const.CG_CellNumberCollection;
        appSession.appSessionObj.cellPhoneCollectionPrompt = "Y";
        //ADO Fix 1227802
        /*await bargeInNotAllowed.BargeInNotAllowed(appSession,intentRequest, callback);
        return;*/
        appSession.nextIntent = process.const.AU200;
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
    CellPhoneCollection
};

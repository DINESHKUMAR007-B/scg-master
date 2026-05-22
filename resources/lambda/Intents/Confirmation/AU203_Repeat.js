const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const bargeInNotAllowed = require("../../Intents/Common/AU109_BargeInNotAllowed");

const Repeat = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;  
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_Repeat;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        appSession.fallBackCounter = appSession.fallBackCounter > "0" ? "0" : appSession.fallBackCounter;
        await bargeInNotAllowed.BargeInNotAllowed(appSession, intentRequest, callback);
        return;
        /*switch (appSession.nextStateName) {
            case process.const.NS_CellPhnColl_PhoneNumberConfirmation:
            case process.const.NS_StreetNumber_Confirmation:    
            case process.const.NS_PhoneNumber_Confirmation:     
                appSession.nextIntent = process.const.AU200;
                break;
            default:
        }
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
        return;*/
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Repeat
};

const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");

const FumigationReconnect = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_ReconnectOrFumigation";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        if(appSession.nextStateName == "MainServices_Menu"){ //logic for previous logic change
            appSession.appSessionObj.callingMod =  process.const.CM_MAIN_2500;
        }
        appSession.nextIntent = process.const.MS100;
        appSession.nextStateName = process.const.NS_FumigationReconnect_Menu;
        //    appSession.appSessionObj.callingMod =  process.const.CM_MAIN_2500;
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
    FumigationReconnect
};

const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const restore = require("./MS504_Restore");

const Reconnect = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.nextStateName;
        appSession.callerGoal = process.const.CG_fnp;
       //appSession.appSessionObj.callingMod =  process.const.CM_MAIN_2500; //commented for previous logic change
       //appSession.appSessionObj.lastIntent = intentName;
        appSession.stateName = appSession.baseLine + "_Reconnect";

        return restore.Restore(intentRequest, callback);
        //  return agentHelper.AgentTransfer(
        //           intentRequest,
        //           intentName,
        //           promptOut,
        //           callback
        //         );
        // if (appSession.appSessionObj.ampSw == process.const.STR_True) {
        //     appSession.stateName = process.const.SN_FNPMenuAMP_SW_true;
            
        // }else {
        //     appSession.stateName = process.const.SN_FNPMenuAMP_SW_false;
        // }
        // appSession.nextStateName = appSession.stateName;
        //         //------------PUT CXI Keys----------------------------
        // cxiSession.cxiSessionObj.result = "Success";
        // cxiSession.cxiSessionObj.promptType = "Menu";
        // cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        // cxiSession.exitPoint = appSession.stateName;
        // //-----------------------------------------------------
        // appSession.nextIntent = process.const.MS100;
        // callback(
        //     util.DialogAction(
        //         process.const.DA_Delegate,
        //         intentRequest,
        //         appSession.nextIntent,
        //         util.BuildSSMLMessage(""),
        //         process.const.STR_Fulfilled,
        //         activeContexts,
        //         process.const.STR_Default,
        //         intentRequest.sessionState.intent.slots,
        //     )
        // );
        // return;
    }

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Reconnect
};

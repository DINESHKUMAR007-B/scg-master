const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");

const Details = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Details";
        appSession.callerGoal =  process.const.CG_fnp_tot_amt_due;
        appSession.appSessionObj.lastCallerGoal =  appSession.callerGoal;
        appSession.appSessionObj.CallGoalFlagDetails = "Y";
        //appSession.appSessionObj.lastIntent = intentRequest.inputMode == "Text" ? process.const.MS505 : intentName;
                //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------

    //     if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
    //         appSession.authenticated == null || appSession.authenticated.length <= 0) {
    //         appSession.nextIntent = "AU100_InitialIdentification";
    //         appSession.nextBot = "Authentication_Bot";
    //         appSession.appSessionObj.fallBackState = process.const.STR_True;
    //         callback(
    //             util.DialogAction(
    //                 process.const.DA_Close,
    //                 intentRequest,
    //                 intentName,
    //                 util.BuildSSMLMessage(promptOut),
    //                 process.const.STR_Fulfilled
    //             )
    //         );
    //         return;
    //     }

    //    else if (appSession.authenticated == process.const.STR_True) {
    //      cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPDetails);
    //      cxiSession.pegPath  = callPath.PegPath(cxiSession.pegPath, process.const.PP_250120);
    //         appSession.nextIntent =  process.const.MS504;
    //     callback(
    //         util.DialogAction(
    //             process.const.DA_StartIntent,
    //             intentRequest,
    //             appSession.nextIntent,
    //             util.BuildSSMLMessage(promptOut),
    //         )
    //     );
    //     return;
    //     }
    }

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Details
};

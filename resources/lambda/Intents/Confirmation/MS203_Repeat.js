const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");

const Repeat = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    try{
    appSession.preStateName = appSession.stateName;
    appSession.stateName = appSession.baseLine + "_Repeat";
    cxiSession.exitPoint = appSession.stateName;
    //------------PUT CXI Keys----------------------------
    cxiSession.cxiSessionObj.result = "Success";
    cxiSession.cxiSessionObj.promptType = "prompt";
    cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
    cxiSession.exitPoint = appSession.stateName;
    //-----------------------------------------------------
    let promptOut = " ";
    let activeContexts = [];
   // appSession.fallBackState = process.const.STR_True;
    appSession.nextIntent = appSession.appSessionObj.repeatIntent;
    appSession.appSessionObj.repeatIntentSw = process.const.STR_True;
    let intent;
    if (appSession.appSessionObj.repeatIntent == process.const.FallbackIntent) {
        appSession.appSessionObj.nextAction = "NextIntent";
        intent = intentName;
    } else {
        intent = appSession.nextIntent;
    }
    callback(
        util.DialogAction(
            process.const.DA_Delegate,
            intentRequest,
            intent,
            util.BuildSSMLMessage(""),
            process.const.STR_Fulfilled,
            activeContexts,
            process.const.STR_Default,
            intentRequest.sessionState.intent.slots
        )
    );
    return;
}
catch (error) {
    catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
}
};

module.exports = {
    Repeat
};

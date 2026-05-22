const util = require("../../../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const logger = require("../../../../Helpers/Utilities/logger");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");

const Reschedule = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());

    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Reschedule";
        cxiSession.exitPoint = appSession.stateName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------

        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_RescheduleRequested);


        return agentHelper.AgentTransfer(
            intentRequest,
            intentName,
            promptOut,
            callback
        );
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Reschedule
};

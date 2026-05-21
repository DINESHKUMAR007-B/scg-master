const agentHelper = require("../Common/agentHelper");
const sessionHelper = require('../../Helpers/Common/sessionHelper');
const logger = require("../Utilities/logger");

exports.CatchUpdate = function (error, intentRequest, intentName, callback) {
    logger.error("Exception: " + error);
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = "";
    appSession.callerGoal = process.const.CG_OtherMatters;
    cxiSession.cxiSessionObj.exitType = process.const.Cxi_BE_Failure;
    return agentHelper.AgentTransfer(
        intentRequest,
        intentName,
        promptOut, 
        callback
    );
}; 
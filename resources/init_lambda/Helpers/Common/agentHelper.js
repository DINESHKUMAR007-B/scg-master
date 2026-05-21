const util = require("../Utilities/getLexResponse");
const logger = require("../Utilities/logger");
const sessionHelper = require('../../Helpers/Common/sessionHelper');

const AgentTransfer = async function (intentRequest, intentName, prompt, callback) {
    let promptOut = " ";
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    try {
        logger.info("Agent Helper Flow Ended");
        promptOut = cxiSession.cxiSessionObj.exitType == process.const.Cxi_BE_Failure ? process.promptSession.scg_ccc_prmt_1000_init_07_CommonBEFailure : prompt;
        appSession.appSessionObj.fallBackState = cxiSession.cxiSessionObj.exitType == process.const.Cxi_BE_Failure ? process.const.STR_True : appSession.appSessionObj.fallBackState;
        cxiSession.callResult = process.const.Cxi_Agent_Transfer;
        appSession.transfer = process.const.STR_True;
        appSession.appSessionObj.phoneNumberCount = "0";
        appSession.appSessionObj.streetNumberCount = "0";
        appSession.appSessionObj.accountNumberCount = "0";
        appSession.nextStateName = "";
        cxiSession.cxiSessionObj.exitType = "";
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
    catch (error) {
        logger.error("Exception: " + error);
        appSession.transfer = process.const.STR_True;
        cxiSession.cxiSessionObj.exitType = process.const.Cxi_BE_Failure;
        appSession.appSessionObj.fallBackState = cxiSession.cxiSessionObj.exitType == process.const.Cxi_BE_Failure ? process.const.STR_True : process.const.STR_False;
        promptOut = cxiSession.cxiSessionObj.exitType == process.const.Cxi_BE_Failure ? process.promptSession.scg_ccc_prmt_1000_init_07_CommonBEFailure : prompt;
        callback(
            util.DialogAction(
                process.const.DA_Close,
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_Failed
            )
        );
        return;
    }
};

module.exports = {
    AgentTransfer
};

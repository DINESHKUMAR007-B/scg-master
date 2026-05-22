const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");

const MainMenu = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_MainMenu;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        appSession.appSessionObj.phoneNumberCount = "0";
        appSession.appSessionObj.accountNumberCount = "0";
        appSession.appSessionObj.multipleAccounts = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
            process.const.STR_False : appSession.appSessionObj.multipleAccounts;
        appSession.appSessionObj.singleAddressReturn = appSession.appSessionObj.errorCode == "425" || appSession.appSessionObj.errorCode == "475" ?
            process.const.STR_False : appSession.appSessionObj.singleAddressReturn;
        appSession.nextIntent = process.const.MA100;
        appSession.nextBot = process.const.Master_Bot;
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
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    MainMenu
};

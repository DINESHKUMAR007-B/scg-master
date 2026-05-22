const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const lex_Slots = require("../../Helpers/Common/slotHelper");
const MainMenu = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_MainMenu";
        cxiSession.exitPoint = appSession.stateName;
         //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        // appSession.appSessionObj.attrSelfService = appSession.appSessionObj.attrSelfService== undefined ? "":appSession.appSessionObj.attrSelfService;
        // appSession.appSessionObj.attrSelfService = appSession.appSessionObj.attrSelfService + appSession.callerGoal+'-Y,';
        // appSession.selfService = process.const.STR_Y;
        //-----------------------------------------------------
        delete appSession.appSessionObj.stopServiceConfirmation;
        delete appSession.appSessionObj.clsEmailRepeat;
        delete appSession.appSessionObj.emailSent;
        appSession.nextIntent = process.const.NI_MA100_InitialMenu;
        appSession.nextBot = "Master_Bot";
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

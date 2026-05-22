const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../Helpers/Common/agentHelper");

const StopService = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_" + process.const.MS_MoveStopMenu;
        cxiSession.exitPoint = appSession.stateName;
        appSession.nextIntent = process.const.MS100;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------

        if (appSession.appSessionObj.turnOffStopService == "true") {
            logger.info("DD-moveService");
            appSession.callerGoal = "close_order";
            appSession.ddService = "stop";
            appSession.appSessionObj.attr_DigitalDeflection = "Y";
            if (intentRequest.bot.localeId == "es_US") {



                if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                    appSession.authenticated == null || appSession.authenticated.length <= 0) {
                    appSession.nextIntent = "AU100_InitialIdentification";
                    appSession.nextBot = "Authentication_Bot";
                    appSession.appSessionObj.fallBackState = process.const.STR_True;
                    promptOut = "";
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
                promptOut = "";
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );




            }
            appSession.appSessionObj.ddService = "stop";
            appSession.appSessionObj.nextStateName = "DD_moveInit";
            appSession.appSessionObj.fallBackState = process.const.STR_True;
            appSession.nextIntent = process.const.MS210;
            promptOut = "";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
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


        appSession.nextStateName = "MoveStopMenu";
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
    StopService
};

const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const stopService = require("../../../../Intents/MainServiceMenus/StopService/StopServiceRoute/MS414_StopServiceRoute");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const StopService = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.bargeIn = process.const.STR_False;

        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_StopService";
        appSession.callerGoal = "close_order";
        appSession.appSessionObj.lastCallerGoal = appSession.callerGoal;
        appSession.appSessionObj.callingMod = "";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------

        appSession.appSessionObj.lastIntent = intentRequest.inputMode == "Text" ? process.const.MS400 : intentName;
        //   appSession.authenticated = process.const.STR_True; //HC
        //appSession.appSessionObj.spAccountId = "155058871";//HC
        //logger.info((appSession.appSessionObj.turnOffStopService).toLowerCase());
        logger.info("DD-StopService");

        if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
            appSession.authenticated == null || appSession.authenticated.length <= 0) {
            appSession.nextIntent = "AU100_InitialIdentification";
            appSession.nextBot = "Authentication_Bot";
            appSession.appSessionObj.fallBackState = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2200_main_04_ConfirmStopServ;
            //console.log("appName : ", appSession.appSessionObj.appName);
            logger.info("appName : " + appSession.appSessionObj.appName);
            if (appSession.appSessionObj.appName == "closeProcess" || appSession.appSessionObj.appName == "closeProcessSpn") {
                //console.log("appName == closeProcess ||closeProcessSpn true: ", appSession.authenticated);
                logger.info("appName == closeProcess ||closeProcessSpn true: " + appSession.authenticated);
                promptOut = "";
            }
            promptOut = ssmlMessage.ConvertSSML(promptOut);
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

        else if (appSession.authenticated == process.const.STR_True) {
            logger.info("MS400 Identified")
            appSession.nextIntent = process.const.MS414;

            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopService);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220010);

            if (appSession.appSessionObj.nextStateName == process.const.NS_MoveStopMenu) 
                {
                promptOut = process.promptSession.scg_ccc_prmt_2200_main_04_ConfirmStopServ;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                // appSession.nextStateName = process.const.NS_AccountValidation_OP1;
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
            //appSession.nextStateName = process.const.NS_AccountValidation_OP1;
            return stopService.StopService(intentRequest, callback);

        }
    }

    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    StopService
};

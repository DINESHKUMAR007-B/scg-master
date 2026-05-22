const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const lex_Slots = require("../../../../Helpers/Common/slotHelper");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");

const MoveService = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = "";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {

        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_MoveService";
        appSession.appSessionObj.lastIntent = intentRequest.inputMode == "Text" ? process.const.MS401 : intentName;
        appSession.bargeIn = process.const.STR_False;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        appSession.callerGoal = process.const.CG_moving;
        appSession.appSessionObj.lastCallerGoal = appSession.callerGoal;
        appSession.appSessionObj.callingMode = process.const.CM_MAIN_2000;
        //appSession.appSessionObj.businessHours = "open"; //HC



        if (appSession.appSessionObj.businessHours == "open") {

            if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                appSession.authenticated == null || appSession.authenticated.length <= 0) {
                appSession.nextIntent = "AU100_InitialIdentification";
                appSession.nextBot = "Authentication_Bot";
                appSession.appSessionObj.fallBackState = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2200_main_05_ConfirmMoveServ;
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

                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MoveService);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220015);
                if (appSession.appSessionObj.nextStateName == process.const.NS_MoveStopMenu) 
                    {
                    promptOut = process.promptSession.scg_ccc_prmt_2200_main_05_ConfirmMoveServ;
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
                    //  appSession.nextStateName = process.const.NS_AccountValidation_OP1;

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
        }
        else {
            if (appSession.appSessionObj.language.toLowerCase() == "english" && appSession.appSessionObj.type !== "2") {
                appSession.nextStateName = process.const.NS_Moving_SMSHrClose;
                appSession.nextIntent = process.const.MS210;
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
            else {
                if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                    appSession.authenticated == null || appSession.authenticated.length <= 0) {
                    appSession.nextIntent = "AU100_InitialIdentification";
                    appSession.nextBot = "Authentication_Bot";
                    appSession.appSessionObj.fallBackState = process.const.STR_True;
                    promptOut = process.promptSession.scg_ccc_prmt_2200_main_05_ConfirmMoveServ;
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
                if (appSession.authenticated == process.const.STR_True) {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MoveService);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220015);
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }

            }
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    MoveService
};

const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../../Helpers/Common/agentHelper");

const StartService = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {
        // appSession.authenticated = process.const.STR_True; //HC
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_StartService";
        appSession.callerGoal = process.const.CG_start_service;
        appSession.appSessionObj.isNotDay1Service = "true";
        //appSession.appSessionObj.lastCallerGoal =  appSession.callerGoal;
        //appSession.appSessionObj.lastIntent = intentRequest.inputMode == "Text" ? process.const.MS101 : intentName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.exitPoint = appSession.stateName;

        //-----------------------------------------------------
        //For upfront authentication fail take caller to Start service without authentication
        if (appSession.appSessionObj.upFrontAuthentication == "Failure") {
            appSession.nextIntent = process.const.MS300;
            if (appSession.appSessionObj.nextStateName == "MainServices_Menu") {
                appSession.fallBackState = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_prmt_2000_main_04_StartServiceConf;
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
        if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
            appSession.authenticated == null || appSession.authenticated.length <= 0) {
            appSession.nextIntent = "AU100_InitialIdentification";
            appSession.nextBot = "Authentication_Bot";
            appSession.appSessionObj.fallBackState = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2000_main_04_StartServiceConf;
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
            logger.info("authenticated true in MS101");
            appSession.nextIntent = process.const.MS300;//MS302_NewAddress
            if (appSession.appSessionObj.nextStateName == "MainServices_Menu" || appSession.appSessionObj.preStateName == "MainServices_MainServicesMenu") {
                appSession.fallBackState = appSession.appSessionObj.preStateName == "MainServices_MainServicesMenu" ? process.const.STR_True : appSession.fallBackState;
                promptOut = process.promptSession.scg_ccc_prmt_2000_main_04_StartServiceConf;
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    StartService
};

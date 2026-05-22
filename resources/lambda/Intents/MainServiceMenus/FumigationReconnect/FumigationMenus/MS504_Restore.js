const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const apiHelper = require("../../../../Helpers/Common/apiHelper");
const xmlTojson = require("../../../../Helpers/Common/soapApiReq");
const agentHelper = require("../../../../Helpers/Common/agentHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");
const Restore = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    appSession.startTime = util.getStartTime(new Date());
    let activeContexts = [];
    //appSession.authenticated = process.const.STR_True;
    try {
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "Menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Restore";
        logger.info("Entered MS504_Restore.js");
        if (appSession.nextStateName === process.const.NS_FumigationReconnect_Menu) {
            logger.info("nextStateName===NS_FumigationReconnect_Menu true");
            appSession.appSessionObj.from2501FNPMenu = process.const.STR_False;
            if (appSession.appSessionObj.ampSw == process.const.STR_True) {
                logger.info("ampSw == true true");
                appSession.nextStateName = process.const.NS_FNPMenuAMP_SW_true;
                appSession.callerGoal = process.const.CG_fnp;
                appSession.appSessionObj.callingMod = process.const.CM_MAIN_2500;
                appSession.nextIntent = process.const.MS100;
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

            } else {
                logger.info("ampSw == true false");
                // appSession.stateName = process.const.SN_FNPMenuAMP_SW_false;
                appSession.callerGoal = process.const.CG_fnp_restore;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPRestore);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250010);
            }
        } else if (appSession.nextStateName === process.const.NS_FNPMenuAMP_SW_true) {
            logger.info("nextStateName===NS_FNPMenuAMP_SW_true true");
            appSession.callerGoal = process.const.CG_fnp_restore;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPRestore);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250115);
            appSession.appSessionObj.from2501FNPMenu = process.const.STR_True;
        }

        //skipping authentication if user came from from MAIN_2501_FNPMenu
        if (appSession.appSessionObj.from2501FNPMenu != process.const.STR_True) {
            //console.log("from MAIN_2500_FumigationReconnectMenu in MS504_Restore");
            logger.info("from MAIN_2500_FumigationReconnectMenu in MS504_Restore");
            if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                appSession.authenticated == null || appSession.authenticated.length <= 0) {
                logger.info("authenticated false in MS504_Restore");
                appSession.nextIntent = "AU100_InitialIdentification";
                appSession.nextBot = "Authentication_Bot";
                appSession.appSessionObj.fallBackState = process.const.STR_True;
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
                logger.info("authenticated true in MS504_Restore");
                appSession.nextIntent = process.const.MS210;
                appSession.nextStateName = process.const.NS_Fumigation_Restore_Menu;
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
        } else {
            //console.log("from MAIN_2501_FNPMenu in MS504_Restore");
            logger.info("from MAIN_2501_FNPMenu in MS504_Restore");
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_Fumigation_Restore_Menu;
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
    Restore
};

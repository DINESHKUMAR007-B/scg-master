const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");

const Previous = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {

        appSession.stateName = appSession.nextStateName;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Previous";
        cxiSession.exitPoint = appSession.stateName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------


        if (appSession.nextStateName == "DD_processNumber") {
            appSession.nextStateName = "DD_stopProcess";
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

        }

        else if (appSession.nextStateName == process.const.NS_StopServDate) {
            appSession.nextStateName = process.const.NS_StopServAcceptDate;
            appSession.appSessionObj.dateCount = 0;
            appSession.nextIntent = process.const.MS210;
            cxiSession.cxiSessionObj.promptType = "prompt";
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

        else if (appSession.nextStateName == "StopServBilledPendingMenu" || appSession.nextStateName == process.const.NS_StopServiceExistingCloseMenu) {

            appSession.nextStateName = process.const.NS_MoveStopMenu;
            appSession.nextIntent = process.const.MS102;
            appSession.appSessionObj.fromPre = "Y";
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

        else if (appSession.nextStateName == "StopServBilledBalanceMenu") {

            appSession.nextStateName = "MoveStopMenu";
            appSession.nextIntent = "MS102_MoveStop";
            appSession.appSessionObj.fromPre = "Y";
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
        //else if (appSession.callerGoal == "move_stop"){
        else if (appSession.nextStateName == "MoveStopMenu") {
            appSession.nextIntent = "MS100_MainServicesMenu";
            appSession.nextStateName = "";
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
        //else if ((appSession.appSessionObj.callingMod == "MAIN_2500")&&(appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_true || appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_false)) { //commented for previous logic change
        else if (appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_true) { 
            appSession.nextIntent = process.const.MS100;
            appSession.nextStateName = process.const.NS_FumigationReconnect_Menu;
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
        else if ((appSession.appSessionObj.callingMod == "billingMenu" || appSession.appSessionObj.fromModule == "otherBillingMenu"||appSession.appSessionObj.fromModule == "AccountInformation"||appSession.appSessionObj.fromModule == "BillingMenu"||appSession.appSessionObj.fromModule == "fromMasterBot")&&appSession.appSessionObj.fromModule!=undefined) {
            
            appSession.nextStateName = appSession.appSessionObj.fromModule;
            appSession.nextBot = process.const.Billing_Bot;
             appSession.nextIntent =  "BP100_BillingMenu";
             if(appSession.appSessionObj.fromModule == "fromMasterBot"){
                appSession.nextIntent = process.const.NI_MA100_InitialMenu;
                appSession.nextBot = "Master_Bot";
                appSession.nextStateName = "";
            }
             delete(appSession.appSessionObj.fromModule);
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


        } else if (appSession.nextStateName == "FumigationReconnect_Menu") {
            logger.info("nextStateName == FumigationReconnect_Menu True in MS204");
            appSession.nextIntent = process.const.MS100;
            appSession.nextStateName = "MainServices_Menu";
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
        else if (appSession.nextStateName == process.const.NS_StopServBilledBalaAnythingElse) {
            appSession.nextIntent = "MS100_MainServicesMenu";
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
        else if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
            appSession.appSessionObj["phoneNumber" + "Count"] = 0;
            appSession.nextStateName = process.const.NS_DiffNumberMenu;
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

        }
        else if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
            appSession.appSessionObj["phoneNumber" + "Count"] = 0;
            appSession.nextStateName = process.const.NS_Move_PhNumConfirmMenu;
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

        }



    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Previous
};

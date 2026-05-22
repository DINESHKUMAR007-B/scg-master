const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");

const DontHaveIt = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_DontHaveIt";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        if(appSession.preStateName == "MainServices_CutomerType" || appSession.nextStateName == "CustomerCellPhone_Confirmation" ||
        appSession.nextStateName == "BusinessCustomerCellPhone_Confirmation" || appSession.preStateName == "MainServices_CellPhoneNumber" ||
        appSession.nextStateName == process.const.NS_Business_ExtensionNo || appSession.nextStateName == "StopServPropOwner"){
            if (appSession.appSessionObj.type == "2" && appSession.nextStateName != process.const.NS_Business_ExtensionNo){
            appSession.nextIntent = process.const.MS202;
            appSession.nextStateName = process.const.NS_Business_ExtensionNo;
            }
            else if(appSession.nextStateName == process.const.NS_Business_ExtensionNo){
            appSession.nextIntent = process.const.MS201;
            appSession.nextStateName = process.const.NS_BusinessExtensionNo_Confirmation;   
            }else{
            appSession.appSessionObj.phoneCellArea = "";
            appSession.appSessionObj.phoneCellNo = "";
            appSession.appSessionObj.phoneCellVerifSw = "Y";
            appSession.nextIntent = process.const.MS201;
            appSession.nextStateName = "CellPhoneNumber_Confirmation";
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
        /*else if (appSession.nextStateName == "") {
            appSession.nextIntent = process.const.MS202;
            appSession.nextStateName = "Business_ExtensionNo";
            callback(
                util.DialogAction(
                    process.const.DA_StartIntent,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(promptOut),
                )
            );
            return;
        }*/
        else if (appSession.nextStateName == process.const.NS_Initial_BusinessWorkExtNumber) {
            appSession.nextIntent = process.const.MS201;
            appSession.nextStateName = process.const.NS_BusinessExtensionNo_Confirmation;
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
        if (appSession.nextStateName == "Move_PhNumConfirmMenu" && (appSession.appSessionObj.businessHours == "open")) {
            logger.info("NO SMS");
            appSession.nextIntent = "MS414_StopServiceRoute";
            appSession.appSessionObj.movingSMSSw = process.const.STR_False;
            promptOut = process.promptSession.scg_ccc_prmt_2201_main_15_PbmProce;
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
                    else if (appSession.nextStateName == "Move_PhNumConfirmMenu" && (appSession.appSessionObj.businessHours == "closed")) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "Try again later or call back");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210165);
                        promptOut = process.promptSession.scg_ccc_prmt_2201_main_15_PbmProce;
                        return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                    }
        else if (appSession.nextStateName == "DiffNumberMenu") {
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "Smart phone number not provided");
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210160);
            if(appSession.appSessionObj.businessHours == "closed") {
                       
                        promptOut = process.promptSession.scg_ccc_prmt_2101_main_20_PhConfNo;
                        return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
            }
                    promptOut = process.promptSession.scg_ccc_prmt_2101_main_20_PhConfNo;
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Smart phone number not provided.");
            appSession.nextIntent = process.const.MS300;
            appSession.fallBackState = process.const.STR_True;
            appSession.bargeIn = process.const.STR_False;
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            callback(util.DialogAction(
                process.const.DA_Close,
                intentRequest,
                intentRequest.sessionState.intent.name,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_Fulfilled
            ));
            return;
        }
        else {
            appSession.nextIntent = "MS101_StartService";
            appSession.fallBackState = process.const.STR_True;
            callback(
                util.DialogAction(
                    process.const.DA_Close,
                    intentRequest,
                    intentName,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_Fulfilled
                )
            );
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    DontHaveIt
};

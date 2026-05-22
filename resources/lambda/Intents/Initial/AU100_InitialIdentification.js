const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const agentHelper = require("../../Helpers/Common/agentHelper");
const ivaHelper = require("../../Helpers/IVA/ivaHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const bargeInNotAllowed = require("../../Intents/Common/AU109_BargeInNotAllowed");
const InitialIdentification = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let WS04Details = {};
    try {
        appSession.baseLine = appSession.baseLine == undefined ? process.const.Initial : appSession.baseLine;
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_Identification;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------
        appSession.appSessionObj.phoneNumberCount = "0";
        appSession.appSessionObj.accountNumberCount = "0";
        appSession.appSessionObj.streetNumberCount = "0";
        appSession.fallBackCounter = appSession.fallBackCounter >= 1 ? 0 : appSession.fallBackCounter;
        appSession.appSessionObj.fallBackState = appSession.appSessionObj.fallBackState == process.const.STR_True ? process.const.STR_False : appSession.appSessionObj.fallBackState;
        //In Billing Account Number Retrieval To Get Phone Number
        if (appSession.appSessionObj.prevMA1000 == process.const.STR_True || appSession.appSessionObj.pbpGetPhoneNumber == process.const.STR_True) {
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.AU101;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithPhoneNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700200);
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
            promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_7002_auth_01_PhoneNumberMS : process.promptSession.scg_ccc_collect_7002_auth_02_PhoneNumber;
            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
            cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            callback(
                util.DialogAction(
                    process.const.DA_SwitchToIntentSlot,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_InProgress,
                    activeContexts,
                    PhoneNumberSlot
                )
            );
            return;
        }
        if (appSession.appSessionObj.aniIdentified == process.const.STR_True && appSession.appSessionObj.upFrontAuthentication != "Failure") {
            if (appSession.appSessionObj.ANI.length == 10 && appSession.appSessionObj.mailMailingAddress != null) {
                appSession.nextStateName = process.const.NS_AIN_Identified;
                //ADO Fix 1227802
                /*await bargeInNotAllowed.BargeInNotAllowed(appSession,intentRequest, callback);
                return;*/
                appSession.nextIntent = process.const.AU200;
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
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                let PhoneNumberSlot = process.const.STR_PhoneNumber;
                appSession.nextIntent = process.const.AU101;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithPhoneNumber);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700200);
                appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
                promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    process.promptSession.scg_ccc_collect_7002_auth_01_PhoneNumberMS : process.promptSession.scg_ccc_collect_7002_auth_02_PhoneNumber;
                activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                callback(
                    util.DialogAction(
                        process.const.DA_SwitchToIntentSlot,
                        intentRequest,
                        appSession.nextIntent,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_InProgress,
                        activeContexts,
                        PhoneNumberSlot
                    )
                );
                return;

            }
        }
        else if (parseInt(appSession.appSessionObj.noOfAccount)  > 1) {
            appSession.appSessionObj.getPhoneNumber = appSession.appSessionObj.ANI;
            appSession.appSessionObj.multipleAccounts = process.const.STR_True;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultipleAccounts);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700005);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StreetNumber);
            let StreetNumberSlot = process.const.STR_StreetNumber;
            appSession.nextIntent = process.const.AU102;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithStreetNumber);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700400);
            appSession.appSessionObj[StreetNumberSlot + "Retry"] = appSession.appSessionObj[StreetNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[StreetNumberSlot + "Retry"];
            promptOut = process.promptSession.scg_ccc_prmt_7000_auth_01_PhoneNumberRecognize + process.promptSession.scg_ccc_collect_7004_auth_01_StreetNumber;
                        cxiSession.cxiSessionObj.promptid = "scg_ccc_collect_7004_auth_01_StreetNumber";
                        cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            callback(
                util.DialogAction(
                    process.const.DA_SwitchToIntentSlot,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_InProgress,
                    activeContexts,
                    StreetNumberSlot
                )
            );
            return;
        }
        else {

            appSession.appSessionObj.aniIdentified = process.const.STR_False;
            appSession.appSessionObj.authenticated = process.const.STR_False;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.AU101;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AuthWithPhoneNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700200);
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = appSession.appSessionObj[PhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[PhoneNumberSlot + "Retry"];
            promptOut = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                process.promptSession.scg_ccc_collect_7002_auth_01_PhoneNumberMS : process.promptSession.scg_ccc_collect_7002_auth_02_PhoneNumber;
            activeContexts = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_StartOther || appSession.callerGoal == process.const.CG_NewConstruction || appSession.callerGoal == process.const.CG_TailorTreatmentPrediction ?
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_NewCustomer) : activeContexts;
            cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            callback(
                util.DialogAction(
                    process.const.DA_SwitchToIntentSlot,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_InProgress,
                    activeContexts,
                    PhoneNumberSlot
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
    InitialIdentification
};

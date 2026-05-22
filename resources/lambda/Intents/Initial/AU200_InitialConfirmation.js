const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const InitialConfirmation = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    try {
        appSession.preStateName = appSession.stateName; 
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_Confirmation;
        appSession.fallBackCounter = appSession.fallBackCounter >1 ? 0 : appSession.fallBackCounter;
        appSession.appSessionObj.fallBackState = process.const.STR_False;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "decision";  
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        let activeContexts = [];
        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Yes);
        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_No);
        switch (appSession.nextStateName) {
            case process.const.NS_EmergencyConfirmation:
                appSession.fallBackCounter = appSession.fallBackCounter >=1 ? 0 : appSession.fallBackCounter;
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_100401);
                promptOut = process.promptSession.scg_ccc_menu_1004_init_01_EmergencyConfirmMenu;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_AIN_Identified:
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Emergency);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_ANIRecognized);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700100);
                promptOut = process.promptSession.scg_ccc_menu_7001_auth_01_AddressConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.houseNumber + '</say-as>' + process.promptSession.scg_ccc_menu_7001_auth_01_AddressConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_7001_auth_01_AddressConfirmation";
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut,85);  
                break;
            case process.const.NS_CellPhoneCollection:
                appSession.nextStateName = process.const.NS_CellPhoneCollection_AddrFound;
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101401);
                promptOut = process.promptSession.scg_ccc_prmt_1014_init_04_AddrFound + '<say-as interpret-as="telephone">' + appSession.appSessionObj.cellPhone + '</say-as>' + process.promptSession.scg_ccc_menu_1014_init_06_CellPhnConfirmation;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_prmt_1014_init_04_AddrFound";
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut); 
                break;
            case process.const.NS_CellPhnColl_PhoneNumberConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101601);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                appSession.appSessionObj.cellPhoneConfirmationCount = appSession.appSessionObj.cellPhoneConfirmationCount == undefined ?
                    0 : appSession.appSessionObj.cellPhoneConfirmationCount;
                    promptOut =  process.promptSession.scg_ccc_menu_1016_init_05_CellPhoneConfirmation;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut); 
                break;
             case process.const.NS_PhoneNumber_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700201);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                promptOut =  process.promptSession.scg_ccc_menu_7002_auth_07_PhoneNumberConfirmationYN;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut,85); 
                break;  
            case process.const.NS_Different_PhoneNumber:
                activeContexts = [];
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Yes);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700300);
                promptOut = process.promptSession.scg_ccc_menu_7003_auth_02_DifferentPhoneNumber;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut); 
                break;
            case process.const.NS_StreetNumber_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                promptOut = process.promptSession.scg_ccc_menu_7005_auth_01_StreetNumberConfirmationYN;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut,85); 
                break;
            case process.const.NS_StreetNumber_DontHaveIt:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700401);
                promptOut = process.promptSession.scg_ccc_menu_7004_auth_04_StreetNumberDontKnow;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut); 
                break;
            case process.const.NS_AccountNumber_Confirmation:
                appSession.appSessionObj.getAccountNumber = appSession.appSessionObj.tempAccountNumber; 
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_700601);
                promptOut =  process.promptSession.scg_ccc_menu_7006_auth_11_AccountNumberConfirmationYN;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut,90);
                break;    
            default:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_101400);
                appSession.nextStateName = process.const.NS_CellPhoneCollection;
                promptOut = process.promptSession.scg_ccc_menu_1014_init_01_AddressConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.houseNumber + '</say-as>' + process.promptSession.scg_ccc_menu_1014_init_01_AddressConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_1014_init_01_AddressConfirmation";
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut); 
                break;
        } 
        callback(
            util.DialogAction(
                process.const.DA_ElicitIntentActiveContext,
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_Fulfilled,
                activeContexts,
            )
        );

        return;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    InitialConfirmation
};

const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");

const HearDetails = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_HearDetails";
        cxiSession.exitPoint = appSession.stateName;
                //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        
        switch (appSession.nextStateName) {
            case process.const.NS_AnythingElseBill:
                appSession.nextIntent = process.const.MS201;
                appSession.nextStateName = process.const.NS_BillSentMailConfirmation;
                appSession.appSessionObj.hearDetails = "Y";
                break;

            case process.const.NS_StopServAcceptDate:
            case process.const.NS_StopServDateConfirmation:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_Move_DifferentPhoneNumberConfirmation:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_StartServiceProcess:
                  appSession.nextIntent = process.const.MS210;
                  break;
            case process.const.NS_CustomerCellPhone_Confirmation:
            case process.const.NS_CellPhoneNumber_Confirmation:
            case process.const.NS_BusinessCustomerCellPhone_Confirmation:
            case process.const.NS_BusinessPhoneNumber_Confirmation:
            case process.const.NS_BusinessExtensionNo_Confirmation:
            case "StartService_DifferentPhoneNumberConfirmation":
                 appSession.nextIntent = process.const.MS210;
                 break;
            case process.const.NS_SendSMS_DifferentPhoneNumberConfirmation:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_StopServAcceptUserDate:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_StopServiceExistingCloseMenu:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_Moving_SMS:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_StopServiceExistingCloseCancel:
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_StopServiceExistingCloseAnythingElse:
                appSession.appSessionObj.confEmail = process.const.STR_N;
                appSession.nextIntent = process.const.MS210;
                break;
            case process.const.NS_StopServDate:
                 appSession.appSessionObj.dateCount=0;
                appSession.nextIntent = process.const.MS210;
                break;
            case "StartServiceAddressMenu":
                appSession.nextIntent = process.const.MS210;
                break;
            case "StopService_Pg2":
                appSession.nextIntent = process.const.MS210;
                break;
                case process.const.NS_BillSentMailConfirmation:
                    appSession.nextIntent = process.const.MS210;
                break;
                 case process.const.NS_StopServiceChangeAddressSpanish:
                    appSession.nextIntent = process.const.MS210;
                break;
                 case process.const.NS_CollectPhoneNumberConfirmation:
                    appSession.nextIntent = process.const.MS210;
                break;
                
                case process.const.NS_SMSMultiModelConfirmation:
                    appSession.nextIntent = process.const.MS210;
                break;
                 case process.const.NS_Fumigation_Restore_Menu:
                    appSession.nextIntent = process.const.MS210;
                break;
                case process.const.NS_PostFNPMenu:
                    //appSession.nextStateName =="DD_stopProcess"
                    appSession.nextIntent = process.const.MS210;
                break;
                case "DD_processNumberDifferent":
                    appSession.nextIntent = process.const.MS210;
                break;
                    case "DD_stopProcess":
                    case "DD_moveProcess":
                    case "DD_checkchangecancelProcess":  
                    appSession.nextStateName = appSession.nextStateName =="DD_stopProcess"?"DD_stopInit":
                    appSession.nextStateName == "DD_moveProcess"?"DD_moveInit": appSession.nextStateName =="DD_checkchangecancelProcess"?"DD_CheckChangeCancelInit":appSession.nextStateName;
                  
                    appSession.nextIntent = process.const.MS210;
                break;

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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    HearDetails
};

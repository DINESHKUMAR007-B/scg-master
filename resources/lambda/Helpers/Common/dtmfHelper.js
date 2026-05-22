const logger = require("../Utilities/logger");
exports.DtmfHelper = function (intentRequest, appSession) {
    let inputTranscript = intentRequest.inputTranscript;
    let intentName;
    let dtmfOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let availableIntents;
    //console.info("Entered DTMF Helper JS");
    logger.debug("Entered DTMF Helper JS");
    switch (appSession.nextStateName) {

        case process.const.NS_MainServices_Menu:
            availableIntents = ["MS101_StartService", "MS102_MoveStop", "MS103_ReconnectFumigation", "MS107_MoreOptions"];
            break;
        case process.const.NS_MoveStopMenu:
            availableIntents = ["MS400_StopService", "MS401_MoveTransfer", "MS106_OtherMatters", "MS203_Repeat", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_MoreOptions:
            availableIntents = ["MS104_NewConstructionService", "MS105_CheckChangeCancelService", "MS106_OtherMatters", "MS203_Repeat", "MS108_MainMenu"];
            break;
        case process.const.NS_FumigationReconnect_Menu:
            availableIntents = ["MS500_Fumigation", "MS504_Restore", "MS106_OtherMatters", "MS203_Repeat", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_FNPMenuAMP_SW_true:
            availableIntents = ["MS502_Forgiveness", "MS504_Restore", "MS203_Repeat", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_FNPMenuAMP_SW_false:
            availableIntents = ["MS410_PayMyBill", "MS504_Restore", "MS505_Details", "MS203_Repeat", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_PostFNPMenu:
            availableIntents = ["MS205_HearDetails", "MS106_OtherMatters", "MS204_Previous", "MS203_Repeat", "MS108_MainMenu"];
            break;
        case process.const.NS_StopCancel:
        case process.const.NS_StopAnyThingElse:
        case process.const.NS_StopAnyThingElseMaxRetry:
        case process.const.NS_CommonMainAnyThingElse:
        case process.const.NS_ApartmentNumberConfirmation:
        case process.const.NS_StopServFumStop:
        case process.const.NS_FullAddressConfirmation:
        case process.const.NS_SmartPhoneConfirmation:
        case process.const.NS_WebLinkConfirmation:
        case process.const.NS_SmartPhoneWebLinkConfimation:
        case process.const.NS_StopServPropOwner:
        case "Business_ExtensionNo":
        case process.const.NS_StopCancel:
        case process.const.NS_StopCancel:
        case process.const.NS_StopServOwnerName:
        case process.const.NS_StopServOwnerInfo:
        case process.const.NS_StopServiceFinalAnythingElse:

            availableIntents = [process.const.MS201, process.const.MS202];
            break;
        case "DD_stopProcess":
        case "DD_moveProcess":
        case "DD_checkchangecancelProcess":
            availableIntents = [process.const.MS201, process.const.MS202, "MS205_HearDetails"];
            break;
        case "StopServBilledBalanceMenu":
            availableIntents = ["MS410_PayMyBill", "MS203_Repeat", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_StopServiceChangeAddressSpanish:
        case process.const.NS_BillSentMailConfirmation:
        case process.const.NS_CollectPhoneNumberConfirmation:
        case process.const.NS_StopServDateConfirmation:
        case process.const.NS_SMSMultiModelConfirmation:
        case process.const.NS_StopServiceExistingCloseCancel:
        case process.const.NS_SendSMS_DifferentPhoneNumberConfirmation:
        case process.const.NS_Move_DifferentPhoneNumberConfirmation:
        case process.const.NS_Moving_SMS:
        case process.const.NS_StopServAcceptDate:
        case process.const.NS_topServDateConfirmation:
        case process.const.NS_StopServAcceptUserDate:
        case "StartServiceProcess":
        case "CustomerCellPhone_Confirmation":
        case "CellPhoneNumber_Confirmation":
        case "BusinessCustomerCellPhone_Confirmation":
        case "BusinessPhoneNumber_Confirmation":
        case "BusinessExtensionNo_Confirmation":
        case "StartService_DifferentPhoneNumberConfirmation":
        case process.const.NS_StopService_Pg2:
        case "DD_processNumberDifferent":
            availableIntents = [process.const.MS201, process.const.MS202, process.const.MS205];
            break;

        case process.const.NS_Initial_CellPhoneNumber:
            availableIntents = [process.const.MS209];
            break;
        case process.const.NS_StopServiceExistingCloseMenu:
            availableIntents = ["MS405_Reschedule", "MS406_Cancel", "MS205_HearDetails", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_StopServiceExistingCloseAnythingElse:
            if (appSession.appSessionObj.language == process.const.LA_English) {
                availableIntents = ["MS205_HearDetails", "MS407_SendSMS", "MS201_Yes", "MS108_MainMenu"];
            } else {
                availableIntents = ["MS205_HearDetails", "MS201_Yes", "MS108_MainMenu"];
            }
            break;
        case process.const.NS_AnythingElse:
            availableIntents = ["MS201_Yes", process.const.MS202, "MS206_Operator"];
            break;
        case process.const.NS_StopServNotEligible:
            availableIntents = ["MS201_Yes", process.const.MS202, "MS206_Operator"];
            break;
        case process.const.NS_CheckChangeCancelAnythingElse:
            availableIntents = ["MS201_Yes", process.const.MS202, "MS206_Operator"];
            break;
        case process.const.NS_StopServNotAnythingElse:
            availableIntents = ["MS201_Yes", process.const.MS202, "MS206_Operator"];
            break;
        case process.const.NS_StopServConfNumberSMS:
            availableIntents = ["MS402_SameNumber", "MS303_DifferentNumber"];
            break;
        case "DD_processNumber":
            availableIntents = ["MS402_SameNumber", "MS303_DifferentNumber", "MS203_Repeat"];
            break;
        case process.const.NS_Move_PhNumConfirmMenu:
            availableIntents = ["MS402_SameNumber", "MS303_DifferentNumber", "MS403_Continue", "MS203_Repeat"];
            break;
        case process.const.NS_StopServBilledBalaAnythingElse:
            availableIntents = ["MS410_PayMyBill", "MS206_Operator", "MS203_Repeat", "MS204_Previous", "MS108_MainMenu"];
            break;
        case process.const.NS_SendSMSDiffSamePhNo:
            availableIntents = ["MS402_SameNumber", "MS303_DifferentNumber"];
            break;
        case process.const.NS_AnythingElseBill:
            if (appSession.appSessionObj.language == process.const.LA_English) {
                availableIntents = [process.const.MS205, process.const.MS407, process.const.MS410, process.const.MS108];
            } else {
                availableIntents = [process.const.MS205, process.const.MS410, process.const.MS108];
            }
            break;
        case process.const.NS_StopServiceFinalBillAddress:
            const hasMailingAddress = !!appSession.appSessionObj.zgMailingAddress?.trim();
            if (hasMailingAddress) {
                // If mailing address exists, use the "_New" prompt
                availableIntents = [process.const.MS408, process.const.MS427, process.const.MS409];
            } else {
                // If mailing address missing/empty, use normal prompt
                availableIntents = [process.const.MS408, process.const.MS409];
            }
            break;
        case "StartServiceAddressMenu":
            availableIntents = ["MS302_NewAddress", "MS301_WebLink", "MS205_HearDetails"];
            break;
        case process.const.NS_DiffNumberMenu:
            availableIntents = ["MS201_Yes", "MS303_DifferentNumber"];
            break;
        case process.const.NS_StopServDate:
            availableIntents = [process.const.MS204, process.const.MS205, process.const.MS415];

        default:
            availableIntents = [];
            break;
    }
    if (dtmfOptions.includes(inputTranscript)) {
        if (inputTranscript == "7" && availableIntents.includes(process.const.MS203)) {
            intentName = process.const.MS203;
        }
        else if (inputTranscript == "8" && availableIntents.includes(process.const.MS204)) {
            intentName = process.const.MS204;
        }
        else if (inputTranscript == "9" && availableIntents.includes(process.const.MS108)) {
            intentName = process.const.MS108;
        }
        else {
            const index = parseInt(inputTranscript, 10) - 1;
            if (availableIntents[index] === process.const.MS203 || availableIntents[index] === process.const.MS204 || availableIntents[index] === process.const.MS108) {
                intentName = process.const.FallbackIntent;
            }
            else {
                intentName = availableIntents[index] || process.const.FallbackIntent;
            }

        }
    }
    else {
        intentName = process.const.FallbackIntent;
    }
    intentRequest.sessionState.intent.name = intentName;
    return intentName;
};

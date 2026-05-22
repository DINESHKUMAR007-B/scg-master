const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const lex_Slots = require("../../Helpers/Common/slotHelper");
const getDateFormat = require("../../Helpers/Common/getDate");
const callPath = require("../../Helpers/Common/callPathHelper");
const InitialConfirmation = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let date, dateFormat;
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_Confirmation";
        cxiSession.exitPoint = appSession.stateName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "Decision";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        appSession.fallBackCounter = appSession.fallBackCounter >= 1 ? 0 : appSession.fallBackCounter;

        let activeContexts = [];
        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Yes);
        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_No);
        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
        appSession.fallBackState = process.const.STR_False;
        cxiSession.cxiSessionObj.promptIdFlag = "Y";
        switch (appSession.nextStateName) {
            case "DD_stopInit":
            case "DD_moveInit":
            case "DD_CheckChangeCancelInit":

                let ddService = appSession.nextStateName == "DD_stopInit" ? "stop " :
                    appSession.nextStateName == "DD_moveInit" ? "move " : appSession.nextStateName == "DD_checkchangecancel" ? "checkchangecancel" : "main ";
                appSession.appSessionObj.ddServiceApp = ddService;
                appSession.nextStateName = appSession.nextStateName == "DD_stopInit" ? "DD_stopProcess" :
                    appSession.nextStateName == "DD_moveInit" ? "DD_moveProcess" : appSession.nextStateName == "DD_CheckChangeCancelInit" ? "DD_checkchangecancelProcess" : appSession.nextStateName;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Yes);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_No);
                promptOut = process.promptSession.scg_ccc_menu_2201_main_02_DD_Day1;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StartServiceProcess:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210100);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2101_main_02_StartServiceProcess;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case "DD_processNumberDifferent":
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2201_main_12_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;

            case process.const.NS_StopCancel:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230100);
                promptOut = process.promptSession.scg_ccc_menu_2301_main_01_NotStopService;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopService_Pg2:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230200);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2302_main_02_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_StopServFumStop:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230400);
                promptOut = process.promptSession.scg_ccc_menu_2304_main_01_StopServFum;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServOwnerName:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231100);
                promptOut = process.promptSession.scg_ccc_menu_2311_main_01_PropertyOwnerConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServOwnerInfo:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231200);
                promptOut = process.promptSession.scg_ccc_menu_2312_main_01_OwnerConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_CustomerCellPhone_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231700);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2317_main_02_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_BusinessCustomerCellPhone_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231400);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2314_main_03_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_CellPhoneNumber_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231801);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                appSession.appSessionObj.cellPhoneConfirmationMSCount = appSession.appSessionObj.cellPhoneConfirmationMSCount == undefined ?
                    0 : appSession.appSessionObj.cellPhoneConfirmationMSCount;
                promptOut = process.promptSession.scg_ccc_menu_2318_main_05_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_BusinessPhoneNumber_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231501);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                appSession.appSessionObj.businessPhoneConfirmationMSCount = appSession.appSessionObj.businessPhoneConfirmationMSCount == undefined ?
                    0 : appSession.appSessionObj.businessPhoneConfirmationMSCount;
                promptOut = process.promptSession.scg_ccc_menu_2315_main_05_Confirmation;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_Business_ExtensionNo:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231502);
                promptOut = process.promptSession.scg_ccc_menu_2315_main_08_ExtensionConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_BusinessExtensionNo_Confirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231601);
                appSession.appSessionObj.businessExtensionNumberMSCount = appSession.appSessionObj.businessExtensionNumberMSCount == undefined ?
                    0 : appSession.appSessionObj.businessExtensionNumberMSCount;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2316_main_05_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_BillSentMailConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232100);
                logger.info("nextStateName == NS_BillSentMailConfirmation true in MS200 ");
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2321_main_03_OrderAccept;
                appSession.appSessionObj.softCloseProvided = process.const.STR_Y;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;

            case process.const.NS_StopServiceChangeAddressSpanish:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232400);
                logger.info("nextStateName == NS_StopServiceChangeAddressSpanish true in MS200 ");
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2324_main_02_AccptSchedule;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_SmartPhoneConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232600);
                promptOut = process.promptSession.scg_ccc_menu_2326_main_01_SmartPhnConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_WebLinkConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232601);
                //promptOut = process.promptSession.scg_ccc_prmt_2326_main_04_WebLinkTxt + '<break time="0.1s"/>' + process.promptSession.scg_ccc_menu_2326_main_06_WebLinkConfirm;
                promptOut = process.promptSession.scg_ccc_menu_2326_main_06_WebLinkConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_SmartPhoneWebLinkConfimation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232602);
                promptOut = process.promptSession.scg_ccc_menu_2326_main_09_SmartPhWebLinkConfim;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_CollectPhoneNumberConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232604);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2326_main_16_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_FullAddressConfirmation:
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210512);
                    } else {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210503);
                    }

                } else {
                    if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232513);
                    } else {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232503);
                    }
                }
                promptOut = process.promptSession.scg_ccc_menu_2325_main_02_AddrConfirm + '<say-as interpret-as="digits">' + appSession.appSessionObj.streetNumberCollected + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressStopService + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="digits">' + appSession.appSessionObj.zipCodeCollected + '</say-as>' + process.promptSession.scg_ccc_menu_2105_main_02_AddrConfirmCrt;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_2105_main_02_AddrConfirmCrt";
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_StopServiceExistingCloseCancel:

                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2329_main_02_Confrim;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_StopServiceExistingCloseAnythingElse:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232901);
                if (appSession.appSessionObj.language == process.const.LA_English) {
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_SMS);
                }
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                if (appSession.appSessionObj.emailSent == "true" || appSession.appSessionObj.emailSent == true) {
                    promptOut = appSession.preStateName == appSession.baseLine + "_HearDetails" ? " " : process.promptSession.scg_ccc_prmt_main_configEmail;
                }
                promptOut += process.promptSession.scg_ccc_menu_2329_main_08_AnthingElseStopServ;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_2329_main_08_AnthingElseStopServ";
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_StopServAcceptDate:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                //dateFormat = getDateFormat.getDate(appSession.appSessionObj.firstDate);
                promptOut = process.promptSession.scg_ccc_menu_2305_main_04_AcceptDate;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServDateConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230601);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                //dateFormat = getDateFormat.getDate(appSession.appSessionObj.stopServDate);
                promptOut = process.promptSession.scg_ccc_menu_2306_main_04_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServAcceptUserDate:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_InvalidCloseDate);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230715);

                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2307_main_02_AcceptDt;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServPropOwner:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230800);
                promptOut = process.promptSession.scg_ccc_menu_2308_main_01_OwnerConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_Moving_SMS:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220100);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Yes);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_No);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2201_main_02_MoveProcessConfirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_AnythingElse:
                //-----------------------------------anythingelse-----close_billed------------------------------
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServNotEligible:
                //-----------------------------------anythingelse-----close_billed------------------------------
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServNotAnythingElse:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_CheckChangeCancelAnythingElse:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServiceFinalAnythingElse:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233501);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_04_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopnotEligibleAnythingElse:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServBilledBalaAnythingElse:
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PayMyBill);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_MainMenu);
                promptOut = process.promptSession.scg_ccc_menu_2334_main_01_StopServBill;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_SendSMS_DifferentPhoneNumberConfirmation:

                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2336_main_08_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_StartService_DifferentPhoneNumberConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210104);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2101_main_16_PhConf;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_Move_DifferentPhoneNumberConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220103);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2201_main_12_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_CommonMainAnyThingElse:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232201);
                promptOut = process.promptSession.scg_ccc_menu_2322_main_07_AnthingElseBill;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_ApartmentNumberConfirmation:

                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210507);
                    } else {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210501);
                    }

                } else {
                    if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232507);
                    } else {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232501);
                    }
                }
                promptOut = process.promptSession.scg_ccc_collect_2105_main_15_AptNumberOrUnit;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopAnyThingElse:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopAnyThingElseMaxRetry:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232201);
                promptOut = process.promptSession.scg_ccc_menu_2322_main_07_AnthingElseBill;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_StopServiceExistingCloseAnythingElseMaxRetry:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232902);
                promptOut = process.promptSession.scg_ccc_menu_2329_main_11_AnythingsElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_SMSMultiModelConfirmation:
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232700);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2327_main_05_Confirm;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            default:
                appSession.nextStateName = process.const.NS_AnythingElse;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CommonAnythingElse);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233500);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Operator);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Hangup);
                promptOut = process.promptSession.scg_ccc_menu_2335_main_01_AnythingElse;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
        }
        //promptOut = ssmlMessage.ConvertSSML(promptOut);
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

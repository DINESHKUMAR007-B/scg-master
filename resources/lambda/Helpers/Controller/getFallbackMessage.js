const catchHelper = require("../Common/catchHelper");
const sessionHelper = require("../Common/sessionHelper");
const logger = require("../Utilities/logger");
const FallbackMessage = function (stateName, retryCount, outputSessionAttributes, intentRequest, callback) {
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    const intentName = intentRequest.sessionState.intent.name;
    try {
        let promptOut = retryCount == 1 ? process.promptSession.scg_ccc_prmt_2000_main_13_CommonRetry1 : process.promptSession.scg_ccc_prmt_2000_main_14_CommonRetry2;
        promptOut = appSession.appSessionObj.repeatIntentSw == process.const.STR_True ? '' : promptOut;
        switch (stateName) {
            case "DD_processNumberDifferent":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2201_main_14_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2201_main_13_Confirm;
                break;
            case "DD_processNumber":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2201_main_07_PhNumConfirm_Day1;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2201_main_06_PhNumConfirm_Day1;
                break;
            case "DD_stopProcess":
            case "DD_moveProcess":
            case "DD_checkchangecancelProcess":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2201_main_04_MoveProcessConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2201_main_03_MoveProcessConfirm;
                break;
            case process.const.NS_MainServices_Menu:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2000_main_03_ChangeService;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2000_main_02_ChangeService;
                break;
            case process.const.NS_Moving_SMS:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2201_main_04_MoveProcessConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2201_main_03_MoveProcessConfirm;
                break;
            case process.const.NS_Move_DifferentPhoneNumberConfirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2201_main_14_Confirm;
                    break;
                }

                promptOut += process.promptSession.scg_ccc_menu_ninm1_2201_main_13_Confirm;
                break;
            case process.const.NS_PostFNPMenu:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2503_main_03_PostFNP;
                    break;
                }

                promptOut += process.promptSession.scg_ccc_menu_ninm1_2503_main_02_PostFNP;
                break;
            case process.const.NS_Move_PhNumConfirmMenu:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2201_main_07_PhNumConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2201_main_06_PhNumConfirm;
                break;
            case process.const.NS_BusinessCustomerCellPhone_Confirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm1_2314_main_05_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2314_main_04_Confirm;
                break;
            case process.const.NS_CellPhoneNumber_Confirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2318_main_07_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2318_main_06_Confirm;
                break;
            case process.const.NS_BusinessPhoneNumber_Confirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2315_main_07_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2315_main_06_Confirm;
                break;
            case process.const.NS_Business_ExtensionNo:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2315_main_10_ExtensionConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2315_main_09_ExtensionConfirm;
                break;
            case process.const.NS_MoreOptions:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2000_main_09_ChangeServiceMoreOptions;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2000_main_08_ChangeServiceMoreOptions;
                break;

            case process.const.MS_MoveStopMenu:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2200_main_03_MoveStop;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2200_main_02_MoveStop;
                break;

            case process.const.MS_reconnectOrFumigation:

                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2500_main_03_FumigationReconnect;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2500_main_02_FumigationReconnect;
                break;

            case process.const.NS_StopServAcceptDate:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2305_main_06_AcceptDate;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2305_main_05_AcceptDate;
                break;
            case process.const.NS_StopServDate:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_collect_2306_main_01_StopBillName;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_collect_2306_main_01_StopBillName;
                break;
            case process.const.NS_StopServDateConfirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2306_main_06_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2306_main_05_Confirm;
                break;
            case process.const.NS_StopServAcceptUserDate:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2307_main_04_AcceptDt;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2307_main_03_AcceptDt;
                break;
            case process.const.NS_StopServPropOwner:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2308_main_03_OwnerConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2308_main_02_OwnerConfirm;
                break;
            //StopService
            case process.const.NS_StopServOwnerName:
                promptOut = promptOut + (retryCount == 1 ? process.promptSession.scg_ccc_menu_ninm1_2311_main_02_PropertyOwnerConfirm : process.promptSession.scg_ccc_menu_ninm2_2311_main_03_PropertyOwnerConfirm);
                break;
            case process.const.NS_StopServOwnerInfo:
                promptOut = promptOut + (retryCount == 1 ? process.promptSession.scg_ccc_menu_ninm1_2312_main_02_OwnerConfirm : process.promptSession.scg_ccc_menu_ninm2_2312_main_03_OwnerConfirm);
                break;
            case process.const.NS_StopCancel:
                promptOut = promptOut + (retryCount == 1 ? process.promptSession.scg_ccc_menu_ninm1_2301_main_02_NotStopService : process.promptSession.scg_ccc_menu_ninm2_2301_main_03_NotStopService);
                break;
            case process.const.NS_StopService_Pg2:
                promptOut = promptOut + (retryCount == 1 ? process.promptSession.scg_ccc_menu_ninm1_2302_main_03_Confirm : process.promptSession.scg_ccc_menu_ninm2_2302_main_04_Confirm);
                break;
            //-------StopServicePaperlessMail------------------------//
            case process.const.NS_BillSentMailConfirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2321_main_05_OrderAccept;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2321_main_04_OrderAccept;
                break;
            case process.const.NS_AnythingElseBill:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2322_main_05_AnthingElseBill;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2322_main_04_AnthingElseBill;
                break;
            case "AnythingElse":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2335_main_03_AnythingElse;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2335_main_02_AnythingElse;
                break;
            case process.const.NS_CustomerCellPhone_Confirmation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2317_main_04_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2317_main_03_Confirm;
                break;
            case process.const.NS_StopServNotAnythingElse:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2335_main_03_AnythingElse;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2335_main_02_AnythingElse;
                break;

            case process.const.NS_StopServiceFinalBillAddress:
                if (retryCount == 2) {
                    (appSession.appSessionObj.zgMailingAddress !== null && appSession.appSessionObj.zgMailingAddress !== undefined &&
                        appSession.appSessionObj.zgMailingAddress !== "") ? promptOut += process.promptSession.scg_ccc_menu_ninm2_2323_main_03_BillMailAddr_New :
                        promptOut += process.promptSession.scg_ccc_menu_ninm2_2323_main_03_BillMailAddr
                    //  promptOut += process.promptSession.scg_ccc_menu_ninm2_2323_main_03_BillMailAddr;
                    break;
                }
                (appSession.appSessionObj.zgMailingAddress !== null || appSession.appSessionObj.zgMailingAddress !== undefined ||
                    appSession.appSessionObj.zgMailingAddress !== "" ? promptOut += process.promptSession.scg_ccc_menu_ninm1_2323_main_02_BillMailAddr_New :
                    promptOut += process.promptSession.scg_ccc_menu_ninm1_2323_main_02_BillMailAddr)
                //promptOut += process.promptSession.scg_ccc_menu_ninm1_2323_main_02_BillMailAddr;
                break;
            case process.const.NS_StopServiceChangeAddressSpanish:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2324_main_04_AccptSchedule;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2324_main_03_AccptSchedule;
                break;
            case process.const.NS_SmartPhoneConfirmation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2326_main_03_SmartPhnConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2326_main_02_SmartPhnConfirm;
                break;
            case process.const.NS_WebLinkConfirmation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2326_main_08_WebLinkConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2326_main_07_WebLinkConfirm;
                break;
            case process.const.NS_SmartPhoneWebLinkConfimation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2326_main_11_SmartPhWebLinkConfim;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2326_main_10_SmartPhWebLinkConfim;
                break;
            case process.const.NS_CollectPhoneNumberConfirmation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2326_main_18_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2326_main_17_Confirm;
                break;
            case process.const.NS_FullAddressStopService:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2326_main_18_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2326_main_17_Confirm;

                break;
            case process.const.NS_FullAddressConfirmation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm1_2325_main_03_AddrConfirm + '<say-as interpret-as="digits">' + appSession.appSessionObj.streetNumberCollected + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressStopService + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="digits">' + appSession.appSessionObj.zipCodeCollected + '</say-as>' + process.promptSession.scg_ccc_menu_ninm1_2325_main_05_AddrConfirm_Crt;
                    cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_2325_main_05_AddrConfirm_Crt";
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2325_main_03_AddrConfirm + '<say-as interpret-as="digits">' + appSession.appSessionObj.streetNumberCollected + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressStopService + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="digits">' + appSession.appSessionObj.zipCodeCollected + '</say-as>' + process.promptSession.scg_ccc_menu_ninm1_2325_main_04_AddrConfirm_Crt;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_2325_main_04_AddrConfirm_Crt";
                break;
            //----------------Stop Service Existing Close---------------------//
            case process.const.NS_StopServiceMenu:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2328_main_04_StopServExist;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2328_main_03_StopServExist;
                break;
            case process.const.NS_StopServiceExistingCloseAnythingElse:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2329_main_10_AnthingElseStopServ;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2329_main_09_AnthingElseStopServ;
                break;
            case process.const.NS_StopServiceExistingCloseMenu:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2328_main_04_StopServExist;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2328_main_03_StopServExist;
                break;
            case process.const.NS_StopServiceExistingCloseCancel:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_nimm2_2329_main_04_Confrim;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_nimm1_2329_main_03_Confrim;
                break;
            case process.const.NS_SendSMSDiffSamePhNo:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2336_main_03_PhNumConfirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2336_main_02_PhNumConfirm;
                break;
            case "InitialConfirmation":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_nimm2_2329_main_04_Confrim;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_nimm1_2329_main_03_Confrim;
                break;
            case process.const.NS_SendSMS_DifferentPhoneNumberConfirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_nimm2_2336_main_10_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2336_main_09_Confirm;
                break;
            case "FinalAnythingElse":
                if (retryCount == 1) {
                    promptOut = process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
                    break;
                }

            //MAIN_2332_StopServBilledPending_GR01
            case "StopServBilledPendingMenu":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2332_main_03_StopSevrBillPending;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2332_main_02_StopSevrBillPending;
                break;

            // MAIN_2334_StopServBilledBalance
            case "StopServBilledBalanceMenu":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2334_main_03_StopServBill;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2334_main_02_StopServBill;
                break;
            /*
        case process.const.NS_SMSPhoneNumber:
            if (retryCount == 2) {

                promptOut += process.promptSession.scg_ccc_collect_ninm2_2326_main_14_PhNum;
                break;
            }
            promptOut += process.promptSession.scg_ccc_collect_ninm1_2326_main_13_PhNum;
            break;
            */


            case process.const.NS_FumigationReconnect_Menu:
                if (retryCount == 2) {
                    logger.info("nextStateName == FumigationReconnect_Menu True in FallbackMessage Retry 2");
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2500_main_03_FumigationReconnect;
                    break;
                }
                logger.info("nextStateName == FumigationReconnect_Menu True in FallbackMessage Retry 1");
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2500_main_02_FumigationReconnect;
                break;

            case process.const.NS_StopServFumStop:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2304_main_03_StopServFum;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2304_main_02_StopServFum;
                break;
            case process.const.NS_ApartmentNumberConfirmation:
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_collect_ninm2_2105_main_17_AptNumberOrUnit;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_collect_ninm1_2105_main_16_AptNumberOrUnit;
                break;
            case "StartServiceProcess":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2101_main_04_StartServiceProcess;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2101_main_03_StartServiceProcess;
                break;
            case "DiffNumberMenu":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2101_main_11_DiffNumb;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2101_main_10_DiffNumb;
                break;
            case "StartService_DifferentPhoneNumberConfirmation":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2101_main_18_PhConf;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2101_main_17_PhConf;
                break;
            case "StartServiceAddressMenu":
                if (retryCount == 2) {

                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2101_main_08_StartServiceAddr;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2101_main_07_StartServiceAddr;
                break;
            case process.const.NS_FNPMenuAMP_SW_true:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2501_main_06_FNP;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2501_main_05_FNP;
                break;
            case "FNPMenuAMP_SW_false":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2501_main_04_FNP;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2501_main_03_FNP;
                break;
            case "BusinessExtensionNo_Confirmation":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2316_main_07_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2316_main_06_Confirm;
                break;
            case process.const.NS_StopAnyThingElse:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2335_main_03_AnythingElse;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2335_main_02_AnythingElse;
                break;
            case process.const.NS_StopServNotEligible:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2335_main_03_AnythingElse;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2335_main_02_AnythingElse;
                break;
            case "CheckChangeCancelAnythingElse":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2335_main_03_AnythingElse;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2335_main_02_AnythingElse;
                break;
            case "StopnotEligibleAnythingElse":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2335_main_03_AnythingElse;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2335_main_02_AnythingElse;
                break;
            case process.const.NS_SMSMultiModelConfirmation:
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2327_main_07_Confirm;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2327_main_06_Confirm;
                break;

            case "StopServBilledBalaAnythingElse":
                if (retryCount == 2) {
                    promptOut += process.promptSession.scg_ccc_menu_ninm2_2334_main_03_StopServBill;
                    break;
                }
                promptOut += process.promptSession.scg_ccc_menu_ninm1_2334_main_02_StopServBill;
                break;


            default:
                if (retryCount == 2) {
                    promptOut;
                    break;
                }
                promptOut;
        }

        return promptOut;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    FallbackMessage
};

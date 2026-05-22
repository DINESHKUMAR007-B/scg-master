const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const getDateFormat = require("../../Helpers/Common/getDate");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
//const getDateFormat = require("../../Helpers/Common/getDate");


const BargeInNotAllowed = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let dateFormat;
    let date;
    let confirmationNumber;
    let ddService;
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_BargeInNotAllowed";
        cxiSession.exitPoint = appSession.stateName;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        //-----------------------------------------------------
        appSession.bargeIn = process.const.STR_False;

        // #16885 - Fraction as words
        // function speakableNumber(input) {

        //     // Map digits → words 
        //     const digitMap = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

        //     // Convert a number like 4521 → "four five two one"
        //     const digitsToWords = (num) =>
        //         num.toString().split('').map(d => digitMap[d]).join(' ');

        //     // Convert fraction like 1/2, 3/4 → "a half", "three quarters"
        //     const fractionToWords = (n, d) => {
        //         const map = { 2: 'half', 3: 'third', 4: 'quarter' };
        //         let denom = map[d] || d + 'th';
        //         if (n > 1) {
        //             denom = denom === 'half' ? 'halves' : denom + 's';
        //         }
        //         // Special handling
        //         if (n === 1 && d === 2) {
        //             return 'a half';
        //         }
        //         if (n === 1) {
        //             return `one ${denom}`;
        //         }
        //         return `${digitsToWords(n)} ${denom}`;
        //     };

        //     return input

        //         // Step 1: Handle mixed numbers like "4521 1/2"
        //         // (\d+) = whole number
        //         // (\d+)/(\d+) = fraction
        //         .replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (_, whole, n, d) =>
        //             `${digitsToWords(whole)} and ${fractionToWords(+n, +d)}`
        //         ).replace(/\b\d+\b/g, (num) =>
        //             digitsToWords(num)
        //         );
        // }
        function speakableNumber(input, localeId = "en_US") {

            // Language-based digit maps
            const languageMaps = {
                en_US: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
                es_US: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
            };
        
            // Fraction words by language
            const fractionMaps = {
                en_US: {
                    2: 'half',
                    3: 'third',
                    4: 'quarter'
                },
                es_US: {
                    2: 'medio',
                    3: 'tercio',
                    4: 'cuarto'
                }
            };
        
            const digitMap = languageMaps[localeId] || languageMaps.en_US;
            const fractionMap = fractionMaps[localeId] || fractionMaps.en_US;
        
            // Convert number like 4521 → "four five two one"
            const digitsToWords = (num) =>
                num.toString().split('').map(d => digitMap[d]).join(' ');
        
            // Convert fraction like 1/2, 3/4
            const fractionToWords = (n, d) => {
        
                let denom = fractionMap[d] || `${d}th`;
        
                // English logic
                if (localeId === "en_US") {
        
                    if (n > 1) {
                        denom = denom === 'half' ? 'halves' : denom + 's';
                    }
        
                    if (n === 1 && d === 2) {
                        return 'a half';
                    }
        
                    if (n === 1) {
                        return `one ${denom}`;
                    }
        
                    return `${digitsToWords(n)} ${denom}`;
                }
        
                // Spanish logic
                if (localeId === "es_US") {
        
                    if (n > 1) {
                        denom += 's';
                    }
        
                    if (n === 1 && d === 2) {
                        return 'un medio';
                    }
        
                    if (n === 1) {
                        return `uno ${denom}`;
                    }
        
                    return `${digitsToWords(n)} ${denom}`;
                }
            };
        
            return input
        
                // Handle mixed numbers like "4521 1/2"
                .replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (_, whole, n, d) =>
                    localeId === "es_US"
                        ? `${digitsToWords(whole)} y ${fractionToWords(+n, +d)}`
                        : `${digitsToWords(whole)} and ${fractionToWords(+n, +d)}`
                )
        
                // Handle normal numbers
                .replace(/\b\d+\b/g, (num) =>
                    digitsToWords(num)
                );
        }
        

        // End of #16885
        switch (appSession.nextStateName) {
            case process.const.NS_StopServAcceptDate:

                appSession.nextIntent = process.const.MS200;
                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.firstAvailCloseDate, intentRequest);
                if (appSession.preStateName == (appSession.baseLine + "_HearDetails")) {
                    promptOut = process.promptSession.scg_ccc_prmt_2305_main_02_StopServHoliday + '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_2305_main_03_BillingName + dateFormat[1] +
                        '<say-as interpret-as="date" format="md">' + dateFormat[0] + '</say-as>' + '<break time="0.2s"/>';
                }
                else if (appSession.preStateName == (appSession.baseLine + "_Previous")) {
                    promptOut = process.promptSession.scg_ccc_prmt_2305_main_03_BillingName + dateFormat[1] +
                        '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                }
                else {
                    promptOut = process.promptSession.scg_ccc_prmt_2305_main_01_OrderSchlnumber + '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_2305_main_02_StopServHoliday +
                        '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_2305_main_03_BillingName + dateFormat[1] + '<break time="0.2s"/>' + '<say-as interpret-as="date" format="md">' +
                        dateFormat[0] + '</say-as>' + '<break time="0.2s"/>';
                }
                break;
            case process.const.NS_StopServDate:

                promptOut = process.promptSession.scg_ccc_collect_2306_main_01_StopBillName;
                appSession.nextStateName = process.const.NS_StopServAcceptDate;
                appSession.nextIntent = process.const.MS202;
                break;

            case process.const.NS_Fumigation_Restore_Menu:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPRestore);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250250);
                callPath.SelfServiceDescription(process.const.CP_FNPRestore, appSession);
                promptOut = process.promptSession.scg_ccc_prmt_2502_main_01_Restore;
                appSession.nextStateName = process.const.NS_PostFNPMenu;
                appSession.nextIntent = process.const.MS100;
                break;

            case process.const.NS_PostFNPMenu:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPRestore);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250250);
                callPath.SelfServiceDescription(process.const.CP_FNPRestore, appSession);
                promptOut = process.promptSession.scg_ccc_prmt_2502_main_01_Restore;
                appSession.nextStateName = process.const.NS_PostFNPMenu;
                appSession.nextIntent = process.const.MS100;
                break;

            case "DD_processNumberDifferent":
                promptOut = process.promptSession.scg_ccc_prmt_2326_main_15_PhNumConfirm + '<say-as interpret-as="telephone">' + appSession.appSessionObj.DDDifferentPhoneNumber + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextIntent = process.const.MS200;
                break;

            case "DD_stopInit":
                promptOut = appSession.appSessionObj.skipAcknowledgementPrompt == process.const.STR_True ? promptOut : process.promptSession.scg_ccc_prmt_2200_main_04_ConfirmStopServ + '<break time="0.2s"/>';
                promptOut += process.promptSession.scg_ccc_prmt_2201_main_01_DD_Day1;
                appSession.nextIntent = process.const.MS200;
                break;
            case "DD_moveInit":
                ddService = appSession.appSessionObj.ddService == undefined || appSession.appSessionObj.ddService == null ? "stop" : appSession.appSessionObj.ddService;
                promptOut = process.promptSession.scg_ccc_prmt_2201_main_01_DD_Day1;
                appSession.nextIntent = process.const.MS200;
                break;
            case "DD_CheckChangeCancelInit":
                promptOut = process.promptSession.scg_ccc_prmt_2000_main_11_CloseCheckConf;
                ddService = appSession.appSessionObj.ddService == undefined || appSession.appSessionObj.ddService == null ? "stop" : appSession.appSessionObj.ddService;
                promptOut += process.promptSession.scg_ccc_prmt_2201_main_01_DD_Day1;
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopServDateConfirmation:
                //console.log("nextStateName==NS_StopServDateConfirmation true");
                logger.info("nextStateName==NS_StopServDateConfirmation true");
                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.stopServDate, intentRequest);
                //console.log("dateFormat in MS210 : ", dateFormat);
                logger.info("dateFormat in MS210 : " + dateFormat);
                promptOut = process.promptSession.scg_ccc_prmt_2306_main_03_StopBillName + '<break time="0.2s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopServAcceptUserDate:
                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.nextDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2307_main_01_StopBillingNextDt + '<break time="0.2s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_SmartPhoneConfirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2326_main_04_WebLinkTxt;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                appSession.nextIntent = process.const.MS200;
                appSession.nextStateName = process.const.NS_WebLinkConfirmation;
                break;
            case process.const.NS_AnythingElse:
                promptOut = process.promptSession.scg_ccc_prmt_2336_main_11_ConfNum;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopServNotEligible:
                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2330_main_21_BillingStopDate + '<break time="0.2s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                appSession.nextStateName = process.const.NS_StopServNotEligible;
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopServEvalDate_Pg3:

                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2303_main_02_Date;
                appSession.nextIntent = process.const.MS416;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;

            case "StopService_Pg2":
                promptOut = process.promptSession.scg_ccc_prmt_2302_main_01_AddrCloseService + speakableNumber(appSession.appSessionObj.GetPremiseHouseNumber,intentRequest.bot.localeId) + '<break time="0.2s"/>';
                appSession.nextIntent = process.const.MS200;
                break;
            case "Moving_SMS":
                promptOut = process.promptSession.scg_ccc_prmt_2201_main_01_IntialMoveSMS;
                appSession.appSessionObj.attr_DigitalDeflection = "Y";
                appSession.nextStateName = "Moving_SMS";
                appSession.nextIntent = process.const.MS200;
                break;
            case "Moving_SMSHrClose":

                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MoveServiceAfterHours);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220020);

                promptOut = process.promptSession.scg_ccc_prmt_2200_main_05_ConfirmMoveServ + '<break time="0.2s"/>';
                promptOut += process.promptSession.scg_ccc_prmt_2200_main_07_DigitalDeflectionService;
                promptOut += process.promptSession.scg_ccc_prmt_2201_main_01_IntialMoveSMS;
                appSession.appSessionObj.attr_DigitalDeflection = "Y";
                appSession.nextStateName = "Moving_SMS";
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_BillSentMailConfirmation:
                if (appSession.preStateName == appSession.baseLine + process.const.SN_StopServicePaperlessMail) {
                    if (appSession.appSessionObj.isOnPaperless == process.const.STR_True) {
                        promptOut = process.promptSession.scg_ccc_prmt_2320_main_01_billsentEmail;
                    }
                }
                date = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                promptOut += appSession.appSessionObj.multimodalAddressValidation == process.const.STR_True ? process.promptSession.scg_ccc_prmt_2327_main_07_MailAddrSuce + process.promptSession.scg_ccc_prmt_2321_main_01_CloseDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' + process.promptSession.scg_ccc_prmt_2321_main_02_TagDoNotRemove : process.promptSession.scg_ccc_prmt_2321_main_01_CloseDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' + process.promptSession.scg_ccc_prmt_2321_main_02_TagDoNotRemove;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextStateName = process.const.NS_BillSentMailConfirmation;
                appSession.nextIntent = process.const.MS200;
                break;

            case process.const.NS_StopServiceChangeAddressSpanish:
                date = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                promptOut = appSession.preStateName == appSession.baseLine + "_HearDetails" || appSession.appSessionObj.closeOrderOperation3Failure == process.const.STR_True ? process.promptSession.scg_ccc_prmt_2324_main_01_OrdrConfNumClsDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' : appSession.appSessionObj.individualSlot == process.const.STR_True || appSession.appSessionObj.fullAddressConfirmationMaxAttempts == process.const.STR_True ? process.promptSession.scg_ccc_prmt_2325_main_05_NotGetAddr + process.promptSession.scg_ccc_prmt_2324_main_01_OrdrConfNumClsDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' : process.promptSession.scg_ccc_prmt_2324_main_01_OrdrConfNumClsDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
                appSession.nextIntent = process.const.MS200;
                break;


            case process.const.NS_SmartPhoneWebLinkConfimation:
                promptOut = process.promptSession.scg_ccc_prmt_2326_main_05_WebLinkDiffPhnTxt;
                appSession.nextIntent = process.const.MS200;
                break;

            case process.const.NS_CollectPhoneNumberConfirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2326_main_15_PhNumConfirm + '<say-as interpret-as="telephone">' + appSession.appSessionObj.stopServiceDifferentPhoneNumber + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextIntent = process.const.MS200;
                break;

            case process.const.NS_SMSMultiModelConfirmation:
                promptOut = appSession.preStateName == appSession.baseLine + "_HearDetails" ? process.promptSession.scg_ccc_prmt_2327_main_04_ConfirmFullAddress + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressMultiModel + '</say-as>' : process.promptSession.scg_ccc_prmt_2327_main_03_RecMailAddr + process.promptSession.scg_ccc_prmt_2327_main_04_ConfirmFullAddress + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressMultiModel + '</say-as>';
                if (appSession.appSessionObj.care_of) {
                    if (appSession.appSessionObj.care_of != "undefined") {
                        promptOut = appSession.preStateName == appSession.baseLine + "_HearDetails" ? process.promptSession.scg_ccc_prmt_2327_main_04_ConfirmFullAddress + appSession.appSessionObj.care_of + '<break time="0.1s"/>' + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressMultiModel + '</say-as>' : process.promptSession.scg_ccc_prmt_2327_main_03_RecMailAddr + process.promptSession.scg_ccc_prmt_2327_main_04_ConfirmFullAddress + appSession.appSessionObj.care_of + '<break time="0.1s"/>' + '<say-as interpret-as="address">' + appSession.appSessionObj.fullAddressMultiModel + '</say-as>';
                    }
                }
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopServiceExistingCloseMenu:
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_HearPendingCloseInfo);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232805);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232800);
                callPath.SelfServiceDescription(process.const.HearPendingCloseInfo, appSession);

                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.stopDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2328_main_01_StopDt + '<break time="0.2s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                appSession.nextIntent = process.const.MS100;
                break;
            case process.const.NS_StopServiceExistingCloseCancel:

                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232900);

                dateFormat = getDateFormat.getDateName(appSession.appSessionObj.stopDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2329_main_01_CancelStopDt + '<break time="0.2s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopAnyThingElse:
                promptOut = process.promptSession.scg_ccc_prmt_2329_main_05_SchStopDt + "<say-as interpret-as='date'>" + appSession.appSessionObj.stopDate + "</say-as>";
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StopServiceExistingCloseAnythingElse:
                confirmationNumber = appSession.appSessionObj.cancelMoveConfNumber.split("").join('<break time="0.1s"/>');
                promptOut = process.promptSession.scg_ccc_prmt_2329_main_06_StopServCancelNum + confirmationNumber + process.promptSession.scg_ccc_prmt_2329_main_07_StopServCancelConfirmNum + confirmationNumber;
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StartServiceProcess:
                if (appSession.appSessionObj.businessHours == "closed") {
                    promptOut = process.promptSession.scg_ccc_prmt_2100_main_06_DigitalDeflectionService + '<break time="0.2s"/>';
                }
                promptOut += process.promptSession.scg_ccc_prmt_2101_main_01_WebLink;
                appSession.appSessionObj.attr_DigitalDeflection = "Y";
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StartServiceAddressMenu:
                promptOut = process.promptSession.scg_ccc_prmt_2101_main_05_PTStartService;
                appSession.nextIntent = process.const.MS100;
                break;
            case process.const.NS_StartAnyThingElse:
                promptOut = process.promptSession.scg_ccc_prmt_2102_main_02_WebLinkText;
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_StartService_DifferentPhoneNumberConfirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2101_main_15_PhConf + "<say-as interpret-as='telephone'>" + appSession.appSessionObj.startServiceDifferentPhoneNumber + "</say-as>";
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_SendSMS_DifferentPhoneNumberConfirmation:

                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233602);


                promptOut = process.promptSession.scg_ccc_prmt_2336_main_07_ConfirmPhnumMsg + "<say-as interpret-as='telephone'>" + appSession.appSessionObj.smsDifferentPhoneNumber + "</say-as>";
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_Move_DifferentPhoneNumberConfirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2201_main_11_ConfirmPhnumMsg + "<say-as interpret-as='telephone'>" + appSession.appSessionObj.MovesmsDifferentPhoneNumber + "</say-as>";
                appSession.nextIntent = process.const.MS200;
                break;
            case process.const.NS_BusinessPhoneNumber_Confirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2315_main_04_Phnumconf + '<say-as interpret-as="telephone">' + appSession.appSessionObj.businessPhoneNumberMS + '</say-as>';
                appSession.nextIntent = process.const.MS200;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_CellPhoneNumber_Confirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2318_main_04_PhNumConfirm + '<say-as interpret-as="telephone">' + appSession.appSessionObj.cellPhoneNumberMS + '</say-as>';
                appSession.nextIntent = process.const.MS200;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_BusinessExtensionNo_Confirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2316_main_04_PhNumExt + '<say-as interpret-as="telephone">' + appSession.appSessionObj.businessExtensionNumberMS + '</say-as>';
                appSession.nextIntent = process.const.MS200;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_CustomerCellPhone_Confirmation:
                promptOut = process.promptSession.scg_ccc_prmt_2317_main_01_PhNumAreaNum + '<say-as interpret-as="telephone">' + appSession.appSessionObj.cellPhone + '</say-as>';
                appSession.nextIntent = process.const.MS200;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_BusinessCustomerCellPhone_Confirmation:
                if ((appSession.appSessionObj.telePhone == "" || appSession.appSessionObj.telePhone == null || appSession.appSessionObj.telePhone == undefined)) {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NoBusinessPhoneExtension);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231415);
                    promptOut = process.promptSession.scg_ccc_prmt_2314_main_01_PhNumAccount + '<say-as interpret-as="telephone">' + appSession.appSessionObj.telePhone + '</say-as>';
                }
                else {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_BusinessPhoneExtension);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231420);
                    promptOut = process.promptSession.scg_ccc_prmt_2314_main_01_PhNumAccount + '<say-as interpret-as="telephone">' + appSession.appSessionObj.telePhone + '</say-as>' + process.promptSession.scg_ccc_prmt_2314_main_02_Extension + '<say-as interpret-as="telephone">' + appSession.appSessionObj.phoneNumberExtension + '</say-as>';
                }
                appSession.nextIntent = process.const.MS200;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                break;
            case process.const.NS_PostFNPMenu:
                promptOut = process.promptSession.scg_ccc_prmt_2502_main_01_PayDueAmount + process.promptSession.scg_ccc_prmt_2502_main_02_DueBillAmount + '<say-as interpret-as="currency" >' + "$" + appSession.appSessionObj.totalReconnectAmt + '</say-as>' + '<break time=".5s"/>';
                if (appSession.appSessionObj.fnpBreakDownSw == "true") {
                    promptOut += process.promptSession.scg_ccc_prmt_2502_main_03_AddFNPAmount + '<say-as interpret-as="currency" >' + "$" + appSession.appSessionObj.delinquentAmt + '</say-as>' + '<break time=".5s"/>';
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_FNPpastduebalance);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250235);
                    if (appSession.appSessionObj.depositFee > 0) {
                        cxiSession.cxiSessionObj.callPath = callPath.ExitReason(cxiSession.cxiSessionObj.callPath, process.const.CP_FNPdepositeamountprovided);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250240);
                        promptOut += process.promptSession.scg_ccc_prmt_2502_main_04_DepositAmount + '<say-as interpret-as="currency" >' + "$" + appSession.appSessionObj.depositFee + '</say-as>' + '<break time=".5s"/>';
                        promptOut += process.promptSession.scg_ccc_prmt_2502_main_05_AdditionalFees;
                    }
                    else {
                        cxiSession.cxiSessionObj.callPath = callPath.ExitReason(cxiSession.cxiSessionObj.callPath, process.const.CP_FNPreconnectionfeeprovided);
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FNPreconnectionfeeprovided);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250245);
                        callPath.SelfServiceDescription(process.const.CP_FNPreconnectionfeeprovided, appSession);
                        promptOut += process.promptSession.scg_ccc_prmt_2502_main_05_AdditionalFees;
                    }
                    // if (appSession.appSessionObj.paymentsAmount > 0) {
                    //     cxiSession.cxiSessionObj.callPath = callPath.ExitReason(cxiSession.cxiSessionObj.callPath, process.const.CP_FNPpartialpaymentmade);
                    //     promptOut += process.promptSession.scg_ccc_prmt_2502_main_06_DueAmountPaid + '<say-as interpret-as="currency" >' + "$" + appSession.appSessionObj.paymentsAmount + '</say-as>' + '<break time=".5s"/>' + process.promptSession.scg_ccc_prmt_2502_main_07_PaymentsDay;
                    // }
                }
                appSession.nextIntent = process.const.MS100;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
            case process.const.NS_SentMailConfirmation:
                if (appSession.appSessionObj.closeAddress == process.const.STR_Email) {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_EmailNotification);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232120);
                    prompt = process.promptSession.scg_ccc_prmt_2321_main_10_EmailBillProgress;
                }
                else {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_EmailNotificationNotEnabled);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232115);
                    prompt = process.promptSession.scg_ccc_prmt_2321_main_09_BillProgress;
                }
                //.log("confirmationNumber : "+confirmationNumber)
                date = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2321_main_06_Great + process.promptSession.scg_ccc_prmt_2321_main_07_BillStopDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' + process.promptSession.scg_ccc_prmt_2321_main_08_Beware + prompt;
                confirmationNumber = appSession.appSessionObj.confirmationNumber.split("").join('<break time="0.1s"/>');
                promptOut += '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_2322_main_01_ConfirmNum + confirmationNumber + '<break time="0.3s"/>' + process.promptSession.scg_ccc_prmt_2322_main_02_AgainConfirmNum + confirmationNumber;
                if (appSession.appSessionObj.hearDetails == process.const.STR_N) {
                    promptOut += '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_main_configEmail;
                }
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderScheduled);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232125);
                callPath.SelfServiceDescription(process.const.CP_CloseOrderScheduled, appSession);

                appSession.nextIntent = process.const.MS100;
                appSession.nextStateName = process.const.NS_AnythingElseBill;
                break;
            case process.const.NS_SentMail:
                appSession.nextIntent = process.const.MS100;
                appSession.nextStateName = process.const.NS_AnythingElseBill;
                promptOut = process.promptSession.scg_ccc_prmt_main_configEmail;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                break;
        }

        appSession.fallBackState = process.const.STR_True;
        callback(
            util.DialogAction(
                process.const.DA_Close,
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_Fulfilled
            ));
        return;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    BargeInNotAllowed
};

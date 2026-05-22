const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const callPath = require("../../Helpers/Common/callPathHelper");
const No = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let activeContexts = [];
    let WS05Details = {};
    const now = new Date();
    let currentDate = now.toISOString;
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_STR_Underscore + process.const.SN_No;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        //-----------------------------------------------------
        appSession.fallBackState = process.const.STR_False;

        if ((appSession.appSessionObj.turnOffStopService == "true") && appSession.nextStateName == "DD_stopProcess" ||
            appSession.nextStateName == "DD_moveProcess" || appSession.nextStateName == "DD_checkchangecancelProcess") {
            let DD_path = appSession.nextStateName == "DD_stopProcess" ? "Service Request Digital Deflection declined." :
                appSession.nextStateName == "DD_moveProcess" ? "Service Request Digital Deflection declined." : appSession.nextStateName == "DD_checkchangecancelProcess" ? "Service Request Digital Deflection declined." : "main ";
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, DD_path);
            //----------------------------------DD process--------------------------------
            if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                appSession.authenticated == null || appSession.authenticated.length <= 0) {
                appSession.nextIntent = "AU100_InitialIdentification";
                appSession.nextBot = "Authentication_Bot";
                appSession.appSessionObj.fallBackState = process.const.STR_True;
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
            }






            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );

        }

        if ((appSession.appSessionObj.turnOffStopService == "true") && appSession.nextStateName == "DD_processNumberDifferent") {

            if (appSession.appSessionObj.DDnocount == undefined || appSession.appSessionObj.DDnocount == null || appSession.appSessionObj.DDnocount == "null") {

                appSession.nextStateName = "DD_processNumber";
                appSession.appSessionObj.DDnocount = process.const.STR_True;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, CP_SentSMSViadifferentSmartPhoneNumber);
                let CellPhoneNumberSlot = process.const.Slot_phoneNumber;
                appSession.nextIntent = process.const.MS404;
                appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
                appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = undefined;
                promptOut = process.promptSession.scg_ccc_collect_2201_main_08_PhNum;
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
                        CellPhoneNumberSlot
                    )
                );
                return;

            }
            else if (appSession.appSessionObj.DDnocount == process.const.STR_True) {
                appSession.appSessionObj.DDnocount = null;
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "SMS Processing request failed");
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Service Request Digital Deflection unable to capture phone num");
                //----------------------------------DD process--------------------------------
                if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                    appSession.authenticated == null || appSession.authenticated.length <= 0) {
                    appSession.nextIntent = "AU100_InitialIdentification";
                    appSession.nextBot = "Authentication_Bot";
                    appSession.appSessionObj.fallBackState = process.const.STR_True;
                    promptOut = process.promptSession.scg_ccc_prmt_2201_main_15_PbmProce;
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
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
                promptOut = process.promptSession.scg_ccc_prmt_2201_main_15_PbmProce;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }

        }
        if (appSession.nextStateName == process.const.NS_StopServiceFinalAnythingElse) {

            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233515);
            //callPath.SelfServiceDescription("Keep Close Order", appSession);
            promptOut = process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
            appSession.disconnect = process.const.STR_True;
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
        if (appSession.nextStateName == process.const.NS_Moving_SMS) {
           // console.log("entered NS_Moving_SMS StateName");
            logger.info("entered NS_Moving_SMS StateName");
            if (appSession.appSessionObj.businessHours == "closed" && appSession.callerGoal == process.const.CG_moving) {
                //console.log("businessHours == closed && callerGoal == CG_moving true");
                logger.info("businessHours == closed && callerGoal == CG_moving true");
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_NotinterestedinMoveServiceDD);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220120);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );

            }
            else {
                logger.info("NO SMS");
                appSession.nextIntent = process.const.MS414;
                appSession.nextStateName = process.const.NS_StopServiceMoveSms;
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_Tostopserviceprocess);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220115);
                appSession.appSessionObj.movingSMSSw = process.const.STR_False;
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
        else if (appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation) {

            if (appSession.appSessionObj.moveDiffNumLoop == undefined || appSession.appSessionObj.moveDiffNumLoop == "undefined" || appSession.appSessionObj.moveDiffNumLoop == null) {
                let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
                appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = 0;
                appSession.appSessionObj.moveDiffNumLoop = process.const.STR_True;
                appSession.nextStateName = process.const.NS_Move_PhNumConfirmMenu;
                appSession.nextIntent = process.const.MS303;
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
                //------------------------Move-
                promptOut = process.promptSession.scg_ccc_prmt_2201_main_15_PbmProce;
                if (appSession.appSessionObj.businessHours == "closed" && appSession.callerGoal == process.const.CG_moving) {
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_NotinterestedinMoveServiceDD);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220120);
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );

                }
                else {
                    logger.info("NO SMS");
                    appSession.nextIntent = process.const.MS414;
                    appSession.nextStateName = process.const.NS_StopServiceMoveSms;
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_TryAgainLater);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220150);
                    appSession.appSessionObj.movingSMSSw = process.const.STR_False;
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
                    return;
                }

            }

        }
        else if (appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation) {
            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.MS404;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
            appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = 0;
            promptOut = process.promptSession.scg_ccc_collect_2336_main_04_DiffPhNum;
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
                    CellPhoneNumberSlot
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseCancel) {
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "Keep Close Order");
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232905);
            callPath.SelfServiceDescription("Keep Close Order", appSession);
            appSession.nextStateName = process.const.NS_StopAnyThingElse;
            appSession.nextIntent = process.const.MS210;
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


        else if (appSession.nextStateName == process.const.NS_StopAnyThingElseMaxRetry ||
            appSession.nextStateName == process.const.NS_StopAnyThingElse ||
            appSession.nextStateName == process.const.NS_StopServNotAnythingElse ||
            appSession.nextStateName == process.const.NS_AnythingElse ||
            appSession.nextStateName == process.const.NS_CommonMainAnyThingElse ||
            appSession.nextStateName == "StartAnyThingElse" ||
            appSession.nextStateName == "CheckChangeCancelAnythingElse" ||
            appSession.nextStateName == process.const.NS_StopServNotEligible
        ) {
            appSession.disconnect = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2335_main_05_AnythingElse;
            if (appSession.nextStateName == process.const.NS_CommonMainAnyThingElse ||
                appSession.nextStateName == process.const.NS_StopAnyThingElseMaxRetry) {
                promptOut = process.promptSession.scg_ccc_prmt_2322_main_08_SelfServiceEnd;
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232210);
            }
            else if(appSession.nextStateName = process.const.NS_StopAnyThingElse || 
                appSession.nextStateName == process.const.NS_StopServNotAnythingElse || 
                appSession.nextStateName == process.const.NS_AnythingElse || 
                appSession.nextStateName == process.const.NS_StopServNotEligible ||
                appSession.nextStateName == "CheckChangeCancelAnythingElse")
            {
                promptOut = process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
            }
            else {
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233515);
            }

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
        else if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElseMaxRetry) {
            appSession.disconnect = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232920);
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

        if (appSession.nextStateName == process.const.NS_StopServAcceptDate || (appSession.nextStateName == process.const.NS_StopServDateConfirmation || appSession.nextStateName == process.const.NS_StopServAcceptUserDate)) {

            appSession.appSessionObj.dateCnt = appSession.appSessionObj.dateCnt == undefined ? 0 : appSession.appSessionObj.dateCnt;
            appSession.appSessionObj.dateCnt = appSession.nextStateName != process.const.NS_StopServAcceptDate ? appSession.appSessionObj.dateCnt + 1 : appSession.appSessionObj.dateCnt;
            if (appSession.nextStateName == process.const.NS_StopServAcceptUserDate) {
                //cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_DifferentCloseDate);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230720);
            }
            
            if (appSession.appSessionObj.dateCnt > 1 && appSession.nextStateName != process.const.NS_StopServAcceptDate) {
                //appSession.callerGoal = process.const.CG_close_order;
                appSession.transfer = true;
                cxiSession.cxiSessionObj.promptType = "prompt";
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            if (appSession.preStateName == appSession.baseLine + "_BargeInNotAllowed" || appSession.stateName == appSession.baseLine + "_BargeInNotAllowed") {
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_DifferentCloseDate);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230515);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230600);

                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_StopServDate);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Previous);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_HearDetails);
                promptOut = process.promptSession.scg_ccc_menu_2306_main_02_Previous;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                let DateSlot = "date";
                appSession.nextIntent = process.const.MS415;
                appSession.nextStateName = process.const.NS_StopServDate;
                //appSession.appSessionObj.moduleName = process.const.MN_MAIN_2306_StopServDate;
                cxiSession.cxiSessionObj.promptType = "menu";
                callback(
                    util.DialogAction(
                        process.const.DA_SwitchToIntentSlot,
                        intentRequest,
                        appSession.nextIntent,
                        util.BuildSSMLMessage(promptOut),
                        process.const.STR_InProgress,
                        activeContexts,
                        DateSlot
                    )
                );
            }
            else {

                appSession.nextStateName = process.const.NS_StopServDate;
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
        }

        if (appSession.nextStateName == process.const.NS_StopServPropOwner) {
            appSession.nextStateName = process.const.NS_StopServOwnerName;
            cxiSession.cxiSessionObj.promptType = "prompt";
            appSession.nextIntent = process.const.MS200;

            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NotPropertyOwner);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230825);

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
        //StopService
        if (appSession.nextStateName == process.const.NS_StopCancel) {
            appSession.nextIntent = process.const.MS200;
            appSession.nextStateName = process.const.NS_CheckChangeCancelAnythingElse;
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
        if (appSession.nextStateName == process.const.NS_StopService_Pg2) {
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StreetAddressConfirmationDenied);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230210);
            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_CloseOrderDifferentAddress);
            cxiSession.cxiSessionObj.promptType = "prompt";
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
        if (appSession.nextStateName == process.const.NS_StopServFumStop) {
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_StopServAcceptDate;

            if (appSession.appSessionObj.callerGoal == process.const.CG_close_order) {
                appSession.appSessionObj.callerGoal = process.const.CG_close_order;
            }
            else {
                appSession.appSessionObj.callerGoal = process.const.CG_moving;
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
        if (appSession.nextStateName == process.const.NS_StopServOwnerName || appSession.nextStateName == process.const.NS_StopServOwnerInfo) {
           // console.log("nextStateName == process.const.NS_StopServOwnerName true");
            logger.info("nextStateName == process.const.NS_StopServOwnerName true");
            if (appSession.appSessionObj.callerGoal == process.const.CG_close_order ||
                appSession.appSessionObj.callerGoal == process.const.CG_close_order_need_owner_info ||
                appSession.appSessionObj.callerGoal == process.const.CG_close_order_need_date ||
                appSession.appSessionObj.callerGoal == process.const.CG_close_order_need_owner_and_ma
            ) {
                appSession.appSessionObj.callerGoal = process.const.CG_close_order_need_ma;
            }
            else {
                appSession.appSessionObj.callerGoal = process.const.CG_moving_need_ma;
            }
           // console.log("callerGoal : ", appSession.appSessionObj.callerGoal);
            logger.info("callerGoal :" + appSession.appSessionObj.callerGoal);
            appSession.nextIntent = process.const.MS413;
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
        else if (appSession.nextStateName == process.const.NS_CustomerCellPhone_Confirmation) {
            logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber55");
            logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
            if (appSession.appSessionObj.businessPartnerPhoneNumber == null || 
                appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                appSession.appSessionObj.businessPartnerPhoneNumber == "undefined")
                {
                appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem ;
                appSession.appSessionObj.cellPhone = process.const.BusinessPartner_UpdatePhoneNumber;
                }
                else{
                 appSession.appSessionObj.cellPhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                 appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;  
                }


            appSession.appSessionObj.cellPhoneVerified = process.const.STR_False;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
           // appSession.nextStateName = process.const.NS_Initial_CellPhoneNumber;
            appSession.nextIntent = process.const.MS404;
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231800);
            promptOut = process.promptSession.scg_ccc_collect_2318_main_01_PhNum;
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
                    CellPhoneNumberSlot
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_CellPhoneNumber_Confirmation) {
            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.MS404;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            let ctr = parseInt(appSession.appSessionObj.cellPhoneConfirmationMSCount, 10);
            ctr++;
            appSession.appSessionObj.cellPhoneConfirmationMSCount = ctr;
            if (appSession.appSessionObj.cellPhoneConfirmationMSCount > "1" || appSession.appSessionObj.cellPhoneConfirmationMSCount > 1) {
                appSession.appSessionObj.phoneCellVerifSw = "Y";
                logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber11");
                logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
                if (appSession.appSessionObj.businessPartnerPhoneNumber == null || 
                    appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "undefined")
                    {
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem ;
                    appSession.appSessionObj.cellPhone = process.const.BusinessPartner_UpdatePhoneNumber;
                    }
                    else{
                     appSession.appSessionObj.cellPhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                     appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;  
                    }

                appSession.nextIntent = process.const.MS201;
                appSession.nextStateName = process.const.NS_CellPhoneNumber_ConfirmationNo;
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
                appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = 0;
                appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231800);
                promptOut = process.promptSession.scg_ccc_collect_2318_main_01_PhNum;
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
                        CellPhoneNumberSlot
                    )
                );
                return;

            }

        }
        else if (appSession.nextStateName == process.const.NS_BusinessCustomerCellPhone_Confirmation) {

            appSession.appSessionObj.phoneNumberExtension = "";
            logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber22");
            logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
            if (appSession.appSessionObj.businessPartnerPhoneNumber == null || 
                appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                appSession.appSessionObj.businessPartnerPhoneNumber == "undefined")
                {
                appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem ;
                appSession.appSessionObj.telePhone = process.const.BusinessPartner_UpdatePhoneNumber;
                }
                else{
                    appSession.appSessionObj.telePhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                 appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;  
                }

            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.MS404;

            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_RemovePhoneNumber);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
            promptOut = process.promptSession.scg_ccc_collect_2315_main_01_PhnumAcctInput;
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
                    CellPhoneNumberSlot
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_Business_ExtensionNo) {
            appSession.appSessionObj.businessWPhoneVerified = process.const.STR_True;
           
            appSession.appSessionObj.telePhone;
            appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd; 
           
            if (appSession.preStateName != "MainServices_DontHaveIt") {
                logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber33");
                logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
                if (appSession.appSessionObj.businessPartnerPhoneNumber == null || 
                    appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "undefined")
                    {
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem ;
                    appSession.appSessionObj.telePhone = process.const.BusinessPartner_UpdatePhoneNumber;
                    }
                    else{
                        appSession.appSessionObj.telePhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                     appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;  
                    }
            }
            else{
            if (appSession.appSessionObj.businessPartnerPhoneNumber == null || 
                appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                appSession.appSessionObj.businessPartnerPhoneNumber == "undefined")
                {
                appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem ;
                appSession.appSessionObj.telePhone = process.const.BusinessPartner_UpdatePhoneNumber;
                }
                else{
                    appSession.appSessionObj.telePhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                 appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;  
                }
            }
            const businessPartner_Update = {};
            businessPartner_Update.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? " " : appSession.appSessionObj.businessPartner;
            businessPartner_Update.zGUpdContactInfoOperation = appSession.appSessionObj.UpdContactInfoOperation;
            businessPartner_Update.zGUpdContactInfoContact = appSession.appSessionObj.telePhone == undefined || appSession.appSessionObj.telePhone == "undefined" ? " " : appSession.appSessionObj.telePhone;
            businessPartner_Update.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension == undefined || appSession.appSessionObj.phoneNumberExtension == "undefined" ? " " : appSession.appSessionObj.phoneNumberExtension;
            businessPartner_Update.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
            businessPartner_Update.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? " " : appSession.appSessionObj.isPrimaryPhone;
            businessPartner_Update.zGUpdContactInfoAddressNumber = appSession.appSessionObj.addressNumber == undefined || appSession.appSessionObj.addressNumber == "undefined" ? " " : appSession.appSessionObj.addressNumber;
            businessPartner_Update.zGUpdContactInfoSequenceNumber = appSession.appSessionObj.sequenceNumber == undefined || appSession.appSessionObj.sequenceNumber == "undefined" ? " " : appSession.appSessionObj.sequenceNumber;

            let MS_WS05_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_001_Update, businessPartner_Update, intentRequest, intentName, callback);
            //logger.debug(MS_WS05_ReqObj);
            let MS_WS05_ResObj = await apiHelper.getResponseObject(MS_WS05_ReqObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS05_ResObj);
            cxiSession.cxiSessionObj.apiFlag = "Y";
            cxiSession.cxiSessionObj.promptType = "api lookup";
            WS05Details.apiId = process.const.I_DG_02_001_Update;
            WS05Details.apiname = process.const.I_DG_02_001_Update_name;
            if (MS_WS05_ResObj == null || MS_WS05_ResObj == undefined || MS_WS05_ResObj.status != 201 || MS_WS05_ResObj.status != "201") {
                //---------PUT CXI Keys-------------------------------------------
                WS05Details.statusCode = MS_WS05_ResObj == null || MS_WS05_ResObj == undefined ? "500" : MS_WS05_ResObj.status;
                WS05Details.apiStateResult = "Failure";
                WS05Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                //------------------------------------------------------------
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureUpdatePhoneNumber);
                appSession.appSessionObj.dbFail = process.const.STR_True;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                let businessPartnerResp = MS_WS05_ResObj.data;
                let returnType = businessPartnerResp?.ZGMessage?.results[0]?.Type;
                logger.debug(businessPartnerResp);
                if (returnType == "E" || returnType == "e" || !returnType) {
                    //---------PUT CXI Keys-------------------------------------------
                    WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                    WS05Details.apiStateResult = "Success";
                    WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                    //-----------------------------------------------------
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureUpdatePhoneNumber);
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
                else {
                    if (returnType == "S" || returnType == "s") {
                        //---------PUT CXI Keys-------------------------------------------
                        WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                        WS05Details.apiStateResult = "Success";
                        WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                        //-----------------------------------------------------
                        if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_CloseOrderPhoneNumber);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231520);
                            appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                            appSession.nextIntent = process.const.MS417;
                        }
                        else {
                            appSession.callerGoal = process.const.CG_MovingNeedMa;
                            appSession.nextIntent = process.const.MS300;
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

                }
            }
        }
        else if (appSession.nextStateName == process.const.NS_BusinessExtensionNo_Confirmation) {
            let ctr = parseInt(appSession.appSessionObj.businessExtensionNumberMSCount, 10);
            ctr++;
            appSession.appSessionObj.businessExtensionNumberMSCount = ctr;
            let WorkPhoneExtNumberSlot = "getWorkPhoneExtNumber";
            appSession.nextIntent = process.const.MS423;
            if (appSession.appSessionObj.businessExtensionNumberMSCount > "1" || appSession.appSessionObj.businessExtensionNumberMSCount > 1) {
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_MAIN_2316_ConfirmMenuMaxAttempt);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231620);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );

            }
            else {
                appSession.nextStateName = process.const.NS_Initial_BusinessWorkExtNumber;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneExtNumber);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                appSession.appSessionObj[WorkPhoneExtNumberSlot + "Count"] = 0;
                appSession.appSessionObj[WorkPhoneExtNumberSlot + "Retry"] = appSession.appSessionObj[WorkPhoneExtNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[WorkPhoneExtNumberSlot + "Retry"];
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231600);
                promptOut = process.promptSession.scg_ccc_collect_2316_main_01_ExtensionNum;
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
                        WorkPhoneExtNumberSlot
                    )
                );
                return;

            }
        }


        else if (appSession.nextStateName == process.const.NS_BusinessPhoneNumber_Confirmation) {
            let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextIntent = process.const.MS404;
            let ctr = parseInt(appSession.appSessionObj.businessPhoneConfirmationMSCount, 10);
            ctr++;
            appSession.appSessionObj.businessPhoneConfirmationMSCount = ctr;
            if (appSession.appSessionObj.businessPhoneConfirmationMSCount > "1" || appSession.appSessionObj.businessPhoneConfirmationMSCount > 1) {
                
                appSession.appSessionObj.phoneNumberExtension = "";
                logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber44");
                logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
                if (appSession.appSessionObj.businessPartnerPhoneNumber == null || 
                    appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "undefined")
                    {
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem ;
                    appSession.appSessionObj.telePhone = process.const.BusinessPartner_UpdatePhoneNumber;
                    }
                    else{
                    appSession.appSessionObj.telePhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;  
                    }



                const businessPartner_Update = {};
               businessPartner_Update.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? " " : appSession.appSessionObj.businessPartner;
                businessPartner_Update.zGUpdContactInfoOperation = appSession.appSessionObj.UpdContactInfoOperation;
                businessPartner_Update.zGUpdContactInfoContact = appSession.appSessionObj.telePhone == undefined || appSession.appSessionObj.telePhone == "undefined" ? " " : appSession.appSessionObj.telePhone;
                businessPartner_Update.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension == undefined || appSession.appSessionObj.phoneNumberExtension == "undefined" ? " " : appSession.appSessionObj.phoneNumberExtension;
                businessPartner_Update.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
                businessPartner_Update.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? " " : appSession.appSessionObj.isPrimaryPhone;
                businessPartner_Update.zGUpdContactInfoAddressNumber = appSession.appSessionObj.addressNumber == undefined || appSession.appSessionObj.addressNumber == "undefined" ? " " : appSession.appSessionObj.addressNumber;
                businessPartner_Update.zGUpdContactInfoSequenceNumber = appSession.appSessionObj.sequenceNumber == undefined || appSession.appSessionObj.sequenceNumber == "undefined" ? " " : appSession.appSessionObj.sequenceNumber;


                let MS_WS05_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_001_Update, businessPartner_Update, intentRequest, intentName, callback);
                //logger.debug(MS_WS05_ReqObj);
                let MS_WS05_ResObj = await apiHelper.getResponseObject(MS_WS05_ReqObj, intentRequest, intentName, callback);
                //logger.debug(MS_WS05_ResObj);
                cxiSession.cxiSessionObj.apiFlag = "Y";
                cxiSession.cxiSessionObj.promptType = "api lookup";
                WS05Details.apiId = process.const.I_DG_02_001_Update;
                WS05Details.apiname = process.const.I_DG_02_001_Update_name;
                if (MS_WS05_ResObj == null || MS_WS05_ResObj == undefined || MS_WS05_ResObj.status != 201 || MS_WS05_ResObj.status != "201") {
                    //---------PUT CXI Keys-------------------------------------------
                    WS05Details.statusCode = MS_WS05_ResObj == null || MS_WS05_ResObj == undefined ? "500" : MS_WS05_ResObj.status;
                    WS05Details.apiStateResult = "Failure";
                    WS05Details.errorMessage = "API Failure";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                    //------------------------------------------------------------
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureUpdatePhoneNumber);
                    appSession.appSessionObj.dbFail = process.const.STR_True;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );

                }
                else {
                    let businessPartnerResp = MS_WS05_ResObj.data;
                    let returnType = businessPartnerResp?.ZGMessage?.results[0]?.Type;
                    logger.debug(businessPartnerResp);
                    if (returnType = "E" || returnType == "e") {
                        //---------PUT CXI Keys-------------------------------------------
                        WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                        WS05Details.apiStateResult = "Success";
                        WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                        //-----------------------------------------------------
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureUpdatePhoneNumber);
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }
                    else {
                        if (returnType == "S" || returnType == "s") {
                            //---------PUT CXI Keys-------------------------------------------
                            WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                            WS05Details.apiStateResult = "Success";
                            WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                            //-----------------------------------------------------    
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );
                        }
                    }
                }
            }

            else {
                appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = 0;
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_RemovePhoneNumber);
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
                appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] = appSession.appSessionObj[CellPhoneNumberSlot + "Retry"] == undefined ? process.const.STR_True : appSession.appSessionObj[CellPhoneNumberSlot + "Retry"];
                promptOut = process.promptSession.scg_ccc_collect_2315_main_01_PhnumAcctInput;
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
                        CellPhoneNumberSlot
                    )
                );
                return;

            }
        }
        else if (appSession.nextStateName == process.const.NS_BillSentMailConfirmation) {
            appSession.callerGoal = process.const.CG_CloseOrderDeclined;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseDeclined);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232110);
            cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_BillSentMailNo);
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
        else if (appSession.nextStateName == process.const.NS_StopServiceChangeAddressSpanish) {
            appSession.callerGoal = process.const.CG_CloseOrderDeclined;
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_CloseDeclined);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232415);
            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );

        }
        else if (appSession.nextStateName == process.const.NS_SmartPhoneConfirmation) {
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_SmartPhoneWebLinkConfimation;
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
        else if (appSession.nextStateName == process.const.NS_WebLinkConfirmation || appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation ||
            appSession.nextStateName == process.const.NS_SMSMultiModelConfirmation || appSession.nextStateName == process.const.NS_FullAddressBargeIn) {
            if (appSession.nextStateName == process.const.NS_SMSMultiModelConfirmation) {
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_MultiModelConfirmationNo);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232730);
            }
            if (appSession.nextStateName == process.const.NS_FullAddressBargeIn || appSession.nextStateName == process.const.NS_WebLinkConfirmation || appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {

                if (appSession.nextStateName == process.const.NS_WebLinkConfirmation) {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CallingFromSmartPhoneNoToSMS);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232645);
                }

                if (appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NotCallingFromSmartPhoneNoToSMS);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232650);
                }

                let activeContexts = [];
                cxiSession.cxiSessionObj.promptType = "menu"; //cxi
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232500);
                promptOut = process.promptSession.scg_ccc_collect_2325_main_01_FullAddr;
                appSession.nextStateName = process.const.NS_FullAddressStopService;
                cxiSession.cxiSessionObj.promptIdFlag = "Y";
                promptOut = ssmlMessage.ConvertSSML(promptOut);
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
            appSession.nextIntent = process.const.MS202;
            appSession.nextStateName = process.const.NS_FullAddressBargeIn;
            appSession.fallBackState = process.const.STR_True;
            promptOut = process.promptSession.scg_ccc_prmt_2326_main_21_ProcessIssue;
            appSession.bargeIn = process.const.STR_False;
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
        else if (appSession.nextStateName == process.const.NS_CollectPhoneNumberConfirmation || appSession.nextStateName == process.const.NS_SMSMaxRecognize || appSession.nextStateName == process.const.NS_FullAddressBargeIn) {
            if (appSession.appSessionObj.phoneNumberConfirmationCount > 0 || appSession.nextStateName == process.const.NS_SMSMaxRecognize || appSession.nextStateName == process.const.NS_FullAddressBargeIn) {
                /*
                if (appSession.appSessionObj.phoneNumberConfirmationCount > 0) {
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SmsConfirmationProcessIssue);
                }*/


                if (appSession.nextStateName == process.const.NS_FullAddressBargeIn) {
                    let activeContexts = [];
                    cxiSession.cxiSessionObj.promptType = "menu"; //
                    activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232500);

                    promptOut = process.promptSession.scg_ccc_collect_2325_main_01_FullAddr;
                    appSession.nextStateName = process.const.NS_FullAddressStopService;
                    cxiSession.cxiSessionObj.promptIdFlag = "Y";
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
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
                appSession.nextIntent = process.const.MS202;
                appSession.nextStateName = process.const.NS_FullAddressBargeIn;
                appSession.fallBackState = process.const.STR_True;
                cxiSession.cxiSessionObj.callPath = appSession.appSessionObj.multiModelConfirmationMaxAttempt == "true" ? callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelConfirmationMaxAttempts) : callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SmsConfirmationProcessIssue);

                cxiSession.pegPath = appSession.appSessionObj.multiModelConfirmationMaxAttempt == "true" ? callPath.PegPath(cxiSession.pegPath, process.const.PP_232735) : callPath.PegPath(cxiSession.pegPath, process.const.PP_232640);

                promptOut = process.promptSession.scg_ccc_prmt_2326_main_21_ProcessIssue;
                appSession.bargeIn = process.const.STR_False;
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
            logger.info(`"phoneNumberConfirmationCount",${appSession.appSessionObj.phoneNumberConfirmationCount}`);
            appSession.appSessionObj.phoneNumberConfirmationCount = appSession.appSessionObj.phoneNumberConfirmationCount == undefined || null ? 0 : appSession.appSessionObj.phoneNumberConfirmationCount;
            appSession.appSessionObj.phoneNumberConfirmationCount = parseInt(appSession.appSessionObj.phoneNumberConfirmationCount, 10);
            appSession.appSessionObj.phoneNumberConfirmationCount++;
            logger.info(`"phoneNumberConfirmationCount increment",${appSession.appSessionObj.phoneNumberConfirmationCount}`);
            appSession.nextIntent = process.const.MS404;
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            appSession.nextStateName = process.const.NS_SmartPhoneWebLinkConfimation;
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = process.const.STR_True;
            delete (appSession.appSessionObj[PhoneNumberSlot + "Count"]);

            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232603);
            promptOut = process.promptSession.scg_ccc_collect_2326_main_12_PhNum;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
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
        else if (appSession.nextStateName == process.const.NS_FullAddressConfirmation) {
            let activeContexts = [];

            delete (appSession.appSessionObj.streetNumberIndividualSlot);
            delete (appSession.appSessionObj.streetNameIndividualSlot);
            delete (appSession.appSessionObj.cityIndividualSlot);
            delete (appSession.appSessionObj.stateIndividualSlot);
            delete (appSession.appSessionObj.zipCodeIndividualSlot);


            if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer) {
                    logger.info("confirm address no scenario for start servvice");
                    appSession.appSessionObj.notValidAdr = "not verify the address";
                    // console.log("streetNumberCollected: ", appSession.appSessionObj.streetNumberCollected);
                    // console.log("fullAddressStreetName : ", appSession.appSessionObj.fullAddressStreetName);
                    // console.log("fullAddressApartmentNumber : ", appSession.appSessionObj.fullAddressApartmentNumber);
                    // console.log("fullAddressCity : ", appSession.appSessionObj.fullAddressCity);
                    // console.log("fullAddressState : ", appSession.appSessionObj.fullAddressState);
                    // console.log("zipCodeCollected : ", appSession.appSessionObj.zipCodeCollected);

                    logger.info("streetNumberCollected: " + appSession.appSessionObj.streetNumberCollected);
                    logger.info("fullAddressStreetName : " + appSession.appSessionObj.fullAddressStreetName);
                    logger.info("fullAddressApartmentNumber : " + appSession.appSessionObj.fullAddressApartmentNumber);
                    logger.info("fullAddressCity : " + appSession.appSessionObj.fullAddressCity);
                    logger.info("fullAddressState : " + appSession.appSessionObj.fullAddressState);
                    logger.info("zipCodeCollected : " + appSession.appSessionObj.zipCodeCollected);
                    
                    let addressString = "";

                    if (appSession.appSessionObj.streetNumberCollected) {
                        let num = appSession.appSessionObj.streetNumberCollected.trim();
                        if (num !== "" && num !== "undefined" && num !== "null") {
                            addressString += num;
                        }
                    }

                    if (appSession.appSessionObj.fullAddressStreetName) {
                        let street = appSession.appSessionObj.fullAddressStreetName.trim();
                        if (street !== "" && street !== "undefined" && street !== "null") {
                            if (addressString) addressString += " ";


                            // Capitalize each word
                            let formattedStreetName = street
                                .split(" ")
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ");
                            addressString += formattedStreetName;
                        }
                    }

                    if (appSession.appSessionObj.fullAddressApartmentNumber) {
                        let apt = appSession.appSessionObj.fullAddressApartmentNumber.trim();
                        if (apt !== "" && apt !== "undefined" && apt !== "null") {
                            if (addressString) addressString += ", ";

                            let formattedApt = "";
                            for (let word of apt.split(" ")) {
                                if (/^[a-zA-Z]/.test(word)) {
                                    formattedApt += word.charAt(0).toUpperCase() + word.slice(1) + " ";
                                } else {
                                    formattedApt += word + " ";
                                }
                            }

                            formattedApt = formattedApt.trim(); // remove extra space
                            addressString += "Apt. or Unit " + formattedApt;
                        }
                    }


                    if (appSession.appSessionObj.fullAddressCity) {
                        let city = appSession.appSessionObj.fullAddressCity.trim();
                        if (city !== "" && city !== "undefined" && city !== "null") {
                            if (addressString) addressString += ", ";

                            // Capitalize each word
                            let formattedCity = city
                                .split(" ")
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ");
                            addressString += formattedCity;
                        }
                    }

                    if (appSession.appSessionObj.fullAddressState) {
                        let state = appSession.appSessionObj.fullAddressState.trim();
                        if (state !== "" && state !== "undefined" && state !== "null") {
                            if (addressString) addressString += ", ";
                            addressString += state;
                        }
                    }

                    if (appSession.appSessionObj.zipCodeCollected) {
                        let zip = appSession.appSessionObj.zipCodeCollected.trim();
                        if (zip !== "" && zip !== "undefined" && zip !== "null") {
                            if (addressString) addressString += " ";
                            addressString += zip;
                        }
                    }

                    // Now make the full reason string
                    let reason = process.const.ER_StartServiceFullAddressCollection_MaxAttempts + " : " + addressString;
                    //console.log("addressString : ", addressString);
                    logger.info ("addressString :" + addressString);
                    // Set the exitReason
                    cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, reason);


                    //cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_StartServiceFullAddressCollection_MaxAttempts + ":" + appSession.appSessionObj.streetNumberCollected + "," + appSession.appSessionObj.fullAddressStreetName + "," + appSession.appSessionObj.fullAddressApartmentNumber + "," + appSession.appSessionObj.fullAddressCity + "," + appSession.appSessionObj.fullAddressState + "," + appSession.appSessionObj.zipCodeCollected);
                    appSession.nextIntent = process.const.MS300;

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
                logger.info("confirm address no scenario for stop servvice");
                // console.log("confirm address no scenario streetNumberCollected: ", appSession.appSessionObj.streetNumberCollected);
                // console.log("confirm address no scenariofullAddressStreetName : ", appSession.appSessionObj.fullAddressStreetName);
                // console.log("confirm address no scenario fullAddressApartmentNumber : ", appSession.appSessionObj.fullAddressApartmentNumber);
                // console.log("confirm address no scenario fullAddressCity : ", appSession.appSessionObj.fullAddressCity);
                // console.log("confirm address no scenario fullAddressState : ", appSession.appSessionObj.fullAddressState);
                // console.log("confirm address no scenario zipCodeCollected : ", appSession.appSessionObj.zipCodeCollected);

                logger.info("confirm address no scenario streetNumberCollected: " + appSession.appSessionObj.streetNumberCollected);
                logger.info("confirm address no scenariofullAddressStreetName : " + appSession.appSessionObj.fullAddressStreetName);
                logger.info("confirm address no scenario fullAddressApartmentNumber : " + appSession.appSessionObj.fullAddressApartmentNumber);
                logger.info("confirm address no scenario fullAddressCity : " + appSession.appSessionObj.fullAddressCity);
                logger.info("confirm address no scenario fullAddressState : " + appSession.appSessionObj.fullAddressState);
                logger.info("confirm address no scenario zipCodeCollected : " + appSession.appSessionObj.zipCodeCollected);

                appSession.appSessionObj.streetNumberCollected = "";
                appSession.appSessionObj.fullAddressStreetName = "";
                appSession.appSessionObj.fullAddressApartmentNumber = "";
                appSession.appSessionObj.fullAddressCity = "";
                appSession.appSessionObj.fullAddressState = "";
                appSession.appSessionObj.zipCodeCollected = "";
                appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_FullAddressConfirmationMaxAttempts);
                appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
                appSession.nextIntent = process.const.MS210;
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


            appSession.appSessionObj.apartmentNumberSkip = process.const.STR_False;
            appSession.appSessionObj.individualSlot = process.const.STR_True;
            appSession.appSessionObj.confirmationIndividualSlot = process.const.STR_True;
            appSession.nextIntent = process.const.MS420;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
            let StreetNumberSlot = "getStreetNumber";
            appSession.appSessionObj.apartmentNumberSlotCollection = process.const.STR_False;
            appSession.appSessionObj.citySlotCollection = process.const.STR_False;


            if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                //start service
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210504);
            }
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232504);

            promptOut = process.promptSession.scg_ccc_collect_2325_main_06_StrNum;
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

        else if (appSession.nextStateName == "FinalAnythingElse") {
            appSession.disconnect = "Y";
            promptOut = process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233515);
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
        else if (appSession.nextStateName == process.const.NS_StartServiceProcess) {
            if (appSession.appSessionObj.businessHours == "closed" && (appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer)) {

                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.CP_NotIntrestedonOnlineProcesstostartservice);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_DoNotReceiveTextMessageWithWeblink);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210120);
                appSession.appSessionObj.newCustomerMaxAttempt = process.const.STR_True;
                appSession.appSessionObj.digitalDeflectionClosedHour = process.const.STR_True;
                //return
                appSession.nextIntent = process.const.MS300;
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
                //appSession.callPath = appSession.callPath + "collect new address";
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "Collect new_address");
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210125);
                ///  appSession.nextIntent = process.const.MS100;
                appSession.nextIntent = process.const.MS210;
                appSession.nextStateName = "StartServiceAddressMenu";
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
        else if (appSession.nextStateName == process.const.NS_StartService_DifferentPhoneNumberConfirmation) {

            if (appSession.appSessionObj.diffnumloop == process.const.STR_False || appSession.appSessionObj.diffnumloop == undefined || appSession.appSessionObj.diffnumloop == null) {
                let CellPhoneNumberSlot = process.const.STR_PhoneNumber;
                appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = 0;
                appSession.nextIntent = "MS303_DifferentNumber";
                appSession.nextStateName = "DiffNumberMenu";
                appSession.appSessionObj.diffnumloop = process.const.STR_True;
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

            promptOut = process.promptSession.scg_ccc_prmt_2101_main_20_PhConfNo;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "Smart phone number not provided");
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210160);
            if (appSession.appSessionObj.businessHours == "closed") {
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
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
        else if (appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation) {
            appSession.appSessionObj.apartmentNumberSkip = process.const.STR_True;
            let activeContexts = [];

            //appSession.appSessionObj.individualSlot = process.const.STR_False;
            //delete(appSession.appSessionObj.zipCodeIndividualSlot);
            if (appSession.appSessionObj.zipCodeIndividualSlot) {
                if (appSession.appSessionObj.zipCodeIndividualSlot.length != 5) {
                    delete (appSession.appSessionObj.zipCodeIndividualSlot);
                }
            }
            if (appSession.appSessionObj.cityIndividualSlot == "null") {
                delete (appSession.appSessionObj.cityIndividualSlot);

            }

            if (appSession.appSessionObj.cityIndividualSlot != undefined) {
                // let activeContexts = [];
                appSession.nextIntent = "MS420_FullAddress";
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
            // let activeContexts = [];
            appSession.nextIntent = process.const.MS420;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
            let CitySlot = "getCity";

            if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                //start service
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210509);
            } else {
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232509);
            }

            promptOut = process.promptSession.scg_ccc_collect_2325_main_12_CityName;
            cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            appSession.appSessionObj.citySlotCollection = process.const.STR_True;
            //-----CXI----------------------------------//
            cxiSession.cxiSessionObj.slotFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "Input";
            cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
            let CityObj = {};
            CityObj.elicitationStyle = "";
            CityObj.slotName = CitySlot;
            CityObj.slotType = "Amazon.City";
            CityObj.inputMode = intentRequest.inputMode;
            CityObj.slotValue = " ";
            CityObj.noMatchCount = 0;
            CityObj.noInputCount = 0;
            cxiSession.cxiSessionObj.cxiSlotDetails.push(CityObj);
            //-----------------------------------------//
            callback(
                util.DialogAction(
                    process.const.DA_SwitchToIntentSlot,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_InProgress,
                    activeContexts,
                    CitySlot
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
    No
};

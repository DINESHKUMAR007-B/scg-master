const util = require("../Utilities/getLexResponse");
const getFallbackMsg = require("./getFallbackMessage");
const logger = require("../Utilities/logger");
const sessionHelper = require("../Common/sessionHelper");
const ssmlMessage = require("../Common/ssmlHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const catchHelper = require("../Common/catchHelper");
const callPath = require("../Common/callPathHelper");

const Fallback = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    //logger.info("Entered " + intentName + " Intent Flow");
    const outputSessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    let promptOut = " ";
    let activeContexts = [];
    try {
        let appSession = sessionHelper.AppSession;
        let cxiSession = sessionHelper.CxiSession;
        let ctiData = sessionHelper.CtiData;
        //appSession.appSessionObj.maxRetryAgent = "false";
        appSession.startTime = util.getStartTime(new Date());
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "prompt";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //-----------------------------------------------------
        if (appSession.fallBackState == process.const.STR_True) {
            logger.info("fallbackstate Condition");
            appSession.fallBackState = process.const.STR_False;
            appSession.fallBack = process.const.STR_False;
            appSession.fallBackCounter = 0;
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
        else if (appSession.nextStateName == process.const.NS_FullAddressStopService || appSession.nextStateName == process.const.NS_FullAddressStartService) {
            appSession.appSessionObj.individualSlot = process.const.STR_True;
            let activeContexts = [];
            appSession.nextIntent = process.const.MS420;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
            let StreetNumberSlot = "getStreetNumber";
            promptOut = process.promptSession.scg_ccc_prmt_2000_main_13_CommonRetry1 + process.promptSession.scg_ccc_collect_2325_main_06_StrNum;
            cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            //-----CXI----------------------------------//
            cxiSession.cxiSessionObj.slotFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "Input";
            cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
            let StreetNumberObj = {};
            StreetNumberObj.elicitationStyle = "";
            StreetNumberObj.slotName = StreetNumberSlot;
            StreetNumberObj.slotType = "Amazon.Number";
            StreetNumberObj.inputMode = intentRequest.inputMode;
            StreetNumberObj.slotValue = " ";
            StreetNumberObj.noMatchCount = 0;
            StreetNumberObj.noInputCount = 0;
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNumberObj);
            //-----------------------------------------//
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
        else if (appSession.nextStateName == process.const.NS_CommonMainAnyThingElse) {
            appSession.appSessionObj.recogFail = process.const.STR_True;
            appSession.disconnect = process.const.STR_True;
            promptOut = (appSession.callerGoal == process.const.CG_new_customer || appSession.callerGoal == process.const.CG_start_service) ? process.promptSession.scg_ccc_prmt_2335_main_05_AnythingElse : process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
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
        else if (appSession.fallBack == process.const.STR_True) {
            let ctr = parseInt(appSession.fallBackCounter, 10);
            ctr = appSession.appSessionObj.repeatIntentSw == process.const.STR_True ? ctr : ++ctr;
            appSession.fallBackCounter = ctr;
            for (let i = ctr; i <= process.const.Dynamic_FallbackCounter; i++) {

                if (i == process.const.Dynamic_FallbackCounter) {
                    //appSession.appSessionObj.recogFail = process.const.STR_True;
                    logger.info("Max Attempt Reached");

                    if (appSession.nextStateName == "AnythingElse" && appSession.appSessionObj.turnOffStopService == "true") {
                        appSession.disconnect = process.const.STR_True;
                        appSession.appSessionObj.recogFail = process.const.STR_True;
                        appSession.fallBackState = process.const.STR_True;
                        promptOut = process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
                        logger.info("Flow Ended");
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
                    if (appSession.nextStateName == process.const.NS_StopServiceFinalAnythingElse) {

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
                    if (appSession.nextStateName == process.const.NS_AnythingElse ||
                        appSession.nextStateName == process.const.NS_StopServNotAnythingElse ||
                        appSession.nextStateName == process.const.NS_CheckChangeCancelAnythingElse ||
                        appSession.nextStateName == process.const.NS_StopAnyThingElse ||
                        appSession.nextStateName == process.const.NS_StopnotEligibleAnythingElse ||
                        appSession.nextStateName == process.const.NS_StopServNotEligible
                    ) {
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_Common_AnyThingElse_Maxt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233510);
                        appSession.nextIntent = process.const.MS200;
                        appSession.nextStateName = process.const.NS_StopServiceFinalAnythingElse;
                        //appSession.appSessionObj.recogFail = process.const.STR_False;
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
                    } else if (appSession.nextStateName == process.const.NS_AnythingElseBill) {
                        appSession.nextIntent = process.const.MS200;
                        appSession.nextStateName = process.const.NS_StopAnyThingElseMaxRetry;
                        //appSession.appSessionObj.recogFail = process.const.STR_False;
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
                    else if (appSession.nextStateName == process.const.NS_FullAddressConfirmation || appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation) {
                        if (appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer) {

                            appSession.appSessionObj.notValidAdr = "not verify the address";
                            appSession.appSessionObj.recogFail = process.const.STR_True;

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
                                    appSession.appSessionObj.cityCollected = "true";
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


                                if (appSession.appSessionObj.individualSlot === "true") {
                                    // console.log("individualSlot === true true");
                                    logger.debug("individualSlot === true true");
                                    // Only add state if city was collected when collecting address seperatly
                                    if (appSession.appSessionObj.cityCollected === "true") {
                                        //console.log("cityCollected === true true");
                                        logger.debug("cityCollected === true true");
                                        if (addressString) addressString += ", ";
                                        addressString += state;
                                    }
                                } else {
                                    //console.log("individualSlot === true false");
                                    logger.debug("individualSlot === true false");
                                    // Always add state
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
                            logger.info("addressString : " + addressString);
                            // Set the exitReason
                            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, reason);

                            //cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_StartServiceFullAddressCollection_MaxAttempts + ":" + appSession.appSessionObj.streetNumberCollected + "," + appSession.appSessionObj.fullAddressStreetName + "," + appSession.appSessionObj.fullAddressApartmentNumber + "," + appSession.appSessionObj.fullAddressCity + "," + appSession.appSessionObj.fullAddressState + "," + appSession.appSessionObj.zipCodeCollected);
                            cxiSession.cxiSessionObj.callPath = appSession.nextStateName == process.const.NS_FullAddressConfirmation && appSession.appSessionObj.individualSlot == process.const.STR_True ? callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StartServiceFullAddressMaxAttempts) :
                                appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation ? callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StartServiceAptNumConfirmationMaxAttempts) :
                                    callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StartServiceDirectFullAddressMaxAttempts);

                            cxiSession.pegPath = appSession.nextStateName == process.const.NS_FullAddressConfirmation && appSession.appSessionObj.individualSlot == process.const.STR_True ? callPath.PegPath(cxiSession.pegPath, process.const.PP_210535) :
                                appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation ? callPath.PegPath(cxiSession.pegPath, process.const.PP_210515) :
                                    callPath.PegPath(cxiSession.pegPath, process.const.PP_210540);
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
                        cxiSession.cxiSessionObj.callPath = appSession.nextStateName == process.const.NS_FullAddressConfirmation && appSession.appSessionObj.individualSlot == process.const.STR_True ? callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StopServiceFullAddressMaxAttempts) :
                            appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation ? callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StopServiceAptNumConfirmationMaxAttempts) :
                                callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceDirectFullAddressMaxAttempts);


                        cxiSession.pegPath = appSession.nextStateName == process.const.NS_FullAddressConfirmation && appSession.appSessionObj.individualSlot == process.const.STR_True ? callPath.PegPath(cxiSession.pegPath, process.const.PP_232540) :
                            appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation ? callPath.PegPath(cxiSession.pegPath, process.const.PP_232515) :
                                callPath.PegPath(cxiSession.pegPath, process.const.PP_232555);

                        appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                        //appSession.appSessionObj.recogFail = process.const.STR_False;
                        appSession.appSessionObj.fullAddressConfirmationMaxAttempts = process.const.STR_True;
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
                    else if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElse) {
                        appSession.nextIntent = process.const.MS200;
                        appSession.nextStateName = process.const.NS_StopServiceExistingCloseAnythingElseMaxRetry;
                        //appSession.appSessionObj.recogFail = process.const.STR_False;
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
                    else if (appSession.nextStateName == process.const.NS_SmartPhoneConfirmation || appSession.nextStateName == process.const.NS_WebLinkConfirmation || appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation || appSession.nextStateName == process.const.NS_CollectPhoneNumberConfirmation ||
                        appSession.nextStateName == process.const.NS_SMSPhoneNumber || appSession.nextStateName == process.const.NS_SMSMultiModelConfirmation) {
                        switch (appSession.nextStateName) {
                            case process.const.NS_SmartPhoneConfirmation:
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmartPhoneConfirmationMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232605);
                                break;
                            case process.const.NS_WebLinkConfirmation:
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_WebLinkConfirmationMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232610);
                                break;
                            case process.const.NS_SmartPhoneWebLinkConfimation:
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmartPhoneWebLinkConfimationMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232625);
                                break;
                            case process.const.NS_SMSPhoneNumber:
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SMSPhoneNumber);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232630);
                                break;
                            case process.const.NS_CollectPhoneNumberConfirmation:
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CollectPhoneNumberConfirmation);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232635);
                                break;
                            case process.const.NS_SMSMultiModelConfirmation:
                                appSession.appSessionObj.multiModelConfirmationMaxAttempt = "true";

                                break;


                        }
                        //appSession.appSessionObj.recogFail = process.const.STR_False;
                        appSession.nextIntent = process.const.MS202;
                        appSession.nextStateName = process.const.NS_SMSMaxRecognize;
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
                    //--------------------------------------//
                    else if (appSession.nextStateName == process.const.NS_StartServiceProcess || appSession.nextStateName == process.const.NS_StartServiceAddressMenu ||
                        appSession.nextStateName == process.const.NS_DiffNumberMenu || appSession.nextStateName == process.const.NS_StartService_DifferentPhoneNumberConfirmation) {
                        appSession.appSessionObj.recogFail = process.const.STR_True;
                        if (appSession.appSessionObj.businessHours != "closed") {
                            if (appSession.nextStateName == process.const.NS_StartServiceProcess) {
                                logger.info("nextStateName == process.const.NS_StartServiceProcess true in fallbackController");
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2101StartServiceProcessMenuMaxattempt);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210115);
                            }
                        }

                        if (appSession.nextStateName == process.const.NS_StartServiceAddressMenu) {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2101_StartServiceAddrMenu-Max attempt");
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210130);
                        }
                        if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2101DiffNumbMenuMaxattempt);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210140);
                        }

                        if (appSession.appSessionObj.businessHours == "closed" && (appSession.callerGoal == process.const.CG_start_service || appSession.callerGoal == process.const.CG_new_customer)) {
                            logger.info("businessHours == closed && callerGoal == start_service || new_customer true in fallbackController");
                            appSession.appSessionObj.newCustomerMaxAttempt = process.const.STR_True;
                            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NotIntrestedonOnlineProcesstostartservice);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210110);

                        }
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
                    else if (appSession.nextStateName == process.const.NS_StopCancel) {
                        //appSession.appSessionObj.recogFail = process.const.STR_False;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2301_NotStopServiceMenu-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230105);
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
                    else if (appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "Try again later or call back");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220150);
                        promptOut = process.promptSession.scg_ccc_prmt_2201_main_15_PbmProce;
                    }

                    //Max Attempts Transfer Common Conditions
                    else if (appSession.nextStateName == process.const.NS_StopServAcceptDate) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServAcceptDateMaxRetry);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230505);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServDateConfirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServDateConfirmMaxRetry);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230610);

                    }
                    else if (appSession.nextStateName == process.const.NS_StopServAcceptUserDate) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServAcceptUserDateMaxRetry);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230705);

                    }
                    else if (appSession.nextStateName == process.const.NS_StopServPropOwner) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServPropOwnerMaxRetry);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230815);

                    }
                    else if (appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_false) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2501FNPMenuMaxAttemptReached);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250110);
                    }
                    else if (appSession.nextStateName == process.const.NS_FNPMenuAMP_SW_true) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2501FNPMenuMaxAttemptReached);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250110);
                        appSession.appSessionObj.fnpMaxAttempt = "true";

                        if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                            appSession.authenticated == null || appSession.authenticated.length <= 0) {
                            logger.info("authenticated false in MS504");
                            appSession.nextIntent = "AU100_InitialIdentification";
                            appSession.nextBot = "Authentication_Bot";
                            appSession.appSessionObj.fallBackState = process.const.STR_True;
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
                    else if (appSession.nextStateName == process.const.NS_FumigationReconnect_Menu) {
                        logger.info("nextStateName == FumigationReconnect_Menu True in Fallback controller");
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2500FumigationReconnectMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250005);
                        // appSession.appSessionObj.maxRetryAgent = "true";
                    }
                    else if (appSession.nextStateName == process.const.NS_PostFNPMenu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2503_PostFNPMenu-Max Attempt Reached.");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_250305);
                        appSession.appSessionObj.fnpMaxAttempt = "true";

                        if (appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
                            appSession.authenticated == null || appSession.authenticated.length <= 0) {
                            appSession.nextIntent = "AU100_InitialIdentification";
                            appSession.nextBot = "Authentication_Bot";
                            appSession.appSessionObj.fallBackState = process.const.STR_True;
                            promptOut = " ";
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

                    //StopService
                    else if (appSession.nextStateName == process.const.NS_StopService_Pg2) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2302ConfirmMenuMaxAttempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230215);

                    }
                    else if (appSession.nextStateName == process.const.NS_StopServFumStop) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2304StopServFumMenuMaxAttempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230405);

                    }
                    else if (appSession.nextStateName == process.const.NS_StopServOwnerName) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2311PropertyOwnerConfirmMenuMaxAttempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231105);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServOwnerInfo) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2312OwnerConfirmMenuMaxAttempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231205);

                    }
                    else if (appSession.nextStateName == process.const.NS_BillSentMailConfirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_BillSentMailConfirmationMaxAttempts);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232105);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServiceFinalBillAddress) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceFinalBillAddress);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232305);
                        //cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_StopServiceFinalBillAddressMaxAttempt);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServiceChangeAddressSpanish) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceChangeAddressSpanish);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232405);
                        //cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ChangeAddressSpanish);
                    }
                    else if (appSession.nextStateName == process.const.NS_MoreOptions) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2000ChangeServiceMenuMoreOptionsMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_200010);
                    }
                    else if (appSession.nextStateName == process.const.NS_MainServices_Menu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2000ChangeServiceMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_200005);
                    }
                    else if (appSession.nextStateName == process.const.NS_MoveStopMenu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.ER_MAIN2200MoveStopMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220005);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseMenu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2328StopServExistMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232810);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseCancel) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2329ConfrimMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232910);
                    }
                    else if (appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2336PhNumConfirmMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233625);
                    }
                    else if (appSession.nextStateName == process.const.NS_CustomerCellPhone_Confirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2317ConfirmMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231715);
                    }
                    else if (appSession.nextStateName == process.const.NS_CellPhoneNumber_Confirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2318ConfirMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231810);
                    }
                    else if (appSession.nextStateName == process.const.NS_BusinessCustomerCellPhone_Confirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2314_ConfirmMenu-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231425);
                    }
                    else if (appSession.nextStateName == process.const.NS_BusinessPhoneNumber_Confirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2315_ConfirmMenu-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231510);
                    }
                    else if (appSession.nextStateName == process.const.NS_Business_ExtensionNo) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2315_ExtensionConfirmMenu-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231515);
                    }
                    else if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2336PhNumConfirmMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233610);
                    }
                    else if (appSession.nextStateName == "BusinessExtensionNo_Confirmation") {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2316_ConfirmMenu-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231610);
                    }
                    else if (appSession.nextStateName == process.const.NS_Moving_SMS) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2201MoveProcessConfirmMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220105);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServBilledBalaAnythingElse) {
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "MAIN_2334_StopServBillMenu-Max Attempt Reached");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233410);
                    }
                    else if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2201PhNumConfirmMenuMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220130);
                    }
                    else if (appSession.nextStateName == "DD_stopProcess" || appSession.nextStateName == "DD_moveProcess" || appSession.nextStateName == "DD_checkchangecancelProcess") {

                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Service Request Digital Deflection invalid response");
                    }
                    else if (appSession.nextStateName == "DD_processNumber") {
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Service Request Digital Deflection invalid response");

                    }

                    appSession.appSessionObj.recogFail = process.const.STR_True;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }



                else {
                    if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElseMaxRetry) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232920);
                    }
                    if (appSession.nextStateName == process.const.NS_StopAnyThingElseMaxRetry) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SelfServiceEnd);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232210);
                    }


                    if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElseMaxRetry || appSession.nextStateName == process.const.NS_StopAnyThingElseMaxRetry) {
                        appSession.disconnect = process.const.STR_True;
                        promptOut = appSession.nextStateName == process.const.NS_StopAnyThingElseMaxRetry ? process.promptSession.scg_ccc_prmt_2335_main_05_AnythingElse : process.promptSession.scg_ccc_prmt_2329_main_12_SelfServiceEnd;
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
                    promptOut = getFallbackMsg.FallbackMessage(appSession.nextStateName, ctr, outputSessionAttributes, intentRequest, callback);
                    //-----------promptid--------------
                    cxiSession.cxiSessionObj.promptIdFlag = "Y";
                    //-----------------------------------
                    promptOut = appSession.nextStateName == process.const.NS_FullAddressConfirmation ?
                        ssmlMessage.ConvertSSML(promptOut, 90) : ssmlMessage.ConvertSSML(promptOut);
                    callback(
                        util.DialogAction(
                            process.const.DA_ElicitIntent,
                            intentRequest,
                            intentRequest.sessionState.intent.name,
                            util.BuildSSMLMessage(promptOut)
                        )
                    );
                    return;
                }
            }
        }

    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    Fallback
};

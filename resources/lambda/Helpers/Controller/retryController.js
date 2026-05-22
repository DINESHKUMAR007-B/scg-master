const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../Common/catchHelper");
const logger = require("../Utilities/logger");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const callPath = require("../../Helpers/Common/callPathHelper");

exports.Retry = async function (
    slotKey,
    intentRequest,
    firstRetry,
    secondRetry,
    callback,
    mainPrompt = null
) {
    logger.info("Enter Rety Helper ");
    const intentName = intentRequest.sessionState.intent.name;
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let activeContexts = [];
    try {
        let promptOut = " ";
        if (appSession.appSessionObj[slotKey + "Retry"] == process.const.STR_True) {
            let ctr = parseInt(appSession.appSessionObj[slotKey + "Count"], 10);
            ctr++;
            appSession.appSessionObj[slotKey + "Count"] = ctr;
            for (let i = ctr; i <= process.const.Dynamic_RetryCounter; i++) {
                if (i == process.const.Dynamic_RetryCounter) {
                    logger.info("Reached Max Attempt for input retry ");
                   // console.log("nextStateName in Max Retry Attempt " , appSession.nextStateName);
                    logger.info("nextStateName in Max Retry Attempt  " + appSession.nextStateName);
                    if (appSession.nextStateName == "DD_processNumber") {
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, "Service Request Digital Deflection invalid response");

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
                        else if (appSession.authenticated == process.const.STR_True) {
                            appSession.appSessionObj.recogFail = process.const.STR_True;
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );
                        }

                    }
                    else if (appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {
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
                    else if (appSession.appSessionObj.fullAddressStartStopMaxAttempts == process.const.STR_True) 
                        {
                            //console.log("fullAddressStartStopMaxAttempts == true true in retry.js");
                            logger.info("fullAddressStartStopMaxAttempts == true true in retry.js");
                        if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) 
                            {
                            //console.log("callerGoal == StartServicetrue || NewCustomer true in retry.js");
                            logger.info("callerGoal == StartServicetrue || NewCustomer true in retry.js");
                            // appSession.appSessionObj.streetNumberCollected = appSession.appSessionObj.streetNumberCollected == undefined || appSession.appSessionObj.streetNumberCollected == "undefined" ? " " : appSession.appSessionObj.streetNumberCollected;
                            // appSession.appSessionObj.fullAddressStreetName = appSession.appSessionObj.fullAddressStreetName == undefined || appSession.appSessionObj.fullAddressStreetName == "undefined" ? " " : appSession.appSessionObj.fullAddressStreetName;
                            // appSession.appSessionObj.fullAddressCity = appSession.appSessionObj.fullAddressCity == undefined || appSession.appSessionObj.fullAddressCity == "undefined" ? " " : appSession.appSessionObj.fullAddressCity;
                            // appSession.appSessionObj.fullAddressState = appSession.appSessionObj.fullAddressState == undefined || appSession.appSessionObj.fullAddressState == "undefined" ? " " : appSession.appSessionObj.fullAddressState;
                            // appSession.appSessionObj.zipCodeCollected = appSession.appSessionObj.zipCodeCollected == undefined || appSession.appSessionObj.zipCodeCollected == "undefined" ? " " : appSession.appSessionObj.zipCodeCollected;
                            // appSession.appSessionObj.fullAddressApartmentNumber = appSession.appSessionObj.fullAddressApartmentNumber == undefined || appSession.appSessionObj.fullAddressApartmentNumber == "undefined" ?" ":appSession.appSessionObj.fullAddressApartmentNumber;
                            appSession.appSessionObj.notValidAdr = "not verify the address";

                            // cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_StartServiceFullAddressCollection_MaxAttempts + ":" + appSession.appSessionObj.streetNumberCollected + "," + appSession.appSessionObj.fullAddressStreetName + "," + appSession.appSessionObj.fullAddressApartmentNumber + "," + appSession.appSessionObj.fullAddressCity + "," + appSession.appSessionObj.fullAddressState + "," + appSession.appSessionObj.zipCodeCollected);
                            
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
                                    logger.info("individualSlot === true true");
                          
                                    // Only add state if city was collected when collecting address seperatly
                                    if (appSession.appSessionObj.cityCollected === "true") {
                                        //console.log("cityCollected === true true");
                                        logger.info("cityCollected === true true");
                                        if (addressString) addressString += ", ";
                                        addressString += state;
                                    }
                                } else {
                                    //console.log("individualSlot === true false");
                                    logger.info("individualSlot === true false");
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
                            logger.info("addressString : "+ addressString);
                            // Set the exitReason
                            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, reason);


                            // console.log("slotKeyCount", appSession.appSessionObj[slotKey + "Count"]);//2
                            // console.log("slotName", slotKey);//null
                            
                            logger.info("slotKeyCount : " + appSession.appSessionObj[slotKey + "Count"]);
                            logger.info("slotName : "+ slotKey);

                            switch (slotKey) {
                                case "getStreetNumber":
                                   // console.log("getStreetNumber reached max attempt in start/new customer service");
                                    logger.info("getStreetNumber reached max attempt in start/new customer service");
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StartServiceStreetNumberMaxAttempts);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210505);
                                    break;
                                case "getStreetName":
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StartServiceStreetNameMaxAttempts);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210510);
                                    break;
                                case "getApartmentNumber":
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StartServiceAptNumMaxAttempts);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210520);
                                    break;
                                case "getCity":
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StartServiceCityMaxAttempts);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210525);
                                    break;
                                case "getZipCode":
                                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StartServiceZipCodeMaxAttempts);
                                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210530);
                                    break;
                            }

                            appSession.nextStateName = "StartServiceMaxAttempts";
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
                        // console.log("stop service fullAddressStartStopMaxAttempts in retry.js");
                        // console.log("slotKeyCount", appSession.appSessionObj[slotKey + "Count"]);//2
                        // console.log("slotName", slotKey);//null

                        logger.info("stop service fullAddressStartStopMaxAttempts in retry.js");
                        logger.info("slotKeyCount : " + appSession.appSessionObj[slotKey + "Count"]);
                        logger.info("slotName : " + slotKey);


                        switch (slotKey) {
                            case "getStreetNumber":
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceStreetNumberMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232505);
                                break;
                            case "getStreetName":
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceStreetNameMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232510);
                                break;
                            case "getApartmentNumber":
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceAptNumMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232520);
                                break;
                            case "getCity":
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceCityMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232525);
                                break;
                            case "getState":
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceStateMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232530);
                                break;
                            case "getZipCode":
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceZipCodeMaxAttempts);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232535);
                                break;
                        }
                        appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                        appSession.appSessionObj.fullAddressConfirmationMaxAttempts = process.const.STR_True;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServiceFullAddressUnableCapture);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232560);

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
                    else if (appSession.nextStateName == "DiffNumberMenu") {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2101_PhCollectInput-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210150);

                        if (appSession.appSessionObj.businessHours == "closed" && (appSession.callerGoal == "start_service" || appSession.callerGoal == "new_customer")) {

                            appSession.appSessionObj.newCustomerMaxAttempt = process.const.STR_True;

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
                    if (appSession.nextStateName == process.const.NS_CustomerCellPhone_Confirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2318_CollectPhNumInput-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231505);
                    }
                    if (appSession.nextStateName == process.const.NS_BusinessCustomerCellPhone_Confirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2315_PhNumAcctInput-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231505);
                    }
                    if (appSession.nextStateName == process.const.NS_Business_ExtensionNo) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2316_ExtensionPhNumConfirmInput-Max attempt");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231605);
                    }
                    // else if (appSession.appSessionObj.type != "2" && appSession.nextStateName != process.const.NS_Business_ExtensionNo) {
                    //     cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "MAIN_2318_CollectPhNumInput-Max attempt");
                    //     cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231805);
                    // }
                    else if (appSession.nextStateName == process.const.NS_SendSMSDiffSamePhNo) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2336DiffPhNumInputMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233620);
                    }
                    else if (appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2336ConfirmMenuMaxattempt);
                    }
                    else if (appSession.nextStateName == process.const.NS_StopServDate) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_StopServDateMaxRetry);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230605);

                    }
                    else if (appSession.nextStateName == process.const.NS_Move_PhNumConfirmMenu) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MAIN2201PhNumWebTxtInputMaxattempt);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220135);
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
                    if (ctr == "1") {
                        promptOut = process.promptSession.scg_ccc_prmt_2000_main_13_CommonRetry1 + firstRetry;
                    }
                    else if (ctr == "2") {
                        promptOut = process.promptSession.scg_ccc_prmt_2000_main_14_CommonRetry2 + secondRetry;
                    }
                    else {
                        promptOut = mainPrompt;
                    }
                    cxiSession.cxiSessionObj.promptIdFlag = "Y";
                    promptOut = ssmlMessage.ConvertSSML(promptOut);
                    callback(
                        util.DialogAction(
                            "ElicitSlot",
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            "InProgress",
                            activeContexts,
                            slotKey,
                            intentRequest.sessionState.intent.slots
                        )
                    );
                    return;
                }
            }
        }
        else {
            appSession.appSessionObj[slotKey + "Count"] = "0";
        }
        appSession.appSessionObj[slotKey + "Retry"] = process.const.STR_True;
        promptOut = mainPrompt;
        cxiSession.cxiSessionObj.promptIdFlag = "Y";
        promptOut = ssmlMessage.ConvertSSML(promptOut);
        callback(
            util.DialogAction(
                "ElicitSlot",
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                "InProgress",
                activeContexts,
                slotKey,
                intentRequest.sessionState.intent.slots
            )
        );
        return;
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

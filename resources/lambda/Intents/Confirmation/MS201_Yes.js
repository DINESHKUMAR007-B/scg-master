const util = require("../../Helpers/Utilities/getLexResponse");
const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const lex_Slots = require("../../Helpers/Common/slotHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const agentHelper = require("../../Helpers/Common/agentHelper");
const apiHelper = require("../../Helpers/Common/apiHelper");
const xmlTojson = require("../../Helpers/Common/soapApiReq");
const callPath = require("../../Helpers/Common/callPathHelper");
const getDateFormat = require("../../Helpers/Common/getDate");
//const configEmail = require("../../Helpers/Common/configEmail");
const GetDate = require("../../Helpers/Common/getDate");

const Yes = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    //const outputSessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";
    let date;
    let activeContexts = [];
    let accountNumber;
    let stateCode;
    let WS01Details = {}; //cxi
    let WS05Details = {};
    let WS07Details = {}; //cxi
    let closeDate;
    let confirmationNumber;
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_Yes;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "api lookup";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiAPIDetails = [];
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //-----------------------------------------------------
        appSession.fallBackState = process.const.STR_False;
        if ((appSession.appSessionObj.turnOffStopService == "true") && appSession.nextStateName == "DD_stopProcess" ||
            appSession.nextStateName == "DD_moveProcess" || appSession.nextStateName == "DD_checkchangecancelProcess") {
            appSession.preStateName = appSession.nextStateName;
            let DD_path = appSession.nextStateName == "DD_stopProcess" ? "stop service DD accepted" :
                appSession.nextStateName == "DD_moveProcess" ? "stop service DD accepted" : appSession.nextStateName == "DD_checkchangecancelProcess" ? "checkchangecancel service DD accepted" : "main ";
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, DD_path);
            appSession.nextIntent = process.const.MS100;
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
        if (appSession.nextStateName == process.const.NS_StopServiceFinalAnythingElse) {
            logger.info("nextStateName == NS_StopServiceFinalAnythingElse true");
            appSession.nextIntent = process.const.NI_MA100_InitialMenu;
            appSession.appSessionObj.emailSent = process.const.STR_False;
            delete appSession.appSessionObj.stopServiceConfirmation;
            delete appSession.appSessionObj.clsEmailRepeat;
            delete appSession.appSessionObj.emailSent;
            appSession.nextBot = "Master_Bot";
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
        if (appSession.nextStateName == "DD_processNumberDifferent") {
            appSession.appSessionObj.DDnocount = null;
            appSession.nextIntent = "MS402_SameNumber";
            appSession.nextStateName = "DD_DifferentPhoneNumberConfirmation";
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

        // if (appSession.appSessionObj.authMethod == process.const.STR_Addr) {
        //     accountNumber = appSession.appSessionObj.errorCode == process.const.STR_EC425 ||
        //         appSession.appSessionObj.errorCode == process.const.STR_EC475 || appSession.appSessionObj.multipleAccounts == process.const.STR_True ?
        //         appSession.appSessionObj.finalAccountNumberFromStreet : appSession.appSessionObj.spAccountId;
        // }
        // else if (appSession.appSessionObj.authMethod == process.const.STR_Acct) {
        //     accountNumber = appSession.appSessionObj.accountNumber;
        // }
        // else {
        //     accountNumber = appSession.appSessionObj.errorCode == process.const.STR_EC425 ||
        //         appSession.appSessionObj.errorCode == process.const.STR_EC475 || appSession.appSessionObj.multipleAccounts == process.const.STR_True ?
        //         appSession.appSessionObj.finalAccountNumberFromStreet : appSession.appSessionObj.spAccountId;
        // }
        if (appSession.nextStateName == process.const.NS_FullAddressConfirmation && (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer)) {
            //promptOut = process.promptSession.scg_ccc_prmt_2105_main_24_Address;
            //promptOut = ssmlMessage.ConvertSSML(promptOut);
            appSession.appSessionObj.newCustomerAddressCollectedPrompt = process.const.STR_True;
            appSession.nextIntent = process.const.MS300;
            //appSession.fallBackState = process.const.STR_True;
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
            let reason = process.const.ER_StartServiceFullAddressCollection + " : " + addressString;
            //console.log("addressString : ", addressString);
            logger.info("addressString : " + addressString);
            // Set the exitReason
            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, reason);

            // if (appSession.appSessionObj.fullAddressApartmentNumber == "undefined" || appSession.appSessionObj.fullAddressApartmentNumber == undefined ||
            // appSession.appSessionObj.fullAddressApartmentNumber == null || appSession.appSessionObj.fullAddressApartmentNumber == "null" ||
            // appSession.appSessionObj.fullAddressApartmentNumber == " " || appSession.appSessionObj.fullAddressApartmentNumber == "") {
            //     cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_StartServiceFullAddressCollection + ":" + appSession.appSessionObj.streetNumberCollected + " " + appSession.appSessionObj.fullAddressStreetName + "," + appSession.appSessionObj.fullAddressCity + "," + appSession.appSessionObj.fullAddressState + "," + appSession.appSessionObj.zipCodeCollected + ".");
            // } else {
            //     cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_StartServiceFullAddressCollection + ":" + appSession.appSessionObj.streetNumberCollected + " " + appSession.appSessionObj.fullAddressStreetName + "," + appSession.appSessionObj.fullAddressApartmentNumber + "," + appSession.appSessionObj.fullAddressCity + "," + appSession.appSessionObj.fullAddressState + "," + appSession.appSessionObj.zipCodeCollected + ".");
            // }
            //----------------------------CXI-----------------------------
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
            /*callback(
                util.DialogAction(
                    process.const.DA_Close,
                    intentRequest,
                    intentName,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_Fulfilled
                )
            );
            return;*/
        }
        else if (appSession.nextStateName == process.const.NS_SMSMultiModelConfirmation) {
            logger.info("Stop MM nextStateName == NS_SMSMultiModelConfirmation true");

            logger.info(appSession.appSessionObj.fullAddressMultiModel);
            if (appSession.appSessionObj.country == "United States") {

                appSession.appSessionObj.apt_no = appSession.appSessionObj.apt_no == "undefined" || appSession.appSessionObj.apt_no == undefined ||
                    appSession.appSessionObj.apt_no == null || appSession.appSessionObj.apt_no == "null" ? " " : appSession.appSessionObj.apt_no;
                logger.info("Stop MM country == United States true");

                const dqAddressReqObj = {};
                dqAddressReqObj.mixed = appSession.appSessionObj.apt_no + " " + appSession.appSessionObj.street;
                dqAddressReqObj.locality = appSession.appSessionObj.city;
                dqAddressReqObj.region = appSession.appSessionObj.state;
                dqAddressReqObj.postcode = appSession.appSessionObj.zipcode;



                let SAP_DQM_ReqObj = await apiHelper.getRequestObject(process.const.SAP_DQM, dqAddressReqObj, intentRequest, intentName, callback);
                //logger.debug(SAP_DQM_ReqObj);
                let SAP_DQM_ResObj = await apiHelper.getResponseObject(SAP_DQM_ReqObj, intentRequest, intentName, callback);
                //logger.debug(SAP_DQM_ResObj);

                cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
                cxiSession.cxiSessionObj.promptType = "api lookup"; //cxi
                WS01Details.apiId = process.const.SAP_DQM; //cxi
                WS01Details.apiname = process.const.SAP_DQM_Name; //cxi

                if (SAP_DQM_ResObj == null || SAP_DQM_ResObj == undefined || (SAP_DQM_ResObj.status != 200 && SAP_DQM_ResObj.status != "200")) {
                    //console.log("Stop MM SAP_DQM_ResObj.statusCode is not 200");
                    logger.info("Stop MM SAP_DQM_ResObj.statusCode is not 200");
                    //---------CXI--------------------------------------------//
                    WS01Details.statusCode = SAP_DQM_ResObj == null || SAP_DQM_ResObj == undefined ? "500" : SAP_DQM_ResObj.status;
                    WS01Details.apiStateResult = "Failure";
                    WS01Details.errorMessage = "API Failure";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                    //------------------------------------------------------------//
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderOperation3);
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelCloseOrderOperation3Failure);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232740);

                    appSession.appSessionObj.closeOrderOperation3Failure = process.const.STR_True;
                    appSession.nextIntent = process.const.MS210;
                    appSession.appSessionObj.dbFail = process.const.STR_True;
                    appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
                    callback(
                        util.DialogAction(
                            process.const.DA_Delegate,
                            intentRequest,
                            appSession.nextIntent,
                            util.BuildSSMLMessage(""),
                            process.const.STR_Fulfilled,
                            activeContexts,
                            process.const.STR_Default,
                            intentRequest.sessionState.intent.slots
                        )
                    );
                    return;
                }
                else {
                    let dqAddressRes = SAP_DQM_ResObj.data;
                    //console.log("Stop MM dqAddressRes.addr_asmt_info : ", dqAddressRes.addr_asmt_info);
                    //logger.info("Stop MM dqAddressRes.addr_asmt_info : " + dqAddressRes.addr_asmt_info);
                    appSession.appSessionObj.dqReturnType = dqAddressRes.addr_asmt_info;
                    if (appSession.appSessionObj.dqReturnType != "C" && appSession.appSessionObj.dqReturnType != "V") {
                        //console.log("Stop MM dqAddressRes.addr_asmt_info is not C and V ");
                        logger.info("Stop MM dqAddressRes.addr_asmt_info is not C and V ");
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderOperation3);
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelCloseOrderOperation3Failure);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232740);
                        appSession.nextIntent = process.const.MS210;
                        appSession.appSessionObj.closeOrderOperation3Failure = process.const.STR_True;
                        appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
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
                    //console.log("Stop MM dqAddressRes.addr_asmt_info is C or V ");
                    logger.info("Stop MM dqAddressRes.addr_asmt_info is C or V ");
                    //---------CXI--------------------------------------------//
                    WS01Details.statusCode = SAP_DQM_ResObj.status; //cxi
                    WS01Details.apiStateResult = "Success";
                    WS01Details.errorMessage = process.const.SAP_DQM_Message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                    cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
                    //------------------------------------------------------------//
                    appSession.appSessionObj.dqReturnedCity = dqAddressRes.std_addr_locality_full;
                    appSession.appSessionObj.dqReturnedPostcode = dqAddressRes.std_addr_postcode_full;
                    appSession.appSessionObj.dqReturnedState = dqAddressRes.std_addr_region_full;
                    appSession.appSessionObj.dqReturnedStreet = dqAddressRes.std_addr_address_delivery;
                    appSession.appSessionObj.dqReturnedCountry = dqAddressRes.std_addr_country_2char;

                    appSession.nextIntent = process.const.MS210;
                    appSession.appSessionObj.multimodalAddressValidation = process.const.STR_True;
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelCloseOrderOperation3Success);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232745);
                    appSession.nextStateName = process.const.NS_BillSentMailConfirmation;
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
            else {
                logger.info("Stop MM country == United States false");
                cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
                appSession.appSessionObj.multiModelForeignAddress = process.const.STR_True;
                appSession.nextIntent = process.const.MS210;
                appSession.nextStateName = process.const.NS_BillSentMailConfirmation;
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
        else if (appSession.nextStateName == process.const.NS_ApartmentNumberConfirmation) {
            if (appSession.appSessionObj.zipCodeIndividualSlot) {
                if (appSession.appSessionObj.zipCodeIndividualSlot.length != 5) {
                    delete (appSession.appSessionObj.zipCodeIndividualSlot);
                }
            }
            if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                //start service
                if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210508);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210502);
                }

            } else {
                if (appSession.appSessionObj.individualSlot == process.const.STR_True) {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232508);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232502);
                }
            }

            let activeContexts = [];
            appSession.nextIntent = process.const.MS420;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);
            let ApartmentNumberSlot = "getApartmentNumber";
            promptOut = process.promptSession.scg_ccc_collect_2105_main_15_AptNumberOrUnit_Yes;
            cxiSession.cxiSessionObj.promptIdFlag = "Y";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            appSession.appSessionObj.apartmentNumberSlotCollection = process.const.STR_True;
            //-----CXI----------------------------------//
            cxiSession.cxiSessionObj.slotFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "Input";
            cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
            let ApartmentNumberObj = {};
            ApartmentNumberObj.elicitationStyle = "";
            ApartmentNumberObj.slotName = ApartmentNumberSlot;
            ApartmentNumberObj.slotType = "ExternalGrammar";
            ApartmentNumberObj.inputMode = intentRequest.inputMode;
            ApartmentNumberObj.slotValue = " ";
            ApartmentNumberObj.noMatchCount = 0;
            ApartmentNumberObj.noInputCount = 0;
            cxiSession.cxiSessionObj.cxiSlotDetails.push(ApartmentNumberObj);
            //-----------------------------------------//
            callback(
                util.DialogAction(
                    process.const.DA_SwitchToIntentSlot,
                    intentRequest,
                    appSession.nextIntent,
                    util.BuildSSMLMessage(promptOut),
                    process.const.STR_InProgress,
                    activeContexts,
                    ApartmentNumberSlot
                )
            );
            return;
        }
        else if (appSession.nextStateName == process.const.NS_StopAnyThingElseMaxRetry || appSession.nextStateName == process.const.NS_AnythingElse ||
            appSession.nextStateName == process.const.NS_StopAnyThingElse || appSession.nextStateName == process.const.NS_StopServNotAnythingElse ||
            appSession.nextStateName == process.const.NS_StopServNotEligible ||
            appSession.nextStateName == process.const.NS_CommonMainAnyThingElse || appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElse ||
            appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElseMaxRetry) {
            cxiSession.cxiSessionObj.promptType = "prompt";
            appSession.appSessionObj.phoneNumberCount = "0";
            appSession.nextIntent = process.const.MS108;
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
        else if (appSession.nextStateName == "finalAddress_Confrimation") {
            promptOut = '<say-as interpret-as="fraction">' + appSession.appSessionObj.streetNumberValue + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="address">' + appSession.StreetName + appSession.AptNumOrUnit + "" + appSession.CityName + "" + "california" + '</say-as>' + '<break time="0.1s"/>' + '<say-as interpret-as="digits">' + appSession.zipCodeValue + '</say-as>' + '<break time="0.1s"/>' + " is Updated Successfully";
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            callback(
                util.DialogAction(
                    "Close",
                    intentRequest,
                    intentName,
                    util.BuildSSMLMessage(promptOut),
                    "Fulfilled"
                ));
            return;
        }
        else if (appSession.nextStateName == process.const.NS_SendSMS_DifferentPhoneNumberConfirmation) {
            logger.info("nextStateName == NS_SendSMS_DifferentPhoneNumberConfirmation true in MS201");
            logger.info("stop service DD (Close Order confirmation number via SMS) MS201");
            appSession.appSessionObj.confirmDate = appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True ? appSession.appSessionObj.closeDate : appSession.appSessionObj.stopDate;
            let dateFormatted = getDateFormat.formattedDate(appSession.appSessionObj.confirmDate);
            appSession.appSessionObj.confirmNum = appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True ? appSession.appSessionObj.confirmationNumber : appSession.appSessionObj.cancelMoveConfNumber;
            appSession.appSessionObj.propertyVal = appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True ? process.const.WS_StopServiceDate_PropertyValue : process.const.WS_StopServiceCancelDate_PropertyValue;
            
            /*WS_StopServiceDate_PropertyValue = Your service is scheduled to be stopped on // stop service
             WS_StopServiceCancelDate_PropertyValue= Your service is scheduled to be cancelled on // cancel service
             WS_ConfirmationNumber_PropertyValue = and the confirmation number is*/  
             let confMessage;
            if (appSession.appSessionObj.stopServiceConfirmation == process.const.STR_True) {
            // Stop Service → Include date
             confMessage = process.const.WS_StopServiceDate_PropertyValue + " " + dateFormatted + " " + process.const.WS_ConfirmationNumber_PropertyValue + " " + appSession.appSessionObj.confirmNum;
            } else {
            // Cancel Service → Remove date
             confMessage = process.const.WS_StopServiceCancelDate_PropertyValue + " " + process.const.WS_ConfirmationNumber_PropertyValue + " " + appSession.appSessionObj.confirmNum;
            }
            const sendSmsObj = [{
                phoneNumber: appSession.appSessionObj.smsDifferentPhoneNumber,
                templateId: process.const.WS_SCG_CustomerContactServiceSMSConfNum_templateId, //058
                needTracking: process.const.WS_SCG_CustomerContactServiceSMS_needTracking, //false
                billAccountNumber: appSession.appSessionObj.contractAccount == undefined ? "" : appSession.appSessionObj.contractAccount
            },
            { propertyKey: "ConfNum_Info", propertyValue: confMessage },
            { propertyKey: "SOURCE_SYSTEM", propertyValue: "IVR" },
            ];
            let MS_WS01_ReqObj = await apiHelper.getSOAPRequestObject("MS_WS07", sendSmsObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ReqObj);
            let MS_WS01_ResObj = await apiHelper.getSOAPResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);



            //-------------CXI_apidetails-----------------------------------//
            let WS07Details = {}; //cxi
            cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "api lookup"; //cxi
            WS07Details.apiId = "MS_WS07"; //cxi
            WS07Details.apiname = "SendSMS"; //cxi


            if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || MS_WS01_ResObj.statusCode != 200) {

                //---------PUT CXI Keys-------------------------------------------
                WS07Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.status;
                WS07Details.apiStateResult = "Failure";
                WS07Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                //------------------------------------------------------------
                //------------------------------------------------------------//
                cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_CloseOrderConfirmSMS);
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SmsConfirmationNumberFail);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233680);
                promptOut = process.promptSession.scg_ccc_prmt_2336_main_12_TextIssue;
                appSession.appSessionObj.dbFail = process.const.STR_true;
                appSession.appSessionObj.dbFail = process.const.STR_True;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            let sendSMSInfoRes = (MS_WS01_ResObj.body);
            sendSMSInfoRes = sendSMSInfoRes["Envelope"]["Body"]["getCustomerContactTextResponse"]["CustomerContactTextResponseMessage"]["MessagePayload"];
            //logger.debug(sendSMSInfoRes);
            cxiSession.cxiSessionObj.promptType = "Prompt"; //cxi
            WS07Details.statusCode = MS_WS01_ResObj.statusCode; //cxi
            if ((sendSMSInfoRes["Event"]["result"] != "SUCCESS")) {
                //---------CXI--------------------------------------------//
                WS07Details.apiStateResult = "Failure";
                WS07Details.errorMessage = sendSMSInfoRes["Event"]["Error"]["reason"];
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                //------------------------------------------------------------//
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderConfirmSMS);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmsConfirmationNumberFail);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233635);
                promptOut = process.promptSession.scg_ccc_prmt_2336_main_12_TextIssue;
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );

            }

            //---------CXI--------------------------------------------//
            WS07Details.apiStateResult = "Success";
            WS07Details.errorMessage = " ";
            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
            //------------------------------------------------------------//
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "SMS confirmation number Sent");
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233630);
            appSession.nextIntent = process.const.MS210;
            appSession.nextStateName = process.const.NS_AnythingElse;
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
        else if (appSession.nextStateName == process.const.NS_Moving_SMS) {
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "To move service process");
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_220110);
            cxiSession.cxiSessionObj.promptType = "prompt";
            promptOut = ssmlMessage.ConvertSSML("");
            appSession.nextStateName = "Move_PhNumConfirmMenu";
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

        else if (appSession.nextStateName == process.const.NS_StopServAcceptDate) {
            logger.info("nextStateName == NS_StopServAcceptDate true in MS201");
            appSession.appSessionObj.from2305 = "Y";
            appSession.appSessionObj.stopServiceAccepted = "Y";
            appSession.appSessionObj.userDate = appSession.appSessionObj.firstAvailCloseDate;
            if (appSession.callerGoal == process.const.CG_close_order || appSession.callerGoal == process.const.CG_moving) {
                appSession.appSessionObj.firstAvailCloseDate = appSession.appSessionObj.firstAvailCloseDate == null || appSession.appSessionObj.firstAvailCloseDate == undefined || appSession.appSessionObj.firstAvailCloseDate == "null" ? "" : appSession.appSessionObj.firstAvailCloseDate;
                const closeFormattedDate = appSession.appSessionObj.firstAvailCloseDate == "" ? appSession.appSessionObj.firstAvailCloseDate : GetDate.convertDateFormat(appSession.appSessionObj.firstAvailCloseDate);

                cxiSession.cxiSessionObj.exitReason = appSession.callerGoal == process.const.CG_close_order ? callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_CloseorderDate + closeFormattedDate + ".") : callPath.CallPath(cxiSession.cxiSessionObj.exitReason, process.const.ER_MovingCloseOrderDate + closeFormattedDate + ".");
                // cxiSession.cxiSessionObj.exitReason = appSession.callerGoal == process.const.CG_close_order ? callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, appSession.appSessionObj.firstDate + ".") : callPath.CallPath(cxiSession.cxiSessionObj.exitReason, appSession.appSessionObj.firstDate + ".");
                appSession.callerGoal = appSession.callerGoal == process.const.CG_close_order ? process.const.CG_close_order_need_owner_and_ma : process.const.CG_moving_need_owner_and_ma;
            }
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_CloseDateConfirmed);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230510);
            cxiSession.cxiSessionObj.promptType = "prompt";
            //appSession.nextIntent = process.const.MS416;            
            appSession.nextStateName = process.const.NS_StopServPropOwner;
            return require("../MainServiceMenus/StopService/StopServicePropOwner/MS416_StopServPropOwner").StopServPropOwner(intentRequest, callback);
            // callback(
            //     util.DialogAction(
            //         process.const.DA_Delegate,
            //         intentRequest,
            //         appSession.nextIntent,
            //         util.BuildSSMLMessage(""),
            //         process.const.STR_Fulfilled,
            //         activeContexts,
            //         process.const.STR_Default,
            //         intentRequest.sessionState.intent.slots,
            //     )
            // );
            // return;
        }
        else if (appSession.nextStateName == process.const.NS_StopServDateConfirmation) {
            appSession.appSessionObj.from2306 = "Y";
            cxiSession.cxiSessionObj.promptType = "prompt";
            appSession.nextStateName = process.const.NS_StopServDateConfirmationLogic;
            appSession.nextIntent = process.const.MS201;
            promptOut = process.promptSession.scg_ccc_prmt_2306_main_07_CheckDate;
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

        else if (appSession.nextStateName == process.const.NS_StopServDateConfirmationLogic) {
            logger.info("nextStateName == NS_StopServDateConfirmationLogic true");

            //console.log("userDate in  : ", appSession.appSessionObj.userDate);
            logger.info("userDate in  : " + appSession.appSessionObj.userDate);

            let offCalendarDtfiltered = Array.isArray(appSession.appSessionObj.offCalendarDtfiltered)
                ? appSession.appSessionObj.offCalendarDtfiltered
                : (typeof appSession.appSessionObj.offCalendarDtfiltered === "string"
                    ? appSession.appSessionObj.offCalendarDtfiltered.split(",")
                    : []);

            // console.log("offCalendarDtfiltered in MS201 ", offCalendarDtfiltered)
            logger.info("offCalendarDtfiltered in MS201 " + offCalendarDtfiltered);

            if (offCalendarDtfiltered.includes(appSession.appSessionObj.userDate)) {
                logger.info("user entered date present in calender");
                cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StopServDateConfirmYes);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230615);
                appSession.nextIntent = process.const.MS416;
                appSession.nextStateName = process.const.NS_StopServPropOwner;
                appSession.appSessionObj.moduleName = process.const.MN_MAIN_2306_StopServDate;
            }
            else {
                logger.info("user entered date not present in calender");
                let compareDate = new Date(appSession.appSessionObj.userDate);
                appSession.appSessionObj.nextDate = offCalendarDtfiltered.map(dateStr => new Date(dateStr)).find(date => date > compareDate);
                appSession.appSessionObj.nextDate = (appSession.appSessionObj.nextDate == "" || appSession.appSessionObj.nextDate == null || appSession.appSessionObj.nextDate == "null" || appSession.appSessionObj.nextDate == undefined) ? appSession.appSessionObj.nextDate : appSession.appSessionObj.nextDate.toISOString().split('T')[0];
                logger.info("nextDate : " + appSession.appSessionObj.nextDate);

                if (appSession.appSessionObj.nextDate) {
                    logger.info("next date is available");
                    logger.debug(appSession.appSessionObj.nextDate);
                    appSession.appSessionObj.nextDate = appSession.appSessionObj.nextDate;
                    appSession.appSessionObj.moduleName = process.const.MN_MAIN_2307_StopServAcceptUserDate;
                    appSession.bargeIn = process.const.STR_False;
                    let dateFormat = getDateFormat.getDateName(appSession.appSessionObj.nextDate, intentRequest);
                    promptOut = process.promptSession.scg_ccc_prmt_2307_main_01_StopBillingNextDt + '<break time="0.2s"/>' + dateFormat[1] + '<say-as interpret-as="date" format="md">' + dateFormat[0] + "</say-as>" + '<break time="0.2s"/>';
                    appSession.nextIntent = process.const.MS200;
                    appSession.nextStateName = process.const.NS_StopServAcceptUserDate;
                    appSession.fallBackState = process.const.STR_True;
                    cxiSession.cxiSessionObj.promptType = "prompt";
                    callback(
                        util.DialogAction(
                            process.const.DA_Close,
                            intentRequest,
                            intentName,
                            util.BuildSSMLMessage(promptOut),
                            process.const.STR_Fulfilled
                        ));
                    return;
                } else {
                    logger.info("next date is not available");
                    cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_StopServDateNextdateNull);
                    appSession.transfer = true;
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }

            }
            appSession.fallBackState = process.const.STR_True;
            cxiSession.cxiSessionObj.promptType = "prompt";
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
        else if (appSession.nextStateName == process.const.NS_StopServAcceptUserDate) {
            appSession.appSessionObj.from2307 = "Y";

            appSession.appSessionObj.userDate = appSession.appSessionObj.nextDate;
            //appSession.callerGoal = process.const.CG_close_order_need_owner_and_ma;
            if (appSession.callerGoal == process.const.CG_close_order || appSession.callerGoal == process.const.CG_moving) {
                appSession.callerGoal = appSession.callerGoal == process.const.CG_close_order ? process.const.CG_close_order_need_owner_and_ma : process.const.CG_moving_need_owner_and_ma;
            }
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StopServAcceptUserDateYes);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230710);
            //appSession.nextIntent = process.const.MS416;
            return require("../MainServiceMenus/StopService/StopServicePropOwner/MS416_StopServPropOwner").StopServPropOwner(intentRequest, callback);     
            cxiSession.cxiSessionObj.promptType = "prompt";
            // callback(
            //     util.DialogAction(
            //         process.const.DA_Delegate,
            //         intentRequest,
            //         appSession.nextIntent,
            //         util.BuildSSMLMessage(""),
            //         process.const.STR_Fulfilled,
            //         activeContexts,
            //         process.const.STR_Default,
            //         intentRequest.sessionState.intent.slots,
            //     )
            // );
            // return;
        }
        else if (appSession.nextStateName == process.const.NS_StopServPropOwner) {
            appSession.callerGoal = appSession.callerGoal == process.const.CG_close_order || appSession.callerGoal == process.const.CG_close_order_need_owner_and_ma ? process.const.CG_CloseOrderNeedMA : process.const.CG_MovingNeedMa;
            //appSession.nextIntent = process.const.MS413;
            cxiSession.cxiSessionObj.promptType = "prompt";

            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_PropertyOwner);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_230820);
            return require("../MainServiceMenus/StopService/CustomerType/MS413_CustomerType").CustomerType(intentRequest, callback); 
            // callback(
            //     util.DialogAction(
            //         process.const.DA_Delegate,
            //         intentRequest,
            //         appSession.nextIntent,
            //         util.BuildSSMLMessage(""),
            //         process.const.STR_Fulfilled,
            //         activeContexts,
            //         process.const.STR_Default,
            //         intentRequest.sessionState.intent.slots,
            //     )
            // );
            // return;

        }
        else if (appSession.nextStateName == process.const.NS_StopCancel) {
            appSession.nextIntent = process.const.MS100;
            cxiSession.cxiSessionObj.promptType = "prompt";
            appSession.appSessionObj.preStateName = appSession.nextStateName;
            appSession.appSessionObj.nextStateName = process.const.NS_MoveStopMenu;
            appSession.appSessionObj.callerGoal = process.const.CG_close_order;
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
        else if (appSession.nextStateName == process.const.NS_StopService_Pg2) {
            cxiSession.cxiSessionObj.promptType = "prompt";
            appSession.nextStateName = process.const.NS_StopServFumStop;
            appSession.nextIntent = process.const.MS200;
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
        else if (appSession.nextStateName == process.const.NS_StopServFumStop) {
            appSession.appSessionObj.callerGoal = process.const.CG_fumigation;
            cxiSession.cxiSessionObj.promptType = "prompt";
            appSession.nextIntent = process.const.MS300;
            cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_FumigationSelected);
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
        else if (appSession.nextStateName == process.const.NS_StopServOwnerName) {
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_KnowPropertyOwnerName);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231110);


            appSession.nextStateName = process.const.NS_StopServOwnerInfo;
            appSession.nextIntent = process.const.MS200;
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
        else if (appSession.nextStateName == process.const.NS_StopServOwnerInfo) {
            appSession.transfer = process.const.STR_True;
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_KnowPropertyOwnerAddress);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231210);

            return agentHelper.AgentTransfer(
                intentRequest,
                intentName,
                promptOut,
                callback
            );
        }
        else if (appSession.nextStateName == process.const.NS_CustomerCellPhone_Confirmation) {
            if (appSession.appSessionObj.cellPhoneVerified == process.const.STR_True) {
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CellPhoneAlreadyVerifiedOnSameCall);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231910);
                if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, "Close Order Phone number verified");
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231915);
                    appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                    appSession.nextIntent = process.const.MS417;
                }
                else if (appSession.callerGoal != process.const.CG_CloseOrderNeedMA) {
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
            else {
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SendCellPhoneVerfiedToSAP);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231905);
                appSession.appSessionObj.phoneCellVerifSw = "Y";
                logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber3232");
                logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
                if (appSession.appSessionObj.businessPartnerPhoneNumber == null ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "undefined") {
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem;
                    appSession.appSessionObj.cellPhone = process.const.BusinessPartner_UpdatePhoneNumber;
                }
                else {
                    appSession.appSessionObj.cellPhone = appSession.appSessionObj.businessPartnerPhoneNumber;
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;
                }

                const businessPartner_Update = {};
                businessPartner_Update.source = process.const.BusinessPartner_UpdateSource;
                businessPartner_Update.action = process.const.BusinessPartner_UpdateAction;
                businessPartner_Update.requestedBy = appSession.appSessionObj.ANI == undefined || appSession.appSessionObj.ANI == "undefined" ? " " : appSession.appSessionObj.ANI;
                businessPartner_Update.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? " " : appSession.appSessionObj.businessPartner;
                businessPartner_Update.zGUpdContactInfoOperation = appSession.appSessionObj.UpdContactInfoOperation;
                businessPartner_Update.zGUpdContactInfoContactType = process.const.BusinessPartner_ContactType;
                businessPartner_Update.zGUpdContactInfoContact = appSession.appSessionObj.cellPhone == undefined || appSession.appSessionObj.cellPhone == "undefined" ? " " : appSession.appSessionObj.cellPhone;
                businessPartner_Update.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension == undefined || appSession.appSessionObj.phoneNumberExtension == "undefined" ? " " : appSession.appSessionObj.phoneNumberExtension;
                businessPartner_Update.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
                businessPartner_Update.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? false : (appSession.appSessionObj.isPrimaryPhone === 'true');
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
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureUpdatePhoneNumberVerificationToSAP);
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
                    // console.log("businessPartnerResp:", businessPartnerResp);
                    logger.debug(businessPartnerResp);
                    //let returnCode = businessPartnerResp.ZGMessage.results[0].Type;
                    let returnCode = businessPartnerResp?.ZGMessage?.results[0]?.Type;
                    if (returnCode == "E" || returnCode == "e" || !returnCode) {
                        //---------PUT CXI Keys-------------------------------------------
                        WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                        WS05Details.apiStateResult = "Failure";
                        WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                        //-----------------------------------------------------
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_ProcessFailureUpdatePhoneNumberVerificationToSAP);
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }
                    else {
                        if (returnCode == "S" || returnCode == "s") {
                            //---------PUT CXI Keys-------------------------------------------
                            WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                            WS05Details.apiStateResult = "Success";
                            WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                            cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                            //----------------------------------------------------- 
                            appSession.appSessionObj.cellPhoneVerified = process.const.STR_True;
                            if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderPhoneNumberVerified);
                                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231915);
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
        }
        else if (appSession.nextStateName == process.const.NS_CellPhoneNumber_Confirmation || appSession.nextStateName == process.const.NS_CellPhoneNumber_ConfirmationNo) {
            if (appSession.nextStateName == process.const.NS_CellPhoneNumber_Confirmation && appSession.preStateName != "MainServices_DontHaveIt") {
                logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber4343");
                logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);

                appSession.appSessionObj.cellPhoneNumberMS;
                appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;

            }
            else {
                if (appSession.appSessionObj.businessPartnerPhoneNumber == null ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "undefined") {
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem;
                    appSession.appSessionObj.cellPhoneNumberMS = process.const.BusinessPartner_UpdatePhoneNumber;
                }
                else {
                    appSession.appSessionObj.cellPhoneNumberMS = appSession.appSessionObj.businessPartnerPhoneNumber;
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem;
                }
            }
            appSession.appSessionObj.phoneCellVerifSw = "Y";
            logger.info("appSession.appSessionObj.cellPhoneNumberMS");
            logger.info(appSession.appSessionObj.cellPhoneNumberMS);
            const businessPartner_Update = {};
            businessPartner_Update.source = process.const.BusinessPartner_UpdateSource;
            businessPartner_Update.action = process.const.BusinessPartner_UpdateAction;
            businessPartner_Update.requestedBy = appSession.appSessionObj.ANI == undefined || appSession.appSessionObj.ANI == "undefined" ? " " : appSession.appSessionObj.ANI;
            businessPartner_Update.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? " " : appSession.appSessionObj.businessPartner;
            businessPartner_Update.zGUpdContactInfoOperation = appSession.appSessionObj.UpdContactInfoOperation;
            businessPartner_Update.zGUpdContactInfoContactType = process.const.BusinessPartner_ContactType;
            businessPartner_Update.zGUpdContactInfoContact = appSession.appSessionObj.cellPhoneNumberMS == undefined || appSession.appSessionObj.cellPhoneNumberMS == "undefined" ? " " : appSession.appSessionObj.cellPhoneNumberMS;
            businessPartner_Update.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension == undefined || appSession.appSessionObj.phoneNumberExtension == "undefined" ? " " : appSession.appSessionObj.phoneNumberExtension;
            businessPartner_Update.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
            businessPartner_Update.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? false : (appSession.appSessionObj.isPrimaryPhone === 'true');
            businessPartner_Update.zGUpdContactInfoAddressNumber = appSession.appSessionObj.addressNumber == undefined || appSession.appSessionObj.addressNumber == "undefined" ? " " : appSession.appSessionObj.addressNumber;
            businessPartner_Update.zGUpdContactInfoSequenceNumber = appSession.appSessionObj.sequenceNumber == undefined || appSession.appSessionObj.sequenceNumber == "undefined" ? " " : appSession.appSessionObj.sequenceNumber;

            let MS_WS05_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_001_Update, businessPartner_Update, intentRequest, intentName, callback);
            //logger.debug(MS_WS05_ReqObj);
            //console.log("I_DG_02_001_UpdateReq2:", JSON.stringify(MS_WS05_ReqObj));
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
            let businessPartnerResp = MS_WS05_ResObj.data;
            logger.debug(businessPartnerResp);
            // console.log("businessPartnerResp:", businessPartnerResp);
            //let returnCode = businessPartnerResp.ZGMessage.results[0].Type;
            let returnCode = businessPartnerResp?.ZGMessage?.results[0]?.Type;
            if (returnCode == "E" || returnCode == "e" || !returnCode) {
                //---------PUT CXI Keys-------------------------------------------
                WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                WS05Details.apiStateResult = businessPartnerResp?.ZGMessage?.results[0]?.Message;
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
                if (returnCode == "S" || returnCode == "s") {
                    //---------PUT CXI Keys-------------------------------------------
                    WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                    WS05Details.apiStateResult = "Success";
                    WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                    //-----------------------------------------------------
                    appSession.appSessionObj.cellPhoneVerified = process.const.STR_True;
                    if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderPhoneNumberAdded);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231815);
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
        else if (appSession.nextStateName == process.const.NS_BusinessCustomerCellPhone_Confirmation) {
            appSession.appSessionObj.businessWPhoneVerified = process.const.STR_True;
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_BusinessPhoneConfirmed);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231430);
            if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
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
        else if (appSession.nextStateName == process.const.NS_BusinessPhoneNumber_Confirmation) {
            appSession.nextIntent = process.const.MS200;
            appSession.nextStateName = process.const.NS_Business_ExtensionNo;
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
        else if (appSession.nextStateName == process.const.NS_Business_ExtensionNo) {
            let WorkPhoneExtNumberSlot = "getWorkPhoneExtNumber";
            appSession.nextIntent = process.const.MS423;
            appSession.nextStateName = process.const.NS_Initial_BusinessWorkExtNumber;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneExtNumber);
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_DontHaveIt);
            appSession.appSessionObj[WorkPhoneExtNumberSlot + "Count"] = "0";
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
        else if (appSession.nextStateName == process.const.NS_BusinessExtensionNo_Confirmation) {

            appSession.appSessionObj.businessWPhoneVerified = process.const.STR_True;
            appSession.appSessionObj.businessPhoneNumberMS;
            appSession.appSessionObj.phoneNumberExtension = appSession.appSessionObj.businessExtensionNumberMS;
            appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactAdd;

            if (appSession.preStateName == "MainServices_DontHaveIt") {
                appSession.appSessionObj.phoneNumberExtension = "";
                logger.debug("appSession.appSessionObj.businessPartnerPhoneNumber2121");
                logger.debug(appSession.appSessionObj.businessPartnerPhoneNumber);
                if (appSession.appSessionObj.businessPartnerPhoneNumber == null ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "" ||
                    appSession.appSessionObj.businessPartnerPhoneNumber == "undefined") {
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem;
                    appSession.appSessionObj.businessPhoneNumberMS = process.const.BusinessPartner_UpdatePhoneNumber;
                }
                else {
                    appSession.appSessionObj.businessPhoneNumberMS = appSession.appSessionObj.businessPartnerPhoneNumber;
                    appSession.appSessionObj.UpdContactInfoOperation = process.const.BusinessPartner_UpdateContactRem;
                }
            }

            const businessPartner_Update = {};
            businessPartner_Update.source = process.const.BusinessPartner_UpdateSource;
            businessPartner_Update.action = process.const.BusinessPartner_UpdateAction;
            businessPartner_Update.requestedBy = appSession.appSessionObj.ANI == undefined || appSession.appSessionObj.ANI == "undefined" ? " " : appSession.appSessionObj.ANI;
            businessPartner_Update.relatedBusinessPartner = appSession.appSessionObj.businessPartner == undefined || appSession.appSessionObj.businessPartner == "undefined" ? " " : appSession.appSessionObj.businessPartner;
            businessPartner_Update.zGUpdContactInfoOperation = appSession.appSessionObj.UpdContactInfoOperation;
            businessPartner_Update.zGUpdContactInfoContactType = process.const.BusinessPartner_ContactType;
            businessPartner_Update.zGUpdContactInfoContact = appSession.appSessionObj.businessPhoneNumberMS == undefined || appSession.appSessionObj.businessPhoneNumberMS == "undefined" ? " " : appSession.appSessionObj.businessPhoneNumberMS;
            businessPartner_Update.zGUpdContactInfoPhoneNumberExtension = appSession.appSessionObj.phoneNumberExtension == undefined || appSession.appSessionObj.phoneNumberExtension == "undefined" ? " " : appSession.appSessionObj.phoneNumberExtension;
            businessPartner_Update.zGUpdContactInfoPhoneType = appSession.appSessionObj.phoneType == undefined || appSession.appSessionObj.phoneType == "undefined" ? " " : appSession.appSessionObj.phoneType;
            businessPartner_Update.zGUpdContactInfoIsPrimaryPhone = appSession.appSessionObj.isPrimaryPhone == undefined || appSession.appSessionObj.isPrimaryPhone == "undefined" ? false : (appSession.appSessionObj.isPrimaryPhone === 'true');
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
                logger.debug(businessPartnerResp);
                //let returnCode = businessPartnerResp.ZGMessage.results[0].Type;
                let returnCode = businessPartnerResp?.ZGMessage?.results[0]?.Type;
                if (returnCode == "E" || returnCode == "e" || !returnCode) {
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
                    if (returnCode == "S" || returnCode == "s") {
                        //---------PUT CXI Keys-------------------------------------------
                        WS05Details.statusCode = MS_WS05_ResObj.statusCode;
                        WS05Details.apiStateResult = "Success";
                        WS05Details.errorMessage = businessPartnerResp?.ZGMessage?.results[0]?.Message;
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS05Details);
                        //-----------------------------------------------------
                        if (appSession.callerGoal == process.const.CG_CloseOrderNeedMA) {
                            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_CloseOrderPhoneNumber);
                            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_231615);
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
        else if (appSession.nextStateName == process.const.NS_BillSentMailConfirmation) {
            logger.info("nextStateName == NS_BillSentMailConfirmation true in MS201 ");
            appSession.appSessionObj.requestorNM = process.const.STR_IVA + "-" + appSession.appSessionObj.ANI;
            appSession.appSessionObj.hearDetails = appSession.appSessionObj.hearDetails == undefined || appSession.appSessionObj.hearDetails == "undefined" ? "N" : appSession.appSessionObj.hearDetails;
            if (appSession.preStateName == appSession.baseLine + "_HearDetails") {
                cxiSession.cxiSessionObj.promptType = "prompt"; //CXI
                if (appSession.appSessionObj.closeAddress == process.const.STR_Email) {
                    prompt = process.promptSession.scg_ccc_prmt_2321_main_10_EmailBillProgress;
                }
                else {
                    prompt = process.promptSession.scg_ccc_prmt_2321_main_09_BillProgress;
                }
                date = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                promptOut = process.promptSession.scg_ccc_prmt_2321_main_07_BillStopDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' + process.promptSession.scg_ccc_prmt_2321_main_08_Beware + prompt;
                // fix 62
                confirmationNumber = appSession.appSessionObj.confirmationNumber.split("").join('<break time="0.1s"/>');

                promptOut += '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_2322_main_01_ConfirmNum + confirmationNumber + '<break time="0.3s"/>' + process.promptSession.scg_ccc_prmt_2322_main_02_AgainConfirmNum + confirmationNumber;
                if (appSession.appSessionObj.hearDetails == process.const.STR_N) {
                    promptOut += '<break time="0.2s"/>' + process.promptSession.scg_ccc_prmt_main_configEmail;
                }

                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextIntent = process.const.MS419;
                appSession.fallBackState = process.const.STR_True;
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
            const processMoveObj = {};
            processMoveObj.contractAccount = appSession.appSessionObj.contractAccount;
            processMoveObj.installation = appSession.appSessionObj.GetMatCodeInstallation;
            processMoveObj.moveOutDate = appSession.appSessionObj.finalCloseDate;
            processMoveObj.appointmentDate = appSession.appSessionObj.GetMatCodeAppStartDate;
            processMoveObj.isSoNeeded = appSession.appSessionObj.GetMatCodeIsSoNeeded == undefined ||
                appSession.appSessionObj.GetMatCodeIsSoNeeded == "undefined" ? false : (appSession.appSessionObj.GetMatCodeIsSoNeeded === 'true');

            if (appSession.appSessionObj.multimodalAddressValidation == process.const.STR_True) {
                //console.log("MultiModal address");
                logger.info("MultiModal address");
                processMoveObj.addressType = "";
                processMoveObj.houseNumber = ""
                processMoveObj.streetPrefix = "";
                processMoveObj.street = appSession.appSessionObj.dqReturnedStreet;
                processMoveObj.streetType = "";
                processMoveObj.streetPostfix = "";
                processMoveObj.poBox = "";
                processMoveObj.supplement = "";
                processMoveObj.zipCode = appSession.appSessionObj.dqReturnedPostcode;
                processMoveObj.city = appSession.appSessionObj.dqReturnedCity;
                processMoveObj.state = appSession.appSessionObj.dqReturnedState;
                processMoveObj.country = appSession.appSessionObj.dqReturnedCountry;
            }
            else if (appSession.appSessionObj.multiModelForeignAddress == process.const.STR_True) {
                //console.log("MultiModal address");
                logger.info("MultiModal ForeignAddress");
                processMoveObj.addressType = "";
                processMoveObj.houseNumber = appSession.appSessionObj.apt_no;
                processMoveObj.streetPrefix = "";
                processMoveObj.street = appSession.appSessionObj.street;
                processMoveObj.streetType = "";
                processMoveObj.streetPostfix = "";
                processMoveObj.poBox = "";
                processMoveObj.supplement = "";
                processMoveObj.zipCode = appSession.appSessionObj.zipcode;
                processMoveObj.city = appSession.appSessionObj.city;
                processMoveObj.state = appSession.appSessionObj.state;
                processMoveObj.country = appSession.appSessionObj.province_region;
            }
            else if (appSession.appSessionObj.ivaAddressValidation == process.const.STR_True) {
                //console.log("Collected Address from IVA");
                logger.info("Collected Address from IVA");
                processMoveObj.addressType = "";
                processMoveObj.houseNumber = ""
                processMoveObj.streetPrefix = "";
                processMoveObj.street = appSession.appSessionObj.dqReturnedStreet;
                processMoveObj.streetType = "";
                processMoveObj.streetPostfix = "";
                processMoveObj.poBox = "";
                processMoveObj.supplement = "";
                processMoveObj.zipCode = appSession.appSessionObj.dqReturnedPostcode;
                processMoveObj.city = appSession.appSessionObj.dqReturnedCity;
                processMoveObj.state = appSession.appSessionObj.dqReturnedState;
                processMoveObj.country = appSession.appSessionObj.dqReturnedCountry;

            }
            else if (appSession.appSessionObj.closeAddress == "mailAddress") {
                //console.log("Mailing address");
                logger.info("Mailing address");
                processMoveObj.addressType = appSession.appSessionObj.zgAddressType;
                processMoveObj.houseNumber = appSession.appSessionObj.zgHouseNumber;
                processMoveObj.streetPrefix = appSession.appSessionObj.zgStreetPrefix;
                processMoveObj.street = appSession.appSessionObj.zgStreet;
                processMoveObj.streetType = appSession.appSessionObj.zgStreetType;
                processMoveObj.streetPostfix = appSession.appSessionObj.zgStreetPostfix;
                processMoveObj.poBox = appSession.appSessionObj.zgPOBox;
                processMoveObj.supplement = appSession.appSessionObj.zgSupplement;
                processMoveObj.zipCode = appSession.appSessionObj.zgZipCode;
                processMoveObj.city = appSession.appSessionObj.zgCity;
                processMoveObj.state = appSession.appSessionObj.zgState;
                processMoveObj.country = appSession.appSessionObj.zgCountry;
            }
            else if (appSession.appSessionObj.closeAddress == "serviceAddress") {
                // console.log("ServiceAddress");
                logger.info("ServiceAddress");
                processMoveObj.isServiceAddress = true;
                processMoveObj.addressType = "US";
                processMoveObj.houseNumber = appSession.appSessionObj.zgServiceHouseNumber;
                processMoveObj.streetPrefix = appSession.appSessionObj.zgServiceStreetPrefix;
                processMoveObj.street = appSession.appSessionObj.zgServiceStreet;
                processMoveObj.streetType = appSession.appSessionObj.zgServiceStreetType;
                processMoveObj.streetPostfix = appSession.appSessionObj.zgServiceStreetPostfix;
                processMoveObj.poBox = ""; // we dont have poBox field for ServiceAddress
                processMoveObj.supplement = appSession.appSessionObj.zgServiceSupplement;
                processMoveObj.zipCode = appSession.appSessionObj.zGServiceZipCode;
                processMoveObj.city = appSession.appSessionObj.zgServiceCity;
                processMoveObj.state = appSession.appSessionObj.zgServiceState;
                processMoveObj.country = "US";
            }
            else {
                //console.log("Else default address");
                logger.info("Else default address");
                processMoveObj.addressType = "US";
                processMoveObj.houseNumber = "";
                processMoveObj.streetPrefix = "";
                processMoveObj.street = "";
                processMoveObj.streetType = "";
                processMoveObj.streetPostfix = "";
                processMoveObj.poBox = "";
                processMoveObj.supplement = "";
                processMoveObj.zipCode = "";
                processMoveObj.city = "";
                processMoveObj.state = "";
                processMoveObj.country = "";
            }


            let MS_WS01_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_005_Process, processMoveObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ReqObj);
            let MS_WS01_ResObj = await apiHelper.getResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ResObj);
            cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "api lookup"; //cxi
            WS01Details.apiId = process.const.I_DG_02_005_Process; //cxi
            WS01Details.apiname = process.const.I_DG_02_005_ProcessName; //cxi
            if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || (MS_WS01_ResObj.status != 201 && MS_WS01_ResObj.status != "201")) {
                //---------CXI--------------------------------------------//
                WS01Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.status;
                WS01Details.apiStateResult = "Failure";
                WS01Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //------------------------------------------------------------//
                //logger.info(`"closeOrderCreateOperation4 webservice failure", ${JSON.stringify(MS_WS01_ResObj.statusCode)}`);
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderOperation4WebServiceFailureStopServiceComplete);
                appSession.appSessionObj.dbFail = process.const.STR_True;

                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                let processMoveResponse = MS_WS01_ResObj.data;
                logger.debug(processMoveResponse);
                appSession.appSessionObj.processMoveReturnType = MS_WS01_ResObj?.data?.ZGMessage?.results[0]?.Type;
                appSession.appSessionObj.processMoveReturnMessage = MS_WS01_ResObj?.data?.ZGMessage?.results[0]?.Message;
                logger.info("processMoveReturnType" + appSession.appSessionObj.processMoveReturnType);

                if (!appSession.appSessionObj.processMoveReturnType || appSession.appSessionObj.processMoveReturnType == "E") {
                    //---------CXI--------------------------------------------//
                    WS01Details.statusCode = MS_WS01_ResObj.status;
                    WS01Details.apiStateResult = "Failure";
                    WS01Details.errorMessage = appSession.appSessionObj.processMoveReturnMessage;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                    //------------------------------------------------------------//
                    //logger.info(`"closeOrderCreateOperation4 webservice failure Invalid message Id", ${closeOrderCreateOperationRes["s400_message_id"]}`);
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderOperation4WebServiceFailureStopServiceComplete);
                    appSession.appSessionObj.dbFail = process.const.STR_True;

                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );

                }
                //---------CXI--------------------------------------------//
                WS01Details.statusCode = MS_WS01_ResObj.status;
                WS01Details.apiStateResult = "Success";
                WS01Details.errorMessage = appSession.appSessionObj.processMoveReturnMessage;
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //------------------------------------------------------------//
                appSession.appSessionObj.confirmationNumber = MS_WS01_ResObj?.data?.Contract;
                appSession.callerGoal = process.const.CG_CloseOrderIssuedBillSentMail;
                appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                appSession.appSessionObj.stopServiceConfirmation = appSession.appSessionObj.stopServiceConfirmation == "undefined" || appSession.appSessionObj.stopServiceConfirmation == undefined ? "true" : "false";
                //callPath.SelfServiceDescription(process.const.CloseOrderCreateOperation4Success, appSession);
                appSession.nextIntent = process.const.MS210;
                appSession.nextStateName = process.const.NS_SentMailConfirmation;
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
        else if (appSession.nextStateName == process.const.NS_StopServiceChangeAddressSpanish) {
            // console.log("nextStateName == NS_StopServiceChangeAddressSpanish true in Yes.js ");
            logger.info("nextStateName == NS_StopServiceChangeAddressSpanish true in Yes.js ");
            appSession.appSessionObj.requestorNM = process.const.STR_IVA + "-" + appSession.appSessionObj.ANI;
            if (appSession.appSessionObj.closeDate == appSession.appSessionObj.selectedOcsDt) {
                //appSession.appSessionObj.closeDate = null;
                closeDate = " ";
            }

            const processMoveObj = {};
            processMoveObj.contractAccount = appSession.appSessionObj.contractAccount;
            processMoveObj.installation = appSession.appSessionObj.GetMatCodeInstallation;
            processMoveObj.moveOutDate = appSession.appSessionObj.finalCloseDate;
            processMoveObj.appointmentDate = appSession.appSessionObj.GetMatCodeAppStartDate;
            processMoveObj.isSoNeeded = appSession.appSessionObj.GetMatCodeIsSoNeeded == undefined ||
                appSession.appSessionObj.GetMatCodeIsSoNeeded == "undefined" ? false : (appSession.appSessionObj.GetMatCodeIsSoNeeded === 'true');
            //12-17 Address should pass empty when its failed from MM or IVA
            processMoveObj.isServiceAddress = false;
            processMoveObj.addressType = "";
            processMoveObj.houseNumber = "";
            processMoveObj.streetPrefix = "";
            processMoveObj.street = "";
            processMoveObj.streetType = "";
            processMoveObj.streetPostfix = "";
            processMoveObj.poBox = "";
            processMoveObj.supplement = "";
            processMoveObj.zipCode = "";
            processMoveObj.city = "";
            processMoveObj.state = "";
            processMoveObj.country = "";



            let MS_WS01_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_005_Process, processMoveObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ReqObj);
            let MS_WS01_ResObj = await apiHelper.getResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS01_ResObj);
            cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "api lookup"; //cxi
            WS01Details.apiId = process.const.I_DG_02_005_Process; //cxi
            WS01Details.apiname = process.const.I_DG_02_005_ProcessName; //cxi
            if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || MS_WS01_ResObj.status != 201) {
                //---------CXI--------------------------------------------//
                WS01Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.status;
                WS01Details.apiStateResult = "Failure";
                WS01Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //------------------------------------------------------------//
                //logger.info(`"closeOrderCreateOperation4 webservice failure", ${JSON.stringify(MS_WS01_ResObj.statusCode)}`);
                cxiSession.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_CloseOrderOperation4WebServiceFailure);
                appSession.appSessionObj.dbFail = process.const.STR_True;

                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
            else {
                let processMoveResponse = MS_WS01_ResObj.data;
                logger.debug(processMoveResponse);
                date = getDateFormat.getDateName(appSession.appSessionObj.closeDate, intentRequest);
                appSession.appSessionObj.processMoveReturnType = processMoveResponse?.ZGMessage?.results[0]?.Type;
                //appSession.appSessionObj.processMoveReturnType = "S";//HC
                if (!appSession.appSessionObj.processMoveReturnType || appSession.appSessionObj.processMoveReturnType == "E") {
                    //---------CXI--------------------------------------------//
                    WS01Details.statusCode = MS_WS01_ResObj.status;
                    WS01Details.apiStateResult = "Failure";
                    WS01Details.errorMessage = processMoveResponse?.ZGMessage?.results[0]?.Message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                    //------------------------------------------------------------//
                    //logger.info(`"closeOrderCreateOperation4 webservice failure Invalid message Id ", ${closeOrderCreateOperationRes["s400_message_id"]}`);
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, process.const.ER_CloseOrderOperation4WebServiceFailure);
                    appSession.appSessionObj.dbFail = process.const.STR_True;

                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );
                }
                //---------CXI--------------------------------------------//
                WS01Details.statusCode = MS_WS01_ResObj.status;
                WS01Details.apiStateResult = "Success";
                WS01Details.errorMessage = processMoveResponse?.ZGMessage?.results?.[0]?.ZGMessage?.results?.[0]?.Message;
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //------------------------------------------------------------//
                appSession.appSessionObj.confirmationNumber = processMoveResponse.ServiceOrderNumber;
                appSession.callerGoal = process.const.CG_CloseOrderIssued;
                promptOut = process.promptSession.scg_ccc_prmt_2324_main_05_CloseDt + date[1] + '<break time="0.1s"/>' + '<say-as interpret-as="date" format="md">' + date[0] + '</say-as>' + process.promptSession.scg_ccc_prmt_2324_main_06_Beware;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.appSessionObj.softCloseProvided = process.const.STR_Y;
                appSession.appSessionObj.safeAccessPhraseOffered = process.const.STR_Y;
                appSession.bargeIn = process.const.STR_False;
                cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderNeedMA);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232410);
                appSession.transfer = process.const.STR_True;
                appSession.fallBackState = process.const.STR_True;
                callPath.SelfServiceDescription(process.const.CloseOrderScheduledNeedMA, appSession);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }
        }
        else if (appSession.nextStateName == process.const.NS_SmartPhoneConfirmation) {
            cxiSession.cxiSessionObj.promptType = "prompt";
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
        else if (appSession.nextStateName == process.const.NS_WebLinkConfirmation || appSession.nextStateName == process.const.NS_CollectPhoneNumberConfirmation || appSession.nextStateName == process.const.NS_FullAddressBargeIn) {
            if (appSession.nextStateName == process.const.NS_FullAddressBargeIn) {
                cxiSession.cxiSessionObj.promptType = "menu"; //cxi
                let activeContexts = [];
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
            if (appSession.appSessionObj.multiModelMainService == process.const.STR_False) {
                cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
                if (appSession.appSessionObj.multiModelStatus == "Success") {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelSuccess);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232725);
                    if (appSession.appSessionObj.country == "United States" && (!appSession.appSessionObj.state || appSession.appSessionObj.state == "undefined")) {
                        appSession.nextIntent = process.const.MS201;
                        appSession.nextStateName = process.const.NS_FullAddressBargeIn;
                        appSession.fallBackState = process.const.STR_True;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelFailure);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232720);
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
                    if (appSession.appSessionObj.country != "United States" && (!appSession.appSessionObj.province_region || appSession.appSessionObj.province_region == "undefined")) {
                        appSession.nextIntent = process.const.MS201;
                        appSession.nextStateName = process.const.NS_FullAddressBargeIn;
                        appSession.fallBackState = process.const.STR_True;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelFailure);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232720);
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
                    if (!appSession.appSessionObj.street || appSession.appSessionObj.street == "undefined" || !appSession.appSessionObj.city || appSession.appSessionObj.city == "undefined" ||
                        !appSession.appSessionObj.zipcode || appSession.appSessionObj.zipcode == "undefined") {
                        appSession.nextIntent = process.const.MS201;
                        appSession.nextStateName = process.const.NS_FullAddressBargeIn;
                        appSession.fallBackState = process.const.STR_True;
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelFailure);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232720);
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
                    let fullAddress = '';
                    if (appSession.appSessionObj.street) {
                        if (appSession.appSessionObj.street != "undefined") {
                            fullAddress += appSession.appSessionObj.street;

                        }
                    }
                    if (appSession.appSessionObj.apt_no) {
                        if (appSession.appSessionObj.apt_no != "undefined") {
                            fullAddress += " " + appSession.appSessionObj.apt_no;
                        }
                    }
                    if (appSession.appSessionObj.city) {
                        if (appSession.appSessionObj.city != "undefined") {
                            fullAddress += " " + appSession.appSessionObj.city;
                        }
                    }
                    if (appSession.appSessionObj.state && appSession.appSessionObj.country == "United States") {
                        if (appSession.appSessionObj.state != "undefined") {
                            fullAddress += " " + appSession.appSessionObj.state;
                        }
                    }
                    if (appSession.appSessionObj.province_region && appSession.appSessionObj.country != "United States") {
                        if (appSession.appSessionObj.province_region != "undefined") {
                            fullAddress += " " + appSession.appSessionObj.province_region;
                        }
                    }

                    /*
                    if (appSession.appSessionObj.province_region) {
                        if (appSession.appSessionObj.province_region != "undefined") {
                            fullAddress += " " + appSession.appSessionObj.province_region;
                        }
                    }
                    */
                    if (appSession.appSessionObj.zipcode) {
                        if (appSession.appSessionObj.zipcode != "undefined") {
                            fullAddress += " " + appSession.appSessionObj.zipcode;
                        }
                    }
                    fullAddress = fullAddress.trim();
                    logger.info(`"MultiModelFullAddress",${fullAddress}`);
                    appSession.appSessionObj.fullAddressMultiModel = fullAddress;
                    appSession.nextIntent = process.const.MS210;
                    appSession.nextStateName = process.const.NS_SMSMultiModelConfirmation;
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
                else if (appSession.appSessionObj.multiModelStatus == "RetrieveApiFailure") {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelFailure);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232720);
                    appSession.nextIntent = process.const.MS201;
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
                else if (appSession.appSessionObj.multiModelStatus == "MaxRetry") {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelMaxRetry);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232715);
                    appSession.nextIntent = process.const.MS201;
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
                // else if(appSession.appSessionObj.multiModelStatus == "CreateApiFailure"){
                else {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_MultiModelCreateApiFailure);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232710);
                    appSession.nextIntent = process.const.MS201;
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


            }

            if (appSession.appSessionObj.sendSMS == process.const.STR_True) {
                appSession.appSessionObj.sendSMS = process.const.STR_False;
                const sendSmsObj = [{
                    phoneNumber: appSession.nextStateName == process.const.NS_CollectPhoneNumberConfirmation ? "+1" + appSession.appSessionObj.stopServiceDifferentPhoneNumber : "+1" + appSession.appSessionObj.ANI,
                    templateId: process.const.WS_SCG_CustomerContactServiceSMSStopService_templateId, //043
                    needTracking: process.const.WS_SCG_CustomerContactServiceSMS_needTracking,
                    billAccountNumber: appSession.appSessionObj.contractAccount == undefined ? "" : appSession.appSessionObj.contractAccount
                },
                { propertyKey: process.const.WS_StopServiceMultiModelPropertyKey1, propertyValue: process.env.WS_StopServiceMultiModel + appSession.conversationID }, //https://d2psw62ip9mlsb.cloudfront.net/services/stop/${appSession.conversationID}
                { propertyKey: process.const.WS_StopServiceMultiModelPropertyKey2, propertyValue: process.const.WS_ChannelType },
                ];
                let MS_WS01_ReqObj = await apiHelper.getSOAPRequestObject("MS_WS07", sendSmsObj, intentRequest, intentName, callback);
                //logger.debug(MS_WS01_ReqObj);
                let MS_WS01_ResObj = await apiHelper.getSOAPResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);
                //logger.debug(MS_WS01_ResObj);
                cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
                cxiSession.cxiSessionObj.promptType = "api lookup"; //cxi
                WS07Details.apiId = "MS_WS07"; //cxi
                WS07Details.apiname = "sendOnDemandText"; //cxi

                if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || MS_WS01_ResObj.statusCode != 200) {
                    //---------CXI--------------------------------------------//
                    WS07Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.statusCode; //cxi
                    WS07Details.apiStateResult = "Failure";
                    WS07Details.errorMessage = "API Failure";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                    //------------------------------------------------------------//
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SendSmsWsFailure);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232705);
                    appSession.nextIntent = process.const.MS201;
                    appSession.nextStateName = process.const.NS_FullAddressBargeIn;
                    appSession.fallBackState = process.const.STR_True;
                    promptOut = process.promptSession.scg_ccc_prmt_2326_main_21_ProcessIssue;
                    appSession.bargeIn = process.const.STR_False;
                    //   appSession.appSessionObj.dbFail = process.const.STR_True;
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
                else {
                    let sendSMSInfoRes = (MS_WS01_ResObj.body);
                    //logger.debug(sendSMSInfoRes);
                    sendSMSInfoRes = sendSMSInfoRes["Envelope"]["Body"]["getCustomerContactTextResponse"]["CustomerContactTextResponseMessage"]["MessagePayload"];
                    cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
                    if (sendSMSInfoRes["Event"]["result"] != "SUCCESS") {
                        //---------CXI--------------------------------------------//
                        WS07Details.statusCode = MS_WS01_ResObj.status;
                        WS07Details.apiStateResult = "Failure";
                        WS07Details.errorMessage = sendSMSInfoRes["Event"]["Error"]["reason"];
                        cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                        //------------------------------------------------------------//
                        cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SendSmsWsFailure);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232705);
                        appSession.nextIntent = process.const.MS201;
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
                    //---------CXI--------------------------------------------//
                    WS07Details.statusCode = MS_WS01_ResObj.statusCode;
                    WS07Details.apiStateResult = "Success";
                    WS07Details.errorMessage = " ";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                    //------------------------------------------------------------//
                    logger.info(`"converting xml to json", ${JSON.stringify(sendSMSInfoRes, null, 2)}`);
                    logger.info("SendSMSWS_Success");
                    appSession.nextIntent = process.const.MS201;
                    appSession.fallBackState = process.const.STR_True;
                    appSession.appSessionObj.multiModelMainService = process.const.STR_Stop;
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
            cxiSession.cxiSessionObj.promptType = "prompt"; //cxi
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_ConfirmSMS);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232615);
            let phoneNumber = appSession.nextStateName == process.const.NS_CollectPhoneNumberConfirmation ? appSession.appSessionObj.stopServiceDifferentPhoneNumber : appSession.appSessionObj.ANI;
            promptOut = process.promptSession.scg_ccc_prmt_2326_main_19_WebLinkPhNum + '<say-as interpret-as="telephone">' + phoneNumber + '</say-as>';
            promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
            appSession.appSessionObj.sendSMS = process.const.STR_True;
            appSession.nextIntent = process.const.MS201;
            appSession.bargeIn = process.const.STR_False;
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
        else if (appSession.nextStateName == process.const.NS_SmartPhoneWebLinkConfimation) {
            cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_SmsSmartPhoneNumber);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232620);
            appSession.nextIntent = process.const.MS404;
            let PhoneNumberSlot = process.const.STR_PhoneNumber;
            activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_PhoneNumber);
            appSession.appSessionObj[PhoneNumberSlot + "Retry"] = process.const.STR_True;

            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232603);
            promptOut = process.promptSession.scg_ccc_collect_2326_main_12_PhNum;
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
            logger.info("nextStateName == NS_FullAddressConfirmation true");

            appSession.appSessionObj.fullAddressState = appSession.appSessionObj.fullAddressState.trim();
            appSession.appSessionObj.fullAddressState = appSession.appSessionObj.fullAddressState.split(" ").join("");
            appSession.appSessionObj.fullAddressState = appSession.appSessionObj.fullAddressState.toLowerCase();

            switch (appSession.appSessionObj.fullAddressState) {
                case "alabama":
                    stateCode = "AL";
                    break;

                case "alaska":
                    stateCode = "AK";
                    break;

                case "arizona":
                    stateCode = "AZ";
                    break;

                case "arkansas":
                    stateCode = "AR";
                    break;

                case "california":
                    stateCode = "CA";
                    break;

                case "colorado":
                    stateCode = "CO";
                    break;

                case "connecticut":
                    stateCode = "CT";
                    break;

                case "delaware":
                    stateCode = "DE";
                    break;

                case "districtofcolumbia":
                    stateCode = "DC";
                    break;

                case "florida":
                    stateCode = "FL";
                    break;

                case "georgia":
                    stateCode = "GA";
                    break;

                case "hawaii":
                    stateCode = "HI";
                    break;

                case "idaho":
                    stateCode = "ID";
                    break;

                case "illinois":
                    stateCode = "IL";
                    break;

                case "indiana":
                    stateCode = "IN";
                    break;

                case "iowa":
                    stateCode = "IA";
                    break;

                case "kansas":
                    stateCode = "KS";
                    break;

                case "kentucky":
                    stateCode = "KY";
                    break;

                case "louisiana":
                    stateCode = "LA";
                    break;

                case "maine":
                    stateCode = "ME";
                    break;

                case "maryland":
                    stateCode = "MD";
                    break;

                case "massachusetts":
                    stateCode = "MA";
                    break;

                case "michigan":
                    stateCode = "MI";
                    break;

                case "minnesota":
                    stateCode = "MN";
                    break;

                case "mississippi":
                    stateCode = "MS";
                    break;

                case "missouri":
                    stateCode = "MO";
                    break;

                case "montana":
                    stateCode = "MT";
                    break;

                case "nebraska":
                    stateCode = "NE";
                    break;

                case "nevada":
                    stateCode = "NV";
                    break;

                case "newhampshire":
                    stateCode = "NH";
                    break;

                case "newjersey	":
                    stateCode = "NJ";
                    break;

                case "newmexico":
                    stateCode = "NM";
                    break;

                case "newyork":
                    stateCode = "NY";
                    break;

                case "northcarolina":
                    stateCode = "NC";
                    break;

                case "northdakota":
                    stateCode = "ND";
                    break;

                case "ohio":
                    stateCode = "OH";
                    break;

                case "oklahoma":
                    stateCode = "OK";
                    break;

                case "oregon":
                    stateCode = "OR";
                    break;

                case "pennsylvania":
                    stateCode = "PA";
                    break;

                case "rhodeisland":
                    stateCode = "RI";
                    break;

                case "southcarolina":
                    stateCode = "SC";
                    break;

                case "southdakota":
                    stateCode = "SD";
                    break;

                case "tennessee":
                    stateCode = "TN";
                    break;

                case "texas":
                    stateCode = "TX";
                    break;

                case "utah":
                    stateCode = "UT";
                    break;

                case "vermont":
                    stateCode = "VT";
                    break;

                case "virginia":
                    stateCode = "VA";
                    break;

                case "washington":
                    stateCode = "WA";
                    break;

                case "westvirginia":
                    stateCode = "WV";
                    break;

                case "wisconsin":
                    stateCode = "WI";
                    break;

                case "wyoming":
                    stateCode = "WY";
                    break;

                default:
                    stateCode = "CA";
                    break;

            }
            //-----------------------------------------------------
            const dqAddressReqObj = {};
            dqAddressReqObj.mixed = appSession.appSessionObj.streetNumberCollected + " " + appSession.appSessionObj.fullAddressStreetName;
            dqAddressReqObj.locality = appSession.appSessionObj.fullAddressCity;
            dqAddressReqObj.region = stateCode;
            dqAddressReqObj.postcode = appSession.appSessionObj.zipCodeCollected;



            let SAP_DQM_ReqObj = await apiHelper.getRequestObject(process.const.SAP_DQM, dqAddressReqObj, intentRequest, intentName, callback);
            //logger.debug(SAP_DQM_ReqObj);
            let SAP_DQM_ResObj = await apiHelper.getResponseObject(SAP_DQM_ReqObj, intentRequest, intentName, callback);
            //logger.debug(SAP_DQM_ResObj);
            cxiSession.cxiSessionObj.apiFlag = "Y"; //cxi
            cxiSession.cxiSessionObj.promptType = "api Look Up"; //cxi
            WS01Details.apiId = process.const.SAP_DQM; //cxi
            WS01Details.apiname = process.const.SAP_DQM_Name; //cxi
            if (SAP_DQM_ResObj == null || SAP_DQM_ResObj == undefined || (SAP_DQM_ResObj.status != 200 && SAP_DQM_ResObj.status != "200")) {
                logger.info("SAP_DQM_ResObj.statusCode is not 200");
                //---------CXI--------------------------------------------//
                WS01Details.statusCode = SAP_DQM_ResObj == null || SAP_DQM_ResObj == undefined ? "500" : SAP_DQM_ResObj.status;
                WS01Details.apiStateResult = "Failure";
                WS01Details.errorMessage = "API Failure";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                //------------------------------------------------------------//
                appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderOperation3);
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderOperation3);
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232565);
                appSession.appSessionObj.closeOrderOperation3Failure = process.const.STR_True;
               // appSession.nextIntent = process.const.MS210;
                // appSession.appSessionObj.dbFail = process.const.STR_True;
                appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
                return require("../Common/MS210_BargeInNotAllowed").BargeInNotAllowed(intentRequest, callback);
                // callback(
                //     util.DialogAction(
                //         process.const.DA_Delegate,
                //         intentRequest,
                //         appSession.nextIntent,
                //         util.BuildSSMLMessage(""),
                //         process.const.STR_Fulfilled,
                //         activeContexts,
                //         process.const.STR_Default,
                //         intentRequest.sessionState.intent.slots,
                //     )
                // );
                // return;
            }
            else {
                logger.info("SAP_DQM_ResObj.statusCode is 200");
                let dqAddressRes = SAP_DQM_ResObj.data;
                appSession.appSessionObj.dqReturnType = dqAddressRes.addr_asmt_info;
                //console.log("dqAddressRes.addr_asmt_info : ", dqAddressRes.addr_asmt_info);

                //logger.info("dqAddressRes.addr_asmt_info :"+ dqAddressRes.addr_asmt_info);

                if (appSession.appSessionObj.dqReturnType != "C" && appSession.appSessionObj.dqReturnType != "V") {
                    logger.info("dqAddressRes.addr_asmt_info is not C and V ");
                    //---------CXI--------------------------------------------//
                    WS01Details.statusCode = SAP_DQM_ResObj.status;
                    WS01Details.apiStateResult = "Failure";
                    WS01Details.errorMessage = process.const.SAP_DQM_Message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                    //------------------------------------------------------------//
                    //logger.info(`"CloseOrderCreateOperation3 webservice failure Invalid message Id",${closeOrderCreateOperationRes["Envelope"]["Body"]["RESPONSE"]["s400_cls_mf_send_data"]["s400_message_id"]}`);
                    appSession.callerGoal = process.const.CG_CloseOrderNeedMA;
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CloseOrderOperation3);
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderOperation3);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232565);
                    appSession.appSessionObj.closeOrderOperation3Failure = process.const.STR_True;
                    //appSession.nextIntent = process.const.MS210;
                    appSession.nextStateName = process.const.NS_StopServiceChangeAddressSpanish;
                    return require("../Common/MS210_BargeInNotAllowed").BargeInNotAllowed(intentRequest, callback);
                    // callback(
                    //     util.DialogAction(
                    //         process.const.DA_Delegate,
                    //         intentRequest,
                    //         appSession.nextIntent,
                    //         util.BuildSSMLMessage(""),
                    //         process.const.STR_Fulfilled,
                    //         activeContexts,
                    //         process.const.STR_Default,
                    //         intentRequest.sessionState.intent.slots,
                    //     )
                    // );
                    // return;


                }
                logger.info("dqAddressRes.addr_asmt_info is  C or V ");
                //---------CXI--------------------------------------------//
                WS01Details.statusCode = SAP_DQM_ResObj.status;
                WS01Details.apiStateResult = "Success";
                WS01Details.errorMessage = "";
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS01Details);
                cxiSession.cxiSessionObj.promptType = "prompt";
                //------------------------------------------------------------//
                cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_FullAddressConfirmationYes);

                appSession.appSessionObj.dqReturnedCity = dqAddressRes.std_addr_locality_full;
                appSession.appSessionObj.dqReturnedPostcode = dqAddressRes.std_addr_postcode_full;
                appSession.appSessionObj.dqReturnedState = dqAddressRes.std_addr_region_full;
                appSession.appSessionObj.dqReturnedStreet = dqAddressRes.std_addr_address_delivery;
                appSession.appSessionObj.dqReturnedCountry = dqAddressRes.std_addr_country_2char;

                appSession.appSessionObj.ivaAddressValidation = process.const.STR_True;
                //appSession.nextIntent = process.const.MS210;
                appSession.nextStateName = process.const.NS_BillSentMailConfirmation;
                return require("../Common/MS210_BargeInNotAllowed").BargeInNotAllowed(intentRequest, callback);
                // callback(
                //     util.DialogAction(
                //         process.const.DA_Delegate,
                //         intentRequest,
                //         appSession.nextIntent,
                //         util.BuildSSMLMessage(""),
                //         process.const.STR_Fulfilled,
                //         activeContexts,
                //         process.const.STR_Default,
                //         intentRequest.sessionState.intent.slots,
                //     )
                // );
                // return;
            }

        }

        else if (appSession.nextStateName == process.const.NS_StopServiceExistingCloseCancel) {
            logger.info("Entered to MS201 Cancel MI MO");
            appSession.appSessionObj.confEmail = process.const.STR_Y;

            const viewCancelObj = {
                // "action": "3",
                "contractAccount": appSession.appSessionObj.contractAccount,
                "contract": appSession.appSessionObj.GetServiceContract,
                "type": appSession.appSessionObj.GetServiceOrderType,
            };
            let MS_WS02_ReqObj = await apiHelper.getRequestObject(process.const.I_DG_02_006_Cancel, viewCancelObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS02_ReqObj);
            let MS_WS02_ResObj = await apiHelper.getResponseObject(MS_WS02_ReqObj, intentRequest, intentName, callback);
            //logger.debug(MS_WS02_ResObj);

            if (MS_WS02_ResObj == null || MS_WS02_ResObj == undefined || (MS_WS02_ResObj.status != 201 && MS_WS02_ResObj.status != "201")) {
                //-------------CXI_apidetails-----------------------------------//
                let WS02Details = {};
                WS02Details.apiId = process.const.I_DG_02_006_Cancel;
                WS02Details.apiname = process.const.I_DG_02_006_Cancel_name;
                WS02Details.statusCode = MS_WS02_ResObj == null || MS_WS02_ResObj == undefined ? "500" : MS_WS02_ResObj.status;
                WS02Details.apiStateResult = process.const.STR_Failure;
                WS02Details.errorMessage = process.const.STR_APIFail;

                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
                appSession.appSessionObj.dbFail = process.const.STR_true;
                //-------------CXI_apidetails-----------------------------------//

                cxiSession.exitReason = callPath.ExitReason(
                    cxiSession.exitReason,
                    process.const.ER_CancelExistingCloseOrder
                );

                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );
            }

            else {
                let viewCancelRes = MS_WS02_ResObj.data;
                // logger.debug(viewCancelRes);

                appSession.appSessionObj.cancelMoveReturnType = viewCancelRes?.ZGMessage?.results?.[0]?.Type;
                appSession.appSessionObj.cancelMoveTypeMessage = viewCancelRes?.ZGMessage?.results?.[0]?.Message;

                if (!appSession.appSessionObj.cancelMoveReturnType || appSession.appSessionObj.cancelMoveReturnType == "E") {
                    logger.info("cancelMoveReturnType==E true");
                    //------------PUT CXI Keys----------------------------//
                    let WS02Details = {};
                    WS02Details.apiId = process.const.I_DG_02_006_Cancel;
                    WS02Details.apiname = process.const.I_DG_02_006_Cancel_name;
                    WS02Details.statusCode = MS_WS02_ResObj.status;
                    WS02Details.apiStateResult = process.const.STR_Failure;
                    WS02Details.errorMessage = appSession.appSessionObj.cancelMoveTypeMessage;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                    cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
                    appSession.appSessionObj.dbFail = process.const.STR_true;
                    //-----------------------------------------------------//

                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CancelExistingCloseOrder);
                    return agentHelper.AgentTransfer(
                        intentRequest,
                        intentName,
                        promptOut,
                        callback
                    );

                }

                //-------------------CXI_apidetails----------------------------------//
                let WS02Details = {};
                WS02Details.apiId = process.const.I_DG_02_006_Cancel;
                WS02Details.apiname = process.const.I_DG_02_006_Cancel_name;
                WS02Details.statusCode = MS_WS02_ResObj.status;
                WS02Details.apiStateResult = process.const.STR_Success;
                WS02Details.errorMessage = appSession.appSessionObj.cancelMoveTypeMessage;
                cxiSession.cxiSessionObj.cxiAPIDetails.push(WS02Details);
                cxiSession.cxiSessionObj.apiFlag = process.const.STR_Y;
                //-----------------------------------------------------------------//
                appSession.appSessionObj.cancelMoveisEligibleFlag = viewCancelRes?.ZGCancelMIMOItm?.results?.[0]?.IsEligibleFlag;
                appSession.appSessionObj.cancelMoveContract = viewCancelRes?.ZGCancelMIMOItm?.results?.[0]?.Contract;
                appSession.appSessionObj.cancelMoveType = viewCancelRes?.ZGCancelMIMOItm?.results?.[0]?.Type;
                appSession.appSessionObj.cancelMoveConfNumber = viewCancelRes?.ConfNumber || "";

                if (appSession.appSessionObj.cancelMoveisEligibleFlag == true) {
                    logger.info("MoveisEligibleFlag == true true");
                    appSession.appSessionObj.stopCancelDate = appSession.appSessionObj.stopDate;
                    //Confirmation Number prompt
                    confirmationNumber = appSession.appSessionObj.cancelMoveConfNumber
                        ? appSession.appSessionObj.cancelMoveConfNumber.split("").join('<break time="0.1s"/>')
                        : "";
                    promptOut = process.promptSession.scg_ccc_prmt_2329_main_06_StopServCancelNum + confirmationNumber + process.promptSession.scg_ccc_prmt_2329_main_07_StopServCancelConfirmNum + confirmationNumber;
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_CloseOrderCancelledSuccess);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232915);
                    callPath.SelfServiceDescription(process.const.CloseOrderCancelledSuccess, appSession);
                    appSession.nextIntent = process.const.MS200;
                    appSession.nextStateName = process.const.NS_StopServiceExistingCloseAnythingElse;

                    if (appSession.appSessionObj.confEmail == process.const.STR_Y) {
                        promptOut += process.promptSession.scg_ccc_prmt_main_configEmail;
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
                logger.info("MoveisEligibleFlag == true false");
                cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_CancelExistingCloseOrder);
                return agentHelper.AgentTransfer(
                    intentRequest,
                    intentName,
                    promptOut,
                    callback
                );

            }

        }

        else if (appSession.nextStateName == process.const.NS_Move_DifferentPhoneNumberConfirmation) {


            //  cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_DifferentPhoneNumber);
            appSession.nextIntent = process.const.MS402;
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
        else if (appSession.nextStateName == process.const.NS_DiffNumberMenu || appSession.nextStateName == process.const.NS_StartService_DifferentPhoneNumberConfirmation) {
            // appSession.selfService = "Y";

            logger.info("start service DD && MM offerring place in MS201");
            if (appSession.appSessionObj.multiModelMainService == process.const.STR_False) {
                if (appSession.appSessionObj.multiModelStatus == "Success") {
                    promptOut = process.promptSession.scg_ccc_prmt_2103_main_02_AddVer;
                    callPath.SelfServiceDescription(process.const.NewServiceAddressRecieved, appSession);
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_NewServiceAddressRecieved);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210225);
                    //appSession.appSessionObj.apt_no = appSession.appSessionObj.apt_no == "undefined" ? " " : appSession.appSessionObj.apt_no;
                    appSession.appSessionObj.apt_no = appSession.appSessionObj.apt_no == "undefined" || appSession.appSessionObj.apt_no == undefined ||
                        appSession.appSessionObj.apt_no == null || appSession.appSessionObj.apt_no == "null" ? " " : appSession.appSessionObj.apt_no;
                    let multimodeladdress = "Start Service New Address";
                    const hasApt = appSession.appSessionObj.apt_no && appSession.appSessionObj.apt_no.trim() !== "";
                    if (!hasApt) {
                        logger.info(" address does not have apt number in MS201");
                        multimodeladdress = multimodeladdress + " : " + appSession.appSessionObj.street + ", " + appSession.appSessionObj.city + ", " + appSession.appSessionObj.state + ", " + appSession.appSessionObj.zipcode + ".";
                    } else {
                        logger.info(" address has apt number in MS201");
                        multimodeladdress = multimodeladdress + " : " + appSession.appSessionObj.street + ", Apt. or Unit " + appSession.appSessionObj.apt_no + ", " + appSession.appSessionObj.city + ", " + appSession.appSessionObj.state + ", " + appSession.appSessionObj.zipcode + ".";
                    }
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, multimodeladdress);
                    logger.debug(multimodeladdress);

                }
                else if (appSession.appSessionObj.multiModelStatus == "CreateApiFailure") {
                    promptOut = process.promptSession.scg_ccc_prmt_2103_main_03_TextIssue;
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_AddAddressRecordSubmissionFailed);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210210);
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_failureNewServiceAddress);

                }
                else if (appSession.appSessionObj.multiModelStatus == "RetrieveApiFailure") {
                    promptOut = process.promptSession.scg_ccc_prmt_2103_main_03_TextIssue;
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_retrieveAddressRecordFailed);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210220);
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_failureNewServiceAddress);

                }
                else {
                    cxiSession.callPath = callPath.CallPath(cxiSession.callPath, process.const.CP_exceedMaxWaitTime);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210215);
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_failureNewServiceAddress);
                    promptOut = process.promptSession.scg_ccc_prmt_2103_main_03_TextIssue;

                }
                appSession.nextIntent = process.const.MS300;
                appSession.fallBackState = process.const.STR_True;

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
            if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
                appSession.appSessionObj.phoneNumberToWebLink = appSession.appSessionObj.ANI;


            }
            else {
                appSession.appSessionObj.phoneNumberToWebLink = appSession.appSessionObj.startServiceDifferentPhoneNumber;
            }

            promptOut = process.promptSession.scg_ccc_prmt_2101_main_19_SMSProgress + '<say-as interpret-as="telephone">' + appSession.appSessionObj.phoneNumberToWebLink + '</say-as>';

            if (appSession.appSessionObj.smsType == "addressOnly") {
                if (appSession.appSessionObj.multimoduleProgress == undefined) {

                    if (appSession.nextStateName == process.const.NS_DiffNumberMenu) {
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SentSMSViaSameSmartPhoneNumber);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210155);
                    }
                    appSession.appSessionObj.multimoduleProgress = process.const.STR_True;
                    promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                    appSession.fallBackState = process.const.STR_True;
                    appSession.bargeIn = process.const.STR_False;
                    appSession.nextIntent = process.const.MS201;
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
                const sendSmsObj = [{
                    phoneNumber: appSession.appSessionObj.phoneNumberToWebLink,
                    templateId: process.const.WS_SCG_CustomerContactServiceSMSStopServiceMult_templateId,
                    needTracking: process.const.WS_SCG_CustomerContactServiceSMS_needTracking,
                    billAccountNumber: appSession.appSessionObj.contractAccount == undefined ? "" : appSession.appSessionObj.contractAccount
                },
                { propertyKey: "AWS_URL_TokenId", propertyValue: process.env.WS_StartServiceMultiModel + appSession.conversationID }, //`https://d2psw62ip9mlsb.cloudfront.net/services/start/${appSession.conversationID}`
                { propertyKey: "SOURCE_SYSTEM", propertyValue: "IVR" },
                ];
                let MS_WS01_ReqObj = await apiHelper.getSOAPRequestObject("MS_WS07", sendSmsObj, intentRequest, intentName, callback);
                //logger.debug(MS_WS01_ReqObj);
                let MS_WS01_ResObj = await apiHelper.getSOAPResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);


                //-------------CXI_apidetails-----------------------------------//
                let WS07Details = {};
                WS07Details.apiId = "MS_WS07";
                WS07Details.apiname = "sendOnDemandText";


                //apdetails-------------------------------------//
                if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || MS_WS01_ResObj.statusCode != 200) {
                    appSession.nextIntent = process.const.MS300;
                    appSession.fallBackState = process.const.STR_True;
                    WS07Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.status; //cxi;
                    WS07Details.apiStateResult = "Failure";
                    WS07Details.errorMessage = "API Failure"; //MS_WS07_ReqObj.body.message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                    cxiSession.cxiSessionObj.apiFlag = "Y";
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SocalgascomWebLinkAddressProcessFailed);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210205);
                    cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_failureNewServiceAddress);
                    promptOut = process.promptSession.scg_ccc_prmt_2103_main_03_TextIssue;
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
                else {
                    //logger.info(`"MS_WS07_ResObj ", ${JSON.stringify(MS_WS07_ResObj.body)}`);
                    let sendSMSInfoRes = (MS_WS01_ResObj.body);
                    //logger.debug(sendSMSInfoRes);
                    WS07Details.statusCode = MS_WS01_ResObj.statusCode;
                    WS07Details.apiStateResult = "Success";
                    WS07Details.errorMessage = " "; //MS_WS07_ReqObj.body.message;
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                    cxiSession.cxiSessionObj.apiFlag = "Y";
                    let APIResult = sendSMSInfoRes.Envelope.Body.getCustomerContactTextResponse.CustomerContactTextResponseMessage.MessagePayload.Event.result;
                    if ((APIResult.toUpperCase() != "SUCCESS")) {
                        appSession.nextIntent = process.const.MS300;
                        appSession.fallBackState = process.const.STR_True;
                        cxiSession.exitReason = callPath.ExitReason(cxiSession.exitReason, process.const.ER_failureNewServiceAddress);
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SocalgascomWebLinkAddressProcessFailed);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210205);
                        promptOut = process.promptSession.scg_ccc_prmt_2103_main_03_TextIssue;
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

                    sendSMSInfoRes = sendSMSInfoRes["Envelope"]["Body"]["getCustomerContactTextResponse"]["CustomerContactTextResponseMessage"]["MessagePayload"];
                    logger.info(`"converting xml to json", ${JSON.stringify(sendSMSInfoRes, null, 2)}`);
                    logger.info("SendSMSWS_Success");


                    appSession.nextIntent = "MS201_Yes";
                    appSession.fallBackState = process.const.STR_True;
                    appSession.appSessionObj.multiModelMainService = process.const.STR_Start;
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

            else {
                if (appSession.appSessionObj.smsProgress == undefined) {
                    appSession.appSessionObj.smsProgress = process.const.STR_True;
                    if (appSession.nextStateName != process.const.NS_StartService_DifferentPhoneNumberConfirmation) {
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_SentSMSViaSameSmartPhoneNumber);
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210155);
                    }
                    promptOut = process.promptSession.scg_ccc_prmt_2101_main_19_SMSProgress + '<say-as interpret-as="telephone">' + appSession.appSessionObj.phoneNumberToWebLink + '</say-as>';
                    promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                    appSession.fallBackState = process.const.STR_True;
                    appSession.bargeIn = process.const.STR_False;
                    appSession.nextIntent = process.const.MS201;
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

                const sendSmsObj = [{
                    phoneNumber: appSession.appSessionObj.phoneNumberToWebLink, //appSession.appSessionObj.ANI,
                    templateId: process.const.WS_SCG_CustomerContactServiceStartServiceSMS_templateId,
                    needTracking: process.const.WS_SCG_CustomerContactServiceSMS_needTracking,
                    billAccountNumber: appSession.appSessionObj.contractAccount == undefined ? "" : appSession.appSessionObj.contractAccount
                },
                { propertyKey: process.const.WS_sendSmsAWS_URL_TokenId, propertyValue: process.const.WS_propertyValuestart },
                { propertyKey: process.const.WS_sendSmsSOURCE_SYSTEM, propertyValue: "IVR" },
                ];
                let MS_WS01_ReqObj = await apiHelper.getSOAPRequestObject("MS_WS07", sendSmsObj, intentRequest, intentName, callback);
                //logger.debug(MS_WS01_ReqObj);
                let MS_WS01_ResObj = await apiHelper.getSOAPResponseObject(MS_WS01_ReqObj, intentRequest, intentName, callback);
                // logger.log("MS_WS07_ResObj ", JSON.stringify(MS_WS07_ResObj.body));


                //-------------CXI_apidetails-----------------------------------//
                let WS07Details = {};
                WS07Details.apiId = "MS_WS07";
                WS07Details.apiname = "sendOnDemandText";
                //  WS07Details.requestId = " "; //MS_WS07_ResObj.request.headers["X-PruRequestID"];

                //apdetails-------------------------------------//

                if (MS_WS01_ResObj == null || MS_WS01_ResObj == undefined || MS_WS01_ResObj.statusCode != 200) {
                    WS07Details.statusCode = MS_WS01_ResObj == null || MS_WS01_ResObj == undefined ? "500" : MS_WS01_ResObj.statusCode; //cxi
                    WS07Details.apiStateResult = "Failure";
                    WS07Details.errorMessage = "API Failure ";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                    cxiSession.cxiSessionObj.apiFlag = "Y";
                    //  if (MS_WS07_ResObj == null || MS_WS07_ResObj == undefined || MS_WS07_ResObj.statusCode != "200" || MS_WS07_ResObj.statusCode != 200) {
                    cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, "Process failure – Could not send SMS link to Start Service");
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "Socalgas.com WebLink Process Failed");
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210210);
                    promptOut = process.promptSession.scg_ccc_prmt_2102_main_01_TextIssue;
                    if (appSession.appSessionObj.businessHours == "closed") {

                        appSession.appSessionObj.dbFail = process.const.STR_True;
                        return agentHelper.AgentTransfer(
                            intentRequest,
                            intentName,
                            promptOut,
                            callback
                        );
                    }
                    else {

                        appSession.nextIntent = process.const.MS300;
                        appSession.appSessionObj.startMmSw = process.const.STR_False;
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
                }
                else {
                    let sendSMSInfoRes = (MS_WS01_ResObj.body);
                    //logger.debug(sendSMSInfoRes);
                    let APIResult = sendSMSInfoRes.Envelope.Body.getCustomerContactTextResponse.CustomerContactTextResponseMessage.MessagePayload.Event.result;
                    //---------PUT CXI Keys-------------------------------------------
                    cxiSession.cxiSessionObj.apiFlag = "Y";
                    WS07Details.statusCode = MS_WS01_ResObj.statusCode;
                    WS07Details.apiStateResult = "Success";
                    WS07Details.errorMessage = "";
                    cxiSession.cxiSessionObj.cxiAPIDetails.push(WS07Details);
                    //-----------------------------------------------------    

                    if (APIResult.toLowerCase() != "success") {
                        cxiSession.cxiSessionObj.exitReason = callPath.ExitReason(cxiSession.cxiSessionObj.exitReason, "Process failure – Could not send SMS link to Start Service");
                        cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, "Socalgas.com WebLink Process Failed");
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210210);
                        //appSession.appSessionObj.callPath = "SMS confirmation number Failed";
                        promptOut = process.promptSession.scg_ccc_prmt_2102_main_01_TextIssue;
                        if (appSession.appSessionObj.businessHours == "closed") {
                            return agentHelper.AgentTransfer(
                                intentRequest,
                                intentName,
                                promptOut,
                                callback
                            );
                        }
                        else {

                            appSession.nextIntent = process.const.MS300;
                            appSession.appSessionObj.startMmSw = process.const.STR_False;
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

                    }
                    callPath.SelfServiceDescription(process.const.StartServiceDDWeblinkSent, appSession);
                    cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StartServiceDDWeblinkSent);
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210205);
                    appSession.nextIntent = process.const.MS210;
                    appSession.nextStateName = "StartAnyThingElse";
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

        else if (appSession.nextStateName == process.const.NS_StartServiceProcess) {
            //appSession.callPath = appSession.callPath + "Start Service SMS Type Socalgas.com process";


            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StartServiceSMSTypeSocalgascomprocess);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210105);
            appSession.appSessionObj.smsType = "socalgas.com";
            appSession.nextStateName = process.const.NS_DiffNumberMenu;
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
        else if (appSession.nextStateName == process.const.NS_StartAnyThingElse || appSession.nextStateName == process.const.NS_StopServiceExistingCloseAnythingElse || appSession.nextStateName == process.const.NS_CheckChangeCancelAnythingElse) {
            appSession.nextIntent = process.const.MS108;
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
            cxiSession.cxiSessionObj.callPath = callPath.CallPath(cxiSession.cxiSessionObj.callPath, process.const.CP_StartServiceSMSTypeSocalgascomprocess);
            cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210105);
            appSession.appSessionObj.smsType = "socalgas.com";
            appSession.nextStateName = process.const.NS_DiffNumberMenu;
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


    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};

module.exports = {
    Yes
};

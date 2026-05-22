const logger = require("../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../Helpers/Common/sessionHelper");
const util = require("../../../Helpers/Utilities/getLexResponse");
const ssmlMessage = require("../../../Helpers/Common/ssmlHelper");
const catchHelper = require("../../../Helpers/Common/catchHelper");
const lex_Slots = require("../../../Helpers/Common/slotHelper");
const retryController = require("../../../Helpers/Controller/retryController");
const callPath = require("../../../Helpers/Common/callPathHelper");

const CollectFullAddress = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    logger.info("intentRequest : " + intentRequest["sessionState"]["intent"]["slots"]);
   // console.log("intentRequest : ", intentRequest["sessionState"]["intent"]["slots"]);

    let promptOut = "";
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let StreetNumberSlot = "getStreetNumber";
    let StreetNameSlot = "getStreetName";
    let ApartmentNumberSlot = "getApartmentNumber";
    let CitySlot = "getCity";
    let StateSlot = "getState";
    let ZipCodeSlot = "getZipCode";
    let StreetNumber = lex_Slots.GetSlots(StreetNumberSlot, intentRequest);
    let StreetName = lex_Slots.GetSlots(StreetNameSlot, intentRequest);
    let City = lex_Slots.GetSlots(CitySlot, intentRequest);
    let ApartmentNumber = lex_Slots.GetSlots(ApartmentNumberSlot, intentRequest);
    let State = lex_Slots.GetSlots(StateSlot, intentRequest);
    let ZipCode = lex_Slots.GetSlots(ZipCodeSlot, intentRequest);
    let StreetNumberObj = {};//cxi
    let StreetNameObj = {};//cxi
    let ApartmentNumberObj = {};//cxi
    let CityObj = {};//cxi
    let StateObj = {};//cxi
    let ZipCodeObj = {};//cxi
    let FullAddressObj = {};//cxi
    let activeContexts = [];
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.SN_CollectFullAddress;
        cxiSession.exitPoint = appSession.stateName;
        //-----CXI----------------------------------//
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //-----------------------------------------//
        if (ApartmentNumber != null) {
            ApartmentNumber = JSON.parse(ApartmentNumber);
            ApartmentNumber = ApartmentNumber.value;
        }

        appSession.appSessionObj.fullAddressStartStopMaxAttempts = process.const.STR_True;

        if (appSession.appSessionObj.streetNumberIndividualSlot == "null" || appSession.appSessionObj.streetNumberIndividualSlot == "undefined") {
            delete (appSession.appSessionObj.streetNumberIndividualSlot);

        }
        if (appSession.appSessionObj.streetNameIndividualSlot == "null" || appSession.appSessionObj.streetNameIndividualSlot == "undefined") {
            delete (appSession.appSessionObj.streetNameIndividualSlot);

        }
        if (appSession.appSessionObj.cityIndividualSlot == "null" || appSession.appSessionObj.cityIndividualSlot == "undefined") {
            delete (appSession.appSessionObj.cityIndividualSlot);

        }
        if (appSession.appSessionObj.stateIndividualSlot == "null" || appSession.appSessionObj.stateIndividualSlot == "undefined") {
            delete (appSession.appSessionObj.stateIndividualSlot);

        }
        if (appSession.appSessionObj.zipCodeIndividualSlot == "null" || appSession.appSessionObj.zipCodeIndividualSlot == "undefined") {
            delete (appSession.appSessionObj.zipCodeIndividualSlot);

        }
        StreetNumber = appSession.appSessionObj.streetNumberIndividualSlot != undefined ? appSession.appSessionObj.streetNumberIndividualSlot : StreetNumber;
        StreetName = appSession.appSessionObj.streetNameIndividualSlot != undefined ? appSession.appSessionObj.streetNameIndividualSlot : StreetName;
        City = appSession.appSessionObj.cityIndividualSlot != undefined ? appSession.appSessionObj.cityIndividualSlot : City;
        State = appSession.appSessionObj.stateIndividualSlot != undefined ? appSession.appSessionObj.stateIndividualSlot : State;
        ZipCode = appSession.appSessionObj.zipCodeIndividualSlot != undefined ? appSession.appSessionObj.zipCodeIndividualSlot : ZipCode;
        State = appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer ? "CA" : State;

        appSession.appSessionObj.streetNumberCollected = StreetNumber;
        appSession.appSessionObj.fullAddressStopService = appSession.appSessionObj.apartmentNumberSkip == process.const.STR_True ? ` ${StreetName}, ${City}, ${State}` : ` ${StreetName}, ${ApartmentNumber}, ${City}, ${State}`;
        appSession.appSessionObj.fullAddressStreetName = StreetName;
        appSession.appSessionObj.fullAddressCity = City;
        appSession.appSessionObj.fullAddressState = State;
        appSession.appSessionObj.zipCodeCollected = ZipCode;
        appSession.appSessionObj.fullAddressApartmentNumber = appSession.appSessionObj.apartmentNumberSkip == process.const.STR_True ? " " : ApartmentNumber;

        //appSession.preStateName = appSession.stateName;
        //appSession.stateName = appSession.baseLine + process.const.SN_CollectFullAddress;
        //cxiSession.exitPoint = appSession.stateName;
        if (appSession.appSessionObj.confirmationIndividualSlot == process.const.STR_True) {
            appSession.appSessionObj.confirmationIndividualSlot = process.const.STR_False;
            appSession.appSessionObj[StreetNumberSlot + "Count"] = 0;
            appSession.appSessionObj[StreetNumberSlot + "Retry"] = process.const.STR_False;
            appSession.appSessionObj[StreetNameSlot + "Count"] = 0;
            appSession.appSessionObj[StreetNameSlot + "Retry"] = process.const.STR_False;
            appSession.appSessionObj[CitySlot + "Count"] = 0;
            appSession.appSessionObj[CitySlot + "Retry"] = process.const.STR_False;
            appSession.appSessionObj[ApartmentNumberSlot + "Count"] = 0;
            appSession.appSessionObj[ApartmentNumberSlot + "Retry"] = process.const.STR_False;
            appSession.appSessionObj[StateSlot + "Count"] = 0;
            appSession.appSessionObj[StateSlot + "Retry"] = process.const.STR_False;
            appSession.appSessionObj[ZipCodeSlot + "Count"] = 0;
            appSession.appSessionObj[ZipCodeSlot + "Retry"] = process.const.STR_False;
        }
        appSession.appSessionObj[StreetNumberSlot + "Count"] =
            appSession.appSessionObj[StreetNumberSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[StreetNumberSlot + "Count"];
        appSession.appSessionObj[StreetNameSlot + "Count"] =
            appSession.appSessionObj[StreetNameSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[StreetNameSlot + "Count"];
        appSession.appSessionObj[CitySlot + "Count"] =
            appSession.appSessionObj[CitySlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[CitySlot + "Count"];

        appSession.appSessionObj[ApartmentNumberSlot + "Count"] =
            appSession.appSessionObj[ApartmentNumberSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[ApartmentNumberSlot + "Count"];



        appSession.appSessionObj[StateSlot + "Count"] =
            appSession.appSessionObj[StateSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[StateSlot + "Count"];
        appSession.appSessionObj[ZipCodeSlot + "Count"] =
            appSession.appSessionObj[ZipCodeSlot + "Count"] ==
                undefined || null ?
                0 :
                appSession.appSessionObj[ZipCodeSlot + "Count"];

        //---------------------CXI-------------------------//
        cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"] =
            cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"];

        cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"] =
            cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"];

        cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"] =
            cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"];

        cxiSession.cxiSessionObj["StreetNameSlotNoMatch" + "Count"] =
            cxiSession.cxiSessionObj["StreetNameSlotNoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["StreetNameSlotNoMatch" + "Count"];

        cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"] =
            cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"];

        cxiSession.cxiSessionObj["ApartmentNumberSlotNoMatch" + "Count"] =
            cxiSession.cxiSessionObj["ApartmentNumberSlotNoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["ApartmentNumberSlotNoMatch" + "Count"];

        cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"] =
            cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"];

        cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"] =
            cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"];



        cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"] =
            cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"];

        cxiSession.cxiSessionObj["StateSlotNoMatch" + "Count"] =
            cxiSession.cxiSessionObj["StateSlotNoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["StateSlotNoMatch" + "Count"];

        cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"] =
            cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"];

        cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"] =
            cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"] ==
                undefined || null ?
                0 :
                cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"];

        cxiSession.cxiSessionObj.slotFlag = "Y";//cxi
        //---------------------CXI-------------------------//
        if (!StreetNumber && appSession.appSessionObj.individualSlot == process.const.STR_True) {
            logger.info("!StreetNumber && individualSlot == true true");
            //------------PUT CXI Keys----------------------------//

            let ctr = parseInt(cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"], 10);
            ctr++;
            cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";

            StreetNumberObj.elicitationStyle = "";
            StreetNumberObj.slotName = StreetNumberSlot;
            StreetNumberObj.slotType = "AMAZON.Number";
            StreetNumberObj.inputMode = intentRequest.inputMode;
            StreetNumberObj.slotValue = StreetNumber;
            StreetNumberObj.noMatchCount = cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"];
            StreetNumberObj.noInputCount = cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNumberObj);
            //-----------------------------------------------------//
            logger.info("StreetNumber slot is null individual slot");
            appSession.appSessionObj[StreetNumberSlot + "Retry"] = process.const.STR_True;
            retryController.Retry(
                StreetNumberSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_07_StrNum,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_08_StrNum,
                callback
            );
            return;
        }
        if (StreetNumber && appSession.appSessionObj.individualSlot == process.const.STR_True) {
            logger.info("StreetNumber && individualSlot == true true");
            //appSession.appSessionObj.streetNumberIndividualSlot =StreetNumber;
            if (!(StreetNumber.length >= 1 && StreetNumber.length <= 7) || (StreetNumber.substring(0, 1) == 0)) {
                logger.info("StreetNumber.length >= 1 && StreetNumber.length <= 7 || StreetNumber == 0 true");
                //------------PUT CXI Keys----------------------------


                let ctr = parseInt(cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"], 10);
                ctr++;
                cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";

                StreetNumberObj.elicitationStyle = "";
                StreetNumberObj.slotName = StreetNumberSlot;
                StreetNumberObj.slotType = "AMAZON.Number";
                StreetNumberObj.inputMode = intentRequest.inputMode;
                StreetNumberObj.slotValue = StreetNumber;
                StreetNumberObj.noMatchCount = cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"];
                StreetNumberObj.noInputCount = cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNumberObj);
                //-----------------------------------------------------//
                logger.info("StreetNumber slot length not match individual slot");
                appSession.appSessionObj[StreetNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    StreetNumberSlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_ninm1_2325_main_07_StrNum,
                    process.promptSession.scg_ccc_collect_ninm2_2325_main_08_StrNum,
                    callback,
                );
                return;
            }
        }
        if (!StreetNumber) {
            logger.info("!StreetNumber  true");
            //------------PUT CXI Keys----------------------------

            let ctr = parseInt(cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
            StreetNumberObj.elicitationStyle = "";
            StreetNumberObj.slotName = StreetNumberSlot;
            StreetNumberObj.slotType = "AMAZON.Number";
            StreetNumberObj.inputMode = intentRequest.inputMode;
            StreetNumberObj.slotValue = StreetNumber;
            StreetNumberObj.noMatchCount = cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"];
            StreetNumberObj.noInputCount = cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNumberObj);
            //-----------------------------------------------------//
            if (appSession.appSessionObj[StreetNumberSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_233685);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232504);
                }
            }

            logger.info("StreetNumber slot is null");
            retryController.Retry(
                StreetNumberSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_07_StrNum,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_08_StrNum,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_06_StrNumFirstAttempt
            );
            return;


        }
        if (StreetNumber) {
            logger.info("StreetNumber  true");
            if (!(StreetNumber.length >= 1 && StreetNumber.length <= 7) || (StreetNumber.substring(0, 1) == 0)) {
                logger.info("StreetNumber.length >= 1 && StreetNumber.length <= 7 || StreetNumber == 0  true");
                //------------PUT CXI Keys----------------------------

                let ctr = parseInt(cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"], 10);
                cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";

                StreetNumberObj.elicitationStyle = "";
                StreetNumberObj.slotName = StreetNumberSlot;
                StreetNumberObj.slotType = "AMAZON.Number";
                StreetNumberObj.inputMode = intentRequest.inputMode;
                StreetNumberObj.slotValue = StreetNumber;
                StreetNumberObj.noMatchCount = cxiSession.cxiSessionObj["StreetNumberSlotNoMatch" + "Count"];
                StreetNumberObj.noInputCount = cxiSession.cxiSessionObj["StreetNumberSlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNumberObj);
                //-----------------------------------------------------//

                if (appSession.appSessionObj[StreetNumberSlot + "Retry"] != process.const.STR_True) {
                    if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                        //start service
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210504);
                    } else {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232504);
                    }
                }
                logger.info("StreetNumber slot length not match");
                retryController.Retry(
                    StreetNumberSlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_ninm1_2325_main_07_StrNum,
                    process.promptSession.scg_ccc_collect_ninm2_2325_main_08_StrNum,
                    callback,
                    process.promptSession.scg_ccc_collect_2325_main_06_StrNumFirstAttempt
                );
                return;
            }
        }

        if (StreetNumber && !StreetName && appSession.appSessionObj.individualSlot == process.const.STR_True) {
            logger.info("StreetNumber && !StreetName && individualSlot == true true");
            //------------PUT CXI Keys----------------------------


            let ctr = parseInt(cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";

            StreetNameObj.elicitationStyle = "";
            StreetNameObj.slotName = StreetNameSlot;
            StreetNameObj.slotType = "AMAZON.StreetName";
            StreetNameObj.inputMode = intentRequest.inputMode;
            StreetNameObj.slotValue = StreetName == undefined ? "" : StreetName;
            StreetNameObj.noMatchCount = cxiSession.cxiSessionObj["StreetNameSlotNoMatch" + "Count"];
            StreetNameObj.noInputCount = cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNameObj);
            //-----------------------------------------------------//

            if (appSession.appSessionObj[StreetNameSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210506);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232506);
                }
            }

            logger.info("StreetNumber slot is full street name slot is null individual slot");
            retryController.Retry(
                StreetNameSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_10_StrName,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_11_StrName,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_09_StrName
            );
            return;
        }
        if (!StreetName) {
            logger.info("!StreetName true");
            //------------PUT CXI Keys----------------------------
            let ctr = parseInt(cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";

            StreetNameObj.elicitationStyle = "";
            StreetNameObj.slotName = StreetNameSlot;
            StreetNameObj.slotType = "AMAZON.StreetName";
            StreetNameObj.inputMode = intentRequest.inputMode;
            StreetNameObj.slotValue = StreetName == undefined ? "" : StreetName;
            StreetNameObj.noMatchCount = cxiSession.cxiSessionObj["StreetNameSlotNoMatch" + "Count"];
            StreetNameObj.noInputCount = cxiSession.cxiSessionObj["StreetNameSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNameObj);
            //-----------------------------------------------------//
            if (appSession.appSessionObj[StreetNameSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210506);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232506);
                }
            }
            logger.info("Street name slot is null");
            retryController.Retry(
                StreetNameSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_10_StrName,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_11_StrName,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_09_StrName
            );
            return;
        }
        if (StreetNumber && StreetName && !ApartmentNumber &&
            appSession.appSessionObj.individualSlot == process.const.STR_True && appSession.appSessionObj.apartmentNumberSkip != process.const.STR_True) {
            logger.info("StreetNumber && StreetName && !ApartmentNumber && individualSlot == true && apartmentNumberSkip != true true");
            logger.info("StreetNumber , StreetName  slot is full ApartmentNumber slot is null individual slot");
            if (appSession.appSessionObj.apartmentNumberSlotCollection == process.const.STR_True) {
                //------------PUT CXI Keys----------------------------//
                logger.info("apartmentNumberSlotCollection == true true");

                let ctr = parseInt(cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"], 10);
                ctr++;
                cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";
                ApartmentNumberObj.elicitationStyle = "";
                ApartmentNumberObj.slotName = ApartmentNumberSlot;
                ApartmentNumberObj.slotType = "ExternalGrammar";
                ApartmentNumberObj.inputMode = intentRequest.inputMode;
                ApartmentNumberObj.slotValue = ApartmentNumber == undefined ? "" : ApartmentNumber;
                ApartmentNumberObj.noMatchCount = cxiSession.cxiSessionObj["ApartmentNumberSlotNoMatch" + "Count"];
                ApartmentNumberObj.noInputCount = cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(ApartmentNumberObj);
                //-----------------------------------------------------//
                logger.info("ApartmentNumber slot is null");
                appSession.appSessionObj[ApartmentNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    ApartmentNumberSlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_2105_main_15_AptNumberOrUnit_Yes,
                    process.promptSession.scg_ccc_collect_2105_main_15_AptNumberOrUnit_Yes,
                    callback,
                );
                return;
            }
            cxiSession.cxiSessionObj.promptType = "prompt";//cxi
            appSession.appSessionObj.streetNumberIndividualSlot = StreetNumber;
            appSession.appSessionObj.streetNameIndividualSlot = StreetName;
            appSession.appSessionObj.cityIndividualSlot = City;
            appSession.appSessionObj.stateIndividualSlot = State;
            appSession.appSessionObj.zipCodeIndividualSlot = ZipCode;
            appSession.nextStateName = process.const.NS_ApartmentNumberConfirmation;
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

        if ((!ApartmentNumber && appSession.appSessionObj.apartmentNumberSkip != process.const.STR_True)) {
            logger.info("!ApartmentNumber && apartmentNumberSkip != true true");
            logger.info("apartnumber skip condition");
            appSession.appSessionObj.streetNumberIndividualSlot = StreetNumber;
            appSession.appSessionObj.streetNameIndividualSlot = StreetName;
            appSession.appSessionObj.cityIndividualSlot = City;
            appSession.appSessionObj.stateIndividualSlot = State;
            appSession.appSessionObj.zipCodeIndividualSlot = ZipCode;

            if (appSession.appSessionObj.apartmentNumberSlotCollection == process.const.STR_True) {
                logger.info("apartmentNumberSlotCollection == true true");
                //------------PUT CXI Keys----------------------------//

                let ctr = parseInt(cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"], 10);
                ctr++;
                cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";
                ApartmentNumberObj.elicitationStyle = "";
                ApartmentNumberObj.slotName = ApartmentNumberSlot;
                ApartmentNumberObj.slotType = "ExternalGrammar";
                ApartmentNumberObj.inputMode = intentRequest.inputMode;
                ApartmentNumberObj.slotValue = ApartmentNumber == undefined ? "" : ApartmentNumber;
                ApartmentNumberObj.noMatchCount = cxiSession.cxiSessionObj["ApartmentNumberSlotNoMatch" + "Count"];
                ApartmentNumberObj.noInputCount = cxiSession.cxiSessionObj["ApartmentNumberSlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(ApartmentNumberObj);
                //-----------------------------------------------------//
                logger.info("ApartmentNumber slot is null");
                appSession.appSessionObj[ApartmentNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    ApartmentNumberSlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_2105_main_15_AptNumberOrUnit_Yes,
                    process.promptSession.scg_ccc_collect_2105_main_15_AptNumberOrUnit_Yes,
                    callback,
                );
                return;
            }
            logger.info("apartmentNumberSlotCollection == true false");
            cxiSession.cxiSessionObj.promptType = "prompt";//cxi
            appSession.nextStateName = process.const.NS_ApartmentNumberConfirmation;
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

        if (StreetNumber && StreetName && ApartmentNumber && !City && appSession.appSessionObj.individualSlot == process.const.STR_True) {
            logger.info("StreetNumber && StreetName && ApartmentNumber && !City && individualSlot == true true");
            logger.info("StreetNumber , StreetName,ApartmentNumber  slot is full city slot is null individual slot");
            if (appSession.appSessionObj.citySlotCollection == process.const.STR_True) {
                logger.info("citySlotCollection == true true");
                //------------PUT CXI Keys----------------------------//
                let ctr = parseInt(cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"], 10);
                ctr++;
                cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";

                CityObj.elicitationStyle = "";
                CityObj.slotName = CitySlot;
                CityObj.slotType = "Amazon.City";
                CityObj.inputMode = intentRequest.inputMode;
                CityObj.slotValue = City == undefined ? "" : City;
                CityObj.noMatchCount = cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"];
                CityObj.noInputCount = cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(CityObj);
                //-----------------------------------------------------//
                logger.info("city slot is null");
                appSession.appSessionObj[CitySlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    CitySlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_ninm1_2325_main_13_CityName,
                    process.promptSession.scg_ccc_collect_ninm2_2325_main_14_CityName,
                    callback
                );
                return;


            }
            //------------PUT CXI Keys----------------------------//
            let ctr = parseInt(cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
            CityObj.elicitationStyle = "";
            CityObj.slotName = CitySlot;
            CityObj.slotType = "Amazon.City";
            CityObj.inputMode = intentRequest.inputMode;
            CityObj.slotValue = City == undefined ? "" : City;
            CityObj.noMatchCount = cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"];
            CityObj.noInputCount = cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(CityObj);
            //-----------------------------------------------------//

            if (appSession.appSessionObj[CitySlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210509);
                }
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232509);
            }

            retryController.Retry(
                CitySlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_13_CityName,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_14_CityName,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_12_CityName
            );
            return;
        }
        if (!City) {
            logger.info("!City true");
            logger.info("City slot is null ");
            if (appSession.appSessionObj.apartmentNumberSkip == process.const.STR_True) {
                //------------PUT CXI Keys----------------------------//
                let ctr = parseInt(cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"], 10);
                ctr++;
                cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";
                CityObj.elicitationStyle = "";
                CityObj.slotName = CitySlot;
                CityObj.slotType = "Amazon.City";
                CityObj.inputMode = intentRequest.inputMode;
                CityObj.slotValue = City == undefined ? "" : City;
                CityObj.noMatchCount = cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"];
                CityObj.noInputCount = cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(CityObj);
                //-----------------------------------------------------//
                appSession.appSessionObj[CitySlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    CitySlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_ninm1_2325_main_13_CityName,
                    process.promptSession.scg_ccc_collect_ninm2_2325_main_14_CityName,
                    callback
                );
                return;

            }
            //------------PUT CXI Keys----------------------------//
            let ctr = parseInt(cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
            CityObj.elicitationStyle = "";
            CityObj.slotName = CitySlot;
            CityObj.slotType = "Amazon.City";
            CityObj.inputMode = intentRequest.inputMode;
            CityObj.slotValue = City == undefined ? "" : City;
            CityObj.noMatchCount = cxiSession.cxiSessionObj["CitySlotNoMatch" + "Count"];
            CityObj.noInputCount = cxiSession.cxiSessionObj["CitySlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(CityObj);
            //-----------------------------------------------------//
            if (appSession.appSessionObj[CitySlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210509);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232509);
                }

            }
            retryController.Retry(
                CitySlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_13_CityName,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_14_CityName,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_12_CityName
            );
            return;
        }
        if (StreetNumber && StreetName && City && ApartmentNumber && !State && appSession.appSessionObj.individualSlot == process.const.STR_True) {
            logger.info("StreetNumber && StreetName && City && ApartmentNumber && !State && individualSlot ==true true");
            logger.info("StreetNumber , StreetName, city ,ApartmentNumber slot is full State slot is null individual slot");
            //------------PUT CXI Keys----------------------------
            let ctr = parseInt(cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
            StateObj.elicitationStyle = "";
            StateObj.slotName = StateSlot;
            StateObj.slotType = "Amazon.State";
            StateObj.inputMode = intentRequest.inputMode;
            StateObj.slotValue = State == undefined ? "" : State;
            StateObj.noMatchCount = cxiSession.cxiSessionObj["StateSlotNoMatch" + "Count"];
            StateObj.noInputCount = cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StateObj);
            //-----------------------------------------------------//
            if (appSession.appSessionObj[StateSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232511);
                }

            }
            retryController.Retry(
                StateSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_16_StateName,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_17_StateName,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_15_StateName
            );
            return;
        }
        if (!State) {
            logger.info("!State true");
            logger.info("State slot is null ");
            //------------PUT CXI Keys----------------------------//
            let ctr = parseInt(cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
            StateObj.elicitationStyle = "";
            StateObj.slotName = StateSlot;
            StateObj.slotType = "Amazon.State";
            StateObj.inputMode = intentRequest.inputMode;
            StateObj.slotValue = State == undefined ? "" : State;
            StateObj.noMatchCount = cxiSession.cxiSessionObj["StateSlotNoMatch" + "Count"];
            StateObj.noInputCount = cxiSession.cxiSessionObj["StateSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StateObj);
            //-----------------------------------------------------//

            if (appSession.appSessionObj[StateSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                }
                cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232511);
            }

            retryController.Retry(
                StateSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_16_StateName,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_17_StateName,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_15_StateName
            );
            return;
        }
        if ((StreetNumber && StreetName && City && ApartmentNumber && State && !ZipCode && appSession.appSessionObj.individualSlot == process.const.STR_True)) {
            logger.info("StreetNumber && StreetName && City && ApartmentNumber && State && !ZipCode && individualSlot == true true");
            //------------PUT CXI Keys----------------------------//
            let ctr = parseInt(cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
            ZipCodeObj.elicitationStyle = "";
            ZipCodeObj.slotName = ZipCodeSlot;
            ZipCodeObj.slotType = "Amazon.Number";
            ZipCodeObj.inputMode = intentRequest.inputMode;
            ZipCodeObj.slotValue = ZipCode == undefined ? "" : ZipCode;
            ZipCodeObj.noMatchCount = cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"];
            ZipCodeObj.noInputCount = cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(ZipCodeObj);
            //-----------------------------------------------------//
            logger.info("StreetNumber , StreetName,city,ApartmentNumber, state slot is full ZipCode slot is null individual slot");
            if (appSession.appSessionObj[ZipCodeSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210511);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232512);
                }

            }
            retryController.Retry(
                ZipCodeSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_19_ZipCode,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_20_ZipCode,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_18_ZipCode
            );
            return;
        }
        if (!ZipCode) {
            logger.info("!ZipCode true");
            logger.info("zipcode slot is null first attempt");
            //------------PUT CXI Keys----------------------------//
            let ctr = parseInt(cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"], 10);
            cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";

            ZipCodeObj.elicitationStyle = "";
            ZipCodeObj.slotName = ZipCodeSlot;
            ZipCodeObj.slotType = "Amazon.Number";
            ZipCodeObj.inputMode = intentRequest.inputMode;
            ZipCodeObj.slotValue = ZipCode == undefined ? "" : ZipCode;
            ZipCodeObj.noMatchCount = cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"];
            ZipCodeObj.noInputCount = cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(ZipCodeObj);
            //-----------------------------------------------------//
            if (appSession.appSessionObj[ZipCodeSlot + "Retry"] != process.const.STR_True) {
                if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                    //start service
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210511);
                } else {
                    cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232512);
                }
            }
            retryController.Retry(
                ZipCodeSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_2325_main_19_ZipCode,
                process.promptSession.scg_ccc_collect_ninm2_2325_main_20_ZipCode,
                callback,
                process.promptSession.scg_ccc_collect_2325_main_18_ZipCode
            );
            return;
        }
        if (ZipCode) {
            logger.info("ZipCode true");
            if (!(ZipCode.length == 5)) {
                logger.info("!(ZipCode.length == 5) true");
                //------------PUT CXI Keys----------------------------//
                let ctr = parseInt(cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"], 10);
                cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"] = ctr;
                cxiSession.cxiSessionObj.result = "Failure";

                ZipCodeObj.elicitationStyle = "";
                ZipCodeObj.slotName = ZipCodeSlot;
                ZipCodeObj.slotType = "Amazon.Number";
                ZipCodeObj.inputMode = intentRequest.inputMode;
                ZipCodeObj.slotValue = ZipCode == undefined ? "" : ZipCode;
                ZipCodeObj.noMatchCount = cxiSession.cxiSessionObj["ZipCodeSlotNoMatch" + "Count"];
                ZipCodeObj.noInputCount = cxiSession.cxiSessionObj["ZipCodeSlotNoInput" + "Count"];
                cxiSession.cxiSessionObj.cxiSlotDetails.push(ZipCodeObj);
                //-----------------------------------------------------//
                if (appSession.appSessionObj[ZipCodeSlot + "Retry"] != process.const.STR_True) {
                    if (appSession.callerGoal == process.const.CG_StartService || appSession.callerGoal == process.const.CG_NewCustomer) {
                        //start service
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210511);
                    } else {
                        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_232512);
                    }
                }

                logger.info("zip code length not match");
                retryController.Retry(
                    ZipCodeSlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_ninm1_2325_main_19_ZipCode,
                    process.promptSession.scg_ccc_collect_ninm2_2325_main_20_ZipCode,
                    callback,
                    process.promptSession.scg_ccc_collect_2325_main_18_ZipCode
                );
                return;
            }
        }

        if ((StreetNumber && StreetName && City && ApartmentNumber && State && ZipCode) || (StreetNumber && StreetName && City && State && ZipCode && appSession.appSessionObj.apartmentNumberSkip == process.const.STR_True)) {
            logger.info("full address Collected Successfully");
            appSession.nextStateName = process.const.NS_FullAddressConfirmation;
            appSession.appSessionObj.streetNumberCollected = StreetNumber;
            appSession.appSessionObj.fullAddressStopService = appSession.appSessionObj.apartmentNumberSkip == process.const.STR_True ? ` ${StreetName}, ${City}, ${State}` : ` ${StreetName}, ${ApartmentNumber}, ${City}, ${State}`;
            appSession.appSessionObj.zipCodeCollected = ZipCode;
            appSession.nextIntent = process.const.MS200;
            appSession.appSessionObj.fullAddressStreetName = StreetName;
            appSession.appSessionObj.fullAddressCity = City;
            appSession.appSessionObj.fullAddressState = State;
            appSession.appSessionObj.fullAddressApartmentNumber = appSession.appSessionObj.apartmentNumberSkip == process.const.STR_True ? " " : ApartmentNumber;
            //------------PUT CXI Keys----------------------------//
            FullAddressObj.elicitationStyle = "";
            FullAddressObj.slotName = "";
            FullAddressObj.slotType = "";
            FullAddressObj.inputMode = intentRequest.inputMode;
            FullAddressObj.slotValue = appSession.appSessionObj.streetNumberCollected + " " + appSession.appSessionObj.fullAddressStopService + " " + appSession.appSessionObj.zipCodeCollected;
            FullAddressObj.noMatchCount = 0;
            FullAddressObj.noInputCount = 0;
            cxiSession.cxiSessionObj.cxiSlotDetails.push(FullAddressObj);
            //-----------------------------------------------------//
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
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentRequest.sessionState.intent.name, callback);
    }
};
module.exports = {
    CollectFullAddress
};

const logger = require("../../Helpers/Utilities/logger");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const util = require("../../Helpers/Utilities/getLexResponse");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");
const catchHelper = require("../../Helpers/Common/catchHelper");
const lex_Slots = require("../../Helpers/Common/slotHelper");
const retryController = require("../../Helpers/Controller/retryController");
const callSlotValidate = require("../../Helpers/Common/validateDate");
const bargeInNotAllowed = require("../../Intents/Common/AU109_BargeInNotAllowed");
const StreetNumber = async function(intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let promptOut = "";
    let activeContexts = [];
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let StreetNumberSlot = process.const.STR_StreetNumber;
    //let StreetNumber = lex_Slots.GetSlotsOriginalValue(StreetNumberSlot, intentRequest);
    let StreetNumber = lex_Slots.GetSlots(StreetNumberSlot, intentRequest);
    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + process.const.STR_Underscore + process.const.SN_StreetNumber;
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        cxiSession.cxiSessionObj.cxiSlotDetails = [];
        //----------------------------------------------------- 
        appSession.appSessionObj[StreetNumberSlot + "Count"] =
            appSession.appSessionObj[StreetNumberSlot + "Count"] ==
            undefined || null ?
            0 :
            appSession.appSessionObj[StreetNumberSlot + "Count"];
        logger.debug("Nomatch Noinput Count " + appSession.appSessionObj[StreetNumberSlot + "Count"]);
        //--------------CXI NoInput/NoMatch count -------------------------------
        cxiSession.cxiSessionObj["StreetNumberNoInputCount"] = cxiSession.cxiSessionObj["StreetNumberNoInputCount"] == undefined || null ?
            0 : cxiSession.cxiSessionObj["StreetNumberNoInputCount"];
        cxiSession.cxiSessionObj["StreetNumberNoMatchCount"] = cxiSession.cxiSessionObj["StreetNumberNoMatchCount"] == undefined || null ?
            0 : cxiSession.cxiSessionObj["StreetNumberNoMatchCount"];
        if(intentRequest.inputTranscript == "" || intentRequest.inputTranscript == null || intentRequest.inputTranscript == "null" || intentRequest.inputTranscript == undefined || intentRequest.inputTranscript == "undefined") {
         
            let ctr = parseInt(cxiSession.cxiSessionObj["StreetNumberNoInputCount"], 10);
            ctr++;
            cxiSession.cxiSessionObj["StreetNumberNoInputCount"] = ctr; 
            cxiSession.cxiSessionObj.result = "Failure";
        }
        else if((intentRequest.inputTranscript != "" &&StreetNumber==null ) || ((StreetNumber.length < 1 || StreetNumber.length > 7)&& StreetNumber!=null)){ 
            let ctr = parseInt(cxiSession.cxiSessionObj["StreetNumberNoMatchCount"], 10);
            ctr++;
            cxiSession.cxiSessionObj["StreetNumberNoMatchCount"] = ctr;
            cxiSession.cxiSessionObj.result = "Failure";
        }
        //----------------------------------------------------- 
        //------------PUT CXI Keys----------------------------
            let StreetNumberObj = {};
            StreetNumberObj.elicitationStyle = "";
            StreetNumberObj.slotName = StreetNumberSlot;
            StreetNumberObj.slotType = "AMAZON.Number";
            StreetNumberObj.inputMode = intentRequest.inputMode;
            StreetNumberObj.slotValue = intentRequest.inputTranscript != "" ? StreetNumber : "";
            StreetNumberObj.noMatchCount = cxiSession.cxiSessionObj["StreetNumberNoMatchCount"];
            StreetNumberObj.noInputCount = cxiSession.cxiSessionObj["StreetNumberNoInputCount"];
            cxiSession.cxiSessionObj.cxiSlotDetails.push(StreetNumberObj);
            cxiSession.cxiSessionObj.slotFlag = "Y";
            //----------------------------------------------------- 
        if (!StreetNumber) {
            logger.info("Street Number slot is null");
            let promptOut = process.promptSession.scg_ccc_collect_7004_auth_01_StreetNumber;
            promptOut = ssmlMessage.ConvertSSML(promptOut);
            retryController.Retry(
                StreetNumberSlot,
                intentRequest,
                process.promptSession.scg_ccc_collect_ninm1_7004_auth_02_StreetNumber,
                process.promptSession.scg_ccc_collect_ninm2_7004_auth_03_StreetNumber,
                callback,
                promptOut
            );
            return;
        }
        if (StreetNumber) {
            if (!(StreetNumber.length >= 1 && StreetNumber.length <= 7) || (StreetNumber.startsWith('0', 0) == true && (StreetNumber.length >= 1 && StreetNumber.length <= 7))) {
                logger.info("Street Number slot length not match");
                appSession.appSessionObj[StreetNumberSlot + "Retry"] = process.const.STR_True;
                retryController.Retry(
                    StreetNumberSlot,
                    intentRequest,
                    process.promptSession.scg_ccc_collect_ninm1_7004_auth_02_StreetNumber,
                    process.promptSession.scg_ccc_collect_ninm2_7004_auth_03_StreetNumber,
                    callback,
                );
                return;
            }
        }
        if (StreetNumber) {
            logger.info("Street Numberr Collected Successfully");
            let streetNumberOrginalValue = lex_Slots.GetSlotsOriginalValue(StreetNumberSlot, intentRequest);
            if (StreetNumber.includes("o") || StreetNumber.includes("oh") || StreetNumber.includes("0o") || StreetNumber.includes("0oh") || streetNumberOrginalValue.includes("oh"))  {
                if(StreetNumber.includes("0o")){
                StreetNumber = StreetNumber.replace(/0o|0oh/g, 0);//replace(/oh|o|0o|0oh/g, 0);
                }else if(streetNumberOrginalValue.includes("oh")){
                StreetNumber = callSlotValidate.UpdatedOriginalValue(streetNumberOrginalValue);
                }
                intentRequest.sessionState.intent.slots[StreetNumberSlot] = lex_Slots.UpdateSlot(StreetNumber);
            }
            appSession.nextStateName = process.const.NS_StreetNumber_Confirmation;
            const regex = /^(\d+)([A-Za-z]+)$/;
            const match = StreetNumber.match(regex);
            if (match) {
            const formattedStreetNumber = `${match[1]} ${match[2].toUpperCase()}`;
            appSession.appSessionObj.getStreetNumber = formattedStreetNumber;
            }else {
              appSession.appSessionObj.getStreetNumber = StreetNumber;
            }
            await bargeInNotAllowed.BargeInNotAllowed(appSession,intentRequest, callback);
            return;
            /*appSession.nextIntent = process.const.AU200;
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
            return;*/
        }
    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentRequest.sessionState.intent.name, callback);
    }
};
module.exports = {
    StreetNumber
};

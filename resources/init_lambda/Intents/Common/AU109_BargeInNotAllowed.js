const util = require("../../Helpers/Utilities/getLexResponse");
const sessionHelper = require("../../Helpers/Common/sessionHelper");
const logger = require("../../Helpers/Utilities/logger");
const catchHelper = require("../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../Helpers/Common/ssmlHelper");

const BargeInNotAllowed = async function (appSession,intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered BargeInNotAllowed Helper");
    let promptOut = " ";
    let activeContexts = [];
    appSession.startTime = util.getStartTime(new Date());
    try {
        appSession.bargeIn = process.const.STR_False;
        appSession.nextBot = process.const.Authentication_Bot;
        switch (appSession.nextStateName) {
            case process.const.NS_AIN_Identified:
                appSession.appSessionObj.fallBackState = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_menu_7001_auth_01_AddressConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.houseNumber + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 85);
                appSession.nextIntent = process.const.AU200;
                break;
            case process.const.NS_CellPhnColl_PhoneNumberConfirmation:
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                appSession.appSessionObj.cellPhoneConfirmationCount = appSession.appSessionObj.cellPhoneConfirmationCount == undefined ?
                    0 : appSession.appSessionObj.cellPhoneConfirmationCount;
                promptOut = process.promptSession.scg_ccc_prmt_1016_init_04_CellPhoneConfirmation + '<say-as interpret-as="telephone">' + appSession.appSessionObj.getPhoneNumber + '</say-as>' ;
                promptOut = ssmlMessage.ConvertSSML(promptOut);
                appSession.nextIntent = process.const.AU200;
                break;
            case process.const.NS_PhoneNumber_Confirmation:
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                promptOut = process.promptSession.scg_ccc_menu_7002_auth_07_PhoneNumberConfirmation + '<say-as interpret-as="telephone">' + appSession.appSessionObj.getPhoneNumber + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 85);
                appSession.nextIntent = process.const.AU200;
                break;
            case process.const.NS_StreetNumber_Confirmation:
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                //promptOut = process.promptSession.scg_ccc_menu_7005_auth_01_StreetNumberConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.getStreetNumber + '</say-as>';
                let getStreetNumber = appSession.appSessionObj.getStreetNumber.split("").join('<break strength="strong"/>');
                promptOut = process.promptSession.scg_ccc_menu_7005_auth_01_StreetNumberConfirmation + getStreetNumber;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 85);
                appSession.nextIntent = process.const.AU200;
                break;
            case process.const.NS_AccountNumber_Confirmation:
                appSession.appSessionObj.getAccountNumber = appSession.appSessionObj.tempAccountNumber.toString();
                let accountNumber = appSession.appSessionObj.getAccountNumber.split("").join('<break strength="strong"/>');
                activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_Repeat);
                promptOut = process.promptSession.scg_ccc_menu_7006_auth_11_AccountNumberConfirmation + accountNumber;
                promptOut = ssmlMessage.ConvertSSML(promptOut, 90);
                appSession.nextIntent = process.const.AU200;
                break;
            default :
                appSession.appSessionObj.fallBackState = process.const.STR_True;
                promptOut = process.promptSession.scg_ccc_menu_1014_init_01_AddressConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.houseNumber + '</say-as>';
                promptOut = ssmlMessage.ConvertSSML(promptOut, 85);
                appSession.nextIntent = process.const.AU200;
                break;    
        }
        appSession.fallBackState = process.const.STR_true;
        //promptOut = ssmlMessage.ConvertSSML(promptOut);
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

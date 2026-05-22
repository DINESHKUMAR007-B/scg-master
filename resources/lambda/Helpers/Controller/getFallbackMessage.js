const catchHelper = require("../Common/catchHelper");
const sessionHelper = require("../Common/sessionHelper");
let appSession = sessionHelper.AppSession;
let cxiSession = sessionHelper.CxiSession;
const FallbackMessage = function (appSession, retryCount, outputSessionAttributes, intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    let stateName = appSession.nextStateName; 
    try {
        let promptOut = retryCount == 1 ? process.promptSession.scg_ccc_prmt_7000_auth_02_CommonRetry1 : process.promptSession.scg_ccc_prmt_7000_auth_03_CommonRetry2;

        switch (stateName) {
            case process.const.NS_EmergencyConfirmation:
                promptOut += process.promptSession.scg_ccc_menu_ninm1_1004_Init_02_EmergencyConfirmMenu;
                break;
            case process.const.NS_CellPhoneCollection_AddrFound:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_1014_init_08_CellPhnConfirmation;
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_1014_init_07_CellPhnConfirmation;
                break; 
            case process.const.NS_CellPhnColl_PhoneNumberConfirmation:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_1016_init_07_CellPhoneConfirmation;
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_1016_init_06_CellPhoneConfirmation;
                break; 
            case process.const.NS_StreetNumber_DontHaveIt:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_7004_auth_06_StreetNumberDontKnow;
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_7004_auth_05_StreetNumberDontKnow;
                break;  
            case process.const.NS_Different_PhoneNumber:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_7003_auth_04_DifferentPhoneNumber;
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_7003_auth_03_DifferentPhoneNumber;
                break;
            case process.const.NS_AIN_Identified:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_7001_auth_03_AddressConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.houseNumber + '</say-as>' + process.promptSession.scg_ccc_menu_ninm2_7001_auth_03_AddressConfirmationYN;
                    cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm2_7001_auth_03_AddressConfirmation";
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_7001_auth_02_AddressConfirmation + '<say-as interpret-as="digits">' + appSession.appSessionObj.houseNumber + '</say-as>' + process.promptSession.scg_ccc_menu_ninm1_7001_auth_02_AddressConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_7001_auth_02_AddressConfirmation";
                break; 
            case process.const.NS_PhoneNumber_Confirmation:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_7002_auth_09_PhoneNumberConfirmation + '<say-as interpret-as="telephone">' +appSession.appSessionObj.getPhoneNumber + '</say-as>' + process.promptSession.scg_ccc_menu_ninm2_7002_auth_09_PhoneNumberConfirmationYN;
                    cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm2_7002_auth_09_PhoneNumberConfirmation";
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_7002_auth_08_PhoneNumberConfirmation + '<say-as interpret-as="telephone">' +appSession.appSessionObj.getPhoneNumber + '</say-as>' + process.promptSession.scg_ccc_menu_ninm1_7002_auth_08_PhoneNumberConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_7002_auth_08_PhoneNumberConfirmation";
                break;    
            case process.const.NS_StreetNumber_Confirmation:
                let getStreetNumber = appSession.appSessionObj.getStreetNumber.split("").join('<break strength="strong"/>');
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_7005_auth_04_StreetNumberConfirmation + getStreetNumber + process.promptSession.scg_ccc_menu_ninm2_7005_auth_04_StreetNumberConfirmationYN;
                    cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm2_7005_auth_04_StreetNumberConfirmation";
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_7005_auth_03_StreetNumberConfirmation + getStreetNumber + process.promptSession.scg_ccc_menu_ninm1_7005_auth_03_StreetNumberConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_7005_auth_03_StreetNumberConfirmation";
                break;  
            case process.const.NS_AccountNumber_Confirmation:
                let accountNumber = appSession.appSessionObj.getAccountNumber.split("").join('<break time="0.1s"/>');
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_7006_auth_13_AccountNumberConfirmation + accountNumber  + process.promptSession.scg_ccc_menu_ninm2_7006_auth_13_AccountNumberConfirmationYN;
                    cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm2_7006_auth_13_AccountNumberConfirmation";
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_7006_auth_12_AccountNumberConfirmation + accountNumber + process.promptSession.scg_ccc_menu_ninm1_7006_auth_12_AccountNumberConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_7006_auth_12_AccountNumberConfirmation";
                break;
            case process.const.NS_CellPhoneCollection:
                if (retryCount == 2) {
                    promptOut +=  process.promptSession.scg_ccc_menu_ninm2_1014_init_03_AddressConfirmation + '<say-as interpret-as="telephone">' + appSession.appSessionObj.houseNumber + '</say-as>' + process.promptSession.scg_ccc_menu_ninm2_1014_init_03_AddressConfirmationYN;
                    cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm2_1014_init_03_AddressConfirmation";
                    break;
                }
                promptOut +=  process.promptSession.scg_ccc_menu_ninm1_1014_init_02_AddressConfirmation + '<say-as interpret-as="telephone">' + appSession.appSessionObj.houseNumber + '</say-as>' + process.promptSession.scg_ccc_menu_ninm1_1014_init_02_AddressConfirmationYN;
                cxiSession.cxiSessionObj.promptid = "scg_ccc_menu_ninm1_1014_init_02_AddressConfirmation";
                break;
            default: 
                if (retryCount == 2) {
                    promptOut;
                    break;
                }
                promptOut; 
                break;
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

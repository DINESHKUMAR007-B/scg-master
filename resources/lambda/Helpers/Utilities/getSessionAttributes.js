const sessionHelper = require('../../Helpers/Common/sessionHelper');
const logger = require("../Utilities/logger");
const logData = require("../Utilities/loggingData");
const util = require("../Utilities/getLexResponse");
const callPath = require('../../Helpers/Common/callPathHelper');
const dynamoDBHelper = require('../../Helpers/Common/dynamoDBHelper');
const catchHelper = require('../../Helpers/Common/catchHelper');
exports.getSessionAttributes = function getSessionAttributes(attributes, intentRequest, type, messages, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let ctiData = sessionHelper.CtiData;
    try {
        cxiSession.cxiSessionObj.endTime = util.getStartTime(new Date());
        type = type == "ElicitIntentActiveContext" ? "ElicitIntent" : type == "SwitchToIntentSlot" ? "ElicitSlot" : type;
        appSession.dialogActionType = type;
        appSession.audioStartTimeOut = type == "StartIntent" ? "100" :
            type == "Close" ? "100" :
                type == "ElicitIntent" && (appSession.nextStateName == process.const.NS_FullAddressStopService || appSession.nextStateName == process.const.NS_FullAddressStartService) ? "8000" :
                    type == "ElicitIntent" ? "6000" :
                        (type == "ElicitSlot" && appSession.nextStateName == process.const.NS_StopServDate) ? "4000" :
                            type == "ElicitSlot" ? "6000" : appSession.audioStartTimeOut;
        appSession.dtmfTimeOut = appSession.audioStartTimeOut == "100" ? "100" :
            type == "ElicitIntent" ? "600" :
                (type == "ElicitSlot" && appSession.nextStateName == process.const.NS_StopServDate) ? "1600" :
                    type == "ElicitSlot" ? "1600" : appSession.dtmfTimeOut;
        appSession.audioEndTimeOut = appSession.audioStartTimeOut == "100" ? "100" :
            type == "ElicitIntent" && (appSession.nextStateName == process.const.NS_FullAddressStopService || appSession.nextStateName == process.const.NS_FullAddressStartService) ? "2000" :
                type == "ElicitIntent" ? "1200" :
                    type == "ElicitSlot" ? "1600" : appSession.audioEndTimeOut;
        attributes[process.const.STR_Interrupt + process.const.STR_Asterisk + process.const.STR_Colon + process.const.STR_Asterisk] = appSession.bargeIn == undefined ? process.const.STR_True : process.const.STR_False;
        delete (appSession.bargeIn);
        let loggingData = logData.UpdateLogData(intentRequest, type, messages);
        logger.info(loggingData);
        attributes.agentDesktopData = callPath.AgentDesktopData(appSession, cxiSession);
        attributes.publicKey = process.env.publicKey == undefined ? process.env.publicKey : process.env.publicKey;
        attributes.apiKey = process.env.apiKey == undefined ? process.env.apiKey : process.env.apiKey;
        attributes.apiValue = process.env.apiValue == undefined ? process.env.apiValue : process.env.apiValue;
        attributes.keyStorePw = process.env.keyStorePw == undefined ? process.env.keyStorePw : process.env.keyStorePw;
        attributes.trustStorePw = process.env.trustStorePw == undefined ? process.env.trustStorePw : process.env.trustStorePw;
        attributes.rootCert = process.env.rootCert == undefined ? process.env.rootCert : process.env.rootCert;
        attributes.xApiKey = process.env.xApiKey == undefined ? process.env.xApiKey : process.env.xApiKey;
        attributes.accessToken = process.env.accessToken == undefined ? process.env.accessToken : process.env.accessToken;
        attributes.accessTokenGeneratedTimestamp = process.env.accessTokenGeneratedTimestamp == undefined ? process.env.accessTokenGeneratedTimestamp : process.env.accessTokenGeneratedTimestamp;
        attributes.accessTokenExpirationTimestamp = process.env.accessTokenExpirationTimestamp == undefined ? process.env.accessTokenExpirationTimestamp : process.env.accessTokenExpirationTimestamp;
        attributes.vXAPIKey = process.env.vXAPIKey == undefined ? process.env.vXAPIKey : process.env.vXAPIKey;
        attributes.DQM_client_id = process.env.DQM_client_id == undefined ? process.env.DQM_client_id : process.env.DQM_client_id;
        attributes.DQM_client_secret = process.env.DQM_client_secret == undefined ? process.env.DQM_client_secret : process.env.DQM_client_secret;

        if (appSession.appSessionObj.dialogActionType == process.const.DA_Close || appSession.appSessionObj.dialogActionType == process.const.DA_Delegate) { //|| appSession.appSessionObj.dialogActionType == "Delegate"
            appSession.appSessionObj.publicKey = process.env.publicKey == undefined ? attributes.publicKey : process.env.publicKey;
            appSession.appSessionObj.apiKey = process.env.apiKey == undefined ? attributes.apiKey : process.env.apiKey;
            appSession.appSessionObj.apiValue = process.env.apiValue == undefined ? attributes.apiValue : process.env.apiValue;
            appSession.appSessionObj.keyStorePw = process.env.keyStorePw == undefined ? attributes.keyStorePw : process.env.keyStorePw;
            appSession.appSessionObj.trustStorePw = process.env.trustStorePw == undefined ? attributes.trustStorePw : process.env.trustStorePw;
            appSession.appSessionObj.rootCert = process.env.rootCert == undefined ? attributes.rootCert : process.env.rootCert;
            appSession.appSessionObj.xApiKey = process.env.xApiKey == undefined ? attributes.rootCert : process.env.xApiKey;
            appSession.appSessionObj.accessToken = process.env.accessToken == undefined ? attributes.rootCert : process.env.accessToken;
            appSession.appSessionObj.accessTokenGeneratedTimestamp = process.env.accessTokenGeneratedTimestamp == undefined ? attributes.rootCert : process.env.accessTokenGeneratedTimestamp;
            appSession.appSessionObj.accessTokenExpirationTimestamp = process.env.accessTokenExpirationTimestamp == undefined ? attributes.rootCert : process.env.accessTokenExpirationTimestamp; 
            appSession.appSessionObj.vXAPIKey = process.env.vXAPIKey == undefined ? attributes.rootCert : process.env.vXAPIKey;
            appSession.appSessionObj.DQM_client_id = process.env.DQM_client_id == undefined ? attributes.DQM_client_id.split("|").join("@") : process.env.DQM_client_id.split("|").join("@");
            appSession.appSessionObj.DQM_client_secret = process.env.DQM_client_secret == undefined ? attributes.DQM_client_secret : process.env.DQM_client_secret;
        }
        if ((appSession.authenticated == process.const.STR_False || appSession.authenticated == undefined ||
            appSession.authenticated == null || appSession.authenticated.length <= 0) && appSession.nextBot == "Authentication_Bot") {
            let CellPhoneNumberSlot = process.const.Slot_phoneNumber;
            appSession.appSessionObj[CellPhoneNumberSlot + "Count"] = undefined;
        }
        attributes.outputData = callPath.OutputData(appSession, cxiSession);
        attributes.appSession = attributes.appSession == undefined ? "" : appSession.attributes;
        attributes.cxiSession = attributes.cxiSession == undefined ? "" : cxiSession.attributes;
        attributes.ctiData = attributes.ctiData == undefined ? "" : ctiData.attributes;
        attributes.lastIntent = appSession.appSessionObj.lastIntent == undefined ? "MS100_MainServicesMenuu" : appSession.appSessionObj.lastIntent;
        attributes.nextAction = appSession.appSessionObj.nextAction == undefined ? "" : appSession.appSessionObj.nextAction;//For Repeat logic
        attributes.nextIntent = appSession.nextIntent == undefined ? "" : appSession.nextIntent;//For Repeat logic
        attributes.callPath = cxiSession.callPath == undefined ? "" : cxiSession.callPath;
        attributes.pegPath = cxiSession.pegPath == undefined ? "" : cxiSession.pegPath;
        attributes.callerGoal = appSession.callerGoal == undefined ? "" : appSession.callerGoal;
        attributes.callResult = cxiSession.callResult == undefined || cxiSession.callResult == "undefined" ? "CustHangup" : cxiSession.callResult;
        attributes.selfService = attributes.callResult == "CustHangup" ? "N" : appSession.selfService;
        attributes[process.const.STR_Audio_Start + process.const.STR_Asterisk + process.const.STR_Colon + process.const.STR_Asterisk] = appSession.audioStartTimeOut == undefined ? "6000" : appSession.audioStartTimeOut;
        attributes[process.const.STR_Audio_End + process.const.STR_Asterisk + process.const.STR_Colon + process.const.STR_Asterisk] = appSession.audioEndTimeOut == undefined ? "1200" : appSession.audioEndTimeOut;
        attributes[process.const.STR_Dtmf_End + process.const.STR_Asterisk + process.const.STR_Colon + process.const.STR_Asterisk] = appSession.dtmfTimeOut == undefined ? "600" : appSession.dtmfTimeOut;
        return attributes;
    } catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }

};

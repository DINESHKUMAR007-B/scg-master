const sessionHelper = require("./Helpers/Common/sessionHelper");
const fallback = require("./Helpers/Controller/fallbackController");
const logger = require("./Helpers/Utilities/logger");
const spanishActiveContexts = require("./Helpers/Common/spanishActiveContexts");
const spanishSlotActiveContexts = require("./Helpers/Common/spanishSlotActiveContexts");
const secretManager = require("./Helpers/Common/secretHelper");
const initialConfirmation = require("./Intents/Initial/MS200_InitialConfirmation");
const mainServicesMenu = require("./Intents/Initial/MS100_MainServicesMenu");
const yes = require("./Intents/Confirmation/MS201_Yes");
const no = require("./Intents/Confirmation/MS202_No");
const repeat = require("./Intents/Confirmation/MS203_Repeat");
const previous = require("./Intents/Confirmation/MS204_Previous");
const operator = require("./Intents/Common/MS206_Operator");
const dontHaveIt = require("./Intents/Common/MS209_DontHaveIt");
const startService = require("./Intents/MainServiceMenus/StartService/MS101_StartService");
const weblink = require("./Intents/MainServiceMenus/StartService/StartSMS/MS301_WebLink");
const newAddress = require("./Intents/MainServiceMenus/StartService/StartSMS/MS302_NewAddress");
const stopService = require("./Intents/MainServiceMenus/StopService/MS102_MoveStop");
const fumigationReconnect = require("./Intents/MainServiceMenus/FumigationReconnect/MS103_ReconnectOrFumigation");
const newConstructionService = require("./Intents/MainServiceMenus/NewConstructionService/MS104_NewConstructionService");
const checkChangeCancel = require("./Intents/MainServiceMenus/CheckChangeCancel/MS105_CheckChangeCancelService");
const otherMatters = require("./Intents/MainServiceMenus/OtherMatters/MS106_OtherMatters");
const moreOptions = require("./Intents/MainServiceMenus/MoreOptions/MS107_MoreOptions");
const customerType = require("./Intents/MainServiceMenus/StopService/CustomerType/MS413_CustomerType");
const removePhoneNumber = require("./Intents/MainServiceMenus/StopService/CustomerType/MS411_RemovePhoneNumber");
const cellPhoneNumber = require("./Intents/MainServiceMenus/GetCellPhonenumber/MS404_GetPhoneNumber");
const workPhoneExtNumber = require("./Intents/MainServiceMenus/GetWorkPhoneExtNumber/MS423_GetWorkPhoneExtNumber");
const fumigation = require("./Intents/MainServiceMenus/FumigationReconnect/FumigationMenus/MS500_Fumigation");
const reconnect = require("./Intents/MainServiceMenus/FumigationReconnect/FumigationMenus/MS501_Reconnect");
const forgiveness = require("./Intents/MainServiceMenus/FumigationReconnect/FumigationMenus/MS502_Forgiveness");
const restore = require("./Intents/MainServiceMenus/FumigationReconnect/FumigationMenus/MS504_Restore");
const details = require("./Intents/MainServiceMenus/FumigationReconnect/FumigationMenus/MS505_Details");
const reschedule = require("./Intents/MainServiceMenus/StopService/StopServiceExisting/MS405_Reschedule");
const cancel = require("./Intents/MainServiceMenus/StopService/StopServiceExisting/MS406_Cancel");
const sms = require("./Intents/MainServiceMenus/StopService/StopServiceExisting/MS407_SendSMS");
const stop = require("./Intents/MainServiceMenus/StopService/StopServiceMenus/MS400_StopService");
const move = require("./Intents/MainServiceMenus/StopService/StopServiceMenus/MS401_MoveTransfer");
const collectFullAddress = require("./Intents/MainServiceMenus/AddressCollection/MS420_FullAddress");
const stopServicePaperlessMail = require("./Intents/MainServiceMenus/StopService/StopServicePaperlessMail/MS417_StopServicePaperlessMail");
const stopServiceConfirmation = require("./Intents/MainServiceMenus/StopService/StopServicePaperlessMail/MS419_StopServiceConfirmation");
const stopServiceFinalBillAddress = require("./Intents/MainServiceMenus/StopService/StopServicePaperlessMail/MS418_StopServiceFinalBillAddress");
const currentAddress = require("./Intents/MainServiceMenus/StopService/StopServicePaperlessMail/MS408_CurrentAddress");
const changeAddress = require("./Intents/MainServiceMenus/StopService/StopServicePaperlessMail/MS409_ChangeAddress");
const mailingAddress = require("./Intents/MainServiceMenus/StopService/StopServicePaperlessMail/MS427_MailingAddress");
const stopServiceRoute = require("./Intents/MainServiceMenus/StopService/StopServiceRoute/MS414_StopServiceRoute");
const stopServEvalDatePg3 = require("./Intents/MainServiceMenus/StopService/StopServiceRoute/MS426_StopServEvalDate_Pg3");
const StopServiceNotEligible = require("./Intents/MainServiceMenus/StopService/StopServiceRoute/MS422_StopServiceNotEligible");
const StopServiceNotEligiblepg1 = require("./Intents/MainServiceMenus/StopService/StopServiceRoute/MS424_StopServiceNotEligiblepg1");
const hearDetails = require("./Intents/Common/MS205_HearDetails");
const bargeInNotAllowed = require("./Intents/Common/MS210_BargeInNotAllowed");
const payMyBill = require("./Intents/Common/MS410_PayMyBill");
const stopServDate = require("./Intents/MainServiceMenus/StopService/StopServiceDate/MS415_StopServDate");
const stopServPropOwner = require("./Intents/MainServiceMenus/StopService/StopServicePropOwner/MS416_StopServPropOwner");
const differentNumber = require("./Intents/MainServiceMenus/StartService/StartSMS/MS303_DifferentNumber");
const newCustomer = require("./Intents/MainServiceMenus/StartService/NewCustomer/MS300_NewCustomer");
const sameNumber = require("./Intents/MainServiceMenus/StopService/MoveSMS/MS402_SameNumber");
const continueStart = require("./Intents/MainServiceMenus/StopService/MoveSMS/MS403_Continue");
const mainMenu = require("./Intents/Common/MS108_MainMenu");
const dtmfHelper = require("./Helpers/Common/dtmfHelper");
const logData = require("./Helpers/Utilities/loggingData");
const dynamoDBHelper = require('./Helpers/Common/dynamoDBHelper');
let publicKey = null;
let secretCache = null;
let apiKey = null;
let apiValue = null;
let keyStorePw = null;
let trustStorePw = null;
let rootCert = null;
let secretName = null;
let region = null;
let xApiKey = null;
let accessToken = null;
let accessTokenGeneratedTimestamp = null;
let accessTokenExpirationTimestamp = null;
exports.handler = async (event, context) => {
    try {

        // Clean up Lex session attributes
        delete event.sessionState.sessionAttributes["x-amz-lex:audio:start-timeout-ms:*:*"];
        /*delete event.sessionState.sessionAttributes["x-amz-lex:dtmf:end-timeout-ms:*:*"];
        delete event.sessionState.sessionAttributes["x-amz-lex:start-silence-threshold-ms:*:*"];
        delete event.sessionState.sessionAttributes["x-amz-lex:end-silence-threshold-ms:*:*"];
        delete event.sessionState.sessionAttributes["x-amz-lex:allow-interrupt:*:*"];*/

        // Clear logs
        logData.Clear();
        logger.clear();

        // Wrap dispatch in a Promise
        const response = await new Promise((resolve, reject) => {
            dispatch(event, (res) => {
                try {
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            });
        });
        await dynamoDBHelper.putData(response);
        console.debug("loggingCallback ->" + JSON.stringify(response, null, 2));
        logger.debug(response);
        return response;
    } catch (err) {
        //console.error("Handler error:", err);
        logger.info("Handler error:" + err);
        throw err;
    }
};
async function dispatch(intentRequest, callback) {
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let ctiData = sessionHelper.CtiData;
    let inputJSON = JSON.parse(intentRequest.sessionState.sessionAttributes.inputData);
    appSession.attributes = intentRequest.sessionState.sessionAttributes.appSession;
    cxiSession.attributes = intentRequest.sessionState.sessionAttributes.cxiSession;
    ctiData.attributes = intentRequest.sessionState.sessionAttributes.ctiData;
    cxiSession.callPath = intentRequest.sessionState.sessionAttributes.callPath ?? '';
    // cxiSession.callPath = intentRequest.sessionState.sessionAttributes.callPath == undefined || intentRequest.sessionState.sessionAttributes.callPath == "null" ?
    //     "CustHangup" : intentRequest.sessionState.sessionAttributes.callPath;
    // cxiSession.exitReason = intentRequest.sessionState.sessionAttributes.exitReason == undefined || intentRequest.sessionState.sessionAttributes.exitReason == "null" ?
    //     "CustHangup" : intentRequest.sessionState.sessionAttributes.exitReason;
    cxiSession.pegPath = intentRequest.sessionState.sessionAttributes.pegPath == undefined || intentRequest.sessionState.sessionAttributes.pegPath == "null" ?
        "" : intentRequest.sessionState.sessionAttributes.pegPath;
    let env = inputJSON.env == undefined ?
        appSession["env"] : inputJSON.env;
    appSession["env"] = env;
    appSession.appSessionObj.moduleSpecialMessageDetails = inputJSON.moduleSpecialMessageDetails;
    secretName = process.env.secretName;
    region = process.env.region;
    //process.env = {};
    const envConfig = require("dotenv").config({ path: "./Helpers/Config/." + env });
    if (envConfig.parsed) {
        Object.assign(process.env, envConfig.parsed);
    }
    //process.env = envConfig.parsed;
    process.env.region = region;
    const promptConfig = require("dotenv").config({ path: "./Helpers/Config/.englishPrompt" });
    const SpanishPromptConfig = require("dotenv").config({ path: "./Helpers/Config/.spanishPrompt" });
    process.promptSession = intentRequest.bot.localeId == "es_US" ? SpanishPromptConfig.parsed : promptConfig.parsed;
    const constConfig = require("dotenv").config({ path: "./Helpers/Config/.const" });
    process.const = constConfig.parsed;
    process.env.secretName = secretName;
    if (appSession.appSessionObj.secretsRetrieved == "false" || appSession.appSessionObj.secretsRetrieved == "undefined" ||
        appSession.appSessionObj.secretsRetrieved == undefined ||
        (intentRequest.sessionState.sessionAttributes.publicKey == undefined && appSession.appSessionObj.secretsRetrieved == "false")) {
        let secret = await secretManager.getSecretValue(process.env.secretName, intentRequest, callback);
        //console.log("secret : ", secret);
        if (!secret) {
            console.info("Failed to  retrieved secret managers values");
        } else {
            console.info("SuccessFully retrieved secret managers values");
            appSession.appSessionObj.secretsRetrieved = "true";
            publicKey = secret.publicKey;
            apiKey = secret.apiKey;
            apiValue = secret.apiValue
            keyStorePw = secret.keyStorePw
            trustStorePw = secret.trustStorePw
            rootCert = secret.rootCert
            xApiKey = secret["X-API-KEY-MOCK"];
            accessToken = secret.accessToken;
            accessTokenGeneratedTimestamp = secret.accessTokenGeneratedTimestamp;
            accessTokenExpirationTimestamp = secret.accessTokenExpirationTimestamp;
            vXAPIKey = secret["X-API-KEY"];
            process.env.publicKey = publicKey;
            process.env.apiKey = apiKey;
            process.env.apiValue = apiValue;
            process.env.keyStorePw = keyStorePw;
            process.env.trustStorePw = trustStorePw;
            process.env.rootCert = rootCert;
            process.env.xApiKey = secret["X-API-KEY-MOCK"];
            process.env.accessToken = secret.accessToken;
            process.env.accessTokenGeneratedTimestamp = secret.accessTokenGeneratedTimestamp;
            process.env.accessTokenExpirationTimestamp = secret.accessTokenExpirationTimestamp;
            process.env.vXAPIKey = vXAPIKey;
            process.env.DQM_client_id = secret["DQM_client_id"];
            process.env.DQM_client_secret = secret["DQM_client_secret"];
        }
    } else {
        if (appSession.appSessionObj.dialogActionType == process.const.DA_Close || appSession.appSessionObj.dialogActionType == process.const.DA_Delegate) {
            process.env.publicKey = appSession.appSessionObj.publicKey;
            process.env.apiKey = appSession.appSessionObj.apiKey;
            process.env.apiValue = appSession.appSessionObj.apiValue;
            process.env.keyStorePw = appSession.appSessionObj.keyStorePw;
            process.env.trustStorePw = appSession.appSessionObj.trustStorePw;
            process.env.rootCert = appSession.appSessionObj.rootCert;
            process.env.xApiKey = appSession.appSessionObj.xApiKey;
            process.env.accessToken = appSession.appSessionObj.accessToken;
            process.env.accessTokenGeneratedTimestamp = appSession.appSessionObj.accessTokenGeneratedTimestamp;
            process.env.accessTokenExpirationTimestamp = appSession.appSessionObj.accessTokenExpirationTimestamp;
            process.env.vXAPIKey = appSession.appSessionObj.vXAPIKey;
            process.env.DQM_client_id = appSession.appSessionObj.DQM_client_id.split("@").join("|");
            process.env.DQM_client_secret = appSession.appSessionObj.DQM_client_secret;
            appSession.appSessionObj.publicKey = "";
            appSession.appSessionObj.apiKey = "";
            appSession.appSessionObj.apiValue = "";
            appSession.appSessionObj.rootCert = "";
            appSession.appSessionObj.trustStorePwAsString = "";
            appSession.appSessionObj.keyStorePwAsString = "";

        } else {
            process.env.publicKey = intentRequest.sessionState.sessionAttributes.publicKey;
            process.env.apiKey = intentRequest.sessionState.sessionAttributes.apiKey;
            process.env.apiValue = intentRequest.sessionState.sessionAttributes.apiValue;
            process.env.keyStorePw = intentRequest.sessionState.sessionAttributes.keyStorePw;
            process.env.trustStorePw = intentRequest.sessionState.sessionAttributes.trustStorePw;
            process.env.rootCert = intentRequest.sessionState.sessionAttributes.rootCert;
            process.env.xApiKey = intentRequest.sessionState.sessionAttributes.xApiKey;
            process.env.accessToken = intentRequest.sessionState.sessionAttributes.accessToken;
            process.env.accessTokenGeneratedTimestamp = intentRequest.sessionState.sessionAttributes.accessTokenGeneratedTimestamp;
            process.env.accessTokenExpirationTimestamp = intentRequest.sessionState.sessionAttributes.accessTokenExpirationTimestamp;
            process.env.vXAPIKey = intentRequest.sessionState.sessionAttributes.vXAPIKey;
            process.env.DQM_client_id = intentRequest.sessionState.sessionAttributes.DQM_client_id;
            process.env.DQM_client_secret = intentRequest.sessionState.sessionAttributes.DQM_client_secret;
        }
    }
    // console.log("DQM_client_id     : ", process.env.DQM_client_id);
    // console.log("DQM_client_secret : ", process.env.DQM_client_secret);

    process.const.STR_conversationID = appSession.conversationID;
    process.const.STR_participantID = appSession.participantID;
    process.const.STR_sessionId = intentRequest.sessionId;
    process.env.logLevel = appSession.logLevel;
    if (appSession["env"] == undefined || appSession["env"] == "undefined") {
        appSession["env"] = "PROD";
    }
    if (
        appSession["logLevel"] != null &&
        appSession["logLevel"] != undefined &&
        appSession["logLevel"] != ""
    ) {
        process.env.logLevel = appSession["logLevel"];

    }

    logger.debug(`event.bot.name=${intentRequest.bot.name}`);
    logger.debug((intentRequest));

    //logger.info("incoming events " + intentRequest);
    console.debug("incoming events " + JSON.stringify(intentRequest));
    let name = intentRequest.sessionState.intent.name;
    name = (intentRequest.bot.localeId == "es_US" && intentRequest.inputMode == "Speech" && appSession.dialogActionType == "ElicitIntent") ? spanishActiveContexts.SpanishActiveContexts(name, appSession, intentRequest) : name;
    name = (intentRequest.inputMode == "Text" && appSession.dialogActionType == "ElicitIntent") ? dtmfHelper.DtmfHelper(intentRequest, appSession) : name;
    name = (intentRequest.bot.localeId == "es_US" && intentRequest.inputMode == "Speech" && (appSession.appSessionObj.dialogActionType == "ElicitSlot" &&
        (appSession.nextIntent == "MS404_GetPhoneNumber" || appSession.nextIntent == "MS423_GetWorkPhoneExtNumber"))) ?
        spanishSlotActiveContexts.SpanishSlotActiveContexts(name, appSession, intentRequest, callback) : name;

    let inputTranscriptCheck = intentRequest.inputTranscript ?? '';
    if (inputTranscriptCheck != '' && cxiSession.cxiSessionObj.preDialogAction == "Close" && intentRequest.bot.localeId == "es_US") {
        appSession.appSessionObj.fallBackState = process.const.STR_True;
        name = "FallbackIntent";
        intentRequest.sessionState.intent.name = name;
    }

    logger.info("Intent Name : " + name);
    //logger.info("repeatIntent :" + appSession.appSessionObj.repeatIntent);
    //console.log("repeatIntent : ",appSession.appSessionObj.repeatIntent);
    appSession.appSessionObj.repeatIntent = name == "MS203_Repeat" ? appSession.appSessionObj.repeatIntent : name;
    //logger.info("repeatIntent :" + appSession.appSessionObj.repeatIntent);
    // console.log("repeatIntent : ",appSession.appSessionObj.repeatIntent);
    //-------------Start time CXI ------------
    cxiSession.cxiSessionObj.initialTime = new Date();
    cxiSession.intent = name;
    cxiSession.O_ExitPoint = name;
    //----------------------cxi-------------//
    cxiSession.cxiSessionObj.localeId = intentRequest.bot.localeId;
    cxiSession.cxiSessionObj.prePromptid = cxiSession.cxiSessionObj.promptid;
    //----------------------cxi-------------//

    appSession.appSessionObj.currentDate = new Date().toLocaleString('en-CA', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replaceAll('/', '-');
    //console.log("Current Date-->",appSession.appSessionObj.currentDate);
    //appSession.appSessionObj.currentDate = new Date().toISOString().split('T')[0];


    appSession.appSessionObj.overRideCurrentDate = appSession.appSessionObj.overRideCurrentDate == "undefined" || appSession.appSessionObj.overRideCurrentDate == undefined || appSession.appSessionObj.overRideCurrentDate == null || appSession.appSessionObj.overRideCurrentDate == "null" || appSession.appSessionObj.overRideCurrentDate == "" ? "" : appSession.appSessionObj.overRideCurrentDate;
    appSession.appSessionObj.currentDate = appSession.appSessionObj.overRideCurrentDate == "" ? appSession.appSessionObj.currentDate : appSession.appSessionObj.overRideCurrentDate;

    switch (name) {
        case process.const.MS100:
            return mainServicesMenu.MainServicesMenu(intentRequest, callback);
        case process.const.MS101:
            return startService.StartService(intentRequest, callback);
        case process.const.MS300:
            return newCustomer.NewCustomer(intentRequest, callback);
        case process.const.MS301:
            return weblink.WebLink(intentRequest, callback);
        case process.const.MS302:
            return newAddress.NewAddress(intentRequest, callback);
        case process.const.MS102:
            return stopService.StopService(intentRequest, callback);
        case process.const.MS103:
            return fumigationReconnect.FumigationReconnect(intentRequest, callback);
        case process.const.MS104:
            return newConstructionService.NewConstructionService(intentRequest, callback);
        case process.const.MS105:
            return checkChangeCancel.CheckChangeCancel(intentRequest, callback);
        case process.const.MS106:
            return otherMatters.OtherMatters(intentRequest, callback);
        case process.const.MS107:
            return moreOptions.MoreOptions(intentRequest, callback);
        case process.const.MS108:
            return mainMenu.MainMenu(intentRequest, callback);
        case process.const.MS200:
            return initialConfirmation.InitialConfirmation(intentRequest, callback);
        case process.const.MS201:
            return yes.Yes(intentRequest, callback);
        case process.const.MS202:
            return no.No(intentRequest, callback);
        case process.const.MS203:
            return repeat.Repeat(intentRequest, callback);
        case process.const.MS204:
            return previous.Previous(intentRequest, callback);
        case process.const.MS205:
            return hearDetails.HearDetails(intentRequest, callback);
        case process.const.MS206:
            return operator.Operator(intentRequest, callback);
        case process.const.MS209:
            return dontHaveIt.DontHaveIt(intentRequest, callback);
        case process.const.MS210:
            return bargeInNotAllowed.BargeInNotAllowed(intentRequest, callback);
        case process.const.MS410:
            return payMyBill.PayMyBill(intentRequest, callback);
        case process.const.MS303:
            return differentNumber.DifferentNumber(intentRequest, callback);
        case process.const.MS400:
            return stop.StopService(intentRequest, callback);
        case process.const.MS401:
            return move.MoveService(intentRequest, callback);
        case process.const.MS402:
            return sameNumber.SameNumber(intentRequest, callback);
        case process.const.MS403:
            return continueStart.Continue(intentRequest, callback);
        case process.const.MS404:
            return cellPhoneNumber.CellPhoneNumber(intentRequest, callback);
        case process.const.MS405:
            return reschedule.Reschedule(intentRequest, callback);
        case process.const.MS406:
            return cancel.Cancel(intentRequest, callback);
        case process.const.MS407:
            return sms.SendSMS(intentRequest, callback);
        case process.const.MS408:
            return currentAddress.CurrentAddress(intentRequest, callback);
        case process.const.MS409:
            return changeAddress.ChangeAddress(intentRequest, callback);
        case process.const.MS427:
            return mailingAddress.MailingAddress(intentRequest, callback);
        case process.const.MS411:
            return removePhoneNumber.RemovePhoneNumber(intentRequest, callback);
        case process.const.MS413:
            return customerType.CustomerType(intentRequest, callback);
        case process.const.MS414:
            return stopServiceRoute.StopService(intentRequest, callback);
        case process.const.MS426:
            return stopServEvalDatePg3.StopServicePg3(intentRequest, callback);
        case process.const.MS415:
            return stopServDate.stopServDate(intentRequest, callback);
        case process.const.MS416:
            return stopServPropOwner.StopServPropOwner(intentRequest, callback);
        case process.const.MS417:
            return stopServicePaperlessMail.StopServicePaperlessMail(intentRequest, callback);
        case process.const.MS418:
            return stopServiceFinalBillAddress.StopServiceFinalBillAddress(intentRequest, callback);
        case process.const.MS419:
            return stopServiceConfirmation.StopServiceConfirmation(intentRequest, callback);
        case process.const.MS420:
            return collectFullAddress.CollectFullAddress(intentRequest, callback);
        case process.const.MS422:
            return StopServiceNotEligible.StopServiceNotEligible(intentRequest, callback);
        case process.const.MS423:
            return workPhoneExtNumber.WorkPhoneExtNumber(intentRequest, callback);
        case process.const.MS424:
            return StopServiceNotEligiblepg1.StopServiceNotEligiblepg1(intentRequest, callback);
        case process.const.MS500:
            return fumigation.Fumigation(intentRequest, callback);
        case process.const.MS501:
            return reconnect.Reconnect(intentRequest, callback);
        case process.const.MS502:
            return forgiveness.Forgiveness(intentRequest, callback);
        case process.const.MS504:
            return restore.Restore(intentRequest, callback);
        case process.const.MS505:
            return details.Details(intentRequest, callback);

        default:
            appSession.appSessionObj.repeatIntentSw = appSession.appSessionObj.repeatIntentSw == process.const.STR_True && appSession.dialogActionType == "Delegate" ? process.const.STR_True : process.const.STR_False;
            appSession.fallBackCounter = appSession.fallBackCounter == undefined || appSession.fallBackCounter == "undefined" ?
                0 : appSession.nextStateName == process.const.NS_StopServiceFinalAnythingElse ? 2 : appSession.fallBackCounter;

            appSession.fallBack = process.const.STR_True;
            return await fallback.Fallback(
                intentRequest,
                callback
            );
    }
}

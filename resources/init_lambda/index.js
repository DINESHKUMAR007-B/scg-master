const sessionHelper = require("./Helpers/Common/sessionHelper");
const fallback = require("./Helpers/Controller/fallbackController");
const logger = require("./Helpers/Utilities/logger");
const phoneNumber = require("./Intents/GetPhoneNumber/AU101_PhoneNumber");
const accountNumber = require("./Intents/GetAccountNumber/AU103_AccountNumber");
const streetNumber = require("./Intents/GetStreetNumber/AU102_StreetNumber");
const cellPhoneCollection = require("./Intents/Common/AU300_CellPhoneCollection");
const postIdentification = require("./Intents/Common/AU104_PostIdentification");
const newCustomer = require("./Intents/Common/AU105_NewCustomer");
const mainMenu = require("./Intents/Common/AU106_MainMenu");
const holdOn = require("./Intents/Common/AU107_HoldOn");
const emergency = require("./Intents/Common/AU108_Emergency");
const initialConfirmation = require("./Intents/Initial/AU200_InitialConfirmation");
const initialIdentification = require("./Intents/Initial/AU100_InitialIdentification");
const yes = require("./Intents/Confirmation/AU201_Yes");
const no = require("./Intents/Confirmation/AU202_No");
const repeat = require("./Intents/Confirmation/AU203_Repeat");
const dontHaveIt = require("./Intents/Confirmation/AU205_DontHaveIt");
const spanishActiveContexts = require("./Helpers/Common/spanishActiveContexts");
const spanishSlotActiveContexts = require("./Helpers/Common/spanishSlotActiveContexts");
const dtmfHelper = require("./Helpers/Common/dtmfHelper");
const secretManager = require("./Helpers/Common/secretHelper");
const logData = require("./Helpers/Utilities/loggingData");
let publicKey = null;
let secretCache = null;
let apiKey = null;
let apiValue = null;
let keyStorePw = null;
let trustStorePw = null;
let rootCert = null;
let secretName = null;
let region = null;
let xApiKey=null;
let accessToken=null;
let accessTokenGeneratedTimestamp=null;
let accessTokenExpirationTimestamp = null;
let vXAPIKey=null;

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
        //await dynamoDBHelper.putData(response);
        console.debug("loggingCallback ->" + JSON.stringify(response, null, 2));
        logger.debug(response);
        return response;
    } catch (err) {
        console.error("Handler error:", err);
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
    /*cxiSession.callPath = intentRequest.sessionState.sessionAttributes.callPath == undefined || intentRequest.sessionState.sessionAttributes.callPath == "null" ?
        "CustHangup" : intentRequest.sessionState.sessionAttributes.callPath;
    cxiSession.exitReason = intentRequest.sessionState.sessionAttributes.exitReason == undefined || intentRequest.sessionState.sessionAttributes.exitReason == "null" ?
        "CustHangup" : intentRequest.sessionState.sessionAttributes.exitReason;*/
    let env = inputJSON.env == undefined ?
        appSession["env"] : inputJSON.env;
        cxiSession.callPath = intentRequest.sessionState.sessionAttributes.callPath?? "";
cxiSession.pegPath = intentRequest.sessionState.sessionAttributes.pegPath == undefined || intentRequest.sessionState.sessionAttributes.pegPath == "null" ?
        "" : intentRequest.sessionState.sessionAttributes.pegPath;
    appSession["env"] = env;
    cxiSession.cxiSessionObj.initialTime = new Date();
    secretName = process.env.secretName;
    region = process.env.region;
    //process.env = {};
    const envConfig = require("dotenv").config({ path: "./Helpers/Config/." + env });
    if (envConfig.parsed) {
        Object.assign(process.env, envConfig.parsed);
    }
    //process.env = envConfig.parsed;
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
        if (!secret) {
            console.info("Failed to  retrieved secret managers values");
        } else {
            console.info(secret);
            appSession.appSessionObj.secretsRetrieved = "true";
            publicKey = secret.publicKey;
            apiKey = secret.apiKey;
            apiValue = secret.apiValue
            keyStorePw = secret.keyStorePw
            trustStorePw = secret.trustStorePw
            rootCert = secret.rootCert
            xApiKey  = secret["X-API-KEY-MOCK"]; 
            accessToken  = secret.accessToken;
            accessTokenGeneratedTimestamp  = secret.accessTokenGeneratedTimestamp;
            accessTokenExpirationTimestamp = secret.accessTokenExpirationTimestamp;
            vXAPIKey  = secret["X-API-KEY"];
            process.env.publicKey = publicKey;
            process.env.apiKey = apiKey;
            process.env.apiValue = apiValue;
            process.env.keyStorePw = keyStorePw;
            process.env.trustStorePw = trustStorePw;
            process.env.rootCert = rootCert;
            process.env.xApiKey  = secret["X-API-KEY-MOCK"]; 
            process.env.accessToken  = secret.accessToken;
            process.env.accessTokenGeneratedTimestamp  = secret.accessTokenGeneratedTimestamp;
            process.env.accessTokenExpirationTimestamp = secret.accessTokenExpirationTimestamp;
            process.env.vXAPIKey  = vXAPIKey;
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
            process.env.accessToken=appSession.appSessionObj.accessToken;
            process.env.accessTokenGeneratedTimestamp=appSession.appSessionObj.accessTokenGeneratedTimestamp;
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
            process.env.xApiKey =intentRequest.sessionState.sessionAttributes.xApiKey;
            process.env.accessToken=intentRequest.sessionState.sessionAttributes.accessToken;
            process.env.accessTokenGeneratedTimestamp=intentRequest.sessionState.sessionAttributes.accessTokenGeneratedTimestamp;
            process.env.accessTokenExpirationTimestamp = intentRequest.sessionState.sessionAttributes.accessTokenExpirationTimestamp;
            process.env.vXAPIKey = intentRequest.sessionState.sessionAttributes.vXAPIKey;
            process.env.DQM_client_id = intentRequest.sessionState.sessionAttributes.DQM_client_id;
            process.env.DQM_client_secret = intentRequest.sessionState.sessionAttributes.DQM_client_secret;
        }
    }
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

    //logger.debug(`event.bot.name=${intentRequest.bot.name}`);
    logger.debug((intentRequest));
    console.debug("incoming events " + JSON.stringify(intentRequest));
    let name = intentRequest.sessionState.intent.name;
    name = (intentRequest.bot.localeId == "es_US" && intentRequest.inputMode == "Speech" && (appSession.appSessionObj.dialogActionType == "ElicitIntent")) ? spanishActiveContexts.SpanishActiveContexts(name, appSession,intentRequest) : name;
    name = (/*intentRequest.bot.localeId == "es_US" && */intentRequest.inputMode == "Text" && appSession.appSessionObj.dialogActionType == "ElicitIntent") ? dtmfHelper.DtmfHelper(intentRequest, appSession) : name;
    name = (intentRequest.bot.localeId == "es_US" && intentRequest.inputMode == "Speech" && (appSession.appSessionObj.dialogActionType == "ElicitSlot" &&
        (appSession.nextIntent == "AU103_AccountNumber" || appSession.nextIntent == "AU102_StreetNumber" || appSession.nextIntent == "AU101_PhoneNumber"))) ?
        spanishSlotActiveContexts.SpanishSlotActiveContexts(name, appSession, intentRequest, callback) : name;
    cxiSession.cxiSessionObj.localeId = intentRequest.bot.localeId;
    cxiSession.cxiSessionObj.prePromptid = cxiSession.cxiSessionObj.promptid;
    let inputTranscriptCheck = intentRequest.inputTranscript ?? '';
    if(inputTranscriptCheck != ''&&cxiSession.cxiSessionObj.preDialogAction == "Close"&&intentRequest.bot.localeId == "es_US"){
        appSession.appSessionObj.fallBackState = process.const.STR_True;
        name = "FallbackIntent";
        intentRequest.sessionState.intent.name = name;
    }
    logger.info("Intent Name : " + name);
    switch (name) {
        case process.const.AU100:
            return initialIdentification.InitialIdentification(intentRequest, callback);
        case process.const.AU101:
            return phoneNumber.PhoneNumber(intentRequest, callback);
        case process.const.AU102:
            return streetNumber.StreetNumber(intentRequest, callback);
        case process.const.AU104:
            return postIdentification.PostIdentification(intentRequest, callback);
        case process.const.AU103:
            return accountNumber.AccountNumber(intentRequest, callback);
        case process.const.AU105:
            return newCustomer.NewCustomer(intentRequest, callback);
        case process.const.AU106:
            return mainMenu.MainMenu(intentRequest, callback);
        case process.const.AU107:
            return holdOn.HoldOn(intentRequest, callback);
        case process.const.AU108:
            return emergency.Emergency(intentRequest, callback);
        case process.const.AU200:
            return initialConfirmation.InitialConfirmation(intentRequest, callback);
        case process.const.AU201:
            return yes.Yes(intentRequest, callback);
        case process.const.AU202:
            return no.No(intentRequest, callback);
        case process.const.AU203:
            return repeat.Repeat(intentRequest, callback);
        case process.const.AU205:
            return dontHaveIt.DontHaveIt(intentRequest, callback);
        case process.const.AU300:
            return cellPhoneCollection.CellPhoneCollection(intentRequest, callback);
        default:
            appSession.fallBackCounter = appSession.fallBackCounter == undefined || appSession.fallBackCounter == "undefined" ?
                0 : appSession.fallBackCounter;
            appSession.fallBack = process.const.STR_True;
            return await fallback.Fallback(
                intentRequest,
                callback
            );
    }
}

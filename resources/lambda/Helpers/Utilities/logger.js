const { PointelLogger } = require('pointel-logger/pointelLogger');


const sensitiveFields = [
    "$.inputTranscript",
    "$.transcriptions..transcription", //all elements with "transcription" under transcriptions
    "$..appSession",
    "$..publicKey",
    "$..apiKey",
    "$..apiValue",
    "$..keyStorePw",
    "$..rootCert",
    "$..trustStorePw",
    "$.transcriptions..rawTranscription",
    "$..screenPopData",
    "$..ctiData",
    "$..streetNumber",
    "$..phoneNumber",
    "$..accountNumber",
    "$..value",
    "$..links",
    "$..content",
    "$..contentType",
    "$.url",
    "$.ani",
    "$..getSensitefields",
    "$..DQM_client_id",
    "$..DQM_client_secret",
    //"$..accessTokenGeneratedTimestamp",
    "$..vXAPIKey",
    "$..xApiKey",
    "$.rawInputTranscript",
    "$.intent..inputTranscript",
    "$..cxiSession",
    "$..outputData"
];


function getInstance() {
    if (this.logger == null)
        this.logger = new PointelLogger(process.env.publicKey, process.const.STR_conversationID, process.const.STR_sessionId,
            process.env.logLevel, sensitiveFields);
    return this.logger;
}

function clear() {
    this.logger = null;
}

let info = function(message = null) {

    try {
        this.getInstance().log("info",message);
    } catch (err) {
        console.error("error", "Exception Occur: " + err);
        return false;
    }
};

let debug = function(message = null) {
    try {
        this.getInstance().log("debug", message);

    } catch (err) {
        console.error("error", "Exception Occur: " + err);
        return false;
    }
};

let warn = function(message = null) {
    try {
        this.getInstance().log("warn", message);

    } catch (err) {
        console.error("error", "Exception Occur: " + err);
        return false;
    }
};

let error = function(message = null) {
    try {

        this.getInstance().log("error", message);

    } catch (err) {
        console.error("error", "Exception Occur: " + err);
        return false;
    }
};

let lexCallback = function(response, originalCallback) {

    try {
        console.debug("loggingCallback ->" + JSON.stringify(response, null, 2));
        this.getInstance().log("debug", response); 
        originalCallback(null, response);
    } catch (err) {
        console.error("error", "Exception Occur: " + err);
        return false;
    }

};

module.exports = {
    info,
    error,
    debug,
    warn,
    lexCallback,
    getInstance,
    clear
};
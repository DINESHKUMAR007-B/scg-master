const logger = require("../Utilities/logger");
const callPath = require("./callPathHelper");
const sessionHelper = require("./sessionHelper");
let cxiSession = sessionHelper.CxiSession;
const ConvertSSML = function (sentence, prosodyRate = 100) {
        //-----------cxipromptid--------------
        if(cxiSession.cxiSessionObj.promptIdFlag == "Y"){
            if(cxiSession.cxiSessionObj.localeId == "es_US"){
                if(callPath.getPromptSession(sentence.replace(/Todavia no entendi eso <break time = "0\.2s"\/>|no entendí eso <break time = "0\.2s"\/>/gi, ''))!=null){
                    cxiSession.cxiSessionObj.promptid = callPath.getPromptSession(sentence.replace(/Todavia no entendi eso <break time = "0\.2s"\/>|no entendí eso <break time = "0\.2s"\/>/gi, ''));
        
                }
            }else if(cxiSession.cxiSessionObj.localeId == "en_US"){
                if(callPath.getPromptSession(sentence.replace(/I Still didn’t get that <break time = "0\.2s"\/>|I didn’t get that <break time = "0\.2s"\/>/gi, ''))!=null){
                    cxiSession.cxiSessionObj.promptid = callPath.getPromptSession(sentence.replace(/I Still didn’t get that <break time = "0\.2s"\/>|I didn’t get that <break time = "0\.2s"\/>/gi, ''));
        
                }
            }
            
        
        }
        delete(cxiSession.cxiSessionObj.promptIdFlag);
    
    //-----------------------------------

    let result = " ";
    try {
        result = '<prosody volume="soft"> <prosody rate="' + prosodyRate + '%">' + sentence + '</prosody></prosody>';
        return result;
    }
    catch (error) {
        logger.error("Expection: " + error);
        return result;
    }
};
module.exports = {
    ConvertSSML
};
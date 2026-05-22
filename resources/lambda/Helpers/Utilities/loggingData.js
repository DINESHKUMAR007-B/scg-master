var sessionHelper = require("../Common/sessionHelper");
var logger = require("../Utilities/logger");
var apicall = require('../Common/apiHelper');
//var response = require("../../Helpers/Utilities/getAPIResponse");
//var rsa = require("../Common/rsa");
var catchHelper = require("../Common/catchHelper");


function GetJSONTemplate() {
    return {
        "purpose" : "CXI", 
        "conversationId": "",
        "participantId": "",
        "sessionId": "",
        "botName": "",
        "botAlias": "",
        "intent": {
            "name": "",
            "startTime": "",
            "endTime": "",
            "inputMode": "",
            "inputTranscript": "",
            "invocationSource": "",
            "nluConfidence": 0,
            "turnCount": 0,
            "state": "",
            "stateDetails": [{
                "dateTime": "",
                "name": "",
                "type": "",
                "result": "",
                "dialogAction": "",
                "content": "",
                "nextStateName": "",
                "attributes": {},
                "slots": [{
                    "name": "",
                    "type": "",
                    "elicitationStyle": "",
                    "inputMode": "",
                    "value": "",
                    "noInputCount": 0,
                    "noMatchCount": 0
                }],
                "apiDetails": [{
                    "id": "",
                    "name": "",
                    "requestId": "", //--no needed
                    "statusCode": 0,
                    "result": "",
                    "errorMessage": ""
                }]
            }],
            "routeMapping": "",
            "nextStateName": "",
            "nextIntent": "",
            "exitReason": "",
            "exitPoint": "",
            "transfer": ""
        },
        "attributesCTIData": {
            "policyType": "",
            "ANI": ""
        }
    };
}


function GetLogTemplate() {
    if (this.logData == null)
        this.logData = this.GetJSONTemplate();

    return this.logData;
}

const Clear = async function () {
    this.logData = null;
}; 

const UpdateLogData = function(intentRequest,DialogActionType, messages) {
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let ctiData = sessionHelper.CtiData; 
    let cxiarrayObj = sessionHelper.cxidetailArr;
    
    appSession.appSessionObj.attr_IVAFlowExitReason = appSession.appSessionObj.cxiAgentReq == "true"? "Agent Request":appSession.appSessionObj.recogFail == process.const.STR_True?"Max Attempts":cxiSession.cxiSessionObj.exitType == process.const.Cxi_BE_Failure?"App Error":appSession.appSessionObj.dbFail == process.const.STR_True?"DB Failure_"+appSession.appSessionObj.webServiceId:appSession.transfer == process.const.STR_True?"Transfer By Design":"UNKNOWN";
    cxiSession.cxiSessionObj.attr_LexBotExitReason = appSession.appSessionObj.cxiAgentReq == "true"? "Agent Request":appSession.appSessionObj.recogFail == process.const.STR_True?"Max Attempts":cxiSession.cxiSessionObj.exitType == process.const.Cxi_BE_Failure?"App Error":appSession.appSessionObj.dbFail == process.const.STR_True?"DB Failure_"+appSession.appSessionObj.webServiceId:appSession.transfer == process.const.STR_True?"Transfer By Design":"UNKNOWN";
    appSession.appSessionObj.attr_IVAFlowExitReason = appSession.disconnect == process.const.STR_True?appSession.appSessionObj.recogFail == process.const.STR_True|| appSession.appSessionObj.dbFail == process.const.STR_True?appSession.appSessionObj.attr_IVAFlowExitReason:"Disconnect By Design":appSession.appSessionObj.attr_IVAFlowExitReason;
    cxiSession.cxiSessionObj.attr_LexBotExitReason = appSession.disconnect == process.const.STR_True?appSession.appSessionObj.recogFail == process.const.STR_True|| appSession.appSessionObj.dbFail == process.const.STR_True?appSession.appSessionObj.attr_LexBotExitReason:"Disconnect By Design":appSession.appSessionObj.attr_LexBotExitReason;
    appSession.fallBackCounter = intentRequest.sessionState.intent.name != "FallbackIntent" && appSession.fallBackCounter == process.const.Dynamic_FallbackCounter? 0 : appSession.fallBackCounter;

    let loggerInfo = this.GetLogTemplate();
    loggerInfo.attributesCTIData = ctiData != undefined ? UpdateCTIAttributesData(ctiData):{};
    loggerInfo.conversationId =  process.const.STR_conversationID != undefined ? process.const.STR_conversationID : ' ';
    loggerInfo.participantId = process.const.STR_participantID != undefined ? process.const.STR_participantID : ' ' ;
    loggerInfo.sessionId =  process.const.STR_sessionId != undefined ? process.const.STR_sessionId : ' ' ;
    loggerInfo.botName = intentRequest.bot.name != undefined ?intentRequest.bot.name  :' ';
    loggerInfo.botAlias = intentRequest.bot.aliasName != undefined ? intentRequest.bot.aliasName :' ';
    
    loggerInfo.intent = this.UpdateIntentData(loggerInfo,intentRequest, appSession, cxiSession, DialogActionType, messages);
    

    return loggerInfo;
};


const UpdateCTIAttributesData = function(ctiData) {
    let attributesDataObj = {};
    attributesDataObj = ctiData.ctiDataObj;
    return attributesDataObj;
};


const UpdateAttributesData = function (appSession,cxiSession,intentRequest) {
    let attributesDataObj = {};
    attributesDataObj.appSession = appSession.attributes;
    attributesDataObj.attr_SelfServicePath = appSession.appSessionObj.attr_selfServicePath == undefined ? "UNKNOWN" : appSession.appSessionObj.attr_selfServicePath.replace(/~/g, "|").slice(0, -1);
    attributesDataObj.attr_SelfServiceCount = appSession.appSessionObj.ivrDescriptionCount == undefined ? "0" : appSession.appSessionObj.ivrDescriptionCount;
    attributesDataObj.attr_FinalSelfServiceDisposition = appSession.appSessionObj.attr_finalSelfServiceDisposition == undefined ? "UNKNOWN" : appSession.appSessionObj.attr_finalSelfServiceDisposition;
    attributesDataObj.attr_SelfServicedIntent = appSession.appSessionObj.attr_SelfServicedIntent== undefined ? "UNKNOWN":appSession.appSessionObj.attr_SelfServicedIntent.replace(/-/g, "_").replace(/,/g, "|").slice(0, -1);
    attributesDataObj.attr_FinalCallPath = cxiSession.cxiSessionObj.finalCallPath == undefined ? "UNKNOWN" : cxiSession.cxiSessionObj.finalCallPath;
    attributesDataObj.attr_FinalPegPath = cxiSession.cxiSessionObj.finalPegPath == undefined ? "UNKNOWN" : cxiSession.cxiSessionObj.finalPegPath;
    attributesDataObj.ivaPegPath = cxiSession.pegPath == undefined ? "UNKNOWN" : cxiSession.pegPath;

    attributesDataObj.attr_Authenticated = appSession.appSessionObj.authenticated == undefined ? process.const.STR_False : appSession.appSessionObj.authenticated;
    attributesDataObj.attr_CallerType = appSession.appSessionObj.customerTypeCode == undefined || appSession.appSessionObj.customerTypeCode == ""? "IC" : appSession.appSessionObj.customerTypeCode;
    attributesDataObj.attr_SelfService = appSession.selfService == undefined ? "N" : appSession.selfService;
    attributesDataObj.attr_AuthenticationType = appSession.appSessionObj.authMethod == undefined ? "UNKNOWN" : appSession.appSessionObj.authMethod;
    attributesDataObj.attr_CallerGoal = appSession.callerGoal == undefined ? "UNKNOWN" : appSession.callerGoal;
    attributesDataObj.ivr_disposition_desc_1 = appSession.appSessionObj.ivrDispositionDesc1 == undefined ? "UNKNOWN" : appSession.appSessionObj.ivrDispositionDesc1;
    attributesDataObj.ivr_disposition_desc_2 = appSession.appSessionObj.ivrDispositionDesc2 == undefined ? "UNKNOWN" : appSession.appSessionObj.ivrDispositionDesc2;
    attributesDataObj.ivr_disposition_desc_3 = appSession.appSessionObj.ivrDispositionDesc3 == undefined ? "UNKNOWN" : appSession.appSessionObj.ivrDispositionDesc3;
    attributesDataObj.exitReason = appSession.transfer == process.const.STR_True || appSession.disconnect == process.const.STR_True ?cxiSession.exitReason == "CustHangup" ? "UNKNOWN" : cxiSession.exitReason :cxiSession.exitReason == "CustHangup"?"UNKNOWN": cxiSession.exitReason;
    attributesDataObj.attr_IVAFlowExitReason = cxiSession.cxiSessionObj.attr_LexBotExitReason != undefined ? cxiSession.cxiSessionObj.attr_LexBotExitReason : 'UNKNOWN';
    attributesDataObj.attr_ExitPoint = cxiSession.cxiSessionObj.exitPoint != undefined ? cxiSession.cxiSessionObj.exitPoint : 'UNKNOWN';
    attributesDataObj.attr_Intent = intentRequest.sessionState.intent.name;
    attributesDataObj.resp_account_id = cxiSession.cxiSessionObj.respAccountId == undefined ? "UNKNOWN" : cxiSession.cxiSessionObj.respAccountId;
    attributesDataObj.attr_CHOffered = appSession.appSessionObj.callHistoryOffered == undefined ? "N" : appSession.appSessionObj.callHistoryOffered=="true"?"Y":"N";
    attributesDataObj.attr_CHSelfService = appSession.appSessionObj.callHistoryOffered == undefined || appSession.appSessionObj.callHistoryOffered=="false"?"UNKNOWN":appSession.appSessionObj.callHistoryMenuOption == process.const.STR_True ? "N" : "Y";
    attributesDataObj.attr_CHLastIntent = appSession.appSessionObj.finalIntent == undefined ? "UNKNOWN" : appSession.appSessionObj.finalIntent;
    attributesDataObj.attr_CHCallerGoal = appSession.appSessionObj.callerHistoryCallerGoal == undefined ? "UNKNOWN" : appSession.appSessionObj.callerHistoryCallerGoal;
    attributesDataObj.attr_TailoredTreatment = appSession.appSessionObj.ttOffered == process.const.STR_True ? "Y" : "N";
    attributesDataObj.attr_TailoredTreatmentFlow = appSession.appSessionObj.ttOfferedPrompt == undefined ? "UNKNOWN" : appSession.appSessionObj.ttOfferedPrompt;
    
    return attributesDataObj;
};   



const UpdateIntentData = function(loggerInfo,intentRequest, appSession, cxiSession, DialogActionType, messages) {
    let intentDataObj = loggerInfo.intent;
    intentDataObj.name = intentRequest.sessionState.intent.name;
    intentDataObj.startTime = cxiSession.cxiSessionObj.initialTime != undefined ? cxiSession.cxiSessionObj.initialTime :' ';
    intentDataObj.endTime = new Date();
    // intentDataObj.inputMode = intentRequest.inputMode;
    // intentDataObj.inputTranscript = intentRequest.inputTranscript ?? '';
    if((cxiSession.cxiSessionObj.preDialogAction=="ElicitIntent"||cxiSession.cxiSessionObj.preDialogAction=="ElicitSlot"||cxiSession.cxiSessionObj.preDialogAction=="ElicitIntentActiveContext"||cxiSession.cxiSessionObj.preDialogAction=="SwitchToIntentSlot")&&
    (DialogActionType=="ElicitIntent"||DialogActionType=="ElicitSlot"||DialogActionType=="ElicitIntentActiveContext"||DialogActionType=="SwitchToIntentSlot")){
        intentDataObj.previousMenuId = cxiSession.cxiSessionObj.prePromptid;
    }else{
        intentDataObj.previousMenuId = cxiSession.cxiSessionObj.preDialogAction=="ElicitIntent"||cxiSession.cxiSessionObj.preDialogAction=="ElicitSlot"||cxiSession.cxiSessionObj.preDialogAction=="ElicitIntentActiveContext"||cxiSession.cxiSessionObj.preDialogAction=="SwitchToIntentSlot"?cxiSession.cxiSessionObj.promptid:appSession.fallBackCounter==3?cxiSession.cxiSessionObj.promptid:"";
    }
    intentDataObj.inputMode = cxiSession.cxiSessionObj.preDialogAction=="ElicitIntent"||cxiSession.cxiSessionObj.preDialogAction=="ElicitSlot"||cxiSession.cxiSessionObj.preDialogAction=="ElicitIntentActiveContext"||cxiSession.cxiSessionObj.preDialogAction=="SwitchToIntentSlot"?intentRequest.inputMode :"";
    intentDataObj.inputTranscript = cxiSession.cxiSessionObj.preDialogAction=="ElicitIntent"||cxiSession.cxiSessionObj.preDialogAction=="ElicitSlot"||cxiSession.cxiSessionObj.preDialogAction=="ElicitIntentActiveContext"||cxiSession.cxiSessionObj.preDialogAction=="SwitchToIntentSlot"?intentRequest.inputTranscript ?? '':"";
    cxiSession.cxiSessionObj.preDialogAction = DialogActionType;

    intentDataObj.invocationSource = intentRequest.invocationSource;
    intentDataObj.nluConfidence = this.GetConfidenceScore(intentRequest);
    intentDataObj.turnCount = appSession.fallBackCounter!= undefined||appSession.fallBackCounter!=null ?parseInt(appSession.fallBackCounter,10):'';
    intentDataObj.state = intentRequest.sessionState.intent.state;
    intentDataObj.routeMapping = cxiSession.cxiSessionObj.routeMapping != undefined ? cxiSession.cxiSessionObj.routeMapping : '';
    intentDataObj.nextStateName = appSession.nextStateName != undefined ? appSession.nextStateName : '';
    intentDataObj.nextIntent = intentRequest.sessionState.sessionAttributes.nextIntent !=undefined ? intentRequest.sessionState.sessionAttributes.nextIntent : '' ;
    // Exit Reasons - BE Failure, IVR Transfer, Transfer by Design, App Hung Up
    //intentDataObj.exitReason = cxiSession.cxiSessionObj.exitReason != undefined ? cxiSession.cxiSessionObj.exitReason : '';
    intentDataObj.exitReason = cxiSession.cxiSessionObj.attr_LexBotExitReason != undefined ? cxiSession.cxiSessionObj.attr_LexBotExitReason : '';
    // Exit Point - CurrentStateName_MAXAttempt/APIFailure 
    intentDataObj.exitPoint = cxiSession.cxiSessionObj.exitPoint != undefined ? cxiSession.cxiSessionObj.exitPoint : '';
    intentDataObj.transfer = appSession.transfer != undefined ? appSession.transfer : process.const.STR_N;
    intentDataObj.stateDetails = this.UpdatestateDataObj(intentRequest,intentDataObj.stateDetails,appSession,cxiSession, DialogActionType, messages);
    // console.log("flagAPI",cxiSession.cxiSessionObj.apiFlag);
    return intentDataObj;
};
const UpdatestateDataObj = function(intentRequest,stateDetailsDataArray,appSession,cxiSession, DialogActionType, messages) {
    let stateDataObj = {};

    if (stateDetailsDataArray[0]["name"] == undefined || stateDetailsDataArray[0]["name"] == "") {
        stateDetailsDataArray[0].dateTime = cxiSession.cxiSessionObj.startTime != undefined ? cxiSession.cxiSessionObj.startTime:''; 
        stateDetailsDataArray[0].name =  appSession.stateName;
        //PromptType - prompt, menu, decision, api lookup
        stateDetailsDataArray[0].type = "menu";
        stateDetailsDataArray[0].result = "Success";
        stateDetailsDataArray[0].dialogAction = "";
      //  stateDetailsDataArray[0].content = messages;
        stateDetailsDataArray[0].attributes = this.UpdateAttributesData(appSession,cxiSession,intentRequest);
        stateDetailsDataArray[0].nextStateName = appSession.nextStateName;
        stateDetailsDataArray[0].apiDetails = []; //this.UpdateAPIDetailsData(appSession,stateDetailsDataArray);
        stateDetailsDataArray[0].slots = [];  // this.UpdateSlotsData(intentRequest,stateDetailsDataArray,appSession);
    }
    
        if(cxiSession.cxiSessionObj.apiFlag =="Y") {
         cxiSession.cxiSessionObj.apiFlag = "N";
         let stateObject = {};  
         stateObject.apiDetails =[];
         stateObject.slots = [];//this.UpdateSlotsData(intentRequest, stateDetailsDataArray,appSession);
    //   console.info(cxiSession.cxiSessionObj.cxiAPIDetails.length);
    //   logger.info(cxiSession.cxiSessionObj.cxiAPIDetails.length);
      
      for (let i = 0; i < cxiSession.cxiSessionObj.cxiAPIDetails.length; i++)
      {
      stateObject.dateTime = cxiSession.cxiSessionObj.startTime;
      stateObject.name = appSession.stateName;
      stateObject.type = "api lookup";
      stateObject.result = cxiSession.cxiSessionObj.result != undefined ? cxiSession.cxiSessionObj.result :'';
      stateObject.dialogAction = "";//DialogActionType = DialogActionType == "ElicitIntentActiveContext" ? "ElicitIntent" : DialogActionType;
      stateObject.content = " ";//messages[0].content;
      stateObject.nextStateName = appSession.nextStateName;
      
      stateObject.apiDetails.push(this.UpdateAPIDetailsData(cxiSession.cxiSessionObj.cxiAPIDetails[i]));
      
      stateObject.attributes = this.UpdateAttributesData(appSession,cxiSession,intentRequest);
      
        } 
        stateDetailsDataArray.push(stateObject);
    }
          
        if(cxiSession.cxiSessionObj.slotFlag == "Y")
        { 
        let stateObject = {};
        stateObject.apiDetails =[]; //this.UpdateAPIDetailsData(appSession, stateDetailsDataArray);
        stateObject.slots =[];
        cxiSession.cxiSessionObj.slotFlag ="N";
     
        for (let j = 0; j <cxiSession.cxiSessionObj.cxiSlotDetails.length; j++)
        {
       stateObject.dateTime = cxiSession.cxiSessionObj.startTime;
       stateObject.name = appSession.stateName;
       stateObject.type = "menu";
       stateObject.result = cxiSession.cxiSessionObj.result != undefined ? cxiSession.cxiSessionObj.result :'';
       stateObject.dialogAction ="";// DialogActionType = DialogActionType == "ElicitIntentActiveContext" ? "ElicitIntent" : DialogActionType;
       stateObject.content = " ";//messages[0].content;
       stateObject.nextStateName = appSession.nextStateName;  
        stateObject.slots.push(this.UpdateSlotsData(intentRequest,appSession,cxiSession.cxiSessionObj.cxiSlotDetails[j]));
        stateObject.attributes = this.UpdateAttributesData(appSession,cxiSession,intentRequest);
        
        }
        stateDetailsDataArray.push(stateObject);
        }
        stateDataObj.dateTime = new Date();
        stateDataObj.name = appSession.stateName;
        //PromptType - prompt, menu, decision,api lookup 
        stateDataObj.type = cxiSession.cxiSessionObj.promptType;
        stateDataObj.result = "Success";
        stateDataObj.dialogAction = DialogActionType;
        stateDataObj.content = messages[0].content;
        stateDataObj.nextStateName = appSession.nextStateName;
        stateDataObj.attributes = this.UpdateAttributesData(appSession,cxiSession,intentRequest);
        stateDataObj.apiDetails =[];
        stateDataObj.slots =[];
        stateDetailsDataArray.push(stateDataObj);
   

    return stateDetailsDataArray;
};

const UpdateSlotsData = function(intentRequest,appSession,cxiSlotDetails) {
    let slotDataObj = {};
    //Need to modify when slots are included in flow
    slotDataObj.elicitationStyle = cxiSlotDetails.elicitationStyle != undefined ? cxiSlotDetails.elicitationStyle :'';
    slotDataObj.name =  cxiSlotDetails.slotName  != undefined ? cxiSlotDetails.slotName :'' ;
    slotDataObj.type = cxiSlotDetails.slotType != undefined ? cxiSlotDetails.slotType :'';
    slotDataObj.inputMode = intentRequest.inputMode != undefined ? intentRequest.inputMode :'';
    slotDataObj.value = cxiSlotDetails.slotValue != undefined ? cxiSlotDetails.slotValue :'';// rsa.Encrypted(cxiSlotDetails.slotValue);
    slotDataObj.noMatchCount =cxiSlotDetails.noMatchCount!= undefined ?cxiSlotDetails.noMatchCount:'' ;
    slotDataObj.noInputCount =cxiSlotDetails.noInputCount!= undefined ?cxiSlotDetails.noInputCount:'';

  
    return slotDataObj;
};

const UpdateAPIDetailsData = function(cxiAPIDetails) {
    let apiDataObj = {};
    //Need to modify when API details are included in flow
    apiDataObj.id = cxiAPIDetails.apiId != undefined ?cxiAPIDetails.apiId : '';
    apiDataObj.name = cxiAPIDetails.apiname != undefined ? cxiAPIDetails.apiname : '';
 //   apiDataObj.requestId = cxiAPIDetails.requestId != undefined ? cxiAPIDetails.requestId : '' ;  
    apiDataObj.statusCode = cxiAPIDetails.statusCode != undefined ? cxiAPIDetails.statusCode : '' ;
    apiDataObj.result =  cxiAPIDetails.apiStateResult != undefined ? cxiAPIDetails.apiStateResult : '';
    apiDataObj.errorMessage = cxiAPIDetails.errorMessage != undefined ? cxiAPIDetails.errorMessage : '' ;

   
    return apiDataObj;
};

const GetConfidenceScore = function (intentRequest) {
    try {
        var nluConfidence = 0;
        var interpretations = intentRequest["interpretations"];
        for (var key in interpretations) {
            if (interpretations[key]["intent"]["name"] == intentRequest.sessionState.intent.name) {
                nluConfidence = interpretations[key]["nluConfidence"] != undefined ? interpretations[key]["nluConfidence"] :1;
                break;
            }
        }
        return nluConfidence;
    } catch (err) {
        throw err;
    }
};


module.exports = {
    GetJSONTemplate,
    GetLogTemplate,
    Clear,
    UpdateAttributesData,
    UpdatestateDataObj,
    UpdateIntentData,
    UpdateLogData,
    GetConfidenceScore,
    UpdateSlotsData,
    UpdateAPIDetailsData,
};
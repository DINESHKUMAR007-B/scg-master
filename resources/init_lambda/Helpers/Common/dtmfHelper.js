exports.DtmfHelper = function(intentRequest, appSession) {
    let inputTranscript = intentRequest.inputTranscript;
    let intentName;
    let dtmfOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let availableIntents;
    switch (appSession.nextStateName) {

        case process.const.NS_AIN_Identified:
            availableIntents = [process.const.AU201,process.const.AU202,process.const.AU203];
            break;
        case process.const.NS_CellPhnColl_PhoneNumberConfirmation:
        case process.const.NS_PhoneNumber_Confirmation:
        case process.const.NS_StreetNumber_Confirmation:
        case process.const.NS_AccountNumber_Confirmation:
            availableIntents = [process.const.AU201,process.const.AU202,process.const.AU203]; 
            break;
        case process.const.NS_CellPhoneCollection: 
        case process.const.NS_StreetNumber_DontHaveIt:  
        case process.const.NS_CellPhoneCollection_AddrFound:    
        case process.const.NS_EmergencyConfirmation:
            availableIntents = [process.const.AU201,process.const.AU202]; 
            break;
        case process.const.NS_Different_PhoneNumber:    
            availableIntents = [process.const.AU201,process.const.AU205]; 
            break;    
        default:
            availableIntents = [];
            break;
    }
    if (dtmfOptions.includes(inputTranscript)) {
        if ((inputTranscript == "7" || inputTranscript == "3") && availableIntents.includes(process.const.AU203)) {
            intentName = process.const.AU203;
        }
        else if (inputTranscript == "8" && availableIntents.includes(process.const.AU204)) {
            intentName = process.const.AU204;
        }
        else if (inputTranscript == "9" && availableIntents.includes(process.const.AU106)) {
            intentName = process.const.AU106;
        }
        else {
            const index = parseInt(inputTranscript, 10) - 1;
            if (availableIntents[index] === process.const.AU204 || availableIntents[index] === process.const.AU106) {
                intentName = process.const.FallbackIntent;
            }
            else {
                intentName = availableIntents[index] || process.const.FallbackIntent;
            }

        }
    }
    else {
        intentName =process.const.FallbackIntent;
    }
    intentRequest.sessionState.intent.name = intentName;
    return intentName;
};

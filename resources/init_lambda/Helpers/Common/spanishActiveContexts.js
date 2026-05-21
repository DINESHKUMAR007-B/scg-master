const logger = require("../Utilities/logger");
exports.SpanishActiveContexts = function (name, appSession, intentRequest) {
    logger.info("Enter Spanish Active Context Helper");
    let availableIntents = [];
    switch (appSession.nextStateName) {
    case process.const.NS_AIN_Identified:
        availableIntents = [process.const.AU201,process.const.AU202,process.const.AU203, process.const.AU108];
        break;
    case process.const.NS_CellPhoneCollection:
    case process.const.NS_CellPhnColl_PhoneNumberConfirmation:
    case process.const.NS_PhoneNumber_Confirmation:
    case process.const.NS_StreetNumber_Confirmation:
    case process.const.NS_AccountNumber_Confirmation:
    availableIntents = [process.const.AU201,process.const.AU202,process.const.AU203];
    break;
    case process.const.NS_Different_PhoneNumber:    
        availableIntents = [process.const.AU201,process.const.AU205];
        break;   
    case process.const.NS_CellPhoneCollection: 
    case process.const.NS_StreetNumber_DontHaveIt:  
    case process.const.NS_CellPhoneCollection_AddrFound:
        case process.const.NS_EmergencyConfirmation:
        availableIntents = [process.const.AU201,process.const.AU202]; 
        break;    
    default:
        availableIntents;
        break;
}
if(availableIntents.includes(name) == false ){
        name = process.const.FallbackIntent;
        intentRequest.sessionState.intent.name = name;
}
     return name;
};
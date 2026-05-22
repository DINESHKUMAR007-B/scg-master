const logger = require("../../../../Helpers/Utilities/logger");
const sessionHelper = require("../../../../Helpers/Common/sessionHelper");
const util = require("../../../../Helpers/Utilities/getLexResponse");
const catchHelper = require("../../../../Helpers/Common/catchHelper");
const ssmlMessage = require("../../../../Helpers/Common/ssmlHelper");
const callPath = require("../../../../Helpers/Common/callPathHelper");

const NewAddress = async function (intentRequest, callback) {
    const intentName = intentRequest.sessionState.intent.name;
    logger.info("Entered " + intentName + " Intent Flow");
    let appSession = sessionHelper.AppSession;
    let cxiSession = sessionHelper.CxiSession;
    let promptOut = " ";

    try {
        appSession.preStateName = appSession.stateName;
        appSession.stateName = appSession.baseLine + "_NewAddress";
        //------------PUT CXI Keys----------------------------
        cxiSession.cxiSessionObj.result = "Success";
        cxiSession.cxiSessionObj.promptType = "menu";
        cxiSession.cxiSessionObj.startTime = util.getStartTime(new Date());
        cxiSession.exitPoint = appSession.stateName;
        let activeContexts = [];
        appSession.nextStateName = process.const.NS_FullAddressStartService;
        activeContexts = util.SetActiveContexts(activeContexts, process.const.Context_CollectFullAddress);

        cxiSession.pegPath = callPath.PegPath(cxiSession.pegPath, process.const.PP_210500);

        promptOut = process.promptSession.scg_ccc_collect_2105_main_01_FullAddr;
        cxiSession.cxiSessionObj.promptIdFlag = "Y";
        promptOut = ssmlMessage.ConvertSSML(promptOut);
        callback(
            util.DialogAction(
                process.const.DA_ElicitIntentActiveContext,
                intentRequest,
                intentName,
                util.BuildSSMLMessage(promptOut),
                process.const.STR_Fulfilled,
                activeContexts,

            )
        );
        return;

    }
    catch (error) {
        catchHelper.CatchUpdate(error, intentRequest, intentName, callback);
    }
};
module.exports = {
    NewAddress
};

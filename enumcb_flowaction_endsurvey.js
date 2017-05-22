/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in EndNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/*
* Pre Action for BestTime_QSTN
* Updated by Ebenezer Owoeye - setRespondentFullName function and Data transform
* Created by: Aditi Ashok
*/ 

function EnumCB_BestTime_PRE () {
   var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");

  pega.offline.runDataTransform("EnumCB_BestTime_PRE", "CB-FW-CensusFW-Work-Quest-Enum", null);
  ENUMCB.updateDKRefVisibility("BestTime");
  
  if(respondent.get("FirstName") || respondent.get("MiddleName") || respondent.get("LastName")){
    ENUMCB.setRespondentFullName();
  }
}

/*
* Post Action for BestTime_QSTN
* Updated by Ebenezer Owoeye
* Created by: Aditi Ashok
*/ 
function EnumCB_BestTime_POST() {

  var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  questFlags.put("IsBestTimeForInmover", true);
  var ATTACTUAL = "";
  var RESP_TYPE = "";
  var NO_COMPLETE = "";
  var RESULT_OF_MESSAGE = "";
  var workPage = pega.ui.ClientCache.find("pyWorkPage");

  if (response.get("NRFU_ATTEMPT_TYPE_CODE")) {
    ATTACTUAL = response.get("NRFU_ATTEMPT_TYPE_CODE").getValue();
  }
  if (response.get("RESP_TYPE_CODE")) {
    RESP_TYPE = response.get("RESP_TYPE_CODE").getValue();
  }
  if (response.get("NRFU_INCOMPLETE_CODE")) {
    NO_COMPLETE = response.get("NRFU_INCOMPLETE_CODE").getValue();
  }
  if (response.get("NRFU_PH_MSG_RESULT_CODE")) {
    RESULT_OF_MESSAGE = response.get("NRFU_PH_MSG_RESULT_CODE").getValue();
  }

  /* begin validation and mapping */
  var count = 0;
  var NRFUAvailability = pega.ui.ClientCache.find("pyWorkPage.Respondent.NRFUAvailability");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");

  respPage.put("NRFUBestTimes", []);
  var NRFUBestTimes = respPage.get("NRFUBestTimes");
  var NRFUBestTimesIterator = NRFUBestTimes.iterator();

  if (NRFUAvailability.get("IsAnytime").getValue() == "true") {
    var currentPage = pega.ui.ClientCache.createPage("BestTimes");
    currentPage.put("NRFU_BEST_DAY_CODE", "1");
    currentPage.put("NRFU_BEST_TIME_CODE", "1");
    NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
    count++;
  }
  else {
    var currentPage = pega.ui.ClientCache.createPage("BestTimes");
    currentPage.put("NRFU_BEST_DAY_CODE", "0");
    currentPage.put("NRFU_BEST_TIME_CODE", "0");
    NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
  }

  if (NRFUAvailability.get("IsSunday").getValue() == "true") {
    if (NRFUAvailability.get("IsSundayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "2");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());;
      count++;
    }
    if (NRFUAvailability.get("IsSundayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "2");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsSundayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "2");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    count++;
  }

  if (NRFUAvailability.get("IsMonday").getValue() == "true") {
    if (NRFUAvailability.get("IsMondayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "3");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsMondayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "3");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsMondayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "3");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());;
      count++;
    }
    count++;
  }

  if (NRFUAvailability.get("IsTuesday").getValue() == "true") {
    if (NRFUAvailability.get("IsTuesdayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "4");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsTuesdayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "4");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsTuesdayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "4");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    count++;
  }

  if (NRFUAvailability.get("IsWednesday").getValue() == "true") {
    if (NRFUAvailability.get("IsWednesdayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "5");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsWednesdayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "5");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsWednesdayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "5");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    count++;
  }

  if (NRFUAvailability.get("IsThursday").getValue() == "true") {
    if (NRFUAvailability.get("IsThursdayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "6");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsThursdayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "6");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsThursdayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "6");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    count++;
  }

  if (NRFUAvailability.get("IsFriday").getValue() == "true") {
    if (NRFUAvailability.get("IsFridayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "7");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsFridayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "7");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsFridayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "7");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    count++;
  }

  if (NRFUAvailability.get("IsSaturday").getValue() == "true") {
    if (NRFUAvailability.get("IsSaturdayMorning").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "8");
      currentPage.put("NRFU_BEST_TIME_CODE", "2");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsSaturdayAfternoon").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "8");
      currentPage.put("NRFU_BEST_TIME_CODE", "3");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    if (NRFUAvailability.get("IsSaturdayEvening").getValue() == "true") {
      var currentPage = pega.ui.ClientCache.createPage("BestTimes");
      currentPage.put("NRFU_BEST_DAY_CODE", "8");
      currentPage.put("NRFU_BEST_TIME_CODE", "4");
      NRFUBestTimes.add().adoptJSON(currentPage.getJSON());
      count++;
    }
    count++;
  }
  ENUMCB.BestTime_VLDN(count);
   if(!workPage.hasMessages()) {
     var isCensusDay = response.get("IsCensusDayAddress");
     if(!isCensusDay)
     {
         response.put("IsCensusDayAddress", "55");
         isCensusDay = response.get("IsCensusDayAddress");
     }
     isCensusDay = isCensusDay.getValue();
    /* Run post data transform to set NextSurveyQuestion*/
    pega.offline.runDataTransform("EnumCB_BestTime_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
     if(isCensusDay == "55")
     {
         response.put("IsCensusDayAddress", "");
         response.remove("IsCensusDayAddress");
     }
 }
}

/*
* Created By: Kyle Gravel
*	Used by TypeOfProxy_QSTN
*	Pre Action Primes Datapage with correct responses
*/

function ENUMCB_TypeOfProxy_PRE() {
  CB.toggleFlag("DKRFEnabled","true");
  CB.toggleFlag("ExitSurveyEnabled","false");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion");
  previousQuestion = previousQuestion ? previousQuestion.getValue() : "";
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  questFlags.put("PreviousQuestion",previousQuestion);
  ENUMCB.primeTypeOfProxyOptions();
  ENUMCB.updateDKRefVisibility("TypeOfProxy","pyWorkPage.Respondent.DKRefused");  
}

/*
*	Created by Kyle Gravel
*	Post function for TypeOfProxy
*/
function ENUMCB_TypeOfProxy_POST() {
  /*Run required validation*/
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.Response.RESP_PRX_TYPE_CODE", "pyWorkPage.Respondent.DKRefused.TypeOfProxy");
  } 
  else {
    ENUMCB.Required("pyWorkPage.Respondent.Response.RESP_PRX_TYPE_CODE");
  }
  /*Run Specify validation*/
  ENUMCB.TypeOfProxy_VLDN();
  /*Grab last survey question from pyWorkPage to get LastSurveyQuestion for branching*/
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var lastSurveyQuestion = questFlags.get("PreviousQuestion");
  lastSurveyQuestion = lastSurveyQuestion ? lastSurveyQuestion.getValue() : "";
  /*If last survey question = ProxyAddress, go to BestTime : else go to CaseNotes*/
  if(lastSurveyQuestion == "ProxyAddress_QSTN" || lastSurveyQuestion == "BestTime_QSTN" || lastSurveyQuestion == "ProxyPhone_QSTN") {
    questFlags.put("NextSurveyQuestion","BestTime_QSTN");
  }
  else {
    questFlags.put("NextSurveyQuestion","CaseNotes_QSTN");
  }
}

/**
*	Pre action for InMoverDone_QSTN
*	Created by: Aansh Kapadia
**/
function EnumCB_InMoverDone_PRE() {
  pega.offline.runDataTransform("EnumCB_InMoverDone_PRE", "CB-FW-CensusFW-Work-Quest-Enum", null);
}

/**
*	Post action for InMoverDone_QSTN
*	Created by: Aansh Kapadia
**/
function EnumCB_InMoverDone_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.InMoverDone", "pyWorkPage.Respondent.DKRefused.InMoverDone");
  }
  else {
    ENUMCB.Required("pyWorkPage.Respondent.InMoverDone");
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
  	pega.offline.runDataTransform("EnumCB_InMoverDone_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
  }
}

/*
*	Pre Action for Strategies_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_Strategies_PRE() {
  CB.toggleFlag("DKRFEnabled","false");
  CB.toggleFlag("ExitSurveyEnabled","false");
}

/*
*	Post Action for Strategies_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_Strategies_POST() {
 
  ENUMCB.Required("pyWorkPage.Respondent.HasLeftNoticeOfVisit");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var answer = (respondentPage.get("HasLeftNoticeOfVisit")) ? respondentPage.get("HasLeftNoticeOfVisit").getValue(): "";
    if (answer == "1") {
      responsePage.put("NRFU_LEFTNOTICE_YES_IND","1");
      responsePage.put("NRFU_LEFTNOTICE_NO_IND","0");
    } else {
      responsePage.put("NRFU_LEFTNOTICE_YES_IND","0");
      responsePage.put("NRFU_LEFTNOTICE_NO_IND","1");
    }
  }
}

/*
*	Pre Action for ScanBarcode_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_ScanBarcode_PRE() {
  CB.toggleFlag("DKRFEnabled","false");
  CB.toggleFlag("ExitSurveyEnabled","false");
}

/** 
*   Post Action for ScanBarcode_QSTN
*	Created by: Ebenezer Owoeye
**/
function EnumCB_ScanBarcode_POST() {
	ENUMCB.ScanBarcode_VLDN();
}

/*
*	Pre Action for Goodbye_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_Goodbye_PRE() {
  CB.toggleFlag("DKRFEnabled","false");
  CB.toggleFlag("ExitSurveyEnabled","false");
}

/*
*	Post Action for EnumCB_Goodbye_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_Goodbye_POST() {
  try
  {
  	pega.offline.runDataTransform("EnumCB_Goodbye_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
  }
  catch(DTErr)
  {
    alert("Error in EnumCB_Goodbye ==> " + DTErr.message);
  }
}

/*
*	Created by: Kyle Gravel
*	Toggles Exit Survey Funcitonality to off. 
*	Used by Language_QSTN
*/
function EnumCB_Language_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","false");
}

/*
*  Created: Ramin M, Aansh Kapadia
*  Description: Post to CDM data structure 
*/

function EnumCB_Language_POST () {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var languageList = pega.ui.ClientCache.find("D_LanguageList.pxResults").iterator();
  var languageIter = 0;

  respPage.put("NRFU_INTVW_LANGUAGE_CODES", []);

  var NRFU_INTVW_LANGUAGE_CODES = respPage.get("NRFU_INTVW_LANGUAGE_CODES");
  var NRFU_INTVW_LANGUAGE_CODESIterator = NRFU_INTVW_LANGUAGE_CODES.iterator();

  while(languageList.hasNext()) {  
    var thisPage = languageList.next();
    if (thisPage.get("pySelected").getValue() == true) {
      var code = thisPage.get("Code").getValue();
      var lanPage = pega.ui.ClientCache.createPage("LanguageCodes");
      languageIter += 1;

      lanPage.put("SOLICIT_LANGUAGE_CODE", code);
      NRFU_INTVW_LANGUAGE_CODES.add().adoptJSON(lanPage.getJSON());
    }
  }
  ENUMCB.language_VLDN(languageIter);
}

/*
*	Used by CaseNotes_QSTN on Pre action
*	Created by: Jack McCloskey
*/
function EnumCB_CaseNotes_PRE(){  
  try {
    /*Prepare Temp Page to add to case notes list*/
    var CaseNotesPage = pega.ui.ClientCache.createPage("caseNotesPage");
    CB.toggleFlag("DKRFEnabled", "false");
    CB.toggleFlag("ExitSurveyEnabled","false");
   /**Logic to move case to inactive case list **/
    var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
    var proxyAttempt = respondentPage.get("ProxyAttempt") ? respondentPage.get("ProxyAttempt").getValue() : "";
    if(proxyAttempt == "3") {
      var workPage = pega.ui.ClientCache.find("pyWorkPage");
      var caseID = workPage.get("pxInsName") ? workPage.get("pxInsName").getValue() : "";
      var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
      
      var caseStatus = responsePage.get("CASE_STATUS_CODE") ? responsePage.get("CASE_STATUS_CODE").getValue() : "";

      var workList = pega.ui.ClientCache.find("D_EnumUserWorkList.pxResults");
      var workListIterator = workList.iterator();
      var index = 0;

      while(workListIterator.hasNext()) {
        index++;
        var currentObj = workListIterator.next();
        var currentObjID = currentObj.get("pxRefObjectInsName") ? currentObj.get("pxRefObjectInsName").getValue() : "";
        if(currentObjID == caseID) {
          pega.ui.ClientCache.find("D_EnumUserWorkList.pxResults(" + index + ").pxPages(W).Respondent.Response").put("CASE_STATUS_CODE", caseStatus);
        }
      }
    }
  }
  catch(e) {
    alert(e.message);
  }
}

/*	Created By: David Bourque, Jack McCloskey
*	Date: 03-02-2017
*	Case Notes Post
*/
function EnumCB_CaseNotes_POST(){

  var CaseNotesPage = pega.ui.ClientCache.find("caseNotesPage");
  var CaseText = CaseNotesPage.get("CaseText");

  if (CaseText && CaseText.getValue().trim() != ""){
    CB.addCaseNote(CaseText.getValue());
  }
  var location = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  var isMultiUnit = location.get("IsMultiUnit") ? location.get("IsMultiUnit").getValue() :"";
  if(isMultiUnit == true) {
    ENUMCB.MUCodeMapping();
  }
  else {
    ENUMCB.EventCodeMapping(); 
  }
  
  var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var proxyAttempt = respondentPage.get("ProxyAttempt") ? respondentPage.get("ProxyAttempt").getValue() : "";
  var isGoingForward = questFlags.get("IsGoingForward") ? questFlags.get("IsGoingForward").getValue() : "";
  if(isGoingForward == "true" && proxyAttempt == "3") {
    questFlags.put("NextSurveyQuestion", "CaseList");
    questFlags.put("ShowCaseList", true);
  }
  else {
    questFlags.put("NextSurveyQuestion", "ProxyAttempt_QSTN");
  }
}

/*
*	Pre Action for Interpreter_QSTN
*	Created by AXJ
*/
function EnumCB_Interpreter_PRE() {
  CB.toggleFlag("DKRFEnabled", "false"); 
  CB.toggleFlag("ExitSurveyEnabled","false");
}
/**
*	Post action for interpreter qstn
*	Created by Omar Mohammed/AXJ
**/
function EnumCB_Interpreter_POST() {
  try {
    var isRequired = ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_INTERPRETER_YES_IND");
    var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var answer = respPage.get("NRFU_INTERPRETER_YES_IND").getValue();
    if (answer == "1") {
      respPage.put("NRFU_INTERPRETER_YES_IND", "1");
      respPage.put("NRFU_INTERPRETER_NO_IND", "0");  
    } else if (answer == "0") {
      respPage.put("NRFU_INTERPRETER_YES_IND", "0");
      respPage.put("NRFU_INTERPRETER_NO_IND", "1");
    } else {
      /** user did not enter anything **/
    }
  } catch (e) {
    console.log("ENUMCB Error - EnumCB_Interpreter_POST:" + e.message);
  }
}

/*
*    EnumCB_IDInterpreter_PRE:  Load Options for the ID Interpreter with static options and all HouseholdRoster members  
*	Created by: Ramin M.
*	 
*/
function EnumCB_IDInterpreter_PRE() {
  if(pega.mobile.isHybrid) {
    CB.toggleFlag("ExitSurveyEnabled","false");
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var QuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var householdRosterIterator = householdRoster.iterator();

    var IDInterpreterDP = pega.ui.ClientCache.find("D_IDInterpreterOptions").put("pxResults",[]);  

    while(householdRosterIterator.hasNext()) {  


      ENUMCB.setHouseholdMembersFullName();


      var currentPage = householdRosterIterator.next(); 
      var fullName = currentPage.get("FullName").getValue();

      var IDInterpreterPage0 = pega.ui.ClientCache.createPage("IDInterpreterPage ");
      IDInterpreterPage0.put("pyValue", fullName);
      IDInterpreterPage0.put("pyDescription", fullName);
      IDInterpreterDP.add().adoptJSON(IDInterpreterPage0.getJSON());
    }

    var IDInterpreterPage1 = pega.ui.ClientCache.createPage("IDInterpreterPage ");
    IDInterpreterPage1.put("pyValue", "Another enumerator");
    IDInterpreterPage1.put("pyDescription", "Another enumerator");
    IDInterpreterDP.add().adoptJSON(IDInterpreterPage1.getJSON());

    var IDInterpreterPage2 = pega.ui.ClientCache.createPage("IDInterpreterPage");
    IDInterpreterPage2.put("pyValue", "Neighbor");
    IDInterpreterPage2.put("pyDescription", "Neighbor");
    IDInterpreterDP.add().adoptJSON(IDInterpreterPage2.getJSON());        

    var IDInterpreterPage3 = pega.ui.ClientCache.createPage("IDInterpreterPage");
    IDInterpreterPage3.put("pyValue", "Local community member");
    IDInterpreterPage3.put("pyDescription", "Local community member");
    IDInterpreterDP.add().adoptJSON(IDInterpreterPage3.getJSON());

    var IDInterpreterPage4 = pega.ui.ClientCache.createPage("IDInterpreterPage");
    IDInterpreterPage4.put("pyValue", "Other");
    IDInterpreterPage4.put("pyDescription", "Other");
    IDInterpreterDP.add().adoptJSON(IDInterpreterPage4.getJSON());

  }
}

function EnumCB_IDInterpreter_POST() {

  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var iDInterOption = questFlags.get("IDInterpreter");
  iDInterOption = iDInterOption ? iDInterOption.getValue() : "";

  var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  var respondentResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  
  if (iDInterOption == "Other") {

    var otherName = respondentResponse.get("NRFU_INTRP_TYPE_OTHER_TEXT");
	otherName = otherName ? otherName.getValue() : "";
    
    if(ENUMCB.IDInterpreter_VLDN(otherName)){
      respondent.put("NRFU_INTRP_TYPE_OTHER_TEXT",otherName);
    }
  } 
  if(ENUMCB.IDInterpreter_VLDN(iDInterOption)){

    if (iDInterOption!= "Other"  && iDInterOption!= "Another enumenator" &&  iDInterOption != "Neighbor" && iDInterOption!= "Local community member") {
      var memName = respondentResponse.get("NRFU_INTRP_TYPE_HHMEM_NAME");
      memName = memName ? memName.getValue() : "";
      respondent.put("NRFU_INTRP_TYPE_HHMEM_NAME", memName);
    } 
    if (iDInterOption !=  "Other" && iDInterOption == "Another enumenator" || iDInterOption == "Neighbor" || iDInterOption== "Local community member") {
      respondent.put("NRFU_INTRP_TYPE_HHMEM_NAME", iDInterOption);    }
  }
}

/*
*	Created By: Kyle Gravel
*	Disabled DK/REF and ExitSurvey for ProxyAttempt_QSTN
*/
function ENUMCB_ProxyAttempt_PRE() {
  CB.toggleFlag("DKRFEnabled","false");
  CB.toggleFlag("ExitSurveyEnabled","false");
}

/*
*	Created by: Kyle Gravel
*	Used by ProxyAttempt_QSTN
*/
function ENUMCB_ProxyAttempt_POST() {
  /*Validate that VacancyDescription has value and throw hard edit if not*/
  ENUMCB.Required("pyWorkPage.Respondent.ProxyAttempt");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()){

  	pega.offline.runDataTransform("ENUMCB_ProxyAttempt_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
  	var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  	var timestamp = CB.getCurrentPegaDate();
  	responsePage.put("RESP_CONTACT_DATE",timestamp);
  } 
}

/*
* Pre Action for ProxyName_QSTN
*/
function EnumCB_ProxyName_PRE() {
		var cpLocationAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  	  	
  		var isMultiUnit = cpLocationAddress.get("IsMultiUnit");
  		isMultiUnit = isMultiUnit ? isMultiUnit.getValue() : ""; 
    	
        if(isMultiUnit == "true"){
          CB.toggleFlag("DKRFEnabled", "false"); 
        }
        else{
          CB.toggleFlag("DKRFEnabled", "true"); 
        }

  
  		/* Preventing autofill for MU RI Scenario 
        var isReInterview = pega.ui.ClientCache.find("pyWorkPage").get("IsReInterview");
    	isReInterview = isReInterview ? isReInterview.getValue() : "";
  
  		var hhResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response"); 
        
  		if (isMultiUnit == "true" && isReInterview == "true") {
          	hhResponse.put("RESP_FIRST_NAME", "");
  			hhResponse.put("RESP_MIDDLE_NAME", "");
            hhResponse.put("RESP_LAST_NAME", "");
 
        } */

 
  CB.toggleFlag("ExitSurveyEnabled", "false");
  ENUMCB.updateDKRefVisibility("ProxyName", "pyWorkPage.Respondent.DKRefused");
}
/*
*/
function EnumCB_ProxyName_POST() {
  if(pega.mobile.isHybrid) {
    ENUMCB.updateDisabledDKRefColor();
    ENUMCB_ProxyName_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    /**This block enables the DKRef a long as there are no error messages and we can move forward **/
    if(!workPage.hasMessages()) {
      CB.toggleFlag("DKRFEnabled","true");
    }
  }
}

  /**
* Post action for Resp Phone to copy temp phone into RESP_PH_NUMBER_TEXT
*
* Created by: Ramin
*/
 
  
function EnumCB_ProxyPhone_PRE() {
  if(pega.mobile.isHybrid) {
    ENUMCB.updateDKRefVisibility("ProxyPhone", "pyWorkPage.Respondent.DKRefused");
   var cpLocationAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
   var isMultiUnit = cpLocationAddress.get("IsMultiUnit").getValue();
    var isReInterview = pega.ui.ClientCache.find("pyWorkPage").get("IsReInterview");
    
    isReInterview = isReInterview ? isReInterview.getValue() : "";
    
   
   if(isMultiUnit == "true" && isReInterview != "true"){
				CB.toggleFlag("DKRFEnabled", "false"); 
            }
			else{
			 CB.toggleFlag("DKRFEnabled", "true"); 
			}
    CB.toggleFlag("ExitSurveyEnabled", "false");
    var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var phone = respPage.get("RESP_PH_NUMBER_TEXT");
    
    var isattactual = respPage.get("ATTACTUAL");
    isattactual = isattactual ? isattactual.getValue() : "";
    var questPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    if(isattactual == "PV" ){

      	  questPage.put("IsProxyPhoneValid", "NonValid");
      
    }
    else{
       questPage.put("IsProxyPhoneValid", "Valid");
    }
    var phone = respPage.get("RESP_PH_NUMBER_TEXT");
    phone = phone ? phone.getValue() : "";
    var telephone = pega.ui.ClientCache.find("pyWorkPage.Respondent.TelephoneInfo.TelephoneNumber(1)");
    var answerSelected = telephone.get("CountryCode");
   if(!answerSelected) {
      var D_RespPhoneOptions = pega.ui.ClientCache.find("D_RespPhoneOptions");
      var phoneNumbers = pega.ui.ClientCache.find("D_RespPhoneOptions").put("pxResults",[]); 
      if(phone != "") {
        var phonePage = pega.ui.ClientCache.createPage("phonePage");
        phonePage.put("pyLabel", phone);
        phonePage.put("pyValue", phone);
        phoneNumbers.add().adoptJSON(phonePage.getJSON());
      }
      var addPhonePage = pega.ui.ClientCache.createPage("addPhone");
      addPhonePage.put("pyLabel", "Add Number");
      addPhonePage.put("pyValue", "-1");
      phoneNumbers.add().adoptJSON(addPhonePage.getJSON());
    }
  }
}
  /**
* Post action for Resp Phone to copy temp phone into RESP_PH_NUMBER_TEXT
*
* Created by: 
*
* Updated by: Aditi Ashok 4/25/17 to include MU RI Branching
*/


 function EnumCB_ProxyPhone_POST() {
   
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
	var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  
    var temp = workPage.get("Respondent.TelephoneInfo.TelephoneNumber(1).Extension");
    temp = temp ? temp.getValue() : "";
    var persistTempVal = respPage.put("RESP_PH_NUMBER_TEXT", temp);
   
  
	var respPhone = respPage.get("RESP_PH_NUMBER_TEXT");
	var respPhoneValue = respPhone ? respPhone.getValue() : "";
	ENUMCB_ProxyPhone_VLDN(workPage, respPhoneValue);
	ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.RespPhone", "pyWorkPage.Respondent.Response.RESP_PH_DK_IND", "pyWorkPage.Respondent.Response.RESP_PH_REF_IND");
   
 
/**
	Add the proxy phone number to the Phonenumber page list Ebenezer Owoeye
**/
  
   if (respPhoneValue != " "){
     
     ENUMCB.appendDistinctNumberToTelephoneNumbersList(respPhoneValue, "proxy");
     
   /*  alert("Proxy Phone number added is" + respPhoneValue); */
     
   }
   
    /* Branching for MU RI Scenario */
    var isReInterview = pega.ui.ClientCache.find("pyWorkPage").get("IsReInterview");
    isReInterview = isReInterview ? isReInterview.getValue() : "";

    var isMultiUnit = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress").get("IsMultiUnit");
    isMultiUnit = isMultiUnit ? isMultiUnit.getValue() : "";

    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    if (isReInterview == "true" && isMultiUnit == "true") {
        questFlags.put("NextSurveyQuestion", "AnyoneMU_QSTN");
    }
}

/**
* Pre Function for Proxy Address
* Created by Dillon Irish
**/
function EnumCB_ProxyAddress_PRE() {
	CB.toggleFlag("DKRFEnabled", "true");
	ENUMCB.updateDKRefVisibility("ProxyAddress");
	
	var cpSoftEditVLDN = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.SoftEditVLDN");
	var cpLocationAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
	var cpProxyAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
	var cpRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
	var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	if(cpSoftEditVLDN && cpLocationAddress && cpProxyAddress && cpRoster && cpResponse){
		cpSoftEditVLDN.put("ProxyAddressFlag", "false");
      	cpRoster.put("ProxyAddress", {});
		var isMultiUnit = cpLocationAddress.get("IsMultiUnit").getValue();
		var addressResponse = cpResponse.get("H_OCC_NO_REFP_IND").getValue();
		var anyoneDK = cpResponse.get("H_OCC_DK_PRX_IND").getValue();
		var anyoneRef = cpResponse.get("H_OCC_REF_PRX_IND").getValue();
		if(isMultiUnit == "true"){
			cpProxyAddress.adoptJSON(cpLocationAddress.getJSON());
			var addressType = cpLocationAddress.get("AddrType").getValue();
			if(addressType == "USSA" || addressType == "USPO" || addressType == "USRR"){
				cpProxyAddress.put("SSAddressType", addressType);
			}else{
				cpProxyAddress.put("PRAddressType", addressType);
			}
		}else{
			cpRoster.put("ProxyAddress", {});
		}
	}
}

/**
* Post Function for Proxy Address
* Created by Dillon Irish
**/
function EnumCB_ProxyAddress_POST() { 
  try {   
	var cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
	var cpProxyAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
	var cpLocationAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
	var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
	
	if(cpWorkPage && cpProxyAddress && cpLocationAddress && cpResponse && cpQuestFlags){
		var locState = cpLocationAddress.get("STATE") ? cpLocationAddress.get("STATE").getValue() : "";
		var addressType;
		if(locState != "Puerto Rico"){
			addressType = cpProxyAddress.get("SSAddressType") ? cpProxyAddress.get("SSAddressType").getValue() : "";
		}else{
			addressType = cpProxyAddress.get("PRAddressType") ? cpProxyAddress.get("PRAddressType").getValue() : "";
		}
		cpProxyAddress.put("AddrType", addressType);
		ENUMCB.ProxyAddress_VLDN(addressType);
		if (!cpWorkPage.hasMessages()) {
			/*Stateside Address*/
			if(addressType == 'USSA' || addressType == 'USPO' || addressType == 'USRR'){
				var city = cpProxyAddress.get("CITY");
				var state = cpProxyAddress.get("STATE");
				var zip = cpProxyAddress.get("LOCZIP");
				
				cpResponse.put("RESP_PRX_CITY_TEXT", city ? city.getValue() : "");
				cpResponse.put("RESP_PRX_STATE_TEXT", state ? state.getValue() : "");
				cpResponse.put("RESP_PRX_ZIP_TEXT", zip ? zip.getValue() : "");
				
				if(addressType == 'USSA'){
					var houseNumber = cpProxyAddress.get("LOCHN1");
					var streetName = cpProxyAddress.get("StreetName");
					var unit = cpProxyAddress.get("LOCWSID1");
					var desc = cpProxyAddress.get("LOCDESC");
					
					cpResponse.put("RESP_PRX_STRNUM_PRI_TEXT", houseNumber ? houseNumber.getValue() : "");
					cpResponse.put("RESP_PRX_STRNAME_1_PRI_TEXT", streetName ? streetName.getValue() : "");
					cpResponse.put("RESP_PRX_UNIT_TEXT", unit ? unit.getValue() : "");
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
				
				if(addressType == 'USPO'){
					var poBox = cpProxyAddress.get("POBOX");
					
					cpResponse.put("RESP_PRX_POBOX_TEXT", poBox ? poBox.getValue() : "");
				}
				
				if(addressType == 'USRR'){
					var rrDesc = cpProxyAddress.get("RRDescriptor");
					var desc = cpProxyAddress.get("LOCDESC");
				
					cpResponse.put("RESP_PRX_RR_DESC_TEXT", rrDesc ? rrDesc.getValue() : "");
					/** cpResponse.put("RESP_PRX_RR_NUM_TEXT", cpProxyAddress.get("RRNumber").getValue()); Need RESPONSE property from BAs **/
					/** cpResponse.put("RESP_PRX_RR_BOXID_TEXT", cpProxyAddress.get("RRBoxIDNumber").getValue()); Need RESPONSE property from BAs **/
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
			}else{ /*Puerto Rico*/
				var muni = cpProxyAddress.get("Municipio");
				var state = cpProxyAddress.get("STATE");
				var zip = cpProxyAddress.get("LOCZIP");
				
				cpResponse.put("RESP_PRX_PR_MUNI_NAME", muni ? muni.getValue() : "");
				cpResponse.put("RESP_PRX_STATE_TEXT", state ? state.getValue() : "");
				cpResponse.put("RESP_PRX_ZIP_TEXT", zip ? zip.getValue() : "");
				
				if(addressType == 'PRGA'){
					var houseNumber = cpProxyAddress.get("LOCHN1");
					var streetName = cpProxyAddress.get("StreetName");
					var unit = cpProxyAddress.get("LOCWSID1");
					var desc = cpProxyAddress.get("LOCDESC");
					
					cpResponse.put("RESP_PRX_STRNUM_PRI_TEXT", houseNumber ? houseNumber.getValue() : "");
					cpResponse.put("RESP_PRX_STRNAME_1_PRI_TEXT", streetName ? streetName.getValue() : "");
					cpResponse.put("RESP_PRX_UNIT_TEXT", unit ? unit.getValue() : "");
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
				
				if(addressType == 'PRUA'){
					var urb = cpProxyAddress.get("LOCURB");
					var houseNumber = cpProxyAddress.get("LOCHN1");
					var streetName = cpProxyAddress.get("StreetName");
					var unit = cpProxyAddress.get("LOCWSID1");
					var desc = cpProxyAddress.get("LOCDESC");
				
					cpResponse.put("RESP_PRX_PR_URB_NAME", urb ? urb.getValue() : "");
					cpResponse.put("RESP_PRX_STRNUM_PRI_TEXT", houseNumber ? houseNumber.getValue() : "");
					cpResponse.put("RESP_PRX_STRNAME_1_PRI_TEXT", streetName ? streetName.getValue() : "");
					cpResponse.put("RESP_PRX_UNIT_TEXT", unit ? unit.getValue() : "");
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
				
				if(addressType == 'PRAC'){
					var apt = cpProxyAddress.get("LOCAPTCOMPLEX");
					var houseNumber = cpProxyAddress.get("LOCHN1");
					var streetName = cpProxyAddress.get("StreetName");
					var unit = cpProxyAddress.get("LOCWSID1");
					var desc = cpProxyAddress.get("LOCDESC");
				
					cpResponse.put("RESP_PRX_BUILDING_NAME", apt ? apt.getValue() : "");
					cpResponse.put("RESP_PRX_STRNUM_PRI_TEXT", houseNumber ? houseNumber.getValue() : "");
					cpResponse.put("RESP_PRX_STRNAME_1_PRI_TEXT", streetName ? streetName.getValue() : "");
					/** cpResponse.put("RESP_PRX_BUILDING_DESC", cpProxyAddress.get("LOCBLDGDESC").getValue()); Need RESPONSE property from BAs **/
					/** cpResponse.put("RESP_PRX_BUILDING_NUM_TEXT", cpProxyAddress.get("LOCBLDGID").getValue()); Confirm RESPONSE property with BAs **/
					cpResponse.put("RESP_PRX_UNIT_TEXT", unit ? unit.getValue() : "");
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
				
				if(addressType == 'PRAA'){
					var area = cpProxyAddress.get("LOCAREANM1");
					var houseNumber = cpProxyAddress.get("LOCHN1");
					var streetName = cpProxyAddress.get("StreetName");
					var unit = cpProxyAddress.get("LOCWSID1");
					var desc = cpProxyAddress.get("LOCDESC");
					
					cpResponse.put("RESP_PRX_PR_AREA_NAME", area ? area.getValue() : "");
					/** cpResponse.put("RESP_PRX_PR_AREA_2_NAME", cpProxyAddress.get("LOCAREANM2").getValue()); Need RESPONSE property from BAs **/
					cpResponse.put("RESP_PRX_STRNUM_PRI_TEXT", houseNumber ? houseNumber.getValue() : "");
					cpResponse.put("RESP_PRX_STRNAME_1_PRI_TEXT", streetName ? streetName.getValue() : "");
					cpResponse.put("RESP_PRX_UNIT_TEXT", unit ? unit.getValue() : "");
					cpResponse.put("RESP_PRX_PR_KMHM_TEXT", cpProxyAddress.get("KMHM").getValue());
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
				
				if(addressType == 'PRPO'){
					var poBox = cpProxyAddress.get("POBOX");
					
					cpResponse.put("RESP_PRX_POBOX_TEXT", poBox ? poBox.getValue() : "");
				}
				
				if(addressType == 'PRRR'){
					var rrDesc = cpProxyAddress.get("RRDescriptor");
					var desc = cpProxyAddress.get("LOCDESC");
					
					cpResponse.put("RESP_PRX_RR_DESC_TEXT", rrDesc ? rrDesc.getValue() : "");
					/** cpResponse.put("RESP_PRX_RR_NUM_TEXT", cpProxyAddress.get("RRNumber").getValue()); Need RESPONSE property from BAs **/
					/** cpResponse.put("RESP_PRX_RR_BOXID_TEXT", cpProxyAddress.get("RRBoxIDNumber").getValue()); Need RESPONSE property from BAs **/
					cpResponse.put("RESP_PRX_PHYS_DESC_TEXT", desc ? desc.getValue() : "");
				}
			}
			var isMU = cpLocationAddress.get("IsMultiUnit") ? cpLocationAddress.get("IsMultiUnit").getValue() : "";
			if(isMU == "false"){
				cpQuestFlags.put("NextSurveyQuestion","TypeOfProxy_QSTN");
			}else{
				cpQuestFlags.put("NextSurveyQuestion","MUAnyone_QSTN");
			}
		}
	}
  }
  catch(e) {
    console.log("ENUMCB FLOWACTION ERROR: " + e.message);
  }
}
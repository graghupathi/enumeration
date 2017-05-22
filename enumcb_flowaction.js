/*************************************************************************************************
*	Begin Pre/Post actions for question shapes
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/*Function to ensure ClientCache is updated with CurrentSurveyQuestion prior to UI Stream rendering*/  
function preFlowAction$DisplayQuestion(){
  var qName = pega.clientTools.getParamPage().get("QuestionName");
  /*alert("Question name from parameter page = <" + qName + ">");*/
  pega.ui.ClientCache.find("pyWorkPage").put("CurrentSurveyQuestion", qName);
}

/*
*	Created by: Dave
*	Used by CaseDetails screen
*	Called from flow action so syntax declared differently
*/
function preFlowAction$CaseDetails() {
  /*Stub for david to maybe do something with his life... maybe*/
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  ENUMCB.SetContactHistorySize();

  ENUMCB.SetIsPipeVisible();

  ENUMCB.SetCaseNotesSize();
  
  ENUMCB.SetInterviewAttemptSize();

  if (CB.isInPageList("DangerFlag","Red","pyWorkPage.CaseNotes")) {
    questFlags.put("IsCaseDetailsDangerVisible",true);
  } else {
    questFlags.put("IsCaseDetailsDangerVisible",false);
  }

  var CaseNotesPage  = pega.ui.ClientCache.find("caseNotesPage");
  if (CaseNotesPage) {
    CaseNotesPage.put("CaseText","");
  }
  pega.offline.runDataTransform("SetDisplayBeginInterview", "CB-FW-CensusFW-Work-Quest-Enum", null);
}


/*
* Post activity for IntroMU
* BY: Aditi Ashok
*/
function EnumCB_IntroMU_POST () {
	var isDKRefVisible = ENUMCB.getIsDKRefVisible();

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.Respondent.Response.IntroQuestionAnswer", "pyWorkPage.Respondent.DKRefused.Intro");
    } 
    else {
      ENUMCB.Required("pyWorkPage.Respondent.Response.IntroQuestionAnswer");
    }
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
	if (!workPage.hasMessages()) {
		 pega.offline.runDataTransform("EnumCB_IntroMU_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
	}
}

/*
*	Created by:: kyle GravelC
*	Used by CaseDetails screen
*	Called from flow action so syntax declared differently
*/
function postFlowAction$CaseDetails() {
  var d = new Date();
  var hours = d.getHours();

  if(hours >= 21 || hours < 9) {
    ENUMCB.CaseDetails_VLDN();
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {

    var CaseNotesPage = pega.ui.ClientCache.find("caseNotesPage");
    var CaseText = CaseNotesPage.get("CaseText");

    if (CaseText && CaseText.getValue().trim() != ""){
      CB.addCaseNote(CaseText.getValue());  
    }

    /*pega.offline.runDataTransform("CaseDetailsPost", "CB-FW-CensusFW-Work-Quest-Enum", null);*/
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    questFlags.put("HideAllFAButtons",false);
  }
}

/*
*	Pre Action for Count RI
*	Created by: Aditi Ashok
*/
function EnumCB_CountRI_PRE(){
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  
  ENUMCB.updateDKRefVisibilityfor2PropertiesRespondent("CountRINumber","CountRIUnitStatus");
  
  var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var exitNumber = response.get("H_SIZE_EST_NRFU_INT") ? response.get("H_SIZE_EST_NRFU_INT").getValue() : "";
  
  if (exitNumber != "" && parseInt(exitNumber,10) == 0) {
    response.put("H_SIZE_EST_NRFU_INT","");
  }
}

/*
*	Pre Action for TimeOfContact_QSTN
*	Created by Jeremy Helm
*   The pre is very basic and can be done by the transform
*/
function EnumCB_TimeOfContact_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","false");
  CB.toggleFlag("DKRFEnabled","false");
  try
  {
	pega.offline.runDataTransform("EnumCB_TimeOfContact_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);  
  }
  catch(e)
  {
	alert("Error in EnumCB_TimeOfContact_PRE ==> <" + e.getMessage() + ">");
  }
}

/*
*	Post Action for TimeOfContact_QSTN
*	Created by Jeremy Helm
*/
function EnumCB_TimeOfContact_POST() {
  ENUMCB.TimeOfContact_VLDN();
  try
  {
    var pyWP = pega.ui.ClientCache.find("pyWorkPage"); 
  	var DDT = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.DiscreteDateTime");
  	var year = DDT.get("Year").getValue();
  	var month = DDT.get("Month_txt").getValue();
  	var day = DDT.get("Day_txt").getValue();
  	var hour = DDT.get("Hour_txt").getValue();
  	var min = DDT.get("Minute_txt").getValue();
    var ampm = DDT.get("AM_PM").getValue();
    var tempISO = CB.ConvertSimpleTimeToISO_GMT(year,month,day,hour,min,"00",ampm);
    var curISO = CB.getCurrentPegaDate();
    
    if(tempISO.toString() > curISO.toString())
      {
        var errorMessage = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TimeOfContact_HARD");
        pyWP.addMessage(errorMessage);
        return;
      }
    
    var rr = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");

    var contactAttempts = pega.ui.ClientCache.find("pyWorkPage").get("ContactAttempts",[]); 
    var contactAttemp = pega.ui.ClientCache.createPage("ContactAttempt");
    if(contactAttempts)
    {
        contactAttemp.put("DateTime",tempISO);                 
        contactAttemp.put("AttemptType",rr.get("NRFU_ATTEMPT_TYPE_CODE").getValue());
        contactAttemp.put("EventCode",74);
        contactAttemp.put("EventCodeDescription","Field Verification");
        contactAttemp.put("RespType",rr.get("RESPTYPE_PROD").getValue());
    }
    contactAttempts.add().adoptJSON(contactAttemp.getJSON());
  }
  catch(e)
  {
	alert("Error in EnumCB_TimeOfContact_POST ==> <" + e.getMessage() + ">");
  }
}

/* Start Pre Action DateOfContact_QSTN | Created by Mike Squitieri ENUM3 */

function EnumCB_DateOfContact_PRE() {
  try {
    pega.offline.runDataTransform("EnumCB_DateOfContact_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);
  }
  catch(DTErr) {
    alert("Error in DateOfContact_PRE ==> " + DTErr.message);
  }
}

/* End Pre Action DateOfContact_QSTN */

/* Start Post Action for DateOfContact_QSTN | Created by Mike Squitieri ENUM3 */

function EnumCB_DateOfContact_POST() {
  try {
    ENUMCB.DateOfContact_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if(!workPage.hasMessages()) {
      pega.offline.runDataTransform("EnumCB_DateOfContact_POST","CB-FW-CensusFW-Work-Quest-Enum",null); 
    }     
  }
  catch(DTErr) {
    alert("Error in DateOfContact_POST: " + DTErr.message);
  }
}

/* End Post Action DateOfContact_QSTN */
function EnumCB_CountRI_POST(){ 
  
  /* reusing validation becuase of same properties*/
  ENUMCB.CountRI_VLDN();

  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {  
    pega.offline.runDataTransform("EnumCB_CountRI_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
	
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.CountRINumber", "pyWorkPage.HouseholdMemberTemp.Response.H_SIZE_EST_INT_NRFU_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.H_SIZE_EST_INT_NRFU_REF_IND");
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.CountRIUnitStatus", "pyWorkPage.HouseholdMemberTemp.Response.H_NRFU_STATUS_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.H_NRFU_STATUS_REF_IND");
  }
}

/*
*	Pre Action for AttemptType_QSTN 
*	Created by:Mike Hartel
*/
function EnumCB_AttemptType_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false"); 
}

/**
*	Pre action for RelationshipOther_QSTN
*	Created by: Omar Mohammed
**/
function EnumCB_RelationshipOther_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled","true");

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var rosterSize = questFlags.get("CurrentRosterSize").getValue();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var memIndex = householdRoster.get("CurrentHHMemberIndex").getValue();

 
  /*Determine the correct index of current member in roster*/
  if(isGoingBack=="true"){/*Got here by clicking Previous*/

    if(previousQuestion=="Sex_QSTN"){ /*start at end of roster*/
      memIndex=rosterSize;
    }
    else if(previousQuestion=="RelationshipOther_QSTN"){
      memIndex=memIndex-1;          
    } 		
  }
  else{/*Got here by clicking Next*/
    if(previousQuestion=="Home_QSTN" || previousQuestion=="Owner_QSTN" || previousQuestion=="Renter_QSTN"){
      memIndex=1; /*start at beginning of roster*/
    }		
  }  

  /*Now check to see if the memIndex is the Reference Person because we need to skip over the Reference Person*/
  var currMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember("+memIndex+")");
  var refPersonFlagProp = currMember.get("ReferencePersonFlag");
  if(refPersonFlagProp){
    var refPersonFlag= refPersonFlagProp.getValue();
  }
  else{
    var refPersonFlag= "";
  }

  if(refPersonFlag==true){
    if(isGoingBack=="true"){
      memIndex=memIndex-1;
    }
    else{
      memIndex=memIndex+1;
    }
  }

  householdRoster.put("CurrentHHMemberIndex", memIndex);
  CB.getMemberFromRoster(memIndex);  

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isFirstTimeRelOther = questFlags.get("IsFirstTimeRelOther").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
  var firstRelOtherIndex = questFlags.get("FirstMemberIndexForRelOther").getValue();
  if(currentMemberIndex == firstRelOtherIndex || isFirstTimeRelOther == "true") {
    questFlags.put("DisplayRelOtherInst", "true");
  }
  else {
    questFlags.put("DisplayRelOtherInst", "false");
  }
  ENUMCB.updateDKRefVisibility("RelationshipOther"); 
}

/**
*	Post action for RelationshipOther_QSTN
*	Created by: Omar Mohammed, mod AXJ
**/
function EnumCB_RelationshipOther_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RelationshipOther", "pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipOther");
    } 
    else {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RelationshipOther");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipOther", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var memberTempPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var respProp = memberTempPage.get("RelationshipOther");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      if(respProp == "SD") {
        questFlags.put("NextSurveyQuestion", "RelationSD_QSTN");
        var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
        CB.setMemberInRoster(curMemberIndex,false);
      }
      else if(respProp == "OT") {
        questFlags.put("NextSurveyQuestion", "RelationOT_QSTN");
        var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
        CB.setMemberInRoster(curMemberIndex,false);
      }
      else{
        ENUMCB.setRelTextInHouseholdMemberTemp("RelationshipOther","D_RelationshipOptions_ALL","RelationshipOther");
        var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
        respPage.put("P_REL_CODE", respProp);
        questFlags.put("NextSurveyQuestion", "");
        var params = {isFirstTimeProp: "IsFirstTimeRelOther"};
        ENUMCB.updateMemberIndexPost(params);
        ENUMCB.skipReferencePerson();

      }
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationshipOther_POST:" + e.message);*/
  }
}

/**
*	Pre action for RelationshipResp_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_RelationshipResp_PRE(){
  CB.toggleFlag("ExitSurveyEnabled","true");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHouseholdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");

  if(cpQuestFlags && cpHouseholdRoster && cpHouseholdMemberList){

    if(cpQuestFlags.get("IsGoingForward").getValue() == "true"){
      cpQuestFlags.put("SkipDec", "false");
    }
    var curRosterSize = cpHouseholdMemberList.size();
    var params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
    var curMemberIndex;
    if(cpQuestFlags.get("SkipDec").getValue() == "false"){
      curMemberIndex = ENUMCB.updateMemberIndexPre(params);
    }else{
      cpQuestFlags.put("SkipDec", "false");
    }
    var curMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember("+curMemberIndex+")");
    var referenceFlag = curMember.get("ReferencePersonFlag").getValue();

    /*If the household member is the reference person, increment/decrement*/
    if(referenceFlag == true){
      if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
        curMemberIndex = curMemberIndex - 1;
        if(curMemberIndex == 0){
          curMemberIndex = curRosterSize;
        }
      }else{
        curMemberIndex = curMemberIndex + 1;
      }
      cpHouseholdRoster.put("CurrentHHMemberIndex", curMemberIndex);
    }

    CB.getMemberFromRoster(curMemberIndex);

    /*DKRef*/
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("RelationshipResp");
  }
}


/**
*	Post action for RelationshipResp_QSTN
*	Created by: Dillon Irish, Jack McCloskey
**/
function EnumCB_RelationshipResp_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE", "pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var respProp = respPage.get("P_REL_CODE");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if(respProp == "SD") {
        questFlags.put("NextSurveyQuestion", "RelationSD_QSTN");
      }
      else if(respProp == "OT") {
        questFlags.put("NextSurveyQuestion", "RelationOT_QSTN");
      }
      else{
        ENUMCB.setRelTextInHouseholdMemberTemp("Response.P_REL_CODE","D_RelationshipOptions_ALL","RelationshipResp");
        ENUMCB.updateMemberIndexPost(params);
        questFlags.put("NextSurveyQuestion", "");
      }      
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationshipResp_POST:" + e.message);*/
  }
}

/*
*	Post Action for AttemptType_QSTN
*	Created by: Kyle Gravel, Jacob Zadnik, Aansh Kapadia
*/
function EnumCB_AttemptType_POST() {
  ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_ATTEMPT_TYPE_CODE");
  
  var workPage = pega.ui.ClientCache.find("pyWorkPage");	
  
  if(!workPage.hasMessages()) {  
	var responsePG = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
	var timestamp = CB.getCurrentPegaDate();
	responsePG.put("RESP_CONTACT_DATE",timestamp);

	var attemptType = responsePG.get("NRFU_ATTEMPT_TYPE_CODE") ? responsePG.get("NRFU_ATTEMPT_TYPE_CODE").getValue() : "";
	/*If attempt type is PV, set ATTACTUAL to PV*/
	if(attemptType == "PV") {
	  responsePG.put("ATTACTUAL",attemptType);
	}
	/*If attempt type is any of the telephone ways, set ATTACTUAL to "T"*/
	else if(attemptType == "TA" || attemptType == "TB" || attemptType == "TC") { 
	  responsePG.put("ATTACTUAL","T");		
	}  
	  
	/* Set NextSurveyQuestion based on response chosen */
	if(attemptType == "PV" || attemptType == "TA" || attemptType == "TB") { 
	  questFlags.put("NextSurveyQuestion","RespLocation_QSTN");
	}
	  
	else if(attemptType == "TC") {
	  questFlags.put("NextSurveyQuestion","DateOfContact_QSTN");
	}
	  
	else if(attemptType =="CA") {
	  questFlags.put("NextSurveyQuestion","CaseNotes_QSTN");
    }
  }
}

/*
*	Post Action for AttemptTypeRI_QSTN
*	Created by: Mike Hartel
*/
function EnumCB_AttemptTypeRI_POST() {
  ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_ATTEMPT_TYPE_CODE");
  
  var workPage = pega.ui.ClientCache.find("pyWorkPage");	
  
  if(!workPage.hasMessages()) {  
	var responsePG = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
	var timestamp = CB.getCurrentPegaDate();
	responsePG.put("RESP_CONTACT_DATE",timestamp);

	var attemptType = responsePG.get("NRFU_ATTEMPT_TYPE_CODE") ? responsePG.get("NRFU_ATTEMPT_TYPE_CODE").getValue() : "";
	/*If attempt type is PV, set ATTACTUAL to PV*/
	if(attemptType == "PV") {
	  responsePG.put("ATTACTUAL",attemptType);
	}
	/*If attempt type is any of the telephone ways, set ATTACTUAL to "T"*/
	else if(attemptType == "TA") { 
	  responsePG.put("ATTACTUAL","T");
      responsePG.put("RESP_TYPE_CODE", "HH");
      var workPage = pega.ui.ClientCache.find("pyWorkPage");
	}  
	  
	/* Set NextSurveyQuestion based on response chosen */
	if(attemptType == "PV"){ 
	  questFlags.put("NextSurveyQuestion","RespLocation_QSTN");
	}
	  
	else if(attemptType == "TA") {
	  questFlags.put("NextSurveyQuestion","NumberCalled_QSTN");
	}
	  
	else if(attemptType =="CA") {
	  questFlags.put("NextSurveyQuestion","CaseNotes_QSTN");
    }
  }
}
/*
*	Pre Action for AttemptTypeMU_QSTN 
*	Created by:Mark Coats
*/
function EnumCB_AttemptTypeMU_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false"); 
  /* Moving into PRE DT per code review US-9 - keeping here till I know it works.
  var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  var locName = "";
  if(locAddress)
  {
      var muName = locAddress.get("MUName")? locAddress.get("MUName").getValue() : "";
      if(muName == "")
      {
          var partialAddr = locAddress.get("PartialAddress")? locAddress.get("PartialAddress").getValue() : "";
          locName = partialAddr;
      }
      else
      {
          locName = muName;
      }
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  workPage.put("pyTempText", locName);
  */
  try
  {
      pega.offline.runDataTransform("EnumCB_AttemptTypeMU_PRE", "CB-FW-CensusFW-Work-Quest-Enum", null);    
  }
  catch(DTErr)
  {
      alert("Error calling AttemptTypeMU_PRE ==> <" + DTErr.message + ">" );
  }
}
/*
*	Post Action for AttemptType_QSTN for MU Flow
*	Created by: Mark Coats
*/
function EnumCB_AttemptTypeMU_POST()
{
    try
    {
        ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_ATTEMPT_TYPE_CODE");  
        var workPage = pega.ui.ClientCache.find("pyWorkPage");	 
        if(!workPage.hasMessages())
        {
			var responsePG = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
            var timestamp = CB.getCurrentPegaDate();
            responsePG.put("RESP_CONTACT_DATE",timestamp);
            pega.offline.runDataTransform("EnumCB_AttemptTypeMU_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
        }
    }
    catch(Err)
    {
        alert("Error in AttemptTypeMU_POST ==> <" + Err.getMessage() + ">");
    }
}
/*
*	Pre Action for ProxyAlerts_QSTN 
*	Created by:Mark Coats
*/
function EnumCB_ProxyAlerts_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false"); 
  try
  {
      var prevProxyLocations = pega.ui.ClientCache.find("pyWorkPage.PreviousProxyAttemptAddresses");
      var prevAddrText = "";
      if(prevProxyLocations)
      {
          var prevProxyIter = prevProxyLocations.iterator();
          while(prevProxyIter.hasNext())
          {
             var curAddrText = "";
             var curPrevProxyAddr = prevProxyIter.next();
             if(curPrevProxyAddr)
             {
                 var addrType = curPrevProxyAddr.get("AddrType")? curPrevProxyAddr.get("AddrType").getValue() : "";
                 var desc = curPrevProxyAddr.get("LOCDESC")? curPrevProxyAddr.get("LOCDESC").getValue() : "";
                 var addrNum = curPrevProxyAddr.get("LOCHN")? curPrevProxyAddr.get("LOCHN").getValue() : "";
                 var streetName = curPrevProxyAddr.get("StreetName")? curPrevProxyAddr.get("StreetName").getValue() : "";
                 var aptNum = curPrevProxyAddr.get("LOCWSID1")? curPrevProxyAddr.get("LOCWSID1").getValue() : "";
                 if(addrType.startsWith("PR"))
                 {
                     var prAddrType = curPrevProxyAddr.get("PRAddressType")? curPrevProxyAddr.get("PRAddressType").getValue() : "";
                     if(prAddrType == "PRGA")
                     {
                         if(streetName != "" || addrNum != "")
                         {
                            curAddrText = addrNum + " " + streetName + " " + aptNum;
                            if(desc != "")
                            {
                                curAddrText = curAddrText + "<br/>" + desc;
                            }
                         }
                         else if(desc != "")
                         {
                            curAddrText = desc;
                         }
                     }
                     else if(prAddrType == "PRUA")
                     {
                         var locURB = curPrevProxyAddr.get("LOCURB")? curPrevProxyAddr.get("LOCURB").getValue() : "";
                         if(locURB != "")
                         {
                            curAddrText = locURB + "<br/>" + addrNum + " " + streetName + " " + aptNum;
                            if(desc != "")
                            {
                                curAddrText = curAddrText + "<br/>" + desc;
                            }
                         }
                         else if(desc != "")
                         {
                            curAddrText = desc;
                         }
                     }
                     else if(prAddrType == "PRAC")
                     {
                         var aptName = curPrevProxyAddr.get("LOCAPTCOMPLEX")? curPrevProxyAddr.get("LOCAPTCOMPLEX").getValue() : "";
                         var bldDesc = curPrevProxyAddr.get("BuildingDescriptor")? curPrevProxyAddr.get("BuildingDescriptor").getValue() : "";
                         var bldID = curPrevProxyAddr.get("LOCBLDGID")? curPrevProxyAddr.get("LOCBLDGID").getValue() : "";
                         if(aptName != "")
                         {
                            curAddrText = aptName + "<br/>" + addrNum + " " + streetName + " " + bldDesc + " " + bldID + " " + aptNum;
                            if(desc != "")
                            {
                                curAddrText = curAddrText + "<br/>" + desc;
                            }
                         }
                         else if(desc != "")
                         {
                            curAddrText = desc;
                         }                       
                     }
                     else if(prAddrType == "PRRR")
                     {
                         var rrDescriptor = curPrevProxyAddr.get("RRDescriptor")? curPrevProxyAddr.get("RRDescriptor").getValue() : "";
                         var rrNumber = curPrevProxyAddr.get("RRNumber")? curPrevProxyAddr.get("RRNumber").getValue() : "";
                         var rrboxIdNum = curPrevProxyAddr.get("RRBoxIDNumber")? curPrevProxyAddr.get("RRBoxIDNumber").getValue() : "";
                         if(rrNumber != "" || rrboxIdNum != "")
                         {
                             curAddrText = rrDescriptor + " " + rrNumber + " " + rrboxIdNum;
                             if(desc != "")
                             {
                                 curAddrText = curAddrText + "<br/>" + desc;
                             }
                         }
                         else if(desc != "")
                         {
                             curAddrText = desc;
                         }
                     }
                     else if(prAddrType == "PRAA")
                     {
                         var an1 = curPrevProxyAddr.get("LOCAREANM1")? curPrevProxyAddr.get("LOCAREANM1").getValue() : "";
                         var an2 = curPrevProxyAddr.get("LOCAREANM2")? curPrevProxyAddr.get("LOCAREANM2").getValue() : "";
                         var KMHM = curPrevProxyAddr.get("KMHM")? curPrevProxyAddr.get("KMHM").getValue() : "";
                         if(an1 != "")
                         {
                             curAddrText = an1 + " " + an2 + " " + addrNum + "<br/>" + streetName + " " + aptNum + " " + KMHM;
                             if(desc != "")
                             {
                                 curAddrText = curAddrText + "<br/>" + desc;
                             }
                         }
                         else if(desc != "")
                         {
                             curAddrText = desc;
                         }
                     }
                     else if(prAddrType == "PROT")
                     {
                         var prot = curPrevProxyAddr.get("OtherText")? curPrevProxyAddr.get("OtherText").getValue() : "";
                         if(prot != "")
                         {
                             curAddrText = prot;
                         }
                     }
                 }
                 else
                 {            
                     var ssAddrType = curPrevProxyAddr.get("SSAddressType")? curPrevProxyAddr.get("SSAddressType").getValue() : "";
                     if(ssAddrType == "USSA")
                     {
                         if(streetName != "" || addrNum != "")
                         {
                            curAddrText = addrNum + " " + streetName + " " + aptNum;
                            if(desc != "")
                            {
                                curAddrText = curAddrText + "<br/>" + desc;
                            }
                         }
                         else if(desc != "")
                         {
                            curAddrText = desc;
                         }
                     }
                     else if(ssAddrType == "USRR")
                     {
                         var rrDescriptor = curPrevProxyAddr.get("RRDescriptor")? curPrevProxyAddr.get("RRDescriptor").getValue() : "";
                         var rrNumber = curPrevProxyAddr.get("RRNumber")? curPrevProxyAddr.get("RRNumber").getValue() : "";
                         var rrboxIdNum = curPrevProxyAddr.get("RRBoxIDNumber")? curPrevProxyAddr.get("RRBoxIDNumber").getValue() : "";
                         if(rrNumber != "" || rrboxIdNum != "")
                         {
                             curAddrText = rrDescriptor + " " + rrNumber + " " + rrboxIdNum;
                             if(desc != "")
                             {
                                 curAddrText = curAddrText + "<br/>" + desc;
                             }
                         }
                         else if(desc != "")
                         {
                             curAddrText = desc;
                         }
                     }
                     else if(ssAddrType == "USOT")
                     {
                         var ssot = curPrevProxyAddr.get("OtherText")? curPrevProxyAddr.get("OtherText").getValue() : "";
                         if(ssot != "")
                         {
                             curAddrText = ssot;
                         }
                     }
                 }
                 if(curAddrText != "")
                 {
                     if(prevAddrText == "")
                     {
                         prevAddrText = curAddrText;
                     }
                     else
                     {
                         prevAddrText = prevAddrText + "<br/><br/>" + curAddrText;
                     }
                 }
             }
          }
      }
      if(prevAddrText != "")
      {
	      var msgStart = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "ProxyAlerts3_INST");
          var msgEnd = "<br/><br/></div>";
          /*
          var tempText = "<div class=\"field-item dataLabelRead usds_question_text_dataLabelRead\">Listed in order from oldest to most recent:<br/><br/>" +
              prevAddrText + "</div>";
          */
          var tempText = "<div class=\"field-item dataLabelRead usds_question_text_dataLabelRead\">" + msgStart + "<br/><br/>" + prevAddrText + msgEnd;
          var pyWorkPage = pega.ui.ClientCache.find("pyWorkPage");
          pyWorkPage.put("pyTempText", tempText);
      }
  }
  catch(Err)
  {
      alert("Error in ProxyAlerts_PRE ==> <" + Err.getMessage() + ">");
  }
}
/*
*	Post Action for ProxyAlerts_QSTN for MU Flow
*	Created by: Mark Coats
*/
function EnumCB_ProxyAlerts_POST()
{
    try
    {
	   ENUMCB.Required("pyWorkPage.Respondent.ProxyAlertsResponse");
	   var pyWorkPage = pega.ui.ClientCache.find("pyWorkPage");
       if(!pyWorkPage.hasMessages())
       {
           pega.offline.runDataTransform("EnumCB_ProxyAlerts_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
       }
    }
    catch(Err)
    {
        alert("Error in ProxyAlerts_POST ==> <" + Err.getMessage() + ">");
    }
}
/*
*	Pre Action for ProxyLocation_QSTN 
*	Created by:Mark Coats
*/
function EnumCB_ProxyLocation_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false"); 
  try
  {
  	  var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  	  var qFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var addrType = locAddress.get("AddrType")? locAddress.get("AddrType").getValue() : "";
      if(addrType.startsWith("PR"))
      {
         qFlags.put("IsPuertoRico", "true");
      }
      else
      {        
         qFlags.put("IsPuertoRico", "false");
      }
      pega.offline.runDataTransform("EnumCB_ProxyLocation_PRE", "CB-FW-CensusFW-Work-Quest-Enum", null);    
  }
  catch(DTErr)
  {
      alert("Error calling ProxyLocation_PRE ==> <" + DTErr.getMessage() + ">" );
  }
}
/*
*	Post Action for ProxyLocation_QSTN for MU Flow
*	Created by: Mark Coats
*/
function EnumCB_ProxyLocation_POST()
{
    try
    {
	  ENUMCB.ProxyLocation_VLDN();
      var pyWorkPage = pega.ui.ClientCache.find("pyWorkPage");
      if(!pyWorkPage.hasMessages())
      {
      	  pega.offline.runDataTransform("EnumCB_ProxyLocation_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
      }
    }
    catch(Err)
    {
        alert("Error in ProxyLocation_POST ==> <" + Err.getMessage() + ">");
    }
}
/*
*	Pre Action for AttemptTypeMU_QSTM 
*	Created by:Mark Coats
*/
function EnumCB_DialOutcomeMU_PRE(){
    try
    {
        pega.offline.runDataTransform("EnumCB_DialOutcomeMU_PRE", "CB-FW-CensusFW-Work-Quest-Enum", null);
    }
    catch(Err)
    {
        alert("Error in EnumCB_DialOutcomeMU_PRE ==> <" + Err.getMessage() + ">");
    }
}
/*
*	Post Action for AttemptType_QSTN for MU Flow
*	Created by: Mark Coats
*/
function EnumCB_DialOutcomeMU_POST()
{
    try
    {
        pega.offline.runDataTransform("EnumCB_DialOutcomeMU_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
    }
    catch(Err)
    {
        alert("Error in EnumCB_DialOutcomeMU_POST ==> <" + Err.getMessage() + ">");
    }
}

/*
*	Pre Action for DialOutcome_QSTN
*	Created by: Dillon Irish
*/
function EnumCB_DialOutcome_PRE(){
    try
    {
      CB.toggleFlag("DKRFEnabled", "false");
      CB.toggleFlag("ExitSurveyEnabled","true");
	  pega.offline.runDataTransform("PopulateDialOutcomeOptions", "Code-Pega-List", "D_DialOutcomeOptions");

      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var currentIndex = cpQuestFlags.get("CurrentTelephoneIndex") ? cpQuestFlags.get("CurrentTelephoneIndex").getValue() : ""; /*remove test value*/
      var cpTelephone =  pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers(" + currentIndex +")");
      var currentLabel = cpTelephone.get("pyLabel") ? cpTelephone.get("pyLabel").getValue() : "";
	  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
      cpQuestFlags.put("CurrentTelephoneLabel", currentLabel);
	  var previousQuestion = cpQuestFlags.get("PreviousQuestion") ? cpQuestFlags.get("PreviousQuestion").getValue() : "";
	  if(previousQuestion != "VerifyDialedNumber_QSTN"){
		cpResponse.put("NRFU_PH_OUTCOME_CODE", "");
	  }
    }
    catch(Err)
    {
        alert("Error in EnumCB_DialOutcome_PRE ==> <" + Err.getMessage() + ">");
    }
}

/*
*	Post Action for DialOutcome_QSTN 
*	Created by: Dillon Irish
*/
function EnumCB_DialOutcome_POST()
{
    try
    {
        /*pega.offline.runDataTransform("EnumCB_DialOutcome_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);*/
		var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
		var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
		var cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
		
		var outcomeCode = cpResponse.get("NRFU_PH_OUTCOME_CODE") ? cpResponse.get("NRFU_PH_OUTCOME_CODE").getValue() : "";
		
		ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_PH_OUTCOME_CODE");
	
		var isRI = cpWorkPage.get("IsReInterview") ? cpWorkPage.get("IsReInterview").getValue() : "";
		if(outcomeCode == "17"){
			var textInput = cpQuestFlags.get("DialOutcomeText") ? cpQuestFlags.get("DialOutcomeText").getValue() : "";
			if(textInput == ""){
				var errorMessage = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "DialOutcomeOther_HARD");
				cpWorkPage.addMessage(errorMessage);
			}
		}
		cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
		if(!cpWorkPage.hasMessages()){
			/*Set Phonecat*/
			var currentIndex = cpQuestFlags.get("CurrentTelephoneIndex") ? cpQuestFlags.get("CurrentTelephoneIndex").getValue() : ""; /*remove test value*/
			var cpTelephone =  pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers(" + currentIndex +")");
			if(outcomeCode == 1){
				/* Phonecat = G */
				cpTelephone.put("PHONECAT", "G");
			}else if((outcomeCode > 1 && outcomeCode < 9) || outcomeCode == 10 || (outcomeCode > 12 && outcomeCode < 16) || outcomeCode == 17){
				/*Phonecat = I*/
				cpTelephone.put("PHONECAT", "I");
			}else if(outcomeCode == 9 || outcomeCode == 11 || outcomeCode == 12 || outcomeCode == 16){
				/*Phonecat = B*/
				cpTelephone.put("PHONECAT", "B");
			}
			
			var otherNumbers = ENUMCB.OtherMatchingPhoneAssoc(isRI);
			var dialOutcomeNewMis = cpQuestFlags.get("DialOutcomeNewMis") ? cpQuestFlags.get("DialOutcomeNewMis").getValue() : "";
			if(isRI == "true"){
				if(outcomeCode == 1){
					cpQuestFlags.put("NextSurveyQuestion", "IntroRI_QSTN");
				}else if(otherNumbers == "true"){
					cpQuestFlags.put("NextSurveyQuestion", "NumberCalled_QSTN");
					cpTelephone.put("Attempted", "true");
				}else if((outcomeCode == 5 || outcomeCode == 16) && dialOutcomeNewMis != "true"){
					cpQuestFlags.put("NextSurveyQuestion", "NumberCalled_QSTN");
					cpQuestFlags.put("DialOutcomeNewMis", "true");
					cpTelephone.put("Attempted", "true");
				}else{
					cpQuestFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");
				}
			}else{	
				if(outcomeCode == 1){
					cpQuestFlags.put("NextSurveyQuestion", "VerifyDialedNumber_QSTN");
				}else if(outcomeCode == 3){
					cpQuestFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");
				} else if(otherNumbers == "true"){
					cpQuestFlags.put("NextSurveyQuestion", "NumberCalled_QSTN");
					cpTelephone.put("Attempted", "true");
				}else if((outcomeCode == 5 || outcomeCode == 16) && dialOutcomeNewMis != "true"){
					cpQuestFlags.put("NextSurveyQuestion", "NumberCalled_QSTN");
					cpQuestFlags.put("DialOutcomeNewMis", "true");
					cpTelephone.put("Attempted", "true");
				}else{
					cpQuestFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");
				}
			
			}
		}
	}
    catch(Err)
    {
        alert("Error in EnumCB_DialOutcome_POST ==> <" + Err.getMessage() + ">");
    }
}
/*
*	Pre Action for UnableToAttemptMU_QSTN 
*	Created by:Mark Coats
*/
function EnumCB_UnableToAttemptMU_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false"); 
  /* Taking this out per code review on US-357, but leaving it in here till I know that calling PRE DT works
  var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  var locName = "";
  if(locAddress)
  {
      var muName = locAddress.get("MUName")? locAddress.get("MUName").getValue() : "";
      if(muName == "")
      {
          var partialAddr = locAddress.get("PartialAddress")? locAddress.get("PartialAddress").getValue() : "";
          locName = partialAddr;
      }
      else
      {
          locName = muName;
      }
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  workPage.put("pyTempText", locName);
  */
  try
  {     
       pega.offline.runDataTransform("EnumCB_UnableToAttemptMU_PRE", "CB-FW-CensusFW-Work-Quest-Enum", null);
  }
  catch(DTErr)
  {
      alert("Error calling EnumCB_UnableToAttemptMU_PRE DataTransform ==> <" + DTErr.message + ">");
  }
}
/*
*	Post Action for UnableToAttemptMU_QSTN for MU Flow
*	Created by: Mark Coats
*/
function EnumCB_UnableToAttemptMU_POST()
{
    try
    {
        ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_UNABLE_MU_CODE");  
        var workPage = pega.ui.ClientCache.find("pyWorkPage");	 
        if(!workPage.hasMessages())
        {
            pega.offline.runDataTransform("EnumCB_UnableToAttemptMU_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
        }
    }
    catch(Err)
    {
        alert("Error in UnableToAttemptMU_POST ==> <" + Err.getMessage() + ">");
    }
}

/**
 * Pre Action for RespLocation_QSTN disabled the DK/REF button as well as the Exit Survey button
 * Created by: Kyle Gravel
 * Also makes call to get the Operators current GPS coordinates
 * Updated by: Taylor Hunter
 */
function EnumCB_RespLocation_PRE() {
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled", "false");
  /*D_RespLocationOptions();*/
  /*
  pega.u.d.evaluateClientConditions();
  */

 ENUMCB.findCurrentLocation();
}

/**
*	Post Action for RespLocation_QSTN to set flag values based on question answer
*	Toggles DKRFEnabled as well as ExitSurvey
*	Created by: Kyle Gravel
* Updated by: Taylor Hunter
*/
function EnumCB_RespLocation_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.Response.RESPONSE_LOCATION_CODE", "RespLocation");
  }
  else {
    ENUMCB.Required("pyWorkPage.Respondent.Response.RESPONSE_LOCATION_CODE");
  }

  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    /*Grab all necessary properties*/
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var responseTMP = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var attactual = responseTMP.get("ATTACTUAL"); attactual = attactual ? attactual.getValue() : "";
    var respLocANSR = responseTMP.get("RESPONSE_LOCATION_CODE"); respLocANSR = respLocANSR ? respLocANSR.getValue() : "";
    var isReinterview = workPage.get("IsReInterview"); isReinterview = isReinterview ? isReinterview.getValue() : "";

    if (respLocANSR == "1") {
      responseTMP.put("RESP_TYPE_CODE", "HH");
      CB.toggleFlag("DKRFEnabled", "true");
      CB.toggleFlag("ExitSurveyEnabled", "true");

    } else if (respLocANSR == "2") {
      responseTMP.put("RESP_TYPE_CODE", "proxy");
      CB.toggleFlag("DKRFEnabled", "true");
      CB.toggleFlag("ExitSurveyEnabled", "true");
    }

    var dist = 0;
    if (isReinterview == "true" || (attactual == "PV" && respLocANSR == "1")) {
      var householdLocation;
      try {
        if (pega.ui.ClientCache.find("pyWorkPage.Respondent.Response").get("RESPTYPE_PROD").getValue() == 'proxy') {
          householdLocation = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
        } else {
          householdLocation = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
        }

        var destinationLat = parseFloat(householdLocation.get("OFLAT").getValue());
        var destinationLon = parseFloat(householdLocation.get("OFLON").getValue());
        var mobileLat = parseFloat(questFlags.get("MobileLat").getValue());
        var mobileLon = parseFloat(questFlags.get("MobileLon").getValue());

        dist = findGeographicalDistance(destinationLat, destinationLon, mobileLat, mobileLon);
      } catch (err) {
        console.log(err.message);
      }
    }
    questFlags.put("Distance", dist);
    pega.offline.runDataTransform("SetRespLocationNextSurveyQuestion", "CB-FW-CensusFW-Work-Quest-Enum", null);
    
  }
}

/*
*	Pre Action for RespName_QSTN
*/
function EnumCB_RespName_PRE() {
  CB.toggleFlag("DKRFEnabled", "false");  
  CB.toggleFlag("ExitSurveyEnabled", "true");
}

/*	
*	Post Action for RespName_QSTN to validate values based on question answer
	Created by: Omar Mohammed
*/
function EnumCB_RespName_POST() {
  if(pega.mobile.isHybrid) {
    ENUMCB.updateDisabledDKRefColor();

    ENUMCB_RespName_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    /**This block enables the DKRef a long as there are no error messages and we can move forward **/
    if(!workPage.hasMessages()) {
      CB.toggleFlag("DKRFEnabled","true");
    }

  }
}

/**
*   Pre action for Resp Phone
*   Created by: Omar Mohammed
*/
function EnumCB_RespPhone_PRE() {
  if(pega.mobile.isHybrid) {
    ENUMCB.updateDKRefVisibility("RespPhone", "pyWorkPage.Respondent.DKRefused");
    CB.toggleFlag("DKRFEnabled", "true");
    CB.toggleFlag("ExitSurveyEnabled", "true");
  }  
}

/**
*	Post action for Resp Phone to copy temp phone into RESP_PH_NUMBER_TEXT
*	
*	Created by: Mike Hartel
*/
function EnumCB_RespPhone_POST() {  
    
  ENUMCB.RespPhone_VLDN();  
  var workPage = pega.ui.ClientCache.find("pyWorkPage"); 
  if(!workPage.hasMessages()){
    var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");  
	var selection = workPage.get("Respondent.RespPhoneSelectedNumber").getValue();
	if(selection === "-1") {
		var respPhoneNewNumber = workPage.get("Respondent.RespPhoneNewNumber").getValue();
		workPage = pega.ui.ClientCache.find("pyWorkPage");		
		respPage.put("RESP_PH_NUMBER_TEXT", respPhoneNewNumber);
		ENUMCB.appendDistinctNumberToTelephoneNumbersList(respPhoneNewNumber, "HH");		
	}
	else
	{
		respPage.put("RESP_PH_NUMBER_TEXT", selection);
	}  
  ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.RespPhone", "pyWorkPage.Respondent.Response.RESP_PH_DK_IND", "pyWorkPage.Respondent.Response.RESP_PH_REF_IND");
  }
}

/*
*	Pre Action for Eligible Respondent
*	Created by: Mike Hartel
*/
function EnumCB_EligibleRespondent_PRE(){  
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("EligibleResp", "pyWorkPage.Respondent.DKRefused");
}

/*
*	Post Action for Eligible Respondent
*	Created by: Kyle Gravel
*   Updated by: Mike Squitieri
*/
function EnumCB_EligibleRespondent_POST(){  
  ENUMCB.EligibleRespondent_VLDN();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()){
  	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  	var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  	var eligibleRespDKRef = dkRefPage.get("EligibleResp");
	eligibleRespDKRef = eligibleRespDKRef ? eligibleRespDKRef.getValue() : "";
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var respEligibilityCode = responsePage.get("NRFU_RESP_ELIG_CODE");
    respEligibilityCode = respEligibilityCode ? respEligibilityCode.getValue() : "";
  	
    if(eligibleRespDKRef == "D" || eligibleRespDKRef == "R"){
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }else if(respEligibilityCode=="1"){
      questFlags.put("NextSurveyQuestion","Address_QSTN");
    }else if(respEligibilityCode=="2"){
      responsePage.put("RESP_TYPE_CODE","proxy");
      questFlags.put("NextSurveyQuestion","Anyone_QSTN");
    }else if(respEligibilityCode=="0"){
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }else{
      questFlags.put("NextSurveyQuestion","NoComplete_QSTN");
    }
  }
}

/*
*	Pre Action Address_QSTN to disable DK
*	Created by: Kyle Gravel
*/
function EnumCB_Address_PRE() {
  ENUMCB.updateDKRefVisibility("Address", "pyWorkPage.Respondent.DKRefused");
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
}


/*
*	Post Action for Address_QSTN to set RESP_TYPE_CODE accordingly
*	Re-Enable DK
*	Created by: Kyle Gravel
*	Updateed by: Taylor Hunter
*/
function EnumCB_Address_POST() {

  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.Respondent.Response.IsCensusDayAddress", "pyWorkPage.Respondent.DKRefused.Address", "PleaseProvideAnAnswer");
    } else {
      ENUMCB.Required("pyWorkPage.Respondent.Response.IsCensusDayAddress");
    }

    pega.offline.runDataTransform("EnumCB_Address_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);

  } catch (e) {
    console.log("***ENUMCB Error - " + e.message);
  }
}

/*
*	Post Action for INTRO_QSTN to set RESP_TYPE_CODE accordingly
*	Created by: Ramin Moghtadernejad, Dillon Irish
*/
function EnumCB_Intro_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if(isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.Response.IntroQuestionAnswer", "pyWorkPage.Respondent.DKRefused.Intro");
  }
  else {
    ENUMCB.Required("pyWorkPage.Respondent.Response.IntroQuestionAnswer");
  }
  /*
	Online-Capability set in:   PostIntroScreenAction  from:  Intro_QSTN   Simple Question
	*/
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var responseTMP = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response"); 

  var respLocANSR = responseTMP.get("RESPONSE_LOCATION_CODE"); /* Changed from RESP_LOCATION_CODE*/
  respLocANSR = respLocANSR ? respLocANSR.getValue() : "";
  var introQstnANSR = responseTMP.get("IntroQuestionAnswer");
  introQstnANSR = introQstnANSR ? introQstnANSR.getValue() : "";
  var attempTypeQstnANSR = responseTMP.get("NRFU_ATTEMPT_TYPE_CODE"); 
  attempTypeQstnANSR = attempTypeQstnANSR ? attempTypeQstnANSR.getValue() : "";

  var respTypeCode = responseTMP.get("RESP_TYPE_CODE");
  respTypeCode = respTypeCode ? respTypeCode.getValue() : "";
  var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  var introDK = dkRefPage.get("Intro");
  introDK = introDK ? introDK.getValue() : "";
  
  alert(attempTypeQstnANSR);
  alert(respTypeCode);

  if((attempTypeQstnANSR == "PV") && (respTypeCode == "HH")) {
    if(introQstnANSR == "Yes") {
      questFlags.put("NextSurveyQuestion","EligibleResp_QSTN");
    }
    else if(introQstnANSR == "No") {
      questFlags.put("NextSurveyQuestion","KnowAddress_QSTN");
    }
    else if(introQstnANSR == "NoAnswer") {
      questFlags.put("NextSurveyQuestion","PersonalNonContact_QSTN");
    }
    else if(introQstnANSR == "ContactMade") {
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }
    else if(introDK == "D" || introDK == "R") {
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }
  }
  else if((attempTypeQstnANSR == "TA" || attempTypeQstnANSR == "TB" || attempTypeQstnANSR == "PV") && (respTypeCode == "proxy")) {
    if(introQstnANSR == "Yes") {
      questFlags.put("NextSurveyQuestion","Anyone_QSTN");
    }
    else if(introQstnANSR == "No") {
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }
    else if(introQstnANSR == "NotHousing") {
      questFlags.put("NextSurveyQuestion","SpecificUnitStatus_QSTN");
    }
    else if(introQstnANSR == "NoContact") {
      questFlags.put("NextSurveyQuestion","TypeOfProxy_QSTN");
    }
    else if(introDK == "D" || introDK == "R") {
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }
  }
  else if((attempTypeQstnANSR == "TA" || attempTypeQstnANSR == "TB") && (respTypeCode == "HH")) {
    if(introQstnANSR == "Yes") {
      questFlags.put("NextSurveyQuestion","EligibleResp_QSTN");
    }
    else if(introQstnANSR == "No") {
      questFlags.put("NextSurveyQuestion","KnowAddress_QSTN");
    }
    else if(introQstnANSR == "UnableToInterview") {
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }
    else if(introDK == "D" || introDK == "R") {
      questFlags.put("NextSurveyQuestion","ExitPopStatus_QSTN");
    }
  }

  /*Set Response class values based on location code, intro answer, and attempt type code*/
  if((respLocANSR=="1") && (attempTypeQstnANSR=="PV")) {
    if(introQstnANSR=="No"){
      responseTMP.put("RESP_TYPE_CODE","proxy");
      responseTMP.put("NRFU_FIND_ADR_NO_IND", "false");
      responseTMP.put("NRFU_FIND_ADR_YES_IND", "");
    } 
    else {
      responseTMP.put("NRFU_FIND_ADR_NO_IND", "");
      responseTMP.put("NRFU_FIND_ADR_YES_IND", "true");
    }
  }
}

/*
* Pre Action for Popcount
* Created by Qaiser Fayyaz
*/
function EnumCB_Popcount_PRE() {
  if(pega.mobile.isHybrid) {
    ENUMCB.removeSoftError();
    ENUMCB.updateDKRefVisibility("Popcount", "pyWorkPage.Respondent.DKRefused");
    CB.toggleFlag("ExitSurveyEnabled", "true");
    CB.toggleFlag("DKRFEnabled", "true");
    /* When going back set Respondent to HouseholdMemberTemp 
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isGoingBack = questFlags.get("IsGoingBack").getValue();
    if(isGoingBack=="true") {
      var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
      var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      householdMemberTemp.adoptJSON(respondentPage.getJSON()); 
    }
    */
    var softEditPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.SoftEditVLDN");
    softEditPage.put("PopcountFlag", "false");
  }
  else {
    var setProp = pega.u.d.setProperty("pyWorkPage.Respondent.Response.SoftEditVLDN.PopcountFlag", false);
  } 
}

/*
* Post Action for Popcount
* Created by Qaiser Fayyaz
* Modified by Jared Nichols - 4/3/17 Added logic for RI and refactored
*/
function EnumCB_Popcount_POST() {    
    try
    {
      ENUMCB.Popcount_VLDN();

      var workPage = pega.ui.ClientCache.find("pyWorkPage"); 
      if(!workPage.hasMessages()){
          ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.Popcount", "pyWorkPage.Respondent.Response.H_SIZE_STATED_DK_IND", "pyWorkPage.Respondent.Response.H_SIZE_STATED_REF_IND");
              pega.offline.runDataTransform("SetPopcountNextQuestion","CB-FW-CensusFW-Work-Quest-Enum",null);

		  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
          if(cpResponse)
          {
              var isReInterview = workPage.get("IsReInterview")? workPage.get("IsReInterview").getValue() : "false";
              var respType;
              if(isReInterview == "true")
              {
                  respType = cpResponse.get("RESPTYPE_PROD") ? cpResponse.get("RESPTYPE_PROD").getValue() : "";
              }
              else
              {
                  restType = cpResponse.get("RESP_TYPE_CODE")? cpResponse.get("RESP_TYPE_CODE").getValue() : "";
              }
              if(respType != "proxy")
              {
                  ENUMCB.CopyRespondentToRoster();

                  /*The following step is for testing*/
                  TEST_AddTestMembersToRoster();
              }
          }
      }
    }
    catch(e)
    {
      alert("Popcount_POST ==> <" + e.message + ">");
    }
}

/* US-27  and US-1400
*  Pre Action for Undercount
*  Created by David Bourque
*  update  by Ramin Moghtadernejad
*  Update  by Domenic Giancola
*/
function EnumCB_Undercount_Pre() {
  try
  {
    ENUMCB.removeSoftError();
    CB.toggleFlag("DKRFEnabled", "true");
    CB.toggleFlag("ExitSurveyEnabled", "true");
    ENUMCB.updateDKRefVisibility("Undercount");
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    /* property for checking how many screens behind the newest Undercount screen  */
    var undercountPreviousCounter = questFlagsPage.get("UndercountPreviousCounter");
    /* property which stores the current undercount screen number */
    var undercountCurrentScreenIndex = questFlagsPage.get("UndercountCurrentScreenIndex");   
    /* property which stores the size of the roster when entering the undercount screen */
    var undercountStartingRosterIndex = questFlagsPage.get("UndercountStartingRosterIndex");  
    /* Flag used as workaround for product bug, flag used to tell if we are on a previously seen undercount screen */
    var isUndercountPreviousFlag = questFlagsPage.get("IsUndercountPreviousFlag");
    if (isUndercountPreviousFlag) {
      /* reset value of flag */
      isUndercountPreviousFlag.setValue("false");
    }

    /* check if exists */
    if (undercountPreviousCounter &&  undercountCurrentScreenIndex && undercountStartingRosterIndex)
    {
      /*   Undercount Pre - First time     */
      if ( parseInt(undercountPreviousCounter.getValue()) == 0  && parseInt(undercountCurrentScreenIndex.getValue())  <= 0){

        /* Get roster cache  */
        var householdRosterMember= pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");  
          if(!householdRosterMember)
          {
              householdRosterMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster").put("HouseholdMember",[]); 
          }
          if (householdRosterMember){

          /* get roster size */
          var sizeOfIndex  = householdRosterMember.size(); 
          questFlagsPage.put("CurrentRosterSize", sizeOfIndex); 
          undercountStartingRosterIndex.setValue(sizeOfIndex); 
        }

        /* initializing screen index */
        undercountCurrentScreenIndex.setValue(1);


        /* Clear House Hold temp   - reCreate  */
        CB.clearHouseholdMemberTemp();
      }

      /* Flag used to tell is previous button was used to enter screen */
      var isGoingBack = questFlagsPage.get("IsGoingBack");
      /* Flag containing response data(yes or no) for undercount screen */
      var hasAdditionalUndercount = questFlagsPage.get("HasAdditionalUndercount");
      if (hasAdditionalUndercount) {
        if (isGoingBack.getValue() == "true") {

          /* If previous button was used to enter screen set values of flags accordingly   */
          undercountPreviousCounter.setValue(parseInt(undercountPreviousCounter.getValue()) + 1);
          undercountCurrentScreenIndex.setValue( parseInt(undercountCurrentScreenIndex.getValue()) -1);
          hasAdditionalUndercount.setValue("true");

        }
        /* If current screen is a new screen reset response */
        if (hasAdditionalUndercount.getValue() == "true" && parseInt(undercountPreviousCounter.getValue()) <= 0) {
          hasAdditionalUndercount.setValue("");
        }
      }

      if(parseInt(undercountPreviousCounter.getValue()) > 0)
      {
        /* If a previously seen screen, get information about member from roster and set flag to true */
        var CurrentRosterIndex  =   parseInt(undercountStartingRosterIndex.getValue()) +   parseInt(undercountCurrentScreenIndex.getValue());  

        /* Set current index on HouseholdMemberTemp   */   
        var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp"); 

        if (householdMemberTemp){    
          var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
          if(cpHouseholdRoster){
            var cpMemberList = cpHouseholdRoster.get("HouseholdMember");
            householdMemberTemp.adoptPage(cpMemberList.get(CurrentRosterIndex));

          }
        }

        var errorMessage = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "Undercount_SOFT");
        ENUMCB.addSoftError(errorMessage,false);
        if (isUndercountPreviousFlag) {
          isUndercountPreviousFlag.setValue("true");
        }
      }

      /* 
      *   Flag used as workaround for product bug, used to tell if on the first undercount screen,
      *	when the current screen is 1 then on first screen and set flag accordingly 
      */
      var isFirstTimeUndercount = questFlagsPage.get("IsFirstTimeUndercount");
      if (isFirstTimeUndercount) {
        if (parseInt(undercountCurrentScreenIndex.getValue()) == 1) {
          isFirstTimeUndercount.setValue("true");
        } else {
          isFirstTimeUndercount.setValue("false");
        }
      }

      var nrfuAttemptTypeCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_ATTEMPT_TYPE_CODE");
      var respTypeCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.RESP_TYPE_CODE");
      /* Flag used to determine if enumerator is in a personal visit */
      var undercountIsPersonalVisit = questFlagsPage.get("UndercountIsPersonalVisit");
      if (nrfuAttemptTypeCode && respTypeCode && undercountIsPersonalVisit) {
        if (nrfuAttemptTypeCode.getValue() == "PV" && (respTypeCode.getValue() == "HH" || respTypeCode.getValue() == "PROXY")) {
          undercountIsPersonalVisit.setValue("true");
        }
        if ((nrfuAttemptTypeCode.getValue() == "TA" || nrfuAttemptTypeCode.getValue() == "TB" || nrfuAttemptTypeCode.getValue() == "TC") && (respTypeCode.getValue() == "HH" || respTypeCode.getValue() == "PROXY")) {
          undercountIsPersonalVisit.setValue("false");
        }
      }
      /* Flag used to determine if roster is at max size and if it is, allow the case to continue to next screen */
      var isUndercountBranchMaxRoster = questFlagsPage.get("IsUndercountBranchMaxRoster");
      if(isUndercountBranchMaxRoster) {
        if(isUndercountBranchMaxRoster.getValue() == "true"){
          hasAdditionalUndercount.setValue("false");
        }
      }

    }
  }
  catch(e)
  {
      alert("Error in undercount pre ==> <" + e.message + ">");
  }
}

/* US-27  and US-1400
* Post Action for Undercount
* Created by David Bourque
* update  by Ramin Moghtadernejad
* Update  by Domenic Giancola
*/
function EnumCB_Undercount_Post()
{
  /* Call validation, if it passes enter post function */
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  try
  {
      ENUMCB.Undercount_VLDN();
  }
  catch(VERR)
  {
       /* This can happen if doing proxy with first person not yet added here. */
  }
  if(!workPage.hasMessages())
  {

    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    /* Counter used to determine how many times we have gone backwards in undercount screen */
    var undercountPreviousCounter = questFlagsPage.get("UndercountPreviousCounter");
    if (undercountPreviousCounter) 
    {
      /* Flag that holds response data for undercount screen */
      var hasAdditionalUndercount = questFlagsPage.get("HasAdditionalUndercount");   
      if(hasAdditionalUndercount) 
      {

        if(hasAdditionalUndercount.getValue() == "true") 
        {
          /* house hold member page   */
          if (parseInt(undercountPreviousCounter.getValue()) <= 0) 
          {
            /* if entering new roster member, move them into roster */
            var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
            var cpRespondantFlag = householdMemberTemp.get("RespondantFlag");
            if(!cpRespondantFlag)
            {
              householdMemberTemp.put("RespondantFlag","false");
            }

            /* Create Roster Page */
            var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");   
            if(householdRoster)
            {
              var cpMemberList = householdRoster.get("HouseholdMember");
              if(!cpMemberList)
              {  /* Can happen on proxy case where first person is not added until here - this is due to bug in not persisting empty
                    arrays - see Mike, David, or Mark Coats for more information */
                 cpMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster").put("HouseholdMember",[]); 
              }
              var cpNewMemberPage = cpMemberList.add();
              cpNewMemberPage.adoptPage(householdMemberTemp);
            }
          }

          /* Clear House Hold temp   - reCreate  */
          CB.clearHouseholdMemberTemp();
          /* Counter used to tell what the undercount screen we are on */
          var undercountCurrentScreenIndex = questFlagsPage.get("UndercountCurrentScreenIndex");
          if (undercountCurrentScreenIndex)
          {
            undercountCurrentScreenIndex.setValue(parseInt(undercountCurrentScreenIndex.getValue()) + 1);
          }
        }
      }
      /* if we were on a previous undercount screen decrement counter */
      if (parseInt(undercountPreviousCounter.getValue()) > 0) {

        undercountPreviousCounter.setValue(parseInt(undercountPreviousCounter.getValue()) - 1);
      }
    }
  }

  var householdRosterMember= pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");  
  if (householdRosterMember){

    /* get roster size */
    var sizeOfIndex  = householdRosterMember.size();
    /* Flag used to tell if we are at max roster size */
    var isUndercountBranchMaxRoster = questFlagsPage.get("IsUndercountBranchMaxRoster");
    if(isUndercountBranchMaxRoster) {
      if(isUndercountBranchMaxRoster.getValue() == "true"){

        hasAdditionalUndercount.setValue("false");

      }
      else if(sizeOfIndex >= 99) {
        /* If we have reached max roster size set flags accordingly */
        isUndercountBranchMaxRoster.setValue("true");
        hasAdditionalUndercount.setValue("true");
      }
    }
  }
}

/*
* Pre Action for Intro
* Created by Mike Hartel
*/
function EnumCB_Intro_PRE(){
 try {   
  ENUMCB.updateDKRefVisibility("Intro", "pyWorkPage.Respondent.DKRefused");
  pega.offline.runDataTransform("EnumCB_Intro_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);
 }
 catch(e) {
   alert(e.message);
 }
}

/*
 * Pre action for Distance
 *
**/
function EnumCB_Distance_PRE() {
  try
  {
  	pega.offline.runDataTransform("EnumCB_Distance_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);
  }
  catch(DTErr)
  {
    alert("Error in Distance_PRE ==> " + DTErr.message);
  }
}
/*
 * Post action for Distance
 *
**/
function EnumCB_Distance_POST() {
  try
  {
    validation = ENUMCB.Required("pyWorkPage.Respondent.DistanceTooFar");
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages())
    {
       pega.offline.runDataTransform("EnumCB_Distance_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
    }
  }
  catch(DTErr)
  {
    alert("Error in Distance_POST ==> " + DTErr.message);
  }
}

/*
*	PRE Action for RosterEdit_QSTN
*	Created by: Aansh Kapadia
*/
function EnumCB_RosterEdit_PRE() {
  if (pega.mobile.isHybrid){
    CB.toggleFlag("ExitSurveyEnabled", "true");
    var currHouseholdMemberIndex = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.CurrentHHMemberIndex");
    if (currHouseholdMemberIndex){
      CB.getMemberFromRoster(parseInt(currHouseholdMemberIndex.getValue()));
    }
  }
}

/*
*	POST Action for RosterEdit_QSTN
*	Created by: Aansh Kapadia
*/
function EnumCB_RosterEdit_POST() {
  if (pega.mobile.isHybrid){
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    ENUMCB.RosterName_VLDN();
    if (!workPage.hasMessages()){
      var currHouseholdMemberIndex = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.CurrentHHMemberIndex");
      console.log("ROSTER EDIT POST");
      console.log(currHouseholdMemberIndex.getValue());
      CB.setMemberInRoster(parseInt(currHouseholdMemberIndex.getValue()), false);
    }
  }
}

/*
*	Pre Processing for RosterReview_QSTN
*	Created by: Aansh Kapadia
*/
function EnumCB_RosterReview_PRE() {

  var cpDKRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var cpDKRefRevRelationshipResp = cpDKRefused.get("RevRelationshipResp");
  if( cpDKRefRevRelationshipResp )
  {
    cpDKRefRevRelationshipResp = cpDKRefRevRelationshipResp.getValue();
  }
  ENUMCB.updateDKRefVisibility("RosterReview");
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  if (questFlags){
    var isEditingRosterFlag = questFlags.get("IsEditingRoster");
    var hasRosterChangesFlag = questFlags.get("HasRosterChanges");
    if (isEditingRosterFlag){
      isEditingRosterFlag.setValue("false");
    }
    if (hasRosterChangesFlag){
      hasRosterChangesFlag.setValue("");
    }
  }

}

/**
*	Post Processing for RosterReview_QSTN
*	Created by: Jack McCloskey
*	Modified by Jared Nichols 3/30/17 - Added RI logic and refactored
* Modified by Taylor Hunter 5/10/17 - Added geolocation call to collected GPS coordinates
*/
function EnumCB_RosterReview_POST() {
  ENUMCB.RosterReview_VLDN();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {

    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var HasRosterChanges = questFlags.get("HasRosterChanges") ? questFlags.get("HasRosterChanges").getValue() : "";

    var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var dkRefRosterReview = dkRefPage.get("RosterReview") ? dkRefPage.get("RosterReview").getValue() : "";

    if (dkRefRosterReview != "" || HasRosterChanges == 'false') {
      ENUMCB.findCurrentLocation();
      pega.offline.runDataTransform("EnumCB_RosterReviewRI_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
    }
  }
}

/*
*	Pre processing activity used for WhoLivesElsewhere_QSTN
*	Created by: Kyle Gravel
*/
function EnumCB_WhoLivesElsewhere_PRE() {  
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var localDateFormat = CB.getLocalizedCensusDate();
  questFlags.put("CensusDateString",localDateFormat);
  var currRosterSize = parseInt(questFlags.get("CurrentRosterSize").getValue());
  var isElsewhereSelected = questFlags.get("IsElsewhereSelected");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  if(isElsewhereSelected) {
    isElsewhereSelected = isElsewhereSelected.getValue();
  }
  else {
    isElsewhereSelected = "";
  }
  if(currRosterSize > 1 && isElsewhereSelected == "true") {
    questFlags.put("IsElsewhereSelected","true");
  }
  else {
    questFlags.put("IsElsewhereSelected","false");
  }	
  var householdMemberSize = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember").size();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember").iterator();
  var listOfNames = "";
  var you = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "You");
  var or = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "Or");

  /* if the respondent exists in roster then the list of names should start with "YOU" regardless of the position of the respondent in roster*/
  var householdRosterIter1 = householdRoster; 
  while(householdRosterIter1.hasNext()) {    
    var curr = householdRosterIter1.next();
    var respondentFlag = curr.get("RespondantFlag");
    if(respondentFlag) {
      respondentFlag = respondentFlag.getValue();
    }
    else {
      respondentFlag = "";
    }    
    if(respondentFlag == "true") {
      listOfNames = you;
      break;
    } 
  }
  var index = 0;
  /*add all of the Non-Respondent names to the list*/
  while(householdRoster.hasNext()) {    
    var currentMemberPage = householdRoster.next();
    index = index + 1;
    var fullName = currentMemberPage.get("FullName").getValue();
    var respondentFlag = currentMemberPage.get("RespondantFlag");
    if(respondentFlag) {
      respondentFlag = respondentFlag.getValue();
    }
    else {
      respondentFlag = "";
    }

    if(respondentFlag == "true") {
      continue;
    }

    if(!householdRoster.hasNext() && householdMemberSize > 1){ 
      listOfNames = listOfNames + " <span class=\"usds_nobold\">" + or + "</span> " + fullName;
    }
    else if(householdMemberSize > 1 && respondentFlag != "true") {
      listOfNames = listOfNames + ", " + fullName;
    }
    else if(respondentFlag != "true") {
      listOfNames = listOfNames + fullName;
    }
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var setNames = workPage.put("pyTempText", listOfNames);
}
/*
*	Post processing activity used for WhoLivesElsewhere_QSTN
*	Created by: Omar Mohammed
*/
function EnumCB_WhoLivesElsewhere_POST() {

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");  
  var WhyLiveElsewhereIndexList = questFlags.put("WhyLiveElsewhereIndexList",[]);
  var WhyLiveElsewhereSize = questFlags.get("WhyLiveElsewhereSize");
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  var householdRosterList = householdRoster.iterator();
  var currentIndex = 0;
  var numberSelected = 0;
  var listOfNames = "";
  while(householdRosterList.hasNext()) {
    currentIndex = currentIndex + 1;
    var currentMemberPage = householdRosterList.next();

    var isSelected = currentMemberPage.get("ElsewhereFlag");
    if(isSelected) {
      isSelected = isSelected.getValue();
    }
    else {
      isSelected = "";
    }
    if(isSelected == 'true') {
      numberSelected=numberSelected +1;		
      var addedPage = WhyLiveElsewhereIndexList.add();
      addedPage.put("pyTempInteger", currentIndex);
    }
  }
  WhyLiveElsewhereSize=numberSelected;
  questFlags.put("WhyLiveElsewhereSize",WhyLiveElsewhereSize); 


  ENUMCB.WhoLivesElsewhere_VLDN(numberSelected);
  /* alert("number selected " + counter); */
}

/*
*	Post Processing for RosterAdd_QSTN
*	Created by:  Ramin M
*/

function EnumCB_RosterAdd_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  if(CB.clearHouseholdMemberTemp())
  {
    return true;
  }
}

/*
*	Post Processing for RosterAdd_QSTN
*	Created by:  Ramin  M , Jack
*/
function EnumCB_RosterAdd_POST() {
  /* Call validation, if it passes enter post function */
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  ENUMCB.RosterName_VLDN();
  if(!workPage.hasMessages())
  {
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    /* if entering new roster member, move them into roster */
    var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");

    /* Create Roster Page */
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");   
    if(householdRoster)
    {
      var cpMemberList = householdRoster.get("HouseholdMember");
      var cpNewMemberPage = cpMemberList.add();
      cpNewMemberPage.adoptPage(householdMemberTemp);
    }
    /* Clear House Hold temp   - reCreate  */
    if(CB.clearHouseholdMemberTemp())
    {return true;
    }
  }
}

/*
*	Used by People_QSTN on Pre action
*	Created by: Domenic Giancola
*/
function EnumCB_People_PRE() {
  try
  {
    if(pega.mobile.isHybrid) {
      ENUMCB.removeSoftError();
      CB.toggleFlag("ExitSurveyEnabled", "true");
      var cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var cpHHMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
      if(cpWorkPage && cpQuestFlags) {
        if(!cpHHMemberList)
        {
            cpHHMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster").put("HouseholdMember",[]); 
        }
        console.log("***ENUMCB Alert - EnumCB_People_PRE - All pages exist");
        var cpHasAdditionalPeople = cpQuestFlags.get("HasAdditionalPeople");
        var cpPeoplePreviousCounter = cpQuestFlags.get("PeoplePreviousCounter");
        var isFirstTimePeople = cpQuestFlags.get("IsFirstTimePeople").getValue();
        var cpIsFirstPersonInRoster = cpQuestFlags.get("IsFirstPersonInRoster");
        if(isFirstTimePeople == "true") {
          console.log("***ENUMCB Alert - EnumCB_People_PRE - Starting isFirstTimePeople logic");
          cpQuestFlags.put("PeopleStartingRosterIndex",cpHHMemberList.size());
          cpQuestFlags.put("PeopleCurrentScreenIndex", 1);
          cpQuestFlags.put("IsFirstTimePeople", "false");
          cpHasAdditionalPeople.setValue("true");
          CB.clearHouseholdMemberTemp();
          console.log("***ENUMCB Alert - EnumCB_People_PRE - Ending isFirstTimePeople logic");
        }

        console.log("***ENUMCB Alert - EnumCB_People_PRE - Setting current roster size");
        var curRosterSize = cpHHMemberList.size();
        cpQuestFlags.put("CurrentRosterSize",curRosterSize);
        if (curRosterSize > 1) {
          cpQuestFlags.put("IsRosterSizeGreaterThanOne", "true");
          console.log("***ENUMCB Alert - EnumCB_People_PRE - Set IsRosterSizeGreaterThanOne to true");
        }
        else {
          cpQuestFlags.put("IsRosterSizeGreaterThanOne", "false");
          console.log("***ENUMCB Alert - EnumCB_People_PRE - Set IsRosterSizeGreaterThanone to false");
        }

        if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
          console.log("***ENUMCB Alert - EnumCB_People_PRE - Starting isGoingBack logic");
          var peoplePreviousCounter = parseInt(cpPeoplePreviousCounter.getValue());
          peoplePreviousCounter++;
          var peopleCurrentScreenIndex = parseInt(cpQuestFlags.get("PeopleCurrentScreenIndex").getValue());
          peopleCurrentScreenIndex--;
          cpPeoplePreviousCounter.setValue(peoplePreviousCounter);
          cpQuestFlags.put("PeopleCurrentScreenIndex", peopleCurrentScreenIndex);
          cpHasAdditionalPeople.setValue("true");

          var lastSurveyQuestion = cpWorkPage.get("CurrentSurveyQuestion").getValue();
          if(lastSurveyQuestion != "People_QSTN") {
            if (lastSurveyQuestion == "NoComplete_QSTN") {
              cpHasAdditionalPeople.setValue("");
            } 
            else {
              cpHasAdditionalPeople.setValue("false");
            }
          }
          else {
            cpHasAdditionalPeople.setValue("true");
          } 
        }

        console.log("***ENUMCB Alert - EnumCB_People_PRE - At PeopleCurrentScreenIndex Logic");
        if(cpQuestFlags.get("PeopleCurrentScreenIndex").getValue() == 1){
          cpIsFirstPersonInRoster.setValue("true");
          CB.toggleFlag("DKRFEnabled","false");
        }
        else {
          cpIsFirstPersonInRoster.setValue("false");
        }

        if(cpIsFirstPersonInRoster.getValue() == "false" && cpHasAdditionalPeople.getValue() == "true" && parseInt(cpPeoplePreviousCounter.getValue()) <= 0){
          cpHasAdditionalPeople.setValue("");
        }

        if(parseInt(cpPeoplePreviousCounter.getValue()) > 0){
          var cpIsNotEnoughPeople = cpQuestFlags.get("IsNotEnoughPeople");
          if (cpIsNotEnoughPeople.getValue() == "true") {
            cpIsNotEnoughPeople.setValue("false");
          }
          var errorMessage = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "Undercount_SOFT");
          ENUMCB.addSoftError(errorMessage,false);
          cpQuestFlags.put("IsPeoplePreviousFlag","true");
          var currentRosterIndex = parseInt(cpQuestFlags.get("PeopleStartingRosterIndex").getValue()) + parseInt(cpQuestFlags.get("PeopleCurrentScreenIndex").getValue());
          cpQuestFlags.put("CurrentRosterIndex",currentRosterIndex);
          var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp"); 
          if (cpHHMemberTemp){
            if (currentRosterIndex <= parseInt(cpQuestFlags.get("CurrentRosterSize").getValue())) {
              cpHHMemberTemp.adoptPage(cpHHMemberList.get(currentRosterIndex));
            }
            else {
              var isDKForPeople = cpQuestFlags.get("IsDKForPeople").getValue();
              var isRefusedForPeople = cpQuestFlags.get("IsRefusedForPeople").getValue();
              if(isDKForPeople == "true") {
                cpHasAdditionalPeople.setValue("");
                var cpDKRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
                if (cpDKRefused) {
                  cpDKRefused.put("People","D");
                  CB.toggleFlag("IsDKRefVisible", "true");
                }
              } else if(isRefusedForPeople == "true") {
                cpHasAdditionalPeople.setValue("");
                var cpDKRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
                if (cpDKRefused) {
                  cpDKRefused.put("People","R");
                  CB.toggleFlag("IsDKRefVisible", "true");
                }
              }
              else {
                cpHasAdditionalPeople.setValue("false");
              }       
            }
          }
        }
        else {
          cpQuestFlags.put("IsPeoplePreviousFlag","false");
        }

        var nrfuAttemptTypeCode = "";
        var respTypeCode = "";
        var cpnrfuAttemptTypeCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_ATTEMPT_TYPE_CODE").getValue();
        var cprespTypeCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.RESP_TYPE_CODE").getValue();
        if(cpnrfuAttemptTypeCode && cprespTypeCode){
          nrfuAttemptTypeCode = cpnrfuAttemptTypeCode;
          respTypeCode = cprespTypeCode;
        }

        if (nrfuAttemptTypeCode == "PV" && (respTypeCode == "HH" || respTypeCode == "proxy")){
          cpQuestFlags.put("IsPersonalVisit","true");
        }
        else if((nrfuAttemptTypeCode == "TA" || nrfuAttemptTypeCode == "TB" || nrfuAttemptTypeCode == "TC") && (respTypeCode == "HH" || respTypeCode == "proxy")){
          cpQuestFlags.put("IsPersonalVisit","false");
        }

        if(cpQuestFlags.get("IsBranchMaxRoster").getValue() == "true" || cpQuestFlags.get("IsNotEnoughPeople").getValue() == "true"){
          cpQuestFlags.put("HasAdditionalPeople","false");
        }
      }
      else {
        console.log("***ENUMCB Error - Unable to find current pyWorkPage, QuestFlags, or Roster in EnumCB_People_PRE");
        var npQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
        var npRespFlags = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
        if(npQuestFlags && npRespFlags)
        {
            var npRespTypeCode = npRespFlags.get("RESP_TYPE_CODE")? npRespFlags.get("RESP_TYPE_CODE").getValue() : "";
            var npAttemptTypeCode = npRespFlags.get("NRFU_ATTEMPT_TYPE_CODE")?
                	npRespFlags.get("NRFU_ATTEMPT_TYPE_CODE").getValue() : "";
            if (npAttemptTypeCode == "PV" && (npRespTypeCode == "HH" || npRespTypeCode == "proxy"))
            {
                npQuestFlags.put("IsPersonalVisit","true");
            }
            else if((npAttemptTypeCode == "TA" || npAttemptTypeCode == "TB" || npAttemptTypeCode == "TC") &&
                    (npRespTypeCode == "HH" || npRespTypeCode == "proxy")){
            	npQuestFlags.put("IsPersonalVisit","false");
          	}
            npQuestFlags.put("HasAdditionalPeople", "true");
        }
      }

      ENUMCB.updateDKRefVisibility("People");
    }
  }
  catch(Err)
  {
      alert(Err.message);
  }
}

/*
*	Used by People_QSTN on Post action
*	Created by: Domenic Giancola
*/
function EnumCB_People_POST() {
  if(pega.mobile.isHybrid) {
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    try
    {
        ENUMCB.People_VLDN();
    }
    catch(VERR)
    {
        /*alert("Error in validation ==> <" + VERR.message + ">");*/
    }
    if(!workPage.hasMessages()){
      var cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var cpHHMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
      if(!cpHHMemberList)
      {
        cpHHMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster").put("HouseholdMember",[]); 
      }
      var cpRespondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
      if(cpWorkPage && cpQuestFlags && cpHHMemberList) {
        var cpHasAdditionalPeople = cpQuestFlags.get("HasAdditionalPeople");
        var cpCurrentRosterSize = cpQuestFlags.get("CurrentRosterSize");
        var cpIsBranchMaxRoster = cpQuestFlags.get("IsBranchMaxRoster");
        var cpIsNotEnoughPeople = cpQuestFlags.get("IsNotEnoughPeople");
        var cpPeoplePreviousCounter = cpQuestFlags.get("PeoplePreviousCounter");

        if(cpHasAdditionalPeople.getValue() == "true"){
          if(parseInt(cpPeoplePreviousCounter.getValue()) <= 0){
            var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp"); 
            if (cpHHMemberTemp){
              var cpNewMemberPage = cpHHMemberList.add();
              cpNewMemberPage.adoptPage(cpHHMemberTemp);
            }
          }
          else {
            var peoplePreviousCounter = parseInt(cpPeoplePreviousCounter.getValue());
            peoplePreviousCounter--;
            cpPeoplePreviousCounter.setValue(peoplePreviousCounter);
          }
          CB.clearHouseholdMemberTemp();
        }
        var peopleCurrentScreenIndex = parseInt(cpQuestFlags.get("PeopleCurrentScreenIndex").getValue());
        peopleCurrentScreenIndex++;
        cpQuestFlags.put("PeopleCurrentScreenIndex",peopleCurrentScreenIndex);
        var currentRosterSize = cpHHMemberList.size();
        cpQuestFlags.put("CurrentRosterSize",currentRosterSize);
        if(cpIsBranchMaxRoster.getValue()=="true"){
          cpHasAdditionalPeople.setValue("false");
          cpQuestFlags.put("PeopleCurrentScreenIndex",peopleCurrentScreenIndex--);
        }
        else if(currentRosterSize >= 99){
          cpIsBranchMaxRoster.setValue("true");
          cpHasAdditionalPeople.setValue("true");
        }
        var dkRefuedPeople = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused.People");
        if (dkRefuedPeople) {
          if (dkRefuedPeople.getValue() == "D") {
            cpQuestFlags.put("IsDKForPeople","true");
            cpQuestFlags.put("ExitSurveyAction", "NoComplete_QSTN");
          }
          else if (dkRefuedPeople.getValue() == "R") {
            cpQuestFlags.put("IsRefusedForPeople","true");
            cpQuestFlags.put("ExitSurveyAction", "NoComplete_QSTN");
          }
        }
        ENUMCB.updateDisabledDKRefColor();
      }
      else {
        console.log("***ENUMCB Error - Unable to find current pyWorkPage, QuestFlags, Roster, or Respondent in EnumCB_People_POST");
      }
    }
  }
}

/**
*	Pre action for RelationOT_QSTN
*	Created by: Jack McCloskey, David Bourque, Dillon Irish
**/
function EnumCB_RelationOT_PRE(){
  if(pega.mobile.isHybrid){
    CB.toggleFlag("ExitSurveyEnabled","true");
    var pRelCodeClear = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    if(pRelCodeClear && cpHouseholdMember && cpHouseholdRoster && cpQuestFlags){

      cpQuestFlags.put("SkipDec", "true");

      if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
        var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
        if(curMemberIndex == 1){
          curMemberIndex = parseInt(cpQuestFlags.get("CurrentRosterSize").getValue());
        }else{
          curMemberIndex = curMemberIndex - 1;
        }
        cpHouseholdRoster.put("CurrentHHMemberIndex", curMemberIndex);
        CB.getMemberFromRoster(curMemberIndex);
      }

      var lastSelected = cpHouseholdMember.get("RelationOTLastValueSelected");
      if(lastSelected && lastSelected.getValue() != ""){
        pRelCodeClear.put("P_REL_CODE", lastSelected.getValue());
      } else {
        pRelCodeClear.put("P_REL_CODE", "");
      }

      /*DKRef*/
      CB.toggleFlag("DKRFEnabled", "true");
      ENUMCB.updateDKRefVisibility("RelationOT");
    }
  }
}

/**
*	Post action for RelationOT_QSTN
*	Created by: Jack McCloskey, David Bourque
**/
function EnumCB_RelationOT_POST() {
  try {
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE", "pyWorkPage.HouseholdMemberTemp.DKRefused.RelationOT","RelationshipCheck_HARD");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE", "", "RelationshipCheck_HARD");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var cpHouseholdTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      if(cpResponse && cpHouseholdTemp){
        var pRelCode = cpResponse.get("P_REL_CODE").getValue();
        cpHouseholdTemp.put("RelationOTLastValueSelected", pRelCode);
      }
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var params = "";
      if (cpHouseholdRoster.get("ReferencePerson.RespondantFlag").getValue() == "true") {
        params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      }
      else{
        params =	{isFirstTimeProp: "IsFirstTimeRelOther"};
      }
      var dkrefProp = cpHouseholdTemp.get("DKRefused.RelationOT");
      if (dkrefProp && (dkrefProp.getValue() == "D" || dkrefProp.getValue() == "R")) {
        cpResponse.put("P_REL_CODE", 16);
        alert("P_REL_CODE: 16");
      }

      ENUMCB.setRelTextInHouseholdMemberTemp("Response.P_REL_CODE","D_RelationOTOptions","RelationOT");

      ENUMCB.updateMemberIndexPost(params);
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationOT", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationOT_POST:" + e.message);*/
  }
}

/*
* Pre function for Relation SD
* Created by David Bourque
*/

function EnumCB_RelationSD_PRE(){
  if(pega.mobile.isHybrid){
    CB.toggleFlag("ExitSurveyEnabled","true");
    var pRelCodeClear = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    if(pRelCodeClear && cpHouseholdMember && cpHouseholdRoster && cpQuestFlags){
      cpQuestFlags.put("SkipDec", "true");

      if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
        var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
        if(curMemberIndex <= 1){
          curMemberIndex = parseInt(cpQuestFlags.get("CurrentRosterSize").getValue());
        }else{
          curMemberIndex = curMemberIndex - 1;
        }
        cpHouseholdRoster.put("CurrentHHMemberIndex", curMemberIndex);
        CB.getMemberFromRoster(curMemberIndex);
        var isReference = cpHouseholdMember.get("ReferencePersonFlag").getValue()+"";
        if (isReference == "true") {
          curMemberIndex = curMemberIndex - 1;
          cpHouseholdRoster.put("CurrentHHMemberIndex", curMemberIndex);
          CB.getMemberFromRoster(curMemberIndex);
        }
      }

      var lastSelected = cpHouseholdMember.get("RelationSDLastValueSelected");
      if(lastSelected && lastSelected.getValue() != ""){
        pRelCodeClear.put("P_REL_CODE", lastSelected.getValue());
      } else {
        pRelCodeClear.put("P_REL_CODE", "");
      }

      /*DKRef*/
      CB.toggleFlag("DKRFEnabled", "true");
      ENUMCB.updateDKRefVisibility("RelationSD");
    }
  }
}

/* 
* Post function for RelationSD
* Created by David Bourque
*/
function EnumCB_RelationSD_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE", "pyWorkPage.HouseholdMemberTemp.DKRefused.RelationSD");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var cpHouseholdTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      if(cpResponse && cpHouseholdTemp){
        var pRelCode = cpResponse.get("P_REL_CODE").getValue();
        cpHouseholdTemp.put("RelationSDLastValueSelected", pRelCode);
      }
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var params = "";
      if (cpHouseholdRoster.get("ReferencePerson.RespondantFlag").getValue()+"" == "true") {
        params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      }
      else{
        params = {isFirstTimeProp: "IsFirstTimeRelOther"};
      }
      var dkrefProp = cpHouseholdTemp.get("DKRefused.RelationSD");
      if (dkrefProp && (dkrefProp.getValue() == "D" || dkrefProp.getValue() == "R")) {
        cpResponse.put("P_REL_CODE","5");
        alert("P_REL_CODE: 5");
      }
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationSD", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND");
      ENUMCB.setRelTextInHouseholdMemberTemp("Response.P_REL_CODE","D_RelationSDOptions","RelationSD");
      ENUMCB.updateMemberIndexPost(params);
      ENUMCB.skipReferencePerson();
    }
  }  
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationSD_POST:" + e.message);*/
  }
}

/**
*	Pre action for  ChangeRelationship_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_RelationshipChangeResp_PRE(){

  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHouseholdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");

  if(cpQuestFlags && cpHouseholdRoster && cpHouseholdMemberList){

    if(cpQuestFlags.get("IsGoingForward").getValue() == "true"){
      cpQuestFlags.put("SkipDec", "false");
    }
    var curRosterSize = cpHouseholdMemberList.size();
    var params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
    var curMemberIndex;
    if(cpQuestFlags.get("SkipDec").getValue() == "false"){
      curMemberIndex = ENUMCB.updateMemberIndexPre(params);
    }else{
      cpQuestFlags.put("SkipDec", "false");
    }
    var curMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember("+curMemberIndex+")");
    var referenceFlag = curMember.get("ReferencePersonFlag").getValue();

    /*If the household member is the reference person, increment/decrement*/
    if(referenceFlag == true){
      if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
        curMemberIndex = curMemberIndex - 1;
        if(curMemberIndex == 0){
          curMemberIndex = curRosterSize;
        }
      }else{
        curMemberIndex = curMemberIndex + 1;
      }
      cpHouseholdRoster.put("CurrentHHMemberIndex", curMemberIndex);
    }

    CB.getMemberFromRoster(curMemberIndex);

    /*DKRef*/
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("RelationshipResp");
  }
}

/**
*	Post action for ChangeRelationship_QSTN
*	Created by: Dillon Irish,  
**/
function EnumCB_RelationshipChangeResp_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE", "pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var respProp = respPage.get("P_REL_CODE");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if(respProp == "SD") {
        questFlags.put("NextSurveyQuestion", "RelationSD_QSTN");
      }
      else if(respProp == "OT") {
        questFlags.put("NextSurveyQuestion", "RelationOT_QSTN");
      }
      else{
        ENUMCB.updateMemberIndexPost(params);
        questFlags.put("NextSurveyQuestion", "");
      }
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationshipResp_POST:" + e.message);*/
  }
}


function EnumCB_RelationshipChangeResp_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE", "pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var respProp = respPage.get("P_REL_CODE");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if(respProp == "SD") {
        questFlags.put("NextSurveyQuestion", "RelationSD_QSTN");
      }
      else if(respProp == "OT") {
        questFlags.put("NextSurveyQuestion", "RelationOT_QSTN");
      }
      else{
        ENUMCB.updateMemberIndexPost(params);
        questFlags.put("NextSurveyQuestion", "");
      }
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationshipChangeResp_POST:" + e.message);*/
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  ENUMCB.RelationshipCheck_VLDN();
  if (!workPage.hasMessages()) {
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    if (cpQuestFlags && cpHouseholdRoster && cpHHMemberTemp) {
      var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
      CB.setMemberInRoster(currentHHMemberIndex,false);
      var isRelationshipCorrect = cpHHMemberTemp.get("IsRelationshipCorrect").getValue();
      var dkRefProp = cpHHMemberTemp.get("DKRefused.RelationshipCheck");
      if (dkRefProp) {
        dkRefProp = dkRefProp.getValue();
      } else {
        dkRefProp = "";
      }
      if (isRelationshipCorrect == "true" || dkRefProp == "D" || dkRefProp == "R") {
        cpQuestFlags.put("IsRelationshipCorrect","true");
        currentHHMemberIndex = currentHHMemberIndex + 1;
        var rosterSize = cpHouseholdRoster.get("HouseholdMember").size();
        cpQuestFlags.put("IsEnteringRelationshipCheck","false");
        for (currentHHMemberIndex; currentHHMemberIndex <= rosterSize; currentHHMemberIndex++) {
          var currentRosterMember = cpHouseholdRoster.get("HouseholdMember("+currentHHMemberIndex+")");
          var cpIsParentYoungerThanReference = currentRosterMember.get("IsParentYoungerThanReference");
          var cpIsChildOlderThanReference = currentRosterMember.get("IsChildOlderThanReference");
          if(cpIsParentYoungerThanReference && cpIsChildOlderThanReference) {
            if(cpIsParentYoungerThanReference.getValue() == "true" || cpIsChildOlderThanReference.getValue() == "true") {
              cpHHMemberTemp.adoptJSON(currentRosterMember.getJSON());
              cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHMemberIndex);
              cpQuestFlags.put("IsEnteringRelationshipCheck","true");
              break;
            } 
          }
        }
      } else {
        cpQuestFlags.put("IsRelationshipCorrect","false");
      }
    }
  }
}

/*
* Pre Action for WhyLiveElsewhere_QSTN 
* Created by:Ebenezer Owoeye
*/
function EnumCB_WhyLiveElsewhere_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");  
  CB.toggleFlag("ExitSurveyEnabled", "true");
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var WhyLiveElsewhereSize =  pega.ui.ClientCache.find("pyWorkPage.QuestFlags.WhyLiveElsewhereSize").getValue();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");  
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var WhyLiveElsewhereIndex = questFlags.get("WhyLiveElsewhereIndex");
  var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var softEditPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  if(!softEditPage) {
    responsePage.put("SoftEditVLDN", {});
    softEditPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  }
  softEditPage.put("WhyLiveElseWhereFlag", "false");

  if(WhyLiveElsewhereIndex) {
    WhyLiveElsewhereIndex = WhyLiveElsewhereIndex.getValue();
  }
  else {
    WhyLiveElsewhereIndex = 1;
    questFlags.put("WhyLiveElsewhereIndex",WhyLiveElsewhereIndex);
  }

  /*Arrived here from click of Previous*/
  if(isGoingBack== "true"){
    if(previousQuestion == "WhyLiveElsewhere_QSTN"){
      WhyLiveElsewhereIndex=WhyLiveElsewhereIndex-1;
      if(WhyLiveElsewhereIndex == 0) {
        WhyLiveElsewhereIndex = WhyLiveElsewhereSize;
      }
      questFlags.put("WhyLiveElsewhereIndex", WhyLiveElsewhereIndex);
    }
    if(previousQuestion == "Review_QSTN"){
      WhyLiveElsewhereIndex=WhyLiveElsewhereSize;
      if(WhyLiveElsewhereIndex == 0) {
        WhyLiveElsewhereIndex = WhyLiveElsewhereSize;
      }
      questFlags.put("WhyLiveElsewhereIndex", WhyLiveElsewhereIndex);
    }
  }
  /*Arrived here from click of Next*/
  else{
    if(previousQuestion == "WhoLivesElsewhere_QSTN"){
      WhyLiveElsewhereIndex = 1; /*Start with first index*/
      questFlags.put("WhyLiveElsewhereIndex", WhyLiveElsewhereIndex);
    }
  }	
  var WhyLiveElsewhereCurMember = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.WhyLiveElsewhereIndexList("+WhyLiveElsewhereIndex+")");
  var curMemberIndexOnRoster = parseInt(WhyLiveElsewhereCurMember.get("pyTempInteger").getValue(),10);
  householdRoster.put("CurrentHHMemberIndex", curMemberIndexOnRoster);
  CB.getMemberFromRoster(curMemberIndexOnRoster);
  ENUMCB.updateDKRefVisibility("WhyLiveElsewhere");
}

/*
* Post Action for WhyLiveElsewhere_QSTN 
* Created by:Ebenezer Owoeye
*/
function EnumCB_WhyLiveElsewhere_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var WhyLiveElsewhereFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.WhyLiveElsewhere");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var ElsewhereIsAtRelatives = WhyLiveElsewhereFlags.get("IsAtRelatives").getValue();
  var ElsewhereIsAtCollege = WhyLiveElsewhereFlags.get("IsAtCollege").getValue();
  var ElsewhereIsAtMilitary = WhyLiveElsewhereFlags.get("IsAtMilitary").getValue();
  var ElsewhereIsAtJob = WhyLiveElsewhereFlags.get("IsAtJob").getValue();
  var ElsewhereIsAtNursingHome = WhyLiveElsewhereFlags.get("IsAtNursingHome").getValue();
  var ElsewhereIsAtJail = WhyLiveElsewhereFlags.get("IsAtJail").getValue();
  var ElsewhereIsAtSeasonal = WhyLiveElsewhereFlags.get("IsAtSeasonal").getValue();
  var ElsewhereIsOtherReason = WhyLiveElsewhereFlags.get("IsOtherReason").getValue();

  var numberSelected = 0;

  if(ElsewhereIsAtRelatives) {
    respPage.put("P_LOC_ELSE_RELATIVES_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_RELATIVES_IND", "0");
  }
  if(ElsewhereIsAtCollege) {
    respPage.put("P_LOC_ELSE_COLLEGE_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_COLLEGE_IND", "0");
  }
  if(ElsewhereIsAtMilitary) {
    respPage.put("P_LOC_ELSE_MILITARY_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_MILITARY_IND", "0"); 
  }
  if(ElsewhereIsAtJob) {
    respPage.put("P_LOC_ELSE_JOB_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_JOB_IND", "0");
  }
  if(ElsewhereIsAtNursingHome) {
    respPage.put("P_LOC_ELSE_NURSINGHOME_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_NURSINGHOME_IND", "0");
  }
  if(ElsewhereIsAtJail) {
    respPage.put("P_LOC_ELSE_JAIL_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_JAIL_IND", "0");
  }
  if(ElsewhereIsAtSeasonal) {
    respPage.put("P_LOC_ELSE_SEASONAL_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_SEASONAL_IND", "0");
  }
  if(ElsewhereIsOtherReason) {
    respPage.put("P_LOC_ELSE_OTHER_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_LOC_ELSE_OTHER_IND", "0");
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  ENUMCB.WhyLiveElsewhere_VLDN(numberSelected);
  if (!workPage.hasMessages()) {
    ENUMCB.updateDisabledDKRefColor();
    var whyLiveElsewhereIndex = questFlags.get("WhyLiveElsewhereIndex");
    if(whyLiveElsewhereIndex) {
      whyLiveElsewhereIndex = whyLiveElsewhereIndex.getValue();
    }
    else {
      whyLiveElsewhereIndex = "";
    }
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndexOnRoster = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue(),10);
    CB.setMemberInRoster(curMemberIndexOnRoster, false);
    whyLiveElsewhereIndex = whyLiveElsewhereIndex + 1;
    questFlags.put("WhyLiveElsewhereIndex", whyLiveElsewhereIndex);
  }
}

/*
*	Pre Action for Who_QSTN
*	Created by Jared Nichols
*/
function EnumCB_Who_PRE() {
  CB.toggleFlag("DKRFEnabled","true");
  CB.toggleFlag("ExitSurveyEnabled","true");
}

/*
*	Post Action for Who_QSTN
*	Created by Jared Nichols
*/
function EnumCB_Who_POST() {
	var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if (isDKRefVisible == "true") {
		ENUMCB.Required("pyWorkPage.Respondent.DoesKnowResident", "pyWorkPage.Respondent.DKRefused.Who");
	} else {
		ENUMCB.Required("pyWorkPage.Respondent.DoesKnowResident");
	}
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
	if (!workPage.hasMessages()) {
		var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      	var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
		var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
		var answer = respondentPage.get("DoesKnowResident").getValue();
        if (answer == "1")
        {
            responsePage.put("NRFU_WHO_CODE", "1");
        } 
        else if (answer == "0")
        {
            responsePage.put("NRFU_WHO_CODE", "2");
        }
        else
        {
            responsePage.put("NRFU_WHO_CODE", "9");
        }
        try
        {
            pega.offline.runDataTransform("SetWhoNextQuestion","CB-FW-CensusFW-Work-Quest-Enum",null);
        }
        catch(DTErr)
        {
            alert("Error invoking DT to set next question in Who_POST ==> " + DTErr );
        }
	}
}

/**
*	Pre Function for Anyone Question
*	Created by Mark Coats
**/
function EnumCB_Anyone_PRE()
{
  /*DKRef*/
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("Anyone");
}

/**
* Post function for Anyone Resp QSTN
* Created by: Mark Coats
* Updated by: Taylor Hunter
**/
function EnumCB_Anyone_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.Respondent.AnyoneLiveThere",
        "pyWorkPage.Respondent.DKRefused.Anyone");
    }
    else {
      validation = ENUMCB.Required("pyWorkPage.Respondent.AnyoneLiveThere");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
      ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.Anyone", "pyWorkPage.Respondent.Response.H_OCC_DK_PRX_IND", "pyWorkPage.Respondent.Response.H_OCC_REF_PRX_IND");

      pega.offline.runDataTransform("EnumCB_Anyone_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);

    }
  }
  catch (Err) {
    alert(Err.message);
  }
}

/* 
* Pre action for PersonalNonContact Screen 
* By: Aditi Ashok
*/
function EnumCB_PersonalNonContact_PRE () {
	CB.toggleFlag("ExitSurveyEnabled","false");
	CB.toggleFlag("DKRFEnabled","false");
}

/* 
* Post action for PersonalNonContact Screen 
* By: Aditi Ashok
* Updated by Jared Nichols 5/4/17 - BUG 2062
*/
function EnumCB_PersonalNonContact_POST () {
  	ENUMCB.PersonalNonContact_VLDN();
  	var workPage = pega.ui.ClientCache.find("pyWorkPage");
  
  	/* If there are no error messages from validation, continue */
  	if(!workPage.hasMessages()) { 	
	var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	var nonContactCode = response.get("PERSONAL_NON_CONTACT_CODE");
  	var nonContactCodeSpecify = response.get("PERSONAL_NON_CONTACT_CODE_SPECIFY");
	
  	nonContactCode = (nonContactCode) ? nonContactCode.getValue(): "";
  	nonContactCodeSpecify = (nonContactCodeSpecify) ? nonContactCodeSpecify.getValue():"";
  
	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");  
 
  	ENUMCB.Required("pyWorkPage.Respondent.Response.PERSONAL_NON_CONTACT_CODE", "", "PleaseSelectACategory"); 
  	if (nonContactCode == "1" || nonContactCode == "2") {
    }
	
	/* Branching */
	if (nonContactCode == "2") {
		/* Appears nonresidential */
		questFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");
	} else {
		questFlags.put("NextSurveyQuestion", "Strategies_QSTN");
	}
}
}
/*
* Pre action for Occupancy_QSTN
* Created by: Jason Wong
*/
function EnumCB_Occupancy_PRE() {
	ENUMCB.updateDKRefVisibility("Occupancy", "pyWorkPage.Respondent.DKRefused");
	CB.toggleFlag("ExitSurveyEnabled","true");
	CB.toggleFlag("DKRFEnabled","true");
	
}

/*
* Post action for Occupancy_QSTN
* Created by: Jason Wong
*/
function EnumCB_Occupancy_POST() {
	/* Call validation to check if an answer was selected */
	ENUMCB.Occupancy_VLDN();
	
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
  
  	/* If there are no error messages from validation, continue */
  	if(!workPage.hasMessages()) { 	
      var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
      var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

      var respOccupancyCode = workPage.get("Respondent.Occupancy").getValue();

      /* Occupancy Code = Vacant */
      if(respOccupancyCode == "1") {
          responsePage.put("NRFU_OCCUPANCY_CODE","1");
          responsePage.put("H_NOT_HUNIT_STATUS_CODE","vacant");
          dkRefPage.put("Popcount", "0");

          questFlags.put("NextSurveyQuestion","VacantDescription_QSTN");

      }
      /* Occupancy Code = Not a housing unit */
      else if (respOccupancyCode == "2") {
          responsePage.put("NRFU_OCCUPANCY_CODE","2");
          responsePage.put("H_NOT_HUNIT_STATUS_CODE","nothu");
          dkRefPage.put("Popcount", "0");

          questFlags.put("NextSurveyQuestion","SpecificUnitStatus_QSTN");
      }	
      /* DK/Ref selected */
      else {
          var dkRefResponse = dkRefPage.get("Occupancy").getValue();

          /* Reponse = DK */
          if(dkRefResponse=="D") {
              responsePage.put("NRFU_OCCUPANCY_CODE","8");
          } 
          /* Response = Refused */
          else {
              responsePage.put("NRFU_OCCUPANCY_CODE","9");
          }

          responsePage.put("H_NOT_HUNIT_STATUS_CODE","null");
          dkRefPage.put("Popcount", "0");	

          questFlags.put("NextSurveyQuestion","NoComplete_QSTN");
      }
    }
}

/* 
* Pre action for Specific Unit Status Screen 
* By: Aditi Ashok
*/
function EnumCB_SpecificUnitStatus_PRE () {
	CB.toggleFlag("ExitSurveyEnabled","true");
	CB.toggleFlag("DKRFEnabled","true");
  	ENUMCB.updateDKRefVisibility("SpecificUnitStatus");
}

/* 
* Post action for Specific Unit Status Screen 
* By: Aditi Ashok.  Modified by: Jason Wong
*/
function EnumCB_SpecificUnitStatus_POST () {
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
  	var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  	var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

  	  
	/* validation */
	var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.Respondent.Response.NOT_HOUSING_UNIT_STATUS_CODE", "pyWorkPage.Respondent.DKRefused.SpecificUnitStatus");
    } 
    else {
      ENUMCB.Required("pyWorkPage.Respondent.Response.NOT_HOUSING_UNIT_STATUS_CODE");
    }
  	
   	if (!workPage.hasMessages()) {
		var isReInterview = workPage.get("IsReInterview");
		isReInterview = isReInterview ? isReInterview.getValue() : "";
		
		/* Run post data transform to set NextSurveyQuestion & Response properties*/
		pega.offline.runDataTransform("EnumCB_SpecificUnitStatus_POST", "CB-FW-CensusFW-Work-Quest-Enum",null);
		
		/* DKRef for Non-Reinterivew */
		if(isReInterview != "true") {
			ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.SpecificUnitStatus", 	    	  
                                    "pyWorkPage.Respondent.Response.SPECIFIC_UNIT_STATUS_DK_IND", 
                                    "pyWorkPage.Respondent.Response.SPECIFIC_UNIT_STATUS_REF_IND");			
		}		
    }
}

/*
*	Created by: Kyle Gravel
*	Pre/Post Processing for VacancyDescription_QSTN
*/
function ENUMCB_VacantDescription_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled","true");
  ENUMCB.updateDKRefVisibility("VacancyDescription","pyWorkPage.Respondent.DKRefused");
}

function ENUMCB_VacantDescription_POST() {
  /*Validate that VacancyDescription has value and throw hard edit if not*/
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.VacancyDescription", "pyWorkPage.Respondent.DKRefused.VacancyDescription");
  } 
  else {
    ENUMCB.Required("pyWorkPage.Respondent.VacancyDescription");
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  try {
    if (!workPage.hasMessages()) {
      pega.offline.runDataTransform("ENUMCB_VacantDescription_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
    }
  }
  catch(TCErr) {
    console.log("Error in VacantDescription_POST, Exception message: " + TCErr.message);
    alert("Error in VacantDescription_POST " + TCErr.message);
  }
}

/*
*	Pre/Post functionality for OtherVacant_QSTN
*	Created by: Kyle Gravel, Joe Paul
*	
*/
function ENUMCB_OtherVacant_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled","true");
  ENUMCB.updateDKRefVisibility("OtherVacant","pyWorkPage.Respondent.DKRefused");
}

function ENUMCB_OtherVacant_POST() {
  /*Validate that VacancyDescription has value and throw hard edit if not*/
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.OtherVacancyDescription", "pyWorkPage.Respondent.DKRefused.OtherVacant");
  } 
  else {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.OtherVacancyDescription");
  }

  var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var otherVacant = householdMemberTemp.get("OtherVacancyDescription");
  otherVacant = otherVacant ? otherVacant.getValue() : "";
  var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

  
  pega.offline.runDataTransform("ENUMCB_OtherVacant_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
}

/*
*	Created by: Kyle Gravel
*	Pre function for KnowAddress_QSTN
*	Sets ExitSurvey/DKRef visibility on
*/
function ENUMCB_KnowAddress_PRE() {
  ENUMCB.updateDKRefVisibility("KnowAddress","pyWorkPage.Respondent.DKRefused");
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled","true");
}

/*
*	Created by: Kyle Gravel. Modified by: Jason Wong
*	Used by KnowAddress. Calls validation and sets "nextSurveyQuestion"
*/
function ENUMCB_KnowAddress_POST() {
  /*Run required and custom validation*/
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_RESP_KNOW_ADR_CODE", "pyWorkPage.Respondent.DKRefused.KnowAddress");
  } 
  else {
    ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_RESP_KNOW_ADR_CODE");
  }

  ENUMCB.KnowAddress_VLDN();
  if (!workPage.hasMessages()) {
    /*Grab response prop, dk ref prop, questflags page*/
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var knowAddress = responsePage.get("NRFU_RESP_KNOW_ADR_CODE");
    knowAddress = knowAddress ? knowAddress.getValue() : ""; 

	/* Set Next Survey Question */
	pega.offline.runDataTransform("ENUMCB_KnowAddress_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
	
    /* Add Case note if 'Yes' was selected */
    if(knowAddress == "1") {
      var text = "KNOW ADDRESS: " + responsePage.get("NRFU_RESP_KNOW_ADR_TEXT").getValue();
      CB.addCaseNote(text,"Proxy: ADDRESS UNKNOWN",false);
    }
  }
}


/**
*	Function for EnumCB_ContactRespRI_PRE
*	
**/
function EnumCB_ContactRespRI_PRE() {
  
 try {
    console.log("MIKEH test");
    CB.toggleFlag("DKRFEnabled", "true");
  	CB.toggleFlag("ExitSurveyEnabled", "true");
    ENUMCB.updateDKRefVisibility("ContactResp", "pyWorkPage.Respondent.DKRefused");
  
  	/* Generate Enumeration Date and assign to pyTempText  */
 	var d = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 	var enumerationDate =   months[d.getMonth()] + " " + d.getDate();
  
 	var workPage = pega.ui.ClientCache.find("pyWorkPage");
  	workPage.put("pyTempText", enumerationDate); 
   
   /* Disable .Respondent.Response.IntroQuestionAnswer is "Yes" (10) 
    * disable .Respondent.Response.NRFU_RESP_ELIG_CODE. This prevent
    * 2 layouts on ContactRespRI screen from displaying on using previous button
    */
   var workPage = pega.ui.ClientCache.find("pyWorkPage"); 
   var IntroAnswer = workPage.get("Respondent.Response.IntroQuestionAnswer");
   IntroAnswer = IntroAnswer ? IntroAnswer.getValue() : "";
   var EligResp = workPage.get("Respondent.Response.NRFU_RESP_ELIG_CODE");
   EligResp = EligResp ? EligResp.getValue() : "";
   
   if (IntroAnswer == "10"){
     var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
     responsePage.put("NRFU_RESP_ELIG_CODE", "");
   }
   
  } catch (e) {
    console.log("*** EnumCB_ContactRespRI_PRE, Exception message: " + e.message);
    alert("Exception in ContactRespRI_PRE" + e.message);
  }  
}

/**
*	Function for EnumCB_ContactRespRI_POST
*	
**/
function EnumCB_ContactRespRI_POST() {

   try {
  
   	/*First, run validation function*/
    ENUMCB.ContactRespRI_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
  	if (!workPage.hasMessages()) {	 
        pega.offline.runDataTransform("EnumCB_ContactRespRI_POST","CB-FW-CensusFW-Work-Quest-Enum",null);      
  	}        

  } catch (e) {
    console.log("*** EnumCB_ContactRespRI_POST, Exception message: " + e.message);
    alert("Exception in EnumCB_ContactRespRI_POST" + e.message);
  }
}




/*
*	Post Action for Eligible Respondent RI
*	Created by: Qaiser Fayyaz
*/
function EnumCB_EligibleRespondentRI_POST(){
  ENUMCB.EligibleRespondent_VLDN();  
  var workPage = pega.ui.ClientCache.find("pyWorkPage");  
  if(!workPage.hasMessages()){
    try
    {
  	  pega.offline.runDataTransform("SetEligibleRespondentRINextQuestion","CB-FW-CensusFW-Work-Quest-Enum",null);      
    }
    catch(DTErr)
    {
      alert("Error in EligibleRespondentRI_POST: " + DTErr.message);
    }
  }
}


/*
* Post function for IntroRI_QSTN
* Created by: Jason Wong
*/
function EnumCB_IntroRI_POST() {
	try {		
		
		/* Validate that an answer was selected */
		ENUMCB.Required("pyWorkPage.Respondent.Response.IntroQuestionAnswer");
      
        var workPage = pega.ui.ClientCache.find("pyWorkPage");
		
		if(!workPage.hasMessages()) {
			/* Run post data transform to set NextSurveyQuestion*/
			pega.offline.runDataTransform("EnumCB_IntroRI_POST", "CB-FW-CensusFW-Work-Quest-Enum",null);		
		}
	}
	catch(e) {
		alert(e.message);
	}	
}

/*
*	Pre Action for VerifyAddressRI_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_VerifyAddressRI_PRE() {
  try
  {
  	pega.offline.runDataTransform("EnumCB_VerifyAddressRI_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);
  }
  catch(DTErr)
  {
    alert("Error in VerifyAddresRI_PRE ==> " + DTErr.message);
  }
}


/*
*	Post Action for VerifyAddressRI_QSTN
*	Created by Ebenezer Owoeye
*/
function EnumCB_VerifyAddressRI_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if(isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.IsthisRespondentAddress", "pyWorkPage.Respondent.DKRefused.VerifyAddressRI");
  }
  else {
    ENUMCB.Required("pyWorkPage.Respondent.IsthisRespondentAddress");      
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");  
  if(!workPage.hasMessages()){
    try
    {
  	  pega.offline.runDataTransform("EnumCB_VerifyAddressRI_POST","CB-FW-CensusFW-Work-Quest-Enum",null);     
    }
    catch(DTErr)
    {
      alert("Error in VerifyAddressRI_POST: " + DTErr.message);
    }
  }
}

/*
*	Pre and Post Actions for ResultOfMessage_QSTN
*	Created by: Timothy Risch
*	Story Number: US-523
*/
function EnumCB_ResultOfMessage_PRE() {
    CB.toggleFlag("DKRFEnabled", "false");
    CB.toggleFlag("ExitSurveyEnabled","false"); 
  	
	/* 	
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
	workPage.put("CurrentSurveyQuestion","RESULT OF MESSAGE");
	var currentSurveyQuestion = pega.ui.ClientCache.find("pyWorkPage.CurrentSurveyQuestion");
  	currentSurveyQuestion = currentSurveyQuestion.getValue();
  	alert("The value of currentSurveyQuestion is: " + currentSurveyQuestion);
	*/
}

function EnumCB_ResultOfMessage_POST() {
    ENUMCB.Required("pyWorkPage.Respondent.ResultOfMessage");
  
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");	
  
    if(!workPage.hasMessages()) { 
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var resultOfMessage = pega.ui.ClientCache.find("pyWorkPage.Respondent.ResultOfMessage");
    resultOfMessage = resultOfMessage.getValue();
    
    /*alert("The value of ResultOfMessage is: " + resultOfMessage);*/
    
    if(resultOfMessage == ""){
      ENUMCB.Required("pyWorkPage.Respondent.ResultOfMessage", "PleaseProvideAnAnswer");
    }
    else {
      if(resultOfMessage == "All other"){
        response.put("NRFU_PH_MSG_RESULT_CODE", "0");
        questFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");  
      }
      else {
        response.put("NRFU_PH_MSG_RESULT_CODE", "1");
        questFlags.put("NextSurveyQuestion", "BestTime_QSTN");
      }
    } 
  }
}

/*
* Pre processing function for Anyone MU question
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_PRE() {
  try {
    /* Enable exit survey, disable DK/Ref */
    CB.toggleFlag("ExitSurveyEnabled","true");
    CB.toggleFlag("DKRFEnabled","false");
    
	var isReinterview = pega.ui.ClientCache.find("pyWorkPage").get("IsReInterview");
	isReinterview = isReinterview ? isReinterview.getValue() : "false";
	
	var contactRespRI = pega.ui.ClientCache.find("pyWorkPage.Respondent").get("ReinterviewContactResponseTypeCode");
	contactRespRI = contactRespRI ? contactRespRI.getValue() : "";

	
	/* Use subset of Units if case is RI & ContactRespRI == 1 , o/w use full list */
	if(isReinterview != "true" || (isReinterview == "true" && contactRespRI != "1")) {	
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    
	  /* Clear QuestFlags.MultiUnitList */
      var tempMultiUnitList = questFlags.put("MultiUnitList",[]);
	
	  var index = questFlags.get("AnyoneMUIndex");
	  var maxIndex;
		
	  var unitCount = questFlags.get("UnitCount");
	  unitCount = unitCount ? unitCount.getValue() : 1;
	
      var currPageIndex = questFlags.get("CurrentPageIndex");
	
	  var totalPages = questFlags.get("TotalPages");
	  totalPages = totalPages ? totalPages.getValue() : Math.ceil(unitCount/20);
		
	  /* Initialize indices - if coming from 'Previous', show previous set of 20 units, otherwise show next 20 units */
      if(questFlags.get("IsGoingForward").getValue() == "true") {
	    index = index ? index.getValue() : 1;
	    maxIndex = (index + 19) > unitCount ? unitCount : index + 19;
	  
	    currPageIndex = currPageIndex ? currPageIndex.getValue() : 1; 
	  }
	  else {
	    /* Previous */
	    index = index ? index.getValue() : 1;
	    var remUnits = (index - 1) % 20;
	    maxIndex = index - 1;
	    index = remUnits != 0 ? index - remUnits : index - 20;

	    currPageIndex = currPageIndex ? currPageIndex.getValue() - 1: 1;
	  }
    
	  /* Set index flags for display purposes */
	  questFlags.put("AnyoneMUIndex",index);
	  questFlags.put("AnyoneMUMaxIndex",maxIndex);
	
	  questFlags.put("CurrentPageIndex",currPageIndex);
	  questFlags.put("TotalPages",totalPages);
	
	  /* Copy next block of units over to QuestFlags.MultiUnitList */
	  var masterList = pega.ui.ClientCache.find("pyWorkPage.MultiUnitList");
    
      var i = index;
      while(i <= maxIndex && masterList.get(i)) {
        var currentPage = masterList.get(i);
        tempMultiUnitList.add().adoptJSON(currentPage.getJSON());  
        i++;
      } 
    }
	else {
	  EnumCB_AnyoneMURI_PRE();
	}	
  }
  catch(e) {
    alert(e.message);
  }
}

function EnumCB_AnyoneMURI_PRE() {  
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  /* Clear QuestFlags.MultiUnitList */
  var tempMultiUnitList = questFlags.put("MultiUnitList",[]);
  
  var unitIDList = pega.ui.ClientCache.find("pyWorkPage.UnitIDListRI");
  var index = questFlags.get("AnyoneMUIndex");
  
  
  var currPageIndex = questFlags.get("CurrentPageIndex");
  var unitCount = questFlags.get("UnitCountRI");
  unitCount = unitCount ? unitCount.getValue() : 0;
  
  var totalPages = questFlags.get("TotalPages");
  totalPages = totalPages ? totalPages.getValue() : Math.ceil(unitCount/20);
		
  /* Initialize indices - if coming from 'Previous', show previous set of 20 units, otherwise show next 20 units */
  if(questFlags.get("IsGoingForward").getValue() == "true") {
	index = index ? index.getValue() : 1;
		  
	currPageIndex = currPageIndex ? currPageIndex.getValue() : 1; 	
  }
  else {
	/* Previous */
	index = index ? index.getValue() : 1;
	var remUnits = (index - 1) % 20;

	index = remUnits != 0 ? index - (remUnits + 20) : index - 40;

	currPageIndex = currPageIndex ? currPageIndex.getValue() - 1: 1;
  }
    
  var numUnits = 1;

  while(numUnits <= 20 && unitIDList.get(index)) {
    var currUnitID = unitIDList.get(index);    
	currUnitID = currUnitID ? currUnitID.getJSONObject() : "";
		
	var masterListItr = pega.ui.ClientCache.find("pyWorkPage.MultiUnitList").iterator();
	while(masterListItr.hasNext()) {
	  var currentPage = masterListItr.next();

	  if(currentPage.get("ReportingUnitID").getValue() == currUnitID) {
	    tempMultiUnitList.add().adoptJSON(currentPage.getJSON());
	    numUnits++;
	    break;
	  }
	}
	index++;
  }

  /* Store last index of UnitIDListRI */
  questFlags.put("AnyoneMUIndex",index);
  questFlags.put("TotalPages",totalPages);
  questFlags.put("CurrentPageIndex",currPageIndex);  
}

/*
* Post processing function for AnyoneMU_QSTN
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_POST() {
  try {
  
    var isReinterview = pega.ui.ClientCache.find("pyWorkPage").get("IsReInterview");
	isReinterview = isReinterview ? isReinterview.getValue() : "false";
	
	var contactRespRI = pega.ui.ClientCache.find("pyWorkPage.Respondent").get("ReinterviewContactResponseTypeCode");
	contactRespRI = contactRespRI ? contactRespRI.getValue() : "";
    
	if(isReinterview != "true" || (isReinterview == "true" && contactRespRI != "1")) { 
      /* Copy changes made from QuestFlags.MultiUnitList to pyWorkPage.MultiUnitList */       
	  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    
	  var tempUnitList = questFlags.get("MultiUnitList").iterator();
	  var index = questFlags.get("AnyoneMUIndex");	
	  index = index ? index.getValue() : 1;
	
	  var masterList = pega.ui.ClientCache.find("pyWorkPage.MultiUnitList");	
    
	  while(tempUnitList.hasNext()) {
	    var currentPage = tempUnitList.next();
	  
	    if(currentPage) {
	      var anyoneAnsw = currentPage.get("UnitStatusDesc");
	      anyoneAnsw = anyoneAnsw ? anyoneAnsw.getValue() : "";
	  
	      var anyoneAnswDetail = currentPage.get("UnitStatusReasonDesc");
	      anyoneAnswDetail = anyoneAnswDetail ? anyoneAnswDetail.getValue() : "";
	  
	      var masterPage = masterList.get(index);
	      masterPage.put("UnitStatusDesc",anyoneAnsw);
	      masterPage.put("UnitStatusReasonDesc",anyoneAnswDetail);
	    }
	    index++;
	   }
 		
	  /* Check if we have any more pages of Units to answer */
      if(!masterList.get(index)) {
	    /* Check if all units were answered - if yes: go to Goodbye_QSTN; o/w go to NoComplete_QSTN */
	    questFlags.put("NextSurveyQuestion","Goodbye_QSTN");
	  
	    var masterListItr = masterList.iterator();
	    while(masterListItr.hasNext()) {
	      var currentPage = masterListItr.next();
		
		  var anyoneAnsw = currentPage.get("UnitStatusDesc");
		  anyoneAnsw = anyoneAnsw ? anyoneAnsw.getValue() : "";
		
		  if(anyoneAnsw == "") {
		    /* Add Soft Edit Validation */
		    ENUMCB.AnyoneMU_SoftVLDN();
		  
		    var workPage = pega.ui.ClientCache.find("pyWorkPage");
	              
		    if(!workPage.hasMessages()) {
		      questFlags.put("NextSurveyQuestion","NoComplete_QSTN");
            
		    } else {
              return;
            }
		    break;
          }
	    }
	  } else {
	    questFlags.put("NextSurveyQuestion","AnyoneMU_QSTN");
	  }
    
      questFlags.put("AnyoneMUIndex",index);
	
	  var currPageIndex = questFlags.get("CurrentPageIndex");
	  currPageIndex = currPageIndex ? currPageIndex.getValue() : 1;
	  currPageIndex++;
	
	  questFlags.put("CurrentPageIndex",currPageIndex);

    }
	else {
	  EnumCB_AnyoneMURI_POST();
	}
  }
  catch(e) {
    alert(e.message);
  }
}


function EnumCB_AnyoneMURI_POST() {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var tempUnitList = questFlags.get("MultiUnitList").iterator();
  
  /* Set data from QuestFlags.MultiUnitList to Master list */
  while(tempUnitList.hasNext()) {
    var tempPage = tempUnitList.next();
	var tempUnitID = tempPage.get("ReportingUnitID");
    tempUnitID = tempUnitID ? tempUnitID.getValue() : "";
	
	/* Loop through master until we find a match and propagate data over */
	var masterList = pega.ui.ClientCache.find("pyWorkPage").get("MultiUnitList").iterator();
	while(masterList.hasNext()) {
	  var currMasterPage = masterList.next();
	  var unitIDMaster = currMasterPage.get("ReportingUnitID");
	  unitIDMaster = unitIDMaster ? unitIDMaster.getValue() : "";
	  
	  if(tempUnitID == unitIDMaster) {
	    var anyoneAnsw = tempPage.get("UnitStatusDesc");
		anyoneAnsw = anyoneAnsw ? anyoneAnsw.getValue() : "";
		
		var anyoneAnswDetail = tempPage.get("UnitStatusReasonDesc");
		anyoneAnswDetail = anyoneAnswDetail ? anyoneAnswDetail.getValue() : "";
		
		currMasterPage.put("UnitStatusDesc",anyoneAnsw);
		currMasterPage.put("UnitStatusReasonDesc",anyoneAnswDetail);
		
		break;	
	  }
	} 
  } 	
  /* Check if we have any more pages of Units to answer */
  var unitListIndex = questFlags.get("AnyoneMUIndex");
  unitListIndex = unitListIndex ? unitListIndex.getValue() : 1;
  
  var unitIDList = pega.ui.ClientCache.find("pyWorkPage").get("UnitIDListRI");
  
  if(!unitIDList.get(unitListIndex)) {
    /* Check if all units were answered - if yes: go to Goodbye_QSTN; o/w go to NoComplete_QSTN */
	questFlags.put("NextSurveyQuestion","Goodbye_QSTN");
	  
	var masterListItr = pega.ui.ClientCache.find("pyWorkPage.MultiUnitList").iterator();
	while(masterListItr.hasNext()) {
	  var currentPage = masterListItr.next();
		
      var anyoneAnsw = currentPage.get("UnitStatusDesc");
      anyoneAnsw = anyoneAnsw ? anyoneAnsw.getValue() : "";
		
	  if(anyoneAnsw == "") {
		/* Add Soft Edit Validation */
		ENUMCB.AnyoneMU_SoftVLDN();
		  
		var workPage = pega.ui.ClientCache.find("pyWorkPage");
	              
		if(!workPage.hasMessages()) {
		  questFlags.put("NextSurveyQuestion","NoComplete_QSTN");
            
		} else {
          return;
        }
		break;
      }
	}
  } else {
	questFlags.put("NextSurveyQuestion","AnyoneMU_QSTN");
  }
    
      
  var currPageIndex = questFlags.get("CurrentPageIndex");
  currPageIndex = currPageIndex ? currPageIndex.getValue() : 1;
  currPageIndex++;
	
  questFlags.put("CurrentPageIndex",currPageIndex);

}

/*
  *	Pre Action for NumberCalled_QSTN
  *	Created by:Ramin M.
*/
function EnumCB_NumberCalled_PRE(){
    try
    {
      CB.toggleFlag("DKRFEnabled", "false");
      CB.toggleFlag("ExitSurveyEnabled","true");
	 
     
    }
    catch(Err)
    {
        alert("Error in EnumCB_NumberCalled_PRE ==> <" + Err.getMessage() + ">");
    }
}


/*
  *	Post Action for NumberCalled_QSTN
  *	Created by:Ramin M.
*/
function EnumCB_NumberCalled_POST()
{


  try
  {
    var workPage = pega.ui.ClientCache.find("pyWorkPage");	

    if(!workPage.hasMessages()) {  


   

      /*pega.offline.runDataTransform("EnumCB_NumberCalled_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);*/

      var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var cpPhoneNumbers = pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers");

      var cpNumber= pega.ui.ClientCache.find("pyWorkPage.Respondent");


      var telephoneNum = cpResponse.get("NRFU_PH_NUM_CALLED_TEXT") ? cpResponse.get("NRFU_PH_NUM_CALLED_TEXT").getValue() : "";
      cpResponse.put("NRFU_PH_NUM_CALLED_TEXT",telephoneNum);

      var phone  = cpResponse.get("NRFU_PH_NUM_CALLED_TEXT") ? cpResponse.get("NRFU_PH_NUM_CALLED_TEXT").getValue() : "";
      alert("New Phone   is"  + phone);



      var phoneCount = cpQuestFlags.get("CurrentTelephoneCount") ? cpQuestFlags.get("CurrentTelephoneCount").getValue() : "";

   /*   alert("total nums :: "  + phoneCount); */



      var phoneIndex = cpQuestFlags.get("CurrentTelephoneIndex") ? 			 cpQuestFlags.get("CurrentTelephoneIndex").getValue() : "";

  /*    alert("Current Phone Index isiiii: "  + phoneIndex); */

      var newNumIndex = phoneCount - (phoneIndex -1);
    /*  alert("New Num index isiiii: "  + newNumIndex); */

      ENUMCB.appendDistinctNumberToTelephoneNumbersList(telephoneNum, phoneAssoc);		
   /*   alert("Phone Appended:  "  + telephoneNum   + " " +  phoneAssoc); */

      
      
      
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var indexHHProxy = cpQuestFlags.get("SelectedNumCallHHProxyIndex") ? cpQuestFlags.get("SelectedNumCallHHProxyIndex").getValue() : "";
  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var respLocCode = cpResponse.get("RESPONSE_LOCATION_CODE"); respLocCode = respLocCode ? respLocCode.getValue() : "";

   var needSoftEdit = "false";
   var validSoft= "NumberCalled1_SOFT";
    if(indexHHProxy == "0" && respLocCode != "1") {
   	 ENUMCB.NumberCalled_SoftVLDN(validSoft);

      needSoftEdit = "true";
    }else if  (indexHHProxy  == "1" &&  respLocCode  != "2") {
      var validSoft= "NumberCalled_SOFT";
    ENUMCB.NumberCalled_SoftVLDN(validSoft);
    needSoftEdit = "true";
    }else { needSoftEdit = "false";
		 
	}
 /*   
 alert (  "index proxy " +   indexHHProxy );

alert (  "resLocCode" +   respLocCode );

alert (  "needSoftEdit" +   needSoftEdit );

      
      
      
*/ 
      

      if(newNumIndex == "1"){
        /* Add New Number to Page List  */
        var respType = "";
        var phoneAssoc = "";

        if(isRI == "true"){
          respType = cpResponse.get("RESPTYPE_PROD") ? cpResponse.get("RESPTYPE_PROD").getValue() : "";
          if(respType == "HH"){
            phoneAssoc = "HH";

          }else if(respType =="proxy"){
            phoneAssoc = "proxy";
          }
        }else{
          respType = cpResponse.get("RESP_TYPE_CODE") ? cpResponse.get("RESP_TYPE_CODE").getValue() : "";
          if(respType == "HH"){
            phoneAssoc = "HH";
          }else if(respType =="proxy"){
            phoneAssoc = "proxy";
          }
        }




      }
      /*	ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_PH_NUM_CALLED_TEXT"); */
    }
  }
  catch(Err)
  {
    alert("Error in EnumCB_NumberCalled_POST ==> <" + Err.getMessage() + ">");
  }
}


/**
*	Function for EnumCB_NewCaseAddress_PRE
*	
**/
function EnumCB_NewCaseAddress_PRE() {
  
 try {
   
    CB.toggleFlag("DKRFEnabled", "true");
  	CB.toggleFlag("ExitSurveyEnabled", "true");
    ENUMCB.updateDKRefVisibility("NewCaseAddress", "pyWorkPage.Respondent.DKRefused");
   
    pega.offline.runDataTransform("EnumCB_NewCaseAddress_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);
   
  } catch (e) {
    console.log("*** EnumCB_NewCaseAddress_PRE, Exception message: " + e.message);
    alert("Exception in EnumCB_NewCaseAddress_PRE" + e.message);
  }  
}

/**
*	Function for EnumCB_NewCaseAddress_POST
*	
**/
function EnumCB_NewCaseAddress_POST() {

   try {
  
   	/*First, run validation function*/
    ENUMCB.NewCaseAddress_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
  	if (!workPage.hasMessages()) {	 
        pega.offline.runDataTransform("EnumCB_NewCaseAddress_POST","CB-FW-CensusFW-Work-Quest-Enum",null);      
  	}        

  } catch (e) {
    console.log("*** EnumCB_NewCaseAddress_POST, Exception message: " + e.message);
    alert("Exception in EnumCB_NewCaseAddress_POST" + e.message);
  }
}

/**
* Post function for Find Address QSTN
* Created by: Timothy Risch
* Created on: 05-15-2017 - US-420
* Modified by: Jeremy Helm 
* Modified on: 05-17-2017 - US-3575
**/

function EnumCB_FindAddress_POST()
{
  try
  {
      ENUMCB.removeSoftError();
      var workPage = pega.ui.ClientCache.find("pyWorkPage");
      var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  	  var findAddress = pega.ui.ClientCache.find("pyWorkPage.Respondent.FindAddress").getValue();
      var findAddressAddtl = pega.ui.ClientCache.find("pyWorkPage.Respondent.FindAddressAdditionalInfo").getValue();
      findAddressAddtl = findAddressAddtl ? findAddressAddtl.trim() : "";
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var IsOnPath = questFlags.get("IsOnPath") ? questFlags.get("IsOnPath").getValue() : "false";
      var householdLocation = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
      var noGPS = questFlags.get("NoGPS") ? questFlags.get("NoGPS").getValue() : "NOT SET";
      /* alert("No GPS is: " + noGPS); */
      var destinationLat = parseFloat(householdLocation.get("OFLAT").getValue());
      /* alert("The value of destinationLat is: " + destinationLat); */
	  var destinationLon = parseFloat(householdLocation.get("OFLON").getValue());
      /* alert("The value of destinationLon is: " + destinationLon); */
      var maxDist = workPage.get("MaxDistance") ? workPage.get("MaxDistance").getValue() : "NOT SET";
      /* alert("The value of maxDist is: " + maxDist); */
      var errorMessage = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "DistanceTooFarContinue_SOFT");
      var errorMessage2 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "MapSpotNotCollected_SOFT");
      var errorMessage3 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "PleaseSpecifyMoreInfo_SOFT");
      var errorMessage4 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "SpecifyHousingUnitWhereabouts_HARD");
      var softEditPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.SoftEditVLDN");
    
	  /* Set phone coordinates if noGPS is false */
    
      if(noGPS != "true"){
          var mobileLat = questFlags.get("MobileLat") ? parseFloat(questFlags.get("MobileLat").getValue()) : "";
          /* alert("The value of mobileLat is: " + mobileLat); */
          var mobileLon = questFlags.get("MobileLon") ? parseFloat(questFlags.get("MobileLon").getValue()) : "";
          /* alert("The value of mobileLon is: " + mobileLon); */
          var dist = findGeographicalDistance(destinationLat, destinationLon, mobileLat, mobileLon);
          /* alert("The value of dist is: " + dist); */
      }
    
      /* Check if softEditPage doesn't exists (ie: no soft edit already called) */
      if(!softEditPage) {
        
        var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
        respPage.put("SoftEditVLDN",{});
        
        /* Set soft error if noGPS is true and user selected other w/o filling in textbox*/
        if(noGPS == "true" && findAddress == "Other" && findAddressAddtl == ""){
          /* error message tbd */
          softEditPage.put("FindAddressFlag","true");
        }
        
        /* Set soft error if noGPS is true */
        else if(noGPS == "true"){
          workPage.addMessage(errorMessage2);
          ENUMCB.addSoftError(errorMessage2,false);
          softEditPage.put("FindAddressFlag","true");
        }
        
        /* Set soft error if phone's too far from field address */
        else if (dist > 0 && dist > maxDist) {
          workPage.addMessage(errorMessage);
          ENUMCB.addSoftError(errorMessage,false);
          softEditPage.put("FindAddressFlag","true");
        }
        
        /* Set soft error if user didn't enter a value for Find Address */
        else if(findAddress == ""){
          ENUMCB.Required("pyWorkPage.Respondent.FindAddress");
        }
        
        /* Set soft error if user selected Other but didn't provide additonal information */
        else if(findAddress == "Other" && findAddressAddtl == ""){
          workPage.addMessage(errorMessage3);
          ENUMCB.addSoftError(errorMessage3,false);
          softEditPage.put("FindAddressFlag","true");
        }  
      }
        
     /* Check if user has no gps, selected yes, and didn't enter valid additional information */
     
     if(noGPS == "true" && findAddress == "Yes" && (findAddressAddtl == "" || findAddressAddtl.length() < 3 )){
          workPage.addMessage(errorMessage4);
     }
  
    /* Check if work page has no error meassages and set necesary values for the case*/   
     if(!workPage.hasMessages()){
       
       questFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");
       respondent.put("EventCode","1.040");
       if(IsOnPath == "true"){
         if(findAddress == "Yes") {
           respondent.put("EventCode","13.000");
           respondent.put("StatusCode","C");
         }
       
         else if(findAddress == "No") {
           respondent.put("EventCode","13.001");
           respondent.put("StatusCode","C");
         }
       
         else if(findAddress == "Other") {
           respondent.put("EventCode","13.002");
           respondent.put("StatusCode","C");
         }
       }
     }
  }
    catch(Err)
    {
        alert("Error in FindAddress_POST ==> <" + Err.getMessage() + ">");
    }
}

/**
* Pre function for Find Address QSTN
* Created by: Timothy Risch
* Created on: 05-15-2017 - US-420
* Modified by: Jeremy Helm 05-17-2017 
* Modified on: 05-17-2017 - US-3575 
* Purpose: Get phone GPS ccoordinates and save previous question for happy path determination
**/

function EnumCB_FindAddress_PRE()
{
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false");
  
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  var previousQuestion = workPage.get("CurrentSurveyQuestion");
  previousQuestion = previousQuestion ? previousQuestion.getValue() : "";
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  questFlags.put("IsOnPath","true"); 
  questFlags.put("PreviousQuestion",previousQuestion);
  questFlags.remove("MobileLat");
  questFlags.remove("MobileLon");
  respondent.remove("SoftEditVLDN");
  
  ENUMCB.findCurrentLocation();
}

/*
*	Created by: David Bourque
*	Used by VerifyDialedNumber. Calls validation and sets "nextSurveyQuestion"
*/
function EnumCB_VerifyDialedNumber_PRE() {
  ENUMCB.updateDKRefVisibility("VerifyDialedNumber","pyWorkPage.Respondent.DKRefused");
  pega.offline.runDataTransform("EnumCB_VerifyDialedNumber_PRE","CB-FW-CensusFW-Work-Quest-Enum",null);
}

/*
*	Created by: David Bourque
*	Used by VerifyDialedNumber. Sets DKREF and Exit Survey flags
*/
function EnumCB_VerifyDialedNumber_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if(isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_PH_DIAL_YES_IND", "pyWorkPage.Respondent.DKRefused.VerifyDialedNumber", "PleaseProvideAnAnswer"); 
  }
  else {
    ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_PH_DIAL_YES_IND", "", "PleaseProvideAnAnswer"); 
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()) {
    pega.offline.runDataTransform("EnumCB_VerifyDialedNumber_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
    ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.VerifyDialedNumber", "pyWorkPage.Respondent.Response.NRFU_PH_DIAL_DK_IND", "pyWorkPage.Respondent.Response.NRFU_PH_DIAL_REF_IND");
  }
}
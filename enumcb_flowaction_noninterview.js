/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in NonInterviewNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/*
*	Pre Action for Exit Pop Status
*	Created by: David Bourque
*/
function EnumCB_ExitPopStatus_PRE(){
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibilityfor2PropertiesRespondent("ExitPopStatusNumber","ExitPopStatusUnitStatus");
  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var exitNumber = cpResponse.get("H_SIZE_EST_NRFU_INT");
  if (exitNumber && parseInt(exitNumber.getValue()) == 0) {
    cpResponse.put("H_SIZE_EST_NRFU_INT","");
  }
}

/*
*	Post Action for Exit Pop Status
*	Created by: David Bourque
*/
function EnumCB_ExitPopStatus_POST() {
    try {
        ENUMCB.ExitPopStatus_VLDN();
        var workPage = pega.ui.ClientCache.find("pyWorkPage");
        if (!workPage.hasMessages()) {
            var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
            var cpDKRefused = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
            var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
            var isCensusDayAddress = cpResponse.get("IsCensusDayAddress") ? cpResponse.get("IsCensusDayAddress").getValue() : "";
            var nrfuWhoCode = cpResponse.get("NRFU_WHO_CODE") ? cpResponse.get("NRFU_WHO_CODE").getValue() : "";
            var whoDKRefused = cpDKRefused.get("Who") ? cpDKRefused.get("Who").getValue() : "";
            if (isCensusDayAddress == "0") {
                cpQuestFlags.put("NextSurveyQuestion", "InMoverDone_QSTN");
            } else if ((whoDKRefused == "R") || (nrfuWhoCode == "2")) {
                cpQuestFlags.put("NextSurveyQuestion", "Goodbye_QSTN");
            } else {
                cpQuestFlags.put("NextSurveyQuestion", "NoComplete_QSTN");
            }

            var unitStatus = cpResponse.get("H_NRFU_STATUS_EXIT_CODE") ? cpResponse.get("H_NRFU_STATUS_EXIT_CODE").getValue() : "";
            var exitNumber = cpResponse.get("H_SIZE_EST_NRFU_INT") ? cpResponse.get("H_SIZE_EST_NRFU_INT").getValue() : "";
            exitNumber = parseInt(exitNumber, 10);
            if (unitStatus == "2" || unitStatus == "3") {
                cpResponse.put("H_SIZE_EST_NRFU_INT", "0");
            }
            if (exitNumber >= 1 && exitNumber <= 99) {
                cpResponse.put("H_NRFU_STATUS_EXIT_CODE", "1");
            }

            var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
            questFlags.put("ExitSurveyAction", "");

            ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ExitPopStatusNumber", "pyWorkPage.HouseholdMemberTemp.Response.H_SIZE_EST_NRFU_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.H_SIZE_EST_NRFU_REF_IND");
            ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ExitPopStatusUnitStatus", "pyWorkPage.HouseholdMemberTemp.Response.H_NRFU_STATUS_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.H_NRFU_STATUS_REF_IND");
        }
    } catch (e) {
        alert("ExitPopStatus" + e.message);
    }
}

/*
*	Created by: Kyle Gravel
*   Reworked by Mark Coats to add RI/MU and use DT call.
*	used by NoComplete_QSTN
*	Pre Action currently populates datapage with proper options
*/
function EnumCB_NoComplete_PRE() {  
  /*prime dp*/
  /*ENUMCB.primeNoCompleteOptionsDP();*/
  /*Disable DKRF and ExitSurvey
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled", "false");*/
  try
  {
      pega.offline.runDataTransform("EnumCB_NoComplete_PRE","CB-FW-CensusFW-Work-Quest-Enum","pyWorkPage");
  }
  catch(e)
  {
      alert("Error invoking EnumCB_NoComplete_PRE DT ==> <" + e.getMessage()+ ">");
  }
}

/*
*	Created by: Kyle Gravel
*   Reworked by Mark Coats for MU and RI
*   Reworked by Timothy Risch for NRFU
*	Used by NoComplete_QSTN Post action
*/
function EnumCB_NoComplete_POST() { 
  	/*First, run validation function*/
  	ENUMCB.NoComplete_VLDN();
  	var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages())
    {
	   try
	   {
		   pega.offline.runDataTransform("EnumCB_NoComplete_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
		   var reInterview = workPage.get("IsReInterview")? workPage.get("IsReInterview").getValue() : "";
		   var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
		   var isMU = locAddress? (locAddress.get("IsMultiUnit")? locAddress.get("IsMultiUnit").getValue() : "") : "";
		   var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
		   var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
		   var respTypeCode = responsePage.get("RESP_TYPE_CODE")? responsePage.get("RESP_TYPE_CODE").getValue() : "";
		   var respTypeProd = responsePage.get("RESPTYPE_PROD")? responsePage.get("RESPTYPE_PROD").getValue() : "";
		   var addressNo = responsePage.get("IsCensusDayAddress")? responsePage.get("IsCensusDayAddress").getValue() : "";
		   var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
		   var partialAddress = locAddress? (locAddress.get("PartialAddress")? locAddress.get("PartialAddress").getValue() : "") : "";
		   var nrfuIncompleteCode = responsePage.get("NRFU_INCOMPLETE_CODE")? responsePage.get("NRFU_INCOMPLETE_CODE").getValue() : "";
		   var nrfuIncompleteOtherText = responsePage.get("NRFU_INCOMPLETE_OTHER_TEXT")?
					responsePage.get("NRFU_INCOMPLETE_OTHER_TEXT").getValue() : "";
		   var nrfuIncompleteText = "";
		   var ncMaster = pega.ui.ClientCache.find("D_NoCompleteOptions_Master.pxResults").iterator();
		   while(ncMaster.hasNext())
		   {
			   var currentPage = ncMaster.next();
			   var value = currentPage.get("pyValue").getValue();
			   if(value == nrfuIncompleteCode)
			   {
				   nrfuIncompleteText = currentPage.get("pyLabel").getValue();
				   if(value == "10")
				   {
					   nrfuIncompleteText = nrfuIncompleteText.replace("RESPNAME",
							 (respondent.get("FullName")? respondent.get("FullName").getValue() : "") );
				   }
				   else if(value == "9" )
				   {
					   nrfuIncompleteText = nrfuIncompleteText + ": " + nrfuIncompleteOtherText;
				   }
				   break;
			   }
		   }
		   if(reInterview == "true" && isMU != "true")
		   {
			   if(respTypeProd == "HH")
			   {
				   var text = "NO COMPLETE: " + nrfuIncompleteText;
				   CB.addCaseNote(text, partialAddress, false,"Reinterview:");
			   }
			   else if(respTypeProd == "proxy")
			   {    
				   /* Add Proxy Partial Address to Note */
				   var proxyAddr = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
				   var partialProxyAddr = proxyAddr ? proxyAddr.get("PartialAddress") : "";
				   partialProxyAddr = partialProxyAddr ? partialProxyAddr.getValue() : "";
				   var text = "NO COMPLETE: " + nrfuIncompleteText;
				   CB.addCaseNote(text, partialProxyAddr, false, "Reinterview:");
			   }
		   }
         
           else if(isMU == "true" && reInterview == "true")
           {
              var text = "NO COMPLETE: " + nrfuIncompleteText;
				   CB.addCaseNote(text, partialAddress, false,"MU Manager Reinterview:");
            
           }
                  
           else if(isMU == "true")
		   {
			   if((respTypeCode == "HH") || ((respTypeCode == "proxy") && (addressNo == "0")) )
			   {           
				   var text = "NO COMPLETE: " + nrfuIncompleteText;
				   CB.addCaseNote(text, partialAddress, false,"Census Address:");
			   }
			   else if(respTypeCode == "proxy")
			   {    
				   var MUName = locAddress.get("MUName");
				   var MUaddress = MUName ? MUName.getValue() + " " + partialAddress : partialAddress;
		     			            
				   var text = "NO COMPLETE: " + nrfuIncompleteText;
				   CB.addCaseNote(text, MUaddress, false,"MU Manager:");
			   }
		   }
		   else
		   {
			 /* Added case note logic for NRFU as per US-2961 */
             var text = "NO COMPLETE: " + nrfuIncompleteText;
             
             if((respTypeCode == "HH") || (respTypeCode == "") || ((respTypeCode == "proxy") && (addressNo == "0")))
			   {   
				   CB.addCaseNote(text, partialAddress, false, "Census Address:");
			   }
			   else if(respTypeCode == "proxy")
			   {    
				   CB.getProxyAddress(text, false, "PROXY:");
			   }
		   }
		}
		catch(e)
		{
			alert("Error in NoComplete_POST JS ==> <" + e.getMessage() + ">");
		}
    }
}

/*
*	Post Action for Unable to Attempt 
*	Created by: David Bourque
*	Modified by Jared Nichols 3/29/17 -Added RI logic and refactored
*/
function EnumCB_UnableToAttempt_POST() {
    ENUMCB.UnableToAttempt_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if( !workPage.hasMessages())
    {
      var reInterview = workPage.get("IsReInterview")? workPage.get("IsReInterview").getValue() : "";
      var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
      var isMU = locAddress? (locAddress.get("IsMultiUnit")? locAddress.get("IsMultiUnit").getValue() : "") : "";
      if(isMU == "true" && reInterview == "true")
      {
        ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_UNABLE_CODE"); 
      }
    }
    if (!workPage.hasMessages()) {
        pega.offline.runDataTransform("EnumCB_UnableToAttempt_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);
    }
}

/*
*	Pre Action for Unable to Attempt 
*	Created by: David Bourque
*/
function EnumCB_UnableToAttempt_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","false");
}

/*
*   Created by: Not Listed
*   Created on: Unknown
*   Used by: RefusalReason_QSTN
*   Updated by: Timothy Risch
*   Updated on: 05-04-2017
*/
function EnumCB_RefusalReason_PRE() {  
  
  /*Disable DKRF and ExitSurvey*/
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled", "false");
  
  /*Remove case note in case the value of No Complete screen changes */
  var caseText = "REFUSAL REASON:";
  CB.removeDuplicateCaseNote(caseText);
}

/*
* Used by RefusalReason_QSTN Post action
* Updated by Jared Nichols 3/27/17-4/30/17, Aditi Ashok 4/5/17
* Updated by Iain Horiel 4/24/17
*/
function EnumCB_RefusalReason_POST() {
    /*Get pages */
    try {
        ENUMCB.RefusalReason_VLDN();
        var workPage = pega.ui.ClientCache.find("pyWorkPage");

        if (!workPage.hasMessages()) {
            var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
            questFlags.put("HasRefusalReason", "true");
            var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");

            /*get ATTACTUAL VALUE, RESP_TYPE_CODE, NRFU_INCOMPLETE_CODE, and reInterview*/
            var attActual = responsePage.get("ATTACTUAL");
            attActual = attActual ? attActual.getValue() : "";
            var respTypeCode = responsePage.get("RESP_TYPE_CODE");
            respTypeCode = respTypeCode ? respTypeCode.getValue() : "";
            var incompleteCode = responsePage.get("NRFU_INCOMPLETE_CODE");
            incompleteCode = incompleteCode ? incompleteCode.getValue() : "";
            var reInterview = workPage.get("IsReInterview").getValue();
            var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
            var isMultiUnit = locAddress.get("IsMultiUnit").getValue();


            pega.offline.runDataTransform("EnumCB_RefusalReason_POST", "CB-FW-CensusFW-Work-Quest-Enum", null);

            /*Add Case Note Logic*/
            var partialAddress = locAddress ? (locAddress.get("PartialAddress") ? locAddress.get("PartialAddress").getValue() : "") : "";
            var refusalReason = pega.ui.ClientCache.find("pyWorkPage.Respondent.RefusalReason");
            var addressANS = responsePage.get("IsCensusDayAddress");
            var addressPrefix = "";
            var redText = true;

            /* NRFU */
            if (reInterview != "true") {
                if (respTypeCode == "HH" || respTypeCode == "" || (respTypeCode == "proxy" && addressANS == "0")) {
                    addressPrefix = "Census Address: ";
                    redText = false;
                } else if (respTypeCode == "proxy") {

                    /* MU - Format Address & Prefix different than non-MU */
                    if (isMultiUnit == "true") {
                        var MUName = locAddress.get("MUName");
                        partialAddress = MUName ? MUName.getValue() + " " + partialAddress : partialAddress;

                        addressPrefix = "MU Manager: ";
                        redText = false;
                    } else {
                        addressPrefix = "PROXY: ";
                        redText = false;
                        var proxyAddressNumber = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyLocation.LOCHN").getValue();
                        var proxyAddressStreet = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyLocation.StreetName").getValue();

                        if (proxyAddressNumber && proxyAddressStreet) {
                            partialAddress = proxyAddressNumber.toUpperCase() + " " + proxyAddressStreet.toUpperCase();
                        } else {
                            partialAddress = "ADDRESS UNKNOWN";
                        }
                    }
                }
            }
            /* ReInterview & MultiUnit*/
            else if (reInterview == "true" && isMultiUnit == "true") {
                var MUName = locAddress.get("MUName");
                partialAddress = " " + partialAddress;
                addressPrefix = "MU Manager Reinterview: ";
                redText = false;
            } else {
                var respTypeProd = responsePage.get("RESPTYPE_PROD");
                respTypeProd = respTypeProd ? respTypeProd.getValue() : "";

                redText = false;
                addressPrefix = "Reinterview:";

                if (respTypeProd == "proxy") {
                    /* Add Proxy Partial Address to Note */
                    var proxyAddr = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
                    var partialProxyAddr = proxyAddr ? proxyAddr.get("PartialAddress") : "";
                    partialAddress = partialProxyAddr ? partialProxyAddr.getValue() : "";
                }
            }

            /*Build Refusal Reason Case Text*/
            var text = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason_QSTN") + ": ";
            text += "<ul>";
            if (refusalReason.get("RespondentTooBusy") && refusalReason.get("RespondentTooBusy").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason1_ANSW") + "</li>";
            }
            if (refusalReason.get("NotInterested") && refusalReason.get("NotInterested").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason2_ANSW") + "</li>";
            }
            if (refusalReason.get("SurveyIsAWasteOfTaxpayerMoney") && refusalReason.get("SurveyIsAWasteOfTaxpayerMoney").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason3_ANSW") + "</li>";
            }
            if (refusalReason.get("DoneEnoughOtherSurveys") && refusalReason.get("DoneEnoughOtherSurveys").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason4_ANSW") + "</li>";
            }
            if (refusalReason.get("CompletedQuestionnaireUsing") && refusalReason.get("CompletedQuestionnaireUsing").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason5_ANSW") + "</li>";
            }
            if (refusalReason.get("MailedInCompletedQuestionnaire") && refusalReason.get("MailedInCompletedQuestionnaire").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason6_ANSW") + "</li>";
            }
            if (refusalReason.get("QuestionsLegitimacyOfQuestionnaire") && refusalReason.get("QuestionsLegitimacyOfQuestionnaire").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason7_ANSW") + "</li>";
            }
            if (refusalReason.get("PrivacyConcerns") && refusalReason.get("PrivacyConcerns").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason8_ANSW") + "</li>";
            }
            if (refusalReason.get("SchedulingDifficulties") && refusalReason.get("SchedulingDifficulties").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason9_ANSW") + "</li>";
            }
            if (refusalReason.get("SurveyIsVoluntary") && refusalReason.get("SurveyIsVoluntary").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason10_ANSW") + "</li>";
            }
            if (refusalReason.get("DoesNotUnderstandTheQuestionnaire") && refusalReason.get("DoesNotUnderstandTheQuestionnaire").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason11_ANSW") + "</li>";
            }
            if (refusalReason.get("AntigovernmentConcerns") && refusalReason.get("AntigovernmentConcerns").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason12_ANSW") + "</li>";
            }
            if (refusalReason.get("HangupSlammedDoor") && refusalReason.get("HangupSlammedDoor").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason13_ANSW") + "</li>";
            }
            if (refusalReason.get("HostileResp") && refusalReason.get("HostileResp").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason14_ANSW") + "</li>";
            }
            if (refusalReason.get("BreaksAppointment") && refusalReason.get("BreaksAppointment").getValue() == "true") {
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReason15_ANSW") + "</li>";
            }
            if (refusalReason.get("Other") && refusalReason.get("Other").getValue() == "true") {
                var otherComment = refusalReason.get("OtherComment").getValue();
                text += "<li>" + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RefusalReasonOther_ANSW") + ": " + otherComment + "</li>";
            }
            CB.addCaseNote(text, partialAddress, redText, addressPrefix);
        }
    } catch (TCErr) {
        alert("Getting error in POST ==> " + TCErr.message);
    }
}
/**
* Pre function for Language Barrier QSTN
* Created by: Dillon Irish
**/

function EnumCB_LanguageBarrier_PRE(){
	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var lbocb = questFlags.get("LanguageBarrierOtherCheckbox");
    if(!lbocb)
    {
		questFlags.put("LanguageBarrierOtherCheckbox", false);
    }
    var resp = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var initProp = resp.get("NRFU_RESP_LANG_BARRIER_CODE");
    if(!initProp)
    {
  	   initProp = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response").put("NRFU_RESP_LANG_BARRIER_CODE", []);
    }
    var langBarrierTempPage = pega.ui.ClientCache.createPage("LangBarrierTempPage");
    var langBarrierTempPageResults = langBarrierTempPage.put("pxResults", []);
    langBarrierTempPageResults = pega.ui.ClientCache.find("LangBarrierTempPage.pxResults");
  
  	var langBarrierDP = pega.ui.ClientCache.find("D_LanguageBarrierLanguageList.pxResults");
    var langBarrierIterator = langBarrierDP.iterator();
    while(langBarrierIterator.hasNext())
    {
        var tempPage = langBarrierIterator.next();
        var LanguageCode = tempPage.get("Code")? tempPage.get("Code").getValue() : "";
        if(initProp)
        {
          var respLangIterator = initProp.iterator();
          while(respLangIterator.hasNext())
          {
            var curRespLangCode = respLangIterator.next();
            var respLangCode = curRespLangCode.get("Code") ? curRespLangCode.get("Code").getValue() : "";
            if(respLangCode == LanguageCode)
            {
              tempPage.put("pySelected", true);
              break;
            }
          }
        }
        var tempPageJSON = tempPage.getJSON();
        langBarrierTempPageResults.add().adoptJSON(tempPageJSON);
    }
}


/**
* Post function for Language Barrier QSTN
* Created by: Dillon Irish
**/
  
function EnumCB_LanguageBarrier_POST () {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var languageList = pega.ui.ClientCache.find("LangBarrierTempPage.pxResults");
  var languageListIterator = languageList.iterator();

  var counter = 0;
  var respLangCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_RESP_LANG_BARRIER_CODE");

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var languageOtherCheckbox = questFlags.get("LanguageBarrierOtherCheckbox") ? questFlags.get("LanguageBarrierOtherCheckbox").getValue() : "";

  if(languageOtherCheckbox == "true"){
    counter += 1;
  }

  while(languageListIterator.hasNext()) {  
    var thisPage = languageListIterator.next();
    var isSelected = thisPage.get("pySelected") ? thisPage.get("pySelected").getValue() : ""; 
    if (isSelected == true)
    {
      counter += 1;
    }
  }

  var pyWorkPage = pega.ui.ClientCache.find("pyWorkPage");
  var errorMessage = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "PleaseProvideAnAnswer");

  if(counter == 0) {
    pyWorkPage.addMessage(errorMessage);
  }

  var langList = pega.ui.ClientCache.find("LangBarrierTempPage.pxResults");
  var langListIterator = langList.iterator();
  if (!pyWorkPage.hasMessages()) {
  	respPage.put("NRFU_RESP_LANG_BARRIER_CODE", []); 
    respLangCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_RESP_LANG_BARRIER_CODE");
    while(langListIterator.hasNext()) {  
      var thisPage = langListIterator.next();
      var isSelected = thisPage.get("pySelected") ? thisPage.get("pySelected").getValue() : "";
      if (isSelected == true) {
        var desc = thisPage.get("Description") ? thisPage.get("Description").getValue() : "";
        var code = thisPage.get("Code") ? thisPage.get("Code").getValue() : "";
        var lanPage = pega.ui.ClientCache.createPage("LanguageCodes");

        lanPage.put("Description", desc);
        lanPage.put("Code", code);
        var lanPageJSON =lanPage.getJSON();
        respLangCode.add().adoptJSON(lanPageJSON);
      }
    }
  }
}

/**
*	Pre Function for Language Barrier Resp QSTN
*	Created by Aansh Kapadia
**/
function EnumCB_LanguageBarrierResp_PRE() {
  
  /*Remove case note in case the value of No Complete screen changes */
  var caseText = "LANGUAGE BARRIER:";
  CB.removeDuplicateCaseNote(caseText);
  
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","false");
  ENUMCB.updateDKRefVisibility("LanguageBarrierResp");
  var langBarrierTempPage = pega.ui.ClientCache.createPage("LangBarrierTempPage");
  var langBarrierTempPageResults = langBarrierTempPage.put("pxResults", []);
  /*langBarrierTempPageResults = pega.ui.ClientCache.find("LangBarrierTempPage");*/
  var langBarrierDP = pega.ui.ClientCache.find("D_LanguageBarrierRespLanguageList.pxResults");
  var langBarrierIterator = langBarrierDP.iterator();
  while(langBarrierIterator.hasNext()) {
    var tempPage = langBarrierIterator.next();
    var tempPageJSON = tempPage.getJSON();
    langBarrierTempPageResults.add().adoptJSON(tempPageJSON);
  }
  /*
  var languageList = pega.ui.ClientCache.find("D_LanguageList.pxResults").iterator();
  while(languageList.hasNext()) {  
    var thisPage = languageList.next();
    if (thisPage.get("pySelected").getValue()) {
      thisPage.put("pySelected", '');
    }
  }
  */
}

/**
* Post function for Language Barrier Resp QSTN
* Created by: Aansh Kapadia
* Updated by: Timothy Risch
* Updated on: 05-03-2017
**/

function EnumCB_LanguageBarrierResp_POST () {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  
  var counter = 0;
  var isReinterview = workPage.get("IsReInterview") ? workPage.get("IsReInterview").getValue() :"";
  var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  var isMU = locAddress? (locAddress.get("IsMultiUnit")? locAddress.get("IsMultiUnit").getValue() : "") : "";
  var partialAddress = locAddress.get("PartialAddress") ? locAddress.get("PartialAddress").getValue() : "";
  var addressNo = respPage.get("IsCensusDayAddress")? respPage.get("IsCensusDayAddress").getValue() : "";
  var respTypeProd = respPage.get("RESPTYPE_PROD") ? respPage.get("RESPTYPE_PROD").getValue() :"";
  var respTypeCode = respPage.get("RESP_TYPE_CODE")? respPage.get("RESP_TYPE_CODE").getValue() : "";

  if(respTypeProd == "proxy") {
    /* If Proxy, use proxy partial address */
    var proxyAddr = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
    var partialProxyAddr = proxyAddr.get("PartialAddress") ? proxyAddr.get("PartialAddress").getValue() : "";
  }
  var respLangCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_RESP_LANG_CODE");
  if(!respLangCode) {
	respPage.put("NRFU_RESP_LANG_CODE", []); 
    respLangCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_RESP_LANG_CODE");
  }

  var caseNoteList = "";
  var languageList = pega.ui.ClientCache.find("LangBarrierTempPage.pxResults");
  var languageListIterator = languageList.iterator();
  while(languageListIterator.hasNext()) {
    var thisPage = languageListIterator.next();
    var isSelected = thisPage.get("pySelected") ? thisPage.get("pySelected").getValue() : "";
    if (isSelected == true) {
      var desc = thisPage.get("Description") ? thisPage.get("Description").getValue() : "";
      var code = thisPage.get("Code") ? thisPage.get("Code").getValue() : "";
      var langPage = pega.ui.ClientCache.createPage("LanguagePage");
	  langPage.put("pxObjClass","CB-Data-Ref-Language");
      counter += 1;
	  
	  caseNoteList += "<li>" + desc + "</li>";
      langPage.put("Description", desc);
      langPage.put("Code", code);
      var langPageJSON = langPage.getJSON();
      respLangCode.add().adoptJSON(langPageJSON);
    }
  }
  
  ENUMCB.LanguageBarrierResp_VLDN(counter, "LanguageBarrierResp");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()) {
    if(isReinterview == "true" && isMU != "true") {
      var addressPrefix = "Reinterview:";

      /* Format text of Case Note */
      var text = "LANGUAGE BARRIER: <ul>";
      text += caseNoteList + "</ul>";

      CB.addCaseNote(text, partialAddress, false,addressPrefix);
      var attemptType = respPage.get("NRFU_ATTEMPT_TYPE_CODE") ? respPage.get("NRFU_ATTEMPT_TYPE_CODE").getValue() : "";
      if(attemptType == "TA" || attemptType == "2"){
        cpQuestFlags.put("NextSurveyQuestion", "TypeOfProxy_QSTN");
      }
    }

    else if(isMU == "true" && isReinterview == "true") {

    }

    else if(isMU == "true") {

    }

    else {

      /* Added case note logic for NRFU as per US-2959 */

      var text = "LANGUAGE BARRIER: <ul>";
      text += caseNoteList + "</ul>";

      if((respTypeCode == "HH") || (respTypeCode == "") || ((respTypeCode == "proxy") && (addressNo == "0"))) {   

        CB.addCaseNote(text, partialAddress, false, "Census Address:");

      }

      else if(respTypeCode == "proxy") {    

        CB.getProxyAddress(text, false, "PROXY:");

      }

    }

    ENUMCB.setDKRefResponse("pyWorkPage.Respondent.DKRefused.LanguageBarrierResp", "pyWorkPage.Respondent.Response.NRFU_RESP_LANG_CODE_DK", "pyWorkPage.Respondent.Response.NRFU_RESP_LANG_CODE_REF");
  }

}


/**
 * Pre Action for LanguageAssist_QSTN
 * Created by Taylor Hunter
 */

function EnumCB_LanguageAssist_PRE() {
  ENUMCB.updateDKRefVisibility("LanguageAssist", "pyWorkPage.Respondent.DKRefused");
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "false");
}

/**
 * Post Action for LanguageAssist_QSTN
 * Created by Taylor Hunter
 */
function EnumCB_LanguageAssist_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_LANGUAGE_ASSIST_CODE", "pyWorkPage.Respondent.DKRefused.LanguageAssist");
    } else {
      ENUMCB.Required("pyWorkPage.Respondent.Response.NRFU_LANGUAGE_ASSIST_CODE");
    }
     
       if (!workPage.hasMessages()) {
      var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
      var dkRefused = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var dkRefusedAnswer = dkRefused.get("LanguageAssist");
 	  dkRefusedAnswer = dkRefusedAnswer ? dkRefusedAnswer.getValue() : "";
   
      /* Determine if Don't Know or Refused were selected and update NRFU_LANGUAGE_ASSIST_CODE to reflect the choice */
      if (dkRefusedAnswer == "D")
        respPage.put("NRFU_LANGUAGE_ASSIST_CODE", "8");
      if (dkRefusedAnswer == "R")
        respPage.put("NRFU_LANGUAGE_ASSIST_CODE", "9");
      
      var answer = respPage.get("NRFU_LANGUAGE_ASSIST_CODE");
      answer = answer ? answer.getValue() : "";
      
      var isMultiUnit = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress").get("IsMultiUnit");
      isMultiUnit = isMultiUnit ? isMultiUnit.getValue() : "";
      
      var isReInterview = pega.ui.ClientCache.find("pyWorkPage").get("IsReInterview");
       isReInterview = isReInterview ? isReInterview.getValue() : "";

      /*  Set the next question. 'Yes' will return us to the intro to start with a new respondent,
          'No' will bring us to Language Phone, and DK/Ref will bring us to Strategies */

      if (answer == "0") { /* No */
        respPage.put("NRFU_LANGUAGE_ASSIST_CODE", "2"); /* No is defined for this question as '2' */
        questFlags.put("NextSurveyQuestion", "LanguagePhone_QSTN");

      }
      else if (answer == "8" || answer == "9") /* Don't Know or Refused */
      {
        questFlags.put("NextSurveyQuestion", "CaseNotes_QSTN");
      }
  
      else if (answer == "1" && isReInterview == 'true') /* Yes, and is a Reinterview */
      {
        questFlags.put("NextSurveyQuestion", "RIIntro_QSTN");
      }
      
      else if (answer == "1" && isMultiUnit == 'true') /* Yes, and is a multiunit */
        {
        questFlags.put("NextSurveyQuestion", "MUIntro_QSTN");
   		 }
      else /* Yes */
        {
        questFlags.put("NextSurveyQuestion", "Intro_QSTN");
        }
      /* TODO: Ensure that 'RIIntro_QSTN' and 'MUIntro_QSTN' question names are correct as they are implemented */
  }
  }
  catch (Err) {
    alert(Err.message);
  }
}

/**
*	Pre Function for Language Phone Question
*	Created by Mark Coats
*   Updated by: Timothy Risch
*   Updated on: 05-04-2017
**/
function EnumCB_LanguagePhone_PRE()
{
  /*DKRef*/
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","false");
  ENUMCB.updateDKRefVisibility("LanguagePhone");
  
  /*Remove case note in case the value of No Complete screen changes */
  var caseText = "Respondent Phone:";
  CB.removeDuplicateCaseNote(caseText);
  
}

/**
* Post function for Language Phone QSTN
* Created by: Mark Coats
* Updated by: Zach Holliday
**/

function EnumCB_LanguagePhone_POST()
{
  try
  {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.Respondent.LanguagePhoneNumber",
                                   "pyWorkPage.Respondent.DKRefused.LanguagePhone");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.Respondent.LanguagePhoneNumber");
    }
    
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages())
    {
	    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
        var respCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
        var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
        if(questFlags && respCode && respondent)
        {
			var cpLangPhoneNumber = respondent.get("LanguagePhoneNumber") ? respondent.get("LanguagePhoneNumber").getValue() : "";
            var areaCode = cpLangPhoneNumber.substring(1,4);
  			var prefixCode = cpLangPhoneNumber.substring(6,9);
  			var phoneNumber = cpLangPhoneNumber.substring(10);
          	var languagephonetext = respondent.get("FullName")? respondent.get("FullName").getValue() : "";
          	languagephonetext += " " + "Respondent Phone:" + " " + "(" + areaCode +")" + " " + prefixCode + "-" + phoneNumber;
          	var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
          	var respTypeCode = responsePage.get("RESP_TYPE_CODE")? responsePage.get("RESP_TYPE_CODE").getValue() : "";
          	var locAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
          	var partialAddress = locAddress? (locAddress.get("PartialAddress")? locAddress.get("PartialAddress").getValue() : "") : "";
           	var addressNo = responsePage.get("IsCensusDayAddress")? responsePage.get("IsCensusDayAddress").getValue() : "";
            respCode.put("ADR_PRV_PH_AREA_ID", areaCode);
            respCode.put("ADR_PRV_PH_PREFIX_ID", prefixCode);
            respCode.put("ADR_PRV_PH_SUFFIX_ID", phoneNumber);
           	pega.offline.runDataTransform("EnumCB_LanguagePhone_POST","CB-FW-CensusFW-Work-Quest-Enum",null);
			
			/* NRFU Case Note Format */
			var isReinterview = workPage.get("IsReInterview");
			isReinterview = isReinterview ? isReinterview.getValue() : "false";
			
			if(isReinterview != "true") {
				if((respTypeCode == "HH") || (respTypeCode == "") || ((respTypeCode == "proxy") && (addressNo == "0")) )
				{   
					var text = languagephonetext;
					CB.addCaseNote(text, partialAddress, false, "Census Address:");
				}
				else if(respTypeCode == "proxy")
				{    
					var text = languagephonetext;
					CB.getProxyAddress(text, false, "PROXY:");				   
				}
			}
			else {
				/* RI Case Note Format */
				var respTypeProd = responsePage.get("RESPTYPE_PROD");
				respTypeProd = respTypeProd ? respTypeProd.getValue() : "";
				
				var text = "Respondent Phone:" + " " + "(" + areaCode +")" + " " + prefixCode + "-" + phoneNumber;
				if(respTypeProd == "HH")
			    {
				    CB.addCaseNote(text, partialAddress, false,"Reinterview:");
			    }
			    else if(respTypeProd == "proxy")
			    {    
				    /* Add Proxy Partial Address to Note */
				    var proxyAddr = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
				    var partialProxyAddr = proxyAddr ? proxyAddr.get("PartialAddress") : "";
				    partialProxyAddr = partialProxyAddr ? partialProxyAddr.getValue() : "";
				   
				    CB.addCaseNote(text, partialProxyAddr, false, "Reinterview:");
			    }	
            }
		}
    }
  }
  catch(Err)
  {
     alert(Err.message);
  }
}
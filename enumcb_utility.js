/*namespace*/
var ENUMCB = ENUMCB || {};

/*
*Hook for createNewWork action to set params that were passed
* Created by Mike Hartel
*/
function createNewWork$CB_Dec_Work_Quest_Enum(params){
  /*debugger;*/
  pega.ui.ClientCache.find("pyWorkPage").put("IsNewCase", params.IsNewCase);
}

/* 
* Used to clear props in Count RI Screen
* Created by Aditi Ashok
*/
ENUMCB.clearCorrPropCountRI = function(propVal) {
  if (propVal == 2 || propVal == 3) {
    ENUMCB.clearCorrProp("pyWorkPage.Respondent.Response.H_SIZE_STATED_INT", propVal);
  }
};

ENUMCB.DisplayVoicemailScript = function(value) {
  if(value == "3") {
    $(".voicemail-script").show();
  }
  else {
    $(".voicemail-script").hide();
  }
};

ENUMCB.UpdateValueOnTempPage = function(value, code) {
  if(value == "false") {
    value = true;
  }
  else {
    value = false;
  }
  var langBarrierTempResults = pega.ui.ClientCache.find("LangBarrierTempPage.pxResults");
  var tempResultsIterator = langBarrierTempResults.iterator();
  var index = 0;
  while(tempResultsIterator.hasNext()) {
    var currPage = tempResultsIterator.next();
    index++;
    var currCode = currPage.get("Code") ? currPage.get("Code").getValue() :"";
    if(code == currCode) {
      currPage.put("pySelected", value);
      var currentResultPage = pega.ui.ClientCache.find("LangBarrierTempPage.pxResults(" + index + ")");
      currentResultPage.adoptJSON(currPage.getJSON());
    }
  }
};

/* 
* Used to set props in Count RI Screen
* Created by Aditi Ashok
*/

ENUMCB.setCountRIUnitStatus = function(propVal) {
  if (propVal != "") {
    $('#H_NRFU_STATUS_EXIT_CODE1').click();
    ENUMCB.clearCorrProp("pyWorkPage.Respondent.DKRefused.CountRIUnitStatus",propVal);
  }
};

/**
*	Returns the calculated age
*	Pass in integer values for the month, day, and year
*	Pass in string using pega formatted date property for dateToCompare
**/
ENUMCB.calculateAge = function(month, day, year, dateToCompare) {
  var censusYear = parseInt(dateToCompare.substring(0,4));
  var censusMonth = parseInt(dateToCompare.substring(4,6));
  var censusDay = parseInt(dateToCompare.substring(6));
  var age = censusYear - year;
  if (censusMonth < (month)) {
    age--;
  }
  if(day != "") {
    if ((month == censusMonth) && (censusDay < day)) {
      age--;
    }
  } 
  return age;
};

/**
 * Find the distance in feet between two coordinates. Accurate for within 200 miles
 * Created by: Taylor Hunter
 */
function findGeographicalDistance(lat1, long1, lat2, long2) {
  try {
    var delta_lat = Math.abs(lat1 - lat2);
    var delta_long = Math.abs(long1 - long2);
    var mean_lat = (((lat1 + lat2) / 2) * Math.PI) / 180;
    var k1 = 111.13209 - (0.56605 * Math.cos(2 * mean_lat)) + (0.00120 * Math.cos(4 * mean_lat));
    var k2 = (111.41513 * Math.cos(mean_lat)) - (0.09455 * Math.cos(3 * mean_lat)) + (0.00012 * Math.cos(5 * mean_lat));
    var t1 = Math.pow(k1 * delta_lat, 2);
    var t2 = t2 = Math.pow(k2 * delta_long, 2);
    var dist = Math.sqrt(t1 + t2);

    return Math.floor(dist * 3280);

  } catch (Err) {
    return -1;
  }
}

ENUMCB.skipReferencePerson = function() {
  /*check to see if last person is reference person, in which case we need to skip*/
  var HHRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHIndex = parseInt(HHRoster.get("CurrentHHMemberIndex").getValue(),10);
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var rosterSize = parseInt(questFlags.get("CurrentRosterSize").getValue(),10);    

  if(currentHHIndex==rosterSize){
    var lastMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember("+rosterSize+")");
    var referencePersonFlag = lastMember.get("ReferencePersonFlag").getValue();
    if(referencePersonFlag== true){
      HHRoster.put("CurrentHHMemberIndex", rosterSize+1);
    }
  }	
};

/**
*	Call this function on post action of questions that have DKRef disabled
*	Changes the color back to black for enabled
*	Created by Omar Mohammed
**/
ENUMCB.updateDisabledDKRefColor = function() {
  $('.fa-ban').css("color", "black"); 
  var dkRefDiv = document.getElementsByClassName("dont-know-refused");
  var dkRefSpan = dkRefDiv[0].firstElementChild;
  dkRefSpan.style.color = "black";
  CB.toggleFlag("DKRFEnabled", "true");
};

/**
*	Function to toggle the DKRef radio buttons on click of DK Ref
*	Created by Omar Mohammed
**/
ENUMCB.showDKRef = function() {
  if(pega.mobile.isHybrid) {
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var DKRFEnabled = questFlags.get("DKRFEnabled");
    if(DKRFEnabled) {
      DKRFEnabled = DKRFEnabled.getValue();
    }
    else {
      DKRFEnabled = "";
    }
    if(DKRFEnabled != "false") {

      var isDKRefVisible = ENUMCB.getIsDKRefVisible();
      if(isDKRefVisible == "true") {
        questFlags.put("IsDKRefVisible", "false");
        pega.u.d.setProperty('pyWorkPage.QuestFlags.IsDKRefVisible', 'false');
      }
      else {
        questFlags.put("IsDKRefVisible", "true");
        pega.u.d.setProperty('pyWorkPage.QuestFlags.IsDKRefVisible', 'true');
      }
      /*      CB.RefreshWhen("pyWorkPage.QuestFlags.IsDKRefVisible"); */

     /* $('.layout-noheader-enumeration_options_menu').removeClass( "usds_show", 200);*/
      $('.layout-noheader-enumeration_options_menu').slideToggle();

    }
  } else {
    var DKRFEnabled = pega.u.d.getProperty("pyWorkPage.QuestFlags.DKRFEnabled");
    if (DKRFEnabled === undefined) {
      DKRFEnabled = "";
    }
    if (DKRFEnabled != "false") {
      var isDKRefVisible = ENUMCB.getIsDKRefVisible();
      if (isDKRefVisible == "true") {
        pega.u.d.setProperty("pyWorkPage.QuestFlags.IsDKRefVisible", "false");
      } else {
        pega.u.d.setProperty("pyWorkPage.QuestFlags.IsDKRefVisible", "true");
      }

      $('.layout-noheader-enumeration_options_menu').removeClass( "usds_show", 200);
    }
  }
};

/**	Test function do not use **/
ENUMCB.clearCorrDKRefProp = function(currPropVal, corrProp) {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isDKRefVisible = questFlags.get("IsDKRefVisible");
  if(isDKRefVisible) {
    isDKRefVisible = isDKRefVisible.getValue();
    if(isDKRefVisible == "true") {  
      if(currPropVal != "") {
        clearCorrProp(corrProp);
      }
    }
  }
};

/** 
*	Call this function on click of a radio button to clear the corresponding DKRef prop or vice versa
*	Param takes full property path - "pyWorkPage.HouseholdMemberTemp.DKRefused.Intro"
*	Created by Omar Mohammed
**/
ENUMCB.clearCorrProp = function(corrProp, currPropVal) {
  currPropVal = currPropVal || "";
  if(currPropVal != "") {
    var corrPropPath = corrProp.substring(0, corrProp.lastIndexOf("."));
    var corrPropName = corrProp.substring(corrProp.lastIndexOf(".") + 1);
    var page = pega.ui.ClientCache.find(corrPropPath);
    page.put(corrPropName, "");
    var setProp = pega.u.d.setProperty(corrProp, ""); 
    var parsedPropPath = corrProp.split(".");
    var result = "";
    var i;
    for(i = 0; i < parsedPropPath.length; i++) {
      if(i == 0) {
        parsedPropPath[i] = "$P" + parsedPropPath[i];
      }
      else {
        if(parsedPropPath[i].indexOf('(') > -1) {
          parsedPropPath[i] = "$p" + parsedPropPath[i].substring(0, parsedPropPath[i].length - 3) + "$l1";
        }
        else {
          parsedPropPath[i] = "$p" + parsedPropPath[i]; 
        }
      }
      result = result + parsedPropPath[i];
    }

    $("input:radio[name='"+result+"']").each(function(i) {
      this.checked = false;
    });
    $("input:radio[name='"+result+"']").parent().parent().parent().attr("radvalue", "");
  }
};

/** 
*	Call this function on clear out a text area when it is unselected.
*   Mark Coats
*   Params:  propValue - value of the radio button or checkbox property.
*            valueToCheck - String containing the value to check for - if it is this value, we will NOT clear data
*            propToClear - String reference to value in clipboard to clear out - set to "" - if propValue != valueToCheck
*            otherValue - Optional second value that will keep from clearing prop to Clear - in case we have two.  Really at
*                         some point, we should get rid of this and make valueToCheck be a comma separated list or something like that -
*                         as what if we need to keep the prop on 3 values, 4, 5, ...
**/
ENUMCB.clearTextBoxIfNotSelected = function(propValue, valueToCheck, propToClear,otherValue) {
  try
  {
    if(propValue != valueToCheck) {
      if(otherValue)
      {
          if(otherValue == propValue)
          {
             return;
          }
      }
      ENUMCB.clearFieldValue(propToClear);
    }
  }
  catch(Err)
  {
     alert("Error clearing text area ==> <"+ Err.message + ">");
  }
};

/**
 * Clear a fully qualified field value.
 * Mark Coats
 * propToClear - fully qualified name of property to clear - both on screen and and in the clipboard.
 **/
ENUMCB.clearFieldValue = function(propToClear)
{
  var lastDot = propToClear.lastIndexOf(".");
  var pageRef = propToClear.substring(0,lastDot);
  var propRef = propToClear.substring(lastDot+1);
  var page = pega.ui.ClientCache.find(pageRef);
  /*page.put(propRef, "");*/
  if(page)
  {
    page.remove(propRef);
  }
  pega.u.d.setProperty(propToClear, "");
};

/** 
*	Call this function on clear out proxy location fields that are no longer in scope.
*   Mark Coats
**/
ENUMCB.clearOutOfScopeProxyLocationFields = function(propValue) {
  try
  {
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var isPR = questFlags.get("IsPuertoRico")? questFlags.get("IsPuertoRico").getValue() : "";
      if(isPR == "true")
      {
        if(propValue == "PRGA")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCURB");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAPTCOMPLEX");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.BuildingDescriptor");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCBLDGID");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM1");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM2");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.KMHM");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
        }
        else if(propValue == "PRUA")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAPTCOMPLEX");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.BuildingDescriptor");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCBLDGID");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM1");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM2");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.KMHM");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
        }
        else if(propValue == "PRRR")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAPTCOMPLEX");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.BuildingDescriptor");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCBLDGID");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM1");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM2");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.KMHM");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCHN");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.StreetName");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCURB");
        }
        else if(propValue == "PRAA")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAPTCOMPLEX");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.BuildingDescriptor");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCBLDGID");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCURB");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
        }
        else if(propValue == "PRAC")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCURB");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM1");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM2");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.KMHM");
        }
        else
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCURB");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAPTCOMPLEX");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.BuildingDescriptor");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCBLDGID");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM1");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCAREANM2");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.KMHM");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
        }
      }
      else
      {
        if(propValue == "USSA")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
        }
        else if(propValue == "USRR")
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.StreetName");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCHN");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCWSID1");
        }
        else
        {
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.StreetName");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCHN");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.LOCWSID1");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRBoxIDNumber");
          ENUMCB.clearFieldValue("pyWorkPage.HouseholdRoster.ProxyLocation.RRDescriptor");
        }
      }
  }
  catch(Err)
  {
     alert("Error clearing proxylocation fields ==> <"+ Err.message + ">");
  }
};

function EnumCB_formatPhone(primaryPage, propertyRef, event) {
  if(event.which != 8) { 
     var workPage = primaryPage.substring(0,primaryPage.indexOf("."));
     var embeddedPage = primaryPage.substring(primaryPage.indexOf("."));
    /* alert("embedded page: " + embeddedPage + " workPage: "+workPage);*/
    if(pega.mobile.isHybrid) {
      var telephonePage = pega.ui.ClientCache.find(primaryPage);     
      var phone = pega.ui.d.getProperty(embeddedPage+propertyRef, workPage);
      
      var formattedPhone = CB.formatPhone(phone); 
      var setPropInCache = telephonePage.put(propertyRef, formattedPhone);
      var setPropInClipboard = pega.u.d.setProperty(primaryPage + propertyRef, formattedPhone);
    }
    else {
      var phone = pega.ui.d.getProperty(embeddedPage+propertyRef, workPage);
      phone= phone.toString();
      var formattedPhone = CB.formatPhone(phone);
      var setProp = pega.u.d.setProperty(primaryPage + propertyRef, formattedPhone);
    }
  }
}

function EnumCB_formatDOB(primaryPage, propertyRef, event) {
  /*Reuse new function RemoveNonNumericChars*/
  ENUMCB.RemoveNonNumericChars(primaryPage, propertyRef, event);
}
/*Remove any non numeric characters from property
* primaryPage: top level page (eg pyWorkPage)
* propertyRef: Property to remove non numeric chars from
* js event
*/
ENUMCB.RemoveNonNumericChars = function(primaryPage, propertyRef, event){
if(event.which != 8) {
    if(pega.mobile.isHybrid) {
      var workPage = pega.ui.ClientCache.find(primaryPage);
      var value = pega.ui.d.getProperty("." + propertyRef, primaryPage);
      var digitsOnlyValue = value.replace(/\D/g,'');
      var embeddedPageName = propertyRef.substring(0, propertyRef.lastIndexOf("."));
  	  var responsePropName = propertyRef.substring(propertyRef.lastIndexOf(".") + 1);
      var embeddedPage = workPage.get(embeddedPageName);
      var setPropInCache = embeddedPage.put(responsePropName, digitsOnlyValue);
      var setPropInClipboard =  pega.u.d.setProperty(primaryPage + "." + propertyRef, digitsOnlyValue);
    }
    else {
      var value = pega.ui.d.getProperty("." + propertyRef, primaryPage);
      value= value.toString();
      var digitsOnlyValue = value.replace(/\D/g,'');
      var setProp = pega.u.d.setProperty(primaryPage + "." + propertyRef, digitsOnlyValue);
    }
  }
};

/**
* limitChars removes invalid characters from string
* Created by Omar Mohammed
*/
function limitChars(name, value) {
  if(pega.mobile.isHybrid) {
    
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var currentName = value;

    var splitString = currentName.split('&').join("");
    splitString = splitString.split('\\').join("");
    splitString = splitString.split('`').join("");
    splitString = splitString.split('<').join("");
    splitString = splitString.split('>').join("");
    splitString = splitString.split('^').join("");
    splitString = splitString.split('|').join("");
    
    /*Need to update value both in clipboard and in clientcache to keep in sync and to update UI on the fly*/
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    
    var setPropInCache = responsePage.put(name, splitString);    
    var setPropInClipboard = pega.u.d.setProperty("pyWorkPage.HouseholdMemberTemp.Response" + name, splitString);
    
  }
  else {
    var currentName = pega.ui.d.getProperty(".HouseholdMemberTemp.Response" + name,"pyWorkPage");
    var splitString = currentName.split('&').join("");
    splitString = splitString.split('\\').join("");
    splitString = splitString.split('`').join("");
    splitString = splitString.split('<').join("");
    splitString = splitString.split('>').join("");
    splitString = splitString.split('^').join("");
    splitString = splitString.split('|').join("");
    var setProp = pega.u.d.setProperty("pyWorkPage.HouseholdMemberTemp.Response" + name, splitString);
  }
}

/*
*	When a user presses "Other" on NoComplete_QSTN
*/
function EnumCB_showOtherTextBox(otherOption) {
  if(otherOption == "9") {
    CB.RefreshWhen("pyWorkPage.HouseholdMemberTemp.Response.NRFU_INCOMPLETE_CODE");
  }
}

/***
	Display roster when yes is selected on elsewhere screen
	Created by: Omar Mohammed
**/
function EnumCB_SelectElsewhere(response) {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  if(response == "1") {
    var currRosterSize = questFlags.get("CurrentRosterSize").getValue();
    if(currRosterSize > 1) {
      var putAnswer = questFlags.put("IsElsewhereSelected", "true");
      var setProp = pega.u.d.setProperty("pyWorkPage.QuestFlags.IsElsewhereSelected", true);    
      /**   CB.RefreshWhen("pyWorkPage.HouseholdMemberTemp.Response.P_FIRST_NAME");
       alert("Refresh complete");

       **/
      var section = pega.u.d.getSectionByName("WhoLivesElsewhere_ANSW",'',document);
      pega.u.d.reloadSection(section, '', '', false,true, '', false);

    }
  } 

  else {
    var putAnswer = questFlags.put("IsElsewhereSelected", "false");
    /**   CB.RefreshWhen("pyWorkPage.HouseholdMemberTemp.Response.P_FIRST_NAME");
       alert("Refresh complete");

       **/
    var section = pega.u.d.getSectionByName("WhoLivesElsewhere_ANSW",'',document);
    pega.u.d.reloadSection(section, '', '', false,true, '', false);

  }
}


/***
By Mike Hartel
Copy .Respondent into the .HouseholdRoster.HouseholdMember(1)
***/
ENUMCB.CopyRespondentToRoster = function () {
  try { 
    var Workpage = pega.ui.ClientCache.find("pyWorkPage");    
    var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent"); 
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var respType = responsePage.get("RESP_TYPE_CODE").getValue();
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var householdMemberRespondantFlag = householdRoster.get("HouseholdMember(1).RespondantFlag");
    if(!householdMemberRespondantFlag){ 
      var householdRosterlist = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster").put("HouseholdMember",[]);  
      if(respType != "proxy") { 
    	var firstName = (responsePage.get("RESP_FIRST_NAME")) ? responsePage.get("RESP_FIRST_NAME").getValue() : ""; 
    	responsePage.put("P_FIRST_NAME", firstName);
    	var middleName = (responsePage.get("RESP_MIDDLE_NAME")) ? responsePage.get("RESP_MIDDLE_NAME").getValue() : "";
    	responsePage.put("P_MIDDLE_NAME", middleName);
    	var lastName = (responsePage.get("RESP_LAST_NAME")) ? responsePage.get("RESP_LAST_NAME").getValue() : "";
    	responsePage.put("P_LAST_NAME", lastName);
        respondentPage.put("RespondantFlag","true");
        householdRosterlist.add().adoptJSON(respondentPage.getJSON());
      }
    }
    else{
      var householdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
      var householdMemberIter = householdMemberList.iterator();
      while(householdMemberIter.hasNext()){
        var householdMemberPage = householdMemberIter.next();
        var isRespondentProp = householdMemberPage.get("RespondantFlag");
        if(isRespondentProp){
          var isRespondent = isRespondentProp.getValue();
          if(isRespondent=="true"){
            householdMemberPage.adoptJSON(householdMemberTemp.getJSON());
          }
        }      
      }
    }
  }
  catch(e) {
    console.log("***ENUMCB Error - " + e.message);
  }
};

/**
*	ENUMCB.RelationshipSexInconsistencyCheck for sex validation
*	Created by Kyle Gravel, ArtXJ
**/
ENUMCB.RelationshipSexInconsistencyCheck= function(memberIndicesPageListName) {
  try{   
    /*Find Reference Person Sex from Reference Person Page*/
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var referencePersonPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ReferencePerson");
    var refSexMaleFemale = referencePersonPage.get("SexMaleFemale");
    if(refSexMaleFemale) {
      refSexMaleFemale = refSexMaleFemale.getValue();
    }
    else {
      refSexMaleFemale = "";
    }
    var refSexMaleFemaleConsistencyEdit = referencePersonPage.get("SexMaleFemaleConsistencyEdit");

    if(refSexMaleFemaleConsistencyEdit) {
      refSexMaleFemaleConsistencyEdit = refSexMaleFemaleConsistencyEdit.getValue();
    }
    else {
      refSexMaleFemaleConsistencyEdit = "";
    }

    if (refSexMaleFemaleConsistencyEdit!=""){
      refSexMaleFemale = refSexMaleFemaleConsistencyEdit;
    }

    /*iterator through the household member list
	*	grab P_REL_CODE response page
	*/
    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var householdMemberList = householdMember.iterator();

    while(householdMemberList.hasNext()) {
      var currentPage = householdMemberList.next();
      var referencePersonFlag = currentPage.get("ReferencePersonFlag");
      if(referencePersonFlag) {
        referencePersonFlag = referencePersonFlag.getValue();
      }
      else {
        referencePersonFlag = "";
      }
      var responsePage = currentPage.get(".Response");

      if(referencePersonFlag != true) {    
        var relationshipCode = responsePage.get("P_REL_CODE");
        if(relationshipCode) {
          relationshipCode = relationshipCode.getValue();
        }
        else {
          relationshipCode = "";
        }

        var sexMaleFemale = currentPage.get("SexMaleFemale");             
        if(sexMaleFemale) {
          sexMaleFemale = sexMaleFemale.getValue();
        }
        else {
          sexMaleFemale = "";
        }


        var sexMaleFemaleConsistencyEdit = currentPage.get("SexMaleFemaleConsistencyEdit");
        if(sexMaleFemaleConsistencyEdit) {
          sexMaleFemaleConsistencyEdit = sexMaleFemaleConsistencyEdit.getValue();
        }
        else {
          sexMaleFemaleConsistencyEdit = "";
        }

        if(sexMaleFemaleConsistencyEdit!=""){
          sexMaleFemale =sexMaleFemaleConsistencyEdit;
        }


        var dkRefPage = currentPage.get("DKRefused");
        var sexDKRef = dkRefPage.get("Sex");
        if(sexDKRef) {
          sexDKRef = sexDKRef.getValue();
        }
        else {
          sexDKRef = "";
        }

        if(((relationshipCode == "1") || (relationshipCode == "2")) && ((refSexMaleFemale == sexMaleFemale) && sexDKRef == "")) {
          currentPage.put("RelationshipInconsistent", true);

        }          
        else if(((relationshipCode == "3") || (relationshipCode=="4")) && ((refSexMaleFemale != sexMaleFemale) && sexDKRef == "")) {
          currentPage.put("RelationshipInconsistent", true);

        }
        else{
          currentPage.put("RelationshipInconsistent", false);
        }
      }


    }

    ENUMCB.addMembersToRSMemberIndexList(memberIndicesPageListName);
  }
  catch(e) {
    alert(e.message);
  }
};

ENUMCB.updateMemberIndexPre = function(params) {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHouseholdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  if(householdRoster && cpQuestFlags){
    if(cpHouseholdMemberList){
      var curRosterSize = cpHouseholdMemberList.size();
      var cpCurMemberIndex = householdRoster.get("CurrentHHMemberIndex");
      if(!cpCurMemberIndex){
        householdRoster.put("CurrentHHMemberIndex",1);
      }
      var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
      if(cpQuestFlags.get(params.isFirstTimeProp).getValue() == "true"){
        var curRosterSize = cpHouseholdMemberList.size();
        householdRoster.put("CurrentHHMemberIndex",1);
        cpQuestFlags.put("CurrentRosterSize",curRosterSize);
        curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
      }
      else if(cpQuestFlags.get("IsGoingBack").getValue() == "true" ){
        if(params.currentQuestion != "DOB_QSTN") {
          curMemberIndex = curMemberIndex - 1;
          if(curMemberIndex == 0) {
            curMemberIndex = curRosterSize;
          }
          householdRoster.put("CurrentHHMemberIndex",curMemberIndex);  
        }
      }
      var cpMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      if(cpMemberTemp){
        return curMemberIndex;
      }
      else{
        console.log("***ENUMCB Error - " + "Unable to find HouseholdMemberTemp page in ENUMCB.updateMemberIndexPre function");
        return;
      }
    }
    else {
      console.log("***ENUMCB Error - " + "Unable to find HouseholdRoster.HouseholdMember pagelist in ENUMCB.updateMemberIndexPre function");
      return;
    }
  }
  else{
    console.log("***ENUMCB Error - " + "Unable to find QuestFlags page in ENUMCB.updateMemberIndexPre function");
    return;
  }
};

ENUMCB.updateMemberIndexPost = function(params) {
  /*begin looping mech*/
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHouseholdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  if(householdRoster && cpQuestFlags && cpHouseholdMemberList && cpHouseholdMemberTemp) {
    cpQuestFlags.put(params.isFirstTimeProp,false);
    var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);
    curMemberIndex = parseInt(curMemberIndex + 1);
    householdRoster.put("CurrentHHMemberIndex",curMemberIndex);
  }
  else{
    console.log("***ENUMCB Error - " + "Unable to find QuestFlags page, HouseholdRoster.HouseholdMember pagelist, or HouseholdMemberTemp page in ENUMCB.updateMemberIndexPost function");
  }
};


/**
*	Function used to determine whether we should increment the currenthhmemberindex
*	This should be called by all post JS functions on Detailed Origin screens 
*	Created by Omar Mohammed
*/
ENUMCB.isLastOriginQuestion = function(currentRaceQuestion) {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var raceWhite = respPage.get("P_RACE_WHITE_IND");
  if(raceWhite) {
    raceWhite = raceWhite.getValue();
  }
  else {
    raceWhite = "";
  }
  var raceAIAN = respPage.get("P_RACE_AIAN_IND");
  if(raceAIAN) {
    raceAIAN = raceAIAN.getValue();
  }
  else {
    raceAIAN = "";
  }
  var raceAsian = respPage.get("P_RACE_ASIAN_IND");
  if(raceAsian) {
    raceAsian = raceAsian.getValue();
  }
  else {
    raceAsian = "";
  }
  var raceBlack = respPage.get("P_RACE_BLACK_IND");
  if(raceBlack) {
    raceBlack = raceBlack.getValue();
  }
  else {
    raceBlack = "";
  }
  var raceHisp = respPage.get("P_RACE_HISP_IND");
  if(raceHisp) {
    raceHisp = raceHisp.getValue();
  }
  else {
    raceHisp = "";
  }
  var raceMENA = respPage.get("P_RACE_MENA_IND");
  if(raceMENA) {
    raceMENA = raceMENA.getValue();
  }
  else {
    raceMENA = "";
  }
  var raceNHPI = respPage.get("P_RACE_NHPI_IND");
  if(raceNHPI) {
    raceNHPI = raceNHPI.getValue();
  }
  else {
    raceNHPI = "";
  }
  var raceOther = respPage.get("P_RACE_SOR_IND");
  if(raceOther) {
    raceOther = raceOther.getValue();
  }
  else {
    raceOther = "";
  }

  switch(currentRaceQuestion) {
    case "WHITE":
      if(raceAIAN == true || raceAsian == true || raceBlack == true || raceHisp == true || raceMENA == true || raceNHPI == true || raceOther == true) {
        return false;
      }
      return true;
    case "HISP":
      if(raceAIAN == true || raceAsian == true || raceBlack == true || raceMENA == true || raceNHPI == true || raceOther == true) {
        return false;
      }
      return true;
    case "BLACK":
      if(raceAIAN == true || raceAsian == true || raceMENA == true || raceNHPI == true || raceOther == true) {
        return false; 
      }
      return true;
    case "ASIAN": 
      if(raceAIAN == true || raceMENA == true || raceNHPI == true || raceOther == true) {
        return false;
      }
      return true;
    case "AIAN": 
      if(raceMENA == true || raceNHPI == true || raceOther == true) {
        return false; 
      }
      return true;
    case "MENA": 
      if(raceNHPI == true || raceOther == true) {
        return false;
      }
      return true;
    case "NHPI":
      if(raceOther == true) {
        return false;
      }
      return true;
    default:
      return true;
  }
  return true; 
};

/*
*	Created by: Omar Mohammed, Kyle Grave
*	Function sets the most up to date date of birth property to DOBMonth, Day, Year to keep 
*	Rev screen updated
*/
function EnumCB_updateDOBValues() {
  var birthMonth = "";
  var birthDay = "";
  var birthYear = "";
  var response = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  /*Handle Month*/
  birthMonth = EnumCB_chooseCorrectDateProp("P_BIRTH_MONTH_INT", "P_BIRTH_MONTH_RV_INT", "P_BIRTH_MONTH_CH_INT");
  /*Handle Day*/
  birthDay = EnumCB_chooseCorrectDateProp("P_BIRTH_DAY_INT", "P_BIRTH_DAY_RV_INT", "P_BIRTH_DAY_CH_INT");
  /*Handle Year*/
  birthYear = EnumCB_chooseCorrectDateProp("P_BIRTH_YEAR_INT", "P_BIRTH_YEAR_RV_INT", "P_BIRTH_YEAR_CH_INT");
  /*put birthMonth, birthDay, birthYear in proper props*/
  var updateValuePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  updateValuePage.put("DOBMonth",birthMonth);
  updateValuePage.put("DOBDay",birthDay);
  updateValuePage.put("DOBYear",birthYear);
} 

/*
*	Created by: Omar Mohammed, Kyle Grave
*	Priority order: Review DOB, Change DOB, Original DOB
*/
function EnumCB_chooseCorrectDateProp(origProp, rvProp, chProp) {
  var birthProp = "";
  var response = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var origDOBProp = response.get(origProp);
  origDOBProp = origDOBProp ? parseInt(origDOBProp.getValue(),10) : ""; 
  var revBirthProp = response.get(rvProp);
  revBirthProp = revBirthProp ? parseInt(revBirthProp.getValue(),10) : "";
  var chBirthProp = response.get(chProp);
  chBirthProp = chBirthProp ? parseInt(chBirthProp.getValue(),10) : "";

  if(origDOBProp != "") {
    birthProp = origDOBProp;
  }

  if(chBirthProp != "") {
    birthProp = chBirthProp;
  }

  if(revBirthProp != "") {    
    birthProp = revBirthProp;
  }
  return birthProp;
}



/* ***********************************************************
*  Generic Function to expand Help text for survey questions
*  Used When we need to expand help text dynamically 
*  Created by David Bourque
**************************************************************/
ENUMCB.expandHelpForQuestion = function() {
  var cpCurrentSurveyQuestion = pega.ui.ClientCache.find("pyWorkPage.CurrentSurveyQuestion");
  if (cpCurrentSurveyQuestion) {
    if (cpCurrentSurveyQuestion.getValue() == "Race_QSTN") {
      ENUMCB.expandHelpForRace();
    }
  }
};

/* ***********************************************************
*  Helper function used to expand help text for Race screen
*  Created by David Bourque
**************************************************************/
ENUMCB.expandHelpForRace = function() {
  try {
    if (document.getElementById("IsRaceWhite").checked == true) {
      document.querySelectorAll('[data-tour-id="WhiteHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceHispanic").checked == true) {
      document.querySelectorAll('[data-tour-id="HispanicHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceBlack").checked == true) {
      document.querySelectorAll('[data-tour-id="BlackHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceAsian").checked == true) {
      document.querySelectorAll('[data-tour-id="AsianHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceAIAN").checked == true) {
      document.querySelectorAll('[data-tour-id="AIANHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceMENA").checked == true) {
      document.querySelectorAll('[data-tour-id="MENAHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceNHPI").checked == true) {
      document.querySelectorAll('[data-tour-id="NHPIHelpText"]')[1].firstChild.firstChild.click();
    }
    if (document.getElementById("IsRaceOther").checked == true) {
      document.querySelectorAll('[data-tour-id="OtherHelpText"]')[1].firstChild.firstChild.click();
    }
  } catch(e) {
    console.log("ENUMCB Error - " + "Unable to Locate Help Section in ENUMCB.expandHelpForRace"); 
  }
};

/** 
*	Call this function to get the value of the IsDKRefVisible prop
*	Created by Omar Mohammed
**/
ENUMCB.getIsDKRefVisible = function() {
  if (pega.mobile.isHybrid) {
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isDKRefVisible = questFlags.get("IsDKRefVisible");
    if(isDKRefVisible) {
      isDKRefVisible = isDKRefVisible.getValue();
      if (isDKRefVisible == "false") {
        isDKRefVisible = false;
      }
    }
    else {
      isDKRefVisible = "";
    }
    return isDKRefVisible;
  } else {
    var isDKRefVisible = pega.u.d.getProperty('pyWorkPage.QuestFlags.IsDKRefVisible');
    if (isDKRefVisible === undefined) {
      isDKRefVisible = "";
    }
    return isDKRefVisible;
  }
};

/**
*	Call this function on the pre action of all questions
*	If the DKRef property was never populated, we need to hide the DKRef section
*   pageName param is optional. If not passed it will default to "pyWorkPage.HouseholdMemberTemp.DKRefused"
*	Created by Omar Mohammed
**/
ENUMCB.updateDKRefVisibility = function(prop, pageName) {
  pageName = (pageName) ? pageName : "pyWorkPage.HouseholdMemberTemp.DKRefused";
  var DKRefused = pega.ui.ClientCache.find(pageName);
  var introDKRef = DKRefused.get(prop);
  if(introDKRef) {
    introDKRef = introDKRef.getValue();
  }
  else {
    introDKRef = "";
  }
  if(introDKRef == "") {
    CB.toggleFlag("IsDKRefVisible", "false");
  }
  else {
    CB.toggleFlag("IsDKRefVisible", "true");
  }
};


/* 
*Created by Mike Hartel 11/28/2016
*programmatically add number of roster members that were specified on test harness
*called from Enumcb_Popcount_POST.
*/

function TEST_AddTestMembersToRoster(){

  try
  {
      var workPage = pega.ui.ClientCache.find("pyWorkPage");
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var householdMemberList = householdRoster.get("HouseholdMember");      

      var testHouseholdMemberList = workPage.get("TestHouseholdMemberList");
      if(testHouseholdMemberList)
      {
          var testHHMemberListIter = testHouseholdMemberList.iterator(); 
          var respPage= pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");  
          var popCount= respPage.get("H_SIZE_STATED_INT").getValue(); /*start index at popcount */
          var index=0 + parseInt(popCount, 10);

          while(testHHMemberListIter.hasNext()){
            index++;
            if(index>99){
              break;
            }
            else{
              var testMemberPage = testHHMemberListIter.next();
              householdMemberList.add().adoptJSON(testMemberPage.getJSON());
            }
          }
          testHouseholdMemberList= workPage.put("TestHouseholdMemberList",[]);
      }
  }
  catch(e)
  {
      alert("AddTestMembersToRoster ==> <" + e.message + ">");
  }
}

/*
*	ENUMCB.getSelectedHHMember
*	Created by:  Domenic Giancola
*	Used to update CurrentHHMemberIndex when triggering the Change Spelling action on Roster Review
*/
ENUMCB.getSelectedHHMember = function(e) {
  var baserefDiv = e.target.closest("#CT");
  if(baserefDiv){
    var strBaseref = baserefDiv.getAttribute("sec_baseref");
    if(strBaseref != ""){
      var results = [];
      var strToSplit = strBaseref.split('(');
      for (var i = 1; i < strToSplit.length; i++) {
        var strTemp = strToSplit[i].split(')')[0];
        results.push(strTemp);
      }
      var strCurIndex = results[results.length-1];
      var curIndex = parseInt(strCurIndex);
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var cpHHRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      if(cpQuestFlags || cpHHRoster){
        cpQuestFlags.put("IsEditingRoster",true);
        cpQuestFlags.put("HasRosterChanges","false");
        cpHHRoster.put("CurrentHHMemberIndex",curIndex);
        var nextButton = $("[data-test-id=EnumGoNext]")[0];
        if(nextButton){
          /* TODO: Replace timeout once event blocking JS has been located */
          window.setTimeout(function() {$("[data-test-id=EnumGoNext]")[0].click();},100);
          return false;
        }
      }
      else {
        console.log("***ENUMCB Error - Unable to find QuestFlags or HouseholdRoster pages in ENUMCB.getSelectedHHMember");
      }
    }
    else {
      console.log("***ENUMCB Error - Unable to find current baseref in ENUMCB.getSelectedHHMember");
    }
  }
  else {
    console.log("***ENUMCB Error - Unable to find CT div for baseref in ENUMCB.getSelectedHHMember");
  }
};

/*************************************************************************
*	Created by: Kyle Gravel
*	Function is responsible for clearing the owner names on Owner_QSTN
*
**************************************************************************/
ENUMCB.clearCheckboxList = function(propertyValue, checkboxClass) {
  try{ 
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    /*var isNoOwnerRenterSelected = householdRoster.get("IsNoOwnerRenterSelected");*/
    if(propertyValue == "true" || propertyValue == "D" || propertyValue == "R") {
      /*var doc = $(document.body);*/
      $(checkboxClass + ' input:checkbox').each(function(i) {
        var ID = $(this).attr('id');
        CB.fillCheckbox(ID,"false");                                 
      });
    }
  }
  catch(e) {
    alert(e.message);
  }
};

/* Created by: Aditi Ashok
* Function to check all days for BestTime if Anytime is selected
*/
ENUMCB.BestTime_anytimeSelected = function(allDaysAndTimes, propertyValue) {
  if (propertyValue == "true") {
    CB.fillCheckboxes(allDaysAndTimes, "true");
  } else {
    CB.fillCheckboxes(allDaysAndTimes, "false");
  }
};

/***
*	dkRefProp param should contain path of property on DKRefused page
*	dkResponseProp param should contain the path of the DK Response Prop - .Response.RESP_PH_DK_IND
*	refResponseProp param should contain the path of the Ref Response Prop - .Response.RESP_PH_REF_IND
*	Created by Omar Mohammed
**/
ENUMCB.setDKRefResponse = function(dkRefProp, dkResponseProp, refResponseProp) {
  var dkRefVal = pega.ui.ClientCache.find(dkRefProp);
  var dkResponsePropPage = dkResponseProp.substring(0, dkResponseProp.lastIndexOf("."));
  var dkResponsePropName = dkResponseProp.substring(dkResponseProp.lastIndexOf(".") + 1);
  var refResponsePropPage = refResponseProp.substring(0, refResponseProp.lastIndexOf("."));
  var refResponsePropName = refResponseProp.substring(refResponseProp.lastIndexOf(".") + 1);

  var dkResponsePage = pega.ui.ClientCache.find(dkResponsePropPage);
  var refResponsePage = pega.ui.ClientCache.find(refResponsePropPage);

  if(dkRefVal) {
    dkRefVal = dkRefVal.getValue();
  }
  else {
    dkRefVal = "";
  }
  if(dkRefVal == "D") {
    dkResponsePage.put(dkResponsePropName, "1");
    refResponsePage.put(refResponsePropName, "0");
  }
  else if(dkRefVal == "R") {
    dkResponsePage.put(dkResponsePropName, "0");
    refResponsePage.put(refResponsePropName, "1");
  }
};

/* 
* Called when a day is selected in BestTime to autofill corresponding values
* Created By: Aditi Ashok
*/

ENUMCB.BestTime_daySelected = function(propertyName, propertyValue) {
  var morning = propertyName + "Morning";
  var afternoon = propertyName + "Afternoon";
  var evening = propertyName + "Evening";

  if (propertyValue == "true") {
    CB.fillCheckbox(morning, "true");
    CB.fillCheckbox(afternoon, "true");
    CB.fillCheckbox(evening, "true");
  } else {
    CB.fillCheckbox(morning, "false");
    CB.fillCheckbox(afternoon, "false");
    CB.fillCheckbox(evening, "false");
  }
};

/* 
* Called in BestTime to determine whether anytime is checked when 
* day is deselected
* Created By: Aditi Ashok
*/
ENUMCB.BestTime_anytimeCheck = function(dayValue, anyTimeValue) {
  if (dayValue == "false" && anyTimeValue == "true") {
    CB.fillCheckbox("IsAnytime", "false");
  }
};


/***********************************
*  Function to Delete Member on Roster From Roster Review Screen
*  Created By: David Bourque
*******************************/

ENUMCB.rosterReview_DeleteFromRoster = function() {
  console.log("***ENUMCB entering ENUMCB.rosterReview_DeleteFromRoster");
  var cpHHRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  if(cpHHRoster){
    var cpCurrMemberIndex = parseInt(cpHHRoster.get("CurrentHHMemberIndex").getValue());
    var cpHHMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    cpHHMemberList.remove(cpCurrMemberIndex);
  }
  else {
    console.log("***ENUMCB Error - Unable to find HouseholdRoster pages in ENUMCB.rosterReview_DeleteFromRoster");
  }
};

/*
*	ENUMCB.moveSelectedMembertoHHMemberTemp
*	Created by:  David Bourqe
*	Used to update CurrentHHMemberIndex and move to HouseholdMember Temp
*   when triggering the Remove Name action on Roster Review
*/
ENUMCB.moveSelectedMembertoHHMemberTemp = function(e) {
  var baserefDiv = e.target.closest("#RULE_KEY");
  if(baserefDiv){
    var strBaseref = baserefDiv.getAttribute("full_base_ref");
    if(strBaseref != ""){
      var results = [];
      var strToSplit = strBaseref.split('(');
      for (var i = 1; i < strToSplit.length; i++) {
        var strTemp = strToSplit[i].split(')')[0];
        results.push(strTemp);
      }
      var strCurIndex = results[results.length-1];
      var curIndex = parseInt(strCurIndex);
      var cpHHRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      if(cpHHRoster){
        cpHHRoster.put("CurrentHHMemberIndex",curIndex);
        CB.getMemberFromRoster(curIndex);
      }
      else {
        console.log("***ENUMCB Error - Unable to find QuestFlags or HouseholdRoster pages in ENUMCB.moveSelectedMembertoHHMemberTemp");
      }
    }
    else {
      console.log("***ENUMCB Error - Unable to find current baseref in ENUMCB.moveSelectedMembertoHHMemberTemp");
    }
  }
  else {
    console.log("***ENUMCB Error - Unable to find CT div for baseref in ENUMCB.moveSelectedMembertoHHMemberTemp");
  }
};

/*
*	ENUMCB.setHouseholdMembersFullName
*	Created by:  Mike Hartel
*	Used to set the FullName of every member on the household roster
*/

ENUMCB.setHouseholdMembersFullName = function(){
  var HHRoster  = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var HHMemberListIter = HHRoster.get("HouseholdMember").iterator();

  while(HHMemberListIter.hasNext()){       
    var currentPage = HHMemberListIter.next();
    var respPage = currentPage.get("Response");
    var firstName = respPage.get("P_FIRST_NAME").getValue();
    var middleName = respPage.get("P_MIDDLE_NAME").getValue();
    var lastName = respPage.get("P_LAST_NAME").getValue();
    var fullName = "";
    /* check for all combinations of name */
    if (firstName != "") {
      var fullName = firstName.trim() + " ";
    }
    if (middleName != "") {
      var fullName = fullName + middleName.trim() + " ";
    }
    if (lastName != "") {
      var fullName = fullName + lastName.trim() + " ";
    }
    var fullName = fullName.substring(0, fullName.length - 1);
    fullName = fullName.toUpperCase();
    currentPage.put("FullName", fullName);
  }
};

/*
*  ENUMCB.AreParentsYoungerThanChildren
*  Created by David Bourque
*  Used to check through Roster to see if any of the Reference Person parents are younger than the Refernce Person
*  of if any of the reference persons children are older than the reference person
*/

ENUMCB.AreParentsYoungerthanChildren = function() {
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpRespondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  if (cpHouseholdRoster && cpQuestFlags && cpRespondent) {
    var rosterSize = cpHouseholdRoster.get("HouseholdMember").size();
    /* Check if at the end of roster */
    var hhIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
	if (hhIndex <= rosterSize) {
		return;
	}
    /* Loop through members to check if any of the reference persons children/parents are older/younger respectivley */
    cpQuestFlags.put("IsEnteringRelationshipCheck","false");
    for (var i = 1; i <= rosterSize; i++) { 
      var currentRosterMember = cpHouseholdRoster.get("HouseholdMember("+i+")");
      var isReferencePerson = currentRosterMember.get("ReferencePersonFlag");
      if (isReferencePerson && isReferencePerson.getValue()+"" == "true") {
        currentRosterMember.put("IsChildOlderThanReference","false");
        currentRosterMember.put("IsParentYoungerThanReference","false");
      } else {
        var cpRelationshipToReference =  currentRosterMember.get("Response.P_REL_CODE"); 
        if  (cpRelationshipToReference) {
          if (cpRelationshipToReference.getValue() == "D" || cpRelationshipToReference.getValue() == "R") {
            currentRosterMember.put("IsChildOlderThanReference","false");
            currentRosterMember.put("IsParentYoungerThanReference","false");
          } else {
            var relationshipToReference = parseInt(cpRelationshipToReference.getValue());
            /* If Parent to Reference Person */
            if  (relationshipToReference == 9 || relationshipToReference == 11) { 
              var cpAge = currentRosterMember.get("AgeText");
              if (cpAge) {
                if (cpAge.getValue() == "D" || cpAge.getValue() == "R") {
                  currentRosterMember.put("IsChildOlderThanReference","false");
                  currentRosterMember.put("IsParentYoungerThanReference","false");
                } else {
                  var cpReferenceAge = cpHouseholdRoster.get("ReferencePerson.AgeText");
                  if (cpReferenceAge) {
                    if (cpReferenceAge.getValue() == "D" || cpReferenceAge.getValue() == "R") {
                      cpQuestFlags.put("IsEnteringRelationshipCheck","false");
                      currentRosterMember.put("IsChildOlderThanReference","false");
                      currentRosterMember.put("IsParentYoungerThanReference","false");
                      return;
                    } else {
                      var age = parseInt(cpAge.getValue());
                      var referenceAge = parseInt(cpReferenceAge.getValue());
                      if (age < referenceAge) {
                        cpQuestFlags.put("IsEnteringRelationshipCheck","true");
                        currentRosterMember.put("IsParentYoungerThanReference","true");
                        currentRosterMember.put("IsChildOlderThanReference","false");
                      }
                    }
                  }
                }
              }
            } /* If child of Reference Person */
            else if  (relationshipToReference == 5 || relationshipToReference == 6 || relationshipToReference == 7 || relationshipToReference == 12 || relationshipToReference == 15) {
              var cpAge = currentRosterMember.get("AgeText");
              if (cpAge) {
                if (cpAge.getValue() == "D" || cpAge.getValue() == "R") {
                  currentRosterMember.put("IsChildOlderThanReference","false");
                  currentRosterMember.put("IsParentYoungerThanReference","false");
                } else {
                  var cpReferenceAge = cpHouseholdRoster.get("ReferencePerson.AgeText"); 
                  if (cpReferenceAge) {
                    if (cpReferenceAge.getValue() == "D" || cpReferenceAge.getValue() == "R") {
                      cpQuestFlags.put("IsEnteringRelationshipCheck","false");
                      currentRosterMember.put("IsChildOlderThanReference","false");
                      currentRosterMember.put("IsParentYoungerThanReference","false");
                      return;
                    } else {
                      var age = parseInt(cpAge.getValue());
                      var referenceAge = parseInt(cpReferenceAge.getValue());
                      if (age > referenceAge) {
                        cpQuestFlags.put("IsEnteringRelationshipCheck","true");
                        currentRosterMember.put("IsParentYoungerThanReference","false");
                        currentRosterMember.put("IsChildOlderThanReference","true");
                      }
                    }
                  }
                }
              }
            } else {
              currentRosterMember.put("IsChildOlderThanReference","false");
              currentRosterMember.put("IsParentYoungerThanReference","false");
            }
          }
        } else {
          currentRosterMember.put("IsChildOlderThanReference","false");
          currentRosterMember.put("IsParentYoungerThanReference","false");
        }
      }
    } 
  }
};


/*
* ENUMCB.setRelTextInHouseholdMemberTemp
* Created by Mark Coats, Updated by GRAVE340
* Sets the RelationshipText in HouseholdMemberTemp.Response to match its P_REL_CODE - written to support RevRelatioonshipResp_POST.
*/
ENUMCB.setRelTextInHouseholdMemberTemp = function(propVal, datapage, DKRProp) { 
  var cpRelationshipOptions = pega.ui.ClientCache.find(datapage + ".pxResults");
  var DKRPropVal = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused." + DKRProp);
  var cpTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  if (DKRPropVal && DKRPropVal.getValue() == "D") {
    if (datapage == "D_RelationSDOptions") {
      cpTemp.put("RelationshipText","Biological son or daughter");
    } else if (datapage == "D_RelationOTOptions") {
      cpTemp.put("RelationshipText","Other nonrelative");
    } else {
      cpTemp.put("RelationshipText","Don't Know");
    }
  } else if (DKRPropVal && DKRPropVal.getValue() == "R") {
    if (datapage == "D_RelationSDOptions") {
      cpTemp.put("RelationshipText","Biological son or daughter");
    } else if (datapage == "D_RelationOTOptions") {
      cpTemp.put("RelationshipText","Other nonrelative");
    } else {
      cpTemp.put("RelationshipText","Refused");
    }
  } else {
    var arrRelOptions = new Array();
    var iterRelOptions = cpRelationshipOptions.iterator();
    while(iterRelOptions.hasNext()){
      var cpCurPage = iterRelOptions.next();
      arrRelOptions[cpCurPage.get("pyValue").getValue()] = cpCurPage.get("pyDescription").getValue();
    }
    /*var cpTempResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");*/
    var cpRelationshipCode = cpTemp.get(propVal);
    if( cpRelationshipCode ) {
      var relationshipCode = cpRelationshipCode.getValue();
      if(arrRelOptions[relationshipCode]){
        cpTemp.put("RelationshipText",arrRelOptions[relationshipCode]);
      }
      else {
        cpTemp.put("RelationshipText","");
      }   
    }
  }  
};

/*
* ENUMCB.setRosterRelationshipText0
* Created by: Domenic Giancola
* Sets P_REL_TEXT value based on P_REL_CODE lookup for all roster members
*/
ENUMCB.setRosterRelationshipText = function(){
  var cpHHMembers = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  var cpRelationshipOptions = pega.ui.ClientCache.find("D_RelationshipOptions_ALL.pxResults");
  var arrRelOptions = new Array();

  if(cpHHMembers && cpRelationshipOptions){
    /* populate options array */
    var iterRelOptions = cpRelationshipOptions.iterator();
    while(iterRelOptions.hasNext()){
      var cpCurPage = iterRelOptions.next();
      arrRelOptions[cpCurPage.get("pyValue").getValue()] = cpCurPage.get("pyDescription").getValue();
    }
    /* populate roster values */
    var iterHHMembers = cpHHMembers.iterator();
    while(iterHHMembers.hasNext()){
      var cpCurPage = iterHHMembers.next();
      var cpCurResponse = cpCurPage.get("Response");
      var cpRelationshipCode = cpCurResponse.get("P_REL_CODE");
      if (cpRelationshipCode){
        var relationshipCode = cpRelationshipCode.getValue();
        if(arrRelOptions[relationshipCode]){
          cpCurResponse.put("P_REL_TEXT",arrRelOptions[relationshipCode]);
        }
        else {
          cpCurResponse.put("P_REL_TEXT","");
        }
      }
    }
    return false;
  }
  else {
    return true;
  }
  return false;
};

/*
*	Created by: Kyle Gravel
*	Used to create a pagelist under quest flags of the household members that fail the sex check
*/
ENUMCB.addMembersToRSMemberIndexList = function(memberIndicesPageListName) {
  try { 
    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var householdMemberList = householdMember.iterator();
    var memberIndicesPageList = pega.ui.ClientCache.find(memberIndicesPageListName);

    var currentIndex = 0;
    var referencePersonIndex = 0;
    var doesRefNeedConfirmation = false;

    while(householdMemberList.hasNext()) {
      currentIndex = currentIndex + 1; 
      var currentPage = householdMemberList.next();
      var needSexConfirmation = currentPage.get("RelationshipInconsistent");

      if(needSexConfirmation) {
        needSexConfirmation = needSexConfirmation.getValue();
      }
      else {
        needSexConfirmation = "";
      }

      var referencePersonFlag = currentPage.get("ReferencePersonFlag");

      if(referencePersonFlag){
        referencePersonFlag = referencePersonFlag.getValue();
      }
      else {
        referencePersonFlag = "";
      }

      if(referencePersonFlag == true) {
        referencePersonIndex = currentIndex;
      }

      /*add the index of the current page, only if need sex confirmation is true and reference person flag is false*/
      if(needSexConfirmation == true && referencePersonFlag != true) {          
        var addedPage = memberIndicesPageList.add();
        addedPage.put("pyTempInteger",currentIndex);
        doesRefNeedConfirmation = true;
      }
    }

    /*Add reference person to end of list if anyone else had a Relationship Inconsistency*/
    if(doesRefNeedConfirmation == true) {
      var addedPage = memberIndicesPageList.add();
      addedPage.put("pyTempInteger",referencePersonIndex);      
    }
  }
  catch(e) {
    alert(e.message);
  }
};

/*
 *	Created by: AXJ
 *	ENUMCB.SetChangeSexResponseProperties
 */
ENUMCB.SetChangeSexResponseProperties = function (){
  try {
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var dkRefProp = dkRefused.get("ChangeSex");
    dkRefProp = (dkRefProp) ? dkRefProp.getValue() : "";
    var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");      
    var revisedSex = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.SexMaleFemaleConsistencyEdit");
    if (cpResponse) {
      if (dkRefProp == "D") {
        cpResponse.put("P_SEX_DK_CH_IND", "1");
        cpResponse.put("P_SEX_REF_CH_IND", "0");
      } else if (dkRefProp == "R") {
        cpResponse.put("P_SEX_DK_CH_IND", "0");
        cpResponse.put("P_SEX_REF_CH_IND", "1");
      } else {
        cpResponse.put("P_SEX_DK_CH_IND", "0");
        cpResponse.put("P_SEX_REF_CH_IND", "0");
      }

      if (revisedSex == "Male") {
        cpResponse.put("P_SEX_MALE_CH_IND", "1");
        cpResponse.put("P_SEX_FEMALE_CH_IND", "0");
      } else if (revisedSex == "Female") {
        cpResponse.put("P_SEX_MALE_CH_IND", "0");
        cpResponse.put("P_SEX_FEMALE_CH_IND", "1");
      } else {
        cpResponse.put("P_SEX_MALE_CH_IND", "0");
        cpResponse.put("P_SEX_FEMALE_CH_IND", "0");
      }
    }
    return;
  } catch (e) {
    alert("ENUMCB Error - ENUMCB.SetChangeSexResponseProperties:" + e.message);
  }
};

/*
* Function for Exit Survey action in Options menu
* Created by Domenic Giancola
*/
ENUMCB.launchConfirmExitSurvey = function() {
  if(pega.mobile.isHybrid){
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
    if(cpQuestFlags && cpWorkPage){
      var exitSurveyEnabled = cpQuestFlags.get("ExitSurveyEnabled");
      if(exitSurveyEnabled) {
        exitSurveyEnabled = exitSurveyEnabled.getValue();
      }
      else {
        exitSurveyEnabled = "";
      }
      if(exitSurveyEnabled == true || exitSurveyEnabled == "true") {
        var lastSurveyQuestion = cpWorkPage.get("CurrentSurveyQuestion").getValue();
        cpQuestFlags.put("HideFAButtons",true);
        cpQuestFlags.put("ExitSurveyLastQuestion",lastSurveyQuestion);
        cpWorkPage.put("CurrentSurveyQuestion","ExitSurvey_QSTN");
        pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=CollectEnum&TaskName=Assignment1");
      }
    }
  }
};

/*
* Function for No and Previous buttons in Exit Survey flow
* Created by Domenic Giancola
*/
ENUMCB.exitSurveyGoBack = function() {
  if(pega.mobile.isHybrid){
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    if(cpQuestFlags){
      var isInExitSurveyFlow = cpQuestFlags.get("IsInExitSurveyFlow").getValue();
      if(isInExitSurveyFlow == true || isInExitSurveyFlow == "true"){
        cpQuestFlags.put("HideFAButtons",false);
        cpQuestFlags.put("IsInExitSurveyFlow",false);
        pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=QuestionShape&TaskName=ASSIGNMENT63");
      }
      else {
        cpQuestFlags.put("HideFAButtons",false);
        cpQuestFlags.put("IsInExitSurveyFlow",false);
        pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=QuestionShape&TaskName=ASSIGNMENT63");
      }
    }
  }
};

/*
* Function for Yes button in Exit Survey flow
* Created by Domenic Giancola
*/
ENUMCB.confirmExitSurvey = function() {
  if(pega.mobile.isHybrid){
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var cpWorkPage = pega.ui.ClientCache.find("pyWorkPage");
    if(cpQuestFlags && cpWorkPage){
      cpQuestFlags.put("ExitSurveyAction","");
      cpQuestFlags.put("HideFAButtons",false);
      var lastSurveyQuestion = cpQuestFlags.get("ExitSurveyLastQuestion").getValue();
      if (lastSurveyQuestion == "Intro_QSTN" || lastSurveyQuestion == "Address_QSTN" || lastSurveyQuestion == "RespName_QSTN" || lastSurveyQuestion == "RespPhone_QSTN" || lastSurveyQuestion == "Who_QSTN" || lastSurveyQuestion == "Anyone_QSTN" || lastSurveyQuestion == "KnowAddress_QSTN") {
        cpQuestFlags.put("ExitSurveyAction","ExitPopStatus_QSTN");
        cpQuestFlags.put("IsInExitSurveyFlow",true);
      }
      else if (lastSurveyQuestion == "EligibleResp_QSTN" || lastSurveyQuestion == "AnyoneMU_QSTN" || lastSurveyQuestion == "RevRelationshipOther_QSTN" || lastSurveyQuestion == "RevRelationSD_QSTN" || lastSurveyQuestion == "RevRelationOT_QSTN" || lastSurveyQuestion == "RevRace_QSTN" || lastSurveyQuestion == "RevDetailedOriginNHPI_QSTN" || lastSurveyQuestion == "RevDetailedOriginAsian_QSTN" || lastSurveyQuestion == "RevDetailedOriginAIAN_QSTN" || lastSurveyQuestion == "RevDetailedOriginWhite_QSTN" || lastSurveyQuestion == "RevDetailedOriginHisp_QSTN"|| lastSurveyQuestion == "RevDetailedOriginBlack_QSTN"|| lastSurveyQuestion == "RevDetailedOriginOther_QSTN" || lastSurveyQuestion == "PopCount_QSTN" || lastSurveyQuestion == "Undercount_QSTN" || lastSurveyQuestion == "Home_QSTN" || lastSurveyQuestion == "Sex_QSTN" || lastSurveyQuestion == "RosterReview_QSTN" || lastSurveyQuestion == "RosterAdd_QSTN" || lastSurveyQuestion == "RosterEdit_QSTN" || lastSurveyQuestion == "RosterAdd_QSTN" || lastSurveyQuestion == "DOB_QSTN" || lastSurveyQuestion == "Race_QSTN" || lastSurveyQuestion == "EthnicityWhite_QSTN" || lastSurveyQuestion == "EthnicityBlack_QSTN" || lastSurveyQuestion == "EthnicityAsian_QSTN" || lastSurveyQuestion == "EthnicityHisp_QSTN" || lastSurveyQuestion == "EthnicityMENA_QSTN" || lastSurveyQuestion == "EthnicityNHPI_QSTN" || lastSurveyQuestion == "EthnicityOther_QSTN" || lastSurveyQuestion == "EthnicityAIAN_QSTN" || lastSurveyQuestion == "ConfirmAge_QSTN" || lastSurveyQuestion == "Review_QSTN" || lastSurveyQuestion == "People_QSTN" || lastSurveyQuestion == "RelationshipResp_QSTN" || lastSurveyQuestion == "RelationSD_QSTN" || lastSurveyQuestion == "RelationshipCheck_QSTN" || lastSurveyQuestion == "RelationshipOther_QSTN" || lastSurveyQuestion == "RelationOT_QSTN" || lastSurveyQuestion == "Age_QSTN" || lastSurveyQuestion == "Renter_QSTN"  || lastSurveyQuestion == "Owner_QSTN"  || lastSurveyQuestion == "ConfirmSex_QSTN"  || lastSurveyQuestion == "WhoLivesElsewhere_QSTN" || lastSurveyQuestion == "WhyLiveElsewhere_QSTN" || lastSurveyQuestion == "RevAge_QSTN" || lastSurveyQuestion == "RevRelationshipResp_QSTN" || lastSurveyQuestion == "ChangeRelationSD_QSTN" || lastSurveyQuestion == "RevSex_QSTN" || lastSurveyQuestion == "ChangeRelationRSSD_QSTN" || lastSurveyQuestion == "RelationshipCheckRS_QSTN" || lastSurveyQuestion == "ChangeRelationshipRS_QSTN" || lastSurveyQuestion == "ChangeAge_QSTN" || lastSurveyQuestion == "ChangeRelationship_QSTN" || lastSurveyQuestion == "ChangeRelationOT_QSTN" || lastSurveyQuestion == "ChangeRelationSD_QSTN" || lastSurveyQuestion == "ChangeRelationRSOT_QSTN" || lastSurveyQuestion == "ChangeDOB_QSTN" || lastSurveyQuestion == "RevDOB_QSTN" || lastSurveyQuestion == "RevDetailedOriginMENA_QSTN" || lastSurveyQuestion == "RevDetailedOriginSOR_QSTN" || lastSurveyQuestion == "BabyFlag_QSTN" ||  lastSurveyQuestion == "Occupancy_QSTN" || lastSurveyQuestion == "VacantDescription_QSTN" || lastSurveyQuestion == "OtherVacant_QSTN" || lastSurveyQuestion == "ExitPopStatus_QSTN" || lastSurveyQuestion == "SpecificUnitStatus_QSTN" || lastSurveyQuestion=="NumberCalled_QSTN" || lastSurveyQuestion == "IntroRI_QSTN"|| lastSurveyQuestion == "VerifyAddressRI_QSTN" || lastSurveyQuestion == "CountRI_QSTN" || lastSurveyQuestion == "ContactRespRI_QSTN" || lastSurveyQuestion == "IntroMU_QSTN" || lastSurveyQuestion =="DialOutcome_QSTN" || lastSurveyQuestion == "VerifyDialedNumber_QSTN") {
        cpQuestFlags.put("ExitSurveyAction","NoComplete_QSTN");
        cpQuestFlags.put("IsInExitSurveyFlow",true);
      }
      else if (lastSurveyQuestion == "NewCaseAddress_QSTN") {
	        ENUMCB.GoToCaseList();
      }
    }
    var exitSurveyAction = cpQuestFlags.get("ExitSurveyAction").getValue();
  }
};

/**
*	Generic PRE action for ChangeRelationshipRS, ChangeRelationRSSD, and ChangeRelationRSOT
*	Created by: Aansh Kapadia
**/

ENUMCB.ChangeRelationshipRSFlow_PRE = function() {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");

  /* Edge case when previous button is hit from DOB or RelationshipCheckRS */
  if (isGoingBack+"" == "true") {
    var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
    var currentHHIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    if (previousQuestion == "RelationshipCheckRS_QSTN") {
      var relationshipSexIndex = questFlags.get("RelationshipSexIndex");
      if (relationshipSexIndex) {
        relationshipSexIndex = parseInt(relationshipSexIndex.getValue());
      } else {
        relationshipSexIndex = 0;
      } 
      relationshipSexIndex = relationshipSexIndex-1;
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);

      /*  Set member in HHMTemp*/
      var relationshipSexMemberIndices = questFlags.get("RelationshipSexMemberList("+relationshipSexIndex+")");
      var HHMemberIndex = parseInt(relationshipSexMemberIndices.get("pyTempInteger").getValue());  
      cpHouseholdRoster.put("CurrentHHMemberIndex", HHMemberIndex);
      var curMemberIndex = cpHouseholdRoster.get("CurrentHHMemberIndex").getValue();
      CB.getMemberFromRoster(curMemberIndex);

    } else if(previousQuestion == "DOB_QSTN"){
      var relationshipSexIndex = questFlags.get("RelationshipSexIndex");
      if (relationshipSexIndex) {
        relationshipSexIndex = relationshipSexIndex.getValue();
      } else {
        relationshipSexIndex = 0;
      } 
      relationshipSexIndex = questFlags.get("RelationshipSexMemberList").size();
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);

      /*  Set member in HHMTemp*/
      var relationshipSexMemberIndices = questFlags.get("RelationshipSexMemberList("+relationshipSexIndex+")");
      var HHMemberIndex = parseInt(relationshipSexMemberIndices.get("pyTempInteger").getValue());  
      cpHouseholdRoster.put("CurrentHHMemberIndex", HHMemberIndex);
      var curMemberIndex = cpHouseholdRoster.get("CurrentHHMemberIndex").getValue();
      CB.getMemberFromRoster(curMemberIndex);
    }
  }
};

/**
* Decrements the roster until a householdmember with a "failed" relationship is found, sets this memeber in HouseholdMemberTemp
* Created by: Dillon Irish
**/
ENUMCB.getNextRelCheckPre = function() {
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var cpRespondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue()) - 1;
  var rosterSize = cpHouseholdRoster.get("HouseholdMember").size();

  if (currentHHMemberIndex <= 0) {
    currentHHMemberIndex = rosterSize;
  }
  for (currentHHMemberIndex; currentHHMemberIndex > 0; currentHHMemberIndex--) {
    var currentRosterMember = cpHouseholdRoster.get("HouseholdMember("+currentHHMemberIndex+")");
    var cpIsParentYoungerThanReference = currentRosterMember.get("IsParentYoungerThanReference");
    var cpIsChildOlderThanReference = currentRosterMember.get("IsChildOlderThanReference");
    if(cpIsParentYoungerThanReference && cpIsChildOlderThanReference) {
      if(cpIsParentYoungerThanReference.getValue() == "true" || cpIsChildOlderThanReference.getValue() == "true") {
        cpHHMemberTemp.adoptJSON(currentRosterMember.getJSON());
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHMemberIndex);
        break;
      }
    }
  }
};

ENUMCB.getNextRelCheckPost = function() {
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
  CB.setMemberInRoster(currentHHMemberIndex,false);
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
};

/*
* Disable dkRefused when “For what reason?” is available on WhyLiveElsewhere_QSTN 
* Created by:Ebenezer Owoeye
*/
ENUMCB.UpdateDKRefElsewhere = function(propValue) {
  if(propValue == "true") {  
    CB.toggleFlag("DKRFEnabled", "false"); 
    CB.toggleFlag("IsDKRefVisible", "false");
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    dkRefused.put("WhyLiveElsewhere", "");
  }	
  else {
    ENUMCB.updateDisabledDKRefColor();
  }
};

ENUMCB.DOBDKRefVisibility = function(dayProp, monthProp, yearProp) {
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var day = dkRefused.get(dayProp);
  var month = dkRefused.get(monthProp);
  var year = dkRefused.get(yearProp);
  day = day ? day.getValue() : "";
  month = month ? month.getValue() : "";
  year = year ? year.getValue() : "";
  if(day != "" || month != "" || year != "") {
    CB.toggleFlag("IsDKRefVisible", "true");
  }
  else {
    CB.toggleFlag("IsDKRefVisible", "false");
  }
};


/**
* Created by Mike Hartel
* Sets correct index and gets the member from Roster for the Ethnicity screens. If you are going forward the HouseholdMemberTemp doesnt need to be changed because its the same member from the RACE_QSTN
*
**/
ENUMCB.getMemberForEthnicityQuestion = function() {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var memberIndexProp = householdRoster.get("CurrentHHMemberIndex");
  var householdMembers = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");

  var memberIndex = (memberIndexProp) ? memberIndexProp.getValue() :1;
  /* got here from Previous*/
  if(isGoingBack == "true"){
    if(previousQuestion == "Race_QSTN") {   
      memberIndex = memberIndex - 1;
      householdRoster.put("CurrentHHMemberIndex", memberIndex);    
      CB.getMemberFromRoster(memberIndex); 
    }  
    else if(previousQuestion == "WhoLivesElsewhere_QSTN"){
      memberIndex = householdMembers.size();
      householdRoster.put("CurrentHHMemberIndex", memberIndex);    
      CB.getMemberFromRoster(memberIndex); 
    } 	
  }  
};

/*
* Function used to clear the checkboxes on Review Screen
* Created by David Bourque
*/

ENUMCB.clearReviewCheckboxes = function() {
  var softEditVLDN = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  if (softEditVLDN) {
    softEditVLDN.put("ReviewRelationship","false");
    softEditVLDN.put("ReviewSex","false");
    softEditVLDN.put("ReviewDoB","false");
    softEditVLDN.put("ReviewAgeBornAfter","false");
    softEditVLDN.put("ReviewAgeLessThanOneYear","false");
    softEditVLDN.put("ReviewAge","false");
    softEditVLDN.put("ReviewRace","false");
    softEditVLDN.put("ReviewNoChanges","false");
  }
};

/*
* Function to move race and rev race answers into Review Race Page
* Takes in string to tell which page to copy
* Created by David Bourque
*/

ENUMCB.setReviewRacePage = function(page) {
  var ethnicityPage = "";
  if (page == "RaceEthnicity") {
    ethnicityPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  } else {
    ethnicityPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  }
  var reviewEthnicityPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.ReviewRaceEthnicity");
  if (!reviewEthnicityPage) {
    var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    reviewEthnicityPage = cpHouseholdMemberTemp.put("ReviewRaceEthnicity",{});
  }
  reviewEthnicityPage.adoptJSON(ethnicityPage.getJSON());
};



/*
* Function to clear text box for PersonalNonContact screen on click of radio button
* By: Aditi Ashok
*/
ENUMCB.personalNonContact_clearTextBox = function () {
  	var workPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");  
  	var clearProperty = workPage.get("PERSONAL_NON_CONTACT_CODE_SPECIFY");
	clearProperty = (clearProperty) ? clearProperty.getValue() : "";
  	clearProperty = "";
	workPage.put("PERSONAL_NON_CONTACT_CODE_SPECIFY","");	
    pega.u.d.setProperty("pyWorkPage.Respondent.Response.PERSONAL_NON_CONTACT_CODE_SPECIFY", "");
};

/*
* Function to clear text box for SpecificUnitStatus screen on click of radio button
* By: Aditi Ashok
*/
ENUMCB.specificUnitStatus_clearTextBox = function () {
  	var workPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");  
  	var clearProperty = workPage.get("NOT_HOUSING_UNIT_STATUS_CODE_SPECIFY");
	clearProperty = (clearProperty) ? clearProperty.getValue() : "";
  	clearProperty = "";
	workPage.put("NOT_HOUSING_UNIT_STATUS_CODE_SPECIFY","");	
    pega.u.d.setProperty("pyWorkPage.Respondent.Response.NOT_HOUSING_UNIT_STATUS_CODE_SPECIFY", "");
};

/* 
* Used to clear props in Exit Pop Status Screen
* Created by David Bourque
*/

ENUMCB.clearCorrPropExitPopStatus = function(propVal) {
  if (propVal == 2 || propVal == 3) {
    ENUMCB.clearCorrProp("pyWorkPage.Respondent.Response.H_SIZE_EST_NRFU_INT",propVal);
  }
};

/* 
* Used to set props in Exit Pop Status Screen
* Created by David Bourque
*/

ENUMCB.setExitPopUnitStatus = function(propVal) {
  if (propVal != "") {
    $('#H_NRFU_STATUS_EXIT_CODE1').click();
    ENUMCB.clearCorrProp("pyWorkPage.Respondent.DKRefused.ExitPopStatusUnitStatus",propVal);
  }
};

/*
* Updates the DKRef visibility when Screen has two dk/refused porperties using Respondent Page
* Created by David Bourque
*/ 

ENUMCB.updateDKRefVisibilityfor2PropertiesRespondent = function(firstProp, secondProp) {
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  var firstdkref = dkRefused.get(firstProp);
  var seconddkref = dkRefused.get(secondProp);
  firstdkref = firstdkref ? firstdkref.getValue() : "";
  seconddkref = seconddkref ? seconddkref.getValue() : "";
  if(firstdkref != "" || seconddkref != "") {
    CB.toggleFlag("IsDKRefVisible", "true");
  }
  else {
    CB.toggleFlag("IsDKRefVisible", "false");
  }
};

 /**
* Clear Text Box
* Created by: Ramin
*/
ENUMCB.clearTextBox = function(corrProp,propVal){
   if(propVal == 0) {
       ENUMCB.clearCorrProp(corrProp,propVal);
      }
  };


/*function is responsible for loading all values into D_TypeOfProxyOptions datapage*/
ENUMCB.primeTypeOfProxyOptions = function() {
  /*grab census date*/
  var censusDate = CB.getLocalizedCensusDate();
  /*grab LastSurveyQuestion from pyWorkPage*/
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var lastSurveyQuestion = questFlags.get("PreviousQuestion");
  lastSurveyQuestion = lastSurveyQuestion ? lastSurveyQuestion.getValue() : "";   
  /*grab all field values for answers*/
  var typeOfProxyANSW = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy_ANSW");
  var typeOfProxyANSW1 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy1_ANSW");
  var typeOfProxyANSW2 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy2_ANSW");
  var typeOfProxyANSW3 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy3_ANSW");
  var typeOfProxyANSW4 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy4_ANSW");
  var typeOfProxyANSWTEMP = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxyTEST_ANSW"); 
  var typeOfProxyANSW5 = typeOfProxyANSWTEMP + " " + censusDate + ")";
  var typeOfProxyANSW6 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy6_ANSW");
  var typeOfProxyANSW7 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy7_ANSW");
  var typeOfProxyANSW8 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy8_ANSW");
  var typeOfProxyANSW9 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "TypeOfProxy9_ANSW");
  /*grab datapage*/
  var typeOfProxyDP = pega.ui.ClientCache.find("D_TypeOfProxyOptions").put("pxResults",[]);
  /*create temp page to load dp*/
  var typeOfProxyTemp = pega.ui.ClientCache.createPage("TypeOfProxyTemp");

  /*load neighbor*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW);
  typeOfProxyTemp.put("pyValue","1");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load landlord or property manager*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW1);
  typeOfProxyTemp.put("pyValue","2");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load real estate agent*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW2);
  typeOfProxyTemp.put("pyValue","3");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load relative or householdmember*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW3);
  typeOfProxyTemp.put("pyValue","4");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load caregiver or health provider*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW4);
  typeOfProxyTemp.put("pyValue","5");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load in mover*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW5);
  typeOfProxyTemp.put("pyValue","6");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load government office or worker*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW6);
  typeOfProxyTemp.put("pyValue","7");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  /*load utility worker*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW7);
  typeOfProxyTemp.put("pyValue","8");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  if(lastSurveyQuestion == "ProxyAddress_QSTN" || lastSurveyQuestion == "BestTime_QSTN") {
    /*load Enumerator personal knowledge*/
    typeOfProxyTemp.put("pyLabel",typeOfProxyANSW8);
    typeOfProxyTemp.put("pyValue","9");
    typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
  }
  /*load other*/
  typeOfProxyTemp.put("pyLabel",typeOfProxyANSW9);
  typeOfProxyTemp.put("pyValue","10");
  typeOfProxyDP.add().adoptJSON(typeOfProxyTemp.getJSON());
};

/**
*	Called from on change action on the Address Type Radio buttons on Proxy Address
*	Clears all fields and sets Proxy Address to Location Address if flags are met
*	Created by: Dillon Irish
**/
ENUMCB.clearProxyAddressFields = function() {
	try{
		var cpProxyAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
		var cpLocationAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
		
		if(cpProxyAddress && cpLocationAddress){
		
			var isMU = cpLocationAddress.get("IsMultiUnit") ? cpLocationAddress.get("IsMultiUnit").getValue() : "";
			var censusAddrType = cpLocationAddress.get("AddrType") ? cpLocationAddress.get("AddrType").getValue() : "";
			var censusState = cpLocationAddress.get("STATE") ? cpLocationAddress.get("STATE").getValue() : "";
			
			var ssAddrType = pega.u.d.getProperty("pyWorkPage.HouseholdRoster.ProxyAddress.SSAddressType");
			if(ssAddrType === undefined){
				ssAddrType = "";
			}
			var prAddrType = pega.u.d.getProperty("pyWorkPage.HouseholdRoster.ProxyAddress.PRAddressType");
			if(prAddrType === undefined){
				prAddrType = "";
			}
      
			if(isMU == "true" && ((censusState != "Puerto Rico" && ssAddrType == censusAddrType) || (censusState == "Puerto Rico" && prAddrType == censusAddrType))){
				cpProxyAddress.adoptJSON(cpLocationAddress.getJSON());
				var poBox = cpProxyAddress.get("POBox") ? cpProxyAddress.get("POBox").getValue() : "";
				var urb = cpProxyAddress.get("LOCURB") ? cpProxyAddress.get("LOCURB").getValue() : "";
				var aprtComp = cpProxyAddress.get("LOCAPTCOMPLEX") ? cpProxyAddress.get("LOCAPTCOMPLEX").getValue() : "";
				var areaname1 = cpProxyAddress.get("LOCAREANM1") ? cpProxyAddress.get("LOCAREANM1").getValue() : "";
				var areaname2 = cpProxyAddress.get("LOCAREANM2") ? cpProxyAddress.get("LOCAREANM2").getValue() : "";
				var addressNum = cpProxyAddress.get("LOCHN1") ? cpProxyAddress.get("LOCHN1").getValue() : "";
				var streetName = cpProxyAddress.get("StreetName") ? cpProxyAddress.get("StreetName").getValue() : "";
				var rrDesc = cpProxyAddress.get("RRDescriptor") ? cpProxyAddress.get("RRDescriptor").getValue() : "";
				var rrNum = cpProxyAddress.get("RRNumber") ? cpProxyAddress.get("RRNumber").getValue() : "";
				var rrBoxIDNum = cpProxyAddress.get("RRBoxIDNumber") ? cpProxyAddress.get("RRBoxIDNumber").getValue() : "";
				var buildingDesc = cpProxyAddress.get("BuildingDescriptor") ? cpProxyAddress.get("BuildingDescriptor").getValue() : "";
				var buildingID = cpProxyAddress.get("LOCBLDGID") ? cpProxyAddress.get("LOCBLDGID").getValue() : "";
				var unitNum = cpProxyAddress.get("LOCWSID1") ? cpProxyAddress.get("LOCWSID1").getValue() : "";
				var kmhm = cpProxyAddress.get("KMHM") ? cpProxyAddress.get("KMHM").getValue() : "";
				var muni = cpProxyAddress.get("Municipio") ? cpProxyAddress.get("Municipio").getValue() : "";
				var city = cpProxyAddress.get("CITY") ? cpProxyAddress.get("CITY").getValue() : "";
				var state = cpProxyAddress.get("STATE") ? cpProxyAddress.get("STATE").getValue() : "";
				var zip = cpProxyAddress.get("LOCZIP") ? cpProxyAddress.get("LOCZIP").getValue() : "";
				var desc = cpProxyAddress.get("LOCDESC") ? cpProxyAddress.get("LOCDESC").getValue() : "";
				
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.POBox", poBox);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCURB", urb);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCAPTCOMPLEX", aprtComp);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCAREANM1", areaname1);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCAREANM2",areaname2);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCHN", addressNum);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.StreetName", streetName);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.RRDescriptor", rrDesc);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.RRNumber", rrNum);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.RRBoxIDNumber", rrBoxIDNum);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.BuildingDescriptor", buildingDesc);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCBLDGID", buildingID);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCWSID1", unitNum);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.KMHM", kmhm);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.Municipio", muni);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.CITY", city);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.PRSTATE", "Puerto Rico");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.STATE", state);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCZIP", zip);
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCDESC", desc);
				
			}else{
				cpProxyAddress.put("POBox", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.POBox", "");
				cpProxyAddress.put("LOCURB", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCURB", "");
				cpProxyAddress.put("LOCAPTCOMPLEX", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCAPTCOMPLEX", "");
				cpProxyAddress.put("LOCAREANM1", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCAREANM1", "");
				cpProxyAddress.put("LOCAREANM2", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCAREANM2", "");
				cpProxyAddress.put("LOCHN", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCHN", "");
				cpProxyAddress.put("StreetName", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.StreetName", "");
				cpProxyAddress.put("RRDescriptor", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.RRDescriptor", "");
				cpProxyAddress.put("RRNumber", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.RRNumber", "");
				cpProxyAddress.put("RRBoxIDNumber", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.RRBoxIDNumber", "");
				cpProxyAddress.put("BuildingDescriptor", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.BuildingDescriptor", "");
				cpProxyAddress.put("LOCBLDGID", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCBLDGID", "");
				cpProxyAddress.put("LOCWSID1", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCWSID1", "");
				cpProxyAddress.put("KMHM", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.KMHM", "");
				cpProxyAddress.put("Municipio", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.Municipio", "");
				cpProxyAddress.put("CITY", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.CITY", "");
				cpProxyAddress.put("PRSTATE", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.PRSTATE", "");
				cpProxyAddress.put("STATE", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.STATE", "");
				cpProxyAddress.put("LOCZIP", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCZIP", "");
				cpProxyAddress.put("LOCDESC", "");
				pega.u.d.setProperty("pyWorkPage.HouseholdRoster.ProxyAddress.LOCDESC", "");
			}
		}
	}catch(e) {
		console.log("ENUMCB.clearAddressFields ERROR: " + e.message);
	}
};

ENUMCB.setEventAndStatusCodes = function(eventCode, statusCode) {
  var respondentResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  if(respondentResponse) {
    respondentResponse.put("SOLICIT_FINAL_EVENT_CODE", eventCode);
    respondentResponse.put("CASE_STATUS_CODE", statusCode);
  }
};

/*
*	Created by: Aansh/Kyle
*	Date: 3/27
*	Logic: The EventCodeMapping function works on a switch like basis, all local variables are set to false, and correspond to
*	a property in the client cache, and if this property in the client cache if found, we set the local variable to true.
*	All of the comparsions in the else/if's use the local variables 
*/
ENUMCB.EventCodeMapping = function() {
  try {  
    /*local variables for conditional logic*/
    /*iniitalize all to false, set to true when found on clientcache*/
    var hasSex = false;
    var hasAge = false;
    var hasRace = false;
    var noChangeNecessary = false;
    var dangerousAddress = false;
    var isCancelAttempt = false;
    var messageReceived = false;
    var proxyRequiredEvent = false;
    var unableToAttempt = false;
    var noOnDistance = false;
    var attactualIsT = false;
    var isHostileResp = false;
    var dangerousAddressUnable = false;
    var hasRefusalReason = false;
    var isInconvenientTime = false;
    var isEligibleRespNotAvail = false;
    var isBestTimeDKRef = false;
    var isLangaugeBarrier = false;
    var isHearingBarrier = false;
    var isNoCompleteOther = false;
    var isContactMadeUnable = false;
    var doesAppearOccupied = false;
    var isCantDetermine = false;
    var isHandsEnumCompletedForm = false;
    var isUnableToLocate = false;
    var isDoesNotExist = false;
    var isDemolishedBurned = false;
    var isNonresidential = false;
    var isUninhabitable = false;
    var isEmptyMobileSite = false;
    var isAppearsNonresidential = false;
    var isMultiUnit = false;
    var isRestrictedAccess = false;
    var isDuplicate = false;
    var isGroupQuarters = false;
    var isUnableToAttemptOther = false;
    var isPersonalNonContactVacant = false;
    var isNoContact = false;
    var isIntroNo = false;
    var isIntroNoOneHome = false;
    var isRefusal = false;
    var knowAddressAnswered = false;
    var isknowAddressDKRef = false;
    var isOccupancyVacant = false;
    var isOccupancyNotHousingUnit = false;
    var specificUnitStatusDoesNotExist = false;
    var specificUnitStatusDemolished = false;
    var specificUnitStatusNonresidential = false;
    var specificUnitStatusUninhabitable = false;
    var specificUnitStatusEmptyMobileHome = false;
    var specificUnitStatusGroupQuarters = false;
    var specificUnitStatusOther = false;
    var RIContactRespYes = false;
    var isRosterReviewNoChanges = false;
    var isRosterReviewDKRef = false;
    var isHomeAnswered = false;
    var isRelationshipRespAnswered = false;
    var isRelationshipOtherAnswered = false;
    var isMonthAnswered = false;
    var isDayAnswered = false;
    var isYearAnswered = false;
    var isRICountOccupied = false;
    var isWhoNoOrRef = false;
    var isAnyoneDKOrRef = false;
    var isProxyAttemptNo = false;

    /*grab respondent. Grab: DistanceTooFar*/
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
    var rosterReviewNoChanges = questFlags.get("HasRosterChanges");
    rosterReviewNoChanges = rosterReviewNoChanges ? rosterReviewNoChanges.getValue() : "";
    if(rosterReviewNoChanges == "false") {
      isRosterReviewNoChanges = true;
    }
    var distanceTooFar = respondentPage.get("DistanceTooFar");
    distanceTooFar = distanceTooFar ? distanceTooFar.getValue() : "";
    if(distanceTooFar == "0") {
      noOnDistance = true;
    }
    var RIContactResp = respondentPage.get("ReinterviewContactResponseTypeCode");
    RIContactResp = RIContactResp ? RIContactResp.getValue() : "";
    if(RIContactResp == "1") {
      RIContactRespYes = true;
      console.log("RI is true");
    }
    var whoANSW = respondentPage.get("DoesKnowResident");
    whoANSW = whoANSW ? whoANSW.getValue() : "";
    if(whoANSW == "0") {
      isWhoNoOrRef = true;
      console.log("who is No");
    }
    var proxyAttempt = respondentPage.get("ProxyAttempt");
    proxyAttempt = proxyAttempt ? proxyAttempt.getValue() : "";
    if(proxyAttempt == "3") {
      isProxyAttemptNo = true;
      console.log("proxy Attempt is No");
    }
    
    /*grab Respondent.Response, that is where SOLITIC_FINAL_EVENT_CODE will live*/
    /*grab following props: NRFU_INCOMPLETE_CODE,NRFU_ATTEMPT_TYPE_CODE,RESPONSE_LOCATION_CODE, ATTACTUAL, NRFU_UNABLE_CODE, IntroAnswerQuestion*/
    var respondentResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
    var respType = respondentResponse.get("RESP_TYPE_CODE");
    respType = respType ? respType.getValue() : "";
    var homeANSW = respondentResponse.get("H_TENURE_CODE");
    homeANSW = homeANSW ? homeANSW.getValue() : "";
    var RICountANSW = respondentResponse.get("H_NRFU_STATUS_EXIT_CODE");
    RICountANSW = RICountANSW ? RICountANSW.getValue() : "";
    if(RICountANSW == "1") {
      isRICountOccupied = true;
    }
    var noCompleteANSW = respondentResponse.get("NRFU_INCOMPLETE_CODE");
    noCompleteANSW = noCompleteANSW ? noCompleteANSW.getValue() : "";
    if(noCompleteANSW == "1") {
      isEligibleRespNotAvail = true;
    }
    if(noCompleteANSW == "2") {
      isInconvenientTime = true;
    }
    if(noCompleteANSW == "3") {
      isLangaugeBarrier = true;
    }
    if(noCompleteANSW == "4") {
      isHearingBarrier = true;
    }
    if(noCompleteANSW == "5") {
      isRefusal = true;
    }
    if(noCompleteANSW == "6") {
      isHandsEnumCompletedForm = true;
    }
    if(noCompleteANSW == "7") {
      dangerousAddress = true;
    }
    if(noCompleteANSW == "9") {
      isNoCompleteOther = true;
    }
    var attemptTypeANSW = respondentResponse.get("NRFU_ATTEMPT_TYPE_CODE");
    attemptTypeANSW = attemptTypeANSW ? attemptTypeANSW.getValue() : "";
    if(attemptTypeANSW == "CA") {
      isCancelAttempt = true;
    }
    if(attemptTypeANSW == "TC") {
      messageReceived = true;
    }
    var respLocationCode = respondentResponse.get("RESPONSE_LOCATION_CODE");
    respLocationCode = respLocationCode ? respLocationCode.getValue() : "";
    if(respLocationCode == "3") {
      unableToAttempt = true;
    }
    var attactual = respondentResponse.get("ATTACTUAL");
    attactual = attactual ? attactual.getValue() : "";
    if(attactual == "T") {
      attactualIsT = true;
    }
    var unableToAttemptCode = respondentResponse.get("NRFU_UNABLE_CODE");
    unableToAttemptCode = unableToAttemptCode ? unableToAttemptCode.getValue(): "";
    if(unableToAttemptCode == "1") {
      isUnableToLocate = true;
    }
    if(unableToAttemptCode == "2") {
      isDoesNotExist = true;
    }
    if(unableToAttemptCode == "3") {
      isDemolishedBurned = true;
    }
    if(unableToAttemptCode == "4") {
      isNonresidential = true;
    }
    if(unableToAttemptCode == "5") {
      isUninhabitable = true;
    }
    if(unableToAttemptCode == "6") {
      isEmptyMobileSite = true;
    }
    if(unableToAttemptCode == "7") {
      isMultiUnit = true;
    }
    if(unableToAttemptCode == "8") {
      isRestrictedAccess = true;
    }
    if(unableToAttemptCode == "9") {
      dangerousAddressUnable = true;
    }
    if(unableToAttemptCode == "10") {
      isContactMadeUnable = true;
    }
    if(unableToAttemptCode == "11") {
      isGroupQuarters = true;
    }
    if(unableToAttemptCode == "12") {
      isDuplicate = true;
    }
    if(unableToAttemptCode == "13") {
      isUnableToAttemptOther = true;
    }
    var personalNonContactANSW = respondentResponse.get("PERSONAL_NON_CONTACT_CODE");
    personalNonContactANSW = personalNonContactANSW ? personalNonContactANSW.getValue() : "";
    if(personalNonContactANSW == "3") {
      doesAppearOccupied = true;
    }
    if(personalNonContactANSW == "4") {
      isCantDetermine = true;
    }
    if(personalNonContactANSW == "2") {
      isAppearsNonresidential = true;
    }
    if(personalNonContactANSW == "1") {
      isPersonalNonContactVacant = true;
    }
    var introANSW = respondentResponse.get("IntroQuestionAnswer");
    introANSW = introANSW ? introANSW.getValue() : "";
    if(introANSW == "NoContact") {
      isNoContact = true;
    }
    if(introANSW == "No") {
      isIntroNo = true;
    }
    if(introANSW == "13"){
      isIntroNoOneHome = true;
    }
    var knowAddress = respondentResponse.get("NRFU_RESP_KNOW_ADR_CODE");
    knowAddress = knowAddress ? knowAddress.getValue() : "";
    /*If Know Address == yes or no*/
    if((knowAddress == "1") || (knowAddress == "2")) {
       knowAddressAnswered = true;
    }
    var occupancy = respondentResponse.get("NRFU_OCCUPANCY_CODE");
    occupancy = occupancy ? occupancy.getValue() : "";
    if(occupancy == "1") {
       console.log("occupancyVacant is true");
       isOccupancyVacant = true;
    }
    if(occupancy == "2") {
       isOccupancyNotHousingUnit = true;
    }
    /* Specific Unit Status Variables */
    var specificUnitStatusANSW = respondentResponse.get("NOT_HOUSING_UNIT_STATUS_CODE");
    specificUnitStatusANSW = specificUnitStatusANSW ? specificUnitStatusANSW.getValue() : "";
    if(specificUnitStatusANSW == "1") {
      specificUnitStatusDoesNotExist = true;
    }
    if(specificUnitStatusANSW == "2") {
      specificUnitStatusDemolished= true;
    }
    if(specificUnitStatusANSW == "3") {
      specificUnitStatusNonresidential = true;
    }
    if(specificUnitStatusANSW == "4") {
      specificUnitStatusUninhabitable = true;
    }
    if(specificUnitStatusANSW == "5") {
      specificUnitStatusEmptyMobileHome = true;
    }
    if(specificUnitStatusANSW == "6") {
      specificUnitStatusGroupQuarters = true;
    }
    if(specificUnitStatusANSW == "7") {
      specificUnitStatusOther = true;
    }
 
    /*Grab DK/Ref properties from Respondent*/
    var respondentDKRef = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
    if(respondentDKRef) {
      var bestTimeDKRef = respondentDKRef.get("BestTime");
      bestTimeDKRef = bestTimeDKRef ? bestTimeDKRef.getValue() : "";
      if(bestTimeDKRef != "") {
        isBestTimeDKRef = true;
      }
      var rosterReviewDKRef = respondentDKRef.get("RosterReview");
      rosterReviewDKRef = rosterReviewDKRef ? rosterReviewDKRef.getValue() : "";
      if(rosterReviewDKRef != "") {
        isRosterReviewDKRef = true;
      }
      var knowAddressDKRef = respondentDKRef.get("KnowAddress");
      knowAddressDKRef = knowAddressDKRef ? knowAddressDKRef.getValue() : "";
      if(knowAddressDKRef != "") {
        isknowAddressDKRef = true;
      }
      var whoDKReF = respondentDKRef.get("Who");
      whoDKReF = whoDKReF ? whoDKReF.getValue() : "";
      if(whoDKReF == "R") {
        isWhoNoOrRef = true;
      }
      var anyoneDKRef = respondentDKRef.get("Anyone");
      anyoneDKRef = anyoneDKRef ? anyoneDKRef.getValue() : "";
      if(anyoneDKRef != "") {
        isAnyoneDKOrRef = true;
      }
      var homeDKRef = respondentDKRef.get("Home");
      homeDKRef = homeDKRef ? homeDKRef.getValue() : "";
      var relationshipRespDKRef = respondentDKRef.get("RelationshipResp");
      relationshipRespDKRef = relationshipRespDKRef ? relationshipRespDKRef.getValue() : "";
      var relationshipOtherDKRef = respondentDKRef.get("RelationshipOther");
      relationshipOtherDKRef = relationshipOtherDKRef ? relationshipOtherDKRef.getValue() : "";
      var ageDKRef = respondentDKRef.get("Age");
      ageDKRef = ageDKRef ? ageDKRef.getValue() : "";
      var sexDKRef = respondentDKRef.get("Sex");
      sexDKRef = sexDKRef ? sexDKRef.getValue() : "";
      var raceDKRef = respondentDKRef.get("Race");
      raceDKRef = raceDKRef ? raceDKRef.getValue() : "";
      var monthDOBDKRef = respondentDKRef.get("DOBMonth");
      monthDOBDKRef = monthDOBDKRef ? monthDOBDKRef.getValue() : "";
      var dayDOBDKRef = respondentDKRef.get("DOBDay");
      dayDOBDKRef = dayDOBDKRef ? dayDOBDKRef.getValue() : "";
      var yearDOBDKRef = respondentDKRef.get("DOBYear");
      yearDOBDKRef = yearDOBDKRef ? yearDOBDKRef.getValue() : "";
      var RICountDKRef = respondentDKRef.get("CountRIUnitStatus");
      RICountDKRef = RICountDKRef ? RICountDKRef.getValue() : "";
      var RIContactRespDKRef = respondentDKRef.get("ContactResp");
      RIContactRespDKRef = RIContactRespDKRef ? RIContactRespDKRef.getValue() : "";
    }	

    /*Iterate through householdmember to grab response props: SexMaleFemale, P_AGE_INT */
    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    if(householdMember) {   
      var householdMemberList = householdMember.iterator();
      while(householdMemberList.hasNext()) {
        var currentPage = householdMemberList.next();
        /*grab sex property*/
        var sexANSW = currentPage.get("SexMaleFemale");
        sexANSW = sexANSW ? sexANSW.getValue() : "";
        if(sexANSW != "") {
          hasSex = true;
        }
        var responsePage = currentPage.get("Response");
        if(responsePage) {
          var ageANSW = responsePage.get("P_AGE_INT");
          ageANSW = ageANSW ? ageANSW.getValue() : "";
          if(ageANSW != "") {
            hasAge = true;
          }
          var relationshipRespANSW = responsePage.get("P_REL_CODE");
          relationshipRespANSW = relationshipRespANSW ? relationshipRespANSW.getValue() : "";
          var relationshipOtherANSW = responsePage.get("RelationshipOther");
          relationshipOtherANSW = relationshipOtherANSW ? relationshipOtherANSW.getValue() : "";
          var monthANSW = responsePage.get("P_BIRTH_MONTH_INT");
          monthANSW = monthANSW ? monthANSW.getValue() : "";
          var dayANSW = responsePage.get("P_BIRTH_DAY_INT");
          dayANSW = dayANSW ? dayANSW.getValue() : "";
          var yearANSW = responsePage.get("P_BIRTH_YEAR_INT");
          yearANSW = yearANSW ? yearANSW.getValue() : "";
          /*grab no change necessary property*/
          var softEditVLDN = responsePage.get("SoftEditVLDN");
          if(softEditVLDN) {
            var reviewNoChangesNecessary = softEditVLDN.get("ReviewNoChanges");
            reviewNoChangesNecessary = reviewNoChangesNecessary ? reviewNoChangesNecessary.getValue() : "";
            if(reviewNoChangesNecessary == "true") {
              noChangeNecessary = true;
            }
          }
          else {
            console.log("soft edit page does not exist");
          }
        }
        else {
          console.log("no response page");
        }
      }
    }

    /*Grabbing Values From QuestFlags: HasRaceEverBeenAnswered, ProxyRequired, HasRefusalReason*/
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var raceANSW = questFlags.get("HasRaceEverBeenAnswered");
    raceANSW = raceANSW ? raceANSW.getValue() : "";
    if(raceANSW != "") {
      hasRace = true;
    }
    var proxyRequired = questFlags.get("ProxyRequired");
    proxyRequired = proxyRequired ? proxyRequired.getValue() : "";
    if(proxyRequired == "true") {
      proxyRequiredEvent = true;
    }
    var doesHaveRefusalReason = questFlags.get("HasRefusalReason");
    doesHaveRefusalReason = doesHaveRefusalReason ? doesHaveRefusalReason.getValue() : "";
    if(doesHaveRefusalReason == "true") {
      hasRefusalReason = true;
    }

    /*Find Refusal Reason Page*/
    var refusalReasonPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.RefusalReason"); 
    if(refusalReasonPage) {
      var hostileResp = refusalReasonPage.get("HostileResp");
      hostileResp = hostileResp ? hostileResp.getValue() : "";
      if(hostileResp == "true") {
        isHostileResp = true;
      }
      /*
		var dangerousSituation = refusalReasonPage.get("DangerousSituation");
		dangerousSituation = dangerousSituation ? dangerousSituation.getValue() : "";
		if(dangerousSituation == "true") {
			isDangerousSituation = true;
		} */
    }
    
    /* Set local properties to use in event code mapping */
    if(homeANSW != "" || homeDKRef != "") {
      isHomeAnswered = true;
    }
    if(relationshipRespANSW != "" || relationshipRespDKRef != "") {
      isRelationshipRespAnswered = true;
    }
    if(relationshipOtherANSW != "" || relationshipOtherDKRef != "") {
      isRelationshipOtherAnswered = true;
    }
    if(monthANSW != "" || monthDOBDKRef != "") {
      isMonthAnswered = true;
    }
    if(dayANSW != "" || dayDOBDKRef != "") {
      isDayAnswered = true;
    }
    if(yearANSW != "" || yearDOBDKRef != "") {
      isYearAnswered = true;
    }
    
    var noCompleteANSW = respondentResponse.get("NRFU_INCOMPLETE_CODE");
    noCompleteANSW = noCompleteANSW ? noCompleteANSW.getValue() : "";
    
    /*Begin generating event codes*/
    
    /*RespType = Household*/
    if(respType == "" || respType == "HH"){
      console.log("HOUSEHOLD");
    /*Event code 1.010*/
      if(noChangeNecessary == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.010");
        respondentResponse.put("CASE_STATUS_CODE","C");
		ENUMCB.AddContactHistory(1.010,"Complete");
      }
      /*Event code 1.050*/
      else if( (hasSex == true || sexDKRef == true)	    || 
               (hasAge == true || ageDKRef == true) 	||
               (hasRace == true || raceDKRef == true)
             ){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.050");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(1.050,"Partial sufficient ");
      }
      /*Event code 3.020*/
      else if((proxyRequiredEvent == true && unableToAttempt == true) || noOnDistance == true || isCancelAttempt == true|| messageReceived == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.020");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
       /*Event code 4.011*/
      else if((hasSex == false && hasAge == false && hasRace == false) && attactualIsT == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.011");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
      /*Event code 4.031*/
      /*breaking for readability*/
      else if((hasSex == false && hasAge == false && hasRace == false) && dangerousAddress == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.031");
        respondentResponse.put("CASE_STATUS_CODE","Dangerous Situation");
		ENUMCB.AddContactHistory(4.031,"Dangerous address");
      }
      else if((hasSex == false && hasAge == false && hasRace == false) && isHostileResp == true ) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.031");
        respondentResponse.put("CASE_STATUS_CODE","Dangerous Situation");
		ENUMCB.AddContactHistory(4.031,"Dangerous address");
      }
      else if((hasSex == false && hasAge == false && hasRace == false) && dangerousAddressUnable == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.031");
        respondentResponse.put("CASE_STATUS_CODE","Dangerous Situation");
		ENUMCB.AddContactHistory(4.031,"Dangerous address");
      }
      /*Event code 3.001*/
      else if((hasSex == false && hasAge == false && hasRace == false) && hasRefusalReason == true && isHostileResp == false) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.001");
        respondentResponse.put("CASE_STATUS_CODE","Refusal");
		ENUMCB.AddContactHistory(3.001,"Refusal");
      }
      else if((isInconvenientTime == true || isEligibleRespNotAvail == true) && (hasSex == false && hasAge == false && hasRace == false) && isBestTimeDKRef == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.001");
        respondentResponse.put("CASE_STATUS_CODE","Refusal");
		ENUMCB.AddContactHistory(3.001,"Refusal");
      }
      /*Set event code to 3.062*/
      else if((hasSex == false && hasAge == false && hasRace == false) && isLangaugeBarrier == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.062");
        respondentResponse.put("CASE_STATUS_CODE","Language or Hearing Barrier");
		ENUMCB.AddContactHistory(3.062,"Language barrier");
      }
      /*Set event code to 3.063*/
      else if((hasSex == false && hasAge == false && hasRace == false) && isHearingBarrier == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.063");
        respondentResponse.put("CASE_STATUS_CODE","Language or Hearing Barrier");
		ENUMCB.AddContactHistory(3.063,"Hearing barrier");
      }
      /*Set event code to 3.050*/
      else if((hasSex == false && hasAge == false && hasRace == false) && isNoCompleteOther == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.050");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(3.050,"Other eligible");
      }
      /*Set event code to 3.021*/
      else if((isInconvenientTime == true || isEligibleRespNotAvail == true) && (hasSex == false && hasAge == false && hasRace == false) && isBestTimeDKRef == false) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.021");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(3.021,"No one at home");
      }
      else if(isContactMadeUnable == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.021");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(3.021,"No one at home");
      }
      else if(doesAppearOccupied == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.021");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(3.021,"No one at home");
      }
      else if(isCantDetermine == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.021");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(3.021,"No one at home");
      }
      else if(isIntroNoOneHome == true) {
        console.log("no one home set");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.021");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(3.021,"No one at home");
      }
      /*Set event code to 1.030*/
      else if (isHandsEnumCompletedForm == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.030");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(1.030,"Form provided to enumerator");
      }
      /*Set event code to 4.032*/
      else if(isUnableToLocate == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.032");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(4.032,"Unable to locate");
      }
      /*Set event code to 5.062*/
      else if(isDoesNotExist == true || isDemolishedBurned == true || isNonresidential == true || isUninhabitable == true || isEmptyMobileSite == true || isAppearsNonresidential == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.062");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(5.062,"Delete -- needs verification");
      }
      /*Set event code to 5.051*/
      else if(isMultiUnit == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.051");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.051,"Multi-unit, missing unit designation");
      }
      /*Set event code to 4.030*/
      else if(isRestrictedAccess == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.030");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(4.030,"Restricted access");
      }
      /*Set event code to 5.080*/
      else if(isDuplicate == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.080");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.080,"Duplicate listing");
      }
      /*Set event code to 5.043*/
      else if(isGroupQuarters == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.043");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.043,"Group quarters");
      }
      /*Set event code to 4.090*/
      else if(isUnableToAttemptOther == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.090");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(4.090,"Other unknown eligibility");
      }
      /*Set event code to 5.047*/
      else if(isPersonalNonContactVacant == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.047");
        respondentResponse.put("CASE_STATUS_CODE","Attempted");
		ENUMCB.AddContactHistory(5.047,"Vacant -- needs verification");
      }
      /*Set event code to 1.040 in the else*/
      else {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.040");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
    }
    
    /*RespType = Proxy*/
    else if(respType == "proxy"){
      console.log("PROXY");
      /*Event code 1.021*/
      if(noChangeNecessary == true) {
        console.log("1.021");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.021");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(1.021,"Complete by proxy");
      }
      /*Event code 1.051*/
      else if((hasSex == true) || (hasAge == true) || (hasRace == true)) {
        console.log("1.051");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.051");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(1.051,"Partial sufficient by proxy");
      }

      /*Event code 3.022*/
      else if((hasSex == false && hasAge == false && hasRace == false) && (isNoContact == true || isInconvenientTime == true || isEligibleRespNotAvail == true)) {
        console.log("3.022");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.022");
		ENUMCB.AddContactHistory(3.022,"Proxy not at home -- can recontact");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
      /*Event code 3.020*/
      else if((proxyRequiredEvent == true && unableToAttempt == true) || noOnDistance == true || isCancelAttempt == true|| messageReceived == true) {
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.020");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
      /*Event code 4.012*/
      else if(((hasSex == false && hasAge == false && hasRace == false) &&
              ((isIntroNo == true)         ||
               (unableToAttempt != "")      ||
               (dangerousAddress == true)   || 
               (isLangaugeBarrier == true)  || 
               (isHearingBarrier == true)   ||
               (isNoCompleteOther == true)  ||
               (isRefusal == true)))        ||
               (isWhoNoOrRef == true || isAnyoneDKOrRef == true)){
        console.log("4.012");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.012");
		ENUMCB.AddContactHistory(4.012,"Proxy cannot provide information -- do not attempt proxy again");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
      /*Event code 3.020*/
      else if((hasSex == false && hasAge == false && hasRace == false) && ((knowAddressAnswered == true) || (knowAddressDKRef == true))){
        console.log("3.020");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.020");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }

      /*Event code 4.011*/
      else if((attactualIsT == true) && ((hasSex == false && hasAge == false && hasRace == false) || (noChangeNecessary == false))){
        console.log("4.011");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","4.011");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
     
      /*Event code 5.048*/
      else if((isOccupancyVacant == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.048");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.048,"Vacant by Proxy");
      }
      /*Event code 5.081*/
      else if((specificUnitStatusDoesNotExist == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.081");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.081,"Does not exist");
      }
      /*Event code 5.082*/
      else if((specificUnitStatusDemolished == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.082");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.082,"Demolished");
      }
      /*Event code 5.040*/
      else if((specificUnitStatusNonresidential == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.040");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.040,"Nonresidence");
      }
      /*Event code 5.084*/
      else if((specificUnitStatusUninhabitable == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.084");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.084,"Uninhabitable");
      }
      /*Event code 5.085*/
      else if((specificUnitStatusEmptyMobileHome == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.085");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.085,"Empty mobile home site");
      }
      /*Event code 5.043*/
      else if((specificUnitStatusGroupQuarters == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.043");
        respondentResponse.put("CASE_STATUS_CODE","Complete");
		ENUMCB.AddContactHistory(5.043,"Group quarters");
      }
      /*Event code 5.090*/
      else if((specificUnitStatusOther == true) && (hasSex == false && hasAge == false && hasRace == false)){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","5.090");
        respondentResponse.put("CASE_STATUS_CODE","C");
		ENUMCB.AddContactHistory(5.090,"Other not eligible");
      }
      /*Event code 1.041*/
      else {
        console.log("ELSE - 1.041");
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","1.041");
        var previousStatusCode = respondentResponse.get("CASE_STATUS_CODE");
    	previousStatusCode = previousStatusCode ? previousStatusCode.getValue() : "";
        respondentResponse.put("CASE_STATUS_CODE", previousStatusCode);
      }
    }
    /*Event code 3.020 when RESP_TYPE != HH or Proxy*/
    else if(isProxyAttemptNo == true){
        respondentResponse.put("SOLICIT_FINAL_EVENT_CODE","3.020");
    }
    
    var eventCode = respondentResponse.get("SOLICIT_FINAL_EVENT_CODE") ? respondentResponse.get("SOLICIT_FINAL_EVENT_CODE").getValue() : "";
    console.log("Event code: " + eventCode);
    
  }
  catch(e) {
    alert("EVENT CODE MAPPING ERROR: " + e.message);
  }
};

ENUMCB.MUCodeMapping = function() {
  /** Getting necessary properties **/
  var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var attemptType = response.get("NRFU_ATTEMPT_TYPE_CODE") ? response.get("NRFU_ATTEMPT_TYPE_CODE").getValue() : "";
  var intro = response.get("IntroQuestionAnswer") ? response.get("IntroQuestionAnswer").getValue() :"";
  var refusalReason = pega.ui.ClientCache.find("pyWorkPage.Respondent.RefusalReason");
  var isHostileResp = refusalReason.get("HostileResp") ? refusalReason.get("HostileResp").getValue() : "";
  var statusCode = response.get("CASE_STATUS_CODE") ? response.get("CASE_STATUS_CODE").getValue() :"";
  var unableToAttempt = response.get("NRFU_UNABLE_MU_CODE") ? response.get("NRFU_UNABLE_MU_CODE").getValue() : "";
  
  var dkRef = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  var bestTimeDKRef = dkRef.get("BestTime") ? dkRef.get("BestTime").getValue() : "";
  var noComplete = response.get("NRFU_INCOMPLETE_CODE") ? response.get("NRFU_INCOMPLETE_CODE").getValue() : "";
  
  /** Event code 1.021 **/
  var multiUnitListObj = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.MultiUnitList");
  var multiUnitList = multiUnitListObj.iterator();
  var blankUnits = 0;
  while(multiUnitList.hasNext()) {
    var currPage = multiUnitList.next();
    var anyoneMU = currPage.get("UnitStatusDesc") ? currPage.get("UnitStatusDesc").getValue() :"";
    if(anyoneMU == "") blankUnits++;
  }
  
  if(blankUnits == 0) ENUMCB.setEventAndStatusCodes("1.021", "Complete");
  
  /** Event code 3.020 **/
  else if(attemptType == "CA" || intro == "No") ENUMCB.setEventAndStatusCodes("3.020", statusCode);    
  
  /** Event code 4.014 **/
  else if(unableToAttempt == "1") ENUMCB.setEventAndStatusCodes("4.014", "Attempted");
  else if((noComplete == "2" || unableToAttempt == "1") && bestTimeDKRef == "" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("4.014", "Attempted");
  
  /** Event code 4.013 **/
  else if(unableToAttempt == "2") ENUMCB.setEventAndStatusCodes("4.013", "Attempted");
  else if(noComplete == "14" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("4.013", "Attempted");
  
  /** Event code 4.011 **/
  else if(attemptType == "TA" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("4.011", statusCode);
  
  /** Event code 3.021 **/
  else if(intro == "NoAnswer") ENUMCB.setEventAndStatusCodes("3.021", "Attempted");
  
  /** Event code 3.062 **/
  else if(noComplete == "3" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("3.062", "Language or Hearing Barrier");
  
  /** Event code 3.063 **/
  else if(noComplete == "4" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("3.063", "Language or Hearing Barrier");
  
  /** Event code 3.001 **/
  else if((noComplete == "2" || noComplete == "13") && bestTimeDKRef == "" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("3.001", "Refusal");
  else if(isHostileResp != "true" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("3.001", "Refusal");
  
  /** Event code 4.031 **/
  else if(isHostileResp == "true" && blankUnits > 0) ENUMCB.setEventAndStatusCodes("4.031", "Dangerous Situation");
  
  /** Event code 3.050 **/
  else if(noComplete == "9") ENUMCB.setEventAndStatusCodes("3.050", "Attempted");
  
  /** Event code 1.041 **/
  else ENUMCB.setEventAndStatusCodes("1.041", statusCode);
};

/*
*	A function to setFullName
*	Created by: Ebenezer Owoeye
*/
ENUMCB.setFullName = function(firstName,middleName,lastName){
    var namefound = false;
    var fullName = "";
	if (firstName != "") {
      var fullName = firstName.trim() + " ";
      namefound = true;
    }
    if (middleName != "") {
      var fullName = fullName + middleName.trim() + " ";
      namefound = true;
    }
    if (lastName != "") {
      var fullName = fullName + lastName.trim() + " ";
      namefound = true;
    }
    
    if(namefound)
    {
        var fullName = fullName.substring(0, fullName.length - 1);
        fullName = fullName.toUpperCase();        
    }
    
  return fullName;
};


/*
*	This function to set the respondent FullName by calling setFullName
*	Created by: Ebenezer Owoeye
*/
ENUMCB.setRespondentFullName = function(){
try {
  var respondentpage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  var responsepage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var firstName = responsepage.get("P_FIRST_NAME");
  firstName = firstName ? firstName.getValue() : "";
  var middleName = responsepage.get("P_MIDDLE_NAME");
  middleName = middleName ? middleName.getValue() : "";
  var lastName = responsepage.get("P_LAST_NAME");
  lastName = lastName ? lastName.getValue() : "";
    /* check for all combinations of name */

  var fullName = ENUMCB.setFullName(firstName,middleName,lastName);
  respondentpage.put("FullName", fullname);
    }
  catch (e) {
    alert("ENUMCB Error - ENUMCB.setRespondentFullName:" + e.message);
  }
};


/*
* OnClick function for Anyone MU Buttons - sets answer chosen & refreshes UI buttons & radio options
* @param action: Action button that was selected
* @param unitID: ID for Unit that was chosen to get index in pagelist
* 
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_OnClick(action, unitID) {
  try {      
    var index = CB.indexInPageList("ReportingUnitID",unitID,"pyWorkPage.QuestFlags.MultiUnitList");
      
	/* Store selected answer & reset AnswDetail */  
	var unit = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.MultiUnitList").get(index);
	
	var oldSelection = unit.get("UnitStatusDesc");
    oldSelection = oldSelection ? oldSelection.getValue() : "";
    
	/* Refresh Buttons & Clear Radio buttons only if we selected a new answer */
    if(oldSelection != action) {
      unit.put("UnitStatusDesc",action);   
	  unit.put("UnitStatusReasonDesc","");
	  
      /* Refresh button bar for unit */
      EnumCB_AnyoneMU_RefreshButtons(action,index); 
	
	  /* Clear radio buttons selected */
      var $radioButtons = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .radioTable');
      $radioButtons.find('input').attr('checked',false);
    }    
	
	/* Refresh radio buttons visibility */
	EnumCB_AnyoneMU_RefreshRadioButtons(action,index);
    
  }
  catch(e) {
    alert(e.message);
  }
}

/* 
* Refresh Button bar for AnyoneMU Screen
* @param selected: button that was selected
* @index: index of unit in pagelist
*
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_RefreshButtons(selected,index) {

  /* Toggle selected buttons with default buttons */
  var $selectedBtns =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .Enum_Anyone_MU_Green_Button');
  $selectedBtns.removeClass('Enum_Anyone_MU_Green_Button prepend-check');
  $selectedBtns.addClass('Enum_Anyone_MU_Button');
   
 
  /* Toggle button that was selected to be Green Button */
  var $selectedBtn = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .button-' + selected + ' [type=button]');   
  $selectedBtn.removeClass('Enum_Anyone_MU_Button');
  $selectedBtn.addClass('Enum_Anyone_MU_Green_Button');

  /* If Occupied was selected, change button to have checkmark */    
  if(selected=="occupied") {
    $selectedBtn.addClass('prepend-check');
  }
  
  /* Show 'Clear' button */
  var clearBtn =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .button-clear');
  clearBtn.css("display","inline-block");    
}


/* 
* Hide all radio buttons that are showing for unit with param index 
* @param index: index of unit in pagelist to target divs
* 
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_RefreshRadioButtons(selected,index) {
  var $vacantLayout = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .vacant-radio-show');
  var $otherLayout =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .other-radio-show');
        	   
  if(selected == "vacant") {
    /* Hide 'Other' Radio buttons */
    $otherLayout.removeClass('other-radio-show');
    $otherLayout.addClass('other-radio-hide');
	
	/* Show Vacant Radio buttons */
	var $vacantRadio = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .vacant-radio-hide');
    $vacantRadio.removeClass('vacant-radio-hide');
    $vacantRadio.addClass('vacant-radio-show');    
  }
  else if(selected == "other") {
    /* Hide 'Vacant' radio buttons */
    $vacantLayout.removeClass('vacant-radio-show');
    $vacantLayout.addClass('vacant-radio-hide');
	
	var $otherRadio =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .other-radio-hide');
    $otherRadio.removeClass('other-radio-hide');
    $otherRadio.addClass('other-radio-show');  	
  }
  
  /* Otherwise, hide all radio buttons*/  
  else {
    $otherLayout.removeClass('other-radio-show');
    $otherLayout.addClass('other-radio-hide');
	
	$vacantLayout.removeClass('vacant-radio-show');
    $vacantLayout.addClass('vacant-radio-hide');
  }
}

/* 
* Function called by 'Clear' Button to hide all radio & selected buttons 
* @param unitID: Unit ID to clear UI to default.
*
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_ClearAll(unitID) {
  var index = CB.indexInPageList("ReportingUnitID",unitID,"pyWorkPage.QuestFlags.MultiUnitList");
   
  /* Reset Green Selected buttons to be default buttons */
  var $buttons =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .Enum_Anyone_MU_Green_Button');
  $buttons.removeClass('Enum_Anyone_MU_Green_Button prepend-check');
  $buttons.addClass('Enum_Anyone_MU_Button');
     
  /* Hide Clear button */
  var clearBtn =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .button-clear');
  clearBtn.css("display","none");
  
  /* Clear answer properties for unitID */
  var unitPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.MultiUnitList").get(index);
  
  unitPage.put("UnitStatusDesc","");	
  unitPage.put("UnitStatusReasonDesc","");
  
  /* Clear radio buttons selected */
  var $radioButtons = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .radioTable');
  $radioButtons.find('input').attr('checked',false);
  
  /* Hide radio buttons */
  EnumCB_AnyoneMU_RefreshRadioButtons("clear",index);    
}


/* 
* Add check icon to button of @param cellClass for @param unitID in MultiUnitList
* @param cellClass: class to target button in selector
* @unitID: unitID of Unit in MultiUnitList to get index 
*
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_AddCheckIcon(cellClass,unitID) {
  var index = CB.indexInPageList("ReportingUnitID",unitID,"pyWorkPage.QuestFlags.MultiUnitList");

  var $selectedBtn = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .' + cellClass + ' [type=button]');
  $selectedBtn.addClass('prepend-check');
}


/*
* Clear Radio selection for Anyone MU Question
* @param cellClass: class used to target button in selector
* @param unitID: ID used to get index of Unit in MultiUnitList
*
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_ClearRadioSelection(cellClass,unitID) {
  var index = CB.indexInPageList("ReportingUnitID",unitID,"pyWorkPage.QuestFlags.MultiUnitList");
  var unitPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.MultiUnitList").get(index);
  
  /* Clear radio property */
  unitPage.put("UnitStatusReasonDesc","");
  
  /* Clear radio button selected */
  var $vacantLayout = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .vacant-radio-show');
  var $otherLayout =  $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .other-radio-show');
  
  $vacantLayout.find('input').attr('checked',false);
  $otherLayout.find('input').attr('checked',false);
  
  /* Hide check-icon */
  var $selectedBtn = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .' + cellClass + ' [type=button]');
  $selectedBtn.removeClass('prepend-check');
}

/* 
* Hide Radio Buttons when hitting the 'Close' button for Anyone MU Radio Buttons.
* 
* Created by: Jason Wong
*/
function EnumCB_AnyoneMU_CloseRadio(layoutClass,unitID) {
  var index = CB.indexInPageList("ReportingUnitID",unitID,"pyWorkPage.QuestFlags.MultiUnitList");
  $layout = $('div[base_ref="pyWorkPage.QuestFlags.MultiUnitList(' + index + ')"] .' + layoutClass);
  
  if(layoutClass == 'vacant-radio-show') {
    $layout.removeClass(layoutClass);
	$layout.addClass('vacant-radio-hide');
  } 
  else if(layoutClass == 'other-radio-show') {
    $layout.removeClass(layoutClass);
	$layout.addClass('other-radio-hide');
  }
}

ENUMCB.initializeHouseholdMemberTemp = function(caseDetailsSoftEdit) {
  var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  householdMemberTemp.put("DKRefused", {});
  householdMemberTemp.put("Response", {});
  householdMemberTemp.put("TelephoneInfo", {});
  householdMemberTemp.put("NRFUAvailability", {});
  var telephoneInfo = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.TelephoneInfo");
  telephoneInfo.put("TelephoneNumber", []);
  var telephoneNumber = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.TelephoneInfo.TelephoneNumber");
  telephoneNumber.add();
  
  var response = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  response.put("SoftEditVLDN", {});
  
  var softEdits = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  softEdits.put("CaseDetailsFlag", caseDetailsSoftEdit);
};

ENUMCB.initializeRespondent = function(riAttemptType) {
  var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  respondentPage.put("Response", {});
  respondentPage.put("DKRefused", {});
  respondentPage.put("RIAttemptType", riAttemptType);
  respondentPage.put("TelephoneInfo", {});
  respondentPage.put("NRFUAvailability", {});
  var telephoneInfo = pega.ui.ClientCache.find("pyWorkPage.Respondent.TelephoneInfo");
  telephoneInfo.put("TelephoneNumber", []);
  var telephoneNumber = pega.ui.ClientCache.find("pyWorkPage.Respondent.TelephoneInfo.TelephoneNumber");
  telephoneNumber.add();
  
  var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  response.put("SoftEditVLDN", {});
};

ENUMCB.initializeResponse = function(statusCode) {
  var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  responsePage.put("CASE_STATUS_CODE", statusCode);
  responsePage.put("SoftEditVLDN", {});
};

ENUMCB.initializeHouseholdRoster = function() {
  var householdRoster= pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  householdRoster.put("LocationAddress", {});
  householdRoster.put("ProxyAddress", {});
  householdRoster.put("ReferencePerson", {});
  householdRoster.put("NRFUAvailability", {});
};

ENUMCB.initializeWorkPage = function() {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  workPage.put("Respondent", {});
  workPage.put("HouseholdRoster", {});
  workPage.put("HouseholdMemberTemp", {});
  workPage.put("QuestFlags", {});
};
ENUMCB.initializeQuestFlags = function(proxyEligible, proxyRequired, proxyAlert, hideAllFAButtons) {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  questFlags.put("DiscreteDateTime", {});
  questFlags.put("ProxyEligible", proxyEligible);
  questFlags.put("ProxyRequired", proxyRequired);
  questFlags.put("ProxyAlert", proxyAlert);
  questFlags.put("HideAllFAButtons", hideAllFAButtons);
};

/**
Clear the case data for inactive case restart
Omar
**/
ENUMCB.clearDataForCaseRestart = function(statusCode) {
  /** temporarily store the address pages to be put back after initializing everything  **/
  var locationAddressPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress").getJSON();
  var proxyAddressPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress").getJSON();
  
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var proxyEligible = questFlags.get("ProxyEligible") ? questFlags.get("ProxyEligible").getValue() : "";
  var proxyRequired = questFlags.get("ProxyRequired") ? questFlags.get("ProxyRequired").getValue() : "";
  var proxyAlert = questFlags.get("ProxyAlert") ? questFlags.get("ProxyAlert").getValue() : "";
  var hideAllFAButtons = questFlags.get("HideAllFAButtons") ? questFlags.get("HideAllFAButtons").getValue() :"";
  var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  var riAttemptType = respondent.get("RIAttemptType") ? respondent.get("RIAttemptType").getValue() : "";
  
  var softEdits = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  var caseDetailsSoftEdit = softEdits.get("CaseDetailsFlag") ? softEdits.get("CaseDetailsFlag").getValue() : "";
  /** Restart case and initialize everything **/
  ENUMCB.initializeWorkPage();
  ENUMCB.initializeQuestFlags(proxyEligible, proxyRequired, proxyAlert, hideAllFAButtons);
  ENUMCB.initializeHouseholdMemberTemp(caseDetailsSoftEdit);
  ENUMCB.initializeRespondent(riAttemptType); 
  ENUMCB.initializeResponse(statusCode);
  ENUMCB.initializeHouseholdRoster();
 
  pega.offline.runDataTransform("PrimeResponsePage","CB-FW-CensusFW-Work-Quest-Enum",null);
  pega.offline.runDataTransform("SetQuestFlags","CB-FW-CensusFW-Work-Quest-Enum",null);
  pega.offline.runDataTransform("PrimeDKRefusedPage","CB-FW-CensusFW-Work-Quest-Enum",null);
  pega.offline.runDataTransform("SetDisplayBeginInterview", "CB-FW-CensusFW-Work-Quest-Enum", null);
  /** Put the address data back into the client cache **/
  var locationAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.LocationAddress");
  locationAddress.adoptJSON(locationAddressPage);
  var proxyAddress = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ProxyAddress");
  proxyAddress.adoptJSON(proxyAddressPage);
  ENUMCB.SetCaseNotesSize();
  ENUMCB.SetContactHistorySize();
  ENUMCB.SetIsPipeVisible();
  ENUMCB.SetInterviewAttemptSize();
};

/** logic to implement restart of case
Omar
**/ 
ENUMCB.restartCase = function() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var statusCode = "";
  if(respPage) {
    statusCode = respPage.get("CASE_STATUS_CODE") ? respPage.get("CASE_STATUS_CODE").getValue() : "";
  }
  if(statusCode != "") {
    ENUMCB.clearDataForCaseRestart(statusCode);
  }
};

/*
* Function used to add a new contact history entry
* Created by David Bourque
*/

ENUMCB.AddContactHistory = function(eventCode,eventCodeDescription) {
  var workpage = pega.ui.ClientCache.find("pyWorkPage");
  var hhResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var contactAttemptsList = pega.ui.ClientCache.find("pyWorkPage.ContactAttempts");
  if (!contactAttemptsList) {
    contactAttemptsList = workpage.put("ContactAttempts",[]);
  }
  var contactAttempt = contactAttemptsList.add();
  var attemptType = hhResponse.get("ATTACTUAL") ? hhResponse.get("ATTACTUAL").getValue() : "";
  if (attemptType == "PV") {
    contactAttempt.put("AttemptType","Personal Visit");
  } else if (attemptType == "T") {
    contactAttempt.put("AttemptType","Telephone");
  }
  var respType = hhResponse.get("RESP_TYPE_CODE") ? hhResponse.get("RESP_TYPE_CODE").getValue() : "";
  if (respType == "HH") {
    contactAttempt.put("RespType","Household");
  } else if (respType == "proxy") {
    contactAttempt.put("RespType","Proxy");
  }
  var currDateTime = CB.getCurrentPegaDate();
  contactAttempt.put("DateTime",currDateTime);
  contactAttempt.put("EventCode",eventCode);
  contactAttempt.put("EventCodeDescription",eventCodeDescription);
};

/*
* Function to append distinct PhoneNumber/PhoneAssoctiation combinations to TelephoneNumbers pagelist
* newPhoneNumber: PhoneNumber to consider adding to list
* newPhoneAssociation: Association of the newPhoneNumber. "HH"/"proxy" (household/proxy)
* Created by: Mike Hartel
*/
ENUMCB.appendDistinctNumberToTelephoneNumbersList = function (newPhoneNumber, newPhoneAssociation) {
  try {
    var pageList = pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers");
	var existsInPageList = false;
    
    if (pageList) {
      var pageListIterator = pageList.iterator();
      while(pageListIterator.hasNext()) {
        var currentPage = pageListIterator.next();
        var phoneNumber = (currentPage.get("pyLabel")) ? currentPage.get("pyLabel").getValue(): "";
		var phoneAssociation = (currentPage.get("PhoneAssociation")) ? currentPage.get("PhoneAssociation").getValue(): "";
       
        if (phoneNumber == newPhoneNumber && phoneAssociation == newPhoneAssociation) {
          existsInPageList = true;
		  break;
        }
      }
    }
    if(existsInPageList === false){
		var newPhoneNumberPage = pega.ui.ClientCache.createPage("NewPhoneNumber");
		newPhoneNumberPage.put("pyLabel", newPhoneNumber);
		newPhoneNumberPage.put("PhoneAssociation", newPhoneAssociation);
		pageList.add().adoptJSON(newPhoneNumberPage.getJSON());	
	}
  } catch (e) {
    console.log("Error in PageList: " + e.message);
  }
};

/*
* Gets Size of Cantact History Page List and sets appropriate property
* Created by: David Bourque
*/

ENUMCB.SetContactHistorySize = function() {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var contactHistorySize = pega.ui.ClientCache.find("pyWorkPage.ContactAttempts") ? pega.ui.ClientCache.find("pyWorkPage.ContactAttempts").size() : 0;
  questFlags.put("ContactAttemptCount",contactHistorySize);
};

/*
* Gets Size of Case Notes Page List and sets appropriate property
* Created by: David Bourque
*/

ENUMCB.SetCaseNotesSize = function() {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var caseNotesSize = pega.ui.ClientCache.find("pyWorkPage.CaseNotes") ? pega.ui.ClientCache.find("pyWorkPage.CaseNotes").size() : 0;
  questFlags.put("CaseNoteCount",caseNotesSize);
  if(caseNotesSize == 0) {
    questFlags.put("CaseNoteCountZero","true");
  } else {
    questFlags.put("CaseNoteCountZero","false");
  }
  if (CB.isInPageList("DangerFlag","Red","pyWorkPage.CaseNotes")) {
    questFlags.put("IsCaseDetailsDangerVisible",true);
  } else {
    questFlags.put("IsCaseDetailsDangerVisible",false);
  }
};

/*
* Sets the IsPipeVisible property for the case details screen
* Created by David Bourque
*/

ENUMCB.SetIsPipeVisible = function() {
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var respondentResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var proxyRequired = questFlags.get("ProxyRequired") ? questFlags.get("ProxyRequired").getValue() : "";
  var proxyEligible = questFlags.get("ProxyEligible") ? questFlags.get("ProxyEligible").getValue() : "";
  var statusCode = respondentResponse.get("CASE_STATUS_CODE") ? respondentResponse.get("CASE_STATUS_CODE").getValue() : "";
  if (((proxyRequired == "true") || (proxyEligible == "true")) && (statusCode != "")) {
    questFlags.put("IsPipeVisible",true);
  }
  else {
    questFlags.put("IsPipeVisible",false);
  }
};

/*
* Returns true if there is another number in the TelephoneNumbers pagelist where PhoneAssoc == RespType
* Called from DialOutcome_Post
* Created by: Dillon Irish
*/
ENUMCB.OtherMatchingPhoneAssoc = function(isRI) {
	var cpPhoneNumbers = pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers");
	var cpResponse = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
	
	var respType = "";
	if(isRI == "true"){
		respType = cpResponse.get("RESPTYPE_PROD") ? cpResponse.get("RESPTYPE_PROD").getValue() : "";
	}else{
		respType = cpResponse.get("RESP_TYPE_CODE") ? cpResponse.get("RESP_TYPE_CODE").getValue() : "";
	}
	
	var currentIndex = cpQuestFlags.get("CurrentTelephoneIndex") ? cpQuestFlags.get("CurrentTelephoneIndex").getValue() : ""; /*Remove test value*/
	var size = cpPhoneNumbers.size();
	if(size == 1){
		return "false";
	}
	for(count = 1; count <= cpPhoneNumbers.size(); count++){
		var telePage = pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers(" + count +")");
		var phoneAssoc = telePage.get("PhoneAssociation") ? telePage.get("PhoneAssociation").getValue() : "";
		var attempted = telePage.get("Attempted") ? telePage.get("Attempted").getValue() : "";
		if(phoneAssoc == respType && phoneAssoc != "" && count != currentIndex && attempted != "true"){
          	alert("Returning true");
			return "true";
		}
	}
	return "false";
};

/*
* Gets Size of Interview Attempt Page List and sets appropriate property
* Created by: David Bourque
*/

ENUMCB.SetInterviewAttemptSize = function() {
	var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
	var InterviewAttemptSize = pega.ui.ClientCache.find("pyWorkPage.InterviewAttempts") ? pega.ui.ClientCache.find("pyWorkPage.InterviewAttempts").size() : 0;
    questFlags.put("InterviewAttemptCount",InterviewAttemptSize);
};


/*
* Enable Proxy Phone input box” is available on ProxyPhone_INST
* Created by:Ebenezer Owoeye
*/
ENUMCB.UpdateProxyPhoneInputSection = function(propValue) {
  var pyWorkPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  if(propValue == "0") {  
    pyWorkPage.put("IsProxyPhoneValid", "NonValid");

  }	
  else {
    pyWorkPage.put("IsProxyPhoneValid", "Valid");

  }
};

/* 
* GoToCaseList
* Sends user to case list on previous for Case Details
* Created by David Bourque
*/
ENUMCB.GoToCaseList = function() {
  var inactiveTab = pega.ui.ClientCache.createPage("InactiveTab");
  var responsePage = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var statusCode = responsePage.get("CASE_STATUS_CODE") ? responsePage.get("CASE_STATUS_CODE").getValue() : "";
  if (statusCode != "") {
    inactiveTab.put("IsInactive",true);
  } else {
    inactiveTab.put("IsInactive",false);
  }

  pega.ui.busyIndicator.prototype.setVisibility(true);
  pega.ui.busyIndicator.prototype.show();
  pega.desktop.showHarnessWrapper("current", 'Data-Portal', 'CaseList', '', '','', true, '', false, '', '', '', '', '', true, false, false, null);
};

/**
 * Default method of getting the device location. Latitude and Longitude are
 * stored in MobileLat and MobileLon, respectively. If the GPS location cannot
 * be found, the last results are cleared and the NoGPS flag is set.
 * 
 * Author: Taylor Hunter
 */
ENUMCB.findCurrentLocation = function() {
  try {
    window.navigator.geolocation.getCurrentPosition(
      function (position) {
        questFlags.put("MobileLat", position.coords.latitude);
        questFlags.put("MobileLon", position.coords.longitude);
        questFlags.put("NoGPS", "false");
      },
      function (error) {
        console.log(JSON.stringify(error));
        questFlags.put("NoGPS", "true");
        questFlags.remove("MobileLat");
        questFlags.remove("MobileLon");
      },
      {
        maximumAge: 0,
        timeout: 15000,
        enableHighAccuracy: true
      }
    );
  } catch (Ex) {
    console.log(Err.message);
    questFlags.put("NoGPS", "true");
    questFlags.remove("MobileLat");
    questFlags.remove("MobileLon");
  }
};

/*
 *	Created By: Bola Oseni
 *	Purpose: Sync Data Page to use in modal pop display
 */
ENUMCB.setNewCaseAddressModalData = function () {

  /* IF mobile and online.*/
    if (pega.mobile.isHybrid) {
        try {
			/* Not commited yet. Retrieve NewCaseAddress user input from  form and set on page */
          	

          	var newCaseAddressPage = pega.ui.ClientCache.find('pyWorkPage.NewCaseAddress'); 
			var newCaseAddressDP = pega.ui.ClientCache.find('D_NewCaseAddress'); 
          
            if(!newCaseAddressDP)
            {  
                /* Add this to a temporary page */
              	var objJSON = '{"pxObjClass" : "CB-Data-Address-Location"}';
                newCaseAddressDP = pega.ui.ClientCache.createPage("D_NewCaseAddress");
                newCaseAddressDP.adoptJSON(objJSON);
            }
          
          /* Get the entered data */
          var LOCHN = EXPCB.getElementValue("LOCHN");
          newCaseAddressDP.put("LOCHN", LOCHN);
          var StreetName = EXPCB.getElementValue("StreetName");
 
          newCaseAddressDP.put("StreetName", StreetName);
          var CITY = EXPCB.getElementValue("CITY");
 
          newCaseAddressDP.put("CITY", CITY);
          var LOCURB = EXPCB.getElementValue("LOCURB");
 
          newCaseAddressDP.put("LOCURB", LOCURB);
          var LOCAPTCOMPLEX = EXPCB.getElementValue("LOCAPTCOMPLEX");
 
          newCaseAddressDP.put("LOCAPTCOMPLEX", LOCAPTCOMPLEX); 
          var LOCAREANM1 = EXPCB.getElementValue("LOCAREANM1");

          newCaseAddressDP.put("LOCAREANM1", LOCAREANM1);
         
          
alert("setNewCaseAddress: NewCaseAddressDP: " + newCaseAddressDP.getJSON());           

          
        } catch (er) {
            console.log("Error in setNewCaseAddressModalData: " + er.message);
          alert("Error in setNewCaseAddressModalData: " + er.message);
        }
    } else { /*On Desktop.*/  
      
        /*
        var oSafeUrl = new SafeURL("CB-FW-CensusFW-Work-TimeExpense.SetTimeExpenseRejectedReason");
      	oSafeUrl.put("pzInsKey", eleID);
      	pega.util.Connect.asyncRequest('GET', oSafeUrl.toURL(), '');
        */
  }
}

/*
 *	Created By: Bola Oseni
 *	Purpose: Set NewCaseAddressAccepted to true
 */
ENUMCB.SetNewCaseAddressAccepted = function () {
  
  if (pega.mobile.isHybrid) {
        try { 
          	var newCaseAddressPage = pega.ui.ClientCache.find('pyWorkPage.NewCaseAddress'); 
			var newCaseAddressDP = pega.ui.ClientCache.find('D_NewCaseAddress'); 
          
            if(newCaseAddressDP)
            {
              
    alert("Set NewCaseAddressAccepted to true");          
              newCaseAddressDP.put("NewCaseAddressAccepted", "true"); 
            }
          
            /* Set value on pyWorkPage */
            newCaseAddressPage.put("NewCaseAddressAccepted", "true"); 
        
        } catch (er) {
            console.log("Error in SetNewCaseAddressAccepted: " + er.message);
          alert("Error in SetNewCaseAddressAccepted_Unit_Selected: " + er.message);
        }
  }
  
}
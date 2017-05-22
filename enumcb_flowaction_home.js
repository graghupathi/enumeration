/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in HomeNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/** 
*	Pre action for home_qstn to copy respondant into temp
*	Created by: Omar Mohammed, Kyle Gravel
**/
function EnumCB_Home_PRE() {
  try
  {
    ENUMCB.setHouseholdMembersFullName();
    CB.toggleFlag("DKRFEnabled", "true");
    CB.toggleFlag("ExitSurveyEnabled", "true");
    ENUMCB.updateDKRefVisibility("Home");
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var householdRosterIterator = householdRoster.iterator();
    var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var tempSet = false;
    while(householdRosterIterator.hasNext()) {
      /** Set .HouseholdMemberTemp to be the respondent **/
      var currentPage = householdRosterIterator.next();
      if(currentPage)
      {
        var isRespondent = currentPage.get("RespondantFlag");
        if(isRespondent) {
          isRespondent = isRespondent.getValue();
        }
        else  {
          isRespondent = "";
        }
        if(isRespondent == "true") {
          tempSet = true;
          householdMemberTemp.adoptJSON(currentPage.getJSON());
          break;
        }
      }
    }
    if(!tempSet)
    {
        var firstMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember(1)");
        if(firstMember)
        {
            householdMemberTemp.adoptJSON(firstMember.getJSON());
        }
    }
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    if (householdRoster){
      /* get roster size */
      var sizeOfIndex  = householdRoster.size(); 
      questFlagsPage.put("CurrentRosterSize", sizeOfIndex); 
      if (sizeOfIndex > 1) {
        questFlagsPage.put("IsRosterSizeGreaterThanOne", true);
      }
      else {
        questFlagsPage.put("IsRosterSizeGreaterThanOne", false);
      }
    }


    ENUMCB.updateDKRefVisibility("Home");
  }
  catch(Err)
  {
      alert("Error ==> <" + Err.message + ">");
  }
}

/*
*	Post Action for Home_QSTN
*	Created by Omar Mohammed
*/
function EnumCB_Home_POST() {
  try{ 
    if(pega.mobile.isHybrid) {
      var workPage = pega.ui.ClientCache.find("pyWorkPage");
      var referencePersonPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ReferencePerson");
      var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var homeAnswer = responsePage.get("H_TENURE_CODE");
      if(homeAnswer) {
        homeAnswer = homeAnswer.getValue();
      }
      else {
        homeAnswer = "";
      }
      var isDKRefVisible = ENUMCB.getIsDKRefVisible();
      if(isDKRefVisible == "true") {
        ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.H_TENURE_CODE", "pyWorkPage.HouseholdMemberTemp.DKRefused.Home");
      }
      else {
        ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.H_TENURE_CODE");
      }
      if(!workPage.hasMessages()) {
        CB.setMemberInRoster(1, false);
        var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
        var currRosterSize = questFlags.get("CurrentRosterSize").getValue();
        /*Set Reference person flag is 1 person household*/
        if (currRosterSize == 1 || homeAnswer == 4) { 
          var firstMember = CB.getMemberFromRoster(1);
          var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
          householdMemberTemp.put("ReferencePersonFlag", true);
          referencePersonPage.adoptJSON(householdMemberTemp.getJSON());
          CB.setMemberInRoster(1, false); 
          var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
          respondentPage.put("ReferencePersonFlag", true);
        } 
        var dkRef = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");  
        var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
        var dkRefValue = dkRef.get("Home");
        if(dkRefValue) {
          dkRefValue = dkRefValue.getValue();
        }
        else {
          dkRefValue = "";
        }
        var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
        var respProp = respPage.get("RESPONSE_LOCATION_CODE");
        if(respProp) {
          respProp = respProp.getValue();
        }
        else {
          respProp = "";
        }
        if(respProp == "1" && dkRefValue != "") {
          questFlags.put("IsDKAndAddress", "true");
        }
        else if(respProp == "2" && dkRefValue != "") {
          questFlags.put("IsDKAndAddress", "false");
        }
      }
    }

  }
  catch(e) {
    console.log("***ENUMCB Error - " + e.message);
  }
}

/*
*	Created by: Kyle Gravel
*	Used by Owner_QSTN to prime the DK Ref values
*/
function EnumCB_Renter_PRE() {
  ENUMCB.updateDKRefVisibility("Renter");
  CB.toggleFlag("ExitSurveyEnabled","true");

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack").getValue();

  var dkRef = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  var renter = dkRef.get("Renter");
  if(renter) {
    renter = renter.getValue();
  } else {
    renter = "";
  }

  if(isGoingBack == "true" && renter != ""){
    questFlags.put("IsDKRefVisible","true");
  }
}

/*
*	Created by: Kyle Gravel
*	Used by Renter_QSTN. sets values of P_HU_RENTER_IND as well as triggers validations
*/
function EnumCB_Renter_POST() {
  try{    
    var householdRosterPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var referencePersonPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ReferencePerson");
    var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
    var renter = dkRefPage.get("Renter");
    if(renter) {
      renter = renter.getValue();
    }
    else {
      renter = "";
    }
    var isNoOwnerRenterSelected = householdRosterPage.get("IsNoOwnerRenterSelected");
    if(isNoOwnerRenterSelected) {
      isNoOwnerRenterSelected = isNoOwnerRenterSelected.getValue();
    } 
    else {
      isNoOwnerRenterSelected = "";
    }
    var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var householdMemberList = householdMember.iterator();
    var ownerRenterIndex = 0;
    var memberIndex = 0;
    while(householdMemberList.hasNext()) {
      memberIndex = memberIndex + 1;
      var currentPage = householdMemberList.next();
      var renterFlag = currentPage.get("RenterFlag");
      if(renterFlag) {
        renterFlag = renterFlag.getValue();
        var respPage = currentPage.get(".Response");
        if(renterFlag == "true") {
          respPage.put("P_IS_HU_RENTER_IND","1");
          ownerRenterIndex = ownerRenterIndex + 1;
          if(ownerRenterIndex == 1) {
            currentPage.put("ReferencePersonFlag",true);
            referencePersonPage.adoptJSON(currentPage.getJSON());
          }
          else {
            currentPage.put("ReferencePersonFlag",false);
            var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
            var firstMemberIndexForRelOther = questFlags.get("FirstMemberIndexForRelOther");
            if(!firstMemberIndexForRelOther) {
              questFlags.put("FirstMemberIndexForRelOther", memberIndex);
            }
          }
          var respondentFlag = currentPage.get("RespondantFlag");
          if(respondentFlag) {
            respondentFlag = respondentFlag.getValue();
            var referencePersonFlag = currentPage.get("ReferencePersonFlag").getValue();
            if(respondentFlag == "true" && referencePersonFlag == true) {
              respondentPage.put("ReferencePersonFlag",true);
            }
            if(respondentFlag == "false" && referencePersonFlag == true) {
              respondentPage.put("ReferencePersonFlag",false);
            }
          }
        }
        else{
          respPage.put("P_IS_HU_RENTER_IND","0");
          var firstMemberIndexForRelOther = questFlags.get("FirstMemberIndexForRelOther");
          if(!firstMemberIndexForRelOther) {
            questFlags.put("FirstMemberIndexForRelOther", memberIndex);
          }
          currentPage.put("ReferencePersonFlag",false);
        }
      }
    }
    if(isNoOwnerRenterSelected == "true" || renter == "R" || renter == "D") {
      var householdMemberOne = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember(1)");
      householdMemberOne.put("ReferencePersonFlag",true);
      referencePersonPage.adoptJSON(householdMemberOne.getJSON());
      var respNoneAbove = householdMemberOne.get("RespondantFlag");
      if(respNoneAbove) {
        respNoneAbove = respNoneAbove.getValue();
        if(respNoneAbove == "true") {
          respondentPage.put("ReferencePersonFlag", true);
        }
        else {
          respondentPage.put("ReferencePersonFlag", false);
        }
      }

    }
    ENUMCB.validateOwnerRenter(ownerRenterIndex, "Renter");
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.Renter", "pyWorkPage.HouseholdMemberTemp.Response.H_RENTER_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.H_RENTER_REF_IND");
    questFlags.put("IsDKRefVisible","false");
  }
  catch(e) {
    console.log(e.message);
  }
}

/*
*	Created by: Kyle Gravel
*	Used by Owner_QSTN to prime the DK Ref values
*/
function EnumCB_Owner_PRE() {
  
  ENUMCB.updateDKRefVisibility("Owner");
  CB.toggleFlag("ExitSurveyEnabled","true");
  

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var localizedCensusDate = CB.getLocalizedCensusDate();
  questFlags.put("CensusDateString", localizedCensusDate);
  var isGoingBack = questFlags.get("IsGoingBack").getValue();

  var dkRef = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
  var owner = dkRef.get("Owner");
  if(owner) {
    owner = owner.getValue();
  } else {
    owner = "";
  }

  if(isGoingBack == "true" && owner != ""){
    questFlags.put("IsDKRefVisible","true");
  }
}

/*
*	Created by: Kyle Gravel
*	Used by Owner_QSTN to set the value of P_IS_HU_OWNER_IND
*	Also calls validations
*/
function EnumCB_Owner_POST() {
  try{    
    var householdRosterPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var referencePersonPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ReferencePerson");
    var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.Respondent.DKRefused");
    var owner = dkRefPage.get("Owner");
    if(owner) {
      owner = owner.getValue();
    }
    else {
      owner = "";
    }
    var isNoOwnerRenterSelected = householdRosterPage.get("IsNoOwnerRenterSelected");
    if(isNoOwnerRenterSelected) {
      isNoOwnerRenterSelected = isNoOwnerRenterSelected.getValue();
    } 
    else {
      isNoOwnerRenterSelected = "";
    }
    var respondentPage = pega.ui.ClientCache.find("pyWorkPage.Respondent");
    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var householdMemberList = householdMember.iterator();
    var ownerRenterIndex = 0;
    var memberIndex = 0;
    while(householdMemberList.hasNext()) {
      memberIndex = memberIndex + 1;
      var currentPage = householdMemberList.next();
      var ownerFlag = currentPage.get("OwnerFlag");
      if(ownerFlag) {

        ownerFlag = ownerFlag.getValue();
        var respPage = currentPage.get("Response");
        if(ownerFlag == "true") {

          respPage.put("P_IS_HU_OWNER_IND","1");
          ownerRenterIndex = ownerRenterIndex + 1;
          if(ownerRenterIndex == 1) {

            currentPage.put("ReferencePersonFlag",true);
            referencePersonPage.adoptJSON(currentPage.getJSON());

            var respondentFlag = currentPage.get("RespondantFlag");
            if(respondentFlag) {
              respondentFlag = respondentFlag.getValue();
              var referencePersonFlag = currentPage.get("ReferencePersonFlag").getValue();
              if(respondentFlag == "true" && referencePersonFlag == true) {
                respondentPage.put("ReferencePersonFlag",true);
              }
              if(respondentFlag == "false" && referencePersonFlag == true) {
                respondentPage.put("ReferencePersonFlag",false);
              }
            }
          }
          else {
            currentPage.put("ReferencePersonFlag",false);
            var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
            var firstMemberIndexForRelOther = questFlags.get("FirstMemberIndexForRelOther");
            if(!firstMemberIndexForRelOther) {
              questFlags.put("FirstMemberIndexForRelOther", memberIndex);
            }
          }
        }
        else{
          currentPage.put("ReferencePersonFlag",false);
          respPage.put("P_IS_HU_OWNER_IND","0");
          var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
          var firstMemberIndexForRelOther = questFlags.get("FirstMemberIndexForRelOther");
          if(!firstMemberIndexForRelOther) {
            questFlags.put("FirstMemberIndexForRelOther", memberIndex);
          }
        }
      } 
      var pageInRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember(" + memberIndex + ")");
      pageInRoster.adoptJSON(currentPage.getJSON());
    }

    if(isNoOwnerRenterSelected == "true" || owner == "R" || owner == "D") {

      var householdMemberOne = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember(1)");
      householdMemberOne.put("ReferencePersonFlag",true);
      referencePersonPage.adoptJSON(householdMemberOne.getJSON());
      var respNoneAbove = householdMemberOne.get("RespondantFlag");
      if(respNoneAbove) {
        respNoneAbove = respNoneAbove.getValue();
        if(respNoneAbove == "true") {
          respondentPage.put("ReferencePersonFlag", true);
        }
        else {
          respondentPage.put("ReferencePersonFlag", false);
        }
      }

    }

    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    ENUMCB.validateOwnerRenter(ownerRenterIndex, "Owner");
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.Owner", "pyWorkPage.HouseholdMemberTemp.Response.H_OWNER_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.H_OWNER_REF_IND");
    questFlags.put("IsDKRefVisible","false");
  }
  catch(e) {
    console.log(e.message);
  }
}
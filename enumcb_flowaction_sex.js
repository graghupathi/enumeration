/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in SexNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/*
*	Pre Action for Sex_QSTN
*	Created by: Domenic Giancola
*/
function EnumCB_Sex_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var householdMembers = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var memberIndexProp = householdRoster.get("CurrentHHMemberIndex");

  var memberIndex = (memberIndexProp) ? memberIndexProp.getValue() :1;
  /* got here from Previous*/
  if(isGoingBack == "true"){
    if(previousQuestion == "Sex_QSTN") {   
      memberIndex = memberIndex - 1;
    }
    else if(previousQuestion == "DOB_QSTN" || previousQuestion =="ConfirmSex_QSTN"){
      memberIndex = householdMembers.size();
    }
  }
  /*got here from Next*/
  else{
    if(previousQuestion =="RelationshipResp_QSTN" || previousQuestion =="RelationshipOther_QSTN" || previousQuestion =="RelationOT_QSTN" || previousQuestion =="RelationSD_QSTN"){
      memberIndex=1;
    }
  }    
  householdRoster.put("CurrentHHMemberIndex", memberIndex);  
  var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
  CB.getMemberFromRoster(curMemberIndex);  
  ENUMCB.updateDKRefVisibility("Sex");
}

/*
*	Post Action for Sex_QSTN
*	Created by: Domenic Giancola
*/
function EnumCB_Sex_POST() {
  ENUMCB.Sex_VLDN();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");

  if(!workPage.hasMessages()){
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpHouseholdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var referencePersonPage = pega.ui.ClientCache.find("pyWorkpage.HouseholdRoster.ReferencePerson");
    if(cpQuestFlags && cpHouseholdMemberList && cpHouseholdMemberTemp) {
      cpQuestFlags.put("IsFirstTimeSex","false");
      var curSex = cpHouseholdMemberTemp.get("SexMaleFemale").getValue();
      var cpResponse = cpHouseholdMemberTemp.get("Response");
      var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
      var dkRefProp = dkRefused.get("Sex");
      if(dkRefProp) {
        dkRefProp = dkRefProp.getValue();
      }
      else {
        dkRefProp = "";
      }
      if(dkRefProp == "D") {
        cpResponse.put("P_SEX_DK_IND", "1");
        cpResponse.put("P_SEX_REF_IND", "0");
        cpHouseholdMemberTemp.put("SexMaleFemale", "Don't Know");
      }
      else if(dkRefProp == "R") {
        cpResponse.put("P_SEX_DK_IND", "0");
        cpResponse.put("P_SEX_REF_IND", "1");
        cpHouseholdMemberTemp.put("SexMaleFemale", "Refused");
      }
      else {
        cpResponse.put("P_SEX_DK_IND", "0");
        cpResponse.put("P_SEX_REF_IND", "0");
      }
      if(curSex == "Male"){
        cpResponse.put("P_SEX_MALE_IND","1");
        cpResponse.put("P_SEX_FEMALE_IND","0");
      }
      else if(curSex == "Female"){
        cpResponse.put("P_SEX_MALE_IND","0");
        cpResponse.put("P_SEX_FEMALE_IND","1");
      }
      else{
        cpResponse.put("P_SEX_MALE_IND","0");
        cpResponse.put("P_SEX_FEMALE_IND","0");         
      }
      cpHouseholdMemberTemp.put("SexMaleFemaleConsistencyEdit","");	

      var params = {isFirstTimeProp: "IsFirstTimeSex"};
      ENUMCB.updateMemberIndexPost(params);

      var referencePersonFlag = cpHouseholdMemberTemp.get("ReferencePersonFlag");
      if(referencePersonFlag) {
        referencePersonFlag = referencePersonFlag.getValue();
      }
      else {
        referencePersonFlag = "";
      }

      if(referencePersonFlag == "true") {
        referencePersonPage.adoptJSON(cpHouseholdMemberTemp.getJSON());
      }

      /* check for the last member in roster*/
      var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue(),10);
      var curRosterSize = parseInt(cpQuestFlags.get("CurrentRosterSize").getValue(),10);
      if(curMemberIndex > curRosterSize){
        /*clear the ConfirmSexMemberList*/
        var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
        var confirmSexMemberList = questFlags.put("ConfirmSexMemberList",[]);
        /*call sex validations function here*/
        ENUMCB.RelationshipSexInconsistencyCheck("pyWorkPage.QuestFlags.ConfirmSexMemberList");
        confirmSexMemberList= questFlags.get("ConfirmSexMemberList");
        var confirmSexSize = confirmSexMemberList.size();
        questFlags.put("ConfirmSexSize", confirmSexSize);      
      }	
    }  
    else{
      console.log("***ENUMCB Error - " + "Unable to find QuestFlags page, HouseholdRoster.HouseholdMember pagelist, or HouseholdMemberTemp page in EnumCB_Sex_POST function");
    }
  }  
}

/*
*	Created by: Kyle Gravel, Mike Hartel
*	Confirm Sex Question Pre js
*/
function EnumCB_ConfirmSex_PRE() {   
  CB.toggleFlag("DKRFEnabled", "true");  
  CB.toggleFlag("ExitSurveyEnabled", "true");

  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");  
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var numberOfConfirmSexMembers =  pega.ui.ClientCache.find("pyWorkPage.QuestFlags.ConfirmSexSize").getValue();
  var confirmSexIndex = questFlags.get("ConfirmSexIndex");
  if(confirmSexIndex) {
    confirmSexIndex = confirmSexIndex.getValue();
  }
  else {
    confirmSexIndex = 0;
  }


  /*Arrived here from click of Previous*/
  if(isGoingBack== "true"){
    if(previousQuestion == "ConfirmSex_QSTN"){
      confirmSexIndex=confirmSexIndex-1;
      questFlags.put("ConfirmSexIndex", confirmSexIndex);
    }
    if(previousQuestion == "DOB_QSTN" || previousQuestion == "RelationshipCheckRS_QSTN"){
      confirmSexIndex = numberOfConfirmSexMembers;
      questFlags.put("ConfirmSexIndex", confirmSexIndex);
    }
  }
  /*Arrived here from click of Next*/
  else{
    if(previousQuestion == "Sex_QSTN"){
      confirmSexIndex=1; /*Start with first index*/
      questFlags.put("ConfirmSexIndex", confirmSexIndex);
    }
  }

  var confirmSexMemberIndices = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.ConfirmSexMemberList("+confirmSexIndex+")");
  var HHMemberIndex = parseInt(confirmSexMemberIndices.get("pyTempInteger").getValue());  
  householdRoster.put("CurrentHHMemberIndex", HHMemberIndex);
  var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
  CB.getMemberFromRoster(curMemberIndex);

  ENUMCB.updateDKRefVisibility("ConfirmSex");

}

/*
*	Created by: Mike Hartel, Kyle Gravel
*	Confirm Sex Question Post js
*/
function EnumCB_ConfirmSex_POST() {
  try {
    /*Validation goes here*/
    ENUMCB.ConfirmSex_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");

    if (!workPage.hasMessages()) {
      var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
      var dkConfirmSex = dkRefPage.get("ConfirmSex");
      if (dkConfirmSex) {
        dkConfirmSex = dkConfirmSex.getValue();
      } else {
        dkConfirmSex = "";
      }
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var currentHHMemberIndex = householdRoster ? householdRoster.get("CurrentHHMemberIndex") : null;
      /* var currentHHMemberIndex = householdRoster.get("CurrentHHMemberIndex"); */
      if (currentHHMemberIndex) {
        currentHHMemberIndex = currentHHMemberIndex.getValue();
      } else {
        currentHHMemberIndex = 0;
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var confirmSexIndex = questFlags.get("ConfirmSexIndex");
      if (confirmSexIndex) {
        confirmSexIndex = confirmSexIndex.getValue();
      }

      var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var referencePersonFlag = householdMemberTemp.get("ReferencePersonFlag");
      if (referencePersonFlag) {
        referencePersonFlag = referencePersonFlag.getValue();
      }

      var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var sexConfirm = responsePage.get("P_SEX_CONF_YES_IND");
      if (sexConfirm) {
        sexConfirm = sexConfirm.getValue();
      }

      if (sexConfirm == "1" || dkConfirmSex == "D" || dkConfirmSex == "R") {
        responsePage.put("P_SEX_CONF_NO_IND", "0");
        questFlags.put("IsDKRefVisible", "false");
        confirmSexIndex = confirmSexIndex + 1;
      } else if (sexConfirm == "0") {
        responsePage.put("P_SEX_CONF_NO_IND", "1");

      }

      questFlags.put("ConfirmSexIndex", confirmSexIndex);
      var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
      CB.setMemberInRoster(curMemberIndex, false);

      /* set up relationshipsexmemberlist pagelist when exiting to ConfirmSexNRFUSub*/
      if (referencePersonFlag == true && sexConfirm != "0") {
        var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
        var relationshipSexMemberIndices = questFlags.put("RelationshipSexMemberList", []);
        ENUMCB.RelationshipSexInconsistencyCheck("pyWorkPage.QuestFlags.RelationshipSexMemberList");
        relationshipSexMemberIndices = questFlags.get("RelationshipSexMemberList");
        /*Remove the last person from the list (Reference Person)*/
        var relationshipSexSize = relationshipSexMemberIndices.size();
        relationshipSexMemberIndices.remove(relationshipSexSize);
        relationshipSexSize = relationshipSexMemberIndices.size();
        questFlags.put("RelationshipSexSize", relationshipSexSize);
      }

    }

  } catch (e) {
    alert(e.message);
  }
}

/*
*	Created by: AXJ
*	Change Sex Question Pre js
*/
function EnumCB_ChangeSex_PRE() {
  try {
    CB.toggleFlag("DKRFEnabled", "true");
    CB.toggleFlag("ExitSurveyEnabled", "true");

    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isGoingBack = questFlags.get("IsGoingBack").getValue();
    var numberOfConfirmSexMembers = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.ConfirmSexSize").getValue();
    var confirmSexIndex = questFlags.get("ConfirmSexIndex");
    if (confirmSexIndex) {
      confirmSexIndex = confirmSexIndex.getValue();
    } 
    else {
      confirmSexIndex = 0;
    }
    /*Arrived here from click of Previous*/
    if (isGoingBack == "true") {
      if (previousQuestion == "ChangeSex_QSTN"  || previousQuestion == "ConfirmSex_QSTN") {
        confirmSexIndex = confirmSexIndex - 1;
        questFlags.put("ConfirmSexIndex", confirmSexIndex);
      }
      if (previousQuestion == "DOB_QSTN" || previousQuestion == "RelationshipCheckRS_QSTN") {
        confirmSexIndex = numberOfConfirmSexMembers;
        questFlags.put("ConfirmSexIndex", confirmSexIndex);
      }
    }
    var confirmSexMemberIndices = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.ConfirmSexMemberList(" + confirmSexIndex + ")");
    var HHMemberIndex = parseInt(confirmSexMemberIndices.get("pyTempInteger").getValue());
    householdRoster.put("CurrentHHMemberIndex", HHMemberIndex);
    var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
    CB.getMemberFromRoster(curMemberIndex);
    ENUMCB.updateDKRefVisibility("ChangeSex");
  } 
  catch (e) {
    alert("ENUMCB Error - EnumCB_ChangeSex_PRE:" + e.message);
  }
}

/*
* Post function for Change Sex
* Created by Mike Hartel, modified AXJ
*/
function EnumCB_ChangeSex_POST() {

  /*Validation Goes Here*/
  ENUMCB.ChangeSex_VLDN();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()){      

    /*Set Member back into roster*/
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
    CB.setMemberInRoster(curMemberIndex, false);		

    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var confirmSexIndex = parseInt(questFlags.get("ConfirmSexIndex").getValue(),10);        
    var HHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var ReferencePersonFlag = HHMemberTemp.get("ReferencePersonFlag");
    var isReferencePerson = (ReferencePersonFlag)?ReferencePersonFlag.getValue():"";       

    if(isReferencePerson!= true){
      var oldSex = HHMemberTemp.get("SexMaleFemale").getValue();
      var newSex = HHMemberTemp.get("SexMaleFemaleConsistencyEdit").getValue();
      var confirmSexMemberList = questFlags.get("ConfirmSexMemberList");
      var confirmSexMemberListSize = confirmSexMemberList.size();          
      /*if the second to last member made a change to their sex, check if there is still an inconsistency with the reference person*/
      if(oldSex!=newSex && confirmSexIndex==confirmSexMemberListSize-1){            
        var responsePage = HHMemberTemp.get("Response");
        var sexMaleFemale ="";

        var relationshipCodeProp = responsePage.get("P_REL_CODE");          
        var relationshipCode = (relationshipCodeProp) ? relationshipCodeProp.getValue() : "";                  

        var sexMaleFemaleConsistencyEditProp = HHMemberTemp.get("SexMaleFemaleConsistencyEdit");
        var sexMaleFemaleConsistencyEdit = (sexMaleFemaleConsistencyEditProp) ? sexMaleFemaleConsistencyEditProp.getValue() : "";

        if(sexMaleFemaleConsistencyEdit!=""){
          sexMaleFemale =sexMaleFemaleConsistencyEdit;
        }            

        var dkRefPage = HHMemberTemp.get("DKRefused");
        var changeSexDKRefProp = dkRefPage.get("ChangeSex");
        var changeSexDKRef = (changeSexDKRefProp) ? changeSexDKRef.getValue() : "";

        var referencePersonPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.ReferencePerson");
        var refSexMaleFemaleProp = referencePersonPage.get("SexMaleFemale");
        var refSexMaleFemale = (refSexMaleFemaleProp) ? refSexMaleFemaleProp.getValue() : "";			

        if(((relationshipCode == "1" || relationshipCode=="2") && ((refSexMaleFemale == sexMaleFemale) && changeSexDKRef == "")) ||
           ((relationshipCode == "3" || relationshipCode=="4") && ((refSexMaleFemale != sexMaleFemale) && changeSexDKRef == ""))) {
          /*inconsistency still exists, do nothing*/   
        }
        else{    
          /*no inconsistency, remove reference persion (last in list)*/
          confirmSexMemberList.remove(confirmSexMemberListSize);
          var confirmSexSize = questFlags.get("ConfirmSexMemberList").size();
          questFlags.put("ConfirmSexSize", confirmSexSize);
        }	             
      }
    }
    /*if Reference Person, then this is the last member to loop on. RelationshipSexNRFU is next*/
    else{             
      var relationshipSexMemberIndices = questFlags.put("RelationshipSexMemberList",[]);            
      ENUMCB.RelationshipSexInconsistencyCheck("pyWorkPage.QuestFlags.RelationshipSexMemberList");            
      relationshipSexMemberIndices = questFlags.get("RelationshipSexMemberList");            
      /*Remove the last person from the list (Reference Person)*/
      var relationshipSexSize = relationshipSexMemberIndices.size();   
      relationshipSexMemberIndices.remove(relationshipSexSize);
      relationshipSexSize = relationshipSexMemberIndices.size(); 
      questFlags.put("RelationshipSexSize", relationshipSexSize);
    }

    /*increment ConfirmSexIndex*/
    confirmSexIndex=confirmSexIndex+1;
    questFlags.put("ConfirmSexIndex",confirmSexIndex);        
    ENUMCB.SetChangeSexResponseProperties();     
  }
}

/*
* Pre Action for RelationshipCheckRS
* Created by: Aditi Ashok
*/
function EnumCB_RelationshipCheckRS_PRE () {
  ENUMCB.setRosterRelationshipText();

  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");  
  var isGoingBack = questFlags.get("IsGoingBack").getValue();

  var numberOfRelationshipSexMembers =  pega.ui.ClientCache.find("pyWorkPage.QuestFlags.RelationshipSexSize").getValue();
  var relationshipSexIndex = questFlags.get("RelationshipSexIndex");

  if(relationshipSexIndex) { 
    relationshipSexIndex = relationshipSexIndex.getValue();
  }
  else {
    relationshipSexIndex = 0;
  }

  /*Arrived here from click of Previous*/ 

  if(isGoingBack== "true"){
    if(previousQuestion == "RelationshipCheckRS_QSTN"){
      relationshipSexIndex = relationshipSexIndex-1;
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);
    } 
    if(previousQuestion == "DOB_QSTN"){
      relationshipSexIndex = numberOfRelationshipSexMembers;
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);
    }

  } 
  /*Arrived here from click of Next*/
  else {
    if(previousQuestion == "ConfirmSex_QSTN" || previousQuestion=="ChangeSex_QSTN"){
      relationshipSexIndex=1; /*Start with first index*/
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);
    }
  } 

  var relationshipSexMemberIndices = pega.ui.ClientCache.find("pyWorkPage.QuestFlags.RelationshipSexMemberList("+relationshipSexIndex+")");
  var HHMemberIndex = parseInt(relationshipSexMemberIndices.get("pyTempInteger").getValue());  
  householdRoster.put("CurrentHHMemberIndex", HHMemberIndex);
  var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();
  CB.getMemberFromRoster(curMemberIndex);
  var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");

  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("RelationshipCheckRS");
  CB.toggleFlag("ExitSurveyEnabled","true");

}

/*
* Post Action for RelationshipCheckRS
* Created by: Aditi Ashok
*/

function EnumCB_RelationshipCheckRS_POST () {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");

  ENUMCB.RelationshipCheckRS_VLDN();

  if (!workPage.hasMessages()) { 
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");

    if (cpQuestFlags && cpHouseholdRoster && cpHHMemberTemp) {
      cpQuestFlags.put("NextSurveyQuestion", "");

      var isRelationshipCorrect = cpHHMemberTemp.get("IsRelationshipCorrect").getValue();
      var dkRefPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
      var dkRefRelationshipCheckRS = dkRefPage.get("RelationshipCheckRS");
      if(dkRefRelationshipCheckRS) {
        dkRefRelationshipCheckRS = dkRefRelationshipCheckRS.getValue();
      }
      else {
        dkRefRelationshipCheckRS = "";
      }

      if (isRelationshipCorrect == "true" || dkRefRelationshipCheckRS == "D" || dkRefRelationshipCheckRS == "R" ) { 
        var relationshipSexIndex = cpQuestFlags.get("RelationshipSexIndex");
        if (relationshipSexIndex) {
          relationshipSexIndex = relationshipSexIndex.getValue();
        } else {
          relationshipSexIndex = 0;
        } 

        relationshipSexIndex = relationshipSexIndex+1;
        cpQuestFlags.put("RelationshipSexIndex", relationshipSexIndex);

      } 

      /* Response Properties */
      if (isRelationshipCorrect == "true") {
        responsePage.put("P_REL_CONF_YES_IND", "1");
        responsePage.put("P_REL_CONF_NO_IND", "0");
      } 
      else if (isRelationshipCorrect == "false") {
        responsePage.put("P_REL_CONF_YES_IND", "0");
        responsePage.put("P_REL_CONF_NO_IND", "1");
        cpQuestFlags.put("NextSurveyQuestion", "ChangeRelationshipRS_QSTN");
      } 
      else if (dkRefRelationshipCheckRS == "D" || dkRefRelationshipCheckRS == "R") {
        responsePage.put("P_REL_CONF_YES_IND", "0");
        responsePage.put("P_REL_CONF_NO_IND", "0");
      }

    }
    /* Increment Index */
    var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(currentHHMemberIndex,false);

  }
}

/**
*	Pre action for ChangeRelationshipRS
*	Created by: Aansh Kapadia
**/
function EnumCB_ChangeRelationshipRS_PRE(){
  ENUMCB.ChangeRelationshipRSFlow_PRE();
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("ChangeRelationshipRS"); 
}

/**
*	Pre action for ChangeRelationRSSD
*	Created by: Aansh Kapadia
**/
function EnumCB_ChangeRelationRSSD_PRE(){
  ENUMCB.ChangeRelationshipRSFlow_PRE();
  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("ChangeRelationRSSD");
  CB.toggleFlag("ExitSurveyEnabled","true");
}

/**
*	Pre action for ChangeRelationRSOT
*	Created by: Aansh Kapadia
**/
function EnumCB_ChangeRelationRSOT_PRE(){
  ENUMCB.ChangeRelationshipRSFlow_PRE();
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("ChangeRelationRSOT"); 
}

/**
*	Post action for ChangeRelationshipRS_QSTN
*	Created by: Aansh Kapadia, Jack McCloskey
**/
function EnumCB_ChangeRelationshipRS_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationshipRS", "pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationshipRS");
    } 
    else {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationshipRS");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationshipRS", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var memberTempPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var respProp = memberTempPage.get("ChangeRelationshipRS");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      if(respProp == "SD") {
        questFlags.put("NextSurveyQuestion", "ChangeRelationSD_QSTN");
        var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
        CB.setMemberInRoster(curMemberIndex,false);
      }
      else if(respProp == "OT") {
        questFlags.put("NextSurveyQuestion", "ChangeRelationOT_QSTN");
        var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
        CB.setMemberInRoster(curMemberIndex,false);
      }
      else{
        var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.P_REL_CODE");
        respPage.setValue(respProp);
        questFlags.put("NextSurveyQuestion", "");

        var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
        var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
        ENUMCB.setRelTextInHouseholdMemberTemp("ChangeRelationshipRS","D_RelationshipOptions_ALL","ChangeRelationshipRS");
        CB.setMemberInRoster(currentHHMemberIndex,false);

        var relationshipSexIndex = questFlags.get("RelationshipSexIndex");
        if (relationshipSexIndex) {
          relationshipSexIndex = relationshipSexIndex.getValue();
        } else {
          relationshipSexIndex = 0;
        } 

        relationshipSexIndex = relationshipSexIndex+1;
        questFlags.put("RelationshipSexIndex", relationshipSexIndex);
      }
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_ChangeRelationshipRS_POST:" + e.message);*/
  }
}

/**
*	Post action for ChangeRelationRSSD_QSTN
*	Created by: Aansh Kapadia
**/
function EnumCB_ChangeRelationRSSD_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationRSSD", "pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationRSSD");
    } 
    else {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationRSSD");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationRSSD", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var memberTempPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var respProp = memberTempPage.get("ChangeRelationRSSD");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");

      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.ChangeRelationRSSD");
      respPage.setValue(respProp);
      questFlags.put("NextSurveyQuestion", "");

      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());

      var relationshipSexIndex = questFlags.get("RelationshipSexIndex");
      if (relationshipSexIndex) {
        relationshipSexIndex = relationshipSexIndex.getValue();
      } else {
        relationshipSexIndex = 0;
      } 

      /* if DK/Ref has been selected on this screen: default to other biological son/daughter */
      var cpHMTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var dkrefProp = cpHMTemp.get("DKRefused.ChangeRelationRSSD");
      if (dkrefProp && (dkrefProp.getValue() == "D" || dkrefProp.getValue() == "R")) {
        cpHMTemp.put("ChangeRelationRSSD", 5);
        alert("ChangeRelationRSSD: 5");
      }
      ENUMCB.setRelTextInHouseholdMemberTemp("ChangeRelationRSSD","D_RelationSDOptions","ChangeRelationRSSD");
      CB.setMemberInRoster(currentHHMemberIndex,false);

      relationshipSexIndex = relationshipSexIndex+1;
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_ChangeRelationRSSD_POST:" + e.message);*/
  }
}

/**
*	Post action for ChangeRelationRSOT_QSTN
*	Created by: Aansh Kapadia
**/
function EnumCB_ChangeRelationRSOT_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();

    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationRSOT", "pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationRSOT");
    } 
    else {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationRSOT");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationRSOT", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 

      var memberTempPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var respProp = memberTempPage.get("ChangeRelationRSOT");
      if(respProp) {
        respProp = respProp.getValue();
      }
      else {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");

      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.ChangeRelationRSOT");
      respPage.setValue(respProp);
      questFlags.put("NextSurveyQuestion", "");

      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());


      var relationshipSexIndex = questFlags.get("RelationshipSexIndex");
      if (relationshipSexIndex) {
        relationshipSexIndex = relationshipSexIndex.getValue();
      } else {
        relationshipSexIndex = 0;
      } 

      /* if DKRef has been selected on this screen: default to other non-relative */
      var cpHMTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var dkrefProp = cpHMTemp.get("DKRefused.ChangeRelationRSOT");
      if (dkrefProp && (dkrefProp.getValue() == "D" || dkrefProp.getValue() == "R")) {
        cpHMTemp.put("ChangeRelationRSOT", 16);
        alert("ChangeRelationRSOT: 16");
      }
      ENUMCB.setRelTextInHouseholdMemberTemp("ChangeRelationRSOT","D_RelationOTOptions","ChangeRelationRSOT");
      CB.setMemberInRoster(currentHHMemberIndex,false);

      relationshipSexIndex = relationshipSexIndex+1;
      questFlags.put("RelationshipSexIndex", relationshipSexIndex);
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_ChangeRelationRSOT_POST:" + e.message);*/
  }
}
/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in DOBNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/**
*	Pre action for DOB to copy current member from Roster into temp
*	Created by: Omar Mohammed
**/
function EnumCB_DOB_PRE() {
  if(pega.mobile.isHybrid) {
    CB.toggleFlag("DKRFEnabled", "true");
    CB.toggleFlag("ExitSurveyEnabled", "true");
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();     
    var isGoingBack = questFlags.get("IsGoingBack").getValue();
    var memberIndexProp = householdRoster.get("CurrentHHMemberIndex");
    var memberIndex = (memberIndexProp) ? memberIndexProp.getValue() :1;
    /*Previous*/
    if(isGoingBack =="true"){
      /*dont update index*/
    }
    /*Next*/
    else{
      if(previousQuestion=="Sex_QSTN" || previousQuestion=="ConfirmSex_QSTN" || previousQuestion=="ChangeSex_QSTN" || previousQuestion=="RelationshipCheckRS_QSTN" 
         || previousQuestion=="ChangeRelationshipRS_QSTN" || previousQuestion=="ChangeRelationRSOT_QSTN" || previousQuestion=="ChangeRelationRSSD_QSTN"){
        memberIndex=1; /*start at first member*/
      }
    }	
    householdRoster.put("CurrentHHMemberIndex", memberIndex);
    CB.getMemberFromRoster(memberIndex);  
    ENUMCB.DOBDKRefVisibility("DOBDay", "DOBMonth", "DOBYear");
  }
}

/**
*	Post action for DOB to call vldn and calc age
*	Created by: Omar Mohammed
**/
function EnumCB_DOB_POST() {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var dkRefMonth = dkRefused.get("DOBMonth");
  if(dkRefMonth) {
    dkRefMonth = dkRefMonth.getValue();
  }
  else {
    dkRefMonth = "";
  }
  var dkRefDay = dkRefused.get("DOBDay");
  if(dkRefDay) {
    dkRefDay = dkRefDay.getValue();
  }
  else {
    dkRefDay = "";
  }
  var dkRefYear = dkRefused.get("DOBYear");
  if(dkRefYear) {
    dkRefYear = dkRefYear.getValue();
  }
  else {
    dkRefYear = "";
  }

  var birthMonth = respPage.get("P_BIRTH_MONTH_INT");
  if(birthMonth) {
    birthMonth = birthMonth.getValue();
  }
  else {
    birthMonth = "";
  }
  var birthDay = respPage.get("P_BIRTH_DAY_INT");
  if(birthDay) {
    birthDay = birthDay.getValue();
  }
  else {
    birthDay = "";
  }
  var birthYear = respPage.get("P_BIRTH_YEAR_INT");
  if(birthYear) {
    birthYear = birthYear.getValue();
  }
  else {
    birthYear = "";
  }
  /*Begin DOB Validation*/
  if(!ENUMCB_DOB_VLDN(workPage, birthMonth, birthDay, birthYear, dkRefMonth, dkRefDay, dkRefYear)) {
    var parsedMonth = parseInt(birthMonth, 10);
    var parsedDay = parseInt(birthDay, 10);
    var parsedYear = parseInt(birthYear, 10);   

    var todayYear = parseInt(workPage.get("CensusYear").getValue());
    var censusDate = workPage.get("CensusDate").getValue();
    if((parsedYear == todayYear && parsedMonth == 4 && parsedDay > 1) || (parsedYear == todayYear && parsedMonth > 4)) {
      var putNextQuestion = questFlags.put("NextSurveyQuestion", "BabyFlag_QSTN");
    }
    else if(parsedMonth != "" && parsedYear > 1891 && parsedYear <= todayYear && (parsedMonth != 4 || (parsedMonth == 4 && parsedDay != ""))) {
      var putNextQuestion = questFlags.put("NextSurveyQuestion", "ConfirmAge_QSTN");
      var age = ENUMCB.calculateAge(parsedMonth, parsedDay, parsedYear, censusDate);
      respPage.put("P_AGE_CALC_INT", age);
    }
    else if (!(parsedMonth != "" && parsedYear > 1891 && parsedYear <= todayYear && (parsedMonth != 4 || (parsedMonth == 4 && parsedDay != "")))) {
      var putNextQuestion = questFlags.put("NextSurveyQuestion", "Age_QSTN");
    }   
    else {
      var putNextQuestion = questFlags.put("NextSurveyQuestion", "");
    }

    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.DOBMonth", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_MONTH_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_MONTH_REF_IND");

    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.DOBDay", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_DAY_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_DAY_REF_IND");

    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.DOBYear", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_YEAR_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_YEAR_REF_IND");

    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = householdRoster.get("CurrentHHMemberIndex").getValue();

    if(dkRefMonth == "D") {
      birthMonth = "DK";
    }
    else if(dkRefMonth == "R") {
      birthMonth = "REF";
    }
    if(dkRefDay == "D") {
      birthDay = "DK";
    }
    else if(dkRefDay == "R") {
      birthDay = "REF";
    }
    if(dkRefYear == "D") {
      birthYear = "DK";
    }
    else if(dkRefYear == "R") {
      birthYear = "REF";
    }

    var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    householdMemberTemp.put("DOBMonth",birthMonth);
    householdMemberTemp.put("DOBDay",birthDay);
    householdMemberTemp.put("DOBYear",birthYear);

    CB.setMemberInRoster(curMemberIndex, false);
  }
}

/**
*	Pre action for confirm age
*	Created by Kyle Gravel
**/
function EnumCB_ConfirmAge_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKRFEnabled", "true");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack");
  isGoingBack = isGoingBack ? isGoingBack.getValue() : "";
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
  currentHHMember = currentHHMember ? currentHHMember.getValue() : alert("curr HH memb doesnt exist");
  var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  var householdMemberSize = householdMember.size();

  if(isGoingBack == "true") {
    if(previousQuestion == "DOB_QSTN") {
      currentHHMember = currentHHMember - 1;
      CB.getMemberFromRoster(currentHHMember);
      householdRoster.put("CurrentHHMemberIndex",currentHHMember);
    }
    if (previousQuestion == "Race_QSTN") {
      currentHHMember = householdMemberSize;
      CB.getMemberFromRoster(currentHHMember);
      householdRoster.put("CurrentHHMemberIndex",currentHHMember);
    }
  }

  var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var age = parseInt(respPage.get("P_AGE_CALC_INT").getValue());
  var respondentFlag = householdMemberTemp.get("RespondantFlag");
  if(respondentFlag) {
    respondentFlag = respondentFlag.getValue();
  }
  if(age > 0 && respondentFlag == "true") {
    questFlags.put("DisplayConfirmAgeInst","1");
  }
  if(age < 1 && respondentFlag == "true") {    
    questFlags.put("DisplayConfirmAgeInst","2");
  }
  if(age > 0 && respondentFlag == "false") {
    questFlags.put("DisplayConfirmAgeInst","3");
  }
  if(age < 1 && respondentFlag == "false") {
    questFlags.put("DisplayConfirmAgeInst","4");
  }
  ENUMCB.updateDKRefVisibility("ConfirmAge");
}

/*
*	Post Action for ConfrimAge_QSTN
*	Created by: Kyle Gravel, Omar Mohammed
*/
function EnumCB_ConfirmAge_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if(isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_YES_IND", "pyWorkPage.HouseholdMemberTemp.DKRefused.ConfirmAge", "PleaseProvideAnAnswer"); 
  }
  else {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_YES_IND", "", "PleaseProvideAnAnswer"); 
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()) {
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var confirmAge = respPage.get("P_AGE_CONF_YES_IND").getValue();

    if(confirmAge == "1") {
      respPage.put("P_AGE_CONF_YES_IND","1");
      respPage.put("P_AGE_CONF_NO_IND","0");
      var age = respPage.get("P_AGE_CALC_INT");
      if (age) {
        var hhTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
        hhTemp.put("AgeText",age.getValue());
      }
      var params = {isFirstTimeProp:"IsFirstTimeDOB"};
      ENUMCB.updateMemberIndexPost(params);
      ENUMCB.AreParentsYoungerthanChildren();
    }
    else {
      respPage.put("P_AGE_CONF_YES_IND","0");
      respPage.put("P_AGE_CONF_NO_IND","1");
    }
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ConfirmAge", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_REF_IND");
  }
}

/*
* Pre function for Age
* Created by David Bourque
*/

function EnumCB_Age_PRE(){
  if(pega.mobile.isHybrid){
    CB.toggleFlag("ExitSurveyEnabled","true");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isGoingBack = cpQuestFlags.get("IsGoingBack").getValue();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    if (isGoingBack+"" == "true") {
      var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
      var currentHHIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
      if (previousQuestion == "DOB_QSTN") {
        currentHHIndex = currentHHIndex -1;
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      } else {
        currentHHIndex = cpHouseholdRoster.get("HouseholdMember").size();
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      }
      CB.getMemberFromRoster(currentHHIndex);
    }
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("AgeText");
  }
}

/*
* Post function for Age
* Created by David Bourque
*/

function EnumCB_Age_POST(){
  if(pega.mobile.isHybrid){
    ENUMCB.Age_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    if (!workPage.hasMessages()) {
      var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if (cpHouseholdMember && cpHouseholdRoster && cpQuestFlags) {
        var age = "";
        var dkRefused = cpHouseholdMember.get("DKRefused.Age");
        if (dkRefused && (dkRefused.getValue() == "D" || dkRefused.getValue() == "R")) {
          age = dkRefused.getValue();
        } else {
          age = responsePage.get("P_AGE_INT").getValue();
        }
        cpHouseholdMember.put("AgeText",age);
        ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.Age", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_REF_IND");
        params = {isFirstTimeProp: "IsFirstTimeDOB"};
        ENUMCB.updateMemberIndexPost(params);
        ENUMCB.AreParentsYoungerthanChildren();
      }
    }
  }
}

/*
* Pre function for Change Age
* Created by David Bourque
*/

function EnumCB_ChangeAge_PRE(){
  if(pega.mobile.isHybrid){
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isGoingBack = cpQuestFlags.get("IsGoingBack").getValue();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    if (isGoingBack+"" == "true") {
      var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
      var currentHHIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
      if (previousQuestion == "DOB_QSTN") {
        currentHHIndex = currentHHIndex -1;
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      } else {
        currentHHIndex = cpHouseholdRoster.get("HouseholdMember").size();
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      }
      CB.getMemberFromRoster(currentHHIndex);
    }
    CB.toggleFlag("ExitSurveyEnabled","true");
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("ChangeAge");
  }
}

/*
* Post function for Change Age
* Created by David Bourque
*/

function EnumCB_ChangeAge_POST(){
  if(pega.mobile.isHybrid){
    ENUMCB.ChangeAge_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    if (!workPage.hasMessages()) {
      var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if (cpHouseholdMember && cpHouseholdRoster && cpQuestFlags) {
        var age = "";
        var dkRefused = cpHouseholdMember.get("DKRefused.ChangeAge");
        if (dkRefused && (dkRefused.getValue() == "D" || dkRefused.getValue() == "R")) {
          age = dkRefused.getValue();
        } else {
          age = responsePage.get("P_AGE_CH_INT").getValue();
        }
        cpHouseholdMember.put("AgeText",age);
        ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeAge", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CH_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CH_REF_IND");
        var params = {isFirstTimeProp: "IsFirstTimeDOB"};
        ENUMCB.updateMemberIndexPost(params);
        ENUMCB.AreParentsYoungerthanChildren();
      }
    }
  }
}

/*
*	Pre Action for Baby Flag
*	Created by: David Bourque
*/
function EnumCB_BabyFlag_PRE(){
  CB.toggleFlag("DKRFEnabled", "false");
  CB.toggleFlag("ExitSurveyEnabled","true");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = cpQuestFlags.get("IsGoingBack").getValue();
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  if (isGoingBack+"" == "true") {
    var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
    var currentHHIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    if (previousQuestion == "DOB_QSTN") {
      currentHHIndex = currentHHIndex -1;
      cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      CB.getMemberFromRoster(currentHHIndex);
    } else if (previousQuestion == "Race_QSTN" || previousQuestion == "RelationshipCheck_QSTN") {
      currentHHIndex = cpHouseholdRoster.get("HouseholdMember").size();
      cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      CB.getMemberFromRoster(currentHHIndex);
    }
  }
}

/*
*	Post Action for Baby Flag
*	Created by: David Bourque
*/
function EnumCB_BabyFlag_POST(){
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_ACD_YES_IND");
  if (!workPage.hasMessages()) {
    var cpTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var answer = cpResponse.get("P_BIRTH_ACD_YES_IND").getValue();
    if (answer == "1") {
      cpResponse.put("P_BIRTH_ACD_YES_IND","1");
      cpResponse.put("P_BIRTH_ACD_NO_IND","0");
      cpTemp.put("AgeText",-1);
      cpQuestFlags.put("NextSurveyQuestion","");
      var params = {isFirstTimeProp:"IsFirstTimeDOB"};
      ENUMCB.updateMemberIndexPost(params);
      ENUMCB.AreParentsYoungerthanChildren();
    } else {
      cpResponse.put("P_BIRTH_ACD_YES_IND","0");
      cpResponse.put("P_BIRTH_ACD_NO_IND","1");
      cpQuestFlags.put("NextSurveyQuestion","ChangeDOB_QSTN");
    }
  }
}

/*
*	Created by: Kyle Gravel
*   Updated by: Mike Squitieri
*	Used by ChangeDOB_QSTN
*/
function EnumCB_ChangeDOB_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled", "true");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack").getValue();
  var rosterSize = questFlags.get("CurrentRosterSize").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());
  if(isGoingBack == "true") {
    if(previousQuestion == "DOB_QSTN"){
      currentHHMemberIndex = currentHHMemberIndex - 1;
      householdRoster.put("CurrentHHMemberIndex", currentHHMemberIndex);
      CB.getMemberFromRoster(currentHHMemberIndex);
    }
    else if(previousQuestion == "Race_QSTN") {
      currentHHMemberIndex = rosterSize;
      householdRoster.put("CurrentHHMemberIndex", currentHHMemberIndex);
      CB.getMemberFromRoster(currentHHMemberIndex);
    }
  }

  /*Convert DOB to String */
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  /*Find birth month*/
  var birthMonth = respPage.get("P_BIRTH_MONTH_INT");
  if(birthMonth) {
    birthMonth = birthMonth.getValue();
    var parsedMonth = parseInt(birthMonth, 10);
    var birthMonthString = CB.getMonthName(parsedMonth);
  }
  else {
    birthMonth = "";
  }
  /*Find Birth Day*/
  var birthDay = respPage.get("P_BIRTH_DAY_INT");
  if(birthDay) {
    birthDay = birthDay.getValue();
  }
  else{
    birthDay = "";
  }
  /*Find Birth Year*/
  var birthYear = respPage.get("P_BIRTH_YEAR_INT");
  if(birthYear){
    birthYear = birthYear.getValue();
  }
  else {
    birthYear = "";
  }

  /*add props to dateString*/
  var dateString = birthMonthString + " " + birthDay + ", " + birthYear;
  respPage.put("DOBString",dateString);

  ENUMCB.DOBDKRefVisibility("ChangeDOBDay", "ChangeDOBMonth", "ChangeDOBYear");
}

/*
*	Created by: Kyle Gravel
*	Used by ChangeDOB_QSTN
*/
function EnumCB_ChangeDOB_POST() {
  try {   
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var softEditPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
    if(!softEditPage) {
      respPage.put("SoftEditVLDN",{});
      softEditPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
    }
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
    if(currentHHMember) {
      currentHHMember = currentHHMember.getValue();
    }
    else {
      currentHHMember = "";
    }

    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");

    var dkRefMonth = dkRefused.get("ChangeDOBMonth");
    if(dkRefMonth) {
      dkRefMonth = dkRefMonth.getValue();
    }
    else {
      dkRefMonth = "";
    }
    var dkRefDay = dkRefused.get("ChangeDOBDay");
    if(dkRefDay) {
      dkRefDay = dkRefDay.getValue();
    }
    else {
      dkRefDay = "";
    }
    var dkRefYear = dkRefused.get("ChangeDOBYear");
    if(dkRefYear) {
      dkRefYear = dkRefYear.getValue();
    }
    else {
      dkRefYear = "";
    }

    var birthMonth = respPage.get("P_BIRTH_MONTH_CH_INT");
    if(birthMonth) {
      birthMonth = birthMonth.getValue();
    }
    else {
      birthMonth = "";
    }
    var birthDay = respPage.get("P_BIRTH_DAY_CH_INT");
    if(birthDay) {
      birthDay = birthDay.getValue();
    }
    else {
      birthDay = "";
    }
    var birthYear = respPage.get("P_BIRTH_YEAR_CH_INT");
    if(birthYear) {
      birthYear = birthYear.getValue();
    }
    else {
      birthYear = "";
    }

    /*Begin DOB Validation*/
    if(!ENUMCB_DOB_VLDN(workPage, birthMonth, birthDay, birthYear, dkRefMonth, dkRefDay, dkRefYear)) {
      var parsedMonth = parseInt(birthMonth, 10);
      var parsedDay = parseInt(birthDay, 10);
      var parsedYear = parseInt(birthYear, 10);   

      var todayYear = parseInt(workPage.get("CensusYear").getValue());
      var censusDate = workPage.get("CensusDate").getValue();

      /**If the soft edit flag does not exist, initialize it to false **/
      var changeDOBFlag = softEditPage.get("ChangeDOBFlag");
      if(changeDOBFlag) {
        changeDOBFlag = changeDOBFlag.getValue();
      }
      else {
        changeDOBFlag = false;
      }

      if((parsedYear == todayYear && parsedMonth == 4 && parsedDay > 1) || (parsedYear == todayYear && parsedMonth > 4)) {
        ENUMCB.DOBSoft_VLDN("ChangeDOBFlag");
        changeDOBFlag = softEditPage.get("ChangeDOBFlag").getValue();
        if(changeDOBFlag == false) {
          if(currentHHMember < householdMember.size()) {
            CB.setMemberInRoster(currentHHMember);
            currentHHMember = currentHHMember + 1;
            householdRoster.put("CurrentHHMemberIndex",currentHHMember);
          }
          else {
            CB.setMemberInRoster(currentHHMember);
            currentHHMember = currentHHMember + 1;
            householdRoster.put("CurrentHHMemberIndex",currentHHMember);
          }
        }
      }
		/* I am removing the currentHHMember < householdMember.size() condition US2213 Jeremy Helm */
      else if(parsedMonth != "" && parsedYear > 1891 && parsedYear <= todayYear && (parsedMonth != 4 || (parsedMonth == 4 && parsedDay != ""))) {  
        var putNextQuestion = questFlags.put("NextSurveyQuestion", "ConfirmAge2_QSTN");
        var age = ENUMCB.calculateAge(parsedMonth, parsedDay, parsedYear, censusDate);
        respPage.put("P_AGE_CH_INT", age);
        var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
        householdMemberTemp.put("AgeText",age);
      }

      else if (!(parsedMonth != "" && parsedYear > 1891 && parsedYear <= todayYear && (parsedMonth != 4 || (parsedMonth == 4 && parsedDay != "")))) {
        var putNextQuestion = questFlags.put("NextSurveyQuestion", "Age2_QSTN");
      }   
      else {
        CB.setMemberInRoster(currentHHMember);
        currentHHMember = currentHHMember + 1;
        householdRoster.put("CurrentHHMemberIndex",currentHHMember);
        var putNextQuestion = questFlags.put("NextSurveyQuestion", "");
      }

      if(dkRefMonth == "D") {
        birthMonth = "DK";
      }
      else if(dkRefMonth == "R") {
        birthMonth = "REF";
      }
      if(dkRefDay == "D") {
        birthDay = "DK";
      }
      else if(dkRefDay == "R") {
        birthDay = "REF";
      }
      if(dkRefYear == "D") {
        birthYear = "DK";
      }
      else if(dkRefYear == "R") {
        birthYear = "REF";
      }

      var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      householdMemberTemp.put("DOBMonth",birthMonth);
      householdMemberTemp.put("DOBDay",birthDay);
      householdMemberTemp.put("DOBYear",birthYear);

      ENUMCB.AreParentsYoungerthanChildren();

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeDOBMonth", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_MONTH_DK_CH_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_MONTH_REF_CH_IND");

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeDOBDay", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_DAY_DK_CH_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_DAY_REF_CH_IND");

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeDOBYear", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_YEAR_DK_CH_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_YEAR_REF_CH_IND");

    }
  }
  catch(e) {
    alert(e.message);
  }
}

/*
*		Created by: Kyle Gravel
*		Modified by: Iain Horiel
*		Modified by:Zach Holliday
*		Placeholder: Get the correct household member on previous
*/
function EnumCB_Age2_PRE()
{  
  CB.toggleFlag("ExitSurveyEnabled","true");
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("IsDKRefVisible", "false");
  var workPG = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPG.get("CurrentSurveyQuestion").getValue();
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHMember = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue(),10);

  var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");

  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack");
  if(isGoingBack) {
    isGoingBack = isGoingBack.getValue();
  }
  else {
    isGoingBack = "";
  }

  if(isGoingBack == "true") {    
    if(previousQuestion == "DOB_QSTN") {
      currentHHMember = currentHHMember - 1;
    }
    else if(previousQuestion == "RACE_QSTN") {
      currentHHMember = householdMember.size();
    }	
    householdRoster.put("CurrentHHMemberIndex",currentHHMember);
    CB.getMemberFromRoster(currentHHMember);
  }
}

/*
*		Created by: Kyle Gravel
*		Modified by: Iain Horiel
*		Modified by: Zach Holliday
*		Placeholder: Currently increment index 
*/
function EnumCB_Age2_POST(){
  if(pega.mobile.isHybrid){
    ENUMCB.Age_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    if (!workPage.hasMessages()) {
      var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if (cpHouseholdMember && cpHouseholdRoster && cpQuestFlags) {
        var age = "";
        var dkRefused = cpHouseholdMember.get("DKRefused.Age");
        if (dkRefused && (dkRefused.getValue() == "D" || dkRefused.getValue() == "R")) {
          age = dkRefused.getValue();
          responsePage.put("P_AGE_INT",age);
        } else {
          age = responsePage.get("P_AGE_INT").getValue();
        }
        cpHouseholdMember.put("AgeText",age);
        ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.Age", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_REF_IND");
        params = {isFirstTimeProp: "IsFirstTimeDOB"};
        ENUMCB.updateMemberIndexPost(params);
        ENUMCB.AreParentsYoungerthanChildren();
      }
    }
  }
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
  if(currentHHMember) {
    currentHHMember = currentHHMember.getValue();
  }
  CB.setMemberInRoster(currentHHMember,false);
  currentHHMember = currentHHMember + 1;
  householdRoster.put("CurrentHHMemberIndex",currentHHMember);
}


/*
*		Creatd by: Kyle Gravel
*       Updated by: Mike Squitieri
*		Placeholder: Get the correct household member on previous
*/

function EnumCB_ConfirmAge2_PRE(){
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKRFEnabled", "true");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var isGoingBack = questFlags.get("IsGoingBack");
  isGoingBack = isGoingBack ? isGoingBack.getValue() : "";
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
  currentHHMember = currentHHMember ? currentHHMember.getValue() : alert("curr HH memb doesnt exist");
  var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
  var householdMemberSize = householdMember.size();


  if(isGoingBack == "true") {
    if(previousQuestion == "DOB_QSTN") {
      currentHHMember = currentHHMember - 1;
      CB.getMemberFromRoster(currentHHMember);
      householdRoster.put("CurrentHHMemberIndex",currentHHMember);
    }
    if(previousQuestion == "Race_QSTN")  {
      currentHHMember = householdMemberSize;
      CB.getMemberFromRoster(currentHHMember);
      householdRoster.put("CurrentHHMemberIndex",currentHHMember);
    }
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var DKR_Page = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var confirmAge2_DKR = DKR_Page.get("ConfirmAge2").getValue();
    if((confirmAge2_DKR) && (confirmAge2_DKR !== "")) {
      respPage.put("P_AGE_CONF_YES_IND","");
    }
  }

  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var age = parseInt(respPage.get("P_AGE_CH_INT").getValue());
  var respondentFlag = householdMemberTemp.get("RespondantFlag");
  if(respondentFlag) {
    respondentFlag = respondentFlag.getValue();
  }
  if(age > 0 && respondentFlag == "true") {
    questFlags.put("DisplayConfirmAge2Inst","1");
  }
  if(age < 1 && respondentFlag == "true") {    
    questFlags.put("DisplayConfirmAge2Inst","2");
  }
  if(age > 0 && respondentFlag == "false") {
    questFlags.put("DisplayConfirmAge2Inst","3");
  }
  if(age < 1 && respondentFlag == "false") {
    questFlags.put("DisplayConfirmAge2Inst","4");
  }
  ENUMCB.updateDKRefVisibility("ConfirmAge2");
}

/*
*		Created by: Kyle Gravel
*       Updated by: Mike Squitieri
*		Placeholder: Currently increments roster member
*/

function EnumCB_ConfirmAge2_POST() {
  /* var putNextQuestion = QF.put("NextSurveyQuestion", "ChangeAge2_QSTN"); */
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if(isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_YES_IND", "pyWorkPage.HouseholdMemberTemp.DKRefused.ConfirmAge2", "PleaseProvideAnAnswer"); 
  } else {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_YES_IND", "", "PleaseProvideAnAnswer"); 
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPage.hasMessages()) {
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var DKR_Page = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
	var QF = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var confirmAge2 = respPage.get("P_AGE_CONF_YES_IND").getValue();
    var confirmAge2_DKR = DKR_Page.get("ConfirmAge2").getValue();
    var rosterSize = QF.get("CurrentRosterSize").getValue();
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpCurrentHHMemberIndex = cpHouseholdRoster.get("CurrentHHMemberIndex");
    var rosterSize = cpHouseholdRoster.get("HouseholdMember").size();

    if((confirmAge2 == "1") || (confirmAge2_DKR !== "")) {
      respPage.put("P_AGE_CONF_YES_IND","1");
      respPage.put("P_AGE_CONF_NO_IND","0");
      var age = respPage.get("P_AGE_CH_INT");
      if (age) {
        var hhTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
        hhTemp.put("AgeText",age.getValue());
      }
      var params = {isFirstTimeProp:"IsFirstTimeDOB"};
      ENUMCB.updateMemberIndexPost(params);
      ENUMCB.AreParentsYoungerthanChildren();
      if (cpCurrentHHMemberIndex) {
        if (parseInt(cpCurrentHHMemberIndex.getValue()) > rosterSize) {
          var putNextQuestion = QF.put("NextSurveyQuestion", "Race_QSTN");
        } else {
          var putNextQuestion = QF.put("NextSurveyQuestion", "DOB_QSTN");
        }
      }
    } else {
      respPage.put("P_AGE_CONF_YES_IND","0");
      respPage.put("P_AGE_CONF_NO_IND","1");
	  var putNextQuestion = QF.put("NextSurveyQuestion", "ChangeAge2_QSTN");
    }
    
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ConfirmAge2", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CONF_REF_IND");
  }
}

/*
* Pre function for Change Age 2
* Created by Jeremy Helm
* US-2213
*/
function EnumCB_ChangeAge2_PRE(){
  if(pega.mobile.isHybrid){
    var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    cpHouseholdMemberTemp.put("P_AGE_CH_INT","");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isGoingBack = cpQuestFlags.get("IsGoingBack").getValue();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var HHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    if (isGoingBack+"" == "true") {
      var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
      var currentHHIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
      if (previousQuestion == "DOB_QSTN") {
        currentHHIndex = currentHHIndex -1;
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      }
      CB.getMemberFromRoster(currentHHIndex);
    }
    CB.toggleFlag("ExitSurveyEnabled","true");
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("ChangeAge2");
  }
}

/*
* Post function for Change Age 2
* Created by Jeremy Helm
* US-2213
*/

function EnumCB_ChangeAge2_POST(){
  if(pega.mobile.isHybrid){
    ENUMCB.ChangeAge2_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    if (!workPage.hasMessages()) {
      var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if (cpHouseholdMember && cpHouseholdRoster && cpQuestFlags) {
        var age = "";
        var dkRefused = cpHouseholdMember.get("DKRefused.ChangeAge2");
        if (dkRefused && (dkRefused.getValue() == "D" || dkRefused.getValue() == "R")) {
          age = dkRefused.getValue();
          responsePage.put("P_AGE_CH_INT",age);
        } else {
          age = responsePage.get("P_AGE_CH_INT").getValue();
        }
        cpHouseholdMember.put("AgeText",age);
        ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeAge2", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CH_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_CH_REF_IND");
        var params = {isFirstTimeProp: "IsFirstTimeDOB"};
        ENUMCB.updateMemberIndexPost(params);
        ENUMCB.AreParentsYoungerthanChildren();
      }
    }
  }
}

/**
* Pre Function for Relationship Check
* Created by: David Bourque
**/
function EnumCB_RelationshipCheck_PRE() {
  CB.toggleFlag("ExitSurveyEnabled","true");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var cpRespondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
  if (cpQuestFlags && cpHouseholdRoster && cpHHMemberTemp && cpRespondent) {
    /* set IsInPersonOrTelephoneRespondent */
    ENUMCB.setRosterRelationshipText();
    var nrfuAttemptTypeCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_ATTEMPT_TYPE_CODE").getValue();
    var respTypeCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.RESP_TYPE_CODE").getValue();
    if((nrfuAttemptTypeCode == "PV" || nrfuAttemptTypeCode == "TA" || nrfuAttemptTypeCode == "TB" || nrfuAttemptTypeCode == "TC") && respTypeCode == "HH"){
      cpQuestFlags.put("IsInPersonOrTelephoneRespondent","true");
    }
    else {
      cpQuestFlags.put("IsInPersonOrTelephoneRespondent","false");
    }

    /* set P_REFERENCE_PERSON_IND if not set */
    var cpReferencePersonInd = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.P_REFERENCE_PERSON_IND");
    if(!cpReferencePersonInd){
      var cpResponse = cpRespondent.get("Response");
      cpResponse.put("P_REFERENCE_PERSON_IND","0");
    }

    var cpCurrentHHMemberIndex = cpHouseholdRoster.get("CurrentHHMemberIndex");
    var rosterSize = cpHouseholdRoster.get("HouseholdMember").size();
    if (cpCurrentHHMemberIndex) {
      if (parseInt(cpCurrentHHMemberIndex.getValue()) > rosterSize) {
        cpQuestFlags.put("IsFirstTimeRelationshipCheck","true");
      } 
    }
    var isFirstTimeRelationshipCheck = cpQuestFlags.get("IsFirstTimeRelationshipCheck").getValue();
    if (isFirstTimeRelationshipCheck == "true") {
      var currentHHMemberIndex = 1;
      for (currentHHMemberIndex; currentHHMemberIndex <= rosterSize; currentHHMemberIndex++) {
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
      cpQuestFlags.put("IsFirstTimeRelationshipCheck","false");
    }
    var isGoingBack = cpQuestFlags.get("IsGoingBack").getValue();
    if(cpQuestFlags.get("IsGoingForward").getValue() == "true"){
      cpQuestFlags.put("SkipDec", "false");
    }
    if(cpQuestFlags.get("SkipDec").getValue() == "false" && cpQuestFlags.get("IsGoingBack").getValue() == "true"){
      ENUMCB.getNextRelCheckPre();
    }else{
      cpQuestFlags.put("SkipDec", "false");
    }
    CB.toggleFlag("DKRFEnabled","true");
    ENUMCB.updateDKRefVisibility("RelationshipCheck");
  }
}

/*
* Post function for Relationship Check
* Created By: David Bourque
*/

function EnumCB_RelationshipCheck_POST() {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  ENUMCB.RelationshipCheck_VLDN();
  if (!workPage.hasMessages()) {
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    if (cpQuestFlags && cpHouseholdRoster && cpHHMemberTemp) {
      cpQuestFlags.put("SkipDec", "false");
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

/**
*	Pre action for ChangeRelationship_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_ChangeRelationship_PRE(){

  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var cpHouseholdMemberList = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");

  if(cpQuestFlags && cpHouseholdRoster && cpHouseholdMemberList){

    if(cpQuestFlags.get("SkipDec").getValue() == "false" && cpQuestFlags.get("IsGoingBack").getValue() == "true"){
      ENUMCB.getNextRelCheckPre();
    }else{
      cpQuestFlags.put("SkipDec", "true");
    }
    CB.toggleFlag("ExitSurveyEnabled","true");
    /*DKRef*/
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("RelationshipResp");
  }
}


/**
*	Post action for ChangeRelationship_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_ChangeRelationship_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationshipValue", "pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationship");
    } 
    else {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationshipValue");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      /*ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RelationshipResp", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); */
      var tempPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      var changeRelationshipValue = tempPage.get("ChangeRelationshipValue");
      questFlags.put("SkipDec", "false");
      if(changeRelationshipValue) {
        changeRelationshipValue = changeRelationshipValue.getValue();
      }
      else {
        changeRelationshipValue = "";
      }
      if(changeRelationshipValue == "SD") {
        questFlags.put("NextSurveyQuestion", "RelationSD_QSTN");
      }
      else if(changeRelationshipValue == "OT") {
        questFlags.put("NextSurveyQuestion", "RelationOT_QSTN");
      }
      else{
        respPage.put("P_REL_CODE", changeRelationshipValue);
        ENUMCB.setRelTextInHouseholdMemberTemp("ChangeRelationshipValue","D_RelationshipOptions_ALL","ChangeRelationship");
        ENUMCB.getNextRelCheckPost();
        questFlags.put("NextSurveyQuestion", "");
      }
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationshipResp_POST:" + e.message);*/
  }
}

/**
* Pre function for ChangeRelation SD
* Created by Dillon Irish
**/

function EnumCB_ChangeRelationSD_PRE(){
  if(pega.mobile.isHybrid){
    var pRelCodeClear = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    if(pRelCodeClear && cpHouseholdMember && cpHouseholdRoster && cpQuestFlags){
      cpQuestFlags.put("SkipDec", "true");

      if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
        ENUMCB.getNextRelCheckPre();
      }

      /*DKRef*/
      CB.toggleFlag("DKRFEnabled", "true");
      ENUMCB.updateDKRefVisibility("ChangeRelationSD");
      CB.toggleFlag("ExitSurveyEnabled","true");
    }
  }
}

/**
* Post function for ChangeRelationSD
* Created by Dillon Irish
**/

function EnumCB_ChangeRelationSD_POST() {
  try {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationSDValue", "pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationSD");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationSDValue");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var cpHouseholdTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if(cpResponse && cpHouseholdTemp){
        cpQuestFlags.put("SkipDec", "false");
        var changeRelationSDValue = cpHouseholdTemp.get("ChangeRelationSDValue").getValue();
        cpResponse.put("P_REL_CODE", changeRelationSDValue);
      }
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var params = "";
      if (cpHouseholdRoster.get("ReferencePerson.RespondantFlag").getValue()+"" == "true") {
        params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      }
      else{
        params = {isFirstTimeProp: "IsFirstTimeRelOther"};
      }
      var dkrefProp = cpHouseholdTemp.get("DKRefused.ChangeRelationSD");
      if (dkrefProp && (dkrefProp.getValue() == "D" || dkrefProp.getValue() == "R")) {
        cpResponse.put("P_REL_CODE","5");
      }

      ENUMCB.setRelTextInHouseholdMemberTemp("ChangeRelationSDValue","D_RelationSDOptions","ChangeRelationSD");
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationSD", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 
      ENUMCB.getNextRelCheckPost();
    }
  }  
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationSD_POST:" + e.message);*/
  }
}

/**
*	Pre action for ChangeRelationOT_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_ChangeRelationOT_PRE(){
  if(pega.mobile.isHybrid){

    var pRelCodeClear = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

    if(pRelCodeClear && cpHouseholdMember && cpHouseholdRoster && cpQuestFlags){

      cpQuestFlags.put("SkipDec", "true");

      if(cpQuestFlags.get("IsGoingBack").getValue() == "true"){
        ENUMCB.getNextRelCheckPre();
      }
      CB.toggleFlag("ExitSurveyEnabled","true");
      /*DKRef*/
      CB.toggleFlag("DKRFEnabled", "true");
      ENUMCB.updateDKRefVisibility("ChangeRelationOT");
    }
  }
}


/**
*	Post action for ChangeRelationOT_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_ChangeRelationOT_POST() {
  try {
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if (isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationOTValue", "pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationOT");
    } 
    else {
      ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ChangeRelationOTValue");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
      var cpHouseholdTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if(cpResponse && cpHouseholdTemp){
        cpQuestFlags.put("SkipDec", "false");
        var changeRelationOTValue = cpHouseholdTemp.get("ChangeRelationOTValue").getValue();
        cpResponse.put("P_REL_CODE", changeRelationOTValue);
      }
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var params = "";
      if (cpHouseholdRoster.get("ReferencePerson.RespondantFlag").getValue() == "true") {
        params = {isFirstTimeProp: "IsFirstTimeRelationshipResp"};
      }
      else{
        params =	{isFirstTimeProp: "IsFirstTimeRelOther"};
      }
      var dkrefProp = cpHouseholdTemp.get("DKRefused.ChangeRelationOT");
      if (dkrefProp && (dkrefProp.getValue() == "D" || dkrefProp.getValue() == "R")) {
        cpResponse.put("P_REL_CODE", 16);
      }
      ENUMCB.setRelTextInHouseholdMemberTemp("ChangeRelationOTValue","D_RelationOTOptions","ChangeRelationOT");
      ENUMCB.getNextRelCheckPost();
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.ChangeRelationOT", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_IND"); 
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RelationOT_POST:" + e.message);*/
  }
}
/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in RaceNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/*
* Pre Function for Race
* Created by David Bourque
*/
function EnumCB_Race_PRE() {
  if(pega.mobile.isHybrid) {
    CB.toggleFlag("ExitSurveyEnabled", "true");
	CB.toggleFlag("DKRFEnabled", "true");
	ENUMCB.updateDKRefVisibility("Race");
	
    var workPG = pega.ui.ClientCache.find("pyWorkPage");
    var previousQuestion = workPG.get("CurrentSurveyQuestion").getValue();
    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
    currentHHMember = currentHHMember ? currentHHMember.getValue() : "";
    var householdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster.HouseholdMember");
    /* Reset flag used to tell if screen has been answered */
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var isRaceAnswered = questFlagsPage.get("IsRaceAnswered");
    isRaceAnswered = isRaceAnswered ? isRaceAnswered.getValue() : "";
    var isGoingBack = questFlagsPage.get("IsGoingBack");
    isGoingBack = isGoingBack ? isGoingBack.getValue() : "";
    /* Update HouseholdMemberTemp with current roster member */
    if(isGoingBack == "true") {
      if(previousQuestion == "Race_QSTN") {
        currentHHMember = currentHHMember - 1;
        CB.getMemberFromRoster(currentHHMember);
        householdRoster.put("CurrentHHMemberIndex",currentHHMember);
      }
      if(previousQuestion == "WhoLivesElsewhere_QSTN") {
        currentHHMember = householdMember.size();
        CB.getMemberFromRoster(currentHHMember);
        householdRoster.put("CurrentHHMemberIndex",currentHHMember);
      }
    }
    else {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      var curMemberIndex = ENUMCB.updateMemberIndexPre(params);
      CB.getMemberFromRoster(curMemberIndex);
    }
  }
}
/*
* Post Function for Race
* Created by Dillon Irish
*/
function EnumCB_Race_POST() {
  /*Retrieve Roster, Questflags, and Response*/
  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var cpRaceFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");

  if(cpResponse && cpQuestFlags && cpRaceFlags ){

    /*Set is firstTimeRace to false*/
    var cpFirstTimeRace = cpQuestFlags.get("IsFirstTimeRace");
	var dkRefProp = dkRefused.get("Race");
    if(cpFirstTimeRace){
      cpFirstTimeRace.setValue("false");
    }

    /*Retrieve Race properties and check if null*/
    var white, hisp, black, asian, aian, mena, nhpi, sor = "";
    var cpWhiteFlag = cpRaceFlags.get("IsRaceWhite");
    if(cpWhiteFlag){
      white = "" + cpWhiteFlag.getValue();
      if(white=="true"){
        cpResponse.put("P_RACE_WHITE_IND", "1");
      }else{
        cpResponse.put("P_RACE_WHITE_IND", "0");
      }
    }
    var cpHispFlag = cpRaceFlags.get("IsRaceHispanic");
    if(cpHispFlag){
      hisp = "" + cpHispFlag.getValue();
      if(hisp=="true"){
        cpResponse.put("P_RACE_HISP_IND", "1");
      }else{
        cpResponse.put("P_RACE_HISP_IND", "0");
      }
    }
    var cpBlackFlag = cpRaceFlags.get("IsRaceBlack");
    if(cpBlackFlag){
      black = "" + cpBlackFlag.getValue();
      if(black=="true"){
        cpResponse.put("P_RACE_BLACK_IND", "1");
      }else{
        cpResponse.put("P_RACE_BLACK_IND", "0");
      }
    }
    var cpAsianFlag = cpRaceFlags.get("IsRaceAsian");
    if(cpAsianFlag){
      asian = "" + cpAsianFlag.getValue();
      if(asian=="true"){
        cpResponse.put("P_RACE_ASIAN_IND", "1");
      }else{
        cpResponse.put("P_RACE_ASIAN_IND", "0");
      }
    }
    var cpAianFlag = cpRaceFlags.get("IsRaceAIAN");
    if(cpAianFlag){
      aian = "" + cpAianFlag.getValue();
      if(aian=="true"){
        cpResponse.put("P_RACE_AIAN_IND", "1");
      }else{
        cpResponse.put("P_RACE_AIAN_IND", "0");
      }
    }
    var cpMenaFlag = cpRaceFlags.get("IsRaceMENA");
    if(cpMenaFlag){
      mena = "" + cpMenaFlag.getValue();
      if(mena=="true"){
        cpResponse.put("P_RACE_MENA_IND", "1");
      }else{
        cpResponse.put("P_RACE_MENA_IND", "0");
      }
    }
    var cpNhpiFlag = cpRaceFlags.get("IsRaceNHPI");
    if(cpNhpiFlag){
      nhpi = "" + cpNhpiFlag.getValue();
      if(nhpi=="true"){
        cpResponse.put("P_RACE_NHPI_IND", "1");
      }else{
        cpResponse.put("P_RACE_NHPI_IND", "0");
      }
    }
    var cpSorFlag = cpRaceFlags.get("IsRaceOther");
    if(cpSorFlag){
      sor = "" + cpSorFlag.getValue();
      if(sor=="true"){
        cpResponse.put("P_RACE_SOR_IND", "1");
      }else{
        cpResponse.put("P_RACE_SOR_IND", "0");
      }
    }
	
	var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	var dkRefSelected = false;
	if(isDKRefVisible){
		if(dkRefProp) {
			var dkRefPropValue = dkRefProp.getValue();
		}
		else {
			var dkRefPropValue = "";
		}
		if(dkRefPropValue == "D") {
			cpResponse.put("P_RACE_DK_IND", "1");
			cpResponse.put("P_RACE_REF_IND", "0");
			dkRefSelected = true;
		}
		else if(dkRefPropValue == "R") {
			cpResponse.put("P_RACE_DK_IND", "0");
			cpResponse.put("P_RACE_REF_IND", "1");
			dkRefSelected = true;
		}
	}

    /*Check if any values were chosen and set isRaceAnswered flag appropriately*/
    if(white=="true"|| hisp=="true" || black=="true" || asian=="true" || aian=="true" || mena=="true" || nhpi=="true" || sor=="true"){
      cpQuestFlags.put("IsRaceAnswered", "true");
      cpQuestFlags.put("HasRaceEverBeenAnswered","true");
    }

    /*Required Validation*/
	var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		ENUMCB.Required("pyWorkPage.QuestFlags.IsRaceAnswered", "pyWorkPage.HouseholdMemberTemp.DKRefused.Race");
	}else{
		ENUMCB.Required("pyWorkPage.QuestFlags.IsRaceAnswered");
	}
	
	ENUMCB.setReviewRacePage("RaceEthnicity");
	if(dkRefSelected == true){
		var params = {isFirstTimeProp: "IsFirstTimeRace"};
		ENUMCB.updateMemberIndexPost(params);
	}

  }else{
    console.log("ENUMCB Error - " + "Unable to find the Response, QuestFlags, and/or Roster Pages");  
  }
}

/**
*	Pre action for origin white
*	Created by Kyle Gravel
**/
function EnumCB_EthnicityWhite_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginW");
  ENUMCB.getMemberForEthnicityQuestion();
}

/**
*	Post action for details origin white
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityWhite_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var ethWhiteEnglish = ethFlags.get("IsEthnicityWhiteEnglish").getValue();
  var ethWhiteFrench = ethFlags.get("IsEthnicityWhiteFrench").getValue();
  var ethWhiteGerman = ethFlags.get("IsEthnicityWhiteGerman").getValue();
  var ethWhiteIrish = ethFlags.get("IsEthnicityWhiteIrish").getValue();
  var ethWhiteItalian = ethFlags.get("IsEthnicityWhiteItalian").getValue();
  var ethWhitePolish = ethFlags.get("IsEthnicityWhitePolish").getValue();
  var writeInValue = respPage.get("P_RACE2_WHITE_TEXT").getValue();
  var dkRefProp = dkRefused.get("DetailedOriginW");
  var numberSelected = 0;

  if(ethWhiteEnglish) {
    respPage.put("P_RACE2_ENGLISH_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ENGLISH_IND", "0");
  }
  if(ethWhiteFrench) {
    respPage.put("P_RACE2_FRENCH_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_FRENCH_IND", "0");
  }
  if(ethWhiteGerman) {
    respPage.put("P_RACE2_GERMAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_GERMAN_IND", "0");
  }
  if(ethWhiteIrish) {
    respPage.put("P_RACE2_IRISH_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_IRISH_IND", "0");
  }
  if(ethWhiteItalian) {
    respPage.put("P_RACE2_ITALIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ITALIAN_IND", "0");
  }
  if(ethWhitePolish) {
    respPage.put("P_RACE2_POLISH_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_POLISH_IND", "0");
  }
  if(writeInValue != "") {
    ethFlags.put("IsEthnicityWhiteWriteIn",writeInValue);
    numberSelected++;
  }
  
	var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		if(dkRefProp) {
			dkRefProp = dkRefProp.getValue();
		}
		else {
			dkRefProp = "";
		}
		if(dkRefProp == "D") {
			respPage.put("P_RACE2_WHITE_DK_IND", "1");
			respPage.put("P_RACE2_WHITE_REF_IND", "0");
			numberSelected++;
		}
		else if(dkRefProp == "R") {
			respPage.put("P_RACE2_WHITE_DK_IND", "0");
			respPage.put("P_RACE2_WHITE_REF_IND", "1");
			numberSelected++;
		}
	}
  
  ENUMCB.EthnicityWhite_VLDN(numberSelected);
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("WHITE")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Function for black pre action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityBlack_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginB");
  ENUMCB.getMemberForEthnicityQuestion();
}

/**
*	Function for black post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityBlack_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var ethBlackAfAm = ethFlags.get("IsEthnicityBlackAfricanAmerican").getValue();
  var ethBlackEthiopian = ethFlags.get("IsEthnicityBlackEthiopian").getValue();
  var ethBlackHaitian = ethFlags.get("IsEthnicityBlackHaitian").getValue();
  var ethBlackJamaican = ethFlags.get("IsEthnicityBlackJamaican").getValue();
  var ethBlackNigerian = ethFlags.get("IsEthnicityBlackNigerian").getValue();
  var ethBlackSomali = ethFlags.get("IsEthnicityBlackSomali").getValue();
  var writeInValue = respPage.get("P_RACE2_BLACK_TEXT").getValue();
  var dkRefProp = dkRefused.get("DetailedOriginB");
  var numberSelected = 0;

  if(ethBlackAfAm) {
    respPage.put("P_RACE2_AFAM_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_AFAM_IND", "0");
  }
  if(ethBlackEthiopian) {
    respPage.put("P_RACE2_ETHIOPIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ETHIOPIAN_IND", "0");
  }
  if(ethBlackHaitian) {
    respPage.put("P_RACE2_HAITIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_HAITIAN_IND", "0");
  }
  if(ethBlackJamaican) {
    respPage.put("P_RACE2_JAMAICAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_JAMAICAN_IND", "0");
  }
  if(ethBlackNigerian) {
    respPage.put("P_RACE2_NIGERIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_NIGERIAN_IND", "0");
  }
  if(ethBlackSomali) {
    respPage.put("P_RACE2_SOMALI_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SOMALI_IND", "0");
  }
  if(writeInValue != "") {
    ethFlags.put("IsEthnicityBlackWriteIn",writeInValue);
    numberSelected++;
  }
  
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		if(dkRefProp) {
			dkRefProp = dkRefProp.getValue();
		}
		else {
			dkRefProp = "";
		}
		if(dkRefProp == "D") {
			respPage.put("P_RACE2_BLACK_DK_IND", "1");
			respPage.put("P_RACE2_BLACK_REF_IND", "0");
			numberSelected++;
		}
		else if(dkRefProp == "R") {
			respPage.put("P_RACE2_BLACK_DK_IND", "0");
			respPage.put("P_RACE2_BLACK_REF_IND", "1");
			numberSelected++;
		}
	}
	
  ENUMCB.EthnicityBlack_VLDN(numberSelected);
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("BLACK")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Function for asian pre action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityAsian_PRE() {
	CB.toggleFlag("DKREFEnabled", "true");
	ENUMCB.updateDKRefVisibility("DetailedOriginA");
	ENUMCB.getMemberForEthnicityQuestion();
}


/**
*	Function for asian post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityAsian_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var ethAsianIndian = ethFlags.get("IsEthnicityAsianAsianIndian").getValue();
  var ethAsianChinese = ethFlags.get("IsEthnicityAsianChinese").getValue();
  var ethAsianFilipino = ethFlags.get("IsEthnicityAsianFilipino").getValue();
  var ethAsianJapanese = ethFlags.get("IsEthnicityAsianJapanese").getValue();
  var ethAsianKorean = ethFlags.get("IsEthnicityAsianKorean").getValue();
  var ethAsianVietnamese = ethFlags.get("IsEthnicityAsianVietnamese").getValue();
  var writeInValue = respPage.get("P_RACE2_ASIAN_TEXT").getValue();
  var dkRefProp = dkRefused.get("DetailedOriginA");
  var numberSelected = 0;

  if(ethAsianIndian) {
    respPage.put("P_RACE2_INDIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_INDIAN_IND", "0");
  }
  if(ethAsianChinese) {
    respPage.put("P_RACE2_CHINESE_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_CHINESE_IND", "0");
  }
  if(ethAsianFilipino) {
    respPage.put("P_RACE2_FILIPINO_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_FILIPINO_IND", "0");
  }
  if(ethAsianJapanese) {
    respPage.put("P_RACE2_JAPANESE_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_JAPANESE_IND", "0");
  }
  if(ethAsianKorean) {
    respPage.put("P_RACE2_KOREAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_KOREAN_IND", "0");
  }
  if(ethAsianVietnamese) {
    respPage.put("P_RACE2_VIETNAMESE_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_VIETNAMESE_IND", "0");
  }
  if(writeInValue != "") {
    ethFlags.put("IsEthnicityAsianWriteIn",writeInValue);
    numberSelected++;
  }
  
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		if(dkRefProp) {
			dkRefProp = dkRefProp.getValue();
		}
		else {
			dkRefProp = "";
		}
		if(dkRefProp == "D") {
			respPage.put("P_RACE2_ASIAN_DK_IND", "1");
			respPage.put("P_RACE2_ASIAN_REF_IND", "0");
			numberSelected++;
		}
		else if(dkRefProp == "R") {
			respPage.put("P_RACE2_ASIAN_DK_IND", "0");
			respPage.put("P_RACE2_ASIAN_REF_IND", "1");
			numberSelected++;
		}
	}
	
  ENUMCB.EthnicityAsian_VLDN(numberSelected);
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("ASIAN")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Pre action for origin hispanic
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityHispanic_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginH");
  ENUMCB.getMemberForEthnicityQuestion();
}
/**
*	Function for hispanic post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityHispanic_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var ethHispColombian = ethFlags.get("IsEthnicityHispanicColombian").getValue();
  var ethHispCuban = ethFlags.get("IsEthnicityHispanicCuban").getValue();
  var ethHispDominican = ethFlags.get("IsEthnicityHispanicDominican").getValue();
  var ethHispMexican = ethFlags.get("IsEthnicityHispanicMexican").getValue();
  var ethHispPuertoRican = ethFlags.get("IsEthnicityHispanicPuertoRican").getValue();
  var ethHispSalvadoran = ethFlags.get("IsEthnicityHispanicSalvadoran").getValue();
  var writeInValue = respPage.get("P_RACE2_HISP_TEXT").getValue();
  var dkRefProp = dkRefused.get("DetailedOriginH");
  var numberSelected = 0;

  if(ethHispColombian) {
    respPage.put("P_RACE2_COLOMBIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_COLOMBIAN_IND", "0");
  }
  if(ethHispCuban) {
    respPage.put("P_RACE2_CUBAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_CUBAN_IND", "0");
  }
  if(ethHispDominican) {
    respPage.put("P_RACE2_DOMINICAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_DOMINICAN_IND", "0");
  }
  if(ethHispMexican) {
    respPage.put("P_RACE2_MEXICAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_MEXICAN_IND", "0");
  }
  if(ethHispPuertoRican) {
    respPage.put("P_RACE2_PUERTORICAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_PUERTORICAN_IND", "0");
  }
  if(ethHispSalvadoran) {
    respPage.put("P_RACE2_SALVADORAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SALVADORAN_IND", "0");
  }
  if(writeInValue != "") {
    ethFlags.put("IsEthnicityHispanicWriteIn",writeInValue);
    numberSelected++;
  }
  
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		if(dkRefProp) {
			dkRefProp = dkRefProp.getValue();
		}
		else {
			dkRefProp = "";
		}
		if(dkRefProp == "D") {
			respPage.put("P_RACE2_HISP_DK_IND", "1");
			respPage.put("P_RACE2_HISP_REF_IND", "0");
			numberSelected++;
		}
		else if(dkRefProp == "R") {
			respPage.put("P_RACE2_HISP_DK_IND", "0");
			respPage.put("P_RACE2_HISP_REF_IND", "1");
			numberSelected++;
		}
	}
	
  ENUMCB.EthnicityHispanic_VLDN(numberSelected);
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("HISP")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Function for aian pre action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityAIAN_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginAIAN");
  ENUMCB.getMemberForEthnicityQuestion();
}

/**
*	Function for aian post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityAIAN_POST() {
  ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_AIAN_TEXT", "pyWorkPage.HouseholdMemberTemp.DKRefused.DetailedOriginAIAN");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var dkRefProp = dkRefused.get("DetailedOriginAIAN");

    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if(isDKRefVisible){
      if(dkRefProp) {
        dkRefProp = dkRefProp.getValue();
      }
      else {
        dkRefProp = "";
      }
      if(dkRefProp == "D") {
        respPage.put("P_RACE2_AIAN_DK_IND", "1");
        respPage.put("P_RACE2_AIAN_REF_IND", "0");
      }
      else if(dkRefProp == "R") {
        respPage.put("P_RACE2_AIAN_DK_IND", "0");
        respPage.put("P_RACE2_AIAN_REF_IND", "1");
      }
    }

    var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
    var writeInValue = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_AINDIAN_TEXT").getValue();
    ethFlags.put("IsEthnicityAIANWriteIn",writeInValue);
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("AIAN")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Function for mena pre action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityMENA_PRE() {
  ENUMCB.getMemberForEthnicityQuestion();
  CB.toggleFlag("ExitSurveyEnabled", "true");
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginMENA");
}

/**
*	Function for mena post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityMENA_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var ethMENAEgyptian = ethFlags.get("IsEthnicityMENAEgyptian").getValue();
  var ethMENAIranian = ethFlags.get("IsEthnicityMENAIranian").getValue();
  var ethMENAIsraeli = ethFlags.get("IsEthnicityMENAIsraeli").getValue();
  var ethMENALebanese = ethFlags.get("IsEthnicityMENALebanese").getValue();
  var ethMENAMoroccan = ethFlags.get("IsEthnicityMENAMoroccan").getValue();
  var ethMENASyrian = ethFlags.get("IsEthnicityMENASyrian").getValue();
  var writeInValue = respPage.get("P_RACE2_MENA_TEXT").getValue();
  var dkRefProp = dkRefused.get("DetailedOriginMENA");
  var numberSelected = 0;

  if(ethMENAEgyptian) {
    respPage.put("P_RACE2_EGYPTIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_EGYPTIAN_IND", "0");
  }
  if(ethMENAIranian) {
    respPage.put("P_RACE2_IRANIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_IRANIAN_IND", "0");
  }
  if(ethMENAIsraeli) {
    respPage.put("P_RACE2_ISRAELI_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ISRAELI_IND", "0");
  }
  if(ethMENALebanese) {
    respPage.put("P_RACE2_LEBANESE_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_LEBANESE_IND", "0");
  }
  if(ethMENAMoroccan) {
    respPage.put("P_RACE2_MOROCCAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_MOROCCAN_IND", "0");
  }
  if(ethMENASyrian) {
    respPage.put("P_RACE2_SYRIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SYRIAN_IND", "0");
  }
  if(writeInValue != "") {
    ethFlags.put("IsEthnicityMENAWriteIn",writeInValue);
    numberSelected++;
  }
  
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		if(dkRefProp) {
			dkRefProp = dkRefProp.getValue();
		}
		else {
			dkRefProp = "";
		}
		if(dkRefProp == "D") {
			respPage.put("P_RACE2_MENA_DK_IND", "1");
			respPage.put("P_RACE2_MENA_REF_IND", "0");
			numberSelected++;
		}
		else if(dkRefProp == "R") {
			respPage.put("P_RACE2_MENA_DK_IND", "0");
			respPage.put("P_RACE2_MENA_REF_IND", "1");
			numberSelected++;
		}
	}
	
  ENUMCB.EthnicityMENA_VLDN(numberSelected);
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("MENA")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Function for nhpi pre action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityNHPI_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.getMemberForEthnicityQuestion();
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginNHPI");
}

/**
*	Function for nhpi post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityNHPI_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
  var ethNHPIChamorro = ethFlags.get("IsEthnicityNHPIChamorro").getValue();
  var ethNHPIFijian = ethFlags.get("IsEthnicityNHPIFijian").getValue();
  var ethNHPIMarshallese = ethFlags.get("IsEthnicityNHPIMarshallese").getValue();
  var ethNHPINativeHawaiian = ethFlags.get("IsEthnicityNHPINativeHawaiian").getValue();
  var ethNHPISamoan = ethFlags.get("IsEthnicityNHPISamoan").getValue();
  var ethNHPITongan = ethFlags.get("IsEthnicityNHPITongan").getValue();
  var writeInValue = respPage.get("P_RACE2_NHPI_TEXT").getValue();
  var dkRefProp = dkRefused.get("DetailedOriginNHPI");
  var numberSelected = 0;

  if(ethNHPIChamorro) {
    respPage.put("P_RACE2_CHAMORRO_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_CHAMORRO_IND", "0");
  }
  if(ethNHPIFijian) {
    respPage.put("P_RACE2_FIJIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_FIJIAN_IND", "0");
  }
  if(ethNHPIMarshallese) {
    respPage.put("P_RACE2_MARSHALLESE_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_MARSHALLESE_IND", "0");
  }
  if(ethNHPINativeHawaiian) {
    respPage.put("P_RACE2_NATHAWAIIAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_NATHAWAIIAN_IND", "0");
  }
  if(ethNHPISamoan) {
    respPage.put("P_RACE2_SAMOAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SAMOAN_IND", "0");
  }
  if(ethNHPITongan) {
    respPage.put("P_RACE2_TONGAN_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_TONGAN_IND", "0");
  }
  if(writeInValue != "") {
    ethFlags.put("IsEthnicityNHPIWriteIn",writeInValue);
    numberSelected++;
  }
  
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
	if(isDKRefVisible){
		if(dkRefProp) {
			dkRefProp = dkRefProp.getValue();
		}
		else {
			dkRefProp = "";
		}
		if(dkRefProp == "D") {
			respPage.put("P_RACE2_NHPI_DK_IND", "1");
			respPage.put("P_RACE2_NHPI_REF_IND", "0");
			numberSelected++;
		}
		else if(dkRefProp == "R") {
			respPage.put("P_RACE2_NHPI_DK_IND", "0");
			respPage.put("P_RACE2_NHPI_REF_IND", "1");
			numberSelected++;
		}
	}
	
  ENUMCB.EthnicityNHPI_VLDN(numberSelected);
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("NHPI")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}

/**
*	Function for other pre action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityOther_PRE() {
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.getMemberForEthnicityQuestion();
  CB.toggleFlag("DKREFEnabled", "true");
  ENUMCB.updateDKRefVisibility("DetailedOriginSOR");
}

/**
*	Function for other post action
*	Created by Omar Mohammed
**/
function EnumCB_EthnicityOther_POST() {
  ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_SOR_TEXT", "pyWorkPage.HouseholdMemberTemp.DKRefused.DetailedOriginSOR");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var dkRefProp = dkRefused.get("DetailedOriginSOR");

    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if(isDKRefVisible){
      if(dkRefProp) {
        dkRefProp = dkRefProp.getValue();
      }
      else {
        dkRefProp = "";
      }
      if(dkRefProp == "D") {
        respPage.put("P_RACE2_SOR_DK_IND", "1");
        respPage.put("P_RACE2_SOR_REF_IND", "0");
      }
      else if(dkRefProp == "R") {
        respPage.put("P_RACE2_SOR_DK_IND", "0");
        respPage.put("P_RACE2_SOR_REF_IND", "1");
      }
    }

    var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RaceEthnicity");
    var writeInValue = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_SOR_TEXT").getValue();
    ethFlags.put("IsEthnicityOtherWriteIn",writeInValue);
    ENUMCB.setReviewRacePage("RaceEthnicity");
    if(ENUMCB.isLastOriginQuestion("OTHER")) {
      var params = {isFirstTimeProp: "IsFirstTimeRace"};
      ENUMCB.updateMemberIndexPost(params);
    }
  }
}
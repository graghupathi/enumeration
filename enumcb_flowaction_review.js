/*************************************************************************************************
*	Begin Pre/Post actions for question shapes in ReviewNRFUSub
*	DO NOT USE NAMESPACE FOR PRE/POST
*************************************************************************************************/

/*
* Pre Function for Review
* Created by Dillon Irish
*/
function EnumCB_Review_PRE() {
  if(pega.mobile.isHybrid) {
    CB.toggleFlag("ExitSurveyEnabled", "true");

    /* Reset flag used to tell if screen has been answered */
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var dpRelationshipOptions = pega.ui.ClientCache.find("D_RelationshipOptions.pxResults").iterator();

    if (questFlagsPage && cpResponse) {
      var isReviewAnswered = questFlagsPage.get("IsReviewAnswered");
      if (isReviewAnswered) {
        isReviewAnswered.setValue("");
      }

      /* Update HouseholdMemberTemp with current roster member */
      var isGoingBack = questFlagsPage.get("IsGoingBack").getValue();
      var workPage = pega.ui.ClientCache.find("pyWorkPage");
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var currentHHIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
      var previousQuestion = workPage.get("CurrentSurveyQuestion").getValue();
      if (isGoingBack+"" == "true") {        
        if (previousQuestion == "Review_QSTN") {
          currentHHIndex = currentHHIndex -1;
          cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
        } else if (previousQuestion == "BestTime_QSTN") {
          currentHHIndex = cpHouseholdRoster.get("HouseholdMember").size();
          cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
        }
        else
        {
           return;
        }
      }
      var rosterSize = cpHouseholdRoster.get("HouseholdMember").size();
      if (currentHHIndex > rosterSize || previousQuestion == "WhoLivesElsewhere_QSTN" || previousQuestion == "WhyLiveElsewhere_QSTN") {
        questFlagsPage.put("IsFirstTimeReview","true");
      } 
      var isFirstTimeReview = questFlagsPage.get("IsFirstTimeReview").getValue();
      if (isFirstTimeReview+"" == "true") {
        currentHHIndex = 1;
        cpHouseholdRoster.put("CurrentHHMemberIndex",currentHHIndex);
      }
      CB.getMemberFromRoster(currentHHIndex);


      /* Set AgeLessThanOne flag*/
      var age = cpHouseholdMemberTemp.get("AgeText");
      if (age) {
        age = age.getValue();
        if (age == "D" || age == "Don't Know") {
          questFlagsPage.put("AgeLessThanOne", "false");
          cpHouseholdMemberTemp.put("ReviewAge","Don't Know");
          cpHouseholdMemberTemp.put("IsBornAfterCensus","false");
        } else if (age == "R" || age == "Refused") {
          questFlagsPage.put("AgeLessThanOne", "false");
          cpHouseholdMemberTemp.put("ReviewAge","Refused");
          cpHouseholdMemberTemp.put("IsBornAfterCensus","false");
        } else {
          age = parseInt(age);
          if (age == -1) {
            cpHouseholdMemberTemp.put("IsBornAfterCensus","true");
          } else if(age < 1){
            questFlagsPage.put("AgeLessThanOne", "true");
            cpHouseholdMemberTemp.put("IsBornAfterCensus","false");
          }else{
            questFlagsPage.put("AgeLessThanOne", "false");
            cpHouseholdMemberTemp.put("IsBornAfterCensus","false");
          }
          cpHouseholdMemberTemp.put("ReviewAge",age);
        }
      }

      /*
			var cpRelationshipCode = (cpResponse.get("P_REL_CODE"));
			if (cpRelationshipCode){
				var relationshipCode = parseInt(cpResponse.get("P_REL_CODE").getValue());
				while(dpRelationshipOptions.hasNext()){
					var currentPage = dpRelationshipOptions.next();
					if(parseInt(currentPage.get("pyValue").getValue())==relationshipCode){
						cpHouseholdMemberTemp.put("Relationship", currentPage.get("pyDescription").getValue());
					}	
				}
            } 
            */
      ENUMCB.setRosterRelationshipText();
    }


    /* This is used to build out the concatenated Race String */
    var strRaceForDisplay = "";
    var ethnicityPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.ReviewRaceEthnicity");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var cpHHMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    if (cpHHMemberTemp && ethnicityPage && responsePage) {
      var isWhite = ethnicityPage.get("IsRaceWhite");			
      if (isWhite && (isWhite.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceWhite") + " ";
        var isGerman = ethnicityPage.get("IsEthnicityWhiteGerman");
        if (isGerman && (isGerman.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityGerman") + " ";
        }
        var isIrish = ethnicityPage.get("IsEthnicityWhiteIrish");
        if (isIrish && (isIrish.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityIrish") + " ";
        }
        var isEnglish = ethnicityPage.get("IsEthnicityWhiteEnglish");
        if (isEnglish && (isEnglish.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityEnglish") + " ";
        }
        var isItalian = ethnicityPage.get("IsEthnicityWhiteItalian");
        if (isItalian && (isItalian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "Ethnicity Italian") + " ";
        }
        var isPolish = ethnicityPage.get("IsEthnicityWhitePolish");
        if (isPolish && (isPolish.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityPolish") + " ";
        }
        var isFrench = ethnicityPage.get("IsEthnicityWhiteFrench");
        if (isFrench && (isFrench.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityFrench") + " ";
        }
        var isWhiteFillIn = ethnicityPage.get("IsEthnicityWhiteWriteIn");
        if (isWhiteFillIn && (isWhiteFillIn.getValue() !== "")) {
          strRaceForDisplay += " " + isWhiteFillIn.getValue() + " ";
        }
      }
      var isHispanic = ethnicityPage.get("IsRaceHispanic");
      if (isHispanic && (isHispanic.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceHispanic") + " ";
        var isMexican = ethnicityPage.get("IsEthnicityHispanicMexican");
        if (isMexican && (isMexican.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityHispMexican") + " ";
        }
        var isPuertoRican = ethnicityPage.get("IsEthnicityHispanicPuertoRican");
        if (isPuertoRican && (isPuertoRican.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityHispPuertoRican") + " ";
        }
        var isCuban = ethnicityPage.get("IsEthnicityHispanicCuban");
        if (isCuban && (isCuban.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityHispCuban") + " ";
        }
        var isSalvadoran = ethnicityPage.get("IsEthnicityHispanicSalvadoran");
        if (isSalvadoran && (isSalvadoran.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityHispSalvadoran") + " ";
        }
        var isDominican = ethnicityPage.get("IsEthnicityHispanicDominican");
        if (isDominican && (isDominican.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityHispDominican") + " ";
        }
        var isColombian = ethnicityPage.get("IsEthnicityHispanicColombian");
        if (isColombian && (isColombian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityHispColombian") + " ";
        }
        var isHispFillIn = ethnicityPage.get("IsEthnicityHispanicWriteIn");
        if (isHispFillIn && (isHispFillIn.getValue() !== "")) {
          strRaceForDisplay += " " + isHispFillIn.getValue() + " ";
        }
      }
      var isBlack = ethnicityPage.get("IsRaceBlack");
      if (isBlack && (isBlack.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceBlack") + " ";
        var isAfricanAmerican = ethnicityPage.get("IsEthnicityBlackAfricanAmerican");
        if (isAfricanAmerican && (isAfricanAmerican.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityBlackAfricanAmerican") + " ";
        }
        var isJamaican = ethnicityPage.get("IsEthnicityBlackJamaican");
        if (isJamaican && (isJamaican.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityBlackJamaican") + " ";
        }
        var isHaitian = ethnicityPage.get("IsEthnicityBlackHaitian");
        if (isHaitian && (isHaitian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityBlackHaitian") + " ";
        }
        var isNigerian = ethnicityPage.get("IsEthnicityBlackNigerian");
        if (isNigerian && (isNigerian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityBlackNigerian") + " ";
        }
        var isEthiopian = ethnicityPage.get("IsEthnicityBlackEthiopian");
        if (isEthiopian && (isEthiopian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityBlackEthiopian") + " ";
        }
        var isSomali = ethnicityPage.get("IsEthnicityBlackSomali");
        if (isSomali && (isSomali.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityBlackSomali") + " ";
        }
        var isBlackFillIn = ethnicityPage.get("IsEthnicityBlackWriteIn");
        if (isBlackFillIn && isBlackFillIn.getValue() !== "") {
          strRaceForDisplay += " " + isBlackFillIn.getValue() + " ";
        }
      }
      var isAsian = ethnicityPage.get("IsRaceAsian");
      if (isAsian && isAsian.getValue() == "true") {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceAsian") + " ";
        var isChinese = ethnicityPage.get("IsEthnicityAsianChinese");
        if (isChinese && (isChinese.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityAsianChinese") + " ";
        }
        var isFilipino = ethnicityPage.get("IsEthnicityAsianFilipino");
        if (isFilipino && (isFilipino.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityAsianFilipino") + " ";
        }
        var isAsianIndian = ethnicityPage.get("IsEthnicityAsianAsianIndian");
        if (isAsianIndian && (isAsianIndian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityAsianAsianIndian") + " ";
        }
        var isVietnamese = ethnicityPage.get("IsEthnicityAsianVietnamese");
        if (isVietnamese && (isVietnamese.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityAsianViet") + " ";
        }
        var isKorean = ethnicityPage.get("IsEthnicityAsianKorean");
        if (isKorean && (isKorean.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityAsianKorean") + " ";
        }
        var isJapanese = ethnicityPage.get("IsEthnicityAsianJapanese");
        if (isJapanese && (isJapanese.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityAsianJapanese") + " ";
        }
        var isAsianFillIn = ethnicityPage.get("IsEthnicityAsianWriteIn");
        if (isAsianFillIn && (isAsianFillIn.getValue() !== "")) {
          strRaceForDisplay += " " + isAsianFillIn.getValue() + " ";
        }
      }
      var isAIAN = ethnicityPage.get("IsRaceAIAN");
      if (isAIAN && (isAIAN.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceAIAN") + " ";
        var isAIANFillIn = ethnicityPage.get("IsEthnicityAIANWriteIn");
        if (isAIANFillIn && (isAIANFillIn.getValue() !== "")) {
          strRaceForDisplay += " " + isAIANFillIn.getValue() + " ";
        }
      }
      var isMENA = ethnicityPage.get("IsRaceMENA");
      if (isMENA && (isMENA.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceMENA") + " ";
        var isLebanese = ethnicityPage.get("IsEthnicityMENALebanese");
        if (isLebanese && (isLebanese.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityMENALebanese") + " ";
        }
        var isIranian = ethnicityPage.get("IsEthnicityMENAIranian");
        if (isIranian && (isIranian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityMENAIranian") + " ";
        }
        var isEgyptian = ethnicityPage.get("IsEthnicityMENAEgyptian");
        if (isEgyptian && (isEgyptian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityMENAEgyptian") + " ";
        }
        var isSyrian = ethnicityPage.get("IsEthnicityMENASyrian");
        if (isSyrian && (isSyrian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityMENASyrian") + " ";
        }
        var isMoroccan = ethnicityPage.get("IsEthnicityMENAMoroccan");
        if (isMoroccan && (isMoroccan.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityMENAMoroccan") + " ";
        }
        var isIsraeli = ethnicityPage.get("IsEthnicityMENAIsraeli");
        if (isIsraeli && (isIsraeli.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityMENAIsraeli") + " ";
        }
        var isMENAFillIn = ethnicityPage.get("IsEthnicityMENAWriteIn");
        if (isMENAFillIn && (isMENAFillIn.getValue() !== "")) {
          strRaceForDisplay += " " + isMENAFillIn.getValue() + " ";
        }
      }
      var isNHPI = ethnicityPage.get("IsRaceNHPI");
      if (isNHPI && (isNHPI.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceNHPI") + " ";
        var isNativeHawaiian = ethnicityPage.get("IsEthnicityNHPINativeHawaiian");
        if (isNativeHawaiian && (isNativeHawaiian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityNHPINativeHawaiian") + " ";
        }
        var isSamoan = ethnicityPage.get("IsEthnicityNHPISamoan");
        if (isSamoan && (isSamoan.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityNHPISamoan") + " ";
        }
        var isChamorro = ethnicityPage.get("IsEthnicityNHPIChamorro");
        if (isChamorro && (isChamorro.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityNHPIChamorro") + " ";
        }
        var isTongan = ethnicityPage.get("IsEthnicityNHPITongan");
        if (isTongan && (isTongan.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityNHPITongan") + " ";
        }
        var isFijian = ethnicityPage.get("IsEthnicityNHPIFijian");
        if (isFijian && (isFijian.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityNHPIFijian") + " ";
        }
        var isMarshallese = ethnicityPage.get("IsEthnicityNHPIMarshallese");
        if (isMarshallese && (isMarshallese.getValue() == "true")) {
          strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "EthnicityNHPIMarshallese") + " ";
        }
        var isNHPIFillIn = ethnicityPage.get("IsEthnicityNHPIWriteIn");
        if (isNHPIFillIn && (isNHPIFillIn.getValue() !== "")) {
          strRaceForDisplay += " " + isNHPIFillIn.getValue() + " ";
        }
      }
      var isOther = ethnicityPage.get("IsRaceOther");
      if (isOther && (isOther.getValue() == "true")) {
        strRaceForDisplay += " " + CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RaceOther") + " ";
        var isOtherFillIn = ethnicityPage.get("IsEthnicityOtherWriteIn");
        if (isOtherFillIn && isOtherFillIn.getValue() !== "") {
          strRaceForDisplay += " " + isOtherFillIn.getValue() + " ";
        }
      }
      if (strRaceForDisplay == "") {
        var dkRefused = cpHouseholdMemberTemp.get("DKRefused");
        var revRaceDKR = dkRefused.get("RevRace");
        var raceDKR = dkRefused.get("Race");
        if (revRaceDKR && (revRaceDKR.getValue() == "D" || revRaceDKR.getValue() == "R")) {
          if (revRaceDKR.getValue() == "D") {
            strRaceForDisplay = "Don't Know";
          } else if (revRaceDKR.getValue() == "R") {
            strRaceForDisplay = "Refused";
          }
        } else if (raceDKR && (raceDKR.getValue() == "D" || raceDKR.getValue() == "R")) {
          if (raceDKR.getValue() == "D") {
            strRaceForDisplay = "Don't Know";
          } else if (raceDKR.getValue() == "R") {
            strRaceForDisplay = "Refused";
          }
        }
      }
      strRaceForDisplay = strRaceForDisplay.replace(/  /g, ', ');
      cpHHMemberTemp.put("RaceConcatenatedStringForDisplay",strRaceForDisplay);
    }
    /*EnumCB_updateDOBValues();*/
    /*DK Ref*/
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("Review");
    ENUMCB.clearReviewCheckboxes();
  }
}

/*
* Post Function for Review
* Created by Aansh Kapadia
*/
function EnumCB_Review_POST() {
  /*Retrieve ReviewFlags, Questflags, and Response*/
  var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
  var softEditPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  if(!softEditPage) {
    responsePage.put("SoftEditVLDN", {});
    softEditPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response.SoftEditVLDN");
  }
  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var responseTMP = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
  var respLocANSW = responseTMP.get("RESPONSE_LOCATION_CODE");
  respLocANSW = respLocANSW ? respLocANSW.getValue() : "";

  if(responsePage && questFlags && softEditPage && householdRoster){
    /*Set is IsFirstTimeReview to false*/
    var cpFirstTimeReview = softEditPage.get("IsFirstTimeReview");
    if(cpFirstTimeReview){
      softEditPage.put("IsFirstTimeReview","false");
      cpFirstTimeReview.setValue("false");
    }
	/*Grab soft edit props*/
    var reviewRelationship = softEditPage.get("ReviewRelationship");
    reviewRelationship = reviewRelationship ? reviewRelationship.getValue() : "";
    var reviewSex = softEditPage.get("ReviewSex");
    reviewSex = reviewSex ? reviewSex.getValue() : "";
    var reviewDOB = softEditPage.get("ReviewDoB");
    reviewDOB = reviewDOB ? reviewDOB.getValue() : "";
    var reviewAge = softEditPage.get("ReviewAge");
    reviewAge = reviewAge ? reviewAge.getValue() : "";
    var reviewAgeBornAfter = softEditPage.get("ReviewAgeBornAfter");
    reviewAgeBornAfter = reviewAgeBornAfter ? reviewAgeBornAfter.getValue() : "";
    var reviewAgeLessOneYear = softEditPage.get("ReviewAgeLessThanOneYear");
    reviewAgeLessOneYear = reviewAgeLessOneYear ? reviewAgeLessOneYear.getValue() : "";
    var reviewRace = softEditPage.get("ReviewRace");
    reviewRace = reviewRace ? reviewRace.getValue() : "";
    var reviewNoChanges = softEditPage.get("ReviewNoChanges");
    reviewNoChanges = reviewNoChanges ? reviewNoChanges.getValue() : "";

    /*Check if any values were chosen and set isRaceAnswered flag appropriately*/
    if(reviewRelationship=="true"|| reviewSex=="true" || reviewDOB=="true" || reviewAge=="true" || reviewAgeBornAfter=="true" || reviewAgeLessOneYear=="true" || reviewRace=="true" || reviewNoChanges=="true"){
      questFlags.put("IsReviewAnswered", "true");
    }

    /*Required Validation*/
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if(isDKRefVisible == "true") {
      ENUMCB.Required("pyWorkPage.QuestFlags.IsReviewAnswered", "pyWorkPage.HouseholdMemberTemp.DKRefused.Review");
    } else {
      ENUMCB.Required("pyWorkPage.QuestFlags.IsReviewAnswered");
    }

    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var reviewDKRef = dkRefused.get("Review");
    reviewDKRef = reviewDKRef ? reviewDKRef.getValue() : "";

    
    /*pega.offline.runDataTransform("SetReviewNextQuestion","CB-FW-CensusFW-Work-Quest-Enum",null);*/
    
    if((reviewNoChanges=="true" || reviewDKRef == "R") && respLocANSW != "2") {
      var params = {isFirstTimeProp: "IsFirstTimeReview"};
      ENUMCB.updateMemberIndexPost(params);
      questFlags.put("NextSurveyQuestion", "BestTime_QSTN");
    } 

    if((reviewNoChanges=="true" || reviewDKRef == "R") &&  respLocANSW == "2"){ 
      var params = {isFirstTimeProp: "IsFirstTimeReview"};
      ENUMCB.updateMemberIndexPost(params);
      questFlags.put("NextSurveyQuestion", "ProxyName_QSTN");
    } 
    
    /* Reinterview Branching Logic */
   	var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var response = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
	var isReinterview = workPage.get("IsReInterview"); isReinterview = isReinterview ? isReinterview.getValue() : "";
	var isCensusDayAddress = response.get("IsCensusDayAddress") ? response.get("IsCensusDayAddress").getValue() : "";

    if (isReinterview == "true") {
        if ((reviewNoChanges == "true" || reviewDKRef == "R") && respLocANSW != "2" && isCensusDayAddress == "0") {
            questFlags.put("NextSurveyQuestion", "ProxyName_QSTN");
        } if ((reviewNoChanges == "true" || reviewDKRef == "R") && respLocANSW != "2" && isCensusDayAddress != "0") {
            questFlags.put("NextSurveyQuestion", "Goodbye_QSTN");
        } if ((reviewNoChanges == "true" || reviewDKRef == "R") && respLocANSW == "2") {
            questFlags.put("NextSurveyQuestion", "Goodbye_QSTN");
        }
    }

  }else{
    console.log("ENUMCB Error - " + "Unable to find the Response and/or Roster Pages");  
  }
}

/**
*	Pre action for RevSex_QSTN
*	Created by: Aansh Kapadia
**/
function EnumCB_RevSex_PRE(){
  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevSex");
  CB.toggleFlag("ExitSurveyEnabled","true");
}

/**
*	Post action for RevSex_QSTN
*	Created by: Dillon Irish
**/
function EnumCB_RevSex_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevSex", "pyWorkPage.HouseholdMemberTemp.DKRefused.RevSex");
  } 
  else {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevSex");
  }
  var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  if(cpHouseholdMemberTemp && dkRefused && cpHouseholdRoster) {
    var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    var curSex = cpHouseholdMemberTemp.get("RevSex").getValue();
    var cpResponse = cpHouseholdMemberTemp.get("Response");
    var dkRefProp = dkRefused.get("RevSex");
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
      cpHouseholdMemberTemp.put("SexMaleFemale", "Male");
    }
    else if(curSex == "Female"){
      cpResponse.put("P_SEX_MALE_IND","0");
      cpResponse.put("P_SEX_FEMALE_IND","1");
      cpHouseholdMemberTemp.put("SexMaleFemale", "Female");
    }
    else{
      cpResponse.put("P_SEX_MALE_IND","0");
      cpResponse.put("P_SEX_FEMALE_IND","0");         
    }
    CB.setMemberInRoster(currentHHMemberIndex,false);
  }  
  else{
    console.log("***ENUMCB Error - " + "Unable to find QuestFlags page, HouseholdRoster.HouseholdMember pagelist, or HouseholdMemberTemp page in EnumCB_Sex_POST function");
  }  
}

/**	
 *	Pre action for Rev_DOB_QSTN
 *	Created by:AXJ
 **/
function EnumCB_RevDOB_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.DOBDKRefVisibility("RevDOBDay", "RevDOBMonth", "RevDOBYear"); 
}

/**	
 *	Post action for Rev_DOB_QSTN
 *	Created by:AXJ
 **/
function EnumCB_RevDOB_POST() {
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

    var dkRefMonth = dkRefused.get("RevDOBMonth");
    if(dkRefMonth) {
      dkRefMonth = dkRefMonth.getValue();
    }
    else {
      dkRefMonth = "";
    } 
    var dkRefDay = dkRefused.get("RevDOBDay");
    if(dkRefDay) {
      dkRefDay = dkRefDay.getValue();
    }
    else {
      dkRefDay = "";
    }
    var dkRefYear = dkRefused.get("RevDOBYear");
    if(dkRefYear) {
      dkRefYear = dkRefYear.getValue();
    }
    else {
      dkRefYear = "";
    }

    var birthMonth = respPage.get("P_BIRTH_MONTH_RV_INT");
    if(birthMonth) {
      birthMonth = birthMonth.getValue();
    }
    else {
      birthMonth = "";
    }
    var birthDay = respPage.get("P_BIRTH_DAY_RV_INT");
    if(birthDay) {
      birthDay = birthDay.getValue();
    } 
    else {
      birthDay = "";
    }  
    var birthYear = respPage.get("P_BIRTH_YEAR_RV_INT");
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
      var changeDOBFlag = softEditPage.get("RevDOBFlag");
      if(changeDOBFlag) {
        changeDOBFlag = changeDOBFlag.getValue();
      }
      else {
        changeDOBFlag = false;
      }

      if((parsedYear == todayYear && parsedMonth == 4 && parsedDay > 1) || (parsedYear == todayYear && parsedMonth > 4)) {
        ENUMCB.DOBSoft_VLDN("RevDOBFlag");
        changeDOBFlag = softEditPage.get("RevDOBFlag").getValue();
      }

      var age = ENUMCB.calculateAge(parsedMonth, parsedDay, parsedYear, censusDate);
      respPage.put("P_AGE_RV_INT", age);
      var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      householdMemberTemp.put("AgeText",age);

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

      CB.setMemberInRoster(currentHHMember);
      /*  
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDOBMonth", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_MONTH_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_MONTH_REF_RV_IND");

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDOBDay", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_DAY_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_DAY_REF_RV_IND");

      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDOBYear", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_YEAR_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_BIRTH_YEAR_REF_RV_IND");
      */
    }
  }
  catch (e) {
    alert("ENUMCB Error - EnumCB_Rev_DOB_POST:" + e.message);
  }
}

/**
*	Pre action for Rev Age
*	Created by: David Bourque
**/
function EnumCB_RevAge_PRE(){
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("RevAge"); 
}

/*
* Post function for Rev Age
* Created by David Bourque
*/

function EnumCB_RevAge_POST(){
  if(pega.mobile.isHybrid){
    ENUMCB.RevAge_VLDN();
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    if (!workPage.hasMessages()) {
      var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
      var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
      if (cpHouseholdMember && cpHouseholdRoster && cpQuestFlags) {
        var age = "";
        var dkRefused = cpHouseholdMember.get("DKRefused.RevAge");
        if (dkRefused && (dkRefused.getValue() == "D" || dkRefused.getValue() == "R")) {
          age = dkRefused.getValue();
        } else {
          age = responsePage.get("P_AGE_RV_INT").getValue();
        }
        cpHouseholdMember.put("AgeText",age);
        ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevAge", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_RV_DK_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_AGE_RV_REF_IND");
        var currentHHMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
        CB.setMemberInRoster(currentHHMemberIndex,false);
      }
    }
  }
}

/**
*	Pre action for RevRelationshipResp_QSTN
*	Created by: Mark Coats
**/
function EnumCB_RevRelationshipResp_PRE(){		

  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("RevRelationshipResp");
  var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var pRelOppSpouse = cpResponse.get("P_REL_SPOUSE_OPP_RV_IND");
  if( pRelOppSpouse )
  {
    pRelOppSpouse = pRelOppSpouse.getValue();
  }
  if( (!pRelOppSpouse) || (pRelOppSpouse == "") )
  {
    cpResponse.put("P_REL_SPOUSE_OPP_RV_IND", "0");
    cpResponse.put("P_REL_SPOUSE_SAME_RV_IND", "0");
    cpResponse.put("P_REL_PARTNER_OPP_RV_IND", "0");
    cpResponse.put("P_REL_PARTNER_SAME_RV_IND", "0");
    cpResponse.put("P_REL_SON_DAUG_RV_IND", "0");
    cpResponse.put("P_REL_OTHER_RV_IND", "0");
    cpResponse.put("P_REL_GRANDCHILD_RV_IND", "0");
    cpResponse.put("P_REL_HOUSEROOMMATE_RV_IND", "0");
    cpResponse.put("P_REL_DK_RV_IND", "0");
    cpResponse.put("P_REL_REF_RV_IND", "0");
  }
}

/**
*	Post action for RevRelationshipResp_QSTN
*	Created by: Mark Coats
**/
function EnumCB_RevRelationshipResp_POST() {
  try {
    /*
     * Debug - uncomment to see DK/Refused coming in.
     *
    var cpDKRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var cpDKRefRevRelationshipResp = cpDKRefused.get("RevRelationshipResp");
    if( cpDKRefRevRelationshipResp )
    {
        cpDKRefRevRelationshipResp = cpDKRefRevRelationshipResp.getValue();
        alert( "Coming to POST with cpDKRefRevRelationshipResp = " + cpDKRefRevRelationshipResp)
    }
    */
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevRelationshipCode",
                                   "pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationshipResp");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevRelationshipCode");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {

      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());

      var params = {isFirstTimeProp: "IsFirstTimeRevRelationshipResp"};
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationshipResp", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_RV_IND"); 

      /*
	   * Get the HouseholdMemberTemp and Response pages so we can get the RevRelationshipCode and properly set the indicators.
	   * Get the quest flags so we can properly set the next screen - in case they picked OT or SD.
	   */
      var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");	  
      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");	  
      var respProp = cpHouseholdMemberTemp.get("RevRelationshipCode");
      if(respProp)
      {
        respProp = respProp.getValue();
      }
      else
      {
        respProp = "";
      }
      var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

      /*
	   * Now appropriately set the next question and the RV_IND flags based on the response.
	   */
      questFlags.put("NextSurveyQuestion", "");
      if(respProp == "1")
      {
        respPage.put( "P_REL_SPOUSE_OPP_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_SPOUSE_OPP_RV_IND", "0" );
      }
      if(respProp == "2")
      {
        respPage.put( "P_REL_PARTNER_OPP_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_PARTNER_OPP_RV_IND", "0" );
      }
      if(respProp == "3")
      {
        respPage.put( "P_REL_SPOUSE_SAME_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_SPOUSE_SAME_RV_IND", "0" );
      }
      if(respProp == "4")
      {
        respPage.put( "P_REL_PARTNER_SAME_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_PARTNER_SAME_RV_IND", "0" );
      }
      if(respProp == "10")
      {
        respPage.put( "P_REL_GRANDCHILD_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_GRANDCHILD_RV_IND", "0" );
      }
      if(respProp == "14")
      {
        respPage.put( "P_REL_HOUSEROOMMATE_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_HOUSEROOMMATE_RV_IND", "0" );
      }
      if(respProp == "OT")
      {
        questFlags.put("NextSurveyQuestion", "RevRelationOT_QSTN");
        respPage.put( "P_REL_OTHER_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_OTHER_RV_IND", "0" );
      }      
      if(respProp == "SD")
      {
        questFlags.put("NextSurveyQuestion", "RevRelationSD_QSTN");
        respPage.put( "P_REL_SON_DAUG_RV_IND", "1" );
      }      
      else
      {
        respPage.put( "P_REL_SON_DAUG_RV_IND", "0" );
      }

      /*
	   * Update the rel text in householdmembertemp and then update the member in the roster.
	   */
      ENUMCB.setRelTextInHouseholdMemberTemp("RevRelationshipCode","D_RelationshipOptions_ALL","RevRelationshipResp");
      CB.setMemberInRoster(curMemberIndex);
    } 
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RevRelationshipResp_POST:" + e.message);*/
  }
}

/*
*	Created by: Kyle Gravel
*	PRE Action on Rev Relationship Other
*/
function EnumCB_RevRelationshipOther_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevRelationshipOther"); 
}
/*
*	Created by: Kyle Gravel
*	POST Action on Rev Relationship Other
*
*/
function EnumCB_RevRelationshipOther_POST() {
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();

  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevRelationshipOther", "pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationshipOther");
  } 
  else {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevRelationshipOther");
  }
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {

    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationshipOther", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_RV_IND"); 

    var memberTempPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var respProp = memberTempPage.get("RevRelationshipOther");
    respProp = respProp ? respProp.getValue() : "";   
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");

    var questFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    questFlags.put("NextSurveyQuestion", "");

    if(respProp == "1") {
      respPage.put( "P_REL_SPOUSE_OPP_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_SPOUSE_OPP_RV_IND", "0" );
    }
    if(respProp == "2") {
      respPage.put( "P_REL_PARTNER_OPP_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_PARTNER_OPP_RV_IND", "0" );
    }
    if(respProp == "3") {
      respPage.put( "P_REL_SPOUSE_SAME_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_SPOUSE_SAME_RV_IND", "0" );
    }
    if(respProp == "4") {
      respPage.put( "P_REL_PARTNER_SAME_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_PARTNER_SAME_RV_IND", "0" );
    }
    if(respProp == "10") {
      respPage.put( "P_REL_GRANDCHILD_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_GRANDCHILD_RV_IND", "0" );
    }
    if(respProp == "14") {
      respPage.put( "P_REL_HOUSEROOMMATE_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_HOUSEROOMMATE_RV_IND", "0" );
    }
    if(respProp == "OT") {
      questFlags.put("NextSurveyQuestion", "RevRelationOT_QSTN");
      respPage.put( "P_REL_OTHER_RV_IND", "1" );
    }
    else {
      respPage.put( "P_REL_OTHER_RV_IND", "0" );
    }      
    if(respProp == "SD") {
      questFlags.put("NextSurveyQuestion", "RevRelationSD_QSTN");
      respPage.put( "P_REL_SON_DAUG_RV_IND", "1" );
    }      
    else {
      respPage.put( "P_REL_SON_DAUG_RV_IND", "0" );
    }

    ENUMCB.setRelTextInHouseholdMemberTemp("RevRelationshipOther","D_RelationshipOptions_ALL","RevRelationshipOther");

    var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
    currentHHMember = currentHHMember ? currentHHMember.getValue(): "";

    CB.setMemberInRoster(currentHHMember,false);
  }   
}

/*
*		Created by: Kyle Gravel
*		Updated by: Mark Coats
*       No need to grab roster member - HouseholdMemberTemp setup when you come in in the review process.
*          also - do NOT increment/decrement index - that is being handled in REVIEW.
*/
function EnumCB_RevRelationOT_PRE(){
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevRelationOT");
  var cpHouseholdMember = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var pRelParent = cpResponse.get("P_REL_PARENT_RV_IND");
  if( pRelParent )
  {
    pRelParent = pRelParent.getValue();
  }
  if( (!pRelParent) || (pRelParent == "") )
  {
    cpResponse.put("P_REL_PARENT_RV_IND", "0");
    cpResponse.put("REL_SIBLING_RV_IND", "0");
    cpResponse.put("P_REL_INLAW_PARENT_RV_IND", "0");
    cpResponse.put("P_REL_INLAW_CHILD_RV_IND", "0");
    cpResponse.put("P_REL_OTHER_REL_RV_IND", "0");
    cpResponse.put("P_REL_CHILD_FOSTER_RV_IND", "0");
    cpResponse.put("P_REL_OTHER_NONREL_RV_IND", "0");
    cpResponse.put("P_REL_DK_RV_IND", "0");
    cpResponse.put("P_REL_REF_RV_IND", "0");
  }
}

/*
*		Created by: Kyle Gravel
*		Updated by: Mark Coats
*		In the review flow, we do not increment the index. We do update the roster and the appropriate response indicators
*		based on what was selected.
*/
function EnumCB_RevRelationOT_POST(){

  try
  {
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    var validation = "";
    if (isDKRefVisible == "true") {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ReviewRelationOTCode",
                                   "pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationOT");
    } 
    else {
      validation = ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.ReviewRelationOTCode");
    }
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    if (!workPage.hasMessages()) {
      var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
      var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
      var curMemberIndex = parseInt(householdRoster.get("CurrentHHMemberIndex").getValue());

      var params = {isFirstTimeProp: "IsFirstTimeRevRelationOT"};
      ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationOT", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_REL_REF_RV_IND"); 

      /*
	   * Get the HouseholdMemberTemp and Response pages so we can get the RevRelationshipCode and properly set the indicators.
	   * Get the quest flags so we can properly set the next screen - in case they picked OT or SD.
	   */
      var cpHouseholdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");	  
      var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");	  
      var respProp = cpHouseholdMemberTemp.get("ReviewRelationOTCode");
      if(respProp)
      {
        respProp = respProp.getValue();
      }
      else
      {
        respProp = "";
      }	  

      var dkRefRelationOT = dkRefused.get("RevRelationOT");
      dkRefRelationOT = dkRefRelationOT ? dkRefRelationOT.getValue() : "";

      if(dkRefRelationOT != "") {
        respPage.put("P_REL_PARENT_RV_IND","1");
        respPage.put("P_REL_CODE_RV","16");
      }

      /*
	   * Now appropriately set the RV_IND flags based on the response.
	   */
      if(respProp == "9")
      {
        respPage.put( "P_REL_PARENT_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_PARENT_RV_IND", "0" );
      }
      if(respProp == "8")
      {
        respPage.put( "P_REL_SIBLING_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_SIBLING_RV_IND", "0" );
      }
      if(respProp == "11")
      {
        respPage.put( "P_REL_INLAW_PARENT_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_INLAW_PARENT_RV_IND", "0" );
      }
      if(respProp == "12")
      {
        respPage.put( "P_REL_INLAW_CHILD_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_INLAW_CHILD_RV_IND", "0" );
      }
      if(respProp == "13")
      {
        respPage.put( "P_REL_OTHER_REL_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_OTHER_REL_RV_IND", "0" );
      }
      if(respProp == "15")
      {
        respPage.put( "P_REL_CHILD_FOSTER_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_CHILD_FOSTER_RV_IND", "0" );
      }
      if(respProp == "16")
      {
        respPage.put( "P_REL_OTHER_NONREL_RV_IND", "1" );
      }
      else
      {
        respPage.put( "P_REL_OTHER_NONREL_RV_IND", "0" );
      }	  
      /*
	   * Update the rel text in householdmembertemp and then update the member in the roster.
	   */
      ENUMCB.setRelTextInHouseholdMemberTemp("ReviewRelationOTCode","D_RelationOTOptions","RevRelationOT");
      CB.setMemberInRoster(curMemberIndex);
    }
  }
  catch (e) {
    /*alert("ENUMCB Error - EnumCB_RevRelationOT_POST:" + e.message);*/
  }
}

/*
*		Created by: Kyle Gravel
*		Placeholder: Currently grabs proper roster member
*/
function EnumCB_RevRelationSD_PRE(){
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevRelationSD");

}

/*
*		Created by: Kyle Gravel
*		Used by RevRelationSD_QSTN
*/
function EnumCB_RevRelationSD_POST(){
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var isDKRefVisible = ENUMCB.getIsDKRefVisible();
  if (isDKRefVisible == "true") {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevRelationSD", "pyWorkPage.HouseholdMemberTemp.DKRefused.RevRelationSD");
  } 
  else {
    ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.RevRelationSD");
  }

  var responsePage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var workPG = pega.ui.ClientCache.find("pyWorkPage");
  if(!workPG.hasMessages()) {
    var householdMemberTemp = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp");
    var revRelationshipCode = householdMemberTemp.get("RevRelationshipCode");
    revRelationshipCode = revRelationshipCode ? revRelationshipCode.getValue() : "";

    var revRelationshipOther = householdMemberTemp.get("RevRelationshipOther");
    revRelationshipOther = revRelationshipOther ? revRelationshipOther.getValue() : "";

    var dkRefRelationSD = dkRefused.get("RevRelationSD");
    dkRefRelationSD = dkRefRelationSD ? dkRefRelationSD.getValue() : "";

    if((revRelationshipCode == "SD" || revRelationshipOther == "SD") && dkRefRelationSD != "") {
      responsePage.put("P_REL_SON_DAUG_RV_IND","1");
      responsePage.put("P_REL_CODE_RV","5");
    }
    else {
      var revRelationSD = householdMemberTemp.get("RevRelationSD");
      revRelationSD = revRelationSD ? revRelationSD.getValue() : "";

      if(revRelationSD == "5") {
        responsePage.put("P_REL_CODE_RV","5");
        responsePage.put("P_REL_CHILD_BIO_RV_IND","1");
      }
      else {
        responsePage.put("P_REL_CHILD_BIO_RV_IND","0");
      }

      if(revRelationSD == "6") {
        responsePage.put("P_REL_CODE_RV","6");
        responsePage.put("P_REL_CHILD_ADOPTED_RV_IND","1");
      }
      else {
        responsePage.put("P_REL_CHILD_ADOPTED_RV_IND","0");
      }

      if(revRelationSD == "7") {
        responsePage.put("P_REL_CODE_RV","7");
        responsePage.put("P_REL_CHILD_STEP_RV_IND","1");
      }
      else {
        responsePage.put("P_REL_CHILD_STEP_RV_IND","0");
      }

      if(revRelationSD == "15") {
        responsePage.put("P_REL_CODE_RV","15");
        responsePage.put("P_REL_CHILD_FOSTER_RV_IND","1");
      }
      else {
        responsePage.put("P_REL_CHILD_FOSTER_RV_IND","0");
      }		
    }
  }
  ENUMCB.setRelTextInHouseholdMemberTemp("RevRelationSD","D_RelationSDOptions","RevRelationSD");

  var householdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var currentHHMember = householdRoster.get("CurrentHHMemberIndex");
  if(currentHHMember) {
    currentHHMember = currentHHMember.getValue();
  }
  CB.setMemberInRoster(currentHHMember,false);	
}

/*
* Pre Function for Rev Race
* Created by David Bourque
*/
function EnumCB_RevRace_PRE() {
  if(pega.mobile.isHybrid) {
    /* Reset flag used to tell if screen has been answered */
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    questFlagsPage.put("IsRevRaceAnswered","");
    CB.toggleFlag("DKRFEnabled", "true");
    ENUMCB.updateDKRefVisibility("RevRace");
    CB.toggleFlag("ExitSurveyEnabled","true");
  }
}

/*
* Post Function for Rev Race
* Created by David Bourque
*/
function EnumCB_RevRace_POST() {
  /*Retrieve Roster, Questflags, and Response*/
  var cpResponse = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var cpRaceFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  var cpQuestFlags = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");

  if(cpResponse && cpQuestFlags && cpRaceFlags ){
    /*Retrieve Race properties and check if null*/
    var white, hisp, black, asian, aian, mena, nhpi, sor = "";
    var cpWhiteFlag = cpRaceFlags.get("IsRaceWhite");
    if(cpWhiteFlag){
      white = "" + cpWhiteFlag.getValue();
      if(white=="true"){
        cpResponse.put("P_RACE_WHITE_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_WHITE_RV_IND", "0");
      }
    }
    var cpHispFlag = cpRaceFlags.get("IsRaceHispanic");
    if(cpHispFlag){
      hisp = "" + cpHispFlag.getValue();
      if(hisp=="true"){
        cpResponse.put("P_RACE_HISP_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_HISP_RV_IND", "0");
      }
    }
    var cpBlackFlag = cpRaceFlags.get("IsRaceBlack");
    if(cpBlackFlag){
      black = "" + cpBlackFlag.getValue();
      if(black=="true"){
        cpResponse.put("P_RACE_BLACK_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_BLACK_RV_IND", "0");
      }
    }
    var cpAsianFlag = cpRaceFlags.get("IsRaceAsian");
    if(cpAsianFlag){
      asian = "" + cpAsianFlag.getValue();
      if(asian=="true"){
        cpResponse.put("P_RACE_ASIAN_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_ASIAN_RV_IND", "0");
      }
    }
    var cpAianFlag = cpRaceFlags.get("IsRaceAIAN");
    if(cpAianFlag){
      aian = "" + cpAianFlag.getValue();
      if(aian=="true"){
        cpResponse.put("P_RACE_AIAN_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_AIAN_RV_IND", "0");
      }
    }
    var cpMenaFlag = cpRaceFlags.get("IsRaceMENA");
    if(cpMenaFlag){
      mena = "" + cpMenaFlag.getValue();
      if(mena=="true"){
        cpResponse.put("P_RACE_MENA_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_MENA_RV_IND", "0");
      }
    }
    var cpNhpiFlag = cpRaceFlags.get("IsRaceNHPI");
    if(cpNhpiFlag){
      nhpi = "" + cpNhpiFlag.getValue();
      if(nhpi=="true"){
        cpResponse.put("P_RACE_NHPI_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_NHPI_RV_IND", "0");
      }
    }
    var cpSorFlag = cpRaceFlags.get("IsRaceOther");
    if(cpSorFlag){
      sor = "" + cpSorFlag.getValue();
      if(sor=="true"){
        cpResponse.put("P_RACE_SOR_RV_IND", "1");
      }else{
        cpResponse.put("P_RACE_SOR_RV_IND", "0");
      }
    }

    /*Check if any values were chosen and set isRaceAnswered flag appropriately*/
    if(white=="true"|| hisp=="true" || black=="true" || asian=="true" || aian=="true" || mena=="true" || nhpi=="true" || sor=="true"){
      cpQuestFlags.put("IsRevRaceAnswered", "true");
    }
    var isDKRefVisible = ENUMCB.getIsDKRefVisible();
    if (isDKRefVisible) {
      ENUMCB.Required("pyWorkPage.QuestFlags.IsRevRaceAnswered","pyWorkPage.HouseholdMemberTemp.DKRefused.RevRace");
    } else {
      ENUMCB.Required("pyWorkPage.QuestFlags.IsRevRaceAnswered");
    }
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevRace", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE_REF_RV_IND");
    ENUMCB.setReviewRacePage("RevRaceEthnicity");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);
  }else{
    console.log("ENUMCB Error - " + "Unable to find the Response, QuestFlags, and/or Roster Pages");  
  }
}

/**
*	Pre action for RevDetailedOriginWhite
*	Created by Aansh Kapadia
**/
function EnumCB_RevDetailedOriginWhite_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginWhite");
  CB.toggleFlag("ExitSurveyEnabled","true");
}

/**
*	Post action for RevDetailedOriginWhite
*	Created by Aansh Kapadia
**/
function EnumCB_RevDetailedOriginWhite_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  var ethWhiteEnglish = ethFlags.get("IsEthnicityWhiteEnglish").getValue();
  var ethWhiteFrench = ethFlags.get("IsEthnicityWhiteFrench").getValue();
  var ethWhiteGerman = ethFlags.get("IsEthnicityWhiteGerman").getValue();
  var ethWhiteIrish = ethFlags.get("IsEthnicityWhiteIrish").getValue();
  var ethWhiteItalian = ethFlags.get("IsEthnicityWhiteItalian").getValue();
  var ethWhitePolish = ethFlags.get("IsEthnicityWhitePolish").getValue();
  var writeInValue = respPage.get("P_RACE2_WHITE_RV_TEXT").getValue();
  var numberSelected = 0;

  ethFlags.put("IsEthnicityWhiteWriteIn", writeInValue);
  if(ethWhiteEnglish) {
    respPage.put("P_RACE2_ENGLISH_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ENGLISH_RV_IND", "0");
  }
  if(ethWhiteFrench) {
    respPage.put("P_RACE2_FRENCH_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_FRENCH_RV_IND", "0");
  }
  if(ethWhiteGerman) {
    respPage.put("P_RACE2_GERMAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_GERMAN_RV_IND", "0");
  }
  if(ethWhiteIrish) {
    respPage.put("P_RACE2_IRISH_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_IRISH_RV_IND", "0");
  }
  if(ethWhiteItalian) {
    respPage.put("P_RACE2_ITALIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ITALIAN_RV_IND", "0");
  }
  if(ethWhitePolish) {
    respPage.put("P_RACE2_POLISH_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_POLISH_RV_IND", "0");
  }
  if(writeInValue != "") {
    numberSelected++;
  }  
  ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginWhite");
  ENUMCB.setReviewRacePage("RevRaceEthnicity");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
  CB.setMemberInRoster(curMemberIndex,false);
  ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginWhite", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_WHITE_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_WHITE_REF_RV_IND");
}

/**
*	Function for Rev black pre action
*	Created by Ramin M
**/
function EnumCB_RevDetailedOriginBlack_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginBlack");
}

/**
*	Function for Rev black post action
*	Created by Ramin M, Jack McCloskey
**/
function EnumCB_RevDetailedOriginBlack_POST() {
  ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginBlack");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
    var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
    var ethBlackAfAm = ethFlags.get("IsEthnicityBlackAfricanAmerican").getValue();
    var ethBlackEthiopian = ethFlags.get("IsEthnicityBlackEthiopian").getValue();
    var ethBlackHaitian = ethFlags.get("IsEthnicityBlackHaitian").getValue();
    var ethBlackJamaican = ethFlags.get("IsEthnicityBlackJamaican").getValue();
    var ethBlackNigerian = ethFlags.get("IsEthnicityBlackNigerian").getValue();
    var ethBlackSomali = ethFlags.get("IsEthnicityBlackSomali").getValue();
    var writeInValue = respPage.get("P_RACE2_BLACK_RV_TEXT").getValue();
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
      numberSelected++;
    }

    ethFlags.put("IsEthnicityBlackWriteIn", writeInValue);
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginBlack", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_BLACK_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_BLACK_REF_RV_IND");  
    ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginBlack");
    ENUMCB.setReviewRacePage("RevRaceEthnicity");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);

  }
}

/**
*	Pre action for RevDetailedOriginHisp
*	Created by Aansh Kapadia
**/
function EnumCB_RevDetailedOriginHisp_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginHisp");
  CB.toggleFlag("ExitSurveyEnabled","true");
}

/**
*	Post action for RevDetailedOriginHisp
*	Created by Aansh Kapadia
**/
function EnumCB_RevDetailedOriginHisp_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  var ethHispMexican = ethFlags.get("IsEthnicityHispanicMexican").getValue();
  var ethHispPuertoRican = ethFlags.get("IsEthnicityHispanicPuertoRican").getValue();
  var ethHispCuban = ethFlags.get("IsEthnicityHispanicCuban").getValue();
  var ethHispSalvadoran = ethFlags.get("IsEthnicityHispanicSalvadoran").getValue();
  var ethHispDominican = ethFlags.get("IsEthnicityHispanicDominican").getValue();
  var ethHispColombian = ethFlags.get("IsEthnicityHispanicColombian").getValue();
  var writeInValue = respPage.get("P_RACE2_HISP_RV_TEXT").getValue();
  var numberSelected = 0;

  ethFlags.put("IsEthnicityHispanicWriteIn", writeInValue);
  if(ethHispMexican) {
    respPage.put("P_RACE2_MEXICAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_MEXICAN_RV_IND", "0");
  }
  if(ethHispPuertoRican) {
    respPage.put("P_RACE2_PUERTORICAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_PUERTORICAN_RV_IND", "0");
  }
  if(ethHispCuban) {
    respPage.put("P_RACE2_CUBAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_CUBAN_RV_IND", "0");
  }
  if(ethHispSalvadoran) {
    respPage.put("P_RACE2_SALVADORAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SALVADORAN_RV_IND", "0");
  }
  if(ethHispDominican) {
    respPage.put("P_RACE2_DOMINICAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_DOMINICAN_RV_IND", "0");
  }
  if(ethHispColombian) {
    respPage.put("P_RACE2_COLOMBIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_COLOMBIAN_RV_IND", "0");
  }
  if(writeInValue != "") {
    numberSelected++;
  }  
  ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginHisp");
  ENUMCB.setReviewRacePage("RevRaceEthnicity");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
  CB.setMemberInRoster(curMemberIndex,false);
  ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginHisp", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_HISP_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_HISP_REF_RV_IND");
}

/**
*	Function for rev asian pre action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginAsian_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginAsian");
}


/**
*	Function for rev asian post action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginAsian_POST() {
  var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
  var dkRefProp = dkRefused.get("RevDetailedOriginAsian");

  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  var ethAsianIndian = ethFlags.get("IsEthnicityAsianAsianIndian").getValue();
  var ethAsianChinese = ethFlags.get("IsEthnicityAsianChinese").getValue();
  var ethAsianFilipino = ethFlags.get("IsEthnicityAsianFilipino").getValue();
  var ethAsianJapanese = ethFlags.get("IsEthnicityAsianJapanese").getValue();
  var ethAsianKorean = ethFlags.get("IsEthnicityAsianKorean").getValue();
  var ethAsianVietnamese = ethFlags.get("IsEthnicityAsianVietnamese").getValue();
  var writeInValue = respPage.get("P_RACE2_ASIAN_RV_TEXT").getValue();
  var numberSelected = 0;

  if(dkRefProp) {
    dkRefProp = dkRefProp.getValue();
  }
  else {
    dkRefProp = "";
  }
  if(dkRefProp == "D") {
    respPage.put("P_RACE2_ASIAN_DK_RV_IND", "1");
    respPage.put("P_RACE2_ASIAN_REF_RV_IND", "0");
  }
  else if(dkRefProp == "R") {
    respPage.put("P_RACE2_ASIAN_DK_RV_IND", "0");
    respPage.put("P_RACE2_ASIAN_REF_RV_IND", "1");
  }

  if(ethAsianIndian) {
    respPage.put("P_RACE2_ASIANINDIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ASIANINDIAN_RV_IND", "0");
  }
  if(ethAsianChinese) {
    respPage.put("P_RACE2_CHINESE_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_CHINESE_RV_IND", "0");
  }
  if(ethAsianFilipino) {
    respPage.put("P_RACE2_FILIPINO_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_FILIPINO_RV_IND", "0");
  }
  if(ethAsianJapanese) {
    respPage.put("P_RACE2_JAPANESE_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_JAPANESE_RV_IND", "0");
  }
  if(ethAsianKorean) {
    respPage.put("P_RACE2_KOREAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_KOREAN_RV_IND", "0");
  }
  if(ethAsianVietnamese) {
    respPage.put("P_RACE2_VIETNAMESE_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_VIETNAMESE_RV_IND", "0");
  }
  if(writeInValue != "") {
    numberSelected++;
  }
  ethFlags.put("IsEthnicityAsianWriteIn", writeInValue);
  ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginAsian");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setReviewRacePage("RevRaceEthnicity");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);
  }
}

/**
*	Function for rev mena pre action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginMENA_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled", "true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginMENA");
}


/**
*	Function for rev mena post action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginMENA_POST() {
  var workPage = pega.ui.ClientCache.find("pyWorkPage");

  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  var ethMenaLebanese = ethFlags.get("IsEthnicityMENALebanese").getValue();
  var ethMenaIranian = ethFlags.get("IsEthnicityMENAIranian").getValue();
  var ethMenaEgyptian = ethFlags.get("IsEthnicityMENAEgyptian").getValue();
  var ethMenaSyrian = ethFlags.get("IsEthnicityMENASyrian").getValue();
  var ethMenaMoroccan = ethFlags.get("IsEthnicityMENAMoroccan").getValue();
  var ethMenaIsraeli = ethFlags.get("IsEthnicityMENAIsraeli").getValue();
  var writeInValue = respPage.get("P_RACE2_MENA_RV_TEXT").getValue();
  var numberSelected = 0;

  if(ethMenaLebanese) {
    respPage.put("P_RACE2_LEBANESE_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_LEBANESE_RV_IND", "0");
  }
  if(ethMenaIranian ) {
    respPage.put("P_RACE2_IRANIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_IRANIAN_RV_IND", "0");
  }
  if(ethMenaEgyptian) {
    respPage.put("P_RACE2_EGYPTIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_EGYPTIAN_RV_IND", "0");
  }
  if(ethMenaSyrian) {
    respPage.put("P_RACE2_SYRIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SYRIAN_RV_IND", "0");
  }
  if(ethMenaMoroccan) {
    respPage.put("P_RACE2_MOROCCAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_MOROCCAN_RV_IND", "0");
  }
  if(ethMenaIsraeli) {
    respPage.put("P_RACE2_ISRAELI_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_ISRAELI_RV_IND", "0");
  }
  if(writeInValue != "") {
    numberSelected++;
  }
  ethFlags.put("IsEthnicityMENAWriteIn", writeInValue);
  ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginMENA");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  if (!workPage.hasMessages()) {
    ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginMENA", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_MENA_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_MENA_REF_RV_IND");
    ENUMCB.setReviewRacePage("RevRaceEthnicity");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);
  }
}

/**
*	Pre action for RevDetailedOriginNHPI
*	Created by Jack McCloskey
**/
function EnumCB_RevDetailedOriginNHPI_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginNHPI");
}

/**
*	Post action for RevDetailedOriginNHPI
*	Created by Jack McCloskey
**/
function EnumCB_RevDetailedOriginNHPI_POST() {
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
  var ethNHPINativeHawaiian = ethFlags.get("IsEthnicityNHPINativeHawaiian").getValue();
  var ethNHPISamoan = ethFlags.get("IsEthnicityNHPISamoan").getValue();
  var ethNHPIChamorro = ethFlags.get("IsEthnicityNHPIChamorro").getValue();
  var ethNHPITongan = ethFlags.get("IsEthnicityNHPITongan").getValue();
  var ethNHPIFijian = ethFlags.get("IsEthnicityNHPIFijian").getValue();
  var ethNHPIMarshallese = ethFlags.get("IsEthnicityNHPIMarshallese").getValue();
  var writeInValue = respPage.get("P_RACE2_NHPI_RV_TEXT").getValue();
  var numberSelected = 0;

  if(ethNHPINativeHawaiian) {
    respPage.put("P_RACE2_NATHAWAIIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_NATHAWAIIAN_RV_IND", "0");
  }
  if(ethNHPISamoan) {
    respPage.put("P_RACE2_SAMOAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_SAMOAN_RV_IND", "0");
  }
  if(ethNHPIChamorro) {
    respPage.put("P_RACE2_CHAMORRO_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_CHAMORRO_RV_IND", "0");
  }
  if(ethNHPITongan) {
    respPage.put("P_RACE2_TONGAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_TONGAN_RV_IND", "0");
  }
  if(ethNHPIFijian) {
    respPage.put("P_RACE2_FIJIAN_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_FIJIAN_RV_IND", "0");
  }
  if(ethNHPIMarshallese) {
    respPage.put("P_RACE2_MARSHALLESE_RV_IND", "1");
    numberSelected++;
  }
  else {
    respPage.put("P_RACE2_MARSHALLESE_RV_IND", "0");
  }
  if(writeInValue != "") {
    numberSelected++;
  }
  ethFlags.put("IsEthnicityNHPIWriteIn", writeInValue);
  ENUMCB.setDKRefResponse("pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginNHPI", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_NHPI_DK_RV_IND", "pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_NHPI_REF_RV_IND");
  ENUMCB.DetailedOrigin_VLDN(numberSelected, "RevDetailedOriginNHPI");
  ENUMCB.setReviewRacePage("RevRaceEthnicity");
  var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
  var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
  CB.setMemberInRoster(curMemberIndex,false);
}

/**
*	Function for rev aian pre action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginAIAN_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginAIAN");
}

/**
*	Function for rev aian post action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginAIAN_POST() {
  ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_AIAN_RV_TEXT", "pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginAIAN");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  if (!workPage.hasMessages()) {
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var dkRefProp = dkRefused.get("RevDetailedOriginAIAN");

    if(dkRefProp) {
      dkRefProp = dkRefProp.getValue();
    }
    else {
      dkRefProp = "";
    }
    if(dkRefProp == "D") {
      respPage.put("P_RACE2_AIAN_DK_RV_IND", "1");
      respPage.put("P_RACE2_AIAN_REF_RV_IND", "0");
    }
    else if(dkRefProp == "R") {
      respPage.put("P_RACE2_AIAN_DK_RV_IND", "0");
      respPage.put("P_RACE2_AIAN_REF_RV_IND", "1");
    }

    var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
    var writeInValue = respPage.get("P_RACE2_AIAN_RV_TEXT").getValue();
    ethFlags.put("IsEthnicityAIANWriteIn", writeInValue);

    ENUMCB.setReviewRacePage("RevRaceEthnicity");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);
  }
}

/**
*	Function for rev SOR pre action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginSOR_PRE() {
  CB.toggleFlag("DKRFEnabled", "true");
  CB.toggleFlag("ExitSurveyEnabled","true");
  ENUMCB.updateDKRefVisibility("RevDetailedOriginSOR");
}

/**
*	Function for rev SOR post action
*	Created by Dillon Irish
**/
function EnumCB_RevDetailedOriginSOR_POST() {
  ENUMCB.Required("pyWorkPage.HouseholdMemberTemp.Response.P_RACE2_SOR_RV_TEXT", "pyWorkPage.HouseholdMemberTemp.DKRefused.RevDetailedOriginSOR");
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var respPage = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.Response");
  if (!workPage.hasMessages()) {
    var dkRefused = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.DKRefused");
    var dkRefProp = dkRefused.get("RevDetailedOriginSOR");

    if(dkRefProp) {
      dkRefProp = dkRefProp.getValue();
    }
    else {
      dkRefProp = "";
    }
    if(dkRefProp == "D") {
      respPage.put("P_RACE2_SOR_DK_RV_IND", "1");
      respPage.put("P_RACE2_SOR_REF_RV_IND", "0");
    }
    else if(dkRefProp == "R") {
      respPage.put("P_RACE2_SOR_DK_RV_IND", "0");
      respPage.put("P_RACE2_SOR_REF_RV_IND", "1");
    }

    var ethFlags = pega.ui.ClientCache.find("pyWorkPage.HouseholdMemberTemp.RevRaceEthnicity");
    var writeInValue = respPage.get("P_RACE2_SOR_RV_TEXT").getValue();
    ethFlags.put("IsEthnicityOtherWriteIn", writeInValue);

    ENUMCB.setReviewRacePage("RevRaceEthnicity");
    var cpHouseholdRoster = pega.ui.ClientCache.find("pyWorkPage.HouseholdRoster");
    var curMemberIndex = parseInt(cpHouseholdRoster.get("CurrentHHMemberIndex").getValue());
    CB.setMemberInRoster(curMemberIndex,false);
  }
}
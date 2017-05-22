/*************************************************************************************
***    Parameterized DP functions
***
**************************************************************************************/
function D_CountyListForAgentGivenZipCode(dpPage, params) {
    try {
        if (MREnroll.isDigit(params.ZipCode) == true) {
			var clientCache = pega.u.ClientCache;
			/*clientCache.setDebugMode(clientCache.DEBUG_MODE_ON);*/
			var state = "";
			var statecode = "";
			var applnCache = pega.ui.ClientCache.find("pyWorkPage.ApplicationInfo");
			var countyListForAgent = dpPage.put("pxResults", []);       /*this will empty the data page*/
			var countyList = clientCache.find("D_CountyListForAgent.pxResults");
			if (countyList) {
				 countyList = countyList.iterator();
			} else {
				/*this as per requirement*/
				var objJSON = '{"CMSCOUNTYNAME":"County List is empty. please delete and reinstall the application.","pxObjClass":"UHG-FW-MREnroll-Data-EMSPlanTable-APPP","CMSCOUNTYCODE":"None"}';
				countyListForAgent.add().adoptJSON(objJSON);
				throw "D_CountyListForAgent is empty!";
			}
			var countyPG = null;
			var sourcePG = null;
			var zipCode = params.ZipCode;
            while (countyList.hasNext()) {
                 sourcePG = countyList.next();
                if (sourcePG.get("ZIPCODE").getValue() == zipCode) {
					countyPG = clientCache.createPage("temp");
					countyPG.adoptJSON(sourcePG.getJSON());
					state = countyPG.get("STATEABBREVIATION").getValue();
					statecode = countyPG.get("CMSSTATECODE").getValue();
					applnCache.put("State", state);
					applnCache.put("StateCode", statecode);
					countyListForAgent.add().adoptJSON(countyPG.getJSON());
                }
					delete countyPG;        /*for optimization*/
				}     
        } else { /*set the state back to "--"*/
            pega.ui.ClientCache.find("pyWorkPage.ApplicationInfo").put("State", "--");
            pega.ui.ClientCache.find("pyWorkPage.ApplicationInfo").put("StateCode", "");
        }
    } catch (e) {
        /*log error*/
        var objJSON = '{"CMSCOUNTYNAME":"County List is empty. please delete and reinstall the application.","pxObjClass":"UHG-FW-MREnroll-Data-EMSPlanTable-APPP","CMSCOUNTYCODE":"None"}';
        countyListForAgent.add().adoptJSON(objJSON);
        console.log("Error in D_CountyListForAgentGivenZipCode: " + e.message);
    }
}

function D_DKRefusedOptions() {
  var DKRefOptions = pega.ui.ClientCache.find("D_DKRefusedOptions").put("pxResults",[]);  
  var paramsPage = pega.ui.ClientCache.find("D_DKRefusedOptions.pxDPParameters");
  var dkParam = paramsPage.get("DK").getValue();
  var refParam = paramsPage.get("Ref").getValue();
  var DKRefOptionsMaster = pega.ui.ClientCache.find("D_DKRefusedOptions_Master.pxResults").iterator();  
  while(DKRefOptionsMaster.hasNext()) {
    var currentPage = DKRefOptionsMaster.next();
    if(currentPage.get("pyValue").getValue() == dkParam) {
      DKRefOptions.add().adoptJSON(currentPage.getJSON());  
    }
    else if(currentPage.get("pyValue").getValue() == refParam) {
      DKRefOptions.add().adoptJSON(currentPage.getJSON());  
    }
  }
}

function D_EligibleRespOptions(dpPage, params) {
	try {
    var eligibleRespMaster = pega.ui.ClientCache.find("D_EligibleRespOptions_Master.pxResults").iterator();
    var eligibleRespOptions = pega.ui.ClientCache.find("D_EligibleRespOptions").put("pxResults", []);
    if (params.IsMU == "true" || params.IsReInterview == "true") {
        while (eligibleRespMaster.hasNext()) {
            var currentPage = eligibleRespMaster.next();
            var value = currentPage.get("pyValue").getValue();
          if(value=="1" || value=="0"){
            eligibleRespOptions.add().adoptJSON(currentPage.getJSON());
          }
        }
    } else {
        while (eligibleRespMaster.hasNext()) {
            var currentPage = eligibleRespMaster.next();
            eligibleRespOptions.add().adoptJSON(currentPage.getJSON());
        }
    }} catch (e) {
      alert(e + "Eligible Resp Error DP Error");
    }

}

/* For ProxyLocation Address types */
function D_ProxyLocationAddressTypeList(dpPage, params){
  var addressTypeMaster = pega.ui.ClientCache.find("D_AddressType_Master.pxResults").iterator(); 
  var proxyLocationOptions = pega.ui.ClientCache.find("D_ProxyLocationAddressTypeList").put("pxResults",[]);
  if(params.AddrType.startsWith("PR"))
  {
     while(addressTypeMaster.hasNext())
     {
         var curAddress = addressTypeMaster.next();
         var typeCode = curAddress.get("AddressTypeCode")? curAddress.get("AddressTypeCode").getValue() : "";
         if((typeCode == "PRGA") || (typeCode=="PRUA") || (typeCode == "PRAA") || (typeCode == "PRAC") || (typeCode == "PRRR") || (typeCode == "PROP") || (typeCode=="PROT"))
         {  
             proxyLocationOptions.add().adoptJSON(curAddress.getJSON());   
         }
     }
  }
  else
  {    
     while(addressTypeMaster.hasNext())
     {
         var curAddress = addressTypeMaster.next();
         var typeCode = curAddress.get("AddressTypeCode")? curAddress.get("AddressTypeCode").getValue() : "";
         if((typeCode == "USSA") || (typeCode=="USRR") || (typeCode == "USOP") || (typeCode=="USOT"))
         {
             proxyLocationOptions.add().adoptJSON(curAddress.getJSON());   
         }
     }
  }
}

/*For Attempt Type screen*/
function D_AttemptTypeOptions(dpPage, params){  
  var workPage = pega.ui.ClientCache.find("pyWorkPage");
  var attemptTypeMaster = pega.ui.ClientCache.find("D_AttemptTypeOptions_Master.pxResults").iterator(); 
  var attemptTypeOptions = pega.ui.ClientCache.find("D_AttemptTypeOptions").put("pxResults",[]);    
  var RIAttemptType = workPage.get("Respondent.RIAttemptType") ? workPage.get("Respondent.RIAttemptType").getValue() : "";

 /* MURI Story */
 if(params.IsReInterview=="true"&&params.IsMU=="true")
 {
    while(attemptTypeMaster.hasNext()){    
      var currentPage = attemptTypeMaster.next(); 
      var value = currentPage.get("pyValue").getValue();
      if(RIAttemptType =="PV" && value=="PV"){
        attemptTypeOptions.add().adoptJSON(currentPage.getJSON());   
      }
      else if(value=="TA"  || value == "CA"){
	   attemptTypeOptions.add().adoptJSON(currentPage.getJSON()); 
      }
    }
 }
 /* RI Story */
 else if(params.IsReInterview=="true"){
    while(attemptTypeMaster.hasNext()){    
      var currentPage = attemptTypeMaster.next(); 
      var value = currentPage.get("pyValue").getValue();
      if(RIAttemptType =="PV" && value=="PV"){
        attemptTypeOptions.add().adoptJSON(currentPage.getJSON());   
      }
      if(value=="TA" || value=="CA"){
	   attemptTypeOptions.add().adoptJSON(currentPage.getJSON()); 
      }
    }
  }
 /* MU Story */
 else if(params.IsMU=="true")
 {
    while(attemptTypeMaster.hasNext()){    
      var currentPage = attemptTypeMaster.next(); 
      var value = currentPage.get("pyValue").getValue();
      if(value=="PV" || value=="TA"  || value=="UA" || value == "CA"){
	   attemptTypeOptions.add().adoptJSON(currentPage.getJSON()); 
      }
    }   
 }
 /* NRFU Story */
 else{ /*if not RI and not MU - add all options*/
   while(attemptTypeMaster.hasNext()) {    
      var currentPage = attemptTypeMaster.next();      
      var value = currentPage.get("pyValue").getValue();
      if(value != "UA")
      {
          attemptTypeOptions.add().adoptJSON(currentPage.getJSON());   
      }
    }
   }
}

/*For Resp Location screen*/
function D_RespLocationOptions(dpPage, params){
   
    /**
   * In order these are:
   * Attempting Census address
   * Attempting Proxy address
   * Unable to attempt address
   * Attempting address
   * Unable to attempt
   */
  var respLocationANSW1 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RespLocation_ANSW");
  var respLocationANSW2 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RespLocation1_ANSW");
  var respLocationANSW3 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RespLocation2_ANSW");
  var respLocationANSW4 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RespLocation3_ANSW");
  var respLocationANSW5 = CB.getAndParseFieldValue("pyWorkPage", "pyCaption", "RespLocation4_ANSW");

  if (pega.mobile.isHybrid) {
   
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var questFlagsPage = pega.ui.ClientCache.find("pyWorkPage.QuestFlags");
    var proxyEligible = questFlagsPage.get("ProxyEligible") ? questFlagsPage.get("ProxyEligible").getValue() : "";
    var proxyRequired = questFlagsPage.get("ProxyRequired") ? questFlagsPage.get("ProxyRequired").getValue() : "";

    var respLocationDP = pega.ui.ClientCache.find("D_RespLocationOptions").put("pxResults", []);
      
    if (params.IsReInterview == "true") {
      
      var respLocationPage4 = pega.ui.ClientCache.createPage("respLocationPage");
      respLocationPage4.put("pyLabel", respLocationANSW4);
      respLocationPage4.put("pyValue", "1");
      respLocationPage4.put("pxObjClass", "CB-FW-CensusFW-Work");
      respLocationDP.add().adoptJSON(respLocationPage4.getJSON());

      var respLocationPage3 = pega.ui.ClientCache.createPage("respLocationPage");
      respLocationPage3.put("pyLabel", respLocationANSW5);
      respLocationPage3.put("pyValue", "3");
      respLocationPage3.put("pxObjClass", "CB-FW-CensusFW-Work");      
      respLocationDP.add().adoptJSON(respLocationPage3.getJSON());
    } else {
      if (proxyRequired == "false") {
        var respLocationPage1 = pega.ui.ClientCache.createPage("respLocationPage");
        respLocationPage1.put("pyLabel", respLocationANSW1);
        respLocationPage1.put("pyValue", "1");
        respLocationPage1.put("pxObjClass", "CB-FW-CensusFW-Work");
        respLocationDP.add().adoptJSON(respLocationPage1.getJSON());
      }
      if (proxyEligible == "true") {
        var respLocationPage2 = pega.ui.ClientCache.createPage("respLocationPage");
        respLocationPage2.put("pyLabel", respLocationANSW2);
        respLocationPage2.put("pyValue", "2");
        respLocationPage2.put("pxObjClass", "CB-FW-CensusFW-Work");
        respLocationDP.add().adoptJSON(respLocationPage2.getJSON());
      }

      var respLocationPage3 = pega.ui.ClientCache.createPage("respLocationPage");
      respLocationPage3.put("pyLabel", respLocationANSW3);
      respLocationPage3.put("pyValue", "3");
      respLocationPage3.put("pxObjClass", "CB-FW-CensusFW-Work");
      respLocationDP.add().adoptJSON(respLocationPage3.getJSON());
    }
  }
}

function D_IntroQuestionOptions(dpPage, params){
  var introOptions = pega.ui.ClientCache.find("D_IntroQuestionOptions").put("pxResults",[]);  
  var introOptionsMaster = pega.ui.ClientCache.find("D_IntroQuestionOptions_Master.pxResults").iterator();   
    
  if(params.IsReInterview!="true") {
	/*PVProxy*/
	if(params.NRFU_ATTEMPT_TYPE_CODE == "PV" && params.RESPONSE_LOCATION_CODE == "2"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("PVProxy")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}

    /*Multi Unit*/
	if(params.IsMultiUnit == "true"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("IntroMU")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}
    
	/*OutboundProxy*/
	if(params.NRFU_ATTEMPT_TYPE_CODE == "TA" && params.RESPONSE_LOCATION_CODE == "2"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("OutboundProxy")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}

	/*OutboundCensusAddress*/
	if(params.NRFU_ATTEMPT_TYPE_CODE == "TA" && params.RESPONSE_LOCATION_CODE == "1"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("OutboundCensusAddress")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}

	/*PVCensusAddress*/
	if(params.NRFU_ATTEMPT_TYPE_CODE == "PV" && params.RESPONSE_LOCATION_CODE == "1"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("PVCensusAddress")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}
		
	/*InboundProxy*/
	if(params.NRFU_ATTEMPT_TYPE_CODE == "TB" && params.RESPONSE_LOCATION_CODE == "2"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("InboundProxy")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}

	/*InboundCensusAddress*/
	if(params.NRFU_ATTEMPT_TYPE_CODE == "TB" && params.RESPONSE_LOCATION_CODE == "1"){
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("InboundCensusAddress")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}
  }
  else {
    /* ReInterview Options */
    	
	/* Personal Visit & Proxy & NOT Multi Unit */
	if(params.ATTACTUAL == "PV" && params.RESPTYPE_PROD == "proxy" && params.IsMultiUnit != "true" ){
	  while(introOptionsMaster.hasNext()) {    
	    var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("ProxyPV_RI")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}
	  
	/* Personal Visit */
	else if(params.ATTACTUAL == "PV") {
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("PersonalVisit_RI")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}
	  
	/* Phone */
	else if(params.ATTACTUAL == "T") {
	  while(introOptionsMaster.hasNext()) {    
		var currentPage = introOptionsMaster.next();    
		if(currentPage.get("pyNote").getValue().indexOf("Phone_RI")!= -1){
		  introOptions.add().adoptJSON(currentPage.getJSON());   
		}
	  }
	}	
  } 
}


function D_HomeOptions() {
  
  var clientCache = pega.u.ClientCache;
  var homeOptions = clientCache.find("D_HomeOptions").put("pxResults",[]);  
  var homeOptionsMaster = clientCache.find("D_HomeOptions_Master.pxResults").iterator();  
  var attemptType = clientCache.get("pyWorkPage.HouseholdMemberTemp.Response.NRFU_ATTEMPT_TYPE_CODE").getValue();
  var respLocation = clientCache.get("pyWorkPage.HouseholdMemberTemp.Response.RESPONSE_LOCATION_CODE").getValue();
  var label;
  if((attemptType == "PV" || attemptType == "TA" || attemptType == "TB") && respLocation == "2") {
    label = "1";
  }
  else {
    label = "2";
  }
  while(homeOptionsMaster.hasNext()) {
    var currentPage = homeOptionsMaster.next();
    if(currentPage.get("pyLabel").getValue() == label){
      homeOptions.add().adoptJSON(currentPage.getJSON());   
    }
  }
  
}

function D_NoCompleteOptions(dpPage, params)
{
    try
    {
  		var workPage = pega.ui.ClientCache.find("pyWorkPage");
  		var ncMaster = pega.ui.ClientCache.find("D_NoCompleteOptions_Master.pxResults").iterator(); 
  		var ncOptions = pega.ui.ClientCache.find("D_NoCompleteOptions").put("pxResults",[]);
      
        if(params.IsMU == "true" && params.IsReInterview == "true")
        {
            while(ncMaster.hasNext())
            {    
              var currentPage = ncMaster.next(); 
              var value = currentPage.get("pyValue").getValue();
              /** using the Not eequal inoder to filter out not apply values from the list master list. the rest of the values will be then copy to the 				current page **/
              if( (value!="6") && (value!="1") && (value!="7") && (value!="8") && (value!="10") && (value != "11") && (value != "12") )
              {
                ncOptions.add().adoptJSON(currentPage.getJSON());   
              }
            }          
        }
     
        else if(params.IsReInterview == "true")
        {    
            var resp = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
            while(ncMaster.hasNext())
            {
                var currentPage = ncMaster.next(); 
                var value = currentPage.get("pyValue").getValue();
                var attactual = resp.get("ATTACTUAL")? resp.get("ATTACTUAL").getValue() : "";
                var respTypeProd = resp.get("RESPTYPE_PROD")? resp.get("RESPTYPE_PROD").getValue() : "";
                if(value == "1")
                {
                    if(respTypeProd == "HH")
                    {
                    	ncOptions.add().adoptJSON(currentPage.getJSON());   
                    }
                }
                else if(value == "10")
                {
                    if(respTypeProd == "proxy")
                    {
                        var respondent = pega.ui.ClientCache.find("pyWorkPage.Respondent");
                        var respFullName = respondent.get("FullName")? respondent.get("FullName").getValue() : "Respondent";
                    	ncOptions.add().adoptJSON(currentPage.getJSON().replace("RESPNAME", respFullName ));   
                    }                  
                }
                else if(value == "11")
                {
                    if(attactual=="T")
                    {
                    	ncOptions.add().adoptJSON(currentPage.getJSON());
                    }
                }
                else if( (value=="12") || (value=="7") || (value=="8") )
                {
                    if(attactual=="PV")
                    {
                    	ncOptions.add().adoptJSON(currentPage.getJSON());
                    }
                }
                else if((value=="2") || (value=="3") || (value=="4") || (value=="5") || (value=="9"))
                {
                    ncOptions.add().adoptJSON(currentPage.getJSON());
                }
            }
        }
        else if(params.IsMU == "true")
        {
            while(ncMaster.hasNext())
            {    
              var currentPage = ncMaster.next(); 
              var value = currentPage.get("pyValue").getValue();
              if( (value!="6") && (value!="7") && (value!="8") && (value!="10") && (value != "11") && (value != "12") & (value != "1") )
              {
                ncOptions.add().adoptJSON(currentPage.getJSON());   
              }
            }          
        }
        else
        {
            var resp = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response");
            while(ncMaster.hasNext())
            {    
              var currentPage = ncMaster.next(); 
              var value = currentPage.get("pyValue").getValue();
              if( (value != "10") && (value != "11") && (value != "12") && (value != "13") && (value != "14"))
              {
                  if( (value!="6") && (value!="7") && (value!="8") )
                  {
                    ncOptions.add().adoptJSON(currentPage.getJSON());   
                  }
                  else if(resp)
                  {
                      var attactual = resp.get("ATTACTUAL")? resp.get("ATTACTUAL").getValue() : "";
                      if(attactual=="PV")
                      {
                          var respLocCode = resp.get("RESPONSE_LOCATION_CODE")? resp.get("RESPONSE_LOCATION_CODE").getValue() : "";
                          if(respLocCode == "1")
                          {
                              ncOptions.add().adoptJSON(currentPage.getJSON());
                          }
                          else if((respLocCode=="2")&&(value!="6"))
                          {
                              ncOptions.add().adoptJSON(currentPage.getJSON());
                          }
                      }
                  }
              }
            }
        }
    }
    catch(e)
    {
		/*log error*/
        console.log("Error in D_NoCompleteOptions: " + e.message);      
    }
}


/*For Know Address screen*/
function D_KnowAddressOptions(dpPage, params){  
	var KnowAddressMaster = pega.ui.ClientCache.find("D_KnowAddressOptions_Master.pxResults").iterator(); 
    var KnowAddressOptions = pega.ui.ClientCache.find("D_KnowAddressOptions").put("pxResults",[]);  
	
  /* If RESPTYPE_PROD = "proxy" & ReInterview, filter out "Address not a housing unit" */
  /* Also, If IsMU & ReInterview, filter out "Address not a housing unit" */
  if((params.RespTypeProd == "proxy" && params.IsReInterview=="true") || (params.IsMU == "true" && params.IsReInterview=="true")) {

	var index = 1;
	while(KnowAddressMaster.hasNext()) {
		var currentPage = KnowAddressMaster.next(); 
        var Value = currentPage.get("pyValue").getValue();
	   				
		/* "Address not a housing unit" code = 3 */
		if(Value != "3") {
			KnowAddressOptions.add().adoptJSON(currentPage.getJSON()); ;
		}
	}
  }
  else{ /*if not RI add all options*/
    
   while(KnowAddressMaster.hasNext()) {    
      var currentPage = KnowAddressMaster.next();      
      KnowAddressOptions.add().adoptJSON(currentPage.getJSON());   
      }
    }
}

function D_RespPhoneOptions(dpPage, params){
    var TelephoneNumbersMaster = pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers").iterator();
    var RespPhoneOptions = pega.ui.ClientCache.find("D_RespPhoneOptions").put("pxResults",[]); 
    /*No filter, copy all to dP*/
    if(params.PhoneAssociation===""){
      while(TelephoneNumbersMaster.hasNext()){
        var telephoneNumberPage = TelephoneNumbersMaster.next();
        var phone = (telephoneNumberPage.get("pyLabel")) ? telephoneNumberPage.get("pyLabel").getValue() :"";
        if(phone!==""){
        	var phonePage = pega.ui.ClientCache.createPage("phonePage");
        	var formattedPhone = CB.formatPhone(phone);
        	phonePage.put("pyLabel", formattedPhone);
        	phonePage.put("pyValue", formattedPhone);
        	RespPhoneOptions.add().adoptJSON(phonePage.getJSON());
        }        
      }
    }
	/*filter by params.PhoneAssociation*/
  	else{
       while(TelephoneNumbersMaster.hasNext()){
       var telephoneNumberPage = TelephoneNumbersMaster.next();
       var phone = (telephoneNumberPage.get("pyLabel")) ? telephoneNumberPage.get("pyLabel").getValue() :"";
       var phoneAssoc = (telephoneNumberPage.get("PhoneAssociation")) ? telephoneNumberPage.get("PhoneAssociation").getValue() :"";
       if(phone!=="" && params.PhoneAssociation==phoneAssoc){
        	var phonePage = pega.ui.ClientCache.createPage("phonePage");
        	var formattedPhone = CB.formatPhone(phone);
        	phonePage.put("pyLabel", formattedPhone);
        	phonePage.put("pyValue", formattedPhone);
        	RespPhoneOptions.add().adoptJSON(phonePage.getJSON());
       }        
      }
    }     
    var addPhonePage = pega.ui.ClientCache.createPage("addPhone");
    addPhonePage.put("pyLabel", "Add Number");
    addPhonePage.put("pyValue", "-1");
    RespPhoneOptions.add().adoptJSON(addPhonePage.getJSON());  
}
function D_NumbersCalled(dpPage, params){
    var TelephoneNumbersMaster = pega.ui.ClientCache.find("pyWorkPage.TelephoneNumbers").iterator();
    var RespPhoneOptions = pega.ui.ClientCache.find("D_NumbersCalled").put("pxResults",[]); 
    /*No filter, copy all to dP*/
    if(params.PhoneAssociation===""){
      while(TelephoneNumbersMaster.hasNext()){
        var telephoneNumberPage = TelephoneNumbersMaster.next();
        var phone = (telephoneNumberPage.get("pyLabel")) ? telephoneNumberPage.get("pyLabel").getValue() :"";
        if(phone!==""){
        	var phonePage = pega.ui.ClientCache.createPage("phonePage");
        	var formattedPhone = CB.formatPhone(phone);
        	phonePage.put("pyLabel", formattedPhone);
        	phonePage.put("pyValue", formattedPhone);
        	RespPhoneOptions.add().adoptJSON(phonePage.getJSON());
        }        
      }
    }
	/*filter by params.PhoneAssociation*/
  	else{
       while(TelephoneNumbersMaster.hasNext()){
       var telephoneNumberPage = TelephoneNumbersMaster.next();
       var phone = (telephoneNumberPage.get("pyLabel")) ? telephoneNumberPage.get("pyLabel").getValue() :"";
       var phoneAssoc = (telephoneNumberPage.get("PhoneAssociation")) ? telephoneNumberPage.get("PhoneAssociation").getValue() :"";
       if(phone!=="" && params.PhoneAssociation==phoneAssoc){
        	var phonePage = pega.ui.ClientCache.createPage("phonePage");
        	var formattedPhone = CB.formatPhone(phone);
        	phonePage.put("pyLabel", formattedPhone);
        	phonePage.put("pyValue", formattedPhone);
        	RespPhoneOptions.add().adoptJSON(phonePage.getJSON());
       }        
      }
    }     
    var addPhonePage = pega.ui.ClientCache.createPage("addPhone");
    addPhonePage.put("pyLabel", "Add Number");
    addPhonePage.put("pyValue", "-1");
    NumbersCalled.add().adoptJSON(addPhonePage.getJSON());  
}

function D_LanguageBarrierLanguageList(dpPage, params) {
  try
  {
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var LanguageBarrierMaster = pega.ui.ClientCache.find("D_LanguageList.pxResults").iterator();

    var LanguageBarrierList = pega.ui.ClientCache.find("D_LanguageBarrierLanguageList").put("pxResults", []); 

    while (LanguageBarrierMaster.hasNext())
    {
      var currentPage = LanguageBarrierMaster.next();
      var newPage = pega.ui.ClientCache.createPage("newLangPage");

      var LanguageCode = currentPage.get("Code") ? currentPage.get("Code").getValue() : "";
	  var SortOrder = currentPage.get("SortOrder") ? currentPage.get("SortOrder").getValue() : "";
      var desc = currentPage.get("Description") ? currentPage.get("Description").getValue() : "";
      newPage.put("Code", LanguageCode);
      newPage.put("Description", desc);
      newPage.put("pxObjClass", "CB-Data-Ref-Language");
      newPage.put("pySelected", false);
      var respLangCode = pega.ui.ClientCache.find("pyWorkPage.Respondent.Response.NRFU_RESP_LANG_BARRIER_CODE");
      if(respLangCode)
      {
          var respLangIterator = respLangCode.iterator();
          while(respLangIterator.hasNext())
          {
              var curRespLangCode = respLangIterator.next();
              var respLangLocde = curRespLangCode.get("Code") ? curRespLangCode.get("Code").getValue() : "";
              if(respLangCode == LanguageCode)
              {
                  newPage.put("pySelected", true);
                  break;
              }
          }
      }
      LanguageBarrierList.add().adoptJSON(newPage.getJSON());
    }

  } catch (e) {
    /*log error*/
    console.log("Error in D_LanguageBarrierLanguageList: " + e.message);
  }
}


function D_LanguageBarrierRespLanguageList(dpPage, params) {
  try {
    var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var LanguageBarrierMaster = pega.ui.ClientCache.find("D_LanguageList.pxResults").iterator();

    var LanguageBarrierRespList = pega.ui.ClientCache.find("D_LanguageBarrierRespLanguageList").put("pxResults", []); 
    
    var isNotPuertoRico = !CB.isPuertoRico(params.AddressType);
    var English = "1";

    while (LanguageBarrierMaster.hasNext()) {
      var currentPage = LanguageBarrierMaster.next();
      var newPage = pega.ui.ClientCache.createPage("newLangPage");

      var LanguageCode = currentPage.get("Code") ? currentPage.get("Code").getValue() : "";
	  var SortOrder = currentPage.get("SortOrder") ? currentPage.get("SortOrder").getValue() : "";
      var desc = currentPage.get("Description") ? currentPage.get("Description").getValue() : "";
      newPage.put("Code", LanguageCode);
      newPage.put("Description", desc);
      newPage.put("pxObjClass", "CB-Data-Ref-Language");
      newPage.put("pySelected", false);
	  var newPageJSON = newPage.getJSON();
      /** Skip the current iteration if we are not in Puerto Rico and the current Language Code is English */
      if (isNotPuertoRico) {
        if(LanguageCode != English) {
          LanguageBarrierRespList.add().adoptJSON(newPageJSON);
        }
      }
      else {
        LanguageBarrierRespList.add().adoptJSON(newPageJSON);
      }
    }

  } catch (e) {
    /*log error*/
    console.log("Error in D_LanguageBarrierRespLanguageList: " + e.message);
  }
}

/*For New Case Address screen*/
function D_NewCaseAddressType(dpPage, params){  
	var NewCaseAddressTypeMaster = pega.ui.ClientCache.find("D_NewCaseAddressType_Master.pxResults").iterator(); 
    var NewCaseAddressType = pega.ui.ClientCache.find("NewCaseAddressType").put("pxResults",[]);  
	
  if(params.InMoverDone == "" ) {

	while(NewCaseAddressTypeMaster.hasNext()) {
		var currentPage = NewCaseAddressTypeMaster.next(); 
        var Value = currentPage.get("pyValue").getValue();
	   				
		if(Value != "Other") { /* Don't add "Other"  to list */
			NewCaseAddressType.add().adoptJSON(currentPage.getJSON()); ;
		}
	}
  }
  else { /* Copy all contents in Master Data Page */
    
   while(NewCaseAddressTypeMaster.hasNext()) {    
      var currentPage = NewCaseAddressTypeMaster.next();            
      NewCaseAddressType.add().adoptJSON(currentPage.getJSON());   
      }
    }
}

/*For Dial Outcome screen*/
function D_DialOutcomeOptions(dpPage, params){
  var dialOutcomeMaster = pega.ui.ClientCache.find("D_DialOutcomeOptions_Master.pxResults").iterator(); 
  var dialOutcomeOptions = pega.ui.ClientCache.find("D_DialOutcomeOptions").put("pxResults",[]);

 /* NRFU Flow */
 if(params.IsReInterview!="true" && params.IsMU!="true")
 {
    while(dialOutcomeMaster.hasNext()){    
      var currentPage = dialOutcomeMaster.next(); 
	  dialOutcomeOptions.add().adoptJSON(currentPage.getJSON());
    }
 }
 /* MU, RI, and MURI Flows */
 else {
    while(dialOutcomeMaster.hasNext()){    
      var currentPage = dialOutcomeMaster.next(); 
      var pyValue = currentPage.get("pyValue").getValue();
      if(pyValue!="3"){
        dialOutcomeOptions.add().adoptJSON(currentPage.getJSON());   
      }
    }
  }
}
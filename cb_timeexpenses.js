function SetWorkDateTimeListIsEmpty() {
  var oSafeUrl = new SafeURL("CB-FW-CensusFW-Work.CallDataTransform");
	oSafeUrl.put("DataTransformName", "SetWorkDateTimeListIsEmpty");
    oSafeUrl.put("workPage", "pyWorkPage");
    pega.util.Connect.asyncRequest('GET', oSafeUrl.toURL(), '');
}

/*
 *	Created By: Omar Mohammed,Moved here and commented by Kelsey C. Justis
 *	Date: 03-13-2017
 *	Purpose: Update Time Expense case with user selected Month and Day selections.
 *	User Story: US-3115.
 */
function OnChangeOfDate() {

  /* Call CheckForExistingTimeExpense DT.*/
  var oSafeUrl = new SafeURL("CB-FW-CensusFW-Work.CallDataTransform");
  oSafeUrl.put("DataTransformName", "CheckForExistingTimeExpense");
  oSafeUrl.put("workPage", "pyWorkPage");
  pega.util.Connect.asyncRequest('GET', oSafeUrl.toURL(), '');
  
  /* Call DetermineWorkDateTimeType DT.*/
  var safeUrl = new SafeURL("CB-FW-CensusFW-Work.CallDataTransform");
  safeUrl.put("DataTransformName", "DetermineWorkDateTimeType");
  safeUrl.put("workPage", "pyWorkPage");
  pega.util.Connect.asyncRequest('GET', safeUrl.toURL(), '');
  
  /* Reload the DateandTIme section.*/
  var section = pega.u.d.getSectionByName("DateAndTime", '', document);
  pega.u.d.reloadSection(section, '', '', false, false, '', false); 
}

/*
 *	Created By: Kelsey C. Justis, Timothy Bechmann
 *	Date: 02-07-2017
 *	Purpose: Sync Data Page holding selected time expense case rejected reason..
 *	User Story: US-1916.
 */
function setSelectedTimeExpense(eleID) {
  
  /* IF mobile and online.*/
    if (pega.mobile.isHybrid) {
        try {
			/* Retrieve required data.*/
          	var index = CB.indexInPageList("pzInsKey", eleID, "D_TimeExpenseCaseList.pxResults");   
          
          	if(index < 0) {
              console.log("SelectedTimeExpense not found for eleID: " + eleID);
              return;
            }

          	var selectedTimeExpenseCase = pega.ui.ClientCache.find('D_TimeExpenseCaseList.pxResults(' + index + ')'); /* Data for the selected Time Expense case.*/
			var selectedTimeExpenseDP = pega.ui.ClientCache.find('D_SelectedTimeExpense'); /* Load the Data Page storing temporary values for the selected Time Expense case.*/
          	
          	if(!selectedTimeExpenseDP)
            {
                /* Add this to a temporary page */
              	var objJSON = '{"pxObjClass" : "CB-FW-CensusFW-Work-TimeExpense"}';
                selectedTimeExpenseDP = pega.ui.ClientCache.createPage("D_SelectedTimeExpense");
                selectedTimeExpenseDP.adoptJSON(objJSON);
            }
          
			var reassignmentComment = (selectedTimeExpenseCase.get('ReassignmentComment')) ? selectedTimeExpenseCase.get('ReassignmentComment').getValue() : ''; /* ReassignmentComment from Field OCS.*/
			
			/* Sync the Data Page 'ReassignmentComment' property values with the selected TimeExpense Case.*/
			selectedTimeExpenseDP.put("ReassignmentComment", reassignmentComment); 
        } catch (er) {
            console.log("Error in updateStatusReasonAndReportingStatus_Unit_Selected: " + er.message);
        }
    } else { /*On Desktop.*/  
    
		/* Launch the Corresponding Data Transform via anx activity; required for now ("until Pega 7.2.3 release") so data transform can be called via JS.*/   
        var oSafeUrl = new SafeURL("CB-FW-CensusFW-Work-TimeExpense.SetTimeExpenseRejectedReason");
      	oSafeUrl.put("pzInsKey", eleID);
      	pega.util.Connect.asyncRequest('GET', oSafeUrl.toURL(), '');
  }
}

/*************************************************************
 ****	All time and expenses code should be here
 ****	Please use try/catch block in your code
 **************************************************************/
/*** Name Space ****/
var EXPCB = EXPCB || {};

/*******************************************************************************************
 ****	The following helper method simplifies creating custom client-side edit validation
 ****	START helper
 *******************************************************************************************/

EXPCB.EXPCBCreateCustomEditValidation = function(validationType, handler) {

    try {
        if (typeof validationType != "string" || typeof handler != "function") {
            throw "Usage: EXPCBCensus.EXPCBCreateCustomEditValidation(string,function)";
        }
        if (!EXPCBCustomEditValidation) {
            var EXPCBCustomEditValidation = {};
        }
        EXPCBCustomEditValidation[validationType] = new validation_ValidationType(validationType, handler);
        EXPCBCustomEditValidation[validationType].addEventFunction("onchange", handler);
    } catch (e) {
        console.log("Unexpected EXPCBCensus.EXPCBCreateCustomEditValidation error: " + e.message);
    }
}
/***************** END helper  ************************************************/

/* Being used?-KCJ*/
function getElementValue(elementName) {
  var elementVal = "";
  if (!($("#" + elementName).val() === undefined)) {
    elementVal = $("#" + elementName).val();
    console.log(elementName + ": ~~" + elementVal + "~~");
  } else {
    console.log("element val:" + $("#" + elementName).val() + "; Trying another way to find value");

    $("input[name$='" + elementName + "']").each(function() {
      if (this.type == "checkbox") {
        if (this.checked == true) {
          elementVal = this.checked;
          return true;
        }
      } else {
        if (this.checked == true) {
          elementVal = this.value;
          return true;
        }
      }
    });
  }
  return elementVal;
}

EXPCB.getElementValue = function(elementName) {
  var elementVal = "";
  if (!($("#" + elementName).val() === undefined)) {
    elementVal = $("#" + elementName).val();
    console.log(elementName + ": ~~" + elementVal + "~~");
  } else {
    console.log("element val:" + $("#" + elementName).val() + "; Trying another way to find value");

    $("input[name$='" + elementName + "']").each(function() {
      if (this.type == "checkbox") {
        if (this.checked == true) {
          elementVal = this.checked;
          return true;
        }
      } else {
        if (this.checked == true) {
          elementVal = this.value;
          return true;
        }
      }
    });
  }
  return elementVal;
}
/*
 *	Created By: Kenward Thoi, Randy Reese, Kelsey Justis 
 *	Date: 12-09-2016
 *	Purpose: Assigns screen destination when previous button is selected on a screen in the TimeExpense flow.
 *	User Story: 
 */
function TimeExpenseGoBack() {
    if (pega.mobile.isHybrid) {
        var taskName = pega.ui.ClientCache.find('newAssignPage.pxTaskName').getValue();
      	var currPage = pega.ui.ClientCache.find("pyWorkPage");
      	console.debug("Inside TimeExpenseGoBack-1: " + taskName + " Current Page: " + currPage.getJSON());
      	/* Add this to a temporary page */
        var prevWorkPG = pega.ui.ClientCache.createPage("PreviousWorkPage");
        prevWorkPG.adoptJSON(currPage.getJSON());
      	console.debug("Inside TimeExpenseGoBack-2: " + taskName + " Prev Page: " + prevWorkPG.getJSON());
      

            switch (taskName) {
                case 'Assignment2':
                    pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=InputExpense&TaskName=Assignment1");
                    break;
                case 'Assignment3':
                    pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=InputExpense&TaskName=Assignment2");
                    break;
                case 'Assignment4':
                    var hasExpense = pega.ui.ClientCache.find('pyWorkPage.TimeExpense.HasExpense');
                    if (hasExpense) {
                        hasExpense = hasExpense.getValue();
                    } else {
                        var hasExpense = "Yes";
                    }
                   if (hasExpense === "Yes") {
                        pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=InputExpense&TaskName=Assignment3");
                    } else {
                        pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=InputExpense&TaskName=Assignment2");
                    }

                    break;
                case 'Assignment5':
                    /* Clear flag for the attest flag */
                    var timeExpense = pega.ui.ClientCache.find('pyWorkPage.TimeExpense');
                    timeExpense.put("AttestFlag", false);
                    pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&flowName=InputExpense&TaskName=Assignment4");
                    break;
                default:
                    pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&previousAssignment=true&previousEntryPoint=true");
                    break;
            }
   
    } else {
        pega.u.d.submit("pyActivity=GoToPreviousTask&skipValidations=true&previousAssignment=true&previousEntryPoint=true");
    }
  
  		prevWorkPG = pega.ui.ClientCache.find("PreviousWorkPage");
      	console.log("Inside TimeExpenseGoBack-3: " + taskName + " prevWorkPG Page: " + prevWorkPG.getJSON());
}

/*
 *	Created By: Kenward Thoi, Randy Reese, Kelsey Justis 
 *	Date: 12-09-2016
 *	Purpose: Deletes the selected entered time interval in the WorkDateTimeList.
 *	User Story: 
 */
function DeleteTimeInterval(event) {
  	
  	/* If on mobile device.*/
    if (pega.mobile.isHybrid) {
      
        /* Use the repeater utility to get page source and row index from event */
        var D = pega.ui.DataRepeaterUtils;
        var source = D.getAbsoluteDataSourceFromEvent(event);
        var index = source.rowIndex;
      	
      	/* Get WorkDateTimeList.*/
      	var workPage = pega.ui.ClientCache.find('pyWorkPage');
        var timeExpense = pega.ui.ClientCache.find('pyWorkPage.TimeExpense');
        var workDateTimeList = timeExpense.get('WorkDatetimeList');
      	
      	/* Remove WorkDateTimeList time interval.*/
        workDateTimeList.remove(index);
      
      	/* Keep the currently entered Month/Day/Year values.*/
        timeExpense.put("YearData", EXPCB.getElementValue("YearData"));
        timeExpense.put("MonthData", EXPCB.getElementValue("MonthData"));
        timeExpense.put("DayData", EXPCB.getElementValue("DayData"));
      
      	/* IF the WorkDateTime List is not empty, disable the date entry controls. */
      	if (timeExpense.get("WorkDatetimeList(1)")) {
        	workPage.put('WorkDatetimeListIsEmpty', false);
      	} else{
        	workPage.put('WorkDatetimeListIsEmpty', true);
      	}
      	/* Reload the section.*/
        var section = pega.u.d.getSectionByName("DateAndTime", '', document);
        pega.u.d.reloadSection(section, '', '', false, false, '', false);
  } 
}

/*
 *	Created By: Kenward Thoi, Randy Reese, Kelsey Justis 
 *	Date: 12-09-2016
 *	Purpose: Clears all entered time intervals in the WorkDateTimeList.
 *	User Story: 
 */
function ResetWorkedDateTime() {
  	
  	/* Retrieve required data.*/
	var workPage = pega.ui.ClientCache.find("pyWorkPage");
    var workDateTime = workPage.get("WorkDateTime");
  	var timeExpense = workPage.get("TimeExpense"); 
  
    /* WorkDateTime page DNE.*/
    if (!workDateTime) {
      var tempWorkpg = workPage.getJSON();
  	  tempWorkpg = tempWorkpg.substring(0, tempWorkpg.length - 1);
      tempWorkpg += ', "WorkDateTime":{"pxObjClass":"CB-Data-WorkDateTime"}}';
      workPage.adoptJSON(tempWorkpg);
      var workDateTime = workPage.get("WorkDateTime");
    }
  
    /* Initialize time interval.*/
    workDateTime.put("FromHour", 9);
    workDateTime.put("FromMinute", 0);
    workDateTime.put("FromPeriod", "AM");
    workDateTime.put("ToHour", 5);
    workDateTime.put("ToMinute", 0);
    workDateTime.put("ToPeriod", "PM");
    workDateTime.put("Type", "Regular");
  	timeExpense.put("YearData", EXPCB.getElementValue("YearData"));
    timeExpense.put("MonthData", EXPCB.getElementValue("MonthData"));
    timeExpense.put("DayData", EXPCB.getElementValue("DayData"));
  
  	/* Reload the section.*/
	var section = pega.u.d.getSectionByName("DateAndTime", '', document);
    pega.u.d.reloadSection(section, '', '', false, false, '', false);
}

/*
 *	Created By: Kenward Thoi, Randy Reese, Kelsey Justis 
 *	Date: 12-09-2016
 *	Purpose: Adds the valid entered time interval on the DateTime screen to the WorkDateTimeList.
 *	User Story: 
 */
function AddToWorkedDateTimeList() {
  
  try {
      if (pega.offline) {
          /* Retrieve required data.*/
          var workPage = pega.ui.ClientCache.find("pyWorkPage");
          var timeExpense = workPage.get("TimeExpense");
          var workDateTime = workPage.get("WorkDateTime");

          /* IF TimeExpense page DNE.*/
          if (!timeExpense) {
            console.log("AddToWorkedDateTimeList:: TimeExpense page not found");

            /* WorkDateTime List DNE, enable the date entry controls.*/
            workPage.put('WorkDatetimeListIsEmpty', true);
            return;
          }

          /* Keep the currently entered Month/Day/Year values.*/
          var monthData = EXPCB.getElementValue("MonthData");    
          var dayData  = EXPCB.getElementValue("DayData");
          var yearData = EXPCB.getElementValue("YearData");
          timeExpense.put("YearData", yearData);
          timeExpense.put("MonthData", monthData);
          timeExpense.put("DayData", dayData);
          timeExpense.put("Date", yearData + monthData + dayData); /*Set the Date*/


          /* timeExpense exists so we can retrieve the WorkDatetimeList.*/
          var workDateTimeList = workPage.get("TimeExpense.WorkDatetimeList");

          /* Create a temp page for the WorkDateTime item */
          var tempWorkDateTime = pega.ui.ClientCache.createPage("TempPg");
          var objJSON = '{"pxObjClass" : "CB-Data-WorkDateTime"}';
          tempWorkDateTime.adoptJSON(objJSON);

          /* Get exisiting values for properties needed in Summary Details section for Summary Screen.-KCJ*/
          tempWorkDateTime.put("FromHour", parseInt(EXPCB.getElementValue("FromHour")));
          tempWorkDateTime.put("FromMinute", parseInt(EXPCB.getElementValue("FromMinute")));
          tempWorkDateTime.put("FromPeriod", EXPCB.getElementValue("FromPeriod"));
          tempWorkDateTime.put("ToHour", parseInt(EXPCB.getElementValue("ToHour")));
          tempWorkDateTime.put("ToMinute", parseInt(EXPCB.getElementValue("ToMinute")));
          tempWorkDateTime.put("ToPeriod", EXPCB.getElementValue("ToPeriod"));
          tempWorkDateTime.put("HoursWorked", parseInt(EXPCB.getElementValue("HoursWorked")));
          tempWorkDateTime.put("MinutesWorked", parseInt(EXPCB.getElementValue("MinutesWorked")));

          /* Set Durations */
          SetWorkedDateTimeDuration(tempWorkDateTime);
          console.log("AddToWorkedDateTimeList:: Item to add: " + tempWorkDateTime.getJSON());

          var displayOTType = workPage.get('WorkDateTime.DisplayOTType') ? workPage.get('WorkDateTime.DisplayOTType').getValue() : false;
          var displayRegularType = workPage.get('WorkDateTime.DisplayRegularType') ? workPage.get('WorkDateTime.DisplayRegularType').getValue() : false;
          var otType = workPage.get('WorkDateTime.OvertimeType') ? workPage.get('WorkDateTime.OvertimeType').getValue() : "Overtime";
          var regularType = workPage.get('WorkDateTime.RegularType') ? workPage.get('WorkDateTime.RegularType').getValue() : "Regular";

          /* IF should display 'Overtime' and "overtime Training' Work Type Options.-KCJ*/
          if (displayOTType == true || displayOTType == 'true'){
            if (workDateTime)	workDateTime.put('Type', otType);
            if (tempWorkDateTime)	tempWorkDateTime.put('Type', otType);
          }
          else{ /*Show Regular Work Type options as default.-KCJ*/
            if (workDateTime)	workDateTime.put('Type', regularType);
            if (tempWorkDateTime)	tempWorkDateTime.put("Type", regularType);
          }

          /* Get exisiting value for Work Type property needed in Summary Details section for Summary Screen<-NEEDED?.-KCJ*/
          /*tempWorkDateTime.put("Type", EXPCB.getElementValue("Type"));*/


          /* Format and add the entered time interval information to enable display on Summary Screen.-KCJ*/
          FormatInputForSummaryScreen(tempWorkDateTime);

	      /* Validate user entries */
          if (ValidateHasMessages(tempWorkDateTime)) {

              console.log("AddToWorkedDateTimeList:: Validation error" + timeExpense.getMessages());
              /* Reload the section.*/
              var section = pega.u.d.getSectionByName("DateAndTime", '', document);
              pega.u.d.reloadSection(section, '', '', false, false, '', false);

              /* Refresh the controls.*/
            console.log("Refresh-1");
              pega.ui.DCUtil.refresh();
              return;       
          }

          /* WorkDateTimeList empty. Create and add item to WorkDatetimeList page **/
          if (!workDateTimeList) {
              console.log("AddToWorkedDateTimeList:: workDateList is empty, TimeExpense: " + timeExpense.getJSON());

              /* Construct WorkDatetimeList page and add first item */
              var tempWorkpg = timeExpense.getJSON();
              tempWorkpg = tempWorkpg.substring(0, tempWorkpg.length - 1);

              /* Create new WorkDatetimeList page JSON notation */
              tempWorkpg = tempWorkpg + ', "WorkDatetimeList" : [' + tempWorkDateTime.getJSON() + ']}';
              timeExpense.adoptJSON(tempWorkpg);
          } else {
                console.log("AddToWorkedDateTimeList:: workDateList is not empty, TimeExpense: " + timeExpense.getJSON());

                /* Unable to manipulate WorkDatetimeList directly, so do some String manipulation of TimeExpense page below*/
                var tempWorkpg = timeExpense.getJSON();
                var pos = tempWorkpg.indexOf("WorkDatetimeList");
                var openBracketPos = tempWorkpg.indexOf('[', pos);
                var closeBracketPos = tempWorkpg.indexOf(']', pos);
                var remainingStr = tempWorkpg.substring(closeBracketPos);
                var frontStr = tempWorkpg.substring(0, closeBracketPos);
                if ((closeBracketPos - openBracketPos) < 10) {

                    /* This is a case where all items in the list has been manually deleted make this first in list */
                    tempWorkpg = frontStr + tempWorkDateTime.getJSON() + remainingStr;
                } else {

                    /* Normal scenario. Append after last item */
                    tempWorkpg = frontStr + ',' + tempWorkDateTime.getJSON() + remainingStr;
                }
                timeExpense.adoptJSON(tempWorkpg);
          }

          /* IF the WorkDateTime List is not empty, disable the date entry controls. */
          if (timeExpense.get("WorkDatetimeList(1)")) {
            if (workPage)	workPage.put('WorkDatetimeListIsEmpty', false);
          } 
          else{
            if (workPage)	workPage.put('WorkDatetimeListIsEmpty', true);
          }

          /* Refresh section to display updated list.*/
         var section = pega.u.d.getSectionByName("DateAndTime", '', document);
          pega.u.d.reloadSection(section, '', '', false, false, '', false);
        console.log("Refresh-2");
          pega.ui.DCUtil.refresh();

          console.log("current content of TimeExpense after add: " + timeExpense.getJSON());
      }
  } catch (e) {
    console.log("AddToWorkedDateTimeList :: Caught exception" + e);
  }
}

/*
 *	Created By: Kenward Thoi, Randy Reese, Kelsey Justis 
 *	Date: 12-09-2016
 *	Purpose: Sets the hours and minutes worked for the entered time interval on the DateTime screen.
 *	User Story: 
 */
function SetWorkedDateTimeDuration(workDateTime) {
  console.log("SetWorkedDateTimeDuration::");
  try {
        /*Retrieve required data.*/
        var timeExpense = pega.ui.ClientCache.find("pyWorkPage.TimeExpense");
        var workDay = timeExpense.get("Date").getValue();
        /*If a date has not been entered.*/
        if (!workDay) {
          console.log("SetWorkedDateTimeDuration:: Work date not found");
          return;
        }	
        /* Initialize fromDate and toDate */
        var workDate = new Date(workDay);
        var fromDate = new Date();
        var toDate = new Date();
    
        /*Retrieve user entered values for time interval.*/
        var fromHour = parseInt(EXPCB.getElementValue("FromHour"));
        var fromMinute = parseInt(EXPCB.getElementValue("FromMinute"));
    	var fromPeriod = EXPCB.getElementValue("FromPeriod");
        var toHour = parseInt(EXPCB.getElementValue("ToHour"));
        var toMinute = parseInt(EXPCB.getElementValue("ToMinute"));
        var toPeriod = EXPCB.getElementValue("ToPeriod");
		 
        /*Convert to 12-HR to 24-HR time for easy comparison of time intervals.*/
    	fromDate = convertTime12To24(fromDate, fromPeriod, fromHour, fromMinute); /*From properties.*/
    	toDate = convertTime12To24(toDate, toPeriod, toHour, toMinute); /*To properties.*/
    
        /** Set Hours and Minutes worked  **/
        var hoursWorked =  Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60)); /* Integer number for hours.*/
        var minutesWorked = (toDate.getTime() - fromDate.getTime()) / (1000 * 60);
  		
    	/* Minutes left over after hours removed; 75 minutes should become 15 minutes-Hours already accounted for.*/
        if (minutesWorked >= 60) {
          minutesWorked = minutesWorked % 60; 
        }
    	    
   		/*Put into memory.*/
        workDateTime.put("HoursWorked", parseInt(hoursWorked));
        workDateTime.put("MinutesWorked", parseInt(minutesWorked));
       
  } catch (e) {
    console.log("SetWorkedDateTimeDuration:: Caught exception" + e);
  }
}

/*
 *	Created By: Kelsey Justis 
 *	Date: 10-31-2016
 *	Purpose: Format and add the entered time interval values for display on the Summary Screen (Found in section  ScreenWording > Summary Details).
 *	User Story: US-41.
 */
function FormatInputForSummaryScreen(tempWorkDateTime) {

    /* Make a hack to display '0' as '00' for the minutes; property value does not default to 
       a human-friendly string and others need the property to have the current type for this property.-KCJ*/
    var fromMinuteHack = tempWorkDateTime.get("FromMinute").getValue() == '0' ? '00' : parseInt(tempWorkDateTime.get("FromMinute").getValue());
    var toMinuteHack = tempWorkDateTime.get("ToMinute").getValue() == '0' ? '00' : parseInt(tempWorkDateTime.get("ToMinute").getValue());

    /* Put the properties and their values into the Summary Screen page.-KCJ*/
    tempWorkDateTime.put("StartTime", tempWorkDateTime.get("FromHour").getValue() + ":" +
        fromMinuteHack + "  " + tempWorkDateTime.get("FromPeriod").getValue());
    tempWorkDateTime.put("EndTime", tempWorkDateTime.get("ToHour").getValue() + ":" +
        toMinuteHack + "  " + tempWorkDateTime.get("ToPeriod").getValue());
    tempWorkDateTime.put("TimeIntervalTimeWorked", String(parseFloat(tempWorkDateTime.get("HoursWorked").getValue()) + 
                        parseFloat(tempWorkDateTime.get("MinutesWorked").getValue())/60.0));
}

/*
 *	Created By: Kenward Thoi, Randy Reese, Kelsey Justis 
 *	Date: 12-09-2016
 *	Purpose: Validates the entered values on the DateTime screen.
 *	User Story: 
 */
function ValidateHasMessages(tempWorkDateTime) {
  
  /* Initialize variable to flag if validation has fired and added and error message.*/
  var hasMessages = false;
  try {  
        var workPage = pega.ui.ClientCache.find("pyWorkPage");
        var timeExpense = workPage.get("TimeExpense");        
        var workDateTime = workPage.get("WorkDateTime");

        /* Clear current messages */
        if (workDateTime.hasMessages)	workDateTime.clearMessages(); 
        if (timeExpense.hasMessages)	timeExpense.clearMessages();
    	if (workPage.hasMessages)	workPage.clearMessages();

        /* Get user input from form and copy to WorkDateTime page so that error can point to the values */
        workDateTime.put("FromHour", parseInt(EXPCB.getElementValue("FromHour")));
        workDateTime.put("FromMinute", parseInt(EXPCB.getElementValue("FromMinute")));
        workDateTime.put("FromPeriod", EXPCB.getElementValue("FromPeriod"));
        workDateTime.put("ToHour", parseInt(EXPCB.getElementValue("ToHour")));
        workDateTime.put("ToMinute", parseInt(EXPCB.getElementValue("ToMinute")));
        workDateTime.put("ToPeriod", EXPCB.getElementValue("ToPeriod"));  
        /*workDateTime.put("Type", EXPCB.getElementValue("Type")); /*RAR*/
    	
    	/* Formulate user entered date from dropdown selectors.*/
        var monthData = EXPCB.getElementValue("MonthData");     
        var dayData	= EXPCB.getElementValue("DayData");
        var yearData = EXPCB.getElementValue("YearData");
    	var isLeapYear = (parseInt(yearData)%4 == 0);
    	
    	if (monthData !== '') {
          var tempMonthData = monthData - 1; 
          var inputDate = new Date();
          inputDate.setFullYear(yearData, tempMonthData, dayData);
        }
    
        var today = new Date();
		
    	/* Get properties required for if conditions below.*/
        var hoursWorked = parseInt(tempWorkDateTime.get("HoursWorked").getValue());
        var minutesWorked = parseInt(tempWorkDateTime.get("MinutesWorked").getValue());
        var Type = workDateTime.get("Type").getValue(); 
    	var toHour = parseInt(tempWorkDateTime.get("ToHour").getValue());
    	var toPeriod = parseInt(tempWorkDateTime.get("ToPeriod").getValue());
    	var isReclaim = timeExpense.get('IsReclaim') ? timeExpense.get('IsReclaim').getValue() : false;
    	var hasNonAttested = workPage.get('HasExistingNotAttested') ? workPage.get('HasExistingNotAttested').getValue() : false;
    	var sameDateCount = workPage.get('SameDateTimeExpenseCount') ? parseInt(workPage.get('SameDateTimeExpenseCount').getValue()) : parseInt("0");
    
        /* Validate 2 Max TE */
        if (sameDateCount > 3) {
            timeExpense.get('MonthData').addMessage(ALMCensus.Messages.Msg_2MaxTE);
            hasMessages = true;         
        }
    	
    	/* Validate Not Attested with same date */
    	else if (hasNonAttested === true || hasNonAttested === "true") {
          	timeExpense.get('MonthData').addMessage(ALMCensus.Messages.Msg_NotAttested);
          	hasMessages = true;
        }
    	
    	/* Validate valid input date */
        else if (((monthData === '04' || monthData === '06' || monthData === '09' || monthData === '11') && (dayData === '31')) || 
                  (monthData === '02' && (dayData === '30'|| dayData === '31')) ||
                  (monthData === '02' && (dayData === '29') && (!isLeapYear))){

            console.log("ValidateWorkDateTime:: Invalid input date");
          	         
            /* Put message on TimeExpense. Cannot put message on null value */
            /*KCJ-FIX THIS!*/
            timeExpense.get('MonthData').addMessage('Invalid Input Date.');
            hasMessages = true;         
        }

        /* Check for date in the future */
        else if (inputDate.getTime() > today.getTime()) {
            timeExpense.get('MonthData').addMessage(ALMCensus.Messages.Msg_DateFuture);
            hasMessages = true;
        }      
		
    	/*Check if there are 5 time entries*/
        else if (pega.ui.ClientCache.find("pyWorkPage.TimeExpense.WorkDatetimeList(5)")) {
            workDateTime.get('Type').addMessage(ALMCensus.Messages.Msg_5Dates);
            hasMessages = true;
        }
    
        /* Check if End Time is less than Start Time.*/
        else if ((hoursWorked < 0) || (minutesWorked < 0)) {
            console.log("ValidateWorkDateTime:: End Time is less than Start Times");        
            workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_DateEndTime);
            hasMessages = true;         
            console.log("Validation error message: " + workDateTime.get("ToHour").getMessages());
        }
    	
    	/* Check if End Time is is same as Start Time */
        else if ((hoursWorked == 0) && (minutesWorked == 0)) {              
            workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_TimeIntervalAlreadyEntered);
            hasMessages = true;  
        }
    
    	else {
            /* Validate whether user tries to add more than 8 hours nonovertime*/
          	hasMessages = ValidateMoreThan8HoursNonOvertime(hasMessages,tempWorkDateTime);
          	if (!hasMessages) {
              /* Validate whether the entered time interval is overtime.-Bola*/
              hasMessages = ValidateOvertime(hasMessages, tempWorkDateTime);
          	  if (!hasMessages && (isReclaim==="false" || isReclaim===false)) {
                /* Validate whether the entered time interval overlaps with any of the previousily entered time intervals.-KCJ, part of US-1634.*/
                hasMessages = ValidateTimeIntervalOverlap(hasMessages);
              }
            }
        }   	
  } catch (e) {
    console.log("ValidateWorkDateTime:: Caught exception" + e);
  }
  return hasMessages; 
}

/*
 *	Created By: Kelsey Justis 
 *	Date: 12-05-2016
 *	Purpose: To validate if the entered time interval along with the previously entered time intervals sums to more than 8 hours of nonovertime hours.
 *			 This validation executes after the user adds a time interval on the Date and Time screen. 		
 *	Part of User Story: US-1634.
*/
function ValidateMoreThan8HoursNonOvertime(hasMessages,tempWorkDateTime) {

  	/*Retrieve reuired data.*/  
    var timeExpense = pega.ui.ClientCache.find("pyWorkPage.TimeExpense");        
    var workDateTime = pega.ui.ClientCache.find("pyWorkPage.WorkDateTime");
  	
  	/* Get properties required for if conditions below.*/
    var hoursWorked = parseInt(tempWorkDateTime.get("HoursWorked").getValue());
    var minutesWorked = parseInt(tempWorkDateTime.get("MinutesWorked").getValue());
    var Type = workDateTime.get("Type").getValue(); 
  
  
  	/*If user tries to add more than 8 hours nonovertime in a single time interval.*/
    if (Type == "Regular" || Type == "Training") { 
        if ((hoursWorked > 8) || (hoursWorked == 8 && minutesWorked > 0)) {
        
      	/*Notify user with error message.*/
      	workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_8HoursNonOT);
        return hasMessages = true;
       }  else {           
            /* Iterator to loop over WorkDateTimeList and temp properties.*/
            var workDateTimeListEntry = timeExpense.get("WorkDatetimeList").iterator();

            /* Create temporary properties to hold worked hours/minutes for the time interval currently being looped over in WorkDateTimeList.*/
            var tempHoursWorked;
            var tempMinutesWorked;
            var totalNonOvertimeMinutesWorked = (hoursWorked*60) + minutesWorked;
            var tempType;
            var tempWorkDateTimeList;

            /* While there still exist a time interval after the current time interval in the WorkDateTimeList.*/
            while (workDateTimeListEntry && workDateTimeListEntry.hasNext()) {

                /* Get the next Time Interval in the WorkDateTimeList.*/
                tempWorkDateTimeList = workDateTimeListEntry.next();

                /* Grab type for the time interval currently being looped over in WorkDateTimeList.*/
                tempType = tempWorkDateTimeList.get("Type").getValue();

                /* If the type is not overtime.*/
                if ((tempType === "Regular" || tempType === "Training")){          

                  /* Grab worked hours/minutes for the time interval currently being looped over in WorkDateTimeList.*/
                  tempHoursWorked =  parseInt(tempWorkDateTimeList.get("HoursWorked").getValue());
                  tempMinutesWorked = parseInt(tempWorkDateTimeList.get("MinutesWorked").getValue());

                  /* Increment total minutes of non-overtime worked.*/
                  totalNonOvertimeMinutesWorked += (tempHoursWorked*60) + tempMinutesWorked;
                }

                /* If the total amount of non-overtime worked exceeds 8 Hours (480 Minutes).*/
                if (totalNonOvertimeMinutesWorked > 480){

                  /*Notify user with error message.*/
                  workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_8HoursNonOT);
                  return hasMessages = true;
                }		
            }
        }
    }
    return hasMessages;
}

/*
 *	Created By: Kelsey Justis, Bola
 *	Date: 12-12-2016
 *	Purpose: To validate if the entered time interval along with the previously entered time intervals sums to more than 16 hours of overtime hours.
 *			 This validation executes after the user adds a time interval on the Date and Time screen. 		
 *	Part of User Story: US-1593.
*/
function ValidateOvertime(hasMessages,tempWorkDateTime) {

  	/*Retrieve reuired data.*/  
    var timeExpense = pega.ui.ClientCache.find("pyWorkPage.TimeExpense");        
    var workDateTime = pega.ui.ClientCache.find("pyWorkPage.WorkDateTime");
  	
  	/* Get properties required for if conditions below.*/
    var hoursWorked = parseInt(tempWorkDateTime.get("HoursWorked").getValue());
    var minutesWorked = parseInt(tempWorkDateTime.get("MinutesWorked").getValue());
    var Type = workDateTime.get("Type").getValue(); 
  
  	/*If user tries to add more than 16 hours overtime in a single time interval.*/
    if (Type === "Overtime" || Type === "Training Overtime") { 
        if ((hoursWorked > 16) || (hoursWorked == 16 && minutesWorked > 0)) {
        
      	/*Notify user with error message.*/
      	workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_WorkDatetimeList_OverTime);
        return hasMessages = true;
       }  else {           
            /* Iterator to loop over WorkDateTimeList and temp properties.*/
            /*var workDateTimeListEntry = timeExpense.get("WorkDatetimeList").iterator();-Needed?-KCJ*/
         	var workDateTimeListEntry = timeExpense.get("WorkDatetimeList");
  
            if(workDateTimeListEntry) {
                workDateTimeListEntry = workDateTimeListEntry.iterator();
            } else {
                throw "workDateTimeListEntry is Empty!!";
            }

            /* Create temporary properties to hold worked hours/minutes for the time interval currently being looped over in WorkDateTimeList.*/
            var tempHoursWorked;
            var tempMinutesWorked;
            var totalOvertimeMinutesWorked = (hoursWorked*60) + minutesWorked;
            var tempType;
            var tempWorkDateTimeList;

            /* While there still exist a time interval after the current time interval in the WorkDateTimeList.*/
            while (workDateTimeListEntry && workDateTimeListEntry.hasNext()) {

                /* Get the next Time Interval in the WorkDateTimeList.*/
                tempWorkDateTimeList = workDateTimeListEntry.next();

                /* Grab type for the time interval currently being looped over in WorkDateTimeList.*/
                tempType = tempWorkDateTimeList.get("Type").getValue();

                /* If the type is not overtime.*/
                if ((tempType === "Overtime" || tempType === "Training Overtime")){          

                  /* Grab worked hours/minutes for the time interval currently being looped over in WorkDateTimeList.*/
                  tempHoursWorked =  parseInt(tempWorkDateTimeList.get("HoursWorked").getValue());
                  tempMinutesWorked = parseInt(tempWorkDateTimeList.get("MinutesWorked").getValue());

                  /* Increment total minutes of non-overtime worked.*/
                  totalOvertimeMinutesWorked += (tempHoursWorked*60) + tempMinutesWorked;
                }

                /* If the total amount of non-overtime worked exceeds 16 Hours (960 Minutes).*/
                if (totalOvertimeMinutesWorked > 960){

                  /*Notify user with error message.*/
                  workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_WorkDatetimeList_OverTime);
                  return hasMessages = true;
                }		
            }
        }
    }
    return hasMessages;
}

/*
 *	Created By: Kelsey Justis 
 *	Date: 12-05-2016
 *	Purpose: To validate if the entered time interval overlaps with any of the previously entered time intervals.
 *			 This validation executes after the user adds a time interval on the Date and Time screen. 		
 *	Part of User Story: US-1634.
*/
function ValidateTimeIntervalOverlap(hasMessages) {
  
  	/*Retrieve reuired data.*/  
    var timeExpense = pega.ui.ClientCache.find("pyWorkPage.TimeExpense");        
    var workDateTime = pega.ui.ClientCache.find("pyWorkPage.WorkDateTime");
  
    /* IF WorkDatetimeList DNE yet; this is 1st entry in list, do nothing.*/
  	if (!timeExpense.get("WorkDatetimeList")) {  
      	return hasMessages;
    }
  
  	/* Iterator to loop over WorkDateTimeList and temp properties.*/
   /*var workDateTimeListEntry = timeExpense.get("WorkDatetimeList").iterator();-Needed?-KCJ*/
  	var workDateTimeListEntry = timeExpense.get("WorkDatetimeList");
  
  	if(workDateTimeListEntry) {
      	workDateTimeListEntry = workDateTimeListEntry.iterator();
    } else { 
      	throw "workDateTimeListEntry is Empty!!";
    }
	
    /* Get entered information to validate.*/
    var inputFromHour = parseInt(EXPCB.getElementValue("FromHour"));
    var inputFromMinute = parseInt(EXPCB.getElementValue("FromMinute"));
    var inputFromPeriod = EXPCB.getElementValue("FromPeriod");
    var inputToHour = parseInt(EXPCB.getElementValue("ToHour"));
    var inputToMinute = parseInt(EXPCB.getElementValue("ToMinute"));
    var inputToPeriod = EXPCB.getElementValue("ToPeriod");

  	/* Get the total minutes expired for entered time interval start and end times.*/
  	var inputFromTotalMinutes = getTotalMinutes(inputFromHour, inputFromMinute, inputFromPeriod, true);
  	var inputToTotalMinutes = getTotalMinutes(inputToHour, inputToMinute, inputToPeriod, false);

    /* Create temporary properties to hold hours/minutes entries for the time interval currently being looped over in WorkDateTimeList.*/
    var tempFromHour;
    var tempFromMinute;
    var tempFromPeriod;
  	var tempFromTotalMinutes;
    var tempToHour;
    var tempToMinute;
    var tempToPeriod;
  	var tempToTotalMinutes;
  	var tempWorkDateTimeList;

    /* While there still exist a time interval after the current time interval in the WorkDateTimeList.*/
    while (workDateTimeListEntry && workDateTimeListEntry.hasNext()) {
		
      	/* Get the next Time Interval in the WorkDateTimeList.*/
      	tempWorkDateTimeList = workDateTimeListEntry.next();
      
        /* Grab hours/minutes entries for time interval currently being looped over in WorkDateTimeList.*/
        tempFromHour = parseInt(tempWorkDateTimeList.get("FromHour").getValue());
        tempFromMinute = parseInt(tempWorkDateTimeList.get("FromMinute").getValue());
        tempFromPeriod = tempWorkDateTimeList.get("FromPeriod").getValue();
        tempToHour = parseInt(tempWorkDateTimeList.get("ToHour").getValue());
        tempToMinute = parseInt(tempWorkDateTimeList.get("ToMinute").getValue());
        tempToPeriod = tempWorkDateTimeList.get("ToPeriod").getValue();
		
        /* Get the total minutes expired for currently looped over entry's time interval start and end times.*/
  		tempFromTotalMinutes = getTotalMinutes(tempFromHour, tempFromMinute, tempFromPeriod, true);
  		tempToTotalMinutes = getTotalMinutes(tempToHour, tempToMinute, tempToPeriod, false);
		
        /* IF the entered start time ('FromTime') is found within the current time interval being looped over.*/
        if (((inputFromTotalMinutes >= tempFromTotalMinutes) && (inputFromTotalMinutes < tempToTotalMinutes)) ||
           ((tempFromTotalMinutes >= inputFromTotalMinutes) && (tempFromTotalMinutes < inputToTotalMinutes))){

              /*Notify user with error message.*/
              workDateTime.get("FromHour").addMessage(ALMCensus.Messages.Msg_TimeIntervalOverlaps);
          
          	  /* Set flag to signal a validation has fired and get out of loop.*/      
              return hasMessages = true;
        }
        /* IF the entered end time ('ToTime') is found within the current time interval being looped over.*/
        if (((inputToTotalMinutes > tempFromTotalMinutes) && (inputToTotalMinutes <= tempToTotalMinutes)) ||
           ((tempToTotalMinutes > inputFromTotalMinutes) && (tempToTotalMinutes <= inputToTotalMinutes))){

              /*Notify user with error message.*/
          	  workDateTime.get("ToHour").addMessage(ALMCensus.Messages.Msg_TimeIntervalOverlaps);
          		
           	  /* Set flag to signal a validation has fired and get out of loop.*/      
              return hasMessages = true;
        }
    }
    return hasMessages;
}

/*
 *	Created By: 
 *	Date:
 *	Purpose: 
*/
function SetImageID() {
  if (pega.mobile.isHybrid) {
    var Expense = pega.ui.ClientCache.find('pyWorkPage.ExpenseEntry');
    Expense.put("ImageID", "Image.jpg");
    var section = pega.u.d.getSectionByName("WorkExpense", '', document);
    pega.u.d.reloadSection(section, '', '', false, false, '', false);
  }
}

/*
 *	Created By: Randy Reese, Kenward Thoi
 *	Date: 12-09-2016
 *	Purpose: Adds entered expense to ExpenseList.
 *	User Story: 
 */
function AddExpense() {
  if (pega.mobile.isHybrid) {
    var Expense = pega.ui.ClientCache.find('pyWorkPage.ExpenseEntry');
    Expense.clearMessages();
    if (pega.ui.ClientCache.find("pyWorkPage.TimeExpense.ExpenseList(5)")) {
      Expense.get('Type').addMessage(ALMCensus.Messages.Msg_MaxExpense);
    } else {
      var Type = Expense.get("Type") ? Expense.get("Type").getValue() : "";
      var ImageID = Expense.get("ImageID") ? Expense.get("ImageID").getValue() : "" ;
      var Amount = Expense.get("Amount") ? Expense.get("Amount").getValue() : "" ;
      var Comment = Expense.get("Comment") ? Expense.get("Comment").getValue() : "" ;
      /* ensure text is displayed as literal */
      Comment = Comment.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      Expense.put("Comment", Comment);
      var tempComment = Comment.split(' ').join('');
      if(!Amount || Amount === '' || Amount == 0) {
        Expense.get('Amount').addMessage(ALMCensus.Messages.Msg_ExpenseAmountRequired);
      }
      if(Amount > 999.99) {
        Expense.get('Amount').addMessage(ALMCensus.Messages.Msg_ExpenseAmountLength);
      }
      if(Amount >= 5 && Amount <= 999.99 && ImageID === '') {
        Expense.get('Amount').addMessage(ALMCensus.Messages.Msg_ExpensePictureRequired);
      }
      if((tempComment === '') && Type ==='Other') {
        Expense.get('Comment').addMessage(ALMCensus.Messages.Msg_ExpenseCommentRequired);
      }
      if ((Amount.length - Amount.toString().indexOf("."))>3 && (Amount.toString().indexOf(".")> -1)) {
        Expense.get('Amount').addMessage(ALMCensus.Messages.Msg_ExpenseAmountInvalidFormat);
      }
    }
    if (!Expense.hasMessages()) {
      var TimeExpense = pega.ui.ClientCache.find('pyWorkPage.TimeExpense');
      var ExpenseList = TimeExpense.get('ExpenseList');
      if (!ExpenseList) {
        var tempWorkpg = TimeExpense.getJSON();
        tempWorkpg = tempWorkpg.substring(0, tempWorkpg.length - 1);
        tempWorkpg = tempWorkpg + ', "ExpenseList" : [{"pxObjClass":"CB-Data-WorkExpense"}] }';
        TimeExpense.adoptJSON(tempWorkpg);
        var NewExpense = TimeExpense.get('ExpenseList(1)'); 	
      } else {
        var NewExpense = ExpenseList.add();
      }
      NewExpense.adoptPage(Expense);
      Expense.put('Type','Parking');
      Expense.put('Amount','');
      Expense.put('Comment','');
      Expense.put('ImageID','');
    }
    pega.ui.DCUtil.refresh();
    var section = pega.u.d.getSectionByName("Expense", '', document);
    pega.u.d.reloadSection(section, '', '', false, false, '', false);
  }	
}

/*
 *	Created By: Randy Reese, Kenward Thoi
 *	Date: 12-09-2016
 *	Purpose: Deletes selected expense in ExpenseList.
 *	User Story: 
 */
function DeleteExpense(event) {
  if (pega.mobile.isHybrid) {
    /* Use the repeater utility to get page source and row index from event */
    var D = pega.ui.DataRepeaterUtils;
    var source = D.getAbsoluteDataSourceFromEvent(event);
    var index = source.rowIndex;
    var ExpenseList = pega.ui.ClientCache.find('pyWorkPage.TimeExpense.ExpenseList');
    ExpenseList.remove(index);
    var section = pega.u.d.getSectionByName("Expense", '', document);
    pega.u.d.reloadSection(section, '', '', false, false, '', false);
  }
}

/*
 *	Created By: Kelsey Justis 
 *	Date: 12-07-2016
 *	Purpose: To Convert to 12-Hr to 24-Hr ('Military') time for easy comparison of time intervals.
*/
function convertTime12To24(date, period, hours, minutes) {
   
    /* IF given time is in the afternoon and not special case of 12PM.*/
    if ((period == "PM") && (hours != 12)) {
      
      /* Shift hours to 24-Hr format.*/
      date.setHours(hours + 12);
    } 
  	
  	/* IF the given time is special case of 12AM.*/
    else if ((hours == 12) && (period == "AM")) {
      
      /* In 24-Hr format, 24->0; latest time is 23:59 === 11:59 PM.*/
      date.setHours(0);
    }
  
  	/* Time is in the morning; no change needed for hours.*/
  	else {
      date.setHours(hours);
    }
  	
  	/* Set minutes for the date given.*/
    date.setMinutes(minutes);
  	
  	/* Return converted time.*/
  	return date;
}

/*
 *	Created By: Kelsey Justis 
 *	Date: 12-07-2016
 *	Purpose: Get total minutes passed in day to entered time.
*/
function getTotalMinutes(hours, minutes, period, timeIntervalStart) {
   	
  	/* Create variable to store total minutes.*/
  	var totalMinutes = minutes;
  
    /* IF the given time is in the afternoon and not special case of 12PM.*/
    if ((period == "PM") && (hours != 12)) {
      
      /* Shift hours to 24-Hr format and increment total minutes appropriately.*/
      hours += 12;
      totalMinutes += (hours*60);
    } 
  	
  	/* IF the given time is in the morning and is not the special case of 12 AM for the time interval beginning.*/
    else if (!((hours == 12) && (period == "AM") && (timeIntervalStart == true))) {
      
      /* Increment total minutes appropriately; no change needed for hours.*/
      totalMinutes += (hours*60);
    }
  	
  	/* Return converted time.*/
  	return totalMinutes;
}

/*
 *	Created By: 
 *	Date:
 *	Purpose: 
*/
function OnClickAttest() {
  var attest = document.getElementsByName("$PpyWorkPage$pTimeExpense$pAttestFlag")[1].checked;
  var timeExpense = pega.ui.ClientCache.find('pyWorkPage.TimeExpense');
  if (attest) {
    timeExpense.put('AttestFlag', true);
    timeExpense.put("Status", "NOT TRANSMITTED");
    if (pega.mobile.isHybrid) {
    	AppendUpdateTEWorklist();
    }
    /* pega.u.d.submit("pyActivity=FinishAssignment",null,""); */
  }
  else {
    timeExpense.put('AttestFlag', false);
    timeExpense.put("Status", "NOT ATTESTED");
    if (pega.mobile.isHybrid) {
    	AppendUpdateTEWorklist();
    }
    /* pega.u.d.submit("pyActivity=FinishAssignment",null,""); */
  }
}

/*
 *	Created By: 
 *	Date:
 *	Purpose: 
*/
function ClearTemp() {
  var TempPg = pega.ui.ClientCache.find('TempPg');
  if (TempPg) {
    TempPg.remove();
  }
}

/*
 *	Created By: 
 *	Date:
 *	Purpose: 
*/
function SetSubmitTEFlag() {
  var TempPg = pega.ui.ClientCache.createPage("TempPg");
  TempPg.put("pyLabel", "true");
}

/*
 *	Created By: Kenward Thoi
 *	Date: 12-2016
 *	Purpose: Check if their are existing cases in the case list with the same date as the current case being worked on.
*/
/* Same as DT */
function CheckForExistingTimeExpense(refresh) {
  	
  	/*Retrieve required data.*/  
  	var workPg = pega.ui.ClientCache.find('pyWorkPage');
	var timeExpense = workPg.get('TimeExpense');
  
  	/* Is Refresh of page?*/
  	if (refresh===true || refresh ==="true") {
      	
      	/* Get user entered values.*/
        var month = EXPCB.getElementValue("MonthData");
        var day = EXPCB.getElementValue("DayData");
        var year = EXPCB.getElementValue("YearData");
      
      	/* Save to timeExpense page.*/
      	timeExpense.put("YearData", year);
        timeExpense.put("MonthData", month);
        timeExpense.put("DayData", day);
    } else {
      	
      	/* Get values already saved in timeExpense.*/
      	var month = timeExpense.get('MonthData').getValue();
        var day = timeExpense.get('DayData').getValue();
        var year = timeExpense.get('YearData').getValue();
    }
  
  	/* Set needed properties.*/
	var pyID = workPg.get('pyID').getValue();
	var date = year + month + day;
  
  	/* Save the formatted date.*/
	timeExpense.put('Date', date);
  
  	/* TimeExpense case list to check against to see if multiple cases on this date already exist.*/
	var TimeExpenseDP = pega.ui.ClientCache.find('D_TimeExpenseCaseList_Master.pxResults');
	
  	/* IF the TimeExpense case list is populated.*/
  	if (TimeExpenseDP) {
      	
      	/* Initialize variables to record if record on same date already exist.*/
		var isReclaim = false;
		var count = parseInt("0");/*What? Why not just 0? Odd force typcast? Check later...-KCJ*/
		var hasNonAttested = false;
      
      	/* Loop thru case list.*/
		TimeExpenseDP = TimeExpenseDP.iterator();
		while (TimeExpenseDP && TimeExpenseDP.hasNext()) {
          
          	/* Get values for current case looped over.*/
			var tempPg = TimeExpenseDP.next();
			var tempTE = tempPg.get('TimeExpense');
			var tempID = tempPg.get('pyID') ? tempPg.get('pyID').getValue() : "";
			var tempDate = tempTE.get('Date') ? tempTE.get('Date').getValue() : "";
          
          	/* If case already exist with current date and is not the case we are checking against.*/
			if (tempDate === date && tempID != pyID) {
				count += 1;
              	var tempStatus = tempTE.get('Status') ? tempTE.get('Status').getValue() : "";
				
              	/* CHANGE NEEDED HERE:INCLUDE 'REJECTED' ALSO- US-1810 -KCJ.*/
              	if (tempStatus === "NOT ATTESTED") {
					hasNonAttested = true;
				}
			}
		}
      	
      	/* IF there already are 4 cases with this date.*/
		if (count > 0 && count < 4 && (hasNonAttested == false || hasNonAttested == "false")) {
			isReclaim = true;
		}
      
      	var workDatetimelist = timeExpense.get("WorkDatetimeList(1)");
      
      	/* If this is a reclaim case.*/
      	if (isReclaim != true || !workDatetimelist) {
          	workPg.put('ShowMobileNext', true);
        }
      
      	/* Update properties in memory.*/
		timeExpense.put('IsReclaim', isReclaim);
		workPg.put('HasExistingNotAttested', hasNonAttested);
		workPg.put('SameDateTimeExpenseCount', count);
	}
  	
  	/* IF this is a refresh.*/
  	if (refresh===true || refresh ==="true") {
      
      	/* Reload this section.*/
      	var section = pega.u.d.getSectionByName("DateAndTime", '', document);
        pega.u.d.reloadSection(section, '', '', false, false, '', false);
    }
}

/*
 *	Created By: David Hwang
 *	Date: 01-10-2017
 *	Purpose: Takes a Date string "yyyyMMdd" and returns the date of the Sunday of that calendar week as a Date string "yyyyMMdd".
 *	User Story: US-1811
 */
function GetSundayOfWeek(theDate) {
	/* Parsing out the date to evaluate to year, month, dayOfMonth, used for past/future date check */
	var year = parseInt(theDate.substring(0,4));
	var month = parseInt(theDate.substring(4,6)) -1;
	var dayOfMonth = parseInt(theDate.substring(6,8));
	/* Initialize the date using the input date specified */
	var date = new Date(year,month,dayOfMonth);
	/* Determine the day index and then subtract the current date with the day index to determine the Sunday of the week */
	var dayIndex = date.getDay();
	date.setDate(date.getDate() - dayIndex);
	/* Format the date into 'yyyyMMdd' format and return the result */
	var result = date.getFullYear() + "" + ("0" + (date.getMonth() + 1)).slice(-2) + "" + ("0" + date.getDate()).slice(-2);
	return result;
}

/*
 *	Created By: David Hwang
 *	Date: 01-30-2017
 *	Purpose: Takes a Date string "yyyyMMdd" and adds the specified number of days and then returns the result as a Date string "yyyyMMdd".
 *	User Story: US-1811
 */
function AddNumberOfDaysToDate(theDate, daysToAdd) {
	/* Parsing out the date to evaluate to year, month, dayOfMonth */
	var year = parseInt(theDate.substring(0,4));
	var month = parseInt(theDate.substring(4,6)) -1;
	var dayOfMonth = parseInt(theDate.substring(6,8));
	/* Initialize the date using the input date specified */
	var date = new Date(year, month, dayOfMonth);
	/* Add the number of days to the input date */
	date.setDate(date.getDate() + parseInt(daysToAdd));
	/* Return the result in "yyyyMMdd" format */
	result = date.getFullYear() + "" + ("0" + (date.getMonth() + 1)).slice(-2) + "" + ("0" + date.getDate()).slice(-2);
	return result;
}

/*
 *	Created By: David Hwang
 *	Date: 01-10-2017
 *	Purpose: Function is used to determine work date time type.
 *	User Story: US-1811
 */
function SetTypeDropdown(){
	try {
		/* Retrieve required data */
      	var workPage = pega.ui.ClientCache.find("pyWorkPage");
		var timeExpense = pega.ui.ClientCache.find("pyWorkPage.TimeExpense");
      	var workDateTime = pega.ui.ClientCache.find("pyWorkPage.WorkDateTime");
		/* Variables used to store hours */
		var totalAttestedHoursForWeek = 0.00;
		var totalAttestedHoursForDay = 0.00;
		var te_TotalTimeWorked = 0.00;
		/* Used for date calculations */
		var i;
		var year;
		var month; 
		var dayOfMonth; 
		var currentDateTime;
		var dateTimeToEval;
		/* Used during TE case looping/logic */
		var currentPage;
		var te_Date ;
		var te_Status;
		/* Calculate the first day of the week (Sunday) */
		var currentTimeExpenseDate = timeExpense.get("Date").getValue();
		var firstDayOfWeek = GetSundayOfWeek(currentTimeExpenseDate);
		var dateToEval = firstDayOfWeek;
		var weekToEval = []; /* Initialize an empty weekToEval array */
		/* Insert the dates for the given week [Sun - Sat] IF the date is in the past */
		for (i=0; i<=6; i++) {
			/* Parsing out the date to evaluate to year, month, dayOfMonth, used for past/future date check */
			 year = parseInt(dateToEval.substring(0,4));
			 month = parseInt(dateToEval.substring(4,6)) -1;
			 dayOfMonth = parseInt(dateToEval.substring(6,8));
			/* Check to see if the date to be evaluated is in the past */
			currentDateTime = new Date();
			dateTimeToEval = Date.UTC(year, month, dayOfMonth);
			/* If date to evaluate is in the past then push it to the weekToEval array */
			if (dateTimeToEval <= currentDateTime) {
				weekToEval.push(dateToEval); /* ex. ["20170101", "20170102", "20170103"] */
				dateToEval = AddNumberOfDaysToDate(dateToEval, 1); /* Increment the dateToEval property by one day */
			}
			/* If date to evaluate is in the future, then no futher entries are required within the array */
			else{ break; }
		}
		/* Find and store the time and expense case list into TECaseList variable */
		var TECaseList = pega.ui.ClientCache.find('D_TimeExpenseCaseList_Master.pxResults');
		var iterator;
		var weekToEvalLength;
		if (weekToEval.length > 0) {
			/* Loop through the time and expense case list */
			iterator = pega.ui.ClientCache.find("D_TimeExpenseCaseList_Master.pxResults") ? pega.ui.ClientCache.find("D_TimeExpenseCaseList_Master.pxResults").iterator() : null;
			if (iterator != null) {
				while (iterator.hasNext()) {
					currentPage = iterator.next();
					te_Date = currentPage.get('TimeExpense.Date') ? currentPage.get('TimeExpense.Date').getValue() : "";
					weekToEvalLength = weekToEval.length; /* Calculate initial length of the weekToEvalLength */
					/* While weekToEval array is not empty */
					while (weekToEvalLength > 0) {
						/* Check to see if the time and expense case date is equal to the last entry of the weekToEval array */
						if (te_Date == weekToEval[weekToEvalLength - 1]){
							/* If time and expense case status is "NOT TRANSMITTED" OR "TRANSMITTED-PENDING" OR "ACCEPTED" it is considered attested */
							te_Status = currentPage.get('TimeExpense.Status') ? currentPage.get('TimeExpense.Status').getValue() : "";
							if (te_Status == "NOT TRANSMITTED" || te_Status == "TRANSMITTED-PENDING" || te_Status == "ACCEPTED") {
								/* Aggregate the total attested hours for the week */
								te_TotalTimeWorked = currentPage.get('TimeExpense.TotalRegularTimeWorked')? parseFloat(currentPage.get('TimeExpense.TotalRegularTimeWorked').getValue()).toFixed(2) : 0.00;
								totalAttestedHoursForWeek += parseFloat(te_TotalTimeWorked);
								/* If entry is equal to time expense date then aggregate the total attested hours for the day */
								if (te_Date == currentTimeExpenseDate) {
									totalAttestedHoursForDay += parseFloat(te_TotalTimeWorked);
								}
							}
						}
						weekToEvalLength -= 1; /* Decrement the length of the weekToEval array after the pop */
					}
				}
			}
		}
		/* If TotalAttestedHoursForDay<8.00 AND If TotalAttestedHoursForWeek<40.00, show regular options */
		if (totalAttestedHoursForDay<8.00 && totalAttestedHoursForWeek<40.00) {
			/* Adding the Regular option */
          	workDateTime.put('DisplayRegularType', true);
          	workDateTime.put('DisplayOTType', false);
		}
		/* If TotalAttestedHoursForDay>=8.00 OR If TotalAttestedHoursForWeek>=40.00, show overtime options */
		else if (totalAttestedHoursForDay>=8.00 || totalAttestedHoursForWeek>=40.00) {
			/* Adding the Overtime option */
          	workDateTime.put('DisplayRegularType', false);
          	workDateTime.put('DisplayOTType', true);
		}
      	/* Reload this section.*/
		CB.RefreshWhen("pyWorkPage.WorkDateTime.DisplayRegularType");
	}
	catch( e ) {
		console.log("DetermineWorkDateTimeType :: Caught exception" + e);
	}
}
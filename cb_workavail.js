var WorkAvail = WorkAvail || {};
var outputToConsole = true;

function Log(msg) {
    if (outputToConsole) console.log(msg);
}

function OnMobileApp() {
    Log("Calling OnMobileApp()");
    return (pega && pega.mobile && pega.mobile.isHybrid);
}

function ClearMessages(selectedDayPage) {
    Log("Begin ClearMessages()");
    if (selectedDayPage) {
        selectedDayPage.clearMessages();
        selectedDayPage.put("ErrorMessage", "");
    }
}

/*
 *	Created By: Tim Bechmann
 *	Date: 1-04-2017
 *	Purpose: gets the index of the dateLabel within the page list D_CurrentStaffWorkAvailabilities.
 */
function GetDateLabelIndex(dateLabel) {
    var WAPage = pega.ui.ClientCache.find('D_CurrentStaffWorkAvailabilities');
    var waList = WAPage.get("WorkAvailabilities");
    var iterator = (waList.type == pega.ui.ClientCache.OBJECT_TYPE_LIST ? waList.iterator() : null);
    var templatePage = null;
    var dateL = null;
    var indexCounter = 0;
    /* Loop thru work availibility list of days see if can find current day's date label.*/
    while (iterator && iterator.hasNext()) {
        indexCounter++;
        templatePage = iterator.next();
        dateL = templatePage.get("DateLabel");
        if (dateL && dateL.getValue() == dateLabel) {
            break;
        }
    }
    return indexCounter;
}


function GenerateAndInitializeTempPage() {

    var currentDay = pega.ui.ClientCache.find("SelectedDay");
    /* If currentDay page is already there; remove it before reinitializing.*/
    if (currentDay) {
        currentDay.remove();
    }

    currentDay = pega.ui.ClientCache.createPage("SelectedDay");
    currentDay.adoptJSON('{"pxObjClass" : "CB-Dec-Data-WorkAvailability"}');

    currentDay.put("FromHour", "");
    currentDay.put("FromPeriod", "");
    currentDay.put("FromMinute", "");
    currentDay.put("FromTimeInMinutes", "0");
    currentDay.put("InHours", "");
    currentDay.put("IsAvailable", "false");
    currentDay.put("ToHour", "");
    currentDay.put("ToMinute", "");
    currentDay.put("ToPeriod", "");
    currentDay.put("ToTimeInMinutes", "0");
    currentDay.put("ErrorMessage", "");


    pega.u.d.setProperty('SelectedDay.FromHour', '');
    pega.u.d.setProperty('SelectedDay.FromPeriod', '');
    pega.u.d.setProperty('SelectedDay.FromMinute', '');
    pega.u.d.setProperty('SelectedDay.FromTimeInMinutes', '0');
    pega.u.d.setProperty('SelectedDay.InHours', '');
    pega.u.d.setProperty('SelectedDay.ToHour', '');
    pega.u.d.setProperty('SelectedDay.ToMinute', '');
    pega.u.d.setProperty('SelectedDay.ToPeriod', '');
    pega.u.d.setProperty('SelectedDay.ToTimeInMinutes', '');
    pega.u.d.setProperty('SelectedDay.ErrorMessage', '');

    return currentDay;
}

/*
 *	Created By: Tim Bechmann
 *	Date: 1-04-2017
 *	Purpose: Copies the passed dateLabel from D_CurrentStaffWorkAvailabilitiies into a temp page (SelectedDay)
 */
function CopyToTempPage(dateLabel) {
    try {
        /* IF on mobile device online.*/
        if (OnMobileApp()) {
            /* Check to ensure an elementIndex was found */
            var elementIndex = GetDateLabelIndex(dateLabel);
            if (elementIndex <= 0) {
                Log('an element index has not been found.');
                return;
            }

            /* Create a temp page for the Single day item */
            var currentDay = GenerateAndInitializeTempPage();
            var WAPage = pega.ui.ClientCache.find('D_CurrentStaffWorkAvailabilities.WorkAvailabilities(' + elementIndex + ')');
            currentDay.adoptJSON(WAPage.getJSON());
        }

    } catch (e) {
        Log('Uncaught exception in function:CopyToTempPage.  Error: ' + e.message);
    }
}

function ClearValues(conditional) {
  try {
    if (conditional) {
        if (OnMobileApp()) {
            var currentDay = pega.ui.ClientCache.find("SelectedDay");
            /* Clear information as the user is not available during this day. -KCJ setting properties with right type of value? from hour=? '0'? Also set to blank not zero?*/
            currentDay.put("FromHour", "");
            currentDay.put("FromPeriod", "");
            currentDay.put("FromMinute", "");
            currentDay.put("FromTimeInMinutes", "0");
            currentDay.put("InHours", "");
            currentDay.put("ToHour", "");
            currentDay.put("ToMinute", "");
            currentDay.put("ToPeriod", "");
            currentDay.put("ToTimeInMinutes", "0");
            currentDay.put("ErrorMessage", "");
        }
        pega.u.d.setProperty('SelectedDay.FromHour', '');
        pega.u.d.setProperty('SelectedDay.FromPeriod', '');
        pega.u.d.setProperty('SelectedDay.FromMinute', '');
        pega.u.d.setProperty('SelectedDay.FromTimeInMinutes', '0');
        pega.u.d.setProperty('SelectedDay.InHours', '');
        pega.u.d.setProperty('SelectedDay.ToHour', '');
        pega.u.d.setProperty('SelectedDay.ToMinute', '');
        pega.u.d.setProperty('SelectedDay.ToPeriod', '');
        pega.u.d.setProperty('SelectedDay.ToTimeInMinutes', '');
        pega.u.d.setProperty('SelectedDay.ErrorMessage', '');
    }
  } catch (e) {
    Log("Uncaught exception in ClearValues: " + e.message);
  }
}

function SaveSingleDay() {
    try {
      
    	Log("Calling SaveSingleDay()");
        /* On mobile device and online.*/
        if (OnMobileApp()) {
            /* Get data for day seleceted on work availability page.*/
            var currentDay = pega.ui.ClientCache.find('SelectedDay');
            Log("CurrentDay:");

            /* IF the page exists/is found.*/
            if (currentDay) {
                Log(currentDay.getJSON());
                /* Clear all messages is present on the page.*/
                ClearMessages(currentDay);
                /* Get values on the selected day's data page. */
                var isAvailable = pega.ui.d.getProperty("SelectedDay.IsAvailable", "pyWorkPage") ? pega.ui.d.getProperty(
                    "SelectedDay.IsAvailable", "pyWorkPage") : "";
                var summaryText = "Not Available";
                if (isAvailable === false) {
                    ValidateWorkAvailability(currentDay);
                    if (currentDay.hasMessages()) {
                        /* Set Error Flags/Properties */
                        Log("Errors found: " + currentDay.getMessages().join('<br/>'));
                        currentDay.put('ErrorMessage', currentDay.getMessages().join('<br/>'));
                        currentDay.addMessage("Error: " + currentDay.get("ErrorMessage").getValue());

                        /* Reload the section. */
                        pega.u.d.reloadSection(pega.u.d.getSectionByName("WorkAvailabilitySingleDay", '', document), '',
                            '', false, false, '', false);
                        return;
                    } else {
                        var fromHour = pega.ui.d.getProperty("SelectedDay.FromHour", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.FromHour", "pyWorkPage") : "";
                        var fromMinute = pega.ui.d.getProperty("SelectedDay.FromMinute", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.FromMinute", "pyWorkPage") : "";
                        var fromPeriod = pega.ui.d.getProperty("SelectedDay.FromPeriod", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.FromPeriod", "pyWorkPage") : "";
                        var toHour = pega.ui.d.getProperty("SelectedDay.ToHour", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.ToHour", "pyWorkPage") : "";
                        var toMinute = pega.ui.d.getProperty("SelectedDay.ToMinute", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.ToMinute", "pyWorkPage") : "";
                        var toPeriod = pega.ui.d.getProperty("SelectedDay.ToPeriod", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.ToPeriod", "pyWorkPage") : "";
                        var inHours = pega.ui.d.getProperty("SelectedDay.InHours", "pyWorkPage") ? pega.ui.d.getProperty("SelectedDay.InHours", "pyWorkPage") : "";

                        /* Set summary */
                        summaryText = fromHour + ':' + (fromMinute.toString() == "0" ? "00" : fromMinute.toString()) +
                            ' ' + fromPeriod + ' - ' + toHour + ':' + (toMinute.toString() == "0" ? "00" : toMinute.toString()) +
                            ' ' + toPeriod + " (" + inHours + " hours)";
                    }
                } else {
                    summaryText = "Not available";
                }

                /* Copy SelectedDay back into D_CurrentStaffWorkAvailabilities */
                /* Check to ensure an elementIndex was found */
                var elementIndex = GetDateLabelIndex(currentDay.get('DateLabel').getValue());
                if (elementIndex <= 0) {
                    Log('an element index has not been found.');
                    return;
                }
                /* Retrieve data for all work availability days.*/
                var WAPage = pega.ui.ClientCache.find('D_CurrentStaffWorkAvailabilities.WorkAvailabilities(' + elementIndex + ')');
                WAPage.adoptJSON(currentDay.getJSON());

                /* Success!  And there was much rejoincing (Yay).  Move back to previous page (WorkAvailabilitiy) */
                pega.desktop.showHarnessWrapper("current", 'CB-Dec-Data-StaffAvailability', 'MultipleDayReview', '', '',
                    '', true, '', false, '', '', '', '', '', true, false, false, null);
            }
        } else {
            Log("Action performed on browser.  Calling ValidateWorkAvailability Activity");
            var launchActivity = new SafeURL("CB-Dec-Data-WorkAvailability.ValidateWorkAvailability");
            var out = httpRequestAsynch(launchActivity.toURL(), null, 50, 100);

            Log("Finished Validation.  Out value = " + out);
            if (out == "true") {
                Log("Errors found.  Refresh Section");
                var section = pega.u.d.getSectionByName("WorkAvailabilitySingleDay", '', document);
                pega.u.d.reloadSection(section, '', '', false, false, '', false);
            } else {
                Log("No errors found.  Call Harness: MultipleDayReview");
                pega.desktop.showHarnessWrapper("current", 'CB-Dec-Data-StaffAvailability', 'MultipleDayReview', '', '',
                    '', true, '', false, '', '', '', '', '', true, false, false, null);
            }
        }
    } catch (e) {
        Log("Uncaught exception in SaveSingleDay: " + e.message);
    }
}
/*
 *    Created By: Tim Bechmann
 *    Date: 02-10-2017
 *    Purpose: Saves the values entered by user on the Work Availability 5-Day form for each single day.
 *    User Story: ??
 *    Params: event: Current context provided by application for use when this function is called.
 */
function SaveAll(event) {
  try {
    /* IF on the mobile app .*/
    if (OnMobileApp()) {

        var WAPage = pega.ui.ClientCache.find('D_CurrentStaffWorkAvailabilities');
        var waList = WAPage.get("WorkAvailabilities");
        var iterator = (waList.type == pega.ui.ClientCache.OBJECT_TYPE_LIST ? waList.iterator() : null);
        var templatePage = null; /*Best value to set to? return if DNE? or var templatePage;-KCJ*/
        var hasErrors = false;
        var isAvailable = 'false';

        /* Loop thru work availibility list of days see if can find current day's date label.*/
        while (iterator && iterator.hasNext()) {
            /* Grab next Single Day form.*/
            templatePage = iterator.next();
            /* Find out if 'Not Available' checkbox has been checked.*/
            isAvailable = templatePage.get("IsAvailable") ? templatePage.get("IsAvailable").getValue() : "false";

            /* IF the 'Not Available' checkbox has not been checked.*/
            if (isAvailable.toString() == "false" || isAvailable.toString() === "") {
                /* Validate the current Single Day form iterated over.*/
                ValidateWorkAvailability(templatePage);
            }
            /* IF the are error messages or the page has not been completed by the user.*/
            if (templatePage.hasMessages() || templatePage.get("Summary").getValue() === "Please enter data") {
                templatePage.put("ErrorMessage", "Please complete " + templatePage.get("DateLabel").getValue());
                templatePage.addMessage("Error: " + "Please complete " + templatePage.get("DateLabel").getValue());
                templatePage.remove("Summary");
                hasErrors = true;
            }
        }
        /* IF any of the Work Availability Single Day forms has an error, notify the user.*/
        if (hasErrors) {
            /* Inform user to fix errors on page.*/
            WAPage.put('ValidationErrorMessage', "Please fix errors above.");
            /* Reload section with error messages displayed.*/
            var section = pega.u.d.getSectionByName("WorkAvailabilityMultipleDay", '', document);
            pega.u.d.reloadSection(section, '', '', false, false, '', false);
            return;
        }

    } else { /* On Desktop... */
        /* Run activity, 'SaveWorkAvailabilities'.*/
        var oSafeUrl = new SafeURL("CB-Dec-Data-StaffAvailability.SaveWorkAvailabilities");
        pega.util.Connect.asyncRequest('GET', oSafeUrl.toURL(), '');
    }
   } catch (e) {
        Log("Uncaught exception in SaveAll: " + e.message);
    }
}

/*
 *    Created By: Kelsey Justis
 *    Date: 01-06-2016
 *    Purpose: Validate data entered on Work Availability screen.
 *    User Story: US-1498.
 *    Params: currentDay  = The page used to hold current day entries
 */
function ValidateWorkAvailability(currentDay) {
    try {
        /* Retrieve required properties with user-entered values.*/
        var fromHour = parseFloat(pega.ui.d.getProperty("SelectedDay.FromHour", "pyWorkPage"));
        var fromMinute = parseFloat(pega.ui.d.getProperty("SelectedDay.FromMinute", "pyWorkPage"));
        var fromPeriod = pega.ui.d.getProperty("SelectedDay.FromPeriod", "pyWorkPage");
        var toHour = parseFloat(pega.ui.d.getProperty("SelectedDay.ToHour", "pyWorkPage"));
        var toMinute = parseFloat(pega.ui.d.getProperty("SelectedDay.ToMinute", "pyWorkPage"));
        var toPeriod = pega.ui.d.getProperty("SelectedDay.ToPeriod", "pyWorkPage");
        var inHours = parseFloat(pega.ui.d.getProperty("SelectedDay.InHours", "pyWorkPage"));
        var summaryText = "Not Available";
        /* BEGIN REPLICATION OF CalculateTimeInMinutes DATATRANSFORM.*/
        /* Default the total minutes to minutes entered; particularly useful in case of 12:30AM = 0 Hours + 30 Minutes.*/
        fromTimeInMinutes = fromMinute;
        toTimeInMinutes = toMinute;
        /* IF the given time is in the afternoon and not special case of 12PM.*/
        if ((fromPeriod === "PM") && (fromHour != 12.0)) {
            fromHour += 12.0;
            fromTimeInMinutes += fromHour * 60.0;
        }
        /* IF the given time is in the morning and is not the special case of 12 AM.*/
        else if ((fromPeriod === "AM") && (fromHour != 12.0)) {
            fromTimeInMinutes += fromHour * 60.0;
        }
        /* IF the given time is in the afternoon and not special case of 12PM.*/
        if ((toPeriod === "PM") && (toHour != 12.0)) {
            toHour += 12.0;
            toTimeInMinutes += toHour * 60.0;
        }
        /* IF the given time is in the morning and is not the special case of 12 AM.*/
        else if ((toPeriod === "AM") && (toHour != 12.0)) {
            toTimeInMinutes += toHour * 60.0;
        }
        /* Insert properties with appropriate values.*/
        currentDay.put('ToTimeInMinutes', toTimeInMinutes);
        currentDay.put('FromTimeInMinutes', fromTimeInMinutes);
        /* END REPLICATION OF CalculateTimeInMinutes DATATRANSFORM.*/
        /* BEGIN REPLICATION OF SingleDayValidations VALIDATION.*/
        /*US-1498:
            -AC#2: If "From" time before 9:00AM or "To" time later than 9:00PM."
            -AC#3: If "From" time after 8:45PM" or "To" time later than 9:00PM."*/
        /* 'Magic Numbers' found below correspond to the hour limits specified when converted to minutes for easy comparision.*/
        if ((fromTimeInMinutes < 540) || (fromTimeInMinutes > 1245)) {
            currentDay.get("FromHour").addMessage(ALMCensus.Messages.OutsideAcceptedTimeWindow);
        }
        /*US-1498:
            -AC#4: If "To" time before 9:15AM.
            -AC#5: If "To" time after 9:00PM" */
        /* 'Magic Numbers' found below correspond to the hour limits specified when converted to minutes for easy comparison.*/
        if ((toTimeInMinutes < 555) || (toTimeInMinutes > 1260)) {
            currentDay.get("ToHour").addMessage(ALMCensus.Messages.OutsideAcceptedTimeWindow);
        }
        /*US-1498:
            -AC#6: If "To" time that is earlier than a "From" time.
            -AC#8: If"From" time that is the same as a "To" time.*/
        if (fromTimeInMinutes >= toTimeInMinutes) {
            currentDay.get("FromHour").addMessage(ALMCensus.Messages.ToTimeFromTimeWrongOrder);
        }
        /*US-1498:
            -AC#7: If  "From" time that is later than a "To".
            -AC#8: If "From" time that is the same as a "To" time.*/
        if (toTimeInMinutes <= fromTimeInMinutes) {
            currentDay.get("ToHour").addMessage(ALMCensus.Messages.ToTimeFromTimeWrongOrder);
        }
        /*US-1498:
            -AC#9: If more Availability Hours than exist between the time inputted within the "From" and "To" fields.*/
        enteredTimeInterval = (toTimeInMinutes - fromTimeInMinutes) / 60.0; /* Amount of time expired between entered from and to times.*/
        if (inHours > enteredTimeInterval) {
            currentDay.get("InHours").addMessage(ALMCensus.Messages.InvalidTotalHours);
        }
        /* END REPLICATION OF SingleDayValidations VALIDATION.*/
    } catch (e) {
        Log("Uncaught exception in ValidateWorkAvailability: " + e.message);
    }
}
/* May use later; need to update references to classes.-KCJ and TB*/
function SetWorkAvailabilityDateTime() {
    try {
        if (pega.mobile.isHybrid) { /* KCJ- use OnMobileApp() call?*/
            var currentWorkAvDateTime = CB.getCurrentDateTimeAsString();
            var showActnCase = pega.u.ClientCache.find("ShowActionPage");
            if (!showActnCase) {
                showActnCase = pega.ui.ClientCache.createPage("ShowActionPage");
                showActnCase.adoptJSON('{"pxObjClass":"Data-Portal"}');
            }
            showActnCase.put("WorkAvailabilityDateTime", currentWorkAvDateTime);
            showActnCase.put("SyncAlert", true);
        }
    } catch (e) {
        Log("Uncaught exception in SetWorkAvailabilityDateTime: " + e.message);
    }
}
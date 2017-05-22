function switchApplication(accessGroup) {

        /* BUG-236225 moved redirectandrun call to the activity so F5 refresh would work */ 
  
        if(accessGroup == null) {
			accessGroup = document.getElementById('<pega:reference name="$this-Definition(pyPropertyName)"/>').value;
		}
		
		var oShowDesktopUrl;       
            
        if ( pega.ui.composer.isComposerPreviewFrame() ) {        
                var topWin = pega.ui.composer.getCurrentComposerWindow(); 
          		oShowDesktopUrl = new topWin.SafeURL("Code-Pega-Requestor.pzProcessApplicationSwitch");
        } else {

                oShowDesktopUrl = new SafeURL("Code-Pega-Requestor.pzProcessApplicationSwitch");
        } 

		oShowDesktopUrl.put("AccessGroupName",accessGroup);
  
        if ( pega.ui.composer.isComposerPreviewFrame() ) {        
		  var topWin = pega.ui.composer.getCurrentComposerWindow(); 
          topWin.location.href = oShowDesktopUrl.toURL();
  		} else {  
			window.location.href = oShowDesktopUrl.toURL();
  		} 
}

function changePortal(strNewPortal,currentPortal,strNewPortalLabel) {

	if (strNewPortal != currentPortal) {
      	if(strNewPortalLabel == null || typeof strNewPortalLabel === undefined || strNewPortalLabel.length <= 0) {
          strNewPortalLabel = strNewPortal;
        }
      	var strConfirmMsg = "Switch the display to show '"+strNewPortalLabel+"' portal?";
	    if (confirm(strConfirmMsg)) {
          	var oSafeURL = new SafeURL("Data-Portal.pzProcessPortalSwitch");
            oSafeURL.put("portal", strNewPortal);
            oSafeURL.put("Name", currentPortal);
          	oSafeURL.put("developer", false);
          
           if (pega.ui.composer.isComposerPreviewFrame()) {
             oSafeURL.put("isPreviewFrame",true)
           }
          
            window.location.href = oSafeURL.toURL();
        }
    }
}



function getNextWorkItem(strUserId) {
   var args = arguments[0];
    if (typeof args == "object" && args.name == "safeURL") {
	var oSafeURL = SafeURL_clone(args);
	var strUserId = oSafeURL.get("strUserId");
    }

    if (!oSafeURL) {
	var oSafeURL= new SafeURL();
    }
    oSafeURL.put("param",strUserId);
    if (!pega.desktop.support.openSpace("Work", oSafeURL, "getnextwork")) {
        strUserId= oSafeURL.toQueryString();
        var strURL= pega.desktop.support.constructUrl(strUserId, "getnextwork");
        pega.desktop.openUrlInWindow(strURL, "pyWorkPage", WorkFormSize + PopupWindowFeatures);
    }
}

function pzCaseMgrLogOff(event) {
	setUserStart('replace');
	pega.u.d.replace('pyActivity=LogOff&pzPrimaryPageName=pyDisplayHarness',event);
}
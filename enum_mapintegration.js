/****
Author: Rohit Chaudhri
Creation Date: April 8th 2017
Last Updated Date: April 9th 2017
****/

console.log("Loading ENUM_mapIntegration.js");


ENUMAddressList = function() {
	console.log("ENUMAddressList object init");
	try {
		/* if (!cbGlbMap) { */
		/* reinit the Map object each time for now; due to many unhappy path issues with resync'ing between map sessions */
		/* deliberately set to true to force a review of this */
		if (true) {
			MapManager.CensusMap.listCachedFiles().then(ENUMAddressList.mainModule);
		} else {
			/*cbGlbMap.show();*/
			cbGlbMap.setTitle("Enum Map");
			/*todo: (0) @ENUM make showEnumALPoints generic ie it should be polyporphic method showPoints*/
			cbGlbMap.showEnumALPoints();
		}
	} catch (e) {
		console.error(e.message + "\n" + e.stack);
		throw e;
	}

};

ENUMAddressList.mainModule = function(data) {
	console.log("ENUMAddressList.mainModule invoked");
  	var mapConfig = {
		mapTitle: "Enum Map",
		mapType: gblMapType,
		reset: true
	};
    try {
      ALMCB_PrecacheMapData(data, true, mapConfig).then(function(){
        MapManager.CensusMap.listCachedFiles().then(MapManager.CacheMapFileList_ENUM);
      }, 
                                                        function (d){
        console.log("Caching: no data received " + d ); 
        
      }
                                                       );
    } catch (e) {
      MapManager.CacheMapFileList_ENUM(data);
      console.error("CachingFinished Error : " + e.message + "\n" + e.stack); 
    } 

	ENUM_GetOfflineData(data, false, mapConfig).then(function() {
		/*todo: (0) @ENUM make showEnumALPoints generic ie it should be polyporphic method showPoints*/
		cbGlbMap.showEnumALPoints();
	});
};

ENUMAddressList.configure = function(ptrMgr) {

	var mapConfig = {
		mapTitle: "Enum Map",
		mapType: gblMapType,
	};
	var mapObj = cbGlbMap;
	var pointMenu = {
		subtitle: ""
	};

	Object.getPrototypeOf(ptrMgr).setupPoints = function() {
		console.log("ENUMAddressList->setupPoints: " + this.screenName + " setupPoints invoked");
		this.parentSetupPoints();
	};

	/*todo: (0) @ENUM take parentSetupPoints for ENUM into base class and make it polymorphic*/
	Object.getPrototypeOf(ptrMgr).parentSetupPoints = function() {
		console.log("ENUMAddressList->parentSetupPoints: " + this.screenName + " parentSetupPoints invoked");


		var caseList = CChlpr.findPage("D_EnumUserWorkList.pxResults");
		MobileTestData.collect("D_pyUserWorkList", JSON.stringify(caseList));
		try {
			var countOfCases = 0;
			if (caseList) {
				var caseIterator = caseList.iterator();
				var casePage;
				var caseWorkId = "";
				var caseInsKey = "";
				while (caseIterator.hasNext()) {
					countOfCases += 1;
					casePage = caseIterator.next();
					if (casePage) {
						caseWorkId = CChlpr.getPageProperty(casePage, "pxRefObjectKey");
						caseInsKey = CChlpr.getPageProperty(casePage, "pxRefObjectInsName");

						var pxP = casePage.get("pxPages");
						var la = null;

						/*These values are used for setting up a point*/
						var lat = null;
						var lon = null;
						var newAddress = false;
						var addressStatusVal = null;
						var structureType = null;
						var address = null;
						var dangerous = null;
						var lstStatusVal = null;
						var selectedPoint = false;

						var mafStrPtIDVal = caseInsKey; /*ESRIMap.genrateGUID();*/
						var mafStrPtIDInd = null;						
						var isUnitPt = false;

						if (pxP) {
							la = pxP.get("LA");
						}
						if (la) {
							lat = CChlpr.getPageProperty(la, "OFLAT");
							if ($.isNumeric(lat)) lat = parseFloat(lat);
							lon = CChlpr.getPageProperty(la, "OFLON");
							if ($.isNumeric(lon)) lon = parseFloat(lon);

							addressStatusVal = CChlpr.getPageProperty(la, "AddressStatus");
							structureType = CChlpr.getPageProperty(la, "StructureType");
							address = CChlpr.getPageProperty(la, "AddressNumber") + " " + CChlpr.getPageProperty(la, "StreetName") + ", " + CChlpr.getPageProperty(la, "City") + ", " + CChlpr.getPageProperty(la, "State") + "-" + CChlpr.getPageProperty(la, "Zip");
							dangerous = CChlpr.getPageProperty(la, "DangerousAddress");
							lstStatusVal = CChlpr.getPageProperty(la, "ListingStatus");
						}
						console.log("caseWorkId:" + caseWorkId + ";lat:" + lat + ";lon:" + lon);

						/*todo: (0) @ENUM must have a reporting unit ID*/
						var reportingUnitIDVal = "";
						if (reportingUnitIDVal === "") {
							/*Genrate the reporting unit ID GUID*/
							reportingUnitIDVal = ESRIMap.genrateGUID();
							newAddress = true;
						}

						var ru = new ESRIMap.ReportingUnit(reportingUnitIDVal);

						/*todo: (0) @ENUM need to identify selected address*/
						/* PageIndex  ID: assume second address is selected.*/
						var pageIndexVal = 2;

						console.log("pageIndexVal: " + pageIndexVal);

						if (countOfCases === pageIndexVal) {
							console.log("selectedUnit === pageIndexVal : " + pageIndexVal);
							selectedPoint = true;
							ru.setSelected(true);
						} else {}

						if (countOfCases === 1) {
							/*assume first address is dangerous*/
							dangerous = true;

						}

						if (!addressStatusVal) addressStatusVal = "UNKNOWN";

						console.log("addressStatusVal:" + addressStatusVal);
						console.log("structureType:" + structureType);
						console.log("address:" + address);
						console.log("dangerous:" + dangerous);
						console.log("lstStatusVal:" + lstStatusVal);

						/*address = address.replace(new RegExp("<br>", "g"),"\n");*/

						var pointConfig = {
							type: "Mapspot",
							pointID: mafStrPtIDVal,
							listingStatus: lstStatusVal,
							title: address,
							lat: lat,
							lon: lon,
							userPlottedPoint: false,
							popupTitle: "Point ID: " + mafStrPtIDVal,
							popupContent: address,
							isUnitPoint: isUnitPt
						};

						/*if mafStrPtIDVal doesn't have a value a guid is assigned to point during the following call*/
						var pw = this.createPointWrapper(pointConfig);
						/*it may be a previously worked upon temp id*/
						if (!mafStrPtIDInd || mafStrPtIDInd === "N") {
							pw.setPointIDGenerated();
						}
						if (selectedPoint) {
							this.originalSelectedPointID = pw.getPointID();
						}
						ru.setNewAddress(newAddress);
						ru.setStatus(addressStatusVal);
						ru.setStructureType(structureType);
						/*following is needed when we de-tach*/
						ru.setAddress(address);
						ru.setUnitPointFlag(isUnitPt);
						if (dangerous === "true" || dangerous === true) {
							pw.setDangerous(true);
						}
						pw.setIcon();

						pw.addReportingUnit(ru);
						this.addPointWrp(pw);
					}
				}
			}
		} catch (e) {
			console.log(e.message + "\n" + e.stack);
			throw e;
		}
		return true;

	};


	Object.getPrototypeOf(ptrMgr).buildPointSubTitle = function(pointWrapper) {
		console.log("ENUMAddressList->buildPointSubTitle: " + " # of reporting Units: " + pointWrapper.unitList.length);
		if (pointWrapper.unitList.length > 1) {
			pointWrapper.setPointTitle("");
			return '<b>' + pointWrapper.unitList.length + ' Units at this map spot<br/>' + pointMenu.subtitle + '</b>';
		}
		return null;

	};

	Object.getPrototypeOf(ptrMgr).processShow = function() {
		console.log("ENUM_mapIntegration->processShow: " + " currentSelectedPointID: " + this.currentSelectedPointID);
		try {
			var pw = null;
			if (this.originalSelectedPointID) {
				pw = this.pointWrpMap[this.originalSelectedPointID];
			}
			if (pw && !pw.getPlotted()) {
				globalMap.showHint({
					title: "A mapspot is not available for this case.",
					message: "",
					titleColor: "#FFFFFFFF",
					messageColor: "#FFdedfe0",
					backgroundColor: "#FF4aa564",
					duration: 4,
					position: window.launchbox.OfflineMapEsri.HintPosition.TOP,
					hideOnTap: true,
					hideOnSwipe: true
				});
			}
		} catch (e) {
			console.log("ENUM_mapIntegration->processShow: " + "Error :: " + e.message + "\n" + e.stack);
			throw e;
		}
		return true;

	};

	Object.getPrototypeOf(ptrMgr).processHide = function(newPoints) {
		console.log("ENUMAddressList->processHide: ");
		ENUMAddressList.scrollToAddressOnUI(this.getSelectedMapSpotReportingUnit());
		return true;
	};

	/*Object.getPrototypeOf(ptrMgr).onLongPress = function(pointData) {
	    console.log("ENUMAddressList->onLongPress: " + "END:::onLongPress\n Ignoring long press");
	    return true;
	  };*/

	Object.getPrototypeOf(ptrMgr).processLongPress = function(pointWrapper) {
		console.log("ENUMAddressList->processLongPress: " + "END:::processLongPress\n" + pointWrapper.toString());
		return true;
	};

	Object.getPrototypeOf(ptrMgr).processPointSelected = function(pointWrapper) {
		console.log("ENUMAddressList->processPointSelected: " + pointWrapper);
		var newTitle = mapConfig.mapTitle;
		/* newTitle += "<br/>" + pointWrapper.getPoint().title; */
		mapObj.setTitle(newTitle);

		if (pointWrapper.unitList.length > 1) {
			pw = this.pointWrpMap[this.currentSelectedPointID];
			pw.getPoint().title = '<b>' + pointWrapper.unitList.length + ' Units at this map spot </b> <br/>' + pointMenu.subtitle;
			pointWrapper.setPointTitle('<b>' + pointWrapper.unitList.length + ' Units at this map spot </b> <br/>' + pointMenu.subtitle);
			pointWrapper.setSubTitle("");

		}
        this.showCallout(pointWrapper.getPointID(), false);  
		return true;
	};


	ptrMgr.setupPointMenu(pointMenu);
};


ENUMAddressList.scrollToAddressOnUI = function(rptList) {};
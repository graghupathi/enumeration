/*
 ParaData Start
 v: 11
 Adding Clear
*/ 

  

var ParaData = {
	_init : false,
	_this : this,
	_paraDataPage : '',
	_map : {},
	_count : {},
	_log : [],
	_hhIX : null,
	_uIX : 1,
	_intervalID : 0,
	_storage : {
		isAvailable : typeof(sessionStorage) !== "undefined" ? true : false,
		Get : function(key){ return sessionStorage.getItem(key); },
		Set : function(key, value){ sessionStorage.setItem(key, value); }	
	},
	InitializePre: function(paraDataPage){},
	Initialize : function(paraDataPage) {
		/* Save the Map */
		this._paraDataPage = paraDataPage || this._paraDataPage;
		/* Process if a Page was passed */
		if(this._paraDataPage){
			/*  Call Pre */
			this.InitializePre(paraDataPage);			
			/* Get log from storage if available */
			if(this._storage.isAvailable && this._storage.Get("log")){ this._log = JSON.parse(this._storage.Get("log")); }
			if(this._storage.isAvailable && this._storage.Get("count")){ this._count = JSON.parse(this._storage.Get("count")); }		
			this._hhIX = $("#CurrentHHMemberIndex").val();
			this._uIX = $("#CurrentRosterReference").val();	
			var cursor;	
          	var key;
			for(i = 0;  i < this._paraDataPage.Elements.length; i++){
				/* Set the Current Object in the Loop */
				cursor = this._paraDataPage.Elements[i];
              	key = cursor.n.replace(/\s/g,'').replace(/,/g,'-');
				/* Add the Associative Property to the Map Object */
				this._map[key] = cursor.v;
				/* if CTR and does not exist */
				if(cursor.n.indexOf('-CTR') >= 0){
					var ifPresent = this._count[this._paraDataPage.Prefix + cursor.v];
					if(!ifPresent){		
						this._count[this._paraDataPage.Prefix + cursor.v] = 0;
					}
				}
			}
			/* Create Bind Pulse */
			this._intervalID = window.setInterval(ParaData.Bind, 500);
console.log("ParaData setInterval" + this._intervalID);
			/* Set to true object was initialized. */
			this._init = true;
			/*  Call Post */
			this.InitializePost(paraDataPage);			
		}
console.log("ParaData: Initialized.");
	},
	Clear : function(){
		window.clearInterval(this._intervalID);
console.log("ParaData clearInterval" + this._intervalID);
		this._init = false;
		this._map = {};
		this._count = {};
		this._log = [];
		this._paraDataPage = '';
console.log("ParaData: Cleared.");
	},
	InitializePost: function(paraDataPage){},
	BindPre: function(){},
	Bind : function(){
		/*  Call Pre */
		ParaData.BindPre();
		/* Select Elements Not Binded */
		$("a[Analytics!='true'], button[Analytics!='true']").attr("Analytics", "true").click(function(){
			ParaData.Insert($(this).text());
		});
		$("input[type='radio'][Analytics!='true'], input[type='checkbox'][Analytics!='true']").attr("Analytics", "true").click(function(){
			ParaData.Insert($(this).next().text());
		});
		$("input[Analytics!='true'], textarea[Analytics!='true'], select[Analytics!='true']").attr("Analytics", "true").focus(function(){
			ParaData.Insert($(this).attr("id"));
		});
		if($(".VDLN[Analytics!='true']").attr("Analytics", "true").length > 0){
			ParaData.Insert("VDLN");
		}
		/*  Call Post */
		ParaData.BindPost();
	},
	BindPost: function(){},
 	GetLocale : function(key){
      try{
          var eIND; 
          if(key == "entry"){
            eIND = this.Map("Entry-IND"); 
          } else {
            eIND = this.Map("Exit-IND");
          }
          var SelectedLanguage = $("#pxReqLocale").val();
          if(SelectedLanguage.indexOf("en_") >= 0){return { ElementName: eIND, Value: 1};}
          if(SelectedLanguage.indexOf("es_") >= 0){return { ElementName: eIND, Value: 2};}  
      }  catch (ex){}
	}, 
	MapPre: function(key){},
	Map : function(key){
		/* Call Pre */
		this.MapPre(key);
		return this._map[key];
		/* Call Post */
		this.MapPost(key);
	},
	MapPost: function(key){},
	InsertPre: function(element){},
	Insert : function(element){	
		if(this._init){
			/*  Call Pre */
			this.InsertPre(element);
			/* Remove any Spaces, & with and*/
			/* element = element.replace(/\s/g,'').replace("&","and"); */
          	element = element.replace("&","and").replace(/\s/g,'').replace(/,/g,'-');
			/* Perform Map of Elements */
			var eTIME = this.Map(element + "-TIME");
			var eCTR = this.Map(element + "-CTR");
			/* If Mapping Found, Insert into the log */
			if(eTIME){
				this._log.push({ElementName : this._paraDataPage.Prefix + eTIME, Value: new Date().toLocaleString(), HHIX: this._hhIX, UIX: this._uIX});
console.log("ParaData: Inserted - " + this._paraDataPage.Prefix + eTIME);				
			}
			/* If Mapping Found, Increment Counter */
			if(eCTR){
				this._count[this._paraDataPage.Prefix + eCTR]++;
console.log("ParaData: Counter++ for " + this._paraDataPage.Prefix + eCTR);
			}
			/*  Call Post */
			this.InsertPost(element);
		}
	},
	InsertPost: function(element){},
	InsertWithValues : function(element){
		if(this._init){
			try{
			  /* Perform Insert */
			  this._log.push({ElementName : this._paraDataPage.Prefix + element.ElementName, Value: element.Value, HHIX: this._hhIX, UIX: this._uIX});	  
console.log("ParaData: InsertedWithValue - " + this._paraDataPage.Prefix + element.ElementName);		
			} catch (ex){}
		}
	},
  	IncrementCTR : function(element){
		if(this._init && element){
			/* If Mapping Found, Increment Counter */
			if(this._count[element] === undefined){
console.log("ParaData: IncrementCTR to 1");	
				this._count[element] = 1;
			} else {
				this._count[element]++;
console.log("ParaData: IncrementCTR " + element + " to " + this._count[element]);	
			}
		}
	},
	SerializePre: function(){},
	Serialize : function(){
		/*  Call Pre */
		this.SerializePre();
		var cursor;
		var ctrValue;
		var tempLog = this._log.slice();
		for(var propertyName in this._count){	
			/* If Counter */
			if(propertyName.indexOf('_CTR') >= 0){
				/* Get the Value */
				ctrValue = this._count[propertyName];
				/* If Found and greater than 0 */
				if(ctrValue && ctrValue > 0){ tempLog.push({ElementName : propertyName, Value: ctrValue}); }
			}
		}
		/* Save to storage */
		this._storage.Set("log", JSON.stringify(this._log));
		/* Save to storage */
		this._storage.Set("count", JSON.stringify(this._count));		
		/* Return */
		return JSON.stringify({ pxResults:tempLog });
	},
	SerializePost: function(){},
	SavePre: function(){},
	Save : function(){
		if(this._init){
			/*  Call Pre */
			this.SavePre();
			$.ajax({
			
               async : false,
               url: new SafeURL("").toURL(),
               data: "pyActivity=CB-FW-CensusFW-Work.ProcessParaDataJSONEntries&Data=" +  this.Serialize(),
               method: "POST",
               success: function(){},
               failure:  function(){},
               complete: function(e, xhr, settings){}
			});
			/*  Call Post */
		}
	},
	SavePost: function(){}
};
/* 
ParaData End
*/
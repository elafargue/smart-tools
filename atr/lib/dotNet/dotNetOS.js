/**
 * @author rdollet
 *  Variation for dotNet spec (E. Lafargue)
 *
 * Should rename this to calypso, not cd97...
 */

// Register script load:
var dotNetOSjs=true;

function dotNetOS(readerName){

	this.cardOsName = "dotNet";
	this.RootID ="";

	// Card's MS Card Module instance
	//this.mscm = new Axalto.netCard.CardModule.CardModuleService(readerName,1,"ContentManager");;
	this.contentManager=new SmartCard.ContentManager(readerName,1,"ContentManager");

	/* Process file attribute information */
	var processFci = function(file,attribute){

/*
	GetFileSize:function(filePath)
 */
		return attribute;
	};

	/* Gets all the files a in a directory */
	/* When we're at the root, get the card's logical drives
	 *
	 */
	this.listFiles = function(dfToPerformOperation){
		var response = new Object();
		// Sanity check
//		if(dfToPerformOperation.fileFamily != "Directory") {
//			return "";
//		}
		if (dfToPerformOperation.fileID == this.RootID) {
			var dlist = this.contentManager.GetLogicalDrives();
			dfToPerformOperation.getListChildren = dlist;
			return dlist;
		} else {

			try { var flist = this.contentManager.GetFiles(dfToPerformOperation.fileID); } catch(e) { // No files... 
			alert(e.message());
			}
			try {
				var dlist = this.contentManager.GetDirectories(dfToPerformOperation.fileID);
			} catch (e) {
			alert(e.message());
			}
			dfToPerformOperation.getListChildren=flist + dlist;
			return flist + dlist;
		}
	};


	/* Selects a .NET card module file: gets file attributes
	 * Should return true if the file is a directory.
	 */
	this.selectFile = function(fileObject){
		var propArray = null;
		if(fileObject.fileFamily == "Directory" || fileObject.fileID == "") {
			return SC_NO_ERROR;
		}
		try {
			propArray = this.contentManager.GetFileAttributes(fileObject.fileID);
		} catch (e) {
			// Call failed: this was not a file but a directory...
			fileObject.fileFamily = "Directory";
			return SC_NO_ERROR;
		}
		fileObject.fileProperties = propArray;
		return SC_NO_ERROR;
	};

/* ???
 */
	this.analyseFile = function(fileToAnalyse) {
		return SC_NO_ERROR;	
		var rawAttribute = fileToAnalyse.rawFileAttribute;
		switch (rawAttribute.substring(0, 2)) {
			case "6F":
				// Sanity Check
				if (parseInt(rawAttribute.substring(2, 4), 16) <= (rawAttribute.length/2)) {
					return(processFci(fileToAnalyse, rawAttribute.substring(4)));
				}
				break;
			case "85":
				// Sanity Check
				if (parseInt(rawAttribute.substring(2, 4), 16) <= (rawAttribute.length/2)) {
					return(processCD97Fci(fileToAnalyse, rawAttribute.substring(4)));
				}
				break;
			default:
				return (logError(SC_ERROR.UNKNOWN_DATA_RECEIVED));
		}		
	};

/* ???
 */	
	this.check_sw = function(sw1, sw2){
	
		var error = "";
		
			return SC_NO_ERROR;
	};
	
	/* Reads the contents of a file */
	this.readFile = function(fileToRead, responseHandler, responseHandlerParent){

//	Use: 
/*
	GetFile:function(path){
		return this.marshaller.invoke(1,0x6094,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_U1ARRAY);
	},
*/

		var successLocalCallBack = function(cardResponse) {	

			if (true) {
			}
			else {
				// We're done go back
				fileToRead.getContent = buf;
				responseHandler.success(buf, responseHandlerParent);
			}
	};

	var failureLocalCallBack =function(cardResponse) {// We're done go back
		// Still go back
		fileToRead.getContent = buf;	
		responseHandler.success(buf, responseHandlerParent);
		
	};	

	var localCallBack = {
		success: successLocalCallBack,
		failure: failureLocalCallBack,
		scope:this
	};

	successLocalCallBack({
		statusWord : "0000",		dataOut : ""
	});

};


// Should use trace window
var logError = function(errorCode){
	
	var toto;
	logD("Error reported : " + errorCode);
	return(errorCode);		
};

}



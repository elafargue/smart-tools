/**
 * @author rdollet
 */

var calypsoSmartCardJS = true;

var mySConnectService
var cardAtr;
var calypsoSmartCardReadFileSuccess=function (content, responseParentHandler){
	responseParentHandler.success(content);
}
var calypsoSmartCardReadFileFailure=function(responseParentHandler) {
	
}
var calypsoSmartCardReadFileCallBack = {
	success: calypsoSmartCardReadFileSuccess,
	failure: calypsoSmartCardReadFileFailure
}

function calypsoSmartCard(ReaderToConnectTo, apduPanel){

	// Connect to the reader
	var res = null;
	try {
	 res = mySConnectService.connect(ReaderToConnectTo);
	} catch(e) {
		// Were we connected already?
		mySConnectService.disconnect(ReaderToConnectTo);
		res = mySConnectService.connect(ReaderToConnectTo);
	}
	// Retrieve ATR
	var scardStatus = mySConnectService.cardStatus();
	var cardAtr = scardStatus.ATR;
		
	// Card implementation
	var cardOS;

	var myApduPanel = apduPanel;
	
	// Current File
	var currentFile;

	// Intelligent Router / (** Use Dynamic scripting from Kapil **)
	// Decision process for implementation specificites
	// We implement only SetCos for this demo
	var implementMe = function(cardAtr){
		var cardImplementationObject;
		switch (cardAtr) {
			default:
				cardImplementationObject = new calypsoOs(cardAtr,myApduPanel);
				break;
		}
		return (cardImplementationObject);
	};
	
	this.calypsoSmartCardSelectFile = function(fileID, responseHandler){

		var fileToBeSelected = currentFile.select(fileID); // We don't know what it is yet

		// Select Object
		if (cardOS.selectFile(fileToBeSelected) === true) {
			
			// Need to update the current Path ?
			currentFile = fileToBeSelected;
			
			// In anycase let's analyse it
			cardOS.analyseFile(currentFile);
			
			// Special Case for Root and DF selection when EF was selected
			if (currentFile.fileID === cardOS.RootID) {
				currentFile.setParent(null);
			} else 	if( currentFile.getParent().fileFamily == "EF"){
				currentFile.setParent(currentFile.getParent().getParent());
			}			
			// Extend/Specialize Path and Exposed card edge based on file type
			switch(currentFile.fileFamily){
				case "DF":
					currentFile.extendClass(new dfFileClass());
					removeObject(this, new calypsoSmartCardEfClass());
					extendObject(this, new calypsoSmartCardDfClass(cardOS,currentFile));

					// Try to get directory
					if (cardOS.listFiles) {
						//return (cardOS.listFiles(currentFile));
						responseHandler.success(cardOS.listFiles(currentFile));
					} else {
						responseHandler.success("");
					};
					break;
				case "EF":
					currentFile.extendClass(new efFileClass());
					removeObject(this, new calypsoSmartCardDfClass());
					extendObject(this, new calypsoSmartCardEfClass(cardOS,currentFile));

					// Try to get content
					if (cardOS.readRecord) {
						cardOS.readRecord(currentFile,calypsoSmartCardReadFileCallBack,responseHandler);
					} else {
						responseHandler.success("");
					};
					break;
				default:
					responseHandler.success("");
					break;				
			}

		}
		else {
			responseHandler.failure();
		}
		
	};

	// Initialize Object
	this.calypsoSmartCardInitialize = function (initialResponseHandler){
		cardOS = implementMe(cardAtr)
	 	currentFile = new fileClass(cardOS.RootID);
		this.calypsoSmartCardSelectFile(cardOS.RootID, initialResponseHandler);
	}

	this.calypsoSmartCardGetCurrentFile = function(){
		return (currentFile);
	};
}


function calypsoSmartCardDfClass(cardOSPointer, currentFilePointer) {

/*
	this.p15SmartCardListFiles = function(){
		// Check if OS support list function
		if (cardOSPointer.listFiles) {
			return(cardOSPointer.listFiles(currentFilePointer));
		}	else {
			return(false);
		}
	}
	*/
}

function calypsoSmartCardEfClass(cardOSPointer,currentFilePointer) {
/*
	var cardOS = cardOSPointer;
	this.p15SmartCardReadFileContent = function() {
		alert("content toto");
	};
	*/
}

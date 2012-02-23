/**
 * @author rdollet
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
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
	this.currentFile = null;

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

		var fileToBeSelected = this.currentFile.select(fileID); // We don't know what it is yet

		// Select Object
		if (cardOS.selectFile(fileToBeSelected) === true) {
			
			// Need to update the current Path ?
			this.currentFile = fileToBeSelected;
			
			// In anycase let's analyse it
			cardOS.analyseFile(this.currentFile);
			
			// Special Case for Root and DF selection when EF was selected
			if (this.currentFile.fileID === cardOS.RootID) {
				this.currentFile.setParent(null);
			} else 	if( this.currentFile.getParent().fileFamily == "EF"){
				this.currentFile.setParent(this.currentFile.getParent().getParent());
			}			
			// Extend/Specialize Path and Exposed card edge based on file type
			switch(this.currentFile.fileFamily){
				case "DF":
					this.currentFile.extendClass(new dfFileClass());
					removeObject(this, new calypsoSmartCardEfClass());
					extendObject(this, new calypsoSmartCardDfClass(cardOS,this.currentFile));

					// Try to get directory
					if (cardOS.listFiles) {
						//return (cardOS.listFiles(currentFile));
						responseHandler.success(cardOS.listFiles(this.currentFile));
					} else {
						responseHandler.success("");
					};
					break;
				case "EF":
					this.currentFile.extendClass(new efFileClass());
					removeObject(this, new calypsoSmartCardDfClass());
					extendObject(this, new calypsoSmartCardEfClass(cardOS,this.currentFile));

					// Try to get content
					if (cardOS.readRecord) {
						cardOS.readRecord(this.currentFile,calypsoSmartCardReadFileCallBack,responseHandler);
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
	 	this.currentFile = new fileClass(cardOS.RootID);
		this.calypsoSmartCardSelectFile(cardOS.RootID, initialResponseHandler);
	}

	this.calypsoSmartCardGetCurrentFile = function(){
		return (this.currentFile);
	};
}


function calypsoSmartCardDfClass(cardOSPointer, currentFilePointer) {
}

function calypsoSmartCardEfClass(cardOSPointer,currentFilePointer) {
}

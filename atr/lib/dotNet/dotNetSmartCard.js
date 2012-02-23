/**
 * @author rdollet, elafargue
 */

// Register script load:
var dotNetSmartCardjs=true;

var mySConnectService
var cardAtr;
var dotNetSmartCardReadFileSuccess=function (content, responseParentHandler){
	responseParentHandler.success(content);
}

var dotNetSmartCardReadFileFailure=function(responseParentHandler) {
	}

var dotNetSmartCardReadFileCallBack = {
	success: dotNetSmartCardReadFileSuccess,
	failure: dotNetSmartCardReadFileFailure
}

function dotNetSmartCard(ReaderToConnectTo){

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
	var myReader = ReaderToConnectTo;
		
	// Card implementation
	var cardOS;
	
	// Current File
	var currentFile;

	// Intelligent Router / (** Use Dynamic scripting from Kapil **)
	// Decision process for implementation specificites
	// We implement only SetCos for this demo
	var implementMe = function(){
		var cardImplementationObject;
		switch (cardAtr) {
			default:
				cardImplementationObject = new dotNetOS(myReader);
				break;
		}
		return (cardImplementationObject);
	};
	
	this.smartCardSelectFile = function(fileID, responseHandler){

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
				currentFile.fileFamily = "Directory";
			} else 	if( currentFile.getParent().fileFamily == "File"){
				currentFile.setParent(currentFile.getParent().getParent());
			}			
			// Extend/Specialize Path and Exposed card edge based on file type
			switch(currentFile.fileFamily){
				case "Directory":
					currentFile.extendClass(new dfFileClass());
					removeObject(this, new dotNetSmartCardEfClass());
					extendObject(this, new dotNetSmartCardDfClass(cardOS,currentFile));

					// Try to get directory
					if (cardOS.listFiles) {
						//return (cardOS.listFiles(currentFile));
						responseHandler.success(cardOS.listFiles(currentFile));
					} else {
						responseHandler.success("");
					};
					break;
				case "File":
					currentFile.extendClass(new efFileClass());
					removeObject(this, new dotNetSmartCardDfClass());
					extendObject(this, new dotNetSmartCardEfClass(cardOS,currentFile));

					// Try to get content
					if (cardOS.readRecord) {
						cardOS.readRecord(currentFile,dotNetSmartCardReadFileCallBack,responseHandler);
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
	this.smartCardInitialize = function (initialResponseHandler){
		cardOS = implementMe(cardAtr)
	 	currentFile = new fileClass(cardOS.RootID);
		this.smartCardSelectFile(cardOS.RootID, initialResponseHandler);
	}

	this.smartCardGetCurrentFile = function(){
		return (currentFile);
	};
}

function dotNetSmartCardDfClass(cardOSPointer, currentFilePointer) {
}

function dotNetSmartCardEfClass(cardOSPointer,currentFilePointer) {
}

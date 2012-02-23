/**
 * @author rdollet
 * @author elafargue
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */
var mySConnectService
var cardAtr;


var p15SmartCardReadFileSuccess=function (content, responseParentHandler){
	responseParentHandler.success(content);
}
var p15SmartCardReadFileFailure=function(responseParentHandler) {
	
}
var p15SmartCardReadFileCallBack = {
	success: p15SmartCardReadFileSuccess,
	failure: p15SmartCardReadFileFailure
}

var P15SmartCardJS = true;

function p15SmartCard(ReaderToConnectTo, apduPanel){

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
	cardAtr = scardStatus.ATR;

	var myApduPanel = apduPanel;

	// Card implementation
	var cardOS;
	
	// Current File
	this.currentFile = null;

	// Intelligent Router / (** Use Dynamic scripting from Kapil **)
	// Decision process for implementation specificites
	// We implement only SetCos for this demo
	var implementMe = function(cardAtr){
	
		var cardImplementationObject;
		switch (cardAtr) {		
			case "3B9F94801FC30068114405014649534531C807900019": // SetCos 4.4.1
				cardImplementationObject = new setecOs(cardAtr,myApduPanel);
				break;
			case "3B7E9500008031807334118082900000000000": // IAS 1.0.1 Premium
				cardImplementationObject = new iasPremiumOs(cardAtr,myApduPanel);
				break;
			case "3B7D96000080318065B0850100D683019000": // IAS-ECC
				cardImplementationObject = new iasEccOs(cardAtr,myApduPanel);
				break;
			case "3B7D95000080318065B0831100C883009000":
			case "3B7D95000080318065B0831100C883009000":
				cardImplementationObject = new portugalID(cardAtr, myApduPanel);
				break;
			case "3B7D94000080318065B08311C0A983009000":
			case "3B7D95000080318065B08302047E83009000": // GemSafe v2
			case "3B7D95000080318065B08302037E83009000":
			case "3B7D96000080318065B0831100C883009000":
				cardImplementationObject = new gemSafeOs(cardAtr,myApduPanel);
				break;
			default:
				cardImplementationObject = new iso7816(myApduPanel);
				break;
		}
		p15Xplorer.setTitle(cardImplementationObject.cardOsName + " / Atr : <b>" + cardAtr+ "</b>" );
		return (cardImplementationObject);
	};

	
	this.p15SmartCardSelectFile = function(fileID, responseHandler){

		var fileToBeSelected = this.currentFile.select(fileID); // We don't know what it is yet

		// Select Object
		if (cardOS.selectFile(fileToBeSelected) != true) {
			if (cardOS.selectEfFile(fileToBeSelected) != true) {
			// Some cards require P1 to be at 02 for EF files...
				responseHandler.failure();
				return;
			}
		}

		// Need to update the current Path ?
		this.currentFile = fileToBeSelected;
			
		// In anycase let's analyse it
		cardOS.analyseFile(this.currentFile);
			
		// Special Case for Root and DF selection when EF was selected
		if (this.currentFile.fileID === cardOS.RootID) {
			this.currentFile.setParent(null);
		} else if( this.currentFile.getParent().fileFamily != "DF"){
			// BUG: if the card contains an empty DF, this detection fails!
			this.currentFile.setParent(this.currentFile.getParent().getParent());
		}
		// Extend/Specialize Path and Exposed card edge based on file type
		switch(this.currentFile.fileFamily){
			case "DF":
				this.currentFile.extendClass(new dfFileClass());
				removeObject(this, new p15SmartCardEfClass());
				extendObject(this, new p15SmartCardDfClass(cardOS,this.currentFile));

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
					removeObject(this, new p15SmartCardDfClass());
					extendObject(this, new p15SmartCardEfClass(cardOS,this.currentFile));

					// Try to get contents
					if (cardOS.readFile) {
						cardOS.readFile(this.currentFile,p15SmartCardReadFileCallBack,responseHandler);
					} else {
						responseHandler.success("");
					};
					break;
				default:
					responseHandler.success("");
					break;				
			}

		
	};

	// Initialize Object
	this.p15SmartCardInitialize = function (initialResponseHandler){
		cardOS = implementMe(cardAtr)
	 	this.currentFile = new fileClass(cardOS.RootID);
		this.p15SmartCardSelectFile(cardOS.RootID, initialResponseHandler);		
	};
		
	this.p15SmartCardGetCurrentFile = function(){
		return (this.currentFile);
	};

	// SM Key diversification
	this.diversify = function(masterKey) {
		return cardOS.diversify(masterKey);
	};


}


function p15SmartCardDfClass(cardOSPointer, currentFilePointer) {

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

function p15SmartCardEfClass(cardOSPointer,currentFilePointer) {
/*
	var cardOS = cardOSPointer;
	this.p15SmartCardReadFileContent = function() {
		alert("content toto");
	};
	*/
}

/**
 * @author rdollet
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

var iso7816JS = true;

function iso7816(apduPanel){

	this.cardOsName = "7816";
	this.RootID ="3F00";
	this.myApduPanel = apduPanel;

	this.knownFiles = new Array();

	var iso7816_errors = [["6200", SC_ERROR.MEMORY_FAILURE, "State of non-volatile memory unchanged"], ["6281", SC_ERROR.MEMORY_FAILURE, "Part of returned data may be corrupted"], ["6282", SC_ERROR.CARD_CMD_FAILED, "End of file/record reached before reading Le bytes"], ["6283", SC_ERROR.CARD_CMD_FAILED, "Selected file invalidated"], ["6284", SC_ERROR.CARD_CMD_FAILED, "FCI not formatted according to ISO 7816-4"], ["6300", SC_ERROR.MEMORY_FAILURE, "State of non-volatile memory changed"], ["6381", SC_ERROR.CARD_CMD_FAILED, "File filled up by last write"], ["6581", SC_ERROR.MEMORY_FAILURE, "Memory failure"], ["6700", SC_ERROR.WRONG_LENGTH, "Wrong length"], ["6800", SC_ERROR.NO_CARD_SUPPORT, "Functions in CLA not supported"], ["6881", SC_ERROR.NO_CARD_SUPPORT, "Logical channel not supported"], ["6882", SC_ERROR.NO_CARD_SUPPORT, "Secure messaging not supported"], ["6900", SC_ERROR.NOT_ALLOWED, "Command not allowed"], ["6981", SC_ERROR.CARD_CMD_FAILED, "Command incompatible with file structure"], ["6982", SC_ERROR.SECURITY_STATUS_NOT_SATISFIED, "Security status not satisfied"], ["6983", SC_ERROR.AUTH_METHOD_BLOCKED, "Authentication method blocked"], ["6984", SC_ERROR.CARD_CMD_FAILED, "Referenced data invalidated"], ["6985", SC_ERROR.NOT_ALLOWED, "Conditions of use not satisfied"], ["6986", SC_ERROR.NOT_ALLOWED, "Command not allowed (no current EF)"], ["6987", SC_ERROR.INCORRECT_PARAMETERS, "Expected SM data objects missing"], ["6988", SC_ERROR.INCORRECT_PARAMETERS, "SM data objects incorrect"], ["6A00", SC_ERROR.INCORRECT_PARAMETERS, "Wrong parameter(s) P1-P2"], ["6A80", SC_ERROR.INCORRECT_PARAMETERS, "Incorrect parameters in the data field"], ["6A81", SC_ERROR.NO_CARD_SUPPORT, "Function not supported"], ["6A82", SC_ERROR.FILE_NOT_FOUND, "File not found"], ["6A83", SC_ERROR.RECORD_NOT_FOUND, "Record not found"], ["6A84", SC_ERROR.CARD_CMD_FAILED, "Not enough memory space in the file"], ["6A85", SC_ERROR.INCORRECT_PARAMETERS, "Lc inconsistent with TLV structure"], ["6A86", SC_ERROR.INCORRECT_PARAMETERS, "Incorrect parameters P1-P2"], ["6A87", SC_ERROR.INCORRECT_PARAMETERS, "Lc inconsistent with P1-P2"], ["6A88", SC_ERROR.DATA_OBJECT_NOT_FOUND, "Referenced data not found"], ["6B00", SC_ERROR.INCORRECT_PARAMETERS, "Wrong parameter(s) P1-P2"], ["6D00", SC_ERROR.INS_NOT_SUPPORTED, "Instruction code not supported or invalid"], ["6E00", SC_ERROR.CLASS_NOT_SUPPORTED, "Class not supported"], ["6F00", SC_ERROR.CARD_CMD_FAILED, "No precise diagnosis"], // Possibly TCOS / Micardo specific errors
	["6600", SC_ERROR.INCORRECT_PARAMETERS, "Error setting the security env"], ["66F0", SC_ERROR.INCORRECT_PARAMETERS, "No space left for padding"], ["69F0", SC_ERROR.NOT_ALLOWED, "Command not allowed"], ["6A89", SC_ERROR.FILE_ALREADY_EXISTS, "Files exists"], ["6A8A", SC_ERROR.FILE_ALREADY_EXISTS, "Application exists"]];

	this.logError = function(errorCode){
		logD("Error : " + errorCode, this.myApduPanel);
		return(errorCode);
	};


	/*
	 * Computes a diversified secure messaging key set using the VISA2 algo
	 * using the card's serial number.
	 */
	this.diversify = function(masterKey) {
		/* Select the card manager of the card */
		var apdu = {
			cla: "00",
			ins: "A4",
			p1: "04",
			p2: "00",
			lc: "",
			data: "",
			le: ""
		};
		var r = sc_transmit_apdu(apdu,this.myApduPanel);
		if (r === null) {
			return (this.logError("APDU transmit - Select Default- failed"));
		}
		r = this.check_sw(apdu.sw1, apdu.sw2);

		apdu.cla = "80";
		apdu.ins = "CA";
		apdu.p1 = "9F";
		apdu.p2 = "7F";
		apdu.le = "2D";

		var r = sc_transmit_apdu(apdu,this.myApduPanel);
		if (r === null) {
			return (this.logError("APDU transmit - GET CPLC- failed"));
		}
		r = this.check_sw(apdu.sw1, apdu.sw2);

		var CPLCData = apdu.resp;
		logError("<h2>CPLC Data: " + CPLCData + "</h2>");
		var cardId = CPLCData.substring(30,38);
	};


	/*
	 * Reads the FCP information no a file and fills up the right attributes in the file object.
	 */
	this.processFcp = function(file,attribute){

		var tag, tagA;
		var taglen = "";
		var myByte;
		
		tagA = sc_asn1_find_tag(attribute, "83");
		tag = tagA[0];
		if (tag.val != 0 && tag.taglen == 2) {
			file.filePath=tag.val;
		} else {
			file.filePath = file.fileID;
		}

		tagA = sc_asn1_find_tag(attribute, "80");
		tag = tagA[0];
		if (tag.val != 0 && tag.taglen >= 2) {
			this.logError("bytes in file:" + parseInt(tag.val, 16));
			file.size = parseInt(tag.val, 16);
		}
		if (tag.val == 0) {
			tagA = sc_asn1_find_tag(attribute, "81");
			tag = tagA[0];
			if (tag.val != 0 && tag.taglen >= 2) {
				this.logError("bytes in file:" + parseInt(tag.val, 16));
				file.size = parseInt(tag.val, 16);
			}
		}
		
		tagA = sc_asn1_find_tag(attribute, "82");
		tag = tagA[0];
		if (tag.val != 0) {
			if (tag.taglen > 0) {
				myByte = parseInt(tag.val.substr(0, 2), 16);
				var type;
				
				//file.shareable = (myByte & 0x40) ? 1 : 0;
				//file.ef_structure = (myByte & 0x07);
				var tempSwitch = (myByte >> 3) & 7;
				switch (tempSwitch) {
					case 0:
						file.fileFamily = "EF";
						file.fileType = "working EF";
						break;						
					case 1:
						file.fileFamily = "EF";
						file.fileType = "internal EF";
						break;
					case 7:
						file.fileFamily = "DF";
						file.fileType = "DF";
						break;
					default:
						file.fileType = "unknown";
						break;						
				}				
				this.logError("type: " + file.fileType);
				this.logError("EF structure: " + (myByte & 0x07));
			}
		}
		
		tagA = sc_asn1_find_tag(attribute, "84");
		tag = tagA[0];
		if ((tag.val != 0) && (tag.taglen > 0) && (tag.taglen <= 16)) {
			file.fileName = hexAsciiToAscii(tag.val);
			this.logError("File name: " + tag.val);
		}
		
		return attribute;
		
	};

/*
 * Select a file (generic call)
 *
 */
	this.selectFile = function(fileObject){
	
		var apdu = {
			cla: "00",
			ins: "A4",
			p1: "00",
			p2: "00",
			lc: "00",
			data: "",
			le: ""
		};
	 
	 	// Select by AID?
	 	if(fileObject.fileID.length >4) {
		 	apdu.p1 = "04";
	 	}
		
		// Compute length
		apdu.lc = ("00" + (fileObject.fileID.length / 2).toString(16)).slice(-2);
		apdu.data = fileObject.fileID;		
		var r = sc_transmit_apdu(apdu,this.myApduPanel);
		if (r === null) {
			return (this.logError("APDU transmit - Select - failed"));
		}
		else {
			fileObject.rawFileAttribute = apdu.resp;
		}
		
		r = this.check_sw(apdu.sw1, apdu.sw2);
		return r;
	};

/*
 * Select an EF file (P1=02 according to ISO7816-4)
 */

	this.selectEfFile = function(fileObject){
	
		var apdu = {
			cla: "00",
			ins: "A4",
			p1: "02",
			p2: "00",
			lc: "00",
			data: "",
			le: ""
		};
	 
	 	// Select by AID?
	 	if(fileObject.fileID.length >4) {
		 	apdu.p1 = "04";
	 	}
		
		// Compute length
		apdu.lc = ("00" + (fileObject.fileID.length / 2).toString(16)).slice(-2);
		apdu.data = fileObject.fileID;		
		var r = sc_transmit_apdu(apdu,this.myApduPanel);
		if (r === null) {
			return (this.logError("APDU transmit - Select - failed"));
		}
		else {
			fileObject.rawFileAttribute = apdu.resp;
		}
		
		r = this.check_sw(apdu.sw1, apdu.sw2);
		return r;
	};


	this.analyseFile = function(fileToAnalyse) {
		
		var rawAttribute = fileToAnalyse.rawFileAttribute;
		switch (rawAttribute.substring(0, 2)) {
			case "6F":  // FCI Tag
				// The FCI template is a set of file control parameters and file management data.
				// We are just interested by the FPC to analyse the file:
				var tag = sc_asn1_find_tag(rawAttribute.substring(4), "62");
				if (tag[0].taglen > 0) {
					return(this.processFcp(fileToAnalyse, tag[0].val));
				}
				this.logError("FCI Tag is not PKCS#15 Compliant! Treating it as a FCP tag");
				return(this.processFcp(fileToAnalyse, rawAttribute.substring(4)));
				break;
			case "62":  // FCP Tag
				// Sanity Check
				if (parseInt(rawAttribute.substring(2, 4), 16) <= (rawAttribute.length/2)) {
					return(this.processFcp(fileToAnalyse, rawAttribute.substring(4)));
				}
				break;
			default:
				return (this.logError(SC_ERROR.UNKNOWN_DATA_RECEIVED));
		}		
	};
	
	this.check_sw = function(sw1, sw2){
	
		var error = "";
		
		// Handle special cases here 
		if (sw1 == "6C") {
			this.logError("Wrong length; correct length is 0x" + sw2);
			return SC_ERROR.WRONG_LENGTH;
		}
		// Alright
		if (sw1 == "90") {
			return SC_NO_ERROR;
		}
		// Pin error
		if (sw1 == "63") {
			this.logError("Wrong length; correct length is 0x" + sw2);
			return SC_ERROR.PIN_CODE_INCORRECT;
		}
		
		// Use Error Array
		for (i = 0; i < iso7816_errors.length; i++) {
			if (iso7816_errors[i][0] == (sw1 + sw2)) {
				this.logError(iso7816_errors[i][2]);
				return iso7816_errors[i][1];
			}
		}
		
		// Don't know ?
		this.logError("Unknown Status word : sw1=0x" + sw1 + " sw2=0x" + sw2);
		return SC_ERROR.CARD_CMD_FAILED;
	};


	/*
	 * Get a file contents in synchronous mode.
	 *
	 */
	this.readFileNow = function(fileToRead) {
		var idx = 0;
		var buf ="";
		var count;
		var r;
		var c=0;

		count = fileToRead.size;
		var apdu = {
			cla:"00",
			ins:"B0",
			p1: "00",
			p2: "00",
			lc:  "",
			le:  "",
			data:"",
			sw1: "00",
			sw2: "00",
			resp: ""
		};
		while (count) {
			if ((apdu.sw1 == "90") || (apdu.sw1 == "00")) {
				buf += apdu.resp;
				idx += apdu.resp.length / 2;
				count -= apdu.resp.length / 2;
					if (count) {
					if (count > 128) {
						c = 128;
					}
					else {
						c = count;
					}
					
					if (apdu.ins == "CA") {
						apdu.p2 = ("00"+ (parseInt("0x"+ apdu.p2) + 1).toString(16)).slice(-2);
						apdu.lc ="";
						apdu.le ="";
					}
					else {
						apdu.p1 = ("00" + ((idx >> 8) & 0x7F).toString(16)).slice(-2);
						apdu.p2 = ("00" + (idx & 0xFF).toString(16)).slice(-2);
						apdu.le = ("00" + c.toString(16)).slice(-2);
					}
									
					// Call synchronous handler
					var r = sc_transmit_apdu(apdu,this.myApduPanel);
					if (r === null) {
						return (this.logError("APDU transmit - Read Binary - failed"));
					}
				}
				else {
					// We're done go back
					fileToRead.getContent = buf;
				}
			}
			else if ((apdu.sw1 == "69") && (apdu.sw2 == "81")) {				
				apdu.cla="00";
				apdu.ins="CA";
				apdu.p1="01";
				apdu.p2="01";
				apdu.lc= "";
				apdu.le= "";
				apdu.data=""		
		
				// Call synchronous handler
				var r = sc_transmit_apdu(apdu,this.myApduPanel);
				if (r === null) {
					return (this.logError("APDU transmit - Read Binary - failed"));
				}
			}  else if ((apdu.sw1 == "6C")) {
				apdu.le=apdu.sw2;
		
				// Call synchronous handler
				var r = sc_transmit_apdu(apdu,this.myApduPanel);
				if (r === null) {
					return (this.logError("APDU transmit - Read Binary - failed"));
				}
			} else {
				// We're done go back
				fileToRead.getContent = buf;
			}
		}
	};



	/* Asynchronous file read */	
	this.readFile = function(fileToRead, responseHandler, responseHandlerParent){
		
		// To be added => Acc management and non linear format
		var idx = 0;
		var buf ="";
		var count;
		var r;
		var c=0;
	
		count = fileToRead.size;
		var apdu = {
			cla:"00",
			ins:"B0",
			p1: "00",
			p2: "00",
			lc:  "",
			le:	 "",
			data:""		
			
		};

		var successLocalCallBack = function(cardResponse) {
		
			apdu.sw1 = cardResponse.statusWord.substring(0, 2);
			apdu.sw2 = cardResponse.statusWord.substring(2, 4);
			apdu.resp = cardResponse.dataOut;
		
			// Should trace here
			if (apdu.sw1 != "00") {
				apduTrace(apdu,this.myApduPanel);
			}
			
			if ((apdu.sw1 == "90") || (apdu.sw1 == "00")) {
		
				//if (iso7816.check_sw(apdu.sw1, apdu.sw2)!==true){
				//	fileToRead.getContent = buf;	
				//	responseHandler.success(buf, responseHandlerParent);
				//}
						
				buf += apdu.resp;
				idx += apdu.resp.length / 2;
				count -= apdu.resp.length / 2;
			
				if (count) {
					if (count > 128) {
						c = 128;
					}
					else {
						c = count;
					}
					
					if (apdu.ins == "CA") {
						apdu.p2 = ("00"+ (parseInt("0x"+ apdu.p2) + 1).toString(16)).slice(-2);
						apdu.lc ="";
						apdu.le ="";
					}
					else {
						apdu.p1 = ("00" + ((idx >> 8) & 0x7F).toString(16)).slice(-2);
						apdu.p2 = ("00" + (idx & 0xFF).toString(16)).slice(-2);
						apdu.le = ("00" + c.toString(16)).slice(-2);
					}
									
					// Call asynchronous handler
					mySConnectService.async_transmit(apdu.cla +
					apdu.ins +
					apdu.p1 +
					apdu.p2 +
					apdu.lc +
					apdu.data +
					apdu.le, localCallBack);
				}
				else {
					// We're done go back
					fileToRead.getContent = buf;
					responseHandler.success(buf, responseHandlerParent);
				}
			}
			else if ((apdu.sw1 == "69") && (apdu.sw2 == "81")) {
				
				apdu.cla="00";
				apdu.ins="CA";
				apdu.p1="01";
				apdu.p2="01";
				apdu.lc= "";
				apdu.le= "";
				apdu.data=""		
			
				// Call asynchronous handler
				mySConnectService.async_transmit(apdu.cla +
				apdu.ins +
				apdu.p1 +
				apdu.p2 +
				apdu.lc +
				apdu.data +
				apdu.le, localCallBack);

		}  else if ((apdu.sw1 == "6C")) {
			apdu.le=apdu.sw2;
			
				// Call asynchronous handler
				mySConnectService.async_transmit(apdu.cla +
				apdu.ins +
				apdu.p1 +
				apdu.p2 +
				apdu.lc +
				apdu.data +
				apdu.le, localCallBack);

		} else {
			// We're done go back
			fileToRead.getContent = buf;
			responseHandler.success(buf, responseHandlerParent);
		}
	};
	var failureLocalCallBack =function(cardResponse) {
		// We're done, go back
		// Error to trace
		this.logError("APDU transmit - Read Binary - low level error");
		
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
				statusWord : "0000",
				dataOut : ""
		});
	};


	// Parses a EF.DIR file and returns the list of applications
	this.getApplications = function(fileContents) {
		var apps = new Array();
		var appTemplates = sc_asn1_find_tag(fileContents,"61");
		for (var i=0;i<appTemplates.length;i++) {
			var appId = sc_asn1_find_tag(appTemplates[i].val,"4F");
			apps.push(appId[0].val);
		}
		return apps;
	};

	// Parses a EF.DO file and returns the list of additional files
	this.getEFDOFiles = function(fileContents) {
		var apps = new Array();
		// EF.DO files can contain the 0xA0 to 0xA8 tags
		for (var j=0x0A0;j<0xA9;j++) {
			var filePathTemplates1 = sc_asn1_find_tag(fileContents, j.toString(16));
			// Here we assume we got only one tag (otherwise filePathTemplates would be
			// an array of objects).
			if (filePathTemplates1[0].val != null) {
				var filePathTemplates = sc_asn1_find_tag(filePathTemplates1[0].val,"30");
				// Likewise, we also assume there is only one "30" sequence in the object...
				var path = sc_asn1_find_tag(filePathTemplates[0].val,"04");
				if (path[0].val != 0) {
					apps.push(path[0].val);
				}
			}
		}
		return apps;
	};


	// Generic listFiles function for P15 cards, should be
	// overridden in most cases.
	// Follows P15 specs for the minimum required EFs & DFs
	this.listFiles = function(dfToPerformOperation){
		
		var response = new Object();
		
		// Sanity check
		if(dfToPerformOperation.fileFamily !="DF") {
			return "";
		}
			switch(dfToPerformOperation.fileID) {
			case this.RootID:
			case "3F00":
				// 2F01: EF.ATR D003: EF.SN D004: EF.TECH
				response = new Array("2F00", "2F01", "D003", "D004"); // 2F00 is the only mandatory file in P15
				// Now parse the contents of 2F00 to get the list of applications in the card.
				var efDir = new fileClass("2F00"); // Create a file object
				if (this.selectEfFile(efDir) == true) {; // Select if to get its info
					this.analyseFile(efDir); // Analyse its attributes
					this.readFileNow(efDir); // And read the contents
					// Now: parse the contents and extract the list of Applications in the card
					response = response.concat(this.getApplications(efDir.getContent));
				}
				break;
			default:
				response = new Array();
		}
		if ((dfToPerformOperation.fileID.substr(0,10) == "E828BD080F") || (dfToPerformOperation.fileID == "5000") ||
			dfToPerformOperation.fileID == "444620697373756572" ) {
			// The DF is a PKCS#15 DF.CIA, and shall contain (at least):
			response = new Array("5032","5031");
			// Also read the 5031 EF.DO file to get a list of all additional files in the directory
			var efDO = new fileClass("5031");
			if (this.selectEfFile(efDO) == true) {; // Select if to get its info
				this.analyseFile(efDO); // Analyse its attributes
				this.readFileNow(efDO); // And read the contents
				// Now: parse the contents and extract the list of Applications in the card
				var tempNewFiles = this.getEFDOFiles(efDO.getContent);
				var newFiles = new Array();
				// Several situations can occur: the DO files can be simple 2-byte EFs in the
				// current DF. Sometimes they are referenced by the full path ("3F0050005006" for example
				// and sometimes they are also a combination of AID (different from the current AID and EF)
				for (var i=0;i<tempNewFiles.length;i++) {
					var file = tempNewFiles[i];
					if (file.length == 4) {
						newFiles.push(file);
					} else if (file.substring(0,8) == "3F00" + dfToPerformOperation.filePath) {
						newFiles.push(file.substring(8));
					}
				}
				response = response.concat(newFiles);
			}
		}
		dfToPerformOperation.getListChildren=response;
		return response;
	};



}



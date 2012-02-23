/**
 * @author rdollet
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

// Register load:
var calypsoOSJS = true;

// Abstraction layer
function calypsoOs(cardAtr, apduPanel){

		// Overload cardOsName
		this.cardOsName = "Calypso Card";
		this.myApduPanel = apduPanel;
		this.RootID ="3F00";
		// By default try to list files recursively:
		this.supportsGetNext = true;

//	this.RootID = "315449432E494341";

		var iso7816_errors = [["6200", SC_ERROR.MEMORY_FAILURE, "State of non-volatile memory unchanged"], ["6281", SC_ERROR.MEMORY_FAILURE, "Part of returned data may be corrupted"], ["6282", SC_ERROR.CARD_CMD_FAILED, "End of file/record reached before reading Le bytes"], ["6283", SC_ERROR.CARD_CMD_FAILED, "Selected file invalidated"], ["6284", SC_ERROR.CARD_CMD_FAILED, "FCI not formatted according to ISO 7816-4"], ["6300", SC_ERROR.MEMORY_FAILURE, "State of non-volatile memory changed"], ["6381", SC_ERROR.CARD_CMD_FAILED, "File filled up by last write"], ["6581", SC_ERROR.MEMORY_FAILURE, "Memory failure"], ["6700", SC_ERROR.WRONG_LENGTH, "Wrong length"], ["6800", SC_ERROR.NO_CARD_SUPPORT, "Functions in CLA not supported"], ["6881", SC_ERROR.NO_CARD_SUPPORT, "Logical channel not supported"], ["6882", SC_ERROR.NO_CARD_SUPPORT, "Secure messaging not supported"], ["6900", SC_ERROR.NOT_ALLOWED, "Command not allowed"], ["6981", SC_ERROR.CARD_CMD_FAILED, "Command incompatible with file structure"], ["6982", SC_ERROR.SECURITY_STATUS_NOT_SATISFIED, "Security status not satisfied"], ["6983", SC_ERROR.AUTH_METHOD_BLOCKED, "Authentication method blocked"], ["6984", SC_ERROR.CARD_CMD_FAILED, "Referenced data invalidated"], ["6985", SC_ERROR.NOT_ALLOWED, "Conditions of use not satisfied"], ["6986", SC_ERROR.NOT_ALLOWED, "Command not allowed (no current EF)"], ["6987", SC_ERROR.INCORRECT_PARAMETERS, "Expected SM data objects missing"], ["6988", SC_ERROR.INCORRECT_PARAMETERS, "SM data objects incorrect"], ["6A00", SC_ERROR.INCORRECT_PARAMETERS, "Wrong parameter(s) P1-P2"], ["6A80", SC_ERROR.INCORRECT_PARAMETERS, "Incorrect parameters in the data field"], ["6A81", SC_ERROR.NO_CARD_SUPPORT, "Function not supported"], ["6A82", SC_ERROR.FILE_NOT_FOUND, "File not found"], ["6A83", SC_ERROR.RECORD_NOT_FOUND, "Record not found"], ["6A84", SC_ERROR.CARD_CMD_FAILED, "Not enough memory space in the file"], ["6A85", SC_ERROR.INCORRECT_PARAMETERS, "Lc inconsistent with TLV structure"], ["6A86", SC_ERROR.INCORRECT_PARAMETERS, "Incorrect parameters P1-P2"], ["6A87", SC_ERROR.INCORRECT_PARAMETERS, "Lc inconsistent with P1-P2"], ["6A88", SC_ERROR.DATA_OBJECT_NOT_FOUND, "Referenced data not found"], ["6B00", SC_ERROR.INCORRECT_PARAMETERS, "Wrong parameter(s) P1-P2"], ["6D00", SC_ERROR.INS_NOT_SUPPORTED, "Instruction code not supported or invalid"], ["6E00", SC_ERROR.CLASS_NOT_SUPPORTED, "Class not supported"], ["6F00", SC_ERROR.CARD_CMD_FAILED, "No precise diagnosis"], // Possibly TCOS / Micardo specific errors
	["6600", SC_ERROR.INCORRECT_PARAMETERS, "Error setting the security env"], ["66F0", SC_ERROR.INCORRECT_PARAMETERS, "No space left for padding"], ["69F0", SC_ERROR.NOT_ALLOWED, "Command not allowed"], ["6A89", SC_ERROR.FILE_ALREADY_EXISTS, "Files exists"], ["6A8A", SC_ERROR.FILE_ALREADY_EXISTS, "Application exists"]];


	/* With Calypso cards, we get a iso 7816-4 FCI only for DFs */
	var processFci = function(file,attribute){
	
		var tag;
		var taglen = "";
		var myByte;
		
		logD("processing FCI bytes: " + attribute);
		
		tagA = sc_asn1_find_tag(attribute, "83");
		tag = tagA[0];
		if (tag.val !== null && tag.taglen == 2) {
			if (tag.val != file.fileID){
				file.fileID=tag.val;
			}
		}
		tagA = sc_asn1_find_tag(attribute, "80");
		tag = tagA[0];
		if (tag.val !== null && tag.taglen >= 2) {
			logD("bytes in file:" + parseInt(tag.val, 16));
			file.size = parseInt(tag.val, 16);
		}
		if (tag.val === null) {
			tagA = sc_asn1_find_tag(attribute, "81");
			tag = tagA[0];
			if (tag.val !== null && tag.taglen >= 2) {
				logD("bytes in file:" + parseInt(tag.val, 16));
				file.size = parseInt(tag.val, 16);
			}
		}
		
		tagA = sc_asn1_find_tag(attribute, "82");
		tag = tagA[0];
		if (tag.val !== null) {
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
				logD("type: " + file.fileType);
				logD("EF structure: " + (myByte & 0x07));
			}
		}
		
		tagA = sc_asn1_find_tag(attribute, "84");
		tag = tagA[0];
		if ((tag.val !== null) && (tag.taglen > 0) && (tag.taglen <= 16)) {
			file.fileName = hexAsciiToAscii(tag.val);
			logD("File name: " + tag.val);
		}

		/* With Calypso cards, we get a iso 7816-4 FCI only for DFs */
		file.fileFamily = "DF";
		file.fileType = "DF";		

		return attribute;
		
	};

	/* Not ISO compliant:
	 */
	var processCD97Fci = function(file,attribute){
	
		var tag;
		var taglen = "";
		var myByte;
		
		logD("processing FCI bytes: " + attribute);
		/* SID/SFI: identifiant court */
		file.SFI = attribute.substr(0,2);
		/* FileType */
		switch(attribute.substr(2,2)) {
			case "01":
				file.fileFamily="DF";
				file.fileType="MF";
				break;
			case "02":
				file.fileFamily = "DF";
				file.fileType = "DF";
				break;
			case "04":
				file.fileFamily = "EF";
				switch(attribute.substr(4,2)) {
					case "01":

					case "02":
						file.fileType = "Linear EF";
						break;
					case "03":
					case "04":
						file.fileType = "Cyclic EF";
						break;
					case "08":
						file.fileType = "Counter EF";
						break;
					case "0C":
						file.fileType = "App specific EF";
						break;
					default:
						file.fileType = "Unknown";
				}
				break;
			default:
				file.fileType = "unknown";
				break;						
		}
		/* File size */
		file.recSize = parseInt(attribute.substr(6,2),16);
		file.numRec= parseInt(attribute.substr(8,2),16);

		/* Should now parse AC & Key conditions... */

		return attribute;
		
	};


	/* Calypso supports "Select File" or "Select Application" which return
	   data in two different formats: if the file is selected by its file FID,
	   then P1=00 and the data is returned in 'CD97' proprietary format. If
	   the file is selected by its name, P1=04 and the arguments are returned in
	   7816-4 FCI template format.

	 * New in this version: if "fileID" is null, then do a select Next file
	 * and populate the fileID field. Only works for cards that support this.
	 */

	this.selectFile = function(fileObject){

		var apdu = {
			cla: "94",
			ins: "A4",
			p1: "00",
			p2: "00",
			lc: "00",
			data: "",
			le: ""
		};

	 	// Select by AID? If yes, this ia a "Select Application" command.
	 	if(fileObject.fileID.length >4) {
		 	apdu.p1 = "04";
	 	} else if (fileObject.fileID.length ==0) {
			// Does not work on all calypso cards!
			apdu.p1 = "08";
			apdu.p2 = "02";
		}

		// Compute length
		apdu.lc = ("00" + (fileObject.fileID.length / 2).toString(16)).slice(-2);
		apdu.data = fileObject.fileID;
		var r = sc_transmit_apdu_dumb(apdu,this.myApduPanel);
		if (r === null) {
			return (logError("APDU transmit - Select - failed"));
		} 
		if (apdu.sw1 == "6A" && apdu.sw2 == "80" ) {
			// Some cards require P1=02 for EFs
			apdu.p1 = "02";
			var r = sc_transmit_apdu_dumb(apdu,this.myApduPanel);
			if (r === null) {
				return (logError("APDU transmit - Select - failed"));
			}
			if (apdu.sw1 == "6A" && apdu.sw2 == "80" ) {
			// And other cards need a P1=08 for DFs under the Root MF!
			apdu.p1 = "08";
			var r = sc_transmit_apdu_dumb(apdu,this.myApduPanel);
			if (r === null) {
				return (logError("APDU transmit - Select - failed"));
			}
			}

		}
		fileObject.rawFileAttribute = apdu.resp;
		// If we did a 'select Next file', this is the time to populate the FileID:
		var fileID = apdu.resp.substr(44,4);
		if (fileID=="0000") {
			this.supportsGetNext = false;
		} else {
			if (this.supportsGetNext) {fileObject.setFileID(fileID);};
		}

		r = this.check_sw(apdu.sw1, apdu.sw2);
		return (logError(r));
	};

	this.analyseFile = function(fileToAnalyse) {
		
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
	
	this.check_sw = function(sw1, sw2){
	
		var error = "";
		
		// Handle special cases here 
		if (sw1 == "6C") {
			logD("Wrong length; correct length is 0x" + sw2);
			return SC_ERROR.WRONG_LENGTH;
		}
		// Alright
		if (sw1 == "90") {
			return SC_NO_ERROR;
		}
		// Pin error
		if (sw1 == "63") {
			logD("Wrong length; correct length is 0x" + sw2);
			return SC_ERROR.PIN_CODE_INCORRECT;
		}
		
		// Use Error Array
		for (i = 0; i < iso7816_errors.length; i++) {
			if (iso7816_errors[i][0] == (sw1 + sw2)) {
				logD(iso7816_errors[i][2]);
				return iso7816_errors[i][1];
			}
		}
		
		// Don't know ?
		logD("Unknown Status word : sw1=0x" + sw1 + " sw2=0x" + sw2);
		return SC_ERROR.CARD_CMD_FAILED;
	};
	
	/* Reads a record from the indicated EF.
	   The EF must be selected (the APDU is issued for the currently selected
	   EF only).
	   Goes through all records and returns them.
	 */
	this.readRecord = function(fileToRead, responseHandler, responseHandlerParent){

		// Buf is an array of all records for the current file.
		var buf = "";
		var allRecs = new Array();
		var count;
		var recNum = 1; // Current record to get
		var r;
		var c=0;

		count = fileToRead.recSize;
		var apdu = {
			cla:"94",
			ins:"B2",
			p1: "01",
			p2: "04",
			lc:  "",
			le:  "",
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
				buf += apdu.resp;
				count -= apdu.resp.length / 2;
				if (count) {
					if (count > 128) {
						c = 128;
					} else {
					c = count;
					}
					apdu.le = ("00" + c.toString(16)).slice(-2);
					apdu.p1 = ("00" + recNum.toString(16)).slice(-2);
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
					// Have we read all records?
					allRecs[recNum]= buf;
					recNum++;
					if (recNum > fileToRead.numRec) {
						// We're done go back
						fileToRead.getContent = allRecs;
						responseHandler.success(allRecs, responseHandlerParent);
					} else {
						// Read next record
						buf = "";
						count = fileToRead.recSize;
						successLocalCallBack({
							statusWord : "0000",							dataOut : ""
						});
					}
				}
			}
			else if ((apdu.sw1 == "6C")) {
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
				// Have we read all records?
				allRecs[recNum]= buf;
				recNum++;
				if (recNum > fileToRead.numRec) {
					// We're done go back
					fileToRead.getContent = allRecs;
					responseHandler.success(allRecs, responseHandlerParent);
				} else {
					// Read next record
					buf = "";
					count = fileToRead.recSize;
					successLocalCallBack({
						statusWord : "0000",						dataOut : ""
					});
				}
			}
	};

	var failureLocalCallBack =function(cardResponse) {// We're done go back

		// Error to trace
		logError("APDU transmit - Read Record - low level error");
		
		// Still go back
		fileToRead.getContent = buf;	
		responseHandler.success(buf, responseHandlerParent);
		
	};

	var localCallBack = {
		success: successLocalCallBack,
		failure: failureLocalCallBack,
		scope:this
	};

	// Start here:
	successLocalCallBack({
		statusWord : "0000",dataOut : ""
	});

};


	// Should use trace window
	var logError = function(errorCode){
		logD("Error reported : " + errorCode);
		return(errorCode);		

	};



		// Implement 'list file' function for Calypso cards:
		// Since there is no predefined 'list files' APDU, decide
		// On the list of files depending on the DF we're in.
		//
		// DF    | Files that can exist:
		//
		// 3F00 (3MTR.ICA) -+
		//                  |- 3F04 (AID)
		//                  |- 0002 (ICC)
		//                  |- 0003 (ID)
		//                  |- 2F10 (Free)
		//                  |
		//                  |- 2000 (1TIC.ICA, '315449432E494341' )-+
		//                  |                  |- 2004 (AID)
		//                  |                  |- 2001 (Environment & Holder)
		//                  |                  |- 2010 (Event Log)
		//                  |                  |- 2050 (Contracts List)
		//                  |                  |- 2020 (Contracts)
		//                  |                  |- 2069 (Counter)
		//                  |                  |- 2040 (Special Events)

		this.listFiles = function(dfToPerformOperation){
		
			var response = new Object();

			// Sanity check
			if(dfToPerformOperation.fileFamily !="DF") {
				return "";
			}
			switch(dfToPerformOperation.fileID) {
				case "3F00":
					response = new Array("3F04","3F1C", "0002","0003","2F10","2000","2100","2200","2300","3100","1000","8000"); // hexAsciiToHex("1TIC.ICA"));
					break;
				case "2000":
				case hexAsciiToHex("1TIC.ICA"):
					response = new Array("2004","2001","2010","2050","2020","2030","202A","202B","202C","202D","2069","2040");
					break;
				case "2100":
				case hexAsciiToHex("1TIC.ICA2"):
					response = new Array("2104","2101","2110","2150","2120","2130","212A","212B","212C","212D","2169","2140");
					break;
				case "3100":
				case hexAsciiToHex("2MPP.ICA"):
					response = new Array("3104", "3101", "3102", "3113","3115","3120","3123","3133","3150");
					break;
				case "1000":
				case hexAsciiToHex("0ETP.ICA"):
					response = new Array("1004","1014","1015");
					break;
				default:
					response = new Array();
			}
			dfToPerformOperation.getListChildren=response;
			return response;
		};		
}


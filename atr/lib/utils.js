
/**
 * @author rdollet
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

// Register script:
var utilsjs = true;

var logElement;
var apduTraceElement;
var outputElement;
var dumpTraceElement;

// Wrapper to send Async APDU
function asyncExchangeAPDU(apduData){

	var cardResponse = {};
	
	var successLocalCallBack = function(cardResponse) {
		apduData.sw1 = cardResponse.statusWord.substring(0, 2);
		apduData.sw2 = cardResponse.statusWord.substring(2, 4);
		apduData.resp = cardResponse.dataOut;
	};
	var failureLocalCallBack =function(cardResponse) {
		
	};	
	var localCallBack = {
		success: successLocalCallBack,
		failure: failureLocalCallBack
	};

	
	// Call asynchronous handler
	sconnectHandler.async_transmit(	apduData.cla +
						apduData.ins +
						apduData.p1 +
						apduData.p2 +						apduData.lc +
						apduData.data +
						apduData.le, localCallBack);

}

// Wrapper to send APDU for card that respond with the data length (61 XX) and exchangeAPDU can be used
function sc_transmit_apdu(apduData, apduPanel){

	var cardResponse = {};
	try {

		// Get the current protocol used to specify it in exchangeAPDU if it is T=1, otherwise
		// there will be a failure...
		var activeProtocol = (mySConnectService.getActiveProtocol() == SCardProtocolIdentifiers.T1) ? SCardPCI.T1 : SCardPCI.T0;
		cardResponse = mySConnectService.exchangeAPDU(apduData.cla +
		apduData.ins +
		apduData.p1 +
		apduData.p2 +
		apduData.lc +
		apduData.data +
		apduData.le, activeProtocol);
		
		apduData.sw1 = cardResponse.statusWord.substring(0, 2);
		apduData.sw2 = cardResponse.statusWord.substring(2, 4);
		apduData.resp = cardResponse.dataOut;
		apduTrace(apduData,apduPanel);
		
		// Special treatment for 0x6cxx
		if ((apduData.le === "" || apduData.le == "00") && (cardResponse.statusWord.substring(0, 2) == "6C")) {
		
			// Try again
			apduData.le = cardResponse.statusWord.substring(2, 4);
			cardResponse = mySConnectService.exchangeAPDU(apduData.cla +
			apduData.ins +
			apduData.p1 +
			apduData.p2 +
			apduData.le, activeProtocol);
			
			apduData.sw1 = cardResponse.statusWord.substring(0, 2);
			apduData.sw2 = cardResponse.statusWord.substring(2, 4);
			apduData.resp = cardResponse.dataOut;
			apduTrace(apduData,apduPanel);
			
		}
	} 
	catch (e) {
		logD("Error: " + e.getMessage(),apduPanel);
		return null;
	}		
	return true;
}

// Wrapper to send APDU for cards that respond with just 90 00 and exchangeAPDU cannot be used:
// a 'get response' command has to be issued manually:
function sc_transmit_apdu_dumb(apduData,apduPanel){

	var cardResponse = {};
	try {
		
		cardResponse = mySConnectService.transmit(apduData.cla +
		apduData.ins +
		apduData.p1 +
		apduData.p2 +
		apduData.lc +
		apduData.data +
		apduData.le);
		
		apduData.sw1 = cardResponse.statusWord.substring(0, 2);
		apduData.sw2 = cardResponse.statusWord.substring(2, 4);
		apduData.resp = cardResponse.dataOut;
		apduTrace(apduData,apduPanel);
		
		if (cardResponse.statusWord == "9000") {
			// Need to manually get the data:
			var apdu = {
				cla: "00",
				ins: "C0",
				p1: "00",
				p2: "00",
				lc: "00",
				data: "",
				le: ""
			};
			cardResponse = mySConnectService.transmit(apdu.cla +
				apdu.ins +
				apdu.p1 +
				apdu.p2 +
				apdu.lc +
				apdu.data +
				apdu.le);
			apdu.sw1 = cardResponse.statusWord.substring(0, 2);
			apdu.sw2 = cardResponse.statusWord.substring(2, 4);
			apdu.resp = cardResponse.dataOut;
			apduTrace(apdu,apduPanel);
			var apdu = {
				cla: "00",
				ins: "C0",
				p1: "00",
				p2: "00",
				lc: "",
				data: "",
				le: ""
			};
			apdu.lc = cardResponse.statusWord.substring(2,4);
			cardResponse = mySConnectService.transmit(apdu.cla +
				apdu.ins +
				apdu.p1 +
				apdu.p2 +
				apdu.lc +
				apdu.data +
				apdu.le);
			apduData.sw1 = cardResponse.statusWord.substring(0, 2);
			apduData.sw2 = cardResponse.statusWord.substring(2, 4);
			apduData.resp = cardResponse.dataOut;
			apdu.sw1 = cardResponse.statusWord.substring(0, 2);
			apdu.sw2 = cardResponse.statusWord.substring(2, 4);
			apdu.resp = cardResponse.dataOut;
			apduTrace(apdu,apduPanel);
		}
	}
	catch (e) {
		logD(e.getMessage(),apduPanel);
		return null;
	}
		
	return true;
}

// Finds a tag in a structure
// If only 1 tag found returns it
// If more than 1 tag found, returns an array
// TODO: support multibyte tags, merge with ASN1 utilities ?
function sc_asn1_find_tag(data,tag){
	
		var point = 0;
		var retArray = new Array();
		var ret = {};
		ret.val = null;
		ret.taglen = 0;
		var len;
		
		
		while ( point < data.length ){
			// Detecting TAG field (Max 1 octet)
			var tag10 = parseInt( data.substr(point,2),16);
			point += 2;
			// Detecting LENGTH field (Max 2 octets)
			len = 0;
			// If our tag is 0xFF, we are past the ASN.1 structure (many cards
			// contain FF's after the end of the structure
			if (tag10 == 0xff) {
				break;
			}
			// Null Tag
			if ( tag10 == 0x5){	// Ignore NULL
				// Skip Null Tag
				point += 2;
			} else {
				if ( parseInt(data.substr(point, 2),16) & 128 ){
					var lenLength = parseInt(data.substr(point,2),16) & 127;
					if ( lenLength > 2 ){
						logD("LENGTH field is too long.(at " + point + ") This program accepts up to 2 octets of Length field.");
						return(SC_ERROR.INVALID_ASN1_OBJECT);
					}
					len = parseInt(data.substr(point+2, lenLength*2),16);
					point += lenLength*2 + 2;  
				}
				else if ( lenLength !== 0 ){  
					len = parseInt(data.substr(point,2),16);
					point += 2;
				}			
				if ( len > (data.length - point) ){
					logD("LENGTH is longer than the rest. (LENGTH: " + len + ", rest: " + data.length + ")");
					return(SC_ERROR.ASN1_END_OF_CONTENTS);
				}
			}
			// Detecting VALUE		
			var val = "";
			if ( len ){
				val = data.substr(point, len*2);
				point += len*2;
			}
			
			if(tag10 == parseInt(tag,16)) {		
				ret.val = val;
				ret.taglen = len;
				retArray.push({val: val, taglen: len});
				// return ret;
			}
	
		}
//
//		if (retArray.length < 2) {
//			return ret;
//		} else {
		if (retArray.length == 0) {
			return [{val: 0, taglen: 0}];
		}
		return retArray;
//		}
}

/*
 * Converts a hexadecimal string to a UTF8 string
 */
function hexAsciiToUTF8(myHexAscii) {
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;
 
	while ( i < myHexAscii.length ) {
 		c =  parseInt(myHexAscii.substr(i,2),16);
		if (c < 128) {
			string += String.fromCharCode(c);
			i+=2;
		}
		else if((c > 191) && (c < 224)) {
			c2 = parseInt(myHexAscii.substr(i+2,2),16);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 4;
		}
		else {
			c2 = parseInt(myHexAscii.substr(i+2,2),16);
			c3 = parseInt(myHexAscii.substr(i+4,2),16);
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 6;
		}
 	}
 	return string;
}


/*
 * Converts a hexadecimal string to a ascii string
 */
function hexAsciiToAscii(myHexAscii) {
	 
	 var iLoop;
	 var ascii = "";
	 var current; 
	 for (iLoop = 0; iLoop < ((myHexAscii.length) / 2); iLoop++) {
	 	current = parseInt(myHexAscii.substr(iLoop * 2, 2), 16);
	 	if ((current >= 0x20) && (current < 0x7f)) {
	 		ascii += String.fromCharCode(parseInt(myHexAscii.substr(iLoop * 2, 2), 16));
	 	}
	 	else {
	 		ascii += "\\x" + myHexAscii.substr(iLoop * 2, 2);
	 	}
	 }	
	return ascii;
}

/*
 * Converts a Ascii string to a hexadecimal string
 */
function hexAsciiToHex(myHexAscii) {
	var hexa = "";
	var i, n;
	for(i=0; i < myHexAscii.length; i++) {
		hexa += myHexAscii.charCodeAt(i).toString(16);
	}
	return hexa.toUpperCase();
}

function logDInit(logElement){
//	logElement
		
}

/* Outputs logging into a logging panel
 */
function logD(myData, logElement)	{
	if (logElement == null) return;
	logElement.body.insertHtml("afterBegin",myData + "<br/>");
	//logElement.innerHTML += myData + "<br/>";
}


// Does a Hex dump of the data.
// If data is an array, parses each record:
function dumpDataTrace(data,dumpTraceElement) {
	dumpTraceElement.body.update("");
	dumpH(data, 0, dumpTraceElement, 24 );
}


function dumpForceData(data, dumpTraceElement) {
	dumpTraceElement.body.update(data);

}


/* Outputs the APDU transaction into the log panel.
 * TODO: should add the meaning of the SW1/SW2 response code according
 *       to ISO7816-4
 */
function apduTrace(apduData,apduPanel)	{
	
	// Format the APDU trace.
	var myData =  apduData.cla + " " +
		apduData.ins + " " +
		apduData.p1 +
		apduData.p2 + " " +
		apduData.lc + " " +
		apduData.data + " " +
		apduData.le 
	
	apduPanel.body.insertHtml("afterBegin",
	 "Instruction :" + myData.toUpperCase() + " - Sw1-Sw2: " + apduData.sw1 + apduData.sw2 + "<br/>" +"ReceivedData:"  + apduData.resp +  "<br/>");	

}

function outPutDataInit(elementID){
	outputElement = document.getElementById(elementID);		
}

function outPutData(myData)	{
	outputElement.innerHTML += myData + "<br/>";
}

// Object cloning
function cloneObject(what) {
    for (i in what) {
        this[i] = what[i];
    }
}
// Object extension
function extendObject(extendMe, withMe){
	
	// Go through the referenceClass
	for (var i in withMe) {
		if (!(i in extendMe)) {
			extendMe[i] = withMe[i];
		}
	}
}

// Object specialization
function specializeObject(specializeMe, withMe) {

	// Go through the referenceClass
	for (var i in specializeMe) {
		if (!(i in withMe)) {
			delete specializeMe[i];
		}
	}
}

// Object cleanup
function removeObject(removeFromMe, withMe) {
	
	// Go through the referenceClass
	for (var i in withMe) {
		if(i in removeFromMe) {
			delete removeFromMe[i];
		}
	}
}


// dumpToFormat is an array, starting at index 1, with all
// elements the same length.
//
// TraceElement is the panel where the trace should go.
function dumpH (dumpToFormat, Offset, TraceElement, modulo) {

	var dumpLength = dumpToFormat[1].length / 2;
	var numberLineWith16 = Math.floor(dumpLength / modulo);
	var remainingBytes = dumpLength % modulo;
	var iLoop, iLoop2;
	var lineToDisplay;
	var lineInAscii;
	var current;
	var filler;
	var dataIndex = 1;
	
	var currentOffset = Offset;
	
	iLoop = 0;
	var dumpBlock = function(){
		if ((iLoop < numberLineWith16) && enableDump) {
			lineToDisplay = "00000000" + currentOffset.toString(16);
			lineInAscii = "|";
			lineToDisplay = lineToDisplay.substring(lineToDisplay.length - 8, lineToDisplay.length) + ":";
			if (iLoop==0) {
				TraceElement.body.insertHtml("beforeEnd", "<u>Record number: " + dataIndex + "</u><br>");
			}
			for (iLoop2 = 0; iLoop2 < modulo; iLoop2++) {
				if (!enableDump) {
					break;
				}
				current = dumpToFormat[dataIndex].substr(2 * (iLoop * modulo + iLoop2), 2);
				lineToDisplay += (" " + current);
				current = parseInt(current, 16);
				if ((current >= 0x20) && (current < 0x7f)) {
					lineInAscii += String.fromCharCode(current, 16).substr(0, 1);
				}
				else {
					lineInAscii += ".";
				}
			}
			TraceElement.body.insertHtml("beforeEnd",lineToDisplay + lineInAscii + "<br/>");
			currentOffset += modulo;
			iLoop++;
			if (enableDump) {
				setTimeout(dumpBlock, 5);
			}
		} else 	if ((remainingBytes > 0) && (iLoop == (numberLineWith16))&& (enableDump)) {
			setTimeout(dumpNonModulusLine, 5);
		}
		
	};
	
	
	var dumpNonModulusLine = function(){
			var Filler = " .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..";
			Filler = Filler.substr(0, (modulo - remainingBytes) * 3);
			lineToDisplay = "00000000" + currentOffset.toString(16);
			lineInAscii = "|";
			lineToDisplay = lineToDisplay.substring(lineToDisplay.length - 8, lineToDisplay.length) + ":";
			
			for (iLoop2 = 0; iLoop2 < remainingBytes; iLoop2++) {
				if (!enableDump) {
					break;
				}
				current = dumpToFormat[dataIndex].substr(2 * (iLoop * modulo + iLoop2), 2);
				lineToDisplay += (" " + current);
				current = parseInt(current, 16);
				if ((current >= 0x20) && (current < 0x7f)) {
					lineInAscii += String.fromCharCode(current, 16).substr(0, 1);
				}
				else {
					lineInAscii += ".";
				}
			}
			TraceElement.body.insertHtml("beforeEnd",lineToDisplay + Filler + lineInAscii + "<br/>");
			// Move on to next index:
			if (++dataIndex<dumpToFormat.length) {
				remainingBytes = dumpLength % modulo;
				currentOffset = Offset;	
				iLoop = 0;
				setTimeout(letKillTheOther,50);
			}
	};
	
	var letKillTheOther = function() {
		enableDump = true;
		setTimeout(dumpBlock, 5);									
	};

	setTimeout(letKillTheOther, 50);
}

/**
 * @author elafargue, edouard@lafargue.name
 *
 *
 * (c) 2008-2009 Edouard Lafargue
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

var mifareSmartCardJS = true;

var mySConnectService
var cardAtr;

/* MifareSmartcard
 *
 */
function mifareSmartCard(ReaderToConnectTo, apduPanel, mifareCardType){

	// Connect to the reader
	var res = null;
	try {
	  // Mifare cards are in T0... though there seems to be some instability in the (linux)
	  // pcsc layer, it seems, unless it's a problem with some reader firmware ?
 	  // The strange this is that it should be T1 according to the PCSC specs & reader docs...
	 res = mySConnectService.connect(ReaderToConnectTo,SCardAccessMode.Shared,SCardProtocolIdentifiers.T0);	} catch(e) {
		// Were we connected already?
		try {
			mySConnectService.disconnect();
			res = mySConnectService.connect(ReaderToConnectTo,SCardAccessMode.Shared,SCardProtocolIdentifiers.T0);
		} catch(e) {
			try {
				res = mySConnectService.connect(ReaderToConnectTo,SCardAccessMode.Shared,SCardProtocolIdentifiers.T1);
			} catch(e) {
				alert('Did not manage to talk to the card despite all my efforts, contact me: edouard@lafargue.name');
			}
		}	}
	// Retrieve ATR
	var scardStatus = mySConnectService.cardStatus();
	var cardAtr = scardStatus.ATR;

	// Card implementation
	var cardOS;

	var myApduPanel = apduPanel;
	var myReader = ReaderToConnectTo;	

	// Intelligent Router / (** Use Dynamic scripting from Kapil **)
	// Decision process for implementation specificites
	var implementMe = function(cardAtr){
		var cardImplementationObject;
		cardImplementationObject = new mifareOs(cardAtr,myApduPanel);
		return (cardImplementationObject);
	};

	this.mifareCardType = mifareCardType;

	// Initialize Object
	this.smartCardInitialize = function (){
		cardOS = implementMe(cardAtr);
	}

	/* Loads a keypair into a reader memory slot
	   This software uses slot 00 for key A
		and slot 1 for key B (this is arbitrary, it assumes
		that the reader has at least 2 slots for keys).

	    FF 82 20 00 06 FF FF FF FF FF FF
		     ||        ||
		   Slot      Value
	*
	* Note: it seems some readers require volatile memory storage
	*       whether others require non-volatile...
	 */
	this.loadKey = function(key_a,key_b){

		// Be nice and output the full-text errors:
		var loadErrors = new Array();
		loadErrors[0x6300] = "No information given";
		// SCM Micro used v1.07 of the PC/SC 2 spec, which
		// forgot the SW1 value in the table, and incorrectly
		// assumed that SW1=63, whereas it should be 69 !
		loadErrors[0x6382] = "Card key not supported";
		loadErrors[0x6383] = "Reader key not supported";
		loadErrors[0x6384] = "Plain transmission not supported";
		loadErrors[0x6385] = "Secured transmission not supported";
		loadErrors[0x6386] = "Volatile memory is not available";
		loadErrors[0x6387] = "Non volatile memory is not available";
		loadErrors[0x6388] = "Key number not valid";
		loadErrors[0x6389] = "Key length is not correct";
		// Omnikey actually understands the principle:
		loadErrors[0x6982] = "Card key not supported";
		loadErrors[0x6983] = "Reader key not supported";
		loadErrors[0x6984] = "Plain transmission not supported";
		loadErrors[0x6985] = "Secured transmission not supported";
		loadErrors[0x6986] = "Volatile memory is not available";
		loadErrors[0x6987] = "Non volatile memory is not available";
		loadErrors[0x6988] = "Key number not valid";
		loadErrors[0x6989] = "Key length is not correct";

		/* If myReader is a Omnikey, then the key needs to be
		 * loaded in non-volatile memory (code 0x20).
		 * If it is a SCM, on the other hand, it needs to be
		 * loaded in volatile memory (code 0x00).
		 *
	 	 * Moreover, SCM interprets P2 (key number) as the
		 * key type (mifare A or B, 0x60 or 0x61) whereas Omnikey interprets
		 * it as a key slot number... talk about standards-compliance!
		 */
		var keyStructure = "20"; // non-volatile
		var keyNumber1 = "00";
		var keyNumber2 = "01";
		if ((myReader.indexOf("SCM") != -1)||(myReader.indexOf("SDI010") !=-1)) {
			keyStructure = "00";
			keyNumber1 = "60";
			keyNumber2 = "61";
		} else if (myReader.indexOf("Gemalto") != -1) {
			// GemProx uses 0x00 to 0x0F for Key A
			// and 0x10 to 0x1F for key B
			keyNumber2 = "10";
		}

		var apdu = {
			cla: "FF",
			ins: "82",
			p1: keyStructure,
			p2: keyNumber1,
			lc: "06",
			data: key_a,
			le: ""
		};
		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return false;
		}
		if(apdu.sw1 != "90") {
			logD("Error: " + loadErrors[parseInt(apdu.sw1+apdu.sw2,16)],myApduPanel);
			return false;
		}

		var apdu = {
			cla: "FF",
			ins: "82",
			p1: keyStructure,
			p2: keyNumber2,
			lc: "06",
			data: key_b,
			le: ""
		};
		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return false;
		}
		if(apdu.sw1 != "90") {
			logD("Error: " + loadErrors[parseInt(apdu.sw1+apdu.sw2,16)],myApduPanel);
			return false;
		}

		return true;	 
	};

	/* Gets the card's UID
	 */
	this.getUID = function() {
		var apdu = {
			cla: "FF",
			ins: "CA",
			p1: "00",
			p2: "00",
			lc: "00",
			data: "",
			le: ""
		};
		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return "Error";
		}
		return apdu.resp;
	}

	/* Authenticates in the card for a given block
	   - sector: sector number
	   - block : block number
	   - key_type: "0" is key A, "1" is key B

	Returns 'true' if auth successful, 'false' otherwise

	APDU: 60 is Mifare key A
	      61 is Mifare key B
	      00 is Inside Contactless or iClass Kd
	      01 is Inside Contactless or iClass Kc
	      FF is Unknown or not necessary

	Example: Authenticate using key A and read 16 bytes:
		FF 88 00 00 60 00
		FF B0 00 00 10

	 */
	this.authenticateBlock = function(sector,block,key_type){
		// Be nice and output the full-text errors:
		var authErrors = new Array();
		authErrors[0x6300] = "No information given";
		authErrors[0x6581] = "Memory failure, addressed by P1-P2 does not exist";
		authErrors[0x6982] = "Security status not satisfied";
		authErrors[0x6983] = "Authentication cannot be done";
		authErrors[0x6984] = "Reference key now useable";
		authErrors[0x6986] = "Key type not known";
		authErrors[0x6988] = "Key number not valid";
		if (sector < 32) {
			var blockNum = sector * 4 + block;
		} else {
			// Mifare 4K
			var blockNum = 128 + (sector-32) * 16 + block;
		}
		(blockNum < 16) ? blockNum = "0" + blockNum.toString(16): blockNum = blockNum.toString(16);
		var keyType = 0x60 + parseInt(key_type);
		var key_number = "0" + key_type;
		if (myReader.indexOf("Gemalto") != -1) {
			// The GemProx implementation requires "00"
			// and the reader computes the key slot itself
			key_number = "00";
			var apdu = {
				cla: "FF",
				ins: "86",
				p1: "00",
				p2: "00",
				lc: "05",
				le: ""
			};
			apdu.data = "0100" + blockNum + keyType.toString(16) + key_number;
		} else {
			var apdu = {
				cla: "FF",
				ins: "88",
				p1: "00",
				p2: blockNum,
				lc: keyType.toString(16),
				data: key_number,
				le: ""
			};
		}
		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return false;
		}
		if(apdu.sw1 == "90") {
			return true;
		}
		logD("Error: " + authErrors[parseInt(apdu.sw1+apdu.sw2,16)],myApduPanel);
		return false;
	};
		
	/* Read binary: reads a Mifare block (16 bytes)
	 *
	 * Needs to be authenticated before (see authenticateBlock)
	 *
	 * sector  : Sector number 
	 * block   : Block number inside the sector
	 *
	 * 	FF B0 00 00 10
	 */
	this.readBinary = function(sector, block){
		var readErrors = new Array();
		readErrors[0x6281] = "Part of returned data may be corrupted";
		readErrors[0x6282] = "End of file reached before reading expected number of bytes";
		readErrors[0x6981] = "Command incompatible";
		readErrors[0x6982] = "Security status not satisfied";
		readErrors[0x6986] = "Command not allowed";
		readErrors[0x6A81] = "Function not supported";
		readErrors[0x6A82] = "File not found / Addressed block or byte does not exist";
		if (sector < 32) {
			var blockNum = sector * 4 + block;
		} else {
			// Mifare 4K
			var blockNum = 128 + (sector-32) * 16 + block;
		}
		(blockNum < 16) ? blockNum = "0" + blockNum.toString(16): blockNum = blockNum.toString(16);
		var apdu = {
			cla: "FF",
			ins: "B0",
			p1: "00",
			p2: blockNum,
			lc: "",
			data: "",
			le: "10"
		};

		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return "";
		}		
		if(apdu.sw1 != "90") {
			logD("Error: " + readErrors[parseInt(apdu.sw1+apdu.sw2,16)],myApduPanel);
			return "";
		}
		return apdu.resp;
	};

	/*
	 * Writes a Mifare card block
	 *
	 * sector  : Sector number 
	 * block   : Block number inside the sector
	 * data    : hex string containing the data to be written
	 *	     data shall be either 16 or 4 bytes long
	 *
	 * 	FF D6 ABLM ABLL 10 DATA
	 *  Where: ABLM: address block MSB (0x00)
	 *         ABLL: address block LSB (0x00 to 0xFF)
	 *
	 *  Requires a general authenticate before doing the operation.
	 *
	 * Note for UL cards: when using a GemProx-DU reader, only the first 4
	 * bytes are written (one page), we follow the recommendations and set the
	 * remaining bytes to zero
	 */
	this.updateBinary = function(sector, block, data){
		var readErrors = new Array();
		readErrors[0x6281] = "Part of returned data may be corrupted";
		readErrors[0x6282] = "End of file reached before reading expected number of bytes";
		readErrors[0x6981] = "Command incompatible";
		readErrors[0x6982] = "Security status not satisfied";
		readErrors[0x6986] = "Command not allowed";
		readErrors[0x6A81] = "Function not supported";
		readErrors[0x6A82] = "File not found / Addressed block or byte does not exist";
		if (sector < 32) {
			var blockNum = sector * 4 + block;
		} else {
			// Mifare 4K
			var blockNum = 128 + (sector-32) * 16 + block;
		}
		(blockNum < 16) ? blockNum = "0" + blockNum.toString(16): blockNum = blockNum.toString(16);
		switch (data.length) {
			case 32:
				break;
			case 8:
				data = data + "000000000000000000000000";
				break;
			default:
				logD("Error: data length incorrect, aborting", myApduPanel);
				return false;
		}
		var apdu = {
			cla: "FF",
			ins: "D6",
			p1: "00",
			p2: blockNum,
			lc: "10",
			data: data,
			le: ""
		};

		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return false;
		}		
		if(apdu.sw1 != "90") {
			logD("Error: " + readErrors[parseInt(apdu.sw1+apdu.sw2,16)],myApduPanel);
			return false;
		}
		return true;
	};

	/* Reads a card page (Mifare Ultralight only)
	 * A page is 4 bytes long, but some readers require larger minimum read sizes.
	 * for this reason, we initialize "le" to "00" and just get the 4 first bytes.
	 */
	this.readPage = function(page) {
		var readErrors = new Array();
		readErrors[0x6281] = "Part of returned data may be corrupted";
		readErrors[0x6282] = "End of file reached before reading expected number of bytes";
		readErrors[0x6981] = "Command incompatible";
		readErrors[0x6982] = "Security status not satisfied";
		readErrors[0x6986] = "Command not allowed";
		readErrors[0x6A81] = "Function not supported";
		readErrors[0x6A82] = "File not found / Addressed block or byte does not exist";
		page = "0" + page.toString(16);
		var apdu = {
			cla: "FF",
			ins: "B0",
			p1: "00",
			p2: page,
			lc: "",
			data: "",
			le: "00"
		};
		var r = sc_transmit_apdu(apdu,myApduPanel);
		if (r === null) {
			logD("APDU transmit failed",myApduPanel);
			return "";
		}
		if(apdu.sw1 != "90") {
			logD("Error: " + readErrors[parseInt(apdu.sw1+apdu.sw2,16)],myApduPanel);
			return "";
		}
		return apdu.resp.substr(0,8);
	};

	/*
	 * Decodes a sector trailer into a table of access rights.
	 *
	 * Either I'm dumb, or there is no logical way to compute access
	 * rights from the value, except by a lookup into a static access
	 * right table, hence the big HTML human-readable arrays below.
	 *
	 * Trailer is a hex string (16 bytes, i.e. 32 hex characters)
	 */
	this.decodeTrailer= function(trailer) {

		var trailerReadableTable = [
			"<td>never</td><td>key A</td><td>key A</td><td>never</td><td>key A</td><td>key A</td><td>Key B may be read</td>",
			"<td>never</td><td>key A</td><td>key A</td><td>key A</td><td>key A</td><td>key A</td><td>Key B may be read,transport configuration</td>",
			"<td>never</td><td>never</td><td>key A</td><td>never</td><td>key A</td><td>never</td><td>Key B may be read</td>",
			"<td>never</td><td>key B</td><td>key A|B</td><td>key B</td><td>never</td><td>key B</td><td></td>",
			"<td>never</td><td>key B</td><td>key A|B</td><td>never</td><td>never</td><td>key B</td><td></td>",
			"<td>never</td><td>never</td><td>key A|B</td><td>key B</td><td>never</td><td>never</td><td></td>",
			"<td>never</td><td>never</td><td>key A|B</td><td>never</td><td>never</td><td>never</td><td></td>",
			"<td>never</td><td>never</td><td>key A|B</td><td>never</td><td>never</td><td>never</td><td></td>"];

		var blockReadableTable = [
			"<td>Key A|B</td><td>Key A|B</td><td>Key A|B</td><td>Key A|B</td><td>Transport configuration</td>",
			"<td>Key A|B</td><td>never</td><td>never</td><td>Key A|B</td><td>Value block</td>",
			"<td>Key A|B</td><td>never</td><td>never</td><td>never</td><td>read/write block</td>",
			"<td>Key B</td><td>Key B</td><td>never</td><td>never</td><td>read/write block</td>",
			"<td>Key A|B</td><td>Key B</td><td>never</td><td>never</td><td>read/write block</td>",
			"<td>Key B</td><td>never</td><td>never</td><td>never</td><td>read/write block</td>",
			"<td>Key A|B</td><td>Key B</td><td>Key B</td><td>Key A|B</td><td>Value block</td>",
			"<td>never</td><td>never</td><td>never</td><td>never</td><td>read/write block</td"];

		// We won't check the validity of inverted bits in the trailer, we'll just
		// isolate the actual values. I'm not inspired and a bad codewriter, but at least
		// this should work: if anyone has a better idea, be my guest (and please share)
		var b7 = parseInt(trailer.substr(14,2),16);
		var b8 = parseInt(trailer.substr(16,2),16);
		var b0acl = ((b7 & 0x10) >>> 2) +((b8 & 0x1) << 1) +((b8 & 0x10) >>> 4);
		var b1acl = ((b7 & 0x20) >>> 3) +((b8 & 0x2 )) + ((b8 & 0x20) >>> 5);
		var b2acl = ((b7 & 0x40) >>> 4) + ((b8 & 0x4) >>> 1) + ((b8 & 0x40) >>> 6);
		var b3acl = ((b7 & 0x80) >>> 5) + ((b8 & 0x8) >>> 2) + ((b8 & 0x80) >>> 7);

		var aclTable = "<table class='mifareACLTable'><tr><th colspan=2></th><th colspan=4>Access Condition for</th><th></th></tr><tr><th>Block number</th><th>ACL</th><th>Read</th><th>Write</th><th>Increment</th><th>Decrement,<br>transfer,<br>restore</th><th>Remark</th></tr>";
		aclTable += "<tr><td>Block 0</td><td>" + b0acl.toString(2) + "</td>" + blockReadableTable[b0acl] + "</tr>";
		aclTable += "<tr><td>Block 1</td><td>" + b1acl.toString(2) + "</td>" + blockReadableTable[b1acl] + "</tr>";
		aclTable += "<tr><td>Block 2</td><td>" + b2acl.toString(2) + "</td>" + blockReadableTable[b2acl] + "</tr></table>";
		aclTable += "<br><table class='mifareACLTable'><tr><th rowspan=3>Trailer<br>Access bits<br>value</th><th colspan=6>Access Condition for</th><th rowspan=3>Remark</th></tr>";
		aclTable += "<tr><th colspan=2>Key A</th><th colspan=2>Access bits</th><th colspan=2>Key B</th>";
		aclTable += "<tr><th>read</th><th>write</th><th>read</th><th>write</th><th>read</th><th>write</th>";
		aclTable += "<tr><td>" + b3acl.toString(2) + "</td>" + trailerReadableTable[b3acl] + "</tr></table>";
		aclTable += "<br><b>Note:</b>If Key B may be read in the corresponding Sector Trailer it cannot serve for authentication.<br><b>Consequence:</b> If the Reader tries to authenticate any block of such a sector with key B, the card will refuse any subsequent memory access after authentication.";

		return aclTable;
	};
}


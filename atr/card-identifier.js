/*
 * These utilities do ATR parsing for many types of ATR, including
 * PCSC 2.0 Contactless ATR parsing
 *
 * (c) Edouard Lafargue 2008, edouard@lafargue.name
 * Based on original work by Ludovic Rousseau
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 * Version 2 (June 1991).
 */

var counter = 1;
var T = 0;
var atr = "";
var ts = new Array();
ts[0x3B] = "Direct Convention";
ts[0x3F] = "Inverse Convention";
var Fi = [372, 372, 558, 744, 1116, 1488, 1860, "RFU", "RFU", 512, 768, 1024, 1536, 2048, "RFU", "RFU"];
var Di = ["RFU", 1, 2, 4, 8, 16, 32, "RFU", 12, 20, "RFU", "RFU", "RFU", "RFU", "RFU", "RFU"];
var XI = ["not supported", "state L", "state H", "no preference"];
var UI = ["A only (5V)", "B only (3V)", "A and B", "RFU"];

function Hex(dec) {
	var hexa = "0123456789ABCDEF";
	var hex = "";
	while (dec > 15) {
		t = dec - (Math.floor(dec / 16)) * 16;
		hex = hexa.charAt(t) + hex;
		dec = Math.floor(dec / 16);
	}
	hex = hexa.charAt(dec) + hex;
	if (hex == 0) {
		return "00"
	}
	return hex;
}

/*
 * Reads card info from the hidden "carddb" inner frame
 */
function getCard(atr) {
	// cross-browser method to get access a inner frame DOM element
	var oIframe = document.getElementById('carddb');
	var oDoc = (oIframe.contentWindow || oIframe.contentDocument);
	if (oDoc.document) {
		oDoc = oDoc.document;
	}
	var atr_list = oDoc.getElementsByTagName('p');
	for (candidate in atr_list) {
		var el = $(atr_list[candidate]);
		var pattern = el.text();
		if (atr.match(pattern)) {
			// we found the atr
			// build result
			var card = {
				"dummy" : ""
			}
			//var namediv = el.parentNode.nextSibling.nextSibling
			var namediv = $(el).parent().next();
			card["name"] = namediv.html();
			try {
				// this may not be present
				var nxt = namediv.next();
				card["xplorer"] = nxt.text();
			} catch (e) {}
			return card;
		}
	}
	return undefined
}

/*
 * Parses an ATR: called when a 'click' event is generated, the ATR
 * is available in options.atr
 */
function ParseATR(event, target, options) {
	result = "ATR: <tt>" + options.atr + "</tt><br>";
	
	// Convert the ATR into a byte array, easier to parse:
	atr = SConnect.TypeUtils.hexStringToByteArray(options.atr);
	counter = 1;
	// Get TS value:
	ats = atr.shift();
	result += "TS: " + Hex(ats) + " (" + ts[ats] + ")<br>";
	
	// analyse T0:
	t0 = atr.shift();
	result += "T0: " + Hex(t0);
	Y1 = t0 >> 4;
	result += " Y(1): " + Y1;
	K = t0 % 16;
	result += " K: " + K + " (historical bytes)<br>";
	
	if (Y1 & 0x01) {
		// analyse TA
		result += analyse_ta(atr);
	}
	
	if (Y1 & 0x02) {
		// analyse TB
		result += analyse_tb(atr);
	}
	if (Y1 & 0x04) {
		// analyse TC
		result += analyse_tc(atr);
	}
	if (Y1 & 0x08) {
		// analyse TD
		result += analyse_td(atr);
	}
	
	// TCK is present?
	TCK = '';
	if (atr.length == (K + 1)) {
		// expected TCK
		tck_e = atr.pop();
		//calculated TCK
		tck_c = 0;
		atr2 = SConnect.TypeUtils.hexStringToByteArray(cardATR);
		for (i = 1; i < atr2.length; i++) {
			tck_c ^= atr2[i];
		}
		TCK += "<br>---<br>Checksum: " + Hex(tck_e);
		if (tck_c == 0) {
			TCK += " (correct checksum)";
		} else {
			TCK += " WRONG CHECKSUM, expected " + Hex(tck_e^tck_c);
		}
	}
	
	result += " + Historical bytes: <tt>" + SConnect.TypeUtils.byteArrayToHexString(atr) + "</tt><br>";
	if (atr.length + 1 < K) {
		result += " ERROR! ATR is truncated: " + (K - atr.length - 1) + " byte(s) is/are missing<br>";
	}
	result += analyse_historical_bytes(atr);
	result += TCK;
	
	var el = Ext.get('atrParse');
	el.update(result);
	
	// Check if the card ATR is known
	var card = getCard(options.atr)
		var cardInfoEl = Ext.get('cardInfo');
	if (card) {
		cardInfoEl.update(card.name);
		if (card.xplorer) {
			// Load the Explorer
			var xplo = Ext.get("xPlorer").getUpdater();
			xplo.loadScripts = true;
			xplo.update({
				url : card.xplorer,
				scripts : true,
				method : 'get',
				atr : options.atr,
				reader : options.reader,
				callback : function (el, success, response, options) {
					// Need the settimeout for IE compatibility
					var startE = function () {
						start_explorer(options.reader, options.atr);
					}
					setTimeout(startE, 100);
				}
			});
		}
	} else {
		cardInfoEl.update("Unknown card");
	}
}

function analyse_ta(atr) {
	result = "";
	value = atr.shift();
	result += "TA(" + counter + ")=" + Hex(value) + " --> ";
	// decode TA1
	if (counter == 1) {
		F = value >> 4;
		D = value % 16;
		(Di[D] != "RFU") ? value = Fi[F] / Di[D] : '';
		result += " Fi=" + Fi[F] + ", Di=" + Di[D] + ", " + value + " cycles/ETU";
		result += " (" + 3571200 / value + "bits/s at 3.57 MHz)<br>";
	}
	if (counter == 2) {
		F = value >> 4;
		D = value % 16;
		result += " Protocol to be used in spec mode: T=" + D;
		if (F & 0x8) {
			result += " - Unable to change<br>";
		} else {
			print += " - Capable to change<br>";
		}
		if (F & 0x1) {
			result += " - implicity defined<br>";
		} else {
			result += " - defined by interface bytes<br>";
		}
	}
	if (counter >= 3) {
		if (T == 1) {
			result += "IFSC: " + value + "<br>\n";
		} else {
			/* T <> 1 */
			F = value >> 6;
			D = value % 64;
			Cl = "(3G) ";
			
			if (D & 0x1)
				Cl += "A 5V ";
			if (D & 0x2)
				Cl += "B 3V ";
			if (D & 0x4)
				Cl += "C 1.8V ";
			if (D & 0x8)
				Cl += "D RFU ";
			if (D & 0x10)
				Cl += "E RFU";
			
			result += "Clock stop: " + XI[F] + " - Class accepted by the card: " + Cl + "<br>";
		}
		
	}
	return result;
}

function analyse_tb(atr) {
	
	result = "";
	value = atr.shift();
	result += "<br>  TB(" + counter + ") = " + Hex(value) + " --> ";
	
	I = value >> 5;
	PI = value % 32;
	
	if (counter == 1) {
		if (PI == 0) {
			result += "VPP is not electrically connected";
		} else {
			result += "Programming Param P: " + PI + " Volts, I: " + I + " milliamperes";
		}
	}
	
	if (counter == 2) {
		result += "Programming param PI2 (PI1 should be ignored): ";
		if ((value > 49) || (value < 251)) {
			result += value + " (dV)";
		} else {
			result += value + " is RFU";
		}
	}
	
	if (counter >= 3) {
		if (T == 1) {
			BWI = value >> 4;
			CWI = value % 16;
			
			result += "Block Waiting Integer: " + BWI + " - Character Waiting Integer: " + CWI;
		}
	}
	return result;
}

function analyse_tc(atr) {
	
	value = atr.shift();
	result = "<br>  TC(" + counter + ") = " + Hex(value) + " --> ";
	
	if (counter == 1) {
		result += "Extra guard time: " + value;
		if (value == 255)
			result += " (special value)";
	}
	
	if (counter == 2) {
		result += "Work waiting time: 960 x " + value + " x (Fi/F)";
	}
	
	if (counter >= 3) {
		if (T == 1) {
			result += "Error detection code: ";
			if (value == 1) {
				result += "CRC";
			} else if (value == 0) {
				result += "LRC";
			} else {
				result += "RFU";
			}
		}
	}
	
	return result + "<br>";
}

function analyse_td(atr) {
	
	value = atr.shift();
	result = "";
	
	Y = value >> 4;
	T = value % 16;
	
	result += "  TD(" + counter + ") = " + Hex(value) + " --> Y(i+1) = " + Y + " Protocol T=" + T;
	if (T == 15) {
		result += " - Global interface bytes following";
	}
	
	counter++;
	result += "<br>-----<br>";
	
	if (atr.length == 0)
		return result;
	if (Y & 0x1)
		result += analyse_ta(atr);
	
	if (atr.length == 0)
		return result;
	if (Y & 0x2)
		result += analyse_tb(atr);
	
	if (atr.length == 0)
		return result;
	if (Y & 0x4)
		result += analyse_tc(atr);
	
	if (atr.length == 0)
		return result;
	if (Y & 0x8)
		result += analyse_td(atr);
	
	return result;
}

function analyse_historical_bytes(atr) {
	hb_category = atr.shift();
	
	// return if we have NO historical bytes
	if (hb_category == null)
		return;
	
	result = "  Category indicator byte: " + Hex(hb_category);
	
	switch (hb_category) {
	case 00:
		result += " (compact TLV data object)<br>";
		if (atr.length < 3) {
			result += "    Error in the ATR: expecting 3 bytes and got " + atr.length + "<br>";
			break;
		}
		
		var status = new Array();
		// get the 3 last bytes
		for (i = 0; i < 3; i++) {
			status[2 - i] = atr.pop();
		}
		while (atr.length) {
			result += compact_tlv(atr);
		}
		lcs = status.shift();
		sw1 = status.shift();
		sw2 = status.shift();
		result += "    Mandatory status indicator (3 last bytes)<br>\n";
		result += "      LCS (life card cycle): " + Hex(lcs) + "<br>";
		result += "      SW: " + Hex(sw1) + " " + Hex(sw2) + "<br>";
		break;
		
	case 0x80:
		result += " (compact TLV data object) <br>";
		result += "<ul>";
		while (atr.length)
			result += compact_tlv(atr);
		result += "</ul>";
		break;
		
	case 0x10:
		result += " (next byte is the DIR data reference)<br>";
		data_ref = atr.shift();
		rsult += "   DIR data reference: " + Hex(data_ref) + "<br>\n";
		break;
		
	case 0x81:
	case 0x82:
	case 0x83:
	case 0x84:
	case 0x85:
	case 0x86:
	case 0x87:
	case 0x88:
	case 0x89:
	case 0x8A:
	case 0x8B:
	case 0x8C:
	case 0x8D:
	case 0x8E:
	case 0x8F:
		result += " (Reserved for futur use)\n";
		break;
	default:
		result += " (proprietary format)\n";
	}
	return result;
}

function compact_tlv(atr) {
	tlv = atr.shift();
	
	// the TLV _may_ be present
	if (tlv == '')
		return;
	
	tag = tlv >> 4;
	len = tlv % 16;
	
	result = "<li>Tag: " + tag + ", len: " + len;
	
	switch (tag) {
		
	case 0x1:
		result += " (country code, ISO 3166-1)<br>";
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Country code: " + data.substring(0, len * 2) + "<br>";
		atr.splice(0, len);
		break;
		
	case 0x2:
		result += " (issuer identification number, ISO 7812-1)<br>";
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Issuer identification number: " + data.substring(0, len * 2) + "<br>";
		atr.splice(0, len);
		break;
		
	case 0x3:
		cs = atr.shift();
		result += " (card service data byte)<br>";
		if (cs == '') {
			result += "      Error in the ATR: expecting 1 byte and got 0<br>";
			break;
		}
		result += "      Card service data byte: " + Hex(cs) + "<br>"
		result += cs_parse(cs);
		break;
		
	case 0x4:
		
		result += " (initial access data)<br>";
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Initial access data: <tt>" + data.substring(0, len * 2) + "</tt><br>";
		/* if len = F, then the contents are application Identifier data */
		if (len == 0xF)
			result += aid_parse(atr);
		break;
	case 0x5:
		result += " (card issuer data)<br>";
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Card issuer data: <tt>" + data.substring(0, len * 2) + "</tt><br>";
		result += "       -> this information is specific to the card issuer and cannot be parsed as such.<br>";
		atr.splice(0, len);
		break;
		
	case 0x6:
		result += " (pre-issuing data)<br>";
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Data: <tt>" + data.substring(0, len * 2) + "</tt><br>";
		atr.splice(0, len);
		break;
		
	case 0x7:
		result += " (card capabilities)<br>";
		switch (len) {
		case 0x1:
			/*
			/1/ && do{
			my $sm = shift @object;
			print "      Selection methods: $sm\n";
			sm($sm);
			last;
			};
			 */
			break;
		case 0x2:
			
			/*
			/2/ && do{
			my $sm = shift @object;
			my $dc = shift @object;
			print "      Selection methods: $sm\n";
			sm($sm);
			print "      Data coding byte: $dc\n";
			dc($dc);
			last;
			};
			 */
			break;
		case 0x3:
			/*
			/3/ && do{
			my $sm = shift @object;
			my $dc = shift @object;
			my $cc = shift @object;
			print "      Selection methods: $sm\n";
			sm($sm);
			print "      Data coding byte: $dc\n";
			dc($dc);
			print "      Command chaining, length fields and logical channels: $cc\n";
			cc($cc);
			last;
			};
			 */
			break;
		default:
			/*
			print "      wrong ATR\n";
			 */
			
		}
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Value: <tt>" + data.substring(0, len * 2) + "</tt><br>";
		atr.splice(0, len);
		break;
		
	case 0x8:
		result += " (status indicator)<br>";
		switch (len) {
		case 0x1:
			lcs = atr.shift();
			result += "      LCS (life card cycle): " + Hex(lcs) + "<br>";
			break;
		case 0x2:
			sw1 = atr.shift();
			sw2 = atr.shift();
			result += "      SW: " + Hex(sw1) + " " + Hex(sw2) + "<br>";
			break;
			
		case 0x3:
			lcs = atr.shift();
			sw1 = atr.shift();
			sw2 = atr.shift();
			result += "      LCS (life card cycle): " + Hex(lcs) + " ()<br>";
			result += "      SW: " + Hex(sw1) + " " + Hex(sw2) + "<br>";
			break;
		}
		break;
		/*
		case 0xF:
		print " (application identifier)\n";
		print "      Application identifier: " . (join ' ', splice @object, 0, hex $len) . "\n";
		last;
		};
		 */
	default:
		result += " (unknown)<br>\n";
		data = SConnect.TypeUtils.byteArrayToHexString(atr);
		result += "      Value: <tt>" + data.substring(0, len * 2) + "</tt><br>";
		atr.splice(0, len);
	}
	
	return result;
}

/*
# see table 86 -- First software function table (selection methods),
# page 60 of ISO 7816-4
 */
function sm(value) {
	/*
	# convert in a list of 0 or 1
	my @sm = split //, unpack ("B32", pack ("N", hex shift));
	
	# remove the 24 first bits
	splice @sm, 0, 24;
	
	print "        - DF selection by full DF name\n" if shift @sm;
	print "        - DF selection by partial DF name\n" if shift @sm;
	print "        - DF selection by path\n" if shift @sm;
	print "        - DF selection by file identifier\n" if shift @sm;
	print "        - Implicit DF selection\n" if shift @sm;
	print "        - Short EF identifier supported\n" if shift @sm;
	print "        - Record number supported\n" if shift @sm;
	print "        - Record identifier supported\n" if shift @sm;
	 */
}

function aid_parse(atr) {
	/* From PCSC3 v2_01_04_sup */
	len = atr.shift();
	rid = new Array();
	SS = ["No information given", "ISO 14443 A, part 1", "ISO 14443 A, part 2", "ISO 14443 A, part 3", "RFU",
		"ISO 14443 B, part 1", "ISO 14443 B, part 2", "ISO 14443 B, part 3", "RFU",
		"ISO 15693, part 1", "ISO 15693, part 2", "ISO 15693, part 3", "ISO 15693, part 4",
		"Contact (7816-10) I2C", "Contact (7816-10) Extended I2C", "Contact (7816-10) 2WBP", "Contact (7816-10) 3WBP"];
	NN = ["Invalid", "Mifare Standard 1K", "Mifare Standard 4K", "Mifare Ultralight", "SLE5RR_XXXX",
		"Invalid?", "SRI 176", "SRIX4K", "AT88RF020", "AT88SC0204CRF", "AT88SC0808CRF", "AT88SC1616CRF", "AT88SC3216CRF", "AT88SC6416CRF", "SRF55V10P", "SRF55V02P", "SRF55V10S", "SRF55V02S", "TAG_IT", "LRI512", "ICODESLI", "TEMPSENS", "I.CODE1", "PicoPass 2K", "PicoPass 2KS", "PicoPass 16K", "PicoPass 16Ks", "PicoPass 16K(8x2)", "PicoPass 16KS(8x2)", "PicoPass 32KS(16+16)", "PicoPass 32KS(16+8x2)", "PicoPass 32KS(8x2+16)", "PicoPass 32KS(8x2+8x2)", "LRI64", "I.CODE UID", "I.CODE EPC", "LRI12", "LRI128", "Mifare Mini"];
	
	for (i = 0; i < 5; i++) {
		rid[i] = atr.shift();
	}
	str_rid = SConnect.TypeUtils.byteArrayToHexString(rid);
	switch (str_rid) {
	case "a000000306":
		result = "RID: A000000306: PC/SC Workgroup<br>";
		SSindex = atr.shift(); // Card name
		result += "SS: " + Hex(SSindex) + " -> " + SS[SSindex] + " (card standard)<br>";
		NNindex = atr.shift() + atr.shift();
		result += "NN: " + Hex(NNindex) + " -> " + NN[NNindex] + " (card name)<br>";
	}
	atr.splice(0, len - 8);
	return result;
}

/* see table 85 -- Card service data byte, page 59 of ISO 7816-4 */
function cs_parse(csbyte) {
	
	result = "";
	if (cs & 0x80)
		result += "        - Application selection: by full DF name<br>";
	if (cs & 0x40)
		result += "        - Application selection: by partial DF name<br>";
	if (cs & 0x20)
		result += "        - BER-TLV data objects available in EF.DIR<br>";
	if (cs & 0x10)
		result += "        - BER-TLV data objects available in EF.ATR<br>";
	
	v = cs & 0xE;
	result += "        - EF.DIR and EF.ATR access services: ";
	switch (v) {
	case 8:
		result += "by READ BINARY command<br>";
		break;
	case 0:
		result += "by GET RECORD(s) command<br>";
		break;
	case 4:
		result += "by GET DATA command<br>";
		break;
	default:
		result += "reserved for future use";
	}
	
	if (cs & 0x1) {
		result += "        - Card without MF<br>";
	} else {
		result += "        - Card with MF<br>";
	}
	return result;
}

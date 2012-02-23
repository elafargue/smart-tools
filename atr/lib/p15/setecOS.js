/**
 * @author rdollet
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */
// Abstraction layer

var setecOSJS = true;

function setecOs(cardAtr, apduPanel){

		// Route on 7816 implementation
		var ops7816 = new iso7816(apduPanel);
		var	ops7816Result;
		
		// Overload cardOsName
		this.cardOsName = "setecOs 441";
		this.myApduPanel = apduPanel;

		// Overload Analyse File for Tag 82 with SetCos 441
		this.analyseFile = function(fileToAnalyse) {
			ops7816Result = ops7816.analyseFile(fileToAnalyse);
			if(ops7816Result.length > 4) {
					tag = sc_asn1_find_tag(ops7816Result, "82");
					if (tag[0].val == "11") {
							fileToAnalyse.fileFamily = "EF";
							fileToAnalyse.fileType = "internal EF";
					}
			} else {
				return(ops7816Result);
			}
			
		};	
		
		// SetCos implement 'list file' function
		this.listFiles = function(dfToPerformOperation){
			
			var response = new Object();
			
			// Sanity check
			if(dfToPerformOperation.fileFamily !="DF") {
				return "";
			}
			var apdu = {
				cla: "80",
				ins: "AA",
				p1: "00",
				p2: "00",
				lc: "00",
				data: "",
				le: ""
			}		
			var r = sc_transmit_apdu(apdu, this.myApduPanel);
			if (r === false) {
				return (SC_FUNC_RETURN("APDU transmit - Select - failed"));
			}	
			if ((apdu.sw1 == "6A") && (apdu.sw2 == "82")) {
				return true; //no files found 
			}
			if (apdu.resplen === 0) {
				return (ops7816.iso7816_check_sw(apdu.sw1, apdu.sw2));
			}
					
			// Format the response 
			for(var i=0; i < (apdu.resp.length/4); i++) {
				response[i]= apdu.resp.substr(i*4 ,4);
			}						
			dfToPerformOperation.getListChildren=response;
			return response;
		};
		
}

// Inherit from 7816
setecOs.prototype = new iso7816();


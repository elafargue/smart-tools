/**
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */
// Abstraction layer

var iasEccOSJS = true;

function iasEccOs(cardAtr, apduPanel){

		// Route on 7816 implementation
		var ops7816 = new iso7816(apduPanel);
		var	ops7816Result;
		
		// Overload cardOsName
		this.cardOsName = "IAS ECC";
		this.myApduPanel = apduPanel;

		// Overload Analyse File for Tag 82 with IAS Premium cards
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
		
}

// Inherit from 7816
iasEccOs.prototype = new iso7816();


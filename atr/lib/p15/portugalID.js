/**
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */
// Abstraction layer

var portugalIDJS = true;

function portugalID(cardAtr, apduPanel){

		// Route on 7816 implementation
		var ops7816 = new iso7816(apduPanel);
		var ops7816Result;
		
		// Overload cardOsName
		this.cardOsName = "IAS portugal Applet";
		this.myApduPanel = apduPanel;

		this.RootID ="604632FF000002";

		// Overload Analyse File for Tag 82 with SetCos 441
		this.analyseFile = function(fileToAnalyse) {
			if (fileToAnalyse.fileID == "604632FF000002") {
				// This is the start of the select
				fileToAnalyse.fileFamily = "DF";
				fileToAnalyse.fileType = "DF";
				return;
			}
			if (fileToAnalyse.fileID == "444620697373756572") {
				// Somehow it is not recognized as a DF...
				fileToAnalyse.fileFamily = "DF";
				fileToAnalyse.fileType = "DF";
				return;
			}
			ops7816Result = ops7816.analyseFile(fileToAnalyse);
			if(ops7816Result.length > 4) {
					// GemSafe specific:
					tag = sc_asn1_find_tag(ops7816Result, "84");
					if (tag[0].taglen > 0) {
							// Tag 84 exists only for DFs in GemSafe:
							fileToAnalyse.fileFamily = "DF";
							fileToAnalyse.fileType = "DF";
					}
			} else {
				return(ops7816Result);
			}
			
		};	
				
}

// Inherit from 7816
portugalID.prototype = new iso7816();


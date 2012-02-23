/**
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 *
 * All data taken from Intercode2 spec available at:
 *   http://billettique.fr/spip.php?rubrique20
 *
 * Version 20090903: Added Special Event structures.
 */

// Register load:
var intercode2JS = true;

// Decodes intercode2 structures coded in bit-aligned PER
// We initialize all the tables there too
function Intercode2(){

// Todo: should code the types in those arrays, to simplify decoding of the
// structures.

	// Contract List
	// TODO: hardcoded to 2 BestContracts, in practice the number or bestcontracts
	// is in the first field ("BestContracts")
	this.contractsList = [
		["BestContracts",4],
		["BestContract",3, [
			["BestContractNetworkId",24],
			["BestContractTariff",16], // Actually made up of three parts (page 10 Intercode2 spec)
			["BestContractPointer",5]
			]
		],
		["BestContract",3, [
			["BestContractNetworkId",24],
			["BestContractTariff",16],
			["BestContractPointer",5]
			]
		]
	];

	// Special Events List - not found on the cards I have.
	// TODO: hardcoded to 3 Special events max
	this.specialEventsList = [
		["SpecialEventNumber",4],
		["SpecialEvent",3,[
			["SpecialEventNetworkId", 24],
			["SpecialEventProvider",8],
			["SpecialEventSeriousness",2],
			["SpecialEventPointer",5]
			]
		],
		["SpecialEvent",3,[
			["SpecialEventNetworkId", 24],
			["SpecialEventProvider",8],
			["SpecialEventSeriousness",2],
			["SpecialEventPointer",5]
			]
		],
		["SpecialEvent",3,[
			["SpecialEventNetworkId", 24],
			["SpecialEventProvider",8],
			["SpecialEventSeriousness",2],
			["SpecialEventPointer",5]
			]
		]
	];

	// Environment
	this.environmentFields = [
		["EnvApplicationVersionNumber",6],
		["GeneralBitmap",7, [
			["EnvNetworkId", 24],
			["EnvApplicationIssuerId",8],
			["EnvApplicationValidityEndDate",14],
			["EnvPayMethod",11],
			["EnvAuthenticator",16],
			["EnvSelectList",32],
			["EnvData",2,[
				["EnvDataCardStatus",1],
				["EnvData2",-1] // NOTE: length is actually free, so I cannot parse it without further
					       // knowledge of the operator's rules, fortunately it is absent in
					       // All the cards I have at the moment...
			]]
		]]
	];

	// Holder information
	// Does not include the general bitmap which is at the start of the structure
	this.holderFields = [
		["HolderName",2,[
			["HolderSurname",85],
			["HolderForename",85]]],
		["HolderBirth",2,[
			["HolderBirthDate",32],
			["HolderBirthPlace",115]]],
		["HolderBirthName",85],
		["HolderIdNumber",32],
		["HolderCountryAlpha",24],
		["HolderCompany",32],
		["HolderProfiles",4,[
			["HolderProfileBitmap",3,[
				["HolderNetworkId",24],
				["HolderProfileNumber",8],
				["HolderProfileDate",14]]],
			["HolderProfileBitmap",3,[
				["HolderNetworkId",24],
				["HolderProfileNumber",8],
				["HolderProfileDate",14]]],
			["HolderProfileBitmap",3,[
				["HolderNetworkId",24],
				["HolderProfileNumber",8],
				["HolderProfileDate",14]]],
			["HolderProfileBitmap",3,[
				["HolderNetworkId",24],
				["HolderProfileNumber",8],
				["HolderProfileDate",14]]]
		]],
		["HolderData",12,[
			["HolderDataCardStatus",4],
			["HolderDataTeleReglement",4],
			["HolderDataResidence",17],
			["HolderDataCommercialID",6],
			["HolderDataWorkPlace",17],
			["HolderDataStudyPlace",17],
			["HolderDataSaleDevice",16],
			["HolderDataAuthenticator",16],
			["HolderDataProfileStartDate1",14],
			["HolderDataProfileStartDate2",14],
			["HolderDataProfileStartDate3",14],
			["HolderDataProfileStartDate4",14]]
		]
	];

	// Transport and special event fields
	// Each entry is in the form of ["Field Name", length in bits]
	this.transportJournalFields = [
		["EventDisplayData",8],
		["EventNetworkId",24],
		["EventCode",8],
		["EventResult",8],
		["EventServiceProvider",8],
		["EventNotokCounter",8],
		["EventSerialNumber",24],
		["EventDestination",16],
		["EventLocationId",16],
		["EventLocationGate",8],
		["EventDevice",16],
		["EventRouteNumber",16],
		["EventRouteVariant",8],
		["EventJourneyRun",16],
		["EventVehicleId",16],
		["EventVehicleClass",8],
		["EventLocationType",5],
		["EventEmployee",240],
		["EventLocationReference",16],
		["EventJourneyInterchanges",8],
		["EventPeriodJourneys",16],
		["EventTotalJourneys",16],
		["EventJourneyDistance",16],
		["EventPriceAmount",16],
		["EventPriceUnit",16],
		["EventContractPointer",5],
		["EventAuthenticator",16],
		["EventData",5, [
			["EventDataDateFirstStamp",14],
			["EventDataTimeFirstStamp",11],
			["EventDataSimulation",1],
			["EventDataTrip",2],
			["EventDataRouteDirection",2]
		]]
	];

	// A Contract structure.
	// If a field entry contains a subarray as third element, then
	// the field is a bitmap for the subarray.
	this.contract = [
		["ContractNetworkId",24],
		["ContractProvider",8],
		["ContractTariff",16],
		["ContractSerialNumber",32],
		["ContractCustomerInfoBitmap",2,[
			["ContractCustomerProfile",6],
			["ContractCustomerNumber",32]
		]],
		["ContractPassengerInfoBitmap",2, [
			["ContractPassengerClass",8],
			["ContractPassengerTotal",8]
		]],
		["ContractVehicleClassAllowed",6],
		["ContractPaymentPointer",32],
		["ContractPayMethod",11],
		["ContractServices",16],
		["ContractPriceAmount",16],
		["ContractPriceUnit",16],
		["ContractRestrictionBitmap",7,[
			["ContractRestrictStart",11],
			["ContractRestrictEnd",11],
			["ContractRestrictDay",8],
			["ContractRestrictTimeCode",8],
			["ContractRestrictCode",8],
			["ContractRestrictProduct",16],
			["ContractRestrictLocation",16]
		]],
		["ContractValidityInfoBitmap",9,[
			["ContractValidityStartDate",14],
			["ContractValidityStarTime",11],
			["ContractValidityEndDate",14],
			["ContractValidityEndTime",11],
			["ContractValidityDuration",8],
			["ContractValidityLimiteDate",14],
			["ContractValidityZones",8],
			["ContractValidityJourneys",16],
			["ContractPeriodJourneys",16]
		]],
		["ContractJourneyData",8, [
			["ContractJourneyOrigin",16],
			["ContractJourneyDestination",16],
			["ContractJourneyRouteNumbers",16],
			["ContractJourneyRouteVariants",8],
			["ContractJourneyRun",16],
			["ContractJourneyVia",16],
			["ContractJourneyDistance",16],
			["ContractJourneyInterchanges",8]
		]],
		["ContractSaleData",4,[
			["ContractValiditySaleDate",14],
			["ContractValiditySaleTime",11],
			["ContractValiditySaleAgent",8],
			["ContarctValiditySaleDevice",16]
		]],
		["ContractStatus",8],
		["ContractLoyaltyPoints",16],
		["ContractAuthenticator",16]
	];

	// Location IDs of known Metro and RER stations
	// TODO: put this into a backend database as the list is bound to
	//       grow and is not adapted to be located in a Javascript file...
	this.knownLocationIds = new Array();
	this.knownLocationIds[0x0] = "Non renseign&eacute; - valideur non initialis&eacute;?";
	this.knownLocationIds[0x0830] = "Plaisance";
	this.knownLocationIds[0x0840] = "Gait&eacute;";
	this.knownLocationIds[0x1680] = "Bonne Nouvelle";
	this.knownLocationIds[0x16e0] = "R&eacute;aumur-S&eacute;bastopol";
	this.knownLocationIds[0x1c40] = "Cit&eacute; Universitaire (RER B)";
	this.knownLocationIds[0x2040] = "Vaugirard";
	// Ligne 13
	this.knownLocationIds[0x3690] = "Chatillon Montrouge";
	
	this.knownLocationIds[0x3830] = "(?) La D&eacute;fense RER";
	// Ligne 11
	this.knownLocationIds[0x02f0] = "H&ocirc;tel de Ville";
	// Ligne 1
	this.knownLocationIds[0x3ab0] = "La D&eacute;fense Grande Arche";
	// Ligne 17 (RER A)
	this.knownLocationIds[0x2241] = "La D&eacute;fense Grande Arche RER A";
	// RER C
	this.knownLocationIds[0x5203] = "Saint Michel RER C";
	this.knownLocationIds[0x5204] = "Saint-Michel Notre-Dame RER C";
	this.knownLocationIds[0x8031] = "Bd Victor";
	this.knownLocationIds[0x8041] = "Issy Val de Seine (RER C)";
	this.knownLocationIds[0x5211] = "Austerlitz";

	// Ligne T2
	this.knownLocationIds[0x80d2] = "T2, Brimborion";
	// Ligne 89
	this.knownLocationIds[0x813b] = "Labrouste";
	this.knownLocationIds[0x824d] = "Mus&eacute;e du Luxembourg";
	this.knownLocationIds[0x8250] = "Rennes Littr&eacute;";
	this.knownLocationIds[0x8252] = "Place du 18 juin 1940";
	// Ligne T3
	this.knownLocationIds[0x82c5] = "Balard (T3)";
	this.knownLocationIds[0x82c7] = "Pont du Garigliano (T3)"; // TBC
	this.knownLocationIds[0x02f3] = "Pont du Garigliano";
	//this.knownLocationIds[0x82c8] = "Balard (T3)"; // TBC
	this.knownLocationIds[0x82c9] = "Desnouettes (T3)"; // TBC
	this.knownLocationIds[0x82ca] = "Porte de Versailles (T3)"; // TBC
	this.knownLocationIds[0x82cb] = "Brassens (T3)"; // TBC
	this.knownLocationIds[0x82cc] = "Brancion (T3)"; // TBC
	this.knownLocationIds[0x82cd] = "Porte de Vanves (T3)";
	this.knownLocationIds[0x82ce] = "Didot (T3)";
	this.knownLocationIds[0x82cf] = "Jean Moulin (T3)"; // TBC
	this.knownLocationIds[0x82d0] = "Porte d'Orl&eacute;ans (T3)"; // TBC
	this.knownLocationIds[0x82d1] = "Montsouris (T3)"; // TBC
	this.knownLocationIds[0x82d2] = "Cit&eacute; Universitaire (T3)";
	// Ligne 95
	this.knownLocationIds[0x838a] = "Morillons";
	this.knownLocationIds[0x838b] = "Labrouste-Vouill&eacute;";
	this.knownLocationIds[0x838c] = "Labrouste-Vouill&eacute;";

/////// Intercode 2 types:

	// Transport modes as defined in Intercode
	this.EventCodeTranportMode = new Array();
	this.EventCodeTranportMode[1] = "Bus Urbain";
	this.EventCodeTranportMode[2] = "Bus Interurbain";
	this.EventCodeTranportMode[3] = "M&eacute;tro";
	this.EventCodeTranportMode[4] = "Tram";
	this.EventCodeTranportMode[5] = "Train";
	this.EventCodeTranportMode[8] = "Parking";

	this.EventCodeTransactionType = new Array();
	this.EventCodeTransactionType[1] = "Validation en entr&eacute;e";
	this.EventCodeTransactionType[2] = "Validation en sortie";
	this.EventCodeTransactionType[4] = "Contr&ocirc;le volant (&agrave; bord)";
	this.EventCodeTransactionType[5] = "Validation de test";
	this.EventCodeTransactionType[6] = "Validation en correspondance (entr&eacute;e)";
	this.EventCodeTransactionType[7] = "Validation en correspondance (sortie)";
	this.EventCodeTransactionType[9] = "Annulation de validation";
	this.EventCodeTransactionType[0xf] = "Invalidation";

	this.serviceProvider = new Array();
	this.serviceProvider[0] = "Ensemble des exploitants";
	this.serviceProvider[1] = "RATP et SNCF";
	this.serviceProvider[2] = "SNCF";
	this.serviceProvider[3] = "RATP";
	this.serviceProvider[4] = "OPTILE";

	// Card status types from Intercode spec
	this.holderDataCardStatus = new Array();
	this.holderDataCardStatus[0] = "Anonymous";
	this.holderDataCardStatus[1] = "Identified or declarative (carte individuelle d&eacute;clarative i.e. Navigo D&eacute;couverte)";
	this.holderDataCardStatus[2] = "Personalised (carte individuelle nominative i.e. Navigo standard)";
	this.holderDataCardStatus[3] = "Provider-specific";
	// From experience:
	this.holderDataCardStatus[6] = "Navigo int&eacute;grale?";

	// Payment Methods
	this.PayMethod = new Array();
	this.PayMethod[0x80] = "D&eacute;bit PME";
	this.PayMethod[0x90] = "Esp&egrave;ce";
	this.PayMethod[0xA0] = "Ch&egrave;que mobilit&eacute;";
	this.PayMethod[0xB3] = "Carte de paiement";
	this.PayMethod[0xA4] = "Ch&egrave;que";
	this.PayMethod[0xA5] = "Ch&egrave;que vacances";
	this.PayMethod[0xB7] = "T&eacute;l&eacute;paiement";
	this.PayMethod[0xD0] = "T&eacute;l&eacute;r&egrave;glement";
	this.PayMethod[0xD7] = "Bon de caisse, bon d'échange, bon voyage, versement préalable";
	this.PayMethod[0xD9] = "Bon de r&eacute;duction";

// Utility functions

	// Gets a 1545 Date Stamp as input (integer) and outputs
	// a string with the date.
	this.parseDate = function(EventDateStamp) {
		var startEpoch = new Date("Jan 01 1997 00:00:00 GMT+0100");
		var eventUnixDate =  new Date(startEpoch.getTime() + EventDateStamp*24*3600*1000);
		return eventUnixDate.toDateString();
	};

// Get the value of a Field of a specific length starting at a specific bitfieldpointer
// within a hex String that is encoded using Packed Encoding Rules (aka PER).
//
//    optionBitLength: length in bits of the field
//    bitFieldPointer: start pointer (in bits) within the hexString
//    hexString: PER-encoded blob as a hexadecimal string
	this.getFieldValue = function(optionBitLength, bitFieldPointer,hexString) {
		var byteOffset = Math.ceil((bitFieldPointer+1)/8)*2-2;
		var optionByteLength = Math.ceil((optionBitLength+bitFieldPointer%8)/8)*2;
		var hexOptionRaw = parseInt("0x" + hexString.substr(byteOffset,optionByteLength));
		var hexOptionRightMask = (8 - (bitFieldPointer+optionBitLength)%8)%8;
			// Need the 2nd %8 above in case rightmask=8 which means 0.
		var hexOptionMask = (Math.pow(2,optionBitLength)-1) << hexOptionRightMask;
		var hexOption = (hexOptionRaw & hexOptionMask) >>> hexOptionRightMask;
		return hexOption;
	}
}


// Parses a "Event" file.
// 
Intercode2.prototype.parseEvent = function(hexString){
		var returnString = "";
		// EventDateStamp: 14 bits, number of days since 01.01.1997
		var EventDateStamp = parseInt("0x" + hexString.substr(0, 4)) >>> 2;
		// EventTimeStamp: 11 bits, number of minutes since midnight
		var EventTimeStamp = (parseInt("0x" + hexString.substr(2,6)) & 0x3FF80) >>> 7;
		var startEpoch = new Date("Jan 01 1997 00:00:00 GMT+0100");
		var eventUnixDate =  new Date(startEpoch.getTime() + EventDateStamp*24*3600*1000 + EventTimeStamp*60*1000);
		// Then the log contains a 28bit bitmap telling what fields are present:
		var logBitMap = (parseInt("0x" + hexString.substr(6,8)) & 0x7FFFFFF8) >>> 3;
		returnString += "<hr>Event date&nbsp;:" + eventUnixDate.toString() + "<br/>";
		// Now, right-shift each bit and check its value to check whether a field
		// is present. We use a bitFieldPointer to follow our progress through
		// the structure.
		var bitFieldPointer = 53; // Last bit before structure
		returnString += "Fields present in event record&nbsp;: <br/>";
		for(var j=0;j<28;j++) {
			optionPresent = logBitMap & 0x1;
			if (optionPresent) {
				returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.transportJournalFields[j][0] + " -> ";
				// Extract the actual value from the bitstream coded as a hex string:
				var optionBitLength = this.transportJournalFields[j][1];
				var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
				// Further decoding depending on the field:
				returnString += "0x" + hexOption.toString(16);
				switch(this.transportJournalFields[j][0]) {
					case "EventCode":
						returnString += " - " + this.EventCodeTranportMode[hexOption>>>4] + " - ";
						returnString += this.EventCodeTransactionType[hexOption & 0xf] + "<br/>";
						break;
					case "EventLocationId":
						returnString += " (" + this.knownLocationIds[hexOption] + ")<br/>";
						break;
					case "EventServiceProvider":
						returnString += " (" + this.serviceProvider[hexOption] + ")<br/>";
						break;
					case "EventRouteNumber":
						// For Busses, the bus line (in decimal, not hex)
						returnString +=  " (Ligne " + hexOption + ")<br/>";
						break;
					default:
						returnString += "<br/>";
				}
				bitFieldPointer += optionBitLength;
			}
			// Move on to next option:
			logBitMap = logBitMap >>> 1;
		}
		return returnString;
}


// Navigo files have both a Environment & Holder structures chained, this
// function parses them
// TODO: support level 2 nested structures (would crash @ the moment, but not found
//       in the Navigo cards I tried)
//
Intercode2.prototype.parseEnvironmentHolderList = function(hexString) {
	var returnString = "";
	var bitFieldPointer = 0; // Last bit before start of structure
	returnString += "<hr><b>Fields present in Environment structure&nbsp;:</b> <br/>";
	// Environment structure:
	for(var j=0;j< this.environmentFields.length;j++) {
		returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.environmentFields[j][0] + " -> ";
		// Extract the actual value from the bitstream coded as a hex string:
		var optionBitLength = this.environmentFields[j][1];
		var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
		bitFieldPointer += optionBitLength;
		// Detect nested bitmap (support for only 1 level)
		if (this.environmentFields[j].length > 2) {
			nestedBitMap= hexOption;
			// We have a nested bitmap, parse it
			for(var k=0;k<this.environmentFields[j][1];k++) {
				optionPresent = nestedBitMap & 0x1;
				if (optionPresent) {
					returnString += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.environmentFields[j][2][k][0];
					var optionBitLength = this.environmentFields[j][2][k][1];
					var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
					bitFieldPointer += optionBitLength;
					returnString += " -> 0x" + hexOption.toString(16);
					switch(this.environmentFields[j][2][k][0]) {
						case "EnvApplicationValidityEndDate":
							returnString += " - " + this.parseDate(hexOption);
							break;
					}
				}
				nestedBitMap = nestedBitMap >>> 1;
			}
			returnString += "<br/>";
		} else { // Standard field, decode further depending on field type
			returnString += "0x" + hexOption.toString(16);
			switch(this.environmentFields[j][0]) {
				default:
					returnString +=  "<br/>";
			}
		}
	}

	// Now parse the Holder structure that follows (bitwise)
	// The holder structure starts with a 8 bit bitmap telling what fields are present:
	var optionBitLength = 8;
	var holderBitMap = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
	bitFieldPointer += optionBitLength;
	returnString += "<hr><b>Fields present in Holder structure&nbsp;:</b> <br/>";
	for(var j=0;j<8;j++) {
		optionPresent = holderBitMap & 0x1;
		if (optionPresent) {
			returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.holderFields[j][0] + " -> ";
			// Extract the actual value from the bitstream coded as a hex string:
			var optionBitLength = this.holderFields[j][1];
			var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
			bitFieldPointer += optionBitLength;
			// Detect nested bitmap (support for only 1 level)
			if (this.holderFields[j].length > 2) {
				nestedBitMap= hexOption;
				// We have a nested bitmap, parse it
				for(var k=0;k<this.holderFields[j][1];k++) {
					optionPresent = nestedBitMap & 0x1;
					if (optionPresent) {
						returnString += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.holderFields[j][2][k][0];
						var optionBitLength = this.holderFields[j][2][k][1];
						var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
						bitFieldPointer += optionBitLength;
						returnString += " -> 0x" + hexOption.toString(16);
						switch(this.holderFields[j][2][k][0]) {
							case "HolderDataCardStatus":
								returnString += " - " + this.holderDataCardStatus[hexOption];
								break;
						}
					}
					nestedBitMap = nestedBitMap >>> 1;
				}
				returnString += "<br/>";
			} else { // Standard field, decode further depending on field type
				returnString += "0x" + hexOption.toString(16);
				switch(this.holderFields[j][0]) {
					default:
						returnString +=  "<br/>";
				}
			}
		}
		// Move on to next option:
		holderBitMap = holderBitMap >>> 1;
	}


	return returnString;
}


// Parses a Contract List file (usually 2050)
// TODO: when we decode the BestContractType, we should save the value somehow
//       because it tells us what is the structure of the corresponding contract.
//       At the moment, we assume "0xff" when parsing contracts.
Intercode2.prototype.parseContractList = function(hexString){
	var returnString = "";
	var bitFieldPointer = 0; // Last bit before start of structure
	returnString += "<hr><b>Fields present in Contracts list structure&nbsp;:</b> <br/>";
	// Contracts list structure:
	for(var j=0;j< this.contractsList.length;j++) {
		returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.contractsList[j][0] + " -> ";
		// Extract the actual value from the bitstream coded as a hex string:
		var optionBitLength = this.contractsList[j][1];
		var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
		bitFieldPointer += optionBitLength;
		// Detect nested bitmap (support for only 1 level)
		if (this.contractsList[j].length > 2) {
			nestedBitMap= hexOption;
			// We have a nested bitmap, parse it
			for(var k=0;k<this.contractsList[j][1];k++) {
				optionPresent = nestedBitMap & 0x1;
				if (optionPresent) {
					returnString += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.contractsList[j][2][k][0];
					var optionBitLength = this.contractsList[j][2][k][1];
					var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
					bitFieldPointer += optionBitLength;
					returnString += " -> 0x" + hexOption.toString(16);
					switch(this.contractsList[j][2][k][0]) {
						case "BestContractTariff":
							// Split the tariff in its three subfields:
							var bestContractKey = (hexOption &  0xF000) >>> 12;
							var bestContractType = (hexOption & 0x0FF0) >>> 4;
							var bestContractPrio = (hexOption & 0x000F);
							returnString += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Contract sorting key&nbsp;: 0x" + bestContractKey.toString(16)+"<br/>";
							returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Contract type&nbsp;: 0x" + bestContractType.toString(16)+"<br/>";
							returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Contract priority&nbsp;: 0x" + bestContractPrio.toString(16);
							break;
					}
				}
				nestedBitMap = nestedBitMap >>> 1;
			}
			returnString += "<br/>";
		} else { // Standard field, decode further depending on field type
			returnString += "0x" + hexOption.toString(16);
			switch(this.contractsList[j][0]) {
				default:
					returnString +=  "<br/>";
			}
		}
	}

	return returnString;
}

// Parses a Contract file
// Requires the corresponding contract list file contents too in order to
// determine the contract type and how to parse it. At the moment, this is
// not implemented and the routine assumes a "RATP-style" contract.
// hexString: contents of the contract
// contractIndex: int, index of the contract in the list
// contractList : hex string too, list of contracts in file 2050
Intercode2.prototype.parseContract = function(hexString,contractIndex,contractList) {
	var returnString = "";
	// TODO: really check the contract type. For now, assume we have a RATP
	//       contract structure (0xFF)
	// The contract starts with a 20bit bitmap telling what fields are present:
	var contractBitMap = (parseInt("0x" + hexString.substr(0,6)) & 0x7FFFF0) >>> 4;
	// Now, right-shift each bit and check its value to check whether a field
	// is present. We use a bitFieldPointer to follow our progress through
	// the structure.
	var bitFieldPointer = 20; // Last bit before start of structure
	returnString += "<hr><b>Fields present in Contract record number " + contractIndex + "&nbsp;:</b> <br/>";
	for(var j=0;j<20;j++) {
		optionPresent = contractBitMap & 0x1;
		if (optionPresent) {
			returnString += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.contract[j][0] + " -> ";
			// Extract the actual value from the bitstream coded as a hex string:
			var optionBitLength = this.contract[j][1];
			var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
			bitFieldPointer += optionBitLength;
			// Detect nested bitmap (support for only 1 level)
			if (this.contract[j].length > 2) {
				nestedBitMap= hexOption;
				// We have a nested bitmap, parse it
				for(var k=0;k<this.contract[j][1];k++) {
					optionPresent = nestedBitMap & 0x1;
					if (optionPresent) {
						returnString += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + this.contract[j][2][k][0];
						var optionBitLength = this.contract[j][2][k][1];
						var hexOption = this.getFieldValue(optionBitLength,bitFieldPointer,hexString);
						bitFieldPointer += optionBitLength;
						returnString += " -> 0x" + hexOption.toString(16);
						switch(this.contract[j][2][k][0]) {
							case "ContractValidityEndDate":
							case "ContractValidityStartDate":
							case "ContractValidityLimiteDate":
							case "ContractValiditySaleDate":
								returnString += " - " + this.parseDate(hexOption);
								break;
							case "ContractValidityZones":
								// Each bit in ContractValidityZones at 1 is a valid zone
								returnString += " - Zones valides: ";
								for(l=0;l<8;l++){
									if(hexOption & 0x1) { returnString += (l+1) + " "; }
									hexOption = hexOption >>>1;
								}
						}
					}
					nestedBitMap = nestedBitMap >>> 1;
				}
				returnString += "<br/>";
			} else { // Standard field, decode further depending on field type
				returnString += "0x" + hexOption.toString(16);
				switch(this.contract[j][0]) {
					case "ContractPayMethod":
						returnString += " (" + this.PayMethod[hexOption] + ")<br/>";
						break;
					case "ContractPriceAmount":
						returnString += " (" + hexOption/100 + " Eur)<br/>";
						break;
					default:
						returnString +=  "<br/>";
				}
			}
		}
		// Move on to next option:
		contractBitMap = contractBitMap >>> 1;
	}
	return returnString;
}


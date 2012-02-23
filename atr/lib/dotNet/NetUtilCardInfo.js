/* Gets information about the .NET smart Card.
 *
 * Needs ContentManager.js
 *
 */

var NetUtilCardInfo = true;

/*
 * Queries the card module for some info (if it exists)
 * At the moment, only minidriver version...
 */
function dotNetCardModuleInfo(reader) {
	var returnHtml = "";
	if(Axalto.netCard.CardModule.CardModuleService.IsPresent(reader,"MSCM")){
		// Get card minidriver version
		var mscm = new Axalto.netCard.CardModule.CardModuleService(reader,5,"MSCM");
		var version = mscm.get_Version();
		returnHtml += "Card minidriver version:" + version + "</br>";
		mscm.dispose();
	} else {
		returnHtml = "Gemalto Card Module not active on the card.";
	}
	return returnHtml;
}



/*
 * Queries the card for low level information
 */
function dotNetGetCardInfo(reader){
	var contentManager=new SmartCard.ContentManager(reader,1,"ContentManager");
	var returnHtml = "";
	try{
		var serialnumber=contentManager.get_SerialNumber();
		var osversion=contentManager.get_OSVersion();
		var clrversion=contentManager.get_CLRVersion();
		var commspeed=contentManager.get_CommunicationSpeed();
		var chipspeed=contentManager.get_ChipSpeed();
		var freeMemory=contentManager.get_FreePersistentMemory();
		returnHtml += "OS Version: " + osversion + "<br>";
		returnHtml += "CLR Version: " + clrversion + "<br>";
		returnHtml += "Card serial number: " + SConnect.TypeUtils.byteArrayToHexString(serialnumber).toUpperCase() + "<br>";
		returnHtml += "Communication speed: " + commspeed+" bps";
		returnHtml += " (chip speed: " + chipspeed+"%)<br>";
		returnHtml += "Free memory: " + freeMemory+" bytes<br>";
		} catch(e) {
			contentManager.dispose();
			returnHtml += "Error when getting the card characteristic information";
		}
		contentManager.dispose();
		return returnHtml;
};

/*
 * Queries the card for a list of services active on the card
 */
function dotNetGetCardServices(reader){
		// showDiv("resultarea");
		var returnHtml = "";
		var contentManager=new SmartCard.ContentManager(reader,1,"ContentManager");
		try{
			var extendedServicesList=contentManager.GetServices(true);
			var htmlToDisplay="";
			var service_name="";
			for(var i=0;i<extendedServicesList.length;i+=2){
				service_name=extendedServicesList[i];
				if(service_name=="MSCM"){service_name+=" (Gemalto Minidriver)";}
				if(service_name=="A0000000308000000000280101"){service_name+=" (OATH OTP)";}
				htmlToDisplay+="<tr><td>"+service_name+"</td><td>"+extendedServicesList[i+1]+"</td>";
				htmlToDisplay+="<td>"+
					GetAppDomainStatus(contentManager.GetServiceStatus(extendedServicesList[i],extendedServicesList[i+1]))
					+"</td>";
				htmlToDisplay+="<td>"+
					contentManager.GetAppDomainSize(extendedServicesList[i],extendedServicesList[i+1])+
					"</td></tr>";
			}
			var tableContent="<table>";
			tableContent+="<thead><tr><th align=\"left\">Service</th>";
			tableContent+="<th align=\"left\">Card Application Path</th>";
			tableContent+="<th align=\"left\">Status</th>";
			tableContent+="<th align=\"left\">Size (bytes)</th></thead><tbody>";
			returnHtml = tableContent+htmlToDisplay+"</tbody></table>";
		}
		 catch(e) {
			contentManager.dispose();
			returnHtml = "Error when getting the card service information";
		}
		contentManager.dispose();
		return returnHtml;
};

function GetAppDomainStatus(status){
	var statusStr="";
	if(status==0){return"Active";}
	if((status&0x00000002)==0x00000002){statusStr+="AppDomainLocked+";}
	if((status&0x00000004)==0x00000004){statusStr+="AppDomainError+";}
	if((status&0x08000000)==0x08000000){statusStr+="DefaultSelected+";}
	if((status&0x10000000)==0x10000000){statusStr="Active+";}
	if((status&0x40000000)==0x40000000){statusStr+="AccessManager+";}
	if((status&0x20000000)==0x20000000){statusStr="ActiveAccessManager+";}
	if((status&0x80000000)==0x80000000){statusStr+="ServiceLocked+";}
	statusStr=statusStr.substr(0,statusStr.length-1);
	return statusStr;
};

/**
 * @author rdollet
 */
//var myCard;
// var cardStructure;
// var cardStructurePointer;
// var calypsoCardNode;
//var cardNodePointer;
var tree;
var guiExt;

// Register file load:
var Parse_Card_Calypso = true;


function calypsoParseMe(renderGUI){

	var myApduPanel = renderGUI.apduTracePanel;
	var cardNode = renderGUI.cardNode;
	var informationPanel = renderGUI.informationPanel;
	var fileDumpPanel = renderGUI.fileDumpPanel;
	calypsoCardNode = renderGUI.cardNode;
	// Reset
	while(cardNode.lastChild) {
		cardNode.lastChild.remove();
	}
	cardStructure = null;
	cardSructurePointer = {};
	var cardNodePointer;

	var calypsoSmartCardSelectFileSuccess = function(r){
		var currentPath;
		var Tree = Ext.tree;
		currentPath = myCard.calypsoSmartCardGetCurrentFile();

		// Root
		if (cardStructure === null) {
		        cardStructure = new cloneObject(currentPath);
			cardStructurePointer = cardStructure;
			calypsoCardNode.setText(currentPath.fileID);
			cardNodePointer = calypsoCardNode;
			cardNodePointer.details = currentPath;
			calypsoCardNode.select();
			var asn1 = new ASN1();
			informationPanel.body.update("<u>File Attribute decoding: </u><br/>");
			informationPanel.body.insertHtml("beforeEnd",asn1.readTLV(currentPath.rawFileAttribute)+"<br/>");
		}
		else {
			// Update card Structure if not there
			if (cardStructurePointer.fileID != currentPath.fileID) {
				cardStructurePointer.getListChildren[currentPath.fileID] = currentPath;
				delete cardStructurePointer.getListChildren[ArrayOffset(cardStructurePointer.getListChildren)];
				cardNodePointer.appendChild(new Tree.TreeNode({
					text: (currentPath.fileID.length > 4) ? currentPath.fileID + " (" + hexAsciiToAscii(currentPath.fileID) + ")" : currentPath.fileID,
					id: currentPath.getPath()
				}));
				cardNodePointer.lastChild.details = currentPath;
				if (currentPath.fileFamily == "DF") {
					// DF
					cardStructurePointer = cardStructurePointer.getListChildren[currentPath.fileID];
					cardNodePointer = cardNodePointer.lastChild;
				}
			}
		}
		cardNodePointer.expand();
		var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
		if (remainingItem !== null) {
			myCard.calypsoSmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			if (cardStructurePointer != null) {
				myCard.calypsoSmartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
			}
			else {
				myApduPanel.body.insertHtml("afterBegin","Parsing is finished !! <br/><br/>");
				enableScan = true;
			}
		}
};

	var calypsoSmartCardSelectFileFailure = function(r){
		// alert("not able to select file");
		// Simply move on to the next file in line (silent fail) :
		currentPath = myCard.calypsoSmartCardGetCurrentFile();
		cardStructurePointer.getListChildren[currentPath.fileID] = currentPath;
		delete cardStructurePointer.getListChildren[ArrayOffset(cardStructurePointer.getListChildren)];
		var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
		if (remainingItem !== null) {
			myCard.calypsoSmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			if (cardStructurePointer != null) {
				myCard.calypsoSmartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
			}
			else {
				myApduPanel.body.insertHtml("afterBegin","Parsing is finished !! <br/><br/>");
				enableScan = true;
			}
		}
	};

	var globalCallBack = {
		success: calypsoSmartCardSelectFileSuccess,
		failure: calypsoSmartCardSelectFileFailure,
		scope: this
	};

	function ArrayOffset(arrayToAnalyse){
		// Go through the referenceClass
		for (var i in arrayToAnalyse) {
			if (i.length < 3) {
				return i;
			}
		}
		return null;
	}
    // Connect to the card
    myCard = new calypsoSmartCard(renderGUI.reader,myApduPanel);
    myCard.calypsoSmartCardInitialize(globalCallBack);


}

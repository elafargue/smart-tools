/**
 * @author rdollet
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 *
 * Changelog:
 * 2010.03.31: added raw FCI display next to decoded output
 */
var tree;
var guiExt;

// Register file load:
var Parse_Card_Calypso = true;


function calypsoParseMe(renderGUI){

	var myApduPanel = renderGUI.apduTracePanel;
	var cardNode = renderGUI.cardNode;
	var informationPanel = renderGUI.informationPanel;
	var fileDumpPanel = renderGUI.fileDumpPanel;
	var calypsoCardNode = renderGUI.cardNode;
	var cardStructure = null;
	var cardStructurePointer = {};
	var cardNodePointer;
	// Reset
	while(cardNode.lastChild) {
		cardNode.lastChild.remove();
	}

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
			var asn1 = new ASN1("Calypso");
			informationPanel.body.update("<u>File Attribute decoding: </u><br/>Raw: "+currentPath.rawFileAttribute+"<br>");
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
//				myCard.calypsoSmartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
				var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
				if (remainingItem !== null) {
					// Need to point the current file of the card as well:
					myCard.currentFile.setParent(myCard.currentFile.getParent().getParent());
					myCard.calypsoSmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
				} else {
					myApduPanel.body.insertHtml("afterBegin","Parsing is finished !! <br/><br/>");
					enableScan = true;
				}
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
		delete cardStructurePointer.getListChildren[ArrayOffset(cardStructurePointer.getListChildren)];
		var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
		if (remainingItem !== null) {
			myCard.calypsoSmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			if (cardStructurePointer != null) {
				var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
				if (remainingItem !== null) {
					// Need to point the current file of the card as well:
					myCard.currentFile.setParent(myCard.currentFile.getParent().getParent());
					myCard.calypsoSmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
				} else {
					myApduPanel.body.insertHtml("afterBegin","Parsing is finished !! <br/><br/>");
					enableScan = true;
				}
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

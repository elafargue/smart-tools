/**
 * dotNet parser: recursively parses the filesystem of the card module assembly
 *  Uses the same approach as other card types.
 * @author elafargue
 * @author rdollet
 */
var tree;
var guiExt;

// Register file load:
var Parse_Card_dotNet = true;

function dotNetParseMe(renderGUI){

	var cardNode = renderGUI.cardNode;
	var informationPanel = renderGUI.fileDumpPanel;
	var fileDumpPanel = renderGUI.fileDumpPanel;
	// Reset
	while(cardNode.lastChild) {
		cardNode.lastChild.remove();
	}
	cardStructure = null;
	cardSructurePointer = {};
	var cardNodePointer;

	var smartCardSelectFileSuccess = function(r){
		var currentPath;
		var Tree = Ext.tree;
		currentPath = myCard.smartCardGetCurrentFile();

		// Root
		if (cardStructure === null) {
		        cardStructure = new cloneObject(currentPath);
			cardStructurePointer = cardStructure;
			cardNode.setText(currentPath.fileID);
			cardNodePointer = cardNode;
			cardNodePointer.details = currentPath;
			cardNode.select();
			informationPanel.body.update("<u>File Attribute decoding: </u><br/>");
			// informationPanel.body.insertHtml("beforeEnd",asn1.readTLV(currentPath.rawFileAttribute)+"<br/>");
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
			myCard.smartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			if (cardStructurePointer != null) {
				myCard.smartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
			}
			else {
				//myApduPanel.body.insertHtml("afterBegin","Parsing is finished !! <br/><br/>");
				enableScan = true;
			}
		}
};

	var smartCardSelectFileFailure = function(r){
		// alert("not able to select file");
		// Simply move on to the next file in line (silent fail) :
		currentPath = myCard.smartCardGetCurrentFile();
		cardStructurePointer.getListChildren[currentPath.fileID] = currentPath;
		delete cardStructurePointer.getListChildren[ArrayOffset(cardStructurePointer.getListChildren)];
		var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
		if (remainingItem !== null) {
			myCard.smartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			if (cardStructurePointer != null) {
				myCard.smartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
			}
			else {
				// myApduPanel.body.insertHtml("afterBegin","Parsing is finished !! <br/><br/>");
				enableScan = true;
			}
		}
	};

	var globalCallBack = {
		success: smartCardSelectFileSuccess,
		failure: smartCardSelectFileFailure,
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
    myCard = new dotNetSmartCard(renderGUI.reader);
    myCard.smartCardInitialize(globalCallBack);

}

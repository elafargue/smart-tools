/**
 * @author rdollet
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */
var tree;
var guiExt;

var P15_Parse_card_JS = true;

function P15parseMe(renderGUI){
	var myApduPanel = renderGUI.apduTracePanel;
	var cardNode = renderGUI.cardNode;
	var informationPanel = renderGUI.informationPanel;
	var fileDumpPanel = renderGUI.fileDumpPanel;
	var p15cardNode = renderGUI.cardNode;
	var cardStructure = null;
	var cardStructurePointer = {};
	var cardNodePointer;
	
	// Should deactivate event...
	enableScan = false;
	
	// Reset
	while(p15cardNode.lastChild) {
		cardNode.lastChild.remove();
	}

	var p15SmartCardSelectFileSuccess = function(r){
	    var currentPath;
	    var Tree = Ext.tree;
	    currentPath = myCard.p15SmartCardGetCurrentFile();
    
	    // Root
		if (cardStructure === null) {
			cardStructure = new cloneObject(currentPath);
			cardStructurePointer = cardStructure;
			p15cardNode.setText(currentPath.fileID);
			cardNodePointer = p15cardNode;
			cardNodePointer.details = currentPath;
			p15cardNode.select();
			var asn1 = new ASN1("FCI");
			informationPanel.body.update("<u>File Attribute decoding: </u><br/>");
			informationPanel.body.insertHtml("beforeEnd",asn1.readTLV(currentPath.rawFileAttribute)+"<br/>");
		}
		else {
			// Update card Structure if not there
			if (cardStructurePointer.fileID != currentPath.fileID) {
				cardStructurePointer.getListChildren[currentPath.fileID] = currentPath;
				delete cardStructurePointer.getListChildren[ArrayOffset(cardStructurePointer.getListChildren)];
				cardNodePointer.appendChild(new Tree.TreeNode({
				text: currentPath.fileID,
				id: currentPath.getPath()				}));
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
			myCard.p15SmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			// Go back up one level in the parser:
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			myCard.currentFile = myCard.currentFile.getParent();
			if (cardStructurePointer != null) {
				//myCard.p15SmartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
				var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
				if (remainingItem !== null) {
					if (currentPath.fileFamily != "DF") {
						myCard.currentFile = myCard.currentFile.getParent();
					}
					myCard.p15SmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
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

	var p15SmartCardSelectFileFailure = function(r){
		    var currentPath;
		    currentPath = myCard.p15SmartCardGetCurrentFile();
	       // alert("not able to select file");

		// Simply move on to the next file in line (silent fail) :

		delete cardStructurePointer.getListChildren[ArrayOffset(cardStructurePointer.getListChildren)];
		var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
		if (remainingItem !== null) {
			myCard.p15SmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
		}
		else {
			// Go back up one level in the parser:
			cardStructurePointer = cardStructurePointer.getParent();
			cardNodePointer = cardNodePointer.parentNode;
			myCard.currentFile = myCard.currentFile.getParent();
			if (cardStructurePointer != null) {
				//myCard.p15SmartCardSelectFile(cardStructurePointer.fileID, globalCallBack);
				var remainingItem = ArrayOffset(cardStructurePointer.getListChildren);
				if (remainingItem !== null) {
					if (currentPath.fileFamily != "DF") {
						myCard.currentFile = myCard.currentFile.getParent();
					}
					myCard.p15SmartCardSelectFile(cardStructurePointer.getListChildren[remainingItem], globalCallBack);
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
	    success: p15SmartCardSelectFileSuccess,
	    failure: p15SmartCardSelectFileFailure
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
    myCard = new p15SmartCard(renderGUI.reader, myApduPanel);
    myCard.p15SmartCardInitialize(globalCallBack);

    return myCard;
}

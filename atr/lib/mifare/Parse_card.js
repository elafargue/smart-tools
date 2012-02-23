/**
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 *
 * Based on original work by rdollet
 */
var tree;
var guiExt;

// Register file load:
var Parse_Card_Mifare_JS = true;


function mifareParseMe(renderGUI){

	var myApduPanel = renderGUI.apduTracePanel;
	var cardNode = renderGUI.cardNode;
	var informationPanel = renderGUI.informationPanel;
	var fileDumpPanel = renderGUI.fileDumpPanel;
	var cardStructure = null;
	var cardStructurePointer = {};
	var cardNodePointer;
	var mifareCardType = "";
	var mifareCardSectors = 16;

	// Reset
	while(cardNode.lastChild) {
		cardNode.lastChild.remove();
	}

	// Initialize mapping depending on card type:
	// Mifare 1K is 16 sectors with 4 blocks of 16 bytes each
	// Mifare 4K is 31 sectors with 4 blocks and the rest with 16 blocks
	// Mifare Ultralight is 16 pages of 4 bytes...
	switch(renderGUI.atr) {
		case "3B8F8001804F0CA000000306030001000000006A":
			mifareCardType = "1K";
			mifareCardSectors = 16;
			break;
		case "3B8F8001804F0CA0000003060300020000000069":
			mifareCardType = "4K";
			mifareCardSectors = 40;
			break;
		case "3B8F8001804F0CA0000003060300030000000068":
			mifareCardType = "Ultralight";
			mifareCardSectors = 16;
			break;
		default:
			mifareCardType = "1K";
			mifareCardSectors = 16;
	}

	// Build the tree depending on card type
	// 1K and 4K cards are very much the same
	// Ultralight cards are slightly different.
	var Tree = Ext.tree;
	cardNodePointer = cardNode;
	cardNodePointer.setText("Mifare " + mifareCardType);
	cardNodePointer.select();
	cardNodePointer.expand();
	if (mifareCardType == "Ultralight") {
		for (var i=0; i<16; i++) {
			cardNodePointer.appendChild(new Tree.TreeNode({
				text: "Page " + i,
				id: "P" +i,
				disabled: true,
				details: {
					page: i
				}
			}));
		}
	} else {
		for (var i=0; i<mifareCardSectors;i++) {
			var blk = 0;
			// Initialize create new sector:
			cardNodePointer.appendChild(new Tree.TreeNode({
				text: "Sector " + i,
				id: "S" + i,
				details: {
					sector: i,
					block: -1
				}
			}));
			cardNodePointer = cardNodePointer.lastChild;
			(i>31) ? blk = 16: blk = 4; // Mifare 4K
			for (var j=0; j<blk;j++) {
				cardNodePointer.appendChild(new Tree.TreeNode({
						text: "Block " + j,
						id: "S" + i + "B" + j,
						details: {
							sector: i,
							block: j
						}
					}));
			}
			cardNodePointer = cardNodePointer.parentNode;
		}
	}
    // Create a card connector instance which will handle actual card communication:
	// Should place dispatching logic here depending on actual card type.
    myCard = new mifareSmartCard(renderGUI.reader,myApduPanel,mifareCardType);
    myCard.smartCardInitialize();

    return myCard;
}

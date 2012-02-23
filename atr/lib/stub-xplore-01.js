<!-- Load all subscripts here -->
<script src="lib/utils.js" type="text/javascript" charset="utf-8"></script>

<script type="text/javascript">
/*
 * Explorer for XXX Smart Cards
 *
 * Based on original work by R. Dollet
 */

StubXplorer=function(){
};


StubXplorer.prototype = {
	reader: null,
	atr: null,
	cardNode: null,
	/* Insert references to all subpanels here */
	informationPanel: null,
	fileDumpPanel: null,
	apduTracePanel: null,

	init: function(reader, atr) {
		/* Instanciate the GUI */
	this.reader= reader;
	this.atr = atr;
	this.createGui(this);
	},

	refreshCardTree: function() {
		/* Insert the parser call here */
		calypsoParseMe(this);
	},

	fillCardInfo: function(panel) {

	cardHtml = "Chip type: " + this.atr.substr(12,2) + " (" + chipType[this.atr.substr(12,2)] + ")<br>";
	panel.html = cardHtml;

	},

	// Creates the GUI for the Explorer:
	createGui: function(myXplorer){
	/*
	|-----------------|-------------|
	| Title Bar    [R]|             |
	|-----------------|             |
	|                 |             |         
	|                 |   Analyse   |         
	|       Tree      |------------ |         
	|-----------------|             |         
	|   Card Info     |    Dump     |
	|-----------------|-------------|
	|                APDU           |         
	|-------------------------------|
	*/

		// Create Specific GUI  
		var d = new Date();
		var xId = 'cal-' + d.getTime();
		Ext.DomHelper.append('xPlorer',"<div id='"+xId+"'></div>");
		var Tree = Ext.tree;
		Xtree = new Tree.TreePanel({
    			title: 'Card Structure',
			height: 200,
			width: 300,
			region: 'center',
			animate: true,
			autoScroll: true,
			containerScroll: true,
			myXplorer: myXplorer,
			tools: [{
				id:'refresh',
				qtip: 'Parse/Refresh',
				handler: function(event, toolEl, panel){
					// refresh logic
					panel.myXplorer.refreshCardTree();
				}
			}],
			bodyStyle: {
			},
			dropConfig: {
				appendOnly: true
			}
		});

		this.cardNode = new Tree.TreeNode({
			text: 'Click on the \'Refresh\' button above to start parsing.',
			draggable: false, // disable root node dragging
			id: 'root'
		});
		Xtree.setRootNode(this.cardNode);
		Xtree.on('click', function(node){
			var asn1 = new ASN1();
			var currentPath = node.details;
			var cardInfo;
        
			// disable current dump
			enableDump = false;
			myXplorer.informationPanel.body.update("<u>File Attribute decoding: </u><br/>");
			myXplorer.informationPanel.body.insertHtml("beforeEnd",asn1.readTLV(currentPath.rawFileAttribute)+"<br/>");
			if ((currentPath.fileFamily === "EF") && (currentPath.getContent[1] != "")) {
				var dump = currentPath.getContent;
				if(currentPath.fileID == "2020") {
					//outPutData("<u>Content Parsing with ASN1:</u><br/> " + asn1.readASN1(currentPath.getContent[1]));
				}
				if (dump == "") {
					dumpDataTrace("",myXplorer.fileDumpPanel);
				}
				else {
					// (Dump is an array)
					dumpDataTrace(dump,myXplorer.fileDumpPanel);
				}            
			}
			else {
				dumpForceData("");
			}
		});

		var calCarI = new Ext.Panel({
			title: 'Card Info',
			region: 'south',
			collapsible: true,
			height: 100,
			autoScroll: true,
			myXplorer: myXplorer,
			bodyStyle: {
				'font-family': '"Andale Mono",courier,fixed,monospace',
				'autoScroll': 'auto',
				'font-size': '0.6em'
			}
		});

		calCarI.on('render',function(panel){
			panel.myXplorer.fillCardInfo(panel);
			return true;
		});

		var p15west = new Ext.Panel({
			region: 'west',
			layout: 'border',
			collapsible: false,
			width: 300,
			items: [ Xtree, calCarI]
		});

		this.informationPanel = new Ext.Panel({
			region: 'center',
			autoScroll: true,
			bodyStyle: {
				'font-family': '"Andale Mono",courier,fixed,monospace',
				'text-align': 'left',
				'font-size' : '0.6em'
			}
		});

		this.fileDumpPanel = new Ext.Panel({
			title: 'Dump',
			region: 'south',
			collapsible: true,
			height: 135,
			autoScroll: true,
			bodyStyle: {
				'font-family': '"Andale Mono",courier,fixed,monospace',
				'autoScroll': 'auto',
				'font-size': '0.6em'            
			}
		});

		var central = new Ext.Panel({
			title: ' Information',
			region: 'center',
			layout: 'border',
			collapsible: false,
			items: [this.informationPanel, this.fileDumpPanel]
		});
		this.apduTracePanel = new Ext.Panel({
			title: 'APDU Trace',
			region: 'south',
			collapsible: true,
			height: 100,
			bodyStyle: {
				'font-family': '"Andale Mono",courier,fixed,monospace',
				'font-size' : '0.6em',
				'text-align': 'left',
				'caption-side': 'bottom',
				'autoScroll': 'auto',
				'wrap': 'off'
			},
			autoScroll: 'true'
		});

		calXplorer = new Ext.Panel({
			renderTo: xId,
			height: 500,
			closable: true,
			title: '** Unknown **',
			layout: 'border',
			items: [p15west, central, this.apduTracePanel]
		});
		guiExt.add(calXplorer).setTitle('XXX Smart Card Explorer');    
}

}

/* start_explorer is loaded by the callback. In case several explorers are loaded
   one after another, start_explorer is overridden. Probably not the cleanest code
   in the world ?
 */

function start_explorer(reader,atr) {
/* First, load all the other scripts that we need */
	if (typeof(defineJS)=="undefined" || typeof(utilsjs)=="undefined" ||
	    typeof(asn1JS)=="undefined" || typeof(calypsoSmartCardJS)=="undefined" ||
	    typeof(Parse_Card_Calypso)=="undefined" || typeof(calypsoOSJS)=="undefined" ||
	    typeof(cardLayout)=="undefined" ){
		setTimeout(function(reader,atr) {
			start_explorer(reader,atr);
		},100,reader,atr);
		return;
	}
	// OK, all scripts were already loaded:
	var calX = new StubXplorer();
	calX.init(reader,atr);

}
	

</script>


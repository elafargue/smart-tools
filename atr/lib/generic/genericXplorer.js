/*
 * Explorer for Generic Smart Cards: simple Script tool.
 *
 * (c) 2008-2009 Edouard Lafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 * Version 2 (June 1991).
 *
 */

GenericXplorer=function(){
};


GenericXplorer.prototype = {
	reader: null,
	atr: null,
	cardNode: null,
	informationPanel: null,
	fileDumpPanel: null,
	apduTracePanel: null,
	cardConnector: null,
	mifKeys: null,

	// Data structures for the Hew dump editor:
	dumpGrid: null,
	dumpData: null,
	dumpDS: null,
	dumpCurrentSector: null,
	dumpCurrentBlock: null,
	dumpEditedRows: new Array(),

	// Methods to work on the Hex editor:
	hexEditorUpdate: function(data, bytesPerLine) {
		// Data shall be a hex string, it will be split into 16 byte chunks and fed to
		// the explorer's data store
		var newData = new Array();
		for (var i=0; i<(data.length/(bytesPerLine*2)); i++) {
			var row = "";
			for (var j = i*bytesPerLine*2; j<(i+1)*bytesPerLine*2; j+=2) {
				row += data.substr(j,2) + " ";
			}
			row = row.substr(0,row.length-1);
			row2 = ['', row, ''];
			newData.push(row2);
		}
		this.dumpDS.loadData(newData);
	},

	hexEditorBlank: function(data) {
		this.dumpDS.loadData([[]]);
	},

	init: function(reader, atr) {
		/* Instanciate the GUI */
	this.reader= reader;
	this.atr = atr;
	this.createGui(this);
	},

	refreshCardTree: function() {
		this.cardConnector = mifareParseMe(this);
		this.informationPanel.body.update("<b>Welcome to the Mifare Explorer</b><p>This tool depends quite a lot on the behaviour of your contactless reader, which means it might or might not work in your case - let me know!<br><br>By clicking on a sector, the explorer will attempt to read the whole sector with the keys that are currently loaded into the reader. This is a simplistic approach and will not work in case access conditions on each block of the sector are different.<br><br>You can also expand the sectors by clicking on the '+' and read individual blocks.<br><br>In order to load new keys into the reader, use the Mifare keys panel on the left and click on 'Set'. Depending on the reader type, those will be stored in the reader either in volatile or non-volatile memory.<br><br>You can select 'Use key A or B' in that panel too, in order to tell the explorer to use one or the other when reading a block or sector. You do not need to click on 'Set' in that case.<br><br>Please let me know if this works for you, and don't hesitate to contact me to add support for other readers, samples are always appreciated.");
	},

	fillCardInfo: function(panel) {
		// Parses the extended ATR information:
		var cardHtml = "Key loading for the Mifare reader will go there";
		panel.html = cardHtml;
	},

	createGui: function(myXplorer){
    //  |-----------------|-------------|
    //  | Title Bar    [R]|  Dump       |
    //  |-----------------|-------------|
    //  |    Commands     |             |         
    //  |    panel        |             |         
    //  |                 |             |         
    //  |                 |             |         
    //  |                 |    Info     |
    //  |-----------------|-------------|
    //  |                APDU           |         
    //  |-------------------------------|
    
    // Create Specific GUI  
	var d = new Date();
	var xId = 'cal-' + d.getTime();
        Ext.DomHelper.append('xPlorer',"<div id='"+xId+"'></div>");

    // All columns are percentages -- they must add up to 1
    var Tree = Ext.tree;
    p15tree = new Tree.TreePanel({
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
    p15tree.setRootNode(this.cardNode);
    p15tree.on('click', function(node){
        var currentPath = node.details;
        var cardInfo;
        // In case the user clicks on the empty tree instead of the refresh button
	if ((node.childNodes.length ==0) && (node.id=="root")) {
		myXplorer.refreshCardTree();
	} else {
	        // disable current dump
        	enableDump = false;
		if(node.id=="root") {
			myXplorer.informationPanel.body.update("<u>Card UID&nbsp;:</u>" + myXplorer.cardConnector.getUID());
			// If we have an Ultralight card, read the whole card here:
			if (myXplorer.cardConnector.mifareCardType=="Ultralight") {
				var dump = "";
				for(var i=0;i<16;i++) {
					dump += myXplorer.cardConnector.readPage(i);
				}
				//myXplorer.fileDumpPanel.body.update("");
				myXplorer.hexEditorBlank();
				myXplorer.hexEditorUpdate(dump,4);
				// dumpH(["",dump], 0, myXplorer.fileDumpPanel, 4 );
			}
		} else {
	        myXplorer.informationPanel.body.update("<u>Mifare sector selected&nbsp;: </u>" + node.id + "<br>");
		if(myXplorer.cardConnector.mifareCardType=="Ultralight") {
			return;
		}
		// Authenticate to the card using key A or B depending on currently selected option
		if(node.attributes.details.block == -1) {
			var readWholeSector = true;
			var blockAuth = 0;
		} else {
			var blockAuth = node.attributes.details.block;
		}
		if (myXplorer.cardConnector.authenticateBlock(
				node.attributes.details.sector,
				blockAuth,
				myXplorer.mifKeys.getForm().getValues().readKey)) {
				if (readWholeSector) {
					var dump = "";
					var bMax = 3;
					if (node.attributes.details.sector > 31) bMax=15;
					for(var l=0;l < bMax;l++) {
						dump +=myXplorer.cardConnector.readBinary(
						node.attributes.details.sector,l);
					}
					// Read the trailer and parse it too
					var trailer = myXplorer.cardConnector.readBinary(
						 node.attributes.details.sector,bMax);
					dump += trailer;
					// Dump is asynchronous: I need to insert the ACL table before..
					if (dump !="")	myXplorer.informationPanel.body.insertHtml("beforeEnd","<br>Access conditions for this sector are the lollowing:<br><br>" + myXplorer.cardConnector.decodeTrailer(trailer));
				} else {
				// Read the block and output it into the dump panel
				var dump = myXplorer.cardConnector.readBinary(
					node.attributes.details.sector,
					node.attributes.details.block
				);
				}
		        	if (dump == "") {
					// myXplorer.fileDumpPanel.body.update("");
					myXplorer.hexEditorBlank();
					dumpH(["",""], 0, myXplorer.fileDumpPanel, 16 );
		        	}
		        	else {
					// myXplorer.fileDumpPanel.body.update("");
					myXplorer.hexEditorBlank();
					myXplorer.hexEditorUpdate(dump,16);
					myXplorer.dumpCurrentBlock = node.attributes.details.block;
					myXplorer.dumpCurrentSector = node.attributes.details.sector;
					// dumpH(["",dump], 0, myXplorer.fileDumpPanel, 16 );
	        		}
		} else {
	        myXplorer.informationPanel.body.update("<b>Authentication Error</b> (check APDU log for details).<br> Possible causes are&nbsp;: wrong Mifare key loaded, wrong key type (A or B) used to authenticate.");
		myXplorer.hexEditorBlank();
//		myXplorer.fileDumpPanel.body.update("Cannot read this sector/block.");
		}

		}
	}
    });


/******************************************
 * Mifare keys manager panel:
 *
 ******************************************
 */

  this.mifKeys = new Ext.FormPanel({
            title: 'Mifare Keys',
            region: 'south',
            collapsible: true,
            height: 110,
	    myXplorer: myXplorer,
            bodyStyle: {
                'font-family': '"Andale Mono",courier,fixed,monospace',
                'padding': '5px',
                'font-size': '0.6em'
            },
	    labelWidth: 50,
	    defaultType: 'textfield',
	    items: [{
		xtype: 'label',
		html: 'Keys that will be used for sector authentication'},{
		fieldLabel: 'Key A',
		maxLength: 12,
		maxLengthText: 'Mifare Keys are only 6 bytes long',
		regex: new RegExp("[A-Fa-f0-9]{12}"),
		regexText: 'Please enter a 6-byte Hex string',
		value: 'A0A1A2A3A4A5',
		name: 'keyA',
		allowBlank: false
		},{
		fieldLabel: 'Key B',
		maxLength: 12,
		maxLengthText: 'Mifare Keys are only 6 bytes long',
		value: 'B0B1B2B3B4B5',
		regex: new RegExp("[A-Fa-f0-9]{12}"),
		regexText: 'Please enter a 6-byte Hex string',
		name: 'keyB',
		allowBlank: false
		},{
		xtype: 'radiogroup',
		fieldLabel: 'Use key',
		items: [
			{boxLabel:'A',name: 'readKey',inputValue:0,checked:true},
			{boxLabel:'B',name: 'readKey',inputValue:1}
		]
		}]
	});

    // simple button add
    this.mifKeys.addButton('Set', function(){
	myXplorer.informationPanel.body.update("<u>Loading this Mifare key set into reader key number 0x00 and 0x01</u><br>" + myXplorer.mifKeys.getForm().getValues().keyA + " - " + myXplorer.mifKeys.getForm().getValues().keyB);
	if (myXplorer.cardConnector.loadKey(myXplorer.mifKeys.getForm().getValues().keyA,
					    myXplorer.mifKeys.getForm().getValues().keyB)) {
		myXplorer.informationPanel.body.insertHtml("beforeEnd", " - Success.");
	} else {
		myXplorer.informationPanel.body.insertHtml("beforeEnd", " - Failure. Possible cause is that the reader does not support this mechanism.");
	};
    });



   var p15west = new Ext.Panel({
	region: 'west',
	layout: 'border',
	collapsible: false,
	width: 300,
	items: [ p15tree, this.mifKeys]
   });


   this.informationPanel = new Ext.Panel({
            title: 'Information - Status',
            region: 'south',
            autoScroll: true,
	    collapsible: true,
            height: 130,
            bodyStyle: {
                'font-family': '"Andale Mono",courier,fixed,monospace',
                'text-align': 'left',
		'font-size' : '0.6em'
            }
        });

/******************************************
 * Hexadecimal editor panel:
 * TODO: shall become its own object, reuseable in other
 *       situations... I don't have enough time!
 ******************************************
 */

	this.dumpData = [[]
	];
 
	this.dumpDS = new Ext.data.ArrayStore({
		fields: [
			{name: 'address'},
			{name: 'value'},
			{name: 'ascii'}
		]
	});
	this.dumpDS.loadData(this.dumpData);
 
	// TODO: this is where we shall do the coherence check when users edit the HEX data
	var colModel = new Ext.grid.ColumnModel([
		{ header: "Address",
		  width: 100,
		  sortable: false,
		  dataIndex: 'address',
		  id: 'address',
		  renderer: function(value, p, r, row, col) {
			// Computes the offset
			// Assumes each preceeding line contains the same number of bytes.
			if (row == 0) { return "00000000";} else {
				var offset = row * (r.store.getAt(row-1).data['value'].length+1)/3;
				var returnValue = "00000000" + offset.toString(16);
				return returnValue.substring(returnValue.length - 8, returnValue.length);
			}
		   }
		},
		{header: "Value",
		 width: 500,
		 sortable: false,
 		 dataIndex: 'value',
		 id:'value',
	         editor: new Ext.form.TextField({
				allowBlank: false,
				regex: new RegExp("[A-Fa-f0-9]"),
				regexText: 'Please enter a 16-byte Hex string',
		  })
         	},
		{header: "ASCII",
		 width: 150,
		 sortable: false,
		 dataIndex: 'ascii',
		 id:'ascii',
		 renderer: function (value, p, r) {
			// Translates the value field into a ASCII dump
				var hexString = r.data['value'];
				var returnValue = "";
				for (var i = 0; i < (hexString.length+1)/3; i++) {
				   var current = parseInt(hexString.substr(i*3, 2), 16);
				   if ((current >= 0x20) && (current < 0x7f)) {
					returnValue += String.fromCharCode(current, 16).substr(0, 1);
				   } else {
					returnValue += ".";
				   }
				}
				return returnValue;
		}}
	]);
 
	this.dumpGrid = new Ext.grid.EditorGridPanel({
	        store: this.dumpDS,
	        colModel: colModel,
		clicksToEdit: 1,
		myXplorer: myXplorer,
	        autoExpandColumn: 'value', // column with this id will be expanded
	        title: 'Hex Dump',
		tbar: [{
		xtype: 'label',
		html: 'Use Key&nbsp;:'},{
		xtype: 'radiogroup',
		id: 'writeKey',
		fieldLabel: 'Use key',
		items: [
			{boxLabel:'A',name: 'wrKey',inputValue:0,checked:true},
			{boxLabel:'B',name: 'wrKey',inputValue:1}
		]
		},
		'-',
		{	    xtype: 'checkbox',
		            boxLabel: 'Write changes upon edit',
			    id: 'autoWrite'
		        }]
	});

	this.dumpGrid.on('validateedit', function(e) {
		// Saves the changes into a table used by the toolbar ("write changes") to know
		// what are the values to modify.
		if (myXplorer.dumpGrid.getTopToolbar().getComponent('autoWrite').getValue()) {
			var keyName = myXplorer.dumpGrid.getTopToolbar().getComponent('writeKey').getValue().inputValue;
			var block = myXplorer.dumpCurrentBlock;
			if ( block == -1 ) { block = e.row; }
			var sector = myXplorer.dumpCurrentSector;
			// Reformat the data to remove the spaces:
			var data = "";
			for (var i = 0; i < (e.value.length+1)/3; i++) {
				data += e.value.substr(i*3,2);
			}
			// Now write the data to the field and remove the 'dirty' flag if successful:
			if (myXplorer.cardConnector.authenticateBlock(sector, block, keyName)) {
				if (myXplorer.cardConnector.updateBinary(sector, block, data)) {
					// e.cancel = true;
					// e.record.data[e.field] = e.value;
				}
			}
		} else {
			// Write changes is false: we cancel the edit
			e.cancel = true;
		}
	}, this);

   this.fileDumpPanel = new Ext.Panel({
	  region: 'center',
	  layout: 'fit',
          bodyStyle: {
                'font-family': '"Andale Mono",courier,fixed,monospace',
                'autoScroll': 'auto',
                'font-size': '0.8em'            
            },
	  items : [ this.dumpGrid ],
//	  title : "Hexadecimal Editor"
	});


    var central = new Ext.Panel({
        region: 'center',
        layout: 'border',
        collapsible: false,
        items: [this.fileDumpPanel, this.informationPanel]
    
    });


    this.apduTracePanel = new Ext.Panel({
            title: 'PC/SC APDU Trace',
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


    mifXplorer = new Ext.Panel({
        renderTo: xId,
        height: 500,
	closable: true,
        title: '** Unknown **',
        layout: 'border',
        items: [p15west, central, this.apduTracePanel]
    });


   guiExt.add(mifXplorer).setTitle('Mifare Explorer');    
   myXplorer.refreshCardTree();
}
}


var mifareXplorerJS = true;


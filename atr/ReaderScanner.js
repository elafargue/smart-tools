/**
 * @author elafargue, based on earlier work by rdollet
 *  edouard@lafargue.name
 *
 *  Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *           Version 2 (June 1991).
 */
var enableScan;
var enableDump;
var g_reader = null;
// reference local blank image
Ext.BLANK_IMAGE_URL = 'resources/images/default/s.gif';

 

// Create one single instance of PCSC context for the application:
var mySConnectService = null;

// Create a global reader list so that upon reader list refresh, the
// reader status is preserverd
var readerList = new Array();

// Create Tooltip
function createTooltip(elementID, TitleT, TextT){

    Ext.QuickTips.register({
        target: Ext.get(elementID),
        True: true,
        Delay: 10,
        showDelay: 10,
        hideDelay: 10,
        animate: true,
        autoHide: true,
        text: TextT,
        title: TitleT
    });
}

// Remove Tooltip
function removeToolTip(elementID){
    Ext.QuickTips.unregister(Ext.get(elementID));
}

// Establish SConnect + Auto-install if required
function checkSConnect(){

    if (SConnect.IsInstalled() === false) {
        SConnect.TriggerInstall();
        return false;
    }
    return true;
}

/* Shall be called on page exit in order to properly destroy the PCSC handle
 */
function Exit() {
	if (mySConnectService) {
		mySConnectService.unregisterStatusChangeListener();
		mySConnectService.dispose();
	}
}


// List available readers connected to the machine
// Respawned every two seconds to detect new reader insertion.
// (does not work properly because readers with inserterd cards
//  reappear as red when they are rescanned...)

// readersPanel is a Ext.Panel
function RefreshListPCSCReaders(readersPanel){

        var el = Ext.get("readerListing");
        var i = 0;
//	var el = readersPanel.items.itemAt(0);

        try {
            var listReader = mySConnectService.listReaders(false);
            // loop on readers number
            newInnerHTML = "<ul class=\"readers-list\">";
            for (i = 0; i < listReader.length; i++) {
                var readerPCSCname = listReader[i];
                var readerPCSCnameShort = listReader[i].substring(0, listReader[i].length - 1);
                newInnerHTML += "<li id='" + readerPCSCname + "' class ='reader-listed-disabled' >" + readerPCSCnameShort + "</li>";
            }
            if (i === 0) {
                newInnerHTML = "* No reader detected *";
            }
        }
        catch (e) {
            newInnerHTML = "* No reader detected *";
        }

	newInnerHTML += "</ul><p>&nbsp;</p><p>&nbsp;</p><p class=\"readerIntro\">When a card is inserted in the reader, the reader icon turns green. Click on the reader name or icon to parse the card ATR.</p>";        

        // Update current list
  //      el.body.update(newInnerHTML);
        el.update(newInnerHTML);

    if (enableScan) {
	setTimeout("RefreshListPCSCReaders()",2000);
    }
}

// This is the main function: build the GUI, start the event
// detectors
Ext.onReady(mainFunction);
function mainFunction(){

    // Enable Quick Tips
    Ext.QuickTips.init();
    
    // Ensure SConnect is correctly installed
    if (checkSConnect() !== true) {
        return false;
    } else {

    // Initialize the GUI using EXT:
	createExtGui();
	enableScan = false;
        // Update reader list:
        if (!mySConnectService) {
		mySConnectService = new SConnect.PCSC();
	}
        var el = Ext.get("readerListing");
        RefreshListPCSCReaders(el);
        // Start the card insertion/removal detector:
        InitCardDetection();
   }
}

function InitCardDetection(){ 
	mySConnectService.registerStatusChangeListener(myCardEventDetector);
}

// Detects card insertion and updates the reader list:
function myCardEventDetector  (reader, status) {

   if(status=="inserted"||status=="1"){
	// Need to check protocol by trial and error as all readers do not implement protocol
	// detection in a reliable way (SCM Micro readers fail in contactless mode for example
	 try {
	    var con = mySConnectService.isConnected();
	    if (con) mySConnectService.disconnect();
            var res=mySConnectService.connect(reader,SCardAccessMode.Shared,SCardProtocolIdentifiers.T0);
	} catch(e) { 
	   try {
	         var res=mySConnectService.connect(reader,SCardAccessMode.Shared,SCardProtocolIdentifiers.T1);
		} catch(e) { alert("Could not read the card in reader" + reader);}
	}
        if(res==true){
             cardATR=mySConnectService.cardStatus().ATR;
             try{
                   mySConnectService.disconnect();
                 }catch(e){
			 // We can end up here if we try to disconnect without a previous connect, no need to alert...
			  }
	// Put the corresponding card reader name in boldface and create the toolTip:
	// + event listener
        var el = Ext.get(reader);
	el.replaceClass("reader-listed-disabled","reader-listed-enabled");
	el.addListener('click',ParseATR,this,{ atr: cardATR, reader: reader});
        createTooltip(reader, "card ATR in " + reader + ":", cardATR);
         }
    } else if (status=="removed" || status=="0") {
	// Put the corresponding card reader name in normal style and remove event listener:
	var el= Ext.get(reader);
	el.replaceClass("reader-listed-enabled","reader-listed-disabled");
	el.removeAllListeners();
        removeToolTip(reader);

    }    
}


function createExtGui(){
    //  |-------------------------------|
    //  |   Title /Tabs                 |
    //  |-------------------------------|
    //  |             |                 |
    //  |             |   ATR Parse     |
    //  |   Readers   |---------------- |
    //  |             |                 |
    //  |             |    Card info    |
    //  |-------------|-----------------|
 

    // Create Specific GUI 
    Ext.DomHelper.append('xPlorer',"<div id='readerListing'></div><div id='atrParse'></div><div id='cardInfo'></div>");
    
    var readersList = new Ext.Panel({
        title: ' Card Readers',
        region: 'west',
        layout: 'border',
        collapsible: false,
	width: 300,
        items: [{
            region: 'center',
            contentEl: 'readerListing',
            autoScroll: true,
            bodyStyle: {
                'font-family': '"Andale Mono",courier,fixed,monospace',
		'font-size': '0.8em',
                'text-align': 'left'
            }
	  }]
/*	tools: [{
    		id:'refresh',
    		qtip: 'Parse/Refresh',
    		handler: function(event, toolEl, panel){
        	// refresh logic
		RefreshListPCSCReaders(panel);
	    }
	}],
*/
        });

    var central = new Ext.Panel({
        title: ' ATR Parsing',
        region: 'center',
        layout: 'border',
        collapsible: false,
        items: [{
            region: 'center',
            contentEl: 'atrParse',
            autoScroll: true,
            bodyStyle: {
                'font-family': '"Andale Mono",courier,fixed,monospace',
		'font-size': '10pt',
                'text-align': 'left'
            }
        }, {
            title: 'Card information',
            region: 'south',
            collapsible: true,
            height: 135,
            autoScroll: true,
            contentEl: 'cardInfo',
            bodyStyle: {
                'font-family': '"Andale Mono",courier,fixed,monospace',
                'autoScroll': 'auto',
                'font-size': '0.8em'     
            }
        }]
    
    });

   atrParser = new Ext.Panel({
/*        renderTo: 'atrContainer', */
        height: 620,
        layout: 'border',
	title: 'ATR Parser',
        items: [readersList, central]
        });

   guiExt = new Ext.TabPanel({
	renderTo: 'tabPanel',
	activeTab: 0,
	height: 620,
	items: [ atrParser
	]

   });

   var viewport = new Ext.Viewport({
		layout: 'border',
		items: [
			new Ext.BoxComponent({
				region: 'north',
				el: 'pageHeader'
			}), {
			region: 'center',
			layout: 'fit',
			items: 	guiExt
			}, 
			new Ext.BoxComponent({
				region: 'south',
				el: 'pageFooter'
			})
		]
	});
    
}





	this.dumpData = [
		['000000',"00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00","................"]
	];
 
	this.dumpDS = new Ext.data.Store({
		proxy: new Ext.data.MemoryProxy(this.dumpData),
		reader: new Ext.data.ArrayReader({id: 0}, [
			{name: 'address'},
			{name: 'value'},
			{name: 'ascii'}
		])
	});
	this.dumpDS.load();
 
	// TODO: this is where we will do the coherence check when users edit the HEX data
	var colModel = new Ext.grid.ColumnModel([
		{header: "Address", width: 60, sortable: false, dataIndex: 'address', id: 'address'},
		{header: "Value",  width: 500, sortable: false, dataIndex: 'value', id:'value',
	                editor: new Ext.form.TextField({
				allowBlank: false,
				regex: new RegExp("[A-Fa-f0-9]"),
				regexText: 'Please enter a 16-byte Hex string',
			})
         	},
		{header: "ASCII",  width: 150,sortable: false, dataIndex: 'ascii', id:'value'},
	]);
 
	this.dumpGrid = new Ext.grid.EditorGridPanel({
	        store: this.dumpDS,
	        colModel: colModel,
		clicksToEdit: 1,
	        autoExpandColumn: 'value', // column with this id will be expanded
	        title: 'Hex Dump',
		tbar: [{
		            text: 'Update',
		            handler : function(){
		                // grid.stopEditing();
		                // store.insert(0, p);
		                // grid.startEditing(0, 0);
		            }
		        }]
	});

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


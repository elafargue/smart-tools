
/**
 * @author rdollet
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

// Register:
var cardLayout = true;

//********  File Base Object ***************
 function fileClass (fileIDtoSelect){
	
	// Define Private Variables
	this.fileID = fileIDtoSelect;
	this.parentFile=null;
	this.fileFamily = "Generic";
	this.fileName ="";
	this.rawFileAttribute = "";

	this.select = function(newFileIDToSelect) {
			var selectedFile = new fileClass(newFileIDToSelect);
			selectedFile.setParent( this );	
			return(selectedFile);
		};
	this.setFileID = function(fileID) {
			this.fileID = fileID;
		};
	this.setParent= function(parentOfFile){
			this.parentFile=parentOfFile;
		};
		
	this.getParent = function(){
			return(this.parentFile);
		};
		
	this.getPath = function(){
			if (this.parentFile === null) {
				return (this.fileID);
			}
			return( this.parentFile.getPath() + '\\' + this.fileID);
	};
	this.extendClass = function(referenceClass){ 
		extendObject(this, referenceClass);
	};

}

dfFileClass = function(fileIDtoSelect){
	
	// Extension
	this.getListChildren = "";
	

};

efFileClass = function(fileIDtoSelect){

	// Extension
	this.getContent =  "";

};

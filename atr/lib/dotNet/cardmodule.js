/*******************************************/
// Stub area:
/*******************************************/

// Register the load of the script (see start_explorer in dotNet-xplore.js):
var cardmodule = true;

SConnect.RegisterNamespace("Axalto.netCard.CardModule");

Axalto.netCard.CardModule.CardModuleService=function(readerName,portNum,serviceName){
	this.marshaller=new SConnect.Marshaller(readerName,portNum,serviceName,0xC04B4E,0x7FBD);
	}
Axalto.netCard.CardModule.CardModuleService.IsPresent=function(readerName,serviceName){
	if(SConnect.Marshaller.IsGemaltoNet(readerName)==true){
		return SConnect.Marshaller.IsServicePresent(readerName,serviceName,0xC04B4E,0x7FBD,0);
	}
	return false;
}
Axalto.netCard.CardModule.CardModuleService.prototype={
	ChangeReferenceData:function(mode,role,oldPin,newPin,maxTries){
		this.marshaller.invoke(5,0xE08A,MARSHALLER_TYPE_IN_U1,mode,MARSHALLER_TYPE_IN_U1,role,MARSHALLER_TYPE_IN_U1ARRAY,oldPin,MARSHALLER_TYPE_IN_U1ARRAY,newPin,MARSHALLER_TYPE_IN_S4,maxTries,MARSHALLER_TYPE_RET_VOID);
	},

	CreateCAPIContainer:function(ctrIndex,keyImport,keySpec,keySize,keyValue){
		this.marshaller.invoke(5,0x0234,MARSHALLER_TYPE_IN_U1,ctrIndex,MARSHALLER_TYPE_IN_BOOL,keyImport,MARSHALLER_TYPE_IN_U1,keySpec,MARSHALLER_TYPE_IN_S4,keySize,MARSHALLER_TYPE_IN_U1ARRAY,keyValue,MARSHALLER_TYPE_RET_VOID);
	},

	DeleteCAPIContainer:function(ctrIndex){
		this.marshaller.invoke(1,0xF152,MARSHALLER_TYPE_IN_U1,ctrIndex,MARSHALLER_TYPE_RET_VOID);
	},

	PrivateKeyDecrypt:function(ctrIndex,keyType,encryptedData){
		return this.marshaller.invoke(3,0x6144,MARSHALLER_TYPE_IN_U1,ctrIndex,MARSHALLER_TYPE_IN_U1,keyType,MARSHALLER_TYPE_IN_U1ARRAY,encryptedData,MARSHALLER_TYPE_RET_U1ARRAY);
	},

	CreateFile:function(path,acls,initialSize){
		this.marshaller.invoke(3,0xBEF1,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_IN_U1ARRAY,acls,MARSHALLER_TYPE_IN_S4,initialSize,MARSHALLER_TYPE_RET_VOID);
	},

	CreateDirectory:function(path,acls){
		this.marshaller.invoke(2,0xACE9,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_IN_U1ARRAY,acls,MARSHALLER_TYPE_RET_VOID);
	},

	WriteFile:function(path,data){
		this.marshaller.invoke(2,0xF20E,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_IN_U1ARRAY,data,MARSHALLER_TYPE_RET_VOID);
	},

	DeleteFile:function(path){
		this.marshaller.invoke(1,0x6E2B,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_VOID);
	},

	DeleteDirectory:function(path){
		this.marshaller.invoke(1,0x9135,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_VOID);
	},

	FirstInitialization:function(prepareCard){
		this.marshaller.invoke(1,0xE970,MARSHALLER_TYPE_IN_BOOL,prepareCard,MARSHALLER_TYPE_RET_VOID);
	},

	IsAuthenticated:function(role){
		return this.marshaller.invoke(1,0x9B0B,MARSHALLER_TYPE_IN_U1,role,MARSHALLER_TYPE_RET_BOOL);
	},

	GetChallenge:function(){
		return this.marshaller.invoke(0,0xFA3B,MARSHALLER_TYPE_RET_U1ARRAY);
	},

	ExternalAuthenticate:function(response){
		this.marshaller.invoke(1,0x24FE,MARSHALLER_TYPE_IN_U1ARRAY,response,MARSHALLER_TYPE_RET_VOID);
	},

	VerifyPin:function(role,pin){
		this.marshaller.invoke(2,0x506B,MARSHALLER_TYPE_IN_U1,role,MARSHALLER_TYPE_IN_U1ARRAY,pin,MARSHALLER_TYPE_RET_VOID);
	},

	GetTriesRemaining:function(role){
		return this.marshaller.invoke(1,0x6D08,MARSHALLER_TYPE_IN_U1,role,MARSHALLER_TYPE_RET_S4);
	},

	GetCAPIContainer:function(ctrIndex){
		return this.marshaller.invoke(1,0x9B2E,MARSHALLER_TYPE_IN_U1,ctrIndex,MARSHALLER_TYPE_RET_U1ARRAY);},

	QueryFreeSpace:function(){return this.marshaller.invoke(0,0x00E5,MARSHALLER_TYPE_RET_S4ARRAY);},

	QueryKeySizes:function(){return this.marshaller.invoke(0,0x5EE4,MARSHALLER_TYPE_RET_S4ARRAY);},

	ReadFile:function(path,maxBytesToRead){
		return this.marshaller.invoke(2,0x744C,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_IN_S4,maxBytesToRead,MARSHALLER_TYPE_RET_U1ARRAY);},

	GetFiles:function(path){return this.marshaller.invoke(1,0xE72B,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_STRINGARRAY);},

	GetFileProperties:function(path){return this.marshaller.invoke(1,0xA01B,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_U1ARRAY);},

	LogOut:function(role){this.marshaller.invoke(1,0xC4E4,MARSHALLER_TYPE_IN_U1,role,MARSHALLER_TYPE_RET_VOID);},

	SerializeData:function(filename){this.marshaller.invoke(1,0x9AEA,MARSHALLER_TYPE_IN_STRING,filename,MARSHALLER_TYPE_RET_VOID);},

	DeSerializeData:function(filename){this.marshaller.invoke(1,0xA373,MARSHALLER_TYPE_IN_STRING,filename,MARSHALLER_TYPE_RET_VOID);},

	get_SerialNumber:function(){return this.marshaller.invoke(0,0xD017,MARSHALLER_TYPE_RET_U1ARRAY);},

	get_Version:function(){return this.marshaller.invoke(0,0xDEEC,MARSHALLER_TYPE_RET_STRING);},

	dispose:function(){this.marshaller.dispose();
	}
	};

/******************************************
 *  Implementation
 *****************************************/

SConnect.RegisterNamespace("CMSLite");
CMSLite.MSCMException=function(){
	this._triesRemaining=-1;
	this._isUnhandled=false;
};

CMSLite.MSCMException.prototype={
	get_triesRemaining:function(){return this._triesRemaining;},
	set_triesRemaining:function(val){this._triesRemaining=val;},
	setUnhandled:function(){this._isUnhandled=true;},
	isUnhandled:function(){return this._isUnhandled;}
};

CMSLite.MSCM=function(){
	this._cm=new Axalto.netCard.CardModule.CardModuleService("selfdiscover",5,"MSCM");
};

CMSLite.MSCM.Role=function(){};
CMSLite.MSCM.Role.USER=1;
CMSLite.MSCM.Role.ADMIN=2;
CMSLite.MSCM.Role.EVERYONE=3;
CMSLite.MSCM.Permission=function(){};
CMSLite.MSCM.Permission.EXECUTE=1;
CMSLite.MSCM.Permission.READ=4;
CMSLite.MSCM.Permission.WRITE=2;
CMSLite.MSCM.PINMode=function(){};
CMSLite.MSCM.PINMode.UNBLOCK=1;
CMSLite.MSCM.PINMode.CHANGE=0;

CMSLite.MSCM.prototype={

	userdirName: "edvero",

	dispose:function(){
		if(this._cm!=null){
		   this._cm.dispose();
		   this._cm=null;
		}
	},

	authenticateUser:function(pinVal){
		var aval=new Array();
		for(var i=0;i<pinVal.length;i++){aval[i]=pinVal.charCodeAt(i);}
		try{
		  this._cm.VerifyPin(CMSLite.MSCM.Role.USER,aval);
		} catch(e){
		  if(e instanceof SConnect.MarshallerException){
		    if(e.getExceptionClass()=="UnauthorizedAccessException"){return false;}
		  }
		}
		return true;
	},

	getCAPIContainer:function(ctrIndex) {
		var cont =  this._cm.GetCAPIContainer(ctrIndex);
		return SConnect.TypeUtils.byteArrayToHexString(cont).toUpperCase();
	},

	isUserAuthenticated:function(role) {
		return this._cm.IsAuthenticated(role);
	},

	authenticateAdmin:function(response){
		var cryptogram=SConnect.TypeUtils.hexStringToByteArray(response);
		try{
			this._cm.ExternalAuthenticate(cryptogram);
		} catch(e){
			if(e instanceof SConnect.MarshallerException){
			if(e.getExceptionClass()=="UnauthorizedAccessException"){return false;}}
		}
		return true;
	},

	getUserRemainingTries:function(){
		return this._cm.GetTriesRemaining(CMSLite.MSCM.Role.USER);
	},

	getAdminRemainingTries:function(){
		return this._cm.GetTriesRemaining(CMSLite.MSCM.Role.ADMIN);
	},

	unblockUserPIN:function(newPIN,response,attempts){
		var newPINarray=new Array();
		for(i=0;i<newPIN.length;i++){
			newPINarray[i]=newPIN.charCodeAt(i);
		}

		var cryptogram=SConnect.TypeUtils.hexStringToByteArray(response);
		if(typeof(attempts)=="undefined"){
			pinAttempts=-1;} else { pinAttempts=attempts;}
		this._cm.ChangeReferenceData(CMSLite.MSCM.PINMode.UNBLOCK,CMSLite.MSCM.Role.ADMIN,cryptogram,newPINarray,pinAttempts);
	},

	checkNewPINSanity:function(newPIN){},

	changeUserPIN:function(oldPIN,newPIN){
		this.checkNewPINSanity(newPIN);
		var oldPINarray=new Array();
		for(i=0;i<oldPIN.length;i++){oldPINarray[i]=oldPIN.charCodeAt(i);}
		var newPINarray=new Array();
		for(i=0;i<newPIN.length;i++){newPINarray[i]=newPIN.charCodeAt(i);}
		this._cm.ChangeReferenceData(CMSLite.MSCM.PINMode.CHANGE,CMSLite.MSCM.Role.USER,oldPINarray,newPINarray,-1);},

	changeAdminKey:function(cryptogram,Adminkey){
		this._cm.ChangeReferenceData(CMSLite.MSCM.PINMode.CHANGE,CMSLite.MSCM.Role.ADMIN,cryptogram,Adminkey,-1);},

	getChallenge:function(){
		var ch=this._cm.GetChallenge();
		return SConnect.TypeUtils.byteArrayToHexString(ch).toUpperCase();},

	getFileSize:function(file){
		var properties=this._cm.GetFileProperties(file);
		var size=properties[3]+(properties[4]*256)+(properties[5]*65536)+(properties[6]*16777216);
		return size;},

	getFiles:function(directory){
		var files=this._cm.GetFiles(directory);
		return files;},

	deleteFile:function(file){
		this._cm.DeleteFile(file);return;},

	deleteDirectory:function(directory){
		this._cm.DeleteDirectory(directory);return;},

	deleteCAPIContainer:function(index){
		this._cm.DeleteCAPIContainer(index);return;},

	createFile:function(path,acls,initialSize){
		this._cm.CreateFile(path,acls,initialSize);return;},

	writeFile:function(path,data){
		this._cm.WriteFile(path,data);return;},

	readFile:function(path,maxbytestoread){
		var data = this._cm.ReadFile(path,maxbytestoread);return data;},


	createDirectory:function(path,acls){
		this._cm.CreateDirectory(path,acls);return;
	},

	get_SerialNumber:function(){
		return this._cm.get_SerialNumber();},

	createUserProfilesDir:function(){
		var acls=new Array(CMSLite.MSCM.Permission.WRITE|CMSLite.MSCM.Permission.READ,CMSLite.MSCM.Permission.WRITE|CMSLite.MSCM.Permission.READ,0);
		try {
	 	  this._cm.CreateDirectory(this.userdirName,acls);
		} catch(e) {
			alert(e.getExceptionClass());
		}
	},

	getUserProfiles:function(){
		var userprofiles=[];
		try {
			userprofiles=this._cm.GetFiles(this.userdirName);
		    } catch(e) {
			if(e instanceof SConnect.MarshallerException) {
				if(e.getExceptionClass()!="DirectoryNotFoundException"){
					alert("UnhandledException");
					return userprofiles;}
					else {
					this.createUserProfilesDir();}
					}
			else {
				alert("UnhandledException");
				return userprofiles;}
			}
		var userprofilesUpdated=[];
		for(var i=0;i<userprofiles.length;i++){
			userprofilesUpdated.push(userprofiles[i]);}
			return userprofilesUpdated;
		},

	createUserProfile:function(name,value){
		if(name==""||name==null||value==""||value==null)
			return;
		var acls=new Array(CMSLite.MSCM.Permission.WRITE|CMSLite.MSCM.Permission.READ,CMSLite.MSCM.Permission.WRITE|CMSLite.MSCM.Permission.READ,0);
		var utf8encoded=SConnect.TypeUtils.utf8Encode(value);
		var userprofiles=this._cm.GetFiles(this.userdirName);
		for(var i=0;i<userprofiles.length;i++){
			if(userprofiles[i]==name){
				this._cm.WriteFile(this.userdirName+"\\"+name,utf8encoded);
				return;
			}
		}
		try {
		  this._cm.CreateFile(this.userdirName+"\\"+name,acls,0);
		} catch(e) { alert(e.getExceptionClass()); }
		this._cm.WriteFile(this.userdirName+"\\"+name,utf8encoded);},

	getUserProfile:function(name){
		var utf8encoded=this._cm.ReadFile(this.userdirName+"\\"+name,0);
		return SConnect.TypeUtils.utf8Decode(utf8encoded,0,utf8encoded.length);
	},

	deleteUserProfile:function(name){
		this._cm.DeleteFile(this.userdirName+"\\"+name);},

	wipeUserProfile:function() {
		this.deleteUserProfile("profile");
		this.deleteDirectory(this.userdirName);
	}

	};

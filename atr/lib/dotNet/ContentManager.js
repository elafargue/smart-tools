var ContentManager = true;


SConnect.RegisterNamespace("SmartCard");
SmartCard.ContentManager=function(readerName,portNum,serviceName){
	this.marshaller=new SConnect.Marshaller(readerName,portNum,serviceName,0xF5EFBF,0xB18C);
}

SmartCard.ContentManager.prototype={
	ReaderName:function(){
		return this.marshaller.readerName;
	},
	OpenFile:function(path,fileMode,fileAccess){
		this.marshaller.invoke(3,0xA566,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_IN_S4,fileMode,MARSHALLER_TYPE_IN_S4,fileAccess,MARSHALLER_TYPE_RET_VOID);
	},
	AppendToFile:function(memStream){
		this.marshaller.invoke(1,0x22AC,MARSHALLER_TYPE_IN_MEMORYSTREAM,memStream,MARSHALLER_TYPE_RET_VOID);
	},
	ReadFromFile:function(){
		return this.marshaller.invoke(0,0xED10,MARSHALLER_TYPE_RET_MEMORYSTREAM);
	},
	CloseFile:function(){
		this.marshaller.invoke(0,0x6B9E,MARSHALLER_TYPE_RET_VOID);
	},
	LoadFile:function(path,data){
		this.marshaller.invoke(2,0xB3D9,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_IN_U1ARRAY,data,MARSHALLER_TYPE_RET_VOID);
	},
	LoaderWrite:function(data){
		this.marshaller.invoke(1,0xB9AA,MARSHALLER_TYPE_IN_MEMORYSTREAM,data,MARSHALLER_TYPE_RET_VOID);
	},
	Async_LoaderWrite:function(data,handler){
		this.marshaller.setUpAsyncCall(handler);
		return this.marshaller.invoke(1,0xB9AA,MARSHALLER_TYPE_IN_MEMORYSTREAM,data,MARSHALLER_TYPE_RET_VOID);
	},
	RemovePrivateFileEvidence:function(filePath,publicKeyToken){
		this.marshaller.invoke(2,0x615F,MARSHALLER_TYPE_IN_STRING,filePath,MARSHALLER_TYPE_IN_U1ARRAY,publicKeyToken,MARSHALLER_TYPE_RET_VOID);
	},
	RemovePrivateDirectoryEvidence:function(directoryPath,publicKeyToken){
		this.marshaller.invoke(2,0xAE91,MARSHALLER_TYPE_IN_STRING,directoryPath,MARSHALLER_TYPE_IN_U1ARRAY,publicKeyToken,MARSHALLER_TYPE_RET_VOID);
	},
	GetLogicalDrives:function(){
		return this.marshaller.invoke(0,0xBBC9,MARSHALLER_TYPE_RET_STRINGARRAY);
	},
	GetDirectories:function(path){
		return this.marshaller.invoke(1,0xEC94,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_STRINGARRAY);
	},
	GetFiles:function(path){
		return this.marshaller.invoke(1,0xE72B,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_STRINGARRAY);
	},
	CreateDirectory:function(directoryPath){
		this.marshaller.invoke(1,0xEFF6,MARSHALLER_TYPE_IN_STRING,directoryPath,MARSHALLER_TYPE_RET_VOID);
	},
	GetServices:function(extended){
		return this.marshaller.invoke(1,0xBF40,MARSHALLER_TYPE_IN_BOOL,extended,MARSHALLER_TYPE_RET_STRINGARRAY);
	},
	GetAppDomainSize:function(uri,assemblyServerPath){
		return this.marshaller.invoke(2,0xAAA7,MARSHALLER_TYPE_IN_STRING,uri,MARSHALLER_TYPE_IN_STRING,assemblyServerPath,MARSHALLER_TYPE_RET_S4);
	},
	GetServiceStatus:function(uri,assemblyServerPath){
		return this.marshaller.invoke(2,0x7514,MARSHALLER_TYPE_IN_STRING,uri,MARSHALLER_TYPE_IN_STRING,assemblyServerPath,MARSHALLER_TYPE_RET_S4);
	},
	LifecycleChange:function(uri,assemblyServerPath,stateChange){
		this.marshaller.invoke(3,0x6B41,MARSHALLER_TYPE_IN_STRING,uri,MARSHALLER_TYPE_IN_STRING,assemblyServerPath,MARSHALLER_TYPE_IN_S4,stateChange,MARSHALLER_TYPE_RET_VOID);
	},
	GetFile:function(path){
		return this.marshaller.invoke(1,0x6094,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_U1ARRAY);
	},
	LoaderOpen:function(assemblyPath){
		this.marshaller.invoke(1,0xC4BF,MARSHALLER_TYPE_IN_STRING,assemblyPath,MARSHALLER_TYPE_RET_VOID);
	},
	LoaderWrite:function(data){
		this.marshaller.invoke(1,0x390C,MARSHALLER_TYPE_IN_U1ARRAY,data,MARSHALLER_TYPE_RET_VOID);
	},
	LoaderClose:function(signature){
		this.marshaller.invoke(1,0x7026,MARSHALLER_TYPE_IN_MEMORYSTREAM,signature,MARSHALLER_TYPE_RET_VOID);
	},
	LoaderClose:function(signature){
		this.marshaller.invoke(1,0x6C9D,MARSHALLER_TYPE_IN_U1ARRAY,signature,MARSHALLER_TYPE_RET_VOID);
	},
	Async_LoaderClose:function(signature,handler){
		this.marshaller.setUpAsyncCall(handler);
		return this.marshaller.invoke(1,0x6C9D,MARSHALLER_TYPE_IN_U1ARRAY,signature,MARSHALLER_TYPE_RET_VOID);
	},
	LoaderCancel:function(){
		this.marshaller.invoke(0,0x2A39,MARSHALLER_TYPE_RET_VOID);
	},
	GetAssemblyHash:function(path){
		return this.marshaller.invoke(1,0xEDD1,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_U1ARRAY);
	},
	GetAssemblyPublicKeyToken:function(path){
		return this.marshaller.invoke(1,0x307B,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_U1ARRAY);
	},
	GetVersionInformation:function(path){
		return this.marshaller.invoke(1,0x501B,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_S4ARRAY);
	},
	GetPublicFileEvidencePermissions:function(filePath){
		return this.marshaller.invoke(1,0x323B,MARSHALLER_TYPE_IN_STRING,filePath,MARSHALLER_TYPE_RET_U1);
	},
	SetPublicFileEvidencePermissions:function(filePath,permissions){
		this.marshaller.invoke(2,0x51E8,MARSHALLER_TYPE_IN_STRING,filePath,MARSHALLER_TYPE_IN_U1,permissions,MARSHALLER_TYPE_RET_VOID);
	},
	LockFile:function(filePath){
		this.marshaller.invoke(1,0x457D,MARSHALLER_TYPE_IN_STRING,filePath,MARSHALLER_TYPE_RET_VOID);
	},
	GetPublicDirectoryEvidencePermissions:function(directoryPath){
		return this.marshaller.invoke(1,0xAE4B,MARSHALLER_TYPE_IN_STRING,directoryPath,MARSHALLER_TYPE_RET_U1);
	},
	SetPublicDirectoryEvidencePermissions:function(directoryPath,permissions){
		this.marshaller.invoke(2,0xA1BD,MARSHALLER_TYPE_IN_STRING,directoryPath,MARSHALLER_TYPE_IN_U1,permissions,MARSHALLER_TYPE_RET_VOID);
	},
	GetFileAttributes:function(path){
		return this.marshaller.invoke(1,0x3223,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_S4);
	},
	GetFileSize:function(filePath){
		return this.marshaller.invoke(1,0xC9DC,MARSHALLER_TYPE_IN_STRING,filePath,MARSHALLER_TYPE_RET_S4);
	},
	Delete:function(path){
		this.marshaller.invoke(1,0x8266,MARSHALLER_TYPE_IN_STRING,path,MARSHALLER_TYPE_RET_VOID);
	},
	GetAssociatedPort:function(nameSpaceHivecode,typeHivecode,uri){
		return this.marshaller.invoke(3,0x7616,MARSHALLER_TYPE_IN_S4,nameSpaceHivecode,MARSHALLER_TYPE_IN_S2,typeHivecode,MARSHALLER_TYPE_IN_STRING,uri,MARSHALLER_TYPE_RET_S4);
	},
	get_FreePersistentMemory:function(){
		return this.marshaller.invoke(0,0x168B,MARSHALLER_TYPE_RET_S4);
	},
	GetMappingPersistentMemory:function(){
		return this.marshaller.invoke(0,0x6679,MARSHALLER_TYPE_RET_S4ARRAY);
	},
	ExecuteAssembly:function(assemblyFile){
		return this.marshaller.invoke(1,0x322E,MARSHALLER_TYPE_IN_STRING,assemblyFile,MARSHALLER_TYPE_RET_S4);
	},
	get_ChipSpeed:function(){
		return this.marshaller.invoke(0,0x8DEB,MARSHALLER_TYPE_RET_S4);
	},
	set_ChipSpeed:function(value){
		this.marshaller.invoke(1,0xA073,MARSHALLER_TYPE_IN_S4,value,MARSHALLER_TYPE_RET_VOID);
	},
	get_CommunicationSpeed:function(){
		return this.marshaller.invoke(0,0x5DB6,MARSHALLER_TYPE_RET_S4);
	},
	set_CommunicationSpeed:function(value){
		this.marshaller.invoke(1,0x57D1,MARSHALLER_TYPE_IN_S4,value,MARSHALLER_TYPE_RET_VOID);
	},
	get_ATRHistoricalBytes:function(){
		return this.marshaller.invoke(0,0x349A,MARSHALLER_TYPE_RET_U1ARRAY);
	},
	set_ATRHistoricalBytes:function(value){
		this.marshaller.invoke(1,0x151B,MARSHALLER_TYPE_IN_U1ARRAY,value,MARSHALLER_TYPE_RET_VOID);
	},
	get_ActiveAccessManagerInfo:function(){
		return this.marshaller.invoke(0,0xDDC2,MARSHALLER_TYPE_RET_U1ARRAY);
	},
	get_SerialNumber:function(){
		return this.marshaller.invoke(0,0xD017,MARSHALLER_TYPE_RET_U1ARRAY);
	},
	get_OSVersion:function(){
		return this.marshaller.invoke(0,0xDC91,MARSHALLER_TYPE_RET_S4ARRAY);
	},
	get_CLRVersion:function(){
		return this.marshaller.invoke(0,0x539F,MARSHALLER_TYPE_RET_S4ARRAY);
	},
	beginTransaction:function(){
		return this.marshaller.beginTransaction();
	},
	endTransaction:function(tranHandle){
		this.marshaller.endTransaction(tranHandle);
	},
	dispose:function(){
		this.marshaller.dispose();
	}
};

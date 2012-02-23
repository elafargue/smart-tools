/**
 * @author rdollet
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

var SC_SUCCESS  =	true;
var SC_NO_ERROR =	true;

var defineJS = true;

// Pseudo const
SC_MAX_AC_OPS=			8;
SC_FILE_MAGIC=			0x14426950;
SC_CARD_MAGIC=			0x27182818;
SC_CTX_MAGIC=			0x0A550335;


function SC_AC(){}

/* Access Control flags */
SC_AC.NONE	=		0x00000000;
SC_AC.CHV	=		0x00000001; /* Card Holder Verif. */
SC_AC.TERM	=		0x00000002; /* Terminal auth. */
SC_AC.PRO	=		0x00000004; /* Secure Messaging */
SC_AC.AUT	=		0x00000008; /* Key auth. */
SC_AC.SYMBOLIC	=	0x00000010; /* internal use only */
SC_AC.UNKNOWN	=	0xFFFFFFFE;
SC_AC.NEVER		=	0xFFFFFFFF;
SC_AC.KEY_REF_NONE =0xFFFFFFFF;

/* Operations relating to access control (in case of DF) */
SC_AC.OP_SELECT		=	0;
SC_AC.OP_LOCK		=	1;
SC_AC.OP_DELETE		=	2;
SC_AC.OP_CREATE		=	3;
SC_AC.OP_REHABILITATE=	4;
SC_AC.OP_INVALIDATE	=	5;
SC_AC.OP_LIST_FILES	=	6;
SC_AC.OP_CRYPTO		=	7;
SC_AC.OP_DELETE_SELF=	8;
/* If you add more OPs here, make sure you increase
 * SC_MAX_AC_OPS in types.h */

/* Operations relating to access control (in case of EF) */
SC_AC.OP_READ	=		0;
SC_AC.OP_UPDATE	=		1;
/* the use of SC_AC_OP_ERASE is deprecated, SC_AC_OP_DELETE should be used
 * instead  */
SC_AC.OP_ERASE	=		SC_AC.OP_DELETE;
SC_AC.OP_WRITE	=		3;


function SC_PATH_TYPE(){}
SC_PATH_TYPE.FILE_ID=		0;
SC_PATH_TYPE.DF_NAME=		1;
SC_PATH_TYPE.PATH =			2;
SC_PATH_TYPE.PATH_PROT=		3;	/* path of a file containing   EnveleopedData objects */
SC_PATH_TYPE.FROM_CURRENT=	4;
SC_PATH_TYPE.PARENT=		5;

/* File types */
function SC_FILE_TYPE(){}
SC_FILE_TYPE.DF				 = 0x04;
SC_FILE_TYPE.INTERNAL_EF 	 = 0x03;
SC_FILE_TYPE.TYPE_WORKING_EF = 0x01;

/* EF structures */
function SC_FILE_EF(){}
SC_FILE_EF.UNKNOWN			= 0x00;
SC_FILE_EF.TRANSPARENT		= 0x01;
SC_FILE_EF.LINEAR_FIXED		= 0x02;
SC_FILE_EF.LINEAR_FIXED_TLV	= 0x03;
SC_FILE_EF.LINEAR_VARIABLE	= 0x04;
SC_FILE_EF.LINEAR_VARIABLE_TLV	= 0x05;
SC_FILE_EF.CYCLIC			= 0x06;
SC_FILE_EF.CYCLIC_TLV		= 0x07;

/* File status flags */
function SC_FILE_STATUS(){}
SC_FILE_STATUS.ACTIVATED	=0x00;
SC_FILE_STATUS.INVALIDATED	=0x01;
SC_FILE_STATUS.CREATION		=0x02;


function sc_strerror(error)
{
	var rdr_errors = [
		"Generic reader error",
		"No readers found",
		"Slot not found",
		"Slot already connected",
		"Card not present",
		"Card removed",
		"Card reset",
		"Transmit failed",
		"Timed out while waiting for user input",
		"Input operation cancelled by user",
		"The two PINs did not match",
		"Message too long (keypad)",
		"Timeout while waiting for event from card reader",
		"Unresponsive card (correctly inserted?)",
		"Reader detached (hotplug device?)",
		"Reader reattached (hotplug device?)"];
	var rdr_base = -SC_ERROR.READER;
	var card_errors = [
		"Card command failed",
		"File not found",
		"Record not found",
		"Unsupported CLA byte in APDU",
		"Unsupported INS byte in APDU",
		"Incorrect parameters in APDU",
		"Wrong length",
		"Card memory failure",
		"Card does not support the requested operation",
		"Not allowed",
		"Card is invalid or cannot be handled",
		"Security status not satisfied",
		"Authentication method blocked",
		"Unknown data received from card",
		"PIN code or key incorrect",
		"File already exists",
		"Data object not found"	];
	var card_base = -SC_ERROR.CARD_CMD_FAILED;
	var arg_errors = [
		"Invalid arguments",
		"Command too short",
		"Command too long",
		"Buffer too small",
		"Invalid PIN length",
		"Invalid data"];
	var arg_base = -SC_ERROR.INVALID_ARGUMENTS;
	var int_errors = [
		"Internal error",
		"Invalid ASN.1 object",
		"Required ASN.1 object not found",
		"Premature end of ASN.1 stream",
		"Out of memory",
		"Object not valid",
		"Object not found",
		"Requested object not found",
		"Not supported",
		"Passphrase required",
		"The key is extractable",
		"Decryption failed",
		"Wrong padding",
		"Unsupported card",
		"Unable to load external module",
		"EF offset too large"];
	var int_base = -SC_ERROR.INTERNAL;
	var p15i_errors = [
		"Generic PKCS #15 initialization error",
		"Syntax error",
		"Inconsistent or incomplete pkcs15 profile",
		"Key length/algorithm not supported by card",
		"No default (transport) key available",
		"The PKCS#15 Key/certificate ID specified is not unique",
		"Unable to load key and certificate(s) from file",
		"Object is not compatible with intended use",
		"File template not found",
		"Invalid PIN reference",
		"File too small"];
	var p15i_base = -SC_ERROR.PKCS15INIT;
	var misc_errors = [
		"Unknown error",
		"PKCS#15 compatible smart card not found"];
	var misc_base = -SC_ERROR.UNKNOWN;
	var count = 0, err_base = 0;
	
	if (error < 0) {
		error = -error;
	}
	if (error >= misc_base) {
		errors = misc_errors;
		err_base = misc_base;
	} else if (error >= p15i_base) {
		errors = p15i_errors;
		err_base = p15i_base;
	} else if (error >= int_base) {
		errors = int_errors;
		err_base = int_base;
	} else if (error >= arg_base) {
		errors = arg_errors;
		err_base = arg_base;
	} else if (error >= card_base) {
		errors = card_errors;
		err_base = card_base;
	} else if (error >= rdr_base) {
		errors = rdr_errors;
		err_base = rdr_base;
	}
	error -= err_base;
	return errors[error];
}


function SC_ERROR(){}
/* Errors related to reader operation */
SC_ERROR.READER				= -1100;
SC_ERROR.NO_READERS_FOUND		= -1101;
SC_ERROR.SLOT_NOT_FOUND			= -1102;
SC_ERROR.SLOT_ALREADY_CONNECTED		= -1103;
SC_ERROR.CARD_NOT_PRESENT		= -1104;
SC_ERROR.CARD_REMOVED			= -1105;
SC_ERROR.CARD_RESET			= -1106;
SC_ERROR.TRANSMIT_FAILED		= -1107;
SC_ERROR.KEYPAD_TIMEOUT			= -1108;
SC_ERROR.KEYPAD_CANCELLED		= -1109;
SC_ERROR.KEYPAD_PIN_MISMATCH		= -1110;
SC_ERROR.KEYPAD_MSG_TOO_LONG		= -1111;
SC_ERROR.EVENT_TIMEOUT			= -1112;
SC_ERROR.CARD_UNRESPONSIVE		= -1113;
SC_ERROR.READER_DETACHED		= -1114;
SC_ERROR.READER_REATTACHED		= -1115;

/* Resulting from a card command or related to the card*/
SC_ERROR.CARD_CMD_FAILED		= -1200;
SC_ERROR.FILE_NOT_FOUND			= -1201;
SC_ERROR.RECORD_NOT_FOUND		= -1202;
SC_ERROR.CLASS_NOT_SUPPORTED		= -1203;
SC_ERROR.INS_NOT_SUPPORTED		= -1204;
SC_ERROR.INCORRECT_PARAMETERS		= -1205;
SC_ERROR.WRONG_LENGTH			= -1206;
SC_ERROR.MEMORY_FAILURE			= -1207;
SC_ERROR.NO_CARD_SUPPORT		= -1208;
SC_ERROR.NOT_ALLOWED			= -1209;
SC_ERROR.INVALID_CARD			= -1210;
SC_ERROR.SECURITY_STATUS_NOT_SATISFIED	= -1211;
SC_ERROR.AUTH_METHOD_BLOCKED		= -1212;
SC_ERROR.UNKNOWN_DATA_RECEIVED		= -1213;
SC_ERROR.PIN_CODE_INCORRECT		= -1214;
SC_ERROR.FILE_ALREADY_EXISTS		= -1215;
SC_ERROR.DATA_OBJECT_NOT_FOUND		= -1216;

/* Returned by OpenSC library when called with invalid arguments */
SC_ERROR.INVALID_ARGUMENTS		= -1300;
SC_ERROR.CMD_TOO_SHORT			= -1301;
SC_ERROR.CMD_TOO_LONG			= -1302;
SC_ERROR.BUFFER_TOO_SMALL		= -1303;
SC_ERROR.INVALID_PIN_LENGTH		= -1304;
SC_ERROR.INVALID_DATA			= -1305;

/* Resulting from OpenSC internal operation */
SC_ERROR.INTERNAL			= -1400;
SC_ERROR.INVALID_ASN1_OBJECT		= -1401;
SC_ERROR.ASN1_OBJECT_NOT_FOUND		= -1402;
SC_ERROR.ASN1_END_OF_CONTENTS		= -1403;
SC_ERROR.OUT_OF_MEMORY			= -1404;
SC_ERROR.TOO_MANY_OBJECTS		= -1405;
SC_ERROR.OBJECT_NOT_VALID		= -1406;
SC_ERROR.OBJECT_NOT_FOUND		= -1407;
SC_ERROR.NOT_SUPPORTED			= -1408;
SC_ERROR.PASSPHRASE_REQUIRED		= -1409;
SC_ERROR.EXTRACTABLE_KEY		= -1410;
SC_ERROR.DECRYPT_FAILED			= -1411;
SC_ERROR.WRONG_PADDING			= -1412;
SC_ERROR.WRONG_CARD			= -1413;
SC_ERROR.CANNOT_LOAD_MODULE		= -1414;
SC_ERROR.OFFSET_TOO_LARGE		= -1415;

/* Relating to PKCS #15 init stuff */
SC_ERROR.PKCS15INIT			= -1500;
SC_ERROR.SYNTAX_ERROR			= -1501;
SC_ERROR.INCONSISTENT_PROFILE		= -1502;
SC_ERROR.INCOMPATIBLE_KEY		= -1503;
SC_ERROR.NO_DEFAULT_KEY			= -1504;
SC_ERROR.ID_NOT_UNIQUE			= -1505;
SC_ERROR.CANNOT_LOAD_KEY		= -1006;
SC_ERROR.INCOMPATIBLE_OBJECT		= -1007;
SC_ERROR.TEMPLATE_NOT_FOUND		= -1008;
SC_ERROR.INVALID_PIN_REFERENCE		= -1009;
SC_ERROR.FILE_TOO_SMALL			= -1010;

/* Errors that do not fit the categories above */
SC_ERROR.UNKNOWN			= -1900;
SC_ERROR.PKCS15_APP_NOT_FOUND		= -1901;

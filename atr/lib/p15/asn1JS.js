/*
 Written by Richard Dollet, who took it from http://www.geocities.co.jp/SiliconValley-SanJose/3377/asn1JS.html
 Additions by E. Lafargue.

 Changelog (E. Lafargue):
 20100330:
        * Bugfix for Calypso FCI decoding.
 20091113:
	* Many small bugfixes, improvements of structure.
	* OID decoding - very rough approach but does the job quick
 20080909:
	* multibyte tag support (not implemented everywhere)
 20081108:
	* support for applications by passing the application name upon object creation
 	* Added all ISO7816-6 IDO tags
 
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

var asn1JS = true;

function ASN1Element(tag, value, DER_Encoded){
    this.tag = tag;
    this.value = value;
    this.DER_Encoded = DER_Encoded;
}


/*
 * defaultContext initializes tag arrays for tags that are context-specific.
 * Call with application name as argument.
 *
 * Applications that are/will be supported are:
 *   - "Calypso"
 *   - "IAS-ECC"
 */
function ASN1(defaultContext){

    this.OID = {
	'1.3.14.3.2.26' : "SHA-1" ,
	'2.16.840.1.101.3.4.2.1' :"SHA-256" ,
	'1.2.840.113549.1.1.11' : "sha256WithRSAEncryption" ,
	'0.2.262.1.10.0' : "extension",	'0.2.262.1.10.1.1': "signature", '1.2.840.113549.1.1' : "pkcs-1" , '1.2.840.113549.1.1.1' : "rsaEncryption" , '1.2.840.113549.1.1.4' : "md5withRSAEncryption" , '1.2.840.113549.1.1.5' : "sha1withRSAEncryption" , '1.2.840.113549.1.1.6' : "rsaOAEPEncryptionSET" , '1.2.840.113549.1.7' : "pkcs-7" , '1.2.840.113549.1.7.1' : "data" , '1.2.840.113549.1.7.2' : "signedData" , '1.2.840.113549.1.7.3' : "envelopedData" , '1.2.840.113549.1.7.4' : "signedAndEnvelopedData" , '1.2.840.113549.1.7.5' : "digestedData" , '1.2.840.113549.1.7.6' : "encryptedData" , '1.2.840.113549.1.7.7' : "dataWithAttributes" , '1.2.840.113549.1.7.8' : "encryptedPrivateKeyInfo" , '1.2.840.113549.1.9.22.1' : "x509Certificate(for.PKCS.#12)" , '1.2.840.113549.1.9.23.1' : "x509Crl(for.PKCS.#12)" , '1.2.840.113549.1.9.3' : "contentType" , '1.2.840.113549.1.9.4' : "messageDigest" , '1.2.840.113549.1.9.5' : "signingTime" , '2.16.840.1.113730.1' : "cert-extension" , '2.16.840.1.113730.1.1' : "netscape-cert-type" , '2.16.840.1.113730.1.12' : "netscape-ssl-server-name" , '2.16.840.1.113730.1.13' : "netscape-comment" , '2.16.840.1.113730.1.2' : "netscape-base-url" , '2.16.840.1.113730.1.3' : "netscape-revocation-url" , '2.16.840.1.113730.1.4' : "netscape-ca-revocation-url" , '2.16.840.1.113730.1.7' : "netscape-cert-renewal-url" , '2.16.840.1.113730.1.8' : "netscape-ca-policy-url" , '2.23.42.0' : "contentType" , '2.23.42.1' : "msgExt" , '2.23.42.10' : "national" , '2.23.42.2' : "field" , '2.23.42.2.0' : "fullName" , '2.23.42.2.1' : "givenName" , '2.23.42.2.10' : "amount" , '2.23.42.2.2' : "familyName" , '2.23.42.2.3' : "birthFamilyName" , '2.23.42.2.4' : "placeName" , '2.23.42.2.5' : "identificationNumber" , '2.23.42.2.6' : "month" , '2.23.42.2.7' : "date" , '2.23.42.2.7.11' : "accountNumber" , '2.23.42.2.7.12' : "passPhrase" , '2.23.42.2.8' : "address" , '2.23.42.3' : "attribute" , '2.23.42.3.0' : "cert" , '2.23.42.3.0.0' : "rootKeyThumb" , '2.23.42.3.0.1' : "additionalPolicy" , '2.23.42.4' : "algorithm" , '2.23.42.5' : "policy" , '2.23.42.5.0' : "root" , '2.23.42.6' : "module" , '2.23.42.7' : "certExt" , '2.23.42.7.0' : "hashedRootKey" , '2.23.42.7.1' : "certificateType" , '2.23.42.7.2' : "merchantData" , '2.23.42.7.3' : "cardCertRequired" , '2.23.42.7.5' : "setExtensions" , '2.23.42.7.6' : "setQualifier" , '2.23.42.8' : "brand" , '2.23.42.9' : "vendor" , '2.23.42.9.22' : "eLab" , '2.23.42.9.31' : "espace-net" , '2.23.42.9.37' : "e-COMM" , '2.5.29.1' : "authorityKeyIdentifier" , '2.5.29.10' : "basicConstraints" , '2.5.29.11' : "nameConstraints" , '2.5.29.12' : "policyConstraints" , '2.5.29.13' : "basicConstraints" , '2.5.29.14' : "subjectKeyIdentifier" , '2.5.29.15' : "keyUsage" , '2.5.29.16' : "privateKeyUsagePeriod" , '2.5.29.17' : "subjectAltName" , '2.5.29.18' : "issuerAltName" , '2.5.29.19' : "basicConstraints" , '2.5.29.2' : "keyAttributes" , '2.5.29.20' : "cRLNumber" , '2.5.29.21' : "cRLReason" , '2.5.29.22' : "expirationDate" , '2.5.29.23' : "instructionCode" , '2.5.29.24' : "invalidityDate" , '2.5.29.25' : "cRLDistributionPoints" , '2.5.29.26' : "issuingDistributionPoint" , '2.5.29.27' : "deltaCRLIndicator" , '2.5.29.28' : "issuingDistributionPoint" , '2.5.29.29' : "certificateIssuer" , '2.5.29.3' : "certificatePolicies" , '2.5.29.30' : "nameConstraints" , '2.5.29.31' : "cRLDistributionPoints" , '2.5.29.32' : "certificatePolicies" , '2.5.29.33' : "policyMappings" , '2.5.29.34' : "policyConstraints" , '2.5.29.35' : "authorityKeyIdentifier" , '2.5.29.36' : "policyConstraints" , '2.5.29.37' : "extKeyUsage" , '2.5.29.4' : "keyUsageRestriction" , '2.5.29.5' : "policyMapping" , '2.5.29.6' : "subtreesConstraint" , '2.5.29.7' : "subjectAltName" , '2.5.29.8' : "issuerAltName" , '2.5.29.9' : "subjectDirectoryAttributes" , '2.5.4.0' : "objectClass" , '2.5.4.1' : "aliasedEntryName" , '2.5.4.10' : "organizationName" , '2.5.4.10.1' : "collectiveOrganizationName" , '2.5.4.11' : "organizationalUnitName" , '2.5.4.11.1' : "collectiveOrganizationalUnitName" , '2.5.4.12' : "title" , '2.5.4.13' : "description" , '2.5.4.14' : "searchGuide" , '2.5.4.15' : "businessCategory" , '2.5.4.16' : "postalAddress" , '2.5.4.16.1' : "collectivePostalAddress" , '2.5.4.17' : "postalCode" , '2.5.4.17.1' : "collectivePostalCode" , '2.5.4.18' : "postOfficeBox" , '2.5.4.18.1' : "collectivePostOfficeBox" , '2.5.4.19' : "physicalDeliveryOfficeName" , '2.5.4.19.1' : "collectivePhysicalDeliveryOfficeName" , '2.5.4.2' : "knowledgeInformation" , '2.5.4.20' : "telephoneNumber" , '2.5.4.20.1' : "collectiveTelephoneNumber" , '2.5.4.21' : "telexNumber" , '2.5.4.21.1' : "collectiveTelexNumber" , '2.5.4.22.1' : "collectiveTeletexTerminalIdentifier" , '2.5.4.23' : "facsimileTelephoneNumber" , '2.5.4.23.1' : "collectiveFacsimileTelephoneNumber" , '2.5.4.25' : "internationalISDNNumber" , '2.5.4.25.1' : "collectiveInternationalISDNNumber" , '2.5.4.26' : "registeredAddress" , '2.5.4.27' : "destinationIndicator" , '2.5.4.28' : "preferredDeliveryMehtod" , '2.5.4.29' : "presentationAddress" , '2.5.4.3' : "commonName" , '2.5.4.31' : "member" , '2.5.4.32' : "owner" , '2.5.4.33' : "roleOccupant" , '2.5.4.34' : "seeAlso" , '2.5.4.35' : "userPassword" , '2.5.4.36' : "userCertificate" , '2.5.4.37' : "caCertificate" , '2.5.4.38' : "authorityRevocationList" , '2.5.4.39' : "certificateRevocationList" , '2.5.4.4' : "surname" , '2.5.4.40' : "crossCertificatePair" , '2.5.4.41' : "name" , '2.5.4.42' : "givenName" , '2.5.4.43' : "initials" , '2.5.4.44' : "generationQualifier" , '2.5.4.45' : "uniqueIdentifier" , '2.5.4.46' : "dnQualifier" , '2.5.4.47' : "enhancedSearchGuide" , '2.5.4.48' : "protocolInformation" , '2.5.4.49' : "distinguishedName" , '2.5.4.5' : "serialNumber" , '2.5.4.50' : "uniqueMember" , '2.5.4.51' : "houseIdentifier" , '2.5.4.52' : "supportedAlgorithms" , '2.5.4.53' : "deltaRevocationList" , '2.5.4.55' : "clearance" , '2.5.4.58' : "crossCertificatePair" , '2.5.4.6' : "countryName" , '2.5.4.7' : "localityName" , '2.5.4.7.1' : "collectiveLocalityName" , '2.5.4.8' : "stateOrProvinceName" , '2.5.4.8.1' : "collectiveStateOrProvinceName" , '2.5.4.9' : "streetAddress" , '2.5.4.9.1' : "collectiveStreetAddress" , '2.5.6.0' : "top" , '2.5.6.1' : "alias" , '2.5.6.10' : "residentialPerson" , '2.5.6.11' : "applicationProcess" , '2.5.6.12' : "applicationEntity" , '2.5.6.13' : "dSA" , '2.5.6.14' : "device" , '2.5.6.15' : "strongAuthenticationUser" , '2.5.6.16' : "certificateAuthority" , '2.5.6.17' : "groupOfUniqueNames" , '2.5.6.2' : "country" , '2.5.6.21' : "pkiUser" , '2.5.6.22' : "pkiCA" , '2.5.6.3' : "locality" , '2.5.6.4' : "organization" , '2.5.6.5' : "organizationalUnit" , '2.5.6.6' : "person" , '2.5.6.7' : "organizationalPerson" , '2.5.6.8' : "organizationalRole" , '2.5.6.9' : "groupOfNames" , '2.5.8' : "X.500-Algorithms" , '2.5.8.1' : "X.500-Alg-Encryption" , '2.5.8.1.1' : "rsa" , '2.54.1775.2' : "hashedRootKey" , '2.54.1775.3' : "certificateType" , '2.54.1775.4' : "merchantData" , '2.54.1775.5' : "cardCertRequired" , '2.54.1775.7' : "setQualifier" , '2.54.1775.99' : "set-data"
	};
    

	// Arrays for universal tags:
    this.ID = new Array();
    this.NAME = new Array();
    this.TagTable = new Array();
	// Arrays for application-specific tags
	// Not initialized by default.
    this.AppID = new Array();
    this.AppNAME = new Array();
    this.context = defaultContext;

	// This array stores the calling context.
    this.contextArray = new Array();
    this.subContextArray = new Array(); // Initialized at context setting

    // Those are the universal tags (0x00 to 0x3F):
    this.ID['EOC'] = 0x00;
    this.ID['BOOLEAN'] = 0x01;
    this.ID['INTEGER'] = 0x02;
    this.ID['BIT_STRING'] = 0x03;
    this.ID['OCTET_STRING'] = 0x04;
    this.ID['NULL'] = 0x05;
    this.ID['OBJECT'] = 0x06;
    this.ID['OBJECT_DESCRIPTOR'] = 0x07;
    this.ID['EXTERNAL'] = 0x08;
    this.ID['REAL'] = 0x09;
    this.ID['ENUMERATED'] = 0x0A;
    this.ID['UTF8STRING'] = 0x0C;
    this.ID['INFORMATION'] = 15;
    this.ID['SEQUENCE'] = 16;
    this.ID['SET'] = 17;
    this.ID['NUMERICSTRING'] = 18;
    this.ID['PRINTABLESTRING'] = 19;
    this.ID['T61STRING'] = 20;
    this.ID['TELETEXSTRING'] = 20;
    this.ID['VIDEOTEXSTRING'] = 21;
    this.ID['IA5STRING'] = 22;
    this.ID['UTCTIME'] = 23;
    this.ID['GENERALIZEDTIME'] = 24;
    this.ID['GRAPHICSTRING'] = 25;
    this.ID['ISO64STRING'] = 26;
    this.ID['VISIBLESTRING'] = 26;
    this.ID['GENERALSTRING'] = 27;
    this.ID['UNIVERSALSTRING'] = 28;
    this.ID['BMPSTRING'] = 30;

    // Below are Application-class tags (between 0x40 and 0x7F)
    // Those tags can be considered as fairly universal too

    // Interindustry tags defined in ISO7816-6

    // Template tags:
	this.ID['Application Template'] = 0x61;
	this.ID['Cardholder Related Data'] = 0x65;
	this.ID['Card Data'] = 0x66;
	this.ID['Authentication Data'] = 0x67;
	this.ID['Application Related Data'] = 0x6E;

    // Data object tags:
	this.ID['Country Authority'] = 0x41;
	this.ID['Issuer Authority'] = 0x42;
	this.ID['Card services data'] = 0x43;
	this.ID['Inital access data'] = 0x44;
	this.ID['Card issuer\'s data'] = 0x45;
	this.ID['Pre-issuing data'] = 0x46;
	this.ID['Card capabilities'] = 0x47;
	this.ID['Status information'] = 0x48;
	this.ID['Application identifier'] = 0x4F;
	this.ID['Application label'] = 0x50;
	this.ID['Path'] = 0x51;
	this.ID['Command to perform'] = 0x52;
	this.ID['Discretionary data'] = 0x53;
	this.ID['Track 1 (application)'] = 0x56;
	this.ID['Track 2 (application)'] = 0x57;
	this.ID['Track 3 (application)'] = 0x58;
	this.ID['Card expiration date'] = 0x59;
	this.ID['Primary Account Number (PAN)'] = 0x5A;
	this.ID['Name'] = 0x5B;
	this.ID['Taglist'] = 0x5C;
	this.ID['Headerlist'] = 0x5D;
	this.ID['Log-in data (proprietary)'] = 0x5E;
	this.ID['Cardholder name'] = 0x5F20;
	this.ID['Track 1 (card)'] = 0x5F21;
	this.ID['Track 2 (card)'] = 0x5F22;
	this.ID['Track 3 (card)'] = 0x5F23;
	this.ID['Application expiration date'] = 0x5F24;
	this.ID['Application effective date'] = 0x5F25;
	this.ID['Card effective date'] = 0x5F26;
	this.ID['Interchange control'] =0x5F27;
	this.ID['Country code'] = 0x5F28;
	this.ID['File Control Parameter (FCP) template' ] = 0x62;
	this.ID['Wrapper'] = 0x63;
	this.ID['FMD template'] = 0x64;
	this.ID['Special user requirements'] = 0x68;
	this.ID['Log-in template'] = 0x6A;
	this.ID['Qualified name'] = 0x6B;
	this.ID['Cardholder image template'] = 0x6C;
	this.ID['Application image template'] = 0x6D;
	this.ID['File Control Information (FCI) Template)'] = 0x6F;
	this.ID['Discretionary DOs'] = 0x73;
	this.ID['Compatible Tag Allocation Authority'] = 0x78;
	this.ID['Coexistent Tag Allocation Authority'] = 0x79;
	this.ID['Secure messaging template'] = 0x7D;
	this.ID['Display control'] = 0x7F20;
	this.ID['Cardholder certificate'] = 0x7F21;

     // End of ISO7816-6 interindustry tags


    this.setContext(this.context);
        
    this.TAB = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    this.TAB_num = -1;
    
    this.Bitstring_hex_limit = 4;
    
    this.isEncode = new RegExp("[^0-9a-zA-Z\/=+]", "i");
    this.isB64 = new RegExp("[^0-9a-fA-F]", "i");

}


/*
 * Saves the current context and sets the new one
 */
ASN1.prototype.pushContext = function(newContext) {
	this.contextArray.push(this.context);
	this.setContext(newContext, true);
};

/*
 * Restores the previous context
 */
ASN1.prototype.popContext = function() {
	this.setContext(this.contextArray.pop(), true);
}


/*
 * Sets the context of the ASN1 object so that the context-specific
 * tags are properly decoded (tags above 0x80).
 */
ASN1.prototype.setContext = function(context, savePrevious) {

	// Below are Context-specific tags (0x80 onwards)
	// The meaning of a context-specific tag depends on the structure
	// where it is contained.

	// We reset all the previously set context-specific tags:
	for (i = 0x80; i<0xff;i++) {
		this.ID[this.NAME[i]] = null ;
		this.NAME[i] = 'Context-specific';
	}
	
	if (!savePrevious) {
		this.subContextArray = new Array();
	}
	// Should only code for context-specific tags (above 0x7F)
    switch(context) {
		case "FCI":
		    this.ID['Short File Identifier'] = 0x88;
		    this.ID['Card serial number, formatted as Primary Account Number (PAN)'] = 0x5A;
		    this.ID['Security Attributes in proprietary format'] = 0xA1;
		    this.ID['Security Attributes referencing the proprietary format for contact interface'] = 0x8C;
		    this.ID['Security Attributes referencing the proprietary format for contactless interface'] = 0x9C;
		    this.ID['Number of data bytes in the file, excluding structural information'] = 0x80;
		    this.ID['Number of data bytes in the file including structural information'] = 0x81;
		    this.ID["File Descriptor byte (FDB)"] = 0x82;
		    this.ID["File identifier or PIN/Key reference for direct use"] = 0x83;
		    this.ID["Dedicated file name or Key reference for computing a session key"] = 0x84;
		    this.ID["Security attributes, proprietary coding"] = 0x86;
		    this.ID["Life Cycle Status Integer (LCSI)"] = 0x8A;
		    this.ID["File Control Information (FCI) Proprietary Template"] = 0xA5;
		    this.ID["PIN definitions"] = 0xC1;
		    this.ID["Key definitions"] = 0xC2;
		    break;
		case "Calypso":
		    this.ID["Calypso FCI information"] = 0x85;
		    this.ID["Application Serial Number"] = 0xC7;
		    this.ID["FCI Issuer Discretionary Data"] = 0xBF0C;
			break;
		case "PKCS15":
		case "IAS-ECC":
		    // this.ID['CIAInfo'] = 0x30;
		    break;
		case "CIAInfo":
		    // this.ID['version'] = 0x02;
		    // this.ID['manufacturerID'] = 0x0C;
		    this.ID['label'] = 0x80;
		    // this.ID['cardflags'] = 0x03;
		    //this.ID['serialNumber'] = 0x04;
		    // this.ID['seinfo'] = 16;
		    this.ID['supportedAlgorithms'] = 0xA2;
		    this.ID['lastUpdate'] = 0xA5;
		    if (!savePrevious) {this.subContextArray = ["CIAInfo"];}
		    break;
		case "CIOChoice":
		    this.ID['privateKeys'] = 0xA0;
		    this.ID['publicKeys'] = 0xA1;
		    this.ID['trustedPublicKeys'] = 0xA2;
		    this.ID['secretKeys'] = 0xA3;
		    this.ID['certificates'] = 0xA4;
		    this.ID['trustedCertificates'] = 0xA5;
		    this.ID['usefulCertificates'] = 0xA6;
		    this.ID['dataContainerObjects'] =0xA7;
		    this.ID['authObjects'] = 0xA8;
		default:
	}

    
    var i;
    for (i in this.ID) {
        this.NAME[this.ID[i]] = i;
    }

    this.context = context;
};

ASN1.prototype.convert = function(src, ans, mode){
    var srcValue = src.value.replace(/[\s\r\n]/g, '');
    
    if (mode == 'auto') {
        if (srcValue.match(this.isEncode)) {
            mode = 'encode';
        }
        else 
            if (srcValue.match(this.isB64)) {
                mode = 'decode_B64';
            }
            else {
                mode = 'decode_HEX';
            }
    }
    
    if (mode == 'encode') {
        ans.value = ASN1.encode(srcValue);
        return;
    }
    else 
        if (mode == 'decode_B64') {
            if (srcValue.match(this.isEncode)) {
                if (confirm("Illegal character for Decoding process.\nDo you wish to continue as Encoding process?")) {
                    ans.value = ASN1.encode(srcValue);
                    return;
                }
                else {
                    return;
                }
            }
            //ans.value = ASN1.bin2hex(ASN1.base64decode(srcValue));
            ans.value = ASN1.decode(ASN1.bin2hex(ASN1.base64decode(srcValue)));
        }
        else 
            if (mode == 'decode_HEX') {
                if (srcValue.match(this.isB64)) {
                    if (confirm("Illegal character for Decoding process.\nDo you wish to continue as Encoding process?")) {
                        ans.value = ASN1.encode(srcValue);
                        return;
                    }
                    else {
                        return;
                    }
                }
                ans.value = ASN1.decode(srcValue);
            }
};

ASN1.prototype.encode = function(src){
    var ans;
    return ans;
};
ASN1.prototype.decode = function(src){
    if (src.length % 2 != 0) {
        throw 'Illegal length. Hex string\'s length must be even.';
    }
    return ASN1.readASN1(src);
};


ASN1.prototype.decodeDER = function(data){
    var point = 0;
    var ret = "", indefinite;
    this.TAB_num++;
    
    while (point < data.length) {
    
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
        var isContext = tag10 & 128;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}

        var tagName = isContext ? "[" + tag + "]" : this.NAME[tag];
        if (tagName == undefined) {
            tagName = "Unsupported_TAG";
        }
        
        point += 2;
        indefinite = false;
        // Detecting LENGTH field (Max 2 octets)

        var len = 0;
        if (tag != 0x5) { // Ignore NULL
            if (parseInt("0x" + data.substr(point, 2)) & 128) {
                var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
                if (lenLength > 0) {
                    if (lenLength > 2) {
                        var error_message = "LENGTH field is too long.(at " + point +
                        ")\nThis program accepts up to 2 octets of Length field.";
                        throw error_message;
                        
                    }
                    len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                    point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                }
                else {
                    // use indefinite form encoding
                    //Need search for the End-of-Contents data
                    // detect the length
                    indefinite = true;
                    point += 2;
                    len = this.detectUnknownLength(data, point);
                }
            }
            else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                len = parseInt("0x" + data.substr(point, 2));
                point += 2;
            }
            
            if (len > data.length - point) {
                var error_message = "LENGTH is longer than the rest.\n";
                +"(LENGTH: " + len + ", rest: " + data.length + ")";
                
                throw error_message;
                
            }
        }
        else {
            point += 2;
        }
        
        // Detecting VALUE        
        var val = "";
        var tab = this.TAB.substr(0, this.TAB_num * 3);
        
        if (len) {
            if (indefinite) {
                val = data.substr(point, len * 2 - 4);
            }
            else {
                val = data.substr(point, len * 2);
            }
            point += len * 2;
        }

        //ret += tab + tagName + " ";
        ret += (TAB_num) ? this.decodeDER(val) : this.getValue(isContext ? 4 : tag, val);
        //ret += "\n";
    };
    
    this.TAB_num--;
    return ret;
};

 /*
  * Decodes a BER sequence
  *
  * Proper ASN.1 Decoding, including tag class (universal, application, context)
  *
  */
ASN1.prototype.readASN1 = function(data){
    var point = 0;
    var ret = "", indefinite;
    this.TAB_num++;
    
    while (point < data.length) {
    
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
        var isContext = tag10 & 128;
	var isApplication = tag10 & 64;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}

	if (isContext) {
		var tagName = tag16 + " " + this.NAME[tag10] + " [" + tag + "]:" ;
		tag = tag10;
	} else if (isApplication) {
		var tagName = tag16 +  " " + this.NAME[tag10] + ": ";
		tag = tag10; // Because an application tag is defined as the full tag value, not truncated to 5 bits.
	} else {
		var tagName = tag16 + " " + this.NAME[tag] + ": ";
	}

        if (tagName === "EOC") {
            if (ret == "") {
                ret = "???";
            }            
            return (ret);
        }
        if (tagName == undefined) {
            tagName = "Unsupported_TAG";
        }
        
        point += 2;
        indefinite = false;
        // Detecting LENGTH field (Max 2 octets)
        
        var len = 0;
        if (tag != 0x5) { // Ignore NULL
            if (parseInt("0x" + data.substr(point, 2)) & 128) {
                var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
                if (lenLength > 0) {
                    if (lenLength > 2) {
                        var error_message = "LENGTH field is too long.(at " + point +
                        ")\nThis program accepts up to 2 octets of Length field.";
                        throw error_message;
                        
                    }
                    len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                    point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                }
                else {
                    // use indefinite form encoding
                    //Need search for the End-of-Contents data
                    // detect the length
                    indefinite = true;
                    point += 2;
                    len = this.detectUnknownLength(data, point);
                }
            }
            else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                len = parseInt("0x" + data.substr(point, 2));
                point += 2;
            }
            
            if (len > data.length - point) {
                var error_message = "LENGTH is longer than the rest.\n";
                +"(LENGTH: " + len + ", rest: " + data.length + ")";
                
                throw error_message;
            }
        }
        else {
            point += 2;
        }
        
        // Detecting VALUE
        
        var val = "";
        var tab = this.TAB.substr(0, this.TAB_num * 6);
        
        
        if (len) {
            if (indefinite) {
                val = data.substr(point, len * 2 - 4);
            }
            else {
                val = data.substr(point, len * 2);
            }
            point += len * 2;
        }
        
        ret += tab + tagName + " ";
        if (tagName == "Unsupported_TAG") {
            ret += val;
            ret += "<br />\n";
        }
        else {
	    if (isSeq) {
		this.pushContext(this.subContextArray.pop());
	    }
            ret += (isSeq) ? "{<br/>" + this.readASN1(val) + tab + "}" : this.getValue(tag, val);
            ret += "<br/>";
	    if (isSeq) {
		this.subContextArray.push(this.popContext());
	    }
        }
	// If the tag is Zero, we stop parsing, this is the end of the structure:
	if (tag10 == 0) {
		break;
	}

    };
    
    this.TAB_num--;
    return ret;
};

/*
 * Reads a Hex string and decodes it as a pure Tag-Length-Value sequence.
 *
 * Does not distinguish between generic, context and application specific tags like
 * the readASN1 routine.
 */

ASN1.prototype.readTLV = function(data){
    var point = 0;
    var ret = "", indefinite;
    this.TAB_num++;
    
    while (point < data.length) {
    
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
//        var isContext = tag10 & 128;
//	var isApplication = tag10 & 64;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}
        var tagName = this.NAME[tag10] + ":";


        if (tagName == "undefined:") {
            tagName = "Unsupported_TAG";
        }
        
        point += 2;
        indefinite = false;
        // Detecting LENGTH field (Max 2 octets)
        
        var len = 0;
        if (parseInt("0x" + data.substr(point, 2)) & 128) {
            var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
            if (lenLength > 0) {
                if (lenLength > 2) {
                    var error_message = "LENGTH field is too long.(at " + point +
                    ")\nThis program accepts up to 2 octets of Length field.";
                    throw error_message;
                    
                }
                len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
            }
            else {
                // use indefinite form encoding
                // Need search for the End-of-Contents data
                // detect the length
                indefinite = true;
                point += 2;
                len = this.detectUnknownLength(data, point);
            }
        }
        else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
            len = parseInt("0x" + data.substr(point, 2));
            point += 2;
        }
        
        if ((len * 2) > (data.length - point)) {
            var error_message = "LENGTH is longer than the rest.\n";
            +"(LENGTH: " + len + ", rest: " + data.length + ")";
            
            throw error_message;
        }
        // Detecting VALUE		
        var val = "";
        var tab = this.TAB.substr(0, this.TAB_num * 6);
        
        
        if (len) {
            if (indefinite) {
                val = data.substr(point, len * 2 - 4);
            }
            else {
                val = data.substr(point, len * 2);
            }
            point += len * 2;
        }
        
        ret += tab + tag16 + " " + tagName + " ";

//        if (tagName == "Unsupported_TAG") {
//            ret += val;
//            ret += "<br />\n";
//        }
//        else {
		// getValue is called with the full tag in case it is context-specific
		// hoping that getValue will know what to do with the tag
//            ret += (isSeq) ? "{<br/>" + this.readTLV(val) + tab + "}" : this.getValue(isContext ? tag10 : tag, val);
            ret += (isSeq) ? "{<br/>" + this.readTLV(val) + tab + "}" : this.getValue(tag10, val);
            ret += "<br/>";
//        }
	// If the tag is Zero, we stop parsing, this is the end of the structure:
	if (tag10 == 0) {
		break;
	}
    };
    
    this.TAB_num--;
    return ret;
};


ASN1.prototype.ReadArrayOfSEQUENCE = function(data){
    var element;
    var remaindata = data;
    var result = new Array();
    
    while (remaindata.length > 0) {
        element = this.readDataValue(remaindata, "SEQUENCE");
        result[result.length] = remaindata.substr(0, remaindata.length - element.remaindata.length);
        remaindata = element.remaindata;
    }
    
    return result;
};

ASN1.prototype.ReadSEQUENCE = function(data){

    var sequence = this.readDataValue(data, "SEQUENCE");
    return this.ReadElements(sequence.value);
};

ASN1.prototype.ReadElements = function(data){
    var point = 0;
    this.TAB_num++;
    var ret = [];
    var i = 0;
    var begin_point, indefinite;
    
    while (point < data.length) {
    
        begin_point = point;
        indefinite = false;
        
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
        var isContext = tag10 & 128;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}

        var tagName = isContext ? "[" + tag + "]" : this.NAME[tag];
        if (tagName == undefined) {
            tagName = "Unsupported_TAG";
        }
        
        point += 2;
        
        // Detecting LENGTH field (Max 2 octets)
        
        var len = 0;
        if (tag != 0x5) { // Ignore NULL
            if (parseInt("0x" + data.substr(point, 2)) & 128) {
                var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
                if (lenLength > 0) {
                    if (lenLength > 2) {
                        var error_message = "LENGTH field is too long.(at " + point +
                        ")\nThis program accepts up to 2 octets of Length field.";
                        throw error_message;
                        
                    }
                    len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                    point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                }
                else { // 80
                    // use indefinite form encoding
                    //Need search for the End-of-Contents data
                    // detect the length
                    indefinite = true;
                    point += 2;
                    len = this.detectUnknownLength(data, point);
                    
                }
            }
            else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                len = parseInt("0x" + data.substr(point, 2));
                point += 2;
            }
            
            if (len > data.length - point) {
                var error_message = "LENGTH is longer than the rest.\n";
                +"(LENGTH: " + len + ", rest: " + data.length + ")";
                throw error_message;
            }
        }
        else {
            point += 2;
        }
        
        // Detecting VALUE
        
        var val = "";
        var DER_Encoded = "";
        var tab = this.TAB.substr(0, this.TAB_num * 3);
        if (len) {
            if (indefinite) {
                val = data.substr(point, len * 2 - 4);
            }
            else {
                val = data.substr(point, len * 2);
            }
            point += len * 2;
            DER_Encoded = data.substr(begin_point, point - begin_point);
        }
        
        
        val = (isSeq) ? val : this.getValue(isContext ? 4 : tag, val);
        
        ret[i++] = new ASN1Element(tagName, val, DER_Encoded);
    };
    
    this.TAB_num--;
    return ret;
};



ASN1.prototype.readDataValue = function(data, requiredtag){
    var point = 0;
    var ret = "", indefinite;
    
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
        var isContext = tag10 & 128;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}


    var tagName = isContext ? "[" + tag + "]" : this.NAME[tag];
    if (tagName != requiredtag) {
        throw "The data does not start with this tag: " + requiredtag;
    }
    
    point += 2;
    indefinite = false;
    // Detecting LENGTH field (Max 2 octets)
    
    var len = 0;
    if (tag != 0x5) { // Ignore NULL
        if (parseInt("0x" + data.substr(point, 2)) & 128) {
            var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
            if (lenLength > 0) {
                if (lenLength > 2) {
                    var error_message = "LENGTH field is too long.(at " + point +
                    ")\nThis program accepts up to 2 octets of Length field.";
                    throw error_message;
                    
                }
                len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
            }
            else { // 80
                // use indefinite form encoding
                //Need search for the End-of-Contents data
                // detect the length
                point += 2;
                len = this.detectUnknownLength(data, point);
                indefinite = true;
            }
        }
        else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
            len = parseInt("0x" + data.substr(point, 2));
            point += 2;
        }
        
        if (len > data.length - point) {
            var error_message = "LENGTH is longer than the rest.\n";
            +"(LENGTH: " + len + ", rest: " + data.length + ")";
            
            throw error_message;
            return error_message;
        }
    }
    else {
        point += 2;
    }
    
    // Detecting VALUE
    
    var val = "";
    var tab = this.TAB.substr(0, this.TAB_num * 3);
    if (len) {
        if (indefinite) {
            val = data.substr(point, len * 2 - 4); // minus the end-content 0000
        }
        else {
            val = data.substr(point, len * 2);
        }
        point += len * 2;
    }
    
    var remaindata = data.substr(point, data.length - point);
    ret += (isSeq) ? val : this.getValue(isContext ? 4 : tag, val);
    
    var returnObject = new Object();
    returnObject.value = ret;
    returnObject.remaindata = remaindata;
    return returnObject;
};

ASN1.prototype.detectUnknownLength = function(data, point){
    //"TLV TLV TLV 0000"
    //end_content_count = 1;
    // search 0000 until end_content_count == 0
    var startpoint = point;
    
    while (point < data.length) {
    
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
        var isContext = tag10 & 128;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}


        var tagName = isContext ? "[" + tag + "]" : this.NAME[tag];
        if (tagName == undefined) {
            tagName = "Unsupported_TAG";
        }
        
        point += 2;
        
        // Detecting LENGTH field (Max 2 octets)
        
        var len = 0;
        if (tag != 0x5) { // Ignore NULL
            if (parseInt("0x" + data.substr(point, 2)) & 128) {
                var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
                if (lenLength > 0) {
                    if (lenLength > 2) {
                        var error_message = "LENGTH field is too long.(at " + point +
                        ")\nThis program accepts up to 2 octets of Length field.";
                        throw error_message;
                        
                    }
                    len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                    point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                }
                else {
                    // another unknown length
                    
                    point += 2;
                    len = this.detectUnknownLength(data, point);
                }
            }
            else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
                len = parseInt("0x" + data.substr(point, 2));
                point += 2;
            }
            
            if (len > data.length - point) {
                var error_message = "LENGTH is longer than the rest.\n";
                +"(LENGTH: " + len + ", rest: " + data.length + ")";
                
                throw error_message;
                
            }
        }
        else {
            point += 2;
        }
        
        // Detecting VALUE
        
        var val = "";
        
        if (len) {
            val = data.substr(point, len * 2);
            point += len * 2;
        }
        
        end_content = data.substr(point, 4);
        
        if (end_content == '0000') {
            point += 4;
            break;
        }
        
        //val = ( isSeq ) ?  val : this.getValue( isContext ? 4 : tag , val);
        //ret[i++] = new ASN1Element(tagName,val,DER_Encoded);
    
    };
    return (point - startpoint) / 2;
    
};

/*
 *
 */
ASN1.prototype.readValue = function(data, requiredtag){
    var point = 0;
    var ret = "", indefinite;
    
        // Detecting TAG field (Multi octet supported)
        var tag10 = parseInt("0x" + data.substr(point, 2));
        var tag16 = "(" + "0x" + data.substr(point, 2) + ")";
        var isSeq = tag10 & 32;
        var isContext = tag10 & 128;
        var tag = tag10 & 31;
	if (tag == 31) {
		// Multioctet tag
		tag16 = "(" + "0x"+data.substr(point,2);
		point += 2;
		ntag10 = parseInt("0x" + data.substr(point, 2));
		tag16 += data.substr(point,2);
		tag = (tag<<8) + ntag10;
		tag10 = (tag10<<8) + ntag10;
		while (parseInt("0x" + data.substr(point,2)) & 128) {
			point += 2;
			ntag10 = parseInt("0x" + data.substr(point, 2));
			tag16 += data.substr(point,2);
			tag = (tag<<8) + ntag10;
			tag10 = (tag10<<8) + ntag10;
		}
		tag16 += ")";
	}

    var tagName = isContext ? "[" + tag + "]" : this.NAME[tag];
    if (tagName != requiredtag) {
        throw "The data does not start with this tag: " + requiredtag;
    }
    
    point += 2;
    indefinite = false;
    // Detecting LENGTH field (Max 2 octets)
    
    var len = 0;
    if (tag != 0x5) { // Ignore NULL
        if (parseInt("0x" + data.substr(point, 2)) & 128) {
            var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
            if (lenLength > 0) {
                if (lenLength > 2) {
                    var error_message = "LENGTH field is too long.(at " + point +
                    ")\nThis program accepts up to 2 octets of Length field.";
                    throw error_message;
                    
                }
                len = parseInt("0x" + data.substr(point + 2, lenLength * 2));
                point += lenLength * 2 + 2; // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
            }
            else {
                // 80
                // use indefinite form encoding
                //Need search for the End-of-Contents data
                // detect the length
                point += 2;
                len = this.detectUnknownLength(data, point);
                indefinite = true;
            }
            
        }
        else { // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
            len = parseInt("0x" + data.substr(point, 2));
            point += 2;
        }
        
        if (len > data.length - point) {
            var error_message = "LENGTH is longer than the rest.\n";
            +"(LENGTH: " + len + ", rest: " + data.length + ")";
            
            throw error_message;
            
        }
    }
    else {
        point += 2;
    }
    
    // Detecting VALUE
    var val = "";
    var tab = this.TAB.substr(0, this.TAB_num * 3);
    if (len) {
        if (indefinite) {
            val = data.substr(point, len * 2 - 4);
        }
        else {
            val = data.substr(point, len * 2);
        }
        point += len * 2;
    }
    
    //ret = ( isSeq ) ?  val : this.getValue( isContext ? 4 : tag , val);
    
    if (isSeq) {
        var seq = this.ReadElements(val);
        ret = "";
        for (var i = 0; i < seq.length; i++) {
            ret += seq[i].value;
        }
    }
    else {
        ret = this.getValue(isContext ? 4 : tag, val);
    }
    return ret;
};

/* Prints the value of a tag depending on its type.
 * Called with full tag name for types that are context or application specific.
 *
 * This function knows many tag types and is able to return meaningful
 * descriptions whenever possible.
 */
ASN1.prototype.getValue = function(tag, data){
    var ret = "N/A";
    var tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    
    if (data == "") {
        return ret;
    }
   switch (tag) {
	case 0: // EOC
		ret = "End of structure";
		break;
	case 1: // BOOLEAN
		ret = data ? 'TRUE' : 'FALSE';
    		break;
	case 2:
		 //ret = (data.length < 3 ) ? parseInt("0x" + data) : data + ' : Too long Integer. Printing in HEX.';
		ret = (data.length < 5) ? parseInt("0x" + data) : data;
		break;
        case 3: // BITSTRING
		var unUse = parseInt("0x" + data.substr(0, 2));
		var bits = data.substr(2);
                if (bits.length > this.Bitstring_hex_limit) {
                    //ret = "0x" + bits;
                    ret = bits;
                }
                else {
                    ret = parseInt("0x" + bits).toString(2);
                }
		ret += " - " + unUse + " unused bit(s)";
		switch (this.context) {
			case "CIAInfo": // card capabilities
				ret += " - cardFlags:";
				bits = parseInt("0x" + bits, 16) >> unUse;
				ret += (bits & 0x04) ? " readonly " : "";
				ret += (bits & 0x02) ? " authRequired " : "";
				ret += (bits & 0x01) ? " prnGeneration " : "";
			default:
				break;
		}

		break;
	case 5:
                    ret = "";
		break;
	case 6:
		var res = new Array();
		var d0 = parseInt("0x" + data.substr(0, 2));
		res[0] = Math.floor(d0 / 40);
		res[1] = d0 - res[0]*40;
		
		var stack = new Array();
		var powNum = 0;
		var i;
		for(i=1; i < data.length -2; i=i+2){
			var token = parseInt("0x" + data.substr(i+1,2));
			stack.push(token & 127);
			
			if ( token & 128 ){
				powNum++;
			}
			else{
				var j;
				var sum = 0;
				for (j in stack){
					if (j != "remove") {
						// Why the hell do I get a 'remove' function when I
						// create arrays ???
						sum += stack[j] * Math.pow(128, powNum--);
					}
				}
				res.push( sum );
				powNum = 0;
				stack = new Array();
			}
		}
		ret = res.join(".");
		if ( this.OID[ret] ) {
			ret += " (" + this.OID[ret] + ")";
		}

		break;
	case 0x50: // Application Label
	case 12: // UTF 8 String
		ret = hexAsciiToUTF8(data);
		break;

	case 0x18: // GeneralizedTime
		ret = hexAsciiToAscii(data);
		break;
	// Move on to context-specific tags
	case 0x80:
		if (this.context == "CIAInfo") {
			ret = hexAsciiToUTF8(data);
			break;
		}
		ret = data;
		break;
	case 0x85:
		if (this.context != "Calypso") {
			ret = data;
			break;
		}
		var EFType = new Array();
		var SFI = new Array();
		var SFIName = new Array();
		var Status = new Array();
		EFType['00'] = "DF";
		EFType['02'] = "Linear EF";
		EFType['04'] = "Cyclic EF";
		EFType['08'] = "Counter EF";
		SFI['01'] = "MF"; SFI['02']="DF"; SFI['04']="EF";
		SFIName['07'] = "Environment and holder";
		SFIName['09'] = "Contracts";
		SFIName['19'] = "Counters";
		SFIName['08'] = "Events Log";
		SFIName['1D'] = "Special Event";
		SFIName['1E'] = "Contract List";
		Status[0] = "No previous wrong PIN verification, card files valid";
		Status[1] = "No previous wrong PIN verification, card files invalidated";
		Status[16] = "One wrong PIN verification, card files valid";
		Status[17] = "One wrong PIN verification, card files invalidated";
		Status[48] = "Two wrong PIN verification, card files valid";
		Status[49] = "Two wrong PIN verification, card files invalidated";
		Status[112] = "PIN blocked, card files valid";
		Status[113] = "PIN blocked, card files invalidated";
		ret = "<br>" + tab + "SFI: 0x" + data.substr(0,2) + " - " + SFIName[data.substr(0,2)] + "<br>"+tab;
		ret += "Type: " + SFI[data.substr(2,2)] + " (" + data.substr(2,2) + ")<br>"+tab;
		ret += "EFType: " + EFType[data.substr(4,2)] + " (" + data.substr(4,2) + ")<br>"+tab;
		ret += "RecSize: 0x" + data.substr(6,2) + " / ";
		ret += "NumRec: 0x" + data.substr(8,2) + "<br>" + tab;
		ret += "AC: 0x" + data.substr(10,8) + " / " + tab;
		ret += "NKey: 0x" + data.substr(18,8) + "<br>"+tab;
		ret += "Status: " + Status[parseInt(data.substr(26,2),16)] + " (0x" + data.substr(26,2) + ")<br>" + tab;
		ret += "KVC1: 0x" + data.substr(28,2) + " / KVC2: 0x" + data.substr(30,2) + " / KVC3: 0x" + data.substr(32,2) + "<br>" + tab;
		ret += "RFU: 0x" + data.substr(34,6) + " / RFU: 0x" + data.substr(40,6);
		break;
	case 0x8A:
		ret = data + " ";
		if (this.context != "FCI") {
			break;
		}
		switch (parseInt(data,16)) {
			case 0x04:
				ret += "Operational state (disabled)";
				break;
			case 0x05:
				ret += "Operational state (enabled)";
				break;
			case 0x0C:
			case 0x0D:
				ret += "Terminated";
				break;
			default:
				ret += "Unknown";
		}
		break;
	default:
		if (this.NAME[tag] != null) {
			if (this.NAME[tag].match(/(Time|String)$/)) {
				var k = 0;
				ret += "'";
				while (k < data.length) {
					ret += String.fromCharCode("0x" + data.substr(k, 2));
					k += 2;
				}
				ret += "'";
			} else {
				ret = data;
			}
		} else {
			ret = data;
		}
	}
    return ret;
};


/*
 * Parses the known OID list and initializes the OID table.
 */
ASN1.prototype.init_oid = function(src_text){
    var lines = new Array();
    lines = src_text.split(/\r?\n/);
    
    var i;
    for (i in lines) {
        var item = new Array();
        item = lines[i].split(/,/);
        
        var j;
        for (j in item) {
            item[j] = item[j].replace(/^\s+/);
            item[j] = item[j].replace(/\s+$/);
        }
        
        if (item.length < 2 || item[0].match(/^#/)) {
            continue;
        }
        
        if (item[0].match(/[^0-9\.\-\s]/)) {
            this.OID[item[1]] = item[0];
        }
        else {
            this.OID[item[0]] = item[1];
        }
    }
};

ASN1.prototype.bin2hex = function(bin){
    var hex = "";
    var i = 0;
    var len = bin.length;
    
    while (i < len) {
        var h1 = bin.charCodeAt(i++).toString(16);
        if (h1.length < 2) {
            hex += "0";
        }
        hex += h1;
    }
    
    return hex;
};

/* I have copied the routine for decoding BASE64 from 
 http://www.onicos.com/staff/iz/amuse/javascript/expert/base64.txt */
ASN1.prototype.base64chr = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

ASN1.prototype.base64decode = function(str){
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = ASN1.base64chr[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c1 == -1);
        if (c1 == -1) {
            break;
        }
        
        /* c2 */
        do {
            c2 = ASN1.base64chr[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c2 == -1);
        if (c2 == -1) {
            break;
        }
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        
        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61) {
                return out;
            }
            c3 = ASN1.base64chr[c3];
        }
        while (i < len && c3 == -1);
        if (c3 == -1) {
            break;
        }
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        
        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61) {
                return out;
            }
            c4 = ASN1.base64chr[c4];
        }
        while (i < len && c4 == -1);
        if (c4 == -1) {
            break;
        }
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
};

/*
  Latest version from Geocities is below:

var ID   = new Array();
var NAME = new Array();

ID['BOOLEAN']          = 0x01;
ID['INTEGER']          = 0x02;
ID['BITSTRING']        = 0x03;
ID['OCTETSTRING']      = 0x04;
ID['NULL']             = 0x05;
ID['OBJECTIDENTIFIER'] = 0x06;
ID['ObjectDescripter'] = 0x07;
ID['UTF8String']       = 0x0c;
ID['SEQUENCE']         = 0x10;
ID['SET']              = 0x11;
ID['NumericString']    = 0x12;
ID['PrintableString']  = 0x13;
ID['TeletexString']    = 0x14;
ID['IA5String']        = 0x16;
ID['UTCTime']          = 0x17;
ID['GeneralizedTime']  = 0x18;

var i;
for ( i in ID ){
	NAME[ID[i]] = i;
}

var OID = new Array();

var TAB = "                              ";
var TAB_num = -1;

var Bitstring_hex_limit = 4;

var isEncode = new RegExp("[^0-9a-zA-Z\/=+]", "i");
var isB64    = new RegExp("[^0-9a-fA-F]", "i");

function convert(src, ans, mode){
	var srcValue = src.value.replace(/[\s\r\n]/g, '');
	
	if ( mode == 'auto' ){
		if ( srcValue.match(isEncode) ){
			mode = 'encode';
		}
		else if ( srcValue.match(isB64) ){
			mode = 'decode_B64';
		}
		else {
			mode = 'decode_HEX';
		}
	}

	if ( mode == 'encode'){
		ans.value = encode(srcValue);
		return;
	}
	else if ( mode == 'decode_B64'){
		if ( srcValue.match(isEncode) ){
			if ( confirm("Illegal character for Decoding process.\nDo you wish to continue as Encoding process?") ){
				ans.value = encode(srcValue);
				return;
			}
			else{
				return;
			}
		}
		//ans.value = bin2hex(base64decode(srcValue));
		ans.value = decode(bin2hex(base64decode(srcValue)));
	}
	else if ( mode == 'decode_HEX'){
		if ( srcValue.match(isB64) ){
			if ( confirm("Illegal character for Decoding process.\nDo you wish to continue as Encoding process?") ){
				ans.value = encode(srcValue);
				return;
			}
			else{
				return;
			}
		}
		ans.value = decode(srcValue);
	}
}

function encode(src){
	var ans;
	return ans;
}
function decode(src){
	if ( src.length % 2 != 0 ){
		alert('Illegal length. Hex string\'s length must be even.');
	}
	return readASN1(src);
}

function readASN1(data){
	var point = 0;
	var ret = "";
	TAB_num++;

	while ( point < data.length ){

		// Detecting TAG field (Max 1 octet)

		var tag10 = parseInt("0x" + data.substr(point, 2));
		var isSeq = tag10 & 32;
		var isContext = tag10 & 128;
		var tag = tag10 & 31;
		var tagName = isContext ? "[" + tag + "]" : NAME[tag];
		if ( tagName == undefined ){
			tagName = "Unsupported_TAG";
		}

		point += 2;
		
		// Detecting LENGTH field (Max 2 octets)

		var len = 0;
		if ( tag != 0x5){	// Ignore NULL
			if ( parseInt("0x" + data.substr(point, 2)) & 128 ){
				var lenLength = parseInt("0x" + data.substr(point, 2)) & 127;
				if ( lenLength > 2 ){
					var error_message = "LENGTH field is too long.(at " + point
					 + ")\nThis program accepts up to 2 octets of Length field.";
					alert( error_message );
					return error_message;
				}
				len = parseInt("0x" + data.substr( point+2, lenLength*2));
				point += lenLength*2 + 2;  // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
			}
			else if ( lenLength != 0 ){  // Special thanks to Mr.(or Ms.) T (Mon, 25 Nov 2002 23:49:29)
				len = parseInt("0x" + data.substr(point,2));
				point += 2;
			}
			
			if ( len > data.length - point ){
				var error_message = "LENGTH is longer than the rest.\n";
					+ "(LENGTH: " + len + ", rest: " + data.length + ")";

				alert( error_message );
				return error_message;
			}
		}
		else{
			point += 2;
		}

		// Detecting VALUE
		
		var val = "";
		var tab = TAB.substr(0, TAB_num*3);
		if ( len ){
			val = data.substr( point, len*2);
			point += len*2;
		}

		ret += tab + tagName + " ";
		ret += ( isSeq ) ? "{\n" + readASN1(val) + tab + "}" : getValue( isContext ? 4 : tag , val);
		ret += "\n";
	};
	
	TAB_num--;
	return ret;
}

function getValue(tag, data){
	var ret = "";
	
	if (tag == 1){
		ret = data ? 'TRUE' : 'FALSE';
	}
	else if (tag == 2){
		ret = (data.length < 3 ) ? parseInt("0x" + data) : data + ' : Too long Integer. Printing in HEX.';
	}
	else if (tag == 3){
		var unUse = parseInt("0x" + data.substr(0, 2));
		var bits  = data.substr(2);
		
		if ( bits.length > Bitstring_hex_limit ){
			ret = "0x" + bits;
		}
		else{
			ret = parseInt("0x" + bits).toString(2);
		}
		ret += " : " + unUse + " unused bit(s)";
	}
	else if (tag == 5){
		ret = "";
	}
	else if (tag == 6){
		var res = new Array();
		var d0 = parseInt("0x" + data.substr(0, 2));
		res[0] = Math.floor(d0 / 40);
		res[1] = d0 - res[0]*40;
		
		var stack = new Array();
		var powNum = 0;
		var i;
		for(i=1; i < data.length -2; i=i+2){
			var token = parseInt("0x" + data.substr(i+1,2));
			stack.push(token & 127);
			
			if ( token & 128 ){
				powNum++;
			}
			else{
				var j;
				var sum = 0;
				for (j in stack){
					sum += stack[j] * Math.pow(128, powNum--);
				}
				res.push( sum );
				powNum = 0;
				stack = new Array();
			}
		}
		ret = res.join(".");
		if ( OID[ret] ) {
			ret += " (" + OID[ret] + ")";
		}
	}
	else if (NAME[tag].match(/(Time|String)$/) ) {
		var k = 0;
		ret += "'";
		while ( k < data.length ){
			ret += String.fromCharCode("0x"+data.substr(k, 2));
			k += 2;
		}
		ret += "'";
	}
	else{
		ret = data;
	}
	return ret;
}

function init_oid( src_text ){
	var lines = new Array();
	lines = src_text.split(/\r?\n/);
	
	var i;
	for ( i in lines ){
		var item = new Array();
		item = lines[i].split(/,/);
		
		var j;
		for ( j in item ){
			item[j] = item[j].replace(/^\s+/);
			item[j] = item[j].replace(/\s+$/);
		}
		
		
		if ( item.length < 2 || item[0].match(/^#/) ){
			continue;
		}
		
		if ( item[0].match(/[^0-9\.\-\s]/) ){
			OID[ item[1] ] = item[0];
		}
		else{
			OID[ item[0] ] = item[1];
		}
	}
}

function bin2hex(bin){
	var hex = "";
	var i = 0;
	var len = bin.length;
	
	while ( i < len ){
		var h1 = bin.charCodeAt(i++).toString(16);
		if ( h1.length < 2 ){
			hex += "0";
		}
		hex += h1;
	}

	return hex;
}

var base64chr = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
function base64decode(str) {
	var c1, c2, c3, c4;
	var i, len, out;
	len = str.length;
	i = 0;
	out = "";
	while(i < len) {
		do {
		    c1 = base64chr[str.charCodeAt(i++) & 0xff];
		} while(i < len && c1 == -1);
		if(c1 == -1){ break; }

		do {
		    c2 = base64chr[str.charCodeAt(i++) & 0xff];
		} while(i < len && c2 == -1);
		if(c2 == -1){ break; }
		out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

		do {
		    c3 = str.charCodeAt(i++) & 0xff;
		    if(c3 == 61) { return out; }
		    c3 = base64chr[c3];
		} while(i < len && c3 == -1);
		if(c3 == -1) { break; }
		out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

		do {
		    c4 = str.charCodeAt(i++) & 0xff;
		    if(c4 == 61) { return out; }
		    c4 = base64chr[c4];
		} while(i < len && c4 == -1);
		if(c4 == -1) { break; }
		out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	}
	return out;
}

*/



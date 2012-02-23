/**
 * @author rdollet
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

var PKCS15JS = true;

//=============================================================================
// Top Class
//=============================================================================
PKCS15Class = function(){

	// Define Private Variables
	
};


//=============================================================================
// Key Class
// Inherit from Top Class
//=============================================================================
keyClass = function (){
	
};

keyClass.prototype = new PKCS15Class();

//=============================================================================
// Private Key Class
// Inherit from Key Class
//=============================================================================
privateKeyClass = function (){
	
};

privateKeyClass.prototype = new keyClass();

//=============================================================================
// Secret Key Class
// Inherit from Key Class
//=============================================================================
secretKeyClass = function (){
	
};

secretKeyClass.prototype = new keyClass();

//=============================================================================
// Public Key Class
// Inherit from Key Class
//=============================================================================
publicKeyClass = function (){
	
};

publicKeyClass.prototype = new keyClass();

//=============================================================================
// Certificate Class
// Inherit from Top Class
//=============================================================================
certificateClass = function (){
	
};

certificateClass.prototype = new PKCS15Class();

//=============================================================================
// X509 Certificate Class
// Inherit from Certificate Class
//=============================================================================
x509CertificateClass = function (){
	
};

x509CertificateClass.prototype = new certificateClass();

//=============================================================================
// Other Certificate Class
// Inherit from Certificate Class
//=============================================================================
otherCertificateClass = function (){
	
};

otherCertificateClass.prototype = new certificateClass();

//=============================================================================
// Data Class
// Inherit from Top Class
//=============================================================================
dataClass = function (){
	
};

dataClass.prototype = new PKCS15Class();

//=============================================================================
// External Data Class
// Inherit from Data Class
//=============================================================================
externalDataClass = function (){
	
};

externalDataClass.prototype = new dataClass();

//=============================================================================
// Authentication Class
// Inherit from Top Class
//=============================================================================
authenticationClass = function (){
	
};

authenticationClass.prototype = new PKCS15Class();

//=============================================================================
// Pin Authentication Class
// Inherit from Top Class
//=============================================================================
pinAuthenticationClass = function (){
	
};

pinAuthenticationClass.prototype = new authenticationClass();

//=============================================================================
// Biometric Authentication Class
// Inherit from Top Class
//=============================================================================
biometricAuthenticationClass = function (){
	
};

biometricAuthenticationClass.prototype = new authenticationClass();

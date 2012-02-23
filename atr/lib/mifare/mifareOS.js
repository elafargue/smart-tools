/**
 * @author elafargue, edouard@lafargue.name
 *
 * Distributed under the GNU GENERAL PUBLIC LICENSE (GPL)
 *            Version 2 (June 1991).
 */

// Register load:
var mifareOSJS = true;

// Abstraction layer
function mifareOs(cardAtr, apduPanel){

	this.cardOsName = "Mifare Card";
	this.myApduPanel = apduPanel;


}

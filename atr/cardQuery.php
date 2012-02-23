<?php


// This script is used to look up an ATR in our internal smart card database.
   $atr = htmlentities(trim($_GET['atr']),ENT_NOQUOTES);
   $reader = htmlentities(trim($_GET['reader']),ENT_NOQUOTES);

// Split ATR in pairs of 2 bytes:
   $atr2 = chunk_split($atr,2," ");
   $foundAMatch = false;

//   echo "Raw ATR is $atr2<hr>";

   $description = "";

   $handle = @fopen("smartcard_list.txt", "r");
   if ($handle) {
      // Looks up the smart card list from Ludovic:
      while (!feof($handle)) {
	$buffer = rtrim(fgets($handle,1024));
	if (!preg_match("/^\#/",$buffer) && preg_match("/^3[0-9A-F]/",$buffer)) {
		if (preg_match("/$buffer/",$atr2) ) {
			while(!preg_match("/^\t/",$buffer)) {
		 		$buffer = rtrim(fgets($handle,1024));
			}
			$foundAMatch = true;
			$description .= "<b>Possibly identified smart card:</b><br>";
	  		// $buffer = rtrim(fgets($handle,1024));
			while(preg_match("/^\t/",$buffer)) {	
			 if (preg_match("/xplorer/",$buffer)) {
				// Get the xplorer javascript
				preg_match("/^\t\<xplorer\>(.*)\<\/xplorer\>$/",$buffer,$matches);
				$xplorer = htmlentities($matches[1]);
				$description .= "<em>Explorer available</em><br>";
			 } else {
				 $description .= "$buffer<br>";
			 }
			 $buffer =  rtrim(fgets($handle,1024));

			}
		}
	}
      }
    if (!$foundAMatch) {
	$description .= "Did not find a match for this smart card in my database, sorry...";
    }
    fclose($handle);
   }

   echo "{description: \"" . addslashes($description) . "\", xplorer: \"$xplorer\", reader: \"$reader\", atr: \"$atr\" }";

?>


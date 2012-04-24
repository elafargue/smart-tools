#!/bin/sh

if [[ x$1 == x ]] 
then
	echo "Syntax: $0 <file>"
	echo "  where file is the smartcard_list.txt file according to legacy format"
	exit 1
fi

state=0
# state:
# 0: between cards
# 1: atrs open
# 2: desc open
# 3: xplore done
echo "<html>"
echo "<head><style> table.carddb_db td { border: solid 1px } </style></head>"
echo "<body>"
echo "<!-- Generated file - use $0 to generate it -->"
echo
echo "<table class='carddb_db'>"
sed "s/^\t/;/" $1 | while read -e line
do
	if [[ $line =~ ^[0-9A-Fa-f]+.* ]]
	then
		if [[ $((state)) -eq 0 ]]
		then
			echo "  <tr class='carddb_card'>"
			echo "    <td class='carddb_atrs'>"
			state=1
		fi
		value=`echo $line | sed "s+ ++g"`
		echo "      <p>"$value"</p>"
	elif [[ $line =~ ^\;.* ]]
	then
		if [[ $((state)) -eq 1 ]]
		then
			echo "    </td>"
			echo "    <td class='carddb_name'>"
			state=2
		fi
		if [[ $line =~ xplorer ]]
		then
			echo "    </td>"
			value=`echo $line | sed "s+^\;.*<xplorer>\(.*\)</xplorer>+\1+"`
			echo "    <td class='carddb_xplorer'>"$value"</td>"
			state=3
		else
			value=`echo $line | sed "s+^\;++g"`
			echo "      "$value"<br/>"
		fi
	elif [[ $line =~ ^$ ]]
	then
		if [[ $((state)) -eq 2 ]]
		then
			echo "    </td>"
			echo "    <td></td>"
			echo "  </tr>"
		elif [[ $((state)) -eq 3 ]]
		then
			echo "  </tr>"
		fi
		state=0
	fi
done
echo "</table></body></html>"

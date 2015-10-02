##
# I had over 100 editions of WebBits saved in outlook
# this is just a quick and dirsty apple script that allowed me to dump them all into text files for
# extracting the useful data
#
##

tell application "Microsoft Outlook"
	
	#Me being lazy... I just opened outlook and selected the folder I wanted to export
	get selected folder
	
	#Iterate through each message
	set allMsgs to (every message of selected folder)
	repeat with msg in allMsgs
		
		#Get the original date of the message, so I can use it as a sortable filename
		#Format: YYYY-M-D
		set {year:y, month:m, day:d} to time sent of msg
		set outDate to ((y & "-" & (m as integer) & "-" & d) as string)
		set fileName to ("~/dev/WebBits/out/" & outDate & ".txt")
		
		#Write To File
		my wtf((source of msg) as string, fileName)
	end repeat
end tell
on wtf(this_data, this_file)
	
	try
		#AppleScript has a terribly convoluted way of doing this. 
		#Outsourcing to the shell for simplicity
		do shell script "cat  > " & this_file & " << EOF 
" & this_data & "
EOF"
		return true
	on error error_message number error_number
		log error_message
		return false
	end try
	
end wtf

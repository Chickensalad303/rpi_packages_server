#/bin/bash
zenity --display=:0.0 --info --title="LAN IP Address" --text="Your LAN IP Address is:\n $(hostname -I | grep -Eo '([0-9]*\.){3}[0-9]*' | tr '\n' '\n')"
#displays the ipv4 adress of the raspberry pi, in a popup window for client to view
#just run chmod +x displayIP.sh to make it executable, then do ./displayIP.sh
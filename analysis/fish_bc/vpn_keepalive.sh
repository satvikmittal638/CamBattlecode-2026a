#!/bin/zsh
# FortiGate drops idle tunnels after 30 min: one ping to Deathstar every 40 s while the VPN is connected.
# If the tunnel is down, ask macOS to bring the "VPN" service back up (uses the credentials FortiClient saved; no
# password is read or stored here) - at most once every 2 minutes.
last_try=0
while true; do
  st="$(scutil --nc status "VPN" 2>/dev/null | head -n 1)"
  if [ "$st" = "Connected" ]; then
    ping -c 1 -W 2000 192.168.3.6 > /dev/null 2>&1
  elif [ "$st" = "Disconnected" ] && [ $(( $(date +%s) - last_try )) -ge 120 ]; then
    echo "$(date '+%H:%M:%S') VPN down; reconnecting"
    scutil --nc start "VPN" > /dev/null 2>&1
    last_try=$(date +%s)
  fi
  sleep 40
done

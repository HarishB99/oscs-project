Set-NetFirewallProfile -all -DefaultInboundAction Block -DefaultOutboundAction Allow
Remove-NetFirewallRule -All

import subprocess
import iptableSetup
#configure iptables
#reset iptables
iptablesHandler = IptablesHandler()
iptablesHandler.flush()
#insert default proxy rules
#Redirect HTTP and HTTPS traffic to mitmdump
subprocess.run(["sudo sysctl -w net.ipv4.ip_forward=1"])
subprocess.run(["sudo iptables -t nat -A PREROUTING \
    -p tcp --dport 443 -j REDIRECT --to-port 8080"])
subprocess.run(["sudo iptables -t nat -A PREROUTING \
    -p tcp --dport 80 -j REDIRECT --to-port 8080"])
#TODO::Rule to allow traffic from cloud server

#start mitmdump for web filter
subprocess.run(['mitmdump -s proxyscript.py']], stdout=subprocess.PIPE)

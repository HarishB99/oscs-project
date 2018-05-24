import subprocess
import json
import policyparser
import subprocess

class IptablesHandler:
    def flush():
        subprocess.run(["sudo iptables -P INPUT ACCEPT"])
        subprocess.run(["sudo iptables -P FORWARD ACCEPT"])
        subprocess.run(["sudo iptables -P OUTPUT ACCEPT"])
        subprocess.run(["sudo iptables -t nat -F"])
        subprocess.run(["sudo iptables -t mangle -F"])
        subprocess.run(["sudo iptables -F"])
        subprocess.run(["sudo iptables -X"])

    def createRule(rulejson : string):
        //load json
        r = json.loads(rulejson)

import subprocess, json, sys
import FirewallRule
from iptableSetup import IptablesHandler

#configure iptables
#initialze iptables
port = sys.argv[1] if sys.argv[1] else 8080
IptablesHandler.initialize(port)

#Get rules from file
#TODO: Get rules from cloud app
with open('../data/testrules.json', 'r') as ruleJson:
    rules = json.loads(ruleJson.read())
    for r in rules["firewallRules"]["incoming"]:
        IptablesHandler.createRule(r, True)
    for r2 in rules["firewallRules"]["outgoing"]:
        IptablesHandler.createRule(r2, False)
    #write test rules to file for proxy script
    with open('../data/temprules.json', 'rw+') as rulefile:
        rulefile.write(json.dumps(rules))


#start mitmdump for web filter
print("Proxy Server IP:")
subprocess.run(["hostname", "-I"])
subprocess.run(["mitmdump", "-p", str(port), "-s", "proxyscript.py", "--insecure"])

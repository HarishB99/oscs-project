import subprocess, json, sys, argparse, requests, platform, socket
import FirewallRule
from iptableSetup import IptablesHandler
from windowsFirewallHandler import WindowsFirewallHandler

#argument parser
parser = argparse.ArgumentParser()
parser.add_argument("port", help="port that the proxy will work off", type=int)
parser.add_argument("-u", "--user")
parser.add_argument("-p", "--password")
parser.add_argument("-n", "--no-sync", help="Do not sync with updated rules",
 action="store_true")

args = parser.parse_args()
if not args.no_sync:
    if 'user' not in args:
        print("Please enter your user email")
        sys.exit()
    if 'password' not in args:
        print("No password!")
        sys.exit()

port = args.port

#Get rules from file
#TODO: Get rules from cloud app
rules = None
if args.no_sync:
    with open('../data/testrules.json', 'r') as ruleJson:
        rules = json.loads(ruleJson.read())
else:
    data = {
        'email' : args.user,
        'password': args.password
    }
    r = requests.post('http://localhost:3000/login', json=data);
    if r.text == "Login failure":
        print("Login failure")
        sys.exit()
    if r.status_code == 200:
        #parse the json containing data
        rules = json.loads(r.text)

#start mitmdump for web filter
print("Proxy Server IP:")
print(socket.gethostbyname(socket.gethostname()))
subprocess.run(["mitmdump", "-p", str(port), "-s", "proxyscript.py"])

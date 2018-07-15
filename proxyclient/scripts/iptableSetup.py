import subprocess, json
from FirewallRule import FirewallRule

class IptablesHandler:
    @staticmethod
    def flush():
        subprocess.run(["sudo", "iptables", "-P", "INPUT", "DROP"])
        subprocess.run(["sudo", "iptables", "-P", "FORWARD", "DROP"])
        subprocess.run(["sudo", "iptables", "-P", "OUTPUT", "ACCEPT"])
        subprocess.run(["sudo", "iptables", "-t", "nat", "-F"])
        subprocess.run(["sudo", "iptables", "-t", "mangle", "-F"])
        subprocess.run(["sudo", "iptables", "-F"])
        subprocess.run(["sudo", "iptables", "-X"])

    @staticmethod
    def initialize(port):
        IptablesHandler.flush()
        #insert default proxy rules
        #Redirect HTTP and HTTPS traffic to mitmdump
        subprocess.run(["sudo", "sysctl", "-w", "net.ipv4.ip_forward=1"])
        subprocess.run(["sudo", "sysctl", "-w", "net.ipv4.conf.all.route_localnet=1"])
        subprocess.run(["sudo", "iptables", "-t", "nat", "-A", "PREROUTING", "-p",
         "tcp", "--dport", "80", "-j", "REDIRECT", "--to-ports", str(port)])
        subprocess.run(["sudo", "iptables", "-t", "nat", "-A", "PREROUTING", "-p",
         "tcp", "--dport", "443", "-j", "REDIRECT", "--to-ports", str(port)])
        #TODO::Rule to allow traffic from cloud server
        return True

    @staticmethod
    def createRule(r, incoming : bool):
        #load json
        if r is None: return None
        rule = FirewallRule(incoming, r["name"], r["allow"], r["priority"], r["sourceip"],
         r["sourceport"], r["destip"], r["destport"], r["protocol"], r["state"])
        subprocess.run(rule.asAppendCommand())

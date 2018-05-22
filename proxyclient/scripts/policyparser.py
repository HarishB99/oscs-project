import json

class NetworkPolicy:
    def __init__(self, policy : string):
        p = json.loads(policy)

        #initialze firewall rules
        self.firewallRules = []
        #add incoming rules
        for rule in p["firewallRules"]["incoming"]:
            __addFirewallRule(rule, true)
        for rule in p["firewallRules"]["outgoing"]:
            __addFirewallRule(rule, false)

    def __wildcardCheck(s):
        if '*' in s: return None
        else return s

    def __addFirewallRule(rule, direction):
        sip = __wildcardCheck(rule.sourceip)
        sport = __wildcardCheck(rule.sourceport)
        dip = __wildcardCheck(rule.destip)
        dport = __wildcardCheck(rule.destport)
        newRule = FirewallRule(true, rule.name, rule.allow, rule.priority,
         sip, sport, dip, dport, rule.protocol, rule.state)
        self.firewallRules.append(newRule)

class FirewallRule:
    def __init__(self, input, name, allow = false, priority,
     sourceip : string = None, sourceport : string= None,
     destip : string = None, destport : string = None, protocol, state = None):
        self.input = "INPUT" if input else "OUTPUT"
        self.name = str(name)
        self.target = "ACCEPT" if allow else "DROP"
        self.priority = int(priority)
        self.sourceip = sourceip
        self.sourceport = sourceport
        self.destip = destip
        self.destport = destport
        self.protocol = str(protocol)
        self.state = state

    def asAppendCommand(chain):
        rule = "iptables -A " + self.input + " "
        rule += "-p " + self.protocol + " "
        if self.sourceip is not None: rule += "-s " + self.sourceip + " "
        if self.destip is not None: rule += "-d " + self.destip + " "
        if self.sourceport is not None:
            rule += " --sport " + self.sourceport + " "
        if self.destport is not None:
            rule += " --dport " + self.destport + " "
        if self.state is not None:
            rule += "-m conntrack --ctstate " + self.state + " "
        rule += "-j " + self.target + " "

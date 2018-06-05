class FirewallRule:
    def __init__(self, input, name, allow, priority,
     sourceip, sourceport,
     destip, destport, protocol, state):
        self.input = "INPUT" if input else "OUTPUT"
        self.name = str(name)
        self.target = "ACCEPT" if allow else "DROP"
        self.priority = int(priority)
        self.sourceip = sourceip if not (sourceip == '0.0.0.0') else None
        self.sourceport = sourceport if sourceport is not '*' else None
        self.destip = destip if not (destip == '0.0.0.0') else None
        self.destport = destport if destport is not '*' else None
        self.protocol = protocol if protocol is not ( None or '*') else None
        self.state = state if state else None

    def asAppendCommand(self):
        rule = ["sudo", "iptables"]
        rule.extend(["-A", self.input])
        if self.sourceip is not None: rule.extend(["-s", self.sourceip])
        if self.destip is not None: rule.extend(["-d", self.destip])
        if self.protocol is not None:
            rule.extend(["-p", self.protocol])
            if self.sourceport is not None:
                rule.extend(["--sport", self.sourceport])
            if self.destport is not None:
                rule.extend(["--dport", self.destport])
        if self.state is not None:
            rule.extend(["-m", "conntrack", "--ctstate", self.state])
        rule.extend(["-j", self.target])
        print(rule)
        return rule

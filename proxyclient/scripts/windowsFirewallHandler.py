import subprocess, json

class WindowsFirewallHandler:
    @staticmethod
    def clear():
        subprocess.run(["powershell", "Start-Process", "powershell", "-ArgumentList",
        "\'-ExecutionPolicy", "Bypass", "-NoLogo", "-NonInteractive", "-NoProfile",
        "-File", "./Firewall-Clear.ps1\'", "-Verb", "RunAs"])

    @staticmethod
    def setRules(ruleList):
        r = json.dumps(ruleList["firewallRules"])
        rs = r.replace("\"", "\"\"\"")
        p = subprocess.Popen(["powershell", "-file", "Add-Rule.ps1", "-RuleList", "\'"+rs+"\'"], creationflags=subprocess.CREATE_NEW_CONSOLE)
        p.communicate()
        print(p.returncode)
        if not p.returncode == 0:
            rs2 = r.replace("\"", "`\"")
            p2 = subprocess.Popen(["powershell", "-file", "Add-Rule.ps1", "-RuleList", "\'"+rs2+"\'"])
            if not p2.returncode == 0:
                print("you suck") 
                p = subprocess.Popen(["powershell", "-file", "Add-Rule.ps1", "-RuleList", ""+r+""], creationflags=subprocess.CREATE_NEW_CONSOLE)
            print("hello")
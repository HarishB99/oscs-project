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
        subprocess.run(["powershell", "-file", "Add-Rule.ps1", "-RuleList", "\'"+rs+"\'"])

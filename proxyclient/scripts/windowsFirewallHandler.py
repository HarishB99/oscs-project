import subprocess, json

class WindowsFirewallHandler:
    @staticmethod
    def clear():
        subprocess.run(["powershell", "Start-Process", "powershell", "-ArgumentList",
        "\'-ExecutionPolicy", "Bypass", "-NoLogo", "-NonInteractive", "-NoProfile",
        "-File", "./Firewall-Clear.ps1\'", "-Verb", "RunAs"])

    @staticmethod
    def addRules(ruleList):
        subprocess.run(["powershell", "Start-Process", "powershell", "-ArgumentList",
        "\'-ExecutionPolicy", "Bypass", "-NoLogo", "-NonInteractive", "-NoProfile",
        "-Command", "\"&", "./Add-Rules.ps1", "-ruleList", json.dumps(json.dumps(ruleList)) + "\"\'",
        "-Verb", "RunAs"])

    def setRules(ruleList):
        r = json.dumps(ruleList["firewallRules"])
        rs = r.replace('"', '`\"')
        print(rs)
        subprocess.run(["powershell", "Start-Process", "powershell", "-ArgumentList",
        "\'-ExecutionPolicy", "Bypass", "-NoLogo", "-NonInteractive", "-NoProfile",
        "-Command", "\".\\Firewall-Clear.ps1;", ".\\Add-Rule.ps1",
        "-ruleList", "`\'"+rs+"`\'", "\"\'",
        "-Verb", "RunAs"])

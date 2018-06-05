import subprocess
subprocess.run(["sudo", "iptables", "-P", "INPUT", "ACCEPT"])
subprocess.run(["sudo", "iptables", "-t", "nat", "-F"])
subprocess.run(["sudo", "iptables", "-t", "mangle", "-F"])
subprocess.run(["sudo", "iptables", "-F"])
subprocess.run(["sudo", "iptables", "-X"])
print("iptables reset done")

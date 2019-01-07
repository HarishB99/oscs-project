#!/bin/bash

if [ "$EUID" -ne 0 ]; then
	echo -e "[-] You need to be logged in as root to execute this script"
	exit 1
fi

echo -e "INFO: Execution of $0: Started"

echo -e "\nINFO: Install git: Started\n"
add-apt-repository ppa:git-core/ppa
apt update -y && sudo apt upgrade -y
apt install -y git
echo -e "\n[+] Install git: Complete\n"

echo -e "\nINFO: Install curl: Started\n"
apt install -y curl
echo -e "\nINFO: Install curl: Complete\n"

echo -e "\nINFO: Install NodeJS 10.x: Started\n"
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
apt-get install -y nodejs
echo -e "\n[+] Install NodeJS 10.x: Complete\n"

echo -e "\nINFO: Install pip: Started\n"
apt install -y python-pip
apt install -y python3-pip
python3.6 -m pip install --user --upgrade pip
python3.6 -m pip install --user virtualenv
echo -e "\n[+] Install pip: Complete\n"

cwd=$(dirname "$(readlink -f "$0")")

echo -e "\nINFO: Install MongoDB: Started\n"
apt install -y mongodb
echo -e "\n[+] Install MongoDB: Complete\n"

echo -e "\nINFO: Pulling codes from remote git repo: Started\n"
cd ~
git clone https://github.com/harishbalamurugan/oscs-project.git
echo -e "\n[+] Pulling codes from remote git repo: Complete\n"

echo -e "\nINFO: Installing node and python dependencies: Started\n"
cd ~/oscs-project/firegate101-client/
npm i
cd ~/oscs-project
python3.6 -m virtualenv env
source env/bin/activate
pip3 install tldextract
pip3 install PyQt5
pip3 install requests
pip3 install bs4
pip3 install mitmproxy
pip3 install pymongo
deactivate
echo -e "\n[+] Installing node and python dependencies: Complete\n"

echo -e "\nINFO: Performing final set-up (some of which are not supposed to be done in an actual production environment): Started\n"
python "$cwd/setup (not to be executed manually).py"
cd ~/oscs-project
chmod u+x ./linux-start.sh
rm -f "$cwd/setup (not to be executed manually).py"
echo -e "\n[+] Performing final set-up (some of which are not supposed to be done in an actual production environment): Complete\n"

echo -e "[+][+] Execution of $0: Complete"
echo -e "\n"
echo -e "Please note that the proxy settings of this ubuntu machine needs to be changed so that connections will go through the proxy."
echo -e "Fortunately, this can be achieved through the OS' User Interface. A simple Google search will let you know how to perform this."
echo -e "\n"

echo -e "If the proxy is started for the first time, please visit mitm.it in your browser (after performing the configuring mentioned above) to download and import the digital certificate for mitmproxy into your browser."
echo -e "This is so that the proxy application can also intercept HTTPS requests and apply the necessary filters."

echo -e "\n"
echo -e "For your information, the application has been installed to the directory ~/oscs-project"

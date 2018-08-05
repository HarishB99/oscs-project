import sys, re, requests, subprocess, json, atexit, webbrowser, os, time
from windowsFirewallHandler import WindowsFirewallHandler
from iptableSetup import IptablesHandler
from PyQt5.QtWidgets import (QApplication, QWidget, QPushButton, QDesktopWidget,
    QHBoxLayout, QVBoxLayout, QAction, QLineEdit, QLabel, QStackedWidget)
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import pyqtSlot, Qt
from PyQt5 import QtGui

#spawn firegate client server
os.chdir("../../firegate101-client")
if not sys.platform.startswith('linux'):
    firegateClientP = subprocess.Popen(["node", "index.js"],
     shell=True)
    atexit.register(firegateClientP.terminate)

os.chdir("../proxyclient/scripts")
class FiregateLogin(QWidget):
    def __init__(self):
        super().__init__()
        #adjust size, position
        self.center()
        self.setWindowTitle('Firegate - Login')
        #self.setWindowIcon(QIcon('firegate-logo.png'))
        #set colour
        self.setAutoFillBackground(True)
        p = self.palette()
        p.setColor(self.backgroundRole(), Qt.white)
        self.setPalette(p)

        self.initUI()

    def initUI(self):
        #Stacked Widget for storing the two layouts
        self.stack = QStackedWidget(self)

        #First layout, login screen
        self.loginScreen = QWidget()
        #logo display
        logo = QtGui.QPixmap("../../firegate-logo.png")
        logoLabel = QLabel(self)
        logoLabel.setPixmap(logo.scaledToHeight(100))
        #textbox for email
        self.emailLabel = QLabel("Email:", self)
        self.emailTb = QLineEdit("angjinkuan@hotmail.sg", self)
        self.emailTb.setToolTip("Your Firegate login email")

        #textbox for password
        self.passLabel = QLabel("Password:", self)
        self.passTb = QLineEdit("POpopo09!", self)
        self.passTb.setToolTip("Your Firegate login password")
        self.passTb.setEchoMode(QLineEdit.Password)

        #login button, sends login request to the cloud server
        loginBtn = QPushButton('Start Proxy', self)
        loginBtn.clicked.connect(self.login)
        loginBtn.resize(loginBtn.sizeHint())

        #hidden error message label
        self.errorMessage = QLabel("", self)
        self.errorMessage.setStyleSheet("color: red")
        self.errorMessage.hide()

        #VBox container for layout
        c = QVBoxLayout()
        c.addWidget(logoLabel)
        c.addWidget(self.emailLabel)
        c.addWidget(self.emailTb)
        c.addWidget(self.passLabel)
        c.addWidget(self.passTb)
        c.addWidget(self.errorMessage)
        c.addWidget(loginBtn)
        #c.addStretch(0)
        self.loginScreen.setLayout(c)

        #second layout, login success
        self.loginSuccess = QWidget()
        #stack for tick and cross
        self.imageStack = QStackedWidget()
        #tick image
        tick = QtGui.QPixmap("../data/images/tick.png")
        tickLabel = QLabel(self)
        tickLabel.setPixmap(tick.scaledToHeight(150))
        #cross image
        cross = QtGui.QPixmap("../data/images/cross.png")
        crossLabel = QLabel(self)
        crossLabel.setPixmap(cross.scaledToHeight(150))
        #add to stack
        self.imageStack.addWidget(tickLabel)
        self.imageStack.addWidget(crossLabel)

        #login successful text
        lsText = QLabel("Login Successful! Your proxy is now active!", self)
        #edit rules button
        self.editRules = QPushButton("Edit rules", self)
        self.editRules.setDefault(True)
        self.editRules.clicked.connect(
        lambda:webbrowser.open_new_tab('https://firegate-101.firebaseapp.com/'))
        #stop proxy button
        self.proxyToggle = QStackedWidget(self)
        self.startProxy = QPushButton('Start Proxy', self)
        self.startProxy.clicked.connect(self.startProxyServer)
        self.stopProxy = QPushButton('Stop Proxy', self)
        self.stopProxy.clicked.connect(self.stopProxyServer)

        self.proxyToggle.addWidget(self.startProxy)
        self.proxyToggle.addWidget(self.stopProxy)
        #Hbox for the two buttons
        bottomRow = QHBoxLayout()
        bottomRow.addWidget(self.editRules)
        bottomRow.addWidget(self.proxyToggle)

        #creating layout
        loginSuccessLayout = QVBoxLayout()
        loginSuccessLayout.addWidget(self.imageStack, Qt.AlignCenter)
        loginSuccessLayout.addWidget(lsText)
        loginSuccessLayout.addWidget(self.editRules)
        loginSuccessLayout.addWidget(self.proxyToggle)


        self.loginSuccess.setLayout(loginSuccessLayout)

        #adding to stack
        self.stack.addWidget(self.loginScreen)
        self.stack.addWidget(self.loginSuccess)

        #container for the stack
        appContainer = QVBoxLayout()
        appContainer.addWidget(self.stack)
        self.setLayout(appContainer)
        self.resize(self.minimumSizeHint())
        self.stack.setCurrentIndex(0)
        self.show()


    #center application in the middle of the screen
    def center(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    #hit enter to login
    def keyPressEvent(self, event):
        if event.key() == Qt.Key_Enter:
            self.login()
        event.accept()

    def login(self):
        #validation
        emailRegex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        if self.emailTb.text() is not "" and \
         re.match(emailRegex, self.emailTb.text()) and \
         self.passTb.text() is not "":
            #send login request
            loginDetail = {
                'email' : self.emailTb.text(),
                'password': self.passTb.text()
            }
            try:
                r = requests.post('http://localhost:3000/login', json=loginDetail);
                if r.text == "Login failure":
                    print("Login failure")
                    FiregateLogin.errorState(True, self.emailLabel, self.passLabel)
                    FiregateLogin.errorState(False, self.emailTb, self.passTb)
                else:
                    #successful login
                    self.loginSuccessful()

                    self.startProxyServer()


            except:
                print(sys.exc_info()[0])
                raise
                self.showError("No connection to node client")

        else:
            self.showError("Email: not an email")
            FiregateLogin.errorState(True, self.emailLabel)
            FiregateLogin.errorState(False, self.emailTb)

    #connect to proxy via registry keys and start proxy server
    def startProxyServer(self):
        #edit registry to set proxy
        if sys.platform == 'win32':
            subprocess.run(["reg", "add",
            "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "1", "/f"])
            subprocess.run(["reg", "add",
            "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            "/v", "ProxyServer", "/t", "REG_SZ", "/d", "127.0.0.1:8080", "/f"])
            subprocess.run(["reg", "add",
            "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            "/v", "ProxyOverride", "/t", "REG_SZ", "/d",
            "localhost;www.virustotal.com;*.googleapis.com;*.mywot.com",
            "/f"])
            subprocess.run(["reg", "add",
            "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            "/v", "AutoDetect", "/t", "REG_DWORD", "/d", "1", "/f"])


        #firewallRules
        #test Variable
        test_rules = False
        if test_rules:
            with open('../data/testrules.json', 'r') as rulesFile:
                rules = json.loads(rulesFile.read())
        else:
            #retrive policy
            time.sleep(3) #wait a while for node client to load rules
            policyRequest = requests.get('http://localhost:3000/rules.json')
            policyJson = policyRequest.json()

            #firewall rules formatting
            policyJson["firewallRules"] = policyJson.pop("rules")
            firewallRules = policyJson["firewallRules"]
            for firewallRule in firewallRules:
                firewallRule["allow"] = firewallRule.pop("access")

            rules = policyJson

            print(json.dumps(rules, indent=4))
            #configuring firewall according to rules
            if sys.platform.startswith('linux'): #iptables for linux
                print("Linux machine detected. Configuring iptables...")
                IptablesHandler.initialize(8080)
                for r in firewallRules:
                    if r["direction"]:
                        IptablesHandler.createRule(r, True)
                    else:
                        IptablesHandler.createRule(r, False)
            elif sys.platform == 'win32': #windows firewall for windows
                print("Windows detected. Configuring windows firewall...\n" +
                 "Note that windows firewall behaves differently from regular firewalls, and can lead to weird behaviour")
                WindowsFirewallHandler.setRules(rules)

        #spin up the proxy server
        self.proxyServerP = subprocess.Popen(["mitmdump", "-s", "proxyscript.py"])
        atexit.register(self.stopProxyServer)
        atexit.register(self.proxyServerP.terminate)

        #update display
        self.proxyToggle.setCurrentIndex(1)
        self.imageStack.setCurrentIndex(0)

    #edit registry keys again and stop proxy server
    def stopProxyServer(self):
        if sys.platform == 'win32':
            subprocess.run(["reg", "add",
            "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "0", "/f"])
            subprocess.run(["reg", "add",
            "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            "/v", "AutoDetect", "/t", "REG_DWORD", "/d", "0", "/f"])
        elif sys.platform.startswith('linux'):
            ()
        ps = self.proxyServerP
        if ps is not None: ps.terminate()

        #update display
        self.proxyToggle.setCurrentIndex(0)
        self.imageStack.setCurrentIndex(1)

    #swap to login success screen
    def loginSuccessful(self):
        self.stack.setCurrentIndex(1)

    #shows error for the login screen
    def showError(self, message):
        self.errorMessage.setText(message)
        self.errorMessage.show()

    @staticmethod
    #convenience function to colour things in red
    def errorState(setColor, *widgets):
        for widget in widgets:
            if setColor:
                widget.setStyleSheet("color: red")
            else:
                widget.setStyleSheet("border: 1px solid red")




if __name__ == '__main__':
    app = QApplication(sys.argv)

    w = FiregateLogin()
    sys.exit(app.exec_())

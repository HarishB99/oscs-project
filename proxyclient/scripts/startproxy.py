import sys, re, requests, subprocess, json, atexit, webbrowser
from PyQt5.QtWidgets import (QApplication, QWidget, QPushButton, QDesktopWidget,
    QHBoxLayout, QVBoxLayout, QAction, QLineEdit, QLabel, QStackedWidget)
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import pyqtSlot, Qt
from PyQt5 import QtGui

#spawn firegate client server
firegateClientP = subprocess.Popen(["node", "..\\..\\firegate101-client\\index.js"],
 creationflags=subprocess.CREATE_NEW_CONSOLE)
atexit.register(firegateClientP.terminate)

class FiregateLogin(QWidget):
    def __init__(self):
        super().__init__()
        #adjust size, position
        self.resize(250, 400)
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
        loginBtn = QPushButton('Login', self)
        loginBtn.clicked.connect(self.login)
        loginBtn.resize(loginBtn.sizeHint())

        #hidden error message label
        self.errorMessage = QLabel("", self)
        self.errorMessage.setStyleSheet("color: red")
        self.errorMessage.hide()

        #VBox container for layout
        c = QVBoxLayout()
        c.addWidget(self.emailLabel)
        c.addWidget(self.emailTb)
        c.addWidget(self.passLabel)
        c.addWidget(self.passTb)
        c.addWidget(self.errorMessage)
        c.addWidget(loginBtn)
        self.loginScreen.setLayout(c)

        #second layout, login success
        self.loginSuccess = QWidget()
        #tick image
        tick = QLabel(self)
        tick.setPixmap(QtGui.QPixmap("../data/images/tick.png"))

        #login successful text
        lsText = QLabel("Login Successful! Your proxy is now active!", self)

        #creating layout
        loginSuccessLayout = QVBoxLayout()
        loginSuccessLayout.addWidget(tick)
        loginSuccessLayout.addWidget(lsText)

        self.loginSuccess.setLayout(loginSuccessLayout)

        #adding to stack
        self.stack.addWidget(self.loginScreen)
        self.stack.addWidget(self.loginSuccess)

        #container for the stack
        appContainer = QVBoxLayout()
        appContainer.addWidget(self.stack)
        self.setLayout(appContainer)
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

                    #spin up the proxy server
                    proxyServerP = subprocess.Popen(["mitmdump", "-p", str(8080), "-s", "proxyscript.py"],
                     creationflags=subprocess.CREATE_NEW_CONSOLE)
                    atexit.register(proxyServerP.terminate)


            except:
                print(sys.exc_info()[0])
                raise
                self.showError("No connection to node client")

        else:
            self.showError("Email: not an email")
            FiregateLogin.errorState(True, self.emailLabel)
            FiregateLogin.errorState(False, self.emailTb)

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

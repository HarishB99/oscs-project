from mitmproxy import ctx, http
from bs4 import BeautifulSoup
import subprocess

options = {
    "block-ads" : True,
    "block-malicious" : True
    "isBlacklist" : True
}

blockedDomains = {
    "ad": {},
    "malicious" : {},
    "user" : {}
}

def addDomainsF(fileName, category):
    with open(fileName, "r") as f:
        domains = f.readlines()
        for d in domains:
            blockedDomains[category][d] = True

def load(l):
    #build hash table of domains to block
    addDomainsF("../data/ad-domains-list.txt", "ad")
    addDomainsF("../data/malicious-domains-list.txt", "malicious")


def request(flow):
    #ignore ads
    if options["block-ads"]:
        if flow.request.pretty_host in blockedDomains["ad"]:
            flow.kill()
    #block malicious websites
    if options["block-malicious"]:
        if flow.request.pretty_host in blockedDomains["malicious"]:
            flow.response = http.HTTPResponse.make(
            418, "Recognized as malicious site"
            )

    #block user defined sites
    #blacklist
    if options["isBlacklist"]:
        if flow.request.pretty_host in blockedDomains["user"]:
            flow.response = http.HTTPResponse.make(
            418, "Blocked by policy (blacklist)"
            )
    else: #whitelist
        if flow.request.pretty_host not in blockedDomains["user"]:
            flow.response = http.HTTPResponse.make(
            418, "Blocked by policy (whitelist)"
            )

def response(flow):
    #ignore ads
    if blockedDomain[ad][flow.request.pretty_host]:
        flow.kill()

    #check images using header
    if flow.response.headers.get("content-type", "").startswith("image"):
        #check image

        #replace image with another
        #img = open("file.png", "rb").read()
        #flow.response.content = img
        #flow.response.headers["content-type"] = "image/png"

    #parse content
    html = BeautifulSoup(flow.response.content)

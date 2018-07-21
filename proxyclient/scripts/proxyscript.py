from mitmproxy import ctx, http
from bs4 import BeautifulSoup
from db import LogDatabase
from checkedDomains import CheckedDomains
import subprocess, json, requests

text_clf = None
options = {
    "block-ads" : True,
    "block-malicious" : True,
    "isBlacklist" : True,
    "block-child-unsafe-level": 80,
    "block-suspicious-level": 80
}

blockedDomains = {
    "ad": {},
    "malicious" : {},
    "user" : {}
}

categories = {
    '101': 'Negative: Malware or viruses',
    '102': 'Negative: Poor customer experience',
    '103': 'Negative: Phishing',
    '104': 'Negative: Scam',
    '105': 'Negative: Potentially illegal',
    '201': 'Questionable: Misleading claims or unethical',
    '202': 'Questionable: Privacy risks',
    '203': 'Questionable: Suspicious',
    '204': 'Questionable: Hate, discrimination',
    '205': 'Questionable: Spam',
    '206': 'Questionable: Potentially unwanted programs',
    '207': 'Questionable: Ads / pop-ups',
    '301': 'Neutral: Online tracking',
    '302': 'Neutral: Alternative or controversial medicine',
    '303': 'Neutral: Opinions, religion, politics ',
    '304': 'Neutral: Other ',
    '401': 'Child safety: Adult content',
    '402': 'Child safety: Incindental nudity',
    '403': 'Child safety: Gruesome or shocking',
    '404': 'Child safety: Site for kids',
    '501': 'Positive: Good site'
}

checkedDomains = {}
apiKeys = None
log = None
with open("../data/apiKeys.json", "r") as f:
    apiKeys = json.loads(f.read())

def addDomainsF(fileName, category):
    with open(fileName, "r") as f:
        domains = f.readlines()
        for d in domains:
            blockedDomains[category][d] = True

def addDomainGroup(groupNames):
    with open('../data/domaingroups.json', 'r') as dg:
        domainGroups = json.loads(dg.read())

        for dgName in groupNames:
            for dgDomain in domainGroups[dgName]:
                blockedDomains["user"][dgDomain] = True

def load(l):
    #build hash table of domains to block
    addDomainsF("../data/ad-domains-list.txt", "ad")
    addDomainsF("../data/malicious-domains-list.txt", "malicious")
    #load user defined domains
    with open('../data/testrules.json', 'r') as rules:
        rules = json.loads(rules.read())
        r = rules["webfilter"]
        #set options
        #mode
        if r["mode"] == "blacklist": options["isBlacklist"] = True
        else: options["isBlacklist"] = False
        #blocking of ads and malicious sites
        if r["blockAds"]: options["block-ads"] = True
        else: options["block-ads"] = False
        if r["blockMalicious"]: options["block-malicious"] = True
        else: options["block-malicious"] = False

        #get domain groups
        addDomainGroup(r["domainGroups"])
        #add user-defined domains
        for domain in r["domains"]:
            blockedDomains["user"][domain] = True

def request(flow):
    d = flow.request.pretty_host
    if (d == 'api.mywot.com' or d == 'safebrowsing.googleapis.com'):
        return

    ip = flow.client_conn.ip_address[0][7:]
    LogDatabase.request(ip, d)
    apiSkip = False
    if CheckedDomains.search(d) is None:
        print("UNCHECKED DOMAIN-----------------" + d)
        #ignore ads
        if options["block-ads"]:
            if d in blockedDomains["ad"]:
                CheckedDomains.add(d, False, "Blocked by policy (listed advertisement)", True)
                apiSkip = True
        #block malicious websites
        if options["block-malicious"]:
            if d in blockedDomains["malicious"]:
                CheckedDomains.add(d, False, "Blocked by policy (listed malicious)", False)
                apiSkip = True
        #block user defined sites
        #blacklist
        if options["isBlacklist"]:
            for key, value in blockedDomains["user"].items():
                if d in key:
                    print("USER DEFINED BLOCKED DOMAIN--------------" +d)
                    apiSkip = True
                    LogDatabase.blockedDomain(ip, d)
                    CheckedDomains.add(d, False, "Blocked by policy (user blacklist)", False)
                    break
        else: #whitelist
            if flow.request.pretty_host not in blockedDomains["user"]:
                apiSkip = True
                LogDatabase.blockedDomain(ip, d)
                CheckedDomains.add(d, False, "Blocked by policy (user whitelist)", False)

        if not apiSkip:
            #lookup stuff in the apis
            wotResults = webOfTrustLookup(d)
            gResults = googleSafeBrowsingLookup(d)
            #check results
            results = {}
            #google safe browsing
            if gResults != 0 and gResults != 1:
                if len(gResults) > 0:
                    print(gResults)
                    results["threatType"] = gResults[0]["threatType"]
                    results["platform"] = gResults[0]["platformType"]
                    results["domain"] = gResults[0]["threat"]["url"]
            else:
                () #TODO: log failure to another database

            #web of trust
            print("WOTRESULTS---------------------:")
            print(wotResults)
            results["trustworthiness"] = wotResults["reputation"]["trustworthiness"][0]
            results["childSafety"] = wotResults["reputation"]["childSafety"][0]
            results["categories"] = []
            results["categoryTypes"] = []
            for value in wotResults["categories"]:
                results["categories"].append(value)
                results["categoryTypes"].append(value[0][0])
            print(results)


            #check api call results
            if results["childSafety"] < options["block-child-unsafe-level"]:
                CheckedDomains.add(d, False, "Blocked by policy (child safety)", False)
                LogDatabase.securityEvent(ip, d, "childUnsafe")
            if results["trustworthiness"] < options["block-suspicious-level"]:
                CheckedDomains.add(d, False, "Blocked by policy (suspicious)", False)
                LogDatabase.securityEvent(ip, d, "suspiciousDomain")
            for cat in results["categories"]:
                if cat[0][0] == "1" and int(cat[1]) > 90:
                    CheckedDomains.add(d, False, "Blocked by policy (" + category[cat[0]])
                    LogDatabase.securityEvent(ip, d, str(cat[0]))
                if cat[0][0] == "2" and int(cat[1]) > 70:
                    CheckedDomains.add(d, False, "Blocked by policy (" + catefory[cat[0]])
                    LogDatabase.securityEvent(ip, d, str(cat[0]))
                if cat[0][0] == "3" and int(cat[1]) > 40:
                    () #TODO: Add filters for certain topics

        if CheckedDomains.search(d) is None:
            CheckedDomains.add(d, True, None, False)

    sc = CheckedDomains.search(d)
    if not sc["isSafe"]: #previously logged as unsafe
        if sc["kill"]:
            flow.kill()
        else:
            #list all reasons the domain is bad
            r = ""
            for reason in sc["reason"]:
                r += reason + '\n'
            flow.response = http.HTTPResponse.make(
                418, r
            )
    else:
        print("SAFE DOMAIN-----------"+d)


def response(flow):
    #check images using header
    if flow.response.headers.get("content-type", "").startswith("image"):
        () #TODO:: check images (may abondon for performance reasons)
        #check image
        #encoded_image = base64.b64encode(flow.response.content)
        #subprocess.run(["python3", "classify_nsfw.py", "-m", "data/open_nsfw-weights.py", "-t", "base64_"])
        #replace image with another
        #img = open("file.png", "rb").read()
        #if
        #flow.response.content = img
        #flow.response.headers["content-type"] = "image/png"

    #check downloading files
    elif flow.response.headers.get("content-type", "").startswith("video"): #video
        () #Do nothing
    elif flow.response.headers.get("content-type", "").startswith("application/octet-stream") or flow.response.headers.get("content-disposition", "").startswith("attachment"): #downloaded files
        () #TODO::scan file for viruses
    else:
        #check text
        html = BeautifulSoup(flow.response.content, "html.parser")
        text = html.get_text()

#Query Web of Trust for site reputation and category
def webOfTrustLookup(domain):
    if domain in checkedDomains:
        return True
    else:
        results = {
            'reputation' : {
                'trustworthiness' : None,
                'childSafety' : None
            },
            'categories' : []
        }
        try:
            target = 'http://' + domain + '/'
            parameters = {'hosts': domain + "/", 'key': apiKeys["webOfTrust"]}
            reply = requests.get(
                "http://api.mywot.com/0.4/public_link_json2",
                params=parameters,
                headers={'user-agent': 'Mozilla/5.0'})
            reply_dict = json.loads(reply.text)
            if reply.status_code == 200:
                for key, value in reply_dict[domain].items():
                    if key == "1":
                        ()  # Deprecated
                    elif key == "2":
                        ()  # Deprecated
                    elif key == "0":
                        if value is None:
                            results["reputation"]["trustworthiness"] = (0, 100)
                        results["reputation"]["trustworthiness"] = value
                    elif key == "4":
                        if value is None:
                            results["reputation"]["trustworthiness"] = (0, 100)
                        results["reputation"]["childSafety"] = value
                    elif key == "categories":
                        for categoryId, confidence in value.items():
                            results["categories"].append((categoryId, confidence))
                    elif key == "blacklists":
                        continue #lazy to handle this
                    else:
                        continue
                return results
            if reply.status_code != 200:
                return 2 #Server return unusual status code
        except KeyError:
            return 0 #Web of Trust API key does not work

def googleSafeBrowsingLookup(domain):
    result = []
    try:
        headers = {'content-type': 'application/json'}
        payload = {
            'client' : {
                'clientId' : 'OCCS_Project',
                'clientVersion': '1.0'
            },
            'threatInfo' : {
                'threatTypes' : ["MALWARE", "SOCIAL_ENGINEERING"],
                'platformTypes' : ["ANY_PLATFORM"],
                'threatEntryTypes' : ["URL"],
                'threatEntries' : [{"url": domain}]
            }
        }
        reply = requests.post('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + apiKeys['googleSafeBrowsing'],
            headers=headers, json=payload)

        if reply.status_code == 200:
            j = reply.json()
            if j:
                for match in reply.json()["matches"]:
                    result.append(match['threatType'])
            return result
        else:
            return 1 #bad request
    except KeyError:
        return 0 #Google API key does not work

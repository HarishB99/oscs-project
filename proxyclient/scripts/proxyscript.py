from mitmproxy import ctx, http
from bs4 import BeautifulSoup
import subprocess, json, requests

text_clf = None
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
    with open('../data/temprules.json', 'r') as rules:
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

    #load text classifier
    twenty_train = fetch_20newsgroups(subset='twenty_train')

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
    if blockedDomain["ad"][flow.response.pretty_host]:
        flow.kill()
    if blockedDomains["malicious"][flow.response.pretty_host]:
        flow.response = http.HTTPResponse.make(418, "Malicious site blocked")

    #check images using header
    if flow.response.headers.get("content-type", "").startswith("image"):
        #check image
        #encoded_image = base64.b64encode(flow.response.content)
        #subprocess.run(["python3", "classify_nsfw.py", "-m", "data/open_nsfw-weights.py", "-t", "base64_"])
        #replace image with another
        #img = open("file.png", "rb").read()
        #if
        #flow.response.content = img
        #flow.response.headers["content-type"] = "image/png"

    #check downloading files
    if(flow.response.headers.get("content-disposition", "").startswith("attachment"):
        #scan the file for viruses

    #classify text with ML
    html = BeautifulSoup(flow.response.content)
    text = html.get_text()

#Query Web of Trust for site reputation and category
def webOfTrustLookup(domain):
    results = {
        'reputation' : {
            'trustworthiness' : None,
            'childSafety' : None
        },
        'categories' : []
    }
    try:
        target = 'http://' + domain + '/'
        parameters = {'hosts': domain + "/", 'key': '390f9bd0aad758a356a40ba7858ca67b2089885f'}
        reply = requests.get(
            "http://api.mywot.com/0.4/public_link_json2",
            params=parameters,
            headers={'user-agent': 'Mozilla/5.0'})
        reply_dict = json.loads(reply.text)
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
        if reply.status_code == 200:
            for key, value in reply_dict[Domain].items():
                if key == "1":
                    ()  # Deprecated
                elif key == "2":
                    ()  # Deprecated
                elif key == "0":
                    results.reputation.trustworthiness = value
                elif key == "4":
                    results.reputation.childSafety = value
                elif key == "categories":
                    for categoryId, confidence in value.items():
                        results.categories.append((categoryId, confidence))
                elif key == "blacklists":
                    continue #lazy to handle this
                else:
                    return 4 #unknown response
            return results
        if hasKeys == False:
            return 1 #Web of Trust has no records for that particular domain

        if reply.status_code != 200:
            return 2 #Server return unusual status code
    except KeyError:
        return 0 #Web of Trust API key does not work

def googleSafeBrowsingLookup(domain):
    result = []
    try:
        reply = requests.post('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyANNSsma-RHsoH7X05wEUOGbPsl-G9vdU8',
            data = {
                'client' : {
                    'clientId' : 'OCCS Project',
                    'clientVersion': '1.5.2'
                },
                'threatInfo' : {
                    'threatTypes' : ["MALWARE", "SOCIAL_ENGINEERING"],
                    'platformTypes' : ["ANY_PLATFORM"],
                    'threatEntryTypes' ["URL"],
                    'threatEntries' : [{"url":domain}]
                }
            })
        if reply.status_code == 200:
            for match in reply.json()["matches"]:
                result.append(match.['threatType'])
            return result
        else:
            return 1 #bad request
    except KeyError:
        return 0 #Google API key does not work

import requests, json
domain='kongregate.com'
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
    print("WEB OF TRUST")
    reply = requests.get(
        "http://api.mywot.com/0.4/public_link_json2",
        params=parameters,
        headers={'user-agent': 'Mozilla/5.0'})
    print("REQUEST SENT")
    reply_dict = json.loads(reply.text)
    print(json.dumps(reply_dict))
    if reply.status_code == 200:
        for key, value in reply_dict[domain].items():
            if key == "1":
                ()  # Deprecated
            elif key == "2":
                ()  # Deprecated
            elif key == "0":
                results["reputation"]["trustworthiness"] = value
            elif key == "4":
                results["reputation"]["childSafety"] = value
            elif key == "categories":
                for categoryId, confidence in value.items():
                    results["categories"].append((categoryId, confidence))
            elif key == "blacklists":
                continue #lazy to handle this
            else:
                print(4) #unknown response
        print(results)
    if reply.status_code != 200:
        print(2) #Server return unusual status code
except KeyError:
    print(0) #Web of Trust API key does not work

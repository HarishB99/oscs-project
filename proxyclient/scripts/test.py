from proxyscript import googleSafeBrowsingLookup
import requests
try:
    result= []
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
            'threatEntries' : [{"url": "www.google.com"}]
        }
    }
    reply = requests.post('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + "AIzaSyBXIv2a07D2TV19EQqtlmRJrZ3vBMTabbE",
        headers=headers, json=payload)
    if reply.status_code == 200:
        j = reply.json()
        if j:
            for match in reply.json()["matches"]:
                result.append(match['threatType'])
        print(result)
    else:
        print(1) #bad request
except KeyError:
    print(0) #Google API key does not work

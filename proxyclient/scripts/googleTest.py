
import requests

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
            'threatEntries' : [{"url":"http://www.urltocheck1.org"}]
        }
    }
    reply = requests.post('https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyANNSsma-RHsoH7X05wEUOGbPsl-G9vdU8',
        headers=headers, json=payload)
    print(reply.json())
    if reply.status_code == 200:
        for match in reply.json()["matches"]:
            result.append(match['threatType'])
        print(result)
    else:
        print(1) #bad request
except KeyError:
    print(0) #Google API key does not work

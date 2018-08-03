import inspect, requests, hashlib
from mitmproxy import http
def response(flow):
    if flow.response.headers.get("content-type", "").startswith("application/octet-stream") or \
     flow.response.headers.get("content-disposition", "").startswith("attachment") or \
     "x-msdownload" in flow.response.headers.get("content-type", ""): #downloaded files
        #scan url for viruses
        params = {'apikey': "828ae74d8111c536f1206731c1a3203805e5e7efe8409227cc5a5effa4285601", 'resource': flow.request.url}
        response = requests.post('https://www.virustotal.com/vtapi/v2/url/report',
          params=params)
        if response.status_code == 200:
            vtJson = response.json()
            if "positives" in vtJson:
                if vtJson["positives"] <= 0:
                    #log downloaded file event
                    flow.response = http.HTTPResponse.make(
                        418, "Safe download url"
                    )
                else:
                    #not safe, stop download
                    flow.response = http.HTTPResponse.make(
                        418, "Malicious file detected"
                    )
            else:#url not recognized, trying out file hash
                hasher = hashlib.sha256()
                hasher.update(flow.response.content)
                hash = hasher.hexdigest()
                params2 = {'apikey': "828ae74d8111c536f1206731c1a3203805e5e7efe8409227cc5a5effa4285601", 'resource': hash}
                headers2 = {
                    "Accept-Encoding": "gzip, deflate",
                }
                response2 = requests.get('https://www.virustotal.com/vtapi/v2/file/report',
                  params=params2, headers=headers2)
                json_response = response2.json()
                if "positives" in json_response:
                    if json_response["positives"] <= 0: #safe
                        flow.response = http.HTTPResponse.make(
                            418, "Safe download - hash"
                        )
                    else:#unasfe
                        flow.response = http.HTTPResponse.make(
                            418, "unsafe download - hash"
                        )
                else: #still no record
                    flow.response = http.HTTPResponse.make(
                        418, "Unknown download"
                    )
        else: #failed connection for whatever reason, just stop download
            flow.response = http.HTTPResponse.make(
                418, "Connection to VirusTotal failed"
            )

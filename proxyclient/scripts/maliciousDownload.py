import requests, json

http_proxy  = "http://localhost:8080"
https_proxy = "https://localhost:8080"

proxyDict = {
              "http"  : http_proxy,
              "https" : https_proxy
            }


r = requests.get("http://malware.wicar.org/data/eicar.com", proxies=proxyDict)
print(r.headers)
print(r.text)

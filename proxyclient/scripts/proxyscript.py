from mitmproxy import ctx, http
from bs4 import BeautifulSoup
import subprocess

def request(flow):
    #with open('/home/kuan/Desktop/host.txt', 'a') as f:
    #    subprocess.call(['echo', flow.request.host + " " + flow.request.pretty_host], stdout=f)
    #check request domain against whitelist/blacklist
    if flow.request.pretty_host == "www.kongregate.com":
        #stop runnnig immediately
        flow.response = http.HTTPResponse.make(
        418, "Permission Denied!",
        )

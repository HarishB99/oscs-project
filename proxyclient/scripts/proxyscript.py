from mitmproxy import ctx, http
from bs4 import BeautifulSoup

class WebFilter:
    #check requests
    def request(flow):
        #check request domain against whitelist/blacklist
        #test using kongregate
        if flow.request.url == "https://www.kongregate.com":
            #stop runnnig immediately
            sys.exit(1)

    def response(self, flow: http.HTTPFlow) -> None:
        #check reponse

addons = [WebFilter()]

from mitmproxy import ctx, http
from bs4 import BeautifulSoup

class WebFilter:
    #check requests
    def request(flow):
        #check request domain against whitelist/blacklist
        #test using kongregate
        if flow.request.url == "https://www.kongregate.com":
            #stop runnnig immediately
            console.log("Stopped by webfilter!")
            flow.reply("Permission Denied")
            flow.response.content = "Permission Denied!"

    def response(self, flow: http.HTTPFlow) -> None:
        #open response using BeautifulSoup
        #stop processing of flow first
        flow.intercept()
        html = BeautifulSoup(flow.response.content)
        #continue if no error
        flow.resume()


addons = [WebFilter()]

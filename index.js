var http = require("http");
var url = require("url");
var fs = require("fs");

http.createServer(function(req, res) {
    var q = url.parse(req.url, true);
    var requested_path = q.pathname;
    var json_data = JSON.parse(fs.readFileSync("./app.json", "utf8"));
    var html_rewrites = json_data.rewrites.html;
    
    console.log("requested_path", requested_path);

    var filename = "unknown";

    if (!requested_path.includes(".html"))
        filename = "." + requested_path;
    
    if (!requested_path.includes(".")) {
        console.log("html_rewrites_last", html_rewrites);
        for (var i in html_rewrites) {
            console.log(i + " - requested path = " + requested_path + ", source = " + html_rewrites[i].source);
            console.log(requested_path === html_rewrites[i].source);
            if (requested_path === html_rewrites[i].source) {
                filename = "." + html_rewrites[i].destination;
            }
        }
    }

    console.log("filename", filename);

    fs.readFile(filename, function(err, data) {
        if (err) {
            res.writeHead(404);
            return res.end("404 Not Found");
        }

        res.writeHead(200);
        res.write(data);
        return res.end();
    });
}).listen(80);
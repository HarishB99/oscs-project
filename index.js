var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var os = require("os");
var tls = require("tls");
var util = require("util");
var crypto = require("crypto");
var assert = require("assert");
var https = require("https");

console.log("Starting http server...");

http.createServer(function(req, res) {
    var q = url.parse(req.url, true);
    var requested_path = q.pathname;
    var json_data = JSON.parse(fs.readFileSync("./app.json", "utf8"));
    var html_rewrites = json_data.rewrites.html;
    
    console.log("requested_path", requested_path);

    var filename = "unknown";

    // Filter out all html files. 
    // This is because all direct access to 
    // html files will be restricted.
    //
    // html files will be accessed via 
    // index values instead (refer to /app.json)
    if (!(requested_path.includes(".html") || requested_path.includes(".json")))
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

var dirname = __dirname;
var foldernames = dirname.split("\\");

console.log("Started http server on \"" + foldernames[foldernames.length - 1] + "\"");
console.log("Serving on at http://localhost");

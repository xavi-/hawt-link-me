var sources = {
    "jquery1.5": "http://code.jquery.com/jquery-1.5.min.js"
,   "jqueryui1.8.9": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.min.js"
}

var http = require("http");
var url = require("url");

var Step = require("step");

var sendLibrary = (function() {
    function getLibrary(library, callback) {
        var uri = url.parse(sources[library]);
        var content = "";
        
        http.get({ port: 80, host: uri.host, path: uri.pathname}, function(res) {
            res
                .on("data", function(data) { content += data.toString(); })
                .on("end", function() { callback(false, content); })
                .on("error", function(e) { callback(e); });
        });
    }
    
    return function sendLibrary(hash, res) {
        Step(
            function getLibraries() {
                var group = this.group();
                if(hash.indexOf("jq") > -1) { getLibrary("jquery1.5", group()); }
                if(hash.indexOf("ui") > -1) { getLibrary("jqueryui1.8.9", group()); }
                group()(false, ""); // Stupid hack to get around a Step bug
            },
            function sendResult(err, libraries) {
                if(err) { throw err; }
                
                var length = libraries.reduce(function(acc, val) { return acc + val.length; }, 0);
                
                res.writeHead(200, { "Content-Length": length
                                   , "Content-Type": "application/x-javascript" });
                libraries.forEach(function(a) { res.write(a); });
                res.end();
            }
        );
    }
})();

var srv = http.createServer(function(req, res) {
    sendLibrary(url.parse(req.url).pathname, res);
});

srv.listen(8006);
console.log("Serving hawt links on port 8006");
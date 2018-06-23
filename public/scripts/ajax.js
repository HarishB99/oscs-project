let Ajax = function() {};

Ajax.NETWORK_ERROR = "Network error";

// Definitions for performing asynchronous POST and GET requests.
Ajax.post = function(url, queryString) {
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200)
                resolve(xhr.response);
            else
                reject(Error(xhr.statusText));
        };
        xhr.onerror = function() {
            reject(Error(Ajax.NETWORK_ERROR));
        };
        if (queryString !== undefined) {
            xhr.send(queryString);
        } else {
            xhr.send();
        }
    });
};

Ajax.get = function(url, queryString) {
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function() {
            if (xhr.status === 200)
                resolve(xhr.response);
            else
                reject(Error(xhr.statusText));
        };
        xhr.onerror = function() {
            reject(Error(Ajax.NETWORK_ERROR));
        };
        if (queryString !== undefined) {
            xhr.send(queryString);
        } else {
            xhr.send();
        }
    });
};
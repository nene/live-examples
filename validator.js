// Validates syntax correctness of javascript code
onmessage = function(e) {
    try {
        eval("(function() {\n" + e.data + "\n});");
        postMessage({status: "ok", code: e.data});
    }
    catch (e) {
        postMessage({status: ""+e});
    }
};


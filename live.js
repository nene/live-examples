(function(){
    var container = document.getElementById("container");
    var textarea = document.getElementById("textarea");
    var iframe = document.getElementById("iframe");
    var messages = document.getElementById("messages");

    // Waits until #loadInlineExample method of iframe becomes
    // available, then calls it with code and passes the result to
    // callback function.
    function loadInlineExample(iframe, code, cb, timeout) {
        timeout = timeout || 2;
        if (iframe.contentWindow.loadInlineExample) {
            var status = iframe.contentWindow.loadInlineExample(code, {});
            cb && cb(status);
        }
        else {
            // The timeout increments exponentially: 2, 4, 8, 16...
            setTimeout(function(){ loadInlineExample(iframe, code, cb, timeout*2); }, timeout);
        }
    }

    function showMessage(isOk, status) {
        messages.className = isOk ? "ok" : "error";
        messages.innerHTML = status;
    }

    // Perform initial loading
    loadInlineExample(iframe, textarea.value, function(status) {
        status === "ok" ? showMessage(true, "Initial loading OK") : showMessage(false, status);
    });


    var frameInProgress = false;
    function runPreview(code) {
        if (frameInProgress) {
            return false;
        }
        frameInProgress = true;
        var newIframe = document.createElement("iframe");
        newIframe.width = 300;
        newIframe.height = 340;
        newIframe.style.visibility = "hidden";
        newIframe.onload = function() {
            loadInlineExample(newIframe, code, function(status) {
                if (status === "ok") {
                    container.removeChild(iframe);
                    newIframe.style.visibility = "visible";
                    iframe = newIframe;
                    showMessage(true, "Run OK");
                }
                else {
                    container.removeChild(newIframe);
                    showMessage(false, status);
                }
                frameInProgress = false;
            });
        };
        newIframe.src = iframe.src;
        container.appendChild(newIframe);
        return true;
    }

    var validator = new Worker("validator.js");
    var inProgress = false;
    validator.onmessage = function(e) {
        if (e.data.status !== "ok") {
            showMessage(false, e.data.status);
            return;
        }
        showMessage(true, "Syntax OK");

        if (inProgress) {
            clearTimeout(inProgress);
        }
        inProgress = setTimeout(function delay() {
            if (runPreview(e.data.code)) {
                inProgress = false;
            }
            else {
                inProgress = setTimeout(delay, 100);
            }
        }, 300);
    };

    var editor = CodeMirror.fromTextArea(textarea, {
        mode:  "javascript",
        indentUnit: 4,
        onChange: function() {
            validator.postMessage(editor.getValue());
        }
    });

})();
(function(){
    var container = document.getElementById("container");
    var editor = document.getElementById("editor");
    var iframe = document.getElementById("iframe");
    var error = document.getElementById("error");

    // We have to wait a little for the #loadInlineExample method to
    // become available.
    setTimeout(function(){
        iframe.contentWindow.loadInlineExample(editor.value, {});
    }, 100);

    function showError(status) {
        error.innerHTML = status;
    }

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
            setTimeout(function(){
                var status = newIframe.contentWindow.loadInlineExample(code, {});
                if (status === "ok") {
                    container.removeChild(iframe);
                    newIframe.style.visibility = "visible";
                    iframe = newIframe;
                    showError("Run OK");
                }
                else {
                    container.removeChild(newIframe);
                    showError(status);
                }
                frameInProgress = false;
            }, 10);
        };
        newIframe.src = iframe.src;
        container.appendChild(newIframe);
        return true;
    }

    var validator = new Worker("validator.js");
    var inProgress = false;
    validator.onmessage = function(e) {
        if (e.data.status !== "ok") {
            showError(e.data.status);
            return;
        }
        showError("Syntax OK");

        if (inProgress) {
            clearTimeout(inProgress);
        }
        inProgress = setTimeout(function delay() {
            if (runPreview(code)) {
                inProgress = false;
            }
            else {
                inProgress = setTimeout(delay, 100);
            }
        }, 300);
    };

    var code = editor.value;
    editor.onkeyup = function() {
        if (code === editor.value) {
            return;
        }
        code = editor.value;

        validator.postMessage(code);
    };

})();
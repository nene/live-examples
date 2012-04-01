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

    var oldValue = editor.value;
    var inProgress = false;
    editor.onkeyup = function() {
        if (oldValue === editor.value) {
            return;
        }
        oldValue = editor.value;

        if (inProgress) {
            clearTimeout(inProgress);
        }
        inProgress = setTimeout(function() {
            var newIframe = document.createElement("iframe");
            newIframe.width = 300;
            newIframe.height = 340;
            newIframe.style.visibility = "hidden";
            newIframe.onload = function() {
                setTimeout(function(){
                    var status = newIframe.contentWindow.loadInlineExample(editor.value, {});
                    if (status === "ok") {
                        container.removeChild(iframe);
                        newIframe.style.visibility = "visible";
                        iframe = newIframe;
                        error.innerHTML = "";
                    }
                    else {
                        container.removeChild(newIframe);
                        error.innerHTML = status;
                    }
                }, 10);
            };
            newIframe.src = iframe.src;
            container.appendChild(newIframe);
            inProgress = false;
        }, 100);
    };

})();
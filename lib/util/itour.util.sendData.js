(function (window) {
    //namespace
    window.itour || (window.itour = {});
    window.itour.util || (window.itour.util = {});

    var form;

    var sendData = function (action, json) {
        ///<summary>
        /// 动态表单提交工具
        ///</summary>
        ///<param name="action" type="String">
        /// 目标接口地址
        ///</param>
        ///<param name="json" type="Object">
        /// 请求对象
        ///</param>
        form = document.createElement("form");
        form.style.display = 'none';
        form.setAttribute("method", "post");
        form.setAttribute("action", action);
        appendParameters(null, json);
        appendForm();
        sendData._submitForm();
    };

    var appendForm = function () {
        sendData._container.appendChild(form);
    };

    var appendParameters = function (nodeName, data) {
        if (nodeName == null) {
            nodeName = '';
        }
        if (typeof data === 'object') {
            if (Object.prototype.toString.call(data) === '[object Array]') {
                for (var i = 0; i < data.length; i++) {
                    appendParameters(nodeName + '[' + i + ']', data[i]);
                }
            }
            else {
                if (nodeName != '') {
                    nodeName = nodeName + '.';
                }
                for (var subNodeName in data) {
                    
                    appendParameters(nodeName + subNodeName, data[subNodeName]);
                }
            }
        }
        else if (data != null) {
            var el = document.createElement("input");
            el.setAttribute("name", nodeName);
            el.value = data;
            form.appendChild(el);
        }
    };

    sendData._submitForm = function () {
        form.submit();
    };

    sendData._container = document.getElementsByTagName("body")[0];

    itour.util.sendData = sendData;
})(window);
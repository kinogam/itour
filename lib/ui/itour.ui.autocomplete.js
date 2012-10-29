(function (window) {
    window.itour || (window.itour = {});
    window.itour.ui || (window.itour.ui = {});

    //当前元素
    var _currentElement = null;
    //当前值
    var _currentValue = null;
    //当前监听对象
    var _currentListener = null;
    //当前数据
    var _currentData = null;
    //填充自动完成内容的层
    var _fillPanle = null;
    //是否已执行全局事件绑定
    var _hasBindGlobalEvent = false;
    //容器
    var _container = document.getElementsByTagName("body");




    var ac = function (s) {
        ///<summary>
        ///itour自动完成控件
        ///</summary>
        ///<param name="s" type="Object">
        ///&#10;el 需要绑定的元素或选择器匹配的标签
        ///&#10;data 绑定的数据
        ///&#10;view 视图模板

        ///</param>
        if (_fillPanle == null) {
            $(_container).append("<div id='itour-autocomplete' style='display:none;position:absolute;z-index:1;'></div>");
            _fillPanle = $(_container).find("#itour-autocomplete")[0];
            _ie6PanleFix();
        }

        $(s.el).data("emptyitem", s.emptyItem);
        $(s.el).data("limit", s.limit);
        $(s.el).data("acdata", s.data);
        $(s.el).data("acpos", { position: s.position, layout: s.layout });
        //        $(s.el).data("acfields", { value: s.dataField, text: s.textField });

        $(s.el).data("acfields", s.fields);

        $(s.el).data("acgetajaxdata", s.getAjaxData);
        $(s.el).data("acgetparam", s.getParam);
        $(s.el).data("acselect", s.select);
        $(s.el).data("acfuzzy", s.fuzzy);

        //如果设置了view则保存view模板，否则保存默认模板
        $(s.el).data("acview", s.view != null ? itour.util.template(s.view) : itour.util.template(ac.defaultShowView));
        $(s.el).data("acemptyview", s.emptyView != null ? itour.util.template(s.emptyView) : itour.util.template(ac.defaultEmptyView));

        _bindElementEvent(s.el);
        if (!_hasBindGlobalEvent) {
            _bindGlobalEvent();
        }
    };

    ac._reset = function () {
        _currentElement = null;
        _currentValue = null;
        _currentListener = null;
        _currentData = null;
        _fillPanle = null;
        _hasBindGlobalEvent = false;
        _showFlag = false;
    };


    /******************************
    * ie6 bug fixed
    ******************************/
    var _ie6fixer = null;

    ac._isIE6 = $.browser.msie && $.browser.version == '6.0';

    var _ie6PanleFix = function () {
        if (ac._isIE6) {
            $(_container).append("<iframe id='itour-ie6layerfixer' frameborder='0' scrolling='no' style='z-index:0;display:none;position:absolute;'></iframe>");
            _ie6fixer = $(_container).find("#itour-ie6layerfixer")[0];
        }
    };

    var _ie6PosFix = function (s) {
        if (_ie6fixer != null) {
            $(_ie6fixer).css(s);
        }
    };

    var _ie6ShowFix = function () {
        if (_ie6fixer != null) {
            _ie6fixer.style.display = 'block';
        }
    };
    var _ie6HideFix = function () {
        if (_ie6fixer != null) {
            _ie6fixer.style.display = 'none';
        }
    };
    /******************************
    * end ie6 bug fixed
    ******************************/






    /******************************
    *数据
    ******************************/

    ///触发当前元素的自动完成验证
    var _triggerCheck = function () {
        var value = _currentElement.value;
        if (value != _currentValue) {
            _currentValue = value;
            ac.triggerUpdate(value);
        }
    };

    //本地数据更新
    var _handleLocalUpdate = function (data) {
        var fields = $(_currentElement).data("acfields");
        //_currentData = _filterData(_currentValue, data, fields.value, fields.text);
        _currentData = _filterData(_currentValue, data, fields);
        _extendDataHandle(_currentData);
        _showfillPanle();
        _render(_currentData);
    };

    //ajax数据更新
    var _handleAjaxUpdate = function (url) {

        var getAjaxData = $(_currentElement).data("acgetajaxdata");

        //设置请求变量
        var param = null;
        var getParam = $(_currentElement).data("acgetparam");
        if (typeof getParam === 'function') {
            param = getParam.call(_currentElement);
        }

        ac._ajaxHandle(url, param, function (result) {
            if (typeof getAjaxData === 'undefined') {
                _currentData = result;
            }
            else {
                _currentData = getAjaxData(result);
            }
            _extendDataHandle(_currentData);
            _render(_currentData);
        });

    };

    //数据格式转换
    var _transformData = function (data, fields) {
        var tempData = [];
        for (var i = 0; i < data.length; i++) {
            tempData[tempData.length] = { text: data[i][fields.text], value: data[i][fields.value] };
        }
        return tempData;
    };

    //额外的数据处理
    var _extendDataHandle = function (data) {
        var tempData = tempData = data.slice();

        //var fields = $(_currentElement).data("acfields");
        //        var tempData = null;

        //        if (typeof fields.text !== 'undefined' || typeof fields.value !== 'undefined') {
        //            tempData = _transformData(data, fields);
        //        }
        //        else {
        //            tempData = data.slice();
        //        }
        var limit = $(_currentElement).data("limit");
        if (typeof limit !== 'undefined' && limit > 0) {
            tempData = tempData.slice(0, limit);
        }
        var emptyItem = $(_currentElement).data("emptyitem");
        if (typeof emptyItem !== 'undefined') {
            tempData.splice(0, 0, emptyItem);
        }
        _currentData = tempData;
    };

    //触发更新
    ac.triggerUpdate = function (value) {
        var data = $(_currentElement).data("acdata");
        if (typeof data === 'string') {
            _handleAjaxUpdate(data);
        }
        else {
            _handleLocalUpdate(data);
        }
    };





    ac._ajaxHandle = function (url, param, callback) {
        $.get(url, param, callback);
    };




    ac._repeater = function (fn, delay) {
        return window.setInterval(fn, delay);
    };



    ac._clearInterval = function (listener) {
        window.clearInterval(listener);
    };

    //var _filterData = function (value, data, dataField, textField) {
    var _filterData = function (value, data, fields) {
        //获取当前输入框内容长度
        var len = value.length;
        //        var _textField = textField !== undefined ? textField : 'text';
        //        var _dataField = dataField !== undefined ? dataField : 'value';



        //内容为空则返回全部
        if (len == 0) {
            return data;
        }


        var tempData = [];

        //获取模糊匹配判断
        var fuzzy = $(_currentElement).data("acfuzzy");

        for (var i = 0; i < data.length; i++) {
            if (isPropertyValueMatch(data[i], fields, value, fuzzy)) {
                tempData.push(data[i]);
            }
            //            var _value = '';
            //            var _text = '';
            //            if (fuzzy == true) {
            //                _value = String(data[i][_dataField]).toUpperCase();
            //                _text = String(data[i][_textField]).toUpperCase();
            //                if (_value.indexOf(value.toUpperCase()) != -1 || _text.indexOf(value.toUpperCase()) != -1) {
            //                    tempData.push(data[i]);
            //                }
            //            } else {
            //                _value = String(data[i][_dataField]).substr(0, len);
            //                _text = String(data[i][_textField]).substr(0, len);
            //                if (_value.toUpperCase() == value.toUpperCase() || _text.toUpperCase() == value.toUpperCase()) {
            //                    tempData.push(data[i]);
            //                }
            //            }
        }
        return tempData;
    };

    //用来判断obj的属性是否含有和value相匹配的值
    var isPropertyValueMatch = function (obj, fields, value, isFuzzy) {
        if (typeof fields == 'undefined') {
            fields = [];
            for (var i in obj) {
                fields.push(i);
            }
        }

        for (var i = 0; i < fields.length; i++) {
            var _value;
            //模糊状态(isFuzzy）的情况下则使用indexOf来匹配字符，否则就获取和输入值长度相等的，从左边开始匹配字符串来做等值匹配
            if (isFuzzy) {
                _value = String(obj[fields[i]]).toUpperCase();
                return _value.indexOf(value.toUpperCase()) != -1;
            }
            else {
                _value = String(obj[fields[i]]).substr(0, value.length).toUpperCase();
                if (_value == value.toUpperCase()) {
                    return true;
                }
                else {
                    continue;
                }
            }
        }
        return false;
    };

    /******************************
    * end 数据
    ******************************/


    /******************************
    *视图
    ******************************/

    ac._setContainer = function (mockContainer) {
        _container = mockContainer;
    };

    var _triggerSelect = function (item) {
        var selectFn = $(_currentElement).data("acselect");
        if (typeof selectFn === 'function') {
            selectFn(item);
        }
    };

    //没有匹配到选项的时候的处理
    var _doNoMatchHandle = function (data, dom) {
        var emptyitem = $(dom).data("emptyitem");
        var len = data.length;
        if (typeof emptyitem !== 'undefined') {
            len--;
        }
        if (len == 0) {
            dom.value = '';
            _currentValue = '';
            ac.hide();
            return true;
        }
        else {
            return false;
        }
    };

    var _doFillSelectedItemValue = function (dom) {
        var item = $(_fillPanle).find(".currentrow");
        if (item.length == 0) {
            dom.value = '';
            //_triggerSelect({ value: '', text: '' });
            return;
        }
        var index = Number(item.attr("index"));
        dom.value = _currentData[index].text;
        //_triggerSelect(_currentData[index]);
        return index;
    };

    //判断是否点击下拉列表元素
    var _clickListItemFlag = false;

    //处理元素事件
    var _bindElementEvent = function (el) {
        $(el).bind("focus", function () {
            _currentElement = this;
            _currentValue = this.value;
            ac.triggerUpdate(_currentValue);
            _currentListener = ac._repeater(_triggerCheck, 100);
            _showfillPanle();
        });
        $(el).bind("blur", function () {
            ac._clearInterval(_currentListener);
            if (!_doNoMatchHandle(_currentData, this)) {
                var index = _doFillSelectedItemValue(this);
                if (!_clickListItemFlag) {
                    _triggerSelect(_currentData[index]);
                }
                else {
                    _clickListItemFlag = false;
                }
                ac.hide();
            }
            else {
                _triggerSelect({ value: '', text: '' });
            }
        });

        $(el).bind("keydown", function (e) {
            if (e.keyCode == 13 && _currentData != null) {

                if (_doNoMatchHandle(_currentData, this)) {
                    _triggerSelect({ value: '', text: '' });
                    return;
                }

                //获取含有className 为 selected的元素，并获取索引index属性来和数组列表对照
                var index = _doFillSelectedItemValue(this);

                _triggerSelect(_currentData[index]);
                ac.hide();
            }
            else if (e.keyCode == 38) {
                var item = $(_fillPanle).find(".selected");
                var index = Number(item.attr("index"));
                if (index > 0) {
                    item.removeClass('selected');
                    item.removeClass('currentrow');
                    var nextrow = $(_fillPanle).find("[index=" + (index - 1) + "]");
                    nextrow.addClass('selected');
                    nextrow.addClass('currentrow');
                }
            }
            else if (e.keyCode == 40) {
                var item = $(_fillPanle).find(".selected");
                var index = Number(item.attr("index"));
                if (index < _currentData.length - 1) {

                    item.removeClass('selected');
                    item.removeClass('currentrow');
                    var nextrow = $(_fillPanle).find("[index=" + (index + 1) + "]");
                    nextrow.addClass('selected');
                    nextrow.addClass('currentrow');

                }
            }
            else {
                _triggerCheck();
            }
        });

        $(el).bind('dblclick', function () {
            this.value = '';
            ac.hide();
        });

        $(el).bind('mousedown', function () {
            _currentElement = this;
            _showfillPanle();
        });
    };

    //全局事件只触发一次
    var _bindGlobalEvent = function () {
        $(_fillPanle).delegate(".list-item", "mousedown", function () {
            //触发select回调
            var index = Number(this.getAttribute("index"));
            _currentElement.value = _currentData[index].text;
            _triggerSelect(_currentData[index]);

            _clickListItemFlag = true;

            $(_fillPanle).find('.list-item').removeClass('currentrow');
            $(this).addClass('currentrow');

            ac.hide();
        });

        $(_fillPanle).delegate('.list-item', 'mouseenter', function () {
            //$(_fillPanle).find('.list-item').removeClass('selected');
            if (!$(this).hasClass('currentrow')) {
                $(this).addClass('selected');
            }
        });
        $(_fillPanle).delegate('.list-item', 'mouseleave', function () {
            if (!$(this).hasClass('currentrow')) {
                $(this).removeClass('selected');
            }
        });
        _hasBindGlobalEvent = true;
    };

    var _eventShow = function (dom) {
        _currentElement = dom;
        _currentValue = dom.value;
        ac.triggerUpdate(_currentValue);
        _currentListener = ac._repeater(_triggerCheck, 100);
    };

    //显示自动完成
    var _showfillPanle = function () {
        _fillPanle.style.display = "block";
        _setLayerPosition(_currentElement, _fillPanle, $(_currentElement).data("acpos"));
        _ie6ShowFix();
    };

    //隐藏自动完成
    ac.hide = function () {
        _fillPanle.style.display = "none";
        _ie6HideFix();
    };


    //默认模板
    ac.defaultShowView = "<ul>@for(var i=0;i<data.length;i++){<li class='list-item' index='@i'>@data[i].text</li>}</ul>";

    //无数据模板
    ac.defaultEmptyView = "抱歉找不到:@input";

    //处理自动完成控件渲染
    var _render = function (data) {
        var viewFn = $(_currentElement).data("acview");
        var emptyViewFn = $(_currentElement).data("acemptyview");
        var emptyitem = $(_currentElement).data("emptyitem");

        var html = '';

        //获取排除了自定义item后的数据长度
        var len = data.length;
        if (typeof emptyitem !== 'undefined') {
            len--;
        }
        if (len == 0) {
            html = itour.util.template(emptyViewFn, { input: _currentElement.value, data: data });
        }
        else {
            html = itour.util.template(viewFn, { input: _currentElement.value, data: data });
        }


        $(_fillPanle).html(html);
        //_showfillPanle();


        if (typeof emptyitem !== 'undefined') {
            $(_fillPanle).find(".list-item:eq(1)").addClass('selected').addClass('currentrow');
        }
        else {
            $(_fillPanle).find(".list-item:eq(0)").addClass('selected').addClass('currentrow');
        }
    };



    //弹出层定位
    var _setLayerPosition = function (targetDom, layerDom, setting) {

        var wobj = ac.mockWindow || {
            width: $(window).width(),
            height: $(window).height()
        };
        var layer = ac.mockLayer || { x: 0, y: 0,
            width: $(layerDom).width(), height: $(layerDom).height()
        };

        var _target = {
            x: $(targetDom).offset().left,
            y: $(targetDom).offset().top,
            width: $(targetDom).width(),
            height: $(targetDom).height()
        };

        var target = ac.mockTarget || _target;

        var scroll = ac.mockScroll || { top: $(window).scrollTop(), left: $(window).scrollLeft() };


        _setVerticalStyle({
            targetDom: targetDom,
            layerDom: layerDom,
            setting: setting == null ? {} : setting,
            wobj: wobj,
            layer: layer,
            target: target,
            scroll: scroll
        });


    };

    var _setVerticalStyle = function (s) {
        var tipClass = 'itour-autocomplete-v-';
        var positionClass = "";
        var target = s.target;
        var layer = s.layer;
        var wobj = s.wobj;
        var scroll = s.scroll;
        var setting = s.setting;


        var custom = {
            x: (setting.position && setting.position.x) ? setting.position.x : 0,
            y: (setting.position && setting.position.y) ? setting.position.y : 0
        };

        var p = {
            x: 0,
            y: 0
        };



        var blp = null;

        if (setting.layout === "top") {
            positionClass = _getTopLayoutPosition(s, custom);
        }
        else {
            positionClass = _getBottomLayoutPosition(s, custom);
        }


        s.layerDom.className = tipClass + positionClass;

        //更新层样式
        layer = ac.mockLayer || { x: 0, y: 0,
            width: $(s.layerDom).width(), height: $(s.layerDom).height()
        };
        if (positionClass.indexOf('l') != -1) {
            p.x = target.x + target.width - layer.width - custom.x;
        }
        else if (positionClass.indexOf('r') != -1) {
            p.x = target.x + custom.x;
        }

        if (positionClass.indexOf('u') != -1) {
            p.y = target.y - layer.height - custom.y;
        }
        else if (positionClass.indexOf('d') != -1) {
            p.y = target.y + target.height + custom.y;
        }


        $(s.layerDom).css({ top: p.y, left: p.x });
        _ie6PosFix({ width: layer.width, height: layer.height, top: p.y, left: p.x });
    };

    //顶部布局
    var _getTopLayoutPosition = function (s, custom) {
        var target = s.target;
        var layer = s.layer;
        var wobj = s.wobj;
        var scroll = s.scroll;


        var positionClass = "";
        if (target.x + layer.width + custom.x > wobj.width + scroll.left) {
            //左模式

            positionClass += 'l';
        }
        else {
            //右模式
            positionClass += 'r';

        }

        if (target.y - layer.height - custom.y < 0) {
            //下模式

            positionClass += 'd';
        }
        else {
            //上模式

            positionClass += 'u';
        }
        return positionClass;
    }


    //底部布局
    var _getBottomLayoutPosition = function (s, custom) {
        var target = s.target;
        var layer = s.layer;
        var wobj = s.wobj;
        var scroll = s.scroll;



        var positionClass = "";
        if (target.x + layer.width + custom.x > wobj.width + scroll.left) {
            positionClass += 'l';
        }
        else {
            //右模式
            positionClass += 'r';
        }

        if (target.y + target.height + layer.height + custom.y > wobj.height + scroll.top) {
            //上模式
            positionClass += 'u';
        }
        else {
            //下模式
            positionClass += 'd';
        }
        return positionClass;
    }

    /******************************
    * end 视图
    ******************************/

    window.itour.ui.autocomplete = ac;

})(window);


/// <reference path="../util/itour.util.template.js" />
/// <reference path="../../jquery.js" />

(function (window) {
    //namespace
    window.itour || (window.itour = {});
    window.itour.ui || (window.itour.ui = {});

    var t = function (s) {
        ///<summary>
        ///itour.ui.tip
        ///</summary>
        ///<param name="s" type="Object">
        ///&#10;1.name="el" type="String|DOM" 需要绑定的元素或选择器匹配的标签
        ///&#10;2.name="view" type="String|Function" 视图模板
        ///&#10;3.name="container" type="DOM" 容器标签，默认为body
        ///&#10;4.name="event" type="String" 触发类型，可以输入toggle和hover,默认为hover
        ///&#10;5.name="action" type="String" ajax数据获取地址
        ///&#10;6.name="position" type="Object" 偏移坐标,默认 {x:0, y:0}
        ///&#10;7.name="loadingView" type="String|Function" 加载视图模板
        ///&#10;8.name="data" type="String" tip控件数据
        ///&#10;9.name="handle" type="Function" ajax事件触发时回调
        ///</param> 

        //使用设置的容器，tip层将会添加到容器内
        if (typeof s.container !== 'undefined')
            t.container = s.container;

        //container是存放layer的容器
        t.container || (t.container = document.getElementsByTagName("body")[0]);

        //设置事件监听面板，只监听该面板下的selector事件（当传过来的el是字符串的时候）
        s.listener = s.listener || t.container;

        //tip属性初始化
        t._init();

        s.tip = t.tipItem;
        //模板初始化
        changeView2Func(s);



        //设置事件
        setTipEvent(s);
    }

    t._init = function () {
        if ($(t.container).find("#itour-tip").length === 0) {
            t.tipItem = document.createElement("div");
            t.tipItem.id = "itour-tip";
            $(t.tipItem).css({ position: 'absolute', display: "none", "z-index": 999 });
            t.container.appendChild(t.tipItem);
            _ie6PanleFix();
        }
    };

    /******************************
    * ie6 bug fixed
    ******************************/
    var _ie6fixer = null;

    t._isIE6 = $.browser.msie && $.browser.version == '6.0';

    var _ie6PanleFix = function () {
        if (t._isIE6) {
            $(t.container).append("<iframe id='itour-ie6layerfixer' frameborder='0' scrolling='no' style='z-index:0;display:none;position:absolute;'></iframe>");
            _ie6fixer = $(t.container).find("#itour-ie6layerfixer")[0];
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


    var changeView2Func = function (s) {

        ///<param name="s" type="Object">
        ///配置对象
        ///</param>

        if (typeof s.view === 'string') {
            s.view = itour.util.getTemplateFunc(s.view);
        };
        if (typeof t._defaultLoadingView === 'string')
            t._defaultLoadingView = itour.util.getTemplateFunc(t._defaultLoadingView);
        if (typeof s.loadingView === 'string') {
            s.loadingView = itour.util.getTemplateFunc(s.loadingView);
        };
    }

    var setTipEvent = function (s) {


        //字符串selector模式
        if (typeof s.el === 'string') {
            if (s.event == 'toggle') {
                //事件监听模式模拟toggle
                var toggle = 0;
                $(s.listener).delegate(s.el, 'click', function () {
                    toggle = (toggle + 1) % 2;

                    //奇数显示 偶数隐藏
                    if (toggle == 1)
                        showMyTip(this, s);
                    else
                        t._tiphide(s);
                });
            }
            else {
                //默认hover
                $(s.listener).delegate(s.el, 'mouseenter', function () {
                    showMyTip(this, s);
                });
                $(s.listener).delegate(s.el, 'mouseleave', function () {
                    t._tiphide(s);
                });
            }
        }
        //dom模式
        else {
            var e = null;
            if (typeof s.event === 'string')
                e = s.event;
            $(s.el)[e || "hover"](function () {
                showMyTip(this, s);
            }, function () {
                t._tiphide(s);
            });
        }
    };


    var showMyTip = function (el, s) {
        t.currentElement = el;

        var temp = {};
        for (var i in s)
            temp[i] = s[i];

        temp.el = el;

        //handle处理
        if (typeof s.handle === 'function') {
            s.handle.call(temp);
        }

        //设置宽度
        if (temp.width != undefined) {
            $(t.tipItem).css('width', temp.width);
        }
        else {
            $(t.tipItem).css('width', 'auto');
        }

        //        if (temp.maxwidth != undefined) {
        //            $(t.tipItem).css('maxWidth', temp.maxwidth);
        //        }



        //判断是否已经设置数据、是否已经缓存了数据、是否设置了请求数据的接口
        if (typeof temp.data === 'undefined' && $(el).data("data") == null && temp.action) {

            //显示Loading视图
            setView(temp.loadingView || t._defaultLoadingView);

            //发送请求
            t._ajaxHandle(temp.action, temp.param, function (result) {
                $(el).data("data", result);

                //如果el是当前元素则显示
                if (t.currentElement == el) {
                    setView(temp.view, result);
                    setLayerPosition(el, temp);
                }
            });

        }
        else {
            var data = temp.data || $(el).data("data");
            setView(temp.view, data);
        }
        setLayerPosition(el, temp);

        //显示tip
        t._tipshow(s);
    };

    t._tipshow = function (s) {
        var ti = $(t.tipItem);
        if (s.event && s.event.show) {
            s.event.show.call(s);
            return;
        }
        if (s.show) {

            ti.stop();
            ti.css({ display: "block", opacity: 0 });
            ti.animate({ opacity: 1 }, s.show);
        }
        else {
            ti.stop();
            ti.css({ display: "block", opacity: 1 });
        }
        _ie6ShowFix();
    };

    t._tiphide = function (s) {
        if (s.event && s.event.hide) {
            s.event.hide.call(s);
            return;
        }
        if (s.show) {
            var ti = $(t.tipItem);
            ti.stop();
            ti.animate({ opacity: 0 }, s.show);
        }
        else {
            t.tipItem.style.display = "none";
        }
        _ie6HideFix();
    };

    var setView = function (view, result) {
        t.tipItem.innerHTML = itour.util.template(view, { data: result }, { enableCleanMode: true });
    };

    var setLayerPosition = function (targetDom, setting) {

        var arrowDom = $(t.tipItem).find(".itour-tip-arrow")[0] || document.createElement("div");
        arrowDom.style.position = "absolute";


        var wobj = t.mockWindow || {
            width: $(window).width(),
            height: $(window).height()
        };
        var layer = t.mockLayer || { x: 0, y: 0,
            width: $(t.tipItem).width(), height: $(t.tipItem).height()
        };

        var _target = { x: 0, y: 0 };

        if (targetDom.tagName.toLowerCase() == "area") {
            var areaStyleList = $(targetDom).attr("coords").split(",");
            var useMap = $(targetDom).parent().attr("name");
            var img = t.mockImg || $("img[usemap=#" + useMap + "]");
            _target = {
                x: img.offset().left + Number(areaStyleList[0]),
                y: img.offset().top + Number(areaStyleList[1]),
                width: Number(areaStyleList[2]) - Number(areaStyleList[0]),
                height: Number(areaStyleList[3]) - Number(areaStyleList[1])
            }
        }
        else {
            _target = {
                x: $(targetDom).offset().left,
                y: $(targetDom).offset().top,
                width: $(targetDom).width(),
                height: $(targetDom).height()
            }
        }

        var target = t.mockTarget || _target;

        var scroll = t.mockScroll || { top: $(window).scrollTop(), left: $(window).scrollLeft() };


        _setVerticalStyle({
            targetDom: targetDom,
            layerDom: t.tipItem,
            arrowDom: arrowDom,
            setting: setting,
            wobj: wobj,
            layer: layer,
            target: target,
            scroll: scroll
        });


    };

    var _setVerticalStyle = function (s) {
        var tipClass = 'itour-tip-v-';
        var positionClass = "";
        var target = s.target;
        var layer = s.layer;
        var wobj = s.wobj;
        var scroll = s.scroll;
        var setting = s.setting;

        var arrow = t.mockArrow || { width: $(s.arrowDom).width(), height: $(s.arrowDom).height() };

        var custom = {
            x: (setting.position && setting.position.x) ? setting.position.x : 0,
            y: (setting.position && setting.position.y) ? setting.position.y : 0
        };

        var p = {
            x: 0,
            y: 0
        };


        //箭头坐标
        var ap = {
            x: 0,
            y: 0
        };

        var blp = null;

        if (setting.layout === "top") {
            positionClass = getTopLayoutPosition(s, custom);
        }
        else {
            positionClass = getBottomLayoutPosition(s, custom);
        }


        s.layerDom.className = tipClass + positionClass;

        //更新层样式
        layer = t.mockLayer || { x: 0, y: 0,
            width: $(s.layerDom).width(), height: $(s.layerDom).height()
        };
        if (positionClass.indexOf('l') != -1) {
            p.x = target.x + target.width - layer.width - custom.x;
            ap.x = layer.width - Math.floor(target.width / 2) - Math.floor(arrow.width / 2) + custom.x;
        }
        else if (positionClass.indexOf('r') != -1) {
            p.x = target.x + custom.x;
            ap.x = Math.floor(target.width / 2) - Math.floor(arrow.width / 2) - custom.x;
        }

        if (positionClass.indexOf('u') != -1) {
            p.y = target.y - layer.height - custom.y;
            ap.y = layer.height - arrow.height;
        }
        else if (positionClass.indexOf('d') != -1) {
            p.y = target.y + target.height + custom.y;
            ap.y = 0;
        }


        $(s.layerDom).css({ top: p.y, left: p.x });
        $(s.arrowDom).css({ "top": ap.y, "left": ap.x });
        _ie6PosFix({ width: layer.width, height: layer.height, top: p.y, left: p.x });
    };

    //顶部布局
    var getTopLayoutPosition = function (s, custom) {
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
    var getBottomLayoutPosition = function (s, custom) {
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


    t._defaultLoadingView = "<div class='tooltips_box' style='display:block'><div class='tips_box_7'>loading...</div></div>";

    t._ajaxHandle = function (action, param, callback) {
        var value = null;

        AjaxMethods.InvokeMethod(action, param, function (result) {
            try {
                value = JSON.parse(result.value);
            }
            catch (e) {
                value = result.value;
            }
            callback(value);
        });
    }

    window.itour.ui.tip = t;

})(window);
 

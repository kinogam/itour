/// <reference path="../../qunit/qunit.js" />
/// <reference path="../../../lib/ui/itour.ui.tip.js" />
var t = itour.ui.tip;
var temp_tipShow;
var temp_tipHide;

module("tip", {
    setup: function () {
        t.container = document.createElement("div");
        t._init();

        temp_tipShow = t._tipshow;

        temp_tipHide = t._tiphide;
    },
    teardown: function () {
        t.mockWindow = { width: 0, height: 0 };
        t.mockLayer = { x: 0, y: 0, width: 0, height: 0 };
        t.mockTarget = { x: 0, y: 0, width: 0, height: 0 };
        t.mockScroll = { top: 0, left: 0 };
        t._tipshow = temp_tipShow;
        t._tiphide = temp_tipHide;
    }
});


test("div should be append to container after function called", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip" });
    equal($(t.container).find("#itour-tip").length, 1);
});

test("set container", function () {
    var dom = document.createElement("span");
    t({ container: document.createElement("p"), el: dom, view: "hello tip" });
    equal(t.container.tagName.toUpperCase(), "P");
    equal($(t.container).find("#itour-tip").length, 1);
});

test("div should use view template for content", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip", event: "hover" });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), "hello tip");
});



test("default event is hover", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip" });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), "hello tip");
});

test("should be hidden while mouseout", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip" });
    $(dom).trigger("mouseover");
    $(dom).trigger("mouseout");
    equal($(t.container).find("#itour-tip").css("display"), "none");
});

test("should custom mouse event", function () {
    expect(2);
    var dom = document.createElement("div");
    t({
        el: dom,
        view: "hello tip",
        event: {
            show: function () {
                ok(true);
            },
            hide: function () {
                ok(true);
            }
        }
    });
    $(dom).trigger("mouseover");
    $(dom).trigger("mouseout");
});

test("toggle event should be support", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip", event: "toggle" });
    $(dom).trigger("click");
    equal($(t.container).find("#itour-tip").html(), "hello tip");
    $(dom).trigger("click");
    equal($(t.container).find("#itour-tip").css("display"), "none");
});


test("should call ajax method while 'action' is setted", function () {
    expect(1)
    t._ajaxHandle = function () {
        ok(true);
    };
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip", action: "someAjaxMethod" });
    $(dom).trigger("mouseover");
});

test("view template should use @data to set values", function () {
    expect(1)
    t._ajaxHandle = function (action, param, callback) {
        callback({ name: 'kino' });
    };
    var dom = document.createElement("div");
    t({ el: dom, view: "hello @data.name", action: "someAjaxMethod" });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), 'hello kino');
});

test("use data for view data setting", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "hello @data.name", data: { name: 'kino'} });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), 'hello kino');
});

test("layer position check", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockTarget = { x: 300, y: 300, width: 100, height: 100 };

    var dom = document.createElement("div");
    t({ el: dom, view: "hello" });
    $(dom).trigger("mouseover");
    var layer = $(t.container).find("#itour-tip");
    //右下模式
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "300");

    //左下模式
    t.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "600");

    //右上模式
    t.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "100");

    //左上模式
    t.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "600");

    //用户偏移设置
    t.mockTarget = { x: 300, y: 300, width: 100, height: 100 };
    t({ el: dom, view: "hello", position: { x: 10, y: 10} });

    //用户偏移设置-右下模式
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "410", 'right down mode, top');
    equal(layer.css("left").replace(/px$/, ''), "310", 'right down mode, left');

    //用户偏移设置-左下模式
    t.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "410");
    equal(layer.css("left").replace(/px$/, ''), "590");

    //用户偏移设置-右上模式
    t.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "490");
    equal(layer.css("left").replace(/px$/, ''), "110");

    //用户偏移设置-左上模式
    t.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "490");
    equal(layer.css("left").replace(/px$/, ''), "590");



});




test("layer position class check", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockTarget = { x: 300, y: 300, width: 100, height: 100 };

    var dom = document.createElement("div");
    t({ el: dom, view: "hello" });
    $(dom).trigger("mouseover");
    var layer = $(t.container).find("#itour-tip");
    //右下模式
    equal($(layer).hasClass('itour-tip-v-rd'), true);

    //左下模式
    t.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal($(layer).hasClass('itour-tip-v-ld'), true);

    //右上模式
    t.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal($(layer).hasClass('itour-tip-v-ru'), true);

    //左上模式
    t.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal($(layer).hasClass('itour-tip-v-lu'), true);
});

test("should set default layout", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockTarget = { x: 300, y: 300, width: 100, height: 100 };

    var dom = document.createElement("div");
    t({
        el: dom,
        view: "hello",
        layout: "top"

    });
    $(dom).trigger("mouseover");
    var layer = $(t.container).find("#itour-tip");
    //右下模式
    equal($(layer).hasClass('itour-tip-v-ru'), true);
});

test("layer position should consider scorll top and left", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockScroll = { top: 300, left: 300 };



    var dom = document.createElement("div");
    t({ el: dom, view: "hello" });
    //右下模式
    t.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    //x: 800 + 300 < 1000 + 300
    //y: 800 + 100 + 300 < 1000 + 300
    $(dom).trigger("mouseover");
    var layer = $(t.container).find("#itour-tip");
    equal($(layer).hasClass('itour-tip-v-rd'), true);

});


test("arrow position check", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockTarget = { x: 300, y: 300, width: 100, height: 100 };
    t.mockArrow = { width: 50, height: 50 };

    var dom = document.createElement("div");

    t({ el: dom, view: "<div class='itour-tip-arrow'></div><div>hello</div>" });
    $(dom).trigger("mouseover");
    var arrow = $(t.container).find(".itour-tip-arrow");

    equal(arrow.css("position"), 'absolute');



    //右下模式
    equal(arrow.css("top").replace(/px$/, ''), '0');
    equal(arrow.css("left").replace(/px$/, ''), '25');

    //左下模式
    t.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    arrow = $(t.container).find(".itour-tip-arrow");
    equal(arrow.css("top").replace(/px$/, ''), '0');
    equal(arrow.css("left").replace(/px$/, ''), '225');

    //右上模式
    t.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    arrow = $(t.container).find(".itour-tip-arrow");
    equal(arrow.css("top").replace(/px$/, ''), '250');
    equal(arrow.css("left").replace(/px$/, ''), '25');


    //左上模式
    t.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    arrow = $(t.container).find(".itour-tip-arrow");
    equal(arrow.css("top").replace(/px$/, ''), '250');
    equal(arrow.css("left").replace(/px$/, ''), '225');


});

test("ajax loading handle", function () {
    t._ajaxHandle = function () {
    };
    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip", action: "someAjaxMethod" });
    $(dom).trigger("mouseover");
    //default loading view
    equal($(t.container).find("#itour-tip").find(">div>div").html(), "loading...");
    //custom loading view
    t({ el: dom, view: "hello tip", loadingView: "custom loading view", action: "someAjaxMethod" });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), "custom loading view");
});

test("cache data", function () {
    expect(1)
    t._ajaxHandle = function (action, param, callback) {
        callback({ name: 'kino' });
        ok(true);
    };
    var dom = document.createElement("div");
    t({ el: dom, view: "hello @data.name", action: "someAjaxMethod" });
    $(dom).trigger("mouseover");
    $(dom).trigger("mouseover");
});

test("selector test", function () {
    var dom1 = document.createElement("div");
    dom1.className = "test";
    var dom2 = document.createElement("div");
    dom2.className = "test";

    var lp = document.createElement("div");
    lp.appendChild(dom1);
    t.container.appendChild(lp);

    t.container.appendChild(dom2);


    t({ el: '.test', listener: lp, view: "hello tip", event: "hover" });
    $(dom1).trigger("mouseover");

    ok($(t.container).find("#itour-tip").css("display") != 'none');
    $(dom1).trigger("mouseout");

    //dom2 不在listener里
    $(dom2).trigger("mouseover");
    ok($(t.container).find("#itour-tip").css("display") == 'none');
});

test("parameter handle", function () {
    expect(4);
    t._ajaxHandle = function (action, param, callback) {
        equal(action, "CustomAction");
        equal(param.firstName + ' ' + param.lastName, 'kino tesr');
        callback(null);
    };
    var dom = document.createElement("div");
    $(dom).attr('firstName', 'kino');
    $(dom).attr('lastName', 'tesr');

    t({
        el: dom,
        //action: "someAjaxMethod",
        handle: function () {
            this.param = {
                firstName: $(this.el).attr('firstName'),
                lastName: $(this.el).attr('lastName')
            };
            this.view = "helloview";
            this.action = "CustomAction";
            this.width = 300;
        }
    });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), "helloview");
    equal($(t.container).find("#itour-tip").css("width").replace("px", ""), "300");
});




test("display test", function () {
    var cbHandler;
    t._ajaxHandle = function (action, param, callback) {
        cbHandler = callback;
    };
    //create 2 tip;
    var dom1 = document.createElement("div");
    t({
        el: dom1,
        view: "hello",
        action: "someAjaxMethod"
    });
    var dom2 = document.createElement("div");
    t({
        el: dom2,
        view: "world"
    });
    //trigger the first one
    $(dom1).trigger("mouseover");
    //then trigger the second
    $(dom2).trigger("mouseover");

    //trigger callback
    cbHandler();

    //show the second callback
    equal($(t.container).find("#itour-tip").html(), "world");
});

test("accept viewFunc for view parameter", function () {
    var dom = document.createElement("div");
    var fn = itour.util.template("hello tip");
    t({ el: dom, view: fn, event: "hover" });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip").html(), "hello tip");
});

test("should set width for layer", function () {
    var dom1 = document.createElement("div");
    t({ el: dom1, view: "Hello Hello Hello Hello Hello Hello", width: 370 });
    $(dom1).trigger("mouseover");
    equal($(t.container).find("#itour-tip").css("width").replace(/px$/i, ''), "370");

    var dom2 = document.createElement("div");
    t({ el: dom2, view: "Hello Hello Hello Hello Hello Hello", width: 210 });
    $(dom2).trigger("mouseover");
    equal($(t.container).find("#itour-tip").css("width").replace(/px$/i, ''), "210");

    $(dom1).trigger("mouseover");
    equal($(t.container).find("#itour-tip").css("width").replace(/px$/i, ''), "370");
});


test("should use z-index for tip", function () {
    var dom = document.createElement("span");
    t({ el: dom, view: "hello tip" });

    //default z-index: 999
    equal($(t.container).find("#itour-tip").css("z-index"), "999");
});

test("should set show style", function () {
    expect(2);
    var dom = document.createElement("span");
    t({
        el: dom,
        view: "hello tip",
        show: "normal"
    });

    t._tipshow = function (s) {
        equal(s.show, "normal");
    }
    t._tiphide = function (s) {
        equal(s.show, "normal");
    }
    $(dom).trigger("mouseover");
    $(dom).trigger("mouseout");

});

test("handle image area tag", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockTarget = null;
    t.mockImg = {
        offset: function () {
            return {
                top: 300,
                left: 300
            }
        }
    };
    var dom = document.createElement("div");
    var str = "<img usemap='#test' /><map name='test'>";
    str += "<area coords='100,200,200,300' href='#hongkong' shape='rect' x='0' y='0' rel='#hongkong' /></map>";
    dom.innerHTML = str;
    t({ el: "area", view: "hello", container: dom });

    var area = $(dom).find("area");
    $(area).trigger("mouseover");
    var layer = $(t.container).find("#itour-tip");
    //右下模式
    equal(layer.css("top").replace(/px$/, ''), "600");
    equal(layer.css("left").replace(/px$/, ''), "400");

});

test("should use width:auto while width attribute doesn't specify", function () {
    var dom = document.createElement("div");
    t({ el: dom, view: "长度测试" });
    $(dom).trigger("mouseover");
    equal($(t.container).find("#itour-tip")[0].style.width, "auto");
});

//test("should use maxwidth arribute to limite width", function () {
//    var dom = document.createElement("div");
//    t({ el: dom, view: "长度测试xxxxyyyy", maxwidth: 100 });
//    $(dom).trigger("mouseover");
//    equal($(t.container).find("#itour-tip")[0].style["maxWidth"], "100px");
//});



//test("ajax load once", function () {
//    expect(1)
//    t._ajaxHandle = function (action, param, callback) {
//        ok(true);
//    };
//    var dom = document.createElement("div");
//    t({ el: dom, view: "hello", action: "someAjaxMethod" });
//    $(dom).trigger("mouseover");
//    $(dom).trigger("mouseover");
//});

module("ie6 bug fix", {
    setup: function () {
        t.container = document.createElement("div");
        t._isIE6 = true;
        t._init();
    }
});

test("should add iframe to fix ie6 bug", function () {
    t.mockWindow = { width: 1000, height: 1000 };
    t.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    t.mockTarget = { x: 300, y: 300, width: 100, height: 100 };

    var dom = document.createElement("div");
    t({ el: dom, view: "hello tip" });

    var layer = $(t.container).find("#itour-ie6layerfixer");

    //判断加载
    equal(layer.length, 1);
    //初始隐藏 
    equal(layer.css("display"), 'none', 'display none');

    //显示事件
    $(dom).trigger("mouseover");
    equal(layer.css("display"), 'block');
    $(dom).trigger("mouseout");
    equal(layer.css("display"), 'none');

    //位置
    $(dom).trigger("mouseover");
    //右下模式
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "300");

    //左下模式
    t.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "600");

    //右上模式
    t.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "100");

    //左上模式
    t.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("mouseover");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "600");
});
/// <reference path="../jquery-1.7.1.min.js" />
/// <reference path="qunit/qunit.js" />
/// <reference path="itour.util.template.js" />
/// <reference path="../../../lib/ui/itour.ui.autocomplete.js" />

var dom;
var container = document.createElement("div"); ;
var data1 = [{ text: "hello", value: 1 }, { text: "world", value: 2}];

var ac = itour.ui.autocomplete;
var dsv = "<div>@input</div><ul>@for(var i=0;i<data.length;i++){<li class='list-item' index='@i'>@data[i].text</li>}</ul>";

ac.defaultShowView = dsv;
ac._setContainer(container);
var tempTriggerUpdate;

(function () {
    var _fn = function(){};
    var interValHelper = function (fn, delay) {
        ///<summary>
        ///替换掉setInterVal的mock工具
        ///</summary>
        _fn = fn;
        return interValHelper;
    };


    interValHelper.go = function () {
        _fn();
    };
    window.interValHelper = interValHelper;
})();


ac._repeater = interValHelper;



module("autocomplate", {
    setup: function () {
        ac._reset();
        dom = document.createElement("input");
        container.innerHTML = '';
        ac({
            el: dom,
            data: data1
        });

        tempTriggerUpdate = ac.triggerUpdate;
    },
    teardown: function () {
        $(dom).unbind("focus");
        $(dom).unbind("keydown");
        $(dom).unbind("dbclick");
        $(dom).removeData("acdata");
        dom = null;
        ac.triggerUpdate = tempTriggerUpdate;
        ac._clearInterval = function () {
        };
        ac.defaultShowView = dsv;
    }
});

test("should append autocomplete layer to container", function () {    
    equal($(container).find("#itour-autocomplete").length, 1);
});

test("should has only one autocomplete layer", function(){
    ac({
            el: document.createElement("input"),
            data: [{text: 'a', value: 'b'}]
        });
    ac({
            el: document.createElement("input"),
            data: [{text: 'c', value: 'd'}]
        });
    equal($(container).find("#itour-autocomplete").length, 1);
});



test("should show autocomplete layer and fill data on it while input element on focus", function () {
    $(dom).trigger("focus");
    equal($(container).find("li").length, 2);
    equal($(container).find("[index=0]").length, 1);
    equal($(container).find("[index=1]").length, 1);
});

test("input words should match data.text/data.value", function () {
    $(dom).trigger("focus");
    dom.value = "hello";
    interValHelper.go();
    equal($(container).find("li").length, 1);
    equal($(container).find("[index=0]").length, 1);


    dom.value = "1";
    interValHelper.go();
    equal($(container).find(".list-item").html(), 'hello');

    dom.value = "2";
    interValHelper.go();
    equal($(container).find(".list-item").html(), 'world');
});

test("input words should match left side of data.text/data.value", function () {
    $(dom).trigger("focus");
    dom.value = "hell";
    interValHelper.go();
    equal($(container).find("li").length, 1);
    equal($(container).find("[index=0]").length, 1);
});

test("should add upper case and lower case match support", function () {
    $(dom).trigger("focus");
    dom.value = "HELLO";
    interValHelper.go();
    equal($(container).find("li").length, 1);
    equal($(container).find("[index=0]").html(), 'hello');
});

test("listener should trigger autocomplete layer update while element value change", function () {
    expect(3);//3 times,focus event add 1

    ac.triggerUpdate = function () {
        ok(true);
    };
    $(dom).trigger("focus");
    dom.value = "1";
    interValHelper.go();
    dom.value = "2";
    interValHelper.go();

});


test("listener should not trigger autocomplete layer update while element value doesn't change", function () {
    expect(2);
    ac.triggerUpdate = function () {
        ok(true);
    };
    $(dom).trigger("focus");
    dom.value = "1";
    interValHelper.go();
    dom.value = "1";
    interValHelper.go();
});

test("should remove listener while element lose focus", function () {
    expect(1);
    ac._clearInterval = function () {
        ok(true);
    };
    $(dom).trigger("focus");
    $(dom).trigger("blur");
});

test("autocomplete layer is display none at first", function(){
    equal($(container).find("#itour-autocomplete").css("display"), 'none');
});

test("autocomplete layer position should be absolute", function(){
    equal($(container).find("#itour-autocomplete").css("position"), "absolute");
});

test("autocomplete layer should show while on focus,and hide while lose focus", function () {
    $(dom).trigger("focus");
    equal($(container).find("#itour-autocomplete").css("display"), 'block');
    $(dom).trigger("blur");
    equal($(container).find("#itour-autocomplete").css("display"), 'none');
});

test("should use custom view template", function(){
    var dom2 = document.createElement("input");
    
    ac({
        el: dom2,
        data: data1,
        view: "<span>hello view!</span>"
    });

    $(dom2).trigger("focus");

    equal($(container).find("span").length, 1);
});

test("should use default view template if doesn't specify one", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");

    equal($(container).find("ul").length, 1);
});

test("while keyborad press 'enter',it should  fill input element first line of data", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    dom2.value = 'h';
    interValHelper.go();

    var e = $.Event("keydown", { keyCode: '13' });

    $(dom2).trigger(e);
    equal(dom2.value, 'hello');
});

test("keyborad press 'enter' then autocomplete layer should be hidden", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    dom2.value = 'h';
    interValHelper.go();

    var e = $.Event("keydown", { keyCode: '13' });

    $(dom2).trigger(e);
    equal($(container).find("#itour-autocomplete").css("display"), "none");
});

test("mousedown on list item should fill element list item value", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    $(container).find(".list-item:eq(1)").trigger("mousedown");

    equal(dom2.value, 'world');
});

test("list item should add class 'selected' while mouseover and remove class 'seleted' while mouseout", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    var item = $(container).find(".list-item:eq(1)");
    item.trigger("mouseover");
    ok(item.hasClass('selected'));
    item.trigger("mouseout");
    ok(!item.hasClass('selected'));
});

test("dblclick should clear element value and hide autocomplete layer", function () {
    $(dom).trigger("focus");
    dom.value = 'xxxx';
    $(dom).trigger("dblclick");
    equal(dom.value, '');
    equal($(container).find("#itour-autocomplete").css("display"), "none");
});



test("should set autocomplete layer position", function () {
    ac.mockWindow = { width: 1000, height: 1000 };
    ac.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    ac.mockTarget = { x: 300, y: 300, width: 100, height: 100 };


    ac({ el: dom, data:data1 });
    $(dom).trigger("focus");

    var layer = $(container).find("#itour-autocomplete");
    //右下模式
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "300");

    //左下模式
    ac.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "600");

    //右上模式
    ac.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "100");

    //左上模式
    ac.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "600");

    


});

test("should set option 'position:{x:0,y:0}' for custom offset", function () {
    ac.mockWindow = { width: 1000, height: 1000 };
    ac.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    ac.mockTarget = { x: 300, y: 300, width: 100, height: 100 };
    ac({ el: dom, data: data1, position: { x: 10, y: 10} });

    //用户偏移设置-右下模式
    $(dom).trigger("focus");

    var layer = $(container).find("#itour-autocomplete");

    equal(layer.css("top").replace(/px$/, ''), "410", 'right down mode, top');
    equal(layer.css("left").replace(/px$/, ''), "310", 'right down mode, left');

    //用户偏移设置-左下模式
    ac.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "410");
    equal(layer.css("left").replace(/px$/, ''), "590");

    //用户偏移设置-右上模式
    ac.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "490");
    equal(layer.css("left").replace(/px$/, ''), "110");

    //用户偏移设置-左上模式
    ac.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "490");
    equal(layer.css("left").replace(/px$/, ''), "590");

});



test("should specify fields for match", function () {

    ac.defaultShowView = "<div>@input</div><ul>@for(var i=0;i<data.length;i++){<li class='list-item' index='@i'>@data[i].a</li>}</ul>";

    ac({
        el: dom,
        data: [
            { a: 'say', b: 'hello' },
            { a: 'and', b: 'world' },
            { a: 'again', b: '!' }
        ],
        fields:['a', 'b']
//        dataField: 'a',
//        textField: 'b'
    });

    $(dom).trigger("focus");
    dom.value = 'w';
    interValHelper.go();
    equal($(container).find("li").length, 1);
    equal($(container).find("[index=0]").html(), 'and');
});

asyncTest("should set option:data as a ajax url for fetching data", function () {
    expect(3);
    ac._ajaxHandle = function (url, param, callback) {
        setTimeout(function () {
            start();
            callback(data1);

            equal($(container).find("li").length, 2);
            equal($(container).find("[index=0]").length, 1);
            equal($(container).find("[index=1]").length, 1);

        }, 30);
    };

    $(container).find("#itour-autocomplete").html('');

    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: "hello.aspx"
    });

    $(dom2).trigger("focus");

});

asyncTest("should set getAjaxData to specify data", function () {
    expect(4);
    var testData = { name: 'a test', rows: [
            { a: 'say', b: 'hello' },
            { a: 'and', b: 'world' },
            { a: 'again', b: '!' }
        ]
    };
    ac._ajaxHandle = function (url, param, callback) {
        setTimeout(function () {
            start();
            callback(testData);
            equal($(container).find("li").length, 3);
            equal($(container).find("[index=0]").html(), 'hello');
            equal($(container).find("[index=1]").html(), 'world');
            equal($(container).find("[index=2]").html(), '!');
        }, 30);
    };
    var dom2 = document.createElement("input");
    $(container).find("#itour-autocomplete").html('');

    ac({
        el: dom2,
        data: "hello.aspx",
        getAjaxData: function (result) {
            return result.rows;
        },
        view: "<div>@input</div><ul>@for(var i=0;i<data.length;i++){<li class='list-item' index='@i'>@data[i].b</li>}</ul>"
//        ,

//        dataField: 'a',
//        textField: 'b'
    });

    $(dom2).trigger("focus");
});


test("should set option:limit to limit data rows length", function () {
    ac({
        el: dom,
        data: [{text: 'a', value: 'a'},{text: 'a', value: 'a'},{text: 'a', value: 'a'},{text: 'a', value: 'a'}],
        limit: 2
    });
    $(dom).trigger("focus");
    equal($(container).find("li").length, 2);
});

test("should set options:emptyItem to add a list item", function () {
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1,
        emptyItem: { text: '全部', value: '' }
    });
    $(dom2).trigger("focus");
    $(dom2).trigger("focus");

    equal($(container).find("li").length, 3);
    equal($(container).find("[index=0]").html(), '全部');
});

test("if keyborad press 'enter' and options:emptyItem has setted and data length greater than 1 then it should  fill input element with sencond line of data", function () {
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1,
        emptyItem: { text: '全部', value: '' }
    });
    $(dom2).trigger("focus");

    dom2.value = 'h';
    interValHelper.go();
    ok($(container).find("[index=1]").hasClass('selected'));

    var e = $.Event("keydown", { keyCode: '13' });

    $(dom2).trigger(e);
    equal(dom2.value, 'hello');

});

test("should use keyborad up and down to select list item", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });
    $(dom2).trigger("focus");

    var up = $.Event("keydown", { keyCode: 38 });
    var down = $.Event("keydown", { keyCode: 40 });
    $(dom2).trigger(down);
    ok($(container).find("[index=1]").hasClass('selected'));

    $(dom2).trigger(up);
    ok($(container).find("[index=0]").hasClass('selected'));
});


test("should set option:getParam() to specify ajax parameter", function () {
    expect(1);
    ac._ajaxHandle = function (url, param, callback) {
        equal(param.key, 'hallo', 'ajaxhandle');
    };
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: "hello.aspx",
        getParam: function () {
            return { key:  this.value}
        }
    });
    dom2.value = 'hallo';

    $(dom2).trigger("focus");
});


test("should set option:select() to specify selected callback function", function () {
    expect(8);

    /* 回车事件回调测试 */
    var dom1 = document.createElement("input");
    ac({
        el: dom1,
        data: data1,
        select: function (item) {
            equal(item.value, '2', 'press enter trigger select callback');
            equal(item.text, 'world', 'press enter trigger select callback');
        }
    });
    $(dom1).trigger("focus");

    //改变值为wo
    dom1.value = 'wo';
    //触发轮询检查
    interValHelper.go();

    var e = $.Event("keydown", { keyCode: '13' });
    $(dom1).trigger(e);
    /* end 回车事件回调测试 */

    /* 下拉列表选中回调测试 */
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1,
        select: function (item) {
            equal(item.value, '2', 'click list item trigger select callback');
            equal(item.text, 'world', 'click list item trigger select callback');
        }
    });
    $(dom2).trigger("focus");
    //改变值为空
    dom2.value = '';
    //触发轮询检查
    interValHelper.go();
    $(container).find(".list-item:eq(1)").trigger("mousedown");
    $(dom2).trigger("blur");
    /* end 下拉列表选中回调测试 */

    /* 有值，失去焦点回调测试 */
    var dom3 = document.createElement("input");
    ac({
        el: dom3,
        data: data1,
        select: function (item) {
            equal(item.value, '2', 'has match item, then blur trigger select callback');
            equal(item.text, 'world', 'has match item, then blur trigger select callback');
        }
    });
    $(dom3).trigger("focus");
    dom3.value = 'w';
    interValHelper.go();
    $(dom3).trigger("blur");
    /* end 有值，失去焦点回调测试 */

    /* 无匹配值，失去焦点回调测试 */
    var dom4 = document.createElement("input");

    ac({
        el: dom4,
        data: data1,
        select: function (item) {
            ok(true, 'no match select callback');
        }
    });
    $(dom4).trigger("focus");
    dom4.value = 'xxx';
    interValHelper.go();

    var e = $.Event("keydown", { keyCode: '13' });
    $(dom4).trigger(e);

    $(dom4).trigger("focus");
    dom4.value = 'fff';
    interValHelper.go();
    $(dom4).trigger("blur");
    /* end 无匹配值，失去焦点回调测试 */
});


test("shoud use empty view while data length is 0", function () {
    var dom2 = document.createElement("input");
    ac.defaultEmptyView = "sorry, nothing match";
    ac({
        el: dom2,
        data: data1
    });
    $(dom2).trigger("focus");
    dom2.value = 'xxx';
    interValHelper.go();
    var layer = $(container).find("#itour-autocomplete");
    equal(layer.html(), "sorry, nothing match");


    ac({
        el: dom2,
        data: data1,
        emptyView: 'custom empty'
    });
    $(dom2).trigger("focus");
    dom2.value = 'xxx';
    interValHelper.go();
    var layer = $(container).find("#itour-autocomplete");
    equal(layer.html(), 'custom empty');
});

test("when data length is 0, press key 'enter' should clear element value and hide autocomplete layer", function () {
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    dom2.value = "xxx";

    interValHelper.go();

    var e = $.Event("keydown", { keyCode: 13 });

    $(dom2).trigger(e);

    equal(dom2.value, '');
    var layer = $(container).find("#itour-autocomplete");

    equal(layer.css("display"), "none");

});

test("when data length is 0, lose focus should clear element value and hide autocomplete layer", function () {
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    dom2.value = "xxx";

    interValHelper.go();


    $(dom2).trigger("blur");

    equal(dom2.value, '', 'clear');
    var layer = $(container).find("#itour-autocomplete");

    equal(layer.css("display"), "none");

});

test("shoud set option:fuzzy to filter local data", function () {
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1,
        fuzzy: true
    });

    $(dom2).trigger("focus");
    dom2.value = "e";

    interValHelper.go();
    var layer = $(container).find("#itour-autocomplete");
    equal($(layer).find("li").length, 1);
    equal($(layer).find("[index=0]").html(), 'hello');

});

test("shoud set input variable to template", function () {
    var dom2 = document.createElement("input");
    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");
    dom2.value = "h";

    interValHelper.go();
    var layer = $(container).find("#itour-autocomplete");
    equal($(layer).find("div").html(), 'h');

});



module("bug fixed", {
    setup: function () {
        ac._reset();
        dom = document.createElement("input");
        container.innerHTML = '';
        tempTriggerUpdate = ac.triggerUpdate;
    },
    teardown: function () {
        $(dom).unbind("focus");
        $(dom).unbind("keydown");
        $(dom).unbind("dbclick");
        $(dom).removeData("acdata");
        dom = null;
        ac.triggerUpdate = tempTriggerUpdate;
    }
});

test("should add iframe to fix ie6 bug", function () {
    ac._isIE6 = true;

    ac.mockWindow = { width: 1000, height: 1000 };
    ac.mockLayer = { x: 0, y: 0, width: 300, height: 300 };
    ac.mockTarget = { x: 300, y: 300, width: 100, height: 100 };

    ac({
        el: dom,
        data: data1
    });

    var layer = $(container).find("#itour-ie6layerfixer");

    //判断加载
    equal(layer.length, 1);
    //初始隐藏 
    equal(layer.css("display"), 'none');

    //显示事件
    $(dom).trigger("focus");
    equal(layer.css("display"), 'block');
    $(dom).trigger("blur");
    equal(layer.css("display"), 'none');

    //位置
    $(dom).trigger("focus");
    //右下模式
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "300");

    //左下模式
    ac.mockTarget = { x: 800, y: 300, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "400");
    equal(layer.css("left").replace(/px$/, ''), "600");

    //右上模式
    ac.mockTarget = { x: 100, y: 800, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "100");

    //左上模式
    ac.mockTarget = { x: 800, y: 800, width: 100, height: 100 };
    $(dom).trigger("focus");
    equal(layer.css("top").replace(/px$/, ''), "500");
    equal(layer.css("left").replace(/px$/, ''), "600");
});

test("fixed list item no selected class bug", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });
    $(dom2).trigger("focus");
    $(container).find(".list-item:eq(0)").trigger("mouseout");
    $(dom2).trigger("blur");
    equal(dom2.value, 'hello');

    dom2.value = 'h';
    $(dom2).trigger("focus");    
    $(container).find(".list-item:eq(0)").trigger("mouseout");
    $(dom2).trigger("blur");
    equal(dom2.value, 'hello');


    dom2.value = '';
    $(dom2).trigger("focus");
    $(container).find(".list-item:eq(1)").trigger("mouseout");
    $(dom2).trigger("blur");
    equal(dom2.value, 'hello');

    dom2.value = '';
    $(dom2).trigger("focus");
    $(container).find(".list-item:eq(1)").trigger("mousedown");
    $(dom2).trigger("blur");
    equal(dom2.value, 'world');
});
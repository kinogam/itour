/// <reference path="../jquery-1.7.1.min.js" />
/// <reference path="qunit/qunit.js" />
/// <reference path="itour.util.template.js" />
/// <reference path="../../../lib/ui/itour.ui.autocomplete.js" />

var dom;
var container = document.createElement("div"); ;
var data1 = [{ text: "hello", value: 1 }, { text: "world", value: 2}];

var ac = itour.ui.autocomplete;
var dsv = "<ul>@for(var i=0;i<data.length;i++){<li val=\"@data[i].value\">@data[i].text</li>}</ul>";
ac.defaultShowView = dsv;
ac._setContainer(container);
var tempTriggerCheck;
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
ac._timeout = function (fn, delay) {
    fn();
};


module("autocomplate", {
    setup: function () {
        ac._reset();
        dom = document.createElement("input");
        container.innerHTML = '';
        ac({
            el: dom,
            data: data1
        });

        tempTriggerCheck = ac.triggerCheck;
        tempTriggerUpdate = ac.triggerUpdate;
    },
    teardown: function () {
        $(dom).unbind("focus");
        $(dom).removeData("acdata");
        dom = null;
        ac.triggerCheck = tempTriggerCheck;
        ac.triggerUpdate = tempTriggerUpdate;
    }
});

test("should append autocomplete layer to container", function () {    
    equal($(container).find("#itour-autocomplete").length, 1);
});

test("should always has one autocomplete layer", function(){
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



test("should show all data while clear input element on focus", function () {
    $(dom).trigger("focus");
    equal($(container).find("li").length, 2);
    equal($(container).find("[val=1]").length, 1);
    equal($(container).find("[val=2]").length, 1);
});

test("input words should match data text and show", function () {
    $(dom).trigger("focus");
    dom.value = "hello";
    ac.triggerCheck();
    equal($(container).find("li").length, 1);
    equal($(container).find("[val=1]").length, 1);
});

test("should match left side", function () {
    $(dom).trigger("focus");
    dom.value = "hell";
    ac.triggerCheck();
    equal($(container).find("li").length, 1);
    equal($(container).find("[val=1]").length, 1);
});

test("element value can also match data value", function () {
    $(dom).trigger("focus");
    dom.value = "1";
    ac.triggerCheck();
    equal($(container).find("li").length, 1);
    equal($(container).find("[val=1]").length, 1);

    dom.value = "2";
    ac.triggerCheck();
    equal($(container).find("li").length, 1);
    equal($(container).find("[val=2]").length, 1);
});




test("listener should trigger autocomplete layer update while value change", function () {
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


test("listener should not trigger autocomplete layer update while value doesn't change", function () {
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

test("auto complete panel position should be absolute", function(){
    equal($(container).find("#itour-autocomplete").css("position"), "absolute");
});

test("should show auto complete panel while focus and hide while lose focus", function(){
    $(dom).trigger("focus");
    equal($(container).find("#itour-autocomplete").css("display"), 'block');
    $(dom).trigger("blur");
    equal($(container).find("#itour-autocomplete").css("display"), 'none');
});

test("should use custom template", function(){
    var dom2 = document.createElement("input");
    
    ac({
        el: dom2,
        data: data1,
        view: "<span>hello view!</span>"
    });

    $(dom2).trigger("focus");

    equal($(container).find("span").length, 1);
});

test("should use default view if doesn't specify a view", function () {
    var dom2 = document.createElement("input");

    ac({
        el: dom2,
        data: data1
    });

    $(dom2).trigger("focus");

    equal($(container).find("ul").length, 1);
});

//test("keyborad press enter should  fill into input value with first line", function () {
//    var dom2 = document.createElement("input");

//    ac({
//        el: dom2,
//        data: data1
//    });

//    $(dom2).trigger("focus");
//    dom2.value = 'h';

//    var e = $.Event("keydown", { keyCode: '13' });

//    $(dom2).trigger(e);
//    equal(dom2.value, 'hello');
//});
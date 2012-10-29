/// <reference path="../../qunit/qunit.js" />
/// <reference path="../../../jquery.js" />
/// <reference path="../../../lib/util/itour.util.sendData.js" />

var s = itour.util.sendData;
var container;

module("sendData", {
    setup: function () {
        container = document.createElement("div");
        s._container = container;
        s._submitForm = function () {
        }
    }
});

test("should append a form to container", function () {    
    s("someAction", {});
    equal($(container).find("form").length, 1);
});

test("action attribute of form should equal to action parameter and method should be 'post'", function () {
    s("someAction", {});
    var form = $(container).find("form");
    equal(form.attr("action"), "someAction");
    equal(form.attr("method"), "post");
});

test("the dynamic form should be hidden", function () {
    s("someAction", {});
    var form = $(container).find("form");
    equal(form.css("display"), "none");
});

test("should append request parameter element to form, if specified", function () {
    s("someAction", { name: "kino", age: 30 });
    var form = $(container).find("form");

    equal(form.find("[name=name]").length, 1);
    equal(form.find("[name=age]").length, 1);
});

test("parameter element value should equal to json member's value", function () {
    s("someAction", { name: "kino", age: 30 });
    var form = $(container).find("form");
    
    equal(form.find("[name=name]").val(), "kino");
    equal(form.find("[name=age]").val(), "30");
});

test("while sendData called, the dynamic form should submit", function () {
    expect(1);
    s._submitForm = function () {
        ok(true);
    }
    s("someAction", { name: "kino", age: 30 });
});

test("if json is more than 1 level, like {level1:{level2}}, the parameter element name format should be 'level1.level2'",
function () {
    s("someAction", { people: { name: "kino", age: 30}, distribution: {type:1, obj: {postCode: 5000}}, desc: 'hello' });
    var form = $(container).find("form");
    equal(form.find("[name=people\\.name]").val(), "kino");
    equal(form.find("[name=people\\.age]").val(), 30);
    equal(form.find("[name=desc]").val(), 'hello');
    equal(form.find("[name=distribution\\.type]").val(), '1');
    equal(form.find("[name=distribution\\.obj\\.postCode]").val(), '5000');
});

test("if json's member's type is array,the parameter element name format should be 'member[index]'", function () {
    s("someAction", { list1: [0, 1], list2: [{ name: "kino" }, { name: "jacky"}] });
    var form = $(container).find("form");
    equal(form.find("[name=list1\\[0\\]]").val(), "0");
    equal(form.find("[name=list1\\[1\\]]").val(), "1");
    equal(form.find("[name=list2\\[0\\]\\.name]").val(), "kino");
    equal(form.find("[name=list2\\[1\\]\\.name]").val(), "jacky");
});
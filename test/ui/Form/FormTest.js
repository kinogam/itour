/// <reference path="../../../jquery.js" />
/// <reference path="../../../lib/util/itour.util.template.js" />
/// <reference path="../../../lib/ui/itour.ui.Form.js" />


var el;
var Form = itour.ui.Form;

module("base");

test("Should add item", function () {
    var f = new Form();
    f.addItem({
        name: "item1"
    });
    f.addItem({
        name: "item2"
    });
    f.bind(document.createElement("div"));
    equal(f.itemCollection.length, 2);

    var f2 = new Form();
    f2.addItem([
        {
            name: "item1"
        }
    ]);
    f2.bind(document.createElement("div"));
    equal(f2.itemCollection.length, 1);
});

test("Given an item name to get(), then it should return a form item", function () {
    var f = new Form();
    f.el = document.createElement("div");
    f.addItem({
        name: "item1",
        type: "txt"
    });

    f.addItem({
        name: "item2",
        type: "txt"
    });

    f.bind();

    equal(f.get("item1").$el.length, 1);
    equal(f.get("item2").$el.length, 1);
});


//test("custom attribute test", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [
//        {
//            name: "tips",
//            type: "txt",
//            attr: {
//                xxx: "hello"
//            }
//        }]
//    });

//    f.bind();

//    equal(f.get("tips").$el.attr("xxx"), "hello");
//});


test("Should get form item values", function () {
    var f = new Form({
        el: document.createElement("div"),
        items: [
        {
            name: "col1",
            value: "hv1"
        },
        {
            name: "col2",
            type: "text"
        }]
    });

    f.bind();

    f.get("col2").$el.val("hv2");

    var vs = f.getValues();
    equal(vs.col1, "hv1");
    equal(vs.col2, "hv2");
});

test("Should set form item values", function () {
    var f = new Form({
        el: document.createElement("div"),
        items: [
        {
            name: "col1"
        },
        {
            name: "col2",
            type: "text"
        }]
    });

    f.setValues({
        col1: "hv1",
        col2: "hv2"
    });

    f.bind();

    var param = f.getValues();
    equal(param.col1, "hv1");
    equal(f.get("col2").$el.val(), "hv2");

    var model = f.getModelValues();
    equal(model["model.col1"], "hv1");
    equal(model["model.col2"], "hv2");
});


test("Should set form item values after bind", function () {
    var f = new Form({
        el: document.createElement("div"),
        items: [
        {
            name: "col1"
        },
        {
            name: "col2",
            type: "text"
        }]
    });

    f.bind();

    f.setValues({
        col1: "hv1",
        col2: "hv2"
    });

    var param = f.getValues();
    equal(param.col1, "hv1");
    equal(f.get("col2").$el.val(), "hv2");

    var model = f.getModelValues();
    equal(model["model.col1"], "hv1");
    equal(model["model.col2"], "hv2");
});

module("item type", {
    setup: function () {
        el = document.createElement("div");
    }
});

test("Should define item type", function () {
    Form.addItemType({
        type: "hello",
        getValue: function () {
            return "hello";
        },
        getHtml: function () {
            return "<label>hello</label>";
        },
        text: "hello attribute"
    });

    var f = new Form();
    f.addItem({
        type: "hello"
    });

    f.bind(el);

    notEqual($(el).html(), "");
});

test("Should remove item type", function () {
    Form.addItemType({
        type: 'temptype',
        extend: 'txt'
    });
    Form.removeItemType("temptype");
    equal(Form.isExistItemType('temptype'), false);

});


var tempDefualtView = Form.defaultFormView;

module("view", {
    teardown: function () {
        Form.defaultFormView = tempDefualtView;
        if (Form.isExistItemType('test')) {
            Form.removeItemType("test");
        }
    }
});

test("Should set form view", function () {
    var dom1 = document.createElement("div")
    var f1 = new Form({
        el: dom1,
        view: "hello"
    });

    f1.bind();
    equal(dom1.innerHTML, 'hello');


});

test("if doesn't specify a form view, then it should use default form view", function () {
    var dom1 = document.createElement("div")
    Form.defaultFormView = 'haro';
    var f1 = new Form({
        el: dom1
    });

    f1.bind();
    equal(dom1.innerHTML, 'haro');
});

test("Should set item view", function () {
    var dom2 = document.createElement("div");

    Form.addItemType({
        type: 'test',
        getView: function () {
            return "haro!"
        }
    });

    var f2 = new Form({
        el: dom2,
        items: [
            {
                name: 'item1',
                type: 'test'
            },
            {
                name: 'item2',
                type: 'test'
            }
        ],
        view: '@for(var i = 0; i < items.length; i++){@items[i].getHtml()}'
    });

    f2.bind();
    equal(dom2.innerHTML, 'haro!haro!');
});

test("should specify a view for item object to cover itemType's view", function () {
    var dom2 = document.createElement("div");

    Form.addItemType({
        type: 'test',
        getView: function () {
            return "haro!"
        }
    });

    var f2 = new Form({
        el: dom2,
        items: [
            {
                name: 'item1',
                type: 'test',
                view: '@name|@value'
            },
            {
                name: 'item2',
                type: 'test',
                view: '@name|@value'
            }
        ],
        view: '@for(var i = 0; i < items.length; i++){@items[i].getHtml()}'
    });

    f2.setValues({
        'item1': 'dari!',
        'item2': 'tamo!'
    });

    f2.bind();
    equal(dom2.innerHTML, 'item1|dari!item2|tamo!');

});

test("should use type:row to set row items and view", function () {
    var dom2 = document.createElement("div");

    Form.addItemType({
        type: 'test',
        getView: function () {
            return "haro!"
        }
    });

    Form.defaultRowView = "[row]@for(var i = 0; i < items.length; i++){@items[i].getHtml()}[/row]";
    var f2 = new Form({
        el: dom2,
        items: [
            {
                type: 'row',
                items: [
                        {
                            name: 'item1',
                            type: 'test'
                        },
                        {
                            name: 'item2',
                            type: 'test'
                        }
                ]
            },
            {
                type: 'row',
                items: [
                        {
                            name: 'item3',
                            type: 'test'
                        },
                        {
                            name: 'item4',
                            type: 'test'
                        }
                ]
            }
        ],
        view: '@for(var i = 0; i < items.length; i++){@items[i].getHtml()}'
    });


    f2.bind();
    equal(dom2.innerHTML, '[row]haro!haro![/row][row]haro!haro![/row]');
});


test("should use type:cell to set cell items and view", function () {
    var dom2 = document.createElement("div");

    Form.addItemType({
        type: 'test',
        getView: function () {
            return "haro!"
        }
    });

    Form.defaultRowView = "[row]@for(var i = 0; i < items.length; i++){@items[i].getHtml()}[/row]";
    Form.defaultCellView = "[cell]@for(var i = 0; i < items.length; i++){@items[i].getHtml()}[/cell]";
    
    var f2 = new Form({
        el: dom2,
        items: [
            {
                type: 'row',
                items: [
                        {
                            type: 'cell',
                            items: [
                                {
                                    name: 'item1',
                                    type: 'test'
                                },
                                {
                                    name: 'item2',
                                    type: 'test'
                                }
                            ]
                        }

                ]
            }
        ],
        view: '@for(var i = 0; i < items.length; i++){@items[i].getHtml()}'
    });


    f2.bind();
    equal(dom2.innerHTML, '[row][cell]haro!haro![/cell][/row]');
});

module("validate");

test("should set option:required to validate", function () {
    var dom2 = document.createElement("div");

    var f = new Form({
        el: dom2,
        items: [{
            name: "item1",
            type: "txt",
            required: true
        }]
    });

    f.bind();

    var isValidate = f.validate();
    equal(isValidate, false, "required item's value cannot be empty");

    f.get('item1').$el.val('hello');
    isValidate = f.validate();
    equal(isValidate, true, "validation");
});



test("should use regular expression to validate item's value", function () {
    var f = new Form({
        el: document.createElement("div"),
        items: [{
            name: "item1",
            label: "名字",
            type: "txt",
            regex: "^\\d"
        }]
    });

    f.bind();
    f.get('item1').$el.val('ddd');
    var isValidate = f.validate();
    equal(isValidate, false, "must start with a number");

    f.get('item1').$el.val('123d');

    isValidate = f.validate();
    equal(isValidate, true);

    var f2 = new Form({
        el: document.createElement("div"),
        items: [{
            name: "item1",
            label: "名字",
            type: "txt",
            regex: /d$/i
        }]
    });

    f2.bind();

    f2.get('item1').$el.val('ddx');
    var isValidate = f2.validate();
    equal(isValidate, false);

    f2.get('item1').$el.val('xxd');
    var isValidate = f2.validate();
    equal(isValidate, true);

});

//test("should set a callback function to validate", function () {
//    var f = new Form({
//        el: document.createElement("div"),
//        items: [{
//            name: "item1",
//            label: "名字",
//            type: "txt",
//            regex: "^\\d"
//        }]
//    });

//    f.bind();
//    f.get('item1').$el.val('ddd');
//    f.validate({
//        error: function (invalidateItemList) {
//            
//        }
//    });
//});


//test("validate event test", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "item1",
//            label: "名字",
//            type: "txt",
//            required: true
//        }]
//    });

//    f.bind();
////    $(f.el).find(".kf-txt-item1").triggerHandler("blur");
////    equal($(f.el).find(".kf-txt-item1~.kf-alarm").css("visibility"), "visible"); 
//    equal($(f.el).find(".kf-error-box").length, 1);   
//    equal($(f.el).find(".kf-error-box").css("display"), "none");
//    $(f.el).find(".kf-txt-item1~.kf-alarm").trigger("mouseover");
//    equal($(f.el).find(".kf-error-box").css("display"), "block");
//});


//module("get parameters");

//test("text get parameter json", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "label",
//            label: "标签",
//            type: "txt",
//            value: "val1"
//        },
//        {
//            name: "tips",
//            label: "提示",
//            type: "txt",
//            value: "val2"
//        },
//        {
//            name: "col",
//            label: "字段",
//            type: "txt",
//            value: "val3"
//        }]
//    });

//    f.bind();

//    var json = f.getParams();
//    equal(json.label, "val1");
//    equal(json.tips, "val2");
//    equal(json.col, "val3");

//});


//test("list get parameter json", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "list1",
//            label: "标签",
//            type: "list",
//            data: [{ a: "a1", b: "b1" }, { a: "a2", b: "b2"}],
//            dataField: "a",
//            textField: "b"
//        }]
//    });

//    f.bind();

//    var json = f.getParams();
//    equal(json.list1, "a1");

//});

//test("get model param for asp.net mvc", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "item1",
//            label: "名字1",
//            type: "txt",
//            value: "value1"
//        },
//        {
//            name: "item2",
//            label: "名字2",
//            type: "txt",
//            value: "value2"
//        }]
//    });
//    f.bind();
//    var param = f.getModelParam();
//    equal(param["model.item1"], "value1", "default test");

//    var param = f.getModelParam("clientInfo");
//    equal(param["clientInfo.item1"], "value1", "set model parameter name");
//});


//test("get paramters in the case of item name with special char", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "model.a",
//            label: "标签",
//            type: "list",
//            data: [{ a: "a1", b: "b1" }, { a: "a2", b: "b2"}],
//            dataField: "a",
//            textField: "b"
//        }]
//    });

//    f.bind();

//    var json = f.getParams();

//    equal(json["model.a"], "a1");
//});

module("other");
//test("group test", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        groups: [{
//            name: "group1",
//            items: [
//                {
//                    name: "item1",
//                    label: "名字1",
//                    type: "txt",
//                    value: "value1"
//                },
//                {
//                    name: "item2",
//                    label: "名字2",
//                    type: "txt",
//                    value: "value2"
//                }
//            ]
//        },
//        {
//            name: "group2",
//            items: [
//                {
//                    name: "item3",
//                    label: "名字3",
//                    type: "txt",
//                    value: "value3"
//                },
//                {
//                    name: "item4",
//                    label: "名字4",
//                    type: "txt",
//                    value: "value4"
//                }
//            ]
//        }
//        ]
//    });

//    f.bind();

//    notEqual(f.el.innerHTML, "<div></div>");
//    var json = f.getParams();
//    equal(json.item1, "value1");

//});

//test("setValues test", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "item1",
//            label: "名字1",
//            type: "txt"
//        },
//        {
//            name: "item2",
//            label: "名字2",
//            type: "txt"
//        },
//        {
//            name: "hide1",
//            value: 'hdvalue'
//        }
//        ]
//    });
//    //use setValues before bind
//    f.setValues({
//        item1: "value1",
//        item2: "value2",
//        hide1: "new hd value"
//    });

//    f.bind();

//    var json = f.getParams();
//    equal(json.item1, "value1");
//    equal(json.item2, "value2");
//    equal(json.hide1, "new hd value");
//});

//test("view mode test", function () {
//    var f = new Form ({
//        el: document.createElement("div"),
//        items: [{
//            name: "item1",
//            label: "名字1",
//            type: "txt"
//        },
//        {
//            name: "item2",
//            label: "名字2",
//            type: "txt"
//        }]
//    });
//    //use setValues before bind
//    f.setValues({
//        item1: "value1",
//        item2: "value2"
//    });

//    f.enableViewMode();

//    f.bind();

//    equal(f.get('item1').$el.length > 0, true);
//});

module("event");

test("event test", function () {
    Form.addItemType({
        type: 'temptype',
        extend: 'txt'
    });

    var f = new Form({
        el: document.createElement("div"),
        items: [
        {
            name: "item1",
            type: "temptype",
            events: {
                click: function () {
                    this.value = "hello event";
                }
            }
        }
        ]
    });

    f.bind();
    f.get("item1").$el.trigger("click");
    equal(f.get("item1").$el.val(), "hello event");
    Form.removeItemType("temptype");
});



test("extend test", function () {
    Form.addItemType({
        type: 'newtype',
        extend: 'txt'
    });

    var f = new Form();
    f.addItem({
        type: 'newtype',
        name: 'nt1',
        value: 'xxx'
    });

    f.bind(document.createElement("div"));
    equal(f.get('nt1').el.tagName.toLowerCase(), 'input');
    equal(f.get('nt1').$el.val(), 'xxx');
    Form.removeItemType("newtype");
});

test("use 'after' method to set item after binding", function () {
    Form.addItemType({
        type: 'newtype',
        extend: 'txt',
        after: function () {
            this.$el.val('helloworld');
        }
    });

    var f = new Form();
    f.addItem({
        type: 'newtype',
        name: 'nt1'
    })
    f.bind(document.createElement("div"));
    equal(f.get('nt1').$el.val(), 'helloworld');
    Form.removeItemType("newtype");
});




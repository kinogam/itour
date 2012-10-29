/// <reference path="../../jquery.js" />
/// <reference path="../util/itour.util.template.js" />


(function () {

    var Form = function (s) {
        ///<summary>
        ///itour表单控件
        ///</summary>
        ///<param name="s" type="Object">
        ///&#10;el 需要绑定的元素或选择器匹配的标签
        ///&#10;item 绑定的数据
        ///&#10;view 视图模板

        //设置是否绑定
        this.hasBinded = false;

        this.itemCollection = getFormItemCollection(this);
        if (s != null) {

            this.el = s.el || null;

            //设置表单视图
            if (s.view != null) {
                this.view = FormView.template(s.view);
            }
            //设置表单元素
            if (s.items != null) {
                this.itemCollection.add(s.items, this);
            }
        }
    };

    /******************************
    * 表单元素集合操作
    ******************************/

    var getFormItemCollection = function (form) {
        ///<summary>
        ///获取一个用于管理表单元素的集合对象
        ///</summary>


        var fc = [];
        fc.itemHash = {};
        fc.visiblityItems = [];

        fc.cells = [];

        fc.rows = [];

        //添加表单元素
        fc.add = function (items) {
            if (Object.prototype.toString.call(items) == '[object Array]') {
                for (var i = 0; i < items.length; i++) {
                    _addItem.call(this, form, items[i]);
                }
            }
            else {
                _addItem.call(this, form, items);
            }
        };

        fc.find = function (name) {
            return this.itemHash[name];
        };

        fc.setValue = function (s) {
            if (form.hasBinded) {
                for (var i in s) {
                    if (this.itemHash[i].type != null) {
                        this.itemHash[i].setValue(s[i]);
                    }
                    else {
                        this.itemHash[i].value = s[i];
                    }
                }
            }
            else {
                for (var i in s) {
                    this.itemHash[i].value = s[i];
                }
            }
        };
        return fc;
    };

    //给表单集合添加item
    var _addItem = function (form, item) {

        attachItemProperty(item, form);


        if (item.type === 'row') {
            this.rows.push(item);
        }
        else if (item.type === 'cell') {
            this.cells.push(item);
        }
        else {
            this.push(item);
            this.itemHash[item.name] = item;
            if (item.itemType != null) {
                this.visiblityItems.push(item);
            }
        }



        if (item.items != null && item.items.length > 0) {
            for (var i = 0; i < item.items.length; i++) {
                _addItem.call(this, form, item.items[i]);
            }
        }


    };



    var attachItemProperty = function (item, form) {
        item.form = form;
        if (item.type != undefined) {
            var itemType = FormItem.getType(item.type);
            itemType.init.call(item);
            item.view = item.view || itemType.getView();
            item.after = itemType.after;
            item.itemType = itemType;
            item.getValue = itemType.getValue;
            item.setValue = itemType.setValue;
            item.getHtml = function () {
                return FormView.getItemHtml.call(this);
            };
        }
        else {
            item.getValue = function () { return item.value; };
        }

    };

    /******************************
    * end 表单元素集合操作
    ******************************/

    /******************************
    * 视图管理
    ******************************/

    var FormView = {
        template: itour.util.template,
        render: function (form) {
            //清空事件监控
            $(form.el).undelegate();

            //获取模板
            var template = form.view || Form.defaultFormView;
            if (typeof template !== 'function') {
                template = FormView.template(template);
            }

            //获取元素集合
            var collection = form.itemCollection;

            var afterList = [];

            var visiblityItems = collection.visiblityItems;

            var items = null;

            if (collection.rows.length > 0) {
                items = collection.rows;
            }
            else if (collection.cells.length > 0) {
                items = collection.cells;
            }
            else {
                items = visiblityItems;
            }

            for (var i = 0; i < items.length; i++) {
                items[i].itemType.eventBind.call(items[i]);
            }

            for (var i = 0; i < visiblityItems.length; i++) {
                if (visiblityItems[i].after) {
                    afterList[afterList.length] = visiblityItems[i];
                }
            }


            $(form.el).html(FormView.template(template, { items: items }));

            for (var i = 0; i < afterList.length; i++) {
                var item = afterList[i];
                item.after.call(item.form.get(item.name));
            }
        }
        ,
        getItemHtml: function () {
            //设置dom自定义属性字符串
            //            var attrString = "";

            //            for (var i in item.attr) {
            //                attrString = attrString + i + "=\"" + item.attr[i] + "\" ";
            //            }

            //            //使用替换掉attr的json配置
            //            item.attrString = attrString;
            //            return getConvertedHtml(item);
            return FormView.template(this.view, this);
        }
    };




    var _getDefaultFormView = function () {
        var str = "<table>";
        str = str + "@for(var i = 0; i < items.length; i++){"
        //str = str + "<tr>@if(items[i].label!=null){<td>@items[i].label</td>}<td @if(items[i].label==null){colspan='2'}>@items[i].getHtml()</td></tr>"
        str = str + "@items[i].getHtml()";
        str = str + "}</table>";
        return FormView.template(str);
    };

    //默认模板
    Form.defaultFormView = _getDefaultFormView();

    /******************************
    * end 视图管理
    ******************************/

    /******************************
    * 表单元素类型管理
    ******************************/

    var FormItem = {
        _itemTypeHash: {},
        _itemTemplateHash: {},
        addType: function (s) {
            ///<summary>
            ///添加控件类型
            ///</summary>
            ///<param name="s" type="Json">控件属性</param>
            ///<returns type="Object">FormItem Object</returns>
            if (s.type === 'base') {
                this._itemTypeHash[s.type] = s;
                return this;
            }

            var base = this._itemTypeHash["base"];


            if (typeof s.extend !== 'undefined') {
                var extend = this._itemTypeHash[s.extend];

                //复制未定义的函数过去
                for (var i in extend) {
                    if (typeof s[i] === 'undefined') {
                        s[i] = extend[i];
                    }
                }
            }

            //复制基础类型方法
            for (var i in base) {
                if (typeof s[i] === 'undefined') {
                    s[i] = base[i];
                }
            }

            //check if the new type implement getValue and getHtml method
            if (typeof s.getValue === "undefined" || typeof s.getView === "undefined") {
                throw new Error("not yet emplement getValue or getView method");
            }

            //            //生成模板函数

            //            var viewStr = s.getView();
            //            if (typeof viewStr != null) {
            //                s.viewFn = FormView.template(viewStr)
            //            }

            this._itemTypeHash[s.type] = s;
            return this;
        },
        removeType: function (typeName) {
            delete this._itemTypeHash[typeName];
        },
        getType: function (typeName) {
            return this._itemTypeHash[typeName];
        },
        setTempFunc: function (typeName, templateFunc) {
            return this._itemTemplateHash[typeName] = templateFunc;
        },
        getTempFunc: function (typeName) {
            return this._itemTemplateHash[typeName];
        }
    };

    Form.addItemType = function (s) {
        FormItem.addType(s);
        return Form;
    }

    Form.removeItemType = function (itemTypeName) {
        FormItem.removeType(itemTypeName);
        return Form;
    };

    Form.isExistItemType = function (itemTypeName) {
        return typeof FormItem.getType(itemTypeName) !== 'undefined';
    };

    //增加一个基础类型
    FormItem.addType({
        type: 'base',
        init: function () { },
        eventBind: function () {
            var item = this;
            if (item.events == null)
                return;
            for (var eventName in item.events) {
                $(this.form.el).delegate("[name=" + item.name + "]", eventName, function (e) {
                    item.events[eventName].call(this, e, item, item.form);
                });
            }

        },
        getView: function () {
            return "";
        },
        getHtml: function () {
            return FormView.template(this.view, this);
        },
        getValue: function () {
            return null;
        },
        setValue: function () {

        }
    });

    var _getDefaultRowView = function () {
        var str = "<tr>@for(var i = 0; i < items.length; i++){";
        str = str + "@if(items[i].label!=null){<td>@items[i].label</td><td>}";
        str = str + "else{<td colspan='2'>}"
        str = str + "@items[i].getHtml()</td>}</tr>";
        return str;
    };

    Form.defaultRowView = _getDefaultRowView();


    var _getDefaultCellView = function () {
        var str = "<tr>@for(var i = 0; i < items.length; i++){";
        str = str + "@if(items[i].label!=null){<td>@items[i].label</td><td>}";
        str = str + "else{<td colspan='2'>}"
        str = str + "@items[i].getHtml()</td>}</tr>";
        return str;
    };

    Form.defaultCellView = _getDefaultCellView();

    //增加一个基础类型
    FormItem.addType({
        type: 'row',
        getView: function () {
            return this.view || Form.defaultRowView;
        }
    });

    //增加一个基础类型
    FormItem.addType({
        type: 'cell',
        getView: function () {
            return this.view || Form.defaultCellView;
        }
    });


    /******************************
    * end 表单元素类型管理
    ******************************/


    /******************************
    * 表单操作接口
    ******************************/

    Form.prototype = {
        bind: function (el) {
            ///<summary>
            ///绑定容器
            ///</summary>
            ///<param name="dom" type="dom">容器DOM</param>
            this.el = el || this.el;
            this.hasBinded = true;
            FormView.render(this);
        },
        addItem: function (item) {
            ///<summary>
            ///增加表单元素
            ///</summary>
            ///<param name="item" type="json">表单元素</param>
            this.itemCollection.add(item);
        },
        setValues: function (s) {
            this.itemCollection.setValue(s);
        },
        get: function (name) {
            ///<summary>
            ///根据name属性获取对应的item
            ///</summary>
            ///<param name="name" type="String">item的name属性</param>
            ///<returns type="Item"/>
            var item = this.itemCollection.find(name);
            if (typeof item != 'undefined') {
                //第一次查找item时，填充实际el
                if (typeof item.$el === 'undefined')
                    item.$el = $(this.el).find("[name='" + name + "']");
                if (typeof item.el === 'undefined')
                    item.el = item.$el[0];
            }
            return item;
        },
        getValues: function () {
            ///<summary>
            ///根据表单内容获取请求json
            ///</summary>
            ///<returns type="JSON" />
            return this.getModelValues("");
        },
        getModelValues: function (modelName) {
            ///<summary>
            ///根据表单内容获取请求json
            ///</summary>
            ///<param name="nodelName" type="String">model名</param>
            ///<returns type="JSON" />
            var json = {};
            var mn = modelName;
            if (mn == null)
                mn = "model.";
            else if (mn != '')
                mn = mn + ".";

            for (var i = 0; i < this.itemCollection.length; i++) {
                var item = this.itemCollection[i];
                json[mn + item.name] = item.getValue();
            }
            return json;
        },
        validate: function () {
            ///<summary>
            ///验证表单元素
            ///</summary>
            ///<returns type="Boolean" />
            var itemCollection = this.itemCollection;
            for (var i = 0; i < itemCollection.length; i++) {
                var item = itemCollection[i];
                var value = item.getValue();

                //check if required
                if (item.required && value == '') {
                    return false;
                }
                //check regular expression
                else if (item.regex) {
                    var r;
                    if (typeof item.regex === 'string') {
                        r = new RegExp(item.regex);
                    }
                    else if (Object.prototype.toString.call(item.regex) === '[object RegExp]') {
                        r = item.regex;
                    }
                    else {
                        throw "item.regex error";
                    }

                    if (!r.test(value)) {
                        return false;
                    }
                }


            }
            return true;
        }
    };


    /******************************
    * end 表单操作接口
    ******************************/


    //namespace
    this.itour = this.itour ? this.itour : {};
    this.itour.ui = this.itour.ui ? this.itour.ui : {};
    this.itour.ui.Form = Form;
})();



//定义基本控件类型
(function () {
    itour.ui.Form.addItemType({
        type: 'txt',
        getView: function () {
            return "<input name='@name' type='text' value='@value' @attrString />"
        },
        getValue: function () {
            return this.form.get(this.name).$el.val();
        },
        setValue: function(value){
            this.form.get(this.name).$el.val(value)
        }
    }).addItemType({
        type: 'text',
        getView: function () {
            return "<input name='@name' type='text' value='@value' @attrString />"
        },
        getValue: function () {
            return this.form.get(this.name).$el.val();
        },
        setValue: function(value){
            this.form.get(this.name).$el.val(value)
        }
    })
    .addItemType({
        type: 'msg',
        getView: function () {
            return "<span  name='@name' @attrString>@value</span>";
        },
        getValue: function () {
            return this.form.get(this.name).$el.html();
        },
        setValue: function(value){
            this.form.get(this.name).$el.val(value)
        }
    }).addItemType({
        type: 'list',
        init: function () {
            if (typeof this.dataField === 'undefined' && typeof this.textField === 'undefined') {
                if (Object.prototype.toString.call(this.data[0]) == '[object Array]') {
                    this.dataField = 0;
                    this.textField = 1;
                }
                else if (typeof this.data[0].text !== 'undefined' && typeof this.data[0].value !== 'undefined') {
                    this.dataField = 'value';
                    this.textField = 'text';
                }
            }
        },
        getView: function () {
            var str = "<select name='@name' @attrString>@for(var i = 0; i < data.length; i++){<option value='@data[i][dataField]' ";
            str = str + "@if(typeof selectedIndex!=='undefined' && selectedIndex==i){selected='selected'}";
            str = str + "else if(typeof selectedValue!=='undefined' && selectedValue==data[i][dataField]){selected='selected'}"
            str = str + ">@data[i][textField]</option>}</select>";
            return str;
        },
        getValue: function () {
            return this.form.get(this.name).$el.find("option:selected").val();
        }
    })
//    .addItemType({
//        type: 'checkbox',
//        getView: function () {
//            //var str = ""
//        },
//        getValue: function () {

//        }
//    })
    ;
})();
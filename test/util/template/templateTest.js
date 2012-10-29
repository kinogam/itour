test("should get converted string by id and data parameter", function () {
    var mockDoc = {
        getElementById: function () {
            var script = document.createElement("script");
            script.type = "text/template";
            script.id = "testtemp";
            script.innerHTML = "hello @name"
            return script;
        }
    };

    itour.util._doc = mockDoc;

    var str = itour.util.getTempContent("testtemp", { name: 'kinogam' });
    equal(str, 'hello kinogam');
});

var ls = itour.util.localStorage;

test("setItem/getItem test", function () {
    ls.setItem("test", "hello");
    var item = ls.getItem("test");
    equal(item, "hello");
});

test("removeItem test", function () {
    ls.removeItem("test");
    var item = ls.getItem("test");
    equal(item, null);
});

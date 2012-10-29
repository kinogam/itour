(function () {
    this.itour = this.itour || {};
    this.itour.util = this.itour.util || {};

    var getUserData = function () {
        return {
            isInit: false,
            init: function () {
                if (this.isInit)
                    return;

                var ud = document.createElement("input");
                ud.type = "hidden";
                ud.addBehavior("#default#userData");
                var expires = new Date();
                expires.setDate(expires.getDate() + 365);
                ud.expires = expires.toUTCString();
                document.getElementsByTagName("body")[0].appendChild(ud);


                this.ud = ud;
                this.name = location.hostname;
                this.isInit = true;
            },
            getItem: function (key) {
                this.init();
                this.ud.load(this.name);
                return this.ud.getAttribute(key);
            },
            setItem: function (key, value) {
                this.init();
                this.ud.load(this.name);
                this.ud.setAttribute(key, value);
                this.ud.save(this.name);
            },
            removeItem: function (key) {
                this.init();
                this.ud.load(this.name);
                this.ud.removeAttribute(key);
                this.ud.save(this.name);
            },
            clear: function () {
                this.init();
                this.ud.load(this.name);
                var now = new Date();
                now = new Date(now.getTime() - 1);
                this.ud.expires = now.toUTCString();
                this.ud.save(this.name);
            }
        };
    };


    this.itour.util.localStorage = this.localStorage || getUserData();
})();

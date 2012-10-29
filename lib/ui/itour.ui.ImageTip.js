(function () {
    /*
    * Image preview script 
    * powered by jQuery (http://www.jquery.com)
    * Download by http://www.jb51.net
    * written by Alen Grakalic (http://cssglobe.com)
    * 
    * for more info visit http://cssglobe.com/post/1695/easiest-tooltip-and-image-preview-using-jquery
    *
    */

    var imagePreview = function () {
        /* CONFIG */

        xOffset = 10;
        yOffset = 30;

        // these 2 variable determine popup's distance from the cursor
        // you might want to adjust to get the right result

        /* END CONFIG */
        $("img[bigimgurl]").hover(function (e) {
            this.t = this.title;
            this.title = "";


            $("body").append("<div id='preview' style='box-shadow:-1px 1px 4px #666;position:absolute;border:1px solid #a6c8e4;background:#ebf5fe;padding:5px;z-index:999;'><img style='vertical-align:top;' src='" + this.getAttribute("bigimgurl") + "' alt='Image preview' /></div>");
            $("#preview")
			.css("top", (e.pageY - xOffset) + "px")
			.css("left", (e.pageX + yOffset) + "px")
			.fadeIn("fast");
        },
	function () {
	    this.title = this.t;
	    $("#preview").remove();
	});
	$("img[bigimgurl]").mousemove(function (e) {
            $("#preview")
			.css("top", (e.pageY - xOffset) + "px")
			.css("left", (e.pageX + yOffset) + "px");
        });
    };

    //namespace
    this.itour = this.itour ? this.itour : {};
    this.itour.ui = this.itour.ui ? this.itour.ui : {};
    this.itour.ui.ImageTip = function () {
        imagePreview();
    };

})();
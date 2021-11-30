	 (function (e) {
	 	e(function () {
	 		e(".rgdev").append(e('<div class="rgdev-mobile"><span class="icon-bar"></span> <span class="icon-bar"></span><span class="icon-bar"></span></div>'));
	 		e(".rgdev").append(e('<div class="rgdev-text">Navigation</div>'));
	 		e(".rgdev-item").has("ul").prepend('<span class="rgdev-click"><i class="rgdev-arrow"></i></span>');
	 		e(".rgdev-submenu-item").has("ul").prepend('<span class="rgdev-click"><i class="rgdev-arrow"></i></span>');
	 		e(".rgdev-submenu-item-sub").has("ul").prepend('<span class="rgdev-click"><i class="rgdev-arrow"></i></span>');
	 		e(".rgdev-mobile").click(function () {
	 			e(".rgdev-list").slideToggle("slow")
	 		});
	 		e(".rgdev-click").click(function () {
	 			e(this).siblings(".rgdev-submenu").slideToggle("slow");
	 			e(this).children(".rgdev-arrow").toggleClass("rgdev-rotate");
	 			e(this).siblings(".rgdev-submenu-sub").slideToggle("slow");
	 			e(this).siblings(".rgdev-submenu-sub-sub").slideToggle("slow")
	 		})
	 	})
	 })(jQuery)
	 $(document).ready(function (e) {
	 	function t(e) {
	 		var t = $("#totop");
	 		t.removeClass("off on");
	 		if (e == "on") {
	 			t.addClass("on")
	 		} else {
	 			t.addClass("off")
	 		}
	 	}
	 	window.setInterval(function () {
	 		var e = $(this).scrollTop();
	 		var n = $(this).height();
	 		if (e > 0) {
	 			var r = e + n / 2
	 		} else {
	 			var r = 1
	 		}
	 		if (r < 1e3) {
	 			t("off")
	 		} else {
	 			t("on")
	 		}
	 	}, 300);
	 	$("#totop").click(function (e) {
	 		e.preventDefault();
	 		$("body,html").animate({
	 			scrollTop: 0
	 		}, 1200)
	 	})
	 })
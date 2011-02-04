/*global $, clearInterval, setTimeout, setInterval, namespace, jQuery, window, document, Modernizr */
namespace.lookup('com.pageforest.flipper').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        playloop,
        cols = 21,
        rows = 5,
        page = 0,
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        chars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        numbers = "0123456789",
        psdelay = 5000, // page switch delay
        boxW = 32,
        boxH = boxW * 1.25,
        curr = 0,
        prv = 1,
        wwidth,
        loopcount = 0,
        loop = false,
        newpage = /\n-{3,}\n/m;

    function buildBox(c, r) {
        var i, j,
            $cboxa = $("<span id='1' class='spn top above'></span>"),
            $cboxb = $("<span id='2' class='spn bottom below'></span>"),
            $cboxc = $("<span id='3' class='spn'></span>"),
            $box = $("<div/>", { "class": "box" })
                .height(boxH)
                .width(boxW)
                .append($cboxa.clone(), $cboxb.clone(), $cboxc.clone()),
            $rdiv = $("<div/>", { "class": "rdiv" });
        for (j = 0; j < c; j = j + 1) {
            $rdiv.append($box.clone().attr('id', "c_" + j));
        }
        for (i = 0; i < r; i = i + 1) {
            $("#display").append($rdiv.clone().attr('id', "r_" + i));
        }
    }

    function onReady() {
        $.fn.textfill = function (options) {
            var fontSize = options.maxFontPixels,
                ourText = $('span', this),
                maxHeight = $(this).height(),
                maxWidth = $(this).width(),
                textHeight,
                textWidth;
            do {
                ourText.css('font-size', fontSize);
                textHeight = ourText.height();
                textWidth = ourText.width();
                fontSize = fontSize - 1;
            } while (textHeight > maxHeight || (textWidth > maxWidth && fontSize > 3));
            return this;
        };
        Array.prototype.clean = function () {
            while ($.trim(this[this.length - 1]) === '' && this.length) {
                this.splice(this.length - 1, 1);
            }
            return this;
        };

        if (!Modernizr.csstransforms || !Modernizr.csstransitions) {
            $("#warning").show();
        }

        wwidth = $('#main').width();
        wwidth = (wwidth) ? wwidth : $(window).width();
        boxW = Math.floor((wwidth - 20) / cols - 4);
        boxH = boxW * 1.25;
        $('#input').focus();
        ns.client = new clientLib.Client(ns);
        if (document.getElementById('title')) {
            ns.client.addAppBar();
        }
        buildBox(cols, rows);

        var $cboxa = $("<div class='dv up'><div class='text'><span></span></div></div>" +
                       "<div class='dv down sdown'><div class='text'><span></span></div></div>")
            .height(boxH / 2)
            .width(boxW)
            .css("line-height", (boxH - 4) + "px"),
            $cboxb = $("<div class='dv up'><div class='text'><span></span></div></div>" +
                   "<div class='dv down'><div class='text'><span></span></div></div>")
            .height(boxH / 2)
            .width(boxW)
            .css("line-height", (boxH - 4) + "px");

        // resize font based on bounding box size
        $("div.box > span").text('W');
        $("div.box").textfill({ maxFontPixels: 72 });
        $("div.box > span").html($cboxb.clone());
        $("div.box > span:not(#3)").html($cboxa.clone());

        // resize textarea and title width
        $('#display, #input, #title, #nav, #form').width($("#display").width());
        $('#stop').hide();

        if (window.location.hash !==  '') {
            $('#input').val('');
        } else {
            if ($('#input').val()) {
                ns.play();
            }
        }
    }

    function getIndex(a, b) {
        var stype, etype, tmpStart, tmpEnd, loopthis;
        if (a !== ' ') {
            stype = letters;
            tmpStart = stype.indexOf(a);
            if (tmpStart < 0) {
                stype = numbers;
                tmpStart = numbers.indexOf(a);
            }
            if (tmpStart < 0) {
                stype = chars;
                tmpStart = chars.indexOf(a);
            }
        }
        if (b !== ' ') {
            etype = letters;
            tmpEnd = etype.indexOf(b);
            if (tmpEnd < 0) {
                etype = numbers;
                tmpEnd = numbers.indexOf(b);
            }
            if (tmpEnd < 0) {
                etype = chars;
                tmpEnd = chars.indexOf(b);
            }
            if (a === ' ') {
                stype = etype;
                tmpStart = 0;
            }
        } else {
            etype = stype += ' ';
            tmpEnd = etype.indexOf(b);
        }

        if (stype !== etype) {
            loopthis = stype + " " + etype;
            tmpEnd = tmpEnd + stype.length + 1;
        } else {
            loopthis = etype;
        }

        if (a === b && a === ' ') {
            loopthis = " ";
            tmpStart = tmpEnd = 0;
        }
        return {
            tmpStart : tmpStart,
            tmpEnd : tmpEnd,
            loopthis : loopthis
        };
    }

    function loopThrough(a, b, box) {
        var tmpStart, tmpEnd, loopthis, a1, a2, b1, b2, c2, ctra, index;
        a1 = box.find("span.top div.up div.text");
        a2 = box.find("span.top div.down div.text");
        b1 = box.find("span.bottom div.up div.text");
        b2 = box.find("span.bottom div.down div.text");
        c2 = box.find("span#3 div.down div.text");

        index = getIndex(a, b);
        tmpStart = index.tmpStart;
        tmpEnd = index.tmpEnd;
        loopthis = index.loopthis;

        ctra = tmpStart;
        b1.parent().unbind().bind("webkitTransitionEnd transitionend", function (e) {
            a1.parent().parent().removeClass('below').addClass('above');
            b1.parent().parent().removeClass('above').addClass('below');

            a2.parent().addClass('scaleb');
            b1.parent().removeClass('scalea');
            b2.parent().removeClass('scaleb');

            a1.children("span").text(loopthis.charAt(ctra));
            a2.children("span").text(loopthis.charAt(ctra));
            b1.children("span").text(loopthis.charAt(ctra + 1));
            c2.children("span").text(loopthis.charAt(ctra - 1));
            ctra = ctra + 1;
            if (ctra !== tmpEnd + 1) {
                a1.parent().addClass('scalea');
            } else {
                a1.parent().removeClass('scalea');
                loopcount = loopcount - 1;
                console.log("min " + b + " " + loopcount);
            }
            if (ctra > loopthis.length) {
                ctra = 0;
            }
        });

        a1.parent().unbind().bind("webkitTransitionEnd transitionend", function (e) {
            b1.parent().parent().removeClass('below').addClass('above');
            a1.parent().parent().removeClass('above').addClass('below');

            b2.parent().addClass('scaleb');
            a1.parent().removeClass('scalea');
            a2.parent().removeClass('scaleb');

            b1.children("span").text(loopthis.charAt(ctra));
            b2.children("span").text(loopthis.charAt(ctra));
            a1.children("span").text(loopthis.charAt(ctra + 1));
            c2.children("span").text(loopthis.charAt(ctra - 1));
            ctra = ctra + 1;
            if (ctra !== tmpEnd + 1) {
                b1.parent().addClass('scalea');
            } else {
                b1.parent().removeClass('scalea');
                loopcount = loopcount - 1;
                console.log("min " + b + " " + loopcount);
            }
            if (ctra > loopthis.length) {
                ctra = 0;
            }
        });

        if (a !== b) {
            loopcount = loopcount + 1;
            console.log("add " + b + " " + loopcount);
            if (b1.parent().parent().hasClass('above')) {
                b1.parent().addClass('scalea');
                a1.children("span").text(loopthis.charAt(ctra));
            } else {
                a1.parent().addClass('scalea');
                b1.children("span").text(loopthis.charAt(ctra));
            }
        }
    }

    function displayText(text, r, c) {
        var a, b, j, box;

        for (j = 0; j < text.length; j = j + 1) {
            box = $("#display").find("#r_" + r).find("#c_" + c);
            a = $.trim(box.find('.above div.text:first > span').text()).toUpperCase();
            b = text[j].toUpperCase();

            if ($.trim(b)) {
                box.removeClass("page_" + prv).addClass("page_" + curr);
            }
            if (a === '') {
                loopThrough(' ', b, box);
            } else {
                loopThrough(a, b, box);
            }
            c = c + 1;
        }
    }

    function clearPage(page) {
        var box, d, s;
        $("div.page_" + page).each(function (a, b) {
            box = $(this);
            if ($.trim(box.find('div.text:first > span').text()) !== '') {
                d = box.attr('id').split('_')[1];
                s = box.parent().attr('id').split('_')[1];
                box.removeClass("page_" + page);
                loopThrough($.trim(box.find('.above div.text:first > span').text()).toUpperCase(), ' ', box);
            }
        });
    }

    function clipText(text) {
        var strl = text.length;
        if (strl % 2) {
            return text.substr(Math.ceil(strl / 2) - Math.ceil(cols / 2), cols);
        } else {
            return text.substr(strl / 2 - Math.floor(cols / 2), cols);
        }
    }

    function resetAll() {
        $("#pageof").hide();
        $("#input").text('');
        clearPage(curr);
        ns.client.setDirty(false);
        clearInterval(playloop);
        page = 0;
        $("#stop").hide(1, function () {
            $("#play").show();
        });
    }

    function displayPage(text) {
        console.log(loopcount);
        curr = (curr) ? 0 : 1;
        prv = (prv) ? 0 : 1;
        if (!text) {
            resetAll();
            return;
        }
        var i, textArr = [], r = 0, ll, c, ctext;
        $("#offset").text(page);
        $("#pageof").show();

        textArr = text.split("\n");

        r = textArr.length;
        r = Math.floor(((rows - r) / 2) + 1) - 1;
        for (i = 0; i < textArr.length; i = i + 1) {
            ctext = $.trim(textArr[i]);
            ctext = (ctext.length > cols) ? clipText(ctext) : ctext;
            ll = ctext.length;
            c = Math.floor((cols - ll) / 2);
            displayText(ctext, r, c);
            r = r + 1;
        }

        clearPage(prv);
    }

    function fwd() {
        var text = $("#input").val(),
            arr = text.split(newpage).clean();
        if (!$.trim(text)) {
            resetAll();
            return;
        }
        clearInterval(playloop);
        page = page + 1;
        page = (page > arr.length) ? 1 : page;
        displayPage(arr[page - 1]);
        $("#limit").text(arr.length);
    }

    function play() {
        $("#play").hide(1, function () {
            $("#stop").show();
        });
        if (page === 0) {
            fwd();
        }
        loop = true;
        if (loopcount === 0 && loop) {
            playloop = setTimeout(function () {
                fwd();
            }, psdelay);
        }
    }

    function stop() {
        $("#stop").hide(1, function () {
            $("#play").show();
        });
        clearInterval(playloop);
        loop = false;
    }

    function rev() {
        var text = $("#input").val(),
            arr = text.split(newpage).clean();
        if (!$.trim(text)) {
            ns.resetAll();
            return;
        }
        clearInterval(playloop);
        page = (page) ? page - 1 : 1;
        page = (page < 1) ? arr.length : page;
        displayPage(arr[page - 1]);
        $("#limit").text(arr.length);
    }

    function setDoc(json) {
        if (json.blob.text) {
            $('#input').val(json.blob.text);
            ns.play();
        }
    }

    function getDoc() {
        return {
            "title": "Split Flap Display",
            "readers" : ["public"],
            "blob": {
                version: 1,
                text: $('#input').val()
            }
        };
    }

    function linkToDisplay() {
        window.open('display.html' + window.location.hash);
        return false;
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'play' : play,
        'stop' : stop,
        'rev' : rev,
        'fwd' : fwd,
        'linkToDisplay' : linkToDisplay
    });

});
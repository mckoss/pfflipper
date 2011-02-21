/*global Modernizr */
namespace.lookup('com.pageforest.flip.main').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        dom = namespace.lookup('org.startpad.dom');

    var client,
        doc,
        clickHandlers;

    clickHandlers = {
        playPause: function() {
        },

        forward: function() {
        },

        back: function() {
        },

        displayLink: function() {
            window.open('/display.html' + window.location.hash);
            return false;
        }
    };

    function addClickHandlers() {
        var i, id;

        for (id in clickHandlers) {
            if (clickHandlers.hasOwnProperty(id)) {
                $(doc[id]).click(clickHandlers[id]);
                if (doc[id].tagName == 'A') {
                    doc[id].href = "javascript:void(0);";
                }
            }
        }
    }

    function onReady() {
        doc = dom.bindIDs();
        addClickHandlers();
        client = new clientLib.Client(ns);
        if (document.getElementById('title')) {
            client.addAppBar();
        }
    }

    function setDoc(json) {
        if (json.blob.text) {
            $('#input').val(json.blob.text);
            clickHandlers.play();
        }
    }

    function getDoc() {
        return {
            "readers" : ["public"],
            "blob": {
                version: 1,
                text: $('#input').val()
            }
        };
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc
    });

});
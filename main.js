/*global Modernizr */
namespace.lookup('com.pageforest.flip.main').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        dom = namespace.lookup('org.startpad.dom');

    var client,
        doc,
        clickHandlers;

    clickHandlers = {
        playPause: function() {
            return false;
        },

        forward: function() {
            return false;
        },

        back: function() {
            return false;
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
                    doc[id].href = "#";
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
        }
        $(doc.title).text(json.title);
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

    function onSaveSuccess() {
        $(doc.title).text(client.meta.title);
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'onSaveSuccess': onSaveSuccess
    });

});
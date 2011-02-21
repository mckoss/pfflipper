/*global Modernizr */
namespace.lookup('com.pageforest.flip.main').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        dom = namespace.lookup('org.startpad.dom'),
        flip = namespace.lookup('com.pageforest.flip');

    var client,
        doc,
        clickHandlers,
        fbUI,
        rows = 5, cols = 21,
        fPlaying = false;

    clickHandlers = {
        playPause: function() {
            fPlaying = !fPlaying;
            $(document.body)[fPlaying ? 'addClass' : 'removeClass']('playing');
            $(document.body)[fPlaying ? 'addClass' : 'removeClass']('flipping');
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

    function FlapBoardUI(elem, rows, cols) {
        this.elem = elem;
        this.fb = new flip.FlapBoard(rows, cols);
        this.build();
    }

    FlapBoardUI.methods({
        build: function() {
            var row, col, cellSize,
                rowLast = -1,
                self = this;

            self.size = dom.getSize(self.elem);
            self.cells = [];

            self.fb.each(function(row, col, letter) {
                var cell = document.createElement('div'),
                    current = document.createElement('div'),
                    next = document.createElement('div');

                $(current).addClass('current');
                $(next).addClass('next');

                $(cell).addClass("cell")
                    .css('top', (row / this.rows * 100) + '%')
                    .css('left', (col / this.cols * 100) + '%')
                    .css('height', (100 / this.rows) + '%')
                    .css('width', (100 / this.cols) + '%')
                    .append(current).append(next);
                $(self.elem).append(cell);

                if (row != rowLast) {
                    self.cells.push([]);
                    rowLast = row;
                }
                self.cells[row].push({current: current, next: next});
            });
        }
    });

    function onReady() {
        doc = dom.bindIDs();
        addClickHandlers();

        fbUI = new FlapBoardUI(doc.board, rows, cols);

        client = new clientLib.Client(ns);
        if (doc.title) {
            client.addAppBar();
        }
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'onSaveSuccess': onSaveSuccess
    });

});
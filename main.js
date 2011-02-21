/*global Modernizr */
namespace.lookup('com.pageforest.flip.main').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        dom = namespace.lookup('org.startpad.dom'),
        flip = namespace.lookup('com.pageforest.flip');

    var client,
        doc,
        clickHandlers,
        fbUI,
        rows = 6, cols = 21,
        msFlip = 1000,
        fPlaying = false,
        messageSplit = /\n-+\n/;

    clickHandlers = {
        playPause: function() {
            fPlaying = !fPlaying;
            $(document.body)[fPlaying ? 'addClass' : 'removeClass']('playing');
            if (fPlaying) {
                fbUI.setMessages($(doc.messages).val().split(messageSplit));
            }
            fbUI.play(fPlaying);
            return false;
        },

        forward: function() {
            fbUI.advance();
            if (fPlaying) {
                setTimeout(clickHandlers.forward, msFlip);
            }
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
            $(doc.messages).val(json.blob.text);
        }
        $(doc.title).text(json.title);
        fbUI.setMessages(json.blob.text.split(messageSplit));
    }

    function getDoc() {
        return {
            "readers" : ["public"],
            "blob": {
                version: 1,
                text: $(doc.messages).val()
            }
        };
    }

    function onSaveSuccess() {
        $(doc.title).text(client.meta.title);
    }

    function FlapBoardUI(elem, rows, cols) {
        this.elem = elem;
        this.fb = new flip.FlapBoard(rows, cols);
        this.fPlaying = false;
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
                self.cells[row].push({
                    cell: cell,
                    current: current,
                    next: next
                });
            });
        },

        // An array of messages to display
        setMessages: function(messages) {
            this.messages = messages;
            this.setCurrent(messages[0]);
        },

        setCurrent: function(message) {
            var self = this;
            self.fb.setCurrent(message);
            self.fb.each(function (row, col, letter) {
                var cell = self.cells[row][col];
                $(cell.current).text(letter);
            });
        },

        play: function(fPlay) {
            this.fPlay = fPlay;
            if (fPlay) {
                $(this.elem)[fPlay ? 'addClass' : 'removeClass']('flipping');
            }
        }
    });

    function onReady() {
        doc = dom.bindIDs();
        addClickHandlers();

        fbUI = new FlapBoardUI(doc.board, rows, cols);
        fbUI.setMessages($(doc.messages).val().split(messageSplit));

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
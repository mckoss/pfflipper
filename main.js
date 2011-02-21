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
            fbUI.advance(1);
            return false;
        },

        back: function() {
            fbUI.advance(-1);
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
        this.iMessage = 0;
        this.messages = [];
        this.msFlip = 150;
        this.build();
        setInterval(this.flip.fnMethod(this), this.msFlip);
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
            this.setTarget();
        },

        advance: function(n) {
            this.setTarget(this.iMessage + n);
        },

        setTarget: function(i) {
            var self = this,
                message;

            if (i != undefined) {
                this.iMessage = (i + this.messages.length) % this.messages.length;
            }

            message = this.messages[this.iMessage];

            self.fb.setTarget(message);
        },

        play: function(fPlay) {
            this.fPlay = fPlay;
        },

        // Called on a timer - should initiate animation to next letters.
        // In order to restart the css transition, we do these steps:
        // - Update current and next characters
        // - Turn off class elem.flipping (just displays current)
        // - Return to browser
        // - Turn on class elem.flipping
        // - Return to browser
        // the elem.flipping class and return
        flip: function() {
            var self = this;

            if (self.fb.isComplete()) {
                return;
            }

            self.fb.advance();

            self.fb.eachWindow(function (row, col, letters) {
                var cell = self.cells[row][col];
                $(cell.current).text(letters[0]);
                if (letters.length > 1) {
                    $(cell.cell).addClass('active');
                    $(cell.next).text(letters[1]);
                } else {
                    $(cell.cell).removeClass('active');
                }
            });

            // Return to browser with flipping removed - then set again
            // to start next animation transitions.
            $(self.elem).removeClass('flipping');
            setTimeout(function() {
                $(self.elem).addClass('flipping');
            }, 1);
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
/*global Modernizr */
namespace.lookup('com.pageforest.flip.main').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        dom = namespace.lookup('org.startpad.dom'),
        flip = namespace.lookup('com.pageforest.flip'),
        vector = namespace.lookup('org.startpad.vector'),
        format = namespace.lookup('org.startpad.format'),
        base = namespace.lookup('org.startpad.base');

    var client,
        doc,
        clickHandlers,
        fbUI, fbTime,
        rows = 6, cols = 21,
        fPlaying = true,
        messageSplit = /\n-+\n/,
        slideTimeout = 5000;

    function onFlipComplete() {
        var self = this;
        if (fPlaying) {
            setTimeout(function() {
                self.advance(1);
            }, slideTimeout);
        }
    }

    function onMessagesChange() {
        fbUI.setMessages($(doc.messages).val().split(messageSplit));
    }

    function onMessage(i, n) {
        $(doc.pageNum).text(i + 1);
        $(doc.pages).text(n);
    }

    function onDisplayMode(mode) {
        fbUI.displayMode = mode;
        fbUI.build();
    }

    clickHandlers = {
        playPause: function() {
            fPlaying = !fPlaying;
            $(document.body)[fPlaying ? 'addClass' : 'removeClass']('playing');
            if (fPlaying) {
                fbUI.advance(1);
            }
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
            if (json.blob.version >= 2) {
                $(doc.displayMode).val(json.blob.displayMode);
            }
        }
        $(doc.title).text(json.title);

        onMessagesChange();
    }

    function getDoc() {
        return {
            "readers" : ["public"],
            "blob": {
                version: 2,
                text: $(doc.messages).val(),
                displayMode: $(doc.displayMode).val()
            }
        };
    }

    function onSaveSuccess() {
        $(doc.title).text(client.meta.title);
    }

    function FlapBoardUI(elem, rows, cols, options) {
        var defaults = {
            elem: elem,
            fb: new flip.FlapBoard(rows, cols),
            iMessage: 0,
            messages: [],
            msFlip: 150,
            fFlipping: false,
            displayMode: 'wipe'
        };
        base.extendObject(this, defaults, options);
        this.build();
        setInterval(this.flip.fnMethod(this), this.msFlip);
    }

    FlapBoardUI.methods({
        build: function() {
            var row, col, cellSize, rcCell, fontSize, innerSize,
                rowLast = -1,
                self = this;

            self.cells = [];
            $(self.elem).empty();

            self.size = dom.getSize(self.elem);
            cellSize = vector.floor(vector.mult(self.size,
                                                [1 / this.fb.cols, 1 / this.fb.rows]));
            rcCell = [0, 0].concat(cellSize);
            rcCell = vector.rcExpand(rcCell, [-2, -2]);
            innerSize = vector.size(rcCell);
            fontSize = Math.floor(Math.min(innerSize[0] - 1, innerSize[1] / 1.2)) + 'px';

            self.fb.each(function(row, col, letter) {
                var cell = document.createElement('div'),
                    current = document.createElement('div'),
                    next = document.createElement('div'),
                    pos = vector.mult([col, row], cellSize),
                    rect = pos.concat(vector.add(pos, innerSize));

                $(current).addClass('current')
                    .css('line-height', innerSize[1] + 'px');
                $(next).addClass('next')
                    .css('line-height', innerSize[1] + 'px');

                dom.setRect(cell, rect);
                $(cell).css('font-size', fontSize)
                    .addClass('cell')
                    .append(current)
                    .append(next);

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

            self.redraw();
        },

        // An array of messages to display
        setMessages: function(messages) {
            this.messages = messages;
            this.setTarget();
        },

        advance: function(n) {
            this.setTarget(this.iMessage + n);
        },

        redraw: function() {
            var self = this;

            // Not built yet.
            if (self.cells == undefined) {
                return;
            }

            $('.active', self.elem).removeClass('active');
            self.fb.each(function (row, col, letter) {
                var cell = self.cells[row][col];
                $(cell.current).text(letter);
            });
        },

        setTarget: function(i) {
            if (i != undefined) {
                this.iMessage = (i + this.messages.length) % this.messages.length;
            }

            if (this.onMessage) {
                this.onMessage(this.iMessage, this.messages.length);
            }

            this.setMessage(this.messages[this.iMessage]);
        },

        setMessage: function(message) {
            // Stop all active animations when we reset new target
            // otherwise some cells will remain in active state
            // even though they are no longer changing.
            this.redraw();
            this.fb.setTarget(message);
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
                if (self.fFlipping && self.onFlipComplete) {
                    self.onFlipComplete.call(self);
                }
                self.fFlipping = false;
                return;
            }
            self.fFlipping = true;

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
        $(doc.messages).bind('keyup', onMessagesChange);

        fbUI = new FlapBoardUI(doc.board, rows, cols,
            {onFlipComplete: onFlipComplete,
             onMessage: onMessage});

        fbTime = new FlapBoardUI(doc.time, 1, 8);
        setInterval(function () {
            var now = new Date();
            fbTime.setMessage(format.fixedDigits(now.getHours(), 2) + ':' +
                              format.fixedDigits(now.getMinutes(), 2) + ':' +
                              format.fixedDigits(now.getSeconds(), 2));
        }, 1000);

        $(doc.displayMode).val(fbUI.displayMode)
            .change(onDisplayMode);

        if (fPlaying) {
            $(document.body).addClass('playing');
        }

        // Buggy?
        //$(window).resize(fbUI.build.fnMethod(fbUI));

        client = new clientLib.Client(ns);
        client.autoLoad = true;
        if (doc.title) {
            client.addAppBar();
        }
        onMessagesChange();
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'onSaveSuccess': onSaveSuccess
    });

});
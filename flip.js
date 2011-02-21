namespace.lookup('com.pageforest.flip').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        base = namespace.lookup('org.startpad.base'),
        dom = namespace.lookup('org.startpad.dom'),
        format = namespace.lookup('org.startpad.format'),
        doc;

    // Given two characters - return string on inclusive characters.
    function characterRange(range) {
        var first = range.charCodeAt(0),
            last = range.charCodeAt(1),
            s = "";

        for (var i = first; i <= last; i++) {
            s += String.fromCharCode(i);
        }
        return s;
    }

    var letters = characterRange('AZ'),
        numbers = characterRange('09'),
        symbols = characterRange('!/') + characterRange(':@') + characterRange('[`') + '~',
        space = ' ',
        sets = [letters, numbers, symbols, space];


    function onReady() {
        doc = dom.bindIDs();
    }

    // Return {ich:, set:} for the given character.
    function findPos(ch) {
        var i, ich;

        ch = ch.toUpperCase();
        for (i = 0; i < sets.length; i++) {
            ich = sets[i].indexOf(ch);
            if (ich != -1) {
                return {'ich': ich, 'set': sets[i]};
            }
        }
        throw new Error("Invalid Flap character: " + ch);
    }

    // Return the letter sequence needed to go from start to end
    // including skipping between letter sets.
    function letterSequence(start, end) {
        var s;

        start = findPos(start);
        end = findPos(end);

        // Same set - end after start
        if (start.set == end.set && end.ich >= start.ich) {
            return start.set.slice(start.ich, end.ich + 1);
        }

        s = start.set.slice(start.ich, start.set.length);

        // Same set - end before start
        if (start.set == end.set) {
            return s + end.set.slice(0, end.ich + 1);
        }

        if (start.set != space && end.set != space) {
            s += space;
        }

        return s + end.set.slice(0, end.ich + 1);
    }

    // Return string exactly len characters long - from source
    // text.
    // alignment: 'left', 'center', 'right', or 'fill' (default)
    // If 'fill', expect a single '|' character in the string which
    // will be filled with padding spaces as needed (right string
    // has priority over left string.
    function fillText(text, len, alignment) {
        var padding,
            left,
            right,
            leftPad = {'left': 0, 'right': 1, 'center': 0.5},
            parts,
            i,
            sep,
            pad,
            partsLen,
            result,
            prefix;

        text = text.toString();
        alignment = alignment || 'fill';
        padding = len - text.length;

        if (alignment == 'fill') {
            parts = text.split(/\s*\|\s*/);
            // Left align if only one part given
            if (parts.length == 1) {
                parts.push('');
            }
            partsLen = 0;
            for (i = 0; i < parts.length; i++) {
                partsLen += parts[i].length;
            }
            result = "";
            sep = '';
            for (i = parts.length - 1; i >= 0; i--) {
                prefix = parts[i] + sep;
                // The first truncated part is left justified in the
                // space available.
                if (prefix.length + result.length > len) {
                    return prefix.slice(0, len - result.length - sep.length) +
                           sep + result;
                }
                result = prefix + result;
                if (i >= 1) {
                    partsLen -= parts[i].length;
                    padding = (len - result.length) - partsLen;
                    if (padding <= 0 && parts[i].length == 0) {
                        sep = '';
                        continue;
                    }
                    pad = padding > 0 ? Math.ceil(padding / i) : 1;
                    sep = format.repeat(' ', pad);
                }
            }
            return result;
        }

        // Adding padding to fille string
        left = Math.floor(padding * leftPad[alignment]);
        if (padding >= 0) {
            right = padding - left;
            return format.repeat(' ', left) + text + format.repeat(' ', right);
        }

        // Return just a slice of the string.
        left = -left;
        return text.slice(left, left + len);
    }

    /* =================================================
       FlapBoard
       ================================================= */

    function FlapBoard(rows, cols, options) {
        this.rows = rows;
        this.cols = cols;
        this.window = 2;
        this.current = '';
        this.target = '';
        base.extendObject(this, options);

        this.setCurrent(this.current);
        this.setTarget(this.target);
    }

    FlapBoard.methods({
        setCurrent: function(s) {
            this.current = s;
            this.currentBoard = this.getBoard(this.current);
            delete this.sequences;
            this.position = 0;
            this.lastPosition = 0;
            return this;
        },

        snapshotBoard: function() {
            var lines = [];

            if (this.position == 0) {
                return this.currentBoard;
            }

            this.each(function (row, col, letter) {
                if (lines[row] == undefined) {
                    lines[row] = '';
                }
                lines[row] += letter;
            });
            return lines;
        },

        setTarget: function(s) {
            this.currentBoard = this.snapshotBoard();
            this.target = s;
            this.recalc();
            return this;
        },

        // Return an arrow or *rows* strings, each *cols* in length.
        getBoard: function(lines) {
            var i,
                padding,
                line;

            lines = lines.split('\n');
            // Ignore leading and trailing white space, and remove
            // leading and trailing blank lines.
            for (i = 0; i < lines.length; i++) {
                lines[i] = base.strip(lines[i]);
            }
            while (lines[0] == '') {
                lines.shift();
            }
            while (lines[lines.length - 1] == '') {
                lines.pop();
            }

            // Center available lines vertically
            lines = lines.slice(0, this.rows);
            padding = this.rows - lines.length;
            for (i = 0; i < Math.floor(padding / 2); i++) {
                lines.unshift('');
            }
            for (i = 0; i < Math.ceil(padding / 2); i++) {
                lines.push('');
            }

            for (i = 0; i < lines.length; i++) {
                lines[i] = fillText(lines[i].toUpperCase(), this.cols);
            }
            return lines;
        },

        recalc: function() {
            var row, col,
                cur, tar, seq,
                rowSeq;

            this.targetBoard = this.getBoard(this.target);

            this.sequences = [];
            this.maxSeq = 0;
            this.position = 0;

            for (row = 0; row < this.rows; row++) {
                rowSeq = [];
                this.sequences.push(rowSeq);
                cur = this.currentBoard[row];
                tar = this.targetBoard[row];
                for (col = 0; col < this.cols; col++) {
                    seq = letterSequence(cur[col], tar[col]);
                    this.maxSeq = Math.max(this.maxSeq, seq.length);
                    rowSeq.push(seq);
                }
            }

            this.lastPosition = this.maxSeq + this.window - 1;
        },

        isComplete: function() {
            return this.position == this.lastPosition;
        },

        advance: function(n) {
            var row, col,
                i, a;

            n = n || 1;
            this.position = Math.min(this.position + n, this.lastPosition);
            for (row = 0; row < this.rows; row++) {
                a = [];
                for (col = 0; col < this.cols; col++) {
                    i = Math.min(this.sequences[row][col].length - 1, this.position);
                    a.push(this.sequences[row][col][i]);
                }
                this.currentBoard[row] = a.join('');
            }
        },

        getWindow: function(row, col, position) {
            if (position == undefined) {
                position = this.position;
            }
            var seq = this.sequences[row][col],
                last = seq.length - 1,
                i = Math.min(last, position - this.window + 1),
                j = Math.min(last, position);

            return seq.slice(i, j + 1);
        },

        // Loop through all cells on the board, returning the current
        // value of each cell (taking into account the current sequence.
        each: function(fn) {
            var row, col, line;

            for (row = 0; row < this.rows; row++) {
                line = this.currentBoard[row];
                for (col = 0; col < this.cols; col++) {
                    letters = this.getWindow(row, col);
                    fn.call(this, row, col, letters.substr(-1));
                }
            }
        },

        // Enumerate all the cells whose window string has changed in the last cycle.
        eachWindow: function(fn) {
            var minFilter;

            minFilter = this.position - this.window + 1;
            this.each(function (row, col) {
                var text = this.getWindow(row, col);
                if (this.position == 0 || text != this.getWindow(row, col, this.position - 1)) {
                    fn.call(this, row, col, text);
                }
            });
        }

    });

    ns.extend({
        'onReady': onReady,
        'letterSequence': letterSequence,
        'fillText': fillText,
        'FlapBoard': FlapBoard
    });
});

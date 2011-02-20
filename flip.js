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
    // alignment: 'left' (default), 'center', 'right', or 'fill'
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
        alignment = alignment || 'left';
        padding = len - text.length;

        if (alignment == 'fill') {
            parts = text.split(/\s*\|\s*/);
            // Minimum one space between each part
            partsLen = parts.length - 1;
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
                           result;
                }
                result = prefix + result;
                if (i >= 1) {
                    partsLen -= parts[i];
                    padding = (len - result.length) - partsLen;
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
        return text.slice(-left, len);
    }

    /* =================================================
       Board - Flap Board
       ================================================= */

    function Grid(rows, cols, options) {
        this.rows = rows;
        this.cols = cols;
        this.messages = [];
        this.current = -1;
        this.window = 2;
        this.aligned = 'fill';
        base.extendObject(this, options);
    }

    Grid.methods({
        addMessage: function(s) {
            this.messages.push(s);
        },

        getBoard: function(message) {
            var lines = message.split('\n'),
                board = [];
            for (var i = 0; i < lines.length; i++) {
                lines = base.strip(lines);
            }
            while (lines[0] == '') {
                lines.shift();
            }
            while (lines[lines.length - 1] == '') {
                lines.pop();
            }
            lines = lines.slice(0, this.rows);
            var cExtra = this.rows - lines.length;
            for (var row = 0; row < this.rows; row++) {
                board.push(fillText());
                if (row <= cExtra / 2) {
                    board.push(format.repeat(' ', this.cols));
                    continue;
                }

            }

        },

        setMessage: function(i) {
        }
    });

    ns.extend({
        'onReady': onReady,
        'letterSequence': letterSequence
    });
});

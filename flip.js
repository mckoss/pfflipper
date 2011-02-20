namespace.lookup('com.pageforest.flip').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client'),
        dom = namespace.lookup('org.startpad.dom'),
        format = namespace.lookup('org.startpad.format'),
        doc;

    var letters = characterRange('AZ'),
        numbers = characterRange('09'),
        symbols = characterRange('!/') + characterRange(':@') + characterRange('[`') + '~',
        space = ' ',
        sets = [letters, numbers, symbols, space];


    function onReady() {
        doc = dom.bindIDs();
        $(doc['scale-y-exemplar']).bind('webkitTransitionEnd transitionend', onFlipY);
        $(doc['threed-exemplar']).bind('webkitTransitionEnd transitionend', onThreeD);
    }

    // Given two characters - return string on inclusive characters.
    function characterRange(range) {
        var first = range.charCodeAt(0);
        var last = range.charCodeAt(1);
        s = "";
        for (var i = first; i <= last; i++) {
          s += String.fromCharCode(i);
        }
        return s;
    }

    // Return the letter sequence needed to go from start to end
    // including skipping between letter sets.
    function letterSequence(start, end) {
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
        throw Error("Invalid Flap character: " + ch);
    }

    ns.extend({
        'onReady': onReady,
        'letterSequence': letterSequence
    });
});

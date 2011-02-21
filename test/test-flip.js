namespace.lookup('com.pageforest.flip.test').defineOnce(function (ns) {
    var flip = namespace.lookup('com.pageforest.flip');

    ns.addTests = function (ts) {

        ts.addTest("flip", function(ut) {
            ut.assert(true);
            ts.coverage.cover('onReady');
        });

        ts.addTest("letterSequence", function(ut) {
            var tests = [
                ['a', 'a', 'A'],
                ['a', 'b', 'AB'],
                ['b', 'z', 'BCDEFGHIJKLMNOPQRSTUVWXYZ'],
                ['0', '9', '0123456789'],
                ['!', ')', '!"#$%&\'()'],
                ['m', '4', 'MNOPQRSTUVWXYZ 01234'],
                ['4', '2', '456789012'],
                ['z', 'a', 'ZA']
            ];

            for (var i = 0; i < tests.length; i++) {
                var test = tests[i];
                ut.assertEq(flip.letterSequence(test[0], test[1]), test[2]);
            }
        });

        ts.addTest("fillText", function(ut) {
            var test,
                tests = [
                    ['a', undefined,  'a         '],
                    ['a', 'left',     'a         '],
                    ['a', 'right',    '         a'],
                    ['a', 'center',   '    a     '],
                    ['a', 'fill',     'a         '],
                    ['a|', 'fill',    'a         '],
                    ['|a', 'fill',    '         a'],
                    ['|a|', 'fill',   '    a     '],
                    ['a|b', 'fill',   'a        b'],
                    ['a|b|c', 'fill', 'a   b    c'],

                    ['hello | world', 'fill',     'hell world'],
                    ['| hello | world |', 'fill', 'hell world'],

                    ['abcdefghijkl', 'left',   'abcdefghij'],
                    ['abcdefghijkl', 'right',  'cdefghijkl'],
                    ['abcdefghijkl', 'center', 'bcdefghijk']
                ];
            for (var i = 0; i < tests.length; i++) {
                test = tests[i];
                ut.assertEq(flip.fillText(test[0], 10, test[1]), test[2]);
            }
        });

        ts.addTest("FlapBoard", function(ut) {
            var fb = new flip.FlapBoard(5, 10, {window: 1}),
                blank = '          ',
                expect,
                i,
                seq,
                test,
                start = '|hi|\n|mom|',
                end = '|hello|\n|mum|';

            ut.assertEq(fb.rows, 5);
            ut.assertEq(fb.cols, 10);
            ut.assertEq(fb.currentBoard.length, 5);
            ut.assertEq(fb.targetBoard.length, 5);
            ut.assertEq(fb.position, 0);
            ut.assertEq(fb.lastPosition, 1);
            ut.assertEq(fb.isComplete(), false);

            for (i = 0; i < 5; i++) {
                ut.assertEq(fb.currentBoard[i], blank);
            }

            fb.setCurrent(start);
            expect = [blank, '    HI    ', '   MOM    ', blank, blank];
            for (i = 0; i < 5; i++) {
                ut.assertEq(fb.currentBoard[i], expect[i]);
            }

            fb.setTarget(start);
            ut.assertEq(fb.isComplete(), false);
            fb.advance();
            ut.assertEq(fb.isComplete(), true);
            for (i = 0; i < 5; i++) {
                ut.assertEq(fb.currentBoard[i], expect[i]);
                ut.assertEq(fb.currentBoard[i], fb.targetBoard[i]);
            }

            fb.setTarget(end);
            seq = [
                ['    HI    ', '   MOM    '],
                ['  AAIJA   ', '   MPM    '],
                ['  BBJKB   ', '   MQM    '],
                ['  CCKLC   ', '   MRM    '],
                ['  DDLLD   ', '   MSM    '],
                ['  EELLE   ', '   MTM    '],
                ['  FELLF   ', '   MUM    '],
                ['  GELLG   ', '   MUM    '],
                ['  HELLH   ', '   MUM    '],
                ['  HELLI   ', '   MUM    '],
                ['  HELLJ   ', '   MUM    '],
                ['  HELLK   ', '   MUM    '],
                ['  HELLL   ', '   MUM    '],
                ['  HELLM   ', '   MUM    '],
                ['  HELLN   ', '   MUM    '],
                ['  HELLO   ', '   MUM    ']
            ];
            ut.assertEq(fb.position, 0);
            ut.assertEq(fb.lastPosition, 16);
            for (i = 0; i < seq.length; i++) {
                test = seq[i];
                ut.assertEq(fb.currentBoard[1], test[0]);
                ut.assertEq(fb.currentBoard[2], test[1]);
                ut.assertEq(fb.isComplete(), false);
                fb.advance();
            }
            ut.assertEq(fb.isComplete(), true);

            fb.setCurrent(start).setTarget(end);
            ut.assertEq(fb.lastPosition, 16);
            var count = 0;
            fb.advance();
            seq = [
                [1, 2, 'A'], [1, 3, 'A'], [1, 4, 'I'], [1, 5, 'J'],
                [1, 6, 'A'], [2, 4, 'P']
            ];
            fb.eachWindow(function (row, col, text) {
                test = seq[count];
                ut.assertEq(row, test[0]);
                ut.assertEq(col, test[1]);
                ut.assertEq(text, test[2]);
                count++;
            });
            ut.assertEq(count, 6);

            fb.window = 2;
            fb.setCurrent(start).setTarget(end);
            ut.assertEq(fb.lastPosition, 17);
            count = 0;
            fb.advance();
            seq = [
                [1, 2, ' A'], [1, 3, ' A'], [1, 4, 'HI'], [1, 5, 'IJ'],
                [1, 6, ' A'], [2, 4, 'OP']
            ];
            fb.eachWindow(function (row, col, text) {
                test = seq[count];
                ut.assertEq(row, test[0]);
                ut.assertEq(col, test[1]);
                ut.assertEq(text, test[2]);
                count++;
            });
            ut.assertEq(count, 6);
        });
    };
});

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
            var fb = new flip.FlapBoard(5, 10),
                i;

            ut.assertEq(fb.rows, 5);
            ut.assertEq(fb.cols, 10);
            ut.assertEq(fb.currentBoard.length, 5);
            ut.assertEq(fb.targetBoard.length, 5);
            ut.assertEq(fb.isComplete(), false);

            for (i = 0; i < 5; i++) {
                ut.assertEq(fb.currentBoard[i], '          ');
            }
        });
    };
});

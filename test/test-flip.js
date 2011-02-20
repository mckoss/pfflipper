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
                    ['a', undefined, 'a         ']
                ];
            for (var i = 0; i < tests.length; i++) {
                test = tests[i];
                ut.assertEq(flip.fillText(test[0], 10, test[1]), test[2]);
            }
        });
    };
});

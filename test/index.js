/**
 * Created by lmarkus on 9/26/15.
 * Simple testing harness, all that we care about is that the JSON files are valid.
 * to run the test run (from the project root):
 *  `$ find . -name "*json" | xargs node test/index.js`
 *
 */

var failures = 0,
    fs = require('fs'),
    jsonFiles = process.argv.slice(2);

jsonFiles
    //Try to parse the content for each file.
    .map(function (file) {
        var res = {name: file, pass: true, err: ''}; //I'm ever the optimist.
        try {
            JSON.parse(fs.readFileSync(file));
        }
        catch (err) {
            failures++;
            res.pass = false;
            res.err = err
        }
        return res;
    })
    //Sort so that errors are together
    .sort(function (a, b) {
        return a.pass ? 0 : 1;
    })

    //Output results.
    .forEach(function (file) {
        console.log(file.pass ? '✓' : '✘', file.name, file.err);
    });

console.log(failures + ' error' + (failures !== 1 ? 's' : '') + ' in ' + jsonFiles.length + ' files');
process.exit(failures);
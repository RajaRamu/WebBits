/**
 * Created by lmarkus on 10/2/15.
 */
'use strict';
var fs = require('fs'),
    path = require('path');

module.exports = function (grunt) {

    grunt.initConfig({
        index: {
            main: {
                archiveDirectory: 'archive/'
            }
        }
    })

    grunt.registerMultiTask('index', 'Create the index of the archive as a JSON file', generateIndex)
}

/**
 * Generate a list of the files in the archives (Filtering and Stripping the JSON extension)
 */
function generateIndex() {
    var archives = fs
        .readdirSync(this.data.archiveDirectory)
        .filter(function (file) {
            return (path.extname(file.toLowerCase()) === '.json');
        })
        .map(function(file){
            return file.split('\.json')[0];
        });
    fs.writeFileSync('archives.json', JSON.stringify(archives));
}
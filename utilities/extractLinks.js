#! /usr/bin/env node
/**
 * Created by lmarkus on 9/27/15.
 * This utility takes the raw body of a message exported form outlook,
 * Splits it at the boundaries that mark the text/plain content (Discarding the HTML one)
 * And finally, parses it to extract WebBit Urls into JSON story format
 */
var fs = require('fs'),
    path = require('path'),
    files = process.argv.slice(2);

files.forEach(function (f) {
//These files are small enough to handle in-memory. No need to process a stream
    var outfile,
        file = path.resolve(f),
        fileExt = path.extname(file),
        fileName = path.basename(file, fileExt),
        data = fs.readFileSync(file).toString('utf-8');

    //0-Pad months and days in output file. Much easier to do here than in applescript
    fileName = fileName.split('-');
    fileName[1] = ('0'+fileName[1]).slice(-2);
    fileName[2] = ('0'+fileName[2]).slice(-2);
    fileName = fileName.join('-');

    outfile = '../archive/' + fileName + '.json';

//Split using the email message section boundary. In outlook they look like: --B_3526195156_1294540168
//[0] -> Header
//[1] -> Plain text
//[2] -> HTML text
//[3] -> Tail of message
    data = data
        .split(/--B_[0-9]+_[0-9]+/)[1]

//Fix Line endings
        .replace(/\r/g, '\n')

//Kill multiple spaces
        .replace(/\n[ ]+/g, '\n')
        .replace(/\n+/g, '\n')

//Split into lines for processing
        .split(/\n/)

//Get rid of the first four lines (content type, encoding)
        .slice(4);

//The rules:
//URL-like strings are URLs
//A non-url preceding a URL is a headline
//A non-url preceding a non-url is a category
//If I get three non-urls in a row, I discard then top one.
//Multiple URLs got into an array for the same story
    var bd = new BufferedData(data),
        stories = [],
        currentStory = new Story();

    for (var i = 0; i < data.length; i++) {
        var isStoryComplete = false,
            line0 = bd.get(i),
            line1 = bd.get(i + 1),
            line2 = bd.get(i + 2);

        //category -> URL
        //headline -> X
        //url -> X
        if (line0.isUrl) {
            currentStory.urls.push(line0.text);
            isStoryComplete = !line1.isUrl;
        }

        //category -> TEXT
        //headline -> URL
        //url -> X
        else if (line1.isUrl) {
            //Shift arguments.
            currentStory.headline = line0.text;
            currentStory.urls.push(line1.text);

            isStoryComplete = !line2.isUrl //Means a new story (In the same category) is coming up
            i = i + 1;
        }

        //category -> TEXT
        //headline -> TEXT
        //url -> URL
        else if (line2.isUrl) {
            currentStory.category = line0.text;
            currentStory.headline = line1.text;
            currentStory.urls.push(line2.text);

            isStoryComplete = !bd.get(i + 3).isUrl;
            i = i + 2;
        }
        //category -> TEXT
        //headline -> TEXT
        //url -> TEXT
        else {
            //noop
            //This will discard the current line, and move on.
        }

        if (isStoryComplete) {
            var nextStory = new Story();
            //Keep the same category until somebody says otherwise.
            nextStory.category = currentStory.category;
            stories.push(currentStory);
            currentStory = nextStory;
        }
    }

    //Catch any remaining stories
    if (currentStory.urls.length) {
        stories.push(currentStory);
    }
    fs.writeFileSync(outfile, JSON.stringify(stories));
});


function Story() {
    return {
        category: '',
        headline: '',
        urls: []
    };
}

//Simple one to prevent array index out of bounds
function BufferedData(data) {

    return {
        get: function (i) {
            return (i >= data.length) ? {} : {text: data[i], isUrl: data[i].match(/^http/)};
        }
    }
}
return true;
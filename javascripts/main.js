/**
 * Created by lmarkus on 9/25/15.
 */
$(function () {

    /**
     * Retrieve the archived editions (by reading the contents of the github 'archive' directory, and render them.
     * Archived editions are named YYYY-MM-DD.json
     */
    function loadArchive() {
        $.getJSON('https://raw.githubusercontent.com/lmarkus/WebBits/master/archive.json', function (archive) {
            var archive = archive
                .sort()
                .reverse(); //Display most recent first.

            dust.render('archive', {archive: archive}, function (err, out) {
                $('#archive').html(out);
            });
        });
    }

    /**
     * Take an ad-hoc collection of stories, and order them by category.
     * Rules: "Featured" content always goes at the beginning, "Rest of the crop" goes at the end. Everything else is alpha-ordered
     * @param content
     * @returns {Array}
     */
    function orderContent(content) {
        //Bucketize
        var tmp = {}, ret = [];
        content.forEach(function (story) {
            var cat = (story.category || 'rest of the crop').toLowerCase();
            tmp[cat] = tmp[cat] || [];
            tmp[cat].push(story);
        })

        //Make ordered array, with Featured at the beginning, and ROC at the end.
        var featured = tmp['featured'],
            roc = tmp['rest of the crop'];
        delete tmp['featured'];
        delete tmp['rest of the crop'];

        featured && ret.push({category: 'featured', stories: featured});
        Object.keys(tmp).sort().forEach(function (cat) {
            ret.push({category: cat, stories: tmp[cat]});
        });
        roc && ret.push({category: 'rest of the crop', stories: roc});

        return ret;
    }

    /**
     * Given a certain edition, retrieve the .json file with the stories from GitHub, and render them
     * @param edition
     */
    function renderEdition(edition) {
        var editionName = edition;
        if (edition !== 'current') {
            edition = '/archive/' + edition;
        }

        $.getJSON('https://raw.githubusercontent.com/lmarkus/WebBits/master/' + edition + '.json', function (content) {
            var tmp = {};

            //reshuffle stories per category
            content = orderContent(content);
            dust.render('edition', {edition: editionName, content: content}, function (err, out) {
                $('#edition').html(out);
            });
        })

    }

    /**
     * Utility function. Returns the current window hash value
     * @returns {string}
     */
    function getHash() {
        return window.location.hash.slice(1);
    }

    //Load templates
    var templates = ['templates/edition.dust', 'templates/archive.dust'];

    var deferreds = templates.map(function (template) {
        var templateName = template.match(/\/(.+)\.dust/)[1];
        return $.get(template, function (data) {
                dust.loadSource(dust.compile(data, templateName));
            }
        );
    });

    $.when.apply(null, deferreds) //This is the jQuery recommended way of awaiting for an array of deferreds to complete
        .done(function () {
            loadArchive();
            renderEdition(getHash() || 'current'); //Render from hash, in case somebody links to an old edition
        });

    $(window).on('hashchange', function () {
        renderEdition(getHash());
    })

});
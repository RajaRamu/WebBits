/**
 * Created by lmarkus on 9/25/15.
 */
$(function () {

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

    function renderEdition(edition) {
        if (edition !== 'current') {
            edition = '/archive/' + edition;
        }

        $.getJSON('https://api.github.com/repos/lmarkus/WebBits/contents/' + edition + '.json?callback=?', function (results) {
            var tmp = {},
                content = results.data.content;
            //Decode from Base64 and parse JSON
            content = JSON.parse(window.atob(content));

            //reshuffle stories per category
            content = orderContent(content);
            console.log(content);
            dust.render('edition', {edition: edition, content: content}, function (err, out) {
                $('#edition').html(out);
            });
        })

    }

    //Load templates
    $.get('templates/edition.dust', function (data) {
            dust.loadSource(dust.compile(data, 'edition'));
        }
    ).then(function () {
            console.log('done');
            renderEdition('current');
        });

});
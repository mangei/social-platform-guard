var DEBUG = false;
var THROTTLE_IN_MS = 3000;

function init() {
    log('I am working for you!');

    window.addEventListener('scroll', doJob);
    doJob();
}

var doJob = _.throttle(function () {
    if (DEBUG) {
        var startTime = performance.now();
    }

    // remove sponsored posts
    $('.uiStreamSponsoredLink').each(function () {
        log('Removed: Sponsored Post');
        getHyperfeedElement($(this)).remove();
    });

    // remove special posts from users
    var postSuffixes = [
        'liked this.',
        'was tagged in a photo.',
        'was tagged in 2 photos.',
        'was tagged in 3 photos.',
        'was tagged in 4 photos.',
        'was tagged in 5 photos.',
        'was tagged in this.',
        'reacted to this.',
		'replied to a comment on this.'
    ];
    $('.profileLink').each(function () {
        var text = $(this).parent().parent().text();

        var removePost = _.some(postSuffixes, function (suffix) {
            return textEndsWith(text, suffix);
        });

        if (removePost) {
            log('Removed: User Post: ', text);
            getHyperfeedElement($(this)).remove();
        }
    });

    if (DEBUG) {
        var endTime = performance.now();
        console.log('time: ', endTime - startTime);
    }
}, THROTTLE_IN_MS);

function getHyperfeedElement($element) {
    return $element.closest("[id ^= 'hyperfeed_story_id_']");
}

function textEndsWith(text, suffix) {
    return text.substr(-suffix.length) === suffix;
}

function log() {
    var args = Array.prototype.slice.call(arguments);
    args = ['Social Platform Guard: '].concat(args);
    console.log.apply(this, args);
}

init();
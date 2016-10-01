var DEBUG = false;
var THROTTLE_IN_MS = 3000;

var postSuffixes = [];
var postSuffixesByLang = {
    en: [
        'liked this.',
        'was tagged in a photo.',
        'was tagged in 2 photos.',
        'was tagged in 3 photos.',
        'was tagged in 4 photos.',
        'was tagged in 5 photos.',
        'was tagged in this.',
        'reacted to this.',
        'replied to a comment on this.',
        'commented on this.',
        'was mentioned in a post.'
    ],
    de: [
        'gefällt das.',
        'wurde in einem Foto markiert.',
        'wurde auf 2 Fotos markiert.',
        'wurde auf 3 Fotos markiert.',
        'wurde auf 4 Fotos markiert.',
        'wurde auf 5 Fotos markiert.',
        'wurde markiert.',
        'hat auf einen Kommentar dazu geantwortet.',
        'hat das kommentiert.',
        'haben das kommentiert.',
        'wurde in einem Beitrag erwähnt.'
    ]
};

function init() {
    log('I am working for you!');

    // set language related post suffixes
    var lang = document.documentElement.lang;
    if (postSuffixesByLang[lang] !== undefined) {
        postSuffixes = postSuffixesByLang[lang];
    }

    window.addEventListener('scroll', doJob);
    window.onhashchange = function () {
        doJob();
        setTimeout(doJob, THROTTLE_IN_MS + 2000);
    };
    doJob();
}

var doJob = _.throttle(function () {
    if (DEBUG) {
        var startTime = window.performance.now();
    }

    // remove sponsored posts
    $('.uiStreamSponsoredLink').each(function () {
        log('Removed: Sponsored Post');
        removeElement(getHyperfeedElement($(this)));
    });

    $('.profileLink:not(.guard-checked)').each(function () {
        $(this).addClass('guard-checked');

        var text = $(this).parent().parent().text();

        var removePost = _.some(postSuffixes, function (suffix) {
            return textEndsWith(text, suffix);
        });

        if (removePost) {
            log('Removed: User Post: ', text);
            removeElement(getHyperfeedElement($(this)));
        }
    });

    if (DEBUG) {
        var endTime = window.performance.now();
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

function removeElement(element) {
    window.setTimeout(function () {
        element.remove();
    }, 0);
}

init();
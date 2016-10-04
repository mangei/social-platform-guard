var DEBUG = false;
var THROTTLE_IN_MS = 3000;

var config = {
    leaveHints: true,
    hideSponsored: false
};

var messages = {
    appName: 'Social Platform Guard',
    en: {
        iAmWorkingForYou: 'I am working for you!',
        userPost: 'User Post',
        sponsoredPost: 'Sponsored Post',
        showPost: 'Show Post',
        hidden: 'Hidden',
        postRegexList: [
            /(.*) liked this\./,
            /(.*) was tagged in a photo\./,
            /(.*) was tagged in \d+ photos\./,
            /(.*) was tagged in this\./,
            /(.*) reacted to this\./,
            /(.*) replied to a comment on this\./,
            /(.*) commented on this\./,
            /(.*) was mentioned in a post\./,
            /(.*) replied to a comment on a post from (.*)\./,
            /(.*) likes (.*)\./,
            /(.*) like (.*)\./,
            /(.*) liked this post from (.*)\./,
            /Saved on (.*)/,
            // TODO /(.*) hat diesen Beitrag (.*) markiert./, // XYZ hat diesen Beitrag (September 2014) mit „Gefällt mir“ markiert.
            /(.*) commented on a post from (.*)\./
        ]
    },
    de: {
        iAmWorkingForYou: 'Ich arbeite für dich!',
        userPost: 'Benutzerbeitrag',
        sponsoredPost: 'Werbebeitrag',
        showPost: 'Zeige Beitrag',
        hidden: 'Ausgeblendet',
        postRegexList: [
            /(.*) gefällt das\./,
            /(.*) wurde in einem Foto markiert\./,
            /(.*) wurde auf \d+ Fotos markiert\./,
            /(.*) wurde markiert\./,
            /(.*) hat darauf reagiert\./,
            /(.*) hat auf einen Kommentar dazu geantwortet\./,
            /(.*) hat das kommentiert\./,
            /(.*) haben das kommentiert\./,
            /(.*) wurde in einem Beitrag erwähnt\./,
            // TODO /(.*) replied to a comment on a post from (.*)\./,
            /(.*) gefällt (.*)\./,
            // TODO /(.*) like (.*)\./,
            // TODO /(.*) liked this post from (.*)\./,
            /Gespeichert am (.*)/,
            /(.*) hat diesen Beitrag (.*) markiert./, // XYZ hat diesen Beitrag (September 2014) mit „Gefällt mir“ markiert.
            /(.*) hat einen Beitrag (.*) kommentiert./ // XYZ hat einen Beitrag (25. August) kommentiert.
        ]
    }
};

function init() {
    chrome.storage.sync.get(config, function (items) {
        config = items;

        log(getLocalizedMessages().iAmWorkingForYou);

        var doJobThrottled = _.throttle(doJob, THROTTLE_IN_MS);
        window.addEventListener('scroll', doJobThrottled);
        window.onhashchange = function () {
            // we clean up more than necessay, since some posts might not be loaded yet.
            doJob();
            setTimeout(doJob, 3000);
            setTimeout(doJob, 5000);
        };
        // we clean up more than necessay, since some posts might not be loaded yet.
        doJob();
        setTimeout(doJob, 3000);
        setTimeout(doJob, 5000);
    });
}

function doJob() {
    if (DEBUG) {
        var startTime = window.performance.now();
    }

    getUncheckedHyperfeedElements().each(function () {
        var hyperfeedElement = $(this);
        var gotHidden = hideSpecialPosts(hyperfeedElement);
        if (config.hideSponsored && !gotHidden) {
            hideSponsoredPosts(hyperfeedElement);
        }
    });

    if (DEBUG) {
        var endTime = window.performance.now();
        console.log('time: ', endTime - startTime);
    }
}

function hideSponsoredPosts(hyperfeedElement) {
    var gotHidden = false;
    hyperfeedElement
        .find('.uiStreamSponsoredLink')
        .first()
        .each(function () {
            gotHidden = true;
            hideElement(hyperfeedElement, getLocalizedMessages().sponsoredPost);
        });
    return gotHidden;
}

function hideSpecialPosts(hyperfeedElement) {
    var gotHidden = false;
    hyperfeedElement
        .find('.profileLink')
        .first()
        .each(function () {
            var text = $(this).parent().parent().text();
            var parseResult = parseSpecialText(text);
            if (parseResult.isSpecialText) {
                gotHidden = true;
                hideElement(hyperfeedElement, getLocalizedMessages().userPost + ': ' + text, parseResult.user);
            }
        });
    return gotHidden;
}

function parseSpecialText(text) {
    var user = undefined;
    var postRegexList = getLocalizedMessages().postRegexList;
    var isSpecialText = _.some(postRegexList, function (postRegex) {
        var matched = postRegex.test(text);
        if (matched) {
            var match = postRegex.exec(text);
            user = match[1];
        }
        return matched;
    });
    return {
        isSpecialText: isSpecialText,
        user: user
    };
}

function getUncheckedHyperfeedElements() {
    return $("[id ^= 'hyperfeed_story_id_']:not(.guard-checked)")
        .addClass('guard-checked');
}

function log() {
    var args = Array.prototype.slice.call(arguments);
    args = [messages.appName + ': '].concat(args);
    console.log.apply(this, args);
}

function getLocalizedMessages() {
    if (getLocalizedMessages.lang === undefined) {
        getLocalizedMessages.lang = document.documentElement.lang;
    }
    return messages[getLocalizedMessages.lang];
}

function hideElement(element, message, user) {
    log(getLocalizedMessages().hidden + ': ' + message);

    if (config.leaveHints) {
        var showPostElement = document.createElement('p');
        showPostElement.textContent = message;
        showPostElement.onclick = function () {
            element.show('slow');
            setTimeout(function () {
                showPostElement.remove();
            }, 0);
        };
        showPostElement.title = getLocalizedMessages().showPost;
        showPostElement.style['text-align'] = 'center';
        showPostElement.style['color'] = '#acacac';
        showPostElement.style['border'] = '1px dashed rgb(168, 168, 168)';
        showPostElement.style['cursor'] = 'pointer';

        $(showPostElement).insertBefore(element);
    }

    element.hide();
}

init();
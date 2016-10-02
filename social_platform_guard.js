var DEBUG = false;
var THROTTLE_IN_MS = 3000;
var LEAVE_HINTS = true;

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
			/(.*) liked this post from (.*)\./,
			/Saved on (.*)/
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
			// TODO /(.*) liked this post from (.*)\./,
			/Gespeichert am (.*)/,
			/(.*) hat diesen Beitrag (.*) markiert./, // XYZ hat diesen Beitrag (September 2014) mit „Gefällt mir“ markiert.,
		]
	}
};

function init() {
    log(getLocalizedMessages().iAmWorkingForYou);

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

    // hide sponsored posts
    $('.uiStreamSponsoredLink:not(.guard-checked)').each(function () {
        $(this).addClass('guard-checked');
        hideElement(getHyperfeedElement($(this)), getLocalizedMessages().sponsoredPost);
    });

	// hide special posts
    $('.profileLink:not(.guard-checked)').each(function () {
        $(this).addClass('guard-checked');

        var text = $(this).parent().parent().text();
		var user = undefined;

		var postRegexList = getLocalizedMessages().postRegexList;
        var shouldHidePost = _.some(postRegexList, function (postRegex) {
			var matched = postRegex.test(text);
			if(matched) {
				var match = postRegex.exec(text);
				user = match[1];
			}
            return matched;
        });
		
		var isOnWhiteList = isWhitelisted(user);

        if (shouldHidePost && !isOnWhiteList) {
			hideElement(getHyperfeedElement($(this)), getLocalizedMessages().userPost + ': ' + text, user);
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

function log() {
    var args = Array.prototype.slice.call(arguments);
    args = [messages.appName + ': '].concat(args);
    console.log.apply(this, args);
}

function getLocalizedMessages() {
	if(getLocalizedMessages.lang === undefined) {
		getLocalizedMessages.lang = document.documentElement.lang;
	}
	return messages[getLocalizedMessages.lang];
}

function hideElement(element, message, user) {
    log(getLocalizedMessages().hidden + ': ' + message);
	
	if(LEAVE_HINTS) {
		var showPostElement = document.createElement('p');
		showPostElement.innerHTML = message;
		showPostElement.onclick = function() {
			element.show('slow');
			showPostElement.remove();
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

function isWhitelisted(user) {
	return false; // TODO user === 'A A';
}
// TODO users
// A
// A A
// A A A
// A A and B B
// A A, B B and C C

init();
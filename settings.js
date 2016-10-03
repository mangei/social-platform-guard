function save_options() {
    var leaveHints = document.getElementById('leaveHints').checked;
    var hideSponsored = document.getElementById('hideSponsored').checked;
    chrome.storage.sync.set({
        leaveHints: leaveHints,
        hideSponsored: hideSponsored
    }, function () {
        // Update status to let user know options were saved.
    });
}

function restore_options(callback) {
    chrome.storage.sync.get({
        leaveHints: true,
        hideSponsored: false
    }, function (items) {
        document.getElementById('leaveHints').checked = items.leaveHints;
        document.getElementById('hideSponsored').checked = items.hideSponsored;
        callback();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    restore_options(function () {
        document.getElementById('leaveHints').addEventListener('change', save_options);
        document.getElementById('hideSponsored').addEventListener('change', save_options);
    });
});

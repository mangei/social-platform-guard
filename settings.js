function save_options() {
    var status = document.getElementById('status');
    var saveButton = document.getElementById('save');
    status.textContent = 'Saving...';
    saveButton.disabled = true;
    var leaveHints = document.getElementById('leaveHints').checked;
    var hideSponsored = document.getElementById('hideSponsored').checked;
    var whitelist = normalizeWhitelist(document.getElementById('whitelist').value);
    document.getElementById('whitelist').value = whitelist;
    chrome.storage.sync.set({
        leaveHints: leaveHints,
        hideSponsored: hideSponsored,
        whitelist: whitelist
    }, function () {
        // Update status to let user know options were saved.
        status.textContent = 'Settings saved.';
        saveButton.disabled = false;
        setTimeout(function () {
            status.textContent = '';
        }, 1000);
    });
}

function normalizeWhitelist(whitelist) {
    return _.chain(whitelist.split('\n'))
        .map(function (entry) {
            return entry.trim();
        })
        .reject(_.isEmpty)
        .join('\n')
        .value();
}

function restore_options(callback) {
    chrome.storage.sync.get({
        leaveHints: true,
        hideSponsored: false,
        whitelist: ''
    }, function (items) {
        document.getElementById('leaveHints').checked = items.leaveHints;
        document.getElementById('hideSponsored').checked = items.hideSponsored;
        document.getElementById('whitelist').value = items.whitelist;
        callback();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    restore_options(function () {
        var saveButton = document.getElementById('save');
        saveButton.addEventListener('click', save_options);
        document.getElementById('leaveHints').addEventListener('change', save_options);
        document.getElementById('hideSponsored').addEventListener('change', save_options);
        saveButton.disabled = false;
    });
});

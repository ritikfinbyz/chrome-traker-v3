document.addEventListener('DOMContentLoaded', function() {
    function displayUrls(urls) {
        let urlList = document.getElementById('urlList');
        urlList.innerHTML = ''; // Clear the list first
        urls.forEach(function(item) {
            let li = document.createElement('li');
            li.textContent = `[${item.startTime} - ${item.endTime}] : ${item.url}`;
            urlList.appendChild(li);
        });
    }

    // Load and display stored URLs
    chrome.storage.local.get({urls: []}, function(result) {
        displayUrls(result.urls);
    });

    // Clear logs when button is clicked
    document.getElementById('clearLogs').addEventListener('click', function() {
        chrome.storage.local.set({urls: []}, function() {
            displayUrls([]);
        });
    });
});

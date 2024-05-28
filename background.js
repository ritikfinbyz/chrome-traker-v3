let activeTabId = null;
let activeUrl = null;
let startTime = null;

function saveUrlVisit(url, startTime, endTime) {
    if (!url || !startTime || !endTime) return;
    chrome.storage.local.get({urls: []}, function(result) {
        let urls = result.urls;
        urls.push({
            url: url,
            startTime: startTime,
            endTime: endTime
        });
        chrome.storage.local.set({urls: urls}, function() {
            console.log("URL visit saved:", {urls, startTime, endTime});
            console.log(urls)
            const start_Time = startTime;
            const end_Time  = endTime;
            const url_link = url;

            const data = {
                start_Time,
                end_Time,
                url_link,
              };

            fetch('http://localhost:5000/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
            message = data.message;
            })
            .catch(error => {
            console.error('Error:', error);
            message = 'Error saving data';
            });
                });
    });
}

function updateActiveTab(tabId) {
    chrome.tabs.get(tabId, function(tab) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        if (tab.url && tab.url.startsWith('http')) {
            if (activeTabId !== null && activeUrl !== null && startTime !== null) {
                let endTime = new Date().toISOString();
                saveUrlVisit(activeUrl, startTime, endTime);
            }
            activeTabId = tab.id;
            activeUrl = tab.url;
            startTime = new Date().toISOString();
            console.log("Active tab updated:", {activeTabId, activeUrl, startTime});
        }
    });
}

chrome.webNavigation.onCommitted.addListener(function(details) {
    if (details.frameId === 0) { // Only consider the main frame
        updateActiveTab(details.tabId);
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateActiveTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url !== activeUrl) {
        updateActiveTab(tabId);
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    if (tabId === activeTabId) {
        let endTime = new Date().toISOString();
        saveUrlVisit(activeUrl, startTime, endTime);
        activeTabId = null;
        activeUrl = null;
        startTime = null;
        console.log("Tab removed:", {tabId, endTime});
    }
});

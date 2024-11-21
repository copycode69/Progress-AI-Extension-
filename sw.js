chrome.action.onClicked.addListener(openDemoTab);

function openDemoTab() {
  chrome.tabs.create({ url: 'index.html' });
}
function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

function buildPopupDom(divName, data) {
  let popupDiv = document.getElementById(divName);

  let ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (let i = 0, ie = data.length; i < ie; ++i) {
    let a = document.createElement('a');
    a.href = data[i];
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);

    let li = document.createElement('li');
    li.appendChild(a);

    ul.appendChild(li);
  }
}


function buildTypedUrlList(divName) {
 
  let millisecondsPerDay = 1000 * 60 * 60 * 24;
  let oneWeekAgo = new Date().getTime() - (millisecondsPerDay * 7);
  


  let numRequestsOutstanding = 0;

  chrome.history.search(
    {
      text: '', 
      startTime: oneWeekAgo
    },
    function (historyItems) {
      for (let i = 0; i < historyItems.length; ++i) {
        let url = historyItems[i].url;
        let processVisitsWithUrl = function (url) {
        
          return function (visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({ url: url }, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    }
  );


  let urlToCount = {};
 
  const processVisits = function (url, visitItems) {
    for (let i = 0, ie = visitItems.length; i < ie; ++i) {
      if (visitItems[i].transition != 'typed') {
        continue;
      }

      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }

      urlToCount[url]++;
    }

    
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

 
  const onAllVisitsProcessed = () => {

    let urlArray = [];
    for (let url in urlToCount) {
      urlArray.push(url);
    }

    
    urlArray.sort(function (a, b) {
      return urlToCount[b] - urlToCount[a];
    });

    buildPopupDom(divName, urlArray.slice(0, 10));
  };
}

document.addEventListener('DOMContentLoaded', function () {
  buildTypedUrlList('typedUrl_div');
});
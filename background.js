var settings;

function retrieveSettings (){
  chrome.storage.sync.get({
    service: {
      name: "gpm",
      extra: ".com"
    },
    gpmdp: {
      key: "empty"
    }
  }, function (items){
    settings = items;
  });
}

retrieveSettings();

chrome.storage.onChanged.addListener(retrieveSettings);

var listener = chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (details.url.startsWith("https://open.spotify.com/")) {
      var parser = document.createElement("a");
      parser.href = details.url;

      if (parser.hash == "#nogpm") {
        return;
      }

      var requestBase = "https://krmax44.de/playify/?d="+settings.service.name+"&e="+settings.service.extra+"&type=";
      var requestId = parser.pathname.split("/")[2];
      var requestType = "";
      var requestExtra = "";
      var playlistRegex = /\/[a-zA-Z0-9_\-]+\/playlist\/[a-zA-Z0-9]+/ig; // usernames may contain a-z, A-Z, 0-9, "-" and "_"; playlists may contain a-z, A-Z, 0-9

      if (parser.pathname.startsWith("/album/")) {
        requestType = "album";
      } else if (parser.pathname.startsWith("/artist/")) {
        requestType = "artist";
      } else if (parser.pathname.startsWith("/track/")) {
        requestType = "track";
      } else if (playlistRegex.exec(parser.pathname)) {
        requestType = "playlist";
        requestExtra = parser.pathname.split("/")[4];
      }

      if (!!requestType) {
        return { redirectUrl: requestBase + requestType + "&q=" + requestId + "&r=" + requestExtra + "#" + settings.gpmdp.key };
      }

    }
  }, {
    urls: ["*://*.spotify.com/*"],
    types: ["main_frame"]

  }, ["blocking"]
);

function addListener(obj, event, func) {
  if (obj.addEventListener) obj.addEventListener(event, func, false);
  else obj.attachEvent('on'+event, func);
}

function AJAXInteraction(url, callback) {
    var req = init();
    req.onreadystatechange = processRequest;

    function init() {
        if (window.XMLHttpRequest)
            return new XMLHttpRequest();
        else if (window.ActiveXObject)
            return new ActiveXObject("Microsoft.XMLHTTP");
    }

    function processRequest () {
        // readyState of 4 signifies request is complete
        if (req.readyState == 4) {
            // status of 200 signifies sucessful HTTP call
            if (req.status == 200) {
                if (callback) callback(req.responseXML);
            }
        }
    }

    this.doGet = function () {
        // make a HTTP GET request to the URL asynchronously
        req.open("GET", url, true);
        req.send(null);
    }
}

function HttpStreamManager (url, default_callback) {
  var self = this;
  this.clients = new Array();
  this.default_callback = default_callback;

  this.register = function(id, callback) {
    this.clients[id] = callback;
  }

  this.streamLoop = function (responseXML) {
    if (responseXML != null) {
      //alert(responseXML.getElementsByTagName("StreamId")[0]);
      var id = responseXML.getElementsByTagName("StreamId")[0].firstChild.nodeValue;
      //alert("HttpStreamManager received a response for id: "+id);
      var callback = self.clients[id];

      if (callback == null || callback == undefined) {
        //alert(callback);
        callback = self.default_callback;
        //alert(default_callback);
        //alert(callback);
      }

      callback(responseXML);
    }

    new AJAXInteraction(url, self.streamLoop).doGet();
  }

  this.streamLoop(null);

  this.reset = function () {
    this.clients = new Array();
  }

  this.set_default_callback = function (new_default_callback)
  {
    this.default_callback = new_default_callback;
  }
}

function StopWatch() {
  var self = this;
  var dtStart = new Date();
  var msElapsed = 0;

  this.start = function() {
    dtStart = new Date();
  }

  this.stop = function() {
    msElapsed = new Date().valueOf() - dtStart.valueOf();
  }

  this.reset = function() {
    msElapsed = 0;
    self.start();
  }

  this.timeElapsed = function(timeUnit) {
    if (timeUnit == 's') {
      return msElapsed/1000.0;
    }
    else if (timeUnit == 'ms') {
      return msElapsed;
    }
    else {
      alert('StopWatch.timeElapsed: "' + timeUnit + '" unit of time is not yet supported');
    }
  }
}
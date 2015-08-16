function Request(config) {
  this.identifier = Request.prototype.counter++;
  this.url = config.url;
  this.data = config.data || null;
  this.success = config.success || function(){};
  this.error = config.error || config.success;
  this.method = config.method || Request.METHODS.GET;
  this.async = config.async || true;

  this.xmlhttp = null;
  this.result = null;
};

Request.prototype.counter = 0;

Request.prototype.METHODS = {
  GET: 'GET',
  POST: 'POST'
}

Request.prototype.STATUS = {
  ERROR: 0,
  SUCCESS: 1,
  UNKNOWN: 2
}

Request.prototype.execute = function() {
  var self = this;
  var query = [];
  var request_url = this.url;

  for(var key in this.data)
    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(this.data[key]));

  query = (query.length ? query.join('&') : '');
  if(this.method == Request.prototype.METHODS.GET) {
    request_url += (query.length ? '?' : '') + query;
  }


  if(window.XMLHttpRequest)
      this.xmlhttp = new XMLHttpRequest();
  else
      this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

  this.xmlhttp.onreadystatechange = function(e) {
      self._state_change(e);
  };

  this.xmlhttp.open(this.method, request_url, this.async);
  if(this.method == Request.prototype.METHODS.POST)
    this.xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  this.xmlhttp.send(query);
};


Request.prototype._state_change = function(e) {
  if(this.xmlhttp.readyState == XMLHttpRequest.DONE) {
    this.result = {status : Request.prototype.STATUS.UNKNOWN,
                   event : e,
                   data: this.xmlhttp.responseText};
    if(this.xmlhttp.status == 400) {
      this.result.status = Request.prototype.STATUS.ERROR;
      this.error(this, e);
    } else if(this.xmlhttp.status == 200) {
      this.result.status = Request.prototype.STATUS.SUCCESS
      this.success(this, e);
    } else {
      this.error(this, e);
    }
  }
};

function Service(max_procesing) {
  this.max_processing = 5;
  this.queue = [];
  this.processing = [];
};

Service.prototype.init = function() {

};

Service.prototype.request = function(config) {
  this.enqueue(new Request(config));
};

Service.prototype.enqueue = function(request) {
  this.queue.push(request);
  this._next_request();
};

Service.prototype._next_request = function() {
  if(!this.queue.length) {
    return;
  } else if (this.processing.length >= this.max_processing) {
    //console.warn("Too many open requests. Queue-Length:" + this.queue.length);
    return;
  }
  var request = this.queue.shift();
  //console.info("NEXT REQUEST :" + request.identifier);
  this._exec_request(request);
};

Service.prototype._exec_request = function(request) {
  this._decorate_request(request);
  this.processing.push(request);
  request.execute();

},

Service.prototype._decorate_request = function(request) {
  var self = this;
  var _success = request.success;
  var _error = request.error;

  request.success = function(request, e) {
    _success(request, e);
    self.trash(request);
    self._next_request();
  };

  request.error = function(request, e) {
    _error(request, e);
    self.trash(request);
    self._next_request();
  };
};

Service.prototype.trash  = function(request) {
  //console.log("Trashing Request:" + request.identifier);
  for(var k in this.processing) {
    if(this.processing[k].identifier == request.identifier) {
      this.processing.splice(k, 1);
      return;
    }
  }

  for(var k in this.queue) {
    if(this.queue[k].identifier == request.identifier) {
      this.queue.splice(k, 1);
      return;
    }
  };
};
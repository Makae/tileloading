var canvas_module = {
  canvas : null,
  ctx : null,
  tile_height : 100,
  tile_width : 100,
  c_width : 5000,
  c_height : 800,
  num_x : null,
  num_y : null,
  num_tiles : null,
  service : null,

  init : function() {
    this.service = new Service(1);
    this.num_x = Math.ceil(this.c_width / this.tile_width);
    this.num_y = Math.ceil(this.c_height / this.tile_height);
    this.num_tiles = this.num_x * this.num_y;

    this.canvas = document.getElementById('canvas');
    this.loadTiles();
  },

  loadTiles : function() {
    for(var i=0; i<this.num_tiles; i++)
      this.loadTile(i);
  },

  loadTile : function(idx) {
    var self = this;
    var ctxt = this.prepareTile(idx);
    this.service.request({
      url : 'gettile.php',
      method : 'GET',
      data : {tile_idx: idx, format: 'base64'},
      success : function(request) {
        self.tileLoaded(ctxt, request.result.data);
      },
      error : function() {
        console.log("ERROR WHILE TILE LOADING");
      }
    });
  },

  prepareTile : function(idx) {
    var x = Math.floor(idx / this.num_y);
    var y = idx % this.num_y;
    var left = x * this.tile_width;
    var top = y * this.tile_height;

    img = new Image();
    img.className = 'img_tile';
    img.style.transform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    this.canvas.appendChild(img);
    return img;
  },

  tileLoaded : function(ctxt, data) {
    ctxt.src = 'data:image/png;base64, ' + data;
    ctxt.className = 'img_tile loaded';
  }
};


var loaded = (function() {
  var initialized = false;
  return function() {
    if(initialized)
      return;
    canvas_module.init();
    //service.init();
    //tests.init();
    initialized = true;
  }
})();


if(typeof document.addEventListener != 'undefined')
  document.addEventListener('DOMContentLoaded', loaded, false);
else if(typeof window.addEventListener != 'undefined')
  window.addEventListener('load', loaded, false )
else if(typeof window.attachEvent != 'undefined')
  window.attachEvent("onload", loaded);
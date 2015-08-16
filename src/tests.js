
var tests = {
  init : function() {
    this.service.test();
  },

  service : {
    test : function() {
      var svc = new Service(5);
      for(var i=0; i<200; i++) {
        svc.request({
          url : 'gettile.php',
          method : 'GET',
          data : {tile_idx: i, format: 'base64'},
          success : tests.service.success,
          error : tests.service.error
        });
      }
    },

    error : function(request, e) {
      console.log("error:");
      console.log(request);
      console.log(request.result);
      console.log(e);
    },

    success : function(request, e) {
      img = new Image();
      img.className = 'img_tiles';
      img.src = "data:image/png;base64, " + request.result.data;
      document.getElementById('canvas-wrapper').appendChild(img);
    }

  }
};
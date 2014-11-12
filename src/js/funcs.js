var img_ed = (function () {
  var self = {};


  // Some values
  // ===========

  self.defaults = {
    width: 300,
    height: 150,
    font: 'normal 32px sans-serif',
    fillStyle: 'black',
    strokeStyle: 'black',
    textAlign: 'center',
    textBaseline: 'middle',
    tooltip_time: 2000,
    colors: [
      'black',  'yellow', 'cyan',
      'green',  'red',    'blue',
      'purple', 'pink',   'orange',
      'grey',   'white',  'brown'
    ],
    fonts: [
      'serif',
      'sans-serif',
      'monospace',
      'arial',
      'times-new-roman',
      'verdana'
    ],
    samples: [
      'images/coffee.jpg',
      'images/tiger.jpg',
      'images/wood.jpg',
      'images/sticks.jpg'
    ],
    shapes: [
      'images/speech.png',
      'images/circle.png',
      'images/rect.jpg',
    ]
  };


  // Setup Funcs
  // ===========

  // This is for extra stuff not supported by 
  //  the controls setup, like image buttons.
  self.add_extras = function () {

    function add_imgs (img_names, elem, func_gen) {
      img_names.forEach(function (img_name) {
        var img = new Image();
        img.src = img_name;
        elem.appendChild(img);
        on('click', img, func_gen(img_name));
      });
    }

    add_imgs(self.defaults.samples, self.load_samples_e, function (img_name) {
      return function (e) {
        // Load the image into the canvas and close the modal.
        self.load_img(img_name);
        controls.hide(self.load_modal);
      };
    });

    add_imgs(self.defaults.shapes, self.shape_shapes_e, function (img_name) {
      return function (e) {
        // Close the modal.
        controls.hide(self.shape_modal);

        self.add_shape(img_name);
      };
    });
  }


  self.add_drawing_evts = function () {
    on('mousedown', self.canvas, function (e) {
      if (self.tool == 'pen') {
        var c = self.canv_coords(e);
        self.pen.down = true;
        self.pen.draw(c.x, c.y, false);
      }
    });

    on('mousemove', self.canvas, function (e) {
      if (self.tool == 'pen' && self.pen.down) {
        var c = self.canv_coords(e);
        self.pen.draw(c.x, c.y, true);
      }
    });
    
    on('mouseup', self.canvas, function (e) {
      self.pen.down = false;
    });
    
    on('mouseleave', self.canvas, function (e) {
      self.pen.down = false;
    });
  }


  self.reset = function () {
    console.log('Reset');
    self.ctx = self.canvas.getContext('2d');
    self.ctx._font = self.defaults.font;
    self.ctx.font = self.defaults.font;
    self.ctx.textAlign = self.defaults.textAlign;
    self.ctx.fillStyle = self.defaults.fillStyle;
    self.ctx.strokeStyle = self.defaults.strokeStyle;
    self.ctx.textBaseline = self.defaults.textBaseline;
  }


  // Runtime Funcs
  // =============

  // Get position from user and adds the img_src to the canvas.
  self.add_shape = function (img_src) {
    self.tooltip('Click somewhere on the image to position shape.');
    self.canvas.classList.add('crosshairs');

    on_once('click', self.canvas, (function (img_src) {
      return function (e) {
        self.canvas.classList.remove('crosshairs');

        // Get coords
        var c = self.canv_coords(e);
        
        // Load the image into the canvas
        var img = new Image();
        on('load', img, (function (img, x, y) {
          return function (e) {
            var ratio = img.height / img.width;
            var width = self.canvas.width / 2;
            var height = width * ratio;
            x = x - (width / 2);
            y = y - (height / 2);
            self.ctx.drawImage(img, x, y, width, height);
          };
        })(img, c.x, c.y));
        img.src = img_src;

      };
    })(img_src));
  }


  // Sets the canvas to img_src
  self.load_img = function (img_src) {
    var img = new Image();
    on('load', img, function (e) {
      self.canvas.width = img.width;
      self.canvas.height = img.height;
      self.ctx.drawImage(img, 0, 0, img.width, img.height);
      self.reset();
    });
    img.src = img_src;
  }


  // Sub-module
  self.pen = (function (parent) {
    var self = {};

    self.strokeStyle = 'black';
    self.lineWidth = '1';

    self.last_x = 0;
    self.last_y = 0;
    self.down = false;

    // Called from a mousemove event, continues the pen line.
    self.draw = function (x, y, down) {
      if (down) {
        parent.ctx.lineWidth = self.lineWidth;
        parent.ctx.strokeStyle = self.strokeStyle;
        parent.ctx.beginPath();
        parent.ctx.lineJoin = "round";
        parent.ctx.moveTo(self.last_x, self.last_y);
        parent.ctx.lineTo(x, y);
        parent.ctx.closePath();
        parent.ctx.stroke();
      }
      self.last_x = x;
      self.last_y = y;
    }
    
    return self;
  }(self));


  // Displays a tooltip of text.
  self.tooltip = function (text) {
    self.tooltip_e.innerHTML = text;
    self.tooltip_e.classList.add('show');
    window.setTimeout(function () {
      self.tooltip_e.classList.remove('show');
      window.setTimeout(function () { // Wait for CSS transition to end
        self.tooltip_e.innerHTML = '';
      }, 200);
    }, self.defaults.tooltip_time);
  }


  // Takes an mouse event and extracts the coords relative to the canvas.
  self.canv_coords = function (e) {
    var rect = self.canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) / (rect.right - rect.left) * self.canvas.width;
    var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * self.canvas.height;
    return {x: x, y: y};
  }


  // Font string managment:
  // Assume font is in the form: `[style] [size] [family]`

  self.set_font = function (value, type) {
    var style = self.get_style();
    var size = self.get_size();
    var family = self.get_family();

    if (type == 'style') {
      style = value;
    } else if (type == 'family') {
      family = value;
    } else if (type == 'size') {
      size = value;
    }

    // _font used because the browser messes with the font property
    //  so we can't be sure what comes out in the getters.
    self.ctx._font = style + ' ' + size + ' ' + family;
    self.ctx.font = self.ctx._font;
  }

  self.get_style = function () {
    return self.ctx._font.split(' ')[0];
  }

  self.get_size = function () {
    return self.ctx._font.split(' ')[1];
  }

  self.get_family = function () {
    return self.ctx._font.split(' ')[2];
  }


  return self;
}());

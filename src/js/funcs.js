var img_ed = {};


// Some values
// ===========

img_ed.defaults = {
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


img_ed.pen = {
  strokeStyle: 'black',
  lineWidth: '1',

  last_x: 0,
  last_y: 0,
  down: false
};


// Setup Funcs
// ===========

// This is for extra stuff not supported by 
//  the controls setup, like image buttons.
img_ed.add_extras = function () {

  function add_imgs (img_names, elem, func_gen) {
    img_names.forEach(function (img_name) {
      var img = new Image();
      img.src = img_name;
      elem.appendChild(img);
      on('click', img, func_gen(img_name));
    });
  }

  add_imgs(this.defaults.samples, img_ed.load_samples_e, function (img_name) {
    return function (e) {
      // Load the image into the canvas and close the modal.
      img_ed.load_img(img_name);
      controls.hide(img_ed.load_modal);
    };
  });

  add_imgs(this.defaults.shapes, img_ed.shape_shapes_e, function (img_name) {
    return function (e) {
      // Close the modal.
      controls.hide(img_ed.shape_modal);

      img_ed.add_shape(img_name);
    };
  });
}


img_ed.add_drawing_evts = function () {
  on('mousedown', this.canvas, function (e) {
    if (img_ed.tool == 'pen') {
      var c = img_ed.canv_coords(e);
      img_ed.pen.down = true;
      img_ed.pen.draw(c.x, c.y, false);
    }
  });

  on('mousemove', this.canvas, function (e) {
    if (img_ed.tool == 'pen' && img_ed.pen.down) {
      var c = img_ed.canv_coords(e);
      img_ed.pen.draw(c.x, c.y, true);
    }
  });
  
  on('mouseup', this.canvas, function (e) {
    img_ed.pen.down = false;
  });
  
  on('mouseleave', this.canvas, function (e) {
    img_ed.pen.down = false;
  });
}


img_ed.reset = function () {
  console.log('Reset');
  this.ctx = this.canvas.getContext('2d');
  this.ctx._font = this.defaults.font;
  this.ctx.font = this.defaults.font;
  this.ctx.textAlign = this.defaults.textAlign;
  this.ctx.fillStyle = this.defaults.fillStyle;
  this.ctx.strokeStyle = this.defaults.strokeStyle;
  this.ctx.textBaseline = this.defaults.textBaseline;
}


// Runtime Funcs
// =============

// Get position from user and adds the img_src to the canvas.
img_ed.add_shape = function (img_src) {
  img_ed.tooltip('Click somewhere on the image to position shape.');
  img_ed.canvas.classList.add('crosshairs');

  on_once('click', img_ed.canvas, (function (img_src) {
    return function (e) {
      img_ed.canvas.classList.remove('crosshairs');

      // Get coords
      var c = img_ed.canv_coords(e);
      
      // Load the image into the canvas
      var img = new Image();
      on('load', img, (function (img, x, y) {
        return function (e) {
          var ratio = img.height / img.width;
          var width = img_ed.canvas.width / 2;
          var height = width * ratio;
          x = x - (width / 2);
          y = y - (height / 2);
          img_ed.ctx.drawImage(img, x, y, width, height);
        };
      })(img, c.x, c.y));
      img.src = img_src;

    };
  })(img_src));
}


// Sets the canvas to img_src
img_ed.load_img = function (img_src) {
  var img = new Image();
  on('load', img, function (e) {
    img_ed.canvas.width = img.width;
    img_ed.canvas.height = img.height;
    img_ed.ctx.drawImage(img, 0, 0, img.width, img.height);
    img_ed.reset();
  });
  img.src = img_src;
}


// Called from a mousemove event, continues the pen line.
img_ed.pen.draw = function (x, y, down) {
  if (down) {
    img_ed.ctx.lineWidth = this.lineWidth;
    img_ed.ctx.strokeStyle = this.strokeStyle;
    img_ed.ctx.beginPath();
    img_ed.ctx.lineJoin = "round";
    img_ed.ctx.moveTo(this.last_x, this.last_y);
    img_ed.ctx.lineTo(x, y);
    img_ed.ctx.closePath();
    img_ed.ctx.stroke();
  }
  this.last_x = x;
  this.last_y = y;
}


// Displays a tooltip of text.
img_ed.tooltip = function (text) {
  this.tooltip_e.innerHTML = text;
  this.tooltip_e.classList.add('show');
  window.setTimeout(function () {
    img_ed.tooltip_e.classList.remove('show');
    window.setTimeout(function () { // Wait for CSS transition to end
      img_ed.tooltip_e.innerHTML = '';
    }, 200);
  }, this.defaults.tooltip_time);
}


// Takes an mouse event and extracts the coords relative to the canvas.
img_ed.canv_coords = function (e) {
  var rect = this.canvas.getBoundingClientRect();
  var x = (e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
  var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
  return {x: x, y: y};
}


// Font string managment:
// Assume font is in the form: `[style] [size] [family]`

img_ed.set_font = function (value, type) {
  var style = this.get_style();
  var size = this.get_size();
  var family = this.get_family();

  if (type == 'style') {
    style = value;
  } else if (type == 'family') {
    family = value;
  } else if (type == 'size') {
    size = value;
  }

  // _font used because the browser messes with the font property
  //  so we can't be sure what comes out in the getters.
  this.ctx._font = style + ' ' + size + ' ' + family;
  this.ctx.font = this.ctx._font;
}

img_ed.get_style = function () {
  return this.ctx._font.split(' ')[0];
}

img_ed.get_size = function () {
  return this.ctx._font.split(' ')[1];
}

img_ed.get_family = function () {
  return this.ctx._font.split(' ')[2];
}


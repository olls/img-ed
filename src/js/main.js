// Utitlies
function $ (sel) {
  var e = document.querySelectorAll(sel);
  if (e.length == 1) {
    return e[0];
  } else {
    return e;
  }
}

function on (e, obj, cb) {
  return obj.addEventListener(e, cb, false);
}

function on_once (e, obj, cb) {
  return obj.addEventListener(e, (function (cb) {
    return function (e) {
      e.target.removeEventListener(e.type, arguments.callee);
      return cb(e);
    };
  })(cb), false);
}

var img_ed = {};

img_ed.defaults = {
  width: 300,
  height: 150,
  font: '30px sans-serif',
  textAlign: 'center',
  textBaseline: 'middle',
  tooltip_time: 2000,
  samples: [
    'images/coffee.jpg',
    'images/tiger.jpg',
    'images/wood.jpg',
    'images/sticks.jpg'
  ]
};

img_ed.controls = {
  main: {
    settings: {
      name: 'Settings',
      func: function () {
        console.log('Settings');
        img_ed.show (img_ed.settings_modal);
      }
    },
    load: {
      name: 'Load',
      func: function () {
        console.log('Load');
        img_ed.show(img_ed.load_modal);
      }
    },
    save: {
      name: 'Save',
      func: function () {
        console.log('Save');
      }
    },
    text: {
      name: 'Text',
      func: function () {
        console.log('Text');
        img_ed.tooltip('Click somewhere on the image to position text.');
        img_ed.canvas.classList.add('crosshairs');
        on_once('click', img_ed.canvas, function (e) {
          img_ed.canvas.classList.remove('crosshairs');
          
          // Get coords
          var c = img_ed.canv_coords(e);

          img_ed.ctx.fillText(prompt('Text:') || '', c.x, c.y);
        });
      }
    },
    pen: {
      name: 'Pen',
      func: function (e) {
        console.log('Pen');
        var btn = e.target;
        img_ed.tool = 'pen';
        img_ed.canvas.classList.add('crosshairs');
        on('click', document, (function (btn) {
          return function (e) {
            // Stop pen once click on something other than canvas or pen button
            if (e.target != img_ed.canvas && e.target != btn) {
              console.log('Stop pen');
              img_ed.tool = undefined;
              img_ed.canvas.classList.remove('crosshairs');
              document.removeEventListener(e.type, arguments.callee);
            }
          };
        })(btn));
      }
    },
    shape: {
      name: 'Shape',
      func: function () {
        console.log('Shape');
      }
    },
    clear: {
      name: 'Clear',
      func: function () {
        console.log('Clear')
        img_ed.ctx.clearRect(0, 0, img_ed.canvas.width, img_ed.canvas.height);
        img_ed.canvas.width = img_ed.defaults.width;
        img_ed.canvas.height = img_ed.defaults.height;
        img_ed.setup();
      }
    }
  },

  load: {
    browse: {
      name: 'Browse...',
      func: function () {
        console.log('Browse');
      }
    },
    url: {
      name: 'URL:',
      type: 'text',
      func: function (e, btn_elems) {
        console.log('URL');
        img_ed.load_img(btn_elems.text.value);
      }
    },
    exit: {
      name: 'Cancel',
      func: function () {}
    }
  },

  settings: {
    pen_color: {
      name: 'Pen Colour:',
      type: 'text',
      func: function () {
        console.log('Pen colour');
      }
    },
    pen_size: {
      name: 'Pen Size:',
      type: 'number',
      func: function () {
        console.log('Pen size');
      }
    },
    text_size: {
      name: 'Text Size:',
      type: 'number',
      func: function () {
        console.log('Text size');
      }
    },
    text_color: {
      name: 'Text Colour:',
      type: 'color',
      func: function () {
        console.log('Text colour');
      }
    },
    exit: {
      name: 'Exit',
      func: function () {}
    }
  }
};

img_ed.pen = {
  strokeStyle: 'black',
  lineWidth: '1',
  
  last_x: 0,
  last_y: 0,
  down: false
};

img_ed.show = function (modal) {
  img_ed.lock = true;
  $('body').classList.add('lock');
  modal.classList.add('current');
  modal.classList.remove('off');
}

img_ed.hide = function (modal) {
  console.log('Hide')
  img_ed.lock = false;
  $('body').classList.remove('lock');
  modal.classList.remove('current');
  modal.classList.add('off');
}

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

img_ed.add_controls = function (elem, controls) {
  Object.keys(controls).forEach(function (key) {
    var control = controls[key];
    
    // Create Element(s)
    var btn_elems = {};

    btn_elems.cont = document.createElement('div');
    btn_elems.cont.classList.add('cont');

    btn_elems.btn = document.createElement('button');
    btn_elems.btn.innerHTML = control.name;
    btn_elems.cont.appendChild(btn_elems.btn);

    if (control.type) {
      var id = img_ed.unq_id++;
      
      btn_elems.label = document.createElement('label');
      btn_elems.label.innerHTML = control.name;
      btn_elems.label.setAttribute('for', control.type + '_input_' + id);
      btn_elems.cont.appendChild(btn_elems.label);

      btn_elems.text = document.createElement('input');
      btn_elems.text.setAttribute('type', control.type);
      btn_elems.text.setAttribute('id', control.type + '_input_' + id);
      btn_elems.cont.appendChild(btn_elems.text);
      
      // Move button to end
      btn_elems.btn.innerHTML = 'Go';
      btn_elems.cont.appendChild(btn_elems.btn);
    }

    // Add Function
    on('click', btn_elems.btn, (function (control, btn_elems) {
      return function (e) {
        var modal = btn_elems.cont.parentNode.parentNode;
        var isin_modal = modal.classList.contains('modal');
        // Only run if not locked or the buttons modal is specificly unlocked.
        if (!img_ed.lock || (isin_modal && modal.classList.contains('current'))) {
          control.func(e, btn_elems);
          modal.dispatchEvent(img_ed._modal_done);
        }
        e.preventDefault();
        return false;
      };
    })(control, btn_elems));
    
    elem.appendChild(btn_elems.cont);
  });
}

img_ed.add_samples = function () {
  this.defaults.samples.forEach(function (img_name) {
    var img = new Image();
    img.src = img_name;
    img_ed.load_samples_e.appendChild(img);
    on('click', img, (function (img_name) {
      return function (e) {
        img_ed.load_img(img_name);
        img_ed.hide(img_ed.load_modal);
      };
    })(img_name));
  });
}

img_ed.load_img = function (img_s) {
  var t = this;
  var img = new Image();
  on('load', img, function (e) {
    t.canvas.width = img.width;
    t.canvas.height = img.height;
    t.ctx.drawImage(img, 0, 0, img.width, img.height);
    t.setup();
  });
  img.src = img_s;
}

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

img_ed.canv_coords = function (e) {
  var rect = this.canvas.getBoundingClientRect();
  var x = (e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
  var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
  return {x: x, y: y};
}

img_ed.setup = function () {
  this.ctx = this.canvas.getContext('2d');
  this.ctx.font = this.defaults.font;
  this.ctx.textAlign = this.defaults.textAlign;
  this.ctx.textBaseline = this.defaults.textBaseline;
}

img_ed.main = function () {
  this.lock = false;
  this.tool;
  this.unq_id = 0;
  this._modal_done = new CustomEvent('_modal_done');

  this.canvas = $('#img');
  this.edit_controls_e = $('#edit .controls');
  this.load_modal = $('#load');
  this.load_samples_e = $('#load .samples');
  this.load_controls_e = $('#load .controls');
  this.settings_modal = $('#settings');
  this.settings_controls_e = $('#settings .controls');
  this.tooltip_e = $('#tooltip');

  // Test for canvas support
  if (!this.canvas.getContext) {
    return false;
  }

  // Set up canvas
  this.setup();

  // Add control buttons to DOM
  this.add_controls(this.edit_controls_e, this.controls.main);
  this.add_controls(this.load_controls_e, this.controls.load);
  this.add_controls(this.settings_controls_e, this.controls.settings);

  // Add sample image buttons to load modal
  this.add_samples();

  // Add close modal event listener for the load and settings modals
  on('_modal_done', this.load_modal, function () {
    img_ed.hide(img_ed.load_modal);
  });
  on('_modal_done', this.settings_modal, function () {
    img_ed.hide(img_ed.settings_modal);
  });

  // Drawing events
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


img_ed.main();

// CustomEvent Polyfill from [https://developer.mozilla.org/en/docs/Web/API/CustomEvent#Polyfill]
(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   };

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

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
  fillStyle: 'black',
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
  top: true,
  settings: {
    name: 'Settings',
    job: 'modal',
    modal: {
      pen_color: {
        name: 'Pen Colour:',
        job: 'input',
        type: 'color',
        save: function (value) {
          img_ed.pen.strokeStyle = value;
        },
        load: function () {
          return img_ed.pen.strokeStyle;
        }
      },
      pen_size: {
        name: 'Pen Size:',
        job: 'input',
        type: 'number',
        save: function (value) {
          img_ed.pen.lineWidth = value;
        },
        load: function () {
          return img_ed.pen.lineWidth;
        }
      },
      text_size: {
        name: 'Text Size:',
        job: 'input',
        type: 'number',
        save: function (value) {
          img_ed.ctx.font = img_ed.set_font(value + 'px', 'size');
        },
        load: function () {
          return parseInt(img_ed.get_size(), 10);
        }
      },
      text_color: {
        name: 'Text Colour:',
        job: 'input',
        type: 'color',
        save: function (value) {
          img_ed.ctx.fillColor = value;
        },
        load: function () {
          return img_ed.ctx.fillColor;
        }
      }
    }
  },
  load: {
    name: 'Load',
    job: 'modal',
    modal: {
      url: {
        name: 'URL:',
        job: 'input',
        type: 'text',
        save: function (value) {
          img_ed.load_img(value);
        }
      }
    }
  },
  save: {
    name: 'Save',
    job: 'func',
    func: function () {
      console.log('Save');
    }
  },
  text: {
    name: 'Text',
    job: 'func',
    func: function (e) {
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
    job: 'func',
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
    job: 'func',
    func: function (e) {
      console.log('Shape');
    }
  },
  clear: {
    name: 'Clear',
    job: 'func',
    func: function (e) {
      console.log('Clear')
      img_ed.ctx.clearRect(0, 0, img_ed.canvas.width, img_ed.canvas.height);
      img_ed.canvas.width = img_ed.defaults.width;
      img_ed.canvas.height = img_ed.defaults.height;
      img_ed.setup();
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

  // This is just to identify the top layer.
  if (controls.top) {
    var top = true;
  } else {
    var top = false;
  }

  Object.keys(controls).forEach(function (key) {
    if (key == 'top') {
      return;
    }
    var control = controls[key];

    var btn_elems = {};
    btn_elems.cont = document.createElement('div');
    btn_elems.cont.classList.add('cont');

    function add_btn () {
      btn_elems.btn = document.createElement('button');
      btn_elems.btn.innerHTML = control.name;
      btn_elems.cont.appendChild(btn_elems.btn);
    }

    if (control.job == 'func') {
      add_btn();
      on('click', btn_elems.btn, function (top, btn_elems) {
        return function (e) {
          if (!(top && img_ed.lock)) {
            control.func(e, btn_elems);
          }
          e.preventDefault();
          return false;
        };
      }(top, btn_elems));

    } else if (control.job == 'modal') {
      var modal_e = document.getElementById(key);
      add_btn();

      // Open
      on('click', btn_elems.btn, function () {
        if (!img_ed.lock) {
          Object.keys(control.modal).forEach(function (key) {
            var m_control = control.modal[key];
            if (m_control.job == 'input') {
              m_control.elem.value = m_control.load();
            }
          });
          img_ed.show(modal_e);
        }
      });

      // Close
      control.modal.exit = {
        name: 'Exit',
        job: 'func',
        func: (function (modal, modal_e) {
          return function () {
            img_ed.hide(modal_e);
            Object.keys(modal).forEach(function (key) {
              var m_control = modal[key];
              if (m_control.job == 'input') {
                m_control.save(m_control.elem.value);
              }
            });
          };
        })(control.modal, modal_e)
      }
      img_ed.add_controls(modal_e.getElementsByClassName('controls')[0], control.modal);

    } else if (control.job == 'input') {
      var id = img_ed.unq_id++;

      btn_elems.label = document.createElement('label');
      btn_elems.label.innerHTML = control.name;
      btn_elems.label.setAttribute('for', control.type + '_input_' + id);
      btn_elems.cont.appendChild(btn_elems.label);

      btn_elems.input = document.createElement('input');
      btn_elems.input.setAttribute('type', control.type);
      btn_elems.input.setAttribute('id', control.type + '_input_' + id);
      btn_elems.cont.appendChild(btn_elems.input);

      control.elem = btn_elems.input;
    }

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

// Font string managment:
// Assume font is in the form: `[size] [family]`
img_ed.set_font = function (value, type) {
  var size = this.get_size();
  var family = this.get_family();

  if (type == 'size') {
    size = value;
  } else if (type == 'family') {
    family = value;
  }

  this.ctx.font = size + ' ' + family;
}

img_ed.get_size = function () {
  return this.ctx.font.split(' ')[0];
}
img_ed.get_family = function () {
  return this.ctx.font.split(' ')[1];
}

img_ed.setup = function () {
  console.log('Reset');
  this.ctx = this.canvas.getContext('2d');
  this.ctx.font = this.defaults.font;
  this.ctx.textAlign = this.defaults.textAlign;
  this.ctx.textBaseline = this.defaults.textBaseline;
}

img_ed.main = function () {
  this.lock = false;
  this.tool;
  this.unq_id = 0;
  this.modal_open = new CustomEvent('modal_open');
  this.modal_done = new CustomEvent('modal_done');

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
  this.add_controls(this.edit_controls_e, this.controls);

  // Add sample image buttons to load modal
  this.add_samples();

  // Add close modal event listener for the load and settings modals
  on('modal_done', this.load_modal, function () {
    img_ed.hide(img_ed.load_modal);
  });
  on('modal_done', this.settings_modal, function () {
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

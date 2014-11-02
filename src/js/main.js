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
  tooltip_time: 5000,
  samples: [
    'images/coffee.jpg',
    'images/tiger.jpg',
    'images/wood.jpg',
    'images/sticks.jpg'
  ]
};

img_ed.controls = {
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
        var rect = img_ed.canvas.getBoundingClientRect();
        var x = (e.clientX - rect.left) / (rect.right - rect.left) * img_ed.canvas.width;
        var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * img_ed.canvas.height;

        img_ed.ctx.fillText(prompt('Text:') || '', x, y);
      });
    }
  },
  pen: {
    name: 'Pen',
    func: function () {
      console.log('Pen');
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
};

img_ed.load_controls = {
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
    func: function () {
      console.log('Cancel');
      img_ed.hide(img_ed.load_modal);
    }
  }
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
  }, this.defaults.tooltip_time);
}

img_ed.add_controls = function (elem, controls) {
  Object.keys(controls).forEach(function (key) {
    var control = controls[key];
    
    // Create Element(s)
    var elems = {};

    elems.cont = document.createElement('div');
    elems.cont.classList.add('cont');

    elems.btn = document.createElement('button');
    elems.cont.appendChild(elems.btn);

    if (control.type == 'text') {
      elems.text = document.createElement('input');
      elems.text.setAttribute('type', 'text');
      elems.cont.appendChild(elems.text);
    }
    
    // Add Name
    elems.btn.innerHTML = control.name;

    // Add Function
    on('click', elems.btn, (function (control, elems) {
      return function (e) {
        var modal = elems.cont.parentNode.parentNode;
        var isin_modal = modal.classList.contains('modal');
        // Only run if not locked or the buttons modal is specificly unlocked.
        if (!img_ed.lock || (isin_modal && modal.classList.contains('current'))) {
          control.func(e, elems);
          modal.dispatchEvent(img_ed.modal_done);
        }
        e.preventDefault();
        return false;
      };
    })(control, elems));
    
    elem.appendChild(elems.cont);
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

img_ed.setup = function () {
  this.ctx = this.canvas.getContext('2d');
  this.ctx.font = this.defaults.font;
  this.ctx.textAlign = this.defaults.textAlign;
  this.ctx.textBaseline = this.defaults.textBaseline;
}

img_ed.main = function () {
  this.lock = false;
  this.modal_done = new Event('modal_done');

  this.canvas = $('#img');
  this.edit_controls_e = $('#edit .controls');
  this.load_modal = $('#load');
  this.load_samples_e = $('#load .samples');
  this.load_controls_e = $('#load .controls');
  this.tooltip_e = $('#tooltip');

  // Test for canvas support
  if (!this.canvas.getContext) {
    return false;
  }

  // Set up canvas
  this.setup();

  // Add control buttons to DOM
  this.add_controls(this.edit_controls_e, this.controls);
  this.add_controls(this.load_controls_e, this.load_controls);

  // Add sample image buttons to load modal
  this.add_samples();

  // Add close modal event listener for the load modal
  on('modal_done', this.load_modal, function () {
    img_ed.hide(img_ed.load_modal);
  });
}


img_ed.main();

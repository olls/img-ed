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

var img_ed = {};

img_ed.defaults = {
  width: 300,
  height: 150
};

img_ed.controls = {
  load: {
    name: 'Load',
    func: function (e) {
      console.log('Load');
      img_ed.show(img_ed.load_modal);
      on('modal_done', img_ed.load_modal, function () {
        img_ed.hide(img_ed.load_modal);
      });
    }
  },
  save: {
    name: 'Save',
    func: function (e) {
      console.log('Save');
    }
  },
  pen: {
    name: 'Pen',
    func: function (e) {
      console.log('Pen');
    }
  },
  clear: {
    name: 'Clear',
    func: function (e) {
      console.log('Clear')
      img_ed.ctx.clearRect(0, 0, img_ed.canvas.width, img_ed.canvas.height);
      img_ed.canvas.width = img_ed.defaults.width;
      img_ed.canvas.height = img_ed.defaults.height;
    }
  }
};

img_ed.load_controls = {
  browse: {
    name: 'Browse...',
    func: function (e) {
      console.log('Browse');
    }
  },
  url: {
    name: 'URL:',
    type: 'text',
    func: function (e, elems) {
      console.log('URL');
      img_ed.load_img(elems.text.value);
    }
  },
  exit: {
    name: 'Cancel',
    func: function (e) {
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

img_ed.load_img = function (img_s) {
  var t = this;
  var img = new Image();
  on('load', img, function (e) {
    t.canvas.width = img.width;
    t.canvas.height = img.height;
    t.ctx.drawImage(img, 0, 0, img.width, img.height);
  });
  img.src = img_s;
}

img_ed.main = function () {
  this.lock = false;
  this.modal_done = new Event('modal_done');

  this.canvas = $('#img');
  this.edit_controls_e = $('#edit .controls');
  this.load_modal = $('#load');
  this.load_controls_e = $('#load .controls');

  // Test for canvas support
  if (!this.canvas.getContext) {
    return false;
  }
  this.ctx = this.canvas.getContext('2d');

  // Add control buttons to DOM
  this.add_controls(this.edit_controls_e, this.controls);
  this.add_controls(this.load_controls_e, this.load_controls);

}


img_ed.main();

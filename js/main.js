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

img_ed.controls = {
  load: {
    name: 'Load',
    func: function (e) {
      img_ed.load_img('http://localhost/projects/dvbris.com/build/images/logo.png');
      console.log('Load');
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
  }
};

img_ed.add_controls = function (elem) {
  var t = this;
  Object.keys(t.controls).forEach(function (key) {
    var control = t.controls[key];
    
    var btn = document.createElement('button');
    
    btn.innerHTML = control.name;
    on('click', btn, (function (control) {
      return function (e) {
        control.func(e);
        e.preventDefault();
        return false;
      };
    })(control));
    
    elem.appendChild(btn);
  });  
}

img_ed.load_img = function (img_s) {
  var t = this;
  var img = new Image();
  on('load', img, function (e) {
    t.cxt.drawImage(img, 0, 0);
  });
  img.src = img_s;
}

img_ed.main = function () {
  this.canvas = $('#img');
  this.controls_e = $('#controls');

  // Test for canvas support
  if (!this.canvas.getContext) {
    return false;
  }
  this.cxt = this.canvas.getContext('2d');

  // Add control buttons to DOM
  this.add_controls(this.controls_e)

}


img_ed.main();

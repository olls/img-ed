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
  var controls = this.controls;
  Object.keys(controls).forEach(function (key) {
    var control = controls[key];
    
    var btn = document.createElement('button');
    
    btn.innerHTML = control.name;
    btn.addEventListener('click', (function (control) {
      return function (e) {
        control.func(e);
        e.preventDefault();
        return false;
      };
    })(control), false);
    
    elem.appendChild(btn);
  });  
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

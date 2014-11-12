// Modal/Controls Setup
// ====================

var controls = (function () {
  var self = {};

  self.lock = false;

  self.init = function (elem, controls_def) {

    // This is just to identify the top layer.
    if (controls_def.top) {
      var top = true;
    } else {
      var top = false;
    }

    Object.keys(controls_def).forEach(function (key) {
      if (key == 'top') {
        return; // Just a label, not a control.
      }
      var control = controls_def[key];

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
            if (!(top && self.lock)) {
              control.func(e, btn_elems);
            }
            e.preventDefault();
            return false;
          };
        }(top, btn_elems));

      } else if (control.job == 'modal') {

        // Create and add the modal element to the body
        var modal_e = document.createElement('div');
        modal_e.id = key;
        modal_e.classList.add('modal', 'off');
        // Title
        var title_e = document.createElement('h2');
        title_e.innerHTML = control.title;
        modal_e.appendChild(title_e);
        // Extra
        if (control.extra) {
          var extra_e = document.createElement('div');
          extra_e.classList.add(control.extra);
          modal_e.appendChild(extra_e);
        }
        // Controls
        var controls_e = document.createElement('div');
        controls_e.classList.add('controls');
        modal_e.appendChild(controls_e);

        document.body.appendChild(modal_e);

        // On open, load the value for every input
        add_btn();
        on('click', btn_elems.btn, function () {
          if (!self.lock) {
            Object.keys(control.modal).forEach(function (key) {
              var m_control = control.modal[key];
              if (m_control.job == 'input' && m_control.load) {
                m_control.elem.value = m_control.load();
              }
            });
            self.show(modal_e);
          }
        });

        // Add exit button
        control.modal.exit = {
          name: 'Exit',
          job: 'func',
          func: (function (modal, modal_e) {
            // On close, save the value for every input
            return function () {
              self.hide(modal_e);
              // Save all the values defined in the modal
              Object.keys(modal).forEach(function (key) {
                var m_control = modal[key];
                if (m_control.job == 'input') {
                  m_control.save(m_control.elem.value);
                }
              });
            };
          })(control.modal, modal_e)
        }
        
        // Add the inputs to it
        self.init(controls_e, control.modal);

      } else if (control.job == 'input') {
        var id = unq_id++;

        btn_elems.label = document.createElement('label');
        btn_elems.label.innerHTML = control.name;
        btn_elems.label.setAttribute('for', control.type + '_input_' + id);
        btn_elems.cont.appendChild(btn_elems.label);

        if (control.type == 'option') {
          btn_elems.input = document.createElement('select');
          btn_elems.input.setAttribute('id', control.type + '_input_' + id);
          btn_elems.cont.appendChild(btn_elems.input);
          
          control.options.forEach(function (option) {
            var option_e = document.createElement('option');
            option_e.value = option;
            option_e.innerHTML = option;
            btn_elems.input.appendChild(option_e);
          });

        } else {
          btn_elems.input = document.createElement('input');
          btn_elems.input.setAttribute('type', control.type);
          btn_elems.input.setAttribute('id', control.type + '_input_' + id);

          if (control.attrs) {
            Object.keys(control.attrs).forEach(function (attr) {
              btn_elems.input.setAttribute(attr, control.attrs[attr]);
            });
          }

          btn_elems.cont.appendChild(btn_elems.input);
        }

        control.elem = btn_elems.input;
      }

      elem.appendChild(btn_elems.cont);
    });
  }

  self.show = function (modal) {
    self.lock = true;
    $('body').classList.add('lock');
    modal.classList.add('current');
    modal.classList.remove('off');
  }

  self.hide = function (modal) {
    console.log('Hide')
    self.lock = false;
    $('body').classList.remove('lock');
    modal.classList.remove('current');
    modal.classList.add('off');
  }

  return self;
}());

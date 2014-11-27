// Defines the buttons, modals, inputs with
//  their actions and connections.


var control_defs = {
  top: true,
  settings: {
    name: 'Settings',
    job: 'modal',
    title: 'Settings',
    modal: {
      pen_color: {
        name: 'Pen Colour:',
        job: 'input',
        type: 'option',
        options: img_ed.defaults.colors,
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
        attrs: {
          min: 1
        },
        save: function (value) {
          img_ed.pen.lineWidth = value;
        },
        load: function () {
          return img_ed.pen.lineWidth;
        }
      },
      text_style: {
        name: 'Text Style:',
        job: 'input',
        type: 'option',
        options: ['normal', 'bold', 'italic'],
        save: function (value) {
          img_ed.ctx.font = img_ed.set_font(value, 'style');
        },
        load: function () {
          return img_ed.get_style();
        }
      },
      text_size: {
        name: 'Text Size:',
        job: 'input',
        type: 'number',
        attrs: {
          min: 1,
          step: 4
        },
        save: function (value) {
          img_ed.ctx.font = img_ed.set_font(value + 'px', 'size');
        },
        load: function () {
          return parseInt(img_ed.get_size(), 10);
        }
      },
      text_family: {
        name: 'Text Font:',
        job: 'input',
        type: 'option',
        options: img_ed.defaults.fonts,
        save: function (value) {
          img_ed.ctx.font = img_ed.set_font(value, 'family');
        },
        load: function () {
          return img_ed.get_family();
        }
      },
      text_color: {
        name: 'Text Colour:',
        job: 'input',
        type: 'option',
        options: img_ed.defaults.colors,
        save: function (value) {
          img_ed.ctx.fillStyle = value;
        },
        load: function () {
          return img_ed.ctx.fillStyle;
        }
      }
    }
  },
  load: {
    name: 'Load',
    job: 'modal',
    title: 'Load Image',
    extra: 'samples',
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
  border: {
    name: 'Border',
    job: 'modal',
    title: 'Add Border',
    extra: 'borders',
    modal: {}
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
    job: 'modal',
    title: 'Add Shape',
    extra: 'shapes',
    modal: {}
  },
  clear: {
    name: 'Clear',
    job: 'func',
    func: function (e) {
      console.log('Clear')
      img_ed.ctx.clearRect(0, 0, img_ed.canvas.width, img_ed.canvas.height);
      img_ed.canvas.width = img_ed.defaults.width;
      img_ed.canvas.height = img_ed.defaults.height;
      img_ed.reset();
    }
  }
};

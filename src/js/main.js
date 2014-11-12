var img_ed = (function (self) {

  self.main = function () {
    self.tool;
    self.canvas = $('#img');
    self.edit_controls_e = $('#edit .controls');
    self.tooltip_e = $('#tooltip');

    // Test for canvas support
    if (!self.canvas.getContext) {
      return false;
    }

    // Set up canvas
    self.reset();

    // Add control buttons to DOM
    controls.init(self.edit_controls_e, control_defs);

    // Get elements
    self.load_modal = $('#load');
    self.load_samples_e = $('#load .samples');
    self.load_controls_e = $('#load .controls');
    self.shape_modal = $('#shape');
    self.shape_shapes_e = $('#shape .shapes');
    self.settings_modal = $('#settings');
    self.settings_controls_e = $('#settings .controls');

    // Add sample image buttons to load modal and shapes to shapes modal.
    self.add_extras();

    self.add_drawing_evts();
  }


  return self;
}(img_ed));


img_ed.main();

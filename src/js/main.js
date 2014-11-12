img_ed.main = function () {
  this.tool;
  this.canvas = $('#img');
  this.edit_controls_e = $('#edit .controls');
  this.tooltip_e = $('#tooltip');

  // Test for canvas support
  if (!this.canvas.getContext) {
    return false;
  }

  // Set up canvas
  this.reset();

  // Add control buttons to DOM
  controls.init(this.edit_controls_e, control_defs);

  // Get elements
  this.load_modal = $('#load');
  this.load_samples_e = $('#load .samples');
  this.load_controls_e = $('#load .controls');
  this.shape_modal = $('#shape');
  this.shape_shapes_e = $('#shape .shapes');
  this.settings_modal = $('#settings');
  this.settings_controls_e = $('#settings .controls');

  // Add sample image buttons to load modal and shapes to shapes modal.
  this.add_extras();

  this.add_drawing_evts();
}


img_ed.main();

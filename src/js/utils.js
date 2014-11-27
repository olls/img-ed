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

function add_img(ctx, image, x, y, w, h, angle) {
  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.drawImage(image, 0, 0, w, h);

  ctx.restore();
}


var unq_id = 0;

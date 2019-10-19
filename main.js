function pathRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
}

function getContext() {
  const canvas = document.getElementById("canvas");
  let context = null;
  if(canvas.getContext) {
    context = canvas.getContext("2d");
  }

  return context;
}

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class BBox {
  // (x,y) is the normalized coordinate of the top-left corner,
  // while w and h are the normalized width and height, respectively
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(p) {
    return p.x >= this.x && p.x <= (this.x+this.w) &&
           p.y >= this.y && p.y <= (this.y+this.h);
  }
}

class Layer {
  constructor(name, n_nodes) {
    this.name = name;
    this.n_nodes = n_nodes;
    this.bbox = new BBox(0.1, 0.5, 0.05, 0.4); // width, height
    this.fillStyle = "#99F";
    this.strokeStyle = "#111";
    this.lineWidth = 1;
  }

  setHover() {
    this.lineWidth = 2;
  }
  
  clearHover() {
    this.lineWidth = 1;
  }

  draw(ctx) {
    let w = ctx.canvas.clientWidth;
    let h = ctx.canvas.clientHeight;

    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;

    pathRoundedRect(ctx, this.bbox.x * w, this.bbox.y * h, this.bbox.w * w, this.bbox.h * h, 10);
    ctx.fill();
    ctx.stroke();
  }
}

class Model {
  constructor(name, context) {
    this.layers = [];
    this.name = name;
    this.context = context;
    this.hover = -1;
    this.grabbed = false;
    this.grab_offset = new Vec2(0,0);
  }

  appendLayer(name, n_nodes) {
    this.layers.push(new Layer(this.name + ":" + name, n_nodes));
  }

  draw() {
    if(!this.context) {
      return;
    }
 
    this.context.clearRect(0, 0, this.context.canvas.clientWidth, this.context.canvas.clientHeight);
  
    for(var l in this.layers) {
      this.layers[l].draw(this.context);
    }
  }

  setHover(idx) {
    this.hover = idx;
    this.layers[idx].setHover();
  }

  get isHover() {
    return this.hover != -1;
  }

  get hoverID() {
    return this.hover;
  }

  clearHover(idx) {
    this.hover = -1;
    this.layers[idx].clearHover();
  }
  
  grab(p) {
    if(this.hover != -1) {
      this.grabbed = true;
    }
    
    this.grab_offset.x = p.x - this.layers[this.hover].bbox.x;
    this.grab_offset.y = p.y - this.layers[this.hover].bbox.y;
  }
  
  move(p) {
    if(this.hover != -1) {
      this.layers[this.hover].bbox.x = p.x - this.grab_offset.x;
      this.layers[this.hover].bbox.y = p.y - this.grab_offset.y;
    }
  }

  get isGrab() {
    return this.grabbed;
  }

  release() {
    this.grabbed = false;
  }
}

function getNormMouse(elem, e) {
  let rect = elem.getBoundingClientRect();
  let p = new Vec2((e.clientX - rect.left) / elem.clientWidth,
                   (e.clientY - rect.top) / elem.clientHeight);

  return p;
}

function canvasMouseMove(e) {
  let p = getNormMouse(this, e);
  
  if(curr_model.isGrab) {
    console.log("grab move");
    curr_model.move(p);
    curr_model.draw();
    return;
  }

  let hover = false;
  for(l in curr_model.layers) {
    if(curr_model.layers[l].bbox.contains(p)) {
      curr_model.setHover(l);
      hover = true;
      break;
    } else {
      curr_model.clearHover(l);
    }
  }

  if(hover) {
    this.style.cursor = "pointer";
  } else {
    this.style.cursor = "default";
  }

  curr_model.draw();
}

function canvasMouseDown(e) {
  let p = getNormMouse(this, e);

  if(curr_model.isHover) {
    console.log("grab");
    curr_model.grab(p);
  }

  curr_model.draw();
}

function canvasMouseUp(e) {
  curr_model.release();
}

var curr_model;

function Begin() {
  let context = getContext();

  if(context) {
    context.canvas.onmousemove = canvasMouseMove;
    context.canvas.onmousedown = canvasMouseDown;
    context.canvas.onmouseup = canvasMouseUp;
  }

  let model = new Model("Model1", context);
  model.appendLayer("Layer1", 10);
  model.appendLayer("Layer1", 10);
  model.appendLayer("Layer1", 10);
  //model.appendLayer("Layer2", 10);

  curr_model = model;
  model.draw();
}

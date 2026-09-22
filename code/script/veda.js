var dom = (selector) => {
  return document.querySelector(selector);
};
var print = (log) => {
  return console.log(log);
};

const m4 = twgl.m4;
const v3 = twgl.v3;

let gl;
let shader;
let quad;
let time = 0.0;
let code_raw;
let passes = [];
let header_file = "";
let pixelRatio = 1.0;

const uniforms = {
  time: 0.0,
  resolution: [1920, 1080],
  mouse: [0, 0],
  mouse_delta: [0, 0],
  PASSINDEX: 0,
};

// window.onload = () => {
  loadFile("/code/shader/header.glsl", (file) => {
    header_file = file;
    loadFile("/code/shader/fluid.glsl", (file) => {
      code_raw = file;
      // clear_error();
      start();
      requestAnimationFrame(render);
    });
  });
// };

function start() {
  gl = dom("#webgl").getContext("webgl", { preserveDrawingBuffer: true });
  uniforms.bluenoisemap = twgl.createTexture(gl, {
    src: "./content/image/bluenoise.png",
    flipY: true,
  });

  // code_raw = dom("#shader_code").value;
  code_raw = code_raw.replaceAll("&lt;", "<");
  code_raw = code_raw.replaceAll("&gt;", ">");

  const data = gui_get_data(code_raw);

  passes = [];
  if ("PASSES" in data) {
    for (let p = 0; p < data.PASSES.length; ++p) {
      const pass = data.PASSES[p];
      passes.push(get_framebuffer());
      if ("TARGET" in pass) {
        passes[p].TARGET = pass.TARGET;
      }
    }
  }

  quad = twgl.primitives.createXYQuadBufferInfo(gl);
  load_shader(code_raw);

  dom("#webgl").addEventListener('mousemove', (e) => {
    let w = uniforms.resolution[0];
    let h = uniforms.resolution[1];
    let x = e.clientX/w;
    let y = 1.0-e.clientY/h;
    uniforms["mouse_delta"] = [x - uniforms["mouse"][0], y - uniforms["mouse"][1]];
    uniforms["mouse"] = [x, y];
  });
}

function restart() {
  clear_error();
  load_shader(dom("#shader_code").value);
}

function draw() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(shader.program);
  twgl.setBuffersAndAttributes(gl, shader, quad);
  twgl.setUniforms(shader, uniforms);
  twgl.drawBufferInfo(gl, quad);
}

function render(time) {
  if (twgl.resizeCanvasToDisplaySize(gl.canvas, 1.0 / pixelRatio)) {
    passes.forEach((pass) => pass.resize());
  }

  uniforms.time = time / 1000.0;
  uniforms.resolution = [gl.canvas.width, gl.canvas.height];

  if (passes.length > 0) {
    for (let p = 0; p < passes.length; ++p) {
      const pass = passes[p];
      pass.bind();
      uniforms.PASSINDEX = p;
      if ("TARGET" in pass) {
        uniforms[pass.TARGET] = pass.texture();
      }
      draw();
      pass.swap();
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  draw();

  requestAnimationFrame(render);
}

function log_error(error) {
  const lines = error.split("\n");
  let errors = "";
  lines.forEach((line) => {
    if (line.startsWith("ERROR")) errors += line + "\n";
  });
  if (errors == "") return;
  dom("#error").parentNode.style.display = "inherit";
  dom("#error").textContent = errors;
}

function clear_error() {
  dom("#error").textContent = "";
  dom("#error").parentNode.style.display = "none";
}

function load_shader(code_raw) {
  let code = "";
  const lines = code_raw.split("\n");
  for (let l = 0; l < lines.length; ++l) {
    const line = lines[l];
    if (line.startsWith("#include")) code += header_file + "\n";
    else code += line + "\n";
  }
  const tmp = twgl.createProgramInfo(
    gl,
    [
      `attribute vec4 position;
        void main() {
            gl_Position = position;
        }`,
      code,
    ],
    (error) => log_error(error),
  );
  if (tmp != null) {
    shader = tmp;
  }
}

// dom("#shader_code").addEventListener("keyup", (e) => {
//     restart()
// })

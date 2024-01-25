
precision mediump float;

attribute vec4 position;
varying vec2 uv;

void main()
{
  gl_Position = position;
  uv = position.xy*0.5+0.5;
}
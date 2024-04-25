#version 300 es
precision mediump float;

in vec4 position;
out vec2 uv;

void main()
{
  gl_Position = position;
  uv = position.xy*0.5+0.5;
}
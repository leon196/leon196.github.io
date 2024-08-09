#version 300 es
precision mediump float;

in vec4 position;

void main()
{
  gl_Position = position;
}
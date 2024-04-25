#version 300 es
precision mediump float;

uniform float clic, time, tick;
uniform vec2 resolution, mouse;
uniform sampler2D framebuffer, bluenoise;

in vec2 uv;
out vec4 fragColor;

void main()
{
  fragColor = vec4(uv, 0.5, 1);
}
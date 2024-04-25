#version 300 es
precision mediump float;

uniform vec2 resolution, mouse;
uniform float time, fade, clic;
uniform sampler2D image, frame;

in vec2 uv;
out vec4 fragColor;

void main()
{
  fragColor = texture(frame, uv);
}
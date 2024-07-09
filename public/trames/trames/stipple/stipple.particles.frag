#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4

in vec3 position;
out vec2 uv;

uniform float r_lineature;

void main()
{
  uv = position.xy * 0.5 + 0.5;

	gl_Position = vec4(position.xy, 0, 0, 1);
}
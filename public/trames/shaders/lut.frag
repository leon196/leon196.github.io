#version 300 es
precision mediump float;

uniform sampler2D image, lut;

in vec2 uv;
out vec4 outputColor;

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main()
{
  float gray = luminance(texture(image, uv).rgb);
  gray = texture(lut, vec2(gray, 0)).r;
  outputColor = vec4(vec3(gray),1);
}
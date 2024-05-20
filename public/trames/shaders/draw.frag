#version 300 es
precision mediump float;

uniform sampler2D image;

in vec2 uv;
out vec4 outputColor;

void main()
{
    // outputColor = step(0.5, texture(image, uv));
    outputColor = textureLod(image, uv, 4.);
}
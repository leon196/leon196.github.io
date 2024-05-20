#version 300 es
precision mediump float;

uniform sampler2D image;

in vec2 uv;
out vec4 outputColor;

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main()
{
    // float gray = luminance(texture(image, uv).rgb);
    // gray = step(0.5, gray);
    // outputColor = vec4(vec3(gray), 1);
    outputColor = step(0.5, texture(image, uv));
}
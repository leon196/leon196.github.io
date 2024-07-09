#version 300 es
precision mediump float;

uniform sampler2D image;
uniform sampler2D lut;
uniform vec2 resolution;

in vec2 uv;
out vec4 fragColor;

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main()
{
    // lut
    float gray = float(texture(image, uv).r);
    // float gray = float(texture(image, uv).r)/255.;
    gray = texture(lut, vec2(gray, 0)).r;
    fragColor = vec4(vec3(gray), 1.0);
    // fragColor = uint(gray*255.);
}
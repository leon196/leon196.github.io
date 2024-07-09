#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

uniform float time;
uniform highp usampler2D image;

void main()
{
    fragColor = vec4(vec3(texture(image, uv).r)/255., 1.);
}

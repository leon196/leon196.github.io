#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform sampler2D framebuffer, bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Spaceship Generator
// 2024-07-15 Leon Denise

// edited 2024-07-15: added reprojection TAA

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    fragColor = texture(framebuffer, uv);
}
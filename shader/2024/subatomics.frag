#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer, bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Subatomics
// 2024-07-16 Leon Denise

// Revisiting "Taste of Noise 12"
// https://shadertoy.com/view/7sGSW3

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor = texture(framebuffer, fragCoord.xy / iResolution.xy);
}

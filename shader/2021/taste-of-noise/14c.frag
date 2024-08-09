#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D iChannel0, iChannel1, iChannel2, iChannel3;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// taste of noise 14c by leon denise 2021/10/29
// thanks to Inigo Quilez, David Hoskins, NuSan, Fabrice Neyret, Blackle and many others
// licensed under hippie love conspiracy

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // result of Buffer A
    fragColor = texture(iChannel0, fragCoord.xy / iResolution.xy);
}

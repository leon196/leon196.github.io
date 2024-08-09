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

// Curling Smoke by Leon Denise 2023-01-19

// finally learnt how to curl noise

// from Pete Werner article:
// http://petewerner.blogspot.com/2015/02/intro-to-curl-noise.html


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // coordinates
    vec2 uv = fragCoord/iResolution.xy;
    
    // noise
    vec3 blu = texture(iChannel1, fragCoord/1024.).rgb;
    
    // frame
    vec3 color = texture(iChannel0, uv).rgb;
    
    // normal
    vec2 e = vec2(pow(blu.x, 3.)*0.084,0);
    #define T(u) texture(iChannel0, uv+u).r
    vec3 normal = vec3(
        T(e.xy)-T(-e.xy), 
        T(-e.yx)-T(e.yx),
        color.r*.1);
    if (abs(normal.x) + abs(normal.y) + abs(normal.z) > .001)
        normal = normalize(normal);
             
    // shade
    color *= dot(normal, normalize(vec3(0,1,1)))*.5+.5;
    
    fragColor = vec4(color,1.0);
}



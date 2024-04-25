#version 300 es
precision mediump float;

uniform float clic, time, tick;
uniform vec2 resolution, mouse;
uniform sampler2D framebuffer, bluenoise;

in vec2 uv;
out vec4 fragColor;

void main()
{
    // noise
    vec3 blu = texture(bluenoise, gl_FragCoord.xy/1024.).rgb;

    // frame
    vec3 color = texture(framebuffer, uv).rgb;

    // normal
    vec2 e = vec2(pow(blu.x, 3.)*0.084,0);
    #define T(u) texture(framebuffer, uv+u).r
    vec3 normal = vec3(
        T(e.xy)-T(-e.xy), 
        T(-e.yx)-T(e.yx),
        color.r*.1);
    if (abs(normal.x) + abs(normal.y) + abs(normal.z) > .02)
        normal = normalize(normal);
                
    // shade
    color *= dot(normal, normalize(vec3(0,1,1)))*.5+.5;

    fragColor = vec4(color,1.0);
}
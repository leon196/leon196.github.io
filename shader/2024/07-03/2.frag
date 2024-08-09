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



#define R iResolution.xy
#define N(v) normalize(v)
#define T(u) texture(iChannel0, uv+u).r
#define P(u) vec3(uv+u, T(u))

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/R;

    vec3 e = vec3(1./R,0);
    vec3 z = P(0.);
    vec3 x = P(e.xz);
    vec3 y = P(e.zy);
    vec3 normal = N(cross(N(z-x), N(z-y)));
    
    float light = dot(normal, N(vec3(0,1,1)))*.5+.5;
    vec3 color = vec3(1);
    //color = 0.5 + 0.5 * cos(vec3(1,2,3) * 44. + normal.z * 3.);
    color *= pow((light), .4);
    color *= smoothstep(.5,.0,normal.z);
    //color *= z.z;
    
    fragColor = vec4(color, 1.);
    //fragColor = texture(iChannel1, normal);
}
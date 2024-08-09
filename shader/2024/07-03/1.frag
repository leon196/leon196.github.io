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

#define T(u) noise(vec3(p+u,iTime*.01))
#define P(u) vec3(uv+u, T(u))

float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float noise (vec3 p)
{
    float result = 0., a = .5;
    for (float i = 0.; i < 4.; ++i, a/=2.)
    {
    result += gyroid(p/a)*a;
    }
    return result;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec2 p = (2.*fragCoord-R.xy)/R.y;
    vec2 q = vec2(log(length(p))-iTime, atan(p.y,p.x));
    vec2 aspect = vec2(R.x/R.y, 1.);
    
    vec2 range = 100./R;
    vec3 e = vec3(range,0);
    
    float a = 1.;
    for (float i = 0.; i < 5.; ++i)
    {
    vec3 z = P(0.);
    vec3 normal = vec3(cross(N(z-P(e.xz)), N(z-P(e.zy))));
    normal = normalize(normal);
    
    p += vec2(normal.y, -normal.x) * .1 * a;
    a /= .7;
    }
    
    float shape = abs(length(p)-.5)-.1;
    shape = abs(abs(p.y)-.2)-.1;
    float shade = smoothstep(.01,.0,shape);
    
    vec3 color = vec3(1.);
    color *= shade;
    fragColor = vec4(color,1.0);
}
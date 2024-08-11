#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer, bluenoise, iChannel2, iChannel3;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Fork of "blue noise range normal gradient" by leon. https://shadertoy.com/view/mt2GWd
// 2024-04-15 12:16:24


#define R iResolution.xy
#define N(v) normalize(v)
#define T(u) noise(vec3(p+u,iTime*.01))
#define P(u) vec3(uv+u, T(u))
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float noise (vec3 p)
{
    float result = 0., a = .5;
    for (float i = 0.; i < 6.; ++i, a/=2.)
    {
        p.z += result*.5;
        result += abs(atan(gyroid(p/a)))*a;
    }
    //return result;
    return abs(result-.7);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/R.xy;
    vec2 p = (2.*fragCoord-R.xy)/R.y;
    vec2 aspect = vec2(R.x/R.y, 1.);
    vec3 blu = texture(bluenoise, fragCoord/1024.).rgb;
    
    
    vec3 normal = vec3(0);
    for (float i = 0.; i < 4.; ++i)
    {
        vec2 range = (1.+i*10.)*aspect/1000.;
        vec3 e = vec3(range,0);
        normal += vec3(T(0.)-vec3(T(e.xz),T(e.zy), 0.));
    }
    normal.z *= .1;
    normal = normalize(normal);
    /*
    vec3 z = P(0.);
    vec2 range = 20.*aspect/1000.;
    vec3 e = vec3(range,0);
    vec3 normal = vec3(cross(N(z-P(e.xz)), N(z-P(e.zy))));
    normal = normalize(normal);
    */
    
    vec3 dir = normalize(vec3(0,1,0));
    float light = dot(normal, dir);
    
    vec3 color = vec3(1);
    
    color *= max(
                max(step(fragCoord.y, 1.), step(R.y-1.,fragCoord.y)),
                max(step(fragCoord.x, 1.), step(R.x-1.,fragCoord.x)));
    //color *= pow(light*.5+.5, .5);
    
    vec2 move = vec2(normal.y, -normal.x);
    
    //move *= 1.+2.*blu.z;
    move /= R;
    
    vec3 frame = texture(framebuffer, uv+move).rgb;
    
    color = max(color, frame - iTimeDelta/20.);
    
    //color = color + frame;
      
    fragColor = vec4(color,1.0);
}

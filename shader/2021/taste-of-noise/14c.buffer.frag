#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform sampler2D iChannel0, iChannel1, iChannel2, iChannel3;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

// rotation matrix
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

#define repeat(p,r) (mod(p,r)-r/2.)
// taste of noise 14c by leon denise 2021/10/29
// thanks to Inigo Quilez, David Hoskins, NuSan, Fabrice Neyret, Blackle and many others
// licensed under hippie love conspiracy

// global variable
float material;
vec3 rng;
vec2 mouse;

// geometry
float map (vec3 p)
{
    // hold space coordinates
    vec3 pp = p;
    
    // distances
    float scene = 1000.;
    float shape = 1000.;
    
    // parameters
    vec3 angle = vec3(1.+mouse.x,2.+mouse.y,3);
    float range = .2;
    
    // shiny material
    material = -1.;
    
    // amplitude of kifs
    float a = 1.;
    float falloff = 1.55+.05*mouse.y;
    
    // kifs (kaleidoscopic iterated function)
    const float count = 12.;
    for (float index = 0.; index < count; ++index)
    {
        // rotate more and more
        p.xz *= rot(angle.y/a);
        
        // fold and translate
        p = abs(p)-range*a;
        
        // combine to scene
        scene = min(scene, max(p.x, max(p.y, p.z)));
        
        // falloff
        a /= falloff;
    }
    
    // invert volume
    scene = -scene;
    
    // lines
    p = pp;
    p.xz *= rot(mouse.x);
    p.yz *= rot(mouse.y);
    p = repeat(p, .1);
    shape = min(scene, length(p.xz)-.001*rng.x);
    
    // lines material and combine to scene
    material = shape < scene ? 1. : material;
    scene = min(shape, scene);
    
    return scene;
}

vec3 color (vec3 pos, vec3 ray, vec3 normal)
{    
    vec3 color = vec3(0.);
    
    // lines
    if (material > 0.)
    {
        // color palette by Inigo Quilez (https://iquilezles.org/articles/palettes)
        color = .5+.5*cos(vec3(0, .3, .6)*6.+length(pos)*20.+mouse.x);
    }

    return color;
}

// sdf estimator
float raymarch (inout vec3 pos, vec3 ray, float dither, float count)
{
    // shoot rays
    for (float index = count; index > 0.; --index)
    {
        // volume estimation
        float dist = map(pos);
        
        // hit volume
        if (dist < 0.001)
        {
            // return steps ratio
            return index / count;
        }
        
        // dithering
        dist *= 0.9 + .1 * dither;
        
        // ray march
        pos += ray * dist;
    }
    
    // no volume
    return 0.;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // pixel coordinates
    vec2 uv = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
    
    // reset color
    fragColor = vec4(0,0,0,1);
    
    // white noise
    vec3 seed = vec3(gl_FragCoord.xy, iTime);
    rng = hash33(seed);
    
    // mouse interaction
    mouse = 8.*iMouse.xy/iResolution.xy;
    
    vec3 rng3 = hash33(seed+78.);
    
    // camera coordinates
    vec3 eye = vec3(0,-0.1,0.1);
    vec3 at = vec3(0,0,.3);
    vec3 z = normalize(at-eye);
    vec3 x = normalize(cross(z, vec3(0,1,0)));
    vec3 y = cross(x, z);
    vec3 ray = normalize(z + uv.x * x + uv.y * y);
    vec3 pos = eye + ray * .1;
    
    // raymarching
    float shade = raymarch(pos, ray, rng.z, 30.);

    // hit volume
    if (shade > 0.)
    {
        // compute normal by NuSan (https://www.shadertoy.com/view/3sBGzV)
        vec2 off=vec2(0.001,0);
        vec3 normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));

        // coloring
        fragColor.rgb += color(pos, ray, normal) * shade; 
        
        // reflection bounce
        ray = reflect(ray, normal);
        
        // Blackle (https://suricrasia.online/demoscene/functions/)
        rng3 = normalize(tan(rng3*2.-1.));
        
        // jitter blur
        ray = normalize(ray + rng3);
        
        // avoid self collision
        pos += ray * .01;
        
        // shot rays
        shade = raymarch(pos, ray, rng.z, 20.);
        
        // hit neon grid
        if (material > 0. && shade > 0.)
        {
            // coloring
            normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));
            fragColor.rgb += color(pos, ray, normal) * shade;
        }
    }
    
    // temporal buffer
    float fade = 0.001;
    fade += step(0.5, iMouse.z);
    vec4 frame = texture(iChannel0, gl_FragCoord.xy/iResolution.xy);
    fragColor.rgb = max(fragColor.rgb, frame.rgb - fade);
}






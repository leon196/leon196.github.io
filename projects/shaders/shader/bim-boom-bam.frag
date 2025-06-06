#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D bluenoise;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}
// Bim Boom Bam
// adapted from Hell Diving
// https://www.shadertoy.com/view/lcGGzK


float gyroid (vec3 p) { return dot(cos(p),sin(p.yzx)); }

float fbm(vec3 p)
{
    float result = 0.;
    float a = .5;
    for (float i = 0.; i < 8.; ++i)
    {
        p.z += (result)*.1;
        result += abs(gyroid(p/a)*a);
        a /= 1.7;
    }
    return result;
}

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (2.*fragCoord-iResolution.xy)/iResolution.y;
    vec3 blu = texture(bluenoise, fragCoord/1024.).rgb;
    
    vec3 back = vec3(smoothstep(3., -2., length(uv)-blu.y*.02));
    
    uv -= .5;

    // per cell id
    float id = hash12(floor(uv));
    
    // repeat
    uv = fract(uv)-.5;
    uv *= .9;
    
    // animations
    float timeline = iTime/3.+id;
    vec2 anim = vec2(fract(timeline), floor(timeline));
    float growth = pow(anim.x, .2);
    float fade = 1.-pow(anim.x, 9.);
    float scale = anim.x;
    float burn = 1.-pow(anim.x, .4);
    float speed = pow(anim.x, .4);
    
    // coordinates
    vec3 ray = normalize(vec3(uv,.01+scale));
    ray.z += speed + anim.y + id*196.128;
    
    // the spice
    float noise = fbm(ray);
    
    // surface orientation
    #define T(u) fbm(ray+u)
    vec3 e = vec3(.1*blu.x*vec2(iResolution.x/iResolution.y), 0.);
    vec3 normal = normalize(noise-vec3(T(e.xzz),T(e.zyz),1.));
    
    // color palette
    vec3 color = 0.2 + 1. * cos(vec3(1,2,3)*5.5 + normal.y);
    
    // gradient blending and masking
    float smoke = noise-2.*burn;
    float shade = (normal.y*.5+.5);
    color = mix(color, vec3(smoke*shade), smoothstep(.0,.1,smoke));
    
    // shape
    float radius = .3*noise*growth;
    float shape = smoothstep(.05*blu.x,.0,length(uv)-radius);
    
    color = mix(back, color, shape * fade);

    fragColor = vec4(color,1.0);
}
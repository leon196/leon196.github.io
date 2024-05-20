#version 300 es
precision mediump float;

uniform sampler2D framebuffer, image, lut;
uniform vec2 sizeInput, sizeOutput;
uniform float scale, size, edge, time, tick, nearest, farest;

in vec2 uv;
out vec4 fragColor;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

void main()
{
    vec4 map = texture(framebuffer, uv);

    // float shape = step(length(uv-.5+sin(time)*.1)-.01, .0);
    // fragColor = vec4(clamp(map.r - .01 + shape, 0., 1.), 0, 0, 1);
    // return;
    
    // random
    vec2 q = hash22(vec2(tick));
    float gray = texture(image, q).r;
    
    // position
    vec2 p = (uv-q)*vec2(sizeOutput.x/sizeOutput.y,1);
    // p -= (q-.5)*2.*vec2(R.x/R.y,1);
    
    // data
    vec4 d = texture(framebuffer, q);
    // float radius = max(.2*(1.-gray), d.x);
    // float radius = min(d.x, (gray) * .01);
    // float radius = max((1.-gray)*.1, d.x);
    float radius = min(.005, d.x);
    // float radius = d.x;
    // float radius = min(.002+(1.-gray)*.01, d.x);
    
    // distance test
    float dist = length(p)-radius;
    
    // if farer, choose previous result
    if (map.x < dist || radius < nearest || gray > .5)// || gray > .5)//.005)// || radius > gray * .05)
    {
        dist = map.x;
        radius = map.y;//gray * .02;//map.y;
        q = map.zw;
    }
    
    // init and reset
    if (tick < 1.)
    {
        // border distance
        // float edge = min(min(abs(uv.y), abs(1.-uv.y)), min(abs(uv.x), abs(1.-uv.x)));
        float maxRadius = .01;//.2;
        
        // make it special sometimes
        //dist = hash11(t) > .9 ? maxRadius : edge;
        dist = maxRadius;
        
        // init/reset values
        radius = maxRadius;
        q = vec2(-1);
    }
    
    // serve
    fragColor = vec4(dist,radius,q);
}
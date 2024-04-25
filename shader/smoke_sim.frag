#version 300 es
precision mediump float;

uniform float clic, time, tick;
uniform vec2 resolution, mouse;
uniform sampler2D framebuffer, bluenoise;

in vec2 uv;
out vec4 fragColor;

#define R resolution.xy
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float noise (vec3 p)
{
    float result = 0., a = .5;
    float count = 6.;
    for (float i = 0.; i < count; ++i, a/=2.)
    {
        p.z += time*.1;//+result*.5;
        result += abs(gyroid(p/a))*a;
    }
    return result;
}

void main()
{
    vec3 color = vec3(0);
    
    // coordinates
    vec2 p = (2.*gl_FragCoord.xy-R.xy)/R.y;
    vec2 offset = vec2(0);
    
    // curl
    vec2 e = vec2(.01,0);
    vec3 pos = vec3(p, length(p)*.5);
    float x = (noise(pos+e.yxy)-noise(pos-e.yxy))/(2.*e.x);
    float y = (noise(pos+e.xyy)-noise(pos-e.xyy))/(2.*e.x);
    vec2 curl = vec2(x,-y);

    // force fields
    offset += curl;
    offset -= normalize(p) * sin(time*2.-length(p)*6.);

    // displace buffer sampler coordinates
    offset = offset*.002*vec2(R.y/R.x, 1);
    vec3 frame = texture(framebuffer, uv+offset).rgb;
    
    // spawn from edge
    bool spawn = gl_FragCoord.x < 1. || gl_FragCoord.x > R.x - 1.
        || gl_FragCoord.y < 1. || gl_FragCoord.y > R.y - 1.;
    
    // spawn at first frame
    spawn = spawn || tick < 1.;
    
    // color palette
    // https://iquilezles.org/articles/palettes
    if (spawn) color = .5+.5*cos(vec3(1,2,3)*5.5+time+(uv.x+uv.y)*6.);
    
    // buffer
    else color = max(color, frame);
    
    fragColor = vec4(color,1.0);
}
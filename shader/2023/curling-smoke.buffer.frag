#version 300 es

precision mediump float;

out vec4 fragColor;

uniform float iTime, iTimeDelta, iFrame;
uniform vec2 iResolution;
uniform sampler2D framebuffer;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main()
{
    mainImage(fragColor, gl_FragCoord.xy);
}

// Curling Smoke

// finally learnt how to curl noise

// from Pete Werner article:
// http://petewerner.blogspot.com/2015/02/intro-to-curl-noise.html

#define R iResolution.xy
float gyroid (vec3 p) { return dot(sin(p),cos(p.yzx)); }
float noise (vec3 p)
{
    float result = 0., a = .5;
    float count = R.y < 500. ? 6. : 8.;
    for (float i = 0.; i < count; ++i, a/=2.)
    {
        p.z += iTime*.1;//+result*.5;
        result += abs(gyroid(p/a))*a;
    }
    return result;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 color = vec3(0);
    
    // coordinates
    vec2 uv = fragCoord/R.xy;
    vec2 p = (2.*fragCoord-R.xy)/R.y;
    vec2 offset = vec2(0);
    
    // curl
    vec2 e = vec2(.01,0);
    vec3 pos = vec3(p, length(p)*.5);
    float x = (noise(pos+e.yxy)-noise(pos-e.yxy))/(2.*e.x);
    float y = (noise(pos+e.xyy)-noise(pos-e.xyy))/(2.*e.x);
    vec2 curl = vec2(x,-y);

    // force fields
    offset += curl;
    offset -= normalize(p) * sin(iTime*2.-length(p)*6.);

    // displace buffer sampler coordinates
    uv += offset*.002*vec2(R.y/R.x, 1);
    vec3 frame = texture(framebuffer, uv).rgb;
    
    // spawn from edge
    bool spawn = fragCoord.x < 1. || fragCoord.x > R.x - 1.
        || fragCoord.y < 1. || fragCoord.y > R.y - 1.;
    
    // spawn at first frame
    spawn = spawn || iFrame < 1.;
    
    // color palette
    // https://iquilezles.org/articles/palettes
    if (spawn) color = .5+.5*cos(vec3(1,2,3)*5.5+iTime+(uv.x+uv.y)*6.);
    
    // buffer
    else color = max(color, frame);
    
    fragColor = vec4(color,1.0);
}



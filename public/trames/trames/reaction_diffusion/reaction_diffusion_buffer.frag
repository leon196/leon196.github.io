#version 300 es
precision mediump float;

uniform sampler2D image, feedback;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4

in vec2 uv;
out vec4 fragColor;

uniform float tick, size, parameter_f, parameter_k, dynamic_k, min_k, max_k, min_f, max_f;
const float lod = 0.;

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// by polyrhythm
// https://www.shadertoy.com/view/MssyDf
#define TIMESTEP 1.
// #define F 0.0545
// #define K 0.062
// #define Da 1.0
// #define Db 0.5

void getVal2(vec2 p, out vec2 val, out vec2 laplacian) {
    vec2 r = resolution;
    vec2 uv = p / r;
    vec2 n = p + vec2(0.0, 1.0);
    vec2 ne = p + vec2(1.0, 1.0);
    vec2 nw = p + vec2(-1.0, 1.0);
    vec2 e = p + vec2(1.0, 0.0);
    vec2 s = p + vec2(0.0, -1.0);
    vec2 se = p + vec2(1.0, -1.0);
    vec2 sw = p + vec2(-1.0, -1.0);
    vec2 w = p + vec2(-1.0, 0.0);

    val = texture(feedback, uv).xy;
    laplacian = texture(feedback, n / r, lod).xy * 0.2;
    laplacian += texture(feedback, e / r, lod).xy * 0.2;
    laplacian += texture(feedback, s / r, lod).xy * 0.2;
    laplacian += texture(feedback, w / r, lod).xy * 0.2;
    laplacian += texture(feedback, nw / r, lod).xy * 0.05;
    laplacian += texture(feedback, ne / r, lod).xy * 0.05;
    laplacian += texture(feedback, sw / r, lod).xy * 0.05;
    laplacian += texture(feedback, se / r, lod).xy * 0.05;
    laplacian += -1.0 * val;   
}



// mrharicot
// https://www.shadertoy.com/view/XdfGDH

float normpdf(in float x, in float sigma)
{
	return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}

vec3 blur(sampler2D map)
{
	// blur
        
    //declare stuff
    // const int mSize = 1;
    int count = int(size)*2+1;
    int kSize = count/2;
    float kernel[11];
    vec3 final_colour = vec3(0.0);
    
    //create the 1-D kernel
    float sigma = 7.0;
    float Z = 0.0;
    for (int j = 0; j <= kSize; ++j)
    {
        kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);
    }
    
    //get the normalization factor (as the gaussian has been clamped)
    for (int j = 0; j < count; ++j)
    {
        Z += kernel[j];
    }
    
    //read out the texels
    for (int i=-kSize; i <= kSize; ++i)
    {
        for (int j=-kSize; j <= kSize; ++j)
        {
            final_colour += kernel[kSize+j]*kernel[kSize+i]*texture(map, uv+vec2(float(i),float(j)) / resolution).rgb;
        }
    }
    
    return final_colour/(Z*Z);
}

void getVal(vec2 uv, out vec2 val, out vec2 laplacian) {
    val = texture(feedback, uv).xy;
    laplacian = blur(feedback).xy - val;
}

void main()
{
    
    float gray = texture(image, uv).r;

    // gray = floor(gray*5.)/5.;

    vec3 color = vec3(0.0);
    if (tick < 1.) {
        // if (uv.x > 0.45 && uv.x < 0.55 && uv.y > 0.45 && uv.y < 0.55)
        // {
        //     color = vec3(1.);
        // }
        float a = 1.;//-gray;
        float rng = hash22(floor(gl_FragCoord.xy)).r;
        float b = step(.9, rng);
        // if (dynamic_k < 0.5) {
        //     b *= 1.-gray;// smoothstep(.01,0.,length(uv-.5)-.1);
        // }
        color = vec3(a,b,0);
        // color = vec3(smoothstep(.5,0.,length(uv-.5)-.1));
        // color = vec3();
    } else {
     	vec2 val, laplacian;
        // getVal(gl_FragCoord.xy, val, laplacian);
        getVal(uv, val, laplacian);

        // val *= 1.-.001*step(0.5,gray);
        
        vec2 delta;
        // float F = .0367;//.055;//mix(0.04, 0.06, gray);
        // float K = .0649;//.062;//mix(.05, 0.07, gray);
        float F = mix(min_f, max_f, 1.-gray);
        float K = mix(min_k, max_k, gray);//mix(parameter_k, gray, dynamic_k));
        // F = .06264;
        // K = .061;
        // float K = .06;
        float Da = 1.;// - 0.5 * gray;
        float Db = 0.2;// - 0.1 * gray;
        // val.x = min(val.x, 1.);
        // val.y = max(val.y, 0.);
        // val.xy = clamp(val.xy, 0., 1.);
 		delta.x = Da * laplacian.x - val.x * val.y * val.y + F * (1.0 - val.x);
  		delta.y = Db * laplacian.y + val.x * val.y * val.y - (K + F) * val.y;
        
        color = vec3(clamp(val + delta , 0., 1.), 0.0);
    }
    
    fragColor = vec4(color, 1);
}
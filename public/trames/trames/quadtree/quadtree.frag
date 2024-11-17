#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4

in vec2 uv;
out vec4 fragColor;

uniform float r_lineature;

uniform float iterations, threshold_fixed, threshold_progressive;

// ciphered
// https://www.shadertoy.com/view/wslcWf


// the number of divisions at the start
#define MIN_DIVISIONS 2.0

// the numer of possible quad divisions
#define MAX_ITERATIONS 8

// the number of samples picked fter each quad division
#define SAMPLES_PER_ITERATION 30
#define F_SAMPLES_PER_ITERATION 30.

// useless, kept it for reference for a personal usage 
#define MAX_SAMPLES 200

// threshold min, max given the mouse.x
#define THRESHOLD_MIN 0.0001
#define THRESHOLD_MAX 0.01


// taken from http://glslsandbox.com/e#41197.0
vec2 hash22(vec2 p) { 
    float n = sin(dot(p, vec2(41, 289)));
    return fract(vec2(262144, 32768)*n);    
}

vec4 quadColorVariation (in vec2 center, in float size) {
    // this array will store the grayscale of the samples
    vec3 samplesBuffer[SAMPLES_PER_ITERATION];
    
    // the average of the color components
    vec3 avg = vec3(0);
    
    // we sample the current space by picking pseudo random samples in it 
    for (int i = 0; i < SAMPLES_PER_ITERATION; i++) {
        float fi = float(i);
        // pick a random 2d point using the center of the active quad as input
        // this ensures that for every point belonging to the active quad, we pick the same samples
        vec2 r = hash22(center.xy + vec2(fi, 0.0)) - 0.5;
        vec3 sp = texture(image, center + r * size).rgb;
        avg+= sp;
        samplesBuffer[i] = sp;
    }
    
    avg/= F_SAMPLES_PER_ITERATION;
    
    // estimate the color variation on the active quad by computing the variance
    vec3 var = vec3(0);
    for (int i = 0; i < SAMPLES_PER_ITERATION; i++) {
    	var+= pow(samplesBuffer[i], vec3(2.0));
    }
    var/= F_SAMPLES_PER_ITERATION;
    var-= pow(avg, vec3(2.0));
        
    return vec4(avg, (var.x+var.y+var.z)/3.0);
    // return vec4(avg.x);
}

void main()
{
  vec2 aspect = vec2(format.x/format.y,1);

  vec2 dim = aspect*r_lineature*format.y/inch_to_mm;


  // number of space divisions
  float divs = MIN_DIVISIONS;

  // the center of the active quad - we initialze with 2 divisions
  vec2 quadCenter = (floor(uv * divs) + 0.5) / divs;
  float quadSize = 1. / divs; // the length of a side of the active quad
  
  // we store average and variance here
  vec4 quadInfos = vec4(0);
  
  for (float i = .0; i < iterations; i++) {
  float threshold = threshold_fixed - threshold_progressive*(i/iterations);
    quadInfos = quadColorVariation(quadCenter, quadSize);
      
    // if the variance is lower than the threshold, current quad is outputted
      if (quadInfos.x > threshold) break;
      
      // otherwise, we divide the space again
      divs*= 2.0;
      quadCenter = (floor(uv * divs) + 0.5) / divs;
      quadSize/= 2.0;
  }
  
  
  // the coordinates of the quad
  vec2 nUv = fract(uv * divs);
  
  // we create lines from the uv coordinates
  vec2 lWidth = vec2(1.5/resolution.x, 1.5/resolution.y);
  vec2 uvAbs = abs(nUv-0.5);
  float s = step(0.5-uvAbs.x, lWidth.x*divs) + step(0.5-uvAbs.y, lWidth.y*divs);
  s = 1.-s;

	fragColor = vec4(vec3(s),1.);
}
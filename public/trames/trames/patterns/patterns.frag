#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4
in vec2 uv;
out vec4 fragColor;

uniform float r_lineature, r_angle, r_pattern, hexagonal, stretch, mode, variation_position, variation_rotation;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}

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
  // transformed coordinates
  vec2 aspect = vec2(format.x/format.y,1);
  vec2 p = (uv-.5)*aspect*rot(r_angle)*r_lineature*format.y/inch_to_mm;
  // p.x *= (1.+stretch);
  if (mode > 0.5) p = (p-.5);
  if (hexagonal > 0.5) p.x += floor(mod(p.y,2.))/2.;

  // image coordinates
  vec2 q = p;
  vec2 grid = ceil(q);
  if (mode > 0.5) q = grid;
  // q = q/vec2((1.+stretch),1.)*inch_to_mm*rot(-r_angle)/aspect/r_lineature/format.y+.5;
  q = q*inch_to_mm*rot(-r_angle)/aspect/r_lineature/format.y+.5;

  // image sample
	float gray = texture(image, q).r/2.;
  
  // grid
  vec2 cell = fract(p)-.5;
  cell += (hash22(grid)-.5)*(.5-gray)*variation_position*2.;
  cell *= rot(hash22(grid+196.).x*variation_rotation);
  cell.x *= 1.-stretch;

  float trame = 0.;

  // shapes
  if (r_pattern == 0.) trame = length(cell)-gray; // circle
  else if (r_pattern == 1.) trame = max(abs(cell.x), abs(cell.y))-gray; // square
  // else if (r_pattern == 2.) trame = abs(cell.x)-gray; // line

  fragColor = vec4(step(trame, 0.));
}
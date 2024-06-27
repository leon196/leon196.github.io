
uniform sampler2D image;
uniform vec2 resolution, format;
#define R resolution
#define inch_to_mm 25.4
in vec2 vUv;

uniform float r_lineature, r_angle, r_pattern;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}


float trame_grid_circle1 (float gray, vec2 p)
{
  vec2 cell = fract(p*r_lineature);
  return length(fract(cell)-.5) - (1.-gray);
}

float trame_grid_square1 (float gray, vec2 p)
{
  vec2 cell = fract(p*r_lineature);
  vec2 pos = fract(cell)-.5;
  pos = abs(pos);
  float dist = max(pos.x, pos.y);
  return dist-(1.-gray)*.5;
}

float trame_grid_square2 (float gray, vec2 p)
{
  float size = 1.-gray;
  vec2 cell = fract(p*r_lineature);
  vec2 pos = fract(cell)-.5;
  pos = abs(pos);
  float dist = max(pos.x, pos.y);
  return dist-size*.5;
}

float trame_grid_column (float gray, vec2 p)
{
  float size = 1.-gray;
  vec2 cell = fract(p*r_lineature);
  vec2 pos = fract(cell)-.5;
  pos = abs(pos);
  float dist = pos.x;
  return dist-size*.5;
}

void main()
{
	// vec2 p = vUv*format/inch_to_mm;
	float gray = texture(image, vUv).r;
  vec2 aspect = vec2(format.x/format.y,1);
  vec2 p = (vUv-.5)*aspect*rot(r_angle)*format.y/inch_to_mm;


	float trame = 0.5;
  if (r_pattern == 0.) trame = trame_grid_circle1(gray, p);
  else if (r_pattern == 1.) {
    trame = trame_grid_square1(gray, p);
    // trame -= trame_grid_square1(gray, p);
  }
  else if (r_pattern == 2.) trame = trame_grid_square2(gray, p);
  else if (r_pattern == 3.) trame = trame_grid_column(gray, p);
  else if (r_pattern == 4.) trame = trame_grid_column(gray, p);

	gl_FragColor = vec4(vec3(step(0., trame)), 1);
}
#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 sizeOutput;
uniform float r_lineature, r_angle, r_pattern;

in vec2 uv;
out vec4 fragColor;

#define R sizeOutput

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}


float trame_grid_circle1 (vec2 uv, float grid)
{

  vec2 p = (uv-.5) * rot(r_angle) + 0.5;
  vec2 lod = vec2(R.x/R.y,1)*grid;
  vec2 cell = fract(p*lod);
  uv = floor(uv*lod)/lod;

  vec3 color = texture(image, uv).rgb;

  float size = 1.-luminance(color);
  float dist = length(fract(cell)-.5);
  float shape = smoothstep(.0,.01,dist-size);
  float shade = shape;

  return shade;
}

float trame_grid_circle2 (vec2 uv, float grid)
{
  vec2 lod = vec2(R.x/R.y,1)*grid;
  vec2 p = uv-.5;
  p = (p) * rot(r_angle) + 0.5;
  p.y += mod(floor(p.x*lod.x), 2.)/2./lod.x;
  vec2 cell = fract(p*lod);
  uv = floor(uv*lod)/lod;

  vec3 color = texture(image, uv).rgb;

  float size = 1.-luminance(color);
  float dist = length(fract(cell)-.5);
  float shape = smoothstep(.0,.01,dist-size);
  float shade = shape;

  return shade;
}

float trame_grid_square1 (vec2 uv, float grid)
{
  vec2 lod = vec2(R.x/R.y,1)*grid;
  vec2 p = (uv-.5) * rot(r_angle) + 0.5;
  vec2 cell = fract(p*lod);
  uv = floor(uv*lod)/lod;

  vec3 color = texture(image, uv).rgb;

  float size = 1.-luminance(color);
  vec2 pos = fract(cell)-.5;
  pos = abs(pos);
  float dist = max(pos.x, pos.y);
  float shape = smoothstep(.0,.01,dist-size*.5);
  float shade = shape;

  return shade;
}

float trame_grid_square2 (vec2 uv, float grid)
{
  vec2 lod = vec2(R.x/R.y,1)*grid;
  vec2 p = (uv-.5) * rot(r_angle) + 0.5;
  vec2 cell = fract(p*lod);
  uv = floor(uv*lod)/lod;

  vec3 color = texture(image, uv).rgb;

  float size = 1.-luminance(color);
  vec2 pos = fract(cell)-.5;
  pos = abs(pos);
  float dist = max(pos.x, pos.y);
  float shape = smoothstep(.0,.01,dist-size*.5);
  float shade = shape;

  return shade;
}

float trame_grid_column (vec2 uv, float grid)
{
  vec2 lod = vec2(R.x/R.y,1)*grid;
  vec2 p = (uv-.5) * rot(r_angle) + 0.5;
  vec2 cell = fract(p*lod);
  uv = floor(uv*lod)/lod;

  vec3 color = texture(image, uv).rgb;

  float size = (color.r+color.b+color.g)/3.;
  vec2 pos = fract(cell)-.5;
  pos = abs(pos);
  float dist = pos.x;
  float shape = smoothstep(.01,0.,dist-size*.5);
  float shade = shape;

  return shade;
}

void main()
{
	vec3 color = texture(image, uv).rgb;
	// float gray = luminance(color);

	// pattern
	// vec2 p = uv*vec2(sizeOutput.x/sizeOutput.y,1.);
	// float cos1 = 0.25 * cos((p.x * sin(r_angle) + p.y * cos(r_angle)) * r_lineature);
	// float cos2 = 0.25 * cos((p.x * cos(r_angle) - p.y * sin(r_angle)) * r_lineature);
	// float trame = cos1 * (1.-max(0., shape)) + cos2 * (1.-max(0., -shape));

	float trame = 0.5;
  if (r_pattern == 0.)      trame = trame_grid_circle1(uv, r_lineature);
  else if (r_pattern == 1.) trame = trame_grid_circle2(uv, r_lineature);
  else if (r_pattern == 2.) {
    trame = trame_grid_square1(uv, r_lineature);
    trame *= trame_grid_square1(uv+0.5/r_lineature, r_lineature);
  }
  else if (r_pattern == 3.) trame = trame_grid_square2(uv, r_lineature);
  else if (r_pattern == 4.) trame = trame_grid_column(uv, r_lineature);
  else if (r_pattern == 5.) trame = trame_grid_column(uv, r_lineature);
	trame = step(0.5, trame);
	color = vec3(trame);
	// color = vec3(smoothstep(0.0, 0.02, gray+trame-0.5));
	// color = vec3(step(0.5, gray+trame));

	fragColor = vec4(color, 1);
}
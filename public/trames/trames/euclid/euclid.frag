#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution, format;
uniform float rows, columns;
#define R resolution
#define inch_to_mm 25.4

in vec2 uv;
out vec4 fragColor;

uniform float r_lineature, r_angle, shape, elipse_angle;

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}

void main()
{
	float gray = texture(image, uv).r;
	vec2 p = uv*format/inch_to_mm;

	// pattern
	float cos1 = 0.25 * cos((p.x * sin(r_angle) + p.y * cos(r_angle)) * r_lineature);
	float cos2 = 0.25 * cos((p.x * cos(r_angle) - p.y * sin(r_angle)) * r_lineature);

	vec2 elipse = vec2(1.-max(0., shape), 1.-max(0., -shape));
	float trame = cos1 * elipse.x + cos2 * elipse.y;

	// vec3 color = vec3(step(0.5, gray+trame));
	fragColor = vec4(step(0.5, gray+trame));
}
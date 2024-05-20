#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 sizeOutput;
uniform float r_lineature, r_angle, shape;

in vec2 uv;
out vec4 fragColor;

float luminance(vec3 color)
{
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

mat2 rot (float a)
{
	float c=cos(a), s=sin(a);
	return mat2(c,-s,s,c);
}

void main()
{
	vec3 color = texture(image, uv).rgb;
	float gray = luminance(color);

	// pattern
	vec2 p = uv*vec2(sizeOutput.x/sizeOutput.y,1.);
	float cos1 = 0.25 * cos((p.x * sin(r_angle) + p.y * cos(r_angle)) * r_lineature);
	float cos2 = 0.25 * cos((p.x * cos(r_angle) - p.y * sin(r_angle)) * r_lineature);
	float trame = cos1 * (1.-max(0., shape)) + cos2 * (1.-max(0., -shape));

	color = vec3(smoothstep(0.0, 0.02, gray+trame-0.5));
	// color = vec3(step(0.5, gray+trame));

	fragColor = vec4(color, 1);
}
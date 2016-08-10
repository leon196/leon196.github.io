
attribute vec3 a_position;
attribute vec2 a_texcoord;

uniform sampler2D u_video;
uniform sampler2D u_opticalFlow;
uniform vec2 u_resolution;
uniform vec2 u_size;
uniform mat4 u_view;
uniform float u_time;
uniform float u_splashRatio;

varying vec4 v_color;
varying vec2 v_texcoord;

void main ()
{
	vec2 uv = a_position.xy * 0.5 + 0.5;
	vec4 videoColor = texture2D(u_video, uv);
	vec4 motionColor = texture2D(u_opticalFlow, uv);
	float lum = (videoColor.r + videoColor.g + videoColor.b) / 3.0;

	// float angle = rgb2hsv(videoColor.rgb).r * 3.1416 * 2.;
	// vec2 direction = vec2(cos(angle), sin(angle));
	vec2 direction = normalize(motionColor.xy);

	vec2 coord = a_texcoord;
	coord.x = coord.x * 2. - 1.;
	vec2 size = u_size * (length(motionColor.xy) * 0.25 + lum);

	vec4 position = vec4(a_position.xy, 0, 1);
	float aspect = u_resolution.y / u_resolution.x;

	vec2 fragcoord = vec4(u_view * position).xy;
	vec4 displacement = vec4(normalize(fragcoord), 0, 0);
	displacement.xy += direction;
	fragcoord.x /= aspect;
	float ratio = u_splashRatio * step(length(fragcoord) * 0.5, u_splashRatio);
	displacement *= ratio;
	size *= 1. - smoothstep(0.75, 1., u_splashRatio);
	// size *= (1. + ratio * 2.) * (1. - smoothstep(0.75, 1., u_splashRatio));

	vec4 up = vec4(direction * coord.y * size.y, 0, 0);
	vec4 right = vec4(vec2(direction.y, -direction.x) * coord.x * size.x, 0, 0);
	vec4 forward = vec4(0, 0, -lum, 0);

	up.x *= aspect;
	right.x *= aspect;
	displacement.x *= aspect;

	v_color = videoColor;
	v_texcoord = a_texcoord;

	gl_Position = vec4(u_view * position) + up + right + displacement;
}

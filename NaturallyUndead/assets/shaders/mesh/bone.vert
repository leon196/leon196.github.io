attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_anchor;
attribute vec4 a_color;
uniform mat4 u_view;
uniform vec3 u_cameraDirection;
uniform float u_time;
uniform float u_fadeValue;
uniform float u_shineValue;
varying vec4 v_color;

void main ()
{
	vec3 position = a_position;
	vec4 color = a_color;
	color.rgb *= dot(a_normal, -normalize(u_cameraDirection)) * 0.5 + 0.5;

	//// FADE ////

	float offset = atan(a_normal.z, a_normal.x) + a_normal.y;

	// shrink
	position.xyz = mix(position.xyz, a_anchor, clamp(u_fadeValue + u_fadeValue * abs(offset), 0., 1.));
	
	// rotate
	position.xyz = a_anchor + rotateY(rotateX(position.xyz - a_anchor, u_fadeValue * 2.), u_fadeValue * 3.);
	
	// displace
	vec3 fadeDisplacement = normalize(vec3(a_normal.x, -3., a_normal.z));
	fadeDisplacement *= offset * luminance(color.rgb);
	position.xyz += fadeDisplacement * u_fadeValue;

	// colorize
	color.rgb *= 1.0 - smoothstep(0.8, 1.0, u_fadeValue);
	v_color = color;

	//// SHINE ////

	// offset = noiseIQ(a_anchor) + u_time * 0.2;// + length(a_position) * 0.4;
	float noisy = noiseIQ(a_normal);
	// noisy = smoothstep(0.75, 1., noisy);
	offset = noisy * 0.5 + u_time * 0.2 + length(a_position) * 0.5;
	offset = mod(abs(offset), 1.);

	// shrink
	position.xyz = mix(position.xyz, a_anchor, u_shineValue * range(0.25, 0.5, 0.75, 1., offset));
	// position.xyz = mix(position.xyz, a_anchor, u_shineValue * (1. - sin(offset * 3.1416)));

	// displace
	vec3 shineDisplacement = a_normal;
	shineDisplacement *= range(0.25, 0.5, .75, .9, offset) * noiseIQ(a_normal) * luminance(color.rgb);
	position.xyz += 3.0 * shineDisplacement * u_shineValue;

	///////////////

	// project
  gl_Position = u_view * vec4(position, 1);
}

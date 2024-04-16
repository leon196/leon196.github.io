#version 300 es
precision mediump float;


uniform vec4 viewport;
uniform vec2 resolution;
uniform bool hasPanzoom;

in vec3 position;
out vec2 uv, view;

void main()
{
	uv = position.xy*0.5+0.5;

	vec4 v = viewport / resolution.xyxy;

	if (hasPanzoom)
	{
		view = (uv - v.xy) / v.zw - 0.5;
	}
	else
	{
		view = (uv - 0.5) * vec2(resolution.x/resolution.y, 1);
	}

	gl_Position = vec4(position, 1);
}
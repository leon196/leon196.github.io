#version 300 es
precision mediump float;

uniform highp usampler2D image;
uniform uvec2 sizeInput;

in vec2 uv;
out vec4 fragColor;

void main()
{
	uint packed_width = (sizeInput.x + 15u) & ~15u;
	uvec4 data = texture(image, uv);
	int bit = int(uv.x * float(packed_width)) % 8;
	float p = float((data.r >> bit) & 1u);
	fragColor = vec4(p, p, p, 1.0);
}
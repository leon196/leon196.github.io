
precision mediump float;

uniform vec2 resolution;
uniform sampler2D media;

void main()
{
  vec2 uv = gl_FragCoord.xy / vec2(1920, 1080);
  vec4 color = texture2D(media, uv);
  color.a = 1.;
  gl_FragColor = color;
}
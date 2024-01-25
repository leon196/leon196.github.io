
precision mediump float;

uniform vec2 resolution, mouse;
uniform float time, fade, clic;
uniform sampler2D frame, media;
varying vec2 uv;

void main()
{
  // vec2 uv = gl_FragCoord.xy / resolution;

  vec2 p = uv-mouse;
  // p.x *= resolution.x/resolution.y;
  float aspect = 16./9.;
  // if (resolution.x / resolution.y > 16./9.) aspect = 9./16.;
  p.x *= aspect;
  float dist = length(p);
  float shape = smoothstep(.001, .0, dist - .05);

  vec4 color = texture2D(frame, uv);
  if (clic < 0.5)
  {
    color = mix(color, texture2D(media, uv), shape);
  }
  color.rgb *= fade;
  color.a = 1.;
  gl_FragColor = color;
}
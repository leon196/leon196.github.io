
precision mediump float;

uniform vec2 resolution, mouse, snappos;
uniform float time, tick, clic, lombric;
uniform sampler2D frame, media, snapshot;
varying vec2 uv;

void main()
{
  // vec2 uv = gl_FragCoord.xy / vec2(1920.,1080.);

  vec4 video = texture2D(media, uv);
  vec4 color = texture2D(frame, uv);

  vec2 p = uv-mouse;
  p.x *= 16./9.;
  float dist = length(p);
  // vec2 b = abs(uv-mouse);
  // dist = max(b.x, b.y);
  float shape = smoothstep(.01, .0, dist - .05);
  if (clic > 0.5 && shape > 0.5) {
    color.a = min(color.a + shape, 1.);
    // color.rgb = video.rgb;
    // uv = gl_FragCoord.xy/resolution;
    if (lombric > 0.5)
    {
      color.rgb = texture2D(snapshot, uv+snappos-mouse).rgb;
    }
    else
    {
      color.rgb = texture2D(media, uv).rgb;
    }
  }

  color.rgb = mix(video.rgb, color.rgb, color.a);

  gl_FragColor = color;
}

precision mediump float;

#define PI 3.141592653589
#define PI2 6.283185307179
#define RADTier 2.094395102
#define RAD2Tier 4.188790205

varying vec2 vTexCoord;

uniform sampler2D picture;
uniform sampler2D video;
uniform sampler2D fbo;

uniform vec2 bufferSize;
uniform vec2 screenSize;
uniform vec2 mouse;

uniform float time;
uniform float isInteractive;
uniform float isAutomatic;

uniform float sliderTreshold;
uniform float sliderRGBOffset;

uniform float filter5x5[25];
uniform float filter9x9[81];

// Utils
#pragma glslify: random = require(glsl-random)
#pragma glslify: oscillation = require(../utils/oscillation.glsl)

// UVs
#pragma glslify: videoUV = require(../utils/videoUV.glsl)
#pragma glslify: wrapUV = require(../utils/wrapUV.glsl)
#pragma glslify: pixelize = require(../utils/pixelize.glsl)

// Color
#pragma glslify: luminance = require(glsl-luma)
#pragma glslify: posterize = require(../utils/pixelize.glsl)
#pragma glslify: rgbOffset = require(../utils/rgbOffset.glsl)
#pragma glslify: fadeOut = require(../utils/fadeOut.glsl)
#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

#pragma glslify: forceFromLight = require(../utils/forceFromLight.glsl)
#pragma glslify: updateBufferWithColorDifference = require(../utils/updateBufferWithColorDifference.glsl)

void main() 
{
  vec2 uv = videoUV(vTexCoord);

  vec2 force = forceFromLight(video, pixelize(uv, 32.0), bufferSize);
  vec2 uvDisplaced = wrapUV(vTexCoord - normalize(force) * 0.002);

  vec4 colorFbo = texture2D(fbo, uvDisplaced);

  float angle = time * 10.0;
  float radius = mix(0.01 * sliderRGBOffset, 0.005 * oscillation(time, 2.0), isAutomatic);

  vec4 colorVideo = rgbOffset(video, uv, angle, radius);

  float treshold = mix(sliderTreshold, 0.3 + 0.2 * oscillation(time, 1.0), isAutomatic);

	gl_FragColor = updateBufferWithColorDifference(colorFbo, colorVideo, treshold);
}

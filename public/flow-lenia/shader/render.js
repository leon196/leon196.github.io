class RenderShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;

				uniform sampler2D leniaTex1;
				uniform sampler2D leniaTex2;
				uniform sampler2D dnaTex;
				uniform sampler2D gradientTex;
				uniform sampler2D imageTex;
				uniform vec2 imgSize;
				uniform vec2 canvasSize;
				uniform vec2 camPos;
				uniform vec4 dnaSelect;
				uniform float camZoom;
				uniform float colorDNA;
				uniform float colorVariation;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.GAMMA}
				${SHADER_FUNCS.HASH}
				
				vec3 rgb2hsv(vec3 c){
					vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
					vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
					vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	
					float d = q.x - min(q.w, q.y);
					float e = 1.0e-10;
					return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
				}
	
				vec3 hsv2rgb(vec3 c){
					vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
					vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
					return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					pos2=vec2(pos2.x,1.-pos2.y);
					vec2 ratio=canvasSize/imgSize;
					// pos2=(pos2)*vec2(
					// 	min(ratio.x/ratio.y,1.),
					// 	min(ratio.y/ratio.x,1.)
					// )/camZoom-camPos;
					vec4 lenia1 = texture(leniaTex1,pos2);
					vec4 lenia2 = texture(leniaTex2,pos2);
					vec4 dna = texture(dnaTex,pos2);
					vec4 gradient = texture(gradientTex,pos2);
					vec4 image = texture(imageTex,vec2(pos2.x,1.-pos2.y));
					// outColor=vec4(lenia.x,image.x,0.,1.);
					
					float x = dna.x/1000.;
					x = abs(fract(x)-.5)*2.;

					// outColor=vec4(
					// 	gammaCorrect(vec3(lenia.x)),
					// 	// *((gradient.x+1.)/4.+(gradient.y+1.)/4.),
					// 	1.
					// );

					// float g = smoothstep(.0,.5,lenia.x);
					// outColor = vec4(vec3(lenia.x),1);
					vec3 palette = hash44(dna).rgb;
					vec3 tint = all(equal(dna, dnaSelect)) ? palette : vec3(1);
					tint = mix(tint, palette, colorDNA);

					palette = 0.5 + 0.5 * cos(vec3(1,2,3)*5.+1.+hash44(dna).r);
					tint = mix(tint, palette, colorVariation);
					// vec3 shade = gammaCorrect(vec3(lenia1.x));
					vec3 shade = vec3(atan(lenia1.x));
					outColor = vec4(shade*tint,1.);
					// outColor = vec4(velo.xyz*100.,1);
					// outColor = vec4(gammaCorrect(vec3(lenia1.x,0,0)+vec3(0,0,lenia2.x)),1.);

					// outColor=image;

					// outColor=vec4(gradient.x,gradient.y,0.,1.);
					// outColor=vec4(gammaCorrect(vec3(col1.x*2.,col1.x*.1,col1.x*.002)),1);
					// outColor=vec4(gammaCorrect(vec3(col1.x*1.)),1);
					
					if(pos2.x<0.||pos2.x>1.||pos2.y<0.||pos2.y>1.){
						outColor*=.25;
					}
				}
			`,
		);
	}
	run(cam,imgSize,canvasSize,leniaMaterials,dnaTex,gradientTex,imageTex,dnaSelect,settings,renderTex){
		this.uniforms={
			camZoom:cam.zoom,
			camPos:cam.pos,
			imgSize,
			canvasSize,
			// leniaTex:leniaTex.tex,
			leniaTex1: leniaMaterials[0].leniaTexPP.tex,
			// leniaTex2: leniaMaterials[1].leniaTexPP.tex,
			dnaTex:dnaTex.tex,
			gradientTex:gradientTex.tex,
			imageTex:imageTex.tex,
			dnaSelect:dnaSelect,
			colorDNA:settings.colorDNA,
			colorVariation:settings.colorVariation,
		};
		this.attachments=[
			{
				attachment:renderTex.tex,
				...sizeObj(renderTex.size)
			}
		];
		super.run();
	}
}
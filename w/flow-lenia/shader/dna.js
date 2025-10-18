class GeneInitShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp sampler2D;

				uniform vec2 size;
				uniform float rand;
				uniform float seed;
				uniform float groupLength;
				uniform sampler2D image;
				uniform sampler2D imageMask;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);

					// float idx=float(coord2.x)+float(coord2.y)*size.x;
					// if(mod(idx,groupLength)!=0.){
						// outColor=hash42(vec2(coord2)+rand);
					// 	// outColor=hash42(vec2(coord2));
					// 	// outColor = hash42(vec2(floor(texture(image, pos2).r*100.),0.));
					// }else{
					// 	outColor=vec4(0.);
					// }
					// outColor = hash42(vec2(floor(texture(imageMask, pos2).r*2.+197.)*10000.,seed));
					float mask = texture(imageMask, pos2).r;
					// outColor = hash42(vec2(123.,seed));
					// outColor = hash42(vec2(123,seed));
					// outColor = hash42(vec2(floor(mask*3.)*1234.,seed));
					// outColor = hash42(vec2(floor(texture(imageMask, pos2).r*256.),rand+192.));
					float layer = floor(mask*3.);
					// float layer = step(.4, mask);
					// outColor = hash42(vec2(layer*1234.,seed));
					outColor = hash42(vec2(0.,seed));// + hash42(layer);
					// outColor = hash42(vec2(7.,seed));
					// outColor = hash42(vec2(floor(pos2.x*256.),rand));

					// outColor = 
				}
			`,
		);
	}
	run(geneTex, imgTex, groupLength,imageMask,seed){
		this.uniforms={
			size:geneTex.size,
			image:imgTex,
			rand:rand(),
			imageMask:imageMask,
			groupLength,
			seed:seed,
		};
		this.attachments=[
			{
				attachment:geneTex.tex,
				...sizeObj(geneTex.size)
			}
		];
		super.run();
	}
}
class DnaInitShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				#define PI ${PI}
				precision highp float;
				precision highp sampler2D;

				uniform vec2 size;
				uniform float rand;
				uniform float seed;
				uniform float maxLength;
				uniform sampler2D image;
				uniform sampler2D imageMask;

				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*size);

					int initBlockSize=100;
					outColor = floor(hash42(vec2(123,321))*maxLength);
					// outColor = floor(hash42(floor(pos/10.))*maxLength);
					// outColor = vec4(1);
					// outColor = floor(hash42(vec2(floor(texture(imageMask, pos2).r*256.),rand))*maxLength);
					// outColor = floor(hash42(vec2(floor(texture(imageMask, pos2).r*256.),seed))*maxLength);
					float mask = texture(imageMask, pos2).r;
					mask = floor(mask*100.);
					outColor = hash42(vec2(mask));
					// outColor = floor(hash42(vec2(floor(pos2.x*256.),rand))*maxLength);
					// outColor=vec4(4394, 47021.*sign(pos.x), 45166, 66015);
					// outColor=vec4(5053,292,34399,18627);
					// outColor=floor(hash42(vec2(coord2/initBlockSize)+rand)*maxLength);
					// outColor=floor(hash42(vec2(coord2/initBlockSize)+rand)*maxLength);
					// outColor=floor(hash42(vec2(coord2/initBlockSize))*maxLength);
					// outColor=floor(vec4(coord2/200+10000,10000,1000));
					// outColor=floor(hash42(vec2(floor(texture(image, pos2).r*10.))+rand)*maxLength);
				}
			`,
		);
	}
	run(dnaTex,imgTex,maxLength,imageMask,seed){
		this.uniforms={
			size:dnaTex.size,
			image:imgTex,
			rand:rand(),
			imageMask:imageMask,
			maxLength,
			seed:seed,
		};
		this.attachments=[
			{
				attachment:dnaTex.tex,
				...sizeObj(dnaTex.size)
			}
		];
		super.run();
	}
}
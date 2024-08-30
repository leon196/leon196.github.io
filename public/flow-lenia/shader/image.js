class MixShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D aTex;
				uniform sampler2D bTex;
				uniform vec2 aSize;
				uniform vec2 bSize;
				uniform float strength;
				
				in vec2 pos;
				out vec4 outColor;

				void main(){
					vec2 pos2=(pos+1.)*.5;
					outColor=mix(
						texture(aTex,pos2),
						texture(bTex,pos2),
						strength
					);
				}
			`,
		);
	}
	run(strength,aTex,bTexPP){
		this.uniforms={
			bTex:bTexPP.tex,
			aTex:aTex.tex,
			bSize:bTexPP.size,
			aSize:aTex.size,
			strength
		};
		this.attachments=[
			{
				attachment:bTexPP.flip().tex,
				...sizeObj(bTexPP.size)
			}
		];
		super.run();
	}
}
class CopyShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D aTex;
				uniform vec2 aSize;
				
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.GAMMA}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					vec4 v=texture(aTex,pos2);
					outColor=vec4(gammaShift(v.xyz),v.w);
				}
			`,
		);
	}
	run(aTex,bTex){
		this.uniforms={
			aTex:aTex.tex,
			aSize:aTex.size,
		};
		this.attachments=[
			{
				attachment:bTex.tex,
				...sizeObj(bTex.size)
			}
		];
		super.run();
	}
}
class AddShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D aTex;
				uniform sampler2D bTex;
				uniform vec2 aSize;
				uniform vec2 bSize;
				
				in vec2 pos;
				out vec4 outColor;

				void main(){
					vec2 pos2=(pos+1.)*.5;
					outColor=texture(aTex,pos2)+texture(bTex,pos2);
				}
			`,
		);
	}
	run(aTex,bTexPP){
		this.uniforms={
			bTex:bTexPP.tex,
			aTex:aTex.tex,
			bSize:bTexPP.size,
			aSize:aTex.size
		};
		this.attachments=[
			{
				attachment:bTexPP.flip().tex,
				...sizeObj(bTexPP.size)
			}
		];
		super.run();
	}
}
class SubShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D aTex;
				uniform sampler2D bTex;
				uniform vec2 aSize;
				uniform vec2 bSize;
				
				in vec2 pos;
				out vec4 outColor;

				void main(){
					vec2 pos2=(pos+1.)*.5;
					outColor=texture(bTex,pos2)-texture(aTex,pos2);
				}
			`,
		);
	}
	run(aTex,bTexPP){
		this.uniforms={
			bTex:bTexPP.tex,
			aTex:aTex.tex,
			bSize:bTexPP.size,
			aSize:aTex.size
		};
		this.attachments=[
			{
				attachment:bTexPP.flip().tex,
				...sizeObj(bTexPP.size)
			}
		];
		super.run();
	}
}
class LeniaMaterial{
	constructor(){
		this.leniaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.affinityTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.veloTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		
		this.geneMaxLength=100000;
		this.geneGroupLength=3+1;//leave the first pixel open as a meta pixel for list control
		this.geneTexPP=new TexturePingPong({
			...sizeObj(boxSize(this.geneMaxLength*this.geneGroupLength,{},this.geneGroupLength)),
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
	}
	*[Symbol.iterator]() {
		yield this.leniaTexPP;
		yield this.affinityTexPP;
		yield this.veloTexPP;
	}
}
class Lenia{
	constructor(){
		this.materials=[
			new LeniaMaterial(),
		];
		this.gradientTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.motionTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.dnaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.imgTex=new Texture({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.imgGradientTex=new Texture({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.renderTex=new Texture({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.geneInitShader=new GeneInitShader();
		this.dnaInitShader=new DnaInitShader();
		this.noiseShader=new NoiseShader();
		this.leniaShader=new LeniaShader();
		this.gradientShader=new GradientShader();
		this.motionCapacityShader=new MotionCapacityShader(4);
		this.motionShader=new MotionShader(4);
		this.viscosityShader=new ViscosityShader(4);
		this.veloShader=new VeloShader();
		this.flowShader=new FlowShader();
		this.renderShader=new RenderShader();

		this.mixShader=new MixShader();
		this.copyShader=new CopyShader();
		this.addShader=new AddShader();
		this.subShader=new SubShader();
		this.zoomShader=new ZoomShader();
		
		this.balanceMotion=false;

		const img=new Image();
		img.src=imageSrc;

		this.size = Vec(1,1);
		this.dnaSelect = [0,0,0,0];
		this.blend_elapsed = 0;
		this.blend_delay = 0.1;
		this.blend = 1;
		this.imageSource = {};
		this.settings = {}
		this.imageMask = twgl.createTexture(gl, { src: "./img/masks.png" });
		this.imageMask2 = twgl.createTexture(gl, { src: "./img/masks2.png" });
		this.imageMaskBlur = twgl.createTexture(gl, { src: "./img/masks-blur.jpg" });

		this.materials.forEach((m,i,arr)=>{
			this.geneInitShader.run(m.geneTexPP, m.imgTex, m.geneGroupLength,this.imageMask,19200);
		});

		img.onload=()=>{
			this.size=Vec(img.width,img.height).scl(imageScale).flr();
			[
				this.gradientTexPP,
				this.motionTexPP,
				this.dnaTexPP,
				this.imgTex,
				this.imgGradientTex,
				this.renderTex,
				...this.materials.flatMap(x=>[...x])
			].forEach(t=>t.resize(this.size.x,this.size.y));
			this.materials.forEach((m,i,arr)=>{
				this.noiseShader.run(m.leniaTexPP);
			});

			this.imageSource = twgl.createTexture(gl, { src: img });
			this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength,this.imageMask,123);
			this.geneUpdate(315969);
		};
	}
	geneUpdate(seed)
	{
		this.materials.forEach((m,i,arr)=>{
			this.geneInitShader.run(m.geneTexPP, this.imageSource, m.geneGroupLength,this.imageMask,seed);
		});
	}
	dnaUpdate(seed)
	{
		this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength,this.imageMask,seed);
	}
	resize(img)
	{
		this.size=Vec(img.width,img.height).flr();
		[
			this.gradientTexPP,
			this.motionTexPP,
			this.dnaTexPP,
			this.imgTex,
			this.imgGradientTex,
			this.renderTex,
			...this.materials.flatMap(x=>[...x])
		].forEach(t=>t.resize(this.size.x,this.size.y));

		// NOISE
		this.materials.forEach((m,i,arr)=>{
			this.noiseShader.run(m.leniaTexPP);
		});

		this.imageSource = twgl.createTexture(gl, { src: img });

		// DNA
		this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength,this.imageMask,123);
	}
	reset()
	{
		// NOISE
		this.materials.forEach((m,i,arr)=>{
			this.noiseShader.run(m.leniaTexPP);
		});

		// DNA
		this.dnaInitShader.run(this.dnaTexPP,this.imageSource,this.materials[0].geneMaxLength,this.imageMask,123);
	}
	run(update,display,drawTex,imageTex){
		shaderManager.resizeToDisplay();

		if (update)
		{
			// IMAGE
			this.copyShader.run(imageTex,this.imgTex);
			
			// IMAGE GRADIENT
			this.gradientShader.run(this.imgTex,this.imgGradientTex);

			this.materials.forEach((m,i,arr)=>{
				let nextM=this.materials[(i+1)%this.materials.length];

				// LENIA
				this.leniaShader.run(
					m.geneGroupLength,
					this.imgTex,
					this.imageMask2,
					m.geneTexPP,
					this.dnaTexPP,
					m.leniaTexPP,
					nextM.affinityTexPP,
				);

				// LENIA GRADIENT
				this.gradientShader.run(m.affinityTexPP,this.gradientTexPP);

				// APPLY IMAGE TO GRADIENT
				this.subShader.run(this.imgGradientTex,this.gradientTexPP,this.imageMask);

				// this.mixShader.run(.9,this.imgGradientTex,this.gradientTexPP);

				// VISCOSITY
				this.viscosityShader.run(m.leniaTexPP,m.veloTexPP);

				// VELOCITY
				this.veloShader.run(this.gradientTexPP,m.veloTexPP,imageTex,this.settings,this.imageMask);

				// BLEND IMAGE IN LENIA
				this.blend_elapsed += 1/60.
			});

			// FLOW
			this.materials.forEach((m,i,arr)=>{
				this.flowShader.run(i==0,this.materials[0].geneMaxLength,display.view,this.size,display.size,m.leniaTexPP,m.veloTexPP,this.dnaTexPP,drawTex,imageTex,this.settings,zoom);
			});
		}
		
		// RENDER
		this.renderShader.run(this.materials,this.renderTex,imageTex);
	}
}
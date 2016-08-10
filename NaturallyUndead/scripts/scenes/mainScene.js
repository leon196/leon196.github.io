
function MainScene ()
{
	Scene.call(this); 

	this.init = function (time)
	{
		this.camera.fov = 25 * Math.PI / 180;
		this.camera.position = blender.getVector3("CameraAction", "location");
		this.camera.target = blender.getVector3("TargetAction", "location");

		this.vegetation = new PointCloud("vegetation.ply", 20);
		this.vegetation.setLeafSize([0.3, 1.5]);
		this.vegetation.position = blender.getVector3("VegetationAction", "location");
		this.vegetation.orientation = blender.getRotation("VegetationAction");

		this.bush = new Bush([8,8,8]);
		this.bush.setVoxelSize(1.);
		this.bush.setLeafSize([0.3, 4.]);
		this.bush.setDisplacementScale([0.5, 0.1, 0.5]);
		this.bush.setNoiseScale([0.5, 0.5, 0.5]);

		this.currentCurve = 1;

		for (var c = 1; c <= 5; ++c) {
			var curveArray = curveToArray(assets["curve" + c + ".3d"]);
			var width = Math.ceil(curveArray.length / 4.);
			this["curve" + c] = twgl.createTexture(gl, { type: gl.FLOAT, min: gl.LINEAR, mag: gl.LINEAR, wrap: gl.CLAMP_TO_EDGE, width: width, height: 1, src: curveArray });
		}

		this.bamboo = new Bamboo(this.curve1);
		this.character = new Character(this.curve1);

		this.skull = new Skull();

		this.moss = new Moss(createMesh(assets["skull.ply"]));
		this.mossLeafSize = [0.5, 4.];
		this.moss.setLeafSize(this.mossLeafSize);
		this.moss.setCurve(this.curve1);
		this.moss.setColors([152. / 255., 177. / 255., 109. / 255.], [35. / 255., 66. / 255., 9. / 255.]);

		this.mossRed = new Moss(createMesh(assets["skull.ply"]));
		this.mossRed.setLeafSize([0.5, 2.]);
		this.mossRed.setColors([0.8, 0.08, 0.15], [0.07, 0, 0]);
		this.mossRed.setRadius(3);

		this.grid = new Entity(createGrid(), assets["color.vert"], assets["color.frag"]);
		this.grid.displayType = gl.LINES;

		this.targetBush = new Entity(createWiredCube(), assets["color.vert"], assets["color.frag"]);
		this.targetBush.displayType = gl.LINES;

		// this.targetBoids = new Entity(createWiredCube(), assets["color.vert"], assets["color.frag"]);
		// this.targetBoids.displayType = gl.LINES;

		this.butterflies = new Butterflies();

		// this.video = new Video("assets/videos/dance1.mp4");
		// this.opticalFlow = new OpticalFlow();

		// this.addEntity(this.grid);
		this.addEntity(this.skull);
		this.addEntity(this.bamboo);
		this.addEntity(this.character);
		this.addEntity(this.moss);
		this.addEntity(this.mossRed);
		this.addEntity(this.butterflies);
		this.addEntity(this.vegetation);
		// this.addEntity(this.bush);
		// this.addEntity(this.targetBush);
		// this.addEntity(this.targetBoids);

		this.time = 0;
		this.start = Date.now() - this.time * 1000;
	};

	this.setCurve = function (curve)
	{
		var shouldLoop = this.currentCurve == 5 ? 1 : 0;

		if (this.currentCurve == 5) {
			this.moss.setRadius(5);
		}

		this.bamboo.setCurve(curve, shouldLoop);
		this.character.setCurve(curve, shouldLoop);
		this.moss.setCurve(curve, shouldLoop);
	};

	this.getCurrentCurveRatio = function ()
	{
		return "Curve" + this.currentCurve + "Action";
	};

	this.update = function ()
	{
		// camera
		this.camera.position = blender.evaluate("CameraAction", "location", this.time);
		this.camera.target = blender.evaluate("TargetAction", "location", this.time);

		// this.camera.orbitControl();
		// this.camera.position[1] = 1;

		var currentCurve = Math.floor(blender.evaluate("CurrentCurveAction", "location", this.time)[0]);
		if (currentCurve != this.currentCurve) {
			this.currentCurve = currentCurve;
			this.setCurve(this["curve" + this.currentCurve]);
		}

		// curve
		var curveRatio = blender.evaluate(this.getCurrentCurveRatio(), "eval_time", this.time)[0] / 100;
		this.bamboo.setCurveRatio(curveRatio);
		this.character.setCurveRatio(curveRatio);
		this.moss.setCurveRatio(curveRatio);

		// skull
		var fadeValue = blender.evaluate("BoneFadeValueAction", "location", this.time)[0];
		var shineValue = blender.evaluate("BoneShineValueAction", "location", this.time)[0];
		this.skull.setFadeValue(fadeValue);
		this.skull.setShineValue(shineValue);

		// moss
		var mossValue = blender.evaluate("MossFadeValueAction", "location", this.time)[0];
		this.moss.setLeafSize([this.mossLeafSize[0] * mossValue, this.mossLeafSize[1] * mossValue]);
		this.mossRed.setTarget(this.butterflies.getTarget());

		// character
		var characterValue = blender.evaluate("CharacterValueAction", "location", this.time)[0];
		this.character.setValue(characterValue);

		// butterflies
		var boidsValue = blender.evaluate("BoidsValueAction", "location", this.time)[0];
		this.butterflies.setBoidsValue(boidsValue);
		this.butterflies.target = blender.evaluate("TargetBoidsAction", "location", this.time);
		if (this.butterflies.hasStarted == false && boidsValue > 0) {
			this.butterflies.hasStarted = true;
			this.butterflies.resetAtTarget();
		}
		this.butterflies.update();

		// vegetation
		var targetVegetation = blender.evaluate("TargetVegetationAction", "location", this.time);
		this.vegetation.setTarget(targetVegetation);
		// this.vegetation.setTarget(this.butterflies.getTarget());
		// this.targetBush.position = targetVegetation;

		// planetVideo.update(this.cooldown.elapsed);

		this.draw();
		// this.opticalFlow.draw(planetVideo, this.camera);
	};
}

MainScene.prototype = Object.create(Scene.prototype);
MainScene.prototype.constructor = MainScene;
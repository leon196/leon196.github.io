var assets = {};

assets.loaded = false;
assets.totalCount = 0;
assets.filesToLoad = 0;
assets.directoriesToLoad = 0;

assets.areLoaded = function ()
{
	return assets.filesToLoad + assets.directoriesToLoad === 0;
};

assets.storeFile = function (error, file, filename)
{
	if (error == null) {
		assets[filename] = file;
	} else {
		console.log(error);
	}
};

assets.loadDirectory = function (dir)
{
	++assets.directoriesToLoad;
	$.ajax({ url: dir, success: function (data) {
		$(data).find("a").each(function (index, element) {
			var filename = this.href.replace(window.location.host, "").replace("http://", "").replace("/", "");
			var extension = filename.split(".");
			if (extension.length > 1) {
				++assets.filesToLoad;
				++assets.totalCount;
				loadFile(dir + filename, function (error, file) { 
					assets.storeFile(error, file, filename); 
					--assets.filesToLoad;
				});
			} else {
				assets.loadDirectory(dir + filename);
			}
		});
		--assets.directoriesToLoad;
	}});
};

assets.addHeaderToShaders = function ()
{
	for (var key in assets) {
		var k = key.split(".");
		if (assets.hasOwnProperty(key) && (k[1] === "vert" || k[1] === "frag")) {
			assets[key] = assets["header.glsl"] + assets[key];
		}
	}
};
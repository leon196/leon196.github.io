function onMU(e)
{
}

function onMD(e)
{
}

function onEF(e)
{
	timeElapsed = new Date().getTime() / 1000.0 - timeStarted;

	switch (gameState)
	{
		// Main Loop
		case 0 :

			syncDifference = 0;

			// Cursors
			for (var c = 0; c < countCursors; c++)
			{
				var cursor = cursors[c];

				// Update Controls
				if (!debugging) {
					cursor.update(timeElapsed);
				} else {
					cursor.debug(timeElapsed);
				}

				// Calculate Difference
				if (c > 0) {
					var cursorPrev = cursors[c-1];
					var diff = Math.abs(cursor.ratio - cursorPrev.ratio);
					syncDifference += diff;
				}
			}

			// Check Victory
			if (playing) {
				if (syncDifference < syncTolerance) {
					if (!synching) {
						synching = true;
						syncTimeStart = timeElapsed;
					}
					if (syncTimeStart + syncTimeDelay >= timeElapsed) {
						var ratio = Math.max(0, Math.min((timeElapsed - syncTimeStart) / syncTimeDelay, 1));
						var tris = Math.floor(ratio*countLines);
						if (syncLastTri != tris) {
							syncLastTri = tris;
							levelManager.drawTriangles(tris);
						}
					} else {
						levelManager.drawTriangles(countLines);
						playing = false;
						synching = false;
						NextLevel();
					}
				} else {
					if (synching) {
						synching = false;
						levelManager.cleanTriangles();
					}
				}
			}

			UpdateDebug(syncDifference);

		break;
	}
}

function onKD(e)
{
	var keyCode = e.keyCode;
	switch (keyCode) {
		// Y
		case 89 :
			keyDebug = true;
			debugging = !debugging;
		break;
		// T
		case 84 :
			speedDebug = Math.max(1, speedDebug - 1);
		break;
		// U
		case 85 :
			speedDebug = Math.min(9, speedDebug + 1);
		break;
		// Cursor Controlers
		default :
			for (var k = keys.length - 1; k >= 0; --k) {
				if(keyCode == keys[k].keyCode) {
					keys[k].value = true;
				}
			}
		break;
	}
	console.log(keyCode);
}

function onKU(e)
{
	var keyCode = e.keyCode;
	for (var k = keys.length - 1; k >= 0; --k) {
		if(keyCode == keys[k].keyCode) {
			keys[k].value = false;
		}
	}
	switch (keyCode) {
		// Y
		case 89 :
			keyDebug = false;
		break;
		// M
		case 77 :
			muted = !muted;
			if (muted) Howler.mute();
			else Howler.unmute();
		break;
	}
}
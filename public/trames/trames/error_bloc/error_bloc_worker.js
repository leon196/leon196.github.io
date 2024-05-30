
onmessage = function(o) {

    let src = o.data[0];
    // let dest = o.data[1];
    let w = o.data[2];
    let h = o.data[3];

    // let width = w

    // Sam Hocevar
    // from libcaca.py

    // let x, y, i, j, n, px, py;

    const abs = (x) => Math.abs(x)
    const matrix = (w,h,v) => {
        let mat = []
        for (let y = 0; y < h; ++y) {
            mat.push([]) 
            for (let x = 0; x < w; ++x)
                mat[y].push(v);
        }
        return mat;
    }

    let tiles = [[[0, 0], [0, 0]], [[1.0, 0], [0, 0]], [[0, 1.0], [0, 0]], [[1.0, 1.0], [0, 0]], [[0, 0], [1.0, 0]], [[1.0, 0], [1.0, 0]], [[0, 1.0], [1.0, 0]], [[1.0, 1.0], [1.0, 0]], [[0, 0], [0, 1.0]], [[1.0, 0], [0, 1.0]], [[0, 1.0], [0, 1.0]], [[1.0, 1.0], [0, 1.0]], [[0, 0], [1.0, 1.0]], [[1.0, 0], [1.0, 1.0]], [[0, 1.0], [1.0, 1.0]], [[1.0, 1.0], [1.0, 1.0]]]

    const propagate = 
        [[[[0, -1, 0, 8./64],
        [0, 0, 0, 10./64],
        [7./64, 22./64, 15./64, 2./64]],
        [[0, 0, -1, 20./64],
        [0, 0, 0, 14./64],
        [2./64, 11./64, 15./64, 2./64]]],
        [[[0, 0, 0, 0./64],
        [0, -1, 0, 6./64],
        [12./64, 32./64, 13./64, 1./64]],
        [[0, 0, 0, 0./64],
        [0, 0, -1, 20./64],
        [0./64, 12./64, 28./64, 4./64]]]]

    const diff = 
        [[51./128, 33./128],
        [25./128, 19./128]]
    
    const gamma = false;
    const ctoi = x => x;
    const itoc = x => x;
    

    let dest = matrix(w, h, 0);

    // # Propagating the error to a temporary buffer is becoming more and
    // # more complicated. We decide to use an intermediate matrix instead.
    tmp = []
    for (let y = 0; y < h; ++y) {
        tmp.push([]) 
        for (let x = 0; x < w; ++x)
            tmp[y].push(src[x + y * h]);
    }
    
    // # Analyse tile list
    let ntiles = tiles.length
    let ty = tiles[0].length
    let tx = tiles[0][0].length
    let cur = matrix(tx, ty, 0)
    
    w = w / tx
    h = h / ty
    
    // # Analyse error propagate list
    for (x = 0; x < w; ++x) {
        for (y = 0; y < h; ++y) {

            // # Get block value
            for (i = 0; i < tx; ++i)
                for (j = 0; j < ty; ++j)
                    cur[j][i] = tmp[y * ty + j][x * tx + i]

            // # Select closest block
            let dist = tx * ty
            let best = 0
            for (n = 0; n < ntiles; ++n) {
                let d = 0.
                let e = 0.
                for (i = 0; i < tx; ++i) {
                    for (j = 0; j < ty; ++j) {
                        d += cur[j][i] - tiles[n][j][i]
                        e += diff[j][i] * abs(cur[j][i] - tiles[n][j][i])
                    }
                }
                if (abs(d) / (tx * ty) + e < dist) {
                    dist = abs(d) / (tx * ty) + e
                    best = n
                }
            }

            // # Set pixel
            for (i = 0; i < tx; ++i)
                for (j = 0; j < ty; ++j)
                    dest[y * ty + j][x * tx + i] = tiles[best][j][i]

            // # Propagate error
            for (i = 0; i < tx; ++i) {
                for (j = 0; j < ty; ++j) {
                    let e = cur[j][i] - tiles[best][j][i]
                    let m = propagate[j][i]
                    let cx = 0;
                    let cy = 0;
                    for (px = 0; px < m[0].length; ++px) {
                        for(py = 0; py < m.length; ++py) {
                            if (m[py][px] == 0) continue
                            if (m[py][px] == -1) {
                                cx = px;
                                cy = py;
                                continue;
                            }
                            const tmpx = x * tx + i + px - cx
                            const tmpy = y * ty + j + py - cy
                            if (tmpx > w * tx - 1 || tmpy > h * ty - 1)
                                continue
                            tmp[tmpy][tmpx] += m[py][px] * e
                        }
                    }
                }
            }
        }
    }

    w = o.data[2];
    h = o.data[3];
    let result = new Uint8Array(w*h);
    for (j = 0; j < h; ++j) 
        for (i = 0; i < w; ++i)
            result[i + j * w] = dest[j][i] > 0.5 ? 255 : 0
    
        
    postMessage(result);

}
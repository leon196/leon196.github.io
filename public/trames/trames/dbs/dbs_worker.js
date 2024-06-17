
onmessage = function(o) {

    let array = o.data.array;
    let w = o.data.width;
    let h = o.data.height;
    let settings = o.data.settings;

    // console.log(settings)
    // let step_count = o.data[3];
    
    let src = new Float32Array(w*h);
    let dest = new Float32Array(w*h);
    for (let i = 0; i < w*h; ++i) {
        src[i] = array[i] / 255.;
        dest[i] = array[i] / 255. + Math.random() - 0.5 > 0.5 ? 1. : 0;
    }

    // Sam Hocevar
    // from libcaca.py

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
    const getI = (x,y) => (x + y * w)
    const hvs = (x) => Math.pow(Math.E, - Math.sqrt(x))

    let x, y, i, j;

    const kernel = matrix(8, 8, 0.)
    for (i = 0; i < 6; ++i) {
        for (j = 0; j < 6; ++j) {
            kernel[j][i] = hvs(i * i + j * j)
        }
    }

    // for (let steps = 0; steps < step_count; ++steps)
    // {
        const srcmat = new Float32Array(w*h);
        const destmat = new Float32Array(w*h);
        const srchvs = new Float32Array(w*h);
        const desthvs = new Float32Array(w*h);
        for (i = 0; i < w*h; ++i)
        {
            srcmat[i] = src[i];
            destmat[i] = dest[i];
        }

        // # Build human perception model for both source and destination
        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                let srcp = 0;
                let destp = 0;
                for (j = -5; j < 6; ++j) {
                    if (y + j < 0 || y + j >= h) {
                        continue;
                    }
                    for (i = -5; i < 6; ++i) {
                        if (x + i < 0 || x + i >= w) {
                            continue;
                        }
                        const m = kernel[abs(j)][abs(i)];
                        srcp += m * srcmat[getI(x + i, y + j)];
                        destp += m * destmat[getI(x + i, y + j)];
                    }
                }
                srchvs[getI(x, y)] = srcp;
                desthvs[getI(x, y)] = destp;
            }
        }

        let swaps = 0;
        let toggles = 0;
        let op = null;
        let d2 = 0;
        let dx = 0;
        let dy = 0;

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                const d = destmat[getI(x, y)];
                let best = 0.;

                // # Compute the effect of a toggle

                let e = 0.;
                for (j = -5; j < 6; ++j) {
                    if (y + j < 0 || y + j >= h) continue;
                    for (i = -5; i < 6; ++i) {
                        if (x + i < 0 || x + i >= w) continue;
                        const m = kernel[abs(j)][abs(i)];
                        const p = srchvs[getI(x + i, y + j)];
                        const q1 = desthvs[getI(x + i, y + j)];
                        const q2 = q1 - m * d + m * (1-d)
                        e += abs(q1 - p) - abs(q2 - p);
                    }
                }
                if (e > best) {
                    best = e;
                    op = null;
                }
                // # Compute the effect of swaps
                const dxs = [0, 0, -1, 1]
                const dys = [1, -1, 0, 0]
                for (let di = 0; di < 4; ++di) {
                    dx = dxs[di];
                    dy = dys[di];
                    if (y + dy < 0 || y + dy >= h || x + dx < 0 || x + dx >= w)
                        continue;
                    d2 = destmat[getI(x + dx, y + dy)]
                    if (d2 == d) continue;
                    e = 0.
                    for (j = -5; j < 6; ++j) {
                        for (i = -5; i < 6; ++i) {
                            if (y + j < 0 || y + j >= h || x + i < 0 || x + i >= w)
                                continue;
                            const ma = kernel[abs(j)][abs(i)]
                            const mb = kernel[abs(j - dy)][abs(i - dx)]
                            const p = srchvs[getI(x + i, y + j)]
                            const q1 = desthvs[getI(x + i, y + j)]
                            const q2 = q1 - ma * d + ma * d2 - mb * d2 + mb * d
                            e += abs(q1 - p) - abs(q2 - p)
                        }
                    }
                    if (e > best) {
                        best = e
                        op = [dx, dy]
                    }
                }
                // # Apply the change if interesting
                if (best <= 0.) continue;

                if (op != null) {
                    dx = op[0];
                    dy = op[1];
                    d2 = destmat[getI(x + dx, y + dy)]
                    destmat[getI(x + dx, y + dy)] = d
                }
                else {
                    d2 = 1. - d
                }
                destmat[getI(x, y)] = d2
                for (j = -5; j < 6; ++j) {
                    for (i = -5; i < 6; ++i) {
                        const m = kernel[abs(j)][abs(i)]
                        if (y + j >= 0 && y + j < h && x + i >= 0 && x + i < w) {
                            desthvs[getI(x + i, y + j)] -= m * d
                            desthvs[getI(x + i, y + j)] += m * d2
                        }
                        if (op && y + dy + j >= 0 && y + dy + j < h && x + dx + i >= 0 && x + dx + i < w) {
                            desthvs[getI(x + dx + i, y + dy + j)] -= m * d2
                            desthvs[getI(x + dx + i, y + dy + j)] += m * d
                        }
                    }
                }
            }
        }

        for (i = 0; i < w*h; ++i)
            dest[i] = destmat[i]
    
    // }

    const ww = o.data.width;
    const hh = o.data.height;
    let result = new Uint8Array(ww*hh);
    for (i = 0; i < ww*hh; ++i)
        result[i] = dest[i] > 0.5 ? 255 : 0
    postMessage({
        array: result,
        width: ww,
        height: hh,
    });//[result, steps]);

}
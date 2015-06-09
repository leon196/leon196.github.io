PIXI.BackgroundFilter = function() {

    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        uResolution: {type: '2fv', value:new PIXI.Float32Array([window.innerWidth, window.innerHeight])},
        uScale: {type: '1f', value:16},
        uTimeElapsed: {type: '1f', value:0},
    };

    this.fragmentSrc = [
        
        'precision mediump float;',
        'uniform vec2 uResolution;',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        'uniform float uTimeElapsed;',
        'uniform float uScale;',
        'vec3 colorSky1 = vec3(0.4, 0.6, 0.9);',
        'vec3 colorSky2 = vec3(0.4, 0.8, 0.9);',
        'vec3 colorGround1 = vec3(0.1, 0.9, 0.2);',
        'vec3 colorGround2 = vec3(0.2, 0.8, 0.0);',

        // Dat random function for glsl
        'float rand(vec2 co){ return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }',

        // Pixelize coordinates
        'vec2 pixelize(vec2 uv, float details) { return floor(uv.xy * details) / details; }',

        'void main()',
        '{',                
        '    vec2 uv = vTextureCoord;',//' - 0.5;',

            'float y = uv.y;',

            'float ground = step(y, 0.5);',
        
            //'y = mod(pow(2.0, 1.0 + uv.y * 8.0), 1.0);',
            'y = mod(log(uv.y - 0.5), 1.0);',

            'y = mod(abs(y - uTimeElapsed * 4.0 - 1.0), 1.0);',

            'ground = step(y, 0.5);',

            'vec3 colorSky = mix(colorSky2, colorSky1, uv.y);',
            'vec3 colorGround = mix(colorGround1, colorGround2, ground);',

            'vec3 color = mix(colorSky, colorGround, step(uv.y, 0.5));',

            'gl_FragColor = vec4(color, 1.0);',
        '}'
    ];
};

PIXI.BackgroundFilter.prototype = Object.create( PIXI.BackgroundFilter.prototype );
PIXI.BackgroundFilter.prototype.constructor = PIXI.BackgroundFilter;

// Time Elapsed
Object.defineProperty(PIXI.BackgroundFilter.prototype, 'timeElapsed', {
    get: function() {
        return this.uniforms.uTimeElapsed.value;
    },
    set: function(value) {

        this.dirty = true;
        this.uniforms.uTimeElapsed.value = value;
    }
});

// Scale
Object.defineProperty(PIXI.BackgroundFilter.prototype, 'scalePerlin', {
    get: function() {
        return this.uniforms.uScale.value;
    },
    set: function(value) {

        this.dirty = true;
        this.uniforms.uScale.value = value;
    }
});
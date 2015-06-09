PIXI.VelocityFilter = function() {

    PIXI.AbstractFilter.call( this );

    this.passes = [this];

    // set the uniforms
    this.uniforms = {
        uResolution: {type: '2fv', value:new PIXI.Float32Array([window.innerWidth, window.innerHeight])},
        uTarget: {type: '2fv', value:new PIXI.Float32Array([0.5, 0.5])},
        uScale: {type: '1f', value:16},
        uTimeElapsed: {type: '1f', value:0},
    };

    this.fragmentSrc = [
        
        '#define PI 3.1416',
        'precision mediump float;',
        'uniform vec2 uResolution;',
        'uniform vec2 uTarget;',
        'varying vec2 vTextureCoord;',
        'uniform sampler2D uSampler;',
        'uniform float uTimeElapsed;',

        // Dat random function for glsl
        'float rand(vec2 co){ return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }',

        // Pixelize coordinates
        'vec2 pixelize(vec2 uv, float details) { return floor(uv.xy * details) / details; }',
        //'float noise ( vec2 seed ) { return texture2DRect(uNoise, seed * uNoiseResolution).r; }',
        'vec2 pixelate ( vec2 pixel, vec2 details ) { return floor(pixel * details) / details; }',
        'vec3 posterize ( vec3 color, float details ) { return floor(color * details) / details; }',
        'float luminance ( vec3 color ) { return (color.r + color.g + color.b) / 3.0; }',

        'void main()',
        '{',                
        '    vec2 uv = vTextureCoord;',//' - 0.5;',

            //vec2 uv = gl_FragCoord.xy / uScreenResolution.xy;
            /*uv -= 0.5;
            uv *= uImageScale;
            uv += 0.5;
            uv.y = 1.0 - uv.y;*/
            
            // Center & Scale UV
            // vec2 uv = fragCoord.xy - (screenResolution - imageResolution) / 2.0;
            // uv /= imageResolution;
            
            // Pixelate
            //uv = pixelate(uv, vec2(uPixelResolution*uPixelResolution));
            
            // Maths infos about the current pixel position
            'vec2 center = uv - uTarget;',
            'float angle = atan(center.y, center.x);',
            'float radius = length(center);',
            'float ratioAngle = (angle / PI) * 0.5 + 0.5;',
            'float dist = length(center);',
            
            // Displacement from noise
            //vec2 uvAngle = vec2(uTime * 0.01, ratioAngle);//pixelate(vec2(0, angle / PI), vec2(128.0));
            'vec2 uvAngle = pixelate(vec2(0, ratioAngle + uTimeElapsed * 0.1), vec2(1024));',
            //uvAngle = pixelate(vec2(0, angle / PI), vec2(128.0));
            'float offset = rand(uvAngle * 256.0) * radius + 0.35;',
            
            // Displaced pixel color
            'vec2 p = vec2(cos(angle), sin(angle)) * offset + vec2(0.5);',
            
            // Apply displacement
            'uv = mix(uv, p, step(offset, radius));',
            
            // Get color from texture
            'vec3 color = texture2D(uSampler, uv).rgb;',

            'gl_FragColor = vec4(color, 1.0);',
        '}'
    ];
};

PIXI.VelocityFilter.prototype = Object.create( PIXI.VelocityFilter.prototype );
PIXI.VelocityFilter.prototype.constructor = PIXI.VelocityFilter;

// Time Elapsed
Object.defineProperty(PIXI.VelocityFilter.prototype, 'timeElapsed', {
    get: function() {
        return this.uniforms.uTimeElapsed.value;
    },
    set: function(value) {

        this.dirty = true;
        this.uniforms.uTimeElapsed.value = value;
    }
});

// Scale
Object.defineProperty(PIXI.VelocityFilter.prototype, 'scalePerlin', {
    get: function() {
        return this.uniforms.uScale.value;
    },
    set: function(value) {

        this.dirty = true;
        this.uniforms.uScale.value = value;
    }
});

// Scale
Object.defineProperty(PIXI.VelocityFilter.prototype, 'target', {
    get: function() {
        return this.uniforms.uTarget.value;
    },
    set: function(value) {

        this.dirty = true;
        this.uniforms.uTarget.value = value;
    }
});
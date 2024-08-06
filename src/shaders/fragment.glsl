uniform sampler2D uTexture;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uProgress;
uniform vec3 uColor;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec2 squaresGrid(vec2 vUv)
{
    float imageAspectX = 1.;
    float imageAspectY = 1.;

    float containerAspectX = uResolution.x/uResolution.y;
    float containerAspectY = uResolution.y/uResolution.x;

    vec2 ratio = vec2(
        min(containerAspectX / imageAspectX, 1.0),
        min(containerAspectY / imageAspectY, 1.0)
    );

    vec2 squareUvs = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    return squareUvs;
}


void main()
{
            
    vec2 newUvs = vUv;            


    //generate grid
    vec2 squareUvs = squaresGrid(vUv);
    float gridSize = 20.;
    vec2 grid = vec2(floor(squareUvs.x*gridSize)/gridSize,floor(squareUvs.y*gridSize)/gridSize);
    vec4 gridTexture = vec4(uColor,0.);
    

    //image texture
    vec4 texture = texture2D(uTexture,vUv);

    float height = 0.2;

    float progress = (1.+height)-(uProgress*(1.+height+height)); //goes from 1+height to -height


    float dist = 1.-distance(grid.y,progress);

    float clampedDist = smoothstep(height,0.,distance(grid.y,progress));

    float randDist=step(1.-height*random(grid),dist);
    dist=step(1.-height,dist);
    
    float rand = random(grid); 

    float alpha = dist*(clampedDist+rand-0.5*(1.-randDist));
    alpha=max(0.,alpha);
    gridTexture.a = alpha;


    texture.rgba *= step(progress,grid.y);
    
    gl_FragColor = vec4(mix(texture,gridTexture,gridTexture.a));
}
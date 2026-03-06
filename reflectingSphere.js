let canvas;
let gl;
let program;

//Points for the objects in the scene
let pointsArray = [];
let normalsArray = [];
let texCoordsArray = [];

let pointsArraySphere = [];
let pointsArrayCube = [];

//Specific OBJ object coords
let fishPos = [];
let fishNormal = [];
let fishTexCoords = [];
let fishColors = [];

let chairPos = [];

let cigarPos = [];
let cigarNormal = [];

let fish;
let chair;
let cigar;

//Matrixes
let cameraMatrixLoc, cameraInverseMatrixLoc, shadowMatrixLoc;
let vTexCoord, vNormal, vPosition;

//Shadow matrix for the fish's shadow
let vBuffer
let shadowMatrix;
let black = vec4(0.0, 0.0, 0.0, 1.0);

//The rotation of the camera
let alpha = 0;

//Different toggles and helper variables to animate and move the scene
let displayShadow = true;
let displaySpotlight = true;
let rotateScene = false;
let fishRotation = false;
let fishAngle = 180;
let cigarAnimate = false;
let cigarPosAnimation = -.15;
let cigarLeft = false;

function quad(a, b, c, d) {
    let minT = 0.0;
    let maxT = 1.0;

    let texCoord = [
        vec2(minT, minT),
        vec2(minT, maxT),
        vec2(maxT, maxT),
        vec2(maxT, minT)
    ];

    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
}

function colorCube()
{
    // Note the vertex order. This is important
    // to ensure our texture is oriented correctly
    // when it's mapped to the cube.
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 0, 4, 7, 3);
    quad( 5, 1, 2, 6 );
    quad( 6, 7, 4, 5 );
    quad( 5, 4, 0, 1 );
}

function configureDefaultCubeMap() {
    let cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let red = new Uint8Array([255, 0, 0, 255]);
    let green = new Uint8Array([0, 255, 0, 255]);
    let blue = new Uint8Array([0, 0, 255, 255]);
    let cyan = new Uint8Array([0, 255, 255, 255]);
    let magenta = new Uint8Array([255, 0, 255, 255]);
    let yellow = new Uint8Array([255, 255, 0, 255]);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, yellow);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, green);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, cyan);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, magenta);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
}

function configureCubeMap(image) {
    let cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
}

// Configure default texture on fish
function configureDefaultTexture() {

    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        2,
        2,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 255, 0, 255])
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
}

// Configure Texture on Fish
function configureTexture(image) {

    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas, null );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //Shadow
    var light = vec3(0.0, 0.0, 2.0);

    let m = mat4();
    m[3][3] = 0;
    m[3][2] = -1.0/light[2];

    shadowMatrix = mult(m, translate(-light[0], -light[1], -light[2]));
    shadowMatrix = mult(translate(light[0], light[1], light[2]), shadowMatrix);

    // Cube vertices
    colorCube();
    pointsArrayCube = pointsArray;

    // Camera matrix stuff
    cameraMatrixLoc = gl.getUniformLocation( program, "cameraMatrix" );
    cameraInverseMatrixLoc = gl.getUniformLocation( program, "cameraInverseMatrix" );

    // Projection matrix
    let projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    let projectionMatrix = perspective(90, 1, 0.1, 100);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    // Lighting stuff
    let lightPosition = vec4(2.0, 4.0, 1.25, 1.0 );
    let lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
    let lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    let lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

    let materialAmbient = vec4( 0.2, 0.0, 0.0, 1.0 );
    let materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
    let materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    let materialShininess = 20.0;

    // Create model instances 
    fish = new Model(
        "https://bigmouthinc.github.io/12265_Fish_v1_L2.obj",
        "https://bigmouthinc.github.io/12265_Fish_v1_L2.mtl"
    );

    
    chair = new Model(
        "https://bigmouthinc.github.io/Chair.obj",
        "https://bigmouthinc.github.io/Chair.mtl"
    );

    cigar = new Model(
        "https://bigmouthinc.github.io/CigaretteOBJ.obj",
        "https://bigmouthinc.github.io/CigaretteMTL.mtl"
    )
    

    // Set and push lighting
    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(lightDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(materialDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "lightSpecular"), flatten(lightSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(materialSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "lightAmbient"), flatten(lightAmbient));
    gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(materialAmbient));
    gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    // Default textures
    configureDefaultTexture();
    configureDefaultCubeMap();

    // Load the skybox image
    let image = new Image();
    image.crossOrigin = "anonymous";
    image.src = "https://bigmouthinc.github.io/Shanty_Wall_PG_Texture.png";
    image.onload = function() {
        configureCubeMap(image);
    }

    // If the fish MTL is parsed, set the texture
    let checkFishMtl = setInterval(() => {
    if (fish.mtlParsed && fish.imagePath) {
        clearInterval(checkFishMtl);
        let image2 = new Image();
        image2.crossOrigin = "anonymous";
        image2.src = fish.imagePath;
        image2.onload = function() {
            configureTexture(image2);
        };
    }
}, 50);

    // Texture coordinates
    let tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Normals
    let nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    vBuffer = gl.createBuffer();

    // We don't need to re-enable vPosition every time we want to use it,
    // so we'll just enable it once for better performance
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    // Model transformation matrix for the skybox.
    // Since the matrix for the sphere is just the
    // identity matrix, we ignore it in our shader code
    let modelMatrix = mult(translate(0.0,0, 0.0) , scalem(4, 4, 4));
    let modelMatrixLoc = gl.getUniformLocation( program, "modelMatrix" );
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix) );

    let modelLightProduct = mult(vec3(modelMatrix[0],modelMatrix[1],modelMatrix[2]), vec3(lightPosition[0], lightPosition[1], lightPosition[2]))
    gl.uniform4fv( gl.getUniformLocation(program,"modelLightProduct"), flatten(modelLightProduct) );

    shadowMatrixLoc = gl.getUniformLocation( program, "shadowMatrix" );

    window.addEventListener("keydown", handleKeyPress);

    render();
}

//Key presses
function handleKeyPress(e) {
    switch(e.key) {
        //Rotates the camera around the scene
        case "r":
            rotateScene = !rotateScene
            break
        //Move the camera left
        case "a":
            alpha-=0.05
            break
        //Move the camera right
        case "d":
            alpha+=0.05
            break
        //Toggle the cast shadow individually
        case "s":
            displayShadow = !displayShadow
            break
        //Toggle the spotlight individually
        case "x":
            displaySpotlight = !displaySpotlight
            break
        //Toggle fish rotation
        case "q":
            fishRotation = !fishRotation
            break
        //Toggle cigar animation
        case "f":
            cigarAnimate = !cigarAnimate
            break
        //Toggle lighting all together
        case "l":
            if (displayShadow && displaySpotlight){
                displayShadow = false
                displaySpotlight = false
            }
            else if (!displayShadow && !displaySpotlight){
                displayShadow = true
                displaySpotlight = true
            }
            else{
                displayShadow = displaySpotlight
                displayShadow = !displayShadow
                displaySpotlight = !displaySpotlight
            }
            displayPointLight = displayShadow
            break
        case "p":
            displayPointLight = !displayPointLight
            break
    }
}


function drawSkybox() {
    gl.enableVertexAttribArray(vTexCoord);
    gl.disableVertexAttribArray( vNormal);

    let modelMatrix = scalem(4, 4, 4);
    let modelMatrixLoc = gl.getUniformLocation( program, "modelMatrix" );
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix) );

    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "isFish"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isChair"), 0)
    gl.uniform1i(gl.getUniformLocation(program, "isCigar"), 0)
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArrayCube), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays( gl.TRIANGLES, 0, pointsArrayCube.length );
}

function drawFish() {

    gl.uniform1i(gl.getUniformLocation(program, "isFish"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isChair"), 0)
    gl.uniform1i(gl.getUniformLocation(program, "isCigar"), 0)

    // Wait for parsing to finish
    if (!fish.objParsed || !fish.mtlParsed) {
        setTimeout(() => drawFish(), 50);
        return;
    }

    // Get into proper spot of screen
    let modelMatrix = mult(rotateY(fishAngle), mult(rotateX(270), mult(scalem(0.03, 0.03, 0.03), translate(0, 0, -40))));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelMatrix))

    // Gather OBJ data if it hasn't been done
    if (fishPos.length === 0 && fishColors.length === 0 && fishNormal.length === 0 && fishTexCoords.length === 0) {

        for (let face of fish.faces) {
            let color = fish.diffuseMap.get(face.material) ?? [1, 1, 1, 1];
            for (let i = 0; i < face.faceVertices.length; i++) {
                fishPos.push(...face.faceVertices[i]);
                fishColors.push(...color);
                if (face.faceNormals.length > 0)    fishNormal.push(...face.faceNormals[i]);
                if (face.faceTexCoords.length > 0)  fishTexCoords.push(...face.faceTexCoords[i]);
            }
        }

    }

    const vertexCount = fishPos.length / 4;

    // Upload and bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fishPos), gl.STATIC_DRAW);
    let vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    // Upload and bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fishNormal), gl.STATIC_DRAW);
    let vNorm = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNorm, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNorm);

    // Upload and bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fishColors), gl.STATIC_DRAW);
    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    // Upload and bind tex bufer
    let tBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuf);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fishTexCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

function drawChair(){
    gl.uniform1i(gl.getUniformLocation(program, "isFish"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isChair"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "isCigar"), 0)

    // Wait for parse to finsih
     if (!chair.objParsed || !chair.mtlParsed) {
        setTimeout(() => drawChair(), 50);
        return;
    }

    // Get into proper part of screen
    let modelMatrix = mult(scalem(0.005, 0.005, 0.005), translate(760, -400, 60));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelMatrix))

    // Get OBJ data if it hasn't been done
    if (chairPos.length === 0 ) {

        for (let face of chair.faces) {
            for (let i = 0; i < face.faceVertices.length; i++) {
                let vertex = face.faceVertices[i];
                if (Math.abs(vertex[0]) > 2000 || Math.abs(vertex[1]) > 2000 || Math.abs(vertex[2]) > 2000)
                    continue
                chairPos.push(...vertex);
            }
        }

    }

    const vertexCount = chairPos.length / 4;

    // Set and bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(chairPos), gl.STATIC_DRAW);
    let vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

}

function drawCigar(){
    gl.uniform1i(gl.getUniformLocation(program, "isFish"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isChair"), 0)
    gl.uniform1i(gl.getUniformLocation(program, "isCigar"), 1)

    // Wait for parse to finish
    if (!cigar.objParsed || !cigar.mtlParsed) {
        setTimeout(() => drawCigar(), 50);
        return;
    }

    // If cigar is animating, change position
    if (cigarAnimate){
        if (cigarLeft){
            cigarPosAnimation += .01
            if (cigarPosAnimation >= -.15)
                cigarLeft = !cigarLeft
        }
        else{
            cigarPosAnimation -= .01
            if (cigarPosAnimation <= -.20)
                cigarLeft = !cigarLeft
        }
    }
    else{
        cigarPosAnimation = -.15
    }

    // Get to proper spot of the screen
    let modelMatrix = mult(rotateZ(90), mult(scalem(5, 5, 5), translate(-.235, cigarPosAnimation, 0)));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelMatrix))

    // If OBJ data hasn't been collected, set data
    if (cigarPos.length === 0){
        for (let face of cigar.faces){
            for (let i = 0; i < face.faceVertices.length; i++){
                cigarPos.push(...face.faceVertices[i])
                if (face.faceNormals.length > 0)    cigarNormal.push(...face.faceNormals[i]);
            }
        }
    }

    const vertexCount = cigarPos.length / 4;

    // Upload and bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cigarPos), gl.STATIC_DRAW);
    let vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    // Upload and bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cigarNormal), gl.STATIC_DRAW);
    let vNorm = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNorm, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNorm);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //Camera
    if (rotateScene)
        alpha += 0.005;

    if (fishRotation){
        fishAngle += 5
    }

    //Camera matrix
    let eye = vec3(2 * Math.sin(alpha), -1.0, 2 * Math.cos(alpha));
    let at = vec3(0.0, -1.0, 0.0);
    let up = vec3(0.0, 1.0, 0.0);
    let cameraMatrix = lookAt(eye, at, up);

    //Pushes the camera matrix, and the inverse camera matrix for reflection purposes
    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(cameraMatrix) );
    gl.uniformMatrix4fv(cameraInverseMatrixLoc, false, flatten(inverse(cameraMatrix)) );
    

    //Shadows
    //Tells shaders that we are dealing with the shadow that is cast now
    gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 1);

    //Vertical, against the far wall
    let modelShadowMatrix = mult(translate(0.0, -0.4, -1.95), shadowMatrix);
    gl.uniformMatrix4fv( shadowMatrixLoc, false, flatten(modelShadowMatrix) );    

    //Draws the fish's shadow
    drawFish();

    gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 0)
    gl.uniformMatrix4fv(shadowMatrixLoc, false, flatten(mat4()))
    gl.uniform1i(gl.getUniformLocation(program, "displayShadow"), displayShadow);
    gl.uniform1i(gl.getUniformLocation(program, "displaySpotlight"), displaySpotlight);
    //gl.uniform1i(gl.getUniformLocation(program, "displayPointLight"), displayPointLight);
    
    //Draws everything else without a shadow
    drawFish();
    drawChair();
    drawCigar();
    drawSkybox();

    //For text purposes in the html file
    document.getElementById("spotlight").textContent = displaySpotlight;
    document.getElementById("shadow").textContent = displayShadow;

    requestAnimFrame(render);
}
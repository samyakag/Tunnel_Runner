var cubeRotation = 0.0;
var pathLength = 240;
var sides = 8;
var angle = 22.5;
var rotate_right = 0;
var rotate_left = 0;
var jump = 0;
var move_camera_z = 0;
var move_camera_y = 0;
var down = 0;
var flash_flag = 0;
var flash_value = 0;
main();

//
// Start here
//
function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // If we don't have a GL context, give up now

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program

    // const vsSource = `
    //   attribute vec4 aVertexPosition;
    //   attribute vec4 aVertexColor;

    //   uniform mat4 uModelViewMatrix;
    //   uniform mat4 uProjectionMatrix;

    //   varying lowp vec4 vColor;

    //   void main(void) {
    //     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    //     vColor = aVertexColor;
    //   }
    // `;


    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;


    // console.log("sadasas");
    // Fragment shader program

    // const fsSource = `
    //   varying lowp vec4 vColor;

    //   void main(void) {
    //     gl_FragColor = vColor;
    //   }
    // `;

    const fsSource = `
    precision highp float;
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler1;
    uniform sampler2D uSampler2;
    uniform int gray_scale_flag;
    uniform highp float uFlash;
    void main(void) {
      vec4 color1  =  texture2D(uSampler1, vTextureCoord);
      vec4 color2  =  texture2D(uSampler2, vTextureCoord);
      lowp vec4 final = color1 * color2;
        if(gray_scale_flag != 0)
        {
            lowp float gray = (0.2 * final.r + 0.7 * final.g + 0.07 * final.b) * uFlash;
            gl_FragColor = vec4(gray, gray, gray, 1.0);
        }
        else{
            gl_FragColor = final * uFlash;            
        }      
    }
  `;
    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    // console.log(shaderProgram);
    // console.log("asdas");
    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.d

    // const programInfo = {
    //   program: shaderProgram,
    //   attribLocations: {
    //     vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    //     vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    //   },
    //   uniformLocations: {
    //     projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    //     modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    //   },
    // };

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uSampler1: gl.getUniformLocation(shaderProgram, 'uSampler1'),
            uSampler2: gl.getUniformLocation(shaderProgram, 'uSampler2'),
            uFlash: gl.getUniformLocation(shaderProgram, 'uFlash'),
            gray_scale_flag: gl.getUniformLocation(shaderProgram, 'gray_scale_flag'),
        },
    };


    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    var then = 0;

    const texture = [];
    texture.push(loadTexture(gl, 'wallpaper.png'));
    texture.push(loadTexture(gl, 'bricks2.jpg'));

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, texture, deltaTime);
        gl.uniform1f(programInfo.uniformLocations.uFlash, flash_value/10 + 1);
        gl.uniform1i(programInfo.uniformLocations.gray_scale_flag, 1);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

    // Create a buffer for the cube's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the cube.

    const positions = [];
    for (var j = 0; j < pathLength; j++) {
        angle = 22.5;
        for (var i = 0; i < sides; i++) {
            positions.push(2 * Math.cos(angle * Math.PI / 180));
            positions.push(2 * Math.sin(angle * Math.PI / 180));
            positions.push(1 - 2 * j);

            positions.push(2 * Math.cos((angle - 45) * Math.PI / 180));
            positions.push(2 * Math.sin((angle - 45) * Math.PI / 180));
            positions.push(1 - 2 * j);

            positions.push(2 * Math.cos(angle * Math.PI / 180));
            positions.push(2 * Math.sin(angle * Math.PI / 180));
            positions.push(-1 - 2 * j);

            positions.push(2 * Math.cos((angle - 45) * Math.PI / 180));
            positions.push(2 * Math.sin((angle - 45) * Math.PI / 180));
            positions.push(-1 - 2 * j);
            angle += 45;
        }
    }


    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [];
    for (var i = 0; i < pathLength; i++) {
        for (var j = 0; j < sides; j++) {
            textureCoordinates.push(
                // Front
                1.0, 0.0,
                0.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            );
        };
    };

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    // red = [1.0,  0.0,  0.0,  1.0];
    // white = [1.0,  1.0,  1.0,  1.0];    
    // green = [0.0,  1.0,  0.0,  1.0];
    // blue = [0.0,  0.0,  1.0,  1.0];
    // yellow = [1.0,  1.0,  0.0,  1.0];
    // purple =   [1.0,  0.0,  1.0,  1.0],
    // cyan = [0.0, 1.0, 1.0, 1.0];
    // greenish_yellow = [0.5, 1.0, 0.0, 1.0];
    // pink = [0.737255, 0.560784, 0.560784, 1.0];
    // scarlet = [0.55, 0.09 ,0.09, 1.0];
    // black = [0.0, 0.0, 0.0, 1.0];
    // var temp = {
    //   "1" : red,
    //   "2" : white,
    //   "3" : green,
    //   "4" : blue,
    //   "5" : yellow,
    //   "6" : purple,
    //   "7" : cyan,
    //   "8" : greenish_yellow,
    //   "9" : pink,
    //   "0" : scarlet,
    //   "10" : black,
    // };

    // // Convert the array of colors into a table for all the vertices.

    // var colors = [];
    // for(var i = 0 ; i < pathLength ; i++)
    // {
    //   for (var j = 0; j < 8; ++j) {
    //     if((i <= 10 && i >= 0) || (i <= 199 && i >= 185))
    //     {
    //       if((j%2 && i%2)  || (j%2 == 0 && i%2 == 0))
    //       {
    //         var c = temp["10"];// black
    //       }
    //       else
    //       {
    //         var c = temp["2"]; // white
    //       }
    //     }
    //     else
    //     {
    //       var choose = (Math.floor(Math.random() * 10))%10;
    //       var c = temp[choose.toString()];        
    //     }
    //     colors = colors.concat(c, c, c, c);

    //     // Repeat each color four times for the four vertices of the face
    //   }

    // }
    // const colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [];
    for (var j = 0; j < pathLength; j++) {
        for (var i = 0; i < sides; i++) {
            indices.push(32 * j + 4 * i);
            indices.push(32 * j + 4 * i + 1);
            indices.push(32 * j + 4 * i + 2);
            indices.push(32 * j + 4 * i + 1);
            indices.push(32 * j + 4 * i + 2);
            indices.push(32 * j + 4 * i + 3);
        }
    }

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };

    // return {
    //   position: positionBuffer,
    //   color: colorBuffer,
    //   indices: indexBuffer,
    // };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
    move_camera_z += 0.05;
    if (move_camera_z > 360) {
        move_camera_z = 0;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.


    if (rotate_right) {
        cubeRotation -= 5 * (Math.PI / 180);
    }
    if (rotate_left) {
        cubeRotation += 5 * (Math.PI / 180);
    }
    // if(flash_flag)
    // {
        // console.log("SADAS");
        flash_value = (flash_value + 0.05)%20;
    // }
    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    if (jump) {
        move_camera_y -= 1.0;
        down = 1;
        jump = 0;
    }

    if (down) {
        if (move_camera_y > 0.00) {
            move_camera_y = 0.00;
            down = 0;
        } else {
            move_camera_y += 0.05;
        }
    }
    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, move_camera_y, move_camera_z]); // amount to translate


    mat4.rotate(modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to rotate
        cubeRotation, // amount to rotate in radians
        [0, 0, 1]); // axis to rotate around (Z)
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //             modelViewMatrix,  // matrix to rotate
    //             cubeRotation * .7,// amount to rotate in radians
    //             [0, 1, 0]);       // axis to rotate around (X)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    // {
    //   const numComponents = 4;
    //   const type = gl.FLOAT;
    //   const normalize = false;
    //   const stride = 0;
    //   const offset = 0;
    //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    //   gl.vertexAttribPointer(
    //       programInfo.attribLocations.vertexColor,
    //       numComponents,
    //       type,
    //       normalize,
    //       stride,
    //       offset);
    //   gl.enableVertexAttribArray(
    //       programInfo.attribLocations.vertexColor);
    // }

    // tell webgl how to pull out the texture coordinates from buffer
    {
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32 bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }


    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture[0]);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler1, 0);

    // Tell WebGL we want to affect texture unit 1
    gl.activeTexture(gl.TEXTURE0 + 1);

    // Bind the texture to texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);

    // Tell the shader we bound the texture to texture unit 1
    gl.uniform1i(programInfo.uniformLocations.uSampler2, 1);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = 48 * pathLength;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    // Update the rotation for the next draw

    window.onkeydown = function(e) {
        // console.log('asdsa');
        var ascii = parseInt(e.keyCode);
        if (ascii == 65) {
            rotate_left = 1;
        } if (ascii == 68) {
            rotate_right = 1;
        } if (ascii == 32) {
            jump = 1;
        }
        if(ascii == 66){
            flash_flag = 1;
        }

    };


    window.onkeyup = function(e) {
        var ascii = parseInt(e.keyCode);
        // console.log('reer');
        if (ascii == 65) {
            rotate_left = 0;
        } else if (ascii == 68) {
            rotate_right = 0;
        }
        if(ascii == 66)
        {
            flash_flag = 0;
        }
    };
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // console.log(vertexShader);
    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn of mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}
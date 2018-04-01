function initBuffersObstacles(gl, n) {

    // Create a buffer for the cube's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the cube.

    const positions = [];
    for (var i = 0; i < n; i++) {

        if (i % 2 == 0) {
            positions.push(
                1.4, 0.0, 0.5 - 20 * i,
                1.0, 1.0, 0.5 - 20 * i,
                -1.4, 0.0, 0.5 - 20 * i,
                -1.0, -1.0, 0.5 - 20 * i,
            );
        } else if (i % 2 == 1) {
            positions.push(
                -1.4, -1.0, 0.5 - 20 * i,
                -1.0, -0.5, 0.5 - 20 * i,
                1.0, -0.5, 0.5 - 20 * i,
                1.4, -1.0, 0.5 - 20 * i,
            );
        }
    };

    // Now pass the list of positions into WebGL to build the
    // shape. We do this `by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [];
    for (var j = 0; j < n; j++) {
        textureCoordinates.push(
            // Front
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        );
    };

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);


    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    var indices = [];
    for (var i = 0; i < n; i++) {
        indices.push(4 * i, 4 * i + 1, 4 * i + 2, 4 * i, 4 * i + 2, 4 * i + 3);
    }
    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        vertexCount: indices.length,
        indices: indexBuffer,
    };
}
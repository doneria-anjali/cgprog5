/** Anjali Doneria, 200200056, adoneri*/

var red =    [0.9, 0.4, 0.0, 1.0];
var yellow = [1.0, 1.0, 0.0, 1.0];
var green  = [0.0, 1.0, 0.0, 1.0];
var cyan   = [0.0, 1.0, 1.0, 1.0];
var blue   = [0.0, 0.0, 1.0, 1.0];
var violet = [0.5, 0.0, 0.4, 1.0];
var orange = [0,1, 0.6, 0.0, 1.0];

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var SIZE = 40;                 
var FOV = 90;                 
var SHADOW_FACTOR = 0.6;                             
var SNAKE_SPEED = 100;     
var SNAKE_SIZE = 2;            

var sceneObjects = [];
var playerSnake;
var nonplayerSnake;

var shaderProgram = null;
var c_width = 0;
var c_height = 0;
var Z_DIM = 0;

var ANIMATION;
var TIMER;
var ANIMATION_NP;
var TIMER_NP;

var food = null;

class PlayerSnake{
    constructor(direction, size, start){
        this.size = size;
        this.direction=direction;

        var x = start[0];
        var y = start[1];
        var z = start[2];

        this.elements = [];
        for(var i=0; i<size; i++){
            this.elements.push(new Cube(x,y,z, true));
        }

        clearTimeout(ANIMATION);
        clearInterval(TIMER);

        this.animate();
    }

    collision(sn, e){
        //check collission with itself
        for(var i = 0; i < this.elements.length; i++){
            if(this.elements[i].x == e.x && this.elements[i].y == e.y && this.elements[i].z == e.z){
                return true;
            }
        }
        //check wall collission
        if(!(e.x < SIZE && e.x >= 0 && e.y < SIZE && e.y >= 0 && e.z < SIZE && e.z >= 0))
            return true;
        
        //check collission with NP snake
        for(var i = 0; i < sn.elements.length; i++){
            if(sn.elements[i].x == e.x && sn.elements[i].y == e.y && sn.elements[i].z == e.z)
                return true;
        }
        return false;
    }

    render(){
        for(var i = 0; i < this.elements.length; i++){
            this.elements[i].render();
        }
    }

    animate(){
        var snake = this;
        TIMER = setInterval(function(){snake.temps--;}, 1000);
        function timeout(){
            ANIMATION = setTimeout(function(){snake.move();timeout();}, SNAKE_SPEED);
        }
        timeout();
    }

    move(){
        var tail = this.elements.pop();
        var head = this.elements[0];
        var old = tail;
        tail.x = head.x + this.direction[0];
        tail.y = head.y + this.direction[1];
        tail.z = head.z + this.direction[2];

        if (this.collision(nonplayerSnake, tail)) {
            initSnake(true);
            return;
        }

        tail.init();
        this.elements.unshift(tail);

        if(food.x == tail.x && food.y == tail.y && food.z == tail.z){
            var snakeCollision = true;
            var s = this;
            var newFood = food;
			while(snakeCollision){
                newFood.x = Math.floor(Math.random()*SIZE);
                newFood.y = Math.floor(Math.random()*SIZE);
                newFood.z = Z_DIM;
                for(var i = 0; i < s.elements.length; i++){
                    if(!(newFood.x == s.elements[i].x && newFood.y == s.elements[i].y &&
                        newFood.z == s.elements[i].z))
                        snakeCollision = false;
                }
            }
            this.elements.push(new Cube(old.x,old.y,old.z, true));
            food = newFood;
            food.init();
        }
    }

}

class NPSnake{
    constructor(direction, size, start){
        this.size = size;
        this.direction=direction;

        var x=start[0];
        var y=start[1];
        var z=start[2];

        this.elements=[];
        for(var i=0; i < size; i++){
            this.elements.push(new Cube(x,y,z, false));
        }

        clearTimeout(ANIMATION_NP);
        clearInterval(TIMER_NP);

        this.animate();
    }

    collision(sn, e){
        //check collission with itself
        for(var i = 0; i < this.elements.length; i++){
            if(this.elements[i].x == e.x && this.elements[i].y == e.y && this.elements[i].z == e.z){
                return true;
            }
        }
        //check wall collission
        if(!(e.x < SIZE && e.x >= 0 && e.y < SIZE && e.y >= 0 && e.z < SIZE && e.z >= 0))
            return true;
        
        //check collission with NP snake
        for(var i = 0; i < sn.elements.length; i++){
            if(sn.elements[i].x == e.x && sn.elements[i].y == e.y && sn.elements[i].z == e.z)
                return true;
        }
        return false;
    }

    move(){
        var tail = this.elements.pop();
        var old = tail;
        var head = this.elements[0];
        
        //randomize its direction
        var random = Math.random();
        if(random > 0.5){
            var temp = this.direction[0];
            this.direction[0] = this.direction[1];
            this.direction[1] = temp;

            var multiplier = random < 0.75 ? 1 : -1;
            this.direction[0] *= multiplier;
            this.direction[1] *= multiplier;
        }

        tail.x = head.x + this.direction[0];
        tail.y = head.y + this.direction[1];
        tail.z = head.z + this.direction[2];

        if (this.collision(playerSnake, tail)) {
            initSnake(false);
            return;
        }

        tail.init();    
        this.elements.unshift(tail);

        if(tail.x == food.x && tail.y == food.y && tail.z == food.z){
            var snakeCollision = true;
            var s = this;
            var newFood = food;
			while(snakeCollision){
                newFood.x = Math.floor(Math.random()*SIZE);
                newFood.y = Math.floor(Math.random()*SIZE);
                newFood.z = Z_DIM;
                for(var i = 0; i < s.elements.length; i++){
                    if(!(newFood.x == s.elements[i].x && newFood.y == s.elements[i].y &&
                        newFood.z == s.elements[i].z))
                        snakeCollision = false;
                }
            }
            this.elements.push(new Cube(old.x,old.y,old.z, false));
            food = newFood;
            food.init();
        }
    }

    render(){
        for(var i = 0; i < this.elements.length; i++){
            this.elements[i].render();
        }
    }

    animate(){
        var snake = this;
        function timeout(){
            ANIMATION_NP = setTimeout(function(){snake.move();timeout();}, SNAKE_SPEED);
        }
        timeout();

        TIMER_NP = setInterval(function () {snake.temps--;}, 1000);
    }
}

class Cube{
	constructor(x, y, z, player){
        this.mode = glContext.TRIANGLES;
        this.indexBuffer = null;
        this.vertexBuffer = null;
		this.colorBuffer = null;
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = 1;
        this.vertices = [];
        this.indices = [];
        this.colors = [];
        this.player = player;
        this.init();
	}

    init(){
        this.initVertices();
        this.initColors();
    }

	initVertices(){
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var s = this.size;
        
        var v0=[x+0, y+0, z+0];
        var v1=[x+s, y+0, z+0];
        var v2=[x+s, y+0, z+s];
        var v3=[x+0, y+0, z+s];
        var v4=[x+0, y+s, z+0];
        var v5=[x+s, y+s, z+0];
        var v6=[x+s, y+s, z+s];
        var v7=[x+0, y+s, z+s];

        this.vertices = [].concat(v0,v1,v2,v0,v2,v3, v0,v4,v7,v0,v7,v3, v0,v1,v5,v0,v5,v4, 
                                    v1,v2,v6,v1,v6,v5, v4,v5,v6,v6,v4,v7, v7,v6,v3,v3,v6,v2);
    
        var vBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, vBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.vertices), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
        this.vertexBuffer = vBuffer;
	}

	initColors(){
        for(var i=0; i < this.vertices.length/3; i++)
            this.indices.push(i);
        
            var iBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, iBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, null);
        this.indexBuffer  = iBuffer;
        
        if(this.player){
            this.colors = [].concat(red, red, red, red, red, red,
                                        yellow, yellow, yellow, yellow, yellow, yellow,
                                        green, green, green, green, green, green,
                                        violet, violet, violet, violet, violet, violet,
                                        cyan, cyan, cyan, cyan, cyan, cyan,
                                        violet, violet, violet, violet, violet, violet);
        }else{
            this.colors = [].concat(red, red, red, red, red, red,
                yellow, yellow, yellow, yellow, yellow, yellow,
                green, green, green, green, green, green,
                violet, violet, violet, violet, violet, violet,
                cyan, cyan, cyan, cyan, cyan, cyan,
                yellow, yellow, yellow, yellow, yellow, yellow);
        }

        var cBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, cBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.colors), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
        this.colorBuffer = cBuffer;
    }
	
	render(){
        glContext.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexBuffer);
		glContext.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorBuffer);
		glContext.vertexAttribPointer(shaderProgram.colorAttribute, 4, glContext.FLOAT, false, 0, 0);
		glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		glContext.drawElements(this.mode, this.indices.length, glContext.UNSIGNED_SHORT,0);
	}
	
}

class Wall extends Cube{
    constructor(x,y,z){
		super(x,y,z, false);
	}
    initColors(){
        for(var i=0;i<this.vertices.length/3;i++){
            this.indices.push(i);
        }

        var iBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, iBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, null);
        this.indexBuffer  = iBuffer;
        
        this.colors = [].concat(red, red, red, red, red, red,
                                yellow, yellow, yellow, yellow, yellow, yellow,
                                green, green, green, green, green, green,
                                violet, violet, violet, violet, violet, violet,
                                cyan, cyan, cyan, cyan, cyan, cyan,
                                orange, orange, orange, orange, orange, orange);
        var cBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, cBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.colors), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
        this.colorBuffer  = cBuffer;
    }
}

class Food extends Cube{
    initColors(){
        for(var i=0;i<this.vertices.length/3;i++){
            this.indices.push(i);
        }
        
        var iBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, iBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, null);
        this.indexBuffer  = iBuffer;

        this.colors = [].concat(red, red, red, red, red, red,
                                red, red, red, red, red, red,
                                red, red, red, red, red, red,
                                red, red, red, red, red, red,
                                red, red, red, red, red, red,
                                red, red, red, red, red, red);
        
        var cBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, cBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(this.colors), glContext.STATIC_DRAW);
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
        this.colorBuffer  = cBuffer;
    }
}

function initSnake(player){
    if(player){
        playerSnake = new PlayerSnake([1,0,0],SNAKE_SIZE, [0,0,Z_DIM]);
        sceneObjects[1] = playerSnake;
    }
    else{
        nonplayerSnake = new NPSnake([1,0,0],SNAKE_SIZE*2, [SIZE/2,SIZE/2,Z_DIM]);
        sceneObjects[0] = nonplayerSnake;
    }
}

function initializeScene(){
	mat4.identity(mvMatrix);
    var z = SIZE*0.15 + SIZE/(2*Math.tan(FOV/2 * Math.PI/180));
    mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(-SIZE / 2, -SIZE / 2, -z));
    mat4.identity(pMatrix);
    mat4.perspective(pMatrix, FOV * Math.PI / 180.0, c_width / c_height, 0.1, z+1);
    glContext.enable(glContext.DEPTH_TEST);
    
    food = new Food(Math.floor(Math.random()*SIZE),Math.floor(Math.random()*SIZE),Z_DIM);

    sceneObjects = [];
    nonplayerSnake = new NPSnake([1,0,0], SNAKE_SIZE*2, [SIZE/2,SIZE/2,Z_DIM]);
    sceneObjects.push(nonplayerSnake);

    playerSnake = new PlayerSnake([1,0,0], SNAKE_SIZE, [0,0,Z_DIM]);
    sceneObjects.push(playerSnake);

    for(var i = 0; i < SIZE; i++){
        sceneObjects.push(new Wall(-1,i,Z_DIM));
        sceneObjects.push(new Wall(i,-1,Z_DIM));
        sceneObjects.push(new Wall(SIZE,i,Z_DIM));
        sceneObjects.push(new Wall(i,SIZE,Z_DIM));
    }
    
    glContext.clearColor(0.0, 0.0, 0.0, 0.0);
}

function requestAnimFrame(o) {
    requestAnimFrame(o);
}

requestAnimFrame = (function() {
    return window.requestAnimationFrame || function(callback){window.setTimeout(callback, 1000.0 / 60.0);
        };
})();

function renderSceneObjectsinLoop(timeStamp) {
    requestAnimFrame(renderSceneObjectsinLoop);
    renderScene();
}

function renderScene(){
	glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    glContext.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

    food.render();
    for(var i = 0; i < sceneObjects.length; i++){
        sceneObjects[i].render();
    }
}

function setUpShaders(){
    var vShaderCode = `
        attribute vec3 aVertexPosition;
        attribute vec4 aColor;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        varying vec4 vColor;

        uniform float uSize;
        uniform float uShadow;

        void main(void) {
            float a= (aVertexPosition.z / uSize) * uShadow + (1.0 - uShadow);
            vColor = aColor * (vec4(a,a,a,1.0));
            gl_PointSize=12.0;
            gl_PointSize=(aVertexPosition.z+8.0)*1.0;
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        }  
    
    `;

    var fShaderCode = `
        precision highp float;
        varying vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    var fShader = glContext.createShader(glContext.FRAGMENT_SHADER); // create frag shader
    glContext.shaderSource(fShader, fShaderCode); // attach code to shader
    glContext.compileShader(fShader); // compile the code for gpu execution

    var vShader = glContext.createShader(glContext.VERTEX_SHADER); // create vertex shader
    glContext.shaderSource(vShader, vShaderCode); // attach code to shader
    glContext.compileShader(vShader); // compile the code for gpu execution

    shaderProgram = glContext.createProgram(); // create the single shader program
    glContext.attachShader(shaderProgram, fShader); // put frag shader in program
    glContext.attachShader(shaderProgram, vShader); // put vertex shader in program
    glContext.linkProgram(shaderProgram); // link program into gl context

    glContext.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = glContext.getAttribLocation(shaderProgram, "aVertexPosition");
	glContext.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.colorAttribute = glContext.getAttribLocation(shaderProgram, "aColor");
	glContext.enableVertexAttribArray(shaderProgram.colorAttribute);
	shaderProgram.pMatrixUniform = glContext.getUniformLocation(shaderProgram, 'uPMatrix');
	shaderProgram.mvMatrixUniform = glContext.getUniformLocation(shaderProgram, 'uMVMatrix');

    shaderProgram.uSize = glContext.getUniformLocation(shaderProgram, "uSize");
    shaderProgram.uShadow = glContext.getUniformLocation(shaderProgram, "uShadow");

    glContext.uniform1f(shaderProgram.uSize, SIZE);
    glContext.uniform1f(shaderProgram.uShadow, SHADOW_FACTOR);
}

function setupWebGL(){
    var canvas = document.getElementById("myWebGLCanvas");
    canvas.width = canvas.height = Math.min(window.innerWidth, window.innerHeight);
    c_width = canvas.width;
    c_height = canvas.height;
    glContext = canvas.getContext("webgl");
    try {
        if (glContext == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            glContext.clearDepth(1.0); 
            glContext.enable(glContext.DEPTH_TEST); 
        }
    } // end try
    catch (e) {
        console.log(e);
    }
}

window.onkeydown = handleKeyDown;

function handleKeyDown(e) {    
    var codeDirMap = {
        "38": "up",       
        "87" : "up", //W
        "40": "down",     
        "83" : "down",   //S
        "65": "left", 
        "37": "left",  // A
        "68": "right", 
        "39": "right"// D
    };
    var direction = codeDirMap[e.keyCode];
    console.log(playerSnake);
    switch (direction) {
        case "up": //up
            playerSnake.direction = [0, 1, 0];
            break;
        case "down": //down
            playerSnake.direction = [0, -1, 0];
            break;
        case "left":
            playerSnake.direction = [-1, 0, 0];
            break;
        case "right": //right
            playerSnake.direction = [1, 0, 0];
            break;
        default: break;
    }
}

function main() {
    setupWebGL();
    setUpShaders();

	initializeScene();
    renderSceneObjectsinLoop();
}

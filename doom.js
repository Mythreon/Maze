const GAME_MAP = [
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X                         e      X              X",
    "X                       p                       X",
    "X       XXXXXXX   XXX                           X",
    "X       X           X            X              X",
    "X       X   XX  X   XXXXXXXXXX   X              X",
    "X       X   Xe  X   X        X   X              X",
    "X       X   XXXXX   X       eX   X              X", 
    "X       X           X     XXXX   X              X",
    "X       XXXXXXXXXXXXX            X              X",
    "X  e                                            X",
    "X                                               X",
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  ];
  
  const GRID_SIZE = 150;
  const PERSONAL_SPACE = 50;
  const RUN_SPEED = -25;
  const WALK_SPEED = -10;
  const MOUSE_SENSITIVITY = 0.0001;
  const CAM_X = 100;
  const CAM_Y = -75;
  const CAM_Z = 50;
  
  let walls = [];
  let player;
  let enemies = [];
  let projectiles = [];
  
  function setup() {
    createCanvas(920, 600, WEBGL);
    cursor(CROSS);
  
    for (let z = 0; z < GAME_MAP.length; z++) {
      for (let x = 0; x < GAME_MAP[z].length; x++) {
        let tile = GAME_MAP[z][x];
        let worldX = (x - GAME_MAP[z].length / 2) * GRID_SIZE;
        let worldZ = (z - GAME_MAP.length / 2) * GRID_SIZE;
        switch (tile) {
          case "p":
            player = new Player(worldX, worldZ);
            break;
          case "e":
            enemies.push(new Enemy(worldX, worldZ));
            break;
          case "X":
            walls.push(new Wall(worldX, worldZ, GRID_SIZE, 200, GRID_SIZE));
            break;
        }
      }
    }
  }
  
  function draw() {
    background("deepskyblue");
  
    ambientLight(150);
    directionalLight(180, 180, 180, 0, 0, -1);
  
    drawFloor();
    walls.forEach((wall) => wall.display());
  
    projectiles.forEach((projectile, index) => {
      projectile.update();
      projectile.display();
  
      if (projectile.isOffScreen() || projectile.checkCollision(walls)) {
        projectiles.splice(index, 1); 
      }
    });
  
    if (player) {  
      player.turnTowardsMouse();
      player.moveForward();
      player.updateCamera();
    }
  
    enemies.forEach((enemy) => enemy.display());
  }
  
  class Player {
    constructor(x, z) {
      this.x = x;
      this.z = z;
      this.direction = -1; 
      this.isMovingForward = false;
      this.isRunning = false;
    }
  
    moveForward() {
      if (!this.isMovingForward) {
        return;
      }
      let speed = this.isRunning ? RUN_SPEED : WALK_SPEED;
      let newX = this.x + Math.sin(this.direction) * speed;
      let newZ = this.z + Math.cos(this.direction) * speed;
      if (!this.checkCollision(newX, newZ)) {
        this.x = newX;
        this.z = newZ;
      }
    }
  
    checkCollision(newX, newZ) {
      for (let wall of walls) {
        if (
          newX > wall.x - (wall.w / 2 + PERSONAL_SPACE) &&
          newX < wall.x + (wall.w / 2 + PERSONAL_SPACE) &&
          newZ > wall.z - (wall.d / 2 + PERSONAL_SPACE) &&
          newZ < wall.z + (wall.d / 2 + PERSONAL_SPACE)
        ) {
          return true;
        }
      }
      return false;
    }
  
    turnTowardsMouse() {
      if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
      }
  
      const noTurnZoneStart = (width * 2) / 5;
      const noTurnZoneEnd = (width * 3) / 5;
      if (mouseX < noTurnZoneStart || mouseX > noTurnZoneEnd) {
        let mouseDelta = mouseX - width / 2;
        this.direction -= mouseDelta * MOUSE_SENSITIVITY;
      }
    }
  
    updateCamera() {
      let camX = this.x + Math.sin(this.direction) * CAM_X;
      let camZ = this.z + Math.cos(this.direction) * CAM_Z;
      let lookX = this.x - Math.sin(this.direction);
      let lookZ = this.z - Math.cos(this.direction);
      camera(camX, CAM_Y, camZ, lookX, CAM_Y, lookZ, 0, 1, 0);
    }
  }
  
  function keyPressed() {
    switch (keyCode) {
      case UP_ARROW:
        player.isMovingForward = true;
        break;
      case SHIFT:
        player.isRunning = true;
        break;
    }
  }
  
  function keyReleased() {
    switch (keyCode) {
      case UP_ARROW:
        player.isMovingForward = false;
        break;
      case SHIFT:
        player.isRunning = false;
        break;
    }
  }
  
  class Wall {
    constructor(x, z, w, h, d) {
      this.x = x;
      this.z = z;
      this.w = w;
      this.h = h;
      this.d = d;
    }
  
    display() {
      push();
      translate(this.x, -this.h / 2, this.z);
      fill(150);  
      box(this.w, this.h, this.d);
      pop();
    }
  }
  
  function drawFloor() {
    push();
    noStroke();
    fill("mediumseagreen");  
    translate(0, 0, 0);
    rotateX(HALF_PI);
    plane(width * 10, height * 10);
    pop();
  }
  
  class Enemy {
    constructor(x, z) {
      this.x = x;
      this.z = z;
      this.r = 50;
    }
  
    display() {
      push();
      noStroke();
      translate(this.x, -this.r, this.z);
      fill("red");  
      sphere(this.r);
      pop();
    }
  }
  
  class Projectile {
    constructor(x, z, direction) {
      this.x = x + Math.sin(direction) * 10;  
      this.z = z + Math.cos(direction) * 10;  
      this.direction = direction;
      this.speed = 15; 
      this.size = 10; 
    }
  
    update() {
      this.x += Math.sin(this.direction) * this.speed;
      this.z += Math.cos(this.direction) * this.speed;
    }
  
    display() {
      push();
      noStroke();
      fill(0);  
      translate(this.x, -this.size / 2, this.z);
      sphere(this.size);  
      pop();
    }
  
    isOffScreen() {
      return this.x < -width || this.x > width || this.z < -height || this.z > height;
    }
  
    checkCollision(walls) {
      for (let wall of walls) {
        if (
          this.x > wall.x - wall.w / 2 && this.x < wall.x + wall.w / 2 &&
          this.z > wall.z - wall.d / 2 && this.z < wall.z + wall.d / 2
        ) {
          return true;
        }
      }
      return false;
    }
  }
  
  function mousePressed() {
    if (player) {  
      let projectile = new Projectile(player.x, player.z, player.direction);
      projectiles.push(projectile);
    }
  }
  

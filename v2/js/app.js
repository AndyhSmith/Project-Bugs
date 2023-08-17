/** Copyright (c) 2023 Andy Smith */
// REVISION HISTORY:
// ahs 08/2023 - Started v2 revision

//Decelerations
var w = window.innerWidth;
var h = window.innerHeight;
animationCounter = 0;
var tick = 0;
var bugToggle = false;
var move = true;
var zoneToggle = false;
const scale = 2;
const height = 32;
const width = 32;

//Containers
var objects = [];
var zones = [];
var selected = [];

//Colors
var activeButtonColor = "lightgreen";
var normalButtonColor = "white";
var selectedColor = "rgb(255,255,0,.5)";

//Start
let img = new Image();
img.src = "./img/bugs_orig.png";
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.canvas.width = w;
ctx.canvas.height = h;
createZone(w / 2, h / 5, w / 10);
createBug(100, 100, 2);
createBug(250, 200, 2);
createBug(75, 300, 2);
createBug(20, 400, 2);

//---------------------------------------------------------------------------------------
// C L E A R   F U N C T I O N S

// These functions clear the screen
function clearBugs() {
    objects = [];
}

function clearZones() {
    zones = [];
}

//---------------------------------------------------------------------------------------
// T O G G L E   F U N C T I O N S

function toggleBugs() {
    if (bugToggle == true) {
        document.getElementById("user-action-1").style.backgroundColor = normalButtonColor;
        bugToggle = false;
    } else {
        document.getElementById("user-action-1").style.backgroundColor = activeButtonColor;
        bugToggle = true;
    }
}

function toggleZones() {
    if (zoneToggle == true) {
        zoneToggle = false;
        document.getElementById("user-action-2").style.backgroundColor = normalButtonColor;
    } else {
        zoneToggle = true;
        document.getElementById("user-action-2").style.backgroundColor = activeButtonColor;
    }
}

//---------------------------------------------------------------------------------------
// C R E A T E   O B J E C T S

function createZone(x, y, r) {
    var obj = {
        name: "zone",
        x: x,
        y: y,
        r: r,
        state: "off",
        fillColor: "rgba(255, 0, 0, 1)",
    };
    zones.push(obj);
}

function createBug(x, y, s) {
    var obj = {
        angle: 0,
        x: x,
        y: y,
        px: x,
        py: y,
        h: 16 * s,
        w: 16 * s,
        xTarget: 200,
        yTarget: 200,
        velocity: Math.random() * 3 + 5,
        xVelocity: 0,
        yVelocity: 0,
        moveDirection: "R",
        moveLeft: false,
        moveRight: false,
        animationSpeed: 7,
        animationPosition: 0,
        scale: s,
        selected: true,
        objType: getRandomInt(8) * 64,
        changed: true,
    };
    objects.push(obj);
}

//---------------------------------------------------------------------------------------
// B A S E   F U N C T I O N S

/**
 * @param {*} x1 x position of object 1
 * @param {*} y1 y position of object 1
 * @param {*} x2 x position of object 2
 * @param {*} y2 y position of object 2
 * @returns The radial distance between two objects
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

/**
 * @param {Int} max - The upper bound
 * @returns Returns a random number between 0 and max
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//---------------------------------------------------------------------------------------
// E V E N T S

function mouseClick(event) {
    var x = event.clientX;
    var y = h - event.clientY;

    // //Select Closest Object
    // for (o in objects) {
    // 	if (distance(x, y, objects[o].x, objects[o].y) < 20) {
    // 		if (objects[o].selected == false) {
    // 			objects[o].selected = true;
    // 		}else if (objects[o].selected == true) {
    // 			objects[o].selected = false;
    // 		}

    // 	}
    // }

    if (zoneToggle) {
        createZone(x, y, w / 10);
    }
    if (bugToggle) {
        createBug(x, y, 2);
    }
    for (o in objects) {
        if (objects[o].selected == true) {
            objects[o].xTarget = x;
            objects[o].yTarget = y;
            if (objects[o].x > objects[o].xTarget) {
                objects[o].moveDirection = "L";
            } else {
                objects[o].moveDirection = "R";
            }
            var deltaX = objects[o].xTarget - objects[o].x;
            var deltaY = objects[o].yTarget - objects[o].y;
            objects[o].angle = Math.atan((objects[o].yTarget - objects[o].y) / (objects[o].xTarget - objects[o].x));
            objects[o].xVelocity = Math.cos(objects[o].angle) * objects[o].velocity;
            objects[o].yVelocity = Math.sin(objects[o].angle) * objects[o].velocity;
        }
    }
}

//---------------------------------------------------------------------------------------
// L O G I C   F U N C T I O N S

function collision(o1, o2, x, y) {
    var distance = Math.sqrt(
        (objects[o1].x + x - objects[o2].x) * (objects[o1].x + x - objects[o2].x) +
            (objects[o1].y + y - objects[o2].y) * (objects[o1].y + y - objects[o2].y)
    );
    var deltaX = objects[o2].xTarget - objects[o2].x;
    var deltaY = objects[o2].yTarget - objects[o2].y;
    objects[o2].angle = Math.atan((objects[o2].yTarget - objects[o2].y) / (objects[o2].xTarget - objects[o2].x));
    objects[o2].xVelocity = Math.cos(objects[o2].angle) * objects[o2].velocity;
    objects[o2].yVelocity = Math.sin(objects[o2].angle) * objects[o2].velocity;
    if (distance < objects[o1].w / 1.5 + objects[o2].w / 1.5) {
        //(objects[o1].w / 2) + (objects[o2].w / 2)) {
        return true;
    }
}

function moveToLocation() {
    for (o in objects) {
        if (objects[o].selected == true) {
            objects[o].px = objects[o].x;
            objects[o].py = objects[o].y;
            if (objects[o].x > objects[o].xTarget) {
                //Left Half
                objects[o].moveLeft = true;
                for (e in objects) {
                    if (e != o) {
                        if (collision(o, e, -objects[o].xVelocity, 0)) {
                            move = false;
                        }
                    }
                }
                if (move) {
                    objects[o].x -= objects[o].xVelocity;
                }
                move = true;
                for (e in objects) {
                    if (e != o) {
                        if (collision(o, e, 0, -objects[o].yVelocity)) {
                            move = false;
                        }
                    }
                }
                if (move) {
                    objects[o].y -= objects[o].yVelocity;
                }
                move = true;
            } else {
                objects[o].moveLeft = false;
            }
            if (objects[o].x < objects[o].xTarget) {
                for (e in objects) {
                    if (e != o) {
                        if (collision(o, e, objects[o].xVelocity, 0)) {
                            move = false;
                        }
                    }
                }
                objects[o].moveRight = true;
                if (move) {
                    objects[o].x += objects[o].xVelocity;
                }
                move = true;

                for (e in objects) {
                    if (e != o) {
                        if (collision(o, e, 0, objects[o].yVelocity)) {
                            move = false;
                        }
                    }
                }
                objects[o].moveRight = true;
                if (move) {
                    objects[o].y += objects[o].yVelocity;
                }
                move = true;
            } else {
                objects[o].moveRight = false;
            }
        }
    }
}

function checkIfInZone() {
    for (o in objects) {
        //Check if in zone
        var inZone = false;
        for (z in zones) {
            inZone = false;
            for (n in objects) {
                var distance = Math.sqrt(
                    (objects[n].x - zones[z].x) * (objects[n].x - zones[z].x) + (objects[n].y - zones[z].y) * (objects[n].y - zones[z].y)
                );
                if (distance < zones[z].r) {
                    inZone = true;
                }
            }
            if (inZone) {
                zones[z].state = "green";
                zones[z].fillColor = "rgba(127, 131, 134, .3)";
            } else {
                zones[z].state = "black";
                zones[z].fillColor = "rgba(127, 131, 134, 1)";
            }
        }
    }
}

function updateObjects() {
    moveToLocation();
    checkIfInZone();
}

//---------------------------------------------------------------------------------------
// V I S U A L

function updateGraphics() {
    ctx.clearRect(0, 0, w, h);

    //Draw Objects
    for (o in objects) {
        // Draw Selection Circle
        // if (objects[o].selected == true) {
        // 	ctx.beginPath();
        // 	ctx.fillStyle = selectedColor;
        // 	ctx.arc(objects[o].x, h - objects[o].y, 26, 0, 2 * Math.PI);
        // 	ctx.fill()
        // }

        if (objects[o].px != objects[o].x && objects[o].py != objects[o].y) {
            // moving
            objects[o].animationPosition = (animationCounter % objects[o].animationSpeed) + 5;
            objects[o].changed = true;
        } else {
            // not moving
            if (objects[o].changed) {
                objects[o].animationPosition = animationCounter % 2;
                objects[o].changed = false;
            } else if (Math.random() < 0.05) {
                objects[o].animationPosition = animationCounter % 2;
            } else if (Math.random() < 0.02) {
                objects[o].xTarget = Math.random() * window.innerWidth;
                objects[o].yTarget = Math.random() * window.innerHeight;
                if (objects[o].x > objects[o].xTarget) {
                    objects[o].moveDirection = "L";
                } else {
                    objects[o].moveDirection = "R";
                }
                objects[o].angle = Math.atan((objects[o].yTarget - objects[o].y) / (objects[o].xTarget - objects[o].x));
                objects[o].xVelocity = Math.cos(objects[o].angle) * objects[o].velocity;
                objects[o].yVelocity = Math.sin(objects[o].angle) * objects[o].velocity;
            }

            // objects[o].objType = 0//32 * 4
        }
        ctx.save();
        ctx.translate(objects[o].x, h - objects[o].y);
        if (objects[o].moveDirection == "L") {
            ctx.rotate(-objects[o].angle - Math.PI / 2);
        } else {
            ctx.rotate(-objects[o].angle + Math.PI / 2);
        }
        // 544x 512y
        ctx.drawImage(
            img,
            width * objects[o].animationPosition,
            objects[o].objType,
            32,
            32,
            -16 * objects[o].scale,
            -16 * objects[o].scale,
            32 * objects[o].scale,
            32 * objects[o].scale
        );
        ctx.restore();
    }
    // add bugs

    //draw zones
    for (o in zones) {
        ctx.beginPath();
        // ctx.strokeStyle = zones[o].state;
        ctx.fillStyle = zones[o].fillColor;
        ctx.arc(zones[o].x, h - zones[o].y, zones[o].r, 0, 2 * Math.PI);
        // ctx.stroke();
        ctx.fill();
    }
}

//---------------------------------------------------------------------------------------
// I N T E R V A L

setInterval(function () {
    updateObjects();
    updateGraphics();
    tick += 1;
    if (tick % 2 == 0) {
        animationCounter += 1;
    }
}, 32);

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

//---------------------------------------------------------------------------------------
// Animation Indexes

var animations = {
    bug1: {
        walking: [
            [4, 0],
            [5, 0],
            [6, 0],
            [7, 0],
            [8, 0],
            [9, 0],
            [10, 0],
            [11, 0],
        ],
    },
};

// createBug(100, 100, 1, animations.bug1);
// createBug(250, 200, 1);
// createBug(75, 300, 1);
// createBug(20, 400, 1);
let bugCount = 1;
for (let i = 0; i < bugCount; i++) {
    createBug(Math.random() * 400, i * 40, 0.2 + Math.random() * 2, animations.bug1);
}

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

function createBug(x, y, s, animationSprites) {
    var bug = {
        angle: 0,
        debug: 1,
        x: x,
        y: y,
        h: 16 * s,
        w: 16 * s,
        xTarget: 200,
        yTarget: 200,
        targets: [],
        velocity: Math.random() * 3 + 5,
        xVelocity: 0,
        xSpeed: 0, // yVelocity but always positive
        yVelocity: 0,
        ySpeed: 0, // yVelocity but always positive
        moveLeft: false,
        moveRight: false,
        animation: animationSprites,
        animationSpeed: 7,
        animationFrame: 0,
        scale: s,
        selected: true,
        objType: getRandomInt(8) * 64,
        changed: true,
    };
    objects.push(bug);
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
        createBug(x, y, Math.random() + 0.5);
    }
    for (o in objects) {
        objects[o].xTarget = x;
        objects[o].yTarget = y;
        objects[o].targets.push([x, y]);

        calcTrajectory(o);
    }
}

function calcTrajectory(index) {
    if (objects[index].targets.length > 0) {
        objects[index].xTarget = objects[index].targets[0][0];
        objects[index].yTarget = objects[index].targets[0][1];
        if (
            atTarget(
                objects[index].x,
                objects[index].y,
                objects[index].xTarget,
                objects[index].yTarget,
                objects[index].xSpeed + 100,
                objects[index].ySpeed + 100
            )
        ) {
            objects[index].targets.shift();
        }
        var deltaX = objects[index].xTarget - objects[index].x;
        var deltaY = objects[index].yTarget - objects[index].y;
        let newAngle = Math.atan2(deltaY, deltaX);

        if (newAngle < 0) {
            newAngle += 2 * Math.PI;
        }
        objects[index].angle += (newAngle - objects[index].angle) / 10;

        // New velocity
        let xVelocityNew = Math.cos(objects[index].angle) * objects[index].velocity;
        let yVelocityNew = Math.sin(objects[index].angle) * objects[index].velocity;

        objects[index].xVelocity += (xVelocityNew - objects[index].xVelocity) / 10;
        objects[index].yVelocity += (yVelocityNew - objects[index].yVelocity) / 10;

        // objects[index].xVelocity = xVelocityNew;
        // objects[index].yVelocity = yVelocityNew;

        // Set velocity speeds
        objects[index].xSpeed = Math.abs(objects[index].xVelocity);
        objects[index].ySpeed = Math.abs(objects[index].yVelocity);
    }
}

function calcBoidsTrajectory(index) {}

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

/**
 * Checks for collisions and other things that would stop the bug from moving
 * @param {Int} i - Index in bug list
 * @returns {int} 1 if bug can move, else 0
 */
function canMove(i) {
    for (let j in objects) {
        // Don't collide with self
        if (i == j) {
            continue;
        }

        // Check distance without square root
        let distance =
            Math.pow(objects[i].x + objects[i].xVelocity - objects[j].x, 2) + Math.pow(objects[i].y + objects[i].yVelocity - objects[j].y, 2);

        let collisionDistance = Math.pow(objects[i].w + objects[j].w, 2);

        if (distance < collisionDistance) {
            return 0;
        }
    }
    return 1;
}

/**
 * Controls the movement of the bugs
 */
function moveBugs() {
    for (let i in objects) {
        calcTrajectory(i);

        // Quit if bug has no velocity
        if (objects[i].xVelocity == 0 || objects[i].yVelocity == 0) {
            continue;
        }

        if (!canMove(i)) {
            // Quit if bug can't move
            objects[i].angle += 0.3;
            continue;
        }

        objects[i].x += objects[i].xVelocity;
        objects[i].y += objects[i].yVelocity;

        // Stop bugs
        if (atTarget(objects[i].x, objects[i].y, objects[i].xTarget, objects[i].yTarget, objects[i].xSpeed + 10, objects[i].ySpeed + 10)) {
            stopMoving(i);
        }
    }
}

/**
 * Checks to see if a point at x1,y1 is is within range of point at x2,y2
 * @param {Double} x1 - point 1 x position
 * @param {Double} y1 - point 1 y position
 * @param {Double} x2 - point 2 x position
 * @param {Double} y2 - point 2 y position
 * @param {Double} rangeX - range to check along x axis
 * @param {Double} rangeY - range to check along y axis
 * @returns 1 if at target, else 0
 */
function atTarget(x1, y1, x2, y2, rangeX, rangeY) {
    if (Math.abs(x1 - x2) < rangeX && Math.abs(y1 - y2) < rangeY) {
        return 1;
    }
    return 0;
}

/**
 * Stop an object from moving
 * @param {Int} index - Index of the object to stop
 */
function stopMoving(index) {
    // Clear velocity and speed
    objects[index].xVelocity = 0;
    objects[index].yVelocity = 0;
    objects[index].xSpeed = 0;
    objects[index].ySpeed = 0;

    // TODO Handle logic to stop animation
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
    moveBugs();
    checkIfInZone();
}

//---------------------------------------------------------------------------------------
// V I S U A L

function updateGraphics() {
    ctx.clearRect(0, 0, w, h);

    //Draw Objects
    for (let i in objects) {
        // Draw Selection Circle
        if (objects[i].debug == 1) {
            ctx.beginPath();
            ctx.fillStyle = selectedColor;
            ctx.arc(objects[i].x, h - objects[i].y, objects[i].w, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.save();
        ctx.translate(objects[i].x, h - objects[i].y);
        ctx.rotate(-objects[i].angle + Math.PI / 2);

        objects[i].animationFrame += 0.5;

        ctx.drawImage(
            img,
            width * objects[i].animation.walking[Math.floor(objects[i].animationFrame) % objects[i].animation.walking.length][0],
            height * objects[i].animation.walking[Math.floor(objects[i].animationFrame) % objects[i].animation.walking.length][1],
            32,
            32,
            -16 * objects[i].scale,
            -16 * objects[i].scale,
            32 * objects[i].scale,
            32 * objects[i].scale
        );
        ctx.restore();
    }
}

// function updateGraphics() {
//     ctx.clearRect(0, 0, w, h);

//     //Draw Objects
//     for (o in objects) {
//         // Draw Selection Circle

//         ctx.beginPath();
//         ctx.fillStyle = selectedColor;
//         ctx.arc(objects[o].x, h - objects[o].y, objects[o].w, 0, 2 * Math.PI);
//         ctx.fill();

//         if (objects[o].px != objects[o].x && objects[o].py != objects[o].y) {
//             // moving
//             objects[o].animationFrame = (animationCounter % objects[o].animationSpeed) + 5;
//             objects[o].changed = true;
//         } else {
//             // not moving
//             if (objects[o].changed) {
//                 objects[o].animationFrame = animationCounter % 2;
//                 objects[o].changed = false;
//             } else if (Math.random() < 0.05) {
//                 objects[o].animationFrame = animationCounter % 2;
//             }

//             // objects[o].objType = 0//32 * 4
//         }
//         ctx.save();
//         ctx.translate(objects[o].x, h - objects[o].y);
//         ctx.rotate(-objects[o].angle + Math.PI / 2);

//         ctx.drawImage(
//             img,
//             width * objects[o].animationFrame,
//             objects[o].objType,
//             32,
//             32,
//             -16 * objects[o].scale,
//             -16 * objects[o].scale,
//             32 * objects[o].scale,
//             32 * objects[o].scale
//         );
//         ctx.restore();
//     }
//     // add bugs

//     //draw zones
//     for (o in zones) {
//         ctx.beginPath();
//         // ctx.strokeStyle = zones[o].state;
//         ctx.fillStyle = zones[o].fillColor;
//         ctx.arc(zones[o].x, h - zones[o].y, zones[o].r, 0, 2 * Math.PI);
//         // ctx.stroke();
//         ctx.fill();
//     }
// }

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

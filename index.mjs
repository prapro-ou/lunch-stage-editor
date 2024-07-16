import { obstacleType } from "./enum.mjs";
import { stage } from "./stage.mjs";
import { View } from "./view.mjs";

stage.roadPoint.shift();

const mudImage = new Image();
mudImage.src = 'image/mud.png';
const ingredientImage = new Image();
ingredientImage.src = 'image/ingredient.png';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const roadWidthInput = document.getElementById('roadWidth');
const goalDistanceInput = document.getElementById('goalDistance');
const updateStageButton = document.getElementById('updateStage');
const copyStageButton = document.getElementById('copyStage');
const modeLabel = document.getElementById('mode');

const pixelSize = 3

const view = new View(ctx, stage, pixelSize);

function draw() {
    canvas.width = 100 * pixelSize + 200
    canvas.height = stage.goalDistance * pixelSize
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    view.drawRoad(100 * pixelSize, canvas.height);
    drawRoadInfo(100 * pixelSize);
    drawRoadPointer();
    drawObstacle();
    drawIngredient();
}

function drawRoadInfo(areaX) {
    for (let i = 0; i < stage.roadPoint.length; i++) {
        const p = stage.roadPoint[i];
        const content = `d=${p.d}, x=${p.x}`;
        const y = p.d - 4*(i == stage.roadPoint.length - 1);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText(content, areaX + 10, canvas.height - y * pixelSize);
    }
    for (let i = 0; i < stage.roadPoint.length - 1; i++) {
        const p0 = stage.roadPoint[i];
        const p1 = stage.roadPoint[i+1];
        const content = `傾斜 ${(100 * (p1.x - p0.x) / (p1.d - p0.d)).toFixed(2)}%`;
        const y = (p1.d + p0.d) / 2;
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText(content, areaX + 10, canvas.height - y * pixelSize);
    }
}

function drawRoadPointer() {
    for (let i = 0; i < stage.roadPoint.length; i++) {
        const point = stage.roadPoint[i];
        const y = canvas.height - point.d * pixelSize;
        const x = point.x * pixelSize;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = 'lightgreen';
        ctx.fill();
    }
}

function drawObstacle() {
    stage.obstacles.forEach(obstacle => {
        const y = canvas.height - obstacle.d * pixelSize;
        const x = obstacle.x * pixelSize;
        const scaleFactor = 1.5 / 8 * pixelSize;

        if (mudImage.complete) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                mudImage,
                x - mudImage.width * scaleFactor / 2,
                y - mudImage.height * scaleFactor / 2,
                mudImage.width * scaleFactor,
                mudImage.height * scaleFactor,
            );
        }
    });
}

function drawIngredient() {
    stage.ingredients.forEach(ingredient => {
        const y = canvas.height - ingredient.d * pixelSize;
        const x = ingredient.x * pixelSize;
        const scaleFactor = 2 / 8 * pixelSize;

        if (ingredientImage.complete) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                ingredientImage,
                x - ingredientImage.width * scaleFactor / 2,
                y - ingredientImage.height * scaleFactor / 2,
                ingredientImage.width * scaleFactor,
                ingredientImage.height * scaleFactor,
            );
        }
    });
}

updateStageButton.addEventListener('click', () => {
    stage.roadWidth = parseFloat(roadWidthInput.value);
    stage.goalDistance = parseFloat(goalDistanceInput.value);
    const lastPointX = stage.roadPoint[stage.roadPoint.length-1].x;
    stage.roadPoint = stage.roadPoint.filter((p) => p.d < stage.goalDistance);
    stage.roadPoint.push({x: lastPointX, d: stage.goalDistance});
    draw();
});

copyStageButton.addEventListener('click', () => {
    let s = `{\n    roadPoint: [\n        {d: -50, x: ${stage.roadPoint[0].x}},`;
    for (let i = 0; i < stage.roadPoint.length; i++) {
        let p = stage.roadPoint[i];
        s += `\n        {d: ${p.d}, x: ${p.x}},`;
    }
    s += "\n    ],\n    obstacles: [";
    for (let i = 0; i < stage.obstacles.length; i++) {
        let p = stage.obstacles[i];
        s += `\n        {type: ${p.type}, d: ${p.d}, x: ${p.x}},`;
    }
    s += "\n    ],\n    ingredients: [";
    for (let i = 0; i < stage.ingredients.length; i++) {
        let p = stage.ingredients[i];
        s += `\n        {d: ${p.d}, x: ${p.x}},`;
    }
    s += `\n    ],\n    roadWidth: ${stage.roadWidth},`;
    s += `\n    goalDistance: ${stage.goalDistance},`;
    s += "\n}"
    navigator.clipboard.writeText(s);
})

function nearest(arr, x, y) {
    let minDist = Infinity;
    let near = null;
    arr.forEach((point, index) => {
        const pointX = point.x * pixelSize;
        const pointY = canvas.height - point.d * pixelSize;
        const dist = Math.hypot(x - pointX, y - pointY);
        if (dist < minDist) {
            minDist = dist;
            near = index;
        }
    });
    if (minDist > 10) return null;
    return near;
}

// マウス操作のための変数
let isDragging = false;
let selectedPoint = null;

// クリックイベントのリスナーを追加
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const x = Math.round(mouseX / pixelSize);
    const d = Math.round((canvas.height - mouseY) / pixelSize);

    switch (mode) {
        case modes.road:
            if (pressedKeys.has("c")) {
                let i = stage.roadPoint.findIndex((p) => p.d >= d);
                if (stage.roadPoint[i].d == d) return;
                stage.roadPoint.splice(i, 0, {d: d, x: x});
            }

            selectedPoint = nearest(stage.roadPoint, mouseX, mouseY)
            if (!selectedPoint && selectedPoint != 0) return;

            if (pressedKeys.has("d")) {
                stage.roadPoint.splice(selectedPoint, 1);
                selectedPoint = null;

            } else {
                isDragging = true;
            }
            break;

        case modes.mud:
            if (pressedKeys.has("c")) {
                let i = stage.obstacles.findIndex((p) => p.d >= d);
                if (i != -1 && stage.obstacles[i].d == d) return;
                if (i == -1) i = 0;
                stage.obstacles.splice(i, 0, {type: obstacleType.mud, d: d, x: x});
            }

            selectedPoint = nearest(stage.obstacles, mouseX, mouseY)
            if (!selectedPoint && selectedPoint != 0) return;

            if (pressedKeys.has("d")) {
                stage.obstacles.splice(selectedPoint, 1);
                selectedPoint = null;

            } else {
                isDragging = true;
            }
            break;

        case modes.ingredient:
            if (pressedKeys.has("c")) {
                let i = stage.ingredients.findIndex((p) => p.d >= d);
                if (i != -1 && stage.ingredients[i].d == d) return;
                if (i == -1) i = 0;
                stage.ingredients.splice(i, 0, {d: d, x: x});
            }

            selectedPoint = nearest(stage.ingredients, mouseX, mouseY)
            if (!selectedPoint && selectedPoint != 0) return;

            if (pressedKeys.has("d")) {
                stage.ingredients.splice(selectedPoint, 1);
                selectedPoint = null;

            } else {
                isDragging = true;
            }
            break;
    }
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (!isDragging || !selectedPoint && selectedPoint != 0) return;

    switch (mode) {
        case modes.road:
            stage.roadPoint[selectedPoint].x = Math.round(mouseX / pixelSize);
            if (selectedPoint != 0 && selectedPoint != stage.roadPoint.length - 1) {
                stage.roadPoint[selectedPoint].d = Math.round((canvas.height - mouseY) / pixelSize);
            }
            break;

        case modes.mud:
            stage.obstacles[selectedPoint].x = Math.round(mouseX / pixelSize);
            stage.obstacles[selectedPoint].d = Math.round((canvas.height - mouseY) / pixelSize);
            break;

        case modes.ingredient:
            stage.ingredients[selectedPoint].x = Math.round(mouseX / pixelSize);
            stage.ingredients[selectedPoint].d = Math.round((canvas.height - mouseY) / pixelSize);
            break;
    }
});

function mouseUpOrMouseOut() {
    isDragging = false;
    selectedPoint = null;
}
canvas.addEventListener('mouseup', mouseUpOrMouseOut);
canvas.addEventListener('mouseout', mouseUpOrMouseOut);

roadWidthInput.value = stage.roadWidth
goalDistanceInput.value = stage.goalDistance

function gameLoop() {
    flame_limitter_count += 1
    if (flame_limitter_count == flame_limitter) {
        flame_limitter_count = 0
        draw();
    }
    requestAnimationFrame(gameLoop);
}

const modes = {
    road: "mode-road",
    mud: "mode-mud",
    ingredient: "mode-ingredient",
};
let mode = modes.road;

let pressedKeys = new Set();
document.addEventListener("keydown", function(e) {
    pressedKeys.add(e.key)
    switch (e.key) {
        case "1":
            mode = modes.road;
            modeLabel.innerText = "モード【道】";
            break;
        case "2":
            mode = modes.mud;
            modeLabel.innerText = "モード【泥水】";
            break;
        case "3":
            mode = modes.ingredient;
            modeLabel.innerText = "モード【食材】";
            break;
    }
});
document.addEventListener("keyup", function(e) {
    pressedKeys.delete(e.key)
});

const flame_limitter = 4;
let flame_limitter_count = 0;
requestAnimationFrame(gameLoop);

import { obstacleType } from "./enum.mjs";
import { stage } from "./stage.mjs";
import { RoadView } from "./RoadView.mjs";
import { InfoView } from "./InfoView.mjs";
import { StageHandler } from "./StageHandler.mjs";

stage.roadPoint.shift();

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const roadWidthInput = document.getElementById('roadWidth');
const goalDistanceInput = document.getElementById('goalDistance');
const updateStageButton = document.getElementById('updateStage');
const copyStageButton = document.getElementById('copyStage');
const modeLabel = document.getElementById('mode');

const pixelSize = 3

const roadView = new RoadView(ctx, stage, pixelSize, 100 * pixelSize, canvas.height);
const infoView = new InfoView(ctx, stage, pixelSize, 100 * pixelSize, canvas.height);
const stageHandler = new StageHandler(stage)

function draw() {
    canvas.width = 100 * pixelSize + 200
    canvas.height = stage.goalDistance * pixelSize
    roadView.updateSize(100 * pixelSize, canvas.height);
    infoView.updateSize(100 * pixelSize, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    roadView.drawRoad();
    infoView.drawRoadInfo();
    roadView.drawRoadPointer();
    roadView.drawObstacle();
    roadView.drawIngredient();
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
    const json = stageHandler.convertToJSON();
    navigator.clipboard.writeText(json);
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

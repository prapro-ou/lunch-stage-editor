import { obstacleType, objectTypes } from "./enum.mjs";
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
    const roadWidth = parseFloat(roadWidthInput.value);
    const goalDistance = parseFloat(goalDistanceInput.value);
    stageHandler.updateRoadWidth(roadWidth);
    stageHandler.updateGoalDistance(goalDistance);
});

copyStageButton.addEventListener('click', () => {
    const json = stageHandler.convertToJSON();
    navigator.clipboard.writeText(json);
})

// マウス操作のための変数
let isDragging = false;
let selectedPoint = null;

// クリックイベントのリスナーを追加
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const { x, d } = roadView.getMousePointXD(mouseX, mouseY);

    if (pressedKeys.has("c")) {
        stageHandler.createObject(objectTypeFor[mode], x, d);
    }

    selectedPoint = stageHandler.objectPointNear(objectTypeFor[mode], x, d);
    if (!selectedPoint && selectedPoint != 0) return;

    if (pressedKeys.has("d")) {
        stageHandler.deleteObject(objectTypeFor[mode], selectedPoint);
        selectedPoint = null;
    } else {
        isDragging = true;
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

const objectTypeFor = {
    [modes.road]: objectTypes.road,
    [modes.mud]: objectTypes.mud,
    [modes.ingredient]: objectTypes.ingredient,
};

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

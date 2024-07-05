const obstacleType = {
    mud: "obstacleType-mud"
}

let stage = {
    roadPoint: [
        {d: 0, x: 22}, // dは上方向(yとは逆の向き)
        {d: 150, x: 22},
        {d: 250, x: 42},
        {d: 450, x: 42},
        {d: 500, x: 52},
        {d: 650, x: 52},
        {d: 750, x: 72},
        {d: 850, x: 72},
        {d: 950, x: 52},
        {d: 1050, x: 52},
        {d: 1150, x: 32},
        {d: 1350, x: 32},
        {d: 1400, x: 22},
        {d: 1500, x: 22}
    ],
    obstacles: [
        // {type: obstacleType.mud, d: 120, x: 15},
    ],
    roadWidth: 40.0,
    goalDistance: 1500
}

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const roadWidthInput = document.getElementById('roadWidth');
const goalDistanceInput = document.getElementById('goalDistance');
const updateStageButton = document.getElementById('updateStage');
const copyStageButton = document.getElementById('copyStage');

const pixelSize = 3

function draw() {
    canvas.width = 100 * pixelSize + 200
    canvas.height = stage.goalDistance * pixelSize
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad(100 * pixelSize, canvas.height);
    drawRoadInfo(100 * pixelSize);
    drawRoadPointer();
    drawObstacle();
}

function drawRoad(areaWidth) {
    let i = 0;
    for (let d = 0; d <= stage.goalDistance; d++) {
        while (stage.roadPoint[i+1].d < d) { i += 1; }
        const r = (d - stage.roadPoint[i].d) / (stage.roadPoint[i+1].d - stage.roadPoint[i].d);
        const center = stage.roadPoint[i+1].x * r + stage.roadPoint[i].x * (1-r);
        const roadLeft = Math.round(center - stage.roadWidth / 2);
        const roadRight = Math.round(center + stage.roadWidth / 2);
        for (let x = 0; x < areaWidth / pixelSize + 1; x++) {
            if (x >= roadLeft && x <= roadRight) {
                ctx.fillStyle = "gray";
            } else if (x == roadLeft - 1 || x == roadRight + 1) {
                ctx.fillStyle = "black";
            } else {
                ctx.fillStyle = "green";
            }
            ctx.fillRect(x * pixelSize, canvas.height - (d * pixelSize), pixelSize, pixelSize);
        }
    }
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
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2, false);
        ctx.fillStyle = 'brown';
        ctx.fill();
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
    let s = "{\n    roadPoint: [";
    for (let i = 0; i < stage.roadPoint.length; i++) {
        let p = stage.roadPoint[i];
        s += `\n        {d: ${p.d}, x: ${p.x}},`;
    }
    s += "\n    ],\n    obstacles: [],";
    s += `\n    roadWidth: ${stage.roadWidth},`;
    s += `\n    goalDistance: ${stage.goalDistance},`;
    s += "\n}"
    navigator.clipboard.writeText(s);
})

// マウス操作のための変数
let isDragging = false;
let selectedPoint = null;

// クリックイベントのリスナーを追加
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (pressedKeys.has("c")) {
        const x = Math.round(mouseX / pixelSize);
        const d = Math.round((canvas.height - mouseY) / pixelSize);
        let i = stage.roadPoint.findIndex((p) => p.d >= d);
        if (stage.roadPoint[i].d == d) return;
        stage.roadPoint.splice(i, 0, {d: d, x: x});
    }

    // クリックされた位置に最も近いroadPointを特定
    let minDist = Infinity;
    stage.roadPoint.forEach((point, index) => {
        const pointX = point.x * pixelSize;
        const pointY = canvas.height - point.d * pixelSize;
        const dist = Math.hypot(mouseX - pointX, mouseY - pointY);
        if (dist < minDist) {
            minDist = dist;
            selectedPoint = index;
        }
    });

    // 距離が一定以下でないならreturn
    if (minDist > 10) return;

    if (pressedKeys.has("d")) {
        stage.roadPoint.splice(selectedPoint, 1);
        selectedPoint = null;

    } else {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging && selectedPoint !== null) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // 選択されたpointを更新
        stage.roadPoint[selectedPoint].x = Math.round(mouseX / pixelSize);
        if (selectedPoint != 0 && selectedPoint != stage.roadPoint.length - 1) {
            stage.roadPoint[selectedPoint].d = Math.round((canvas.height - mouseY) / pixelSize);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    selectedPoint = null;
});

canvas.addEventListener('mouseout', () => {
    isDragging = false;
    selectedPoint = null;
});

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

let pressedKeys = new Set();
document.addEventListener("keydown", function(e) {
    pressedKeys.add(e.key)
});
document.addEventListener("keyup", function(e) {
    pressedKeys.delete(e.key)
});

const flame_limitter = 4;
let flame_limitter_count = 0;
requestAnimationFrame(gameLoop);

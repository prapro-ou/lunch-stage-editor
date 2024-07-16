import { obstacleType } from "./enum.mjs";

// DriveSceneでの描画を再現して道路全体を描画するクラス
export class RoadView {
    constructor(ctx, stage, pixelSize, width, height) {
        this.ctx = ctx;
        this.stage = stage;
        this.pixelSize = pixelSize;
        this.width = width;
        this.height = height;
        this.loadImage()
    }

    loadImage() {
        this.mudImage = new Image();
        this.mudImage.src = 'image/mud.png';
        this.ingredientImage = new Image();
        this.ingredientImage.src = 'image/ingredient.png';
        this.speedingBoardImage = new Image();
        this.speedingBoardImage.src = 'image/speedingBoard.png';
        this.imageForObstacle = {
            [obstacleType.mud]: this.mudImage,
            [obstacleType.speedingBoard]: this.speedingBoardImage
        };
    }

    updateSize(width, height) {
        this.width = width;
        this.height = height;
    }

    drawRoad() {
        const [ctx, max_x, max_y] = [this.ctx, this.width, this.height];
        this.cameraDistance = 0;
        // 以降 DriveScene の drawRoad と同じ内容

        const whiteLineSpacing = 10;
        const nWhiteLine = 2;
        const whiteLineWidth = this.pixelSize * 0.8;
        let goalSquareSize = 1.7;
        for (let d = this.cameraDistance; d <= this.cameraDistance + Math.ceil(max_y / this.pixelSize); d++) {
            const { left, right } = this.roadX(d);
            // 道路の外側
            ctx.fillStyle = "green";
            ctx.fillRect(0, max_y - ((d - this.cameraDistance) * this.pixelSize), max_x, this.pixelSize);
            // 道路の内側
            ctx.fillStyle = "gray";
            ctx.fillRect(left * this.pixelSize, max_y - ((d - this.cameraDistance) * this.pixelSize), (right - left) * this.pixelSize, this.pixelSize);
            // 白線
            if (d % (whiteLineSpacing * 2) < whiteLineSpacing) {
                ctx.fillStyle = "white";
                for (let i = 0; i < nWhiteLine; i++) {
                    const ratio = (i + 1) / (nWhiteLine + 1)
                    const x = left * (1 - ratio) + right * ratio
                    ctx.fillRect(x * this.pixelSize - whiteLineWidth / 2, max_y - ((d - this.cameraDistance) * this.pixelSize), whiteLineWidth, this.pixelSize);
                }
            }
            // 道路の境界
            ctx.fillStyle = "black";
            ctx.fillRect((left - 1) * this.pixelSize, max_y - ((d - this.cameraDistance) * this.pixelSize), this.pixelSize, this.pixelSize);
            ctx.fillRect(right * this.pixelSize, max_y - ((d - this.cameraDistance) * this.pixelSize), this.pixelSize, this.pixelSize);
            // ゴール線
            const gd = Math.round(d) - (this.stage.goalDistance - 4)
            if (gd >= 0 && gd < 3) {
                goalSquareSize = (right - left) / Math.floor((right - left) / goalSquareSize);
                let i = 0;
                for (let x = left; x < right; x += goalSquareSize) {
                    i += 1;
                    ctx.fillStyle = ((i + gd) % 2 == 0) ? "black" : "white";
                    ctx.fillRect(
                        x * this.pixelSize,
                        max_y - ((d - this.cameraDistance) * this.pixelSize),
                        goalSquareSize * this.pixelSize,
                        this.pixelSize
                    );
                }
            }
        }
    }

    roadX(d) {
        let i = 0;
        while (this.stage.roadPoint[i+1].d < d) { i += 1; }
        const r = (d - this.stage.roadPoint[i].d) / (this.stage.roadPoint[i+1].d - this.stage.roadPoint[i].d);
        const center = this.stage.roadPoint[i+1].x * r + this.stage.roadPoint[i].x * (1-r);
        const left = center - this.stage.roadWidth / 2;
        const right = center + this.stage.roadWidth / 2;
        return { center: center, left: left, right: right };
    }

    drawObstacle() {
        this.stage.obstacles.forEach(obstacle => {
            const y = this.height - obstacle.d * this.pixelSize;
            const x = obstacle.x * this.pixelSize;
            const scaleFactor = 1.5 / 8 * this.pixelSize;
            if (this.imageForObstacle[obstacle.type].complete) {
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(
                    this.imageForObstacle[obstacle.type],
                    x - this.imageForObstacle[obstacle.type].width * scaleFactor / 2,
                    y - this.imageForObstacle[obstacle.type].height * scaleFactor / 2,
                    this.imageForObstacle[obstacle.type].width * scaleFactor,
                    this.imageForObstacle[obstacle.type].height * scaleFactor,
                );
            }
        });
    }

    drawIngredient() {
        this.stage.ingredients.forEach(ingredient => {
            const y = this.height - ingredient.d * this.pixelSize;
            const x = ingredient.x * this.pixelSize;
            const scaleFactor = 2 / 8 * this.pixelSize;
            if (this.ingredientImage.complete) {
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(
                    this.ingredientImage,
                    x - this.ingredientImage.width * scaleFactor / 2,
                    y - this.ingredientImage.height * scaleFactor / 2,
                    this.ingredientImage.width * scaleFactor,
                    this.ingredientImage.height * scaleFactor,
                );
            }
        });
    }

    // 道を編集する時の緑丸の描画
    drawRoadPointer() {
        for (let i = 0; i < this.stage.roadPoint.length; i++) {
            const point = this.stage.roadPoint[i];
            const y = this.height - point.d * this.pixelSize;
            const x = point.x * this.pixelSize;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2, false);
            this.ctx.fillStyle = 'lightgreen';
            this.ctx.fill();
        }
    }

    getMousePointXD(mouseX, mouseY) {
        return {
            x: Math.round(mouseX / this.pixelSize),
            d: Math.round((this.height - mouseY) / this.pixelSize),
        }
    }
}

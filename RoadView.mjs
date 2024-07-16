// DriveSceneでの描画を再現して道路全体を描画するクラス
export class RoadView {
    constructor(ctx, stage, pixelSize, width, height) {
        this.ctx = ctx;
        this.stage = stage;
        this.pixelSize = pixelSize;
        this.width = width;
        this.height = height;
        this.mudImage = new Image();
        this.mudImage.src = 'image/mud.png';
        this.ingredientImage = new Image();
        this.ingredientImage.src = 'image/ingredient.png';
    }

    updateSize(width, height) {
        this.width = width;
        this.height = height;
    }

    drawRoad() {
        const [max_x, max_y] = [this.width, this.height];
        const whiteLineSpacing = 10;
        let goalSquareSize = 1.7;
        for (let d = 0; d <= this.stage.goalDistance; d++) {
            const { center, left, right } = this.roadX(d);
            // 道路の外側
            this.ctx.fillStyle = "green";
            this.ctx.fillRect(0, max_y - (d * this.pixelSize), max_x, this.pixelSize);
            // 道路の内側
            this.ctx.fillStyle = "gray";
            this.ctx.fillRect(left * this.pixelSize, max_y - (d * this.pixelSize), (right - left) * this.pixelSize, this.pixelSize);
            // 白線
            if (d % (whiteLineSpacing * 2) < whiteLineSpacing) {
                this.ctx.fillStyle = "white";
                const roadCenter = Math.round(center * 3) / 3;
                this.ctx.fillRect(roadCenter * this.pixelSize, max_y - (d * this.pixelSize), this.pixelSize, this.pixelSize);
            }
            // 道路の境界
            this.ctx.fillStyle = "black";
            this.ctx.fillRect((left - 1) * this.pixelSize, max_y - (d * this.pixelSize), this.pixelSize, this.pixelSize);
            this.ctx.fillRect(right * this.pixelSize, max_y - (d * this.pixelSize), this.pixelSize, this.pixelSize);
            // ゴール線
            const gd = Math.round(d) - (this.stage.goalDistance - 4)
            if (gd >= 0 && gd < 3) {
                goalSquareSize = (right - left) / Math.floor((right - left) / goalSquareSize);
                let i = 0;
                for (let x = left; x < right; x += goalSquareSize) {
                    i += 1;
                    this.ctx.fillStyle = ((i + gd) % 2 == 0) ? "black" : "white";
                    this.ctx.fillRect(
                        x * this.pixelSize,
                        max_y - (d * this.pixelSize),
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
            if (this.mudImage.complete) {
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(
                    this.mudImage,
                    x - this.mudImage.width * scaleFactor / 2,
                    y - this.mudImage.height * scaleFactor / 2,
                    this.mudImage.width * scaleFactor,
                    this.mudImage.height * scaleFactor,
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
            x: mouseX / this.pixelSize,
            d: (this.height - mouseY) / this.pixelSize
        }
    }
}

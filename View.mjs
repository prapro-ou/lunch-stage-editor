
// DriveSceneでの描画を再現するクラス
export class View {
    constructor(ctx, stage, pixelSize) {
        this.ctx = ctx;
        this.stage = stage;
        this.pixelSize = pixelSize
    }

    drawRoad(width, height) {
        const [max_x, max_y] = [width, height];
        let i = 0;
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
}
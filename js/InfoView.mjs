// 道路の座標などの情報を隣に表示するビュー
export class InfoView {
    constructor(ctx, stage, pixelSize, x, height) {
        this.ctx = ctx;
        this.stage = stage;
        this.pixelSize = pixelSize
        this.x = x
        this.height = height
    }

    updateSize(x, height) {
        this.x = x;
        this.height = height;
    }

    drawRoadInfo() {
        for (let i = 0; i < this.stage.roadPoint.length; i++) {
            const p = this.stage.roadPoint[i];
            const content = `d=${p.d}, x=${p.x}`;
            const y = p.d - 4*(i == this.stage.roadPoint.length - 1);
            this.ctx.fillStyle = "black";
            this.ctx.font = "16px Arial";
            this.ctx.textAlign = "left";
            this.ctx.fillText(content, this.x + 10, this.height - y * this.pixelSize);
        }
        for (let i = 0; i < this.stage.roadPoint.length - 1; i++) {
            const p0 = this.stage.roadPoint[i];
            const p1 = this.stage.roadPoint[i+1];
            const content = `傾斜 ${(100 * (p1.x - p0.x) / (p1.d - p0.d)).toFixed(2)}%`;
            const y = (p1.d + p0.d) / 2;
            this.ctx.fillStyle = "black";
            this.ctx.font = "16px Arial";
            this.ctx.textAlign = "left";
            this.ctx.fillText(content, this.x + 10, this.height - y * this.pixelSize);
        }
    }
}

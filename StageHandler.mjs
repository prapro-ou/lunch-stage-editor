// ステージに対する操作などをカプセル化
export class StageHandler {
    constructor(stage) {
        this.stage = stage;
    }

    convertToJSON() {
        let json = `{\n    roadPoint: [\n        {d: -50, x: ${this.stage.roadPoint[0].x}},`;
        for (let i = 0; i < this.stage.roadPoint.length; i++) {
            let p = this.stage.roadPoint[i];
            json += `\n        {d: ${p.d}, x: ${p.x}},`;
        }
        json += "\n    ],\n    obstacles: [";
        for (let i = 0; i < this.stage.obstacles.length; i++) {
            let p = this.stage.obstacles[i];
            json += `\n        {type: ${p.type}, d: ${p.d}, x: ${p.x}},`;
        }
        json += "\n    ],\n    ingredients: [";
        for (let i = 0; i < this.stage.ingredients.length; i++) {
            let p = this.stage.ingredients[i];
            json += `\n        {d: ${p.d}, x: ${p.x}},`;
        }
        json += `\n    ],\n    roadWidth: ${this.stage.roadWidth},`;
        json += `\n    goalDistance: ${this.stage.goalDistance},`;
        json += "\n}"
        return json
    }

    updateRoadWidth(roadWidth) {
        this.stage.roadWidth = roadWidth;
    }

    updateGoalDistance(goalDistance) {
        this.stage.goalDistance = goalDistance;
        const lastPointX = this.stage.roadPoint[this.stage.roadPoint.length-1].x;
        this.stage.roadPoint = this.stage.roadPoint.filter((p) => p.d < this.stage.goalDistance);
        this.stage.roadPoint.push({x: lastPointX, d: this.stage.goalDistance});
    }
}

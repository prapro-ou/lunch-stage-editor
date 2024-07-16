import { obstacleType, objectTypes } from "./enum.mjs";

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

    getArrayIncluding(objectType) {
        switch (objectType) {
            case objectTypes.road:
                return this.stage.roadPoint;

            case objectTypes.mud:
                return this.stage.obstacles;

            case objectTypes.ingredient:
                return this.stage.ingredients;

            default:
                console.error(`${objectType}の配列は定義されていません。`);
        }
    }

    createObject(objectType, x, d) {
        const array = this.getArrayIncluding(objectType);
        let i = array.findIndex((p) => p.d >= d);
        if (i != -1 && array[i].d == d) return;
        if (i == -1) i = 0;
        switch (objectType) {
            case objectTypes.road:
                array.splice(i, 0, {d: d, x: x});
                break;

            case objectTypes.mud:
                array.splice(i, 0, {type: obstacleType.mud, d: d, x: x});
                break;

            case objectTypes.ingredient:
                array.splice(i, 0, {d: d, x: x});
                break;

            default:
                console.error(`${objectType}の追加方法は定義されていません。`);
        }
    }

    deleteObject(objectType, index) {
        this.getArrayIncluding(objectType).splice(index, 1);
    }

    moveObject(objectType, index, x, d) {
        const array = this.getArrayIncluding(objectType);
        switch (objectType) {
            case objectTypes.road:
                array[index].x = x;
                if (index != 0 && index != array.length - 1) array[index].d = d;
                break;

            default:
                array[index].x = x;
                array[index].d = d;
        }
    }

    objectPointNear(objectType, x, d) {
        let [minDist, near] = [Infinity, null];
        this.getArrayIncluding(objectType).forEach((point, index) => {
            const dist = Math.hypot(point.x - x, point.d - d);
            if (dist < minDist) [minDist, near] = [dist, index];
        });
        return minDist > 5 ? null : near;
    }
}

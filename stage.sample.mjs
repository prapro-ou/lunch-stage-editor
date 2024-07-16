import { obstacleType, speedModes } from "./js/enum.mjs";

export const stage =

{
    roadPoint: [
        {d: -50, x: 50},
        {d: 0, x: 50},
        {d: 150, x: 50},
        {d: 250, x: 64},
        {d: 450, x: 40},
        {d: 550, x: 40},
        {d: 650, x: 52},
        {d: 810, x: 61},
        {d: 920, x: 50},
        {d: 1000, x: 50},
    ],
    obstacles: [
        {type: obstacleType.mud, d: 861, x: 70},
        {type: obstacleType.mud, d: 507, x: 27},
        {type: obstacleType.mud, d: 248, x: 78},
        {type: obstacleType.mud, d: 111, x: 37},
        {type: obstacleType.speedingBoard, d: 100, x: 58},
        {type: obstacleType.speedingBoard, d: 392, x: 61},
        {type: obstacleType.speedingBoard, d: 587, x: 51},
        {type: obstacleType.speedingBoard, d: 744, x: 56},
    ],
    ingredients: [
        {d: 86, x: 52},
        {d: 181, x: 48},
        {d: 226, x: 76},
        {d: 353, x: 43},
        {d: 486, x: 41},
        {d: 671, x: 41},
        {d: 807, x: 65},
        {d: 940, x: 36},
    ],
    roadWidth: 35,
    goalDistance: 1000,
    targetTime: 17,
    inertia: false,
    nightMode: false,
    speedMode: speedModes.normal,
    nCars: 2,
};


const obstacleType = {
    mud: "ぬかるみ"
}

const stage = {
    roadPoint: [
        {d: 0, x: 16},
        {d: 150, x: 16},
        {d: 250, x: 176},
        {d: 450, x: 176},
        {d: 500, x: 256},
        {d: 650, x: 256},
        {d: 750, x: 416},
        {d: 850, x: 416},
        {d: 950, x: 256},
        {d: 1050, x: 256},
        {d: 1150, x: 96},
        {d: 1350, x: 96},
        {d: 1400, x: 16}
    ],
    obstacles: [
        {type: obstacleType.mud, d: 0},
    ],
    roadWidth: 320.0,
    goalDistance: 1500
}

/*
・cars: Array< Car >
　・Car(x, d, carType)
　・carType … car_blue, truck_big
・baseSpeed … Int
・慣性モード … Bool
・背景画像 … String
*/
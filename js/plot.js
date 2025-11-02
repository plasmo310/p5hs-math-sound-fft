
/**
 * 画面設定
 */
const ScreenWidth = 400;
const ScreenHeight = 400;

/**
 * 座標の表示範囲
 */
const MinGridValueY = -5;
const MaxGridValueY = 5;
const MinGridValueX = 0;
const MaxGridValueX = 0.05;

/**
 * グリッドの描画
 */
function drawGrid() {
  strokeWeight(2);

  let dx = MaxGridValueX / 10;
  let dy = MaxGridValueY / 10;
  for (let x = MinGridValueX; x < MaxGridValueX; x+=dx) {
    for (let y = MinGridValueY; y < MaxGridValueY; y+=dy) {
      // 縦線
      stroke(240, 240, 240);
      drawLineCanvas(x+dx, y, x+dx, y+dy);
      // 横線
      stroke(180, 180, 180);
      drawLineCanvas(x, y+dy, x+dx, y+dy);
    }
  }

  // 中央線
  stroke(120, 120, 120);
  drawLineCanvas(MinGridValueX, 0, MaxGridValueX, 0);
  drawLineCanvas(0, MinGridValueY, 0, MaxGridValueY);
}

function drawWaveDataHalfTop(waveData) {
  let convWaveData = waveData.map(data => data * 0.5 + MaxGridValueY * 0.5);
  drawWaveData(convWaveData);
}

function drawWaveDataHalfBottom(waveData) {
  let convWaveData = waveData.map(data => data * 0.5 - MaxGridValueY * 0.5);
  drawWaveData(convWaveData);
}

function drawFullWaveDataHalfBottom(waveData) {
  let convWaveData = waveData.map(data => data * 0.5 - MaxGridValueY * 0.5);
  drawFullWaveData(convWaveData);
}

/**
 * 波形データを描画
 * @param {number[]} waveData 波形データ
 */
function drawWaveData(waveData) {
  for (let i = 0; i < waveData.length; i++) {
    // 最大秒数を超えたらスキップ
    if (i / SampleRate > MaxGridValueX) {
      break;
    }
    if (i == waveData.length - 1) {
      break;
    }
    // 次のデータと繋げる
    let data = waveData[i];
    let time = i / SampleRate;
    let nextData = waveData[i + 1];
    let nextTime = (i + 1) / SampleRate;
    drawLineCanvas(time, data, nextTime, nextData);
  }
}

/**
 * 波形データを描画（画面横軸いっぱいになるようにする）
 * @param {number[]} waveData 波形データ
 */
function drawFullWaveData(waveData) {
  for (let i = 0; i < waveData.length; i++) {
    // 次のデータと繋げる
    let data = waveData[i];
    let posX = i / ScreenWidth * MaxGridValueX;
    let nextData = waveData[i + 1];
    let nextPosX = (i + 1) / ScreenWidth * MaxGridValueX;
    drawLineCanvas(posX, data, nextPosX, nextData);
  }
}

/**
 * 関数の描画
 * @param {(t: number) => number} func 関数 
 */
function drawFunc(func) {
  strokeWeight(4);
  stroke(0, 0, 255);
  let dx = MaxGridValueX / 100;
  for (let x = 0; x < MaxGridValueX; x+=dx) {
    drawLineCanvas(x, func(x), (x+dx), func(x+dx));
  }
}

/**
 * 受け取った座標位置で線を繋げて表示する
 * @param {number} fromX 
 * @param {number} fromY 
 * @param {number} toX 
 * @param {number} toY 
 */
function drawLineCanvas(fromX, fromY, toX, toY) {
  fromX *= ScreenWidth/(MaxGridValueX-MinGridValueX);
  fromY *= ScreenHeight/(MaxGridValueY-MinGridValueY);
  toX *= ScreenWidth/(MaxGridValueX-MinGridValueX)
  toY *= ScreenHeight/(MaxGridValueY-MinGridValueY);
  let offset = [0, ScreenHeight/2]; // Y軸は反転させる
  line(fromX+offset[0], ScreenHeight-(fromY+offset[1]), toX+offset[0], ScreenHeight-(toY+offset[1]));
}

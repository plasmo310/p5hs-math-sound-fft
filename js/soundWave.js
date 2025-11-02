
/**
 * 波形: ノイズ
 * @param {number} t 時間 
 */
function waveNoiseFunc(t) {
  return Math.random() * 2 - 1;
}

/**
 * 波形: sin(2πft)
 * @param {number} t 時間
 * @param {number} freq 周波数 
 */
function waveSin2npiFunc(t, freq) {
  return Math.sin(2 * Math.PI * freq * t);
}

/**
 * 波形: cos(2πft)
 * @param {number} t 時間
 * @param {number} freq 周波数
 */
function waveCos2npiFunc(t, freq) {
  return Math.cos(2 * Math.PI * freq * t);
}

/**
 * 波形: フーリエ級数
 * @param {number} t 時間
 * @param {number} a0 定数関数
 * @param {number[]} aArray cos関数の定数項
 * @param {number[]} bArray sin関数の定数項
 * @param {number[]} baseFreq 計算のベースとする周波数
 */
function waveFourierSeriesFunc(t, a0, aArray, bArray, baseFreq = 441) {
  // cos値の計算
  let cosValues = [];
  for (let n = 0; n < aArray.length; n++) {
    const an = aArray[n];
    const freq = (n + 1) * baseFreq;
    cosValues.push(an * waveCos2npiFunc(t, freq));
  }
  // sin値の計算
  let sinValues = [];
  for (let n = 0; n < bArray.length; n++) {
    const bn = bArray[n];
    const freq = (n + 1) * baseFreq;
    sinValues.push(bn * waveSin2npiFunc(t, freq));
  }
  // フーリエ級数の形で計算して返却
  const cosSum = cosValues.length == 0 ? 0 : cosValues.reduce((sum, x) => sum + x, 0);
  const sinSum = sinValues.length == 0 ? 0 : sinValues.reduce((sum, x) => sum + x, 0);
  return a0 / 2 + cosSum + sinSum;
}

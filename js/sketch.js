
// DFT、FFTの計算
// 参考: https://qiita.com/bellbind/items/ba7aa07f6c915d400000

/**
 * DFT共通
 * @param {number[]} fArray 音源データ or 周波数データ
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 周波数データ or 音源データ
 */
function dftCommon(fArray, T, baseFreq = 1) {
  let outFArray = [];
  // 周波数k、時系列nをNの数だけループする
  for (let k = 0; k < fArray.length; k++) {
    let f = new Complex(0.0, 0.0);
    for (let n = 0; n < fArray.length; n++) {
      // Σf(n)exp(-i(2pi/N)kn)の部分
      const exp = expi(T*(k*baseFreq)*n);
      f = f.add(fArray[n].mul(exp));
    }
    outFArray.push(f);
  }
  return outFArray;
}

/**
 * DFTによる離散フーリエ変換
 * @param {number[]} fnArray 音源データ
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 周波数データ
 */
function dft(fnArray, N, baseFreq = 1) {
  const T = -2*Math.PI/N;
  return dftCommon(fnArray, T, baseFreq);
}

/**
 * IDFTによる逆離散フーリエ変換
 * @param {number[]} fkArray 周波数データ
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 音源データ
 */
function idft(fkArray, N, baseFreq = 1) {
  const T = 2*Math.PI / N;
  return dftCommon(fkArray, T, baseFreq).map(z => new Complex(z.re/N, z.im/N));
}

/**
 * ビットリバース処理
 * 要素を並び替えたインデックスを返す
 *  [0,1,2,3,4,5,6,7] => [0,4,2,6,1,5,3,7]
 * 2新数で表した際の下位ビットでソート（前後を逆転）した結果として返す
 *  [000,001,010,011,100,101,110,111] => [000,100,010,110,001,101,011,111]
 * @param {number} k 要素数が2の何乗か？
 * @param {number} i インデックス
 * @returns 
 */
function bitReversedIndex(k, index) {
  let reversed = 0;
  for (let i = 0; i < k; i++) {
    reversed <<= 1;
    reversed |= (index & 1);
    index >>= 1;
  }
  return reversed;
}

/**
 * FFT共通
 * Cooley-Tukeyアルゴリズム
 * @param {number[]} fArray 変換前データ
 * @param {number} T expに掛ける定数
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 
 */
function fftCommon(fArray, T, N, baseFreq = 1) {
  // Nが2の何乗かを求め、ビットリバースで並び替える
  const k = Math.log2(N);
  const fRevArray = fArray.map((_, i) => fArray[bitReversedIndex(k, i)]);

  // Nの階乗分ループする
  for (let Nh = 1; Nh < N; Nh *= 2) {
    // expに掛ける定数は、分母のNを2乗していく
    T /= 2;
    // s,iを下記のように進めながらバタフライ演算を行う
    // Nh=1 => [0,0] [2,0] [4,0] [6,0]
    // Nh=2 => [0,0] [0,1] [4,0] [4,1]
    // Nh=3 => [0,0] [0,1] [0,2] [0,3]
    for (let s = 0; s < N; s += Nh * 2) {
      for (let i = 0; i < Nh; i++) {
        const LN = fRevArray[s + i];
        const RN = fRevArray[s + i + Nh].mul(expi(T * i * baseFreq));
        fRevArray[s + i] = LN.add(RN);
        fRevArray[s + i + Nh] = LN.sub(RN);
      }
    }
  }
  return fRevArray;
}

/**
 * FFT共通（別の書き方、やってることは上記関数と同じ）
 * Cooley-Tukeyアルゴリズム
 * https://hkawabata.github.io/technical-note/note/Algorithm/fft.html
 * @param {number[]} fArray 変換前データ
 * @param {number} T expに掛ける定数
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 
 */
function fftCommon2(fArray, T, N, baseFreq = 1) {
  const k = Math.log2(N);
  const fRevArray = fArray.map((_, i) => fArray[bitReversedIndex(k, i)]);

  let window = 1;
  while (window < N) {
    window <<= 1;
    for (let i = 0; i < N; i++) {
      if (i % window < window / 2) {
        const k = i + window / 2;
        const wi = expi(T * baseFreq * (i%window) / window);
        const wk = expi(T * baseFreq * (k%window) / window);
        [fRevArray[i], fRevArray[k]] = [fRevArray[i].add(wi.mul(fRevArray[k])), fRevArray[i].add(wk.mul(fRevArray[k]))];
      }
    }
  }
  return fRevArray;
}

/**
 * FFTによる高速フーリエ変換処理
 * @param {number[]} fnArray 音源データ
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 周波数データ
 */
function fft(fnArray, N, baseFreq = 1) {
  const T = -2*Math.PI;
  return fftCommon(fnArray, T, N, baseFreq);
}

/**
 * IFFTによる逆高速フーリエ変換処理
 * @param {number[]} fkArray 周波数データ
 * @param {number} N サンプル数
 * @param {number} baseFreq 計算のベースとする周波数
 * @returns 音源データ
 */
function ifft(fkArray, N, baseFreq = 1) {
  const T = 2*Math.PI;
  return fftCommon(fkArray, T, N, baseFreq).map(z => new Complex(z.re/N, z.im/N));
}

/**
 * DFT or FFTで求めた周波数データから表示する周波数成分として取得する
 * @param {Complex[]} fkArray DFT or FFTで求めた周波数データ
 * @returns 周波数成分データ
 */
function getFourierFrequencies(fkArray) {
  // 後半は負の周波数に相当するため前半部分のみ見る
  // https://kouyama.sci.u-toyama.ac.jp/main/education/2007/discmath/pdf/text/text09.pdf
  let freqWaveData = [];
  for (let i = 0; i < fkArray.length / 2; i++) {
    // 周波数成分のスケーリング
    let an = fkArray[i].re * 2.0 / N;
    let bn = fkArray[i].im * -2.0  / N;
    freqWaveData.push(Math.sqrt(an*an + bn*bn));
  }
  return freqWaveData;
}

/**
 * ウィンドウ関数（ハミング窓）
 * 開始、終了データの不連続性を抑える
 * https://works.logical-arts.jp/archives/124
 * @param {number} n
 * @param {number} N
 * @returns
 */
function hammingWindow(n, N) {
  return 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
}

/**
 * DFT/FFTで扱うデータの長さ
 * 2のべき乗の数でなければいけないので注意
 */
let N = 4096;

/**
 * DFT/FFTの実行時間
 */
let executeTime = 0.0;

/**
 * 再生中の波形データ
 */
let playWaveData = [];

/**
 * フーリエ変換で解析した音源データ
 */
let fourierFnWaveData = [];

/**
 * フーリエ変換で解析した周波数データ
 */
let fourierFkWaveData = [];

/**
 * DFTによるフーリエ解析を行う
 * @param {number[]} playWaveData 再生した音源データ
 */
function checkDFT(playWaveData) {
  // 音源データを0-1の間で複素数化
  console.log('*** input data ***');
  let inputComplexArray = [];
  for (let n = 0; n < N; n++) {
    const inputComplex = new Complex(playWaveData[n], 0);
    inputComplexArray.push(inputComplex);
    console.log(inputComplex.re.toFixed(1) + ', ' + inputComplex.im.toFixed(1));
  }
  
  // DFTによる周波数成分の取得
  const dftResult = dft(inputComplexArray, N);
  fourierFkWaveData = getFourierFrequencies(dftResult);

  // IDFTによる音源データの再取得
  const idftResult = idft(dftResult, N);
  fourierFnWaveData = idftResult.map(z => z.re);
}

/**
 * FFTによるフーリエ解析を行う
 * @param {number[]} playWaveData 再生した音源データ
 */
function checkFFT(playWaveData) {
  // 音源データを0-1の間で複素数化
  let inputComplexArray = [];
  for (let n = 0; n < N; n++) {
    const inputComplex = new Complex(playWaveData[n], 0);
    inputComplexArray.push(inputComplex);
    console.log(inputComplex.re.toFixed(1) + ', ' + inputComplex.im.toFixed(1));
  }

  // FFTによる周波数成分の取得
  const fftResult = fft(inputComplexArray, N);
  fourierFkWaveData = getFourierFrequencies(fftResult);

  // IFFTによる音源データの再取得
  const ifftResult = ifft(fftResult, N);
  fourierFnWaveData = ifftResult.map(z => z.re);
}

/**
 * 音源解析タイプ
 */
const CheckType = {
  None: 0,
  DFT: 1,
  FFT: 2,
}

/**
 * ボリューム
 */
const Volume = 0.02;

/**
 * 音源再生＆解析
 */
function playAndCheckButton(waveFunc, checkType) {
  const startTime = performance.now();
  let playData = playSound(waveFunc, Volume);  
  playWaveData = playData.map(data => data * (1 / Volume));

  fourierFnWaveData = [];
  fourierFkWaveData = [];
  switch (checkType) {
    case CheckType.DFT:
      checkDFT(playWaveData);
      break;
    case CheckType.FFT:
      checkFFT(playWaveData);
      break;
  }

  const endTime = performance.now();
  executeTime = (endTime - startTime).toFixed(1);
}

/**
 * ボタン類
 */
let playSinDFTButton;
let playSinFFTButton;
let playComplexDFTButton;
let playComplexFFTButton;

/**
 * 初期化処理
 */
function setup() {
  createCanvas(ScreenWidth, ScreenHeight);

  // sin波形
  const sinWaveFunc = (t) => waveSin2npiFunc(t, 441);
  playSinDFTButton = createButton("Sin2π*441 DFT");
  playSinDFTButton.mousePressed(() => playAndCheckButton(sinWaveFunc, CheckType.DFT));
  playSinDFTButton.position(ScreenWidth - (playSinDFTButton.width), 20);
  playSinFFTButton = createButton("Sin2π*441 FFT");
  playSinFFTButton.mousePressed(() => playAndCheckButton(sinWaveFunc, CheckType.FFT));
  playSinFFTButton.position(ScreenWidth - (playSinFFTButton.width), 48);

  // 複雑な波形
  const complexWaveFunc = (t) => waveSin2npiFunc(t, 350) + 0.8*waveCos2npiFunc(t, 441*5) + 0.5*waveSin2npiFunc(t, 8*350);
  playComplexDFTButton = createButton("Complex Wave DFT");
  playComplexDFTButton.mousePressed(() => playAndCheckButton(complexWaveFunc, CheckType.DFT));
  playComplexDFTButton.position(ScreenWidth - (playComplexDFTButton.width), 76);
  playComplexFFTButton = createButton("Complex Wave FFT");
  playComplexFFTButton.mousePressed(() => playAndCheckButton(complexWaveFunc, CheckType.FFT));
  playComplexFFTButton.position(ScreenWidth - (playComplexFFTButton.width), 104);
}

/**
 * 描画処理
 */
function draw() {
  background(255);
  drawGrid();

  // 元の音源データ
  strokeWeight(4);
  stroke(0, 0, 255);
  drawWaveDataHalfTop(playWaveData);

  // フーリエ変換で求めた音源データ
  stroke(0, 255, 0);
  drawWaveDataHalfBottom(fourierFnWaveData);

  // 逆フーリエ変換で求めた周波数データ
  stroke(255, 0, 0);
  drawFullWaveDataHalfBottom(fourierFkWaveData);

  // テキスト描画
  noStroke();
  fill(0, 0, 0);
  textSize(18);
  text(`N: ${N}`, 20, 30);
  text(`Execute Time: ${executeTime}`, 20, 56);
}

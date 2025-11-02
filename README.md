# p5js-complex-fourier
* p5.jsを使用したDFT、FFTによるフーリエ解析実装サンプルになります。
    * メインの処理は <a href="/js/sketch.js">/js/sketch.js</a> になります。
* 押下したボタンに応じて処理時間と結果が表示されます。
<img width="320px" src="/ReadMeContents/01_sound_fft.png">

## DFT実装

```
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
```

## FFT実装

```

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
```
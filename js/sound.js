
/**
 * サンプルレート
 */
const SampleRate = 44100;

/**
 * 再生時間(秒)
 */
const PlaySec = 1;

/**
 * 再生中の波形データ
 */
let bufferSource = null;

/**
 * サウンド再生処理
 * 参考: https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/createBuffer
 * @param {(t: number) => number} func 波形関数
 * @param {number} volume ボリューム
 */
function playSound(func, volume) {
    // stop playing sound.
    if (bufferSource) {
        bufferSource.stop();
    }

    // create context.
    let audioCtx = new AudioContext();
    audioCtx.sampleRate = SampleRate;

    // create mono channel buffer.
    let buffer = audioCtx.createBuffer(1, PlaySec * SampleRate, SampleRate);
    let channelData = buffer.getChannelData(0);
    for (var i = 0; i < buffer.length; i++) {
        let playSec = i / SampleRate;
        channelData[i] = func(playSec) * volume;
    }

    // set play wave data.
    let playWaveData = channelData;

    // play sound.
    bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(audioCtx.destination);
    bufferSource.start();

    return playWaveData;
}

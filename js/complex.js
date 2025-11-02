/**
 * 複素数クラス
 */
class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    static add(z0, z1) {
        return new Complex(
            z0.re + z1.re,
            z0.im + z1.im 
        );
    }

    static sub(z0, z1) {
        return new Complex(
            z0.re - z1.re,
            z0.im - z1.im 
        );
        }

    static mul(z0, z1) {
        return new Complex(
            z0.re*z1.re - z0.im*z1.im,
            z0.re*z1.im + z0.im*z1.re
        );
    }

    static sum(zArray) {
        return zArray.reduce((sum, z) => {
            return Complex.add(sum, z);
        });
    }

    static average(zArray) {
        const sum = Complex.sum(zArray);
        const zCount = zArray.length;
        return new Complex(sum.re/zCount, sum.im/zCount);
    }

    add(z1) {
        return Complex.add(this, z1);
    }

    sub(z1) {
        return Complex.sub(this, z1);
    }

    mul(z1) {
        return Complex.mul(this, z1);
    }

    sqlMagnitude() {
        return this.re**2 + this.im**2;
    }
}

/**
 * e^ix(オイラーの公式)
 * @param {number} x
 * @returns 
 */
function expi(x) {
    return new Complex(
        Math.cos(x),
        Math.sin(x)
    );
}

/**
 * e^-ix(オイラーの公式)
 * @param {number} x
 * @returns 
 */
function expmi(x) {
    return new Complex(
        Math.cos(x),
        -Math.sin(x)
    );
}

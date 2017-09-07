import * as THREE from 'three';
import TWEEN from 'tween.js';
import moment from 'moment';

export default class Clock {

  constructor(time) {
    this.clock = new THREE.Clock(false);
    this.offset = this.getOffset(time);
    this.clock.start();
    this.speed(0);
    this.elapsedTime = 0;
  }

  /**
   * Get time offset.
   *
   * @param {Number} time - UNIX timestamp
   */
  getOffset = (time) => {
    if (time) {
      return time;
    }
    return moment().unix();
  }

  /**
   * Current scaled timestamp.
   *
   * @returns {Number} UNIX timestamp
   */
  getTime = () => {
    let time = this.clock.getElapsedTime();
        time *= this.scale;
        time += this.offset;

    return Math.ceil(time);
  }

  /**
   * Updates clock time. Intended to be called from within
   * an animation loop to prepare the next frame time.
   */
  update = () => {
    let elapsedTime = Math.ceil(this.getTime());

    if(elapsedTime !== this.elapsedTime) {
      this.elapsedTime = elapsedTime;
    }
    TWEEN.update();
  }

  /**
   * Sets the scale of the clock, as base 10.
   * Example: a scalar of 0 means 1:1 scale (10^0=1)
   *
   * @param {Number} e - scalar exponent
   */
  speed = (e) => {
    this.scale = Math.pow(10, e);
    this.offset = this.getTime();
  }

  /**
   * Tweens the offset time to the given time.
   * @param {Number} time - UNIX timestamp
   * @returns {Tween} - tween instance
   */
  setOffset = (time) => {
    this.clock.stop();
    
    let updateOffset = (t) => {
      this.offset = t;
    };
    let t = this.offset;

    return this.getTween(t)
      .to({ t: time }, 1000)
      .onUpdate(() => updateOffset(t))
      .onComplete(this.clock.start)
      .start();
  }//

  /**
   * Creates a new instance of Tween with the given time.
   *
   * @param {Number} time - UNIX timestamp
   * @returns {Tween} tween instance
   */
  getTween = (time) => {
    return new TWEEN.Tween({t: time});
  }
}

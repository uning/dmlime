goog.provide('dm.Progress');

goog.require('lime.RoundedRect');
goog.require('lime.animation.Resize');
goog.require('lime.fill.LinearGradient');

/**
 * Progressbar
 * @constructor
 * @extends lime.RoundedRect
 */
dm.Progress = function(initv,icolor,width,height,radius,border,bcolor) {
    lime.RoundedRect.call(this);

    var WIDTH = width || 320,
        HEIGHT = height ||50,
        RADIUS = radius ||20,
        BORDER = border ||8;

		icolor = icolor || '#FF0000';
		bcolor = bcolor || '#00FF00';
	
    this.setSize(WIDTH, HEIGHT).setRadius(RADIUS).setAnchorPoint(0, 0);
    this.setFill(new lime.fill.LinearGradient().addColorStop(0, 0, 0, 0, .6).addColorStop(1, 0x1e, 0x57, 0x97, .4));

    WIDTH -= 2 * BORDER;
    HEIGHT -= 2 * BORDER;
    RADIUS -= BORDER ;


	initv = initv || 1; 
    // inner balue var
    var inner = new lime.RoundedRect().setRadius(RADIUS).setSize(WIDTH*initv, HEIGHT).setFill(icolor).
        setAnchorPoint(0, 0).setPosition(BORDER, BORDER);
    this.appendChild(inner);

	/*
    inner.setFill(new lime.fill.LinearGradient().addColorStop(0, '#afcdef').addColorStop(.49, '#55a1fc').
        addColorStop(.5, '#3690f4').addColorStop(1, '#8dc9ff'));
	*/

    this.width = WIDTH;
    this.inner = inner;
	

};
goog.inherits(dm.Progress, lime.RoundedRect);

/**
 * Set current progress value
 * @param {number} value Current progress value.
 */
dm.Progress.prototype.setProgress = function(value) {
    this.porgress_ = value;
    this.inner.runAction(new lime.animation.Resize(this.width * value, this.inner.getSize().height).setDuration(.4));
};

/**
 * Return current progress value
 * @return {number} value.
 */
dm.Progress.prototype.getProgress = function() {
    return this.progress_;
};

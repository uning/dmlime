var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

goog.provide('dm.IconManager');

goog.require('lime.fill.Image');

/*
  @constructor(dm.IconManager)
*/

dm.IconManager = (function() {

  function IconManager(image) {
    this.file = image;
  }

  return IconManager;

})();

/*
#constructor
*/

dm.Icon = (function(_super) {

  __extends(Icon, _super);

  function Icon(image) {
    Icon.__super__.constructor.call(this, image);
  }

  Icon.prototype.getPixelSizeAndOffset = function(shape) {
    var offset, size;
    size = shape.getSize().clone();
    size.width = this.image_.width;
    size.height = this.image_.height;
    if (this.size_) {
      if (this.size_perc_) {
        size.width *= this.size_.width;
        size.height *= this.size_.height;
      } else {
        size = this.size_;
      }
    }
    offset = new goog.math.Coordinate(0, 0);
    if (this.offset_) {
      if (this.offset_perc_) {
        offset.x *= this.offset_.x;
        offset.y *= this.offset_.y;
      } else {
        offset = this.offset_;
      }
    }
    return [size, offset];
  };

  return Icon;

})(lime.fill.Image);

/*
 获取图片一部分,offset，size 都可以用 坐标指定
 offet 偏移
 offset_perc 偏移 是否为 百分比
 size  由容器决定
*/

dm.IconManager.prototype.getIcon = function(offset, scalex, scaley, offset_perc) {
  var idx, ret;
  ret = new dm.Icon(this.file);
  if (arguments.length === 0) return ret;
  idx = 0;
  if (goog.isNumber(offset)) {
    offset = new goog.math.Coordinate(arguments[idx++], arguments[idx++]);
  }
  scalex = arguments[idx++] || 1;
  scaley = arguments[idx++] || scalex || 1;
  offset.x *= -scalex;
  offset.y *= -scaley;
  ret.offset_ = offset;
  ret.setSize(scalex, scaley, true);
  ret.offset_perc_ = arguments[idx++] || false;
  return ret;
};

dm.IconManager.getFileIcon = function(file, offset, scalex, scaley, offset_perc) {
  var inst, ofile, ret, _base;
  inst = (_base = dm.IconManager.prototype).inst || (_base.inst = new dm.IconManager(file));
  ofile = inst.file;
  inst.file = file;
  ret = inst.getIcon.apply(inst, arguments);
  inst.file = ofile;
  return ret;
};

dm.IconManager.getImg = function(file) {
  var inst, ofile, ret, _base;
  inst = (_base = dm.IconManager.prototype).inst || (_base.inst = new dm.IconManager(file));
  ofile = inst.file;
  inst.file = file;
  ret = inst.getIcon(0, 1, 1, 1);
  inst.file = ofile;
  return ret;
};

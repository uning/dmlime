
goog.provide 'dm.IconManager'


goog.require 'lime.fill.Image'

###
  @constructor(dm.IconManager) 
###
class dm.IconManager 
	constructor:(image)->
		@file = image


###
#constructor
###
class dm.Icon extends lime.fill.Image
	constructor:(image)->
		super image

	getPixelSizeAndOffset:(shape)->
		size = shape.getSize().clone()
		size.width = this.image_.width
		size.height = this.image_.height
		if @size_
			if @size_perc_
				size.width*=this.size_.width
				size.height*=this.size_.height
			else
				size = @size_

		offset = new goog.math.Coordinate(0,0);
		if @offset_
			if @offset_perc_
				offset.x *= @offset_.x
				offset.y *= @offset_.y
			else
				offset = @offset_
		[size,offset]






###
 获取图片一部分,offset，size 都可以用 坐标指定
 offet 偏移
 offset_perc 偏移 scale
 size  由容器决定
###
dm.IconManager::getIcon = (offset,scalex,scaley,offset_perc) ->
	#ret  = new lime.fill.Image  @file
	#console.log offset,scalex,scaley,offset_perc
	ret  = new dm.Icon  @file
	if arguments.length == 0
		return  ret
	idx = 0
	if goog.isNumber offset
		offset = new goog.math.Coordinate arguments[idx++],arguments[idx++]
	scalex = arguments[idx++] || 1
	scaley = arguments[idx++] || scalex || 1
	offset.x *= -scalex
	offset.y *= -scaley

	ret.offset_ = offset
	ret.setSize(scalex,scaley,true)
	
	ret.offset_perc_ = arguments[idx++] || false
	ret


dm.IconManager.getFileIcon = (file,offset,scalex,scaley,offset_perc) ->
	inst  =  dm.IconManager::inst or= new dm.IconManager(file)
	inst.file = file
	inst.getIcon offset,scalex,scaley,offset_perc

dm.IconManager.getImg = (file)->
	inst  =  dm.IconManager::inst or= new dm.IconManager(file)
	inst.file = file
	inst.getIcon 0,1,1,1

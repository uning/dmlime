

COFFEESRCS = dm.coffee  iconmanager.coffee 

JSOBJS = $(patsubst %.coffee,%.js,$(COFFEESRCS))

%.js: %.coffee
	coffee -b -c $< 



all:
	@echo "make build  -- 编译所有js"
	@echo "make up -- 更新deps"
	@echo "make genc   -- 生成配置"
	@echo "make js   -- coffee到js"
	@echo "make dwb   -- 部署到weibo"

js: $(JSOBJS) $(COFFEESRCS)
	@echo $(JSOBJS) $(COFFEESRCS)

up:
	@../bin/lime.py update

build:
	@build.sh

genc:
	@gen_config.sh

help:
	@echo "make build  -- 编译所有js"
	@echo "make genc   -- 生成配置"
	@echo "make js   -- coffee到js"

dwb:
	@prsync -avvz deploy/latest/  w27:./adventure/

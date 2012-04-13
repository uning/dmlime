﻿
goog.provide('dm.Loader');

(function () {
    var rl = window['Loader'] = function () {
        this.resourceList = new Array();
        this.onload = function () { };
        this.itemLoad = function () { };
        this.loadedCount = 0;
        this.rs = {};
    };

    rl.prototype.add = function (s) {
        this.resourceList.push(s);
    }

    rl.prototype.load = function () {
        if (this.resourceList.length == 0) {
            this.onload.call();
            return;
        }
        for (var i = 0; i < this.resourceList.length; i++) {
            var type = this.resourceList[i].type;
            type = type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1).toLowerCase();
            rl["handle" + type].call(this.resourceList[i], this, this.itemLoad);
        }
    }



    rl.handleImage = function (rsobj, callback) {
        var itemobj = this;
        var img = new Image();
        itemobj.media = img;
        rsobj.rs[itemobj.key] = img;

        img.onerror = function () {
            rl.itemFinishHandle(rsobj, itemobj, callback, false);
        }

        img.onload = function () {
            rl.itemFinishHandle(rsobj, itemobj, callback, true);
        }

        img.src = itemobj.src;
    }
	rl.handleJs=function (rsobj,callback){
        var itemobj = this;
		var script = document.createElement('script');
		script.setAttribute('type','text/javascript');
		script.onload = function(){
			callback(itemobj);
		};
        script.onerror = function () {
            rl.itemFinishHandle(rsobj, itemobj, callback, false);
        }

        script.onload = function () {
            rl.itemFinishHandle(rsobj, itemobj, callback, true);
        }

		script.setAttribute('src',itemobj.src);
		document.getElementsByTagName('head')[0].appendChild(script);
	}

    rl.handleAudio = function (rsobj, callback) {
        var itemobj = this;
        var audio = new Audio();
        itemobj.media = audio;
        rsobj.rs[itemobj.key] = audio;
        audio.src = itemobj.src;
        rl.mediaCheck(rsobj, itemobj, callback);
    }

    rl.handleVideo = function (rsobj, callback) {
        var itemobj = this;
        var video = document.createElement('video');
        itemobj.media = video;
        rsobj.rs[itemobj.key] = video;
        video.src = itemobj.src;
        rl.mediaCheck(rsobj, itemobj, callback);
    }

    rl.mediaCheck = function (rsobj, itemobj, callback) {
        var media = itemobj.media;
        if (media.error != null || media.readyState == 4) {
            var isSuccess = (media.readyState == 4 && media.error == null) ? true : false;
            try {
                rl.itemFinishHandle(rsobj, itemobj, callback, isSuccess);
            }
            finally {
                return;
            }
        }

        setTimeout(function () {
            rl.mediaCheck(rsobj, itemobj, callback);
        }, 20);
    }


    rl.itemFinishHandle = function (rsobj, itemobj, callback, isSuccess) {
        rsobj.loadedCount++;
        if (callback != null)
            callback.call(itemobj, isSuccess);

        if (rsobj.loadedCount == rsobj.resourceList.length)
            rsobj.onload.call();
    }




    rl.prototype.clearItem = function (key) {
        this.rs[key] = null;
        delete this.rs[key];
        for (var i = 0; i < this.resourceList.length; i++) {
            if (this.resourceList[i].key == key) {
                this.resourceList.splice(i, 1);
                break;
            }
        }
    }

    rl.prototype.clearAll = function () {
        for (var i in this.rs) {
            this.rs[i] = null;
            delete this.rs[i];
        }
        this.resourceList = new Array();
    }

})();
dm.Loader=window['Loader'];
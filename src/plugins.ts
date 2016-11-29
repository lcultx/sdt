namespace sdt {
   export var plugins: any = {};
   export type SDT_PLUGINS_CONFIG = {
      plugins: Array<PluginConfig>
   }
   export type PluginConfig = {
      name: string,//插件名称
      path: string,//插件文件地址
      deps: Array<string>,//插件依赖
      mainFile: string,//入口文件
      mainClass: string,//入口类
   }

   export function loadPlugins(config?: SDT_PLUGINS_CONFIG) {
      var config = config || (window as any).sdt_plugins_config as SDT_PLUGINS_CONFIG;
      for (var i = 0, len = config.plugins.length; i < len; i++) {
         var pluginConfig = config.plugins[i];
         loadPlugin(pluginConfig)
      }
   }

   export function loadPlugin(pluginConfig: PluginConfig) {
      // var xhr = new XMLHttpRequest();
      // xhr.open("GET", pluginConfig.path, true);
      // //xhr.responseType = "arraybuffer";
      // xhr.responseType = "text";
      // xhr.onload = function (oEvent) {
      //    var data = xhr.responseText;
      //    loadScriptString(data);
      //    (window as any).require([pluginConfig.mainFile], function (space) {
      //       var PluginClass = space[pluginConfig.mainClass];
      //       var plugin = new PluginClass();
      //       plugin.active();
      //    });
      // };
      // xhr.send(null);
      loadScript(pluginConfig.path, function () {
         (window as any).require([pluginConfig.mainFile], function (space) {
            var PluginClass = space[pluginConfig.mainClass];
            var plugin = new PluginClass();

            sdt.plugins[pluginConfig.name] = plugin;
            plugin.active();
         });
      });
   }


   function loadScript(url, callback) {
      if (url.indexOf('.jr') > -1) {
         loadAndDecomposeBinary(url,(code)=>{
            loadScriptString(code);
            callback();
         })
      } else {
         var script = document.createElement('script');
         script.type = "text/javascript";
         script.src = url;
         script.onload = callback;
         document.head.appendChild(script);
      }

   }

   function loadAndDecomposeBinary(url,callback){
         var xhr = new XMLHttpRequest();
         xhr.open("GET", url, true);
         xhr.withCredentials = true;
         xhr.responseType = "arraybuffer";
         xhr.onload = function (event) {
            var arrayBuffer = xhr.response;
            if (arrayBuffer) {
               var byteArray = new Uint8Array(arrayBuffer);
               (window as any).LZMA.decompress(byteArray, (code)=>{
                     callback(code);
               }, null);
            }
         };
         xhr.send(null);
   }

   function loadScriptString(code) {
      var myScript = document.createElement("script");
      myScript.type = "text/javascript";
      try {
         myScript.appendChild(document.createTextNode(code));
      }
      catch (ex) {
         myScript.text = code;
      }
      document.body.appendChild(myScript);
   }
}
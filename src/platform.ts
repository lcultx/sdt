
namespace sdt {
   //判断是否是运行在nodejs
   var isNode = false;
   (function () {
      if (typeof module !== 'undefined' && module.exports) {
         isNode = true;
      }
   })();

   export var platform = {
      isRunningInNodejs: isNode
   }

}

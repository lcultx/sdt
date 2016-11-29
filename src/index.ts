/// <reference path="core.ts" />
/// <reference path="commands.ts" />
/// <reference path="event.ts" />
/// <reference path="app.ts" />
/// <reference path="context.ts" />
/// <reference path="data.ts" />
/// <reference path="utils.ts" />
/// <reference path="types.ts" />
declare var module;
declare var global;
(function () {
   if (typeof module !== 'undefined' && module.exports) {
      (function () {
         (global as any).sdt = sdt;
      })();
   }
})();

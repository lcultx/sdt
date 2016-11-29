/// <reference path="CssSelectorParser.ts" />
/// <reference path="core.ts" />

namespace sdt {
   export var data: any = {};

   export function Data(name?: string) {
      return function (target: any, attr: string): void {
         name = name || attr;
         if (data[name]) {
            console.error(new Error(name + " already exist in skd.data, can't add it!"));
            return;
         }
         var descriptor: any = new Object();
         descriptor.get = function () {
            var value = data[name];
            var result = value;
            return result;
         };
         descriptor.set = function (value: any) {

            data[name] = value;

         }
         return descriptor;

      }

   }

   var parser = new CssSelectorParser();
   parser.registerSelectorPseudos('has');
   parser.registerNestingOperators('>', '+', '~');
   parser.registerAttrEqualityMods('^', '$', '*', '~');
   parser.enableSubstitutes();


   export class SQuery {
      constructor(selector?: any, context?: SQuery) {
         if (typeof selector == 'string') {
            var query = parser.parse(selector);
            if (query.electors == "electors") {
            } else {
               this.find(query, this, context || data);
            }
         } else {
            this[0] = selector;
            this.length = 1;
         }

      }


      private isTarget(node, rule) {
         var clazzName = node.constructor.name;
         var result = false;
         if (
            (rule.tagName && rule.tagName == clazzName)
            || (rule.tagName && rule.tagName == '*')
         ) {
            result = true;
         }
         if (rule.classNames && rule.classNames.indexOf(clazzName) > -1) {
            result = true;
         }

         if (result && rule.id) {
            result = node.id == rule.id;
         }

         if (result && rule.attrs) {
            var rightAttr = true;
            for (var i in rule.attrs) {
               var attr = rule.attrs[i];
               if (!this.isRightAttr(node, attr)) {
                  rightAttr = false;
                  break;
               }
            }
            result = rightAttr;
         }

         return result;
      }

      private isRightAttr(node, attr) {
         var name = attr.name;
         var value = attr.value;
         var result = false;
         switch (attr.operator) {
            case "=":
               result = node[name] == value
               break;

            default:
               break;
         }

         return result;
      }

      public find(selector: any, scope?: any, root?: any) {
         root = root || this[0];
         if (!scope && typeof selector == 'string') {
            scope = new SQuery(selector, this);
         } else {
            var rule = selector.rule;
            for (var i in root) {
               var node = root[i];
               if (this.isTarget(node, rule)) {
                  scope[scope.length] = node;
                  scope.length++;
               }
               if (node.children) {
                  this.find(selector, scope, node.children);
               }
            }
         }
         return scope;
      }

      public each(cb?: (index, elem) => void) {
         for (var i = 0, len = this.length; i < len; i++) {
            if (cb) {
               cb(i, this[i]);
            } else {
               log(i, this[i]);
            }
         }
         return this;
      }

      private _eachAttr(key, val): any {
         var result = [];
         this.each((index, node) => {
            var res = this._attrs(node, key, val);
            if (val === undefined) {
               result.push(res);
            }
         });

         if (val === undefined) {
            return result;
         } else {
            return this;
         }
      }

      private _attrs(node, key, val) {
         if (typeof key == 'string') {
            return this._attr(node, key, val)
         } else {
            var keys = key;
            var vals = val;
            var result = {};
            for (var i in keys) {
               var key = keys[i];
               var val;
               if (vals) {
                  val = vals[i];
                  this._attr(node, key, val);
               } else {
                  result[key] = this._attr(node, key)
               }
            }
            if (Object.keys(result).length > 0) {
               log(result)
            }
            return result;
         }
      }

      private _attr(node, key, val?: any) {
         if (val) {
            node[key] = val;
            return this;
         } else {
            return node[key];
         }
      }

      public attr(key: string, val?: any) {
         if (this.length > 1) {
            return this._eachAttr(key, val);
         } else {
            var node = this[0];
            return this._attrs(node, key, val);
         }
      }

      public distinct(){
         
      }      

      public rock() {
         var children: SQuery = this.find('*')
         children.each((index, node) => {
            var t = setInterval(() => {
               if (typeof node.x == 'number') node.x *= 1.1;
               if (typeof node.y == 'number') node.y *= 1.1;
               if (typeof node.z == 'number') node.z *= 1.1;
               setTimeout(() => {
                  if (typeof node.x == 'number') node.x /= 1.1;
                  if (typeof node.y == 'number') node.y /= 1.1;
                  if (typeof node.z == 'number') node.z /= 1.1;
               }, 5)
            }, 10)
            setTimeout(() => {
               clearInterval(t);
            }, 1000)

         });
      }

      public length = 0;
      public splice() {

      }
   }


   export var $ = function (selector) {
      return new SQuery(selector);
   }

}


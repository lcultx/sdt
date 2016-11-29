namespace sdt {
   export var types: any = {};

   export function Type(name?: string) {
      return function (clazzType): any {
         name = name || clazzType.name;
         if(types[name]){
            console.log(new Error(name + " already exist in skd.types, can't add it!"))
         }else{
            types[name] = clazzType;
         }
      }
   }
}
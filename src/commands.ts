/// <reference path="./plugins.ts" />
/// <reference path="./types.ts" />
/// <reference path="./event.ts" />
namespace sdt {
   export class CommandMrg {

      private commands: {
         [key: string]: Function
      };

      public registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any) {
         this.commands[command] = callback;
      }

      public executeCommand<T>(command: string, ...rest: any[]) {
         var callback = this.commands[command];
         if (callback) callback();
      }

      public getCommands(filterInternal?: boolean) {
         return this.commands;
      }
   }


   export var commands = new CommandMrg();

   export function exec(command) {
      commands.executeCommand(command);
   }

   export var commandService = null;
   export var runingActionService = null;

   export function CommandService(name?: string) {
      return function (target: any, attr: string): void {
         debugger;
         name = name || attr;
         var descriptor: any = new Object();
         descriptor.get = function () {
            var value = commandService;
            var result = value;
            return result;
         };
         descriptor.set = function (value: any) {
            commandService = value;
         }
         return descriptor;

      }

   }


   // export function recordActionExecute(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
   //    let func = descriptor.value;
   //    descriptor.value = function (...args: any[]) {
   //       debugger;
   //       return func.apply(this, args);
   //    }
   //    return descriptor;
   // }




   export var debugActionCreate = false;
   export function recordActionCreate(service, cmdClazz) {
      runingActionService = 'main'
      if (debugActionCreate) debugger;
      if (isRecordingScript) {
         var clazzName = cmdClazz.name;
         var script = `var cmd = sdt.commandService.createAction(sdt.types.${clazzName});`
         record(script);
      }

   }

   export var debugActionExecute = false;
   export function recordActionExecute(cmd, event) {
      runingActionService = 'main'
      if (debugActionExecute) debugger;
      if (isRecordingScript) {
         var script = `cmd.loadFromScriptJson(${cmd.toScriptJson()})\n`;
         if (event) {
            script += `var event = new sdt.types.${event.constructor.name}();`;
            script += `event.loadScript(${event.toScriptString()});`
            script += `sdt.commandService.execute(cmd,event);`
         } else {
            script += `sdt.commandService.execute(cmd);\n`
         }
         record(script);
      }
   }

   export var debugActionReceive = false;
   export function recordActionReceive(code, event) {
      runingActionService = 'main'
      if (debugActionReceive) debugger;
      if (isRecordingScript) {
         var script = '';
         if (event) {
            script += `var event = new sdt.types.${event.constructor.name}();\n`;
            script += `event.loadScript(${event.toScriptString()});\n`
            script += `sdt.commandService.receive(${code},event);\n`
            record(script)
         } else {
            script += `sdt.commandService.receive(${code});\n`
            record(script)
         }

      }

      //console.log(script);
   }

   function isNotInstanceOfThose(obj,clazzes){
      for(var i in clazzes){
         var clazz = clazzes[i];
         if(clazz &&   !(obj instanceof clazz)){
            continue;
         }else{
            return false;
         }  
      }
      return true;
   }

   export var debugActionComplete = false;
   export function recordActionComplete(cmd, event) {
      if (runingActionService = 'main') {
         var excludeActions = [];
         excludeActions.push(sdt.types.CameraMove3dAction);
         if (isNotInstanceOfThose(cmd,excludeActions)) {
            var serviceUtil = sdt.types.ServiceUtil;
            var instance = serviceUtil.find(sdt.types.TransactionService);
            undoredoService.append(instance)
         }
      }
      runingActionService = 'main'
      if (debugActionComplete) debugger;
      if (isRecordingScript) {
         var script = '';
         if (event) {
            var script = `var event = new sdt.types.${event.constructor.name}();\n`;
            script += `event.loadScript(${event.toScriptString()});\n`
            script += `sdt.commandService.complete(cmd,event);\n`
            record(script);
         } else {
            script += `sdt.commandService.complete(cmd);\n`
            record(script);
         }

      }

   }


   export var debugActionCancel = false;
   export function recordActionCancel(cmd, event) {
      runingActionService = 'main'
      if (debugActionCancel) debugger;
      if (isRecordingScript) {
         var script = '';
         if (event) {
            script += `var event = new sdt.types.${event.constructor.name}();\n`;
            script += `event.loadScript(${event.toScriptString()});\n`;
            script += `sdt.commandService.cancel(cmd,event);\n`;
            record(script);
         } else {
            script += `sdt.commandService.cancel(cmd);\n`;
            record(script);
         }

      }
   }

   export var debugBp3dAction = false;
   export function logBp3dAction(action) {
      //结束当前正在运行的主进程动作
      let script = '';
      if (runingActionService == 'main') {
         sdt.commandService.complete();
         script += 'sdt.commandService.complete();\n';
      }
      runingActionService = 'bp3d'
      undoredoService.append(sdt.plugins.wall)
      if (debugBp3dAction) debugger;
      if (isRecordingScript) {
         script = `sdt.types.Action.run(\'${action}\',sdt.data.bp3dViewmodel,sdt.data.bp3dFloorplan);\nsdt.data.bp3dViewmodel.view.draw();\n`
         record(script);
      }


   }

   export var script = '';
   var isRecordingScript = false;

   function record(str) {
      script += str + '\n';
   }

   export function startRecordScript() {
      isRecordingScript = true;
      script = '';
   }

   export function pauseRecordScript() {
      isRecordingScript = false;
   }

   export function resumeRecordScript() {
      isRecordingScript = true;
   }

   export function stopRecordScript() {
      isRecordingScript = false;
   }


   export interface Scriptable {
      loadFromScriptJson(json);
      toScriptJson();
      toScript(): string;
   }

   export interface UndoRedoable {
      undo();
      redo();
   }

   export interface UndoRedoService extends UndoRedoable {
      canUndo(): boolean;
      canRedo(): boolean;
      clean();
   }




   export class SdtUndoRedoService extends sdt.EventEmitter implements UndoRedoService {

      private undoredoList: Array<UndoRedoable> = [];
      private _cursor: number = 0;

      public append(ur: UndoRedoable) {
         this.undoredoList.push(ur);
         this._cursor++;

         this.emit('change');
      }

      public canUndo(): boolean {
         if (this._cursor > 0) {
            return true;
         }
      }

      public canRedo(): boolean {
         if (this._cursor < this.undoredoList.length) {
            return true;
         }
      }

      public undo() {
         if (this.canUndo()) {
            this._cursor -= 1;
            this.undoredoList[this._cursor].undo();
            this.emit('change');
         }

      }

      public redo() {
         if (this.canRedo()) {
            this.undoredoList[this._cursor].redo();
            this._cursor += 1;
            this.emit('change');
         }
      }

      public clean() {
         this.undoredoList = [];
         this._cursor = 0;
      }
   }

   export var undoredoService = new SdtUndoRedoService();
}

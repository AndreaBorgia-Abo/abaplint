import {IFilenameAndToken, IMacroReferences} from "./_imacro_references";
import {AbstractToken} from "./abap/1_lexer/tokens/abstract_token";
import {Position} from "./position";

export class MacroReferences implements IMacroReferences {
  private readonly definitions: {[filename: string]: {
    token: AbstractToken,
    start: Position,
    end: Position,
  }[]} = {};

  private readonly references: {[filename: string]: IFilenameAndToken[]} = {};

  public addDefinition(ref: IFilenameAndToken, start: Position, end: Position): void {
    if (this.definitions[ref.filename] === undefined) {
      this.definitions[ref.filename] = [];
    } else if (this.definitions[ref.filename].find((d) => d.token.getStart().equals(ref.token.getStart()))) {
      return;
    }
    this.definitions[ref.filename].push({token: ref.token, start, end});
  }

  public getDefinitionRange(filename: string, token: AbstractToken): {start: Position, end: Position} | undefined {
    for (const d of this.definitions[filename] || []) {
      if (d.token.getStart().equals(token.getStart())) {
        return {start: d.start, end: d.end};
      }
    }
    return undefined;
  }

  public addReference(ref: IFilenameAndToken): void {
    if (this.references[ref.filename] === undefined) {
      this.references[ref.filename] = [];
    }
    this.references[ref.filename].push(ref);
  }

  public listDefinitionsByFile(filename: string): AbstractToken[] {
    const ret: AbstractToken[] = [];
    for (const d of this.definitions[filename] || []) {
      ret.push(d.token);
    }
    return ret;
  }

  public listUsagesbyMacro(filename: string, token: AbstractToken): IFilenameAndToken[] {
    const ret: IFilenameAndToken[] = [];
    const tokenStr = token.getStr().toUpperCase();

    for (const ref of this.references[filename] || []) {
      if (ref.token.getStr().toUpperCase() === tokenStr) {
        ret.push(ref);
      }
    }
    return ret;
  }

  public clear(filename: string): void {
    delete this.definitions[filename];
    delete this.references[filename];
  }

  public findDefinitionByUsage(filename: string, token: AbstractToken): {filename: string, token: AbstractToken} | undefined {
    const tokenStr = token.getStr().toUpperCase();

    for (const ref of this.references[filename] || []) {
      if (ref.token.getStart().equals(token.getStart())) {
        for (const d of this.definitions[ref.filename] || []) {
          if (d.token.getStr().toUpperCase() === tokenStr) {
            return {
              filename: ref.filename,
              token: d.token,
            };
          }
        }

      }
    }
    return undefined;
  }

}
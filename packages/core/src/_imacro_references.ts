import {AbstractToken} from "./abap/1_lexer/tokens/abstract_token";
import {Position} from "./position";

export interface IFilenameAndToken {
  filename: string;
  token: AbstractToken;
}

export interface IMacroReferences {
  addDefinition(ref: IFilenameAndToken, start: Position, end: Position): void;
  addReference(ref: IFilenameAndToken): void;
  listDefinitionsByFile(filename: string): AbstractToken[];
  listUsagesbyMacro(filename: string, token: AbstractToken): IFilenameAndToken[];
  getDefinitionRange(filename: string, token: AbstractToken): {start: Position, end: Position} | undefined;
  findDefinitionByUsage(filename: string, token: AbstractToken): {filename: string, token: AbstractToken} | undefined;
  clear(filename: string): void;
}
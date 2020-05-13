import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";

export class FieldSymbol {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const fsname = node.findFirstExpression(Expressions.FieldSymbol)?.getFirstToken();

    const bfound = new BasicTypes(filename, scope).parseType(node);
    if (bfound && fsname) {
      return new TypedIdentifier(fsname, filename, bfound);
    }

    if (fsname) {
      return new TypedIdentifier(fsname, filename, new UnknownType("Fieldsymbol, fallback"));
    }

    return undefined;
  }
}
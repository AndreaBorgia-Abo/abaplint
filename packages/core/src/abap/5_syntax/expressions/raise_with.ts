import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {SyntaxInput} from "../_syntax_input";

export class RaiseWith {
  public runSyntax(node: ExpressionNode, input: SyntaxInput) {
    for (const f of node.findAllExpressionsMulti([Expressions.SimpleSource1, Expressions.Source])) {
      new Source().runSyntax(f, input);
    }
  }
}
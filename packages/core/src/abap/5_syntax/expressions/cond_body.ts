import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Let} from "./let";
import {Cond} from "./cond";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";

export class CondBody {
  public static runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return undefined;
    }

    let scoped = false;
    const l = node.findDirectExpression(Expressions.Let);
    if (l) {
      scoped = Let.runSyntax(l, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      Cond.runSyntax(s, input);
    }

    let type: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (type === undefined) {
        type = Source.runSyntax(s, input, targetType);
      } else {
        Source.runSyntax(s, input, targetType);
      }
    }

    if (scoped === true) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    return type;
  }
}
import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Select as SelectExpression} from "../expressions/select";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Select implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    // for UNION statements there are multiple select parts
    const selects = node.findDirectExpressions(Expressions.Select);
    for (let i = 0; i < selects.length; i++) {
      const last = i === selects.length - 1;
      const s = selects[i];
      SelectExpression.runSyntax(s, input, last === false);
    }

  }
}
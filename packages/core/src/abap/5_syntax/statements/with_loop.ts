import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Select} from "../expressions/select";
import {SelectLoop} from "../expressions/select_loop";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class WithLoop implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findAllExpressions(Expressions.Select)) {
      Select.runSyntax(s, input);
    }

    for (const s of node.findAllExpressions(Expressions.SelectLoop)) {
      SelectLoop.runSyntax(s, input);
    }

  }
}
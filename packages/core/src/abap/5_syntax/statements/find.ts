import * as Expressions from "../../2_statements/expressions";
import {StatementNode, ExpressionNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {StringType, StructureType, IntegerType, TableType, TableKeyType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Find implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    const rfound = node.findExpressionAfterToken("RESULTS");
    if (rfound && rfound.get() instanceof Expressions.Target) {
      const sub = new StructureType([
        {name: "OFFSET", type: IntegerType.get()},
        {name: "LENGTH", type: IntegerType.get()}], "SUBMATCH_RESULT", "SUBMATCH_RESULT");
      const type = new StructureType([
        {name: "LINE", type: IntegerType.get()},
        {name: "OFFSET", type: IntegerType.get()},
        {name: "LENGTH", type: IntegerType.get()},
        {name: "SUBMATCHES", type: new TableType(sub, {withHeader: false, keyType: TableKeyType.default})},
      ], "MATCH_RESULT", "MATCH_RESULT");
      if (node.concatTokens().toUpperCase().startsWith("FIND FIRST")) {
        this.inline(rfound, input, type);
      } else {
        this.inline(rfound, input, new TableType(type, {withHeader: false, keyType: TableKeyType.default}, "MATCH_RESULT_TAB"));
      }
    }

    const ofound = node.findExpressionsAfterToken("OFFSET");
    for (const o of ofound) {
      if (o.get() instanceof Expressions.Target) {
        this.inline(o, input, IntegerType.get());
      }
    }

    const lfound = node.findExpressionAfterToken("LINE");
    if (lfound && lfound.get() instanceof Expressions.Target) {
      this.inline(lfound, input, IntegerType.get());
    }

    const cfound = node.findExpressionAfterToken("COUNT");
    if (cfound && cfound.get() instanceof Expressions.Target) {
      this.inline(cfound, input, IntegerType.get());
    }

    const lnfound = node.findExpressionAfterToken("LENGTH");
    if (lnfound && lnfound.get() instanceof Expressions.Target) {
      this.inline(lnfound, input, IntegerType.get());
    }

    if (node.findDirectTokenByText("SUBMATCHES")) {
      for (const t of node.findDirectExpressions(Expressions.Target)) {
        if (t === rfound || t === lfound || t === cfound || t === lnfound) {
          continue;
        } else if (ofound.indexOf(t) >= 0) {
          continue;
        }
        const inline = t?.findDirectExpression(Expressions.InlineData);
        if (inline) {
          InlineData.runSyntax(inline, input, StringType.get());
        } else {
          Target.runSyntax(t, input);
        }
      }
    }
  }

/////////////////////

  private inline(node: ExpressionNode, input: SyntaxInput, type: AbstractType): void {
    const inline = node.findDirectExpression(Expressions.InlineData);
    if (inline) {
      InlineData.runSyntax(inline, input, type);
    } else {
      Target.runSyntax(node, input);
    }
  }

}
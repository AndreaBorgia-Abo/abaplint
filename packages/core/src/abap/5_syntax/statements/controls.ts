import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StructureType, CharacterType, IntegerType, TableType, TableKeyType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Controls implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const name = node.findDirectExpression(Expressions.NamespaceSimpleName);
    const token = name?.getFirstToken();

    if (node.findDirectTokenByText("TABSTRIP") && token) {
      const type = new StructureType([{name: "ACTIVETAB", type: new CharacterType(132)}]);
      const id = new TypedIdentifier(token, input.filename, type);
      input.scope.addIdentifier(id);
    }

    if (node.findDirectTokenByText("TABLEVIEW") && token) {
      const cols = new StructureType([
        {name: "SCREEN", type: new CharacterType(1)}, // todo
        {name: "INDEX", type: IntegerType.get()},
        {name: "SELECTED", type: new CharacterType(1)},
        {name: "VISLENGTH", type: IntegerType.get()},
        {name: "INVISIBLE", type: new CharacterType(1)},
      ]);
      const type = new StructureType([
        {name: "FIXED_COLS", type: new CharacterType(132)},
        {name: "LINES", type: IntegerType.get()},
        {name: "TOP_LINE", type: IntegerType.get()},
        {name: "CURRENT_LINE", type: IntegerType.get()},
        {name: "LEFT_COL", type: IntegerType.get()},
        {name: "LINE_SEL_MODE", type: new CharacterType(1)},
        {name: "COL_SEL_MODE", type: new CharacterType(1)},
        {name: "LINE_SELECTOR", type: new CharacterType(1)},
        {name: "H_GRID", type: new CharacterType(1)},
        {name: "V_GRID", type: new CharacterType(1)},
        {name: "COLS", type: new TableType(cols, {withHeader: false, keyType: TableKeyType.default})},
        {name: "INVISIBLE", type: new CharacterType(1)},
      ]);
      const id = new TypedIdentifier(token, input.filename, type);
      input.scope.addIdentifier(id);
    }

  }
}
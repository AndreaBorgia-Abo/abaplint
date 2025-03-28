import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {INode} from "../abap/nodes/_inode";
import {StructureNode, StatementNode, TokenNodeRegex, ExpressionNode, TokenNode} from "../abap/nodes";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {LSPUtils} from "./_lsp_utils";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {DumpScope} from "./dump_scope";
import {ABAPFile} from "../abap/abap_file";
import {VirtualPosition} from "../virtual_position";
import {DataDefinition} from "../objects";
import {IObject} from "../objects/_iobject";
import {CDSLexer} from "../cds/cds_lexer";

export class Help {
  public static find(reg: IRegistry, textDocument: LServer.TextDocumentIdentifier, position: LServer.Position): string {

    const abapFile = LSPUtils.getABAPFile(reg, textDocument.uri);
    if (abapFile !== undefined) {
      return this.dumpABAP(abapFile, reg, textDocument, position);
    }

    const file = reg.getFileByName(textDocument.uri);
    if (file === undefined) {
      return "File not found: " + textDocument.uri;
    }

    const obj = reg.findObjectForFile(file) as IObject;
    if (obj instanceof DataDefinition) {
      return this.dumpDDLS(obj, reg);
    }

    return "Unhandled object type: " + obj.getType();
  }

/////////////////////////////////////////////////

  private static dumpDDLS(obj: DataDefinition, reg: IRegistry): string {
    let content = "";
    content += "<h1>" + obj.getType() + " " + obj.getName() + "</h1>\n";
    content += obj.getDescription() + "\n";
    content += obj.getParsingIssues().map(i => i.getMessage()).join("<br>\n");
    content += `<hr>\n`;
    const parsed = obj.getParsedData();
    delete parsed?.tree;
    content += `<pre>` + JSON.stringify(parsed, null, 2) + "</pre>\n";
    content += `<hr>\n`;
    content += `<pre>` + obj.parseType(reg).toText(0) + "</pre>\n";
    content += `<hr>\n`;

    const file = obj.findSourceFile();
    if (file) {
      const tokens = CDSLexer.run(file);
      content += `<h3>Tokens</h3>\n<pre>\n`;
      for (const t of tokens) {
        content += JSON.stringify(t) + "\n";
      }
      content += `</pre>\n`;
    }

    return content;
  }

  private static dumpABAP(file: ABAPFile, reg: IRegistry, textDocument: LServer.TextDocumentIdentifier,
                          position: LServer.Position): string {

    let content = "";

    content = `
    <a href="#_tokens" rel="no-refresh">Tokens</a> |
    <a href="#_statements" rel="no-refresh">Statements</a> |
    <a href="#_structure" rel="no-refresh">Structure</a> |
    <a href="#_files" rel="no-refresh">Files</a> |
    <a href="#_info" rel="no-refresh">Info Dump</a>
    <hr>
    ` +
      "<tt>" + textDocument.uri + " (" +
      (position.line + 1) + ", " +
      (position.character + 1) + ")</tt>";

    content = content + "<hr>";
    content = content + this.cursorInformation(reg, textDocument, position, file);
    content = content + this.fileInformation(file);
    content = content + "<hr>";
    content = content + this.dumpFiles(reg);
    content = content + "<hr>";
    content = content + this.dumpInfo(file);

    return content;
  }

  private static dumpInfo(file: ABAPFile): string {
    const info = file.getInfo();

    const dump = {
      classDefinitions: info.listClassDefinitions(),
      classImplementations: info.listClassImplementations(),
      interfaceDefinitions: info.listInterfaceDefinitions(),
      forms: info.listFormDefinitions(),
    };

    const text = JSON.stringify(dump, null, 2);

    return `<h3 id="_info">Info Dump</h3><pre>` + text + "</pre>";
  }

  private static cursorInformation(reg: IRegistry,
                                   textDocument: LServer.TextDocumentIdentifier,
                                   position: LServer.Position,
                                   file: ABAPFile): string {
    let ret = "";
    const found = LSPUtils.findCursor(reg, {textDocument, position});

    if (found !== undefined) {
      ret = "Statement: " + this.linkToStatement(found.snode.get()) + "<br>\n" +
        "Token: " + found.token.constructor.name + "<br>\n" +
        this.fullPath(file, found.token).value;
    } else {
      ret = "No token found at cursor position";
    }

    const obj = reg.getObject(file.getObjectType(), file.getObjectName());
    if (obj instanceof ABAPObject) {
      const spaghetti = new SyntaxLogic(reg, obj).run().spaghetti;
      ret = ret + DumpScope.dump(spaghetti);

      if (found !== undefined) {
        ret = ret + "<hr>Spaghetti Scope by Cursor Position:<br><br>\n";
        const lookup = spaghetti.lookupPosition(found.token.getStart(), textDocument.uri);
        if (lookup) {
          const identifier = lookup.getIdentifier();
          ret = ret + "<u>" + identifier.stype + ", <tt>" + identifier.sname + "</tt>, " + identifier.filename;
          ret = ret + ", (" + identifier.start.getRow() + ", " + identifier.start.getCol() + ")</u><br>";
        } else {
          ret = ret + "Not found";
        }
      }
    }

    return ret;
  }

  private static fullPath(file: ABAPFile, token: AbstractToken): {value: string, keyword: boolean} {
    const structure = file.getStructure();

    if (structure === undefined) {
      return {value: "", keyword: false};
    }

    const found = this.traverse(structure, "", token);
    if (found === undefined) {
      return {value: "", keyword: false};
    }

    return {value: "\n\n" + found.value, keyword: found.keyword};
  }

  private static traverse(node: INode, parents: string, search: AbstractToken): {value: string, keyword: boolean} | undefined {
    let local = parents;
    if (local !== "") {
      local = local + " -> ";
    }
    if (node instanceof StructureNode) {
      local = local + "Structure: " + this.linkToStructure(node.get());
    } else if (node instanceof StatementNode) {
      local = local + "Statement: " + this.linkToStatement(node.get());
    } else if (node instanceof ExpressionNode) {
      local = local + "Expression: " + this.linkToExpression(node.get());
    } else if (node instanceof TokenNode) {
      local = local + "Token: " + node.get().constructor.name;
      const token = node.get();
      if (token.getStr() === search.getStr()
          && token.getCol() === search.getCol()
          && token.getRow() === search.getRow()) {
        const keyword = !(node instanceof TokenNodeRegex);
        return {value: local, keyword};
      }
    } else {
      throw new Error("hover, traverse, unexpected node type");
    }

    for (const child of node.getChildren()) {
      const ret = this.traverse(child, local, search);
      if (ret) {
        return ret;
      }
    }

    return undefined;
  }

  private static fileInformation(file: ABAPFile): string {
    let content = "";

    content = content + `<hr><h3 id="_tokens">Tokens</h3>\n`;
    content = content + this.tokens(file);
    content = content + `<hr><h3 id="_statements">Statements</h3>\n`;
    content = content + this.buildStatements(file);
    content = content + `<hr><h3 id="_structure">Structure</h3>\n`;

    const structure = file.getStructure();
    if (structure !== undefined) {
      content = content + this.buildStructure([structure]);
    } else {
      content = content + "structure undefined";
    }
    return content;
  }

  private static escape(str: string) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
  }

  private static linkToStatement(statement: any) {
    return `<a href="https://syntax.abaplint.org/#/statement/${
      statement.constructor.name}" target="_blank">${statement.constructor.name}</a>\n`;
  }

  private static linkToStructure(structure: any) {
    return `<a href="https://syntax.abaplint.org/#/structure/${
      structure.constructor.name}" target="_blank">${structure.constructor.name}</a>\n`;
  }

  private static linkToExpression(expression: any) {
    return `<a href="https://syntax.abaplint.org/#/expression/${
      expression.constructor.name}" target="_blank">${expression.constructor.name}</a>\n`;
  }

  private static outputNodes(nodes: readonly INode[]) {
    let ret = "<ul>";
    for (const node of nodes) {
      let extra = "";
      switch (node.constructor.name) {
        case "TokenNode":
        case "TokenNodeRegex":
          // @ts-ignore
          extra = node.get().constructor.name + ", \"" + node.get().getStr() + "\"";
          break;
        case "ExpressionNode":
          extra = this.linkToExpression(node.get()) + this.outputNodes(node.getChildren());
          break;
        default:
          break;
      }

      ret = ret + "<li>" + node.constructor.name + ", " + extra + "</li>";
    }
    return ret + "</ul>";
  }

  private static tokens(file: ABAPFile) {
    let inner = `<table><tr><td><b>String</b></td><td><b>Type</b></td>
    <td><b>Row</b></td><td><b>Column</b></td>
    <td><b>vRow</b></td><td><b>vColumn</b></td>
    </tr>`;
    for (const token of file.getTokens()) {
      const tStart = token.getStart();

      inner += "<tr><td><tt>" +
        this.escape(token.getStr()) + "</tt></td><td>" +
        token.constructor.name + "</td><td align=\"right\">" +
        tStart.getRow() + "</td><td align=\"right\">" +
        tStart.getCol() + "</td>";

      if (tStart instanceof VirtualPosition) {
        inner += `<td>${tStart.vcol}</td><td>${tStart.vrow}</td>`;
      } else {
        inner += "<td></td><td></td>";
      }

      inner += "</tr>";
    }
    inner = inner + "</table>";
    return inner;
  }

  private static buildStatements(file: ABAPFile) {
    let output = "";

    for (const statement of file.getStatements()) {
      const row = statement.getStart().getRow();
  // getting the class name only works if uglify does not mangle names
      output = output +
        row + ": " +
        this.linkToStatement(statement.get()) +
        "</div></b>\n" + this.outputNodes(statement.getChildren());
    }

    return output;
  }

  private static buildStructure(nodes: readonly INode[]) {
    let output = "<ul>";
    for (const node of nodes) {
      if (node instanceof StructureNode) {
        output = output + "<li>" + this.linkToStructure(node.get()) + ", Structure " + this.buildStructure(node.getChildren()) + "</li>";
      } else if (node instanceof StatementNode) {
        output = output + "<li>" + this.linkToStatement(node.get()) + ", Statement</li>";
      }
    }
    return output + "</ul>";
  }

  private static dumpFiles(reg: IRegistry) {
    let output = `<h3 id="_files">Files</h3><table>\n`;
    for (const o of reg.getObjects()) {
      if (reg.isDependency(o) === true) {
        continue;
      }
      output = output + "<tr><td valign=\"top\">" + o.getType() + " " + o.getName() + "</td><td>";
      for (const f of o.getFiles()) {
        output = output + f.getFilename() + "<br>";
      }
      output = output + "</td></tr>\n";
    }
    return output + "</table>\n";
  }

}
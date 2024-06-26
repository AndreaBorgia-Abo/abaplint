import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ExpressionNode} from "../abap/nodes";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {TypePool} from "../objects";

export class TypesNamingConf extends BasicRuleConfig {
  /** The pattern for TYPES, case insensitive */
  public pattern: string = "^TY_.+$";
}

export class TypesNaming extends ABAPRule {

  private conf = new TypesNamingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "types_naming",
      title: "TYPES naming conventions",
      shortDescription: `Allows you to enforce a pattern for TYPES definitions`,
      extendedInformation: `Does not run for TYPE POOLS`,
      tags: [RuleTag.Naming, RuleTag.SingleFile],
      badExample: `TYPES foo TYPE i.`,
      goodExample: `TYPES ty_foo TYPE i.`,
    };
  }

  public getConfig(): TypesNamingConf {
    return this.conf;
  }

  public setConfig(conf: TypesNamingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];
    const testRegex = new RegExp(this.conf.pattern, "i");
    let nesting = 0;

    if (obj instanceof TypePool) {
      return [];
    }

    for (const stat of file.getStatements()) {
      let expr: ExpressionNode | undefined = undefined;

      if (stat.get() instanceof Statements.Type && nesting === 0) {
        expr = stat.findFirstExpression(Expressions.NamespaceSimpleName);
      } else if (stat.get() instanceof Statements.TypeBegin
          || stat.get() instanceof Statements.TypeEnumBegin) {
        if (nesting === 0) {
          expr = stat.findFirstExpression(Expressions.NamespaceSimpleName);
        }
        nesting = nesting + 1;
      } else if (stat.get() instanceof Statements.TypeEnd
          || stat.get() instanceof Statements.TypeEnumEnd) {
        nesting = nesting - 1;
        continue;
      } else {
        continue;
      }

      if (expr === undefined) {
        continue;
      }

      const token = expr.getFirstToken();

      if (testRegex.exec(token.getStr())) {
        continue;
      } else {
        const message = "Bad TYPES naming, expected \"" + this.conf.pattern + "\", got \"" + token.getStr() + "\"";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

    }

    return issues;
  }

}
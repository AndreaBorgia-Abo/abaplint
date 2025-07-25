import {plusPrio, seq, ver, tok, Expression, optPrio, altPrio} from "../combi";
import {Constant, SQLFieldName, SQLAggregation, SQLCase, SQLAsName, SimpleFieldChain2} from ".";
import {Version} from "../../../version";
import {WAt, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SQLPath} from "./sql_path";

export class SQLField extends Expression {
  public getRunnable(): IStatementRunnable {

    const abap = ver(Version.v740sp05, seq(tok(WAt), SimpleFieldChain2));

    const as = seq("AS", SQLAsName);

    const field = altPrio(SQLAggregation,
                          SQLCase,
                          SQLFunction,
                          SQLPath,
                          SQLFieldName,
                          abap,
                          Constant);
    const sub = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), optPrio(tok(WParenLeftW)), field, optPrio(tok(WParenRightW))));
    const arith = ver(Version.v740sp05, sub);

    return seq(field, optPrio(arith), optPrio(as));
  }
}
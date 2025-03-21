import {IStatement} from "./_statement";
import {seq, alt, opt, optPrio, per, plus, altPrio} from "../combi";
import {Target, Source, Dynamic, ComponentCompare, ComponentCond, SimpleName, FieldOffset, FieldLength, SimpleFieldChain2} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, is READ and DELETE similar? something can be reused?
    const index = seq("INDEX", Source);

    const keyName = altPrio(SimpleName, Dynamic);
    const using = seq("USING KEY", keyName);

    const from = seq("FROM", Source);

    const fromTo = seq(optPrio(from),
                       optPrio(seq("TO", Source)));

    const where = seq("WHERE", alt(ComponentCond, Dynamic));

    const key = seq("WITH TABLE KEY",
                    opt(seq(keyName, "COMPONENTS")),
                    plus(ComponentCompare));

    const table = seq("TABLE",
                      Target,
                      alt(per(index, using), seq(optPrio(from), optPrio(using)), key));

    const other = seq(Target,
                      alt(per(index, using), fromTo, key), opt(where));

    const f = seq(SimpleFieldChain2, optPrio(FieldOffset), optPrio(FieldLength));

    const adjacent = seq("ADJACENT DUPLICATES FROM",
                         Target,
                         optPrio(using),
                         opt(seq("COMPARING", altPrio("ALL FIELDS", plus(altPrio(f, Dynamic))))),
                         optPrio(using));

    return seq("DELETE", alt(table, adjacent, other));
  }

}
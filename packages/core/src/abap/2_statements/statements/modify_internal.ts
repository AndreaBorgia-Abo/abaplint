import {IStatement} from "./_statement";
import {seq, opt, alt, per, plus} from "../combi";
import {FSTarget, Target, Source, Dynamic, ComponentCond, ComponentChainSimple, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seq("INDEX", Source);
    const from = seq("FROM", Source);
    const transporting = seq("TRANSPORTING", plus(alt(ComponentChainSimple, Dynamic)));

    const where = seq("WHERE", ComponentCond);
    const assigning = seq("ASSIGNING", FSTarget);
    const using = seq("USING KEY", SimpleName);
    const additions = per(where, assigning, using);

    const target = alt(Target, Dynamic);

    const options = alt(
      per(index, transporting),
      seq(from, opt(per(index, transporting, using))),
      seq(per(index, transporting), from, opt(per(index, transporting))));

    const long = seq("MODIFY", opt("TABLE"), target, opt(options), opt(additions));

    const simple = seq("MODIFY TABLE", target, per(from, using));

    return alt(long, simple);
  }

}
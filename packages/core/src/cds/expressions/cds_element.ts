import {CDSAggregate, CDSAnnotation, CDSArithmetics, CDSCase, CDSFunction, CDSInteger, CDSName, CDSPrefixedName, CDSString} from ".";
import {Expression, opt, optPrio, seq, alt, starPrio, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    const redirected = seq(": REDIRECTED TO", opt(alt("PARENT", "COMPOSITION CHILD")), CDSName);
    const colonThing = seq(":", CDSName);

    return seq(starPrio(CDSAnnotation),
               optPrio("KEY"),
               altPrio(CDSAggregate,
                       CDSString,
                       CDSArithmetics,
                       CDSFunction,
                       CDSCast,
                       CDSCase,
                       seq("(", CDSCase, ")"),
                       seq(CDSPrefixedName, opt(alt(redirected, colonThing))),
                       CDSInteger),
               opt(CDSAs));
  }
}
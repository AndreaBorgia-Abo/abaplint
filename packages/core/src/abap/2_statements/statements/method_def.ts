import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {seq, alt, altPrio, ver, optPrio, plus} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising, MethodDefExceptions, MethodParamName, NamespaceSimpleName, TypeName, EntityAssociation} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = ver(Version.v740sp08, seq("DEFAULT", altPrio("FAIL", "IGNORE")));

    const parameters = seq(optPrio(altPrio("FINAL", def, Abstract)),
                           optPrio(MethodDefImporting),
                           optPrio(MethodDefExporting),
                           optPrio(MethodDefChanging),
                           optPrio(MethodDefReturning),
                           optPrio(altPrio(MethodDefRaising, MethodDefExceptions)));

    const testing = seq(optPrio(Abstract), "FOR TESTING", optPrio(altPrio(MethodDefRaising, MethodDefExceptions)));

    const result = seq("RESULT", MethodParamName);
    const link = seq("LINK", MethodParamName);
    const full = seq("FULL", MethodParamName);

    const modify = alt(
      seq("FOR ACTION", TypeName, optPrio(result)),
      seq("FOR CREATE", alt(TypeName, EntityAssociation)),
      seq("FOR DELETE", TypeName),
      seq("FOR UPDATE", TypeName));

    const forRead = seq("FOR READ", alt(TypeName, EntityAssociation), optPrio(full), result, optPrio(link));
    const forfunction = seq("FOR FUNCTION", TypeName, result);

    const behavior = altPrio(
      "DDL OBJECT OPTIONS CDS SESSION CLIENT REQUIRED",  // todo, this is only from version something
      seq("TABLE FUNCTION", NamespaceSimpleName), // todo, this is only from version something
      seq("VALIDATE ON SAVE IMPORTING", MethodParamName, "FOR", TypeName),
      seq("MODIFY IMPORTING", plus(seq(MethodParamName, modify))),
      seq("PRECHECK IMPORTING", MethodParamName, modify),
      seq("NUMBERING IMPORTING", MethodParamName, modify),
      seq("READ IMPORTING", MethodParamName, altPrio(forRead, forfunction)),
      seq("FEATURES IMPORTING", MethodParamName, "REQUEST", NamespaceSimpleName, "FOR", NamespaceSimpleName, result),
      seq("BEHAVIOR IMPORTING", MethodParamName, "FOR CREATE", TypeName, MethodParamName, "FOR UPDATE", TypeName, MethodParamName, "FOR DELETE", TypeName),
      seq("BEHAVIOR IMPORTING", MethodParamName, "FOR READ", TypeName, result),
      seq(alt("BEHAVIOR", "LOCK"), "IMPORTING", MethodParamName, "FOR LOCK", TypeName),
      seq("DETERMINE", alt("ON MODIFY", "ON SAVE"), "IMPORTING", MethodParamName, "FOR", TypeName),
      seq("GLOBAL AUTHORIZATION IMPORTING REQUEST", MethodParamName, "FOR", TypeName, result),
      seq("GLOBAL FEATURES IMPORTING REQUEST", MethodParamName, "FOR", TypeName, result),
      seq("INSTANCE AUTHORIZATION IMPORTING", MethodParamName, "REQUEST", MethodParamName, "FOR", TypeName, result),
      seq("INSTANCE FEATURES IMPORTING", MethodParamName, "REQUEST", MethodParamName, "FOR", TypeName, result),
    );

// todo, this is only from version something
    const amdp = seq(
      "AMDP OPTIONS", optPrio("READ-ONLY"), "CDS SESSION CLIENT CURRENT",
      optPrio(MethodDefImporting),
      optPrio(MethodDefExporting),
      optPrio(MethodDefRaising));

    const ret = seq(altPrio("CLASS-METHODS", "METHODS"),
                    MethodName,
                    alt(seq(optPrio(Abstract), optPrio(def), EventHandler),
                        parameters,
                        testing,
                        seq("FOR", behavior),
                        amdp,
                        "NOT AT END OF MODE",
                        optPrio(Redefinition)));

    return ret;
  }

}
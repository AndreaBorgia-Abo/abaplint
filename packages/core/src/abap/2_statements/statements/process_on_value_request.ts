import {IStatement} from "./_statement";
import {verNot} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ProcessOnValueRequest implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, "PROCESS ON VALUE-REQUEST");
  }

}
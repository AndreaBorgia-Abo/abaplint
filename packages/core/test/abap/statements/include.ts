import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "INCLUDE zabapgit_gui_pages_userexit IF FOUND.",
  "INCLUDE <OBJECT>.",
  "INCLUDE <%_bar>.",
  "INCLUDE ZFOOOO-BAR.", // yes, this is allowed, but not for new programs
  "INCLUDE zabapgit_gui_router.",
  "INCLUDE LZ--AA01.",
];

statementType(tests, "INCLUDE", Statements.Include);
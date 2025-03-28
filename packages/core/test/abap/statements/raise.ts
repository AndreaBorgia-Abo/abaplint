import {statementExpectFail, statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "raise exception type zcx_root.",
  "RAISE EXCEPTION lx_root.",
  "RAISE RESUMABLE EXCEPTION TYPE zcx_foobar.",
  "RAISE EXCEPTION TYPE lcx_exception EXPORTING iv_text = lv_text.",
  "RAISE EXCEPTION TYPE /iwbep/cx_mgw_not_impl_exc.",
  "RAISE EXCEPTION TYPE /iwbep/cx_mgw_not_impl_exc EXPORTING textid = \n" +
    "/iwbep/cx_mgw_not_impl_exc=>method_not_implemented method = 'CREATE_DEEP_ENTITY'.",
  "RAISE RESUMABLE EXCEPTION TYPE zcx_error EXPORTING textid = zcx_error=>some_values_too_high.",
  "RAISE EXCEPTION me->dd_sobject_store-exception.",
  "RAISE EXCEPTION lr_/foo/cx_bar.",
  "RAISE EXCEPTION TYPE cx_error MESSAGE e004(clas) EXPORTING previous = lx_error.",
  "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZZZ' NUMBER '001' WITH <fs>-value.",
  "RAISE EXCEPTION TYPE zcx_error MESSAGE s123(c$).",
  "RAISE EXCEPTION NEW zcx_excel( i_message = 'Worksheet not found.').",
  "RAISE exc.",
  "RAISE SHORTDUMP TYPE /foo/bar MESSAGE e401(/foo/bar) WITH iv_table.",
  "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZZZ' NUMBER '001' WITH |23234|.",
  "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZZZ' NUMBER '001' WITH |23234| && |sdf|.",

  `RAISE EXCEPTION TYPE zcxsdfsd MESSAGE e003(zsdfsdf)
    WITH lx_error->get_text( )
    EXPORTING previous = lx_error.`,

  `RAISE EXCEPTION TYPE zcxsdfsd MESSAGE e006
    WITH
      'Hello'(001)
      'VALUE'
      CONV symsgv( lo->get_text( ) )
      space.`,

  `RAISE EXCEPTION TYPE zcx_foo
     MESSAGE e100 WITH COND #( WHEN moo-boo IS INITIAL
                               THEN lo_typedescr->get_relative_name( )
                               ELSE ls_ddic-sdf ).`,
];

statementType(tests, "RAISE", Statements.Raise);


const versions = [
  {abap: "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID sy-msgid TYPE sy-msgty" +
    " NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZFOO' TYPE 'E' NUMBER 001.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_bar MESSAGE e000(zp_foo) WITH lv_moo.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZFOO' TYPE 'E' NUMBER 001 WITH bar.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_foobar USING MESSAGE.", ver: Version.v752},
  {abap: "RAISE EXCEPTION NEW zcx_foobar( ).", ver: Version.v752},
];

statementVersion(versions, "RAISE", Statements.Raise);


const fails = [
  "RAISE EXCEPTION NEW cx_blah( ) MESSAGE e003.",
//  "RAISE EXCEPTION TYPE zcx_sdfds MESSAGE e006(sdf) WITH xstrlen( val ) ms_info.",
];
statementExpectFail(fails, "RAISE");
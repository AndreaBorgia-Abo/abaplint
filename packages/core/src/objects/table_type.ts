import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {IObjectAndToken} from "../_iddic_references";
import {DataReference, GenericObjectReferenceType, ITableOptions, TableAccessType} from "../abap/types/basic";
import {xmlToArray} from "../xml_utils";

export class TableType extends AbstractObject {
  private parsedXML: {
    rowtype?: string,
    rowkind?: string,
    datatype?: string,
    leng?: string,
    decimals?: string,
    accessmode?: string,
    keykind?: string,
    ddtext?: string,
    keydef?: string,
    dd42v: {keyname: string, keyfield: string}[];
    dd43v: {keyname: string, accessmode: string, kind: string, unique: boolean}[];
  } | undefined = undefined;

  public getType(): string {
    return "TTYP";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    this.parseXML();
    return this.parsedXML?.ddtext;
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  private buildPrimaryKey() {
    const primaryKey: Types.ITableKey = {
      isUnique: this.parsedXML?.keykind === "U",
      type: TableAccessType.standard,
      keyFields: [],
      name: "primary_key",
    };
    if (this.parsedXML?.accessmode === "S") {
      primaryKey.type = TableAccessType.sorted;
    } else if (this.parsedXML?.accessmode === "H") {
      primaryKey.type = TableAccessType.hashed;
    }

    for (const f of this.parsedXML?.dd42v || []) {
      if (f.keyname === "") {
        primaryKey.keyFields.push(f.keyfield);
      }
    }
    if (this.parsedXML?.keydef === "T" && primaryKey.keyFields.length === 0) {
      primaryKey.keyFields.push("table_line");
    }
    return primaryKey;
  }

  private buildTableOptions(): ITableOptions {
    let keyType = Types.TableKeyType.user;
    if (this.parsedXML?.keydef === "D") {
      keyType = Types.TableKeyType.default;
    }

    const tableOptions: ITableOptions = {
      withHeader: false,
      keyType: keyType,
      primaryKey: this.buildPrimaryKey(),
      secondary: [],
    };

    for (const k of this.parsedXML?.dd43v || []) {
      const fields: string[] = [];
      for (const f of this.parsedXML?.dd42v || []) {
        if (f.keyname === k.keyname) {
          fields.push(f.keyfield);
        }
      }
      let accessType: TableAccessType = TableAccessType.standard;
      switch (k.accessmode) {
        case "S":
          accessType = TableAccessType.sorted;
          break;
        case "H":
          accessType = TableAccessType.hashed;
          break;
        default:
          break;
      }
      tableOptions.secondary?.push({
        name: k.keyname,
        type: accessType,
        keyFields: fields,
        isUnique: k.unique,
      });
    }

    return tableOptions;
  }

  public parseType(reg: IRegistry): AbstractType {
    this.parseXML();

    const ddic = new DDIC(reg);

    const references: IObjectAndToken[] = [];
    let type: AbstractType;
    const tableOptions = this.buildTableOptions();

    if (this.parsedXML === undefined) {
      type = new Types.UnknownType("Table Type, parser error", this.getName());
    } else if (this.parsedXML.rowkind === "S") {
      const lookup = ddic.lookupTableOrView(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName(), this.getDescription());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "E") {
      const lookup = ddic.lookupDataElement(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName(), this.getDescription());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "L") {
      const lookup = ddic.lookupTableType(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName(), this.getDescription());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype === "OBJECT") {
      type = new Types.TableType(new GenericObjectReferenceType(), tableOptions, this.getName(), this.getDescription());
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype === "DATA") {
      type = new Types.TableType(new DataReference(new Types.DataType()), tableOptions, this.getName(), this.getDescription());
    } else if (this.parsedXML.rowkind === "R" && this.parsedXML.rowtype !== undefined) {
      const lookup = ddic.lookupObject(this.parsedXML.rowtype);
      type = new Types.TableType(lookup.type, tableOptions, this.getName(), this.getDescription());
      if (lookup.object) {
        references.push({object: lookup.object});
      }
    } else if (this.parsedXML.rowkind === "") {
      if (this.parsedXML.datatype === undefined) {
        type = new Types.UnknownType("Table Type, empty DATATYPE" + this.getName(), this.getName());
      } else {
        const row = ddic.textToType({
          text: this.parsedXML.datatype,
          length: this.parsedXML.leng,
          decimals: this.parsedXML.decimals,
          infoText: this.getName(),
        });
        type = new Types.TableType(row, tableOptions, this.getName(), this.getDescription());
      }
    } else {
      type = new Types.UnknownType("Table Type, unknown kind \"" + this.parsedXML.rowkind + "\"" + this.getName(), this.getName());
    }

    reg.getDDICReferences().setUsing(this, references);
    return type;
  }

////////////////////

  private parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {
      dd42v: [],
      dd43v: [],
    };

    const parsed = super.parseRaw2();
    if (parsed === undefined || parsed.abapGit === undefined) {
      return;
    }

    const values = parsed.abapGit["asx:abap"]["asx:values"];
    if (values === undefined) {
      return;
    }

    const dd40v = values.DD40V;
    this.parsedXML.rowtype = dd40v.ROWTYPE ? dd40v.ROWTYPE : "";
    this.parsedXML.rowkind = dd40v.ROWKIND ? dd40v.ROWKIND : "";
    this.parsedXML.datatype = dd40v.DATATYPE;
    this.parsedXML.leng = dd40v.LENG;
    this.parsedXML.decimals = dd40v.DECIMALS;
    this.parsedXML.accessmode = dd40v.ACCESSMODE;
    this.parsedXML.keykind = dd40v.KEYKIND;
    this.parsedXML.ddtext = dd40v.DDTEXT;
    this.parsedXML.keydef = dd40v.KEYDEF;

    for (const x of xmlToArray(values.DD42V?.DD42V)) {
      this.parsedXML.dd42v.push({
        keyname: x.SECKEYNAME || "",
        keyfield: x.KEYFIELD || "",
      });
    }
    for (const x of xmlToArray(values.DD43V?.DD43V)) {
      this.parsedXML.dd43v.push({
        keyname: x.SECKEYNAME || "",
        accessmode: x.ACCESSMODE || "",
        kind: x.KIND || "",
        unique: x.SECKEYUNIQUE === "X",
      });
    }
  }

}

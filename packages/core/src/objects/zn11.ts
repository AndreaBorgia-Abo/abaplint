import {AbstractObject} from "./_abstract_object";

export class ZN11 extends AbstractObject {

  public getType(): string {
    return "ZN11";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
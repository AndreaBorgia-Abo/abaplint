import {Version} from "./version";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  /** input files, glob format
   * @uniqueItems true
  */
  files: string | string[];
  skipGeneratedBOPFInterfaces?: boolean;
  /** Skips generated table maintenances, determined via TOBJ object */
  skipGeneratedFunctionGroups?: boolean;
  skipGeneratedGatewayClasses?: boolean;
  skipGeneratedPersistentClasses?: boolean;
  skipGeneratedProxyClasses?: boolean;
  skipGeneratedProxyInterfaces?: boolean;
  /** Clone and parse dependencies specified in .apack-manifest.xml if it is present */
  useApackDependencies?: boolean;
  /** Do not report any issues for includes without main programs */
  skipIncludesWithoutMain?: boolean;
  /** list of files to exclude, these files are not added when running syntax check or any other rules, case insensitive regex
   * @uniqueItems true
  */
  exclude?: string[];
  /** list of files to not report any issues for, case insensitive regex
   * @uniqueItems true
  */
  noIssues?: string[];
}

export interface IDependency {
  /** Url of a git repository */
  url?: string;
  /** Git branch */
  branch?: string;
  /** Name of local folder with dependencies */
  folder?: string;
  /** File search, glob pattern */
  files: string;
}

export interface ISyntaxSettings {
  /** ABAP language version */
  version?: Version;
  /** Report error for objects in this regex namespace. Types not in namespace will be void. Case insensitive */
  errorNamespace: string;
  /** List of full named global constants (regex not possible)
   * @uniqueItems true
  */
  globalConstants?: string[];
  /** List of full named global macros (regex not possible)
   * @uniqueItems true
  */
  globalMacros?: string[];
}

export interface IRenameSettings {
  /** output folder, if value is empty or undefined the changes are written inline in the input folders */
  output?: string;
  /** list of regex, matches filenames to be skipped, case insensitive
   * @uniqueItems true
  */
  skip?: string[];
  /** List of rename patterns
   * @uniqueItems true
  */
  patterns: {
    /** Object type, example "CLAS", regex, case insensitive */
    type: string,
    /** Matches object name, regex, case insensitive */
    oldName: string,
    /** new name, match groups from oldName regex can be used */
    newName: string,
  }[];
}

export interface IAbaplintAppSettings {
  /** Enable or disable observations, enabled by default */
  observations?: boolean,
}

export interface IConfig {
  /** Global settings */
  global: IGlobalConfig;
  /** External git dependencies used for syntax checks */
  dependencies?: IDependency[];
  /** Syntax settings */
  syntax: ISyntaxSettings;
  /** Automatic object rename settings, use with command line paramter "--rename" */
  rename?: IRenameSettings;
  /** abaplint.app settings, see https://docs.abaplint.app */
  app?: IAbaplintAppSettings;
  /** Settings for each rule, see https://rules.abaplint.org */
  rules: any;
  /** see https://abaplint.app */
  targetRules?: any;
}

export interface IConfiguration {
  getEnabledRules(): IRule[];
  get(): IConfig;
  getGlobal(): IGlobalConfig;
  getVersion(): Version;
  getSyntaxSetttings(): ISyntaxSettings;
  readByRule(rule: string): any;
  readByKey(rule: string, key: string): any;
}
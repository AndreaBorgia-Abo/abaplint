import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src";
import {renderIcons, preamble, postamble, experimentalIcon, upportIcon, whitespaceIcon, namingIcon, syntaxIcon, styleguideIcon, downportIcon, quickfixIcon, securityIcon, singleFileIcon, performanceIcon, example} from "./common";
import {buildRule} from "./rule_page";
import {RuleTag} from "../../../packages/core/build/src/rules/_irule";

// quick'n dirty, optimizes for search engine indexing

function buildChips(json: any) {
  let html = `<div id="chipsDiv">`;
  let issued = 0;

  for (const tag in RuleTag) {
    let icon = "";

    switch(tag) {
      case RuleTag.Experimental:
        icon = experimentalIcon;
        break;
      case RuleTag.Upport:
        icon = upportIcon;
        break;
      case RuleTag.Downport:
        icon = downportIcon;
        break;
      case RuleTag.Whitespace:
        icon = whitespaceIcon;
        break;
      case RuleTag.Security:
        icon = securityIcon;
        break;
      case RuleTag.Naming:
        icon = namingIcon;
        break;
      case RuleTag.Syntax:
        icon = syntaxIcon;
        break;
      case RuleTag.Styleguide:
        icon = styleguideIcon;
        break;
      case RuleTag.Quickfix:
        icon = quickfixIcon;
        break;
      case RuleTag.SingleFile:
        icon = singleFileIcon;
        break;
      case RuleTag.Performance:
        icon = performanceIcon;
        break;
      default:
        break;
    }
    if (icon === "") {
      continue;
    }

    let count = 0;
    for (const rule of json) {
      if (rule.tags.includes(tag)) {
        count++;
      }
    }
    if (count > 0) {
      html += `
<div class="chip shadow1" title="${tag}">
  <div class="chip-content-enabled">${count}</div>
  <div class="chip-content-disabled">${icon}</div>
</div>&nbsp;&nbsp;&nbsp;\n`;
      issued++;
    }

    if (issued % 6 === 0) {
      html += "<br><br>\n";
    }
  }

  html += "</div><br>\n";

  return html;
}

function buildIndex(json: any) {

  let html = `<h1>abaplint rules documentation, ${abaplint.Registry.abaplintVersion()}</h1>
<a href="https://abaplint.org">abaplint</a> can be configured by placing a <tt>abaplint.json</tt> file in the root of the git repository.
If no configuration file is found, the default configuration will be used, which contains have all rules enabled.
<br><br>
Get default configuration by running <tt>abaplint -d > abaplint.json</tt>
<br><br>
<a href="https://github.com/FreHu/abaplint-clean-code">abaplint-clean-code</a> contains rule
documentation as well as abaplint.json definitions which attempt to align abaplint with the official
<a href="https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md">Clean ABAP styleguide</a>.

<br><br>
<div id="searchBox">
<form role="search">
  <input type="search" placeholder="Search..." id="input" autofocus />
</form>
</div>

<h2><div id="rules_count" style="display: inline-block;">${json.length}</div> Rules</h2>
${buildChips(json)}
<div id="rules">
`;

  for (const r of json) {
    html += `\n<div id="rule-${r.key}"><a href='./${r.key}/'><tt>${r.key}</tt> - ${r.title}</a>`;
    html += `<div class="hidden">${(r.tags || []).join(",")}</div>`;
    html += renderIcons(r.tags);
    if (r.hasExample) {
      html += example();
    }
    html += `<br>${r.shortDescription}<br><br></div>\n`;
  }
  html += `</div>
<script type="text/javascript">
  const list = ${JSON.stringify(json)};
</script>
<script src="/fuse.basic.js"></script>
<script src="/index.js"></script>`;

  fs.writeFileSync("build/index.html", preamble() + html + postamble);

  fs.writeFileSync("build/count.txt", "" + json.length);
}

const rawSchema = fs.readFileSync("../../packages/core/scripts/schema.json");

function buildSchema() {
  fs.writeFileSync("build/schema.js", "const abaplintSchema = " + rawSchema);
}

function buildRulesJson() {
  const json: any = [];

  const sorted = abaplint.ArtifactsRules.getRules().sort((a, b) => {
    return a.getMetadata().key.localeCompare(b.getMetadata().key); });

  for (const r of sorted) {
    const meta = r.getMetadata();
    json.push({
      key: meta.key,
      title: meta.title,
      shortDescription: meta.shortDescription,
      extendedInformation: meta.extendedInformation || "",
      hasExample: meta.badExample !== undefined,
      tags: meta.tags ? meta.tags : []});
  }
  fs.writeFileSync("build/rules.json", JSON.stringify(json, null, 2));

  return json;
}

function run() {
  fs.mkdirSync("build", {recursive: true});

  buildSchema();

  for (const r of abaplint.ArtifactsRules.getRules()) {
    buildRule(r.getMetadata());
  }

  const rules = buildRulesJson();

  buildIndex(rules);
}

run();
export const EXPLOIT_VULNERABILITY_ACTION_ID =
  "Compendium.pf2e.actionspf2e.fodJ3zuwQsYnBbtk";
export const MORTAL_WEAKNESS_EFFECT_SOURCEID = "Item.plf15q5mFglgWG8w";
export const MORTAL_WEAKNESS_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.N0jy0FFGS7ViTvs9";
export const PERSONAL_ANTITHESIS_EFFECT_SOURCEID = "Item.Ug14iErZQ2h2y7B2";
export const PERSONAL_ANTITHESIS_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.EGY7Rxcxwv1aEyHL";
export const FLAT_FOOTED_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.Xuwb7a6jCWkFS0lI";
export const MORTAL_WEAKNESS_TARGET_SOURCEID = "Item.8z4Q1PuKb13GJMPR";
export const MORTAL_WEAKNESS_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.q2TMJ31MwLNJV1jA";
export const PERSONAL_ANTITHESIS_TARGET_SOURCEID = "Item.5QgPHAdpsUHJmCkX";
export const PERSONAL_ANTITHESIS_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.dNpf1EDKJ6fgNL42";
export const BREACHED_DEFENSES_SOURCEID =
  "Compendium.pf2e.feats-srd.5EzJVhiHQvr3v72n";
export const BREACHED_DEFENSES_EFFECT_SOURCEID = "Item.9ZJclirw6zHSkk0n";
export const BREACHED_DEFENSES_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.FMw5IpJdA6eOgtv1";
export const BREACHED_DEFENSES_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.E38yjK1tdr579dJy";
export const BREACHED_DEFENSES_TARGET_SOURCEID = "Item.aasC0M4NDDjR84UI";
export const DIVERSE_LORE_SOURCEID =
  "Compendium.pf2e.feats-srd.KlqKpeq5OmTRxVHb";
export const ESOTERIC_WARDEN_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.fufcXy1CEMvxmgWt";
export const ESOTERIC_WARDEN_EFFECT_SOURCEID = "Item.uKh4kjbl4arTnzC4";
export const CURSED_EFFIGY_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.s0NI9gKZygLUunOg";
export const CURSED_EFFIGY_SOURCEID = "Item.XDXJA884X2AYJ0RO";
import { createEffectOnActor } from "./exploit-vulnerability.js";

const HelpfulEffectSourceIDs = new Array(
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_EFFECT_SOURCEID
);

const TargetEffectSourceIDs = new Array(
  PERSONAL_ANTITHESIS_TARGET_SOURCEID,
  MORTAL_WEAKNESS_TARGET_SOURCEID,
  BREACHED_DEFENSES_TARGET_SOURCEID,
  CURSED_EFFIGY_SOURCEID
);

//Gets the thaum effects from the character
export function getActorEVEffect(a, targetID) {
  if (targetID === undefined) {
    return a.items?.find((item) => {
      if (
        HelpfulEffectSourceIDs.includes(item.getFlag("core", "sourceId")) ||
        TargetEffectSourceIDs.includes(item.getFlag("core", "sourceId"))
      ) {
        return item;
      }
    });
  } else if (targetID === "*") {
    let effects = new Array();
    for (let item of a.items) {
      if (TargetEffectSourceIDs.includes(item.getFlag("core", "sourceId"))) {
        effects.push(item);
      }
    }
    return effects;
  } else {
    let effects = new Array();

    for (let item of a.items) {
      if (
        TargetEffectSourceIDs.includes(item.getFlag("core", "sourceId")) &&
        item?.rules.find(
          (rules) =>
            rules.key === "RollOption" &&
            rules.option === "origin:id:" + targetID.split(".").join("")
        )
      ) {
        effects.push(item);
      }
    }
    return effects;
  }
}

//Gets and returns the highest IWR value from an array that is passed in
export function getGreatestIWR(iwr) {
  if (iwr) {
    let gIWR = iwr[0];
    let allGIWR = [];
    for (const n of iwr) {
      if (n.value >= gIWR.value) {
        if (n.value === gIWR.value) {
          allGIWR.push(n);
        }
        gIWR = n;
      }
    }
    if (allGIWR.length > 1) {
      gIWR = allGIWR[Math.floor(Math.random() * allGIWR.length)];
    }
    return gIWR;
  }
}

//gets and returns the greatest bypassable resistance
export function BDGreatestBypassableResistance(t) {
  const r = getIWR(t).resistances;
  if (r) {
    let bypassResists = new Array();
    for (let resist of r) {
      if (resist.exceptions.length != 0) {
        bypassResists.push(resist);
      }
    }
    if (bypassResists.length != 0) {
      let gBD = bypassResists[0];
      for (let resist of bypassResists) {
        if (resist.value >= gBD.value) {
          gBD = resist;
        }
      }
      return gBD;
    }
  }
}

//gets and returns the IWR information from from the selected token or actor
export function getIWR(a) {
  if (a.actor) {
    a = a.actor;
  }
  const iwr = (() => {
    return {
      resistances: a.attributes?.resistances,
      weaknesses: a.attributes?.weaknesses,
      immunities: a.attributes?.immunities,
    };
  })();
  return iwr;
}

//Creates the dialog box when a success or crit success on Esoteric Lore is rolled
export async function createEVDialog(
  sa,
  t,
  paEffectSource,
  mwEffectSource,
  rollDOS
) {
  const paDmg = 2 + Math.floor(sa.level / 2);
  const iwrContent = createIWRContent(rollDOS, t);

  let dgContent =
    `<p>${game.i18n.localize(
      "pf2e-thaum-vuln.exploitVulnerability.dialog.prompt"
    )}</p><br>` +
    iwrContent +
    `<p>${
      game.i18n.localize(
        "pf2e-thaum-vuln.exploitVulnerability.dialog.paBonusLabel"
      ) + paDmg
    }</p>`;

  let dgBtns = {
    pa: {
      label: game.i18n.localize("pf2e-thaum-vuln.personalAntithesis.name"),
      callback: () => {
        createEffectOnActor(sa, t, paEffectSource, rollDOS);
      },
    },
    mw: {
      label: game.i18n.localize("pf2e-thaum-vuln.mortalWeakness.name"),
      callback: () => {
        createEffectOnActor(sa, t, mwEffectSource, rollDOS);
      },
    },
  };
  if (
    sa.items.find(
      (item) => item.getFlag("core", "sourceId") === BREACHED_DEFENSES_SOURCEID
    ) &&
    (rollDOS === 2 || rollDOS === 3)
  ) {
    let bdEffectSource = await fromUuid(BREACHED_DEFENSES_EFFECT_UUID);
    const tRes = getIWR(t).resistances;
    let gBD;
    if (tRes.length != 0) {
      gBD = game.i18n.format("pf2e-thaum-vuln.breachedDefenses.bypassLine", {
        type: BDGreatestBypassableResistance(t)?.type,
        exception: BDGreatestBypassableResistance(t)?.exceptions,
      });
    } else {
      gBD = game.i18n.localize("pf2e-thaum-vuln.dialog.none");
    }

    dgContent =
      dgContent +
      game.i18n.localize("pf2e-thaum-vuln.breachedDefenses.bypassableLabel") +
      gBD +
      "<p>";
    dgBtns = {
      ...dgBtns,
      bd: {
        label: game.i18n.localize("pf2e-thaum-vuln.breachedDefenses.name"),
        callback: () => {
          createEffectOnActor(sa, t, bdEffectSource);
        },
      },
    };
  }
  let dg = new Dialog({
    title: game.i18n.localize("pf2e-thaum-vuln.exploitVulnerability.name"),
    content: () => dgContent,
    buttons: dgBtns,
    default: "pa",
    render: () => {},
    close: () => {},
  });

  return dg;
}

//Creates the IWR content box content
export function createIWRContent(rollDOS, a) {
  let iwrContent;
  const mystifyNumbers = game.settings.get("pf2e-thaum-vuln", "mystifyNumbers");
  const iwrData = getIWR(a);
  if (rollDOS === 2) {
    let weakness =
      iwrData.weaknesses.length == 0
        ? game.i18n.localize("pf2e-thaum-vuln.dialog.none")
        : `${getGreatestIWR(iwrData.weaknesses)?.type} `;
    if (!mystifyNumbers || rollDOS === 3) {
      weakness = weakness + `- ${getGreatestIWR(iwrData.weaknesses)?.value}`;
    }
    iwrContent = `<p>Highest Weakness: ${weakness}</p>`;
  }
  if (rollDOS === 3) {
    let weakness =
      iwrData.weaknesses.length == 0
        ? game.i18n.localize("pf2e-thaum-vuln.dialog.none")
        : stitchIWR(iwrData.weaknesses, rollDOS);
    let resist =
      iwrData.resistances.length == 0
        ? game.i18n.localize("pf2e-thaum-vuln.dialog.none")
        : stitchIWR(iwrData.resistances, rollDOS);
    let immune =
      iwrData.immunities.length == 0
        ? game.i18n.localize("pf2e-thaum-vuln.dialog.none")
        : stitchIWR(iwrData.immunities, rollDOS);
    iwrContent = `<div class="grid-container"><div class="grid-item"><p>${game.i18n.localize(
      "pf2e-thaum-vuln.exploitVulnerability.dialog.weaknessLabel"
    )}<ul>${weakness}</ul></p></div><div class="grid-item"><p>${game.i18n.localize(
      "pf2e-thaum-vuln.exploitVulnerability.dialog.resistanceLabel"
    )}<ul>${resist}</ul></p></div><div class="grid-item"><p>${game.i18n.localize(
      "pf2e-thaum-vuln.exploitVulnerability.dialog.immunityLabel"
    )}<ul>${immune}</ul></p></div></div>`;
  }
  return iwrContent;
}

//stitches together the IWR information to help create the content for the dialog box
export function stitchIWR(p, rollDOS) {
  const mystifyNumbers = game.settings.get("pf2e-thaum-vuln", "mystifyNumbers");
  let s = "";
  for (const n of p) {
    if (n.value) {
      !mystifyNumbers || rollDOS === 3
        ? (s = s + `<li>${n.type} - ${n.value}</li>`)
        : (s = s + `<li>${n.type}</li>`);
      if (n.exceptions.length != 0) {
        s =
          s +
          game.i18n.localize(
            "pf2e-thaum-vuln.exploitVulnerability.dialog.except"
          );
        for (const e of n.exceptions) {
          if (e === n.exceptions[n.exceptions.length - 1]) {
            s = s + `${e}`;
          } else {
            s = s + `${e}, `;
          }
        }
        s = s + "<br>";
      }
      if (n.doubleVs == "") {
        n.doubleVs = false;
      }
      if (n.doubleVs) {
        s =
          s +
          game.i18n.localize(
            "pf2e-thaum-vuln.exploitVulnerability.dialog.doublevs"
          );
        for (const d of n.doubleVs) {
          if (d === n.doubleVs[n.doubleVs.length - 1]) {
            s = s + `${d}`;
          } else {
            s = s + `${d}, `;
          }
        }
      }
    } else {
      s = s + `<li>${n.type}</li>`;
      if (n.exceptions.length != 0) {
        s =
          s +
          game.i18n.localize(
            "pf2e-thaum-vuln.exploitVulnerability.dialog.except"
          );
        for (const e of n.exceptions) {
          if (e === n.exceptions[n.exceptions.length - 1]) {
            s = s + `${e}`;
          } else {
            s = s + `${e}, `;
          }
        }
      }
    }
  }
  return s;
}

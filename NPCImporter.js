on('ready', () => {
    on('chat:message', (msg) => {
        if (msg.type !== 'api' || !msg.content.startsWith('!importnpc ')) return;

        const logGM = (text) => sendChat("NPC Importer", `/w gm ${text}`);

        let jsonString = msg.content.replace('!importnpc ', '').trim();
        let data;
        
        try {
            data = JSON.parse(jsonString);
        } catch (e) {
            logGM("Error: Failed to parse JSON. Check your formatting.");
            return;
        }

        try {
            let cleanName = data.name.trim();
            
            let existingCharacters = findObjs({ _type: "character", name: cleanName })
                                     .filter(c => c && c.id && c.get("name") === cleanName);
            
            let character;
            let isNew = false;

            if (existingCharacters.length > 0) {
                logGM(`Step 1: Found existing sheet for "${cleanName}", preparing to update...`);
                character = existingCharacters[0];
                
                let oldAttrs = findObjs({ _type: "attribute", _characterid: character.id });
                oldAttrs.forEach(attr => {
                    let attrName = attr.get("name");
                    if (attrName.startsWith("repeating_npctrait_") || attrName.startsWith("repeating_npcaction_")) {
                        attr.remove();
                    }
                });
            } else {
                logGM(`Step 1: Creating new sheet for "${cleanName}"...`);
                character = createObj("character", { name: cleanName });
                isNew = true;
            }

            if (!character || !character.id) {
                logGM("Fatal Error: Could not create or target character object.");
                return;
            }

            let rowSequence = 0;
            const generateRowID = () => {
                let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let id = '-NPC' + String(rowSequence++).padStart(3, '0');
                for (let i = 0; i < 11; i++) {
                    id += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return id;
            };

            logGM(`Step 2: Populating sheet attributes for "${cleanName}"...`);
            const setAttr = (name, current, max = "") => {
                let attr = findObjs({ _type: "attribute", name: name, _characterid: character.id })[0];
                if (attr) {
                    attr.setWithWorker({ current: String(current), max: String(max) });
                } else {
                    createObj("attribute", { name: name, current: String(current), max: String(max), characterid: character.id });
                }
            };
            
            let finalHp = String(data.hp || "10");
            let finalHpFormula = data.hp_formula || "";
            let hpMatch = finalHp.match(/^(\d+)\s*\(([^)]+)\)/); 
            if (hpMatch) {
                finalHp = hpMatch[1];
                finalHpFormula = hpMatch[2];
            }

            let finalCr = String(data.challenge || "0");
            let finalXp = data.xp || "";
            let crMatch = finalCr.match(/^([\d/]+)\s*\(([\d,]+)\s*XP\)/i); 
            if (crMatch) {
                finalCr = crMatch[1];
                finalXp = crMatch[2].replace(/,/g, '');
            } else if (!finalXp) {
                const xpMap = { "0":"10", "1/8":"25", "1/4":"50", "1/2":"100", "1":"200", "2":"450", "3":"700", "4":"1100", "5":"1800", "6":"2300", "7":"2900", "8":"3900", "9":"5000", "10":"5900", "11":"7200", "12":"8400", "13":"10000", "14":"11500", "15":"13000", "16":"15000", "17":"18000", "18":"20000", "19":"22000", "20":"25000", "21":"33000", "22":"41000", "23":"50000", "24":"62000", "25":"75000", "26":"90000", "27":"105000", "28":"120000", "29":"135000", "30":"155000" };
                finalXp = xpMap[finalCr] || "";
            }

            let finalAc = String(data.ac || "10");
            let finalAcType = "";
            let acMatch = finalAc.match(/^(\d+)\s*\(([^)]+)\)/); 
            if (acMatch) {
                finalAc = acMatch[1];
                finalAcType = acMatch[2];
            }

            setAttr("npc", "1");
            setAttr("npc_toggle", "1");
            setAttr("npc_name", cleanName);
            
            setAttr("hp", finalHp, finalHp);
            setAttr("npc_hpformula", finalHpFormula);
            setAttr("npc_challenge", finalCr);
            setAttr("npc_xp", finalXp);
            
            setAttr("npc_ac", finalAc);
            setAttr("npc_actype", finalAcType);

            setAttr("npc_speed", data.speed || "30 ft.");
            setAttr("npc_type", data.type || "Medium humanoid");
            setAttr("npc_senses", data.senses || "");
            setAttr("npc_languages", data.languages || "");

            ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach(stat => {
                if (data[stat]) {
                    setAttr(stat + "_base", data[stat]);
                    setAttr(stat, data[stat]); 
                }
            });

            if (data.traits) {
                data.traits.forEach(trait => {
                    let row = generateRowID();
                    setAttr(`repeating_npctrait_${row}_name`, trait.name);
                    setAttr(`repeating_npctrait_${row}_description`, trait.desc); // <-- THIS IS THE FIX
                });
            }

            if (data.actions) {
                data.actions.sort((a, b) => {
                    if (a.name.toLowerCase().includes('multiattack')) return -1;
                    if (b.name.toLowerCase().includes('multiattack')) return 1;
                    return 0;
                });

                data.actions.forEach(action => {
                    let row = generateRowID();
                    setAttr(`repeating_npcaction_${row}_name`, action.name);
                    setAttr(`repeating_npcaction_${row}_description`, action.desc);
                });
            }

            if (isNew) {
                logGM(`Step 3: Complete! Successfully created and imported ${cleanName}.`);
            } else {
                logGM(`Step 3: Complete! Successfully updated existing sheet for ${cleanName}.`);
            }
            
        } catch (error) {
            logGM(`CRITICAL ERROR: Sandbox Exception. Check API console.`);
            log(`NPC Importer Error: ${error.message}\n${error.stack}`);
        }
    });
});
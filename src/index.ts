import { Telegraf } from "telegraf";
import { URL } from "url";
import { Database } from "./db";
import { htmlToText } from "html-to-text";

import * as dotenv from "dotenv";

const {BOT_TOKEN} = dotenv.config().parsed!!;

try {
    const bot = new Telegraf(BOT_TOKEN)

const roll = (n: number) => Math.round(Math.random() * 1000) % n + 1

type CharacterStats = {
    str: number // сила
    dex: number // ловкость
    con: number // телосложение
    int: number // интеллект
    wis: number // мудрость
    cha: number // харизма
}


type Skill = keyof CharacterStats

type Weapon = {
    id: string,
    name: {
        rus: string,
        eng: string,
    },
    type: {
        name: string,
        order: 0,
    },
    damage: {
        dice: string,
        type: string,
    },
    price: string,
    weight: number,
    description: string,
    count: number,
}

type Armor = {
    id: string,
    name: {
        rus: string,
        eng: string,
    },
    price: string,
    weight: number,
    description: string
    armorClass: string 
    duration: string
}

type Item = {
    id: string,
    name: {
        rus: string,
        eng: string,
    },
    price: string,
    weight: number,
    description: string,
    count: number,
}

type Spell = {
    id: string,
    name: {
        rus: string,
        eng: string,
    },
    price: string,
    weight: number,
    description: string
}

const printWeapon = (weapon: Weapon) => {
    return `<b>${weapon.name.rus}</b> [${weapon.name.eng}]

    `
}

const printItem = () => {

}

const printArmor = () => {


}

const sign = (v: number) => {
    if(v > 0) {
        return "+"+v
    } else if(v < 0) {
        return "-"+v
    }
    return v.toString()
}

const skillsDict = {
    "Атлетика": "str",
    
    "Акробатика": "dex",
    "Ловкость рук": "dex",
    "Скрытность": "dex",
    
    "Анализ": "int",
    "История": "int",
    "Магия": "int",
    "Природа": "int",
    "Религия": "int",

    "Внимательность": "wis",
    "Выживание": "wis",
    "Медицина": "wis",
    "Проницательность": "wis",
    "Уход за животными": "wis",

    "Выступление": "cha",
    "Запугивание": "cha",
    "Обман": "cha",
    "Убеждение": "cha"
}

class Character {
    printSpells() {
        return `<b>Заклинания:</b>
${this.spells.map(it => `- <a href="https://ttg.club${it.id}">${it.name.rus}</a> [<code>${it.id}</code>]`).join('\n')}
`
    }
    player: string;
    name: string;
    stats: CharacterStats;
    race: string;
    cls: string;
    bio: string;
    speed: number;
    background: string;
    race_id: string;
    cls_id: string;


    hp: number;
    hp_max: number;

    hit_dice: string;
    prof_bonus: number;
    exp: number;
    lvl: number;
    skills: string[];
    death_saves_success: number;
    death_saves_fail: number;
    saving_throws: string[];
    money: {
        gold: number;
        silver: number;
        copper: number
    };
    weapons: Weapon[];
    armor: Armor | null;
    items: Item[];
    spells: Spell[];
    pic: string;
    features: string;
    emoji: string;

    constructor(
        data: any
    ) {
        const keys = ["player", "name", "stats", "race", "cls", "speed", "prof_bonus"]
        this.player = data.player;
        this.name = data.name;
        this.stats = data.stats;
        this.race = data.race;
        this.race_id = data.race_id;
        this.bio = data.bio;
        this.background = data.background;
        this.cls = data.cls;
        this.cls_id = data.cls_id;
        this.hp = data.hp;
        this.hp_max = data.hp_max;
        this.hit_dice = data.hit_dice;
        this.speed = data.speed;
        this.prof_bonus = data.prof_bonus;
        this.exp = data.exp;
        this.lvl = data.lvl;
        this.skills = data.skills;
        this.death_saves_success = data.death_saves_success;
        this.death_saves_fail = data.death_saves_success;
        this.money = data.money;
        this.weapons = data.weapons;
        this.armor = data.armor;
        this.items = data.items;
        this.spells = data.spells;
        this.pic = data.pic;
        this.saving_throws = data.saving_throws;
        this.features = data.features;
        this.emoji = data.emoji || "";
    }

    get armor_class() {
        console.log(this.getMod("dex"))
        if(this.armor) {
            return parseInt(this.armor.armorClass.split('+')[0].trim()) + this.getMod("dex")
        }
        else if(this.cls_id.includes("/monk")) {
            return 10 + this.getMod("dex") + this.getMod("wis")
        }
        else {
            return 10 + this.getMod("dex")
        }
    }

    getMod(skill: Skill) {
        return Math.floor((this.stats[skill] - 10) / 2)
    }

    getSkillVal(skill: string) {
        if(this.skills.includes(skill)) {
            return sign(this.getMod(skillsDict[skill]) + this.prof_bonus) + " ⭐️"
        } else {
            return sign(this.getMod(skillsDict[skill]))
        }
    }


    printInfo() {
        return `<b>👤Имя:</b> ${this.name}
⭐️<b>Уровень:</b> ${this.lvl}
✨<b>Опыт:</b> ${this.exp}
👽<b>Раса:</b> <a href="https://ttg.club${this.race_id}">${this.race}</a>
🗡️<b>Класс:</b> <a href="https://ttg.club${this.cls_id}">${this.cls}</a>

❤️<b>Хиты:</b> ${this.hp}/${this.hp_max}
🎲<b>Кость хитов:</b> ${this.hit_dice}
💪<b>КД:</b> ${this.armor_class}

✍️<b>Предыстория:</b> ${this.background}
<b>Умения:</b> ${this.features || ""}

${this.bio || ""}


`
    }

    getSkillsByStat(stat: string) {
        return Object.entries(skillsDict).filter(it => it[1] == stat).map(it => it[0])
    }

    printStats() {
        return `⚜️<u>Характеристики ${this.name}</u>
📚<b>Бонус мастерства:</b> +${this.prof_bonus}

✊<u><b>Сила: ${this.stats.str} (${sign(this.getMod("str"))})</b></u>
${this.getSkillsByStat("str").map(it => `${it} ${this.getSkillVal(it)}`).join('\n')}
🤸‍♂️<u><b>Ловкость: ${this.stats.dex} (${sign(this.getMod("dex"))})</b></u>
${this.getSkillsByStat("dex").map(it => `${it} ${this.getSkillVal(it)}`).join('\n')}
💪<u><b>Телосложение: ${this.stats.con} (${sign(this.getMod("con"))})</b></u>
🧐<u><b>Интеллект: ${this.stats.int} (${sign(this.getMod("int"))})</b></u>
${this.getSkillsByStat("int").map(it => `${it} ${this.getSkillVal(it)}`).join('\n')}
✨<u><b>Мудрость: ${this.stats.wis} (${sign(this.getMod("wis"))})</b></u>
${this.getSkillsByStat("wis").map(it => `${it} ${this.getSkillVal(it)}`).join('\n')}
👄<u><b>Харизма: ${this.stats.cha} (${sign(this.getMod("cha"))})</b></u>
${this.getSkillsByStat("cha").map(it => `${it} ${this.getSkillVal(it)}`).join('\n')}

💀Спасброски: ${this.saving_throws.join(", ")}

✨Ячейки: 3
        `
    }

    calcRoll(input: string) {
        const dict = {
            "str": "str",
            "dex": "dex",
            "con": "con",
            "int": "int",
            "wis": "wis",
            "cha": "cha",
            "сил": "str",
            "лов": "dex",
            "тел": "con",
            "инт": "int",
            "муд": "wis",
            "хар": "cha",
        };

        const exp = input
            .replace(/[a-zа-я]{3}/g, (it) => {
                return this.getMod(dict[it.toLowerCase()])
            })
            .replace(/\d*d\d*/g, (it) => {
                let [count, dice] = it.split('d').map(it => parseInt(it));
                
                if(!count) count = 1;

                let sum = [];

                for(let i = 0; i < count; i++) {
                    sum.push(roll(dice).toString()) 
                }
                //sum.push(")")
                if(sum.length == 1) {
                    return sum[0]
                }
                return "(" + sum.join(" + ") + ")"
            })
            .replace(/\d*к\d*/g, (it) => {
                let [count, dice] = it.split('к').map(it => parseInt(it));
                
                if(!count) count = 1;

                let sum = 0;

                for(let i = 0; i < count; i++) {
                    sum += roll(dice)
                }

                return sum
            }).replace(/^(\d*\+\-\*)/g, "");

        
        return exp;
    }

    printInventory() {
        return `🎒<u>Инвентарь ${this.name}</u>

<b>💰Монеты:</b>
🥇 ${this.money.gold} зм
🥈 ${this.money.silver} см
🥉 ${this.money.copper} мм

<b>🗡Оружие:</b>
${this.weapons.map(it => `- <a href="https://ttg.club${it.id}">${it.name.rus}</a> [<code>${it.id}</code>]
<b>${it.damage.dice}</b> ${it.damage.type}`).join('\n')}

${this.armor ? `<b>🥋Доспех:</b>
- <a href="https://ttg.club${this.armor.id}">${this.armor.name.rus} </a> [<code>${this.armor.id}</code>]` : ""}

<b>📦Предметы:</b>
${this.items.map(it => `- <a href="https://ttg.club${it.id}">${it.name.rus}</a> [<code>${it.id}</code>]`).join('\n')}
`
    }

    export() {
        return {
            player: this.player,
            name: this.name,
            stats: this.stats,
            race: this.race,
            bio: this.bio,
            cls: this.cls,
            hp: this.hp,
            hp_max: this.hp_max,
            hit_dice: this.hit_dice,
            speed: this.speed,
            prof_bonus: this.prof_bonus,
            exp: this.exp,
            lvl: this.lvl,
            skills: this.skills,
            death_saves_success: this.death_saves_success,
            death_saves_fail: this.death_saves_fail,
            money: this.money,
            weapons: this.weapons,
            armor: this.armor,
            items: this.items,
            spells: this.spells,
        }
    }
}

const dict = {
    str: "сила",
    dex: "ловкость",
    con: "телосложение",
    int: "интеллект",
    wis: "мудрость",
    cha: "харизма",
}


bot.command('me', (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'me'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};
    const character = getCharacter(ctx.from.username);
    ctx.sendMessage(`<b>${character.emoji} ${character.name} ${ctx.message.text.slice(4)}</b>`, {parse_mode: "HTML"})
})

bot.command('do', (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'do'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};
    const character = getCharacter(ctx.from.username);
    ctx.sendMessage(`<b>${character.emoji} ${ctx.message.text.slice(4)}</b>`, {parse_mode: "HTML"})
})

bot.command('n', async (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'n'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};
    const msg = await ctx.sendMessage(`💬<tg-spoiler>[${ctx.message.from.username}]: ${ctx.message.text.slice(3)}</tg-spoiler>`, {parse_mode: "HTML"})

    setTimeout(() => {
        ctx.deleteMessage(msg.message_id)
    }, 5 * 60 * 1000)
})

const handleRoll = (n: number, ctx: any) => {
    try{ctx.deleteMessage()}catch(err){console.log({err})};
    ctx.sendMessage(`🎲 @${ctx.message.from.username} ${roll(n)}/${n}`)
}

bot.command('roll', ctx => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'roll'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const character = getCharacter(ctx.from.username);
    const expr = ctx.message.text.slice(6);
    const res = character.calcRoll(expr);
    const sum = eval(res);
    // let [c, n] = ctx.message.text.slice(6).split('d').map(it => parseInt(it));
    // if(!c) c = 1

    // let res = []

    // for(let i = 0; i < c; i++) {
    //     res.push(roll(n))
    // }
    
    ctx.sendMessage(`🎲 @${ctx.message.from.username} <code>Бросок: ${expr}. Результат: ${res} Сумма: ${sum}</code>`, {parse_mode: "HTML"})
})

class Game {
    characters: Character[] = [];
    gm: ""

    constructor(private db: Database) {
        this.characters = db.get("characters").map((it: any) => new Character(it))
        this.gm = db.get("gm")

        setInterval(() => {
            db.set("characters", this.characters)
        }, 1000)
    }

    addCharacter() {

    }
    
    addEnemy() {

    }
}

const parseCoins = (str: string): {value: number, type: "gold" | "silver" | "copper"} => {
    const [a,b] = str.split(" ")
    const value = Math.abs(Math.floor(parseFloat(a)));
    let type: "gold" | "silver" | "copper" = "gold";

    if(b.includes("зм")) {
        type = "gold"
    } else if(b.includes("см")) {
        type = "silver"
    } else if(b.includes("мм")) {
        type = "copper"
    } else {
        throw Error(`Unknown coin type: ${b}`)
    }
    return {
        value,
        type
    }
}

const game = new Game(new Database("./data.json"))

const getCharacter = (username: string | undefined): Character => {
    const res = game.characters.find(it => it.player == username)
    if(!res) throw Error("character not found")
    return res
}

const handleCheck = (skill: Skill, ctx: any) => {
    console.log({user: ctx.from.username, message: ctx.message.text});

    const character = getCharacter(ctx.from.username)
    const res = roll(20) + character.getMod(skill);

    ctx.sendMessage(`@${ctx.message.from.username} <b>Проверка навыка ${dict[skill]}: ${res}</b>`, {parse_mode: "HTML"})

}

(["str", "dex", "con", "int", "wis", "cha"] as Skill[]).forEach(it => {
    bot.command(it, ctx => handleCheck(it, ctx))
});

const genKeyboard = (player: string, cur: string) => {
    // console.log({user: ctx.from.username, message: ctx.message.text});

    console.log({cur})
    const character = getCharacter(player.replace("@", ""));
    return [
        [{id: "info", text: "Персонаж", callback_data: `info ${player}`}, {id: "stats", text: "Характеристики", callback_data: `stats ${player}`}].map(it => it.id == cur ? ({...it, callback_data: "nothing"}) : it),
        [{id: "inv", text: "Инвентарь", callback_data: `inv ${player}`}, {id: "spells", text: "Заклинания", callback_data: `spells ${player}`}].map(it => it.id == cur ? ({...it, callback_data: "nothing"}) : it),
        // cur == "inv" ? character.weapons.map(it => {
        //     return {text: it.name.rus + ` ${it.damage.dice}`, callback_data: `use ${it.id}`}
        // }) : []
    ]
};


bot.command('info', ctx => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'info'});

    // ctx.answerCbQuery();
    try{ctx.deleteMessage()}catch(err){console.log({err})};
    const arg = ctx.message.text.split(" ")[1];
    let player = ""; 

    if(arg) {
        player = arg.replace("@", "")
    } else {
        player = ctx.from.username!!
    }
    let character = getCharacter(player);
    console.log("INFO", ctx.from.username)

    ctx.sendPhoto(character.pic, {caption: character.printInfo(), parse_mode: "HTML", reply_markup: {inline_keyboard: genKeyboard(player, "info")}})
});

bot.command('inv', ctx => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'inv'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const arg = ctx.message.text.split(" ")[1];
    let player = ""; 

    if(arg) {
        player = arg.replace("@", "")
    } else {
        player = ctx.from.username!!

    }
    let character = getCharacter(player);

    ctx.sendPhoto(character.pic, {caption: character.printInventory(), parse_mode: "HTML", reply_markup: {inline_keyboard: genKeyboard(player, "inv")}})
})

bot.command('stats', ctx => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'stats'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const arg = ctx.message.text.split(" ")[1];
    let player = ""; 

    if(arg) {
        player = arg.replace("@", "")
    } else {
        player = ctx.from.username!!

    }
    let character = getCharacter(player);
    ctx.sendPhoto(character.pic, {caption: character.printStats(), parse_mode: "HTML", reply_markup: {inline_keyboard: genKeyboard(player, "stats")}})
})

bot.command('spells', ctx => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'spells'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const arg = ctx.message.text.split(" ")[1];
    let player = ""; 

    if(arg) {
        player = arg.replace("@", "")
    } else {
        player = ctx.from.username!!

    }
    let character = getCharacter(player);
    ctx.sendPhoto(character.pic, {caption: character.printSpells(), parse_mode: "HTML", reply_markup: {inline_keyboard: genKeyboard(player, "spells")}})
})

const handleUse = (player: string, id: string) => {

}

bot.command("use", ctx => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'use'});

    const id = ctx.message.text.split(" ")[1];
    const character = getCharacter(ctx.from.username?.replace("@", ""))
    const type = id.split("/")[1];

    if(type == "weapons") {
        const weapon = character.weapons.find(it => it.id == id);
        if(!weapon) {
            ctx.reply("<b>У вас нет такого оружия</b>", {parse_mode: "HTML"})
            return
        }
        ctx.reply(`<b>${character.name} атакует используя ${weapon.name.rus}</b>`, {parse_mode: "HTML"})

    }
})

bot.command("features", ctx => {
    const character = getCharacter(ctx.from.username);

    character.features = ctx.message.text.slice(10)
})

bot.on("callback_query", ctx => {
    console.log({user: ctx.from?.username, command: ctx.update.callback_query.data});

    ctx.from?.username
    // @ts-ignore
    const [cmd, player] = ctx.update.callback_query.data.split(" ");

    if(cmd == "nothing") {
        ctx.answerCbQuery();
        return;
    }
    let character = getCharacter(player);
    let message = "";


    switch(cmd) {
        case "info":
            message = character.printInfo()
            break;
        case "inv":
            message = character.printInventory()
            break;
        case "spells":
            message = character.printSpells()
            break;
        case "stats":
            message = character.printStats()
            break
        default:
            message = "Unknown command"
    }

    try {
        ctx.editMessageCaption(message, {parse_mode: "HTML", reply_markup: {inline_keyboard: genKeyboard(player, cmd)}})
        ctx.answerCbQuery()
    
    } catch (e) {
        console.log("ERROR")
    }

})

class TTG {
    async getInfo(link: string) {
        if(link.startsWith('/')) {
            link  = link.slice(1)
        }
        const urlParams = new URL(link);
        const apiURL = `${urlParams.origin}/api/v1/${urlParams.pathname}`
        const res = await fetch(apiURL, {method: "POST"}).then(r => r.json())
        console.log(urlParams.pathname)
        return {...res, id: urlParams.pathname}
    }
}


const ttg = new TTG();

bot.on("photo", (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'photo'});

    const character = getCharacter(ctx.from.username);


    if(ctx.message.caption == "/setpic") {
        character.pic = ctx.message.photo[0].file_id
        // try{try{ctx.deleteMessage()}catch(err){console.log({err})}}catch(err){console.log({err})}
    }
});

bot.command('learn', async (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'learn'});

    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const character = getCharacter(ctx.from.username);

    const spell: Item = await ttg.getInfo(ctx.message.text.split(' ')[1])

    character.spells.push(spell)

    ctx.sendMessage(`<b>${character.name} изучил заклинание ${spell.name.rus}</b>`, {parse_mode: "HTML"})
});

// console.log('bot started')

bot.command('setbio', async (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text, cmd: 'setbio'});

    const character = getCharacter(ctx.from.username);

    character.bio = ctx.message.text.slice(8)
});

// bot.command('setpic', (ctx) => {
//     console.log(ctx.message);
//     ctx.sendPhoto("AgACAgIAAx0CbW5jwAAD8GPUL344TRDFZp3xLbkDAnVe05K1AAIvyTEbuSGgSthfWusITxj-AQADAgADcwADLQQ")
// })

bot.command('buy', async (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text});

    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const character = getCharacter(ctx.from.username);
    const item: Item = await ttg.getInfo(ctx.message.text.split(" ")[1])
    const count = parseInt(ctx.message.text.split(" ")[2] || "1")
    const price = parseCoins(item.price);
    if(character.money[price.type] - price.value * count < 0) {
        // throw Error("Not enough coins")
        ctx.sendMessage(`<i>Недостаточно монет для покупки ${item.name.rus} Требуется ${item.price}</i>`, {parse_mode: "HTML"})
        return;
    }
    character.money[price.type] -= price.value * count
    const [i, type] = item.id.split('/')
    console.log({type, item});
    if(type == "items") {
        character.items.push({...item, count});
    } else if(type == "weapons") {
        character.weapons.push({...item, count})
    } else if(type == "armors") {
        // @ts-igonre
        character.armor = item;
        console.log(character.armor)
        console.log(character)
    } else {
        character.items.push({...item, count});
    }

    ctx.sendMessage(`<b>${character.name} купил ${item.name.rus} за ${item.price}</b>`, {parse_mode: "HTML"})
})
const checkGmRights = (username: string | undefined) => {
    if(game.gm !== username) {
        throw Error("no rights")
    }
}


bot.command('give', async (ctx) => {
    console.log({user: ctx.from.username, message: ctx.message.text});
    try{ctx.deleteMessage()}catch(err){console.log({err})};

    // try {
    //     checkGmRights(ctx.from.username)
    // } catch(e) {
    //     ctx.sendMessage("<code>⭕Только ГМ может выдавать вещи</code>", {parse_mode: "HTML"})
    // }

    const player = ctx.message.text.split(" ")[1];

    const itemId = ctx.message.text.split(" ")[2];

    const itemType = itemId.split('/')[1]

    const characterFrom = getCharacter(ctx.from.username);

    if(itemType == "weapons") {
        const itemIdx = characterFrom.weapons.findIndex(it => it.id === itemId);

        if(itemIdx == -1) {
            ctx.sendMessage(`<code>⭕Нет такого предмета в инвентаре</code>`, {parse_mode: "HTML"})
            return;
        }

        const item = characterFrom.weapons[itemIdx];
    
        characterFrom.weapons.splice(itemIdx, 1)
    
        const characterTo = getCharacter(player.replace("@", ""));
    
        characterTo.weapons.push(item)

        ctx.sendMessage(`<b>${characterFrom.name} передал ${item.name.rus} ${characterTo.name}</b>`, {parse_mode: "HTML"})
    
    } else if(itemType == "armors") {
        if(characterFrom.armor == null) {
            ctx.sendMessage(`<code>⭕Нет такого предмета в инвентаре</code>`, {parse_mode: "HTML"})
            return;
        }


        const characterTo = getCharacter(player.replace("@", ""));

        if(characterTo.armor !== null) {
            // @ts-ignore
            characterTo.items.push(characterFrom.armor);
        }
        characterTo.armor =  characterFrom.armor
        characterFrom.armor = null
    } else {
        const itemIdx = characterFrom.items.findIndex(it => it.id === itemId);

        if(itemIdx == -1) {
            ctx.sendMessage(`<code>⭕Нет такого предмета в инвентаре</code>`, {parse_mode: "HTML"})
            return;
        }
        const item = characterFrom.items[itemIdx];
    
        characterFrom.items.splice(itemIdx, 1)
    
        const characterTo = getCharacter(player.replace("@", ""));
    
        characterTo.items.push(item)

        ctx.sendMessage(`<b>${characterFrom.name} передал ${item.name.rus} ${characterTo.name}</b>`, {parse_mode: "HTML"})

    }
});

bot.command('pay', async (ctx) => {
    try{ctx.deleteMessage()}catch(err){console.log({err})};
    const characterFrom = getCharacter(ctx.from.username);

    const player = ctx.message.text.split(" ")[1];
    
    const i = ctx.message.text.split(" ")[2] + " " +ctx.message.text.split(" ")[3]
    
    const character = getCharacter(player.replace("@", ""));

    const {value, type} = parseCoins(i)

    characterFrom.money[type]-= value;
    character.money[type]+= value;


    ctx.sendMessage(`<b>${characterFrom.name} передал ${character.name} ${i}</b>`, {parse_mode: "HTML"})
});

bot.command('take', async (ctx) => {
    try{ctx.deleteMessage()}catch(err){console.log({err})};


    try {
        checkGmRights(ctx.from.username)        
    } catch(e) {
        ctx.sendMessage("<code>⭕Только ГМ может забирать деньги</code>", {parse_mode: "HTML"})
    }


    
    const [_, player, am, coin] = ctx.message.text.split(" ");
    const i = am + " " + coin;

    const character = getCharacter(player.replace("@", ""));

    const {value, type} = parseCoins(i)
    character.money[type]-= value;
});

bot.command('remove', async (ctx) => {
    try{ctx.deleteMessage()}catch(err){console.log({err})};

    const [_, itemId] = ctx.message.text.split(" ");
    const type = itemId.split("/")[1];


    const character = getCharacter(ctx.from.username);
    let itemName = "";

    if(type == "weapons") {
        const idx = character.weapons.findIndex(it => it.id == itemId);
        
        itemName = character.weapons.splice(idx, 1)[0].name.rus
    } else if (type == "spells") {
        const idx = character.spells.findIndex(it => it.id == itemId);
        itemName =  character.spells.splice(idx, 1)[0].name.rus
    } else if(type == "armors") {
        itemName = character.armor?.name.rus!!
        character.armor = null
    } else {
        const idx = character.items.findIndex(it => it.id == itemId);
        itemName = character.items.splice(idx, 1)[0].name.rus
    }

    ctx.sendMessage(`<b>${character.name} выкинул ${itemName}</b>`, {parse_mode: "HTML"})
});
const itemDict = {
    type: (it) => `<b>Тип:</b> ${it.name}`,
    price: (it) => `<b>Стоимость:</b> ${it}`,
    damage: (it) => `<b>Урон:</b> ${it.dice} ${it.type}`,
    weight: (it) => `<b>Вес:</b> ${it} фунт.`,
    armorClass: (it) => `<b>Класс доспеха:</b> ${it}`,
}

bot.command('about', (ctx) => {
    const id = ctx.message.text.split(' ')[1]
    ttg.getInfo("https://ttg.club" + id).then(r => {
        console.log({r})
        ctx.sendMessage(
            `<b>${r.name.rus}</b> <a href="https://ttg.club${r.id}">[${r.name.eng}]</a>

${Object.keys(itemDict).map(it => {return r[it] && itemDict[it] ? itemDict[it](r[it]) : ""}).filter(Boolean).join("\n")}

${htmlToText(r.description)}`, {parse_mode: "HTML"})
    })

})

bot.command("item", (ctx) => {
    //try{ctx.deleteMessage()}catch(err){console.log({err})}
    const character = getCharacter(ctx.from.username);

    const name = ctx.message.text.split(" ").slice(1).join(" ")

    const item: Item = {
        id: "/items/" + Math.random().toString(36).split(".")[1],
        name: {
            rus: name,
            eng: ""
        },
        count: 1,
        description: "",
        price: "0",
        weight: 1,
    };


    character.items.push(item);
    ctx.sendMessage(`<i>@${ctx.from.username} создал предмет: {name}</i>`, {parse_mode: "HTML"})
})

bot.on('message', ctx => {
    // @ts-ignore
    if(ctx.message.text == ")") {
        try{ctx.deleteMessage()}catch(err){console.log({err})};
        const character = getCharacter(ctx.from.username);
        ctx.sendMessage(`<b>${character.name} улыбается</b>`, {parse_mode: "HTML"})
    }
    // @ts-ignore
    if(ctx.message.text == '))') {
        try{ctx.deleteMessage()}catch(err){console.log({err})};
        const character = getCharacter(ctx.from.username);
        ctx.sendMessage(`<b>${character.name} смеется</b>`, {parse_mode: "HTML"})
    }
});

bot.launch()

} catch (e: any) {
    console.log("ERROR: " + e.message)
}
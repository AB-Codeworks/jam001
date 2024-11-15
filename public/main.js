let colBlack = 0x000000;
let colCyan = 0x00ffff;
let colMagenta = 0xff00ff;
let colYellow = 0xffff00;
let uiBaseColor = colYellow;
let uiHighlightColor = colCyan;

let mainSequence;
let curPosition = 0;
let curSidePosition = 0;
let hasSidePassage = false;
let inSidePassage = false;
let curSidePassage = -1;

let expM1, expN1;
let expM2, expN2;
let expM3, expN3;
let expM4, expN4;
let expScroll;
let expText;
let hpSprites;
let hpW = 39;
let hpH = 39;
let hpCols = 4;
let inCombat;
let torches;
let triText;
let triTint;

let primaryHoldFunc = null;
let primaryHoldTimer = null;
let secondaryHoldTimer = null;
let timeElapsed = 0;
let isLoaded = false;
//let isMobile = false;
//let ptrDown;

let player = 
{ 
    exp: 0,
    level: 0,
    health: 1,
    maxHealth: 5,
    attack: 1, 
    defense: 2, // This is due to be replaced by aggregate armour value if I reach that point
    triangles: 100, 
    fistPower: 1
};

let monsterTypes = 
[
    { name: 'Hungry\nRat', root : 'mon1', health: 7, maxTris: 35 },
    { name: 'Vascular\nImp', root : 'mon2', health: 10, maxTris: 50 }
];

// TODO
// - getExp function and use it
// - Multiple monsters in combat
// - Action menu implementation
// - Full side passage implementation
// - Character progression
// - Game progression
// - leaderboard (Firebase)
// - see txt file for more TODOs and notes
// - Control labels -> sprites, all text -> icons - if time permits
// > 2BJam Done - Rest is for Game Off 2024
// - Touch control implementation - mid priority
// - UI layout change - low priority
// - Optimization: don't draw walls if they are obscured (maybe) - need to work out those conditions
// - Might want to use transparent test walls while doing that ^
// - Torches on the side passages openings' side walls seen from main corridor - very low priority, in fact I'd be crazy to spend time on this

// Node structure: 
// 3x { solid: boolean, torch: boolean (added later), visited: boolean (added later, only element 0) },
// 1x { hidden_tris: number (added later)}
//}

let mainPath = 
[
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: false}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}],
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: false}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}],
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: false}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}],
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: false}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}],
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: false}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}],
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: false}, {solid: false}], 
    [{solid: true}, {solid: false}, {solid: true}], 
    [{solid: true}, {solid: true}, {solid: true}]
];

let sidePassages = 
[
    [
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: true}, {solid: true}]
    ],
    [
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: true}, {solid: true}]
    ],
    [
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: true}, {solid: true}]
    ],
    [
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: true}, {solid: true}]
    ],
    [
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: true}, {solid: true}]
    ],
    [
        [{solid: true}, {solid: false}, {solid: true}], 
        [{solid: true}, {solid: true}, {solid: true}]
    ]
];

let gameScene = new Phaser.Scene('Game');

gameScene.preload = function()
{
    let chance_torch = 0.175;

    sidePassages.forEach(function(sidePassage)
    { 
        sidePassage.forEach(function(wallGroup)
        {
            wallGroup[0].torch = wallGroup[0].solid && Math.random() < chance_torch;
            wallGroup[1].torch = wallGroup[1].solid && Math.random() < chance_torch;
            wallGroup[2].torch = wallGroup[2].solid && Math.random() < chance_torch;
            wallGroup.push({hidden_tris: Math.random() < 0.25 ? Math.ceil(Math.random() * 80) : 0});
        });
    });

    mainPath.forEach(function(wallGroup)
    {
        wallGroup[0].torch = wallGroup[0].solid && Math.random() < chance_torch;
        wallGroup[1].torch = wallGroup[1].solid && Math.random() < chance_torch;
        wallGroup[2].torch = wallGroup[2].solid && Math.random() < chance_torch;
        wallGroup.push({hidden_tris: Math.random() < 0.1 ? Math.ceil(Math.random() * 80) : 0});
    });
  
    mainSequence = mainPath;
    torches = this.add.group();
    //isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    this.allWalls = this.add.group();
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.load.bitmapFont('gaposis', 'GaposisSolidBRK.png', 'GaposisSolidBRK.xml');
    this.load.image('ceiling', 'ceil_1_a.png');
    this.load.image('ceiling_layer', 'ceil_1_b.png');
    this.load.image('floor', 'flr_1_a.png');
    this.load.image('floor_layer', 'flr_1_b.png');
    this.load.image('wall_front', 'wall_1_front_a.png');
    this.load.image('wall_f_ovl', 'wall_1_front_b.png');
    this.load.image('wall_left', 'wall_1_left_a.png');
    this.load.image('wall_l_ovl', 'wall_1_left_b.png');
    this.load.image('wall_right', 'wall_1_right_a.png');
    this.load.image('wall_r_ovl', 'wall_1_right_b.png');
    this.load.image('torch_base_front', 'torch_base_front_a.png');
    this.load.image('torch_flame_front', 'torch_flame_front_a.png');
    this.load.image('torch_base_left', 'torch_base_left_a.png');
    this.load.image('torch_flame_left', 'torch_flame_left_a.png');
    this.load.image('torch_base_right', 'torch_base_right_a.png');
    this.load.image('torch_flame_right', 'torch_flame_right_a.png');
    this.load.image('bar', 'foo bar.png');
    this.load.image('fill', '1.png');
    this.load.image('overlay', 'overlay.png');
    this.load.image('triangle_a', 'triangle_1_a.png');
    this.load.image('triangle_b', 'triangle_1_b.png');
    this.load.image('mon1_a', 'monst_1_a.png');
    this.load.image('mon1_b', 'monst_1_b.png');
    this.load.image('mon2_a', 'monst_2_a.png');
    this.load.image('mon2_b', 'monst_2_b.png');
    this.load.image('scroll', 'scroll_1.png');
    this.load.audio('tri_get', 'tri_get.mp3');
    this.load.on('complete', function() { isLoaded = true;}); 

    this.input.keyboard.on('keyup', function(event) 
    {
        if (event.key === 'ArrowUp' && !inCombat && primaryHoldTimer != null) 
        {
            if (inSidePassage)
                curSidePosition++;
            else
                curPosition++;

            this.scene.flashText(this.scene.primaryText);
            this.scene.drawDungeon();
        }
    });    

    this.input.keyboard.on('keyup', function(event) 
    {
        if (event.key === 'ArrowDown' && secondaryHoldTimer != null) 
        {
            this.scene.resetSecondary();            
            this.scene.flashText(this.scene.secondaryText);
            this.scene.punch(this.scene); // Has to be one of the funniest function calls I've ever written
        }
    });    
};

gameScene.flashText = function(text)
{
    text.setTint(uiBaseColor); // Flash to base colour since already highlighted
    setTimeout(function(text) { text.setTint(uiHighlightColor); }, 125, text);
};

gameScene.resetPrimary = function()
{
    if (primaryHoldTimer) 
    {
        this.primaryHoldTween.stop();
        this.primaryHoldTween.remove();
        this.primaryFill.setScale(0, 28);
        clearTimeout(primaryHoldTimer);
        primaryHoldTimer = null;
    }
};

gameScene.resetSecondary = function()
{
    if (secondaryHoldTimer) 
    {
        this.secondaryHoldTween.stop();
        this.secondaryHoldTween.remove();
        this.secondaryFill.setScale(0, 28);
        clearTimeout(secondaryHoldTimer);
        secondaryHoldTimer = null;
    }
};

gameScene.update = function(time, delta) 
{
    if (!isLoaded)
        return;

    if (Phaser.Input.Keyboard.JustDown(this.upKey)) 
    {
        primaryHoldTimer = setTimeout(function(context) 
        {
            context.resetPrimary();
            context.flashText(context.primaryHoldText);

            if (primaryHoldFunc)
                primaryHoldFunc(context);
        }, 1000, this);

        this.primaryHoldTween = this.tweens.add({ targets: this.primaryFill, scaleX: 148, duration: 1000 });
    }
    else if (Phaser.Input.Keyboard.JustUp(this.upKey)) 
        this.resetPrimary();
    else if (Phaser.Input.Keyboard.JustDown(this.downKey)) 
    {
        secondaryHoldTimer = setTimeout(function(context) 
        { 
            context.resetSecondary();
            context.flashText(context.secondaryHoldText);
            // TODO Summon Action Menu
            console.log('Summoning action menu');
        }, 1000, this);

        this.secondaryHoldTween = this.tweens.add({ targets: this.secondaryFill, scaleX: 148, duration: 1000 });
    }
    else if (Phaser.Input.Keyboard.JustUp(this.downKey)) 
        this.resetSecondary();

    timeElapsed += delta;

    // Approximately every third of a second, every torch has a 33.3% chance of flickering out for 0.111 seconds
    if (timeElapsed >= 333)
    {
        timeElapsed = 0;

        torches.children.each(function(torch)
        { 
            if (Math.random() < 0.333 && torch.alpha === 1)
            {
                torch.setAlpha(0);
                setTimeout(function(aTorch) { aTorch.setAlpha(1); }, 111, torch);
            }
        });
    }
};

gameScene.setPrimaryHold = function(text, func)
{
    if (!this.primaryHoldText)
        return;

    this.primaryHoldText.setText(text);
    this.primaryHoldText.setPosition(100, this.primaryFill.y + 65);
    primaryHoldFunc = func;
};

gameScene.setPrimaryText = function(text)
{
    if (!this.primaryText)
        return;

    this.primaryText.setText(text);
    this.primaryText.setPosition(100, 140);
}

gameScene.enterSidePassage = function(context)
{
    mainSequence = sidePassages[curSidePassage];
    inSidePassage = true;
    curSidePosition = 0;
    context.drawDungeon();
};

gameScene.searchBandage = function(context)
{
    let pos = inSidePassage ? curSidePosition : curPosition;
    let tris = mainSequence[pos][3].hidden_tris;

    if (tris > 0)
    {
        context.getTris(context, tris);
        mainSequence[pos][3].hidden_tris = 0;
    }

    if (player.health < player.maxHealth)
    {
        // TODO bandage sound
        player.health = player.maxHealth;
        context.updateHealth();
    }
};

gameScene.getTris = function(context, numTris)
{
    context.sound.play('tri_get');
    triText.setText(player.triangles + " + " + numTris);
    triTint.setTint(colYellow);        
    player.triangles += numTris;

    setTimeout(function() 
    { 
        triTint.setTint(uiHighlightColor); 
        triText.setText(player.triangles);
    }, 1000);

}

gameScene.punch = function(context)
{
    if (!inCombat || context.monsters.length === 0)
    {
        // TODO miss sound
        return;
    }

    // TODO punch sound
    let monster = context.monsters[Math.floor(Math.random() * context.monsters.length)];
    context.hitMonster(context, monster, player.attack + player.fistPower); 
}

gameScene.legSweep = function(context)
{
    // TODO leg sweep sound
    context.monsters.forEach(function(monster) 
    { 
        if (!monster.stun)
            context.hitMonster(context, monster, player.attack, true);
    });
}

gameScene.hitMonster = function(context, monster, damage, applyStun = false)
{
    if (!monster.awake) // Can't hit monsters until they close 75% of the distance to the player
        return;

    // TODO hit sound
    monster.health -= damage;

    if (monster.health <= 0)
    {
        // TODO death sound, death animation
        monster.ovl.destroy();
        monster.base.destroy();
        context.checkEndCombat(context);
    }
    else
    {
        monster.base.setTint(colYellow);
        setTimeout(function(monster) { monster.base.setTint(context.wallHLColor); }, 100, monster);

        if (applyStun)
        {
            monster.stun = true;
            monster.ovl.setTint(colBlack); // TODO get a better stun effect
            
            setTimeout(function(monster) 
            { 
                monster.ovl.setTint(context.wallColor); 
                monster.stun = false;
            }, 1500 + (Math.random() * 1001), monster); // Stun lasts 1.5 to 2.5 seconds
        }
    }
}

// If all monsters are dead (health <= 0), set inCombat to false, return UI state, reward exp and tris found on monster data
gameScene.checkEndCombat = function(context)
{
    context.monsters.forEach(function(monster) 
    {
        if (monster.health > 0)
            return;
    });

    inCombat = false;
    this.setPrimaryText('Advance');

    if (!inSidePassage && hasSidePassage)
        this.setPrimaryHold('Enter Side\nPassage', this.enterSidePassage);
    else
        this.setPrimaryHold('Search /\nBandage', this.searchBandage);

    let totalExp = 0;
    let totalTris = 0;
    let uniqueMonsters = [];
    let idx = -1;

    context.monsters.forEach(function(monster) 
    {
        totalExp++;
        player.exp++;
        totalTris += monster.tris;
        idx = uniqueMonsters.indexOf(monster.root);

        if (idx === -1)            
            uniqueMonsters.push({root: monster.root, count: 1});
        else
            uniqueMonsters[idx].count++;
    });

    context.monsters = [];
    context.getTris(context, totalTris);
    showExpScroll();
    setTimeout(hideExpScroll, 3300);

    if (uniqueMonsters.length >= 1)
    {
        expM1.setTexture(uniqueMonsters[0].root + '_a');
        expN1.setText(uniqueMonsters[0].count);
    }
    else
    {
        expM1.setAlpha(0);
        expN1.setAlpha(0);
    }

    if (uniqueMonsters.length >= 2)
    {
        expM2.setTexture(uniqueMonsters[1].root + '_a');
        expN2.setText(uniqueMonsters[1].count);
    }
    else
    {
        expM2.setAlpha(0);
        expN2.setAlpha(0);
    }

    if (uniqueMonsters.length >= 3)
    {
        expM3.setTexture(uniqueMonsters[2].root + '_a');
        expN3.setText(uniqueMonsters[2].count);
    }
    else
    {
        expM3.setAlpha(0);
        expN3.setAlpha(0);
    }

    if (uniqueMonsters.length >= 4)
    {
        expM4.setTexture(uniqueMonsters[3].root + '_a');
        expN4.setText(uniqueMonsters[3].count);
    }
    else
    {
        expM4.setAlpha(0);
        expN4.setAlpha(0);
    }

    expText.setText('Tris +' + totalTris + '\nExp +' + totalExp);
    // TODO check for level up
}

let hideExpScroll = function() 
{ 
    expScroll.setAlpha(0); 
    expM1.setAlpha(0);
    expN1.setAlpha(0);
    expM2.setAlpha(0);
    expN2.setAlpha(0);
    expM3.setAlpha(0);
    expN3.setAlpha(0);
    expM4.setAlpha(0);
    expN4.setAlpha(0);
    expText.setAlpha(0);    
};

let showExpScroll = function() 
{ 
    expScroll.setAlpha(1); 
    expM1.setAlpha(1);
    expN1.setAlpha(1);
    expM2.setAlpha(1);
    expN2.setAlpha(1);
    expM3.setAlpha(1);
    expN3.setAlpha(1);
    expM4.setAlpha(1);
    expN4.setAlpha(1);
    expText.setAlpha(1);    
};

gameScene.create = function()
{
    while (!isLoaded)
        continue;

    let s, t;

    s = this.add.sprite(0, 0, 'ceiling');
    s.setOrigin(0, 0);
    s.setPosition(200, 0);
    s.setTint(colMagenta);

    s = this.add.sprite(0, 0, 'ceiling_layer');
    s.setOrigin(0, 0);
    s.setPosition(200, 0);
    s.setTint(colCyan);

    s = this.add.sprite(0, 0, 'floor');
    s.setOrigin(0, 0);
    s.setPosition(200, 540);
    s.setTint(colMagenta);

    s = this.add.sprite(0, 0, 'floor_layer');
    s.setOrigin(0, 0);
    s.setPosition(200, 540);
    s.setTint(colCyan);
    
    // if (isMobile)
    //     t = this.add.bitmapText(100, 20, 'gaposis', 'L Panel\nTouch', 28, 1);
    // else
    t = this.add.bitmapText(100, 20, 'gaposis', 'Up\nArrow', 28, 1);    
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);

    t = this.add.bitmapText(100, t.y + 90, 'gaposis', 'Tap:', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);

    t = this.add.bitmapText(100, t.y + 30, 'gaposis', 'Advance', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiHighlightColor);
    this.primaryText = t;
    
    s = this.add.sprite(100, t.y + t.height + 60, 'bar');
    s.setOrigin(0.5, 0);
    s.setTint(uiBaseColor);

    s = this.add.sprite((s.x - (s.width / 2)) + 6, s.y + 6, 'fill');
    s.setOrigin(0, 0);
    s.setScale(0, 28); // 148 = full width
    s.setTint(uiBaseColor);
    this.primaryFill = s;

    t = this.add.bitmapText(100, s.y + 40, 'gaposis', 'Hold:', 24, 1); 
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);

    t = this.add.bitmapText(100, t.y + 35, 'gaposis', 'Search /\nBandage', 24, 1); 
    t.setOrigin(0.5, 0);
    t.setTint(uiHighlightColor);
    this.primaryHoldText = t;

    s = this.add.sprite(100, 910, 'triangle_a');
    s.setOrigin(0.5, 0);
    s.setTint(uiHighlightColor);
    triTint = s;

    s = this.add.sprite(100, 910, 'triangle_b');
    s.setOrigin(0.5, 0);
    s.setTint(uiHighlightColor);

    t = this.add.bitmapText(100, 1040, 'gaposis', '100', 24, 1); 
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);
    triText = t;

    // if (isMobile)
    //     t = this.add.bitmapText(1820, 20, 'gaposis', 'R Panel\nTouch', 28, 1);
    // else
    t = this.add.bitmapText(1820, 20, 'gaposis', 'Down\nArrow', 28, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);

    t = this.add.bitmapText(1820, t.y + 90, 'gaposis', 'Tap:', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);

    t = this.add.bitmapText(1820, t.y + 30, 'gaposis', 'Punch', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiHighlightColor);
    this.secondaryText = t;

    s = this.add.sprite(1820, t.y + t.height + 60, 'bar');
    s.setOrigin(0.5, 0);
    s.setTint(uiBaseColor);

    s = this.add.sprite((s.x - (s.width / 2)) + 6, s.y + 6, 'fill');
    s.setOrigin(0, 0);
    s.setScale(0, 28); // 148 = full width
    s.setTint(uiBaseColor);
    this.secondaryFill = s;
    
    t = this.add.bitmapText(1820, s.y + 40, 'gaposis', 'Hold:', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiBaseColor);

    t = this.add.bitmapText(1820, t.y + 25, 'gaposis', 'Un-Close\nHyper\nMenu', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(uiHighlightColor);
    this.secondaryHoldText = t;

    hpSprites = this.add.group();
    this.updateHealth();

    s = this.add.sprite(0, 0, 'overlay');
    s.setPosition(960, 540);
    s.setTint(colYellow);

    this.wallColor = colMagenta;
    this.wallHLColor = colCyan;
    this.drawDungeon();

    s = this.add.sprite(1530, 890, 'scroll');
    s.setOrigin(0.5, 0.5);
    s.setScale(0.72, 0.72);
    s.setTint(uiBaseColor);
    s.setAlpha(0);
    s.setDepth(1);
    expScroll = s;

    s = this.add.sprite(1420, 800, 'scroll'); // placeholder
    s.setOrigin(0.5, 0.5);
    s.setScale(0.15, 0.15);
    s.setTint(colBlack);
    s.setAlpha(0);
    s.setDepth(1);
    expM1 = s;

    t = this.add.bitmapText(1480, 800, 'gaposis', '2', 38, 1);
    t.setOrigin(0.5, 0.5);
    t.setTint(colBlack);
    t.setAlpha(0);
    t.setDepth(1);
    expN1 = t;

    s = this.add.sprite(1570, 800, 'scroll'); // placeholder
    s.setOrigin(0.5, 0.5);
    s.setScale(0.15, 0.15);
    s.setTint(colBlack);
    s.setAlpha(0);
    s.setDepth(1);
    expM2 = s;

    t = this.add.bitmapText(1630, 800, 'gaposis', '3', 38, 1);
    t.setOrigin(0.5, 0.5);
    t.setTint(colBlack);
    t.setAlpha(0);
    t.setDepth(1);
    expN2 = t;

    s = this.add.sprite(1420, 880, 'scroll'); // placeholder
    s.setOrigin(0.5, 0.5);
    s.setScale(0.15, 0.15);
    s.setTint(colBlack);
    s.setAlpha(0);
    s.setDepth(1);
    expM3 = s;

    t = this.add.bitmapText(1480, 880, 'gaposis', '2', 38, 1);
    t.setOrigin(0.5, 0.5);
    t.setTint(colBlack);
    t.setAlpha(0);
    t.setDepth(1);
    expN3 = t;

    s = this.add.sprite(1570, 880, 'scroll');  // placeholder
    s.setOrigin(0.5, 0.5);
    s.setScale(0.15, 0.15);
    s.setTint(colBlack);
    s.setAlpha(0);
    s.setDepth(1);
    expM4 = s;

    t = this.add.bitmapText(1630, 880, 'gaposis', '2', 38, 1);
    t.setOrigin(0.5, 0.5);
    t.setTint(colBlack);
    t.setAlpha(0);
    t.setDepth(1);
    expN4 = t;

    t = this.add.bitmapText(1518, 990, 'gaposis', 'Tris +63\nExp +8', 34, 1);
    t.setOrigin(0.5, 0.5);
    t.setTint(colBlack);
    t.setAlpha(0);
    t.setDepth(1);
    expText = t;
};

gameScene.updateHealth = function()
{
    hpSprites.children.each(function(sprite) { sprite.destroy(); });

    for (let i = 0; i < player.health; i++) 
    {
        let x = (i % hpCols) * (hpW + 8);
        let y = Math.floor(i / hpCols) * (hpH + 8);
        let sprite = this.add.sprite(x + 1730, 1070 - y, 'fill'); // Will need to move it up to put Exp bar under health (1070 -> 980?)
        sprite.setOrigin(0, 1); 
        sprite.setScale(hpW, hpH);
        sprite.setTint(uiHighlightColor);
        hpSprites.add(sprite);
    }    
}

// It was only used for walls when created, but is now also used for monsters and torches since they are also sprites that need to be redrawn every
// time the player moves. It's less addWall, more addSprite now. I don't feel like changing the name.
gameScene.addWall = function(xPos, yPos, type, tint, xScale, yScale)
{
    let wall = this.add.sprite(0, 0, type);
    this.allWalls.add(wall);
    wall.setOrigin(0, 0);
    wall.setScale(xScale, yScale);
    wall.setPosition(xPos, yPos);
    wall.setTint(tint);
    return wall;
};

gameScene.drawDungeon = function()
{
    this.allWalls.children.each(function(wall) { wall.destroy(); });
    col = this.wallColor;
    colHL = this.wallHLColor;
    pos = inSidePassage ? curSidePosition : curPosition;

    try
    {
        // 4 forward
        if (mainSequence[pos + 4][0].solid)
        {
            this.addWall(924, 508, 'wall_left', col, 0.08, 0.08);
            this.addWall(924, 508, 'wall_l_ovl', colHL, 0.08, 0.08);
            
            if (mainSequence[pos + 4][0].torch)
            {                
                this.addWall(932, 531, 'torch_base_left', colHL, 0.09, 0.09); 
                torches.add(this.addWall(932, 531, 'torch_flame_left', colYellow, 0.09, 0.09));
            }
        
            if (!mainSequence[pos + 3][0].solid)
            {
                this.addWall(863, 508, 'wall_front', col, 0.12, 0.12);
                this.addWall(863, 508, 'wall_f_ovl', colHL, 0.12, 0.12);
            }
        } 
        else        
        {
            this.addWall(919, 532, 'wall_front', col, 0.05, 0.05);
            this.addWall(919, 532, 'wall_f_ovl', colHL, 0.05, 0.05);
        }
    
        if (mainSequence[pos + 4][1].solid)
        {
            this.addWall(944, 532, 'wall_front', col, 0.06, 0.05);
            this.addWall(944, 532, 'wall_f_ovl', colHL, 0.06, 0.05);
            
            if (mainSequence[pos + 4][1].torch)
            {                
                this.addWall(958, 537, 'torch_base_front', colHL, 0.05, 0.05); 
                torches.add(this.addWall(958, 537, 'torch_flame_front', colYellow, 0.05, 0.05));
            }
        }
        else
            this.addWall(944, 532, 'wall_front', colBlack, 0.06, 0.05);
        
        if (mainSequence[pos + 4][2].solid)
        {
            this.addWall(974, 508, 'wall_right', col, 0.08, 0.08);
            this.addWall(974, 508, 'wall_r_ovl', colHL, 0.08, 0.08);
            
            if (mainSequence[pos + 4][2].torch)
            {                
                this.addWall(982, 531, 'torch_base_right', colHL, 0.09, 0.09); 
                torches.add(this.addWall(982, 531, 'torch_flame_right', colYellow, 0.09, 0.09));
            }
        
            if (!mainSequence[pos + 3][2].solid)
            {
                this.addWall(998, 508, 'wall_front', col, 0.12, 0.12);
                this.addWall(998, 508, 'wall_f_ovl', colHL, 0.12, 0.12);
            }
        }    
        else        
        {
            this.addWall(972, 532, 'wall_front', col, 0.05, 0.05);
            this.addWall(972, 532, 'wall_f_ovl', colHL, 0.05, 0.05);
        }
    }
    catch (e) { console.log(e); }

    try
    {        
        // 3 forward
        if (mainSequence[pos + 3][0].solid)
        {
            this.addWall(878, 484, 'wall_left', col, 0.16, 0.14);
            this.addWall(878, 484, 'wall_l_ovl', colHL, 0.16, 0.14);
            
            if (mainSequence[pos + 3][0].torch)
            {                
                this.addWall(902, 520, 'torch_base_left', colHL, 0.16, 0.16); 
                torches.add(this.addWall(902, 520, 'torch_flame_left', colYellow, 0.16, 0.16));
            }
        
            if (!mainSequence[pos + 2][0].solid)
            {
                this.addWall(750, 488, 'wall_front', col, 0.25, 0.205);
                this.addWall(750, 488, 'wall_f_ovl', colHL, 0.25, 0.205);
            }
        }
    
        if (mainSequence[pos + 3][1].solid)
        {
            this.addWall(924, 519, 'wall_front', col, 0.14, 0.09);
            this.addWall(924, 519, 'wall_f_ovl', colHL, 0.14, 0.09);
            
            if (mainSequence[pos + 3][1].torch)
            {                
                this.addWall(955, 533, 'torch_base_front', colHL, 0.1, 0.1); 
                torches.add(this.addWall(955, 533, 'torch_flame_front', colYellow, 0.1, 0.1));
            }
        }
        
        if (mainSequence[pos + 3][2].solid)
        {
            this.addWall(994, 484, 'wall_right', col, 0.16, 0.14);
            this.addWall(994, 484, 'wall_r_ovl', colHL, 0.16, 0.14);
            
            if (mainSequence[pos + 3][2].torch)
            {                
                this.addWall(1018, 520, 'torch_base_right', colHL, 0.16, 0.16); 
                torches.add(this.addWall(1018, 520, 'torch_flame_right', colYellow, 0.16, 0.16));
            }
        
            if (!mainSequence[pos + 2][2].solid)
            {
                this.addWall(1040, 488, 'wall_front', col, 0.25, 0.205);
                this.addWall(1040, 488, 'wall_f_ovl', colHL, 0.25, 0.205);
            }
        }    
    }
    catch (e) { console.log(e); }

    try
    {        
        // 2 forward
        if (mainSequence[pos + 2][0].solid)
        {
            this.addWall(784, 419, 'wall_left', col, 0.32, 0.302);
            this.addWall(784, 419, 'wall_l_ovl', colHL, 0.32, 0.302);
            
            if (mainSequence[pos + 2][0].torch)
            {                
                this.addWall(830, 508, 'torch_base_left', colHL, 0.28, 0.28); 
                torches.add(this.addWall(830, 508, 'torch_flame_left', colYellow, 0.28, 0.28));
            }
        
            if (!mainSequence[pos + 1][0].solid)
            {
                this.addWall(538, 419, 'wall_front', col, 0.48, 0.47);
                this.addWall(538, 419, 'wall_f_ovl', colHL, 0.48, 0.47);
            }
        }
    
        if (mainSequence[pos + 2][1].solid)
        {
            this.addWall(878, 484, 'wall_front', col, 0.5, 0.22);
            this.addWall(878, 484, 'wall_f_ovl', colHL, 0.5, 0.22);

            if (mainSequence[pos + 2][1].torch)
            {                
                this.addWall(945, 520, 'torch_base_front', colHL, 0.2, 0.2);
                torches.add(this.addWall(945, 520, 'torch_flame_front', colYellow, 0.2, 0.2));
            }
        }
        
        if (mainSequence[pos + 2][2].solid)
        {
            this.addWall(1040, 419, 'wall_right', col, 0.32, 0.302);
            this.addWall(1040, 419, 'wall_r_ovl', colHL, 0.32, 0.302);
            
            if (mainSequence[pos + 2][2].torch)
            {                
                this.addWall(1084, 508, 'torch_base_right', colHL, 0.28, 0.28); 
                torches.add(this.addWall(1084, 508, 'torch_flame_right', colYellow, 0.28, 0.28));
            }
        
            if (!mainSequence[pos + 1][2].solid)
            {
                this.addWall(1134, 419, 'wall_front', col, 0.48, 0.47);
                this.addWall(1134, 419, 'wall_f_ovl', colHL, 0.48, 0.47);
            }
        }    
    }
    catch (e) { console.log(e); }

    try
    {        
        // 1 forward
        if (mainSequence[pos + 1][0].solid)
        {
            this.addWall(596, 284, 'wall_left', col, 0.64, 0.64);
            this.addWall(596, 284, 'wall_l_ovl', colHL, 0.64, 0.64);
            
            if (mainSequence[pos + 1][0].torch)
            {                
                this.addWall(690, 468, 'torch_base_left', colHL, 0.5, 0.5); 
                torches.add(this.addWall(690, 468, 'torch_flame_left', colYellow, 0.5, 0.5));
            }
        
            if (!mainSequence[pos][0].solid)
            {
                this.addWall(200, 285, 'wall_front', col, 0.78, 0.994);
                this.addWall(200, 285, 'wall_f_ovl', colHL, 0.78, 0.994);
            }
        }
    
        if (mainSequence[pos + 1][1].solid)
        {
            this.addWall(784, 419, 'wall_front', col, 0.69, 0.47);
            this.addWall(784, 419, 'wall_f_ovl', colHL, 0.69, 0.47);

            if (mainSequence[pos + 1][1].torch)
            {                
                this.addWall(930, 488, 'torch_base_front', colHL, 0.4, 0.4);
                torches.add(this.addWall(930, 488, 'torch_flame_front', colYellow, 0.4, 0.4));
            }
        }
    
        if (mainSequence[pos + 1][2].solid)
        {
            this.addWall(1134, 284, 'wall_right', col, 0.64, 0.64);
            this.addWall(1134, 284, 'wall_r_ovl', colHL, 0.64, 0.64);
            
            if (mainSequence[pos + 1][2].torch)
            {                
                this.addWall(1200, 468, 'torch_base_right', colHL, 0.5, 0.5); 
                torches.add(this.addWall(1200, 468, 'torch_flame_right', colYellow, 0.5, 0.5));
            }
        
            if (!mainSequence[pos][2].solid)
            {
                this.addWall(1322, 285, 'wall_front', col, 0.78, 0.994);
                this.addWall(1322, 285, 'wall_f_ovl', colHL, 0.78, 0.994);
            }
        }
    }
    catch (e) { console.log(e); }

    try
    {       
        hasSidePassage = false; 
        
        // Foremost
        if (mainSequence[pos][0].solid)
        {
            this.addWall(202, 0, 'wall_left', col, 1.35, 1.35);
            this.addWall(202, 0, 'wall_l_ovl', colHL, 1.35, 1.35);
            
            if (mainSequence[pos][0].torch)
            {                
                this.addWall(400, 400, 'torch_base_left', colHL, 1, 1); 
                torches.add(this.addWall(400, 400, 'torch_flame_left', colYellow, 1, 1));
            }
        }
        else
            hasSidePassage = true;

        if (mainSequence[pos][1].solid)
        {
            this.addWall(596, 286, 'wall_front', col, 1.42, 0.994);
            this.addWall(596, 286, 'wall_f_ovl', colHL, 1.42, 0.994);

            if (mainSequence[pos][1].torch)
            {                
                this.addWall(917, 450, 'torch_base_front', colHL, 0.7, 0.7);
                torches.add(this.addWall(917, 450, 'torch_flame_front', colYellow, 0.7, 0.7));
            }
        }

        if (mainSequence[pos][2].solid)
        {
            this.addWall(1320, 0, 'wall_right', col, 1.35, 1.35);    
            this.addWall(1320, 0, 'wall_r_ovl', colHL, 1.35, 1.35);    
            
            if (mainSequence[pos][2].torch)
            {                
                this.addWall(1520, 400, 'torch_base_right', colHL, 1, 1); 
                torches.add(this.addWall(1520, 400, 'torch_flame_right', colYellow, 1, 1));
            }
        }
        else
            hasSidePassage = true;

        if (hasSidePassage)
        {
            curSidePassage++;
            this.setPrimaryHold('Enter Side\nPassage', this.enterSidePassage);
        }
        else
            this.setPrimaryHold('Search /\nBandage', this.searchBandage);

        if (!mainSequence[pos][0].visited)
        {
            player.exp++;
            mainSequence[pos][0].visited = true;

            if ((pos > 0 || inSidePassage) && Math.random() < 0.4) // No monsters allowed on the spawn location; otherwise, 40% chance of monsters
            {
                // TODO random # of monsters
                // TODO random directions of approach
                // TODO display monster info in the right pane - vertical list of names overlaid on bars indicating current health
                let idx = Math.floor(Math.random() * monsterTypes.length);
                let str = monsterTypes[idx].root;
                let m = this.addWall(965, 550, str + '_a', colHL, 0.02, 0.02);
                let m2 = this.addWall(965, 550, str + '_b', col, 0.02, 0.02);
                this.monsters = [];
                
                this.monsters.push(
                { 
                    awake: false,
                    root: str,
                    base: m, 
                    ovl: m2, 
                    health: monsterTypes[idx].health, 
                    stun: false, 
                    tris: Math.floor(Math.random() * monsterTypes[idx].maxTris)
                });
                
                this.tweens.add({ targets: m, scaleX: 0.8, scaleY: 0.8, xPos: 935, yPos: 520, duration: 4000 });
                this.tweens.add({ targets: m2, scaleX: 0.8, scaleY: 0.8, xPos: 935, yPos: 520, duration: 4000 });
                setTimeout(function(context) { context.monsters[0].awake = true; }, 3000, this); // Can be hit 1 second before reaching player
                inCombat = true;
                this.setPrimaryText('N/A');
                this.setPrimaryHold('Leg\nSweep', this.legSweep);
                // TODO monster attacks on player - if damage taken, whole screen flashes yellow
            }    
        }    
    }
    catch (e) 
    { 
        console.log(e);

        if (inSidePassage)
        {
            // When going back to the main path, player is still at the location that can enter this side passage. Decrementing curSidePassage 
            // ensures that this is the side passage entered if the player uses that command again before moving.
            curSidePassage--;                               
            inSidePassage = false;
            mainSequence = mainPath;
        }
        else
            curPosition--; // Cancel forward move

        this.drawDungeon();
        this.resetPrimary();
    }
};

let config = 
{
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scene: gameScene
};

let game = new Phaser.Game(config);
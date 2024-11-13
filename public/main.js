let gameScene = new Phaser.Scene('Game');
let colBlack = 0x000000;
let colCyan = 0x00ffff;
let colMagenta = 0xff00ff;
let colYellow = 0xffff00;
let curPosition = 0;
let primaryHoldTimer = null;
let secondaryHoldTimer = null;

let mainSequence = 
[
    [true, false, true], 
    [true, false, true], 
    [false, false, true],
    [true, false, true], 
    [true, false, true],
    
    [true, false, true], 
    [true, false, true], 
    [true, false, false],
    [true, false, true], 
    [true, false, true],

    [true, false, true], 
    [true, false, true], 
    [false, false, true], 
    [true, false, true], 
    [true, false, true],
    
    [true, false, true], 
    [true, false, true], 
    [true, false, false],
    [true, false, true], 
    [true, false, true],
    
    [true, false, true], 
    [true, false, true], 
    [false, false, true],
    [true, false, true], 
    [true, false, true],
    
    [true, false, true], 
    [true, false, true], 
    [true, false, false],
    [true, false, true], 
    [true, true, true],    
];

let sidePassages = 
[
    [
        [true, false, true],
        [true, false, true],
        [true, true, true]
    ],
    [
        [true, false, true],
        [true, true, true]
    ]
];

gameScene.preload = function()
{
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.load.bitmapFont('gaposis', 'GaposisSolidBRK.png', 'GaposisSolidBRK.xml');
    this.load.image('ceiling', 'ceil_a.jpg');
    this.load.image('ceiling_layer', 'ceil_b.png');
    this.load.image('floor', 'flr_a.jpg');
    this.load.image('floor_layer', 'flr_b.png');
    this.load.image('wall_front', 'wall_a_front.png');
    this.load.image('wall_left', 'wall_a_left.png');
    this.load.image('wall_right', 'wall_a_right.png');
    this.load.image('bar', 'foo bar.png');
    this.load.image('fill', '1x1.png');
    
    this.input.keyboard.on
    ('keyup', function(event) {
        if (event.key === 'ArrowUp' && primaryHoldTimer != null) 
        {
            curPosition++;
            this.scene.flashText(this.scene.primaryText);
            this.scene.drawDungeon();
        }
    });
    
    this.input.keyboard.on
    ('keyup', function(event) {
        if (event.key === 'ArrowDown' && secondaryHoldTimer != null) 
        {
            this.scene.resetSecondary();            
            this.scene.flashText(this.scene.secondaryText);
            // TODO attack or w/e the action is
        }
    });
    
    // TODO touch solution

    this.allWalls = this.add.group();
};

gameScene.flashText = function(text)
{
    text.setTint(colYellow);
    setTimeout(function(text) { text.setTint(colCyan); }, 125, text);
}

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
}

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
}

gameScene.update = function() 
{
    if (Phaser.Input.Keyboard.JustDown(this.upKey)) 
    {
        primaryHoldTimer = setTimeout(function(context) {
            context.resetPrimary();
            // TODO Execute Special Command
        }, 1000, this);

        this.primaryHoldTween = this.tweens.add({ targets: this.primaryFill, scaleX: 148, duration: 1000 });
    }
    else if (Phaser.Input.Keyboard.JustUp(this.upKey)) 
        this.resetPrimary();
    else if (Phaser.Input.Keyboard.JustDown(this.downKey)) 
    {
        secondaryHoldTimer = setTimeout(function(context) { 
            context.resetSecondary();
            // TODO Summon Action Menu
        }, 1000, this);

        this.secondaryHoldTween = this.tweens.add({ targets: this.secondaryFill, scaleX: 148, duration: 1000 });
    }
    else if (Phaser.Input.Keyboard.JustUp(this.downKey)) 
        this.resetSecondary();
};

gameScene.create = function()
{
    let ceil = this.add.sprite(0, 0, 'ceiling');
    ceil.setOrigin(0, 0);
    ceil.setPosition(200, 0);
    ceil.setTint(colYellow);
    let ceil_lyr = this.add.sprite(0, 0, 'ceiling_layer');
    ceil_lyr.setOrigin(0, 0);
    ceil_lyr.setPosition(200, 0);
    ceil_lyr.setTint(colMagenta);
    let flr = this.add.sprite(0, 0, 'floor');
    flr.setOrigin(0, 0);
    flr.setPosition(200, 540);
    flr.setTint(colCyan);
    let flr_lyr = this.add.sprite(0, 0, 'floor_layer');
    flr_lyr.setOrigin(0, 0);
    flr_lyr.setPosition(200, 540);
    flr_lyr.setTint(colMagenta);
    this.drawDungeon();
    
    let t2 = this.add.bitmapText(100, 20, 'gaposis', 'Primary:\nUp\nArrow\n\n\nTap:', 24, 1);
    t2.setOrigin(0.5, 0);
    t2.setTint(colCyan);

    let t = this.add.bitmapText(100, 20 + t2.height, 'gaposis', 'Advance', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(colCyan);
    this.primaryText = t;

    let s = this.add.sprite(100, 120 + t2.height, 'bar');
    s.setOrigin(0.5, 0);
    s.setTint(colCyan);

    s = this.add.sprite(26, 102 + t.height + t2.height, 'fill');
    s.setOrigin(0, 0);
    s.setScale(0, 28); // 148 = full width
    s.setTint(colCyan);
    this.primaryFill = s;

    t = this.add.bitmapText(100, 150 + t.height + t2.height, 'gaposis', 'Hold:\nView Map', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(colCyan);
    this.primaryHoldText = t;

    t2 = this.add.bitmapText(1820, 20, 'gaposis', 'Secondary:\nDown\nArrow\n\n\nTap:', 24, 1);
    t2.setOrigin(0.5, 0);
    t2.setTint(colCyan);

    t = this.add.bitmapText(1820, 20 + t2.height, 'gaposis', 'Attack', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(colCyan);
    this.secondaryText = t;

    s = this.add.sprite(1820, 120 + t2.height, 'bar');
    s.setOrigin(0.5, 0);
    s.setTint(colCyan);

    s = this.add.sprite(1746, 102 + t.height + t2.height, 'fill');
    s.setOrigin(0, 0);
    s.setScale(0, 28); // 148 = full width
    s.setTint(colCyan);
    this.secondaryFill = s;
    
    t = this.add.bitmapText(1820, 150 + t.height + t2.height, 'gaposis', 'Hold:\nAction\nMenu', 24, 1);
    t.setOrigin(0.5, 0);
    t.setTint(colCyan);
};

gameScene.addWall = function(xPos, yPos, type, tint, xScale, yScale)
{
    let wall = this.add.sprite(0, 0, type);
    this.allWalls.add(wall);
    wall.setOrigin(0, 0);
    wall.setScale(xScale, yScale);
    wall.setPosition(xPos, yPos);
    wall.setTint(tint);
};

gameScene.drawDungeon = function()
{
    this.allWalls.children.each(function(wall) { wall.destroy(); });

    // TODO optimization (maybe) don't draw them if they are obscured - need to work out those conditions
    // TODO update text if there's a side passage

    try
    {
        // 4 forward in mainSequence
        if (mainSequence[curPosition + 4][0])
        {
            this.addWall(924, 508, 'wall_left', colMagenta, 0.08, 0.08);
    
            if (!mainSequence[curPosition + 3][0])
                this.addWall(863, 508, 'wall_front', colMagenta, 0.12, 0.12);
        } 
        else        
            this.addWall(919, 532, 'wall_front', colMagenta, 0.05, 0.05);
    
        if (mainSequence[curPosition + 4][1])
            this.addWall(944, 532, 'wall_front', colMagenta, 0.06, 0.05);
        else
            this.addWall(944, 532, 'wall_front', colBlack, 0.06, 0.05);
        
        if (mainSequence[curPosition + 4][2])
        {
            this.addWall(974, 508, 'wall_right', colMagenta, 0.08, 0.08);
    
            if (!mainSequence[curPosition + 3][2])
                this.addWall(998, 508, 'wall_front', colMagenta, 0.12, 0.12);
        }    
        else        
            this.addWall(972, 532, 'wall_front', colMagenta, 0.05, 0.05);
    }
    catch (e) { console.log(e); }

    try
    {        
        // 3 forward in mainSequence
        if (mainSequence[curPosition + 3][0])
        {
            this.addWall(878, 476, 'wall_left', colMagenta, 0.16, 0.16);
    
            if (!mainSequence[curPosition + 2][0])
                this.addWall(750, 476, 'wall_front', colMagenta, 0.25, 0.25);
        }
    
        if (mainSequence[curPosition + 3][1])
            this.addWall(924, 512, 'wall_front', colMagenta, 0.14, 0.11);
        
        if (mainSequence[curPosition + 3][2])
        {
            this.addWall(994, 476, 'wall_right', colMagenta, 0.16, 0.16);
    
            if (!mainSequence[curPosition + 2][2])
                this.addWall(1040, 476, 'wall_front', colMagenta, 0.25, 0.25);
        }    
    }
    catch (e) { console.log(e); }

    try
    {        
        // 2 forward in mainSequence
        if (mainSequence[curPosition + 2][0])
        {
            this.addWall(784, 410, 'wall_left', colMagenta, 0.32, 0.32);
    
            if (!mainSequence[curPosition + 1][0])
                this.addWall(538, 410, 'wall_front', colMagenta, 0.48, 0.48);
        }
    
        if (mainSequence[curPosition + 2][1])
            this.addWall(878, 476, 'wall_front', colMagenta, 0.5, 0.24);
        
        if (mainSequence[curPosition + 2][2])
        {
            this.addWall(1040, 410, 'wall_right', colMagenta, 0.32, 0.32);
    
            if (!mainSequence[curPosition + 1][2])
                this.addWall(1134, 410, 'wall_front', colMagenta, 0.48, 0.48);
        }    
    }
    catch (e) { console.log(e); }

    try
    {        
        // 1 forward in mainSequence
        if (mainSequence[curPosition + 1][0])
        {
            this.addWall(596, 280, 'wall_left', colMagenta, 0.64, 0.64);
    
            if (!mainSequence[curPosition][0])
                this.addWall(200, 280, 'wall_front', colMagenta, 0.78, 1);
        }
    
        if (mainSequence[curPosition + 1][1])
            this.addWall(784, 410, 'wall_front', colMagenta, 0.69, 0.48);
    
        if (mainSequence[curPosition + 1][2])
        {
            this.addWall(1134, 280, 'wall_right', colMagenta, 0.64, 0.64);
    
            if (!mainSequence[curPosition][2])
                this.addWall(1322, 280, 'wall_front', colMagenta, 0.78, 1);
        }
    }
    catch (e) { console.log(e); }

    try
    {        
        // Foremost
        if (mainSequence[curPosition][0])
            this.addWall(200, 0, 'wall_left', colMagenta, 1.35, 1.35);
    
        if (mainSequence[curPosition][1])
            this.addWall(596, 280, 'wall_front', colMagenta, 1.42, 1);
    
        if (mainSequence[curPosition][2])
            this.addWall(1322, 0, 'wall_right', colMagenta, 1.35, 1.35);    
    }
    catch (e) 
    { 
        console.log(e); 
        curPosition--;
        this.drawDungeon();
        this.resetPrimary();
        alert('End of dungeon!');
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
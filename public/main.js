let gameScene = new Phaser.Scene('Game');
let colBlack = 0x000000;
let colCyan = 0x00ffff;
let colMagenta = 0xff00ff;
let colYellow = 0xffff00;
let curPosition = 0;

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

gameScene.preload = function()
{
    this.load.image('ceiling', 'ceil_a.jpg');
    this.load.image('ceiling_layer', 'ceil_b.png');
    this.load.image('floor', 'flr_a.jpg');
    this.load.image('floor_layer', 'flr_b.png');
    this.load.image('wall_front', 'wall_a_front.png');
    this.load.image('wall_left', 'wall_a_left.png');
    this.load.image('wall_right', 'wall_a_right.png');

    this.input.keyboard.on
    ('keydown', function (event) {
        if (event.key === 'ArrowUp')
        {
            curPosition++;
            this.scene.drawDungeon();
        }
    });

    this.allWalls = this.add.group();
}

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
}

//gameScene.update = function()
//{
    //if (this.input.keyboard.checkDown(this.input.keyboard.addKey('LEFT'), 250))
//}

gameScene.drawDungeon = function()
{
    this.allWalls.children.each(function(wall) { wall.destroy(); });
    let wall, wallScale;

    // TODO don't draw them if they are obscured
    // TODO method to reduce redundancy

    // 4 forward in mainSequence
    if (mainSequence[curPosition + 4][0])
    {
        wall = this.add.sprite(0, 0, 'wall_left');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.08);
        wall.setPosition(924, 508);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition + 3][0])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.12);
            wall.setPosition(863, 508);
            wall.setTint(colMagenta);
        }
    } 
    else        
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.05);
        wall.setPosition(919, 532);
        wall.setTint(colMagenta);
    }

    if (mainSequence[curPosition + 4][1])
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.06, 0.05);
        wall.setPosition(944, 532);
        wall.setTint(colMagenta);
    }
    else
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.06, 0.05);
        wall.setPosition(944, 532);
        wall.setTint(colBlack);
    }
    
    if (mainSequence[curPosition + 4][2])
    {
        wall = this.add.sprite(0, 0, 'wall_right');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.08);
        wall.setPosition(974, 508);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition + 3][2])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.12);
            wall.setPosition(998, 508);
            wall.setTint(colMagenta);
        }
    }    
    else        
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.05);
        wall.setPosition(972, 532);
        wall.setTint(colMagenta);
    }    

    // 3 forward in mainSequence
    if (mainSequence[curPosition + 3][0])
    {
        wall = this.add.sprite(0, 0, 'wall_left');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.16);
        wall.setPosition(878, 476);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition + 2][0])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.25);
            wall.setPosition(750, 476);
            wall.setTint(colMagenta);
        }
    }

    if (mainSequence[curPosition + 3][1])
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.14, 0.11);
        wall.setPosition(924, 512);
        wall.setTint(colMagenta);
    }
    
    if (mainSequence[curPosition + 3][2])
    {
        wall = this.add.sprite(0, 0, 'wall_right');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.16);
        wall.setPosition(994, 476);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition + 2][2])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.25);
            wall.setPosition(1040, 476);
            wall.setTint(colMagenta);
        }
    }    
    
    // 2 forward in mainSequence
    if (mainSequence[curPosition + 2][0])
    {
        wall = this.add.sprite(0, 0, 'wall_left');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.32);
        wall.setPosition(784, 410);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition + 1][0])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.48);
            wall.setPosition(538, 410);
            wall.setTint(colMagenta);
        }
    }

    if (mainSequence[curPosition + 2][1])
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.5, 0.24);
        wall.setPosition(878, 476);
        wall.setTint(colMagenta);
    }
    
    if (mainSequence[curPosition + 2][2])
    {
        wall = this.add.sprite(0, 0, 'wall_right');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.32);
        wall.setPosition(1040, 410);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition + 1][2])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.48);
            wall.setPosition(1134, 410);
            wall.setTint(colMagenta);
        }
    }    
        
    // 1 forward in mainSequence
    if (mainSequence[curPosition + 1][0])
    {
        wall = this.add.sprite(0, 0, 'wall_left');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.64);
        wall.setPosition(596, 280);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition][0])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.78, 1);
            wall.setPosition(200, 280);
            wall.setTint(colMagenta);
        }
    }

    if (mainSequence[curPosition + 1][1])
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.69, 0.48);
        wall.setPosition(784, 410);
        wall.setTint(colMagenta);
    }

    if (mainSequence[curPosition + 1][2])
    {
        wall = this.add.sprite(0, 0, 'wall_right');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(0.64);
        wall.setPosition(1134, 280);
        wall.setTint(colMagenta);

        if (!mainSequence[curPosition][2])
        {
            wall = this.add.sprite(0, 0, 'wall_front');
            this.allWalls.add(wall);
            wall.setOrigin(0, 0);
            wall.setScale(0.78, 1);
            wall.setPosition(1322, 280);
            wall.setTint(colMagenta);
        }        
    }

    // Foremost
    if (mainSequence[curPosition][0])
    {
        wall = this.add.sprite(0, 0, 'wall_left');
        this.allWalls.add(wall);
        wallScale = 1080 / wall.height;
        wall.setOrigin(0, 0);
        wall.setPosition(200, 0);
        wall.setScale(wallScale);
        wall.setTint(colMagenta);
    }        

    if (mainSequence[curPosition][1])
    {
        wall = this.add.sprite(0, 0, 'wall_front');
        this.allWalls.add(wall);
        wall.setOrigin(0, 0);
        wall.setScale(1.42, 1);
        wall.setPosition(596, 280);
        wall.setTint(colMagenta);
    }

    if (mainSequence[curPosition][2])
    {
        wall = this.add.sprite(0, 0, 'wall_right');
        this.allWalls.add(wall);
        wallScale = 1080 / wall.height;
        wall.setOrigin(0, 0);
        wall.setScale(wallScale);
        wall.setPosition(1720 - (wall.width * wallScale), 0);
        wall.setTint(colMagenta);
    }    
}

let config = 
{
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scene: gameScene
};

let game = new Phaser.Game(config);
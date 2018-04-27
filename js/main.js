window.onload = function()
{
    const game = new Phaser.Game(600,450,Phaser.AUTO,"containerGame", { preload: preload, create: create, update: update});
 
    const shiftXPos = 50;
    const shiftYPos = 25;
    const arrOfSeed = [];
    const placesInRow = 3;
    const typesOfPlants = 4;
    let startRowPosX = 450;
    let startRowPosY = 250;
    let score = 0;
    let text;
    let rowGroup;
    let coinGroup;
    let coinSound;
    const arrValueCoin = [];

    class GoldCoin {
        constructor(timeforleave, takeofftime){
            this.refCoin;
            this.xCoinPos;
            this.yCoinPos;
            this.timeForLeave = timeforleave || 600;
            this.takeOffTime = takeofftime || 1000;
        }
    }

    class StartCord 
    {
        constructor(xpos, ypos){
            this.Xpos = xpos,
            this.Ypos = ypos
        }
    }
    
    class SeedType {
        constructor(id,image, ripeimage, ripetime, seedtype, startcord, value)
        {
            this.id = id;
            this.isRipe = false;
            this.image = image;
            this.ripeImage = ripeimage; 
            this.renderSeed;
            this.renderRipeSeed;                     
            this.ripeTime = ripetime;
            this.seedType = seedtype; 
            this.cord = startcord;
            this.value = value;
        }
    }

    function preload () {        
        for(let i = 1; i <= typesOfPlants; i++){
            for(let j = 0; j < placesInRow; j++){
                arrOfSeed.push(new SeedType('' + i + (j+1),"seed"+i+"_1", "seed"+i+"_2", Math.pow(2,i) * 1000, i, new StartCord(startRowPosX,startRowPosY), Number('1e' + (i-1))));
            }
            startRowPosX-=shiftXPos; startRowPosY+=shiftYPos;
        }

        this.load.audio("coin_sound", "assets/sounds/coin_sound.wav");
        this.load.image("background", "assets/images/Background.png");
        this.load.image("farmer", "assets/images/gardener.png");
        //this.load.image("farmer2", "assets/images/farmman.png");
        this.load.image("coin", "assets/images/Coin.png");
        this.load.image("seed1_1", "assets/images/Seed01_01.png");
        this.load.image("seed1_2", "assets/images/Seed01_02.png");
        this.load.image("seed2_1", "assets/images/Seed02_01.png");
        this.load.image("seed2_2", "assets/images/Seed02_02.png");
        this.load.image("seed3_1", "assets/images/Seed03_01.png");
        this.load.image("seed3_2", "assets/images/Seed03_02.png");
        this.load.image("seed4_1", "assets/images/Seed04_01.png");
        this.load.image("seed4_2", "assets/images/Seed04_02.png");
    }

    function create() {
        this.add.tileSprite(0, 0, game.world.width, game.world.height, "background");
        var farmer = game.add.sprite(startRowPosX - 150, 200, "farmer");
        farmer.scale.setTo(0.2,0.2);
        
        coinSound = game.add.audio('coin_sound');
        //------------------groups----------------
        //rowGroup = game.add.group();
        coinGroup = game.add.group();
        //------------------scoretext-------------
        text = game.add.text(20, 20, 'Score: ' + score, {
            font: "23px Finger Paint", 
            fill: "white"        
        });
        text.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 0);
        game.physics.arcade.enable(text);
        //-----------------------------------------
        let i = 0;
        let tmp = 1;
        arrOfSeed.forEach(function(item) {
            if(tmp != item.seedType){
                tmp = item.seedType;
                i = 0;
            }
            item.cord.Xpos += (shiftXPos * i); item.cord.Ypos += (shiftYPos * i);
            item.renderSeed = game.add.image(item.cord.Xpos, item.cord.Ypos, item.image);
            //rowGroup.add(item.renderSeed);
            item.renderSeed.anchor.x = 1;
            item.renderSeed.anchor.y = 1;
            item.renderSeed.scale.setTo(0.7,0.7);
            i++;            
            timerForRipe(item);
        });       
    }

    function update(){
        game.physics.arcade.overlap(text, coinGroup, collisionHandler, null, this);
    }

    function collisionHandler(text, coin){
        coin.destroy();
        coinSound.play();
        renderScore(arrValueCoin.shift().value);
    }

    function harvest(item){
        //console.log('harvest begin - ' + item.value);        
        item.renderSeed = game.add.sprite(item.renderRipeSeed.x, item.renderRipeSeed.y, item.image);
        item.renderSeed.anchor.setTo(1, 1);            
        item.renderSeed.scale.setTo(0.7,0.7);     
        item.renderRipeSeed.kill();
        //-----------------declare new coin--------------
        let coin = new GoldCoin();
        
        coin.xCoinPos = item.renderSeed.x - item.renderSeed.width/2;
        coin.yCoinPos = item.renderSeed.y - item.renderSeed.height/2;
        coin.refCoin = game.add.sprite(coin.xCoinPos, coin.yCoinPos - 30, 'coin');
        coin.refCoin.anchor.x = 0.5;
        coin.refCoin.anchor.y = 0.5;
        coin.refCoin.scale.setTo(0.5, 0.5);
        game.physics.arcade.enable(coin.refCoin);
        coinGroup.add(coin.refCoin);
        //------------------------------------------------
        arrValueCoin.push(item);
        renderZIndex();
        goldCoinMove(coin);
        timerForRipe(item);
        //console.log('harvest end- ' + item.value);
    }

    function timerForRipe(item){
        setTimeout(changeSeedToRipe, item.ripeTime, item);
    }

    function changeSeedToRipe (item) {
        item.renderRipeSeed = game.add.sprite(item.renderSeed.x, item.renderSeed.y, item.ripeImage); 
        item.renderRipeSeed.anchor.setTo(1, 1);
        item.renderRipeSeed.scale.setTo(0.7,0.7);            
        item.renderSeed.kill();

        item.isRipe = true;
        renderZIndex();
        item.renderRipeSeed.inputEnabled = true;
        item.renderRipeSeed.input.pixelPerfectOver = true;
        item.renderRipeSeed.input.useHandCursor = true;
        item.renderRipeSeed.events.onInputDown.add(function(){harvest(item)}, this);
        //console.log('changeSeedToRip - ' + item.value);
    }

    function renderZIndex(){
        arrOfSeed.forEach(function(item){
            if(item.renderRipeSeed){                
                game.world.bringToTop(item.renderRipeSeed);
            }
            if(item.renderSeed)
               game.world.bringToTop(item.renderSeed);                    
        })
        game.world.bringToTop(coinGroup);
    }
    
    function renderScore(){
        score += arguments[0];
        text.setText("Score: " + score);
        //console.log('renderScore - ' + arguments[0]);
    }

    function goldCoinMove(coin) {     
        game.physics.arcade.moveToXY(coin.refCoin, coin.xCoinPos, coin.yCoinPos - 70, 0, coin.takeOffTime);        
        setTimeout(function() {
            game.physics.arcade.moveToXY(coin.refCoin, text.x + text.width, text.y + text.height, 0, coin.timeForLeave);
        }, coin.takeOffTime);        
    }
}
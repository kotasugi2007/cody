//this game will have only 1 state
var GameState = {
  //initiate game settings
  init: function() {
    //adapt to screen size, fit all the game
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 1000;

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.world.setBounds(0,0,7680 ,768);

    this.RUNNING_SPEED = 400;
    this.JUMPING_SPEED = 600;
        
    /*
    this.life = 3;
    life=this.life;
    */

  },
  //load the game assets before the game starts
  preload: function() {
    this.load.image('background', 'images/layer-1.png');
    this.load.image('platform-1', 'images/ground_grass.png');
    this.load.image('platform-2', 'images/ground_grass_small.png');
    this.load.image('player', 'images/robot_greenDrive2.png');
    this.load.image('goal', 'images/platformPack_tile023.png');
    this.load.image('trap-1', 'images/platformTrap.png');
    this.load.image('trap-2', 'images/platformPack_tile044.png');

    this.load.spritesheet('fire', 'images/fire_spritesheet.png', 20, 21, 2, 1, 1); 

    this.load.text('level', 'data/level.json');
  },
  //executed after everything is loaded
  create: function() { 
    //background   
    this.background = game.add.tileSprite(0, 0, 1536 * 10, 768*5, 'background');
    this.background.scale.setTo(0.5);

    //parse the file
    this.levelData = JSON.parse(this.game.cache.getText('level'));

    //platforms
    this.platforms = this.add.group();
    this.platforms.enableBody = true;

    this.levelData.longPlatformData.forEach(function(element){
      this.platforms.create(element.x, element.y, 'platform-1');
    }, this);

    this.levelData.shortPlatformData.forEach(function(element){
      this.platforms.create(element.x, element.y, 'platform-2');
    }, this);

    this.platforms.setAll('body.immovable', true);
    this.platforms.setAll('body.allowGravity', false);

    //fires
    this.fires = this.add.group();
    this.fires.enableBody = true;
    var fire;

    this.levelData.fireData.forEach(function(element){
      fire = this.fires.create(element.x, element.y, 'fire');
      fire.scale.setTo(1000, 3);
      fire.animations.add('fire', [0, 1], 4, true);
      fire.play('fire');
    }, this);

    this.fires.setAll('body.allowGravity', false);

    //traps
    this.traps = this.add.group();
    this.traps.enableBody = true;

    var trap;

    this.levelData.trap1Data.forEach(function(element){
      trap = this.traps.create(element.x, element.y, 'trap-1');
      trap.anchor.setTo(0.5);
      trap.scale.setTo(1, 1);
    }, this);

    this.levelData.trap2Data.forEach(function(element){
      trap = this.traps.create(element.x, element.y, 'trap-2');
      trap.anchor.setTo(0.5);
      trap.scale.setTo(1, 1);
    }, this);

    this.traps.setAll('body.allowGravity', false);
    this.traps.setAll('body.immovable', true);

    //goal
    this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
    this.goal.scale.setTo(-1,1);
    this.game.physics.arcade.enable(this.goal);
    this.goal.body.allowGravity = false;
    this.goal.scale.setTo(1.5);

    //create player
    this.player = this.add.sprite(this.levelData.playerStart.x, this.levelData.playerStart.y, 'player');
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(1);
    this.game.physics.arcade.enable(this.player);
    this.player.customParams = {};
    this.player.body.collideWorldBounds = true;
    
    this.game.camera.follow(this.player);

    
    //text
    /*
    this.lifeText = this.game.add.text(30, 70, 'LIFE: ' + life, { fontSize: '32px', fill: '#e00000' });
    this.lifeText.fixedToCamera = true;
    */

    this.controlText = this.game.add.text(30, 550, 'USE YOUR ARROW KEYS TO CONTROL THE PLAYER.', { fontSize: '32px', fill: '#145aff' });
    
  },
  update: function() {
    this.game.physics.arcade.collide(this.player, this.platforms);
    this.game.physics.arcade.collide(this.player, this.traps, this.killPlayer);
    this.game.physics.arcade.overlap(this.player, this.goal, this.win);
    this.game.physics.arcade.overlap(this.player, this.fires, this.killPlayer);

    this.background.tilePosition.x = 0.5;

    this.player.body.velocity.x = 0;  

    if(this.cursors.left.isDown) {
      this.player.scale.setTo(-1,1);
      this.player.body.velocity.x = -this.RUNNING_SPEED;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x = this.RUNNING_SPEED;
      this.player.scale.setTo(1, 1);
    }
    else{
      this.player.scale.setTo(1, 1);
    }

    if((this.cursors.up.isDown || this.player.customParams.mustJump) && this.player.body.touching.down) {
      this.player.customParams.mustJump = true;
      this.player.body.velocity.y = -this.JUMPING_SPEED;
      this.player.customParams.mustJump = false;
    }
  },
  killPlayer: function(player, fire) {
    //restart the game
    game.state.start('GameState');
  },
  win: function(player, goal) {
    alert('you win!');
    game.state.start('GameState');
  },
  /*subLife: function() {
    life--;
    
    this.lifeText = 'LIFE: ' + life;
    console.log('life: ' + life)

    if (life == 2) {
      this.player.reset(125, 300);
    }

    //killplayer if life is 0
    if (life === 0) {
      game.state.start('GameState');
    }
  }*/
};

//initiate the Phaser framework
var game = new Phaser.Game(1000, 600, Phaser.AUTO);

game.state.add('GameState', GameState);
game.state.start('GameState');
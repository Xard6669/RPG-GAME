var RPG = RPG || {};

RPG.GameState = {

  init: function(currentLevel) {    
    //keep track of the current level
    this.currentLevel = currentLevel ? currentLevel : 'map1';

    //constants
    this.PLAYER_SPEED = 90;
    
    //no gravity in a top-down game
    this.game.physics.arcade.gravity.y = 0;    

    //keyboard cursors
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },
  create: function() {
    //ading plugin to phaser
    this.game.onScreenControls = this.game.plugins.add(Phaser.Plugin.onScreenControls);

    this.loadLevel();
  },   
  update: function() {
      //seting up a collision betwen player and collision layer
      this.game.physics.arcade.collide(this.player, this.collisionLayer);
      
      //item consumptions
      this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
      //attacking enemies
      this.game.physics.arcade.collide(this.player, this.enemies, this.attack, null, this);
    
      //sop eatch time
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;
      
      if(!this.uiBlocked){
        //seting layer to face left side and add movment to the left siede
        if(this.cursors.left.isDown || this.player.btnsPressed.left || this.player.btnsPressed.upleft || this.player.btnsPressed.downleft){
              this.player.body.velocity.x = -this.PLAYER_SPEED;
              this.player.scale.setTo(1,1)
          }
        //seting layer to face left side and add movment to the left siede 
        if(this.cursors.right.isDown || this.player.btnsPressed.right || this.player.btnsPressed.upright || this.player.btnsPressed.downright){
            this.player.body.velocity.x = this.PLAYER_SPEED;
            this.player.scale.setTo(-1,1)
          }
        //setting a movment Up
          if(this.cursors.up.isDown || this.player.btnsPressed.up || this.player.btnsPressed.upright || this.player.btnsPressed.upleft){
            this.player.body.velocity.y = -this.PLAYER_SPEED;
          }
         //setting a movment Down
          if(this.cursors.down.isDown || this.player.btnsPressed.down || this.player.btnsPressed.downright || this.player.btnsPressed.downleft){
            this.player.body.velocity.y = this.PLAYER_SPEED;
          }
      }
      //stop all movment if nothing is being pressed
      if(this.game.input.activePointer.isUp){
          this.game.onScreenControls.stopMovment();
      }
      
      //play the animaton while moving
      if(this.player.body.velocity.x != 0 || this.player.body.velocity.y != 0){
          this.player.play('walk');
      }
      else{
          this.player.animations.stop();
          this.player.frame = 0;
      }
  },     
  loadLevel: function(){
    //create a tilemap object
    this.map = this.add.tilemap(this.currentLevel);
    
    //join the tile images to the json data
    this.map.addTilesetImage('terrains', 'tilesheet');
    
    //create tile layers
    this.backgroundLayer = this.map.createLayer('backgroundLayer');
    this.collisionLayer = this.map.createLayer('collisionLayer');
    
    //send background to the back
    this.game.world.sendToBack(this.backgroundLayer);
    
    //collision layer should be collisionLayer
    this.map.setCollisionBetween(1,16, true, 'collisionLayer');
    
    //resize the world to fit the layer
    this.collisionLayer.resizeWorld();
      
    //create a player
    var playerData = {
        //list of items
        items:[],
        
        //player Stats
        health: 25,
        attack: 12,
        defense: 8,
        gold: 100,
        
        //quest
        quest: [
            {
                name: 'Find the Magic Scroll',
                code: 'magic-scroll',
                isCompleted: false
            },
            {
                name: 'Find the Helmet of the Gods',
                code: 'gods-helmet',
                isCompleted: false
            }
        ]
    };
      
      this.player = new RPG.Player(this, 100, 100, playerData);
      //follow player with teh camera
      this.game.camera.follow(this.player);
      
      //add player to the world
      this.add.existing(this.player);
      
      //group of items
      this.items = this.add.group(); 
      this.loadItems();
      
      //group of enemies
      this.enemies = this.add.group();
      this.loadEnemies();
      
      //battle object
      this.battle = new RPG.Battle(this.game);
      
      this.initGUI();
  },
    
    
  gameOver: function() {
    this.game.state.start('Game', true, false, this.currentLevel);
  },
    
    
    initGUI: function(){
        //on screen contols setup
        this.game.onScreenControls.setup(this.player, {
            left: true,
            right: true,
            up: true,
            down: true,
            upleft: true,
            downleft:true,
            upright:true,
            downright: true,
            action: true
        });
        
        this.showPlayerIcons();
    },
    
    collect: function(player, item){
        this.player.collectItem(item);
        this.player.refreshHealthBar();
    },
    
    showPlayerIcons: function(){
        var style = {font: '14px Arial', fill: '#fff'};
        //gold icon
        this.goldIcon = this.add.sprite(10, 10, 'coin');
        this.goldIcon.fixedToCamera = true;
        
        this.goldLabel = this.add.text(30, 12, '0', style);
        this.goldLabel.fixedToCamera = true;
        
        //attack icon
        this.attackIcon = this.add.sprite(70, 10, 'sword');
        this.attackIcon.fixedToCamera = true;
        
        this.attackLabel = this.add.text(95, 12, '0', style);
        this.attackLabel.fixedToCamera = true;
        
        //defense icon
        this.defenseIcon = this.add.sprite(130, 10, 'shield');
        this.defenseIcon.fixedToCamera = true;
        
        this.defenseLabel = this.add.text(150, 12, '0', style);
        this.defenseLabel.fixedToCamera = true;
        
        //quest button
        this.questIcon = this.add.sprite(this.game.width - 30, 10, 'quest');
        this.questIcon.fixedToCamera = true;
        
        //init quests info panel
        this.overlay = this.add.bitmapData(this.game.width, this.game.height);
        this.overlay.ctx.fillStyle = '#000';
        this.overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);
        

        this.questsPanelGroup = this.add.group();
        this.questsPanelGroup.y = this.game.height;
        this.questsPanel = new Phaser.Sprite(this.game, 0, 0, this.overlay);
        this.questsPanel.alpha = 0.8;
        this.questsPanel.fixedToCamera = true;
        this.questsPanelGroup.add(this.questsPanel);
        

        //content of the panel
        style = {font: '14px Arial', fill: '#fff'};
        this.questInfo = new Phaser.Text(this.game, 50, 50, '', style);
        this.questInfo.fixedToCamera = true;
        this.questsPanelGroup.add(this.questInfo);

        //show quests when you touch the quests icon
        this.questIcon.inputEnabled = true;
        this.questIcon.events.onInputDown.add(this.showQuests, this);

        //hide quest panel when touched
        this.questsPanel.inputEnabled = true;
        this.questsPanel.events.onInputDown.add(this.hideQuests, this);
        
        this.refreshStats();
    },
    
    refreshStats: function(){
        this.goldLabel.text = this.player.data.gold;
        this.attackLabel.text = this.player.data.attack;
        this.defenseLabel.text = this.player.data.defense;
        
    },
    
    findObjectByType: function(targetType, tilemap, layer){
        var result = [];
        
        tilemap.objects[layer].forEach(function(element){
            if(element.properties.type == targetType){
                element.x -= tilemap.tileHeight/2 - tilemap.tileHeight;
                element.y += tilemap.tileHeight/2 - tilemap.tileHeight;
                result.push(element);
            }
        },this)
        return result;
    },
    
    loadItems: function(){
        var elementArr = this.findObjectByType('item', this.map, 'objectsLayer');
        var elementObj;
        elementArr.forEach(function(element){
            elementObj = new RPG.Item(this, element.x, element.y, element.properties.asset, element.properties);
            this.items.add(elementObj);
        },this)
    },
    
    loadEnemies: function(){
        var elementArr = this.findObjectByType('enemy', this.map, 'objectsLayer');
        var elementObj;
        elementArr.forEach(function(element){
            elementObj = new RPG.Enemy(this, element.x, element.y, element.properties.asset, element.properties);
            this.enemies.add(elementObj);
        },this)
    },
    
    attack: function(player, enemy){
        this.battle.attack(player, enemy);
        this.battle.attack(enemy, player);
        
        //bou nce back a bit
        if(player.body.touching.up){
            player.y +=20;
        }
        
        if(player.body.touching.down){
            player.y -=20;
        }
        
        if(player.body.touching.left){
            player.x +=20;
        }
        
        if(player.body.touching.right){
            player.x -=20;
        }
        
        if(player.data.health <= 0){
            this.gameOver();
        }
        
    },
    showQuests: function(){
        //player can't move anymore
        this.uiBlocked = true;
        
        //tween to show the panel
        var showPanelTween = this.add.tween(this.questsPanelGroup);
        showPanelTween.to({y: 0}, 150);
        
        //show the quest when the paner reaches the top
        showPanelTween.onComplete.add(function(){
            //show all quests
            var questsText = 'QUESTS\n';
            
            //itereate thtough all the player questes
            this.player.data.quest.forEach(function(quest){
                questsText += quest.name + (quest.isCompleted ? ' - DONE' : '') + '\n';
            },this)
            
            //show the text
            this.questInfo.text = questsText;
        },this)
        
        showPanelTween.start();
    },
    hideQuests: function(){
        this.questsPanelGroup.y = this.game.height;
        this.questInfo.text = '';
        
        //releste the ui
        this.uiBlocked = false;
    }
};

var RPG = RPG || {};

RPG.Player = function(state, x, y, data) {
    Phaser.Sprite.call(this, state.game, x, y, 'player');
    
    //basic saving variables
    this.state = state;
    this.game = state.game;
    this.data = Object.create(data);
    this.anchor.setTo(0.5);
    
    //walking animation
    this.animations.add('walk', [0,1,0], 6, false);
    
    //health bar
    this.healthBar = new Phaser.Sprite(state.game, this.x, this.y,  'bar');
    this.game.add.existing(this.healthBar);
    this.healthBar.anchor.setTo(0.5);
    this.refreshHealthBar();
    
    //enable physics
    this.game.physics.arcade.enable(this);
    this.game.physics.arcade.enable(this.healthBar);
};

RPG.Player.prototype = Object.create(Phaser.Sprite.prototype);
RPG.Player.prototype.constructor = RPG.Player;

RPG.Player.prototype.collectItem = function(item){
    //2 types of items qurst or consumble
    if(item.data.isQuest){
        this.data.items.push(item);
        
        //check quest completion
        this.checkQuestCompletion(item);
    }
    else{
        //consumable items
        
        //add properites
        this.data.health += item.data.health ? item.data.health : 0;
        this.data.attack += item.data.attack ? item.data.attack : 0;
        this.data.defense += item.data.defense ? item.data.defense : 0;
        this.data.gold += item.data.gold ? item.data.gold : 0;
        
        //refresh stats
        this.state.refreshStats();
    }
    item.kill();
};

RPG.Player.prototype.checkQuestCompletion = function(item){
    //chcking if quest array got any of the quest marked
    var i = 0;
    var len = this.data.quest.length;
    
    while(i < len){
        if(this.data.quest[i].code == item.data.questCode){
            this.data.quest[i].isCompleted = true;
            console.log(this.data.quest[i].name + ' has been completed');
            break;
        }
        i++;
    }
   
};

RPG.Player.prototype.refreshHealthBar = function(){
    this.healthBar.scale.setTo(this.data.health, 0.5);
    
};

RPG.Player.prototype.update = function(){
    this.healthBar.x = this.x;
    this.healthBar.y = this.y - 25;
    
    this.healthBar.body.velocity = this.body.velocity;
    
};

    
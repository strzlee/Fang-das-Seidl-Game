$(function(){
	
	Array.prototype.remove = function(from, to) {
 		var rest = this.slice((to || from) + 1 || this.length);
  		this.length = from < 0 ? this.length + from : from;
  		return this.push.apply(this, rest);
	};
	
	function drawHighscore(score) {
		$.ajaxSetup({ cache: false });
		$.getJSON("highscore.json", function(data) {
			if (score) data = score;
			$("#highscore").html("<h3>Highscore:</h3><table id='ht'>");
			for(i=0; i < data.length; i++) {
				$("#ht").append("<tr><td>"+data[i].score+"</td><td>"+data[i].name+"</td></tr>");
			}
		});
	};
	
	function writeHighscore(name,score) {
		$.getJSON("writescore.php",{"name":name,"score":score},function(data){
			drawHighscore(data);	
		});	
	}
	
	var Bier = function(image, x, y, speed, points) {
		this.x = x;
		this.y = y;
		this.image = image;
		this.speed = speed;
		this.points = points;
	}
	
	var Player = function(x, y, speed, health, points, state) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.defaultspeed = speed;
		this.health = health;
		this.points = points;
		this.state = state;
	}
	
	var Splash = function(image, x, y, time) {
		this.image = image;
		this.x = x;
		this.y = y;
		this.time = time;
	}
	
	var Resources = new Array();
	
	var Game = {
		init: function(canvasId) { 
			self = this;
		
			Resources[0] = new Image(); Resources[0].src = "img/stiegl.png";
			Resources[1] = new Image(); Resources[1].src = "img/zipfer.png";
			Resources[2] = new Image(); Resources[2].src = "img/hand.png";
			Resources[3] = new Image(); Resources[3].src = "img/background.jpg";
			Resources[4] = new Image(); Resources[4].src = "img/yummie.png";
			Resources[5] = new Image(); Resources[5].src = "img/wuerg.png";
			
			Resources[10] = new Audio("sfx/puke.wav");
			Resources[11] = new Audio("sfx/burp.wav");
			Resources[12] = new Audio("sfx/break.wav");
			Resources[13] = new Audio("sfx/marsch.wav");
			
			this.canvas = document.getElementById(canvasId);
			this.context = this.canvas.getContext("2d");
			this.player = new Player(0,380,15,10,0,"idle"); 
			this.entities = new Array();
			this.running = false;
	
		},
		update: function() {
			if (self.player.health < 1) self.stop();
			if (self.player.state == "moveLeft") {
				self.player.x -= self.player.speed;
				if (self.player.x < 0) self.player.x = 0;
			};
			if (self.player.state == "moveRight") {
				if (self.player.x < (640 - self.player.speed)) self.player.x += self.player.speed;
			};
			
			for (i = 0; i < self.entities.length; i++) {
				if (self.entities[i].x < (self.player.x +50) && self.entities[i].x > (self.player.x -50) && self.entities[i].y > 330) {
					self.player.points += self.entities[i].points;
					if (self.entities[i].points < 0) {
						self.splash = new Splash(Resources[5],self.entities[i].x,self.entities[i].y,10);
						Resources[10].play();
					} else {
						self.splash = new Splash(Resources[4],self.entities[i].x,self.entities[i].y,10);
						Resources[11].play();
					};
					self.entities.remove(i);
				} else if  (self.entities[i].y > 480) {
					 if (self.entities[i].points > 0) {
						self.player.health--;
						Resources[12].play(); 
					 }
					 self.entities.remove(i);
				} else {
					self.entities[i].y += self.entities[i].speed;
				};
			};
			
			if (Math.random() > 0.9) {
				if (Math.random() > 0.5) self.entities.push(new Bier(Resources[0],Math.random()*590,0,Math.random()*20,-5));
				else self.entities.push(new Bier(Resources[1],Math.random()*590,0,Math.random()*20,5));
			};
			
			if (self.splash) {
				if (self.splash.time-- < 0) delete self.splash;				
			}
				
		},
		render: function() {
			if (self.running) {
				self.context.save();
				self.context.drawImage(Resources[3],0,0);
				self.context.drawImage(Resources[2],self.player.x,self.player.y);
				
				for (i = 0; i < self.entities.length; i++) {
					self.context.drawImage(self.entities[i].image,self.entities[i].x,self.entities[i].y);
				};
				
				self.context.font = "20px Times New Roman";  
				self.context.fillStyle = "White";  
				self.context.fillText("Punkte: "+self.player.points, 5, 20);
				self.context.fillText("Leben: "+self.player.health, 5, 40);
				
				self.context.globalAlpha = 0.5;
				if (self.splash) self.context.drawImage(self.splash.image,self.splash.x,self.splash.y);
				
				self.context.restore();
			} else {
				self.context.save();
				self.context.globalAlpha = 0.7;
				self.context.fillRect(0,0,640,480);
				self.context.globalAlpha = 1;
				self.context.font = "20px Times New Roman";  
				self.context.fillStyle = "White"; 
				self.context.fillText("Druk auf [J]awoi waunst nuamoi mogst",170,230);
				self.context.restore();
			}
		},
		mainloop: function() {
			self.debug();
			self.update();
			self.render();
		},
		debug: function() {
			$("#debug").html("Entities: "+self.entities.length);
		},
		start: function() {
			self.running = setInterval(Game.mainloop,100);
		},
		stop: function() {
			clearInterval(self.running);
			self.running = false;
			self.render();
			Resources[13].play();
			var name = prompt("Des woas! Bittschen Namen fiad Highscore-Listn eigebn","");
			if (name) writeHighscore(name,self.player.points);
		}
	}	
	
	$(document).keydown(function(key) {
		Game.player.speed += 2;
		if (key.which == 37) Game.player.state = "moveLeft";
		if (key.which == 39) Game.player.state = "moveRight";
		if (key.which == 74 && Game.running == false) {
				Game.init("drawspace");
				Game.start();
		}
	});
	
	$(document).keyup(function(){
		Game.player.speed = Game.player.defaultspeed;
		Game.player.state = "idle";
	});
	
	drawHighscore();
	Game.init("drawspace");
	Game.mainloop();
	
});
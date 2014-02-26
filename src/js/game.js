//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

var Game = WinJS.Class.define(
    null,
{
    // Convenience variables
    gameContext: null,
    stateHelper: null,
    state: null,
    settings: null,
    isSnapped: function () { return (typeof gameCanvas !== "undefined" && gameCanvas.width === 320); },

    // Called when Game is first loaded
    initialize: function (state) {
        if (GameManager.gameId === null) {
            this.stateHelper = state;
            this.state = state.internal;
            this.settings = state.external;
        }
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", function (e) {
            var request = e.request;
            request.data.properties.title = "My Highscore in Lights Off is " + GameManager.game.state.score; // Title required
            request.data.setText("Lights Off is Fun Game and I have scored " + GameManager.game.state.score + ". You can also get it Microsoft Stores");
            });
    },

    // Called to get list of assets to pre-load
    getAssets: function () {
        // To add asset to a list of loading assets follow the the examples below
        var assets = {
            sndBounce: { object: null, fileName: "/sounds/bounce.wav", fileType: AssetType.audio, loop: false },
            sndoff: { object: null, fileName: "/sounds/off.wav", fileType: AssetType.audio, loop: false },
            sndon: { object: null, fileName: "/sounds/on.wav", fileType: AssetType.audio, loop: false },
            //// backgroundImage: { object: null, fileName: "/images/background.jpg", fileType: AssetType.image },
            //// sndMusic: { object: null, fileName: "/sounds/music", fileType: AssetType.audio, loop: true }
        };
        return assets;
    },
    
    // Called the first time the game is shown
    showFirst: function () {
        // If game was previously running, pause it.
        if (this.state.gamePhase === "started") {
            this.end();
            this.start();
        }
        GameManager.game.scramble();
        this.state.time = 0;
        // Note: gameCanvas is the name of the <canvas> in default.html
        this.gameContext = gameCanvas.getContext("2d");
    },

    // Called each time the game is shown
    show: function () {
        this.unpause();
    },

    // Called each time the game is hidden
    hide: function () {
        this.pause();
    },

    // Called when the game enters snapped view
    snap: function () {
        // TODO: Update game state when in snapped view - basic UI styles can be set with media queries in gamePage.css
        this.pause();
        // Temporarily resize game area to maintain aspect ratio
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    },

    // Called when the game enters fill or full-screen view
    unsnap: function () {
        // TODO: Update game state when in fill, full-screen, or portrait view - basic UI styles can be set with media queries in gamePage.css

        // It's possible the ball is now outside the play area. Fix it if so.
        if (this.state.position.x > window.innerWidth) {
            this.state.position.x += window.innerWidth - this.state.position.x;
        }
        if (this.state.position.y > window.innerHeight) {
            this.state.position.y += window.innerHeight - this.state.position.y;
        }

        // Restore game area to new aspect ratio
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;

        // Resume playing
        this.unpause();
    },

    // Called to reset the game
    newGame: function () {
        GameManager.game.scramble();
        GameManager.game.ready();
    },

    // Called when the game is being prepared to start
    ready: function () {
        // TODO: Replace with your own new game initialization logic
        if (this.isSnapped()) {
            this.state.gamePaused = true;
        } else {
            this.state.gamePaused = false;
        }
        this.state.gamePhase = "ready";

        GameManager.game.scramble();
        this.state.score = 0;
        this.state.time = 0;

        this.state.gamePhase = "ready";
        
    },

    scramble: function () {

        var rand = Math.round((Math.random() * 1000));
        var i = Math.round(Math.random() * 10);
        this.state.lightField =
	[
		[(rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2],
		[(rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2],
		[(rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2],
		[(rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2],
		[(rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2, (rand % i++) % 2]
	];

      this.state.lightField =
	[
		[0, 0, 0, 1, 1],
		[0, 0, 1, 0, 1],
		[0, 1, 1, 1, 0],
		[1, 0, 1, 0, 0],
		[1, 1, 0, 0, 0]
	];


    },
    // Called when the game is started
    start: function () {
        // Don't allow start when game is snapped
        if (!this.isSnapped()) {
            this.state.gamePhase = "started";
            var time = new Date();
            this.state.score = 0;
            this.state.starttime = time.getTime();
        }
    },
    
    // Called when the game is over
    end: function () {
        this.state.gamePhase = "ended";
        //var newRank = GameManager.scoreHelper.newScore({ player: this.settings.playerName, score: this.state.score, skill: this.settings.skillLevel });
    },

    // Called when the game is paused
    pause: function () {
        this.state.gamePaused = true;
    },

    // Called when the game is un-paused
    unpause: function () {
        // Don't allow unpause when game is snapped
        if (!this.isSnapped()) {
            this.state.gamePaused = false;
        }
    },

    // Called to toggle the pause state
    togglePause: function () {
        if (GameManager.game.state.gamePaused) {
            GameManager.game.unpause();
        } else {
            GameManager.game.pause();
        }
    },

    // Touch events... All touch events come in here before being passed onward based on type
    doTouch: function (touchType, e) {
        switch (touchType) {
            case "start": GameManager.game.touchStart(e); break;
            case "end": GameManager.game.touchEnd(e); break;
            case "move": GameManager.game.touchMove(e); break;
            case "cancel": GameManager.game.touchCancel(e); break;
        }
    },

    touchStart: function (e) {
        // TODO: Replace game logic
        // Touch screen to move from ready phase to start the game
        if (this.state.gamePhase === "ready") {
            this.start();
        }
    },

    touchEnd: function (e) {
        // TODO: Replace game logic.
        if (this.state.gamePhase === "started" && !this.state.gamePaused) {
            /*if (Math.sqrt(((e.x - this.state.position.x) * (e.x - this.state.position.x)) +
            ((e.y - this.state.position.y) * (e.y - this.state.position.y))) < 50) {
                this.state.score++;
            }*/

            var left = (gameCanvas.width / 2) - 250;
            var top = (gameCanvas.height / 2) - 250;
            //checking if the point is within the bounds of drawn canvas
            if ((e.x < left + 500) && (e.y < top + 500) && (e.x > left) && (e.y > top)) {
                var ox = e.x - left;
                var oy = e.y - top;
                var changed = 0;
                var ch = 0;
                // Check which fields we need to flip
                var yField = Math.floor(oy / 100);
                var xField = Math.floor(ox / 100);

                // The field itself
                this.state.lightField[yField][xField] = this.state.lightField[yField][xField] == 1 ? 0 : 1;
                if (this.state.lightField[yField][xField] == 1) {

                    changed -= 1;
                }
                else {

                    changed += 1;
                }


                // The field above
                if (yField - 1 >= 0) {
                    if (this.state.lightField[yField - 1][xField] == 1) {
                        this.state.lightField[yField - 1][xField] = 0
                        changed += 1;
                    }
                    else {
                        this.state.lightField[yField - 1][xField] = 1;
                        changed -= 1;

                    }
                }

                // The field underneath
                if (yField + 1 < 5) {

                    if (this.state.lightField[yField + 1][xField] == 1) {
                        this.state.lightField[yField + 1][xField] = 0
                        changed += 1;
                    }
                    else {
                        this.state.lightField[yField + 1][xField] = 1;
                        changed -= 1;
                    }
                }

                // The field to the left
                if (xField - 1 >= 0) {
                    if (this.state.lightField[yField][xField - 1] == 1) {
                        this.state.lightField[yField][xField - 1] = 0
                        changed += 1;
                    }
                    else {
                        this.state.lightField[yField][xField - 1] = 1;
                        changed -= 1;
                    }
                }

                // The field to the right
                if (xField + 1 < 5) {
                    if (this.state.lightField[yField][xField + 1] == 1) {
                        this.state.lightField[yField][xField + 1] = 0
                        changed += 1;
                    }
                    else {
                        this.state.lightField[yField][xField + 1] = 1;
                        changed -= 1;
                    }
                }
                this.state.score += changed;

                this.state.changd = changed;
                this.state.display = 80;
                this.state.displayx = e.x;
                this.state.displayy = e.y;
                this.state.float = 30;

                if (changed > 0)
                    GameManager.assetManager.playSound(GameManager.assetManager.assets.sndon);
                else
                    GameManager.assetManager.playSound(GameManager.assetManager.assets.sndoff);
            }
        }
    },
    
    touchMove: function (e) {
        // TODO: Add game logic
    },

    touchCancel: function (e) {
        // TODO: Add game logic
    },

    // Called before preferences panel or app bar is shown
    showExternalUI: function (e) {
        if (e.srcElement.id === "settingsDiv") {
            this.pause();
        }
    },

    // Called after preferences panel or app bar is hidden
    hideExternalUI: function (e) {
        if (e.srcElement.id === "settingsDiv") {
            this.unpause();
        }
    },

    // Called by settings panel to populate the current values of the settings
    getSettings: function () {
        // Note: The left side of these assignment operators refers to the setting controls in default.html
        // TODO: Update to match any changes in settings panel
        settingPlayerName.value = this.settings.playerName;
        settingSoundVolume.value = this.settings.soundVolume;
        for (var i = 0; i < settingSkillLevel.length; i++) {
            if (settingSkillLevel[i].value === "" + this.settings.skillLevel) {
                settingSkillLevel[i].checked = true;
            }
        }
    },

    // Called when changes are made on the settings panel
    setSettings: function () {
        // Note: The right side of these assignment operators refers to the controls in default.html
        // TODO: Update to match any changes in settings panel
        this.settings.playerName = settingPlayerName.value;
        this.settings.soundVolume = settingSoundVolume.value;
        // Changing the skill level re-starts the game
        var skill = 0;
        for (var i = 0; i < settingSkillLevel.length; i++) {
            if (settingSkillLevel[i].checked) {
                skill = parseInt(settingSkillLevel[i].value);
            }
        }
        if (this.settings.skillLevel !== skill) {
            // Update the skill level
            this.settings.skillLevel = skill;

            // Start a new game so high scores represent entire games at a given skill level only.
            this.ready();

            // Save state so that persisted skill-derived values match the skill selected
            this.stateHelper.save("internal");
        }

        // Save settings out
        this.stateHelper.save("external");
    },

    // Called when the app is suspended
    suspend: function () {
        this.pause();
        this.stateHelper.save();
    },

    // Called when the app is resumed
    resume: function () {
    },

    // Main game update loop
    update: function () {
        // TODO: Sample game logic to be replaced
        if (!this.state.gamePaused && this.state.gamePhase === "started") {
            var time = new Date();
            this.state.time = time.getTime() - this.state.starttime;// - this.state.ptotal;
        }
    },

    // Main game render loop
    draw: function () {
        if (this.state.gamePhase === "ready") {
            this.gameContext.textAlign = "center";
            this.gameContext.fillText("READY", gameCanvas.width / 2, gameCanvas.height / 2);
        } else if (this.state.gamePhase === "ended") {
            this.gameContext.textAlign = "center";
            this.gameContext.fillText("GAME OVER", gameCanvas.width / 2, gameCanvas.height / 2);
        } else if (this.state.gamePaused) {
            this.gameContext.textAlign = "center";
            this.gameContext.fillText("PAUSED", gameCanvas.width / 2, gameCanvas.height / 2);
        }
        this.state.complete = true;
        this.gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        var left = (gameCanvas.width / 2) - 250;
        var top = (gameCanvas.height / 2) - 250;
        for (var i = 0; i < this.state.lightField.length; i++) { // Rows
            for (var j = 0; j < this.state.lightField[i].length; j++) { // Columns

                // Set up the brush
                this.gameContext.lineWidth = 3;
                this.gameContext.strokeStyle = "#83BD08";

                // Start drawing
                this.gameContext.beginPath();

                // arc( x, y, radius, startAngle, endAngle, anticlockwise)
                this.gameContext.arc(left + (j * 100 + 50), top + (i * 100 + 50), 40, 0, Math.PI * 2, true);

                // Actual draw of the border
                this.gameContext.stroke();


                // Check if we need to fill the border
                if (this.state.lightField[i][j] == 1) {
                    this.gameContext.fillStyle = "#FFBD38";
                    this.gameContext.beginPath();
                    this.gameContext.arc(left + (j * 100 + 50), top + (i * 100 + 50), 38, 0, Math.PI * 2, true);
                    this.gameContext.fill();

                    // Since we need to fill this field, not all the lights are off
                    this.state.complete = false;
                }

            }
        }

        this.gameContext.fillStyle = "#FFFF99";
        this.gameContext.font = "bold 48px Segoe UI";
        this.gameContext.textBaseline = "middle";
        this.gameContext.textAlign = "right";
        this.gameContext.fillText(Math.round((this.state.time) / 1000), gameCanvas.width - 20, 30);

        this.gameContext.fillStyle = "#FFFF99";
        this.gameContext.font = "bold 48px Segoe UI";
        this.gameContext.textBaseline = "middle";
        this.gameContext.textAlign = "left";
        this.gameContext.fillText(this.state.score, 20, 30);

        if (this.state.display > 0) {

            this.gameContext.fillStyle = "rgba(255,255,255," + this.state.display / 80 + ")";
            this.gameContext.font = "bold 25px Segoe UI";
            this.gameContext.textBaseline = "middle";
            this.gameContext.textAlign = "left";
            this.gameContext.fillText(this.state.changd, this.state.displayx + 10, this.state.displayy - 20 + (this.state.float--));
            this.state.display--;
        };

        // Check if all the lights are off
        if (this.state.complete) {
            // User can't click anymore
            this.gameContext.textAlign = "center";
            this.gameContext.fillText("YOU WON", gameCanvas.width / 2, gameCanvas.height / 2);
            var app = document.getElementById("appbar");

            if (app) {
                app.winControl.show();
            }

            this.end();


        }

    }
});
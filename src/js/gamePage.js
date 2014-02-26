//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    function ready(element, options) {

        // Stop previous loop if it is running already
        if (GameManager.gameId !== null) {
            stopGameLoop();
        }

        WinJS.UI.processAll(element)
            .then(function () {
                gamePage.enableAppBarGameButtons();

                if (GameManager.gameId === null) {
                    // Set up game area
                    gameCanvas.width = window.innerWidth;
                    gameCanvas.height = window.innerHeight;

                    // Initialize update loop
                    if (GameManager.state.config.frameRate > 0) {
                        updateTimer.reset(updateLoop, GameManager.state.config.frameRate);
                    }

                    // Initialize draw loop
                    GameManager.gameId = window.msRequestAnimationFrame(gamePage.renderLoop);

                    // Set up touch panel
                    GameManager.touchPanel.initialize(touchCanvas, GameManager.game.doTouch);

                    // Prepare game for first-time showing
                    GameManager.game.showFirst();

                    // Set up media query listeners
                    gamePage.setupMediaQueryListeners();
                }
            });
    }

    function unload(e) {
        gamePage.disableAppBarGameButtons();

        // Stop previous loop if it is running
        if (GameManager.gameId !== null) {
            stopGameLoop();
        }
    }

    // Handle showing and hiding game buttons from the app bar
    function enableAppBarGameButtons() {
        // TODO: Add any other game specific buttons here
        WinJS.Utilities.removeClass(document.getElementById("newgame"), "game-button");
        WinJS.Utilities.removeClass(document.getElementById("pause"), "game-button");
    }

    function disableAppBarGameButtons() {
        // TODO: Add any other game specific buttons here
        WinJS.Utilities.addClass(document.getElementById("newgame"), "game-button");
        WinJS.Utilities.addClass(document.getElementById("pause"), "game-button");
    }


    // Stop drawing loop for the game
    function stopGameLoop() {
        window.msCancelRequestAnimationFrame(GameManager.gameId);
        GameManager.gameId = null;
    }

    var updateTimer = new FrameTimer();

    function setupMediaQueryListeners() {
        var mql = msMatchMedia("all and (-ms-view-state: full-screen)");
        mql.addListener(unsnapListener);

        var mql2 = msMatchMedia("all and (-ms-view-state: snapped)");
        mql2.addListener(snapListener);

        var mql3 = msMatchMedia("all and (-ms-view-state: fill)");
        mql3.addListener(unsnapListener);

        var mql4 = msMatchMedia("all and (-ms-view-state: device-portrait)");
        mql4.addListener(unsnapListener);
    }
 
    function unsnapListener(mql)
    {
        if ( !mql.matches ) { return; }
        if (GameManager.state.config.currentPage === "/html/gamePage.html") {
            GameManager.game.unsnap();
        }
    }
 
    function snapListener(mql)
    { 
        if (!mql.matches) { return; }
        if (GameManager.state.config.currentPage === "/html/gamePage.html") {
            GameManager.game.snap();
        }
    }

    function renderLoop() {
        if (typeof gameCanvas !== "undefined") {
            GameManager.game.draw();
            window.msRequestAnimationFrame(renderLoop);
        }
    }

    function updateLoop() {
        if (typeof gameCanvas !== "undefined") {
            GameManager.game.update();
        }
    }

    WinJS.UI.Pages.define("/html/gamePage.html", {
        ready: ready,
        unload: unload
    });

    WinJS.Namespace.define("gamePage", {
        renderLoop: renderLoop,
        updateLoop: updateLoop,
        updateTimer: updateTimer,
        setupMediaQueryListeners: setupMediaQueryListeners,
        enableAppBarGameButtons: enableAppBarGameButtons,
        disableAppBarGameButtons: disableAppBarGameButtons
    });

})();

//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var homeUrl = "/html/homePage.html";
    var gameUrl = "/html/gamePage.html";
    var rulesUrl = "/html/rulesPage.html";
    var scoresUrl = "/html/scoresPage.html";
    var creditsUrl = "/html/creditsPage.html";
    var gameId = null;
    var game = new Game();
    var touchPanel = new TouchPanel();
    var state = new GameState();
    state.load();
    var assetManager = new AssetManager();
    var assetsLoaded = false;
    assetManager.load(game.getAssets(), assetLoadComplete);
    //var scoreHelper = new Scores();

    function assetLoadComplete() {
        assetsLoaded = true;
    }

    // Navigation support
    function navigateHome() {
        var loc = WinJS.Navigation.location;
        if (loc !== "" && loc !== homeUrl) {
            // Navigate
            WinJS.Navigation.navigate(homeUrl);

            // Update the current location for suspend/resume
            GameManager.state.config.currentPage = homeUrl;

            // Hide the app bar
            document.getElementById("appbar").winControl.hide();
        }
    }

    function navigateGame() {
        var loc = WinJS.Navigation.location;
        if (loc !== "" && loc !== gameUrl) {
            // Navigate
            WinJS.Navigation.navigate(gameUrl);

            // Update the current location for suspend/resume
            GameManager.state.config.currentPage = gameUrl;

            // Hide the app bar
            document.getElementById("appbar").winControl.hide();
        }
    }

    function navigateRules() {
        var loc = WinJS.Navigation.location;
        if (loc !== "" && loc !== rulesUrl) {
            // Navigate
            WinJS.Navigation.navigate(rulesUrl);

            // Update the current location for suspend/resume
            GameManager.state.config.currentPage = rulesUrl;

            // Hide the app bar
            document.getElementById("appbar").winControl.hide();
        }
    }

    function navigateScores() {
        var loc = WinJS.Navigation.location;
        if (loc !== "" && loc !== scoresUrl) {
            // Navigate
            WinJS.Navigation.navigate(scoresUrl);

            // Update the current location for suspend/resume
            GameManager.state.config.currentPage = scoresUrl;

            // Hide the app bar
            document.getElementById("appbar").winControl.hide();
        }
    }

    function navigateCredits() {
        var loc = WinJS.Navigation.location;
        if (loc !== "" && loc !== creditsUrl) {
            WinJS.Navigation.navigate(creditsUrl);

            // Update the current location for suspend/resume
            GameManager.state.config.currentPage = creditsUrl;
        }
    }

    // Preferences panel
    function showPreferences() {
        WinJS.UI.SettingsFlyout.show();
    }

    // Notification before App Bar or Settings are shown/hidden
    function onBeforeShow(e) {
        if (e.srcElement.id === "settingsDiv") {
            // Sync up the settings UI to match internal state
            GameManager.game.getSettings();
        }
        GameManager.game.showExternalUI(e);
    }

    function onAfterHide(e) {
        GameManager.game.hideExternalUI(e);
    }

    WinJS.Application.onsettings = function (e) {
        e.detail.applicationsettings = { settingsDiv: { href: "/html/settingsFlyout.html" } };
        WinJS.UI.SettingsFlyout.populateSettings(e);
    };

    // Activation
    WinJS.Application.onactivated = function (e) {
        if (e.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {

            GameManager.game.initialize(GameManager.state);

            WinJS.UI.processAll();

            // Set up initial AppBar button styles. TODO: Add any new buttons' associated styles
            WinJS.Utilities.addClass(document.getElementById("play"), "snapped-hidden");
            WinJS.Utilities.addClass(document.getElementById("rules"), "snapped-hidden");
            //WinJS.Utilities.addClass(document.getElementById("scores"), "snapped-hidden");
            WinJS.Utilities.addClass(document.getElementById("credits"), "snapped-hidden");
            WinJS.Utilities.addClass(document.getElementById("credits"), "portrait-hidden");
            WinJS.Utilities.addClass(document.getElementById("newgame"), "game-button");
            WinJS.Utilities.addClass(document.getElementById("pause"), "game-button");

            WinJS.Navigation.navigate(GameManager.state.config.currentPage);
        }
    };

    // Suspend and resume
    function suspendingHandler(e) {
        if (GameManager.state.config.currentPage === gameUrl) {
            GameManager.game.suspend(e);
        } else {
            GameManager.state.save();
        }
    }

    function resumingHandler(e) {
        if (GameManager.state.config.currentPage === gameUrl) {
            GameManager.game.resume(e);
        }
    }

    // Notify game of loss and regain of focus
    function blurHandler(e) {
        if (WinJS.Navigation.location === gameUrl) {
            GameManager.game.hide();
        }
    }

    function focusHandler(e) {
        if (WinJS.Navigation.location === gameUrl) {
            GameManager.game.show();
        }
    }

    Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", suspendingHandler, false);
    Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", resumingHandler, false);
    window.addEventListener("blur", blurHandler, false);
    window.addEventListener("focus", focusHandler, false);
    document.addEventListener("beforeshow", onBeforeShow, false);
    document.addEventListener("afterhide", onAfterHide, false);

    WinJS.Application.start();

    WinJS.Namespace.define("GameManager", {
        navigateHome: navigateHome,
        navigateGame: navigateGame,
        navigateRules: navigateRules,
       // navigateScores: navigateScores,
        navigateCredits: navigateCredits,
        showPreferences: showPreferences,
        onBeforeShow: onBeforeShow,
        onAfterHide: onAfterHide,
        game: game,
        state: state,
        assetManager: assetManager,
        //scoreHelper: scoreHelper,
        gameId: gameId,
        touchPanel: touchPanel
    });

})();

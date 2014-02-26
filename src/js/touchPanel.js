//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

var TouchPanel = WinJS.Class.define(
    null,
{
    boundCanvas: null,
    touchHandler: null,
    enabled: function () { return window.navigator.msPointerEnabled; },

    touches: [],
    point: {},
	startPoint: {},

    touchCount: function () {
        return Object.keys(GameManager.touchPanel.touches).length;
    },

    initialize: function (canvas, touchHandler) {
        this.boundCanvas = canvas;
        if (touchHandler) {
            canvas.addEventListener("MSPointerDown", this.start, false);
            canvas.addEventListener("MSPointerUp", this.end, false);
            canvas.addEventListener("MSPointerMove", this.move, false);
            canvas.addEventListener("MSPointerOut", this.cancel, false);
            canvas.addEventListener("MSPointerCancel", this.cancel, false);
            this.touchHandler = touchHandler;
        }
    },

    start: function (e) {
        e.preventDefault();
        var pointerList = e.getPointerList(e.pointerId);

        // Work-around for getPointerList returning 0 items for mouse MSPointerEvent
        if (e.pointerType === 4) {
            pointerList = Array(e);
        }
        // End of work-around

        if ((e.pointerType === 4) && (e.button === 0)) {
            // We don't need to track mouse unless buttons are pressed
            return;
        }

        for (var i = 0; i < pointerList.length; i++) {
            if (!pointerList[i].pointerId) {
                pointerList[i].pointerId = pointerList[i].identifier;
            }
            GameManager.touchPanel.startPoint[pointerList[i].pointerId] = GameManager.touchPanel.point[pointerList[i].pointerId] = { x: pointerList[i].clientX, y: pointerList[i].clientY };

            // Create touches for each finger, unless already exists
            if (!!!GameManager.touchPanel.touches[pointerList[i].pointerId]) {
                GameManager.touchPanel.touches[pointerList[i].pointerId] = [];
            }

            // Add point to touches, which is a sparse array, where index is touchId.
            GameManager.touchPanel.touches[pointerList[i].pointerId].push(GameManager.touchPanel.point[pointerList[i].pointerId]);
        }


        // Call registered handler in game logic
        GameManager.touchPanel.touchHandler("start", e);
    },

    move: function (e) {
        e.preventDefault();
        var pointerList = e.getPointerList(e.pointerId);

        // Work-around for getPointerList returning 0 items for mouse MSPointerEvent
        if (e.pointerType === 4) {
            pointerList = Array(e);
        }
        // End of work-around

        for (var i = 0; i < pointerList.length; i++) {
            if (!pointerList[i].pointerId) {
                pointerList[i].pointerId = pointerList[i].identifier;
            }

            // Ignore touch objects which are outside of the window
            if ((pointerList[i].clientX >= window.innerWidth) ||
                    (pointerList[i].clientY >= window.innerHeight) ||
                    (pointerList[i].clientX <= 0) ||
                    (pointerList[i].clientY <= 0)) {
                delete GameManager.touchPanel.touches[pointerList[i].pointerId];
                continue;
            }

            if ((pointerList[i].pointerType === 4) && (pointerList[i].button === 0)) {
                // We don't need to track mouse unless buttons are pressed
                // with mouse pointer there is only one object in the touch list
                // so ok to exit without checking next event.
                return;
            }

            // It is possible for touch objects to be added to the list of moved
            // objects before they were reported in pointerDown event.

            if (!!!GameManager.touchPanel.touches[pointerList[i].pointerId]) {
                // We are here because touch point reported as moved
                // before it was reported as touchdown.
                GameManager.touchPanel.touches[pointerList[i].pointerId] = [];
                GameManager.touchPanel.startPoint[pointerList[i].pointerId] = GameManager.touchPanel.point[pointerList[i].pointerId] = { x: pointerList[i].clientX, y: pointerList[i].clientY };
            }

            // This is our new starting point next time
            GameManager.touchPanel.point[pointerList[i].pointerId] = { x: pointerList[i].clientX, y: pointerList[i].clientY };

            // Add point to touches.
            GameManager.touchPanel.touches[pointerList[i].pointerId].push(GameManager.touchPanel.point[pointerList[i].pointerId]);

        }

        // Call registered handler in game logic
        GameManager.touchPanel.touchHandler("move", e);
    },

    end: function (e) {
        var pointerList = e.getPointerList(e.pointerId);

        // Work-around for getPointerList returning 0 items for mouse MSPointerEvent
        if (e.pointerType === 4) {
            pointerList = Array(e);
        }
        // End of work-around

        for (var i = 0; i < pointerList.length; i++) {
            if (!pointerList[i].pointerId) {
                pointerList[i].pointerId = pointerList[i].identifier;
            }

            if (!!!GameManager.touchPanel.touches[pointerList[i].pointerId]) {
                // This is a deleted touch path
                continue;
            }

            delete GameManager.touchPanel.touches[pointerList[i].pointerId];
        }

        // Call registered handler in game logic
        GameManager.touchPanel.touchHandler("end", e);
    },

    cancel: function (e) {
        // When touch is cancelled or finger moved out from the playing area
        // we need remove it from the list of active touches.
        var pointerList = e.getPointerList(e.pointerId);

        // Work-around for getPointerList returning 0 items for mouse MSPointerEvent
        if (e.pointerType === 4) {
            pointerList = Array(e);
        }
        // End of work-around

        for (var i = 0; i < pointerList.length; i++) {
            if (!pointerList[i].pointerId) {
                pointerList[i].pointerId = pointerList[i].identifier;
            }
            delete GameManager.touchPanel.touches[pointerList[i].pointerId];
        }

        // Call registered handler in game logic
        GameManager.touchPanel.touchHandler("cancel", e);
    },

});
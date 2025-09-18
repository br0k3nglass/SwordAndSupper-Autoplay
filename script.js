// ==UserScript==
// @name         SwordAndSupper Autoplay (No Prompt)
// @namespace    http://tampermonkey.net/
// @version      0.0.6
// @description  Automatically clicks through the map with no user prompt
// @author       u/Aizbaer (original), br0k3nglass (mod), rewritten by ChatGPT
// @match        https://*.devvit.net/index.html*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://git.io/waitForKeyElements.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

/* global $ */

(function () {
  'use strict';

  // --- Autoplay Logic ---
  function executeAutoplayScript() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // these functions are part of a setTimeout chain used for opening inventory, selecting a map, and creating/naming a new mission
    function clickInventory() {
      $(".navi-bar").find(".image-icon").last().click();
      setTimeout(goToMapTab, 500);
    }

    function goToMapTab() {
      $(".nav").find(".nav-item")[2].click();
      setTimeout(clickFirstMap, 500);
    }

    function clickFirstMap() {
      $(".equipment-bag").find(".equipment-slot").first().click();
      setTimeout(useMap, 500);
    }

    function useMap() {
      $(".item-modal-actions").find(".actions-button-row").find("button").last().click();
      setTimeout(autoCompleteMap, 500);
    }

    function autoCompleteMap() {
      $(".autocomplete-button").click();
      setTimeout(clickSubmit, 500);
    }

    function clickSubmit() {
      $(".mission-create-submit-button").click();
      setTimeout(pickFood, 500);
    }

    function pickFood() {
      $(".food-choice").first().click();
      setTimeout(nameFood, 500);
    }

    function nameFood() {
      $(".autocomplete-button").click();
      setTimeout(clickSubmitAgain, 500);
    }

    function clickSubmitAgain() {
      $(".mission-create-submit-button").click();
      setTimeout(nameMission, 500);
    }

    function clickSubmitYetAgain() {
      $(".mission-create-submit-button").click();
      setTimeout(nameMission, 500);
    }
    function startMission() {
      // Keep trying until found
      let tryCount = 0;
      const interval = setInterval(() => {
        tryCount++;
        if (ClickStartMission() === false || tryCount >= 12) {
            clearInterval(interval);
        }
      }, 1000);
    }

    function nameMission() {
      const spans = $(".mission-create-summary").eq(1).find("span");
      let stars = 0;
      spans.each((idx, span) => {
        if ($(span).text() === "★" && $(span).css("color") === "rgb(255, 215, 0)") {
          stars++;
        }
      });

      const levelString = $(".mission-create-summary").eq(2).find(".summary-text").text();
      const levels = levelString.replace("Rec. Level: ", "").replace(" ~ ", "-");
      const input = $("input").first();
      const difficulty = stars ? stars + "★" : "BOSS RUSH";
      const map = $(".mission-create-summary").eq(0).find(".summary-text").text();
      const mapname = map.replace("Target: ", "");
      const newTitle = `${levels} | ${difficulty} | ${mapname}`;

      console.log("[Tampermonkey] Generated title:", newTitle);

      const inputElement = input[0];
      if (!inputElement) return;

      inputElement.focus();
      inputElement.select();
      document.execCommand('delete');

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;

      nativeInputValueSetter.call(inputElement, newTitle);

      ['input', 'change', 'keyup', 'blur'].forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        inputElement.dispatchEvent(event);
      });

      console.log("[Tampermonkey] Value after change:", inputElement.value);
      setTimeout(clickSubmitYetAgain, 500);
    }
    // end of setTimeout chain functions

    // haven't tested this yet but it might be useful for clicking the Start Mission button on the reddit page
    function findAndClickStartMission() {
        // Find all potential containers
        $('devvit-post-consume-tracker').each(function() {
            const loader = this.querySelector('shreddit-devvit-ui-loader');
            if (!loader?.shadowRoot) return true; // continue
            
            const surface = loader.shadowRoot.querySelector('devvit-surface');
            if (!surface?.shadowRoot) return true;
            
            const renderer = surface.shadowRoot.querySelector('devvit-blocks-renderer');
            if (!renderer?.shadowRoot) return true;
            
            // Use jQuery in the final shadow root
            const $target = $(renderer.shadowRoot).find('div[style*="3kg6d3isvyre1.png"]');
            
            if ($target.length) {
                $target
                    .css('border', '2px solid green')
                    .click(); // jQuery click
                console.log('Clicked with jQuery!');
                return false; // break the loop
            }
        });
    }

    // the main auto-clicking loop (runs every 1 second)
    function myLoopFunction() {
      const end = $(".overlay-screen.mission-end-screen");
      if (end.length) {
        clearInterval(intervalId);
        $(".continue-button").click();
        $(".dismiss-button").click();
        setTimeout(clickInventory, 500);
      }
      $(".skill-button").click();
      $(".skip-button").click();
      $(".advance-button").click();
    }

    // start the loop
    const intervalId = setInterval(myLoopFunction, 1000);
    console.log("Supper Autoplay Script has been started!");
  }

  // --- Main Logic ---
  function waitForjQueryAndStart() {
    if (typeof $ === "undefined") {
      setTimeout(waitForjQueryAndStart, 100);
      return;
    }
    console.log("[Tampermonkey] jQuery detected — starting autoplay...");
    executeAutoplayScript();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForjQueryAndStart);
  } else {
    waitForjQueryAndStart();
  }

})();

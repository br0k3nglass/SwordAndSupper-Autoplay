// ==UserScript==
// @name         SwordAndSupper Autoplay (selenium helper)
// @namespace    http://tampermonkey.net/
// @version      0.0.7
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
      console.log('Starting startMission...');
      let tryCount = 0;
      const interval = setInterval(() => {
        tryCount++;
        console.log(`Attempt #${tryCount} to find and click Start Mission...`);

        const result = findAndClickStartMission();

        if (result === false) {
            console.log('Success: Start Mission was clicked. Stopping attempts.');
            clearInterval(interval);
        } else if (tryCount >= 12) {
            console.log('Reached maximum attempts (12). Stopping attempts.');
            clearInterval(interval);
        } else {
            console.log('Start Mission not found yet, will retry in 1 second...');
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
        console.log('Starting findAndClickStartMission...');
        
        // Find all potential containers
        $('devvit-post-consume-tracker').each(function(index) {
            console.log(`Checking container #${index}`, this);
            
            const loader = this.querySelector('shreddit-devvit-ui-loader');
            if (!loader?.shadowRoot) {
                console.log('  No loader or shadowRoot found, skipping...');
                return true; // continue
            }
            console.log('  Found loader with shadowRoot', loader);
            
            const surface = loader.shadowRoot.querySelector('devvit-surface');
            if (!surface?.shadowRoot) {
                console.log('  No surface or shadowRoot found, skipping...');
                return true;
            }
            console.log('  Found surface with shadowRoot', surface);
            
            const renderer = surface.shadowRoot.querySelector('devvit-blocks-renderer');
            if (!renderer?.shadowRoot) {
                console.log('  No renderer or shadowRoot found, skipping...');
                return true;
            }
            console.log('  Found renderer with shadowRoot', renderer);
            
            // Use jQuery in the final shadow root
            const $target = $(renderer.shadowRoot).find('div[style*="3kg6d3isvyre1.png"]');
            console.log(`  Found ${$target.length} target(s) in renderer shadowRoot`);
            
            if ($target.length) {
                $target
                    .css('border', '2px solid green')
                    .click(); // jQuery click
                console.log('  Clicked target with jQuery!');
                return false; // break the loop
            } else {
                console.log('  No target found in this renderer.');
            }
        });
        
        console.log('findAndClickStartMission finished.');
    }

    function clickEndMission() {
        const $elements = $(".end-mission-button");
        if ($elements.length === 1) {
          $elements.eq(0).click();//click first (only) one
          console.log("✅ Clicked the first (only) element!");
        } else if ($elements.length >= 2) {
          $elements.eq(1).click();//click the second one
          console.log("✅ Clicked the second element out of", $elements.length);
        } else {
          console.log("⚠️ No matching elements found.");
        }
        
        // Signal Selenium IDE that we're done with this mission
        signalMissionComplete();
        
        setTimeout(clickFirstMission,500)
    }

    // Function to signal mission completion to Selenium IDE
    function signalMissionComplete() {
        // Use localStorage to communicate with Selenium
        localStorage.setItem('tmMissionComplete', 'true');
        localStorage.setItem('tmMissionCompleteTime', new Date().getTime());
        console.log("🚦 Signaled mission completion to Selenium IDE");
    }

    function clickFirstMission() {
        const $div = $(".mission-link-item").first();
        const link = $div.find("a")[0]; //get raw DOM element for clicking
        if (link) {
          link.click();
          console.log("✅ Clicked the link inside the div!");
        } else {
          console.log("⚠️ Div not found!");
        }
    }
      
    // the main auto-clicking loop (runs every 1 second)
    function myLoopFunction() {
      const end = $(".overlay-screen.mission-end-screen");
      if (end.length) {
        clearInterval(intervalId);
        $(".continue-button").click();
        // if you have maps in your inventory there will be two end-mission-buttons, otherwise there will only be one
        setTimeout(clickEndMission,500)
        //setTimeout(startMission, 2500);
      }
      
      // Modified skill button logic to prefer "Refuse" button
      const $skillButtons = $(".skill-button");
      if ($skillButtons.length > 0) {
        let buttonToClick = $skillButtons.first(); // Default to first button
        
        // Look for a button containing "Refuse" text
        $skillButtons.each(function() {
          const buttonText = $(this).text().trim();
          if (buttonText.includes("Refuse")) {
            buttonToClick = $(this);
            console.log("✅ Found and selecting 'Refuse' button");
            return false; // Break out of the each loop
          }
        });
        
        buttonToClick.click();
      }
      
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

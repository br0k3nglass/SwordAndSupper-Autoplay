// ==UserScript==
// @name         SwordAndSupper Autoplay (Dual Mode)
// @namespace    http://tampermonkey.net/
// @version      0.0.8
// @description  Automatically clicks through the map with mode selection
// @author       u/Aizbaer (original), br0k3nglass (mod), combined by ChatGPT
// @match        https://*.devvit.net/index.html*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://git.io/waitForKeyElements.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @downloadURL  https://www.reddit.com/r/SwordAndSupper/comments/1n0iat6/tampermonkey_scripts/
// ==/UserScript==

/* global $ */

(function () {
  'use strict';

  // Global variable to control the script execution
  let isScriptRunning = true;
  let intervalId = null;

  // --- Mode Selection Dialog ---
  function createModeSelectionDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #1a1a1a;
      border-radius: 10px;
      padding: 20px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;

    const title = document.createElement('h2');
    title.textContent = 'Supper Autoplay Script';
    title.style.cssText = `
      margin: 0 0 15px 0;
      font-size: 22px;
      color: #e94560;
    `;

    const question = document.createElement('p');
    question.textContent = 'Select Autoplay Mode:';
    question.style.cssText = `
      margin: 0 0 25px 0;
      font-size: 16px;
      color: #f5f5f5;
      line-height: 1.4;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
      justify-content: center;
    `;

    const newMapButton = document.createElement('button');
    newMapButton.textContent = 'Create New Map (Uses Map Item)';
    newMapButton.style.cssText = `
      background: linear-gradient(135deg, #e94560, #f27121);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(233, 69, 96, 0.3);
    `;
    newMapButton.addEventListener('mouseover', () => {
      newMapButton.style.transform = 'translateY(-2px)';
      newMapButton.style.boxShadow = '0 4px 20px rgba(233, 69, 96, 0.4)';
    });
    newMapButton.addEventListener('mouseout', () => {
      newMapButton.style.transform = 'translateY(0)';
      newMapButton.style.boxShadow = '0 2px 10px rgba(233, 69, 96, 0.3)';
    });

    const playNextButton = document.createElement('button');
    playNextButton.textContent = 'Play Next Map (Uses Play Next Button)';
    playNextButton.style.cssText = `
      background: linear-gradient(135deg, #4e54c8, #8f94fb);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(78, 84, 200, 0.3);
    `;
    playNextButton.addEventListener('mouseover', () => {
      playNextButton.style.transform = 'translateY(-2px)';
      playNextButton.style.boxShadow = '0 4px 20px rgba(78, 84, 200, 0.4)';
    });
    playNextButton.addEventListener('mouseout', () => {
      playNextButton.style.transform = 'translateY(0)';
      playNextButton.style.boxShadow = '0 2px 10px rgba(78, 84, 200, 0.3)';
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
      background: linear-gradient(135deg, #6c757d, #495057);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(108, 117, 125, 0.3);
    `;
    cancelButton.addEventListener('mouseover', () => {
      cancelButton.style.transform = 'translateY(-2px)';
      cancelButton.style.boxShadow = '0 4px 20px rgba(108, 117, 125, 0.4)';
    });
    cancelButton.addEventListener('mouseout', () => {
      cancelButton.style.transform = 'translateY(0)';
      cancelButton.style.boxShadow = '0 2px 10px rgba(108, 117, 125, 0.3)';
    });

    return new Promise((resolve) => {
      newMapButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve('new-map');
      });

      playNextButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve('play-next');
      });

      cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(null);
      });

      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', handleKeydown);
          document.body.removeChild(overlay);
          resolve(null);
        }
      };
      document.addEventListener('keydown', handleKeydown);

      buttonContainer.appendChild(newMapButton);
      buttonContainer.appendChild(playNextButton);
      buttonContainer.appendChild(cancelButton);
      dialog.appendChild(title);
      dialog.appendChild(question);
      dialog.appendChild(buttonContainer);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
  }

  // --- Autoplay Logic ---
  function executeAutoplayScript(mode) {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Functions for new map mode
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

    // Functions for play next mode
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
        setTimeout(clickFirstMission,500)
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
      
      if (mode === 'new-map') {
        setTimeout(clickSubmitYetAgain, 500);
      }
    }

    // Function to handle skill button selection with Refuse preference
    function handleSkillButtons() {
      const skillButtons = $(".skill-button");
      if (skillButtons.length === 0) return false;
      
      // Try to find the "Refuse" button
      const refuseButton = skillButtons.filter((index, element) => {
        return $(element).text().toLowerCase().includes("refuse");
      });
      
      if (refuseButton.length > 0) {
        // Get the alternative option text
        const alternativeOptions = skillButtons.not(refuseButton).map((index, element) => {
          return $(element).text().trim();
        }).get().join(", ");
        
        console.log(`Selected 'Refuse' option. Alternative(s) not selected: ${alternativeOptions}`);
        refuseButton.click();
        return true;
      } else {
        // If no "Refuse" button found, click the first one
        console.log("No 'Refuse' option found. Clicking the first skill button.");
        skillButtons.first().click();
        return true;
      }
    }

    // the main auto-clicking loop (runs every 1 second)
    function myLoopFunction() {
      if (!isScriptRunning) {
        clearInterval(intervalId);
        console.log("Script execution stopped by user.");
        return;
      }
      
      const end = $(".overlay-screen.mission-end-screen");
      
      if (end.length) {
        clearInterval(intervalId);
        $(".continue-button").click();
        
        if (mode === 'new-map') {
          $(".dismiss-button").click();
          setTimeout(clickInventory, 500);
        } else if (mode === 'play-next') {
          setTimeout(clickEndMission, 500);
          setTimeout(startMission, 2500);
        }
        
        // Restart the interval after handling the end screen
        intervalId = setInterval(myLoopFunction, 1000);
        return;
      }
      
      // Handle skill buttons with Refuse preference
      const skillButtonClicked = handleSkillButtons();
      
      // If no skill button was clicked, proceed with other buttons
      if (!skillButtonClicked) {
        $(".skip-button").click();
        $(".advance-button").click();
      }
    }

    // Add escape key listener to stop the script
    function handleEscapeKey(e) {
      if (e.key === "Escape") {
        isScriptRunning = false;
        document.removeEventListener("keydown", handleEscapeKey);
        console.log("Escape key pressed. Script will stop after current iteration.");
      }
    }
    
    document.addEventListener("keydown", handleEscapeKey);
    
    // start the loop
    intervalId = setInterval(myLoopFunction, 1000);
    console.log(`Supper Autoplay Script has been started in ${mode} mode!`);
    console.log("Press Escape key to stop the script.");
  }

  // --- Main Logic ---
  async function main() {
    if (typeof $ === "undefined") {
      setTimeout(main, 100);
      return;
    }
    
    const selectedMode = await createModeSelectionDialog();
    
    if (selectedMode) {
      console.log(`Autoplay Script is started in ${selectedMode} mode...`);
      executeAutoplayScript(selectedMode);
    } else {
      console.log("Autoplay Script has been canceled by the user.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

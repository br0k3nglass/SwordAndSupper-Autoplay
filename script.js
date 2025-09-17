// ==UserScript==
// @name         SwordAndSupper Autoplay
// @namespace    http://tampermonkey.net/
// @version      0.0.5
// @description  Automatically clicks through the map with a start/cancel prompt
// @author       u/Aizbaer (original author), br0k3nglass (updated code)
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

  // --- Confirmation Dialog ---
  function createConfirmDialog() {
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
      max-width: 400px;
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
    question.textContent = 'Start Autoplay script?';
    question.style.cssText = `
      margin: 0 0 25px 0;
      font-size: 16px;
      color: #f5f5f5;
      line-height: 1.4;
    `;

    const warning = document.createElement('p');
    warning.textContent = 'The script will automatically click the first button on each screen and open a new map after finishing.';
    warning.style.cssText = `
      margin: 0 0 25px 0;
      font-size: 14px;
      color: #ffa500;
      font-style: italic;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 20px;
      justify-content: center;
    `;

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Start that map!';
    yesButton.style.cssText = `
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
    yesButton.addEventListener('mouseover', () => {
      yesButton.style.transform = 'translateY(-2px)';
      yesButton.style.boxShadow = '0 4px 20px rgba(233, 69, 96, 0.4)';
    });
    yesButton.addEventListener('mouseout', () => {
      yesButton.style.transform = 'translateY(0)';
      yesButton.style.boxShadow = '0 2px 10px rgba(233, 69, 96, 0.3)';
    });

    const noButton = document.createElement('button');
    noButton.textContent = 'Wait, I have to crosspost this first';
    noButton.style.cssText = `
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
    noButton.addEventListener('mouseover', () => {
      noButton.style.transform = 'translateY(-2px)';
      noButton.style.boxShadow = '0 4px 20px rgba(108, 117, 125, 0.4)';
    });
    noButton.addEventListener('mouseout', () => {
      noButton.style.transform = 'translateY(0)';
      noButton.style.boxShadow = '0 2px 10px rgba(108, 117, 125, 0.3)';
    });

    return new Promise((resolve) => {
      yesButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(true);
      });

      noButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(false);
      });

      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', handleKeydown);
          document.body.removeChild(overlay);
          resolve(false);
        }
      };
      document.addEventListener('keydown', handleKeydown);

      buttonContainer.appendChild(yesButton);
      buttonContainer.appendChild(noButton);
      dialog.appendChild(title);
      dialog.appendChild(question);
      dialog.appendChild(warning);
      dialog.appendChild(buttonContainer);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    });
  }

  // --- Autoplay Logic ---
  function executeAutoplayScript() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    }

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

    const intervalId = setInterval(myLoopFunction, 1000);
    console.log("Supper Autoplay Script has been started!");
  }

  // --- Main Logic ---
  async function main() {
    if (typeof $ === "undefined") {
      setTimeout(main, 100);
      return;
    }
    const userConfirmed = await createConfirmDialog();
    if (userConfirmed) {
      console.log("Autoplay Script is started...");
      executeAutoplayScript();
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

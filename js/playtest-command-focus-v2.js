(function initializeProjectStackCommandConsoleFocusV2() {
  "use strict";

  const COMMAND_INPUT_ID = "playtest-command-input";
  const COMMENT_COMMAND_INPUT_ID = "playtest-comment-command-input";
  const COMMAND_INPUT_HINT_PATTERN = /\b(command|console|instruction)\b/i;
  const DRAW_COMMAND_PATTERN = /^\s*draw(?:\s|$)/i;

  function isTextEntryControl(control) {
    return control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement;
  } // end isTextEntryControl function

  function describeControl(control) {
    return [
      control.id,
      control.name,
      control.getAttribute("aria-label"),
      control.getAttribute("placeholder"),
      control.getAttribute("title")
    ].filter(Boolean).join(" ");
  } // end describeControl function

  function isPlaytestCommandInput(control) {
    if (!isTextEntryControl(control) || control.id === COMMENT_COMMAND_INPUT_ID) {
      return false;
    } // end non-command-control guard

    return control.id === COMMAND_INPUT_ID || COMMAND_INPUT_HINT_PATTERN.test(describeControl(control));
  } // end isPlaytestCommandInput function

  function normalizeDamageAlias(commandText) {
    const source = String(commandText || "");
    const targetPattern = "(?:(?:friendly|friend|enemy)\\s*\\d+|[fe]\\s*(?:\\d+|\\*))";
    const spacedAliasPattern = new RegExp(`^(\\s*${targetPattern}\\s+)(?:dmg|d)(?=\\s|$)`, "i");
    const dottedAliasPattern = new RegExp(`^(\\s*${targetPattern}\\s*\\.\\s*)(?:dmg|d)(?=\\s|$)`, "i");

    return source
      .replace(spacedAliasPattern, "$1damage")
      .replace(dottedAliasPattern, "$1damage");
  } // end normalizeDamageAlias function

  function isDrawCommand(commandText) {
    return DRAW_COMMAND_PATTERN.test(String(commandText || ""));
  } // end isDrawCommand function

  function findEquivalentCommandControl(originalControl) {
    if (originalControl && originalControl.id) {
      const byId = document.getElementById(originalControl.id);
      if (isPlaytestCommandInput(byId)) {
        return byId;
      } // end matching-id branch
    } // end original-id branch

    return Array.from(document.querySelectorAll("input, textarea")).find(isPlaytestCommandInput) || null;
  } // end findEquivalentCommandControl function

  function restoreCommandFocusAfterCurrentEvent(originalControl) {
    window.setTimeout(function beginCommandFocusRestore() {
      window.requestAnimationFrame(function waitForFirstRenderFrame() {
        window.requestAnimationFrame(function waitForSecondRenderFrame() {
          const replacementControl = findEquivalentCommandControl(originalControl);
          if (replacementControl) {
            replacementControl.focus();
            replacementControl.select();
          } // end replacement-control branch
        }); // end second-render callback
      }); // end first-render callback
    }, 0); // end command-focus timeout callback
  } // end restoreCommandFocusAfterCurrentEvent function

  function prepareCommandForSubmission(control) {
    if (!isPlaytestCommandInput(control)) {
      return;
    } // end non-command-input guard

    const normalizedCommand = normalizeDamageAlias(control.value);
    if (control.value !== normalizedCommand) {
      control.value = normalizedCommand;
    } // end alias-normalization branch

    if (!isDrawCommand(normalizedCommand)) {
      restoreCommandFocusAfterCurrentEvent(control);
    } // end non-draw-focus-restore branch
  } // end prepareCommandForSubmission function

  function findCommandInputForButton(button) {
    const formControls = button && button.form
      ? Array.from(button.form.querySelectorAll("input, textarea"))
      : [];
    const formCommandInput = formControls.find(isPlaytestCommandInput);
    if (formCommandInput) {
      return formCommandInput;
    } // end form-command-input branch

    if (isPlaytestCommandInput(document.activeElement)) {
      return document.activeElement;
    } // end active-command-input branch

    return Array.from(document.querySelectorAll("input, textarea")).find(isPlaytestCommandInput) || null;
  } // end findCommandInputForButton function

  document.addEventListener("keydown", function prepareCommandAliasesOnEnter(event) {
    if (event.key !== "Enter" || event.defaultPrevented) {
      return;
    } // end irrelevant-key guard

    prepareCommandForSubmission(event.target);
  }, true); // end command-keydown capture listener

  document.addEventListener("click", function prepareCommandAliasesOnClick(event) {
    const button = event.target instanceof Element
      ? event.target.closest("button, input[type='button'], input[type='submit']")
      : null;
    if (!button) {
      return;
    } // end unrelated-click guard

    prepareCommandForSubmission(findCommandInputForButton(button));
  }, true); // end command-click capture listener
}()); // end initializeProjectStackCommandConsoleFocusV2 IIFE

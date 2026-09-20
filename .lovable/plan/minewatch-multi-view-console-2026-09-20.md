# MineWatch multi-view console

## Goal
Reorganize the existing civic dashboard into three focused, animated tabs while preserving its shared district state, visual language, and engineering overlay.

## Changes
- Replace the crowded single view with a polished tab bar for District Dashboard, Citizen Reporting, and Legislative Hub.
- Keep the MineWatch identity and global Developer Architecture View control in the shared header; show structural labels within every active view.
- Make District Dashboard the analytical workspace: shared ZIP selector, risk dial and trend chart, property metrics, depth-based groundwater simulation (+9 / +16 / +2), alert, and print action.
- Make Citizen Reporting a dedicated validated form with observation type, street address, description, success confirmation, and two sample community dispatches.
- Make Legislative Hub a policy workspace containing the legislative feed and ZIP-tailored action protocol with official MSI links.
- Preserve the active ZIP across tabs, add restrained view transitions, and keep mobile layouts readable.
- Update print styling so exporting from the dashboard produces the analytical briefing rather than hidden or unrelated tab content.

## Validation
- Check all three tabs, shared ZIP state, engineering labels, groundwater score changes, form validation/toast, and print visibility.
- Verify desktop and mobile layouts and confirm the preview builds without errors.

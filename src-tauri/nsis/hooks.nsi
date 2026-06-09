; Tauri NSIS installer hooks
; Runs at installer startup — prompts the user if the app is already installed.

!macro customInit
  ; Check whether the app is already installed (user-level uninstall key)
  ReadRegStr $R0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Rift Launcher" "DisplayName"
  ${If} $R0 == ""
    ; Also check machine-wide install
    ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Rift Launcher" "DisplayName"
  ${EndIf}
  ${If} $R0 != ""
    MessageBox MB_YESNO|MB_ICONQUESTION "Rift Launcher is already installed.$\n$\nThis installer will update it to a newer version.$\n$\nDo you want to proceed?" IDYES +2
    Abort
  ${EndIf}
!macroend

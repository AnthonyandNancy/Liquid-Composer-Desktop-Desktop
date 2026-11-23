; Electron 44 requires ALL APPLICATION PACKAGES to be able to read the
; install directory; electron-builder's per-user NSIS ACL omits that ACE.
!macro customInstall
  nsExec::ExecToLog 'icacls "$INSTDIR" /grant *S-1-15-2-1:(OI)(CI)(RX)'
!macroend

const {
  contextBridge,
  ipcRenderer,
} = require("electron");


contextBridge.exposeInMainWorld(
  "electronAPI",
  {

    // =============================
    // MINIMIZE
    // =============================

    minimizeToMini: () => {

      ipcRenderer.send(
        "window-minimize-mini"
      );

    },


    // =============================
    // RESTORE
    // =============================

    restoreWindow: () => {

      ipcRenderer.send(
        "window-restore"
      );

    },


    // =============================
    // CLOSE
    // =============================

    closeWindow: () => {

      ipcRenderer.send(
        "window-close"
      );

    },


    // =============================
    // MINI MODE EVENT
    // =============================

    onMiniMode: (callback) => {

      ipcRenderer.on(
        "show-mini-mode",
        callback
      );

    },


    // =============================
    // NORMAL MODE EVENT
    // =============================

    onNormalMode: (callback) => {

      ipcRenderer.on(
        "show-normal-mode",
        callback
      );

    },


    // =============================
    // MOVE MINI WINDOW
    // =============================

    moveMiniWindow: (
      deltaX,
      deltaY
    ) => {

      ipcRenderer.send(
        "move-mini-window",
        {
          deltaX,
          deltaY,
        }
      );

    },

  }
);
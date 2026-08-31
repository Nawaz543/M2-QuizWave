const {
  app,
  BrowserWindow,
  WebContentsView,
  ipcMain,
  clipboard,
} = require("electron");

const path = require("path");

let mainWindow = null;
let titleBarView = null;
let reactView = null;

let normalBounds = null;

// Normal / expanded window ki last position
let normalPosition = null;

// Mini window ki last position
let miniPosition = null;

let isMiniMode = false;


// =================================
// WINDOW SIZE
// =================================

const REACT_WIDTH = 450;
const REACT_HEIGHT = 450;

const TITLEBAR_HEIGHT = 36;

// =================================
// EXPANDED WINDOW SIZE - WINDOW 5
// =================================
const EXPANDED_WIDTH = 700;
const EXPANDED_HEIGHT = 700;

const NORMAL_WIDTH = REACT_WIDTH;
const NORMAL_HEIGHT =
  REACT_HEIGHT + TITLEBAR_HEIGHT;

const MINI_WIDTH = 46;
const MINI_HEIGHT = 52;


// =================================
// CREATE WINDOW
// =================================

function createWindow() {

  mainWindow = new BrowserWindow({

    // ===============================
    // NORMAL WINDOW SIZE
    // ===============================

    width: NORMAL_WIDTH,
    height: NORMAL_HEIGHT,

    // ===============================
    // SIZE LIMITS
    // ===============================

    minWidth: MINI_WIDTH,
    minHeight: MINI_HEIGHT,

    maxWidth: NORMAL_WIDTH,
    maxHeight: NORMAL_HEIGHT,

    // ===============================
    // IMPORTANT
    // ===============================

    resizable: false,

    frame: false,

    alwaysOnTop: true,

    backgroundColor: "#0b0f19",

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // =================================
// SAVE WINDOW POSITION
// =================================

mainWindow.on("move", () => {

  if (!mainWindow) {
    return;
  }

  const [x, y] = mainWindow.getPosition();

  // ===============================
  // MINI MODE POSITION
  // ===============================

  if (isMiniMode) {

    miniPosition = {
      x,
      y,
    };

    return;
  }

  // ===============================
  // NORMAL / EXPANDED POSITION
  // ===============================

  normalPosition = {
    x,
    y,
  };

});


  mainWindow.setAlwaysOnTop(true, "screen-saver");
mainWindow.setVisibleOnAllWorkspaces(true);


  // =================================
  // TITLE BAR VIEW
  // =================================

  titleBarView = new WebContentsView({

    webPreferences: {

      preload: path.join(
        __dirname,
        "preload.js"
      ),

      contextIsolation: true,

      nodeIntegration: false,
    },

  });


  // =================================
  // REACT VIEW
  // =================================

  reactView = new WebContentsView({

  webPreferences: {

    preload: path.join(
      __dirname,
      "preload.js"
    ),

    contextIsolation: true,

    nodeIntegration: false,

  },

});


  // =================================
  // ADD VIEWS
  // =================================

  mainWindow.contentView.addChildView(
    titleBarView
  );

  mainWindow.contentView.addChildView(
    reactView
  );


  // =================================
  // NORMAL TITLE BAR
  // =================================

  titleBarView.setBounds({

    x: 0,
    y: 0,

    width: NORMAL_WIDTH,
    height: TITLEBAR_HEIGHT,

  });


  // =================================
  // NORMAL REACT VIEW
  // =================================

  reactView.setBounds({

    x: 0,
    y: TITLEBAR_HEIGHT,

    width: REACT_WIDTH,
    height: REACT_HEIGHT,

  });


  // =================================
  // LOAD TITLE BAR
  // =================================

  titleBarView.webContents.loadFile(

    path.join(
      __dirname,
      "titlebar",
      "titlebar.html"
    )

  );


  // =================================
  // TITLEBAR CONSOLE
  // =================================

  titleBarView.webContents.on(
    "console-message",
    (event, level, message) => {

      console.log(
        "TITLEBAR:",
        message
      );

    }
  );


  // =================================
  // LOAD REACT APP
  // =================================

  reactView.webContents.loadURL(
    "http://localhost:5173"
  );


  // =================================
  // WINDOW CLOSED
  // =================================

  mainWindow.on(
    "closed",
    () => {

      mainWindow = null;

      titleBarView = null;

      reactView = null;

      normalBounds = null;
      normalPosition = null;

      miniPosition = null;

      isMiniMode = false;

    }
  );

}


// =================================
// RESTORE MINI WINDOW
// =================================

function restoreMiniWindow() {

  console.log(
    "RESTORE MINI WINDOW"
  );


  if (
    !mainWindow ||
    !isMiniMode
  ) {
    return;
  }


  // =================================
  // MINI MODE OFF
  // =================================

  isMiniMode = false;


  // =================================
  // ALLOW NORMAL SIZE
  // =================================

  mainWindow.setMinimumSize(
    MINI_WIDTH,
    MINI_HEIGHT
  );

  mainWindow.setMaximumSize(
    NORMAL_WIDTH,
    NORMAL_HEIGHT
  );


  // =================================
  // RESTORE ORIGINAL WINDOW
  // =================================

  if (normalPosition) {

  mainWindow.setPosition(
    normalPosition.x,
    normalPosition.y
  );

  mainWindow.setSize(
    NORMAL_WIDTH,
    NORMAL_HEIGHT
  );

} else if (normalBounds) {

  mainWindow.setBounds({

    x: normalBounds.x,
    y: normalBounds.y,

    width: NORMAL_WIDTH,
    height: NORMAL_HEIGHT,

  });

} else {

  mainWindow.setSize(
    NORMAL_WIDTH,
    NORMAL_HEIGHT
  );

} 


  // =================================
  // RESTORE TITLE BAR
  // =================================

  titleBarView.setBounds({

    x: 0,
    y: 0,

    width: NORMAL_WIDTH,
    height: TITLEBAR_HEIGHT,

  });


  // =================================
  // RESTORE REACT VIEW
  // =================================

  mainWindow.contentView.addChildView(
    reactView
  );


  reactView.setBounds({

    x: 0,
    y: TITLEBAR_HEIGHT,

    width: REACT_WIDTH,
    height: REACT_HEIGHT,

  });


  // =================================
  // SHOW NORMAL TITLE BAR
  // =================================

  titleBarView.webContents.send(
    "show-normal-mode"
  );


  console.log(
    "RESTORED WINDOW BOUNDS:",
    mainWindow.getBounds()
  );

}


// // =================================
// // MINI CLICK DETECTION
// // =================================

// let miniMouseDown = false;

// let miniMouseDownTime = 0;


// // =================================
// // TITLEBAR INPUT EVENTS
// // =================================

// function setupMiniClickDetection() {

//   titleBarView.webContents.on(
//     "before-input-event",
//     (event, input) => {

//       // ===============================
//       // ONLY MINI MODE
//       // ===============================

//       if (!isMiniMode) {
//         return;
//       }


//       // ===============================
//       // MOUSE DOWN
//       // ===============================

//       if (
//         input.type === "mouseDown" &&
//         input.button === "left"
//       ) {

//         miniMouseDown = true;

//         miniMouseDownTime =
//           Date.now();

//         return;
//       }


//       // ===============================
//       // MOUSE UP
//       // ===============================

//       if (
//         input.type === "mouseUp" &&
//         input.button === "left"
//       ) {

//         if (!miniMouseDown) {
//           return;
//         }


//         const clickDuration =
//           Date.now() -
//           miniMouseDownTime;


//         miniMouseDown = false;


//         // =============================
//         // QUICK CLICK = RESTORE
//         // =============================

//         if (
//           clickDuration < 500 &&
//           mainWindow &&
//           isMiniMode
//         ) {

//           restoreMiniWindow();

//         }

//       }

//     }
//   );

// }



// =================================
// MINIMIZE → 40 × 40 MINI LOGO
// =================================

ipcMain.on(
  "window-minimize-mini",
  () => {

    console.log(
      "MINIMIZE IPC RECEIVED"
    );


    // =================================
    // SAFETY
    // =================================

    if (
      !mainWindow ||
      isMiniMode
    ) {
      return;
    }


  // =================================
// SAVE NORMAL WINDOW STATE
// =================================

normalBounds = mainWindow.getBounds();

normalPosition = {
  x: normalBounds.x,
  y: normalBounds.y,
};

console.log(
  "NORMAL WINDOW POSITION SAVED:",
  normalPosition
);


    console.log(
      "NORMAL WINDOW BOUNDS:",
      normalBounds
    );


    // =================================
    // MINI MODE ON
    // =================================

    isMiniMode = true;


    // =================================
    // RESET MINI CLICK STATE
    // =================================

    miniMouseDown = false;

    miniMouseDownTime = 0;
    miniMouseMoved = false;
miniRestoreTimer = null;


    // =================================
    // HARD DISABLE RESIZE
    // =================================

    mainWindow.setResizable(
      false
    );


    // =================================
    // MINI SIZE LIMIT
    // =================================

    mainWindow.setMinimumSize(
      MINI_WIDTH,
      MINI_HEIGHT
    );

    mainWindow.setMaximumSize(
      MINI_WIDTH,
      MINI_HEIGHT
    );


    // =================================
    // REMOVE REACT VIEW
    // =================================

    if (reactView) {

      mainWindow.contentView
        .removeChildView(
          reactView
        );

    }


  // =================================
// MINI WINDOW POSITION
// =================================

// Agar mini position pehle save hai
// to wahi use karo.
// First time mini karne par normal
// position use hogi.

const miniX =
  miniPosition
    ? miniPosition.x
    : normalPosition
      ? normalPosition.x
      : mainWindow.getPosition()[0];

const miniY =
  miniPosition
    ? miniPosition.y
    : normalPosition
      ? normalPosition.y
      : mainWindow.getPosition()[1];


// =================================
// FORCE EXACT MINI SIZE
// =================================

mainWindow.setSize(
  MINI_WIDTH,
  MINI_HEIGHT
);


// =================================
// RESTORE LAST MINI POSITION
// =================================

mainWindow.setPosition(
  miniX,
  miniY
);


// =================================
// SAVE MINI POSITION
// =================================

miniPosition = {
  x: miniX,
  y: miniY,
};


    // =================================
    // MINI TITLEBAR VIEW
    // =================================

    titleBarView.setBounds({

      x: 0,
      y: 0,

      width: MINI_WIDTH,
      height: MINI_HEIGHT,

    });


    // =================================
    // SHOW MINI LOGO
    // =================================

    titleBarView.webContents.send(
      "show-mini-mode"
    );


    console.log(
      "MINI WINDOW BOUNDS:",
      mainWindow.getBounds()
    );

  }
);


// =================================
// RESTORE FROM 40 × 40
// =================================

ipcMain.on(
  "window-restore",
  () => {

    console.log(
      "RESTORE IPC RECEIVED"
    );

    restoreMiniWindow();

  }
);


// =================================
// WINDOW 5 - EXPAND
// =================================

ipcMain.on(
  "window5-expand",
  () => {

    console.log(
      "WINDOW 5 EXPAND IPC RECEIVED"
    );

    // =================================
    // SAFETY
    // =================================

    if (
      !mainWindow ||
      isMiniMode
    ) {
      return;
    }

    // =================================
    // ALLOW EXPANDED SIZE
    // =================================

    mainWindow.setMinimumSize(
      MINI_WIDTH,
      MINI_HEIGHT
    );

    mainWindow.setMaximumSize(
      EXPANDED_WIDTH,
      EXPANDED_HEIGHT
    );

    // =================================
    // RESIZABLE OFF
    // =================================

    mainWindow.setResizable(false);

    // =================================
    // GET CURRENT POSITION
    // =================================

    const [
      currentX,
      currentY,
    ] = mainWindow.getPosition();

    // =================================
    // SET 700 × 700
    // =================================

    mainWindow.setBounds({
      x: currentX,
      y: currentY,
      width: EXPANDED_WIDTH,
      height: EXPANDED_HEIGHT,
    });

    // =================================
    // TITLE BAR
    // =================================

    titleBarView.setBounds({

      x: 0,
      y: 0,

      width: EXPANDED_WIDTH,
      height: TITLEBAR_HEIGHT,

    });

    // =================================
    // REACT VIEW
    // =================================

    reactView.setBounds({

      x: 0,
      y: TITLEBAR_HEIGHT,

      width: EXPANDED_WIDTH,
      height:
        EXPANDED_HEIGHT -
        TITLEBAR_HEIGHT,

    });

    console.log(
      "WINDOW 5 EXPANDED:",
      mainWindow.getBounds()
    );

  }
);


// =================================
// WINDOW 5 - RESTORE
// =================================

ipcMain.on(
  "window5-restore",
  () => {

    console.log(
      "WINDOW 5 RESTORE IPC RECEIVED"
    );

    // =================================
    // SAFETY
    // =================================

    if (
      !mainWindow ||
      isMiniMode
    ) {
      return;
    }

    // =================================
    // RESTORE SIZE LIMIT
    // =================================

    mainWindow.setMinimumSize(
      MINI_WIDTH,
      MINI_HEIGHT
    );

    mainWindow.setMaximumSize(
      NORMAL_WIDTH,
      NORMAL_HEIGHT
    );

    // =================================
    // GET CURRENT POSITION
    // =================================

    const [
      currentX,
      currentY,
    ] = mainWindow.getPosition();

    // =================================
    // RESTORE 450 × 486
    // =================================

    mainWindow.setBounds({

      x: currentX,
      y: currentY,

      width: NORMAL_WIDTH,
      height: NORMAL_HEIGHT,

    });

    // =================================
    // TITLE BAR
    // =================================

    titleBarView.setBounds({

      x: 0,
      y: 0,

      width: NORMAL_WIDTH,
      height: TITLEBAR_HEIGHT,

    });

    // =================================
    // REACT VIEW
    // =================================

    reactView.setBounds({

      x: 0,
      y: TITLEBAR_HEIGHT,

      width: REACT_WIDTH,
      height: REACT_HEIGHT,

    });

    console.log(
      "WINDOW 5 RESTORED:",
      mainWindow.getBounds()
    );

  }
);

// =================================
// MOVE MINI WINDOW
// =================================

ipcMain.on(
  "move-mini-window",
  (
    event,
    {
      deltaX,
      deltaY,
    }
  ) => {

    // =================================
    // SAFETY
    // =================================

    if (
      !mainWindow ||
      !isMiniMode
    ) {
      return;
    }


    // =================================
    // CURRENT POSITION
    // =================================

    const [
      currentX,
      currentY,
    ] = mainWindow.getPosition();


    // =================================
    // MOVE ONLY
    // =================================

    mainWindow.setPosition(
      Math.round(
        currentX + deltaX
      ),
      Math.round(
        currentY + deltaY
      )
    );

  }
);


// =================================
// GET MINI WINDOW POSITION
// =================================

ipcMain.on(
  "get-mini-window-position",
  (event) => {

    if (!mainWindow) {
      return;
    }

    const [
      x,
      y,
    ] = mainWindow.getPosition();

    event.sender.send(
      "mini-window-position",
      {
        x,
        y,
      }
    );

  }
);


// =================================
// MOVE MINI WINDOW ABSOLUTE
// =================================

ipcMain.on(
  "move-mini-window-absolute",
  (
    event,
    {
      x,
      y,
    }
  ) => {

    // =================================
    // SAFETY
    // =================================

    if (
      !mainWindow ||
      !isMiniMode
    ) {
      return;
    }


    // =================================
    // MOVE ONLY
    // =================================

    mainWindow.setPosition(
      Math.round(x),
      Math.round(y)
    );

  }
);


// =================================
// CLOSE WINDOW
// =================================

ipcMain.on(
  "window-close",
  () => {

    console.log(
      "CLOSE IPC RECEIVED"
    );


    if (mainWindow) {

      mainWindow.close();

    }

  }
);


// =================================
// APP READY
// =================================

app.whenReady().then(
  () => {

    createWindow();

    // =================================
    // SETUP MINI CLICK DETECTION
    // =================================



    app.on(
      "activate",
      () => {

        if (
          BrowserWindow
            .getAllWindows()
            .length === 0
        ) {

          createWindow();

        }

      }
    );

  }
);


// =================================
// ALL WINDOWS CLOSED
// =================================

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !== "darwin"
    ) {

      app.quit();

    }

  }
);

ipcMain.handle("read-clipboard", () => {
  return clipboard.readText();
});
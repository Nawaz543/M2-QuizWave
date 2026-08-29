const minimizeBtn =
  document.getElementById(
    "minimizeBtn"
  );

const closeBtn =
  document.getElementById(
    "closeBtn"
  );
  const miniContainer =
  document.getElementById("miniContainer");

const miniLogo =
  document.getElementById(
    "miniLogo"
  );
  const restore =
  document.getElementById(
    "restore"
  );

const titlebar =
  document.getElementById(
    "titlebar"
  );


console.log(
  "TITLEBAR JS LOADED"
);


// =================================
// MINIMIZE
// =================================

minimizeBtn.addEventListener(
  "click",
  (event) => {

    event.preventDefault();
    event.stopPropagation();

    console.log(
      "MINIMIZE CLICKED"
    );

    window.electronAPI
      .minimizeToMini();

  }
);


// =================================
// CLOSE
// =================================

closeBtn.addEventListener(
  "click",
  (event) => {

    event.preventDefault();
    event.stopPropagation();

    console.log(
      "CLOSE CLICKED"
    );

    window.electronAPI
      .closeWindow();

  }
);


// =================================
// MINI MODE
// =================================

window.electronAPI.onMiniMode(
  () => {

    console.log(
      "MINI MODE"
    );

    titlebar.style.display =
      "none";

    miniContainer.style.display = "block";

  }
);


// =================================
// NORMAL MODE
// =================================

window.electronAPI.onNormalMode(
  () => {

    console.log(
      "NORMAL MODE"
    );

    miniContainer.style.display = "none";

    titlebar.style.display =
      "flex";

  }
);

if (restore) {

  restore.addEventListener(
    "click",
    () => {

      console.log(
        "MINI LOGO CLICKED"
      );

      if (
        window.electronAPI &&
        window.electronAPI.restoreWindow
      ) {

        window.electronAPI.restoreWindow();

      }

    }
  );

}


// =================================
// MINI LOGO DRAG + CLICK
// =================================

// let isDragging = false;

// let hasMoved = false;

// let startX = 0;
// let startY = 0;


// // =================================
// // MOUSE DOWN
// // =================================

// miniLogo.addEventListener(
//   "mousedown",
//   (event) => {

//     event.preventDefault();
//     event.stopPropagation();

//     isDragging = true;

//     hasMoved = false;

//     startX = event.screenX;
//     startY = event.screenY;

//   }
// );


// // =================================
// // MOUSE MOVE
// // =================================

// document.addEventListener(
//   "mousemove",
//   (event) => {

//     if (!isDragging) {
//       return;
//     }


//     // ===============================
//     // SCREEN COORDINATES
//     // ===============================

//     const currentX =
//       event.screenX;

//     const currentY =
//       event.screenY;


//     // ===============================
//     // CALCULATE DELTA
//     // ===============================

//     const deltaX =
//       currentX - startX;

//     const deltaY =
//       currentY - startY;


//     // ===============================
//     // CHECK REAL MOVEMENT
//     // ===============================

//     if (
//       Math.abs(deltaX) > 1 ||
//       Math.abs(deltaY) > 1
//     ) {

//       hasMoved = true;

//     }


//     // ===============================
//     // MOVE WINDOW
//     // ===============================

//     if (hasMoved) {

//       window.electronAPI
//         .moveMiniWindow(
//           deltaX,
//           deltaY
//         );


//       // =============================
//       // UPDATE DRAG START POSITION
//       // =============================

//       startX = currentX;
//       startY = currentY;

//     }

//   }
// );


// // =================================
// // MOUSE UP
// // =================================

// document.addEventListener(
//   "mouseup",
//   () => {

//     if (!isDragging) {
//       return;
//     }


//     isDragging = false;


//     // ===============================
//     // CLICK = RESTORE
//     // ===============================

//     if (!hasMoved) {

//       console.log(
//         "MINI LOGO CLICKED"
//       );

//       window.electronAPI
//         .restoreWindow();

//     }

//   }
// );

// =================================
// MINI LOGO CLICK → RESTORE
// =================================

// miniLogo.addEventListener(
//   "dblclick",
//   (event) => {

//     event.preventDefault();
//     event.stopPropagation();

//     console.log(
//       "MINI LOGO DOUBLE CLICKED"
//     );

//     window.electronAPI
//       .restoreWindow();

//   }
// );


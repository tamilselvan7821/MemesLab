  let canvas,ctx;
  let currentImage=null;
  let textX=50,textY=50;
  let dragging = false;
  let pointerOffsetX = 0, pointerOffsetY = 0;

  //intial position to add images and addtoinal settings
$(document).ready(function () {
    fetchHPCharacters();
    setPlus();
    setupUpload();
    setupEditor();
});

//all images add json into html page
function fetchHPCharacters() {
  fetch('memes.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    const container = $("#boxes");
    data.images.forEach(img => {
      const imageElement = $("<img>");
      imageElement.attr("src", img.url);
      imageElement.attr("alt", img.name);
      imageElement.on("click",()=>openEditor(img.url));
      container.append(imageElement);
    });
    lastImage();
  })
  .catch(error => console.error("Error loading JSON:", error));
}

//if you add image extend the grid store and move plus symbol
function setPlus(){
  $("#uploadImage").on("change",function (){
    const file=this.files[0];
    const url=URL.createObjectURL(file);
    const newImg=$("<img>")
    .attr("src",url);
    newImg.on("click",()=>openEditor(url));
    $(".plus").before(newImg);
  });
}
//add system to files 
function lastImage(){
  const grid = $("#boxes");
  const plusTile = $('<div class="plus">+</div>');
  plusTile.on("click", function () {
    $("#uploadImage").click(); 
  });
  grid.append(plusTile);
}
// Upload image
function setupUpload() {
  $("#uploadImage").on("change", function () {
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    openEditor(url);
  });
}

// Setup Editor
function setupEditor() {
  canvas = document.getElementById("imageHolder");
  ctx = canvas.getContext("2d");

  $("#memeText, #fontSize, #fontColor").on("input", draw);
  $("#save").on("click", saveMeme);

  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("mousemove", dragText);
  window.addEventListener("mouseup", stopDrag);
  canvas.addEventListener("mousemove", updateCursor);
}

// Open selected image
function openEditor(url) {
  currentImage = new Image();
  currentImage.crossOrigin = "anonymous"; 
  currentImage.src = url;
  currentImage.onload = draw;
}

// Mouse position
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// Drag start
function startDrag(e) {
  if (!currentImage) return;

  const pos = getMousePos(e);
  ctx.font = `${$("#fontSize").val()}px 'Anton'`;
  const text = $("#memeText").val();
  const width = ctx.measureText(text).width;
  const height = parseInt($("#fontSize").val());

  if (pos.x >= textX && pos.x <= textX + width &&
      pos.y >= textY && pos.y <= textY + height) {
    dragging = true;
    pointerOffsetX = pos.x - textX;
    pointerOffsetY = pos.y - textY;
  }
}

// Dragging
function dragText(e) {
  if (!dragging) return;

  const pos = getMousePos(e);
  textX = pos.x - pointerOffsetX;
  textY = pos.y - pointerOffsetY;

  draw();
}

// Drag stop
function stopDrag() { dragging = false; }

// Cursor change
function updateCursor(e) {
  const pos = getMousePos(e);
  ctx.font = `${$("#fontSize").val()}px 'Anton'`;
  const text = $("#memeText").val();
  const width = ctx.measureText(text).width;
  const height = parseInt($("#fontSize").val());

  canvas.style.cursor =
    (pos.x >= textX && pos.x <= textX + width && pos.y >= textY && pos.y <= textY + height)
      ? "move"
      : "default";
}

// Draw image + text
function draw() {
  if (!currentImage) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(currentImage,0,0,canvas.width,canvas.height);

  const text = $("#memeText").val();
  const size = $("#fontSize").val();
  const color = $("#fontColor").val();

  ctx.font = `${size}px 'Anton'`;
  ctx.fillStyle = color;
  ctx.strokeStyle = "black";
  ctx.lineWidth = size * 0.08;
  ctx.textBaseline = "top";

  ctx.strokeText(text, textX, textY);
  ctx.fillText(text, textX, textY);
}

// Save Meme
function saveMeme() {
  if (!currentImage) return;
  // Convert Canvas to an image
  const memeData = canvas.toDataURL("image/png");

  // Create card
  const card = $("<div>").addClass("meme-card");

  // Meme preview
  const img = $("<img>").attr("src", memeData);

  // Download button
  const downloadBtn = $("<button>")
    .addClass("meme-btn")
    .text("Download")
    .on("click", function () {
      const a = document.createElement("a");
      a.href = memeData;
      a.download = "meme.png";
      a.click();
    });

  // Remove button
  const removeBtn = $("<button>")
    .addClass("meme-btn")
    .text("Remove")
    .on("click", function () {
      card.remove();
    });

  // Add elements to card
  card.append(img, downloadBtn, removeBtn);

  // Add card to collection
  $("#collection").append(card);
}
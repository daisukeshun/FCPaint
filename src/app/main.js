function getElement(selector){
	return document.querySelector(selector);
}
function getElements(selector){
	return document.querySelectorAll(selector);
}

const win = nw.Window.get();
const canvas = getElement('#render'); 
const ctx = canvas.getContext("2d");

const menu = getElements("#tools > .btn");
const fileMenu = getElements("#files > .btn");

const colorPicker = getElement("#picker");
const imageLoader = getElement("#uploadImage");
const imageSaver = getElement("#saveImage");


const colorPickerBtn = getElement("#pickerBtn");
const imageLoaderBtn = getElement("#loadImage");
const strokeBtn = getElement("#stroke");
const eraserBtn = getElement("#eraser");


colorPickerBtn.addEventListener("click", () =>{
	colorPicker.click();
});


eraserBtn.addEventListener("click", 
	function(){
		this.classList.toggle("active");
		mouse.eraserToggle();
		ctx.globalCompositeOperation == "source-over" ? ctx.globalCompositeOperation = "destination-out" : ctx.globalCompositeOperation = "source-over";
});

strokeBtn.addEventListener("click", () => {
	mouse.strokeToggle();
	strokeBtn.classList.toggle("active");
});

imageLoaderBtn.addEventListener("click", () => { imageLoader.click(); });

imageSaver.addEventListener("click", () =>
	{
		const a = document.createElement("a");

		document.body.appendChild(a);
		a.href = canvas.toDataURL("image/jpeg", 1);
		a.download = "canvas-image.jpg";
		a.click();
		document.body.removeChild(a);
	});

imageLoader.addEventListener("change", () => {
	img = new Image(),
	f = imageLoader.files[0],
	url = window.URL || window.webkitURL,
	src = url.createObjectURL(f);

	img.src = src;

	img.onload = function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if ((img.width / img.height) < (canvas.width / canvas.height))
		{
			ctx.drawImage(img, 
				0, 0, 
				img.width, img.height, 
				(canvas.width - (img.width / img.height) * canvas.height) / 2, 0, 
				(img.width / img.height) * canvas.height , canvas.height);

		} else {
			ctx.drawImage(img, 
				0, 0, 
				img.width, img.height, 
				0, (canvas.height - canvas.width * (img.height / img.width)) / 2,
				canvas.width, canvas.width * (img.height / img.width));
		}

	    url.revokeObjectURL(src);
	}
});

colorPicker.addEventListener("change", function(){
	colorPickerBtn.style.background = this.value;
	ctx.fillStyle = this.value;
	ctx.strokeStyle = this.value;
});

let mouse = {
	x: 0,
	y: 0,
	drawing: false,
	state: 0,
	stroke: false,
	eraser: false,
	drawToggle: function() { this.drawing ? this.drawing = false : this.drawing = true; },
	strokeToggle: function() { this.stroke ? this.stroke = false : this.stroke = true; },
	eraserToggle: function() { this.eraser ? this.eraser = false : this.eraser = true; },
	draw: function(context, e)
	{
		if(this.drawing){
			switch(this.state)
			{
				case 0:
					drawLine(context, 
							this.x, this.y, 
							e.offsetX, e.offsetY);
					break;
				case 1:
					this.stroke ?  context.strokeRect(this.x, this.y, e.offsetX - this.x, e.offsetY - this.y) : 
						context.fillRect(this.x, this.y, e.offsetX - this.x, e.offsetY - this.y);
					break;
				case 2:
					//Save
					context.save();
					context.beginPath();
					//Dynamic scaling
					let scalex = 1*((e.offsetX-this.x)/2);
					let scaley = 1*((e.offsetY-this.y)/2);
					context.scale(scalex,scaley);
					//Create ellipse
					let centerx = (this.x/scalex)+1;
					let centery = (this.y/scaley)+1;
					context.arc(centerx, centery, 1, 0, 2*Math.PI);
					//Restore and draw
					ctx.restore();
					this.stroke ? context.stroke() : context.fill();
					break;
				case 3:
					drawLine(context, this.x, this.y, e.offsetX, e.offsetY);
					break;
			}
			this.x = e.offsetX;
			this.y = e.offsetY;
		}
	}
}

function Menu_t(menu, active, activeClass)
{
	menu.active = active;
	menu.activeClass = activeClass;
	menu.removeActive = function()
	{
		this[this.active].classList.remove(activeClass);
	}
	menu.addActive = function(index)
	{
		if(menu.length > index && index >= 0)
		{
			this.removeActive();
			this.active = index;
			this[this.active].classList.add(activeClass);
		}
	}
	menu.forEach((item, i, arr) => {
		item.addEventListener("mousedown", e => {
			arr.addActive(i);
		});
	});
}

Menu_t(menu, 0, "active");
menu.forEach((item, i, arr) => {
	item.addEventListener("mousedown", e => {
		mouse.state = i;
	});
});

window.addEventListener("resize", () => {
	canvas.setAttribute("width", ""+(win.width * 0.8));
	canvas.setAttribute("height", ""+(win.height));
	ctx.fillStyle = "#ffffff";
	ctx.strokeStyle ="#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = colorPicker.value;
	ctx.strokeStyle = colorPicker.value;
});

window.onload = function()
{
	canvas.setAttribute("width", ""+(win.width * 0.8));
	canvas.setAttribute("height", ""+(win.height));
}



canvas.addEventListener("wheel", e => {
	if (e.deltaY > 0) {
		ctx.lineWidth-=1;
	} else if (e.deltaY < 0) { 
		ctx.lineWidth+=1;
	}

});

canvas.addEventListener("mouseleave", e => {
	mouse.drawing = false;
});

function drawLine(context, x1, y1, x2, y2) {
	context.lineCap = "round";
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
	}

function drawRect(context, x1, y1, x2, y2){
	contex.fillRect(x1, y1, x2, y2);
}

canvas.addEventListener("mousedown", e => {
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;
	mouse.drawing = true;
});

canvas.addEventListener("mousemove", e => {
	if(mouse.state == 0){
		mouse.draw(ctx, e);
	}
});

canvas.addEventListener("mouseup", e => {
	mouse.draw(ctx, e);
	mouse.drawing = false;
});

window.addEventListener("keydown", e => {
	switch (e.key)
	{
		case "b":
			mouse.state = 0;
			menu.addActive(mouse.state);
			break;
		case "r":
			mouse.state = 1;
			menu.addActive(mouse.state);
			break;
		case "e":
			mouse.state = 2;
			menu.addActive(mouse.state);
			break;
		case "l":
			mouse.state = 3;
			menu.addActive(mouse.state);
			break;
		case "E":
			eraserBtn.click();
			break;
		case "f":
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			break;
		case "s":
			strokeBtn.click();
			break;
		case "S":
			imageSaver.click();
			break;
		case "O":
			imageLoader.click();
			break;
	}
});


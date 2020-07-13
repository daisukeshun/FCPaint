function getElement(selector){
	return document.querySelector(selector);
}
function getElements(selector){
	return document.querySelectorAll(selector);
}

const win = nw.Window.get();
const canvas = getElement('#render'); 
const ctx = canvas.getContext("2d");
const menu = getElements("#tools > li");
const fileMenu = getElements("#files > li");
const colorPicker = getElement("#picker");
const imageLoader = getElement("#uploadimage");
const imageSaver = getElement("#saveimage");
const imageLoaderBtn = getElement("#loadimage");
const strokeBtn = getElement("#stroke");
const eraserBtn = getElement("#eraser");

eraserBtn.addEventListener("click", 
		function(){
			eraser.toggle();
			this.classList.toggle("active");
			ctx.globalCompositeOperation = eraser.state;
});

strokeBtn.addEventListener("click", () => {
	mouse.strokeToggle();
	strokeBtn.classList.toggle("active");
});

imageLoaderBtn.addEventListener("click", e => 
	{
		imageLoader.click();
	});

imageSaver.addEventListener("click", e =>
	{
		const a = document.createElement("a");

		document.body.appendChild(a);
		a.href = canvas.toDataURL("image/jpeg", 1);
		a.download = "canvas-image.jpg";
		a.click();
		document.body.removeChild(a);
	});

imageLoader.addEventListener("change", e => {
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

colorPicker.addEventListener("change", e => {
	ctx.fillStyle = colorPicker.value;
	ctx.strokeStyle = colorPicker.value;
});

let mouse = {
	x: 0,
	y: 0,
	drawing: false,
	state: 0,
	stroke: false,
	drawToggle: function() {
		if (this.drawing) 
			 { this.drawing = false; } 
		else { this.drawing = true; }
	},
	strokeToggle: function() {
		if (this.stroke) 
			 { this.stroke = false; } 
		else { this.stroke = true; }
	},
	draw: function(context, e)
	{
		if(this.drawing){
			switch(this.state)
			{
				case 0:
					drawLine(context, 
							this.x, this.y, 
							e.offsetX, e.offsetY);
					this.x = e.offsetX;
					this.y = e.offsetY;
					break;
				case 1:
					this.stroke ?  context.strokeRect(this.x, this.y, e.offsetX - this.x, e.offsetY - this.y) : 
						context.fillRect(this.x, this.y, e.offsetX - this.x, e.offsetY - this.y);
					this.x = e.offsetX;
					this.y = e.offsetY;
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
					this.x = e.offsetX;
					this.y = e.offsetY;
					break;
				case 3:
					drawLine(context, this.x, this.y, e.offsetX, e.offsetY);
					this.x = e.offsetX;
					this.y = e.offsetY;
					break;
			}
		}
	}
}

let eraser = {
	value: false,
	state:  "source-over",
	toggle: function() {
		if (this.value) { 
			this.value = false;
			this.state = "source-over";
		} 
		else { 
			this.value = true; 
			this.state = "destination-out";
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
		mouse.updateCursor();
	});
});

window.addEventListener("resize", () => {
	canvas.setAttribute("width", ""+(win.width * 0.7));
	canvas.setAttribute("height", ""+(win.height * 0.8));
});

window.onload = function()
{
	canvas.setAttribute("width", ""+(win.width * 0.7));
	canvas.setAttribute("height", ""+(win.height * 0.8));
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
		case "D":
			ctx.clearRect(0, 0, canvas.width, canvas.height);
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


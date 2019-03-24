var vensterBreedte = 1200;
var vensterHoogte = 600;

var grondHoogte = 60;
var grondHoogteAbsoluut = vensterHoogte - grondHoogte;

var titelTekstX = vensterBreedte / 2;
var titelTekstBeweging = 5;
var titelMarge = 200;

var debugInfoTonen = false;

var zwaartekracht = 0.05;

var tankWielDiameter = 20;
var tankWielStraal = tankWielDiameter / 2;
var tankBreedte = 70;
var tankHoogte = 30;

var tankX1 = 50;
var tankY1 = grondHoogteAbsoluut - tankHoogte - tankWielStraal;
var tankX2 = tankX1 + tankBreedte;
var tankY2 = tankY1 + tankHoogte;

var tankLanceerX = tankX2 - 20;
var tankLanceerY = tankY1;
var tankMikX = 300;
var tankMikY = 300;
var tankDoelwitGrootte = 20;

var maxBrandstof = 100;
var brandstof = maxBrandstof;
var verbruik = 2;
var hervulSnelheid = 0.2;
var tankSnelheid = 10;

var tankMikSnelheid = 10;
var tankMikSnelheidTraag = 2;

var kogelX = tankLanceerX;
var kogelY = tankLanceerY;
var kogelGrootte = 8;

var kogelFrames = 0;
var kogelFrameFactor = 35;
var doelX = tankMikX;
var doelY = tankMikY;
var huidigeFrame;
var doelFrame;

var schietend = false;
var ultraSchiet = false;

var kebabs = [];
var aantalKebabs = 2;
var kebabBreedte = 50;
var kebabHoogte = 25;
var kebabLevens = 3;

var kebabScore = kebabLevens * 10;

var score = 0;

var letterType;
var sfx = {schiet: 0,
					 raak: 0,
					 gameOver: 0,
					 levenVerloren: 0,
					 main: 0};

const startScherm = 0;
const gameScherm = 1;
const gameOverScherm = 2;

var scherm = startScherm;

const maxLevens = 3;
var levens = maxLevens;
var levensVakjesGrootte = 20;

var scoreString = "";


function preload() {
	letterType = loadFont("VCR_OSD_MONO_1_001.ttf");

	sfx.main = loadSound("kebabschieter_ost.wav");
	sfx.schiet = loadSound("kebabschieter_schiet_1.wav");
};

function setup() {
	createCanvas(vensterBreedte, vensterHoogte);

	textAlign(CENTER);
	textFont(letterType);

	for (let i = 0; i < aantalKebabs; i++) {
		let kebabX = random(width, 300 + width);
		let kebabY = random(50, 150);
		kebabs.push(new Kebab(kebabX, kebabY, kebabBreedte, kebabHoogte, kebabLevens));
	};
};

function draw() {
	tekenScherm(scherm);
	//kader
	stroke(255);
	strokeWeight(2);
	noFill();
	rect(0, 0, vensterBreedte, vensterHoogte);
	sfx.main.playMode('untilDone');
	sfx.main.play();
};

function tekenScherm(scherm_) {
	if (scherm_ == startScherm) {

		background(0);
		fill(0, 255, 0);
		noStroke();
		textSize(60);
		text("KEBABSCHIETER", map(titelTekstX, 0, vensterBreedte, titelMarge, vensterBreedte - titelMarge), 150);
		textSize(40);
		text("gemaakt door SIMEON DUWEL, aka WalrusGumboot", vensterBreedte / 2, 310);
		text("pijltjestoetsen om te mikken", vensterBreedte / 2, 350);
		text("S om te schieten", vensterBreedte / 2, 390);
		text("SHIFT om preciezer te mikken", vensterBreedte / 2, 430);
		textSize(25);
		text("raak de kebabs, maar pas op dat ze de rand niet raken!", vensterBreedte / 2, 500);
		text("werp een munt in of druk op ENTER om verder te gaan", vensterBreedte / 2, 530);

		titelTekstX += titelTekstBeweging;
		if (titelTekstX > vensterBreedte - titelMarge || titelTekstX < titelMarge) {
			titelTekstBeweging = -titelTekstBeweging;
		}


	} else if (scherm_ == gameScherm) {
		background(0);
		stroke(0);

		//grond
		fill(0, 255, 0);
		rect(0, grondHoogteAbsoluut, vensterBreedte, grondHoogte);

		//tank
		rect(tankX1, tankY1, tankBreedte, tankHoogte);
		ellipse(tankX1, tankY2, tankWielDiameter, tankWielDiameter);
		ellipse(tankX2, tankY2, tankWielDiameter, tankWielDiameter);

		//kebabs
		for (let i = 0; i < kebabs.length; i++) {
			let kogel_ = {x: kogelX, y: kogelY, r: kogelGrootte};
			let kebab_ = {x: kebabs[i].x, y: kebabs[i].y, w: kebabs[i].breedte, h: kebabs[i].hoogte};
			let hit = CirkelRechtCollisie(kogel_, kebab_);

			if (hit == 1) {
				kebabs[i].raak(hit);
			};

			if (!schietend) {
				kebabs[i].inv = false;
			};
			let resultaat = kebabs[i].update();
			if (resultaat != -1) {kebabs[i].toon();}
			else {if (kebabs[i].maxLevens * 10 >= kebabScore) {kebabScore += 10}; score += kebabScore;};
			if (resultaat == 0) {levens--;};
		}

		//doelwit
		strokeWeight(5);
		stroke(0, 255, 0, 127);
		line(tankMikX - tankDoelwitGrootte, tankMikY, tankMikX + tankDoelwitGrootte, tankMikY);
		line(tankMikX, tankMikY - tankDoelwitGrootte, tankMikX, tankMikY + tankDoelwitGrootte);

		if (ultraSchiet) {
			if (!schietend) {
				doelX = tankMikX;
				doelY = tankMikY;

				kogelFrames = dist(tankLanceerX, tankLanceerY, doelX, doelY) / kogelFrameFactor;

				schietend = true
				huidigeFrame = frameCount;
				doelFrame = huidigeFrame + kogelFrames;
			}
		}

		if (schietend) {
			//kogel
			strokeWeight(1);
			ellipse(kogelX, kogelY, kogelGrootte, kogelGrootte);

			//doel
			noFill();
			strokeWeight(5);
			stroke(0, 255, 0, 30);
			line(doelX - tankDoelwitGrootte, doelY, doelX + tankDoelwitGrootte, doelY);
			line(doelX, doelY - tankDoelwitGrootte, doelX, doelY + tankDoelwitGrootte);

			//baan
			stroke(0, 255, 0, 30);
			strokeWeight(1);
			line(tankLanceerX, tankLanceerY, doelX, doelY)
		}

		if (schietend && frameCount <= doelFrame) {
			let lerpHoeveelheid = (frameCount - huidigeFrame) / kogelFrames;
			kogelX = lerp(tankLanceerX, doelX, lerpHoeveelheid);
			kogelY = lerp(tankLanceerY, doelY, lerpHoeveelheid);
		}

		if (frameCount > doelFrame) {
			schietend = false;
			kogelX = tankLanceerX;
			kogelY = tankLanceerY;
		}

		//levens
		for (i = 0; i < maxLevens; i++) {
			stroke(255);
			strokeWeight(3);
			if (i >= levens) {
				fill(0);
			} else {
				fill(0, 255, 0);
			}
			rect((levensVakjesGrootte * i) + levensVakjesGrootte + (levensVakjesGrootte / 2* i),
					 levensVakjesGrootte,
					 levensVakjesGrootte,
					 levensVakjesGrootte);
		}

		//brandstof
		if (brandstof < maxBrandstof) {
			brandstof += hervulSnelheid;
		}
		noFill()
		rect(20, 50, 100, 20)
		fill(0, 255, 0)
		strokeWeight(1)
		rect(20, 50, map(brandstof, 0, maxBrandstof, 0, 100), 20)

		//score
		fill(0, 255, 0, 200);
		stroke(0, 255, 0);
		strokeWeight(1);
		textSize(levensVakjesGrootte);
		textAlign(LEFT);
		text(str(score), levensVakjesGrootte, levensVakjesGrootte * 5)

		//levens op? ded
		if (levens == 0) {
			scherm = gameOverScherm;
			score = 0;
		};



		if (debugInfoTonen) {
			fill(255);
			noStroke();
			textSize(15);
			textAlign(LEFT);
			text(concat("kogelX: ", kogelX), levensVakjesGrootte, 70);
			text(concat("kogelY: ", kogelY), levensVakjesGrootte, 90);
			text(concat("kogelFrames: ", kogelFrames), levensVakjesGrootte, 110);
			text(concat("dist(tankLanceer, tankMik): ", dist(tankLanceerX, tankLanceerY, tankMikX, tankMikY)), levensVakjesGrootte, 130);
			text(concat("levens: ", levens), levensVakjesGrootte, 150);
			text(concat("frameRate: ", frameRate()), levensVakjesGrootte, 170);
		};

		//textAlign(CENTER)

		toetsenHandeling();

	} else if (scherm_ == gameOverScherm) {
		background(0);
		fill(0, 255, 0);
		noStroke();
		textAlign(CENTER)
		textSize(60);
		text("GAME OVER. :(", vensterBreedte / 2, vensterHoogte / 2);
		textSize(30);
		text("this is so sad, alexa play despacito", vensterBreedte / 2, vensterHoogte / 2 + 30);
		text("Nog een keertje? Druk op ENTER.", vensterBreedte / 2, vensterHoogte / 2 + 60)
	};
};

function keyPressed() {
	if (key == "Enter" && scherm == startScherm) {
		scherm = gameScherm;
	};

	if (key == "Enter" && scherm == gameOverScherm) {
		levens = maxLevens;
		tankMikX = 300;
		tankMikY = 500;
		for (let i = 0; i < kebabs.length; i++) {
			kebabs[i].reset();
		}
		brandstof = maxBrandstof;
		tankX1 = 50;
		tankY1 = grondHoogteAbsoluut - tankHoogte - tankWielStraal;
		tankX2 = tankX1 + tankBreedte;
		tankY2 = tankY1 + tankHoogte;

		tankLanceerX = tankX2 - 20;
		tankLanceerY = tankY1;
		tankMikX = 300;
		tankMikY = 300;

		scherm = gameScherm;
	};

	if (key == "u" || key == "U" && scherm == gameScherm) {
		if (ultraSchiet) {
			ultraSchiet = false;
		} else {
			ultraSchiet = true;
		};
	};

	if (key == "F4" && scherm == gameScherm) {
		if (debugInfoTonen) {
			debugInfoTonen = false;
		} else {
			debugInfoTonen = true;
		};
	};

	if (key == "s" || key == "S" && scherm == gameScherm) {
		schiet();
	};
};
function keyReleased() {
	if (tankMikSnelheid == tankMikSnelheidTraag) {
		tankMikSnelheid = 10
	};
};
function schiet() {
	if (!schietend) {
		sfx.schiet.playMode('restart');
		sfx.schiet.play();
		doelX = tankMikX;
		doelY = tankMikY;

		kogelFrames = dist(tankLanceerX, tankLanceerY, doelX, doelY) / kogelFrameFactor;

		schietend = true
		huidigeFrame = frameCount;
		doelFrame = huidigeFrame + kogelFrames;
	};
};
function toetsenHandeling() {
		if (keyIsDown(UP_ARROW)) {
			if (tankMikY > tankDoelwitGrootte) {
		  	tankMikY -= tankMikSnelheid;
			};
		};

		if (keyIsDown(DOWN_ARROW)) {
			if (tankMikY < tankY1) {
				tankMikY += tankMikSnelheid;
			};
		};

		if (keyIsDown(LEFT_ARROW)) {
			if (tankMikX > tankLanceerX) {
		  	tankMikX -= tankMikSnelheid;
			};
		};

		if (keyIsDown(RIGHT_ARROW)) {
			if (tankMikX < width - tankDoelwitGrootte) {
				tankMikX += tankMikSnelheid;
			};
		};

		if (keyIsDown(SHIFT)) {
			tankMikSnelheid = tankMikSnelheidTraag;
		};

	//tankbeweging
	if (keyIsDown(68)) {
		if (brandstof > 0) {
			brandstof -= verbruik;
			tankX1 += tankSnelheid;
			tankX2 += tankSnelheid;
			tankLanceerX += tankSnelheid;
			tankMikX += tankSnelheid;
		}
	}
	if (keyIsDown(65)) {
		if (brandstof > 0) {
			brandstof -= verbruik;
			tankX1 -= tankSnelheid;
			tankX2 -= tankSnelheid;
			tankLanceerX -= tankSnelheid;
			tankMikX -= tankSnelheid;
		}
	}
};
function CirkelRechtCollisie(cirkel, recht) {
		let afstX = abs(cirkel.x - recht.x - recht.w / 2);
		let afstY = abs(cirkel.y - recht.y - recht.h / 2);

		if (afstX > (recht.w/2 + cirkel.r)) { return 0; };
		if (afstY > (recht.h/2 + cirkel.r)) { return 0; };

		if (afstX <= (recht.w/2)) { return 1; };
		if (afstY <= (recht.h/2)) { return 1; };

		let dx = afstX - recht.w/2;
		let dy = afstY - recht.h/2;
		let hoek = dx*dx+dy*dy <= (cirkel.r * cirkel.r);
		if (hoek == true) {
			return 1;
		} else {
			return 0;
		};
};

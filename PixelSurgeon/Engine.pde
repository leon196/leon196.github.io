/* @pjs font="cachiyuyo.otf"; preload="level_youonlygetone.png"; preload="level_pasteque.png"; preload="level_science.png"; preload="level_patate.png";*/
String[] levelNames = { "level_youonlygetone.png", "level_pasteque.png", "level_patate.png", "level_science.png" };
PFont font = loadFont("cachiyuyo.otf");
String explanation = "Pixel Surgeon is inspired by Rick Levine's Microsurgeon and Conway's Game of Life\n\nIt was made for a double game jam (Jam Shaker and Ludum Dare)\n\nwidth a double theme (Sciences, You Only Get One)\n\nReleased with Processing by Leon Denise (code) and Simon Denise (pixel anatomy)";
String controls = "Controls :\nMove with arrows\nAim with mouse\nShoot with clic\nHold mouse button for autofire";
PImage levelImage;
PImage screenImage;
Level level;
Player player;
int[] cellsBuffer;
Game game;
boolean playing = false;
boolean choosingLevel = false;
int gameMode = 0; // 0 - no heal / 1 - restore heal / 2 - mutation heal
int currentLevel = 0;
int badCount = 0;
int badCountMin = 40;
int cellSize = 10;
int resolution = 8;
int[] cells;
int offsetX = 0;
int offsetY = 0;
int windowWidth;
int windowHeight;
int windowBorderWidth;
int windowBorderHeight;
float timeLastSpawn = 0;
float timeDelaySpawn = 6000;
float timeLastIteration = 0;
float timeDelayIteration = 200;
float timeLastClicLeft = 0;
float timeDelayClicLeft = 50;
boolean recording = false;
float lastRecordTime = 0;
float recordDelay = 500;
boolean keyUp = false;
boolean keyDown = false;
boolean keyLeft = false;
boolean keyRight = false;
boolean mouseLeft = false;
boolean mouseRight = false;
boolean keyPause = false;
final int cellColorDead = color(0xff343434);
final int cellColorAlive = color(0xffff7c7b);
final int cellColorBad = color(0xffcdcdcd);
final int cellColorPlayer = color(0xff39cd39);
final int cellColorPlayerHeart = color(0xffcd3939);
final int cellColorLazer = color(0xff0000ff);
final int cellColorAlpha =  color(0x00000000); 
String textHelp = "MOVE with ARROWS    LAZER with CLIC    KILL bad cells    HEAL vital cells    M select level    C generate chaos";
class Cell { 
  int _x;
  int _y;
  color _color;
  Cell(int x_, int y_, color color_) { _x = x_; _y = y_; _color = color_; }
};
class CellAgent extends Cell {
  float _dirX;
  float _dirY;
  int _speed;
  color _previousColor;
  float _timeStarted;
  float _timeDelay;
  CellAgent(float x_, float y_, float dirX, float dirY, color previousColor_, color color_) {
    super(int(x_), int(y_), color_);
    _dirX = dirX;
    _dirY = dirY;
    _speed = 1;
    _timeStarted = millis();
    _timeDelay = 5000;
    _previousColor = previousColor_;
  }
};
class Player {
  int _x = 0;
  int _y = 0;
  Cell[] cells;
  int _life = 16;
  int fromX = 0;
  int _yLastLazerOrigin = 0;
  int _xLastLazerTarget = 0;
  int _yLastLazerTarget = 0;
  int cellCountLazer = 0;
  ArrayList _cellsLazer;
  ArrayList _bullets;

  Player() {
    cells = new Cell[_life];
    _cellsLazer = new ArrayList();
    _bullets = new ArrayList();
    int gridSize = int(sqrt(_life));
    for (int x = 0; x < gridSize; x++) {
      for (int y = 0; y < gridSize; y++) {
        int c = x + y * gridSize;
        color cellColor;
        cells[c] = new Cell(x, y, cellColorPlayer);
      }
    }
    _x = int(width/2);
    _y = int(height/2);
  }

  void Update() {
    // if (keyUp) _y = max(windowBorderHeight, min(_y - cellSize, height - windowBorderHeight));
    // if (keyDown) _y = max(windowBorderHeight, min(_y + cellSize, height - windowBorderHeight));
    // if (keyLeft) _x = max(windowBorderWidth, min(_x - cellSize, width - windowBorderWidth));
    // if (keyRight) _x = max(windowBorderWidth, min(_x + cellSize, width - windowBorderWidth));
    
    if (mouseLeft || mouseRight) FireLazer();
    else CleanFire();
  }

  void FireBullet() {
    int fromX = int((_x + level._x) / resolution);
    int fromY = int((_y + level._y) / resolution);;
    int toX = int(mouseX / cellSize - fromX);
    int toY = int(mouseY / cellSize - fromY);
    float distance = sqrt(toX*toX+toY*toY);
    _bullets.add(new CellAgent(fromX, fromY, toX/distance, toY/distance, level.GetPixel(fromX, fromY), cellColorLazer));
  }

  void FireLazer() {
    CleanFire();
    int fromX = int(_x / cellSize);
    int fromY = int(_y / cellSize);
    int toX = int(mouseX / cellSize);
    int toY = int(mouseY / cellSize);

    // Heal
    color cellColor = level.GetPixel(toX, toY);
    // if (cellColor == cellColorDead) {
      level.SetNeighbours(toX, toY, 0);
      // int neighboursVital = level.HowManyVitalNeighbours(toX, toY);
      // if (neighboursVital > 0) {
      //   int averageNeighbour = level.GetAverageNeighbour(toX, toY);
      //   level.SetNeighbours(toX, toY, averageNeighbour);
      // }
    // }

    // Line
    float t = 0.0;
    float step = 1/sqrt((toX - fromX)*(toX - fromX)+(toY - fromY)*(toY - fromY));
    while(t < 1.0) {
      fromX = int(_x / cellSize);
      fromY = int(_y / cellSize);
      toX = int(mouseX / cellSize);
      toY = int(mouseY / cellSize);
      int x = int(fromX + (toX - fromX) * t);
      int y = int(fromY +  (toY - fromY) * t);
      cellColor = level.GetPixel(x, y);
      if (cellColor != cellColorLazer) {
        _cellsLazer.add(new Cell(x + level._x, y + level._y, cellColor));
        level.SetPixel(x, y, cellColorLazer);
      }
      t += step;
    }

    level._image.updatePixels();
    timeLastClicLeft = millis();
  }

  void CleanFire() {
    cellCountLazer = _cellsLazer.size();
    for (int c = 0; c < cellCountLazer; c++) {
      Cell cellLazer = (Cell)_cellsLazer.get(c);
      level.SetPixelGlobal(cellLazer._x, cellLazer._y, cellLazer._color); 
    }
    _cellsLazer = new ArrayList();
    level._image.updatePixels();
  }  

  void Draw() {
    for (int c = 0; c < _life; c++) {
      Cell cell = cells[c];
      if (cell._color != cellColorDead) {
        fill(cell._color);
        rect(_x + cell._x * cellSize - cellSize * 2, _y + cell._y * cellSize - cellSize * 2, cellSize, cellSize);
      }
    }
  }


};

class Game {

  Level[] _levels;

  Game () {
    int levelCount = levelNames.length;
    _levels = new Level[levelCount];
    for (int i = 0; i < levelCount; i++) {
      _levels[i] = new Level(loadImage(levelNames[i]), resolution);
    }
  }

  void ShowTitle() {
    fill(255);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);

    textFont(font, 96);
    if (HitTest(mouseX, mouseY, 300, 70, 497, 196)) {
      fill(#fb2315);
      if (mousePressed) {
        choosingLevel = true;
      }
    } else fill(255);
    text("PLAY", width/2, height/4);
    fill(255);
    textFont(font, 64);
    text("PIXEL SURGEON", width/2, height/2);
    textFont(font, 16);
    text(explanation, width/2, 3*height/4);
  }

  void ShowLevels() {
    fill(255);
    textAlign(CENTER, TOP);
    rectMode(CORNER);
    textFont(font, 28);
    text("Select Level", int(width/2), int(height/2));
    textFont(font, 12);
    for (int l = 0; l < _levels.length; l++) {
      int x = int(width/(_levels.length+1)) * (l+1);
      int y = height-int(_levels[l]._height)-64;
      int w = _levels[l]._width;
      int h = _levels[l]._height;
      if (HitTest(mouseX, mouseY, x, y, w, h)) {
        rect(x, y, w, h);
        if (mousePressed) {
          currentLevel = l;
          level = GetLevel();
          StartGame();
          playing = true;
        }
      }
      _levels[l].ShowImageAt(x, y);
      text(levelNames[l], x + int(w/2), y + h);
    }

  }

  void ShowHud() {
    fill(100);
    textFont(font, 12);
    textAlign(LEFT, TOP);

    String extraHelp = "";
    switch (currentLevel){
      case 0:
        extraHelp = "\n\nYou Only Get One cell. This will be an arena for cells battle. Really need a level editor !";
        break;
      case 3:
        extraHelp = "\n\nThis level needs further level design development involving cellular automata.";
        break;
    }
    text(textHelp + extraHelp + "\n\nbad cells : " + badCount + "    FPS : " + int(frameRate), 16, 16);
  }

  Level GetLevel() { return _levels[currentLevel];} 

};

class Level {
  PImage _image;
  PImage _automata;
  int _x;
  int _y;
  int _width;
  int _height;
  int _cellCount;
  int _resolution;
  Level (PImage image_, int resolution_) {
    _x = 0;
    _y = 0;
    _resolution = resolution_;
    image_.loadPixels();
    _width = int(image_.width/_resolution);
    _height = int(image_.height/_resolution);
    _image = createImage(_width, _height, ARGB);
    _image.loadPixels();
    _automata = createImage(_width, _height, ARGB);
    _automata.loadPixels();
    _cellCount = _width * _height;
    int pixelImageCount = image_.pixels.length;
    for (int c = 0; c < _cellCount; c++) {
      int x = int((c % _width) * _resolution);
      int y = floor(map(floor(c/_width), 0, _height, 0, image_.height));
      color pixelColor = image_.get(x, y);
      _image.pixels[c] = pixelColor;
    }
    _image.updatePixels();
    _automata.updatePixels();
  }

  void UpdateOffset(int x_, int y_) {
    _x = int(max(-_width/2, min(_x + x_, _width/2)));
    _y = int(max(-_height/2, min(_y + y_, _height)));
  }

  void Update() {
    badCount = 0;
    _automata.loadPixels();
    _automata.pixels = GameOfLife(_automata.pixels, cellColorBad, cellColorDead);
    _automata.updatePixels();
  }

  void GenerateChaos() {
      _automata.loadPixels();
      int offset = 3 + int(random(1.0) * 5);
      int xx = int(random(1.0) * windowWidth + _x/_resolution);
      int yy = int(random(1.0) * windowHeight + _y/_resolution);
      int w = xx + offset;
      int h = yy + offset;
      for (int x=xx; x<w; x++) {
        for (int y=yy; y<h; y++) {
          if (x >= 0 && x < _width && y >= 0 && y < _height) {
            if (random(1.0) <= 0.5) {
              SetPixel(x, y, cellColorBad);
                }}}}
      _automata.updatePixels();
  }

  void ShowImage() { 
    image(_image, 0, height-_height);
    image(_automata, 0, height-_height);
  }

  void ShowImageAt(int x_, int y_) { 
    image(_image, x_, y_);
    image(_automata, x_, y_);
  }

  color GetPixel(int x_, int y_) {
    color pixel = 0;
    int x = x_ + _x;
    int y = y_ + _y;
    if (x >= 0 && x < _width && y >= 0 && y < _height) pixel = _automata.get(x, y);
    return pixel;
  }

  color GetPixelBackground(int x_, int y_) {
    color pixel = 0;
    int x = x_ + _x;
    int y = y_ + _y;
    if (x >= 0 && x < _width && y >= 0 && y < _height) pixel = _image.get(x, y);
    return pixel;
  }

  void SetPixel(int x_, int y_, color color_) {
    int x = x_ + _x;
    int y = y_ + _y;
    if (x >= 0 && x < _width && y >= 0 && y < _height)  _automata.pixels[x + y * _width] = color_;
  }

  void SetPixelGlobal(int x_, int y_, color color_) {
    if (x_ >= 0 && x_ < _width && y_ >= 0 && y_ < _height)  _automata.pixels[x_ + y_ * _width] = color_;
  }

  ArrayList SetCellWithLine(int fromX, int fromY, int toX, int toY, color cellColor_) {
    ArrayList cellsLazer = new ArrayList();
    _automata.loadPixels();
    float t = 0.0;
    float step = 1/sqrt((toX - fromX)*(toX - fromX)+(toY - fromY)*(toY - fromY));
    while(t < 1.0) {
      int x = int(fromX + (toX - fromX) * t);
      int y = int(fromY +  (toY - fromY) * t);
      color cellColor = GetPixel(x, y);
      if (cellColor != cellColor_) {
        cellsLazer.add(new Cell(x + _x, y + _y, cellColor));
        SetPixel(x, y, cellColor_);
      }
      t += step;
    }
    _automata.updatePixels();
    return cellsLazer;
  }


  ArrayList GetNeighbours(int x, int y, color color_) { 
    ArrayList neighbours = new ArrayList();
    for (int xx=x-1; xx<=x+1;xx++)
      for (int yy=y-1; yy<=y+1;yy++)
        if (x >= 0 && x < _width && y >= 0 && y < _height)
          if (!((xx==x)&&(yy==y)))
            if (GetPixel(xx, yy) == color_)
              neighbours.add(new Cell(xx, yy, color_));
    return neighbours;
  }

  int HowManyVitalNeighbours(int x, int y) {
    int vitals = 0;
    for (int xx=x-1; xx<=x+1;xx++) {
      for (int yy=y-1; yy<=y+1;yy++) {
       if (x >= 0 && x < _width && y >= 0 && y < _height) {
          if (!((xx==x)&&(yy==y))) {
            color cell = GetPixel(xx, yy);
            if (cell != cellColorDead && cell != cellColorBad && cell != cellColorLazer) {
              vitals++;
            }
          }
        }
      }
    }
    return vitals;
  }

  int GetAverageNeighbour(int x, int y) { 
    color firstColor = 0;
    ArrayList neighbours = new ArrayList();
    for (int xx=x-1; xx<=x+1;xx++) {
      for (int yy=y-1; yy<=y+1;yy++) {
       if (x >= 0 && x < _width && y >= 0 && y < _height) {
          if (!((xx==x)&&(yy==y))) {
            color cell = GetPixel(xx, yy);
            if (cell != 0 && cell != cellColorDead && cell != cellColorBad && cell != cellColorLazer) {
              if (neighbours.contains(cell)) {
                return cell;
              } else {
                neighbours.add(cell);
                if (firstColor == 0) firstColor = cell;
              }
            }
          }
        }
      }
    }
    return firstColor;
  }

  void SetNeighbours(int x, int y, color color_) {
    // SetPixel(x, y, color_);
    for (int xx=x-1; xx<=x+1;xx++)
      for (int yy=y-1; yy<=y+1;yy++)
        if (xx >= 0 && xx < _width && yy >= 0 && yy < _height)
          // if (xx != x && yy != y)
            SetPixel(xx, yy, color_);
  }

  void SetCrossNeighbours(int x, int y, color color_) {
    SetPixel(x, y, color_);
    for (int xx=x-1; xx<=x+1;xx++)
       if (xx >= 0 && xx < _width && y >= 0 && y < _height)
        if (!(xx==x))
          SetPixel(xx, y, color_);
    for (int yy=y-1; yy<=y+1;yy++)
      if (x >= 0 && x < _width && yy >= 0 && yy < _height)
        if (!(yy==y))
          SetPixel(x, yy, color_);
  }
};

int[] GameOfLife(int[] cells, int cellColorTarget, int cellColorConsequence) { 

  int cellCount = cells.length;
  cellsBuffer = new int[cellCount];
  for (int p = 0; p < cellCount; p++) cellsBuffer[p] = cells[p];

  for (int x = 0; x < level._width; x++) {
    for (int y = 0; y < level._height; y++) {
      int p = x + y * level._width;
      int neighbours = 0;
      for (int xx=x-1; xx<=x+1;xx++) {
        for (int yy=y-1; yy<=y+1;yy++) {
          if (((xx>=0)&&(xx<level._width))&&((yy>=0)&&(yy<level._height))) {
            if (!((xx==x)&&(yy==y))) {
              if (cellsBuffer[xx + yy * level._width] == cellColorTarget) {
                neighbours ++;
                  }}}}}
      if (cellsBuffer[p] == cellColorTarget) {
        if (neighbours < 2 || neighbours > 3)  {
          cells[p] = cellColorConsequence;
        } else {
          badCount++;
        }
      }
      else if (neighbours == 3 ) {
        cells[p] = cellColorTarget;
        badCount++;        
      }
    }
  }

  return cells;
}

public void setup() {
  size(800, 600, P2D);

  windowWidth = int(width/cellSize);
  windowHeight = int(height/cellSize);

  windowBorderWidth = int(width/4);
  windowBorderHeight = int(height/4);

  game = new Game();
  level = game.GetLevel();

  StartGame();

  textFont(font, 16);
  textAlign(LEFT, TOP);

  noStroke();
  noSmooth();
}

void StartGame() {
  player = new Player();
}

public void draw() {    
  background(0);
  
  if (playing) UpdateGame();
  else UpdateMenu();
}

void UpdateMenu() {
  if (!choosingLevel) {
    game.ShowTitle();
  } else {
    game.ShowLevels();
  }
}

void UpdateGame() {

  game.ShowHud();

  for (int p = 0; p < windowWidth * windowHeight; p++) {
    int x = int(p % windowWidth);
    int y = int(p / windowWidth);
    color colorAutomata = game.GetLevel().GetPixel(x, y);
    if (colorAutomata == 0) colorAutomata = game.GetLevel().GetPixelBackground(x, y);
    if (colorAutomata != 0) {
      fill(colorAutomata);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  if (keyLeft) offsetX = -1;
  else if (keyRight) offsetX = 1;
  else offsetX = 0;

  if (keyUp) offsetY = -1;
  else if (keyDown) offsetY = 1;
  else offsetY = 0;

  game.GetLevel().ShowImage();
  level.UpdateOffset(offsetX, 0);
  level.UpdateOffset(0, offsetY);
  // if (player._x == windowBorderWidth || player._x == width - windowBorderWidth) 
  // if (player._y == windowBorderHeight || player._y == height - windowBorderHeight) 
  offsetX = 0;
  offsetY = 0;

  if (!keyPause && timeLastIteration + timeDelayIteration < millis()) {
    game.GetLevel().Update();
    timeLastIteration = millis();
  }

  if (badCount < badCountMin && !keyPause && timeLastSpawn + timeDelaySpawn < millis()) {
    level.GenerateChaos();
    timeLastSpawn = millis();
  }
  
  player.Update();
  player.Draw();

  // if (recording && lastRecordTime + recordDelay < millis()) {
  //   saveFrame("output/frames####.png");
  //   lastRecordTime = millis();
  // }

}


void keyPressed() {  
  if (keyCode == RIGHT) keyRight = true;
  if (keyCode == LEFT) keyLeft = true;
  if (keyCode == UP) keyUp = true;
  if (keyCode == DOWN) keyDown = true;
  if (key == 'r') recording = !recording;
  if (keyCode == ' ') level.Update();
  if (key == 'p') keyPause = !keyPause;
  if (key == 'c') level.GenerateChaos();
  if (key == 'm') playing = !playing;
}

void keyReleased() {  
  if (keyCode == RIGHT) keyRight = false;
  if (keyCode == LEFT) keyLeft = false;
  if (keyCode == UP) keyUp = false;
  if (keyCode == DOWN) keyDown = false;
}

void mousePressed() {
  if (mouseButton == LEFT) mouseLeft = true;
  if (mouseButton == RIGHT) mouseRight = true;
}

void mouseReleased() {
  if (mouseButton == LEFT) mouseLeft = false;
  if (mouseButton == RIGHT) mouseRight = false;
}


boolean HitTest(int x, int y, int xx, int yy, int ww, int hh) {
  return (x > xx && x < xx + ww && y > yy && y < yy + hh);
}


   // for (int b = 0; b < _bullets.size(); b++) {
   //  CellAgent bullet = _bullets.get(b);

   //  if (bullet._x >= 0 && bullet._x < level._width && bullet._y >= 0 && bullet._y < level._height)
   //    level.SetPixel(bullet._x, bullet._y, bullet._previousColor);

   //  int x = int(bullet._x + bullet._dirX * bullet._speed);
   //  int y = int(bullet._y + bullet._dirY * bullet._speed);
   //  bullet._x = x;
   //  bullet._y = y;

   //  if ( x >= 0 && x < level._width && y >= 0 && y < level._height) {

   //    color currentColor = level.GetPixel(x, y);
   //    bullet._previousColor = currentColor;

   //    level.SetPixel(x, y, cellColorLazer);

   //    } else {
   //      _bullets.remove(b); continue;
   //    }
   //  }


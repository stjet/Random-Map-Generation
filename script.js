class Map {
  constructor(size, name, tile_size, z, parent_id=undefined) {
    let canvas = document.createElement("CANVAS")
    canvas.id = name+"-canvas";
    canvas.width = size[0];
    canvas.height = size[1];
    canvas.style.zIndex = z;
    canvas.classList.add("canvas")
    if (parent_id) {
      document.getElementById(parent_id).appendChild(canvas);
    } else {
      document.body.appendChild(canvas);
    }
    this.id = name+"-canvas";
    this.size = size;
    //this.tile_size is half the length/width of hexagon
    this.tile_size = tile_size;
    this.canvas = document.getElementById(name+"-canvas");
    this.context = canvas.getContext("2d");
  }
  clear() {
    this.context.clearRect(0, 0,  this.context.canvas.width,  this.context.canvas.height);
  }
  create_map(tiles) {
    function draw_hexagon(canvas, x, y, color) {
      //(x,y) is center
      canvas.context.beginPath();
      for (let j=0; j < 6; j++) {
        canvas.context.lineTo(x+canvas.tile_size*Math.cos(angle*j), y+canvas.tile_size*Math.sin(angle*j));
      }
      canvas.context.closePath();
      canvas.context.fillStyle = color;
      canvas.context.fill();
    }
    const angle = 2 * Math.PI / 6;
    let y = this.tile_size;
    let x = this.tile_size;
    for (let rows=0; rows < tiles.length; rows++) {
      x = this.tile_size;
      y = this.tile_size+i*2*this.tile_size
      for (let column=0; column < tiles[0].length; column++) {
        x += this.tile_size*2;
        //number is even
        if (column%2 == 0) {
          y = this.tile_size+rows*2*this.tile_size
        } else {
          y = this.tile_size+rows*2*this.tile_size-this.tile_size
        }
        draw_hexagon(this, x, y, tiles[rows][column]);
      }
    }
  }
  static two_points_distance(p1, p2) {
    let dif_x = Math.abs(p1[0]-p2[0])
    let dif_y = Math.abs(p1[1]-p2[1])
    if (p1[0] == p2[0]) {
      return dif_y
    } else if (p1[1] == p2[1]) {
      return dif_x
    } else {
      return Math.round(Math.sqrt(dif_x**2+dif_y**2))
    }
  }
}

function convert_to_color(tiles) {
  let terrain = {'ocean':'blue', 'grassland':'mediumseagreen', 'forest':'green', 'desert':'moccasin'}
  for (i=0; i < tiles.length; i++) {
    for (j=0; j < tiles[0].length; j++) {
      tiles[i][j] = terrain[tiles[i][j]];
    }
  }
  return tiles
}

function diversify(tiles, desert_clusters, forest_clusters) {
  let clusters_list = {};
  for (i=0; i < desert_clusters; i++) {
    while (true) {
      let x = Math.floor(Math.random()*tiles[0].length);
      let y = Math.floor(Math.random()*tiles.length);
      if (tiles[x][y] == "grassland") {
        clusters_list[String(x)+','+String(y)] = "desert";
        break;
      }
    }
  }
  for (i=0; i < forest_clusters; i++) {
    while (true) {
      let x = Math.floor(Math.random()*tiles[0].length);
      let y = Math.floor(Math.random()*tiles.length);
      if (tiles[x][y] == "grassland") {
        clusters_list[String(x)+','+String(y)] = "forest";
        break;
      }
    }
  }
  for (y=0; y < tiles.length; y++) {
    for (x=0; x < tiles[0].length; x++) {
      if (tiles[x][y] == "ocean") {
        continue;
      }
      let probability = 0;
      let type = undefined;
      for (i=0; i < Object.keys(clusters_list).length; i++) {
        let distance = Map.two_points_distance([Number(Object.keys(clusters_list)[i].split(',')[0]), Number(Object.keys(clusters_list)[i].split(',')[1])], [x,y]);
        if (distance < 2) {
          if (probability < 0.95) {
            type = clusters_list[Object.keys(clusters_list)[i]];
            probability = 0.95;
          }
        } else if (distance == 3) {
          if (probability < 0.75) {
            type = clusters_list[Object.keys(clusters_list)[i]];
            probability = 0.75;
          }
        } else if (distance == 4) {
          if (probability < 0.5) {
            type = clusters_list[Object.keys(clusters_list)[i]];
            probability = 0.5;
          }
        } else if (distance < 6) {
          if (probability < 0.1) {
            type = clusters_list[Object.keys(clusters_list)[i]];
            probability = 0.1;
          }
        }
      }
      if (probability !=0 && type) {
        if (Math.random() < probability) {
          tiles[x][y] = type;
        }
      }
    }
  }
  return tiles
}

//size: width, height
function cluster_map(size, clusters) {
  //designate random points as clusters
  let clusters_list = []
  for (i=0; i < clusters; i++) {
    let x = Math.round(Math.random()*size[0]);
    let y = Math.round(Math.random()*size[1]);
    clusters_list.push([x,y]);
  }
  let tiles = [];
  for (y=0; y < size[1]; y++) {
    let row = [];
    for (x=0; x < size[0]; x++) {
      let probability = 0.03;
      for (i=0; i < clusters_list.length; i++) {
        let distance = Map.two_points_distance(clusters_list[i], [x,y]);
        if (distance < 2) {
          if (probability < 0.95) {
            probability = 0.95;
          }
        } else if (distance == 2) {
          if (probability < 0.75) {
            probability = 0.75;
          }
        } else if (distance == 3) {
          if (probability < 0.5) {
            probability = 0.5;
          }
        } else if (distance < 5) {
          if (probability < 0.25) {
            probability = 0.25;
          }
        }
      }
      let random = Math.random();
      if (random < probability) {
        row.push("grassland");
      } else {
        row.push("ocean");
      }
    }
    tiles.push(row);
  }
  return tiles  
}

let random_map = cluster_map([15,15], 2);
let random_map2 = JSON.parse(JSON.stringify(random_map))

let map_canvas = new Map([660,660], "map", 20, 0);
map_canvas.create_map(convert_to_color(random_map));

let map_canvas2 = new Map([660,660], "map", 20, 0);
map_canvas2.create_map(convert_to_color(diversify(random_map2, 2, 2)));

function regen(land) {
  map_canvas.clear();
  let random_map = cluster_map([15,15], document.getElementById("land").value);
  let random_map2 = JSON.parse(JSON.stringify(random_map))
  map_canvas.create_map(convert_to_color(random_map));
  map_canvas2.create_map(convert_to_color(diversify(random_map2, 2, 2)));
}
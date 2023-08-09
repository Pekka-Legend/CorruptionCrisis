const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const FOV = Math.PI / 4
const RES = .5
canvas.width = 1400
canvas.height = 640
var mousex = 0;
var mousey = 0
var shoot = false
var kills = 0
var end = false
var health = 100
var healthFrames = 0
var damageCheckFrames = 0

var menu = 1;

var spriteSheet = new Image()
spriteSheet.src = "spritesheet.png"

var gunSprites = new Image()
gunSprites.src = "gunsprites.png"

var wallDistances = []


keys = {
    up: {
        pressed: false
    },
    down:
    {
        pressed: false
    },
    left:
    {
        pressed: false
    },
    right:
    {
        pressed: false
    },
    shift:
    {
        pressed: false
    }

}

function DrawLine(x1, y1, x2, y2, width, color)
{
    c.strokeStyle = color
    c.lineWidth = width
    c.beginPath()
    c.moveTo(x1, y1)
    c.lineTo(x2, y2)
    c.stroke()   
}

class Wall
{
    constructor(x1, y1, x2, y2, color)
    {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.color = color
        this.distance = 99999999
        this.linex = 0
    }
    draw()
    {
        DrawLine(this.x1, this.y1, this.x2, this.y2, 2, this.color) //draw a line with a thickness of 2
    }
    
}

class Sprite
{
    constructor(x, y, width, height, type, enemy)
    {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.type = type
        this.direction = 0
        this.alive = true
    }
    draw()
    {
        c.fillStyle = "Yellow"
        c.fillRect(this.x, this.y, this.width, this.height)
        DrawLine(this.x + 5, this.y + 5, this.x + 5 + -Math.sin(this.direction) * 10, this.y + 5 + Math.cos(this.direction) * 10, 6, 'yellow')
    }
    update(player)
    {
        this.direction = Math.atan2(this.y - player.y - 5, this.x - player.x - 5)
        this.direction += Math.PI / 2

        this.x += -Math.sin(this.direction) / 3
        this.y += Math.cos(this.direction) / 3

        return this.alive
    }
}

function GenerateWalls(num)
{
    walls = [new Wall(0, 0, 200, 0, "grey"), new Wall(0, 0, 0, 200, "grey"), new Wall(200, 0, 200, 200, "grey"), new Wall(0, 200, 200, 200, "grey"),
             new Wall(180, 0, 180, 20, "darkgreen"), new Wall(180, 20, 200, 20, "darkgreen"),
             new Wall(0, 20, 20, 20, "darkgreen"), new Wall(20, 20, 20, 0, "darkgreen"),
             new Wall(0, 180, 20, 180, "darkgreen"), new Wall(20, 180, 20, 200, "darkgreen"),
             new Wall(180, 180, 200, 180, "darkgreen"), new Wall(180, 180, 180, 200, "darkgreen"),

]  
    return walls
}

class Ray
{
    constructor(x, y, direction)
    {
        this.x = x
        this.y = y
        this.x2 = 0
        this.y2 = 0
        this.direction = direction
        this.dist = 100
        this.color = 'purple'
    }

    draw()
    {
        DrawLine(this.x, this.y, this.x2, this.y2, 2, this.color)
    }

    update(x, y, direction, walls, linex)
    {
        this.x = x + 5
        this.y = y + 5
        this.direction = direction

        var x1 = this.x
        var y1 = this.y
        var x2 = this.x - Math.sin(this.direction) * 10000
        var y2 = this.y + Math.cos(this.direction) * 10000

        var x = 0
        var y = 0

        var index = 0;
        var closestWall = 0;
        var spriteIndex = 0;

        var distance = 999999999

        var type = 0
        var color = "black"

        walls.forEach(wall =>
            {
                
                var den = (x1 - x2) * (wall.y1 - wall.y2) - (y1 - y2) * (wall.x1 - wall.x2)

                var t = (x1 - wall.x1) * (wall.y1 - wall.y2) - (y1 - wall.y1) * (wall.x1 - wall.x2)

                t /= den

                var u = (x1 - wall.x1) * (y1 - y2) - (y1 - wall.y1) * (x1 - x2)

                u /= den

                if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
                    {
                        

                        if (Math.sqrt(((x1 + t*(x2 - x1)) - x1)**2 + ((y1 + t*(y2 - y1)) - y1)**2) < distance)
                        {
                            


                            x = x1 + t*(x2 - x1)

                            y = y1 + t*(y2 - y1)

                            distance = Math.sqrt((x - x1)**2 + (y - y1)**2) //get distance from the player to the new point
                            
                            closestWall = index;
                            color = wall.color
                            type = 0
                            
                        }
                        
                    }
                index++
                
            })
            //after going through each wall, 
            distance = distance * Math.cos(this.direction - player.direction) //remove fish eye effect
            this.x2 = x
            this.y2 = y
            
            wallDistances.push([distance, linex, type, x, y, spriteIndex, color, true])

        index = 0
        var spriteSize = .8
        sprites.forEach(sprite =>{
            var den = (x1 - x2) * (sprite.y - sprite.y + spriteSize) - (y1 - y2) * (sprite.x - sprite.x + spriteSize)

                var t = (x1 - sprite.x) * (sprite.y - sprite.y + spriteSize) - (y1 - sprite.y) * (sprite.x - sprite.x + spriteSize)

                t /= den

                var u = (x1 - sprite.x) * (y1 - y2) - (y1 - sprite.y) * (x1 - x2)

                u /= den

                if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
                    {
                        

                        if (Math.sqrt(((x1 + t*(x2 - x1)) - x1)**2 + ((y1 + t*(y2 - y1)) - y1)**2) < distance)
                        {
                            


                            x = x1 + t*(x2 - x1)

                            y = y1 + t*(y2 - y1)

                            distance = Math.sqrt((x - x1)**2 + (y - y1)**2) //get distance from the player to the new point
                            
                            spriteIndex = index;
                            type = 1
                            
                        }
                        
                    }
            index ++
                
        })

            
            //after going through each wall, 
            distance = distance * Math.cos(this.direction - player.direction) //remove fish eye effect
            this.x2 = x
            this.y2 = y

            
            wallDistances.push([distance, linex, type, x, y, spriteIndex, color, true])

            return walls;

            
    }
}

class Bullet
{
    constructor(x, y, direction)
    {
        this.x = x
        this.y = y
        this.direction = direction
    }
    update(wallDistances)
    {
        wallDistances.forEach(object =>{
            if (object[2] == 1)
            {
                if (object[1] >= 700 - 4000 / object[0] && object[1] <= 700 + 4000 / object[0])
                {
                    sprites[object[5]].alive = false
                }
            }
        })
    }
}


class Player
{
    constructor()
    {
        this.x = 50
        this.y = 50
        this.direction = Math.PI / 3
        this.speed = 1
        this.turnspeed = .01
    }

    draw()
    {
        c.fillStyle = "white"
        c.fillRect(this.x, this.y, 10, 10)
        DrawLine(this.x + 5, this.y + 5, this.x + 5 + -Math.sin(this.direction) * 10, this.y + 5 + Math.cos(this.direction) * 10, 6, 'white')
    }

    update(walls, sprites)
    {
        if (keys.up.pressed)
        {

            for (var i = 0; i < this.speed; i++)
            {
                this.x += -Math.sin(this.direction)
                this.y += Math.cos(this.direction)

                var x1 = this.x + 5
                var x2 = this.x + -Math.sin(this.direction) * 10 + 5
                var y1 = this.y + 5
                var y2 = this.y + Math.cos(this.direction) * 10 + 5
                walls.forEach(wall=>{
                    var den = (x1 - x2) * (wall.y1 - wall.y2) - (y1 - y2) * (wall.x1 - wall.x2)

                    var t = (x1 - wall.x1) * (wall.y1 - wall.y2) - (y1 - wall.y1) * (wall.x1 - wall.x2)

                    t /= den

                    var u = (x1 - wall.x1) * (y1 - y2) - (y1 - wall.y1) * (x1 - x2)

                    u /= den

                    if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
                    {
                        this.x -= -Math.sin(this.direction)
                        this.y -= Math.cos(this.direction)                                          
                    }
                
                })
            }
            
        }
        if (keys.down.pressed)
        {
            for (var i = 0; i < this.speed; i++)
            {
                this.x -= -Math.sin(this.direction)
                this.y -= Math.cos(this.direction)

                var x1 = this.x + 5
                var x2 = this.x + -Math.sin(this.direction) * 10 + 5
                var y1 = this.y + 5
                var y2 = this.y + Math.cos(this.direction) * 10 + 5
                walls.forEach(wall=>{
                    var den = (x1 - x2) * (wall.y1 - wall.y2) - (y1 - y2) * (wall.x1 - wall.x2)

                    var t = (x1 - wall.x1) * (wall.y1 - wall.y2) - (y1 - wall.y1) * (wall.x1 - wall.x2)

                    t /= den

                    var u = (x1 - wall.x1) * (y1 - y2) - (y1 - wall.y1) * (x1 - x2)

                    u /= den

                    if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
                    {
                        this.x += -Math.sin(this.direction)
                        this.y += Math.cos(this.direction)                                          
                    }
                
                })
            }
            
        }
        if (keys.right.pressed)
        {
            if (keys.shift.pressed)
            {
                this.direction += this.turnspeed * 3
            }
            else {
                this.direction += this.turnspeed
            }
            
        }
        if (keys.left.pressed)
        {   if (keys.shift.pressed)
            {
                this.direction -= this.turnspeed * 3
            }
            else{
                this.direction -= this.turnspeed
            }
            
        }
        sprites.forEach(sprite =>{
            var distance = Math.sqrt(Math.pow(sprite.x - this.x, 2) + (Math.pow(sprite.y - this.y, 2)))
            if (distance <= 10)
            {
                sprite.alive = false
                health -= 3
            }
        })
        return sprites
    }

}

class Gun
{
    constructor()
    {
        this.x = canvas.width / 2 - 128
        this.y = canvas.height - 256
        this.width = 256
        this.height = 256
        this.animation = 0
    }
    draw()
    {  
        c.drawImage(gunSprites, this.animation * 64, 0, 64, 64, this.x, this.y, this.width, this.height)
        this.frames += 1
        if (this.frames > 5)
        {
            this.animation = 0
        }
    }
}

function draw3D(linex, distance, color, type, x, y)
{
    sizeOffset = 6000 / distance
    if (type == 0 && color == "grey")
    {
        c.drawImage(spriteSheet, (((x + y) * 16) % 64) + 0, 0, 1, 64, linex, 320 - sizeOffset / 2, 1, sizeOffset)
    }
    else if(type == 0 && color == "darkgreen")
    {
        c.drawImage(spriteSheet, (((x + y) * 16) % 64) + 128, 0, 1, 64, linex, 320 - sizeOffset / 2, 1, sizeOffset)
    }
    else {
        
        c.drawImage(spriteSheet, 65, 1, 60, 62, linex - sizeOffset / 2, 320 - sizeOffset / 2, sizeOffset, sizeOffset);
    }
    
}
var walls = GenerateWalls(0)
var player = new Player()
var rays = []
var sprites = [new Sprite(100, 100, 10, 10, 1, true)]
var gun = new Gun()
var bullet = new Bullet(0, 0, 0);

song = new Audio("song.mp3")


for (var i = 0; i < canvas.width / RES; i++)
{
    rays.push(new Ray(0, 0, 6))
}

te = 0
ft = 16
ct = Date.now()

frames = 0
healFrames = 0
damageCheckFrames = 0

function animate()
{
    st = ct
    song.play()
    requestAnimationFrame(animate);
    
    
    
    
    ct = Date.now()
    te += ct - st
    
    if (te >= ft && !end)
    {
        
        c.clearRect(0, 0, canvas.width, canvas.height)

        if (menu == 2)
        {
            wallDistances = []
            c.fillStyle = 'darkslategray'
            c.fillRect(0, 0, canvas.width, canvas.height / 2)
            c.fillStyle = 'rgba(25, 25, 25, 1)'
            c.fillRect(0, 320, canvas.width, canvas.height / 2)
    
            
            if (frames >= 120 - kills / 2)
            {
                spawn = Math.floor(Math.random() * 4)
    
                if (spawn == 0)
                    sprites.push(new Sprite(10, 10, 10, 10, 1, true))
                if (spawn == 1)
                    sprites.push(new Sprite(190, 10, 10, 10, 1, true))
                if (spawn == 2)
                    sprites.push(new Sprite(10, 190, 10, 10, 1, true))
                if (spawn == 3)
                    sprites.push(new Sprite(190, 190, 10, 10, 1, true))
                frames = 0
            }
            if (healFrames >= 60)
            {
                health += 1
                healFrames = 0
            }
            
            
    
            dir = player.direction - FOV / 2
            lines = canvas.width / RES
            change = FOV / lines
            linex = 0
            rays.forEach(ray =>
            {
                ray.update(player.x, player.y, dir, walls, linex, player.direction)
                //ray.draw()
                dir += change
                linex += RES
            })
            
            wallDistances.sort((a, b) => a[0] - b[0]) //sort from closest to farthest (so that closest draws first and farthest draws last)
            wallDistances.reverse()
            index = 0;
            wallDistances.forEach(wall=>{
                draw3D(wall[1], wall[0], wall[6], wall[2], wall[3], wall[4])
                    
                index++
            })
            
            gun.draw()
    
            /*Crosshair
    
            c.fillStyle = "white"
            c.fillRect(700 - 20, 318, 15, 5)
            c.fillRect(705, 318, 15, 5)
    
            c.fillRect(698, 320 - 20, 5, 15)
            c.fillRect(698, 325, 5, 15)
            
            */
    
            //minimap
            c.fillStyle = "black"
            c.fillRect(0, 0, 200, 200)
            sprites = player.update(walls, sprites)
            player.draw()
            
            index = 0
            sprites.forEach(sprite =>{
                if (!sprite.update(player))
                {
                    sprites.splice(index, 1)
                    kills += 1
                }
                sprite.draw()
                index++
            })
    
            walls.forEach(wall =>{
                wall.draw()
            })
    
            if (gun.animation == 0 && shoot)
            {
                    
                bullet.update(wallDistances)
                gun.frames = 0
                gun.animation = 1
                shoot = false
            }
            c.font = "40px Arcade Normal"
            c.fillStyle = "white"
            c.fillText("Kills: " + kills, 10, 400)

            c.fillStyle = "red"
            c.fillText(health + "%", 10, 500)
    
            if (kills >= 200)
            {
                menu = 3
            }
    
            if (health < 100)
            {
                healthFrames += 1
            }

            if (health <= 0)
            {
                menu = 1
            }
            
        }
        else if (menu == 1)
        {
            var title = "Corruption Crisis"

            c.fillStyle = "maroon"
            c.fillRect(0, 0, canvas.width, canvas.height)


            c.font = "60px Arcade Normal"
            c.fillStyle = "black"
            var textWidth = c.measureText(title).width
            c.fillText(title, canvas.width / 2 - textWidth / 2, 100)

            c.font = "40px Arcade Normal"
            c.fillStyle = "black"
            c.fillText("Kills: " + kills, 10, 550)

            c.font = "30px Arcade Normal"
            c.fillStyle = "black"
            textWidth = c.measureText("Click to Play").width
            c.fillText("Click to Play", canvas.width / 2 - textWidth / 2, 400)

            c.font = "20px Arcade Normal"
            c.fillStyle = "black"
            c.fillText("Move: WASD or Arrows", 1000, 450)

            c.fillText("Shoot: ENTER", 1000, 500)

            c.fillText("Quick Turn: Shift", 1000, 550)

            c.fillText("Quit: ESCAPE", 1000, 600)
        }
        else if(menu == 3)
        {
            var title = "You defeated the enemy and stopped the"
            var text2 = "corruption. Excellent work soldier."

            c.fillStyle = "goldenrod"
            c.fillRect(0, 0, canvas.width, canvas.height)


            c.font = "30px Arcade Normal"
            c.fillStyle = "black"
            var textWidth = c.measureText(title).width
            c.fillText(title, canvas.width / 2 - textWidth / 2, 100)
            textWidth = c.measureText(text2).width
            c.fillText(text2, canvas.width / 2 - textWidth / 2, 150)

            c.font = "20px Arcade Normal"
            textWidth = c.measureText("Click to Play Again").width
            c.fillText("Click to Play Again", canvas.width / 2 - textWidth / 2, 400)
        }
        

        te = 0
        frames += 1
    }

}

animate()



addEventListener('keydown', ({keyCode}) => {
    switch(keyCode)
    {
        case 87:
        //w
            keys.up.pressed = true
            break;
        case 65:
        //a
            keys.left.pressed = true
            break;
        case 83:
        //s
            keys.down.pressed = true
            break;
        case 68:
        //s
            keys.right.pressed = true
            break;
        case 38:
            keys.up.pressed = true
            break;
        case 37:
            keys.left.pressed = true
            break;
        case 40:
            keys.down.pressed = true
            break;
        case 39:
                keys.right.pressed = true
            break;
        case 13:
            if (gun.animation == 0)
                shoot = true
            break
        case 16:
            keys.shift.pressed = true
            break
        case 27:
            menu = 1;
            
    }
});

addEventListener('keyup', ({keyCode}) => {
    switch(keyCode)
    {
        case 87:
        //w
            keys.up.pressed = false
            break;
        case 65:
        //a
            keys.left.pressed = false
            break;
        case 83:
        //s
            keys.down.pressed = false
            break;
        case 68:
        //s
            keys.right.pressed = false
            break;
        case 38:
            keys.up.pressed = false
            break;
        case 37:
            keys.left.pressed = false
            break;
        case 40:
            keys.down.pressed = false
            break;
        case 39:
                keys.right.pressed = false
            break;
        case 16:
            keys.shift.pressed = false
            break
    }
});

document.onmousedown = function(e){
    if (menu == 1)
    {
        kills = 0
        player.x = 50
        player.y = 50
        player.direction = Math.PI / 3
        sprites = []
        health = 100
        menu = 2
    }
    if (menu == 3)
    {
        menu = 1
    }
}
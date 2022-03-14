# HaxBall-Simple-F1-Racing-Bot

<a href="https://discord.gg/t6Wvbqk"><img alt="Discord" src="https://img.shields.io/discord/536193210096156682?color=blue&label=DEVELOPER%27S%20DISCORD"></a>

### What is F1 Racing Bot
F1 is a different version of parkours, it is circular, unlike a yellow or a survival parkour, that's why we call the maps here as circuits. Our F1 Racing bot is made for making time trial practices **(1.1)** and letting players to improve theirselves in F1 racing maps.

Image 1.1 (A player is making practice at Vilnius F1 map)
![1 1](https://user-images.githubusercontent.com/68077608/158159666-398c89a5-90e8-4296-8263-c7540363d449.PNG)

### Functionalities
To let players know the timing during the races, we have added some functionalities into our bot. For example, speed counter, lap time counter etc. Now, let's take a look at them:

* Speed counter: By the thought of *the highest speed is the fastest lap*, we have added this function to make players able to see their speed during the race. Of course this is optional and controlled by command (see **commands** section).
* Lap time counter: Like every F1 bots in HaxBall, our bot also has a lap time counter to estimate the times of players in each laps. **(2.1)**
* Lap counter: Players can see how many laps they did during the race. After completing all the maps, player will be moved to the spectators to let others to complete theirs. This can be changed through the console panel. **(2.2)**
* Troll detection: In HaxBall rooms, we usually face with some people who are trolling others to enjoy(!) the room. In our room we have implemented a function which kicks the backwards-driving people at lap changing zone (this can be improved for whole the map by adding checkpoints). You can watch an example recording through the following: https://thehax.pl/forum/powtorki.php?nagranie=bdff85409a75fce0e90ddd4377117ee8
* Map related uniform change: Players' uniform is changed after every map was loaded **(2.3 and 2.4)**
* Map name checker: Map content won't be uploaded correctly if the name is wrong (this may occur when players are able to upload maps in the room, but as default, players are allowed to load maps just with command (see **commands** section)).
* Automatic map change: After all the players complete their laps, the circuit will be changed automatically.

Image 2.1 (Lap informations of a player is being displayed)

![2 1](https://user-images.githubusercontent.com/68077608/158161683-9217266c-1717-4fe1-b390-4460c6ec05da.PNG)

Image 2.2 (A players being moved to spectators after completing their laps)

![2 2](https://user-images.githubusercontent.com/68077608/158161688-6f5b7811-5083-4b74-936d-818e9ae55f22.PNG)

Image 2.3 (Uniform in Vilnius)

![2 3](https://user-images.githubusercontent.com/68077608/158163167-ff2f29e1-b1b3-41d4-976f-70123632bb44.PNG)

Image 2.4 (Uniform in Sucre)

![2 4](https://user-images.githubusercontent.com/68077608/158163169-3dcb2a8b-804b-4cac-ab70-66c754af14c6.PNG)

### Commands
Of course we manage our rooms with some commands. For example, map changing, speed status changing etc. So, without further ado, let's take a look at the commands:

* !admin: Changes the player's admin status.
* !circuit [ID]: Loads the map with given ID. If there's no map with given ID, then a warning will be displayed. **(admin only)** (3.1)
* !map: Displays the information (name, best lap time and its player name) about the current circuit.
* !maps: Displays the map list (name and ID). **(admin only)** (3.2)
* !speed: Turns the speed on/off. When **ON**, player can see their speed during the race.

Image 3.1 (Commands are being displayed)

![3 1](https://user-images.githubusercontent.com/68077608/158167650-8cadbbc9-8dc4-4743-9528-bde4e816fb78.PNG)

Image 3.2 (Map list is being displayed)

![3 2](https://user-images.githubusercontent.com/68077608/158167652-f5a118a5-816a-4ff4-b0d3-ac28bbe95982.PNG)

### Notes
As you can see above, our bot is yet lack of some advanced features like position/grid systems or other functionalities like AFK detectors, blocking detectors and etc. What we can say is that this is up to the user for now. There may more implementations later...

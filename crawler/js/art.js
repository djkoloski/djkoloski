function formatArt(art) {
	return '<div>' + art.replace(/\ /g, '&nbsp;').split('\n').join('</div><div>') + '</div>';
}

// Environment art

var brick_wall = formatArt('\
      |     |     |     |     |   \n\
---+--+--+--+--+--+--+--+--+--+--+\n\
   |     |     |     |     |     |\n\
---+--+--+--+--+--+--+--+--+--+--+\n\
      |     |     |     |     |   \n\
---+--+--+--+--+--+--+--+--+--+--+\n\
   |     |     |     |     |     |\n\
---+--+--+--+--+--+--+--+--+--+--+\n\
      |     |     |     |     |   \n\
---+--+--+--+--+--+--+--+--+--+--+\n\
   |     |     |     |     |     |\n\
---+--+--+--+--+--+--+--+--+--+--+\n\
      |     |     |     |     |   \n\
---+--+--+--+--+--+--+--+--+--+--+\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
');

var brick_wall_door_shut = formatArt('\
      |     |     |     |     |   \n\
---+--+--+--+--+--+--+--+--+--+--+\n\
   |     |     |     |     |     |\n\
---+--+--+--+--+--+--+--+--+--+--+\n\
      |+-+--------------+-+   |   \n\
---+--++-+--------------+-++--+--+\n\
   |   | |              | ||     |\n\
---+--+| |              | |+--+--+\n\
      || |              | |   |   \n\
---+--+| |          _   | |+--+--+\n\
   |   | |         | |  | ||     |\n\
---+--+| |          `   | |+--+--+\n\
      || |              | |   |   \n\
---+--+| |              | |+--+--+\n\
   |   | |              | ||     |\n\
---+---+-+--------------+-++-----+\n\
');

var brick_wall_door_open = formatArt('\
      |     |     |     |     |   \n\
---+--+--+--+--+--+--+--+--+--+--+\n\
   |     |     |     |     |     |\n\
---+--+--+--+--+--+--+--+--+--+--+\n\
      |+-+--------------+-+   |   \n\
---+--++-+--------------+-++--+--+\n\
   |   | |              | ||     |\n\
---+--+| |              | |+--+--+\n\
      || |              | |   |   \n\
---+--+| |              | |+--+--+\n\
   |   | |              | ||     |\n\
---+--+| |              | |+--+--+\n\
      || |              | |   |   \n\
---+--+| |              | |+--+--+\n\
   |   | |              | ||     |\n\
---+---+-+--------------+-++-----+\n\
');

var brick_floor = formatArt('\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
');

var brick_floor_trapdoor = formatArt('\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |    +---------------+  |     |\n\
   |    ]                + |     |\n\
---+----]                |-+-----+\n\
   |    ]           o    | |     |\n\
   |    ]           |    | |     |\n\
---+----]           |    |-+-----+\n\
   |    ]           o    | |     |\n\
   |    ]                | |     |\n\
---+----]                +-+-----+\n\
   |    +---------------+  |     |\n\
   |     |     |     |     |     |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
');


var brick_floor_rug = formatArt('\
   |     |     |     |     |     |\n\
   |     |     |     |     |     |\n\
---;;~~~~~~~~~~~~~~~~~~~~~~~~;;--+\n\
   ;;                        ;;  |\n\
   ;;    .-.          .-.    ;;  |\n\
---;;    | |          | |    ;;--+\n\
   ;;    *-*   .--.   *-*    ;;  |\n\
   ;;          |  |          ;;  |\n\
---;;          |  |          ;;--+\n\
   ;;    .-.   *--*   .-.    ;;  |\n\
   ;;    | |          | |    ;;  |\n\
---;;    *-*          *-*    ;;--+\n\
   ;;                        ;;  |\n\
   ;;~~~~~~~~~~~~~~~~~~~~~~~~;;  |\n\
---+-----+-----+-----+-----+-----+\n\
   |     |     |     |     |     |\n\
');

var brick_ceiling = formatArt('\
|     |     |     |     |     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |     |     |     |     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |     |     |     |     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |     |     |     |     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |     |     |     |     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |     |     |     |     |   \n\
');

var brick_ceiling_trapdoor = formatArt('\
|     |     |     |     |     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |  +--------------+     |   \n\
+-----+-+................+----+---\n\
|     | |................|    |   \n\
|     | |................|    |   \n\
+-----+-|................|----+---\n\
|     | |................|    |   \n\
|     | |................|    |   \n\
+-----+-|................|----+---\n\
|     | +................+    |   \n\
|     |  +--------------+     |   \n\
+-----+-----+-----+-----+-----+---\n\
|     |     |     |     |     |   \n\
|     |     |     |     |     |   \n\
');
var chair_chandelier = formatArt('\
 o  |  o \n\
  WWWWW  \n\
  o | o  \n\
   WWW   \n\
    o    \n\
         \n\
 \n\
 \n\
 \n\
 \n\
 .-===-. \n\
 | . . | \n\
 | .`. | \n\
()_____()\n\
||_____||\n\
 W     W \n\
');

var chest_closed = formatArt('\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 +---------+ \n\
+-----------+\n\
|   | & |   |\n\
|   *---*   |\n\
+-----------+\n\
');

var chest_open = formatArt('\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
+-----------+\n\
|     O     |\n\
|           |\n\
+-----------+\n\
');

// Enemy art

var slime_sprite = formatArt('\
 *-* \n\
( @ )\n\
 *-* \
');

var goblin_sprite = formatArt('\
_ .^-^. \n\
 |_\\_/_ \n\
 | |_|  \n\
   | |  \n\
');

var bat_sprite = formatArt('\
   _   \n\
^^(w)^^\n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \n\
 \
');

var imp_sprite = formatArt('\
    _  _  \n\
   ( )( ) \n\
   | __ | \n\
   |""""| \n\
  [__/\\__]\
');

var ghost_sprite = formatArt("\
  .-. \n\
 /   \\\n\
 |O O|\n\
 | O |\n\
  www \
");

var megaslime_sprite = formatArt("\
  __   __ \n\
 (  \\_/  )\n\
  \\ @@@ / \n\
  / @@@ \\ \n\
 (__/ \\__)\
");

// NPC art

var merchant_sprite = formatArt("\
        .--.         \n\
       |    |        \n\
  '-.__|____|__.-'   \n\
       |a a |        \n\
       | L  |        \n\
      _\\'--'/_       \n\
  _.-'\\______/'-._  \n\
 /  _          _  \\ \n\
 | | |        | | | \n\
 | | |        | | | \n\
 | \\ |        | | | \n\
  \\ \\|________| | | \n\
   \\_|__[x]___| | | \n\
 ____|________|_|_|_\n\
|                   |\n\
|                   |\
");

var sold_out_sprite = formatArt("\
S O L D\
");

// Item art

var manual_sprite = formatArt('\
+--.--+\n\
|  |  |\n\
|  |  |\n\
+--*--+\
');

var key_sprite = formatArt('\
F\n\
o\
');

var skeleton_key_sprite = formatArt('\
|#\n\
| \n\
OE\
');

var potion_sprite = formatArt('\
 ^ \n\
(_)\
');

var joker_sprite = formatArt('\
+-+\n\
|J|\n\
+-+\
');

var trump_card_sprite = formatArt('\
+-+\n\
|T|\n\
+-+\
');

var business_card_sprite = formatArt('\
+-+\n\
|~|\n\
+-+\
');

var fists_sprite = formatArt('\
 nnn\n\
c\\_/\n\
');

var stick_sprite = formatArt('\
 / \n\
 \\ \n\
 / \
');

var throwing_stick_sprite = formatArt("\
 |/\n\
 | \n\
 | \
");

var bigger_stick_sprite = formatArt("\
 || \n\
 || \n\
 || \
");

var gloves_sprite = formatArt("\
 ||||\n\
^   |\n\
\\___/\
");

var brass_knuckles_sprite = formatArt("\
 o-o-o\n\
o____/\
");

var gauntlets_sprite = formatArt("\
 nnnn\n\
n|..|\n\
\\___/\
");

var running_shoes_sprite = formatArt("\
 _.-.\n\
(___/\
");

var cleats_sprite = formatArt("\
 _.-.\n\
(___/\n\
 v v \
");

var steel_toes_sprite = formatArt("\
  .-.\n\
 _| |\n\
{___/\
");

var thimble_sprite = formatArt("\
 .-. \n\
 |`| \n\
 --- \
");

var pendant_sprite = formatArt("\
  .-.\n\
 /  |\n\
 |  /\n\
  \\/ \n\
  O  \
");

var cursed_ring_sprite = formatArt("\
O\
");
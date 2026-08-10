-- Curated corpus of 120+ widespread myths and folktales from around the world.
-- One short retelling per row, geo-coded to the culture's traditional region.
-- Pre-approved (status='approved'), kind='myth', consent_version='seed'.
-- Intended as starter content for the map; many cultures, deliberately diverse.

INSERT OR IGNORE INTO stories
  (id, kind, created_at, lat, lng, location_label, text, source,
   connection_types, connection_subject, pheno, status, consent_version, lang)
VALUES
-- Norse / Scandinavian
('seed-m-norse-yggdrasil',  'myth', 1735689600000, 63.5,  10.0, 'Norse',     'The world-tree Yggdrasil holds the nine worlds in its branches and drinks from three wells at its roots.',                     'typed', '["plant","place"]',    'Yggdrasil',         '{"ancestral":4,"sacred":4,"alive":4}', 'approved', 'seed', 'en'),
('seed-m-norse-mjolnir',    'myth', 1735689600000, 60.5,   8.0, 'Norse',     'When Thor''s hammer strikes the sky, the thunder is a stormgiant breaking, and lightning is the spark on iron.',                  'typed', '["being","sky"]',      'Thor',              '{"ancestral":4,"alive":3,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-norse-fenrir',     'myth', 1735689600000, 61.5,  13.0, 'Norse',     'The wolf Fenrir grows so vast the gods must bind him with a ribbon spun from a cat''s footfall and a fish''s breath.',         'typed', '["animal","being"]',   'Fenrir',            '{"cautionary":4,"ancestral":3,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-norse-mimir',      'myth', 1735689600000, 64.5,  11.5, 'Norse',     'At Mímir''s Well beneath one root of the world-tree, Odin traded his eye for one cold draught of wisdom.',                     'typed', '["place","element"]',  'Mímir''s well',       '{"sacred":4,"ancestral":3}', 'approved', 'seed', 'en'),

-- Greek
('seed-m-greek-daphne',     'myth', 1735689600000, 38.0,  22.5, 'Greek',     'Fleeing Apollo, the nymph Daphne calls to her father the river-god and is turned into the first laurel tree.',                 'typed', '["plant","being"]',    'laurel tree',       '{"alive":4,"comforting":2,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-greek-persephone', 'myth', 1735689600000, 38.5,  22.8, 'Greek',     'Persephone eats six pomegranate seeds in the underworld; the world keeps winter as many months as her absence.',              'typed', '["being","plant"]',    'Persephone',        '{"ancestral":3,"cautionary":2,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-greek-pan',        'myth', 1735689600000, 37.5,  22.2, 'Greek',     'In the noon-still woods of Arcadia, Pan plays a reed-pipe; travellers who hear it without seeing him feel a strange panic.',  'typed', '["being","plant"]',    'Pan',               '{"alive":4,"cautionary":2}', 'approved', 'seed', 'en'),
('seed-m-greek-echo',       'myth', 1735689600000, 38.3,  23.5, 'Greek',     'Echo, punished to repeat only the words of others, wastes away until she is only a voice the stones return.',                  'typed', '["being","place"]',    'Echo',              '{"comforting":2,"ancestral":2}', 'approved', 'seed', 'en'),

-- Celtic / Irish & Welsh
('seed-m-irish-salmon',     'myth', 1735689600000, 53.4,  -8.0, 'Irish',     'Whoever first tastes the Salmon of Knowledge, who feeds on the hazelnuts that fall in the well, gains all wisdom.',            'typed', '["animal","plant"]',   'Salmon of Knowledge','{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-irish-selkie',     'myth', 1735689600000, 54.5,  -9.0, 'Irish',     'Selkies shed their seal-skins on moonlit shores; a man who hides the skin keeps the woman until she finds it again.',           'typed', '["animal","being"]',   'selkie',            '{"comforting":2,"cautionary":3}', 'approved', 'seed', 'en'),
('seed-m-irish-sidhe',      'myth', 1735689600000, 53.0,  -7.5, 'Irish',     'The Tuatha Dé Danann withdrew into the green hills, where they still hold their bright halls beneath the sídhe mounds.',     'typed', '["place","being"]',    'sídhe mounds',      '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-welsh-rhiannon',   'myth', 1735689600000, 52.4,  -3.7, 'Welsh',     'Rhiannon rides a white horse no rider can overtake, slow as walking yet always ahead, until she chooses to be caught.',        'typed', '["being","animal"]',   'Rhiannon',          '{"alive":3,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-welsh-blodeuwedd', 'myth', 1735689600000, 53.0,  -4.1, 'Welsh',     'Blodeuwedd was conjured from oak, broom, and meadowsweet to be a wife, and turned to an owl for her betrayal.',                 'typed', '["plant","animal"]',   'Blodeuwedd',        '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),

-- Slavic
('seed-m-slavic-babayaga',  'myth', 1735689600000, 55.7,  37.6, 'Slavic',    'Baba Yaga''s hut walks on chicken legs at the edge of the deep wood; she eats some who come, helps others, and reads the bones.', 'typed', '["being","place"]',    'Baba Yaga',         '{"cautionary":4,"ancestral":3}', 'approved', 'seed', 'en'),
('seed-m-slavic-leshy',     'myth', 1735689600000, 56.2,  35.0, 'Slavic',    'The Leshy of the forest can change his height to match a blade of grass or a pine; lost travelers wear clothes inside-out to leave.', 'typed', '["being","place"]',    'Leshy',             '{"alive":3,"cautionary":3}', 'approved', 'seed', 'en'),
('seed-m-slavic-rusalka',   'myth', 1735689600000, 50.5,  30.5, 'Slavic',    'Rusalki come from the rivers in early summer, dance in the rye, and draw down anyone who answers their laughter.',                'typed', '["being","element"]',  'Rusalka',           '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-slavic-domovoy',   'myth', 1735689600000, 53.9,  27.5, 'Slavic',    'The Domovoy lives behind the stove of every house; you leave him bread and salt and he keeps the cattle calm in the byre.',     'typed', '["being","place"]',    'Domovoy',           '{"comforting":4,"ancestral":3}', 'approved', 'seed', 'en'),

-- Baltic
('seed-m-baltic-saule',     'myth', 1735689600000, 55.3,  23.9, 'Lithuanian','Saulė the sun-mother drives a copper-wheeled wagon across the day-sky and washes the horses in the western sea at evening.',  'typed', '["sky","being"]',      'Saulė',             '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-baltic-zaltys',    'myth', 1735689600000, 56.0,  24.1, 'Lithuanian','The grass-snake žaltys is sacred to the household; whoever harms one calls down lightning on the roof.',                          'typed', '["animal","being"]',   'žaltys',            '{"cautionary":3,"sacred":3}', 'approved', 'seed', 'en'),

-- Egyptian
('seed-m-egypt-ra',         'myth', 1735689600000, 25.7,  32.6, 'Egyptian',  'Each night Ra sails his solar barque through the twelve dark halls of the underworld and at dawn is born again from the eastern sky.', 'typed', '["sky","being"]',      'Ra',                '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-egypt-isis',       'myth', 1735689600000, 26.5,  31.5, 'Egyptian',  'Isis gathers the scattered body of Osiris, breathes life back into him, and the green Nile rises each year to remember.',           'typed', '["being","element"]',  'Osiris',            '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),
('seed-m-egypt-bastet',     'myth', 1735689600000, 30.6,  31.2, 'Egyptian',  'Bastet sits as house-cat by day and ranges as lioness by night, guarding the home against the snakes of the dark.',                'typed', '["animal","being"]',   'Bastet',            '{"comforting":3,"sacred":3}', 'approved', 'seed', 'en'),

-- Yoruba
('seed-m-yoruba-oshun',     'myth', 1735689600000, 7.7,    4.5, 'Yoruba',    'When the world dried, the orisha Oshun came as honey-sweet river and danced until the rivers ran again.',                       'typed', '["element","being"]',  'Oshun',             '{"comforting":4,"sacred":4,"alive":4}', 'approved', 'seed', 'en'),
('seed-m-yoruba-sango',     'myth', 1735689600000, 7.5,    4.4, 'Yoruba',    'Sango speaks in thunder; the meteorite stones that fall after a storm are his axes, kept on the household shrine.',             'typed', '["sky","being"]',      'Sango',             '{"sacred":4,"cautionary":3}', 'approved', 'seed', 'en'),
('seed-m-yoruba-olokun',    'myth', 1735689600000, 6.3,    3.4, 'Yoruba',    'Olokun rules the deep where the ocean has no floor; the orishas keep the world by holding the chain to that quiet kingdom.',     'typed', '["element","being"]',  'Olokun',            '{"sacred":4,"ancestral":3}', 'approved', 'seed', 'en'),

-- Akan
('seed-m-akan-anansi',      'myth', 1735689600000, 6.7,   -1.6, 'Akan',      'Anansi the spider bought all the world''s stories from the sky-god with a leopard, hornets, and a fairy, and gave them to people.', 'typed', '["animal","being"]',   'Anansi',            '{"ancestral":4,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-akan-asaseya',     'myth', 1735689600000, 7.0,   -1.2, 'Akan',      'Asase Ya is the old mother earth; Thursday is hers, and no spade enters her body without thanks.',                                'typed', '["being","place"]',    'Asase Ya',          '{"sacred":4,"ancestral":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Zulu / Southern Africa
('seed-m-zulu-unkulunkulu', 'myth', 1735689600000, -28.5, 31.0, 'Zulu',      'Unkulunkulu, the first ancestor, broke off from a reed-bed and brought people, cattle, and the knowledge of the moon.',           'typed', '["being","plant"]',    'Unkulunkulu',       '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-zulu-inkanyamba',  'myth', 1735689600000, -29.6, 30.4, 'Zulu',      'Inkanyamba, the storm-serpent of the high pools, flies between waters and pulls the funnel of the storm behind it.',           'typed', '["animal","element"]', 'Inkanyamba',        '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),

-- Maasai
('seed-m-maasai-enkai',     'myth', 1735689600000, -1.3,  36.8, 'Maasai',    'Enkai lowered the cattle down a long leather thong from the sky, and the Maasai have herded them ever since.',                   'typed', '["sky","animal"]',     'Enkai',             '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-maasai-rain',      'myth', 1735689600000, -1.5,  37.1, 'Maasai',    'When the rains come slowly, the black god of the dark clouds is being asked nicely; the red sky is his anger.',                  'typed', '["element","sky"]',    'rain',              '{"sacred":3,"cautionary":2}', 'approved', 'seed', 'en'),

-- San (Botswana / Kalahari)
('seed-m-san-mantis',       'myth', 1735689600000, -22.4, 23.8, 'San',       '/Kaggen the mantis dreams the moon into being from his sandal, and the eland from his sweat.',                                  'typed', '["animal","being"]',   '/Kaggen',           '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),

-- Hindu
('seed-m-hindu-ganga',      'myth', 1735689600000, 25.3,  82.9, 'Hindu',     'Ganga descends from the sky; only Shiva''s matted hair can slow her fall, and even then she breaks into the rivers of the world.',  'typed', '["element","being"]',  'Ganga',             '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-hindu-matsya',     'myth', 1735689600000, 22.3,  77.0, 'Hindu',     'Matsya, the first avatar of Vishnu, comes as a great fish and pulls the ark of seeds through the flood until the waters fall.',  'typed', '["animal","being"]',   'Matsya',            '{"sacred":4,"ancestral":3}', 'approved', 'seed', 'en'),
('seed-m-hindu-hanuman',    'myth', 1735689600000, 13.0,  79.0, 'Hindu',     'Hanuman leaps the ocean to Lanka in a single bound; when his strength is forgotten, only a word is needed to remember it.',       'typed', '["animal","being"]',   'Hanuman',           '{"comforting":3,"ancestral":3}', 'approved', 'seed', 'en'),
('seed-m-hindu-kailash',    'myth', 1735689600000, 31.0,  81.3, 'Hindu',     'Mount Kailash is the seat of Shiva; the four great rivers of the subcontinent take their first water from its slopes.',           'typed', '["place","being"]',    'Mount Kailash',     '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),

-- Buddhist (Himalaya)
('seed-m-buddha-bodhi',     'myth', 1735689600000, 24.7,  85.0, 'Buddhist',  'Under the Bodhi tree the wanderer sat through one night, refused every distraction, and awakened at first light.',                'typed', '["plant","being"]',    'Bodhi tree',        '{"sacred":4,"comforting":4}', 'approved', 'seed', 'en'),
('seed-m-buddha-naga',      'myth', 1735689600000, 27.7,  85.3, 'Buddhist',  'When the Buddha sat in storm, the naga king Mucalinda rose from the pool and spread his seven hoods as a roof above him.',     'typed', '["animal","being"]',   'Mucalinda',         '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),
('seed-m-buddha-lotus',     'myth', 1735689600000, 27.4,  85.3, 'Buddhist',  'Where the Buddha first stepped as a child, lotuses opened in the mud at his feet — clean things born of the dark.',           'typed', '["plant","being"]',    'lotus',             '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Chinese
('seed-m-china-nuwa',       'myth', 1735689600000, 34.7, 113.7, 'Chinese',   'When the sky cracked, Nüwa patched it with stones of five colours and propped the corners with the legs of a great tortoise.',  'typed', '["sky","being"]',      'Nüwa',              '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-china-houyi',      'myth', 1735689600000, 36.0, 111.5, 'Chinese',   'When ten suns rose at once and burned the earth, the archer Houyi shot down nine and left one to keep the days warm.',         'typed', '["sky","being"]',      'Houyi',             '{"ancestral":3,"cautionary":2}', 'approved', 'seed', 'en'),
('seed-m-china-fenghuang',  'myth', 1735689600000, 28.7, 113.4, 'Chinese',   'The Fenghuang appears only when the world is at peace; her tail holds all five colours and her song the five tones.',          'typed', '["animal","sky"]',     'Fenghuang',         '{"sacred":4,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-china-dragon',     'myth', 1735689600000, 30.6, 114.3, 'Chinese',   'Each river of China is guarded by a dragon; in spring, when the dragon stretches, the rain begins.',                            'typed', '["animal","element"]', 'river dragon',      '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),

-- Japanese
('seed-m-japan-amaterasu',  'myth', 1735689600000, 32.1, 131.7, 'Japanese',  'Amaterasu hides in a cave; the gods laugh until she peeks out to see what is so funny, and the sun returns to the world.',    'typed', '["sky","being"]',      'Amaterasu',         '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),
('seed-m-japan-kitsune',    'myth', 1735689600000, 35.2, 136.0, 'Japanese',  'Kitsune, the fox of nine tails, serves Inari; the rice rises tall where she is honoured at the red gates.',                    'typed', '["animal","being"]',   'kitsune',           '{"sacred":3,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-japan-sakura',     'myth', 1735689600000, 35.0, 135.7, 'Japanese',  'The blossoms of the sakura last only a week so that we will remember to look at them while we are alive.',                     'typed', '["plant","sky"]',      'sakura',            '{"comforting":3,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-japan-orochi',     'myth', 1735689600000, 35.4, 132.7, 'Japanese',  'Susanoo gives the eight-headed Yamata no Orochi eight tubs of rice-wine; while it sleeps he cuts off each head.',              'typed', '["animal","being"]',   'Yamata no Orochi',  '{"cautionary":3,"ancestral":2}', 'approved', 'seed', 'en'),

-- Korean
('seed-m-korea-dangun',     'myth', 1735689600000, 37.6, 127.0, 'Korean',    'A bear who ate garlic and mugwort in a cave for a hundred days became a woman; her son Dangun founded the first kingdom.',     'typed', '["animal","being"]',   'Dangun',            '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-korea-sansin',     'myth', 1735689600000, 35.9, 127.6, 'Korean',    'Each mountain has a Sansin, often an old man with a tiger; you leave him rice cakes and ask his courtesy on the path.',         'typed', '["being","place"]',    'Sansin',            '{"sacred":3,"alive":3}', 'approved', 'seed', 'en'),

-- Mongolian
('seed-m-mongol-tengri',    'myth', 1735689600000, 47.9, 106.9, 'Mongolian', 'Tengri is the wide blue sky, father of the world; the steppe is the felt his herds graze on.',                                  'typed', '["sky","being"]',      'Tengri',            '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-mongol-olgoi',     'myth', 1735689600000, 43.5, 103.5, 'Mongolian', 'The Olgoi-Khorkhoi, the death-worm of the Gobi, sleeps under the dunes for years; it kills with a touch and is never seen twice.', 'typed', '["animal","place"]',   'Olgoi-Khorkhoi',    '{"cautionary":4,"alive":2}', 'approved', 'seed', 'en'),

-- Mesopotamian
('seed-m-meso-gilgamesh',   'myth', 1735689600000, 32.5,  44.4, 'Mesopotamian','Gilgamesh and Enkidu cut down the cedars of the Forest of Humbaba; afterwards Enkidu sickens and dies and Gilgamesh is broken.', 'typed', '["plant","being"]',    'Cedar Forest',      '{"cautionary":4,"ancestral":3}', 'approved', 'seed', 'en'),
('seed-m-meso-enki',        'myth', 1735689600000, 30.6,  46.1, 'Mesopotamian','Enki''s fresh water rises beneath the salt; whenever a reed grows where there is no river, he has answered someone''s thirst.', 'typed', '["element","being"]',  'Enki',              '{"sacred":3,"comforting":3}', 'approved', 'seed', 'en'),

-- Persian
('seed-m-persian-simurgh',  'myth', 1735689600000, 32.7,  51.7, 'Persian',   'The Simurgh roosts in the Tree of All Seeds at the top of the world; every grain on earth is shaken down from her preening.',    'typed', '["animal","plant"]',   'Simurgh',           '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),
('seed-m-persian-mithra',   'myth', 1735689600000, 35.7,  51.4, 'Persian',   'Mithra was born from a rock at the winter dawn and lit the first day of every year by drawing his bow at the dark.',             'typed', '["being","sky"]',      'Mithra',            '{"sacred":4,"ancestral":3}', 'approved', 'seed', 'en'),

-- Arabian
('seed-m-arab-roc',         'myth', 1735689600000, 24.5,  39.6, 'Arabian',   'The Roc nests on a single peak in the unmapped sea; its wings darken a whole day''s sailing and it feeds elephants to its young.',  'typed', '["animal","sky"]',     'Roc',               '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-arab-djinn',       'myth', 1735689600000, 23.5,  45.0, 'Arabian',   'The jinn are made of smokeless fire; they come at the turning hours of dusk and dawn and travel along old caravan tracks.',         'typed', '["being","element"]',  'jinn',              '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),

-- Hawaiian
('seed-m-hawaii-pele',      'myth', 1735689600000, 19.4, -155.3,'Hawaiian',  'Pele lives in the crater of Halemaʻumaʻu; every lava flow is her foot moving, and her sister Hi''iaka is the green that follows.', 'typed', '["place","being"]',    'Pele',              '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),
('seed-m-hawaii-maui',      'myth', 1735689600000, 20.8, -156.3,'Hawaiian',  'Maui braided a great rope and lassoed the sun, releasing it only when it promised to walk slowly enough for the bark to dry.',     'typed', '["sky","being"]',      'Māui',              '{"ancestral":4,"comforting":2}', 'approved', 'seed', 'en'),
('seed-m-hawaii-kanaloa',   'myth', 1735689600000, 21.3, -157.8,'Hawaiian',  'Kanaloa rules the deep and the long swimming creatures; salt water is his breath, and the whale is his messenger.',                'typed', '["element","being"]',  'Kanaloa',           '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),

-- Maori
('seed-m-maori-tane',       'myth', 1735689600000, -41.3, 174.8,'Māori',     'Ranginui the sky lay on Papatūānuku the earth in a long embrace; their son Tāne pushed them apart so light could enter the world.', 'typed', '["being","sky"]',      'Tāne',              '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-maori-maui',       'myth', 1735689600000, -37.0, 174.9,'Māori',     'Māui fished the North Island up from the sea using a jawbone hook baited with his own blood.',                                    'typed', '["being","element"]',  'Māui',              '{"ancestral":4,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-maori-tangaroa',   'myth', 1735689600000, -45.0, 168.9,'Māori',     'Tangaroa is the sea; the fish are his children, and a storm is him searching for those who took without thanks.',                  'typed', '["element","being"]',  'Tangaroa',          '{"sacred":4,"cautionary":2}', 'approved', 'seed', 'en'),

-- Australian Aboriginal
('seed-m-aus-rainbow',      'myth', 1735689600000, -12.5, 131.0,'Aboriginal','The Rainbow Serpent cut the channels of the rivers in the long-ago, then lay down to sleep in the deep waterholes.',              'typed', '["animal","place"]',   'Rainbow Serpent',   '{"sacred":4,"ancestral":4,"alive":4}', 'approved', 'seed', 'en'),
('seed-m-aus-tjukurpa',     'myth', 1735689600000, -25.3, 131.0,'Aboriginal','The Tjukurpa is the long song of the ancestors; the country itself is what they laid down as they walked.',                       'typed', '["place","being"]',    'Tjukurpa',          '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-aus-bunyip',       'myth', 1735689600000, -34.5, 142.0,'Aboriginal','The Bunyip lives at the bottom of billabongs; when its bellow comes through the reeds, you do not go to the water that night.',   'typed', '["animal","place"]',   'Bunyip',            '{"cautionary":4,"alive":2}', 'approved', 'seed', 'en'),

-- Polynesian (Samoa)
('seed-m-poly-tagaloa',     'myth', 1735689600000, -13.8,-171.8,'Samoan',    'Tagaloa-lagi rolled stones into the sea and the islands grew from them; the sea-snail crawled the first coast.',                  'typed', '["being","element"]',  'Tagaloa',           '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),

-- Andean
('seed-m-andes-pachamama',  'myth', 1735689600000, -16.5, -71.0,'Andean',    'Before the first sip of any drink you tip a little to Pachamama, the mountain-earth-mother who feeds the herds and the children.','typed', '["being","place"]',    'Pachamama',         '{"sacred":4,"comforting":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-andes-inti',       'myth', 1735689600000, -13.5, -71.9,'Andean',    'Inti the sun rose first from Lake Titicaca and sent his children to teach the people maize, weaving, and the calendar.',         'typed', '["sky","being"]',      'Inti',              '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-andes-mama-killa', 'myth', 1735689600000, -14.0, -72.0,'Andean',    'When a jaguar attacks the moon, an eclipse is the bite; people beat drums and shout to scare it off until Mama Killa is whole.','typed', '["sky","animal"]',     'Mama Killa',        '{"cautionary":3,"sacred":3}', 'approved', 'seed', 'en'),

-- Aztec / Nahua
('seed-m-aztec-quetzal',    'myth', 1735689600000, 19.4,  -98.9,'Aztec',     'Quetzalcoatl, the feathered serpent, gathered the bones of the old world and sprinkled them with his blood to make people.',     'typed', '["animal","being"]',   'Quetzalcoatl',      '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-aztec-tlaloc',     'myth', 1735689600000, 19.2,  -98.6,'Aztec',     'Tlaloc keeps four jars of rain in his hall above the peaks; he tips one each season and chooses whether it is gentle or fierce.','typed', '["element","being"]',  'Tlaloc',            '{"sacred":4,"cautionary":2}', 'approved', 'seed', 'en'),
('seed-m-aztec-xochi',      'myth', 1735689600000, 19.5,  -99.1,'Aztec',     'Xochiquetzal weaves flowers and small singing creatures; where she dances, the marigolds open in colour even after death.',     'typed', '["plant","being"]',    'Xochiquetzal',      '{"comforting":4,"sacred":3}', 'approved', 'seed', 'en'),

-- Maya
('seed-m-maya-ceiba',       'myth', 1735689600000, 20.7,  -88.6,'Maya',      'The Ceiba is the world tree; its roots are in the underworld, its trunk is this earth, and its branches hold the thirteen heavens.','typed', '["plant","place"]',    'Ceiba',             '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-maya-jaguar',      'myth', 1735689600000, 17.9,  -89.0,'Maya',      'At night the sun walks the underworld as a jaguar; the spotted hide is the sky covered in stars.',                                'typed', '["animal","sky"]',     'jaguar sun',        '{"sacred":4,"alive":3}', 'approved', 'seed', 'en'),

-- Navajo
('seed-m-navajo-spider',    'myth', 1735689600000, 36.7, -109.0,'Navajo',    'Spider Grandmother taught the people to weave; her web is the pattern of the rugs and of the relations between them.',             'typed', '["animal","being"]',   'Spider Grandmother','{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-navajo-changing',  'myth', 1735689600000, 35.8, -109.5,'Navajo',    'Changing Woman walks east, south, west, north through the seasons; growing old as winter, young again as spring.',               'typed', '["being","sky"]',      'Changing Woman',    '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Lakota
('seed-m-lakota-whitebuf',  'myth', 1735689600000, 44.0, -103.5,'Lakota',    'White Buffalo Calf Woman walked into camp during a famine, gave the people the sacred pipe, and walked out as a white buffalo.',  'typed', '["animal","being"]',   'White Buffalo Woman','{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-lakota-wakan',     'myth', 1735689600000, 44.4, -101.0,'Lakota',    'Wakan Tanka is the great mystery; everything that is, is a part of it, including the meadowlark that wakes you at dawn.',           'typed', '["being","sky"]',      'Wakan Tanka',       '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),

-- Cherokee
('seed-m-cherokee-selu',    'myth', 1735689600000, 35.5,  -83.3,'Cherokee',  'Selu, the corn-mother, taught the people to plant maize; rubbing her belly and her armpits, she fed the village from her own body.','typed', '["plant","being"]',    'Selu',              '{"ancestral":4,"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),
('seed-m-cherokee-yowa',    'myth', 1735689600000, 35.7,  -84.0,'Cherokee',  'In the beginning the world was lit only by the fire kept by Grandmother Spider, who carried a coal across the great water.',         'typed', '["element","animal"]', 'first fire',        '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),

-- Inuit
('seed-m-inuit-sedna',      'myth', 1735689600000, 71.0, -100.0,'Inuit',     'Sedna lives at the bottom of the sea; she combs the dirty hair of the sea-mammals and lets them rise again to be hunted.',         'typed', '["being","element"]',  'Sedna',             '{"ancestral":4,"sacred":4}', 'approved', 'seed', 'en'),
('seed-m-inuit-sila',       'myth', 1735689600000, 66.5,  -53.5,'Inuit',     'Sila is the breath of the world; when Sila is angry the wind comes hard, when calm the snow falls so quietly you can hear the dogs eat.','typed', '["sky","being"]',      'Sila',              '{"sacred":3,"comforting":2}', 'approved', 'seed', 'en'),

-- Mapuche
('seed-m-mapuche-pillan',   'myth', 1735689600000, -38.7, -71.6,'Mapuche',   'Each volcano holds a Pillán, an ancestral spirit; the ash and red light are him remembering an old fight.',                       'typed', '["place","being"]',    'Pillán',            '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en'),
('seed-m-mapuche-trentren', 'myth', 1735689600000, -40.6, -73.1,'Mapuche',   'When Kai-Kai the sea-serpent floods the land, Tren-Tren the mountain-serpent lifts the hills to keep the people above the water.', 'typed', '["animal","element"]', 'Tren-Tren',         '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),

-- Anishinaabe
('seed-m-anish-nanabozho',  'myth', 1735689600000, 46.0,  -85.0,'Anishinaabe','Nanabozho the great hare named the plants and animals; what he forgot is what we still don''t know the use of.',                  'typed', '["animal","being"]',   'Nanabozho',         '{"ancestral":3,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-anish-thunderbird','myth', 1735689600000, 47.5,  -86.5,'Anishinaabe','Thunderbirds nest on the cliffs above the great lakes; thunder is their wings, lightning is what they hunt with.',               'typed', '["animal","sky"]',     'Thunderbird',       '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),

-- Iroquois / Haudenosaunee
('seed-m-iroquois-turtle',  'myth', 1735689600000, 43.0,  -75.5,'Haudenosaunee','When Sky Woman fell, the water animals dove for soil; muskrat brought up a handful and they spread it on turtle''s back: this earth.','typed', '["animal","place"]',   'Great Turtle',      '{"ancestral":4,"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Amazonian
('seed-m-amazon-anaconda',  'myth', 1735689600000, -4.0, -72.0,'Amazonian',  'The first peoples were carried up the river in the belly of the great Anaconda and stepped out at each village she stopped at.',  'typed', '["animal","element"]', 'great Anaconda',    '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-amazon-yacuruna',  'myth', 1735689600000, -3.5, -73.0,'Amazonian',  'Yacuruna live in cities at the bottom of the river, upside down; fishers who fall asleep on the bank wake there as one of them.',  'typed', '["being","element"]',  'Yacuruna',          '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),

-- Finnish / Karelian
('seed-m-finn-vainamoinen', 'myth', 1735689600000, 62.0,  26.0, 'Finnish',   'Väinämöinen sang the world into being, then sang the runes; the lakes are still listening for the next verse.',                  'typed', '["being","element"]',  'Väinämöinen',       '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),
('seed-m-finn-sampo',       'myth', 1735689600000, 65.0,  26.5, 'Finnish',   'The Sampo grinds salt, grain, and gold without stopping; when it broke into the sea the world became less abundant.',              'typed', '["element","place"]',  'Sampo',             '{"cautionary":2,"ancestral":3}', 'approved', 'seed', 'en'),

-- Sami
('seed-m-sami-stallo',      'myth', 1735689600000, 68.5,  21.5, 'Sami',      'Stallo lives at the edge of the forest with iron teeth and a sledge of human bones; he is slow, but he never stops.',              'typed', '["being","place"]',    'Stallo',            '{"cautionary":4,"ancestral":3}', 'approved', 'seed', 'en'),

-- Basque
('seed-m-basque-mari',      'myth', 1735689600000, 43.1,  -2.0, 'Basque',    'Mari, the queen of the mountains, moves between caves of Anboto and Txindoki; the weather follows where she sleeps that season.',  'typed', '["being","place"]',    'Mari',              '{"sacred":4,"alive":3}', 'approved', 'seed', 'en'),

-- Tibetan / Himalayan
('seed-m-tibet-yeti',       'myth', 1735689600000, 28.0,  86.9, 'Tibetan',   'On the high passes the yeti walks in the snow; her tracks are bigger than a man''s and they always lead higher.',                  'typed', '["animal","place"]',   'yeti',              '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),
('seed-m-tibet-yidam',      'myth', 1735689600000, 30.0,  91.0, 'Tibetan',   'Each mountain holds a deity; the prayer flags carry the wind''s blessing to them and back down to the valleys.',                 'typed', '["being","sky"]',      'mountain deity',    '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Thai / Southeast Asian
('seed-m-thai-naga',        'myth', 1735689600000, 17.4, 104.8, 'Thai',      'Each year the nāga of the Mekong shoot balls of fire up from the river on the full moon at the end of the rains.',               'typed', '["animal","element"]', 'Mekong nāga',       '{"sacred":4,"alive":4}', 'approved', 'seed', 'en'),
('seed-m-thai-phi',         'myth', 1735689600000, 18.8,  98.9, 'Thai',      'Every tree of certain age holds a phi; before you cut one you tie a sash around the trunk and ask, three times, for its leave.',  'typed', '["plant","being"]',    'tree phi',          '{"sacred":3,"alive":3}', 'approved', 'seed', 'en'),

-- Filipino
('seed-m-philip-bakunawa', 'myth', 1735689600000, 14.0, 121.0, 'Filipino',  'Bakunawa, the moon-eating serpent, was sent up from the sea to swallow the seven moons; six are gone and one we keep watch over.',  'typed', '["animal","sky"]',     'Bakunawa',          '{"cautionary":3,"alive":3}', 'approved', 'seed', 'en'),

-- Indonesian / Balinese
('seed-m-bali-banaspati',  'myth', 1735689600000, -8.3, 115.1,'Balinese',   'Banaspati Raja, lord of the forest, sits at the heart of every grove; the bird that calls his name is sacred.',                    'typed', '["being","plant"]',    'Banaspati Raja',    '{"sacred":4,"alive":3}', 'approved', 'seed', 'en'),

-- Vietnamese
('seed-m-viet-lacdragon',  'myth', 1735689600000, 21.0, 105.8,'Vietnamese', 'The Lạc Dragon Lord and Âu Cơ the mountain fairy had a hundred children; fifty followed her up to the highlands, fifty went to the sea.','typed', '["being","animal"]',   'Lạc Long Quân',     '{"ancestral":4,"sacred":3}', 'approved', 'seed', 'en'),

-- Hmong
('seed-m-hmong-flood',     'myth', 1735689600000, 22.5, 103.4,'Hmong',      'A brother and sister survive the flood inside a hollow drum and re-people the world from a single gourd.',                      'typed', '["element","plant"]',  'gourd',             '{"ancestral":3,"comforting":2}', 'approved', 'seed', 'en'),

-- Romani
('seed-m-roma-keshalyi',   'myth', 1735689600000, 47.5,  19.0, 'Romani',     'The Keshalyi are forest-women with hair longer than they are tall; they spin the threads of unborn lives in birch hollows.',     'typed', '["being","plant"]',    'Keshalyi',          '{"sacred":3,"alive":3}', 'approved', 'seed', 'en'),

-- Armenian
('seed-m-armen-vahagn',    'myth', 1735689600000, 40.2,  44.5, 'Armenian',   'Vahagn was born from the reed of the sea: hair of flame, eyes of two suns; the first dragon he killed gave the rivers their courses.','typed', '["being","element"]',  'Vahagn',            '{"ancestral":3,"sacred":3}', 'approved', 'seed', 'en'),

-- Georgian (Caucasus)
('seed-m-georgia-amirani', 'myth', 1735689600000, 42.3,  43.4, 'Georgian',   'Amirani stole fire for the people and was chained to a peak in the Caucasus; his dog licks the chain a little thinner each night.',  'typed', '["element","being"]',  'Amirani',           '{"ancestral":3,"cautionary":2}', 'approved', 'seed', 'en'),

-- Ethiopian / Cushitic
('seed-m-ethio-waaq',      'myth', 1735689600000,  9.0,  38.7, 'Ethiopian',  'Waaq is the sky and the rain; in the long droughts the elders go up the hill and ask him quietly for the relief of the herds.',  'typed', '["sky","being"]',      'Waaq',              '{"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Malagasy
('seed-m-malagasy-razana', 'myth', 1735689600000, -18.9, 47.5, 'Malagasy',   'The razana, the ancestors, live in the standing stones and in the dry tombs; the famadihana is the day they are unwrapped and danced with.','typed', '["being","place"]',    'razana',            '{"ancestral":4,"sacred":4,"comforting":3}', 'approved', 'seed', 'en'),

-- Quechua / Aymara
('seed-m-quechua-apus',    'myth', 1735689600000, -15.8, -71.7,'Quechua',    'The Apus are the great peaks; each has a name and a temper, and the people read their snow each season to know what is coming.',  'typed', '["place","being"]',    'Apus',              '{"sacred":4,"ancestral":4}', 'approved', 'seed', 'en');

/* Gravity 1650 — la carte en cinq langues (page test).
   Clé : texte français exact de la carte. Valeurs : anglais, espagnol, allemand, chinois.
   Un texte absent du dictionnaire (marques, noms propres) reste en français. */
(function () {
  'use strict';

  var LANGS = ['fr', 'en', 'es', 'de', 'zh'];
  var ALC = ['Contains alcohol, adults only', 'Contiene alcohol, solo para adultos', 'Enthält Alkohol, nur für Erwachsene', '含酒精，仅限成人'];
  var T = {
    'La carte': ['The menu', 'La carta', 'Speisekarte', '菜单'],
    'Notre carte': ['Our menu', 'Nuestra carta', 'Unsere Karte', '我们的菜单'],
    'Choisissez une catégorie, elle se déplie avec les plats, les ingrédients et les prix.': ['Pick a category to see the dishes, ingredients and prices.', 'Elija una categoría para ver los platos, los ingredientes y los precios.', 'Wählen Sie eine Kategorie: Gerichte, Zutaten und Preise erscheinen sofort.', '选择一个类别，即可查看菜品、配料和价格。'],
    'Langue': ['Language', 'Idioma', 'Sprache', '语言'],
    'Langue de la carte': ['Menu language', 'Idioma de la carta', 'Sprache der Karte', '菜单语言'],
    'Catégories de la carte': ['Menu categories', 'Categorías de la carta', 'Kategorien der Karte', '菜单类别'],

    'Nos burgers': ['Our burgers', 'Nuestras hamburguesas', 'Unsere Burger', '汉堡'],
    'Le côté brasserie': ['Brasserie classics', 'Platos de brasserie', 'Brasserie-Klassiker', '法式小馆主菜'],
    'Nos paninis': ['Our paninis', 'Nuestros paninis', 'Unsere Paninis', '帕尼尼'],
    'Les salades': ['Salads', 'Ensaladas', 'Salate', '沙拉'],
    'Menu enfant': ["Kids' menu", 'Menú infantil', 'Kindermenü', '儿童套餐'],
    'Crêpes et gaufres': ['Crêpes & waffles', 'Crepes y gofres', 'Crêpes & Waffeln', '可丽饼与华夫饼'],
    'Coupes glacées': ['Ice cream sundaes', 'Copas de helado', 'Eisbecher', '冰淇淋圣代'],
    'Nos glaces': ['Ice cream', 'Helados', 'Eis', '冰淇淋'],
    'Les petits plaisirs': ['Little treats', 'Pequeños caprichos', 'Kleine Genüsse', '甜点小食'],
    'Boissons fraîches': ['Cold drinks', 'Bebidas frías', 'Kalte Getränke', '冷饮'],
    'Boissons chaudes': ['Hot drinks', 'Bebidas calientes', 'Heiße Getränke', '热饮'],
    'Nos bières': ['Beers', 'Cervezas', 'Biere', '啤酒'],
    'Cocktails et apéritifs': ['Cocktails & aperitifs', 'Cócteles y aperitivos', 'Cocktails & Aperitifs', '鸡尾酒与开胃酒'],
    'Digestifs': ['Digestifs', 'Digestivos', 'Digestifs', '餐后酒'],

    'Servis avec frites. Supplément steak : 4,00 €.': ['Served with fries. Extra patty: 4,00 €.', 'Servidas con patatas fritas. Carne extra: 4,00 €.', 'Mit Pommes frites. Extra Patty: 4,00 €.', '配薯条。加肉饼：4,00 €。'],
    "Salade, tomates, compotée d'échalotes, steak, cheddar, sauce burger.": ['Lettuce, tomato, shallot compote, beef patty, cheddar, burger sauce.', 'Lechuga, tomate, compota de chalotas, carne, cheddar, salsa burger.', 'Salat, Tomaten, Schalottenkompott, Rindfleisch-Patty, Cheddar, Burgersauce.', '生菜、番茄、红葱酱、牛肉饼、切达奶酪、汉堡酱。'],
    "Salade, tomates, compotée d'échalotes, steak, raclette, lard grillé, sauce poivre.": ['Lettuce, tomato, shallot compote, beef patty, raclette cheese, grilled bacon, pepper sauce.', 'Lechuga, tomate, compota de chalotas, carne, queso raclette, panceta a la plancha, salsa de pimienta.', 'Salat, Tomaten, Schalottenkompott, Rindfleisch-Patty, Raclette-Käse, gegrillter Speck, Pfeffersauce.', '生菜、番茄、红葱酱、牛肉饼、拉克莱特奶酪、烤培根、黑胡椒酱。'],
    "Salade, tomates, compotée d'échalotes, steak, bleu de Sassenage, lard grillé, sauce mayonnaise aux noix.": ['Lettuce, tomato, shallot compote, beef patty, Bleu de Sassenage blue cheese, grilled bacon, walnut mayonnaise.', 'Lechuga, tomate, compota de chalotas, carne, queso azul de Sassenage, panceta a la plancha, mayonesa de nueces.', 'Salat, Tomaten, Schalottenkompott, Rindfleisch-Patty, Bleu de Sassenage (Blauschimmelkäse), gegrillter Speck, Walnuss-Mayonnaise.', '生菜、番茄、红葱酱、牛肉饼、萨瑟纳日蓝纹奶酪、烤培根、核桃蛋黄酱。'],
    'Américain': ['The American', 'Americano', 'Amerikaner', '美式三明治'],
    'Pain ciabatta, salade, tomates, steak, cheddar, sauce burger.': ['Ciabatta bread, lettuce, tomato, beef patty, cheddar, burger sauce.', 'Pan chapata, lechuga, tomate, carne, cheddar, salsa burger.', 'Ciabatta, Salat, Tomaten, Rindfleisch-Patty, Cheddar, Burgersauce.', '夏巴塔面包、生菜、番茄、牛肉饼、切达奶酪、汉堡酱。'],
    'Portion de frites': ['Side of fries', 'Ración de patatas fritas', 'Portion Pommes frites', '薯条'],
    'Également à emporter': ['Also available to take away', 'También para llevar', 'Auch zum Mitnehmen', '可外带'],
    'Carte des allergènes disponible au bar': ['Allergen list available at the bar', 'Lista de alérgenos disponible en la barra', 'Allergenliste an der Bar erhältlich', '过敏原信息请向吧台索取'],

    'Les pièces du boucher et les assiettes qui tiennent au corps après une journée dehors.': ["Butcher's cuts and hearty plates after a day outdoors.", 'Cortes de carnicero y platos contundentes tras un día al aire libre.', 'Fleisch vom Metzger und deftige Teller nach einem Tag draußen.', '精选肉排与扎实菜肴，犒劳户外的一天。'],
    'Entrecôte française maturée, environ 250 g': ['Aged French rib-eye steak, about 250 g', 'Entrecot francés madurado, unos 250 g', 'Gereiftes französisches Entrecôte, ca. 250 g', '法国熟成肋眼牛排，约250克'],
    'Pièce du boucher tendre et savoureuse, servie avec frites et salade verte.': ['A tender, flavourful cut, served with fries and green salad.', 'Pieza tierna y sabrosa, servida con patatas fritas y ensalada verde.', 'Zart und aromatisch, mit Pommes frites und grünem Salat.', '鲜嫩多汁，配薯条和绿叶沙拉。'],
    'Tartare français au couteau, environ 180 g': ['Hand-cut French steak tartare, about 180 g', 'Tartar francés cortado a cuchillo, unos 180 g', 'Französisches Tatar, von Hand geschnitten, ca. 180 g', '法式手切牛肉塔塔，约180克'],
    "Préparé traditionnellement, accompagné de ses frites et d'une salade verte.": ['Prepared the traditional way, with fries and green salad.', 'Preparado de forma tradicional, con patatas fritas y ensalada verde.', 'Traditionell zubereitet, mit Pommes frites und grünem Salat.', '传统做法，配薯条和绿叶沙拉。'],
    'Steak à cheval': ['Steak with a fried egg', 'Filete con huevo a caballo', 'Steak mit Spiegelei', '煎蛋牛肉饼'],
    'Steak haché façon bouchère 180 g, œuf au plat, frites et salade verte.': ['180 g butcher-style beef patty, fried egg, fries and green salad.', 'Hamburguesa de carnicero de 180 g, huevo frito, patatas fritas y ensalada verde.', 'Hacksteak nach Metzgerart 180 g, Spiegelei, Pommes frites und grüner Salat.', '180克肉铺风味牛肉饼、煎蛋、薯条和绿叶沙拉。'],

    'Seul : 8,00 €. Formule frites : 11,00 €.': ['On its own: 8,00 €. With fries: 11,00 €.', 'Solo: 8,00 €. Con patatas fritas: 11,00 €.', 'Einzeln: 8,00 €. Mit Pommes frites: 11,00 €.', '单点：8,00 €。配薯条：11,00 €。'],
    'Poulet': ['Chicken', 'Pollo', 'Hähnchen', '鸡肉'],
    "Huile d'olive, basilic, tomates fraîches, poulet, mozzarella.": ['Olive oil, basil, fresh tomato, chicken, mozzarella.', 'Aceite de oliva, albahaca, tomate fresco, pollo, mozzarella.', 'Olivenöl, Basilikum, frische Tomaten, Hähnchen, Mozzarella.', '橄榄油、罗勒、新鲜番茄、鸡肉、马苏里拉奶酪。'],
    'Jambon blanc': ['Ham', 'Jamón cocido', 'Kochschinken', '火腿'],
    "Huile d'olive, basilic, tomates fraîches, jambon blanc, mozzarella.": ['Olive oil, basil, fresh tomato, ham, mozzarella.', 'Aceite de oliva, albahaca, tomate fresco, jamón cocido, mozzarella.', 'Olivenöl, Basilikum, frische Tomaten, Kochschinken, Mozzarella.', '橄榄油、罗勒、新鲜番茄、火腿、马苏里拉奶酪。'],
    '3 fromages': ['Three cheeses', 'Tres quesos', 'Drei Käse', '三重奶酪'],
    "Huile d'olive, basilic, tomates fraîches, bleu, emmental, mozzarella.": ['Olive oil, basil, fresh tomato, blue cheese, Emmental, mozzarella.', 'Aceite de oliva, albahaca, tomate fresco, queso azul, emmental, mozzarella.', 'Olivenöl, Basilikum, frische Tomaten, Blauschimmelkäse, Emmentaler, Mozzarella.', '橄榄油、罗勒、新鲜番茄、蓝纹奶酪、埃门塔尔奶酪、马苏里拉奶酪。'],
    'Formule avec frites : 11,00 €': ['With fries: 11,00 €', 'Con patatas fritas: 11,00 €', 'Mit Pommes frites: 11,00 €', '配薯条：11,00 €'],

    'Généreuses, à base de crudités fraîches.': ['Generous, built on fresh raw vegetables.', 'Generosas, con verduras frescas.', 'Reichhaltig, mit frischer Rohkost.', '分量十足，以新鲜蔬菜为底。'],
    'Salade César': ['Caesar salad', 'Ensalada César', 'Caesar Salad', '凯撒沙拉'],
    'Crudités, poulet croustillant, olives noires, sauce césar, parmesan.': ['Raw vegetables, crispy chicken, black olives, Caesar dressing, parmesan.', 'Verduras, pollo crujiente, aceitunas negras, salsa césar, parmesano.', 'Rohkost, knuspriges Hähnchen, schwarze Oliven, Caesar-Dressing, Parmesan.', '蔬菜、香脆鸡肉、黑橄榄、凯撒酱、帕尔玛干酪。'],
    'Salade grenobloise': ['Grenoble salad', 'Ensalada grenoblesa', 'Grenobler Salat', '格勒诺布尔沙拉'],
    'Crudités, bleu de Sassenage, jambon de pays, noix, croûtons, sauce vinaigrette.': ['Raw vegetables, Bleu de Sassenage, cured country ham, walnuts, croutons, vinaigrette.', 'Verduras, queso azul de Sassenage, jamón curado, nueces, picatostes, vinagreta.', 'Rohkost, Bleu de Sassenage, Landschinken, Walnüsse, Croûtons, Vinaigrette.', '蔬菜、萨瑟纳日蓝纹奶酪、风干火腿、核桃、面包丁、油醋汁。'],
    'Salade croustillante': ['Crispy salad', 'Ensalada crujiente', 'Knuspriger Salat', '香脆沙拉'],
    'Crudités, chèvre croustillant, lard grillé, oignons frits, sauce vinaigrette.': ["Raw vegetables, crispy goat's cheese, grilled bacon, fried onions, vinaigrette.", 'Verduras, queso de cabra crujiente, panceta a la plancha, cebolla frita, vinagreta.', 'Rohkost, knuspriger Ziegenkäse, gegrillter Speck, Röstzwiebeln, Vinaigrette.', '蔬菜、香脆山羊奶酪、烤培根、炸洋葱、油醋汁。'],

    'Le menu pas pour les grands': ['The not-for-grown-ups menu', 'El menú de los peques', 'Das Menü für die Kleinen', '小朋友专属套餐'],
    'Pour les moins de 12 ans.': ['For children under 12.', 'Para menores de 12 años.', 'Für Kinder unter 12 Jahren.', '适用于12岁以下儿童。'],
    'Menu complet': ['Full menu', 'Menú completo', 'Komplettes Menü', '全套餐'],
    "Sirop à l'eau au choix, puis steak haché frites ou poulet croustillant frites, et une boule de glace.": ['A fruit syrup drink of their choice, then a beef patty or crispy chicken with fries, and one scoop of ice cream.', 'Un sirope con agua a elegir, después hamburguesa o pollo crujiente con patatas fritas, y una bola de helado.', 'Sirup mit Wasser nach Wahl, dann Hacksteak oder knuspriges Hähnchen mit Pommes frites und eine Kugel Eis.', '任选一杯糖浆水，牛肉饼或香脆鸡肉配薯条，外加一球冰淇淋。'],
    'Une chaise haute peut être demandée en salle': ['High chair available on request', 'Trona disponible bajo petición', 'Kinderhochstuhl auf Anfrage', '店内可提供儿童高脚椅'],

    'Nos crêpes et gaufres': ['Our crêpes & waffles', 'Nuestros crepes y gofres', 'Unsere Crêpes & Waffeln', '可丽饼与华夫饼'],
    'Le goûter de seize heures, sur place ou à emporter. Supplément chantilly : 1,00 €.': ["The four o'clock snack, to eat in or take away. Extra whipped cream: 1,00 €.", 'La merienda de las cuatro, para tomar aquí o para llevar. Nata montada extra: 1,00 €.', 'Der Nachmittagssnack um vier, vor Ort oder zum Mitnehmen. Extra Sahne: 1,00 €.', '下午四点的点心时光，堂食或外带均可。加鲜奶油：1,00 €。'],
    'Sucre': ['Sugar', 'Azúcar', 'Zucker', '砂糖'],
    'Crème de marrons': ['Chestnut cream', 'Crema de castañas', 'Maronencreme', '栗子酱'],
    'Caramel beurre salé': ['Salted butter caramel', 'Caramelo de mantequilla salada', 'Salzbutter-Karamell', '咸黄油焦糖'],
    'Confiture myrtille': ['Blueberry jam', 'Mermelada de arándanos', 'Heidelbeerkonfitüre', '蓝莓果酱'],
    'Supplément chantilly : 1,00 €': ['Extra whipped cream: 1,00 €', 'Nata montada extra: 1,00 €', 'Extra Sahne: 1,00 €', '加鲜奶油：1,00 €'],

    'Nos coupes glacées': ['Our ice cream sundaes', 'Nuestras copas de helado', 'Unsere Eisbecher', '冰淇淋圣代'],
    'Servies en salle et en terrasse.': ['Served inside and on the terrace.', 'Servidas en sala y en terraza.', 'Drinnen und auf der Terrasse serviert.', '店内与露台均可享用。'],
    'Coupe Dame Blanche': ['Dame Blanche sundae', 'Copa Dame Blanche', 'Coupe Dame Blanche', '白夫人圣代'],
    'Glace vanille, chocolat fondu, chantilly, amande grillée.': ['Vanilla ice cream, melted chocolate, whipped cream, toasted almonds.', 'Helado de vainilla, chocolate fundido, nata montada, almendra tostada.', 'Vanilleeis, geschmolzene Schokolade, Sahne, geröstete Mandeln.', '香草冰淇淋、热巧克力酱、鲜奶油、烤杏仁。'],
    'Coupe chocolat liégeois': ['Chocolate liégeois sundae', 'Copa de chocolate liégeois', 'Schokoladen-Eisbecher', '列日巧克力圣代'],
    'Glace vanille, glace chocolat, chocolat fondu, chantilly, amande grillée.': ['Vanilla and chocolate ice cream, melted chocolate, whipped cream, toasted almonds.', 'Helado de vainilla y de chocolate, chocolate fundido, nata montada, almendra tostada.', 'Vanille- und Schokoladeneis, geschmolzene Schokolade, Sahne, geröstete Mandeln.', '香草与巧克力冰淇淋、热巧克力酱、鲜奶油、烤杏仁。'],
    'Coupe café liégeois': ['Coffee liégeois sundae', 'Copa de café liégeois', 'Kaffee-Eisbecher', '列日咖啡圣代'],
    'Glace vanille, glace café, expresso, chantilly, amande grillée.': ['Vanilla and coffee ice cream, espresso, whipped cream, toasted almonds.', 'Helado de vainilla y de café, espresso, nata montada, almendra tostada.', 'Vanille- und Kaffeeeis, Espresso, Sahne, geröstete Mandeln.', '香草与咖啡冰淇淋、意式浓缩、鲜奶油、烤杏仁。'],
    'Coupe des bois': ['Forest berry sundae', 'Copa del bosque', 'Waldbeer-Eisbecher', '森林莓果圣代'],
    'Glace vanille, glace myrtille, coulis de fruits rouges, chantilly, amande grillée.': ['Vanilla and blueberry ice cream, red berry coulis, whipped cream, toasted almonds.', 'Helado de vainilla y de arándanos, coulis de frutos rojos, nata montada, almendra tostada.', 'Vanille- und Heidelbeereis, Beerensauce, Sahne, geröstete Mandeln.', '香草与蓝莓冰淇淋、红莓果酱、鲜奶油、烤杏仁。'],
    'Coupe Chartreuse': ['Chartreuse sundae', 'Copa Chartreuse', 'Chartreuse-Eisbecher', '查特酒圣代'],
    'Glace chartreuse, chartreuse verte.': ['Chartreuse ice cream, green Chartreuse.', 'Helado de chartreuse, chartreuse verde.', 'Chartreuse-Eis, grüner Chartreuse.', '查特酒冰淇淋、绿查特酒。'],
    "Contient de l'alcool, réservée aux adultes": ALC,
    "Contient de l'alcool, réservé aux adultes": ALC,
    "L'abus d'alcool est dangereux pour la santé": ['Excessive drinking is harmful to your health', 'El abuso del alcohol es peligroso para la salud', 'Übermäßiger Alkoholkonsum schadet der Gesundheit', '过量饮酒有害健康'],

    'Parfums : vanille, chocolat, café, chartreuse, myrtille, framboise, cassis, citron, caramel beurre salé, rhum raisin.': ['Flavours: vanilla, chocolate, coffee, Chartreuse, blueberry, raspberry, blackcurrant, lemon, salted butter caramel, rum raisin.', 'Sabores: vainilla, chocolate, café, chartreuse, arándano, frambuesa, grosella negra, limón, caramelo de mantequilla salada, ron con pasas.', 'Sorten: Vanille, Schokolade, Kaffee, Chartreuse, Heidelbeere, Himbeere, Johannisbeere, Zitrone, Salzbutter-Karamell, Rum-Rosine.', '口味：香草、巧克力、咖啡、查特酒、蓝莓、覆盆子、黑加仑、柠檬、咸黄油焦糖、朗姆葡萄干。'],
    '1 boule': ['1 scoop', '1 bola', '1 Kugel', '1球'],
    '2 boules': ['2 scoops', '2 bolas', '2 Kugeln', '2球'],
    '3 boules': ['3 scoops', '3 bolas', '3 Kugeln', '3球'],
    'Suppléments': ['Extras', 'Extras', 'Extras', '加料'],
    'Chocolat fondu maison, coulis de fruits rouges ou chantilly.': ['Homemade melted chocolate, red berry coulis or whipped cream.', 'Chocolate fundido casero, coulis de frutos rojos o nata montada.', 'Hausgemachte Schokoladensauce, Beerensauce oder Sahne.', '自制热巧克力酱、红莓果酱或鲜奶油。'],

    'Les desserts de la maison.': ['Our house desserts.', 'Los postres de la casa.', 'Die Desserts des Hauses.', '本店招牌甜点。'],
    'Fondant au chocolat': ['Chocolate fondant', 'Coulant de chocolate', 'Schokoladen-Fondant', '熔岩巧克力蛋糕'],
    'Nougat glacé': ['Iced nougat', 'Nougat helado', 'Eisnougat', '冰牛轧糖'],
    'Tarte myrtilles': ['Blueberry tart', 'Tarta de arándanos', 'Heidelbeertarte', '蓝莓挞'],

    'Nos boissons fraîches': ['Our cold drinks', 'Nuestras bebidas frías', 'Unsere kalten Getränke', '冷饮'],
    'Au bar, aux mêmes horaires que le restaurant.': ['At the bar, same hours as the restaurant.', 'En la barra, en el mismo horario que el restaurante.', 'An der Bar, zu denselben Zeiten wie das Restaurant.', '吧台供应，营业时间与餐厅相同。'],
    "Sirop à l'eau": ['Fruit syrup with water', 'Sirope con agua', 'Sirup mit Wasser', '糖浆水'],
    'Grenadine, fraise, pêche, citron, cassis, kiwi, menthe, orgeat.': ['Grenadine, strawberry, peach, lemon, blackcurrant, kiwi, mint, orgeat (almond).', 'Granadina, fresa, melocotón, limón, grosella negra, kiwi, menta, almendra (orgeat).', 'Grenadine, Erdbeere, Pfirsich, Zitrone, Johannisbeere, Kiwi, Minze, Mandel (Orgeat).', '石榴、草莓、蜜桃、柠檬、黑加仑、猕猴桃、薄荷、杏仁。'],
    'Limonade': ['Lemonade', 'Gaseosa', 'Limonade', '柠檬汽水'],
    'Diabolo': ['Diabolo (lemonade & syrup)', 'Diabolo (gaseosa con sirope)', 'Diabolo (Limonade mit Sirup)', '糖浆汽水'],
    'Jus de fruits': ['Fruit juice', 'Zumo de frutas', 'Fruchtsaft', '果汁'],
    'Orange, pomme, fraise, abricot, ACE, ananas, tomate.': ['Orange, apple, strawberry, apricot, ACE, pineapple, tomato.', 'Naranja, manzana, fresa, albaricoque, ACE, piña, tomate.', 'Orange, Apfel, Erdbeere, Aprikose, ACE, Ananas, Tomate.', '橙子、苹果、草莓、杏子、ACE、菠萝、番茄。'],
    'Canette': ['Can', 'Lata', 'Dose', '罐装饮料'],

    'Nos boissons chaudes': ['Our hot drinks', 'Nuestras bebidas calientes', 'Unsere heißen Getränke', '热饮'],
    "Servies dès l'ouverture, à 8h en saison d'hiver, avant la première benne.": ['Served from opening, 8 am in winter, before the first gondola.', 'Desde la apertura, a las 8 h en invierno, antes de la primera cabina.', 'Ab Öffnung, im Winter ab 8 Uhr, vor der ersten Gondel.', '开门即供应，冬季早上8点起，赶在第一班缆车之前。'],
    'Expresso': ['Espresso', 'Café solo', 'Espresso', '意式浓缩'],
    'Noisette': ['Espresso with a dash of milk', 'Cortado', 'Espresso macchiato', '玛奇朵'],
    'Café allongé': ['Long black', 'Café americano', 'Verlängerter', '美式咖啡'],
    'Double expresso': ['Double espresso', 'Café solo doble', 'Doppelter Espresso', '双份浓缩'],
    'Grand crème': ['Large white coffee', 'Café con leche grande', 'Großer Milchkaffee', '大杯牛奶咖啡'],
    'Chocolat chaud': ['Hot chocolate', 'Chocolate caliente', 'Heiße Schokolade', '热巧克力'],
    'Chocolat viennois': ['Hot chocolate with whipped cream', 'Chocolate vienés', 'Heiße Schokolade mit Sahne', '维也纳热巧克力'],
    'Café viennois': ['Coffee with whipped cream', 'Café vienés', 'Wiener Kaffee mit Sahne', '维也纳咖啡'],
    'Green chaud ou choco rhum': ['Hot chocolate with green Chartreuse or with rum', 'Chocolate caliente con chartreuse verde o con ron', 'Heiße Schokolade mit grünem Chartreuse oder Rum', '热巧克力加绿查特酒或朗姆酒'],
    'Vin chaud maison': ['Homemade mulled wine', 'Vino caliente casero', 'Hausgemachter Glühwein', '自制热红酒'],
    'Thé et infusion': ['Tea & herbal tea', 'Té e infusión', 'Tee & Kräutertee', '茶与花草茶'],

    'Prix indiqués pour 25 cl puis 50 cl.': ['Prices for 25 cl, then 50 cl.', 'Precios para 25 cl y 50 cl.', 'Preise für 25 cl bzw. 50 cl.', '价格分别对应25厘升和50厘升。'],
    'Bière du moment': ['Beer of the moment', 'Cerveza del momento', 'Bier der Saison', '当季啤酒'],
    'Panaché': ['Shandy', 'Clara', 'Radler', '啤酒汽水'],
    'Monaco': ['Monaco (beer, lemonade, grenadine)', 'Monaco (cerveza, gaseosa, granadina)', 'Monaco (Bier, Limonade, Grenadine)', '摩纳哥（啤酒、汽水、石榴糖浆）'],
    'Picon': ['Picon (beer with orange bitters)', 'Picon (cerveza con amargo de naranja)', 'Picon (Bier mit Orangenbitter)', '皮孔（啤酒加苦橙利口酒）'],
    'Bière et sirop': ['Beer with syrup', 'Cerveza con sirope', 'Bier mit Sirup', '啤酒加糖浆'],
    'Vins': ['Wines', 'Vinos', 'Weine', '葡萄酒'],
    'carte des vins': ['wine list', 'carta de vinos', 'Weinkarte', '酒单'],
    'Au verre, au pichet ou à la bouteille. Carte disponible en salle.': ['By the glass, carafe or bottle. Wine list available inside.', 'Por copa, jarra o botella. Carta disponible en sala.', 'Glasweise, in der Karaffe oder als Flasche. Weinkarte im Restaurant.', '可按杯、按壶或按瓶点。酒单请在店内索取。'],
    'Vente interdite aux mineurs': ['No sale to minors', 'Prohibida la venta a menores', 'Kein Verkauf an Minderjährige', '禁止向未成年人出售'],

    'Nos cocktails et apéritifs': ['Our cocktails & aperitifs', 'Nuestros cócteles y aperitivos', 'Unsere Cocktails & Aperitifs', '鸡尾酒与开胃酒'],
    "Pour l'après-ski, en terrasse quand le soleil donne.": ['For après-ski, on the terrace when the sun is out.', 'Para el après-ski, en la terraza cuando hace sol.', 'Zum Après-Ski, auf der Terrasse, wenn die Sonne scheint.', '滑雪之后，阳光正好时来露台坐坐。'],
    'Gin tonic': ['Gin & tonic', 'Gin tonic', 'Gin Tonic', '金汤力'],
    'Kir cassis ou châtaigne': ['Kir, blackcurrant or chestnut', 'Kir de casis o de castaña', 'Kir mit Cassis oder Kastanie', '基尔酒（黑加仑或栗子）'],
    'Martini blanc': ['Martini Bianco', 'Martini Bianco', 'Martini Bianco', '白马天尼'],
    'Servis en 4 cl.': ['Served as 4 cl.', 'Servidos en 4 cl.', 'Serviert zu 4 cl.', '每份4厘升。'],
    'Rhum arrangé': ['Infused rum', 'Ron macerado', 'Aromatisierter Rum', '浸泡朗姆酒'],
    'Botran 15 ans': ['Botran 15-year-old', 'Botran 15 años', 'Botran 15 Jahre', 'Botran 15年'],
    'Génépi': ['Génépi (alpine liqueur)', 'Genepí (licor alpino)', 'Génépi (Alpenkräuterlikör)', '高山艾草利口酒'],
    'Chartreuse verte': ['Green Chartreuse', 'Chartreuse verde', 'Grüner Chartreuse', '绿查特酒'],
    'Vodka soda': ['Vodka soda', 'Vodka con soda', 'Wodka Soda', '伏特加苏打'],
    'Whisky soda': ['Whisky soda', 'Whisky con soda', 'Whisky Soda', '威士忌苏打'],

    'La carte des allergènes est disponible au bar. Les prix sont affichés en euros, service compris. La carte évolue avec la saison et les arrivages, les nouveautés sont annoncées sur': ['The allergen list is available at the bar. Prices are in euros, service included. The menu changes with the seasons and deliveries; new dishes are announced on', 'La lista de alérgenos está disponible en la barra. Precios en euros, servicio incluido. La carta cambia con la temporada y los suministros; las novedades se anuncian en', 'Die Allergenliste ist an der Bar erhältlich. Preise in Euro, Bedienung inbegriffen. Die Karte wechselt mit der Saison und den Lieferungen, Neuheiten gibt es auf', '过敏原信息请向吧台索取。价格以欧元计，含服务费。菜单随季节与到货而变化，新品会在此公布：']
  };

  document.addEventListener('DOMContentLoaded', function () {
    var sect = document.querySelector('[data-carte]');
    var group = document.querySelector('[data-langs]');
    if (!sect || !group) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var btns = Array.prototype.slice.call(group.querySelectorAll('[data-lang]'));
    var tablist = sect.querySelector('[data-menu-tabs]');
    var nodes = [], cur = 'fr', timer = 0;

    // on garde chaque texte français une fois, la langue choisie ne fait que le remplacer
    var walk = document.createTreeWalker(sect, NodeFilter.SHOW_TEXT);
    for (var n = walk.nextNode(); n; n = walk.nextNode()) {
      var key = n.nodeValue.trim();
      if (T[key] && !group.contains(n)) nodes.push({ n: n, key: key, pre: n.nodeValue.match(/^\s*/)[0], post: n.nodeValue.match(/\s*$/)[0] });
    }
    var labelled = [tablist, group].filter(Boolean).map(function (el) { return { el: el, key: el.getAttribute('aria-label') }; });

    function apply(lang) {
      var i = LANGS.indexOf(lang) - 1;
      nodes.forEach(function (o) { o.n.nodeValue = o.pre + (i < 0 ? o.key : T[o.key][i]) + o.post; });
      labelled.forEach(function (o) { if (T[o.key]) o.el.setAttribute('aria-label', i < 0 ? o.key : T[o.key][i]); });
      sect.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : lang);
    }
    function set(lang, focus) {
      if (LANGS.indexOf(lang) < 0) lang = 'fr';
      btns.forEach(function (b, i) {
        var on = b.dataset.lang === lang;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        if (on) { group.style.setProperty('--i', i); if (focus) b.focus(); }
      });
      if (lang === cur) return;
      cur = lang;
      try { localStorage.setItem('g1650-carte-lang', lang); } catch (e) { /* stockage bloqué : la langue ne sera pas retenue */ }
      if (reduce) { apply(lang); return; }
      // la carte se voile, change de langue, puis se redévoile
      clearTimeout(timer);
      sect.classList.add('is-swapping');
      timer = setTimeout(function () { apply(lang); sect.classList.remove('is-swapping'); }, 260);
    }

    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    group.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      set(LANGS[(LANGS.indexOf(cur) + d + LANGS.length) % LANGS.length], true);
    });

    var saved = 'fr';
    try { saved = localStorage.getItem('g1650-carte-lang') || 'fr'; } catch (e) { /* idem */ }
    set('fr');
    set(saved);
  });
})();

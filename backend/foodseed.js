import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// ── Category ID map (from MongoDB) ──────────────────────────────────────────
const CAT = {
    chapathi: '6a17f377fa45163ba106892c',
    chickenFry: '6a17f381fa45163ba106892d',
    chickenGravy: '6a17f387fa45163ba106892e',
    coolDrinks: '6a17f38cfa45163ba106892f',
    iceCream: '6a17f390fa45163ba1068930',
    dosa: '6a17f394fa45163ba1068931',
    egg: '6a17f397fa45163ba1068932',
    mutton: '6a17f39bfa45163ba1068933',
    noodles: '6a17f39ffa45163ba1068934',
    parotta: '6a17f3a3fa45163ba1068935',
    riceVarieties: '6a17f3a8fa45163ba1068936',
    seafood: '6a17f3acfa45163ba1068937',
    soup: '6a17f3b0fa45163ba1068938',
    specialChickenFry: '6a17f3b6fa45163ba1068939',
    tandoori: '6a17f3b9fa45163ba106893a',
    vegFry: '6a17f3bffa45163ba106893b',
    vegGravy: '6a17f3c6fa45163ba106893c',
};

const foodSchema = new mongoose.Schema({
    itemcode: { type: String, required: true, unique: true, trim: true },
    nameEnglish: { type: String, required: true, trim: true },
    nameTamil: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    quantity: { type: String, required: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
    varieties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variety' }],
}, { timestamps: true });

const Food = mongoose.model('food', foodSchema);

// ── Seed data ────────────────────────────────────────────────────────────────
// [itemcode, nameEnglish, nameTamil, price, category]
const foods = [

    // ── சப்பாத்தி | Chapathi ─────────────────────────────────────────────────
    ['2', 'Chapathi', 'சப்பாத்தி', 30, CAT.chapathi],
    ['28', 'Egg Chapathi', 'முட்ட சப்பாத்தி', 40, CAT.chapathi],
    ['38', 'Veg Stab Chapathi', 'வெஜ் ஸ்டப் சப்பாத்தி', 140, CAT.chapathi],
    ['39', 'Paneer Stab Chapathi', 'பன்னீர் ஸ்டப் சப்பாத்தி', 190, CAT.chapathi],
    ['40', 'Chicken Stab Chapathi', 'சிக்கன் ஸ்டப் சப்பாத்தி', 170, CAT.chapathi],
    ['41', 'Mushroom Stab Chapathi', 'காளான் ஸ்டப் சப்பாத்தி', 190, CAT.chapathi],
    ['202', 'Drum Stick', 'ட்ரம் ஸ்டிக்', 120, CAT.chapathi],

    // ── சிக்கன் ட்ரை | Chicken Fry ──────────────────────────────────────────
    ['6', 'Coconut Chicken 65', 'கோக்கனட் 65', 160, CAT.chickenFry],
    ['85', 'Chicken 65', 'சிக்கன்65', 150, CAT.chickenFry],
    ['86', 'Garlic Chilli Chicken Fry', 'கார்லிக் சிக் ட்ரை', 150, CAT.chickenFry],
    ['87', 'Pepper Chilli Chicken Fry', 'பெப்பர் சிக் ட்ரை', 150, CAT.chickenFry],
    ['88', 'Chilli Chicken Fry', 'சில்லி சிக் ட்ரை', 150, CAT.chickenFry],
    ['89', 'Chicken Lollipop', 'சிக்கன் லாலிபாப்', 160, CAT.chickenFry],
    ['90', 'Wings Fry', 'விங்ஸ் ட்ரை', 150, CAT.chickenFry],
    ['91', 'Andhra Chilli Chicken Fry', 'ஆந்திரா சிக் ட்ரை', 150, CAT.chickenFry],
    ['92', 'Red Chilli', 'ரெட் சில்லி', 150, CAT.chickenFry],
    ['93', 'Sholay', 'சோலை', 160, CAT.chickenFry],
    ['94', 'Bharat', 'பரத்', 150, CAT.chickenFry],
    ['95', 'Chick Manchurian Fry', 'சிக் மஞ்சூரியன் ட்ரை', 150, CAT.chickenFry],
    ['96', 'Finger Chicken', 'பிங்கர் சிக்', 150, CAT.chickenFry],
    ['97', 'Shishwam', 'சிஸ்வாம்', 150, CAT.chickenFry],
    ['98', 'Nanthini', 'நந்தினி', 150, CAT.chickenFry],
    ['99', 'Special Chilli', 'ஸ்பெஷல் சில்லி', 150, CAT.chickenFry],
    ['141', 'Coconut Chicken', 'கோக்கனட் சிக்கன்', 160, CAT.chickenFry],
    ['213', 'Chicken Sandwich', 'சிக்கன் சண்ட்விச்', 150, CAT.chickenFry],
    ['221', 'Quail Chilli', 'காடை சில்லி', 130, CAT.chickenFry],
    ['249', 'Barbecue 1/2', 'பர்பிகியூ 1/2', 240, CAT.chickenFry],

    // ── சிக்கன் கிரேவி | Chicken Gravy ──────────────────────────────────────
    ['100', 'Chettinad', 'செட்டிநாடு', 180, CAT.chickenGravy],
    ['101', 'Pepper Chicken Gravy', 'பெப்பர் சிக் கிரேவி', 180, CAT.chickenGravy],
    ['102', 'Butter Chicken', 'பட்டர் சிக்கன்', 180, CAT.chickenGravy],
    ['103', 'Andhra Chicken', 'ஆந்திரா சிக்கன்', 180, CAT.chickenGravy],
    ['104', 'Garlic Chicken Gravy', 'கார்லிக் சிக் கிரேவி', 200, CAT.chickenGravy],
    ['105', 'Chicken Chops', 'சிக்கன் சாப்ஸ்', 85, CAT.chickenGravy],
    ['106', 'Mughalai Chicken Gravy', 'முஹலாய் சிக் கிரேவி', 200, CAT.chickenGravy],
    ['107', 'Special Chicken Gravy', 'ஸ்பெஷல் சிக் கிரேவி', 170, CAT.chickenGravy],
    ['108', 'Chicken Manchurian Gravy', 'சிக்கன் மஞ்சூரியன் கிரேவி', 180, CAT.chickenGravy],
    ['109', 'Kadai Chicken Gravy', 'கடாய் சிக் கிரேவி', 180, CAT.chickenGravy],
    ['126', 'Wings Gravy', 'விங்ஸ் கிரேவி', 180, CAT.chickenGravy],
    ['196', 'Hyderabad Chicken', 'ஹைதராபாத் சிக்', 180, CAT.chickenGravy],
    ['217', 'Country Chicken Chops', 'நாட்டு கோழி சாப்ஸ்', 160, CAT.chickenGravy],
    ['225', 'Kozhi Sukka', 'கோழிசுக்கா', 140, CAT.chickenGravy],
    ['252', 'Mugan Special Fry', 'முகன் ஸ்பெஷல் ட்ரை', 150, CAT.chickenGravy],
    ['302', 'MT Gravy', 'MT GRAVY', 100, CAT.chickenGravy],

    // ── கூல் ட்ரிங்க்ஸ் | Cool Drinks ───────────────────────────────────────
    ['166', 'Goli Soda', 'கோலி சோடா', 40, CAT.coolDrinks],
    ['180', 'Pepsi', 'பெப்சி', 15, CAT.coolDrinks],
    ['181', 'Badam Milk', 'பாதாம் பால்', 30, CAT.coolDrinks],
    ['182', 'Rose Milk', 'rose milk', 30, CAT.coolDrinks],
    ['193', 'Lemon', 'லமன்', 30, CAT.coolDrinks],
    ['195', 'Curd', 'தயிர்', 15, CAT.coolDrinks],
    ['201', 'Juice', 'ஜூஸ்', 70, CAT.coolDrinks],
    ['190', 'Water Bottle', 'water bottle', 20, CAT.coolDrinks],
    ['220', 'Beeda', 'பீடா', 10, CAT.coolDrinks],
    ['251', 'AC Charge', 'AC CHARGE', 20, CAT.coolDrinks],

    // ── Ice Cream ────────────────────────────────────────────────────────────
    ['170', 'Bada Cup', 'bada cup', 60, CAT.iceCream],
    ['171', 'Bada Cup 20', 'bada cup 20', 20, CAT.iceCream],
    ['172', 'Dairy Cup 35', 'டைரி cup 35', 35, CAT.iceCream],
    ['173', 'Ice Cream 50', 'ice cream 50', 50, CAT.iceCream],
    ['174', 'Ice Cream', 'icecream', 40, CAT.iceCream],
    ['175', 'Vanilla Family 120', 'வெண்ணிலா family120', 120, CAT.iceCream],

    // ── தோசை | Dosa ─────────────────────────────────────────────────────────
    ['52', 'Egg Dosa', 'முட்டை தோசை', 90, CAT.dosa],
    ['53', 'Paneer Stab Dosa', 'பன்னீர் ஸ்டப் தோசை', 190, CAT.dosa],
    ['54', 'Mushroom Stab Dosa', 'காளான் ஸ்டப் தோசை', 190, CAT.dosa],
    ['55', 'Chicken Stab Dosa', 'சிக்கன் ஸ்டப் தோசை', 190, CAT.dosa],
    ['158', 'Night Dosa', 'நைட் தோசை', 40, CAT.dosa],
    ['301', 'Idli', 'இட்லி', 10, CAT.dosa],
    ['45', 'Stone Dosa', 'கல் தோசை', 30, CAT.dosa],
    ['46', 'Ghee Roast', 'நெய் ரோஸ்ட்', 100, CAT.dosa],
    ['47', 'Onion Uthappam', 'ஆனியன் ஊத்தப்பம்', 80, CAT.dosa],
    ['48', 'Onion Roast', 'ஆனியன் ரோஸ்ட்', 100, CAT.dosa],
    ['49', 'Egg Kari Dosa', 'முட்டை கறி தோசை', 80, CAT.dosa],
    ['50', 'Special Dosa', 'ஸ்பெஷல் தோசை', 60, CAT.dosa],
    ['51', 'Mutton Dosa', 'மட்டன் தோசை', 260, CAT.dosa],

    // ── முட்டை | Egg ─────────────────────────────────────────────────────────
    ['79', 'Paneer Kothu', 'பன்னீர் கொத்து', 190, CAT.egg],
    ['80', 'Omelette', 'ஆம்லேட்', 20, CAT.egg],
    ['124', 'Boiled Egg', 'அவித்த முட்டை', 15, CAT.egg],
    ['142', 'Egg Fry', 'முட்டை பொரியல்', 50, CAT.egg],
    ['143', 'Egg Kuzhambu', 'முட்டைகுழம்பு', 60, CAT.egg],
    ['144', 'Vazhayal', 'வழியல்', 20, CAT.egg],
    ['145', 'Scrambled Egg', 'கரண்டி ஆம்பளைட்', 25, CAT.egg],

    // ── மட்டன் | Mutton ──────────────────────────────────────────────────────
    ['81', 'Mutton Sukka', 'மட்டன் சுக்கா', 180, CAT.mutton],
    ['82', 'Mutton Kuzhambu', 'மட்டன் குழம்பு', 200, CAT.mutton],
    ['83', 'Mutton Pepper Fry', 'மட்டன் பெப்பர் ப்ரெய்', 200, CAT.mutton],
    ['84', 'Mutton Egg Fry', 'மட்டன் முட்டை ப்ரெய்', 200, CAT.mutton],
    ['192', 'Ambur Mutton', 'ஆம்பூர் மட்டன்', 200, CAT.mutton],
    ['199', 'Hyderabad Mutton', 'ஹைதராபாத் மட்டன்', 250, CAT.mutton],

    // ── நூடுல்ஸ் | Noodles ───────────────────────────────────────────────────
    ['27', 'Mix NV Noodles', 'மிக்ஸ் NV நூடுல்ஸ்', 260, CAT.noodles],
    ['30', 'Veg Noodles', 'வெஜ் நூடுல்ஸ்', 100, CAT.noodles],
    ['31', 'Chicken Noodles', 'சிக்கன் நூடுல்ஸ்', 130, CAT.noodles],
    ['32', 'Mutton Noodles', 'மட்டன் நூடுல்ஸ்', 230, CAT.noodles],
    ['33', 'Mushroom Noodles', 'காளான் நூடுல்ஸ்', 130, CAT.noodles],
    ['34', 'Paneer Noodles', 'பன்னீர் நூடுல்ஸ்', 130, CAT.noodles],
    ['35', 'Egg Noodles', 'முட்டை நூடுல்ஸ்', 110, CAT.noodles],
    ['36', 'Prawn Noodles', 'இறால் நூடுல்ஸ்', 220, CAT.noodles],

    // ── பரோட்டா | Parotta ────────────────────────────────────────────────────
    ['1', 'Purotta', 'புரோட்டா', 30, CAT.parotta],
    ['3', 'Bun Parotta', 'பன் பரோட்டா', 35, CAT.parotta],
    ['56', 'Viruthu Parotta', 'விருது பரோட்டா', 40, CAT.parotta],
    ['57', 'Ghee Parotta', 'நெய் பரோட்டா', 50, CAT.parotta],
    ['58', 'Veechu Parotta', 'வீச்சு பரோட்டா', 35, CAT.parotta],
    ['59', 'Egg Veechu Parotta', 'முட்டை வீச்சு பரோட்டா', 40, CAT.parotta],
    ['60', 'Veg Chilli Parotta', 'வெஜ் சில்லி பரோட்டா', 120, CAT.parotta],
    ['61', 'Chicken Chilli Parotta', 'சிக்கன் சில்லி பரோட்டா', 160, CAT.parotta],
    ['62', 'Egg Chilli Parotta', 'முட்டை சில்லி பரோட்டா', 130, CAT.parotta],
    ['63', 'Egg Stab Parotta', 'முட்டை ஸ்டப் பரோட்டா', 130, CAT.parotta],
    ['64', 'Chicken Stab Parotta', 'சிக்கன் ஸ்டப் பரோட்டா', 170, CAT.parotta],
    ['65', 'Egg Kothu', 'முட்டை கொத்து', 130, CAT.parotta],
    ['66', 'Chick Kothu Purotta', 'சிக் கொத்து புரோட்டா', 160, CAT.parotta],
    ['78', 'Mushroom Kothu', 'காளான் கொத்து', 170, CAT.parotta],
    ['122', 'Paneer Kothu', 'பன்னிர் கொத்து', 200, CAT.parotta],
    ['203', 'Veg Kothu', 'வெஜ் கொத்து', 120, CAT.parotta],
    ['206', 'Mutton Kothu', 'மட்டன் கொத்து', 260, CAT.parotta],
    ['211', 'Paneer Stab Parotta', 'பன்னீர் ஸ்டாப் புரோட்டா', 190, CAT.parotta],
    ['222', 'Ilai Parotta', 'இலை புரோட்டா', 230, CAT.parotta],
    ['223', 'Mutton Ilai Parotta', 'மட்டன் இலை புரோட்டா', 280, CAT.parotta],
    ['230', 'Salem Parotta', 'சேலம் பரோட்டா', 60, CAT.parotta],
    ['300', 'Nool Purotta', 'நூல் புரோட்டா', 45, CAT.parotta],

    // ── ரைஸ் வகைகள் | Rice Varieties ────────────────────────────────────────
    ['7', 'MT Biryani', 'mt பிரியாணி', 90, CAT.riceVarieties],
    ['10', 'Ambur MT Biryani', 'ஆம்பூர் mt பிரியாணி', 100, CAT.riceVarieties],
    ['11', 'Saapadu', 'சாப்பாடு', 100, CAT.riceVarieties],
    ['12', 'Mutton Biryani', 'மட்டன் பிரியாணி', 230, CAT.riceVarieties],
    ['13', 'Chicken Biryani', 'சிக்கன் பிரியாணி', 170, CAT.riceVarieties],
    ['14', 'Mushroom Biryani', 'காளான் பிரியாணி', 130, CAT.riceVarieties],
    ['15', 'Egg Biryani', 'முட்டை பிரியாணி', 130, CAT.riceVarieties],
    ['16', 'Veg Rice', 'வெஜ் ரைஸ்', 100, CAT.riceVarieties],
    ['17', 'Parcel Saapadu', 'பார்சல் சாப்பாடு', 120, CAT.riceVarieties],
    ['18', 'Egg Rice', 'முட்டை ரைஸ்', 110, CAT.riceVarieties],
    ['19', 'Mutton Rice', 'மட்டன் ரைஸ்', 230, CAT.riceVarieties],
    ['20', 'Chicken Rice', 'சிக்கன் ரைஸ்', 130, CAT.riceVarieties],
    ['21', 'Prawn Rice', 'இறால் ரைஸ்', 230, CAT.riceVarieties],
    ['22', 'Mix Veg Rice', 'மிக்ஸ் வெஜ் ரைஸ்', 180, CAT.riceVarieties],
    ['23', 'Mix NV Rice', 'மிக்ஸ் NV ரைஸ்', 280, CAT.riceVarieties],
    ['24', 'Mushroom Rice', 'காளான் ரைஸ்', 130, CAT.riceVarieties],
    ['25', 'Ambur Egg Biryani', 'ஆம்பூர் முட்டை பிரியாணி', 120, CAT.riceVarieties],
    ['26', 'Paneer Rice', 'பன்னீர் ரைஸ்', 130, CAT.riceVarieties],
    ['123', 'Shishwam Rice', 'சிஸ்வாம் ரைஸ்', 150, CAT.riceVarieties],
    ['140', 'Curd Rice', 'தய்ர் சாதம்', 60, CAT.riceVarieties],
    ['204', 'Country Chicken Biryani', 'நாட்டுகோழி பிரியாணி', 250, CAT.riceVarieties],
    ['205', 'Country Chicken Sukka', 'நாட்டுகோழி சுக்கா', 200, CAT.riceVarieties],
    ['208', 'Chicken Sukka', 'சிக்கன்சுக்கா', 170, CAT.riceVarieties],
    ['209', 'Bency Chicken', 'பேன்சி சிக்கன்', 160, CAT.riceVarieties],
    ['210', 'Chicken Sukka Gravy', 'சிக் சுக்கா கிரேவி', 200, CAT.riceVarieties],
    ['219', '65 Biryani', '65 பிரியாணி', 230, CAT.riceVarieties],
    ['231', 'Padi Mutton Biryani', 'படி மட்டன்பிரியாணி', 1900, CAT.riceVarieties],

    // ── கடல் உணவு | Seafood ──────────────────────────────────────────────────
    ['110', 'Nethili Roast', 'நெத்திலி ரோஸ்ட்', 180, CAT.seafood],
    ['111', 'Nethili Kuzhambu', 'நெத்திலி குழம்பு', 180, CAT.seafood],
    ['112', 'Squid Roast', 'கணவாய் ரோஸ்ட்', 180, CAT.seafood],
    ['113', 'Squid Fish Kuzhambu', 'கணவாய் மீன் குழம்பு', 180, CAT.seafood],
    ['114', 'Fish 65', 'மீன் 65', 180, CAT.seafood],
    ['115', 'Fish Kuzhambu', 'மீன் குழம்பு', 180, CAT.seafood],
    ['116', 'Prawn Roast', 'இறால் ரோஸ்ட்', 180, CAT.seafood],
    ['117', 'Prawn Kuzhambu', 'இறால் குழம்பு', 180, CAT.seafood],
    ['118', 'Prawn Chilli', 'இறால் சில்லி', 180, CAT.seafood],
    ['119', 'Crab Roast', 'நண்டு ரோஸ்ட்', 180, CAT.seafood],
    ['120', 'Crab Kuzhambu', 'நண்டு குழம்பு', 180, CAT.seafood],
    ['121', 'Crab Meat Fry', 'நண்டு மீட் பொரியல்', 170, CAT.seafood],
    ['125', 'Fish Chilli', 'மீன்சில்லி', 180, CAT.seafood],
    ['129', 'Vanjara Fish', 'வஞ்சரா மீன்', 180, CAT.seafood],
    ['130', 'Big Fish', 'பெரிய மீன்', 220, CAT.seafood],
    ['133', 'Oozhi Fish Kuzhambu', 'ஊழி மீன் குழம்பு', 200, CAT.seafood],
    ['137', 'Prawn Spicy', 'prawn spicy :<', 180, CAT.seafood],
    ['200', 'Fish Finger', 'மீன் பிங்கர்', 170, CAT.seafood],
    ['207', 'Koganat 65', 'கோகனட் 65', 170, CAT.seafood],
    ['215', 'Crab Lollipop', 'நண்டு லாலிபாப்', 170, CAT.seafood],

    // ── சூப் | Soup ──────────────────────────────────────────────────────────
    ['74', 'Veg Soup', 'வெஜ் சூப்', 60, CAT.soup],
    ['75', 'Mutton Soup', 'மட்டன் சூப்', 80, CAT.soup],
    ['76', 'Chicken Soup', 'சிக்கன் சூப்', 80, CAT.soup],
    ['77', 'Mushroom Soup', 'காளான் சூப்', 60, CAT.soup],

    // ── ஸ்பெஷல் சிக்கன் ட்ரை | Special Chicken Fry ──────────────────────────
    ['134', 'Mix Tikka', 'மிக்ஸ் டிக்கா', 200, CAT.specialChickenFry],
    ['218', 'Quail Kuzhambu', 'காடை குழம்பு', 150, CAT.specialChickenFry],

    // ── தந்தூரி | Tandoori ────────────────────────────────────────────────────
    ['132', 'Kabab Chicken', 'கபாப் சிக்கன்', 80, CAT.tandoori],
    ['149', 'Garlic Naan', 'கார்லிக் நான்', 70, CAT.tandoori],
    ['150', 'Naan', 'நான்', 60, CAT.tandoori],
    ['151', 'Butter Naan', 'பட்டர் நான்', 60, CAT.tandoori],
    ['152', 'Tandoori Roti', 'தந்தூரி ரொட்டி', 60, CAT.tandoori],
    ['153', 'Pulka', 'புல்கா', 15, CAT.tandoori],
    ['155', 'Tandoori Full Chicken', 'தந்தூரி முழு கோழி', 480, CAT.tandoori],
    ['156', 'Tandoori 1/2', 'தந்தூரி 1/2', 240, CAT.tandoori],
    ['157', 'Tandoori 1/4', 'தந்தூரி 1/4', 120, CAT.tandoori],
    ['160', 'Grill Full Chicken', 'கிரில் முழு கோழி', 480, CAT.tandoori],
    ['161', 'Grill 1/2', 'கிரில் 1/2', 240, CAT.tandoori],
    ['162', 'Shawarma SPL', 'சவர்மா SPL', 110, CAT.tandoori],
    ['163', 'Cheese Shawarma', 'சீஸ் சவர்மா', 130, CAT.tandoori],
    ['164', 'Cheese Plate Shawarma', 'சீஸ் ப்லேட் சவர்மா', 160, CAT.tandoori],
    ['165', 'Plate Shawarma', 'ப்லேட் சவர்மா', 140, CAT.tandoori],
    ['197', 'Quail Roast', 'காடை ரோஸ்ட்', 100, CAT.tandoori],

    // ── வெஜ் ட்ரை | Veg Fry ──────────────────────────────────────────────────
    ['5', 'Mushroom Maju Fry', 'காளான் மஜு ட்ரை', 150, CAT.vegFry],
    ['37', 'Paneer Sholay', 'பன்னீர் சோலை', 160, CAT.vegFry],
    ['67', 'Mushroom 65', 'காளான் 65', 150, CAT.vegFry],
    ['68', 'Gobi 65', 'கோபி 65', 110, CAT.vegFry],
    ['69', 'Paneer 65', 'பன்னீர் 65', 150, CAT.vegFry],
    ['70', 'Mushroom Chilli', 'காளான் சில்லி', 150, CAT.vegFry],
    ['71', 'Gobi Chilli', 'கோபி சில்லி', 130, CAT.vegFry],
    ['72', 'Paneer Chilli', 'பன்னீர் சில்லி', 150, CAT.vegFry],
    ['73', 'Paneer Manju Fry', 'பன்னீர் மஞ்சு ட்ரை', 150, CAT.vegFry],
    ['127', 'Gobi Manchurian Fry', 'கோபி மஞ்சூரியன் ட்ரை', 130, CAT.vegFry],
    ['131', 'Paneer Tikka', 'பன்னீர் டிக்கா', 200, CAT.vegFry],
    ['135', 'French Fries', 'french fries <">', 90, CAT.vegFry],
    ['136', 'Smile', 'smile :>', 90, CAT.vegFry],
    ['194', 'Mushroom Kothu', 'காளான் கொத்து', 200, CAT.vegFry],

    // ── வெஜ் கிரேவி | Veg Gravy ──────────────────────────────────────────────
    ['4', 'Paneer Butter', 'பன்னீர் பட்டர்', 180, CAT.vegGravy],
    ['8', 'Paneer Biryani', 'பன்னீர் பிரியாணி', 130, CAT.vegGravy],
    ['9', 'Mushroom Manchurian Gravy', 'காளான் மஞ்சூரியன் கிரேவி', 180, CAT.vegGravy],
    ['42', 'Mushroom Masala', 'காளான் மசாலா', 180, CAT.vegGravy],
    ['43', 'Gobi Masala', 'கோபி மசாலா', 180, CAT.vegGravy],
    ['44', 'Paneer Pepper Masala', 'பன்னீர் பெப்பர் மசாலா', 180, CAT.vegGravy],
    ['128', 'Paneer Pepper Gravy', 'பன்னீர் பெப்பர் கிரேவி', 170, CAT.vegGravy],
    ['146', 'Mix Veg Gravy', 'மிக்ஸ் வெஜ் கிரேவி', 250, CAT.vegGravy],
    ['198', 'Gobi Manchurian Gravy', 'கோபி மஞ்சூரியன் கிரேவி', 180, CAT.vegGravy],
];

// ── Seed function ─────────────────────────────────────────────────────────────
const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    let inserted = 0;
    let skipped = 0;

    for (const [itemcode, nameEnglish, nameTamil, price, category] of foods) {
        try {
            await Food.create({
                itemcode,
                nameEnglish,
                nameTamil,
                price,
                quantity: '1',
                category: new mongoose.Types.ObjectId(category),
                varieties: [],
            });
            console.log(`  ✓ [${itemcode}] ${nameEnglish}`);
            inserted++;
        } catch (err) {
            if (err.code === 11000) {
                console.log(`  ⚠ [${itemcode}] ${nameEnglish} — already exists, skipped`);
                skipped++;
            } else {
                console.error(`  ✗ [${itemcode}] ${nameEnglish} — ${err.message}`);
            }
        }
    }

    console.log(`\nDone — ${inserted} inserted, ${skipped} skipped`);
    await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
// Dibuat oleh tools/anat3d_content.py — jangan disunting manual.
export interface AnatTopic { id: string; name: string; latin: string; topic: string; topicName: string; fn: string; k: string[]; dz: string[]; pf: string[]; det: string; t: string[]; side?: "l" | "r"; approx?: string }
export const TOPICS: AnatTopic[] = [
{
"id": "hipodermis",
"name": "Hipodermis (subkutis)",
"latin": "Tela subcutanea",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Jaringan lemak subkutan: cadangan energi, insulasi panas, dan bantalan mekanik.",
"k": [
"Selulitis menyebar di dermis dalam–subkutis",
"Lipoma: tumor jinak jaringan lemak, lunak & mobile",
"Tempat injeksi subkutan (insulin, heparin)"
],
"dz": [
"selulitis",
"lipoma",
"luka-bakar-berat"
],
"pf": [
"dermografisme-palpasi"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "dermis",
"name": "Dermis",
"latin": "Dermis",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Jaringan ikat (kolagen & elastin) di bawah epidermis; berisi pembuluh darah, saraf, folikel, dan kelenjar. Papila dermis menjangkar epidermis.",
"k": [
"Luka sampai dermis dalam sembuh dengan jaringan parut",
"Luka bakar derajat II mengenai dermis (superfisial/dalam)",
"Urtikaria = edema dermis sementara"
],
"dz": [
"luka-bakar-ringan",
"urtikaria",
"selulitis",
"morfea",
"vulnus"
],
"pf": [
"efloresensi",
"dermografisme-palpasi"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "epidermis",
"name": "Epidermis",
"latin": "Epidermis",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Epitel berlapis gepeng berkeratin tanpa pembuluh darah (4–5 lapis: basal, spinosum, granulosum, lusidum, korneum). Regenerasi ±28 hari.",
"k": [
"Lesi terbatas epidermis sembuh tanpa jaringan parut",
"Vesikel/bula intraepidermal (pemfigus) vs subepidermal (pemfigoid)",
"Asal karsinoma sel basal & sel skuamosa"
],
"dz": [
"psoriasis",
"impetigo",
"penyakit-bulosa",
"kanker-kulit-nonmelanoma",
"veruka"
],
"pf": [
"efloresensi",
"tanda-khusus-kulit"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "korneum",
"name": "Stratum korneum",
"latin": "Stratum corneum",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Lapisan epidermis terluar berisi korneosit mati berkeratin; sawar utama terhadap air, mikroba, dan zat kimia.",
"k": [
"Penebalan = hiperkeratosis (kalus, iktiosis)",
"Tempat jamur dermatofita hidup — kerokan KOH diambil dari sini",
"Sawar rusak pada dermatitis atopik → kulit kering & mudah iritasi"
],
"dz": [
"tinea",
"iktiosis",
"klavus",
"xerosis",
"dermatitis-atopik"
],
"pf": [
"efloresensi"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "folikel",
"name": "Folikel rambut",
"latin": "Folliculus pili",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Invaginasi epidermis tempat rambut tumbuh; memiliki siklus anagen–katagen–telogen.",
"k": [
"Folikulitis & furunkel: infeksi S. aureus pada folikel",
"Akne berawal dari sumbatan folikel pilosebasea",
"Alopesia areata menyerang folikel secara autoimun"
],
"dz": [
"furunkel",
"akne",
"alopesia-areata",
"hidradenitis"
],
"pf": [
"rambut-skalp"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "rambut",
"name": "Batang rambut",
"latin": "Scapus pili",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Batang keratin keras hasil folikel; melindungi dan berfungsi sensorik.",
"k": [
"Pull test menilai kerontokan aktif",
"Rambut patah (black dot) pada tinea kapitis",
"Telur kutu menempel pada batang rambut"
],
"dz": [
"alopesia-androgenik",
"telogen-effluvium",
"tinea-lain",
"pedikulosis"
],
"pf": [
"rambut-skalp"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "sebasea",
"name": "Kelenjar sebasea",
"latin": "Glandula sebacea",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Kelenjar holokrin yang mengeluarkan sebum ke folikel; melumasi kulit dan rambut. Dipengaruhi androgen.",
"k": [
"Hiperaktivitas sebasea + C. acnes → akne vulgaris",
"Dermatitis seboroik di area kaya sebasea",
"Kista epidermal sering disangka \"kista sebasea\""
],
"dz": [
"akne",
"dermatitis-seboroik",
"rosasea",
"kista-epidermal"
],
"pf": [],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "arektor",
"name": "M. arrector pili",
"latin": "M. arrector pili",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Otot polos kecil yang menegakkan rambut (merinding) saat dingin/takut; dipersarafi simpatis.",
"k": [
"Cutis anserina (merinding) juga ditemukan pada jenazah tenggelam"
],
"dz": [],
"pf": [
"asfiksia-tenggelam"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "ekrin",
"name": "Kelenjar keringat ekrin",
"latin": "Glandula sudorifera eccrina",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Kelenjar keringat ekrin di seluruh tubuh (terbanyak telapak tangan-kaki); termoregulasi. Dipersarafi simpatis kolinergik.",
"k": [
"Sumbatan duktus → miliaria (biang keringat)",
"Hiperhidrosis primer telapak/aksila",
"Kelenjar apokrin (berbeda) di aksila-genital → hidradenitis supurativa"
],
"dz": [
"miliaria",
"hiperhidrosis",
"hidradenitis"
],
"pf": [],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "pembuluh",
"name": "Pembuluh darah dermis",
"latin": "Plexus vascularis dermalis",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Pleksus vaskular dermis superfisial & dalam: nutrisi kulit dan pengaturan suhu (vasodilatasi/vasokonstriksi).",
"k": [
"Eritema memucat dengan diaskopi; purpura tidak memucat",
"Petekie: perdarahan kapiler (trombositopenia, DBD, vaskulitis)",
"Hemangioma infantil: proliferasi pembuluh darah"
],
"dz": [
"vaskulitis",
"itp",
"dengue",
"hemangioma",
"henoch-schonlein"
],
"pf": [
"efloresensi",
"rumple-leede"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "meissner",
"name": "Korpuskel Meissner",
"latin": "Corpusculum tactus",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Reseptor raba halus di papila dermis, banyak di ujung jari & bibir; adaptasi cepat.",
"k": [
"Diskriminasi dua titik menilai kepadatan reseptor ini"
],
"dz": [
"kusta",
"neuropati-simetris"
],
"pf": [
"sensorik"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "pacini",
"name": "Korpuskel Pacini",
"latin": "Corpusculum lamellosum",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Reseptor tekanan dalam & getar di subkutis (berlapis seperti bawang); adaptasi sangat cepat.",
"k": [
"Sensasi getar diuji dengan garpu tala 128 Hz",
"Getar hilang dini pada neuropati diabetik"
],
"dz": [
"neuropati-simetris",
"kaki-diabetik"
],
"pf": [
"sensorik"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "saraf-kulit",
"name": "Saraf kutaneus",
"latin": "Nervus cutaneus",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Serabut sensorik (nyeri, suhu, raba) dan otonom kulit; distribusinya mengikuti dermatom dan saraf perifer.",
"k": [
"Kusta merusak saraf kulit → lesi mati rasa",
"Herpes zoster muncul sesuai dermatom",
"Neuralgia pascaherpes: nyeri neuropatik menetap"
],
"dz": [
"kusta",
"herpes-zoster",
"phn",
"neuropati-simetris"
],
"pf": [
"kusta-saraf",
"sensorik"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "melanosit",
"name": "Melanosit (lapisan basal)",
"latin": "Melanocytus",
"topic": "kulit",
"topicName": "Kulit (integumen)",
"fn": "Sel penghasil pigmen melanin di stratum basal; melindungi DNA dari sinar UV.",
"k": [
"Hilang pada vitiligo (bercak depigmentasi)",
"Melanin berlebih: melasma, hiperpigmentasi pascainflamasi",
"Asal nevus pigmentosus dan melanoma maligna (aturan ABCDE)"
],
"dz": [
"vitiligo",
"melasma",
"melanoma",
"nevus",
"albinisme"
],
"pf": [
"wood-lamp"
],
"det": "",
"t": [
"sys:9"
],
"approx": "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."
},
{
"id": "temporalis",
"name": "M. temporalis",
"latin": "M. temporalis",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Elevasi & retraksi mandibula (menutup mulut).",
"k": [
"Teraba berkontraksi saat menggigit — uji motorik N. V",
"Nyeri tekan temporal + klaudikasio rahang pada lansia → arteritis temporal"
],
"dz": [
"arteritis-kranial"
],
"pf": [
"n5-trigeminus"
],
"det": "Persarafan: N. mandibularis (V3).",
"t": [
"Temporalis muscle"
]
},
{
"id": "masseter",
"name": "M. masseter",
"latin": "M. masseter",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Otot pengunyah terkuat; elevasi mandibula.",
"k": [
"Trismus (spasme masseter) pada tetanus, abses peritonsil",
"Diraba saat uji motorik N. V"
],
"dz": [
"tetanus",
"abses-peritonsil"
],
"pf": [
"n5-trigeminus"
],
"det": "Persarafan: N. mandibularis (V3).",
"t": [
"Superficial part of masseter",
"Deep part of masseter"
]
},
{
"id": "scm",
"name": "M. sternokleidomastoideus",
"latin": "M. sternocleidomastoideus",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Kontraksi satu sisi: kepala menoleh ke sisi berlawanan & miring ke sisi sama; dua sisi: fleksi leher; otot bantu napas.",
"k": [
"Penanda segitiga leher anterior & posterior (lokasi KGB, JVP)",
"Tortikolis kongenital akibat fibrosis SCM",
"Uji N. XI: menoleh melawan tahanan"
],
"dz": [
"gawat-napas",
"ppok"
],
"pf": [
"n9-n12-bulbar",
"distres-napas",
"jvp"
],
"det": "Persarafan: N. aksesorius (XI).",
"t": [
"Sternocleidomastoid muscle"
]
},
{
"id": "deltoid",
"name": "M. deltoideus",
"latin": "M. deltoideus",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Abduksi lengan 15–90° (bagian tengah), fleksi & ekstensi bahu.",
"k": [
"Lokasi injeksi IM (2–3 jari di bawah akromion)",
"Cedera N. aksilaris (fraktur kolum humerus/dislokasi bahu) → atrofi deltoid & baal di \"regimental badge\""
],
"dz": [
"dislokasi",
"fraktur"
],
"pf": [
"bahu"
],
"det": "Persarafan: N. aksilaris (C5–C6).",
"t": [
"g:Deltoid muscle"
]
},
{
"id": "pektoralis",
"name": "M. pektoralis mayor",
"latin": "M. pectoralis major",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Adduksi, rotasi interna, dan fleksi lengan.",
"k": [
"Diuji saat inspeksi payudara (tangan menekan pinggang)",
"Retraksi kulit di atas pektoralis curiga keganasan payudara"
],
"dz": [
"kanker-payudara"
],
"pf": [
"payudara"
],
"det": "Persarafan: N. pektoralis medial & lateral.",
"t": [
"g:Pectoralis major muscle"
]
},
{
"id": "biseps",
"name": "M. biseps brakii",
"latin": "M. biceps brachii",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Fleksi siku dan supinasi lengan bawah (supinator terkuat).",
"k": [
"Refleks biseps menilai C5–C6",
"Ruptur tendon proksimal → \"Popeye sign\""
],
"dz": [
"hnp"
],
"pf": [
"refleks-fisiologis",
"motorik"
],
"det": "Persarafan: N. muskulokutaneus (C5–C6).",
"t": [
"g:Biceps brachii muscle"
]
},
{
"id": "rektus",
"name": "M. rektus abdominis",
"latin": "M. rectus abdominis",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Fleksi trunkus, menekan isi abdomen (mengejan, batuk).",
"k": [
"Diastasis rekti pada kehamilan/obesitas",
"Defans muskular pada peritonitis",
"Hematoma rektus pada antikoagulan"
],
"dz": [
"peritonitis",
"hernia-umbilikalis"
],
"pf": [
"palpasi-abdomen",
"inspeksi-auskultasi-abdomen"
],
"det": "Persarafan: N. torakoabdominal T7–T12.",
"t": [
"Rectus abdominis muscle"
]
},
{
"id": "obliqus",
"name": "M. obliqus eksternus abdominis",
"latin": "M. obliquus externus abdominis",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Rotasi & fleksi lateral trunkus, menekan abdomen; aponeurosisnya membentuk ligamentum inguinale.",
"k": [
"Kanalis inguinalis dibatasi aponeurosis obliqus eksternus",
"Lemah di segitiga Hesselbach → hernia direk"
],
"dz": [
"hernia-inguinal"
],
"pf": [
"hernia"
],
"det": "Persarafan: T7–T12, N. iliohipogastrik.",
"t": [
"External abdominal oblique muscle"
]
},
{
"id": "fleksor-lb",
"name": "Otot fleksor lengan bawah",
"latin": "Mm. flexores antebrachii",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Fleksi pergelangan & jari (kelompok fleksor dari epikondilus medial).",
"k": [
"Tendon fleksor & N. medianus melewati terowongan karpal",
"Epikondilitis medial (\"golfer's elbow\")"
],
"dz": [
"neuropati-jeratan",
"tendinitis-bursitis"
],
"pf": [
"tangan-pergelangan"
],
"det": "Persarafan: N. medianus & N. ulnaris.",
"t": [
"Flexor carpi radialis",
"Flexor digitorum profundus",
"Humero-ulnar head of flexor digitorum superficialis",
"Radial head of flexor digitorum superficialis",
"Humeral head of flexor carpi ulnaris",
"Ulnar head of flexor carpi ulnaris",
"Palmaris longus muscle"
]
},
{
"id": "kuadriseps",
"name": "M. kuadriseps femoris",
"latin": "M. quadriceps femoris",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Ekstensor lutut utama (rektus femoris, vastus lateralis/medialis/intermedius); rektus femoris juga fleksi panggul.",
"k": [
"Refleks patela menilai L3–L4",
"Vastus lateralis: lokasi injeksi IM pada bayi",
"Atrofi cepat pada imobilisasi/cedera lutut"
],
"dz": [
"hnp",
"osteoartritis"
],
"pf": [
"refleks-fisiologis",
"lutut"
],
"det": "Persarafan: N. femoralis (L2–L4).",
"t": [
"Rectus femoris muscle",
"Vastus lateralis muscle",
"Vastus medialis muscle",
"Vastus intermedius muscle"
]
},
{
"id": "sartorius",
"name": "M. sartorius",
"latin": "M. sartorius",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Otot terpanjang tubuh; fleksi, abduksi, rotasi eksterna panggul dan fleksi lutut (posisi duduk bersila).",
"k": [
"Batas lateral segitiga femoral (lokasi a. femoralis untuk nadi & akses vaskular)"
],
"dz": [],
"pf": [
"arteri-perifer"
],
"det": "Persarafan: N. femoralis.",
"t": [
"Sartorius muscle"
]
},
{
"id": "adduktor",
"name": "Otot adduktor paha",
"latin": "Mm. adductores",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Adduksi paha (adduktor longus, brevis, magnus, gracilis).",
"k": [
"Cedera \"groin strain\" pada atlet",
"Kanalis adduktor (Hunter) dilalui a. femoralis"
],
"dz": [
"sprain-strain"
],
"pf": [
"panggul"
],
"det": "Persarafan: N. obturatorius (L2–L4).",
"t": [
"Adductor magnus",
"Adductor longus",
"Adductor brevis",
"Gracilis muscle",
"Pectineus muscle"
]
},
{
"id": "tibialis",
"name": "M. tibialis anterior",
"latin": "M. tibialis anterior",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Dorsofleksi dan inversi kaki.",
"k": [
"Lemah pada radikulopati L4–L5/cedera N. peroneus → foot drop & steppage gait",
"Sindrom kompartemen anterior tungkai"
],
"dz": [
"claw-drop",
"hnp"
],
"pf": [
"keseimbangan-gait",
"motorik"
],
"det": "Persarafan: N. peroneus profundus (L4–L5).",
"t": [
"Tibialis anterior muscle"
]
},
{
"id": "trapezius",
"name": "M. trapezius",
"latin": "M. trapezius",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Elevasi, retraksi, depresi, dan rotasi skapula; menyangga bahu.",
"k": [
"Uji N. XI: angkat bahu melawan tahanan",
"Titik tekan nyeri sentral untuk GCS (cubit trapezius)",
"Nyeri otot leher-bahu pada tension-type headache"
],
"dz": [
"tth"
],
"pf": [
"n9-n12-bulbar",
"gcs"
],
"det": "Persarafan: N. aksesorius (XI).",
"t": [
"g:Trapezius muscle"
]
},
{
"id": "latissimus",
"name": "M. latissimus dorsi",
"latin": "M. latissimus dorsi",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Ekstensi, adduksi, rotasi interna lengan (gerakan menarik/memanjat).",
"k": [
"Dipakai sebagai flap rekonstruksi"
],
"dz": [],
"pf": [
"tulang-belakang"
],
"det": "Persarafan: N. torakodorsalis (C6–C8).",
"t": [
"Latissimus dorsi muscle"
]
},
{
"id": "triseps",
"name": "M. triseps brakii",
"latin": "M. triceps brachii",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Ekstensor siku utama.",
"k": [
"Refleks triseps menilai C7",
"Lemah pada cedera N. radialis tinggi"
],
"dz": [
"hnp",
"claw-drop"
],
"pf": [
"refleks-fisiologis"
],
"det": "Persarafan: N. radialis (C6–C8).",
"t": [
"g:Triceps brachii muscle"
]
},
{
"id": "gluteus",
"name": "M. gluteus maksimus",
"latin": "M. gluteus maximus",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Ekstensi & rotasi eksterna panggul (bangun dari duduk, naik tangga).",
"k": [
"Injeksi IM di kuadran superolateral bokong untuk menghindari N. iskiadikus",
"Gluteus medius (bukan maksimus) yang diuji pada Trendelenburg test"
],
"dz": [
"ulkus-dekubitus"
],
"pf": [
"panggul"
],
"det": "Persarafan: N. gluteus inferior (L5–S2).",
"t": [
"Gluteus maximus muscle"
]
},
{
"id": "hamstring",
"name": "Otot hamstring",
"latin": "M. biceps femoris, semitendinosus, semimembranosus",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Fleksi lutut dan ekstensi panggul.",
"k": [
"Cedera hamstring tersering pada pelari",
"Pemendekan hamstring memengaruhi uji Lasègue"
],
"dz": [
"sprain-strain"
],
"pf": [
"lasegue-patrick"
],
"det": "Persarafan: N. iskiadikus (L5–S2).",
"t": [
"Long head of biceps femoris",
"Short head of biceps femoris",
"Semitendinosus muscle",
"Semimembranosus muscle"
]
},
{
"id": "gastroknemius",
"name": "M. gastroknemius & soleus",
"latin": "M. triceps surae",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Plantarfleksi kaki (berjinjit, melompat) bersama soleus; gastroknemius juga fleksi lutut.",
"k": [
"Refleks Achilles menilai S1",
"Nyeri & bengkak betis curiga TVD (bandingkan lingkar betis)",
"Hipertrofi betis semu pada distrofi Duchenne"
],
"dz": [
"tvd",
"dmd"
],
"pf": [
"varises-homan",
"refleks-fisiologis"
],
"det": "Persarafan: N. tibialis (S1–S2).",
"t": [
"Lateral head of gastrocnemius",
"Medial head of gastrocnemius",
"Soleus muscle"
]
},
{
"id": "achilles",
"name": "Tendon Achilles",
"latin": "Tendo calcaneus",
"topic": "otot",
"topicName": "Otot (muskuloskeletal)",
"fn": "Tendon terkuat tubuh, menghubungkan gastroknemius-soleus ke kalkaneus.",
"k": [
"Ruptur: celah teraba + Thompson test positif",
"Refleks APR (S1) diketuk di sini"
],
"dz": [
"ruptur-achilles"
],
"pf": [
"kaki-pergelangan",
"refleks-fisiologis"
],
"det": "",
"t": [
"Calcaneal tendon"
]
},
{
"id": "kranium",
"name": "Kranium (tengkorak)",
"latin": "Cranium",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Melindungi otak; terdiri dari neurokranium dan viserokranium (wajah). Sutura menyatu setelah masa kanak-kanak.",
"k": [
"Fraktur basis kranii: brill hematoma, Battle sign, rinore/otore LCS",
"Fontanel anterior bayi menutup 12–18 bulan",
"Kraniosinostosis: penutupan sutura prematur"
],
"dz": [
"fraktur-basis-kranii",
"hematoma-epidural",
"mikrosefali",
"hidrosefalus"
],
"pf": [
"fontanel",
"gcs"
],
"det": "",
"t": [
"g:Cranium"
]
},
{
"id": "mandibula",
"name": "Mandibula",
"latin": "Mandibula",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Satu-satunya tulang tengkorak yang bergerak (sendi temporomandibula); menyangga gigi bawah.",
"k": [
"Fraktur mandibula: maloklusi, step-off, parestesia dagu",
"Dislokasi TMJ saat menguap lebar"
],
"dz": [
"fraktur-wajah"
],
"pf": [],
"det": "",
"t": [
"Mandible"
]
},
{
"id": "vertebra",
"name": "Kolumna vertebralis",
"latin": "Columna vertebralis",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "33 ruas (7 servikal, 12 torakal, 5 lumbal, 5 sakral menyatu, 4 koksigeal); melindungi medula spinalis dan menopang tubuh.",
"k": [
"HNP tersering L4–L5 & L5–S1",
"Gibbus pada spondilitis TB",
"Fraktur kompresi osteoporotik pada lansia"
],
"dz": [
"hnp",
"spondilitis-tb",
"trauma-vertebra",
"osteoporosis",
"deformitas-spinal",
"spondilitis-ankilosa"
],
"pf": [
"tulang-belakang",
"lasegue-patrick"
],
"det": "",
"t": [
"g:Bones of vertebral column"
]
},
{
"id": "klavikula",
"name": "Klavikula",
"latin": "Clavicula",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Penyangga yang menghubungkan lengan ke aksial skeleton (sendi sternoklavikula & akromioklavikula).",
"k": [
"Fraktur tersering pada bayi baru lahir (persalinan sulit) & jatuh bertumpu tangan",
"Moro asimetris pada fraktur klavikula neonatus"
],
"dz": [
"fraktur-klavikula"
],
"pf": [
"refleks-bayi",
"bahu"
],
"det": "",
"t": [
"Clavicle"
]
},
{
"id": "skapula",
"name": "Skapula",
"latin": "Scapula",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Tempat origo otot rotator cuff; berartikulasi dengan humerus (sendi glenohumeral).",
"k": [
"Winging scapula: paresis N. torakalis longus",
"Tertinggal saat inspirasi pada patologi paru sisi tersebut"
],
"dz": [
"tendinitis-bursitis"
],
"pf": [
"bahu",
"tulang-belakang"
],
"det": "",
"t": [
"Scapula"
]
},
{
"id": "sternum",
"name": "Sternum",
"latin": "Sternum",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Manubrium, korpus, prosesus xifoideus; tempat melekat iga. Angulus Louis setinggi iga ke-2.",
"k": [
"Angulus sterni = patokan menghitung ICS & mengukur JVP",
"Posisi kompresi RJP: setengah bawah sternum",
"Aspirasi sumsum tulang (dewasa) dapat di sternum"
],
"dz": [
"henti-jantung"
],
"pf": [
"jvp",
"prekordium"
],
"det": "",
"t": [
"Manubrium of sternum",
"Body of sternum",
"Xiphoid process"
]
},
{
"id": "kosta",
"name": "Kosta (iga)",
"latin": "Costae",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "12 pasang iga: 1–7 sejati, 8–10 palsu, 11–12 melayang; melindungi organ toraks dan membantu ventilasi.",
"k": [
"Fraktur kosta → nyeri pleuritik, risiko pneumotoraks",
"Flail chest: ≥ 2 iga patah di ≥ 2 tempat → gerak paradoksal",
"Sela iga dipakai untuk WSD (ICS 4–5 linea aksilaris media)"
],
"dz": [
"fraktur-kosta",
"flail-chest",
"pneumotoraks"
],
"pf": [
"palpasi-toraks",
"inspeksi-toraks"
],
"det": "",
"t": [
"g:Ribs"
]
},
{
"id": "humerus",
"name": "Humerus",
"latin": "Humerus",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Tulang lengan atas; kaput berartikulasi dengan glenoid.",
"k": [
"Fraktur kolum chirurgicum → cedera N. aksilaris",
"Fraktur batang humerus → cedera N. radialis (wrist drop)",
"Fraktur suprakondiler anak → risiko cedera a. brakialis"
],
"dz": [
"fraktur",
"dislokasi"
],
"pf": [
"bahu",
"sendi-umum"
],
"det": "",
"t": [
"Humerus"
]
},
{
"id": "radius-ulna",
"name": "Radius & ulna",
"latin": "Radius et ulna",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Tulang lengan bawah; radius berputar mengelilingi ulna untuk pronasi-supinasi.",
"k": [
"Fraktur Colles (radius distal) tersering pada lansia jatuh bertumpu tangan",
"Pulled elbow (subluksasi kaput radius) pada balita"
],
"dz": [
"fraktur",
"dislokasi"
],
"pf": [
"tangan-pergelangan"
],
"det": "",
"t": [
"Radius",
"Ulna"
]
},
{
"id": "manus",
"name": "Tulang tangan (karpal, metakarpal, falang)",
"latin": "Ossa manus",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "8 karpal, 5 metakarpal, 14 falang; memungkinkan genggaman presisi.",
"k": [
"Nyeri snuffbox anatomis → curiga fraktur skafoid (risiko nekrosis avaskular)",
"Nodus Heberden/Bouchard pada OA; deformitas swan neck pada AR"
],
"dz": [
"fraktur",
"artritis-reumatoid",
"osteoartritis",
"sindaktili-polidaktili"
],
"pf": [
"tangan-pergelangan",
"sendi-umum"
],
"det": "",
"t": [
"g:Bones of hand"
]
},
{
"id": "pelvis",
"name": "Pelvis (os koksae & sakrum)",
"latin": "Pelvis",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Os koksae (ilium, iskium, pubis) dan sakrum; menopang tubuh & melindungi organ panggul. Panggul wanita lebih lebar (jalan lahir).",
"k": [
"Fraktur pelvis → perdarahan masif & cedera uretra",
"Pelvimetri klinis menilai kapasitas jalan lahir",
"Sakroiliitis pada spondilitis ankilosa"
],
"dz": [
"fraktur",
"cpd",
"ruptur-uretra",
"spondilitis-ankilosa"
],
"pf": [
"pelvimetri",
"panggul"
],
"det": "",
"t": [
"Hip bone",
"Sacrum",
"Coccyx"
]
},
{
"id": "femur",
"name": "Femur",
"latin": "Femur",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Tulang terpanjang & terkuat; kaput berartikulasi di asetabulum.",
"k": [
"Fraktur kolum femur pada lansia: tungkai memendek & rotasi eksterna",
"Nekrosis avaskular kaput femur (steroid, alkohol, SCFE)",
"Perdarahan fraktur batang femur dapat 1–1,5 L"
],
"dz": [
"fraktur",
"nekrosis-kaput-femur",
"ddh",
"osteoporosis"
],
"pf": [
"panggul"
],
"det": "",
"t": [
"Femur"
]
},
{
"id": "patela",
"name": "Patela",
"latin": "Patella",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Tulang sesamoid terbesar dalam tendon kuadriseps; meningkatkan daya ungkit ekstensi lutut.",
"k": [
"Patellar tap untuk efusi lutut",
"Dislokasi patela ke lateral pada remaja"
],
"dz": [
"osteoartritis",
"cedera-ligamen-lutut"
],
"pf": [
"lutut"
],
"det": "",
"t": [
"Patella"
]
},
{
"id": "tibia-fibula",
"name": "Tibia & fibula",
"latin": "Tibia et fibula",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "Tibia menopang berat badan; fibula tempat melekat otot & membentuk maleolus lateral.",
"k": [
"Permukaan anteromedial tibia langsung di bawah kulit → fraktur sering terbuka",
"Akses intraoseus (IO) di tibia proksimal pada anak syok",
"Leher fibula: N. peroneus rentan cedera"
],
"dz": [
"fraktur",
"osteomielitis",
"claw-drop"
],
"pf": [
"kaki-pergelangan"
],
"det": "",
"t": [
"Tibia",
"Fibula"
]
},
{
"id": "pedis",
"name": "Tulang kaki (tarsal, metatarsal, falang)",
"latin": "Ossa pedis",
"topic": "tulang",
"topicName": "Tulang (skeleton)",
"fn": "7 tarsal, 5 metatarsal, 14 falang; membentuk lengkung longitudinal & transversal.",
"k": [
"Ottawa ankle rules menentukan perlunya rontgen",
"CTEV (clubfoot) pada bayi",
"Deformitas & ulkus kaki diabetik"
],
"dz": [
"deformitas-kongenital-kaki",
"kaki-diabetik",
"gout",
"instabilitas-ankle"
],
"pf": [
"kaki-pergelangan"
],
"det": "",
"t": [
"g:Bones of foot"
]
},
{
"id": "frontal",
"name": "Lobus frontalis",
"latin": "Lobus frontalis",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Fungsi eksekutif, perencanaan, kepribadian, perilaku sosial, gerak volunter (korteks motorik), bicara motorik (Broca, hemisfer dominan).",
"k": [
"Lesi: perubahan kepribadian, disinhibisi, apatis, refleks primitif positif",
"Kelemahan kontralateral bila korteks motorik terkena"
],
"dz": [
"tumor-otak",
"demensia",
"stroke-iskemik",
"hematoma-subdural"
],
"pf": [
"fungsi-luhur",
"refleks-primitif"
],
"det": "",
"t": [
"g:Frontal lobe"
]
},
{
"id": "parietal",
"name": "Lobus parietalis",
"latin": "Lobus parietalis",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Integrasi sensorik, kesadaran ruang, kalkulasi, orientasi kanan-kiri.",
"k": [
"Lesi nondominan (kanan): neglect sisi kiri, apraksia berpakaian",
"Lesi dominan: sindrom Gerstmann (akalkulia, agrafia, agnosia jari, bingung kanan-kiri)",
"Astereognosis & agrafestesia"
],
"dz": [
"stroke-iskemik",
"tumor-otak"
],
"pf": [
"fungsi-luhur",
"sensorik"
],
"det": "",
"t": [
"g:Parietal lobe"
]
},
{
"id": "oksipital",
"name": "Lobus oksipitalis",
"latin": "Lobus occipitalis",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Pusat penglihatan (korteks visual primer & asosiasi).",
"k": [
"Lesi unilateral: hemianopia homonim kontralateral (sering macular sparing)",
"Lesi bilateral: buta kortikal (Anton syndrome)"
],
"dz": [
"stroke-iskemik",
"gangguan-lapang-pandang"
],
"pf": [
"lapang-pandang"
],
"det": "",
"t": [
"g:Occipital lobe"
]
},
{
"id": "temporal",
"name": "Lobus temporalis",
"latin": "Lobus temporalis",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Pendengaran, memori (hipokampus), pemahaman bahasa (Wernicke), emosi (amigdala).",
"k": [
"Epilepsi lobus temporal: aura déjà vu, bau aneh, automatisme",
"Gangguan memori pada Alzheimer (atrofi hipokampus)",
"Lesi: kuadranopia homonim atas"
],
"dz": [
"epilepsi",
"alzheimer",
"ensefalitis"
],
"pf": [
"fungsi-luhur"
],
"det": "",
"t": [
"g:Temporal lobe"
]
},
{
"id": "serebelum",
"name": "Serebelum",
"latin": "Cerebellum",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Koordinasi gerak, keseimbangan, tonus, dan pembelajaran motorik — mengatur sisi tubuh yang sama (ipsilateral).",
"k": [
"Lesi: ataksia, dismetria, disdiadokinesis, tremor intensi, nistagmus ipsilateral",
"Perdarahan/infark serebelum: vertigo + muntah + ataksia — awas herniasi",
"Degenerasi vermis karena alkohol → ataksia gait"
],
"dz": [
"vertigo-sentral",
"gangguan-alkohol",
"tumor-otak"
],
"pf": [
"koordinasi",
"keseimbangan-gait"
],
"det": "",
"t": [
"g:Cerebellum"
]
},
{
"id": "batang-otak",
"name": "Batang otak (mesensefalon, pons, medula oblongata)",
"latin": "Truncus encephali",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Jalur motorik-sensorik, inti saraf kranial III–XII, pusat napas & kardiovaskular, kesadaran (formasio retikularis).",
"k": [
"Sindrom alternans: paresis saraf kranial ipsilateral + hemiparesis kontralateral",
"Herniasi menekan batang otak → pupil dilatasi, pola napas abnormal, koma",
"Mati batang otak = kriteria kematian"
],
"dz": [
"lesi-batang-otak",
"mati-batang-otak",
"koma"
],
"pf": [
"pupil",
"gcs",
"n9-n12-bulbar"
],
"det": "Mesensefalon (N. III–IV), pons (N. V–VIII), medula oblongata (N. IX–XII).",
"t": [
"g:Brainstem"
]
},
{
"id": "presentral",
"name": "Girus presentralis (korteks motorik primer)",
"latin": "Gyrus precentralis",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Korteks motorik primer: perencanaan & eksekusi gerak volunter sisi tubuh kontralateral (homunkulus motorik).",
"k": [
"Lesi → hemiparesis UMN kontralateral",
"Wajah-lengan lebih berat pada stroke a. serebri media; tungkai lebih berat pada a. serebri anterior"
],
"dz": [
"stroke-iskemik",
"perdarahan-intraserebral"
],
"pf": [
"motorik",
"refleks-patologis"
],
"det": "",
"t": [
"Precentral gyrus"
]
},
{
"id": "postsentral",
"name": "Girus postsentralis (korteks somatosensorik)",
"latin": "Gyrus postcentralis",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Korteks somatosensorik primer: raba, nyeri, suhu, posisi dari sisi tubuh kontralateral.",
"k": [
"Lesi → hemihipestesia kontralateral & gangguan sensasi kortikal"
],
"dz": [
"stroke-iskemik"
],
"pf": [
"sensorik"
],
"det": "",
"t": [
"Postcentral gyrus"
]
},
{
"id": "broca",
"name": "Area Broca (bicara motorik)",
"latin": "Area Broca (BA 44-45)",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Produksi bicara (motorik bahasa) — girus frontal inferior hemisfer dominan.",
"k": [
"Afasia Broca: bicara tidak lancar, telegrafik, pemahaman relatif baik, pasien sadar & frustrasi",
"Sering disertai hemiparesis kanan (a. serebri media superior)"
],
"dz": [
"stroke-iskemik"
],
"pf": [
"fungsi-luhur"
],
"det": "",
"t": [
"Opercular part of inferior frontal gyrus",
"Triangular part of inferior frontal gyrus"
]
},
{
"id": "wernicke",
"name": "Area Wernicke (pemahaman bahasa)",
"latin": "Area Wernicke (BA 22)",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Pemahaman bahasa — girus temporal superior posterior hemisfer dominan.",
"k": [
"Afasia Wernicke: bicara lancar tetapi tanpa makna (parafasia), pemahaman buruk, pasien tidak menyadari",
"Tanpa hemiparesis (a. serebri media inferior)"
],
"dz": [
"stroke-iskemik"
],
"pf": [
"fungsi-luhur"
],
"det": "",
"t": [
"Superior temporal gyrus (Lateral part)",
"Temporal plane"
]
},
{
"id": "visual",
"name": "Korteks visual primer",
"latin": "Area striata (BA 17)",
"topic": "saraf",
"topicName": "Otak & saraf pusat",
"fn": "Korteks visual primer di tepi fisura kalkarina; menerima jalur dari korpus genikulatum lateral.",
"k": [
"Infark a. serebri posterior → hemianopia homonim kontralateral dengan macular sparing"
],
"dz": [
"stroke-iskemik",
"gangguan-lapang-pandang"
],
"pf": [
"lapang-pandang"
],
"det": "",
"t": [
"Calcarine sulcus",
"Cuneus",
"Lingual gyrus"
]
},
{
"id": "vka-sup",
"name": "Vena kava superior",
"latin": "Vena cava superior",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Mengembalikan darah vena dari kepala, leher, ekstremitas atas ke atrium kanan.",
"k": [
"Sindrom vena kava superior: wajah sembab, vena leher & dada melebar (tumor mediastinum, kanker paru)",
"Jalur kateter vena sentral (v. jugularis interna/subklavia)"
],
"dz": [
"svcs",
"tumor-mediastinum",
"kanker-paru"
],
"pf": [
"jvp"
],
"det": "",
"t": [
"Superior vena cava"
]
},
{
"id": "vka-inf",
"name": "Vena kava inferior",
"latin": "Vena cava inferior",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Mengembalikan darah vena dari tubuh bagian bawah ke atrium kanan.",
"k": [
"Kompresi oleh uterus hamil saat terlentang → sindrom hipotensi supinasi (miringkan ke kiri)",
"Diameter & kolapsibilitas VKI di USG menilai status cairan"
],
"dz": [
"syok",
"tvd"
],
"pf": [
"pf-usia"
],
"det": "",
"t": [
"Inferior vena cava (thoracic part)",
"Inferior vena cava (abdominal part)"
]
},
{
"id": "aorta",
"name": "Aorta (arkus)",
"latin": "Arcus aortae",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Arteri terbesar, membawa darah teroksigenasi dari ventrikel kiri ke sirkulasi sistemik.",
"k": [
"Diseksi aorta: nyeri dada menjalar ke punggung, beda TD antarlengan",
"Koarktasio: hipertensi lengan, nadi femoral lemah/terlambat",
"Aneurisma aorta abdominal: massa pulsatil ekspansil"
],
"dz": [
"aneurisma-aorta",
"koarktasio-aorta"
],
"pf": [
"tekanan-darah",
"arteri-perifer"
],
"det": "",
"t": [
"Aortic arch"
]
},
{
"id": "pulmonalis",
"name": "Trunkus pulmonalis",
"latin": "Truncus pulmonalis",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Membawa darah vena (miskin O₂) dari ventrikel kanan ke paru.",
"k": [
"Emboli paru menyumbat cabang a. pulmonalis: sesak mendadak, takikardia, hipoksia",
"Hipertensi pulmonal: P2 keras, parasternal heave"
],
"dz": [
"emboli-paru",
"hipertensi-pulmonal"
],
"pf": [
"auskultasi-jantung",
"prekordium"
],
"det": "",
"t": [
"Pulmonary trunk"
]
},
{
"id": "v-pulm",
"name": "Vena pulmonalis",
"latin": "Venae pulmonales",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Empat vena yang membawa darah teroksigenasi dari paru ke atrium kiri.",
"k": [
"Fokus pemicu fibrilasi atrium di muara v. pulmonalis (target ablasi)",
"Bendungan vena pulmonal → edema paru (gagal jantung kiri, stenosis mitral)"
],
"dz": [
"fibrilasi-atrium",
"edema-paru"
],
"pf": [],
"det": "",
"t": [
"Right superior pulmonary vein",
"Right inferior pulmonary vein",
"Left superior pulmonary vein",
"Left inferior pulmonary vein"
]
},
{
"id": "atrium-ka",
"name": "Atrium kanan",
"latin": "Atrium dextrum",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Menerima darah vena sistemik (VKS, VKI, sinus koronarius); berisi nodus SA.",
"k": [
"Tekanan atrium kanan tercermin pada JVP",
"Dilatasi pada regurgitasi trikuspid & hipertensi pulmonal"
],
"dz": [
"gagal-jantung",
"kor-pulmonal-kronik"
],
"pf": [
"jvp"
],
"det": "",
"t": [
"Right atrium"
]
},
{
"id": "ventrikel-ka",
"name": "Ventrikel kanan",
"latin": "Ventriculus dexter",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Memompa darah ke paru dengan tekanan rendah (dinding lebih tipis).",
"k": [
"Hipertrofi: parasternal heave (hipertensi pulmonal, PPOK lanjut = kor pulmonal)",
"Infark ventrikel kanan: hipotensi + JVP meningkat + paru bersih — hindari nitrat"
],
"dz": [
"kor-pulmonal-kronik",
"hipertensi-pulmonal",
"ska"
],
"pf": [
"prekordium"
],
"det": "",
"t": [
"Right ventricle"
]
},
{
"id": "atrium-ki",
"name": "Atrium kiri",
"latin": "Atrium sinistrum",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Menerima darah teroksigenasi dari vena pulmonalis.",
"k": [
"Membesar pada stenosis mitral → FA & trombus (risiko stroke emboli)",
"Miksoma atrium = tumor jantung primer tersering"
],
"dz": [
"penyakit-katup",
"fibrilasi-atrium"
],
"pf": [
"auskultasi-jantung"
],
"det": "",
"t": [
"Left atrium"
]
},
{
"id": "ventrikel-ki",
"name": "Ventrikel kiri",
"latin": "Ventriculus sinister",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Pompa utama sirkulasi sistemik; dinding paling tebal (±10 mm).",
"k": [
"Hipertrofi konsentrik pada hipertensi kronik/stenosis aorta (iktus kuat angkat)",
"Dilatasi pada gagal jantung sistolik (iktus bergeser lateral, S3)",
"Infark miokard tersering di dinding anterior (LAD)"
],
"dz": [
"gagal-jantung",
"ska",
"hipertensi",
"kardiomiopati"
],
"pf": [
"prekordium",
"perkusi-jantung",
"auskultasi-jantung"
],
"det": "",
"t": [
"Left ventricle"
]
},
{
"id": "septum",
"name": "Septum interventrikular",
"latin": "Septum interventriculare",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Dinding otot pemisah kedua ventrikel; dilalui berkas His dan cabang berkas.",
"k": [
"VSD: defek septum ventrikel — murmur holosistolik keras sternal kiri bawah",
"Infark septum dapat menyebabkan blok cabang berkas"
],
"dz": [
"pjb",
"bbb"
],
"pf": [
"auskultasi-jantung"
],
"det": "",
"t": [
"Right ventricle",
"Left ventricle"
],
"approx": "Septum interventrikular berada di antara kedua ventrikel (tidak dimodelkan terpisah)."
},
{
"id": "k-trikuspid",
"name": "Katup trikuspid",
"latin": "Valva tricuspidalis",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Katup atrioventrikular kanan (3 daun); mencegah aliran balik ke atrium kanan.",
"k": [
"Regurgitasi trikuspid: murmur holosistolik sternal kiri bawah, Carvallo (+), gelombang v besar JVP",
"Endokarditis katup trikuspid pada pengguna narkoba suntik"
],
"dz": [
"penyakit-katup",
"radang-jantung"
],
"pf": [
"auskultasi-jantung",
"jvp"
],
"det": "",
"t": [
"g:Right atrioventricular valve"
]
},
{
"id": "k-mitral",
"name": "Katup mitral",
"latin": "Valva mitralis",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Katup atrioventrikular kiri (2 daun).",
"k": [
"Stenosis mitral (umumnya reumatik): rumble diastolik apeks + opening snap",
"Regurgitasi mitral: holosistolik apeks menjalar ke aksila"
],
"dz": [
"penyakit-katup",
"demam-reumatik"
],
"pf": [
"auskultasi-jantung"
],
"det": "",
"t": [
"g:Left atrioventricular valve"
]
},
{
"id": "k-aorta",
"name": "Katup aorta",
"latin": "Valva aortae",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Katup semilunar antara ventrikel kiri dan aorta (3 kuspis).",
"k": [
"Stenosis aorta: murmur ejeksi ICS II kanan menjalar ke karotis, sinkop & angina saat aktivitas",
"Regurgitasi aorta: murmur diastolik, tekanan nadi lebar, nadi kolaps"
],
"dz": [
"penyakit-katup"
],
"pf": [
"auskultasi-jantung",
"karotis-bruit"
],
"det": "",
"t": [
"g:Aortic valve"
]
},
{
"id": "k-pulmonal",
"name": "Katup pulmonal",
"latin": "Valva trunci pulmonalis",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Katup semilunar antara ventrikel kanan dan trunkus pulmonalis.",
"k": [
"Stenosis pulmonal: bagian dari Tetralogi Fallot",
"Split S2 fisiologis terdengar di area pulmonal saat inspirasi"
],
"dz": [
"pjb",
"spell-hipoksik"
],
"pf": [
"auskultasi-jantung"
],
"det": "",
"t": [
"g:Pulmonary valve"
]
},
{
"id": "sa-node",
"name": "Nodus sinoatrial (SA)",
"latin": "Nodus sinuatrialis",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Pacu jantung alami (60–100 x/menit) di dinding atrium kanan dekat muara VKS.",
"k": [
"Sick sinus syndrome → bradikardia/jeda sinus",
"Sinus takikardia: respons fisiologis (demam, nyeri, hipovolemia)"
],
"dz": [
"bradikardia",
"takikardia"
],
"pf": [
"tanda-vital"
],
"det": "",
"t": [
"Right atrium"
],
"approx": "Nodus SA terletak di dinding atrium kanan dekat muara vena kava superior (tidak dimodelkan terpisah)."
},
{
"id": "av-node",
"name": "Nodus atrioventrikular (AV) & berkas His",
"latin": "Nodus atrioventricularis",
"topic": "jantung",
"topicName": "Jantung",
"fn": "Memperlambat konduksi atrium→ventrikel (interval PR) lalu meneruskan lewat berkas His, cabang berkas, dan serabut Purkinje.",
"k": [
"Blok AV derajat I–III",
"Re-entri di nodus AV → SVT (manuver vagal/adenosin)",
"Blok cabang berkas → QRS lebar"
],
"dz": [
"bradikardia",
"takikardia",
"bbb"
],
"pf": [
"tanda-vital"
],
"det": "",
"t": [
"Right atrium",
"Right ventricle"
],
"approx": "Nodus AV & berkas His terletak di septum atrioventrikular (tidak dimodelkan terpisah)."
},
{
"id": "laring",
"name": "Laring (pita suara)",
"latin": "Larynx",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Jalan napas & pembentuk suara (pita suara); epiglotis melindungi saat menelan.",
"k": [
"Suara serak > 3 minggu pada perokok → curiga karsinoma laring",
"Croup & epiglotitis: stridor inspirasi pada anak",
"Paresis N. laringeus rekuren (tumor paru/tiroid) → pita suara diam"
],
"dz": [
"laringitis-akut",
"croup",
"karsinoma-laring",
"benda-asing-saluran-napas"
],
"pf": [
"rinoskopi-posterior-laring",
"distres-napas"
],
"det": "",
"t": [
"g:Larynx"
]
},
{
"id": "trakea",
"name": "Trakea",
"latin": "Trachea",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Saluran udara ±10–12 cm dengan cincin kartilago berbentuk C; bercabang di karina (setinggi angulus sterni).",
"k": [
"Deviasi trakea: terdorong menjauhi (tension pneumotoraks, efusi masif) atau tertarik ke (atelektasis, fibrosis)",
"Lokasi trakeostomi/krikotirotomi darurat"
],
"dz": [
"pneumotoraks",
"atelektasis",
"trakeitis"
],
"pf": [
"palpasi-toraks"
],
"det": "",
"t": [
"Trachea"
]
},
{
"id": "bronkus-ka",
"name": "Bronkus utama kanan",
"latin": "Bronchus principalis dexter",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lebih pendek, lebar, dan vertikal dibanding kiri.",
"k": [
"Benda asing & aspirasi lebih sering ke bronkus kanan (lobus inferior kanan)",
"Wheezing unilateral menetap → curiga obstruksi lokal"
],
"dz": [
"aspirasi",
"benda-asing-saluran-napas"
],
"pf": [
"auskultasi-paru"
],
"det": "",
"t": [
"Right main bronchus"
]
},
{
"id": "bronkus-ki",
"name": "Bronkus utama kiri",
"latin": "Bronchus principalis sinister",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lebih panjang & lebih horizontal, melewati bawah arkus aorta.",
"k": [
"Bronkiektasis & obstruksi tumor dapat terjadi di kedua sisi"
],
"dz": [
"bronkiektasis",
"kanker-paru"
],
"pf": [
"auskultasi-paru"
],
"det": "",
"t": [
"Left main bronchus"
]
},
{
"id": "lobus-sup-ka",
"name": "Lobus superior paru kanan",
"latin": "Lobus superior pulmonis dextri",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lobus atas paru kanan; dipisah fisura horizontal dari lobus medius.",
"k": [
"Lokasi khas TB pasca-primer (apeks — ventilasi tinggi)",
"Tumor Pancoast di apeks → sindrom Horner + nyeri lengan"
],
"dz": [
"tbparu",
"kanker-paru",
"sindrom-horner"
],
"pf": [
"auskultasi-paru",
"perkusi-toraks"
],
"det": "",
"t": [
"Superior lobe of right lung"
]
},
{
"id": "lobus-med-ka",
"name": "Lobus medius paru kanan",
"latin": "Lobus medius pulmonis dextri",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lobus tengah paru kanan (hanya ada di kanan); berbatasan dengan batas kanan jantung.",
"k": [
"Pneumonia lobus medius menghapus batas jantung kanan pada foto toraks (silhouette sign)",
"Sindrom lobus medius: atelektasis berulang"
],
"dz": [
"pneumonia",
"atelektasis"
],
"pf": [
"auskultasi-paru"
],
"det": "",
"t": [
"Middle lobe of right lung"
]
},
{
"id": "lobus-inf-ka",
"name": "Lobus inferior paru kanan",
"latin": "Lobus inferior pulmonis dextri",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lobus bawah paru kanan; terbesar, dipisah fisura oblik.",
"k": [
"Tempat tersering aspirasi pada posisi tegak",
"Efusi pleura & pneumonia basal terdengar di sini"
],
"dz": [
"pneumonia",
"aspirasi",
"efusi-pleura",
"abses-paru"
],
"pf": [
"auskultasi-paru",
"perkusi-toraks"
],
"det": "",
"t": [
"Inferior lobe of right lung"
]
},
{
"id": "lobus-sup-ki",
"name": "Lobus superior paru kiri (termasuk lingula)",
"latin": "Lobus superior pulmonis sinistri",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lobus atas paru kiri termasuk lingula (homolog lobus medius kanan).",
"k": [
"Pneumonia lingula menghapus batas jantung kiri (silhouette sign)",
"TB apeks juga sering di kiri"
],
"dz": [
"pneumonia",
"tbparu"
],
"pf": [
"auskultasi-paru"
],
"det": "",
"t": [
"Superior lobe of left lung"
]
},
{
"id": "lobus-inf-ki",
"name": "Lobus inferior paru kiri",
"latin": "Lobus inferior pulmonis sinistri",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Lobus bawah paru kiri.",
"k": [
"Konsolidasi/efusi kiri bawah dapat menyamarkan batas diafragma kiri",
"Ruang Traube redup pada efusi pleura kiri masif"
],
"dz": [
"pneumonia",
"efusi-pleura"
],
"pf": [
"auskultasi-paru",
"perkusi-toraks"
],
"det": "",
"t": [
"Inferior lobe of left lung"
]
},
{
"id": "pleura",
"name": "Pleura & rongga pleura",
"latin": "Pleura",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Membran dua lapis (viseral & parietal) dengan rongga potensial berisi sedikit cairan pelumas.",
"k": [
"Efusi pleura: perkusi pekak, fremitus & suara napas menurun",
"Pneumotoraks: udara di rongga pleura — hipersonor, suara napas hilang",
"Pleuritis: nyeri tajam saat bernapas, friction rub"
],
"dz": [
"efusi-pleura",
"pneumotoraks",
"empiema",
"hematotoraks"
],
"pf": [
"perkusi-toraks",
"auskultasi-paru",
"palpasi-toraks"
],
"det": "Pleura parietal peka nyeri (N. interkostal & frenikus); pleura viseral tidak.",
"t": [
"Pleura"
]
},
{
"id": "diafragma",
"name": "Diafragma",
"latin": "Diaphragma",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Otot inspirasi utama, memisahkan toraks dan abdomen; dipersarafi N. frenikus (C3–C5).",
"k": [
"\"C3, 4, 5 keeps the diaphragm alive\" — cedera servikal tinggi → gagal napas",
"Iritasi diafragma → nyeri alih ke bahu (Kehr sign pada ruptur limpa)",
"Peranjakan diafragma 3–5 cm pada perkusi"
],
"dz": [
"trauma-medula-spinalis",
"hernia-hiatus"
],
"pf": [
"perkusi-toraks"
],
"det": "",
"t": [
"Diaphragm"
]
},
{
"id": "alveolus",
"name": "Alveolus (unit pertukaran gas)",
"latin": "Alveoli pulmonis",
"topic": "paru",
"topicName": "Paru & saluran napas",
"fn": "Kantong udara (±300–500 juta) tempat pertukaran O₂–CO₂ melalui membran alveolokapiler; surfaktan mencegah kolaps.",
"k": [
"Konsolidasi: alveolus terisi eksudat (pneumonia) — ronki basah, suara bronkial",
"Edema paru: alveolus terisi cairan — ronki basah halus bibasal",
"Defisiensi surfaktan pada bayi prematur → sindrom gawat napas",
"Emfisema: destruksi dinding alveolus"
],
"dz": [
"pneumonia",
"edema-paru",
"ards",
"emfisema-paru",
"gawat-napas"
],
"pf": [
"auskultasi-paru",
"oksimetri"
],
"det": "",
"t": [
"g:Lungs"
],
"approx": "Alveolus berukuran mikroskopis; yang tampil adalah paru secara keseluruhan."
},
{
"id": "esofagus",
"name": "Esofagus",
"latin": "Oesophagus",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Saluran otot ±25 cm yang mendorong makanan ke lambung dengan peristaltik; sfingter esofagus bawah mencegah refluks.",
"k": [
"GERD: heartburn & regurgitasi",
"Akalasia: disfagia padat & cair sejak awal",
"Varises esofagus pada hipertensi portal → hematemesis masif"
],
"dz": [
"gerd",
"akalasia",
"varises-esofagus",
"kanker-esofagus",
"esofagitis-korosif"
],
"pf": [],
"det": "",
"t": [
"Oesophagus"
]
},
{
"id": "usus-halus",
"name": "Usus halus (jejunum & ileum)",
"latin": "Intestinum tenue",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Jejunum & ileum (±6 m): tempat utama pencernaan dan absorpsi nutrien; ileum terminal menyerap B12 & garam empedu.",
"k": [
"Obstruksi usus halus: kolik, muntah, distensi, bising usus metalik",
"Divertikulum Meckel (rule of 2)",
"Malabsorpsi pada penyakit seliak, infeksi kronik"
],
"dz": [
"ileus-obstruksi",
"meckel",
"malabsorpsi",
"intususepsi"
],
"pf": [
"inspeksi-auskultasi-abdomen"
],
"det": "",
"t": [
"Jejunum"
],
"approx": "Model menampilkan jejunum-ileum sebagai satu struktur."
},
{
"id": "kolon-asc",
"name": "Kolon asendens",
"latin": "Colon ascendens",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Menyerap air & elektrolit dari isi usus; naik di sisi kanan.",
"k": [
"Kanker kolon kanan: anemia defisiensi besi tanpa perubahan BAB yang jelas"
],
"dz": [
"kanker-kolorektal",
"ibd"
],
"pf": [
"palpasi-abdomen"
],
"det": "",
"t": [
"Ascending colon"
]
},
{
"id": "kolon-desc",
"name": "Kolon desendens",
"latin": "Colon descendens",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Menyalurkan feses yang makin padat ke kolon sigmoid; sisi kiri.",
"k": [
"Divertikulitis sering di kiri (sigmoid–desendens)",
"Kanker kolon kiri: perubahan pola BAB, feses kecil, obstruksi"
],
"dz": [
"divertikulitis",
"kanker-kolorektal"
],
"pf": [],
"det": "",
"t": [
"Descending colon"
]
},
{
"id": "kolon-trans",
"name": "Kolon transversum",
"latin": "Colon transversum",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Bagian kolon yang paling mobile, menggantung pada mesokolon.",
"k": [
"Megakolon toksik pada kolitis ulseratif berat",
"Hirschsprung: kolon proksimal dari segmen aganglionik melebar"
],
"dz": [
"ibd",
"hirschsprung",
"kolitis"
],
"pf": [],
"det": "",
"t": [
"Transverse colon"
]
},
{
"id": "sekum-apendiks",
"name": "Sekum & apendiks",
"latin": "Caecum et appendix vermiformis",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Sekum: awal kolon di fossa iliaka kanan. Apendiks: tabung buntu kaya jaringan limfoid.",
"k": [
"Apendisitis: nyeri periumbilikal berpindah ke McBurney, Blumberg/Rovsing positif",
"Apendiks retrosekal → psoas sign; pelvik → obturator sign"
],
"dz": [
"apendisitis",
"abses-apendiks"
],
"pf": [
"apendisitis-sign"
],
"det": "",
"t": [
"Vermiform appendix"
],
"approx": "Sekum tidak dimodelkan terpisah; yang tampil adalah apendiks vermiformis."
},
{
"id": "sigmoid",
"name": "Kolon sigmoid",
"latin": "Colon sigmoideum",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Kolon berbentuk S yang menyimpan feses sebelum defekasi.",
"k": [
"Volvulus sigmoid pada lansia: distensi masif",
"Divertikulosis tersering di sigmoid"
],
"dz": [
"divertikulitis",
"ileus-obstruksi",
"kanker-kolorektal"
],
"pf": [],
"det": "",
"t": [
"Sigmoid colon"
]
},
{
"id": "rektum",
"name": "Rektum & anus",
"latin": "Rectum et anus",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Rektum menyimpan feses; kanalis analis dengan sfingter interna (involunter) & eksterna (volunter).",
"k": [
"Hemoroid: pleksus vena; interna tidak nyeri (berdarah segar), eksterna nyeri bila trombosis",
"Fisura ani di garis tengah posterior",
"Colok dubur: massa rektum, darah, tonus sfingter"
],
"dz": [
"hemoroid",
"fisura-ani",
"fistula-ani",
"abses-perianal",
"kanker-kolorektal",
"atresia-ani"
],
"pf": [
"colok-dubur",
"mukosa-perianal"
],
"det": "",
"t": [
"External anal sphincter"
],
"approx": "Rektum tidak dimodelkan; yang tampil adalah sfingter ani eksternus."
},
{
"id": "hati",
"name": "Hati (hepar)",
"latin": "Hepar",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Organ padat terbesar: metabolisme, sintesis protein (albumin, faktor koagulasi), detoksifikasi, produksi empedu, penyimpanan glikogen.",
"k": [
"Hepatomegali nyeri: hepatitis akut, kongesti (gagal jantung kanan), abses hati",
"Sirosis: stigmata (spider naevi, eritema palmar, asites, ikterus)",
"Liver span normal 6–12 cm di LMCD"
],
"dz": [
"hepatitis-a",
"hepatitis-b",
"sirosis",
"abses-hati-amuba",
"nafld",
"tumor-hati"
],
"pf": [
"palpasi-abdomen",
"perkusi-abdomen",
"asites"
],
"det": "",
"t": [
"Liver"
]
},
{
"id": "empedu",
"name": "Kandung empedu",
"latin": "Vesica biliaris",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Menyimpan & memekatkan empedu; berkontraksi setelah makan berlemak (CCK).",
"k": [
"Kolelitiasis: kolik bilier kuadran kanan atas setelah makan berlemak",
"Kolesistitis: Murphy sign positif + demam",
"Kolangitis: trias Charcot (demam, ikterus, nyeri)"
],
"dz": [
"kolelitiasis",
"kolesistitis",
"kolangiokarsinoma"
],
"pf": [
"palpasi-abdomen"
],
"det": "",
"t": [
"Gallbladder"
]
},
{
"id": "lambung",
"name": "Lambung (gaster)",
"latin": "Gaster",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Menyimpan & mencampur makanan, sekresi asam (sel parietal) dan pepsin, faktor intrinsik (absorpsi B12).",
"k": [
"Nyeri epigastrium: dispepsia, ulkus peptikum, gastritis",
"Perforasi ulkus → udara bebas, pekak hati hilang",
"Stenosis pilorik pada bayi: muntah proyektil, massa \"olive\""
],
"dz": [
"dispepsia",
"ulkus-peptikum",
"kanker-lambung",
"stenosis-pilorik",
"perforasi-usus"
],
"pf": [
"palpasi-abdomen",
"perkusi-abdomen"
],
"det": "",
"t": [
"Stomach"
]
},
{
"id": "duodenum",
"name": "Duodenum",
"latin": "Duodenum",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Bagian pertama usus halus (±25 cm, bentuk C) menerima empedu & enzim pankreas melalui papila Vater.",
"k": [
"Ulkus duodenum: nyeri membaik setelah makan, memburuk saat lapar/malam",
"Atresia duodenum: \"double bubble\" (sering pada sindrom Down)"
],
"dz": [
"ulkus-peptikum",
"atresia-usus"
],
"pf": [],
"det": "",
"t": [
"Duodenum"
]
},
{
"id": "pankreas",
"name": "Pankreas",
"latin": "Pancreas",
"topic": "cerna",
"topicName": "Saluran cerna & hepatobilier",
"fn": "Eksokrin: enzim pencernaan (amilase, lipase, tripsin). Endokrin: insulin & glukagon (pulau Langerhans).",
"k": [
"Pankreatitis akut: nyeri epigastrium menjalar ke punggung, lipase ↑ > 3×",
"Kanker kaput pankreas: ikterus obstruktif tanpa nyeri, Courvoisier sign"
],
"dz": [
"pankreatitis",
"kanker-pankreas",
"dm1"
],
"pf": [],
"det": "",
"t": [
"Pancreas"
]
},
{
"id": "aorta-abd",
"name": "Aorta abdominalis & a. renalis",
"latin": "Aorta abdominalis",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Aorta abdominalis memberi a. renalis kanan-kiri setinggi L1–L2 (±20% curah jantung ke ginjal).",
"k": [
"Stenosis a. renalis → hipertensi renovaskular (bruit paraumbilikal)",
"AAA: massa pulsatil ekspansil > 3 cm"
],
"dz": [
"hipertensi-sekunder",
"aneurisma-aorta"
],
"pf": [
"karotis-bruit",
"palpasi-abdomen"
],
"det": "",
"t": [
"Abdominal aorta",
"Right renal artery",
"Left renal artery"
]
},
{
"id": "vka",
"name": "Vena kava inferior & v. renalis",
"latin": "Vena cava inferior",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Vena kava inferior di kanan aorta; v. renalis kiri lebih panjang & melintas di depan aorta.",
"k": [
"V. gonadal kiri bermuara ke v. renalis kiri → varikokel lebih sering di kiri",
"Karsinoma sel ginjal dapat menjalar ke v. renalis & VKI"
],
"dz": [
"varikokel",
"karsinoma-sel-renal"
],
"pf": [],
"det": "",
"t": [
"Inferior vena cava (abdominal part)",
"Right renal vein",
"Left renal vein"
]
},
{
"id": "adrenal",
"name": "Kelenjar adrenal",
"latin": "Glandula suprarenalis",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Korteks: kortisol, aldosteron, androgen. Medula: adrenalin & noradrenalin.",
"k": [
"Cushing: kelebihan kortisol",
"Addison/krisis adrenal: hipotensi, hiponatremia, hiperkalemia",
"Feokromositoma: hipertensi paroksismal + sakit kepala + berdebar"
],
"dz": [
"cushing",
"addison",
"krisis-adrenal"
],
"pf": [],
"det": "",
"t": [
"Suprarenal gland"
]
},
{
"id": "ginjal-ka",
"name": "Ginjal kanan",
"latin": "Ren dexter",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Filtrasi darah (±180 L/hari), regulasi cairan-elektrolit-asam basa, sekresi renin, eritropoietin, aktivasi vitamin D.",
"k": [
"Letak lebih rendah dari ginjal kiri (terdorong hati)",
"Balotemen positif bila membesar (hidronefrosis, polikistik)",
"Nyeri ketok CVA pada pielonefritis"
],
"dz": [
"pielonefritis",
"ckd",
"aki",
"ginjal-polikistik",
"tumor-wilms"
],
"pf": [
"ginjal-kk",
"palpasi-abdomen"
],
"det": "",
"t": [
"Kidney"
],
"side": "r"
},
{
"id": "korteks",
"name": "Korteks ginjal (glomerulus)",
"latin": "Cortex renalis",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Bagian luar ginjal berisi glomerulus, kapsula Bowman, tubulus proksimal & distal.",
"k": [
"Glomerulonefritis: hematuria, edema, hipertensi (sindrom nefritik)",
"Sindrom nefrotik: proteinuria masif, hipoalbuminemia, edema"
],
"dz": [
"gna",
"sindrom-nefrotik",
"gn-kronik"
],
"pf": [
"edema"
],
"det": "",
"t": [
"Kidney"
],
"approx": "Korteks ginjal adalah lapisan luar ginjal (tidak dimodelkan terpisah)."
},
{
"id": "medula",
"name": "Medula ginjal (piramid & tubulus)",
"latin": "Medulla renalis",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Piramid berisi lengkung Henle & duktus koligens; memekatkan urin (mekanisme counter-current).",
"k": [
"Diabetes insipidus nefrogenik: duktus koligens tak responsif ADH",
"Nekrosis papila (OAINS, DM, anemia sel sabit)"
],
"dz": [
"diabetes-insipidus",
"ckd"
],
"pf": [],
"det": "",
"t": [
"Kidney"
],
"approx": "Medula ginjal (piramid) berada di bagian dalam ginjal (tidak dimodelkan terpisah)."
},
{
"id": "pelvis-renalis",
"name": "Pelvis renalis",
"latin": "Pelvis renalis",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Corong pengumpul urin dari kaliks sebelum ke ureter.",
"k": [
"Batu staghorn mengisi pelvis & kaliks",
"Obstruksi UPJ → hidronefrosis"
],
"dz": [
"batu-saluran-kemih",
"pielonefritis"
],
"pf": [],
"det": "",
"t": [
"Renal pelvis"
]
},
{
"id": "ureter",
"name": "Ureter",
"latin": "Ureter",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Saluran otot ±25–30 cm dari pelvis renalis ke kandung kemih; peristaltik.",
"k": [
"3 penyempitan tempat batu tersangkut: UPJ, persilangan a. iliaka, UVJ",
"Kolik renal menjalar dari pinggang ke lipat paha/genital"
],
"dz": [
"batu-saluran-kemih",
"kolik-renal"
],
"pf": [
"ginjal-kk"
],
"det": "",
"t": [
"Ureter"
]
},
{
"id": "kandung-kemih",
"name": "Kandung kemih (vesika urinaria)",
"latin": "Vesica urinaria",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Menampung urin (kapasitas ±400–600 mL) dan mengeluarkannya (otot detrusor, refleks miksi S2–S4).",
"k": [
"Retensi urin: kandung kemih penuh, redup suprapubik (BPH, obat, neurogenik)",
"Sistitis: disuria, frekuensi, nyeri suprapubik"
],
"dz": [
"isk",
"kandung-kemih-neurogenik",
"ruptur-buli",
"karsinoma-urotelial"
],
"pf": [
"ginjal-kk"
],
"det": "",
"t": [
"Urinary bladder"
]
},
{
"id": "uretra",
"name": "Uretra",
"latin": "Urethra",
"topic": "ginjal",
"topicName": "Ginjal & saluran kemih",
"fn": "Mengalirkan urin keluar; pada pria ±20 cm (prostatika, membranosa, spongiosa), wanita ±4 cm.",
"k": [
"Uretra wanita pendek → ISK lebih sering",
"Ruptur uretra posterior pada fraktur pelvis: darah di meatus, prostat melayang — jangan pasang kateter",
"Striktur uretra: pancaran lemah"
],
"dz": [
"ruptur-uretra",
"striktur-uretra",
"uretritis-non-gonore",
"gonore"
],
"pf": [
"colok-dubur",
"genital-pria"
],
"det": "",
"t": [
"Urethra"
]
},
{
"id": "miometrium",
"name": "Uterus — miometrium",
"latin": "Myometrium",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Lapisan otot polos tebal uterus; berkontraksi saat persalinan dan menghentikan perdarahan pascasalin.",
"k": [
"Mioma uteri: tumor jinak miometrium — uterus membesar berbenjol",
"Atonia uteri: penyebab tersering perdarahan postpartum",
"Adenomiosis: endometrium tumbuh di miometrium"
],
"dz": [
"mioma-adenomiosis",
"hpp",
"ruptur-uteri"
],
"pf": [
"bimanual",
"postpartum",
"leopold-djj"
],
"det": "",
"t": []
},
{
"id": "endometrium",
"name": "Endometrium (kavum uteri)",
"latin": "Endometrium",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Lapisan dalam uterus yang menebal tiap siklus (estrogen-progesteron) dan luruh saat menstruasi; tempat implantasi.",
"k": [
"Perdarahan uterus abnormal (PUA)",
"Hiperplasia/kanker endometrium: perdarahan pascamenopause",
"Endometriosis: jaringan endometrium di luar uterus"
],
"dz": [
"pua",
"kanker-endometrium",
"endometriosis",
"infeksi-nifas"
],
"pf": [
"bimanual"
],
"det": "",
"t": []
},
{
"id": "serviks",
"name": "Serviks",
"latin": "Cervix uteri",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Leher rahim yang menonjol ke vagina; zona transformasi (pertemuan epitel skuamosa–kolumnar) rawan displasia.",
"k": [
"Skrining kanker serviks: IVA/Pap smear/tes HPV",
"Servisitis: duh mukopurulen, serviks rapuh",
"Pembukaan serviks menilai kemajuan persalinan"
],
"dz": [
"kanker-serviks",
"servisitis",
"polip-serviks",
"kista-nabothi",
"inkompetensi-serviks"
],
"pf": [
"genital-wanita-spekulum",
"bimanual"
],
"det": "",
"t": []
},
{
"id": "vagina",
"name": "Vagina",
"latin": "Vagina",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Saluran fibromuskular dari vulva ke serviks; pH asam (laktobasilus) melindungi dari infeksi.",
"k": [
"Vaginosis bakterial: pH > 4,5, bau amis, clue cell",
"Kandidiasis: duh putih kental seperti keju",
"Trikomoniasis: duh berbusa kuning-hijau"
],
"dz": [
"vaginosis",
"kandidiasis-vv",
"trikomoniasis",
"vaginitis"
],
"pf": [
"genital-wanita-spekulum"
],
"det": "",
"t": []
},
{
"id": "tuba",
"name": "Tuba falopii",
"latin": "Tuba uterina",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Saluran ±10 cm dari uterus ke ovarium (interstisial, isthmus, ampula, infundibulum); tempat fertilisasi (ampula).",
"k": [
"Kehamilan ektopik tersering di ampula tuba",
"PID dapat menyebabkan sumbatan tuba → infertilitas"
],
"dz": [
"kehamilan-ektopik",
"pid",
"infertilitas"
],
"pf": [
"bimanual",
"kehamilan-muda"
],
"det": "",
"t": []
},
{
"id": "fimbria",
"name": "Fimbria",
"latin": "Fimbriae tubae",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Juluran jari-jari di ujung tuba yang \"menangkap\" oosit saat ovulasi.",
"k": [
"Perlengketan fimbria pasca-infeksi menyebabkan infertilitas"
],
"dz": [
"pid",
"infertilitas"
],
"pf": [],
"det": "",
"t": []
},
{
"id": "ovarium",
"name": "Ovarium",
"latin": "Ovarium",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Menghasilkan oosit dan hormon (estrogen, progesteron, inhibin).",
"k": [
"Kista ovarium; torsi → nyeri hebat mendadak",
"PCOS: oligomenore, hiperandrogen, ovarium polikistik",
"Kanker ovarium sering terdeteksi lanjut (asites, massa)"
],
"dz": [
"kista-ovarium",
"torsi-ruptur-kista",
"pcos",
"kanker-ovarium"
],
"pf": [
"bimanual"
],
"det": "",
"t": []
},
{
"id": "lig-latum",
"name": "Ligamentum ovarii & latum",
"latin": "Lig. ovarii proprium",
"topic": "repro-w",
"topicName": "Reproduksi wanita",
"fn": "Ligamen ovarii proprium & ligamentum latum menyangga uterus, tuba, dan ovarium; dilalui a. uterina dan ureter di bawahnya.",
"k": [
"Ureter berjalan di bawah a. uterina (\"water under the bridge\") — rawan cedera saat histerektomi"
],
"dz": [],
"pf": [],
"det": "",
"t": []
},
{
"id": "vu-p",
"name": "Kandung kemih",
"latin": "Vesica urinaria",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Kandung kemih (konteks anatomi); prostat berada tepat di bawah leher kandung kemih.",
"k": [
"BPH menyebabkan retensi urin & residu"
],
"dz": [
"bph",
"isk"
],
"pf": [
"ginjal-kk"
],
"det": "",
"t": [
"Urinary bladder"
]
},
{
"id": "vesikula",
"name": "Vesikula seminalis",
"latin": "Vesicula seminalis",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Menghasilkan ±60–70% cairan semen (kaya fruktosa).",
"k": [
"Vesikulitis menyertai prostatitis"
],
"dz": [
"prostatitis"
],
"pf": [],
"det": "",
"t": [
"Seminal gland"
]
},
{
"id": "prostat",
"name": "Prostat",
"latin": "Prostata",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Kelenjar sebesar kenari yang mengelilingi uretra prostatika; menghasilkan cairan semen (PSA).",
"k": [
"BPH: zona transisional membesar → LUTS, colok dubur kenyal simetris",
"Kanker prostat: zona perifer, nodul keras pada colok dubur",
"Prostatitis akut: prostat sangat nyeri & hangat"
],
"dz": [
"bph",
"kanker-prostat",
"prostatitis"
],
"pf": [
"colok-dubur"
],
"det": "",
"t": [
"Prostate"
]
},
{
"id": "uretra-p",
"name": "Uretra",
"latin": "Urethra",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Saluran bersama urin & semen (prostatika, membranosa, spongiosa).",
"k": [
"Uretritis gonore: duh purulen",
"Ruptur uretra anterior (straddle injury) vs posterior (fraktur pelvis)"
],
"dz": [
"gonore",
"uretritis-non-gonore",
"ruptur-uretra",
"striktur-uretra"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Urethra"
]
},
{
"id": "penis",
"name": "Penis (korpus kavernosum & spongiosum)",
"latin": "Penis",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Organ kopulasi & saluran urin; dua korpus kavernosum dan satu korpus spongiosum.",
"k": [
"Disfungsi ereksi: penanda awal penyakit kardiovaskular",
"Priapismus > 4 jam: kegawatan",
"Hipospadia: meatus di ventral"
],
"dz": [
"disfungsi-ereksi",
"priapismus",
"hipospadia",
"mikropenis"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Corpus cavernosum of penis",
"Corpus spongiosum of penis"
]
},
{
"id": "glans",
"name": "Glans penis",
"latin": "Glans penis",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Ujung penis yang dilapisi preputium.",
"k": [
"Fimosis & parafimosis (kegawatan: preputium terjepit di belakang glans)",
"Ulkus genital: sifilis (tidak nyeri), herpes/chancroid (nyeri)"
],
"dz": [
"fimosis",
"parafimosis",
"sifilis",
"herpes-genital",
"chancroid"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Glans penis"
]
},
{
"id": "skrotum",
"name": "Skrotum",
"latin": "Scrotum",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Kantong kulit-otot (dartos, kremaster) yang menjaga suhu testis ±2 °C di bawah suhu tubuh.",
"k": [
"Massa skrotum: transiluminasi (+) = hidrokel",
"Pembengkakan akut nyeri: torsio vs epididimitis"
],
"dz": [
"hidrokel",
"torsio-testis",
"epididimitis",
"hernia-inguinal"
],
"pf": [
"genital-pria",
"hernia"
],
"det": "",
"t": []
},
{
"id": "testis",
"name": "Testis",
"latin": "Testis",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Menghasilkan sperma (tubulus seminiferus) dan testosteron (sel Leydig).",
"k": [
"Torsio testis: nyeri mendadak, testis tinggi melintang, refleks kremaster hilang — operasi < 6 jam",
"Kriptorkismus: rujuk sebelum 1 tahun (risiko infertilitas & keganasan)",
"Massa keras tak nyeri → curiga tumor testis"
],
"dz": [
"torsio-testis",
"kriptorkismus",
"tumor-testis",
"orkitis"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Testis"
]
},
{
"id": "epididimis",
"name": "Epididimis",
"latin": "Epididymis",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Saluran berkelok di posterior testis tempat sperma matang & disimpan.",
"k": [
"Epididimitis: nyeri berkurang bila testis diangkat (Prehn sign +)",
"Spermatokel: kista epididimis"
],
"dz": [
"epididimitis",
"spermatokel"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Epididymis"
]
},
{
"id": "vas",
"name": "Vas deferens",
"latin": "Ductus deferens",
"topic": "repro-p",
"topicName": "Reproduksi pria",
"fn": "Saluran ±45 cm yang membawa sperma dari epididimis melalui kanalis inguinalis ke duktus ejakulatorius.",
"k": [
"Vasektomi memotong vas deferens",
"Diraba di funikulus spermatikus (bersama pleksus pampiniformis)"
],
"dz": [
"varikokel",
"infertilitas"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Ductus deferens"
]
},
{
"id": "hipotalamus",
"name": "Hipotalamus",
"latin": "Hypothalamus",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Pusat integrasi saraf–endokrin: hormon pelepas (TRH, CRH, GnRH, GHRH), ADH & oksitosin; mengatur suhu, lapar, haus, ritme sirkadian.",
"k": [
"Lesi: diabetes insipidus sentral, gangguan suhu, obesitas hipotalamik"
],
"dz": [
"diabetes-insipidus",
"hipogonadisme"
],
"pf": [],
"det": "",
"t": [
"Hypothalamus"
]
},
{
"id": "hipofisis",
"name": "Hipofisis (pituitari)",
"latin": "Hypophysis",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Anterior: GH, TSH, ACTH, FSH, LH, prolaktin. Posterior: menyimpan ADH & oksitosin.",
"k": [
"Prolaktinoma: galaktorea, amenore",
"Makroadenoma menekan kiasma → hemianopia bitemporal",
"Sindrom Sheehan: nekrosis hipofisis pasca-perdarahan postpartum"
],
"dz": [
"hiperprolaktinemia",
"akromegali",
"defisiensi-gh",
"cushing"
],
"pf": [
"lapang-pandang"
],
"det": "",
"t": [
"Adenohypophysis",
"Neurohypophysis"
]
},
{
"id": "pineal",
"name": "Kelenjar pineal",
"latin": "Glandula pinealis",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Menghasilkan melatonin yang mengatur siklus tidur-bangun.",
"k": [
"Kalsifikasi pineal sering terlihat pada CT dewasa (normal)"
],
"dz": [
"insomnia"
],
"pf": [],
"det": "",
"t": [
"Pineal gland"
]
},
{
"id": "tiroid",
"name": "Kelenjar tiroid",
"latin": "Glandula thyroidea",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Menghasilkan T4 & T3 (metabolisme) dan kalsitonin.",
"k": [
"Hipertiroid (Graves): berdebar, BB turun, tremor, eksoftalmus",
"Hipotiroid: lelah, dingin, BB naik, kulit kering",
"Nodul tiroid keras terfiksir → curiga keganasan"
],
"dz": [
"hipertiroid",
"hipotiroid",
"goiter",
"nodul-tiroid",
"kanker-tiroid",
"tiroiditis"
],
"pf": [
"leher-tiroid"
],
"det": "",
"t": [
"Thyroid gland"
]
},
{
"id": "paratiroid",
"name": "Kelenjar paratiroid",
"latin": "Glandulae parathyroideae",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Empat kelenjar kecil di belakang tiroid yang menghasilkan PTH (menaikkan kalsium darah).",
"k": [
"Hipoparatiroid pascatiroidektomi → hipokalsemia (Chvostek, Trousseau)",
"Hiperparatiroid: \"stones, bones, groans, moans\""
],
"dz": [
"hipoparatiroid",
"hiperparatiroid"
],
"pf": [
"chvostek"
],
"det": "",
"t": [
"Superior parathyroid gland",
"Inferior parathyroid gland"
]
},
{
"id": "timus",
"name": "Timus",
"latin": "Thymus",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Tempat pematangan limfosit T; besar pada anak dan mengecil setelah pubertas.",
"k": [
"Timoma berkaitan dengan miastenia gravis",
"Aplasia timus pada sindrom DiGeorge"
],
"dz": [
"timoma",
"miastenia-gravis",
"imunodefisiensi"
],
"pf": [],
"det": "",
"t": [
"Left lobe of thymus",
"Right lobe of thymus"
]
},
{
"id": "adrenal-e",
"name": "Kelenjar adrenal",
"latin": "Glandulae suprarenales",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Korteks (zona glomerulosa–fasikulata–retikularis: aldosteron, kortisol, androgen) dan medula (katekolamin).",
"k": [
"Cushing: obesitas sentral, striae ungu, moon face",
"Krisis adrenal setelah steroid jangka panjang dihentikan mendadak"
],
"dz": [
"cushing",
"addison",
"krisis-adrenal"
],
"pf": [],
"det": "",
"t": [
"Suprarenal gland"
]
},
{
"id": "pankreas-e",
"name": "Pankreas endokrin (pulau Langerhans)",
"latin": "Insulae pancreaticae",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Pulau Langerhans: sel β (insulin), α (glukagon), δ (somatostatin).",
"k": [
"DM tipe 1: destruksi autoimun sel β",
"DM tipe 2: resistensi insulin + penurunan fungsi sel β",
"Insulinoma: hipoglikemia berulang"
],
"dz": [
"dm1",
"dm2",
"hipoglikemia",
"kad"
],
"pf": [],
"det": "",
"t": [
"Pancreas"
]
},
{
"id": "gonad-ov",
"name": "Ovarium (wanita)",
"latin": "Ovarium",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Ovarium menghasilkan estrogen & progesteron (siklus menstruasi, karakteristik seksual sekunder).",
"k": [
"Menopause: penurunan estrogen → hot flushes, osteoporosis",
"PCOS: gangguan ovulasi & hiperandrogen"
],
"dz": [
"menopause",
"pcos",
"pubertas-prekoks",
"pubertas-terlambat"
],
"pf": [],
"det": "",
"t": []
},
{
"id": "gonad-te",
"name": "Testis (pria)",
"latin": "Testis",
"topic": "endokrin",
"topicName": "Sistem endokrin",
"fn": "Testis menghasilkan testosteron (sel Leydig).",
"k": [
"Hipogonadisme: libido turun, ginekomastia",
"Sindrom Klinefelter (47,XXY): testis kecil & keras"
],
"dz": [
"hipogonadisme",
"ginekomastia",
"pubertas-terlambat"
],
"pf": [
"genital-pria"
],
"det": "",
"t": [
"Testis"
]
},
{
"id": "sklera",
"name": "Sklera",
"latin": "Sclera",
"topic": "mata",
"topicName": "Mata",
"fn": "Lapisan luar bola mata yang kuat (putih), menjaga bentuk mata.",
"k": [
"Sklera ikterik: tanda awal hiperbilirubinemia",
"Skleritis: nyeri dalam, merah keunguan (sering terkait autoimun)",
"Sklera biru pada osteogenesis imperfekta"
],
"dz": [
"skleritis",
"episkleritis",
"osteogenesis-imperfekta"
],
"pf": [
"adneksa-mata"
],
"det": "",
"t": [
"Sclera"
]
},
{
"id": "koroid",
"name": "Koroid",
"latin": "Choroidea",
"topic": "mata",
"topicName": "Mata",
"fn": "Lapisan kaya pembuluh darah yang memberi nutrisi retina luar.",
"k": [
"Uveitis posterior/koroiditis (toksoplasmosis, TB)",
"Melanoma koroid: keganasan intraokular primer tersering pada dewasa"
],
"dz": [
"uveitis-posterior",
"toksoplasmosis"
],
"pf": [
"funduskopi"
],
"det": "",
"t": [
"Sclera"
],
"approx": "Koroid berada tepat di dalam sklera (tidak dimodelkan terpisah)."
},
{
"id": "retina",
"name": "Retina",
"latin": "Retina",
"topic": "mata",
"topicName": "Mata",
"fn": "Lapisan saraf berisi fotoreseptor (batang & kerucut) yang mengubah cahaya menjadi sinyal saraf.",
"k": [
"Ablasio retina: floaters, kilatan cahaya, tirai gelap — kegawatan",
"Retinopati diabetik & hipertensi terlihat pada funduskopi",
"Retinoblastoma: leukokoria pada anak"
],
"dz": [
"ablasio-retina",
"retinopati-diabetik",
"retinopati-hipertensi",
"oklusi-retina",
"retinoblastoma",
"rop"
],
"pf": [
"funduskopi",
"visus"
],
"det": "",
"t": [
"Retina"
]
},
{
"id": "vitreus",
"name": "Badan kaca (vitreus)",
"latin": "Corpus vitreum",
"topic": "mata",
"topicName": "Mata",
"fn": "Gel jernih yang mengisi ±80% volume bola mata.",
"k": [
"Perdarahan vitreus: penurunan visus mendadak tanpa nyeri (retinopati diabetik proliferatif)",
"Endoftalmitis: infeksi pascabedah/trauma"
],
"dz": [
"perdarahan-vitreus",
"endoftalmitis"
],
"pf": [
"funduskopi"
],
"det": "",
"t": [
"Vitreous body"
]
},
{
"id": "makula",
"name": "Makula & fovea",
"latin": "Macula lutea",
"topic": "mata",
"topicName": "Mata",
"fn": "Area retina sentral untuk penglihatan tajam & warna; fovea paling banyak sel kerucut.",
"k": [
"Degenerasi makula terkait usia (AMD): metamorfopsia pada Amsler grid",
"Cherry red spot pada oklusi a. sentralis retina"
],
"dz": [
"amd",
"macular-hole",
"oklusi-retina"
],
"pf": [
"lapang-pandang",
"funduskopi"
],
"det": "",
"t": [
"Retina"
],
"approx": "Makula & fovea adalah bagian retina di kutub posterior bola mata."
},
{
"id": "diskus",
"name": "Diskus optikus (bintik buta)",
"latin": "Discus nervi optici",
"topic": "mata",
"topicName": "Mata",
"fn": "Tempat keluarnya N. optikus dan pembuluh retina; tidak ada fotoreseptor (bintik buta).",
"k": [
"Papiledema: batas diskus kabur akibat peningkatan TIK",
"C/D ratio > 0,6 → curiga glaukoma",
"Atrofi papil: diskus pucat"
],
"dz": [
"papiledema",
"glaukoma-kronik",
"atrofi-papil",
"neuritis-optik"
],
"pf": [
"funduskopi"
],
"det": "",
"t": [
"Optic nerve (II)"
],
"approx": "Diskus optikus adalah tempat nervus optikus keluar dari bola mata."
},
{
"id": "n-optikus",
"name": "Nervus optikus",
"latin": "N. opticus",
"topic": "mata",
"topicName": "Mata",
"fn": "N. II membawa sinyal visual ke kiasma optikum dan korteks oksipital.",
"k": [
"Neuritis optik: nyeri saat menggerakkan mata, penurunan visus, RAPD (+)",
"Toksisitas etambutol → gangguan penglihatan warna"
],
"dz": [
"neuritis-optik",
"neuropati-optik"
],
"pf": [
"pupil",
"ishihara"
],
"det": "",
"t": [
"Optic nerve (II)"
]
},
{
"id": "lensa",
"name": "Lensa",
"latin": "Lens",
"topic": "mata",
"topicName": "Mata",
"fn": "Lensa bikonveks jernih yang memfokuskan cahaya; akomodasi diatur otot siliaris.",
"k": [
"Katarak: kekeruhan lensa (senilis, kongenital, diabetes, steroid)",
"Presbiopia: elastisitas lensa menurun ≥ 40 tahun",
"Dislokasi lensa pada sindrom Marfan"
],
"dz": [
"katarak-senilis",
"katarak-kongenital",
"presbiopia",
"dislokasi-lensa"
],
"pf": [
"segmen-anterior",
"visus"
],
"det": "",
"t": [
"Lens"
]
},
{
"id": "siliaris",
"name": "Korpus siliaris & zonula",
"latin": "Corpus ciliare",
"topic": "mata",
"topicName": "Mata",
"fn": "Menghasilkan akuos humor dan mengatur akomodasi lensa melalui zonula Zinn.",
"k": [
"Injeksi silier (merah melingkar di limbus) pada uveitis anterior, keratitis, glaukoma akut",
"Sikloplegik melumpuhkan otot siliaris (pemeriksaan refraksi anak)"
],
"dz": [
"uveitis-anterior",
"glaukoma-akut"
],
"pf": [
"adneksa-mata"
],
"det": "",
"t": [
"Zonular fibres"
],
"approx": "Yang tampil adalah serat zonula; korpus siliaris tidak dimodelkan terpisah."
},
{
"id": "iris",
"name": "Iris",
"latin": "Iris",
"topic": "mata",
"topicName": "Mata",
"fn": "Diafragma berpigmen yang mengatur ukuran pupil (sfingter: parasimpatis; dilator: simpatis).",
"k": [
"Iritis/uveitis anterior: mata merah, nyeri, fotofobia, pupil kecil",
"Sinekia posterior → pupil tidak bulat"
],
"dz": [
"uveitis-anterior",
"anisokoria",
"iridodialisis"
],
"pf": [
"pupil",
"segmen-anterior"
],
"det": "",
"t": [
"Iris"
]
},
{
"id": "pupil",
"name": "Pupil",
"latin": "Pupilla",
"topic": "mata",
"topicName": "Mata",
"fn": "Lubang di tengah iris tempat cahaya masuk; refleks cahaya melalui N. II (aferen) dan N. III (eferen).",
"k": [
"Pupil dilatasi + penurunan kesadaran → herniasi unkus",
"RAPD menandakan lesi N. optikus",
"Pin-point: opioid/organofosfat"
],
"dz": [
"anisokoria",
"sindrom-horner",
"intoksikasi-zat-akut"
],
"pf": [
"pupil"
],
"det": "",
"t": [
"Iris"
],
"approx": "Pupil adalah lubang di tengah iris."
},
{
"id": "bmd",
"name": "Bilik mata depan (akuos humor)",
"latin": "Camera anterior bulbi",
"topic": "mata",
"topicName": "Mata",
"fn": "Ruang antara kornea dan iris berisi akuos humor; akuos dibuang melalui trabekular meshwork di sudut BMD.",
"k": [
"Sudut tertutup → glaukoma akut: nyeri hebat, mata merah, visus turun, mual",
"Hifema (darah) & hipopion (pus) di BMD"
],
"dz": [
"glaukoma-akut",
"hifema",
"hipopion"
],
"pf": [
"segmen-anterior",
"tio"
],
"det": "",
"t": [
"Anterior chamber of eyeball"
]
},
{
"id": "kornea",
"name": "Kornea",
"latin": "Cornea",
"topic": "mata",
"topicName": "Mata",
"fn": "Jendela transparan avaskular di depan mata; pembias cahaya terbesar (±43 D). Sangat peka nyeri (N. V1).",
"k": [
"Abrasi & ulkus kornea: tes fluoresein",
"Keratitis herpes: pola dendritik — jangan beri steroid",
"Refleks kornea menilai N. V & N. VII"
],
"dz": [
"keratitis",
"ulkus-kornea",
"abrasi-kornea",
"benda-asing-kornea",
"trauma-kimia-mata"
],
"pf": [
"segmen-anterior",
"n5-trigeminus"
],
"det": "",
"t": [
"Cornea"
]
},
{
"id": "konjungtiva",
"name": "Konjungtiva",
"latin": "Tunica conjunctiva",
"topic": "mata",
"topicName": "Mata",
"fn": "Membran mukosa tipis yang melapisi kelopak (palpebra) dan sklera (bulbi).",
"k": [
"Konjungtivitis: mata merah dengan sekret (bakteri, virus, alergi)",
"Konjungtiva anemis pada anemia",
"Pterigium tumbuh dari konjungtiva ke kornea"
],
"dz": [
"konjungtivitis",
"perdarahan-subkonjungtiva",
"pterigium",
"pinguekula",
"oftalmia-neonatorum"
],
"pf": [
"adneksa-mata"
],
"det": "",
"t": [
"g:Eyeball"
],
"approx": "Konjungtiva melapisi bola mata bagian depan & kelopak (tidak dimodelkan terpisah)."
},
{
"id": "kavum-timpani",
"name": "Kavum timpani (telinga tengah)",
"latin": "Cavitas tympani",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Ruang telinga tengah berisi udara dan osikel; berhubungan dengan nasofaring (tuba) dan mastoid.",
"k": [
"Efusi telinga tengah (OME) pada anak: tuli konduktif",
"Kolesteatoma dapat menyebar ke struktur sekitar"
],
"dz": [
"oma",
"ome",
"omsk"
],
"pf": [
"otoskopi",
"garpu-tala"
],
"det": "",
"t": [
"Tympanic membrane",
"Malleus",
"Incus",
"Stapes"
],
"approx": "Kavum timpani berisi tulang-tulang pendengaran."
},
{
"id": "aurikula",
"name": "Aurikula (daun telinga)",
"latin": "Auricula",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Mengumpulkan & mengarahkan gelombang suara; tulang rawan elastis.",
"k": [
"Hematoma aurikula (cauliflower ear) bila tak didrainase",
"Nyeri tarik aurikula pada otitis eksterna",
"Fistel preaurikular kongenital"
],
"dz": [
"otitis-eksterna"
],
"pf": [
"otoskopi"
],
"det": "",
"t": [
"g:Auricular region"
]
},
{
"id": "mae",
"name": "Meatus akustikus eksternus",
"latin": "Meatus acusticus externus",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Liang telinga ±2,5 cm berbentuk S; sepertiga luar kartilago berisi kelenjar serumen.",
"k": [
"Serumen prop: tuli konduktif",
"Otitis eksterna & otomikosis",
"Benda asing pada anak"
],
"dz": [
"serumen",
"otitis-eksterna",
"benda-asing-telinga",
"furunkel"
],
"pf": [
"otoskopi"
],
"det": "Tarik aurikula ke atas-belakang (dewasa) atau bawah-belakang (anak) untuk meluruskan liang.",
"t": [
"Tympanic membrane"
],
"approx": "Meatus akustikus eksternus berakhir di membran timpani."
},
{
"id": "mt",
"name": "Membran timpani",
"latin": "Membrana tympanica",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Membran tipis yang bergetar oleh suara dan meneruskannya ke osikel; normal putih mutiara dengan refleks cahaya.",
"k": [
"OMA: membran hiperemis, bulging",
"Perforasi sentral (OMSK aman) vs atik/marginal (OMSK bahaya, kolesteatoma)",
"Barotrauma: perdarahan/retraksi MT"
],
"dz": [
"oma",
"omsk",
"perforasi-mt",
"ome",
"barotrauma-telinga"
],
"pf": [
"otoskopi"
],
"det": "",
"t": [
"Tympanic membrane"
]
},
{
"id": "maleus",
"name": "Maleus",
"latin": "Malleus",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Osikel pertama yang melekat pada membran timpani (manubrium terlihat saat otoskopi).",
"k": [
"Manubrium & prosesus brevis menjadi patokan saat menilai MT"
],
"dz": [
"oma"
],
"pf": [
"otoskopi"
],
"det": "",
"t": [
"Malleus"
]
},
{
"id": "inkus",
"name": "Inkus",
"latin": "Incus",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Osikel tengah yang menghubungkan maleus dan stapes.",
"k": [
"Erosi inkus oleh kolesteatoma → tuli konduktif"
],
"dz": [
"omsk"
],
"pf": [
"garpu-tala"
],
"det": "",
"t": [
"Incus"
]
},
{
"id": "stapes",
"name": "Stapes",
"latin": "Stapes",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Osikel terkecil di tubuh; footplate menempel di tingkap oval dan memindahkan getaran ke perilimfe.",
"k": [
"Otosklerosis: fiksasi stapes → tuli konduktif progresif (Rinne negatif)"
],
"dz": [
"otosklerosis"
],
"pf": [
"garpu-tala"
],
"det": "",
"t": [
"Stapes"
]
},
{
"id": "tuba-e",
"name": "Tuba Eustachius",
"latin": "Tuba auditiva",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Menyamakan tekanan telinga tengah dengan udara luar; pada anak lebih pendek, lebar & horizontal.",
"k": [
"Disfungsi tuba → OMA/OME (lebih sering pada anak & setelah ISPA)",
"Barotrauma saat menyelam/penerbangan"
],
"dz": [
"oma",
"ome",
"barotrauma-telinga",
"hipertrofi-adenoid"
],
"pf": [
"otoskopi"
],
"det": "",
"t": [
"Auditory tube"
]
},
{
"id": "vestibulum",
"name": "Vestibulum (utrikulus & sakulus)",
"latin": "Vestibulum",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Utrikulus & sakulus (makula) mendeteksi percepatan linear & posisi kepala terhadap gravitasi.",
"k": [
"Otokonia lepas dari utrikulus → BPPV"
],
"dz": [
"bppv",
"meniere"
],
"pf": [
"keseimbangan-gait"
],
"det": "",
"t": [
"Vestibule"
]
},
{
"id": "kanalis",
"name": "Kanalis semisirkularis",
"latin": "Canales semicirculares",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Tiga saluran setengah lingkaran mendeteksi percepatan rotasi kepala.",
"k": [
"BPPV kanalis posterior: Dix-Hallpike positif",
"Neuritis vestibularis: vertigo akut menetap, head impulse test abnormal"
],
"dz": [
"bppv",
"neuritis-vestibularis",
"meniere"
],
"pf": [
"keseimbangan-gait",
"gerak-bola-mata"
],
"det": "",
"t": [
"Vestibule"
],
"approx": "Kanalis semisirkularis bermuara ke vestibulum (tidak dimodelkan terpisah)."
},
{
"id": "koklea",
"name": "Koklea",
"latin": "Cochlea",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Organ pendengaran (organ Corti) berbentuk rumah siput 2¾ putaran; frekuensi tinggi di basal.",
"k": [
"Presbikusis & NIHL: tuli sensorineural frekuensi tinggi",
"Ototoksik (aminoglikosida)",
"Tuli mendadak: kegawatan THT"
],
"dz": [
"presbiakusis",
"nihl",
"tuli-mendadak",
"tuli-kongenital",
"meniere"
],
"pf": [
"garpu-tala",
"dengar-anak"
],
"det": "",
"t": [
"Cochlea"
]
},
{
"id": "n-viii",
"name": "N. vestibulokoklearis (N. VIII)",
"latin": "N. vestibulocochlearis",
"topic": "telinga",
"topicName": "Telinga",
"fn": "N. vestibulokoklearis membawa sinyal pendengaran & keseimbangan ke batang otak.",
"k": [
"Neuroma akustik (schwannoma vestibular): tuli sensorineural unilateral + tinitus",
"Lesi → Weber lateralisasi ke telinga sehat"
],
"dz": [
"tumor-otak",
"neuritis-vestibularis"
],
"pf": [
"garpu-tala"
],
"det": "",
"t": [
"Vestibulocochlear nerve (VIII)"
]
},
{
"id": "mastoid",
"name": "Prosesus mastoideus (sel udara)",
"latin": "Processus mastoideus",
"topic": "telinga",
"topicName": "Telinga",
"fn": "Tonjolan tulang temporal di belakang telinga berisi sel udara yang berhubungan dengan telinga tengah.",
"k": [
"Mastoiditis: bengkak nyeri di belakang telinga, aurikula terdorong ke depan",
"Battle sign (memar mastoid) pada fraktur basis kranii",
"Tangkai garpu tala ditempel di mastoid (uji Rinne)"
],
"dz": [
"mastoiditis",
"fraktur-basis-kranii"
],
"pf": [
"otoskopi",
"garpu-tala"
],
"det": "",
"t": [
"Temporal bone"
],
"approx": "Prosesus mastoideus adalah bagian os temporale."
}
];

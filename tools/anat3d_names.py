"""Nama Indonesia untuk struktur & grup utama atlas 3D (Z-Anatomy). Struktur lain memakai nama Latin TA2
yang disingkat (M./A./V./N./Lig.), sesuai kebiasaan buku anatomi di Indonesia.
Jalankan: python3 anat3d_names.py -w  → src/anat3d-names.ts"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "tools", "data")
BASES = set(json.load(open(os.path.join(DATA, "bases.json"))))
GROUPS = {l.split("\t")[0][:-2] for l in open(os.path.join(DATA, "groups.txt"))}

D = {
 # ===== tulang
 "Parietal bone": "Tulang parietal (os parietale)", "Frontal bone": "Tulang frontal (os frontale)", "Occipital bone": "Tulang oksipital (os occipitale)",
 "Sphenoid bone": "Tulang sfenoid (os sphenoidale)", "Temporal bone": "Tulang temporal (os temporale)", "Ethmoid bone": "Tulang etmoid (os ethmoidale)",
 "Sinus of frontal bone": "Sinus frontalis", "Sinus of sphenoid bone": "Sinus sfenoidalis", "Inferior nasal concha bone": "Konka nasalis inferior",
 "Lacrimal bone": "Tulang lakrimal", "Nasal bone": "Tulang hidung (os nasale)", "Maxilla": "Maksila (rahang atas)", "Palatine bone": "Tulang palatum",
 "Zygomatic bone": "Tulang zigomatikum (pipi)", "Mandible": "Mandibula (rahang bawah)", "Hyoid bone": "Tulang hioid", "Vomer": "Vomer",
 "Malleus": "Maleus (tulang martil)", "Incus": "Inkus (tulang landasan)", "Stapes": "Stapes (tulang sanggurdi)",
 "Posterior cells of ethmoid bone": "Sel etmoid posterior", "Middle cells of ethmoid bone": "Sel etmoid tengah", "Anterior cells of ethmoid bone": "Sel etmoid anterior",
 "Major alar cartilage": "Kartilago alar mayor", "Nasal septal cartilage": "Kartilago septum nasi", "Lateral process of nasal septal cartilage": "Prosesus lateral kartilago septum nasi",
 "Thyroid cartilage": "Kartilago tiroid (jakun)", "Cricoid cartilage": "Kartilago krikoid", "Arytenoid cartilage": "Kartilago aritenoid", "Corniculate cartilage": "Kartilago kornikulata",
 "Atlas (C1)": "Atlas (vertebra C1)", "Axis (C2)": "Aksis (vertebra C2)", "Sacrum": "Sakrum", "Coccyx": "Koksigis (tulang ekor)",
 "Manubrium of sternum": "Manubrium sterni", "Body of sternum": "Korpus sterni", "Xiphoid process": "Prosesus xifoideus",
 "Clavicle": "Klavikula (tulang selangka)", "Scapula": "Skapula (tulang belikat)", "Humerus": "Humerus (tulang lengan atas)",
 "Radius": "Radius (tulang pengumpil)", "Ulna": "Ulna (tulang hasta)", "Hip bone": "Os koksae (tulang panggul)", "Femur": "Femur (tulang paha)",
 "Patella": "Patela (tempurung lutut)", "Tibia": "Tibia (tulang kering)", "Fibula": "Fibula (tulang betis)",
 "Talus": "Talus", "Calcaneus": "Kalkaneus (tulang tumit)", "Navicular bone": "Os naviculare", "Cuboid bone": "Os cuboideum",
 "Medial cuneiform bone": "Os cuneiforme mediale", "Intermediate cuneiform bone": "Os cuneiforme intermedium", "Lateral cuneiform bone": "Os cuneiforme laterale",
 "Sesamoid bones of foot": "Tulang sesamoid kaki", "Scaphoid bone": "Os skafoid", "Lunate bone": "Os lunatum", "Triquetrum bone": "Os triquetrum",
 "Pisiform bone": "Os pisiforme", "Trapezium bone": "Os trapezium", "Trapezoid bone": "Os trapezoideum", "Capitate bone": "Os kapitatum", "Hamate bone": "Os hamatum",
 # ===== organ dalam
 "Uvula of palate": "Uvula", "Gingiva": "Gusi (gingiva)", "Parotid gland": "Kelenjar parotis", "(Accessory parotid gland)": "Kelenjar parotis aksesorius",
 "Parotid duct": "Duktus parotis (Stensen)", "Sublingual gland": "Kelenjar sublingual", "Submandibular gland": "Kelenjar submandibula",
 "Submandibular duct": "Duktus submandibularis (Wharton)", "Tongue": "Lidah", "Oesophagus": "Esofagus (kerongkongan)", "Stomach": "Lambung (gaster)",
 "Mucosa of stomach": "Mukosa lambung", "Duodenum": "Duodenum (usus dua belas jari)", "Jejunum": "Jejunum–ileum (usus halus)",
 "Vermiform appendix": "Apendiks vermiformis (usus buntu)", "Meso-appendix": "Mesoapendiks", "Free taenia": "Tenia libera", "Mesocolic taenia": "Tenia mesokolika",
 "Omental taenia": "Tenia omentalis", "Ascending colon": "Kolon asendens", "Transverse colon": "Kolon transversum", "Descending colon": "Kolon desendens",
 "Sigmoid colon": "Kolon sigmoid", "Liver": "Hati (hepar)", "Gallbladder": "Kandung empedu", "Bile duct": "Duktus koledokus",
 "Pancreas": "Pankreas", "Pancreatic duct": "Duktus pankreatikus (Wirsung)", "Accessory pancreatic duct": "Duktus pankreatikus aksesorius (Santorini)",
 "Left posterior lateral segment of liver (II)": "Segmen II hati", "Left anterior lateral segment of liver (III)": "Segmen III hati",
 "Left medial segment of liver (IV)": "Segmen IV hati", "Anterior medial segment of liver (V)": "Segmen V hati", "Anterior lateral segment of liver (VI)": "Segmen VI hati",
 "Posterior lateral segment of liver (VII)": "Segmen VII hati", "Posterior segment of liver (I)": "Segmen I hati (lobus kaudatus)", "Posterior medial segment of liver (VIII)": "Segmen VIII hati",
 "Epiglottis": "Epiglotis", "Trachea": "Trakea", "Right main bronchus": "Bronkus utama kanan", "Left main bronchus": "Bronkus utama kiri",
 "Right superior lobar bronchus": "Bronkus lobus superior kanan", "Middle lobar bronchus": "Bronkus lobus medius", "Right inferior lobar bronchus": "Bronkus lobus inferior kanan",
 "Left superior lobar bronchus": "Bronkus lobus superior kiri", "Left inferior lobar bronchus": "Bronkus lobus inferior kiri", "Intermediate bronchus": "Bronkus intermedius",
 "Superior lobe of right lung": "Lobus superior paru kanan", "Middle lobe of right lung": "Lobus medius paru kanan", "Inferior lobe of right lung": "Lobus inferior paru kanan",
 "Superior lobe of left lung": "Lobus superior paru kiri", "Inferior lobe of left lung": "Lobus inferior paru kiri", "Pleura": "Pleura",
 "Kidney": "Ginjal (ren)", "Renal pelvis": "Pelvis renalis", "Ureter": "Ureter", "Urinary bladder": "Kandung kemih (vesika urinaria)", "Urethra": "Uretra",
 "Testis": "Testis", "Epididymis": "Epididimis", "Ductus deferens": "Duktus deferens (vas deferens)", "Seminal gland": "Vesikula seminalis",
 "Prostate": "Prostat", "Ejaculatory duct": "Duktus ejakulatorius", "Glans penis": "Glans penis", "Corpus cavernosum of penis": "Korpus kavernosum penis",
 "Corpus spongiosum of penis": "Korpus spongiosum penis", "Mesocolon": "Mesokolon", "Greater omentum": "Omentum mayus", "Lesser omentum": "Omentum minus",
 "Adenohypophysis": "Adenohipofisis (hipofisis anterior)", "Neurohypophysis": "Neurohipofisis (hipofisis posterior)", "Thyroid gland": "Kelenjar tiroid",
 "Superior parathyroid gland": "Kelenjar paratiroid superior", "Inferior parathyroid gland": "Kelenjar paratiroid inferior", "Suprarenal gland": "Kelenjar adrenal (suprarenal)",
 "Pineal gland": "Kelenjar pineal", "Nasopharynx": "Nasofaring", "Oropharynx": "Orofaring", "Laryngopharynx": "Laringofaring",
 "Mucosa of nasal cavity": "Mukosa rongga hidung", "Soft palate": "Palatum molle (langit-langit lunak)",
 "Left lobe of thymus": "Lobus kiri timus", "Right lobe of thymus": "Lobus kanan timus", "Spleen": "Limpa (lien)",
 "Palatine tonsil": "Tonsil palatina (amandel)",
 # ===== jantung & pembuluh
 "Right atrium": "Atrium kanan", "Left atrium": "Atrium kiri", "Right ventricle": "Ventrikel kanan", "Left ventricle": "Ventrikel kiri",
 "Aortic arch": "Arkus aorta", "Ascending aorta": "Aorta asendens", "Thoracic aorta": "Aorta torakalis", "Abdominal aorta": "Aorta abdominalis",
 "Pulmonary trunk": "Trunkus pulmonalis", "Bifurcation of pulmonary trunk": "Bifurkasio trunkus pulmonalis", "Superior vena cava": "Vena kava superior",
 "Inferior vena cava (thoracic part)": "Vena kava inferior (bagian torakal)", "Inferior vena cava (abdominal part)": "Vena kava inferior (bagian abdominal)",
 "Right superior pulmonary vein": "Vena pulmonalis superior kanan", "Right inferior pulmonary vein": "Vena pulmonalis inferior kanan",
 "Left superior pulmonary vein": "Vena pulmonalis superior kiri", "Left inferior pulmonary vein": "Vena pulmonalis inferior kiri",
 "Right coronary artery": "Arteri koroner kanan (RCA)", "Circumflex artery of heart": "Arteri sirkumfleksa (LCx)", "Left coronary artery": "Arteri koroner kiri (LMCA)",
 "Anterior interventricular artery": "Arteri desendens anterior kiri (LAD)", "Coronary sinus": "Sinus koronarius",
 "Coeliac trunk": "Trunkus seliakus", "Superior mesenteric artery": "Arteri mesenterika superior", "Inferior mesenteric artery": "Arteri mesenterika inferior",
 "Right renal artery": "Arteri renalis kanan", "Left renal artery": "Arteri renalis kiri", "Right renal vein": "Vena renalis kanan", "Left renal vein": "Vena renalis kiri",
 "Hepatic portal vein": "Vena porta hepatis", "Azygos vein": "Vena azigos", "Brachiocephalic trunk": "Trunkus brakiosefalika",
 "Right brachiocephalic vein": "Vena brakiosefalika kanan", "Left brachiocephalic vein": "Vena brakiosefalika kiri",
 "Right common carotid artery": "Arteri karotis komunis kanan", "Left common carotid artery": "Arteri karotis komunis kiri", "Internal carotid artery": "Arteri karotis interna", "External carotid artery": "Arteri karotis eksterna",
 "Internal jugular vein": "Vena jugularis interna", "External jugular vein": "Vena jugularis eksterna", "Right subclavian artery": "Arteri subklavia kanan", "Left subclavian artery": "Arteri subklavia kiri", "Right subclavian vein": "Vena subklavia kanan", "Left subclavian vein": "Vena subklavia kiri",
 "Vertebral artery": "Arteri vertebralis", "Basilar artery": "Arteri basilaris", "Axillary artery": "Arteri aksilaris", "Brachial artery": "Arteri brakialis",
 "Radial artery": "Arteri radialis", "Ulnar artery": "Arteri ulnaris", "Common iliac artery": "Arteri iliaka komunis", "External iliac artery": "Arteri iliaka eksterna",
 "Internal iliac artery": "Arteri iliaka interna", "Femoral artery": "Arteri femoralis", "Popliteal artery": "Arteri poplitea", "Dorsalis pedis artery": "Arteri dorsalis pedis",
 "Anterior tibial artery": "Arteri tibialis anterior", "Posterior tibial artery": "Arteri tibialis posterior", "Great saphenous vein": "Vena safena magna",
 "Small saphenous vein": "Vena safena parva", "Femoral vein": "Vena femoralis", "Common iliac vein": "Vena iliaka komunis", "Cephalic vein": "Vena sefalika",
 "Basilic vein": "Vena basilika", "Median cubital vein": "Vena mediana kubiti", "Hepatic veins": "Vena hepatika", "Aortic bifurcation": "Bifurkasio aorta",
 # ===== saraf & indra
 "Precentral gyrus": "Girus presentralis (korteks motorik)", "Postcentral gyrus": "Girus postsentralis (korteks sensorik)", "Pons": "Pons", "Midbrain": "Mesensefalon (otak tengah)",
 "Medulla oblongata": "Medula oblongata", "Hypothalamus": "Hipotalamus", "Thalamus": "Talamus", "Corpus callosum": "Korpus kalosum", "Hippocampus": "Hipokampus",
 "Amygdaloid body": "Amigdala", "Caudate nucleus": "Nukleus kaudatus", "Lentiform nucleus": "Nukleus lentiformis", "Lateral ventricle": "Ventrikel lateral",
 "Third ventricle": "Ventrikel III", "Fourth ventricle": "Ventrikel IV", "Spinal cord": "Medula spinalis", "Insula (Subcentral gyrus and ant. and post. sulci*)": "Insula",
 "Temporal pole": "Polus temporalis", "Occipital pole": "Polus oksipitalis", "Calcarine sulcus": "Sulkus kalkarina (korteks visual)", "Cuneus": "Kuneus",
 "Lingual gyrus": "Girus lingualis", "Angular gyrus": "Girus angularis", "Supramarginal gyrus": "Girus supramarginalis", "Precuneus": "Prekuneus",
 "Opercular part of inferior frontal gyrus": "Pars operkularis (area Broca)", "Triangular part of inferior frontal gyrus": "Pars triangularis (area Broca)",
 "Superior temporal gyrus (Lateral part)": "Girus temporalis superior (area Wernicke)", "Temporal plane": "Planum temporale",
 "Optic nerve (II)": "Nervus optikus (N. II)", "Optic chiasm": "Kiasma optikum", "Optic tract": "Traktus optikus", "Olfactory nerve (I)": "Nervus olfaktorius (N. I)",
 "Oculomotor nerve (III)": "Nervus okulomotorius (N. III)", "Trochlear nerve (IV)": "Nervus troklearis (N. IV)", "Trigeminal nerve (V)": "Nervus trigeminus (N. V)",
 "Abducens nerve (VI)": "Nervus abdusens (N. VI)", "Facial nerve (VII)": "Nervus fasialis (N. VII)", "Vestibulocochlear nerve (VIII)": "Nervus vestibulokoklearis (N. VIII)",
 "Glossopharyngeal nerve (IX)": "Nervus glosofaringeus (N. IX)", "Vagus nerve (X)": "Nervus vagus (N. X)", "Accessory nerve (XI)": "Nervus aksesorius (N. XI)",
 "Hypoglossal nerve (XII)": "Nervus hipoglosus (N. XII)", "Median nerve": "Nervus medianus", "Ulnar nerve": "Nervus ulnaris", "Radial nerve": "Nervus radialis",
 "Musculocutaneous nerve": "Nervus muskulokutaneus", "Axillary nerve": "Nervus aksilaris", "Sciatic nerve": "Nervus iskiadikus", "Femoral nerve": "Nervus femoralis",
 "Common fibular nerve": "Nervus peroneus komunis", "Tibial nerve": "Nervus tibialis", "Saphenous nerve": "Nervus safenus",
 "Obturator nerve": "Nervus obturatorius", "Intercostal nerves": "Nervus interkostalis", "Sympathetic trunk": "Trunkus simpatikus",
 "Eyeball": "Bola mata", "Sclera": "Sklera", "Cornea": "Kornea", "Iris": "Iris", "Lens": "Lensa", "Retina": "Retina", "Vitreous body": "Badan kaca (korpus vitreum)",
 "Zonular fibres": "Serat zonula (Zinn)", "Anterior chamber of eyeball": "Bilik mata depan",
 "Lacrimal gland": "Kelenjar lakrimal", "Tympanic membrane": "Membran timpani", "Cochlea": "Koklea", "Vestibule": "Vestibulum", "Auditory tube": "Tuba Eustachius",
 "Vestibular nerve": "Nervus vestibularis", "Cochlear nerve": "Nervus koklearis",
 # ===== otot (nama umum)
 "Diaphragm": "Diafragma", "Temporalis muscle": "M. temporalis", "Sternocleidomastoid muscle": "M. sternokleidomastoideus", "Rectus abdominis muscle": "M. rektus abdominis",
 "External abdominal oblique muscle": "M. obliqus eksternus abdominis", "Latissimus dorsi muscle": "M. latissimus dorsi", "Gluteus maximus muscle": "M. gluteus maksimus",
 "Sartorius muscle": "M. sartorius", "Rectus femoris muscle": "M. rektus femoris", "Vastus lateralis muscle": "M. vastus lateralis", "Vastus medialis muscle": "M. vastus medialis",
 "Vastus intermedius muscle": "M. vastus intermedius", "Tibialis anterior muscle": "M. tibialis anterior", "Soleus muscle": "M. soleus",
 "Medial head of gastrocnemius": "M. gastroknemius (kaput mediale)", "Lateral head of gastrocnemius": "M. gastroknemius (kaput laterale)", "Calcaneal tendon": "Tendon Achilles",
 "Long head of biceps brachii": "M. biseps brakii (kaput longum)", "Short head of biceps brachii": "M. biseps brakii (kaput breve)",
 "Long head of triceps brachii": "M. triseps brakii (kaput longum)", "Lateral head of triceps brachii": "M. triseps brakii (kaput laterale)", "Medial head of triceps brachii": "M. triseps brakii (kaput mediale)",
 "Acromial part of deltoid muscle": "M. deltoideus (pars akromialis)", "Clavicular part of deltoid muscle": "M. deltoideus (pars klavikularis)", "Scapular spinal part of deltoid muscle": "M. deltoideus (pars spinalis)",
 "Clavicular head of pectoralis major muscle": "M. pektoralis mayor (kaput klavikulare)", "Sternocostal head of pectoralis major muscle": "M. pektoralis mayor (kaput sternokostale)",
 "Superficial part of masseter": "M. masseter (pars superfisialis)", "Deep part of masseter": "M. masseter (pars profunda)",
 # ===== kulit & regio
 "Hairs of head": "Rambut kepala", "Eyebrow": "Alis",
}
G = {
 "Skeletal system": "Sistem rangka", "Muscular system": "Sistem otot", "Joints": "Sendi", "Arterial system": "Sistem arteri", "Venous system": "Sistem vena",
 "Lymphoid organs": "Organ limfoid", "Nervous system & Sense organs": "Sistem saraf & indra", "Visceral systems": "Sistem visera", "Regions of human body": "Regio tubuh",
 "Fasciae": "Fasia", "Axial skeleton": "Rangka aksial", "Appendicular skeleton": "Rangka apendikular", "Cranium": "Tengkorak (kranium)", "Neurocranium": "Neurokranium",
 "Viscerocranium": "Viserokranium (tulang wajah)", "Bones of cranium": "Tulang kranium", "Facial bones": "Tulang wajah", "Auditory ossicles": "Tulang pendengaran",
 "Teeth": "Gigi", "Anterior teeth": "Gigi depan", "Posterior teeth": "Gigi belakang", "Vertebral column": "Kolumna vertebralis", "Bones of vertebral column": "Tulang belakang",
 "Cervical vertebrae": "Vertebra servikal", "Thoracic vertebrae": "Vertebra torakal", "Lumbar vertebrae": "Vertebra lumbal", "Thoracic skeleton": "Rangka toraks",
 "Bones of thorax": "Tulang toraks", "Ribs": "Iga (kosta)", "Costal cartilages": "Kartilago kosta", "Sternum": "Sternum (tulang dada)", "Bones of upper limb": "Tulang ekstremitas atas",
 "Bones of lower limb": "Tulang ekstremitas bawah", "Bones of pectoral girdle": "Tulang gelang bahu", "Pectoral girdle": "Gelang bahu", "Bones of pelvic girdle": "Tulang gelang panggul",
 "Pelvic girdle": "Gelang panggul", "Bony pelvis": "Pelvis tulang", "Bones of free part of upper limb": "Tulang lengan & tangan", "Bones of free part of lower limb": "Tulang tungkai & kaki",
 "Bones of hand": "Tulang tangan", "Carpal bones": "Tulang karpal", "Metacarpal bones": "Tulang metakarpal", "Phalanges of hand": "Falang tangan",
 "Bones of foot": "Tulang kaki", "Tarsal bones": "Tulang tarsal", "Metatarsal bones": "Tulang metatarsal", "Phalanges of foot": "Falang kaki",
 "Paranasal sinuses": "Sinus paranasal", "Nasal cartilages": "Kartilago hidung", "Laryngeal cartilages": "Kartilago laring",
 "Muscles": "Otot", "Muscles of head": "Otot kepala", "Muscles of neck": "Otot leher", "Muscles of thorax": "Otot toraks", "Muscles of abdomen": "Otot abdomen",
 "Muscles of upper limb": "Otot ekstremitas atas", "Muscles of lower limb": "Otot ekstremitas bawah", "Muscles of pelvis": "Otot panggul", "Muscles of hand": "Otot tangan",
 "Muscles of foot": "Otot kaki", "Masticatory muscles": "Otot pengunyah", "Extra-ocular muscles": "Otot ekstraokular", "Suprahyoid muscles": "Otot suprahioid",
 "Infrahyoid muscles": "Otot infrahioid", "Erector spinae": "M. erektor spina", "Deltoid muscle": "M. deltoideus", "Pectoralis major muscle": "M. pektoralis mayor",
 "Biceps brachii muscle": "M. biseps brakii", "Triceps brachii muscle": "M. triseps brakii", "Trapezius muscle": "M. trapezius", "Iliopsoas muscle": "M. iliopsoas",
 "Anterior compartment of arm": "Kompartemen anterior lengan atas", "Posterior compartment of arm": "Kompartemen posterior lengan atas",
 "Anterior compartment of forearm": "Kompartemen anterior lengan bawah", "Posterior compartment of forearm": "Kompartemen posterior lengan bawah",
 "Anterior compartment of thigh": "Kompartemen anterior paha", "Medial compartment of thigh": "Kompartemen medial paha", "Posterior compartment of thigh": "Kompartemen posterior paha",
 "Anterior compartment of leg": "Kompartemen anterior tungkai bawah", "Lateral compartment of leg": "Kompartemen lateral tungkai bawah", "Posterior compartment of leg": "Kompartemen posterior tungkai bawah",
 "Pelvic diaphragm": "Diafragma pelvis",
 "Heart": "Jantung", "Arteries of heart": "Arteri koroner", "Cardiac veins": "Vena jantung", "Valvular complex of heart": "Katup jantung",
 "Right atrioventricular valve": "Katup trikuspid", "Left atrioventricular valve": "Katup mitral", "Aortic valve": "Katup aorta", "Pulmonary valve": "Katup pulmonal",
 "Aorta": "Aorta", "Systemic arteries": "Arteri sistemik", "Systemic veins": "Vena sistemik", "Pulmonary arteries": "Arteri pulmonalis", "Pulmonary veins": "Vena pulmonalis",
 "Cerebral arterial circle": "Sirkulus Willisi", "Dural venous sinuses": "Sinus vena dura", "Hepatic portal vein": "Sistem vena porta",
 "Central nervous system": "Sistem saraf pusat", "Peripheral nervous system": "Sistem saraf tepi", "Brain": "Otak", "Cerebrum": "Serebrum", "Cerebellum": "Serebelum",
 "Brainstem": "Batang otak", "Frontal lobe": "Lobus frontalis", "Parietal lobe": "Lobus parietalis", "Occipital lobe": "Lobus oksipitalis", "Temporal lobe": "Lobus temporalis",
 "Limbic lobe": "Lobus limbik", "Spinal cord": "Medula spinalis", "Cranial nerves": "Saraf kranial", "Spinal nerves": "Saraf spinal", "Brachial plexus": "Pleksus brakialis",
 "Lumbosacral plexus": "Pleksus lumbosakral", "Cervical plexus": "Pleksus servikalis", "Meninges": "Meninges (selaput otak)", "Autonomic division of peripheral nervous system": "Sistem saraf otonom",
 "Sense organs": "Organ indra", "Eye": "Mata", "Eyeball": "Bola mata", "Accessory visual structures": "Struktur aksesori mata", "Ear": "Telinga",
 "External ear": "Telinga luar", "Middle ear": "Telinga tengah", "Internal ear": "Telinga dalam", "Nose": "Hidung",
 "Digestive system": "Sistem pencernaan", "Digestive canal": "Saluran cerna", "Mouth": "Mulut", "Salivary glands": "Kelenjar ludah", "Pharynx": "Faring",
 "Small intestine": "Usus halus", "Large intestine": "Usus besar", "Colon": "Kolon", "Liver": "Hati", "Extrahepatic bile ducts": "Saluran empedu ekstrahepatik",
 "Respiratory system": "Sistem pernapasan", "Larynx": "Laring", "Tracheobronchial tree": "Pohon trakeobronkial", "Bronchi": "Bronkus", "Lungs": "Paru", "Right lung": "Paru kanan", "Left lung": "Paru kiri",
 "Urinary system": "Sistem kemih", "Genital systems": "Sistem genital", "Male genital system": "Sistem genital pria", "Male internal genitalia": "Genitalia interna pria",
 "Male external genitalia": "Genitalia eksterna pria", "Endocrine glands": "Kelenjar endokrin", "Hypophysis": "Hipofisis", "Parathyroid glands": "Kelenjar paratiroid",
 "Thymus": "Timus", "Peritoneum": "Peritoneum", "Thoracic cavity": "Rongga toraks", "Abdominopelvic cavity": "Rongga abdominopelvis", "Pelvic cavity": "Rongga panggul",
 "Lymph nodes": "Kelenjar getah bening", "Primary lymphoid organs": "Organ limfoid primer", "Secondary lymphoid organs": "Organ limfoid sekunder",
 "Lymph nodes of head": "KGB kepala", "Lymph nodes of neck": "KGB leher", "Lymph nodes of upper limb": "KGB ekstremitas atas", "Lymph nodes of lower limb": "KGB ekstremitas bawah",
 "Thoracic lymph nodes": "KGB toraks", "Abdominal lymph nodes": "KGB abdomen", "Pelvic lymph nodes": "KGB panggul", "Pharyngeal lymphoid ring": "Cincin Waldeyer",
 "Regions of head": "Regio kepala", "Regions of face": "Regio wajah", "Regions of neck": "Regio leher", "Regions of thorax": "Regio toraks", "Regions of abdomen": "Regio abdomen",
 "Regions of back": "Regio punggung", "Regions of upper limb": "Regio ekstremitas atas", "Regions of lower limb": "Regio ekstremitas bawah", "Regions of perineum": "Regio perineum",
 "Regions of hand": "Regio tangan", "Regions of foot": "Regio kaki", "Auricular region": "Daun telinga (aurikula)", "Hairs": "Rambut",
 "Synovial joint": "Sendi sinovial", "Fibrous joints": "Sendi fibrosa", "Cartilaginous joints": "Sendi kartilaginosa", "Joints of skull": "Sendi tengkorak",
 "Joints of vertebral column": "Sendi kolumna vertebralis", "Joints of upper limb": "Sendi ekstremitas atas", "Joints of lower limb": "Sendi ekstremitas bawah",
 "Thoracic joints": "Sendi toraks", "Temporomandibular joint": "Sendi temporomandibular", "Synovial bursae": "Bursa sinovial", "Tendon sheaths": "Selubung tendon",
}
ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"]
FING = {"hand": ["ibu jari", "telunjuk", "jari tengah", "jari manis", "kelingking"], "foot": ["ibu jari kaki", "jari kaki II", "jari kaki III", "jari kaki IV", "kelingking kaki"]}
PH = {"Distal": "distal", "Middle": "media", "Proximal": "proksimal"}
TEETH = {"medial incisor": "Gigi seri tengah", "lateral incisor": "Gigi seri samping", "canine": "Gigi taring", "first premolar": "Gigi premolar pertama",
         "second premolar": "Gigi premolar kedua", "first molar tooth": "Gigi geraham pertama", "second molar tooth": "Gigi geraham kedua", "third molar tooth": "Gigi geraham ketiga"}
def rule(n):
    m = re.match(r"Vertebra ([CTL])(\d+)$", n)
    if m: return {"C": "Vertebra servikal", "T": "Vertebra torakal", "L": "Vertebra lumbal"}[m.group(1)] + f" {m.group(1)}{m.group(2)}"
    m = re.match(r"(\w+) rib$", n)
    if m and m.group(1).lower() in ORD: return f"Iga ke-{ORD.index(m.group(1).lower()) + 1} (kosta {ORD.index(m.group(1).lower()) + 1})"
    m = re.match(r"Costal cartilage of (\w+) rib$", n)
    if m and m.group(1) in ORD: return f"Kartilago kosta ke-{ORD.index(m.group(1)) + 1}"
    m = re.match(r"(\w+) (metacarpal|metatarsal) bone$", n)
    if m and m.group(1).lower() in ORD: return f"{'Metakarpal' if m.group(2) == 'metacarpal' else 'Metatarsal'} {ORD.index(m.group(1).lower()) + 1}"
    m = re.match(r"(Distal|Middle|Proximal) phalanx of (\w+) finger of (hand|foot)$", n)
    if m and m.group(2) in ORD: return f"Falang {PH[m.group(1)]} {FING[m.group(3)][ORD.index(m.group(2))]}"
    m = re.match(r"(Upper|Lower) (.+)$", n)
    if m and m.group(2) in TEETH: return f"{TEETH[m.group(2)]} {'atas' if m.group(1) == 'Upper' else 'bawah'}"
    m = re.match(r"Intervertebral disc (\S+)$", n)
    if m: return f"Diskus intervertebralis {m.group(1)}"
    m = re.match(r"Nucleus pulposus (\S+)$", n)
    if m: return f"Nukleus pulposus {m.group(1)}"
    return None

out = {}
for b in sorted(BASES):
    v = D.get(b) or rule(b)
    if v: out[b] = v
for g in sorted(GROUPS):
    if g in G: out[g] = G[g]
    elif g in D: out[g] = D[g]
unused = [k for k in list(D) + list(G) if k not in BASES and k not in GROUPS]
print(len(out), "nama Indonesia;", "tidak terpakai (nama tidak ada di model):", len(unused))
if "-v" in sys.argv: print(unused)
if "-w" in sys.argv:
    open(os.path.join(ROOT, "src", "anat3d-names.ts"), "w").write(
        "// Dibuat oleh tools/anat3d_names.py — jangan disunting manual.\n/** Nama Indonesia untuk struktur & grup utama (kunci = nama Inggris Z-Anatomy). */\nexport const NAME_ID: Record<string, string> = "
        + json.dumps(out, ensure_ascii=False, indent=0) + ";\n")
    print("ditulis src/anat3d-names.ts")

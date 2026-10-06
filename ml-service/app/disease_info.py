"""Disease knowledge base. Keys follow PlantVillage naming: <Crop>___<Condition>.

Guidance here is general educational information, not a substitute for advice
from a local agricultural extension officer (e.g. a Krishi Vigyan Kendra).
"""
import re
from typing import Dict, List, TypedDict


class DiseaseEntry(TypedDict):
    crop: str
    disease: str
    healthy: bool
    symptoms: str
    treatment: List[str]
    prevention: List[str]


def _d(crop: str, disease: str, symptoms: str, treatment: List[str], prevention: List[str]) -> DiseaseEntry:
    return {"crop": crop, "disease": disease, "healthy": False,
            "symptoms": symptoms, "treatment": treatment, "prevention": prevention}


def _healthy(crop: str) -> DiseaseEntry:
    return {
        "crop": crop, "disease": "Healthy", "healthy": True,
        "symptoms": "No visible lesions, spots, mould or discolouration. Leaf colour and texture look normal.",
        "treatment": ["No treatment needed.", "Keep monitoring leaves weekly, especially after rain."],
        "prevention": ["Water at the base, not on leaves.", "Keep rows spaced for airflow.",
                       "Remove fallen debris and weeds regularly."],
    }


DISEASES: Dict[str, DiseaseEntry] = {
    "Tomato___Early_blight": _d("Tomato", "Early Blight",
        "Dark brown spots with concentric rings (a target pattern) on older leaves, often with a yellow halo. Leaves yellow and drop from the bottom up.",
        ["Remove and destroy badly affected lower leaves.", "Spray a protectant fungicide such as chlorothalonil or mancozeb, following the label.", "Avoid overhead watering while the disease is active."],
        ["Rotate away from tomato, potato and brinjal for 2-3 seasons.", "Mulch to stop soil splashing onto leaves.", "Stake plants and prune for airflow."]),
    "Tomato___Late_blight": _d("Tomato", "Late Blight",
        "Large, water-soaked grey-green patches that turn brown, often with white fuzzy growth underneath in humid weather. Spreads very fast in cool, wet conditions.",
        ["Remove and bag infected plants; do not compost them.", "Apply a fungicide labelled for late blight (e.g. copper-based or metalaxyl + mancozeb) at the recommended interval.", "Contact your extension officer quickly: this disease can destroy a field within days."],
        ["Plant certified disease-free seedlings.", "Avoid dense planting and overhead irrigation.", "Do not grow tomato next to infected potato crops."]),
    "Tomato___Leaf_Mold": _d("Tomato", "Leaf Mold",
        "Pale green or yellow spots on the upper leaf surface with olive-green to grey velvety mould underneath. Common in humid greenhouses.",
        ["Improve ventilation and lower humidity.", "Remove infected leaves.", "Use a fungicide labelled for leaf mold if the spread continues."],
        ["Keep humidity below about 85%.", "Space plants widely.", "Choose resistant varieties where available."]),
    "Tomato___Bacterial_spot": _d("Tomato", "Bacterial Spot",
        "Small, dark, slightly raised greasy spots on leaves, sometimes with a yellow border. Spots may merge and the leaf tears or drops.",
        ["Remove severely infected plants.", "Spray copper-based bactericide early; it slows spread but does not cure.", "Do not work among wet plants."],
        ["Use clean seed and transplants.", "Rotate crops for at least a year.", "Disinfect tools and avoid overhead irrigation."]),
    "Tomato___healthy": _healthy("Tomato"),
    "Potato___Early_blight": _d("Potato", "Early Blight",
        "Dark brown, angular spots with concentric rings on older leaves; leaves yellow around the spots and die early.",
        ["Remove heavily infected foliage.", "Apply a protectant fungicide (mancozeb or chlorothalonil) per label.", "Keep plants well fed and watered; stressed plants are more susceptible."],
        ["Rotate with non-solanaceous crops.", "Use certified seed tubers.", "Destroy crop residue after harvest."]),
    "Potato___Late_blight": _d("Potato", "Late Blight",
        "Water-soaked dark patches on leaves and stems, white mould on the underside in damp weather, and a foul smell as tissue collapses. Tubers can rot.",
        ["Remove and destroy infected plants immediately.", "Use fungicides labelled for late blight on a protective schedule.", "Delay harvest until vines are fully dead to protect tubers."],
        ["Plant certified seed and resistant varieties.", "Hill soil well over tubers.", "Destroy volunteer plants and cull piles."]),
    "Potato___healthy": _healthy("Potato"),
    "Apple___Apple_scab": _d("Apple", "Apple Scab",
        "Olive-green to brown velvety spots on leaves that turn dark and scabby; leaves may curl and drop early. Fruit gets corky spots.",
        ["Rake and destroy fallen leaves.", "Apply a fungicide (e.g. captan or myclobutanil) from bud break, per label.", "Prune to open the canopy."],
        ["Plant scab-resistant varieties.", "Clear leaf litter every autumn.", "Avoid overhead irrigation."]),
    "Apple___Black_rot": _d("Apple", "Black Rot",
        "Purple-edged brown 'frogeye' leaf spots, rotting fruit with black rings, and cankers on branches.",
        ["Prune out cankers and dead wood and burn it.", "Remove mummified fruit.", "Apply fungicide in the growing season following local advice."],
        ["Keep trees vigorous with balanced nutrition.", "Disinfect pruning tools.", "Remove dead wood each year."]),
    "Apple___healthy": _healthy("Apple"),
    "Corn___Northern_Leaf_Blight": _d("Corn", "Northern Leaf Blight",
        "Long, cigar-shaped grey-green to tan lesions, 2.5-15 cm, that start on lower leaves and spread upward.",
        ["Scout fields early; if lesions reach the ear leaf before silking, consider a labelled fungicide.", "Do not spray late in the season without advice."],
        ["Grow resistant hybrids.", "Rotate crops and bury or remove residue.", "Avoid very dense planting."]),
    "Corn___Common_rust": _d("Corn", "Common Rust",
        "Small, round to oval, powdery brick-red to brown pustules scattered on both leaf surfaces.",
        ["Usually mild; fungicide is rarely needed.", "If pustules cover much of the upper leaves early, ask your extension officer about a labelled fungicide."],
        ["Plant resistant hybrids.", "Sow early to avoid peak rust weather.", "Rotate crops."]),
    "Corn___healthy": _healthy("Corn"),
    "Grape___Black_rot": _d("Grape", "Black Rot",
        "Small brown circular leaf spots with a dark border, then black dots in the centre. Berries shrivel into hard black mummies.",
        ["Remove mummified berries and infected leaves.", "Apply a labelled fungicide (e.g. mancozeb) from early shoot growth through fruit set."],
        ["Prune for airflow and sunlight.", "Clean up fallen fruit and leaves.", "Train vines so foliage dries quickly."]),
    "Grape___healthy": _healthy("Grape"),
    "Pepper___Bacterial_spot": _d("Pepper", "Bacterial Spot",
        "Small water-soaked spots turning brown with yellow halos; severe cases cause leaf drop and rough scabby spots on fruit.",
        ["Remove infected plants.", "Spray copper-based products early to slow spread.", "Avoid handling wet plants."],
        ["Use disease-free seed.", "Rotate with non-host crops for 2-3 years.", "Drip irrigate rather than sprinkle."]),
    "Pepper___healthy": _healthy("Pepper"),
}

_CROP_ALIASES = {"corn_(maize)": "Corn", "pepper,_bell": "Pepper", "pepper,_bell_": "Pepper"}


def normalize_class_name(raw: str) -> str:
    """Map training class names (e.g. 'Corn_(maize)___Common_rust_') to knowledge-base keys."""
    crop, _, condition = raw.partition("___")
    crop = _CROP_ALIASES.get(crop.lower(), crop)
    condition = condition.strip("_")
    return f"{crop}___{condition}"


def lookup(raw_class_name: str) -> DiseaseEntry:
    """Return knowledge-base info, or a safe generic entry for classes not yet documented."""
    key = normalize_class_name(raw_class_name)
    if key in DISEASES:
        return DISEASES[key]
    crop, _, condition = key.partition("___")
    healthy = condition.lower() == "healthy"
    if healthy:
        return _healthy(crop.replace("_", " "))
    name = re.sub(r"\s+", " ", condition.replace("_", " ")).strip().title()
    return _d(crop.replace("_", " "), name,
              "Detailed symptoms for this condition are not in the knowledge base yet.",
              ["Consult a local agricultural extension officer to confirm the diagnosis before treating."],
              ["Practise crop rotation, field sanitation and water at the base of plants."])

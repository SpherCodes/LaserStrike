import cv2
import easyocr
import re
import numpy as np
import base64

class Model:
    def __init__(self, targets: set):
        self.target_words = targets
        self.target_patterns = [re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE) for word in targets]
        self.ocr_reader = easyocr.Reader(['en'], gpu=True)

    # Proccesses image and returns the id of the player tagged
    def process_image(self,base64_image: str) -> str | None:
        image = self._base64_to_image(base64_image)
        if image is None:
            return None

        matched_words = self._detect_id(image) # Check for ID's
    
        if matched_words:
            print(f"✅ Found words: {matched_words[0]['word']}")
            return str(matched_words[0]['word']) #The largest ID found
        else:
            print("❌ No target words found.")
            return None

    # Detects player Id's in an image
    def _detect_id(self,image):
        # Convert to grayscale and resize to 720p for faster OCR
        scaled = self._resize(image)
        gray = cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY)

        # Optimised parameters
        results = self.ocr_reader.readtext(gray,
                                     batch_size=1,
                                     decoder='beamsearch',
                                     width_ths=0.5,  # Merge close boxes
                                     text_threshold=0.5,  # Higher confidence threshold
                                     link_threshold=0.4,
                                     min_size=50) # Filters small text

        matched_entries = []
        for bbox, text, confidence in results:
            clean_text = text.strip().upper()

            # Filter out low confidence guesses
            if confidence < 0.7:
                continue

            # Search for target words/ID's
            for word, pattern in zip(self.target_words, self.target_patterns):
                if pattern.search(clean_text):

                    # Calculate bounding box area (width * height)
                    x_coords = [point[0] for point in bbox]
                    y_coords = [point[1] for point in bbox]
                    width = max(x_coords) - min(x_coords)
                    height = max(y_coords) - min(y_coords)
                    area = width * height

                    matched_entries.append({
                        'word': word,
                        'area': area,
                        'confidence': confidence
                    })
                    break

            # Sort by area (descending)
            if matched_entries:
                matched_entries.sort(key=lambda x: x['area'], reverse=True)

        return matched_entries

    # Scales to 720p without changing aspect ratio to avoid warping
    @staticmethod
    def _resize(image, target_width=1280, target_height=720):
        h, w = image.shape[:2]
        scale = min(target_width / w, target_height / h)

        new_w = int(w * scale)
        new_h = int(h * scale)

        interpolation = cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR
        resized_img = cv2.resize(image, (new_w, new_h), interpolation=interpolation)

        return resized_img

    # converts base64 string to image
    @staticmethod
    def _base64_to_image(base64_str: str) -> cv2.typing.MatLike:
        img_bytes = base64.b64decode(base64_str)
        img_np = np.frombuffer(img_bytes, dtype=np.uint8)
        img_cv2 = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        return img_cv2
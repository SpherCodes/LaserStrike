import cv2
from cv2 import aruco
import re
import numpy as np
import base64

class Model:
     # We will have to construct this with the real world size of the markers if we want distance to work
    def __init__(self, marker_size_cm=18.7):
        self.marker_size_cm = marker_size_cm
        self.dictionary = aruco.getPredefinedDictionary(aruco.DICT_ARUCO_ORIGINAL)
    
    # Returns a dictionary with ID and distance so that if we want to do anything with it we can
    def process_image(self, base64_img: str) -> str | None:
        image = self._base64_to_image(base64_img)
        detected_markers = self._detect_markers(image)
        closest = self._get_closest(detected_markers, image)
        return closest[0], closest[1]

    def _detect_markers(self, image):
        detected_markers = {}
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        corners, ids, rejected = cv2.aruco.detectMarkers(gray, self.dictionary)
        if ids is not None:
            for i in range(len(ids)):
                M = cv2.moments(corners[i][0])
                if M["m00"] != 0:
                    cX = int(M["m10"] / M["m00"])
                    cY = int(M["m01"] / M["m00"])
                    marker_info = {
                        'ID': ids[i],
                        'Centroid': (cX, cY),
                        'Corners': corners[i][0]
                    }
                    detected_markers[ids[i][0]] = marker_info
        return detected_markers

    # Only works if marker_size_cm is accurate
    def _calculate_distance(self, marker_size_pixels, cap_width):
        return self.marker_size_cm * cap_width / marker_size_pixels
    
    def _get_closest(self, detected_markers, image):
        if not detected_markers:
            return None
        markers = []
        for marker_id, marker_info in detected_markers.items():
            marker_size_pixels = np.mean([np.linalg.norm(marker_info['Corners'][j] - marker_info['Corners'][(j + 1) % 4]) for j in range(4)])
            distance_to_marker_cm = self._calculate_distance(marker_size_pixels, image.shape[1])
            markers.append((int(marker_id), float(distance_to_marker_cm)))
        sorted_markers = sorted(markers, key=lambda x: x[1])
        return sorted_markers[0]



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
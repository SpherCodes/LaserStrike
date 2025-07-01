import cv2
from cv2 import aruco
import numpy as np
import base64

class Model:
    def __init__(self, marker_size_cm=18.7):
        self.marker_size_cm = marker_size_cm
        # Create the detector object once
        self.dictionary = aruco.getPredefinedDictionary(aruco.DICT_ARUCO_ORIGINAL)
        parameters = aruco.DetectorParameters()
        self.detector = aruco.ArucoDetector(self.dictionary, parameters)

    def process_image(self, base64_img: str) -> tuple | None:
        print(base64_img)
        image = self._base64_to_image(base64_img)
        if image is None:
            print("Image can't be loaded")
            return None

        detected_markers = self._detect_markers(image)
        if not detected_markers:
            print("No markers detected")
            return None

        closest = self._get_closest(detected_markers, image)
        if not closest:
            print("No closest markers found")
            return None

        # closest will be a tuple like (id, distance)
        return closest

    def _detect_markers(self, image):
        detected_markers = {}
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Use the detector object to find markers
        corners, ids, rejected = self.detector.detectMarkers(gray)

        if ids is not None:
            for i, marker_id in enumerate(ids):
                marker_corners = corners[i][0]
                M = cv2.moments(marker_corners)
                if M["m00"] != 0:
                    cX = int(M["m10"] / M["m00"])
                    cY = int(M["m01"] / M["m00"])
                    marker_info = {
                        'ID': marker_id[0],
                        'Centroid': (cX, cY),
                        'Corners': marker_corners
                    }
                    detected_markers[marker_id[0]] = marker_info
        return detected_markers

    def _calculate_distance(self, marker_size_pixels, cap_width):
        # This formula seems simplistic and may need refinement for accuracy.
        # It assumes a linear relationship which is only true under certain conditions.
        # A proper calculation would use the camera's focal length.
        # However, for relative distance (which is closest), it's fine.
        if marker_size_pixels == 0:
            return float('inf')
        return self.marker_size_cm * cap_width / marker_size_pixels

    def _get_closest(self, detected_markers, image):
        if not detected_markers:
            return None

        markers_with_distance = []
        for marker_id, marker_info in detected_markers.items():
            marker_size_pixels = np.mean(
                [np.linalg.norm(marker_info['Corners'][j] - marker_info['Corners'][(j + 1) % 4]) for j in range(4)])
            distance_to_marker_cm = self._calculate_distance(marker_size_pixels, image.shape[1])
            markers_with_distance.append((int(marker_id), float(distance_to_marker_cm)))

        if not markers_with_distance:
            return None

        # Sort by distance (the second element in the tuple)
        sorted_markers = sorted(markers_with_distance, key=lambda x: x[1])
        return sorted_markers[0]

    # ... (Your _resize and _base64_to_image methods are fine)
    @staticmethod
    def _resize(image, target_width=1280, target_height=720):
        h, w = image.shape[:2]
        if h == 0 or w == 0:
            return image
        scale = min(target_width / w, target_height / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        interpolation = cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR
        return cv2.resize(image, (new_w, new_h), interpolation=interpolation)

    @staticmethod
    def _base64_to_image(base64_str: str):
        if "base64," in base64_str:
            base64_str = base64_str.split('base64,', 1)[1]
        try:
            img_bytes = base64.b64decode(base64_str)
            img_np = np.frombuffer(img_bytes, dtype=np.uint8)
            img_cv2 = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
            return img_cv2
        except Exception as e:
            print(e)
            return None
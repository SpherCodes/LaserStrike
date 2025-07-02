import cv2
from cv2 import aruco
import numpy as np
import sys

# Generates a range of codes with their ID configured for an A4 layout
# run python3 CodeGenerator.py <start_id_inclusive> <end_id_inclusive>

# Desired output settings for printing A4 basic Aruco codes
dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_ARUCO_ORIGINAL)
dpi = 300
a4_mm = (210, 297)
marker_mm = 140     # Size on the page
label_mm = 20

def mm2px(mm): 
    return int(mm * dpi / 25.4)


def make_page(id, dictionary):
    # Convert mm to px
    a4_px = (mm2px(a4_mm[0]), mm2px(a4_mm[1]))
    marker_px = mm2px(marker_mm)
    label_px = mm2px(label_mm)
    canvas = np.ones((a4_px[1], a4_px[0]), dtype=np.uint8) * 255
    img = canvas.copy()
    # Generate marker image
    marker = aruco.generateImageMarker(dictionary, id, marker_px)

    # Add ID above marker
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = marker_px / 200.0
    thickness = 10
    txt = str(id)
    tw, th = cv2.getTextSize(txt, font, scale, thickness)[0]
    x = (a4_px[0] - marker_px) // 2
    y = (a4_px[1] - (marker_px + label_px)) // 2

    img[y + label_px : y + label_px + marker_px, x : x + marker_px] = marker
    tx = x + (marker_px - tw) // 2
    ty = y + (label_px + th) // 2
    cv2.putText(img, txt, (tx, ty), font, scale, (0,), thickness)

    cv2.imwrite(f"aruco_{id}.png", img)
    print(f"Saved page for ID {id} ({marker_mm} mm marker)")

if __name__ == "__main__":
    dic = aruco.getPredefinedDictionary(aruco.DICT_ARUCO_ORIGINAL)
    start_id_inclusive = int(sys.argv[1])
    end_id_inclusive = int(sys.argv[2])
    for marker_id in range(start_id_inclusive, end_id_inclusive + 1):
        make_page(marker_id, dic)

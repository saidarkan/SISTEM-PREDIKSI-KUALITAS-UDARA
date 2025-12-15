def hitung_ispu(c, c_low, c_high, i_low, i_high):
    return ((i_high - i_low) / (c_high - c_low)) * (c - c_low) + i_low


def ispu_pm25(pm):
    if pm <= 15.5:
        return hitung_ispu(pm, 0, 15.5, 0, 50)
    elif pm <= 55.4:
        return hitung_ispu(pm, 15.6, 55.4, 51, 100)
    else:
        return hitung_ispu(pm, 55.5, 150.4, 101, 200)


def ispu_pm10(pm):
    if pm <= 50:
        return hitung_ispu(pm, 0, 50, 0, 50)
    elif pm <= 150:
        return hitung_ispu(pm, 51, 150, 51, 100)
    else:
        return hitung_ispu(pm, 151, 350, 101, 200)


def ispu_no2(no2):
    if no2 <= 80:
        return hitung_ispu(no2, 0, 80, 0, 50)
    elif no2 <= 200:
        return hitung_ispu(no2, 81, 200, 51, 100)
    else:
        return hitung_ispu(no2, 201, 1130, 101, 200)
